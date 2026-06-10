import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart, ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useDatasetStore } from "../../stores/datasetStore";
import { buildEChartsOption } from "../../services/chart/config";
import type { ChartType } from "../../types";
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Table2,
  ChevronDown,
} from "lucide-react";

echarts.use([
  BarChart, LineChart, PieChart, ScatterChart,
  GridComponent, TooltipComponent, LegendComponent, CanvasRenderer,
]);

const chartOptions: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: "bar", label: "柱状图", icon: <BarChart3 size={15} /> },
  { type: "line", label: "折线图", icon: <LineIcon size={15} /> },
  { type: "pie", label: "饼图", icon: <PieIcon size={15} /> },
  { type: "scatter", label: "散点图", icon: <ScatterIcon size={15} /> },
  { type: "table", label: "表格", icon: <Table2 size={15} /> },
];

export default function ChartViewer() {
  const { preview, chartConfig, updateChartConfig } = useDatasetStore();

  if (!preview || !chartConfig) {
    return (
      <section className="chart-section">
        <div className="chart-empty">
          <BarChart3 size={48} strokeWidth={1} />
          <p>上传 Excel 文件后，数据将在这里可视化展示</p>
        </div>
      </section>
    );
  }

  const option = buildEChartsOption(preview.rows, chartConfig);

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

        {chartConfig.type !== "table" && (
          <div className="chart-fields">
            <FieldSelect
              label="X轴"
              value={chartConfig.xField}
              columns={preview.columns}
              onChange={(v) => updateChartConfig({ xField: v })}
            />
            {chartConfig.type !== "pie" && (
              <FieldSelect
                label="Y轴"
                value={chartConfig.yField}
                columns={preview.columns}
                onChange={(v) => updateChartConfig({ yField: v })}
              />
            )}
          </div>
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
              {preview.rows.map((row, i) => (
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
            theme="dark"
            notMerge
          />
        </div>
      )}
    </section>
  );
}

function FieldSelect({
  label,
  value,
  columns,
  onChange,
}: {
  label: string;
  value: string;
  columns: { key: string; label: string; type: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="field-select">
      <span className="field-label">{label}</span>
      <div className="field-select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {columns.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label} ({c.type})
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="select-arrow" />
      </div>
    </div>
  );
}
