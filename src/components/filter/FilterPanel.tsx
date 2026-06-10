import { useAppStore } from "../../stores/datasetStore";
import { Search, Filter, ArrowUpDown, X } from "lucide-react";

export default function FilterPanel() {
  const {
    allProducts, filteredProducts, search, category, sortOrder,
    categories, setSearch, setCategory, setSortOrder, clearFilters,
  } = useAppStore();

  if (allProducts.length === 0) return null;

  return (
    <section className="filter-panel">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="filter-search-wrap">
          <Search size={14} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="搜索产品名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="filter-clear-btn" onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="filter-select-wrap">
          <Filter size={13} className="filter-select-icon" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">全部分类</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sort by price */}
        <div className="filter-sort-group">
          <ArrowUpDown size={13} className="filter-select-icon" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc" | "none")}
            className="filter-select"
          >
            <option value="none">默认排序</option>
            <option value="asc">价格从低到高</option>
            <option value="desc">价格从高到低</option>
          </select>
        </div>

        {/* Clear */}
        {(search || category || sortOrder !== "none") && (
          <button className="btn-ghost" onClick={clearFilters}>
            <X size={13} /> 清除筛选
          </button>
        )}
      </div>

      <div className="filter-result-text">
        共 {allProducts.length} 条，当前显示 {filteredProducts.length} 条
      </div>
    </section>
  );
}
