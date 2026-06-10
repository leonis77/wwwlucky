import ReactEChartsCore from "echarts-for-react";
import * as echarts from "echarts/core";
import { BarChart, LineChart as ELineChart, PieChart as EPieChart, ScatterChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useDatasetStore } from "../../stores/datasetStore";
import { buildEChartsOption } from "../../services/chart/config";
import type { ChartType, ColumnInfo } from "../../types";
import {
  BarChart3, LineChart, PieChart, ScatterChart as ScatterIcon, Table2, ChevronDown, Search, X, Eye,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";

echarts.use([
  BarChart, ELineChart, EPieChart, ScatterChart,
  GridComponent, TooltipComponent, LegendComponent, CanvasRenderer,
]);

const chartOptions: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: "bar", label: "柱状图", icon: <BarChart3 size={15} strokeWidth={1.5} /> },
  { type: "line", label: "折线图", icon: <LineChart size={15} strokeWidth={1.5} /> },
  { type: "pie", label: "饼图", icon: <PieChart size={15} strokeWidth={1.5} /> },
  { type: "scatter", label: "散点图", icon: <ScatterIcon size={15} strokeWidth={1.5} /> },
  { type: "table", label: "表格", icon: <Table2 size={15} strokeWidth={1.5} /> },
];

export default function ChartViewer() {
  const { preview, chartConfig, updateChartConfig } = useDatasetStore();
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const defaultSearchCol = useMemo(() => {
    if (!preview) return "";
    const nameCol = preview.columns.find((c) => c.type === "string");
    return nameCol?.key ?? preview.columns[0]?.key ?? "";
  }, [preview]);

  const activeSearchCol = searchColumn || defaultSearchCol;

  // Which columns to display in results (default: search col + first numeric)
  const [displayCols, setDisplayCols] = useState<string[]>([]);

  const defaultDisplayCols = useMemo(() => {
    if (!preview) return [];
    const cols: string[] = [activeSearchCol];
    const numCol = preview.columns.find((c) => c.type === "number" && c.key !== activeSearchCol);
    if (numCol) cols.push(numCol.key);
    // Add one more column
    const extra = preview.columns.find((c) => c.key !== cols[0] && c.key !== cols[1]);
    if (extra) cols.push(extra.key);
    return cols;
  }, [preview, activeSearchCol]);

  const effectiveDisplayCols = displayCols.length > 0 ? displayCols : defaultDisplayCols;

  const suggestions = useMemo(() => {
    if (!preview || !activeSearchCol) return [];
    const seen = new Set<string>();
    return preview.rows
      .map((r) => String(r[activeSearchCol] ?? "").trim())
      .filter((v) => v && !seen.has(v) && seen.add(v))
      .sort()
      .slice(0, 200);
  }, [preview, activeSearchCol]);

  const filteredSuggestions = useMemo(() => {
    if (!search.trim()) return suggestions.slice(0, 20);
    const term = search.trim();
    return suggestions.filter((s) => s.includes(term)).slice(0, 15);
  }, [suggestions, search]);

  const filteredRows = useMemo(() => {
    if (!preview || !search.trim()) return [];
    const term = search.trim();
    return preview.rows.filter((row) => {
      const val = String(row[activeSearchCol] ?? "").trim();
      return val === term;
    });
  }, [preview, search, activeSearchCol]);

  const clearSearch = useCallback(() => {
    setSearch("");
    setSearchColumn("");
  }, []);

  const selectSuggestion = useCallback((val: string) => {
    setSearch(val);
    setShowSuggestions(false);
  }, []);

  const toggleDisplayCol = useCallback((key: string) => {
    setDisplayCols((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      return [...prev, key];
    });
  }, []);

  if (!preview || !chartConfig) {
    return (
      <section className="chart-section">
        <div className="chart-empty">
          <BarChart3 size={36} strokeWidth={1} />
          <p>上传 Excel 文件后，在此搜索产品查看数据</p>
        </div>
      </section>
    );
  }

  const hasResults = search.trim() && filteredRows.length > 0;
  const option = hasResults
    ? buildEChartsOption(filteredRows, { ...chartConfig, xField: activeSearchCol, yField: chartConfig.yField })
    : null;

  return (
    <section className="chart-section">
      <div className="chart-toolbar">
        <div className="chart-type-selector">
          {chartOptions.map((opt) => (
            <button
              key={opt.type}
              className={`chart-type-btn ${chartConfig.type === opt.type ? "active" : ""}`}
              onClick={() => updateChartConfig({ type: opt.type })}
              title={opt.label}
            >
              {opt.icon}
            </button>
          ))}
        </div>

        <div className="chart-search-wrap">
          <Search size={14} className="chart-search-icon" />
          <input
            type="text"
            className="chart-search-input"
            placeholder="搜索产品名称..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {search && (
            <button className="chart-search-clear" onClick={clearSearch}>
              <X size={14} />
            </button>
          )}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="chart-suggestions">
              {filteredSuggestions.map((s) => (
                <button
                  key={s}
                  className={`chart-suggestion-item ${s === search ? "active" : ""}`}
                  onMouseDown={() => selectSuggestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="chart-search-column">
          <span className="field-label">搜索列</span>
          <div className="field-select-wrap">
            <select
              value={activeSearchCol}
              onChange={(e) => { setSearchColumn(e.target.value); setSearch(""); }}
            >
              {preview.columns.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="select-arrow" />
          </div>
        </div>

        {chartConfig.type !== "table" && (
          <div className="chart-fields">
            <FieldSelect
              label="Y 轴"
              value={chartConfig.yField}
              columns={preview.columns}
              onChange={(v) => updateChartConfig({ yField: v })}
            />
          </div>
        )}
      </div>

      {!search.trim() ? (
        <div className="chart-empty chart-empty-small">
          <Search size={28} strokeWidth={1} />
          <p>输入产品名称搜索，支持自动补全</p>
        </div>
      ) : hasResults ? (
        <>
          <div className="chart-result-bar">
            <span className="chart-result-count">
              找到 {filteredRows.length} 条匹配
            </span>
            <div className="chart-display-cols">
              <Eye size={12} />
              <span className="field-label">显示列</span>
              {preview.columns.map((col) => (
                <label key={col.key} className="chart-col-toggle">
                  <input
                    type="checkbox"
                    checked={effectiveDisplayCols.includes(col.key)}
                    onChange={() => toggleDisplayCol(col.key)}
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          </div>

          {chartConfig.type === "table" ? (
            <div className="chart-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {preview.columns
                      .filter((c) => effectiveDisplayCols.includes(c.key))
                      .map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => (
                    <tr key={i}>
                      {preview.columns
                        .filter((c) => effectiveDisplayCols.includes(c.key))
                        .map((col) => (
                          <td key={col.key}>{String(row[col.key] ?? "")}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : option ? (
            <div className="chart-canvas" style={{ width: "100%", minHeight: 380 }}>
              <ReactEChartsCore
                echarts={echarts}
                option={option}
                style={{ width: "100%", height: 380 }}
                notMerge
              />
            </div>
          ) : null}
        </>
      ) : (
        <div className="chart-empty chart-empty-small">
          <p>未找到 &ldquo;{search}&rdquo;，请尝试其他产品名称</p>
        </div>
      )}
    </section>
  );
}

function FieldSelect({
  label, value, columns, onChange,
}: {
  label: string; value: string; columns: ColumnInfo[]; onChange: (v: string) => void;
}) {
  return (
    <div className="field-select">
      <span className="field-label">{label}</span>
      <div className="field-select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {columns.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <ChevronDown size={13} className="select-arrow" />
      </div>
    </div>
  );
}
