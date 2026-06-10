import { create } from "zustand";
import type { Dataset, ChartConfig, ColumnInfo } from "../types";
import { parseExcelFile, exportToExcel } from "../services/excel/parser";
import { recommendChart } from "../services/chart/config";
import { supabase } from "../services/supabase/client";

// 尝试使用 Supabase，失败则回退到 localStorage
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function localKey(k: string): string {
  return "pd_" + k;
}

async function isAuthAvailable(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getUser();
    return !!data.user;
  } catch {
    return false;
  }
}

// Supabase 模式
async function loadFromSupabase(): Promise<Dataset[]> {
  const { data, error } = await supabase.from("datasets").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Dataset[];
}

async function saveToSupabase(dataset: Omit<Dataset, "id" | "created_at">): Promise<Dataset> {
  const { data, error } = await supabase.from("datasets").insert(dataset).select().single();
  if (error) throw new Error(error.message);
  return data as Dataset;
}

async function deleteFromSupabase(id: string): Promise<void> {
  const { error } = await supabase.from("datasets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// localStorage 模式
function loadFromLocal(): Dataset[] {
  try {
    return JSON.parse(localStorage.getItem(localKey("datasets")) || "[]");
  } catch {
    return [];
  }
}

function saveToLocal(datasets: Dataset[]) {
  localStorage.setItem(localKey("datasets"), JSON.stringify(datasets));
}

export { exportToExcel };

interface DatasetState {
  datasets: Dataset[];
  currentDataset: Dataset | null;
  preview: { rows: Record<string, unknown>[]; columns: ColumnInfo[] } | null;
  chartConfig: ChartConfig | null;
  loading: boolean;
  error: string | null;
  loadDatasets: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  removeDataset: (id: string) => Promise<void>;
  selectDataset: (dataset: Dataset) => void;
  updateChartConfig: (config: Partial<ChartConfig>) => void;
  clearError: () => void;
}

export const useDatasetStore = create<DatasetState>((set) => ({
  datasets: [],
  currentDataset: null,
  preview: null,
  chartConfig: null,
  loading: false,
  error: null,

  loadDatasets: async () => {
    set({ loading: true });
    try {
      const authed = await isAuthAvailable();
      const datasets = authed ? await loadFromSupabase() : loadFromLocal();
      set({ datasets, loading: false });
    } catch {
      const datasets = loadFromLocal();
      set({ datasets, loading: false });
    }
  },

  uploadFile: async (file: File) => {
    set({ loading: true, error: null });
    try {
      const result = await parseExcelFile(file);
      const fileName = file.name.replace(/\.(xlsx|xls)$/i, "");
      const config = recommendChart(result.columns);

      const authed = await isAuthAvailable();
      let dataset: Dataset;

      if (authed) {
        const { data: userData } = await supabase.auth.getUser();
        dataset = await saveToSupabase({
          name: fileName,
          data: result.rows,
          columns: result.columns,
          user_id: userData.user!.id,
        });
      } else {
        dataset = {
          id: generateId(),
          user_id: "guest",
          name: fileName,
          data: result.rows,
          columns: result.columns,
          created_at: new Date().toISOString(),
        };
        const updated = [dataset, ...loadFromLocal()];
        saveToLocal(updated);
      }

      set((s) => ({
        datasets: [dataset, ...s.datasets],
        preview: { rows: result.rows, columns: result.columns },
        chartConfig: config,
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  removeDataset: async (id: string) => {
    try {
      const authed = await isAuthAvailable();
      if (authed) {
        await deleteFromSupabase(id);
      } else {
        const updated = loadFromLocal().filter((d) => d.id !== id);
        saveToLocal(updated);
      }
    } catch {
      // ignore
    }
    set((s) => ({
      datasets: s.datasets.filter((d) => d.id !== id),
      currentDataset: s.currentDataset?.id === id ? null : s.currentDataset,
    }));
  },

  selectDataset: (dataset) => {
    set({
      currentDataset: dataset,
      chartConfig: recommendChart(dataset.columns as ColumnInfo[]),
      preview: { rows: dataset.data, columns: dataset.columns },
    });
  },

  updateChartConfig: (config) => {
    set((s) => ({
      chartConfig: s.chartConfig ? { ...s.chartConfig, ...config } : null,
    }));
  },

  clearError: () => set({ error: null }),
}));
