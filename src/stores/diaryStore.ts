import { create } from "zustand";
import type { DiaryEntry } from "../types";
import {
  fetchDiaryEntries,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from "../services/supabase/database";

interface DiaryState {
  entries: DiaryEntry[];
  loading: boolean;
  error: string | null;
  loadEntries: () => Promise<void>;
  addEntry: (content: string) => Promise<void>;
  editEntry: (id: string, content: string) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDiaryStore = create<DiaryState>((set) => ({
  entries: [],
  loading: false,
  error: null,

  loadEntries: async () => {
    set({ loading: true });
    try {
      const entries = await fetchDiaryEntries();
      set({ entries, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addEntry: async (content) => {
    const entry = await createDiaryEntry(content);
    set((s) => ({ entries: [entry, ...s.entries] }));
  },

  editEntry: async (id, content) => {
    const updated = await updateDiaryEntry(id, content);
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? updated : e)),
    }));
  },

  removeEntry: async (id) => {
    await deleteDiaryEntry(id);
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },

  clearError: () => set({ error: null }),
}));
