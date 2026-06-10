import { create } from "zustand";
import type { ChartConfig, ColumnInfo } from "../types";
import { parseExcelFile, exportToExcel } from "../services/excel/parser";
import { recommendChart } from "../services/chart/config";

export { exportToExcel };

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadSets(): import("../types").Dataset[] {
  try { return JSON.parse(localStorage.getItem("pd_datasets") || "[]"); }
  catch { return []; }
}

function saveSets(datasets: import("../types").Dataset[]) {
  localStorage.setItem("pd_datasets", JSON.stringify(datasets));
}

interface DatasetState {
  datasets: import("../types").Dataset[];
  currentDataset: import("../types").Dataset | null;
  preview: { rows: Record<string, unknown>[]; columns: ColumnInfo[] } | null;
  chartConfig: ChartConfig | null;
  loading: boolean;
  error: string | null;
  loadDatasets: () => void;
  uploadFile: (file: File) => Promise<void>;
  removeDataset: (id: string) => void;
  selectDataset: (dataset: import("../types").Dataset) => void;
  updateChartConfig: (config: Partial<ChartConfig>) => void;
  clearError: () => void;
}

export const useDatasetStore = create<DatasetState>((set) => ({
  datasets: loadSets(),
  currentDataset: null,
  preview: null,
  chartConfig: null,
  loading: false,
  error: null,

  loadDatasets: () => {
    set({ datasets: loadSets() });
  },

  uploadFile: async (file: File) => {
    set({ loading: true, error: null });
    try {
      const result = await parseExcelFile(file);
      const name = file.name.replace(/\.(xlsx|xls)$/i, "");
      const config = recommendChart(result.columns);
      const dataset: import("../types").Dataset = {
        id: uid(),
        user_id: "local",
        name,
        data: result.rows,
        columns: result.columns,
        created_at: new Date().toISOString(),
      };
      const updated = [dataset, ...loadSets()];
      saveSets(updated);
      set({
        datasets: updated,
        preview: { rows: result.rows, columns: result.columns },
        chartConfig: config,
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  removeDataset: (id) => {
    const updated = loadSets().filter((d) => d.id !== id);
    saveSets(updated);
    set((s) => ({
      datasets: updated,
      currentDataset: s.currentDataset?.id === id ? null : s.currentDataset,
    }));
  },

  selectDataset: (dataset) => {
    set({
      currentDataset: dataset,
      chartConfig: recommendChart(dataset.columns),
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
