import { useState, useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart, LineChart as ELineChart, PieChart as EPieChart, ScatterChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useDatasetStore } from "../../stores/datasetStore";
import { buildEChartsOption } from "../../services/chart/config";
import type { ChartType } from "../../types";
import {
  BarChart3, LineChart, PieChart, ScatterChart as ScatterIcon, Table2, ChevronDown, Search, X,
} from "lucide-react";

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

  const filteredRows = useMemo(() => {
    if (!preview || !search.trim()) return preview?.rows ?? [];
    const term = search.toLowerCase();
    return preview.rows.filter((row) =>
      preview.columns.some((col) =>
        String(row[col.key] ?? "").toLowerCase().includes(term)
      )
    );
  }, [preview, search]);

  if (!preview || !chartConfig) {
    return (
      <section className="chart-section">
        <div className="chart-empty">
          <BarChart3 size={36} strokeWidth={1} />
          <p>上传 Excel 文件后，数据将在此可视化展示</p>
        </div>
      </section>
    );
  }

  const option = buildEChartsOption(filteredRows, chartConfig);

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
            placeholder="搜索过滤数据..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="chart-search-clear" onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </div>

        {chartConfig.type !== "table" && (
          <div className="chart-fields">
            <FieldSelect
              label="X"
              value={chartConfig.xField}
              columns={preview.columns}
              onChange={(v) => updateChartConfig({ xField: v })}
            />
            {chartConfig.type !== "pie" && (
              <FieldSelect
                label="Y"
                value={chartConfig.yField}
                columns={preview.columns}
                onChange={(v) => updateChartConfig({ yField: v })}
              />
            )}
          </div>
        )}
      </div>

      <div className="chart-result-count">
        {search.trim() && (
          <span>筛选结果：{filteredRows.length} / {preview.rows.length} 条</span>
        )}
      </div>

      {chartConfig.type === "table" ? (
        <div className="chart-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {preview.columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr key={i}>
                  {preview.columns.map((col) => (
                    <td key={col.key}>{String(row[col.key] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="chart-canvas">
          <ReactEChartsCore
            echarts={echarts}
            option={option}
            style={{ height: 380 }}
            notMerge
          />
        </div>
      )}
    </section>
  );
}

function FieldSelect({
  label, value, columns, onChange,
}: {
  label: string; value: string; columns: { key: string; label: string; type: string }[]; onChange: (v: string) => void;
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
