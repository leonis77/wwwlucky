import { create } from "zustand";
import { parseExcelFile, exportToExcel, type Product } from "../services/excel/parser";

export { exportToExcel };
export type { Product };

type SortOrder = "asc" | "desc" | "none";

interface AppState {
  // Upload state
  fileName: string;
  columns: string[];
  totalRows: number;
  allProducts: Product[];
  loading: boolean;
  error: string | null;

  // Filter state
  search: string;
  category: string;
  sortOrder: SortOrder;

  // Computed
  categories: string[];
  filteredProducts: Product[];

  // Actions
  uploadFile: (file: File) => Promise<void>;
  setSearch: (s: string) => void;
  setCategory: (c: string) => void;
  setSortOrder: (o: SortOrder) => void;
  clearFilters: () => void;
  clearError: () => void;
}

function computeFiltered(
  all: Product[],
  search: string,
  category: string,
  sortOrder: SortOrder
): Product[] {
  let result = [...all];

  if (category) {
    result = result.filter((p) => p.category === category);
  }

  if (search.trim()) {
    const term = search.trim();
    result = result.filter((p) => p.name.includes(term));
  }

  if (sortOrder === "asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "desc") {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
}

export const useAppStore = create<AppState>((set, get) => ({
  fileName: "",
  columns: [],
  totalRows: 0,
  allProducts: [],
  loading: false,
  error: null,
  search: "",
  category: "",
  sortOrder: "none",
  categories: [],
  filteredProducts: [],

  uploadFile: async (file: File) => {
    set({ loading: true, error: null });
    try {
      const data = await parseExcelFile(file);
      const categories = [...new Set(data.products.map((p) => p.category))].sort();
      const filtered = computeFiltered(data.products, "", "", "none");
      set({
        fileName: file.name,
        columns: data.columns,
        totalRows: data.totalRows,
        allProducts: data.products,
        categories,
        filteredProducts: filtered,
        search: "",
        category: "",
        sortOrder: "none",
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  setSearch: (s) => {
    const { allProducts, category, sortOrder } = get();
    const filtered = computeFiltered(allProducts, s, category, sortOrder);
    set({ search: s, filteredProducts: filtered });
  },

  setCategory: (c) => {
    const { allProducts, search, sortOrder } = get();
    const filtered = computeFiltered(allProducts, search, c, sortOrder);
    set({ category: c, filteredProducts: filtered });
  },

  setSortOrder: (o) => {
    const { allProducts, search, category } = get();
    const filtered = computeFiltered(allProducts, search, category, o);
    set({ sortOrder: o, filteredProducts: filtered });
  },

  clearFilters: () => {
    const { allProducts } = get();
    set({
      search: "",
      category: "",
      sortOrder: "none",
      filteredProducts: allProducts,
    });
  },

  clearError: () => set({ error: null }),
}));
