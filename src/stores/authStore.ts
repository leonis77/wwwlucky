import { create } from "zustand";
import type { User } from "../types";
import { getCurrentUser, signIn, signUp, signOut, resetPassword, onAuthStateChange } from "../services/supabase/auth";

const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 120_000;

let attemptTimestamps: number[] = [];

function checkCooldown(): number | null {
  const now = Date.now();
  attemptTimestamps = attemptTimestamps.filter((t) => now - t < COOLDOWN_MS);
  if (attemptTimestamps.length >= MAX_ATTEMPTS) {
    return Math.ceil((COOLDOWN_MS - (now - attemptTimestamps[0])) / 1000);
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
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
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
      return false;
    }
    set({ loading: true, error: null });
    recordAttempt();
    const { user, error } = await signIn(email, password);
    if (error) {
      set({ loading: false, error });
      return false;
    }
    attemptTimestamps = [];
    set({ user, loading: false });
    return true;
  },

  register: async (email, password) => {
    const cd = checkCooldown();
    if (cd !== null) {
      set({ error: `请求过快，请等待 ${cd} 秒`, cooldown: cd });
      return false;
    }
    set({ loading: true, error: null });
    recordAttempt();
    const { user, error } = await signUp(email, password);
    if (error) {
      set({ loading: false, error });
      return false;
    }
    if (user) {
      set({ user, loading: false });
      return true;
    }
    set({ loading: false });
    return false;
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
