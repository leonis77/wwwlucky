import { create } from "zustand";
import type { User } from "../types";
import { getCurrentUser, signIn, signUp, signOut, onAuthStateChange } from "../services/supabase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: () => {
    onAuthStateChange((user) => set({ user, loading: false }));
    getCurrentUser().then((user) => set({ user, loading: false }));
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    const { user, error } = await signIn(email, password);
    set({ user, loading: false, error });
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    const { user, error } = await signUp(email, password);
    set({ user, loading: false, error });
  },

  logout: async () => {
    await signOut();
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
