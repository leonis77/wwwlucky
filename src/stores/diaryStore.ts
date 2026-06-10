import { create } from "zustand";
import type { DiaryEntry } from "../types";
import { supabase } from "../services/supabase/client";

function localKey(k: string) { return "pd_" + k; }

async function isAuthAvailable(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getUser();
    return !!data.user;
  } catch { return false; }
}

function loadLocal(): DiaryEntry[] {
  try { return JSON.parse(localStorage.getItem(localKey("diary")) || "[]"); }
  catch { return []; }
}

function saveLocal(entries: DiaryEntry[]) {
  localStorage.setItem(localKey("diary"), JSON.stringify(entries));
}

async function loadSupabase(): Promise<DiaryEntry[]> {
  const { data, error } = await supabase.from("diary_entries").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as DiaryEntry[];
}

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
      const authed = await isAuthAvailable();
      const entries = authed ? await loadSupabase() : loadLocal();
      set({ entries, loading: false });
    } catch {
      set({ entries: loadLocal(), loading: false });
    }
  },

  addEntry: async (content) => {
    const authed = await isAuthAvailable();
    if (authed) {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("diary_entries").insert({ content, user_id: userData.user!.id }).select().single();
      if (error) throw new Error(error.message);
      set((s) => ({ entries: [data as DiaryEntry, ...s.entries] }));
    } else {
      const entry: DiaryEntry = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
        user_id: "guest",
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [entry, ...loadLocal()];
      saveLocal(updated);
      set({ entries: updated });
    }
  },

  editEntry: async (id, content) => {
    const authed = await isAuthAvailable();
    if (authed) {
      const { data, error } = await supabase.from("diary_entries").update({ content, updated_at: new Date().toISOString() }).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      set((s) => ({ entries: s.entries.map((e) => (e.id === id ? (data as DiaryEntry) : e)) }));
    } else {
      const updated = loadLocal().map((e) => e.id === id ? { ...e, content, updated_at: new Date().toISOString() } : e);
      saveLocal(updated);
      set({ entries: updated });
    }
  },

  removeEntry: async (id) => {
    const authed = await isAuthAvailable();
    if (authed) {
      await supabase.from("diary_entries").delete().eq("id", id);
    } else {
      saveLocal(loadLocal().filter((e) => e.id !== id));
    }
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },

  clearError: () => set({ error: null }),
}));
