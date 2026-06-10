import { create } from "zustand";
import type { Dataset, ChartConfig, ColumnInfo } from "../types";
import { fetchDatasets, createDataset, deleteDataset } from "../services/supabase/database";
import { parseExcelFile } from "../services/excel/parser";
import type { ParseResult } from "../services/excel/parser";
import { recommendChart } from "../services/chart/config";

interface DatasetState {
  datasets: Dataset[];
  currentDataset: Dataset | null;
  preview: ParseResult | null;
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
      const datasets = await fetchDatasets();
      set({ datasets, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  uploadFile: async (file: File) => {
    set({ loading: true, error: null });
    try {
      const result = await parseExcelFile(file);
      const fileName = file.name.replace(/\.(xlsx|xls)$/i, "");
      const dataset = await createDataset(fileName, result.rows, result.columns);
      const config = recommendChart(result.columns);
      set((s) => ({
        datasets: [dataset, ...s.datasets],
        preview: result,
        chartConfig: config,
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  removeDataset: async (id: string) => {
    await deleteDataset(id);
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
