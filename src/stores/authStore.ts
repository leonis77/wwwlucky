import { create } from "zustand";
import type { User } from "../types";
import { getCurrentUser, signIn, signUp, signOut, resetPassword, onAuthStateChange } from "../services/supabase/auth";

// 客户端限流：3 次失败后冷却 60 秒
const MAX_FAILURES = 3;
const COOLDOWN_MS = 60_000;

let failureTimestamps: number[] = [];

function checkCooldown(): number | null {
  const now = Date.now();
  failureTimestamps = failureTimestamps.filter((t) => now - t < COOLDOWN_MS);
  if (failureTimestamps.length >= MAX_FAILURES) {
    const oldest = failureTimestamps[0];
    return Math.ceil((COOLDOWN_MS - (now - oldest)) / 1000);
  }
  return null;
}

function recordFailure() {
  failureTimestamps.push(Date.now());
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
    setInterval(() => {
      const cd = checkCooldown();
      set({ cooldown: cd });
    }, 1000);
    onAuthStateChange((user) => set({ user, loading: false }));
    getCurrentUser().then((user) => set({ user, loading: false }));
  },

  login: async (email, password) => {
    const cd = checkCooldown();
    if (cd !== null) {
      set({ error: `操作过于频繁，请等待 ${cd} 秒后再试`, cooldown: cd });
      return;
    }
    set({ loading: true, error: null });
    const { error } = await signIn(email, password);
    if (error) {
      recordFailure();
      set({ loading: false, error, cooldown: checkCooldown() });
    } else {
      failureTimestamps = [];
      set({ loading: false, cooldown: null });
    }
  },

  register: async (email, password) => {
    const cd = checkCooldown();
    if (cd !== null) {
      set({ error: `操作过于频繁，请等待 ${cd} 秒后再试`, cooldown: cd });
      return;
    }
    set({ loading: true, error: null });
    const { error } = await signUp(email, password);
    if (error) {
      recordFailure();
      set({ loading: false, error, cooldown: checkCooldown() });
    } else {
      set({ loading: false });
    }
  },

  logout: async () => {
    await signOut();
    set({ user: null });
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    const { error } = await resetPassword(email);
    set({ loading: false, error, resetSent: !error });
  },

  clearError: () => set({ error: null }),
  clearResetSent: () => set({ resetSent: false }),
  tickCooldown: () => set({ cooldown: checkCooldown() }),
}));
