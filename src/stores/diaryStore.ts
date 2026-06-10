import { create } from "zustand";
import type { DiaryEntry } from "../types";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function load(): DiaryEntry[] {
  try { return JSON.parse(localStorage.getItem("pd_diary") || "[]"); }
  catch { return []; }
}

function save(entries: DiaryEntry[]) {
  localStorage.setItem("pd_diary", JSON.stringify(entries));
}

interface DiaryState {
  entries: DiaryEntry[];
  loading: boolean;
  error: string | null;
  loadEntries: () => void;
  addEntry: (content: string) => Promise<void>;
  editEntry: (id: string, content: string) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDiaryStore = create<DiaryState>((set) => ({
  entries: load(),
  loading: false,
  error: null,

  loadEntries: () => set({ entries: load() }),

  addEntry: async (content) => {
    const entry: DiaryEntry = {
      id: uid(),
      user_id: "local",
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    save([entry, ...load()]);
    set({ entries: [entry, ...load()] });
  },

  editEntry: async (id, content) => {
    const updated = load().map((e) =>
      e.id === id ? { ...e, content, updated_at: new Date().toISOString() } : e
    );
    save(updated);
    set({ entries: updated });
  },

  removeEntry: async (id) => {
    save(load().filter((e) => e.id !== id));
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },

  clearError: () => set({ error: null }),
}));
