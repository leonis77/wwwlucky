import type { ChartConfig, ColumnInfo } from "../../types";

export function recommendChart(columns: ColumnInfo[]): ChartConfig {
  const numberCols = columns.filter((c) => c.type === "number");
  const stringCols = columns.filter((c) => c.type === "string");
  const xField = stringCols.length > 0 ? stringCols[0].key : columns[0]?.key ?? "";
  const yField = numberCols.length > 0 ? numberCols[0].key : columns[columns.length > 1 ? 1 : 0]?.key ?? "";
  const type = numberCols.length >= 2 ? "bar" : "pie";
  return { type, xField, yField };
}

const warmPalette = ["#A18A68", "#C4A882", "#8B7355", "#D4C4A8", "#9B8B72", "#B8A88A", "#6B5B4A"];

export function buildEChartsOption(
  rows: Record<string, unknown>[],
  config: ChartConfig
): object {
  const xData = rows.map((r) => String(r[config.xField] ?? ""));
  const yData = rows.map((r) => Number(r[config.yField]) || 0);

  if (config.type === "pie") {
    return {
      backgroundColor: "transparent",
      tooltip: { trigger: "item" as const },
      legend: { bottom: 0, textStyle: { color: "#666", fontSize: 11 } },
      series: [{
        type: "pie",
        radius: ["45%", "72%"],
        center: ["50%", "45%"],
        data: xData.map((name, i) => ({
          name,
          value: yData[i],
          itemStyle: { color: warmPalette[i % warmPalette.length] },
        })),
        label: { color: "#666", fontSize: 11 },
        emphasis: { label: { fontSize: 14, fontWeight: 500 } },
      }],
    };
  }

  return {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" as const },
    grid: { left: "0%", right: "2%", bottom: "0%", top: "5%", containLabel: true },
    xAxis: {
      type: "category" as const, data: xData,
      axisLabel: { color: "#999", fontSize: 10, rotate: xData.length > 8 ? 30 : 0 },
      axisLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { color: "#999", fontSize: 10 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.04)" } },
    },
    series: [{
      name: config.yField,
      type: config.type,
      data: yData,
      barWidth: config.type === "bar" ? "60%" : undefined,
      smooth: config.type === "line",
      itemStyle: {
        color: "#A18A68",
        borderRadius: config.type === "bar" ? [2, 2, 0, 0] : undefined,
      },
      lineStyle: config.type === "line" ? { color: "#A18A68", width: 1.5 } : undefined,
      areaStyle: config.type === "line" ? {
        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: "rgba(161,138,104,0.15)" }, { offset: 1, color: "rgba(161,138,104,0)" }] },
      } : undefined,
    }],
  };
}
