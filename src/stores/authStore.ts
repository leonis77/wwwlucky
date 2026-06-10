import { create } from "zustand";
import type { User } from "../types";
import { getCurrentUser, signIn, signUp, signOut, resetPassword, onAuthStateChange } from "../services/supabase/auth";

// 全局限流：所有认证操作共享计数器（不仅是失败）
const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 120_000; // 2 分钟

let attemptTimestamps: number[] = [];

function checkCooldown(): number | null {
  const now = Date.now();
  attemptTimestamps = attemptTimestamps.filter((t) => now - t < COOLDOWN_MS);
  if (attemptTimestamps.length >= MAX_ATTEMPTS) {
    const oldest = attemptTimestamps[0];
    return Math.ceil((COOLDOWN_MS - (now - oldest)) / 1000);
  }
  return null;
}

function recordAttempt() {
  attemptTimestamps.push(Date.now());
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  resetSent: boolean;
  cooldown: number | null;
  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  clearError: () => void;
  clearResetSent: () => void;
  tickCooldown: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  resetSent: false,
  cooldown: null,

  initialize: () => {
    setInterval(() => set({ cooldown: checkCooldown() }), 1000);
    onAuthStateChange((user) => set({ user, loading: false }));
    getCurrentUser().then((user) => set({ user, loading: false }));
  },

  login: async (email, password) => {
    const cd = checkCooldown();
    if (cd !== null) {
      set({ error: `请求过快，请等待 ${cd} 秒`, cooldown: cd });
      return;
    }
    set({ loading: true, error: null });
    recordAttempt();
    const { error } = await signIn(email, password);
    if (error) {
      set({ loading: false, error });
    } else {
      attemptTimestamps = [];
      set({ loading: false });
    }
  },

  register: async (email, password) => {
    const cd = checkCooldown();
    if (cd !== null) {
      set({ error: `请求过快，请等待 ${cd} 秒`, cooldown: cd });
      return;
    }
    set({ loading: true, error: null });
    recordAttempt();
    const { error } = await signUp(email, password);
    if (error) {
      set({ loading: false, error });
    } else {
      set({ loading: false });
    }
  },

  logout: async () => {
    await signOut();
    set({ user: null });
  },

  forgotPassword: async (email) => {
    const cd = checkCooldown();
    if (cd !== null) {
      set({ error: `请求过快，请等待 ${cd} 秒`, cooldown: cd });
      return;
    }
    set({ loading: true, error: null });
    recordAttempt();
    const { error } = await resetPassword(email);
    set({ loading: false, error, resetSent: !error });
  },

  clearError: () => set({ error: null }),
  clearResetSent: () => set({ resetSent: false }),
  tickCooldown: () => set({ cooldown: checkCooldown() }),
}));
