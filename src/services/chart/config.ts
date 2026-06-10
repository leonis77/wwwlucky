import type { ChartConfig, ColumnInfo } from "../../types";

export function recommendChart(columns: ColumnInfo[]): ChartConfig {
  const numberCols = columns.filter((c) => c.type === "number");
  const stringCols = columns.filter((c) => c.type === "string");

  const xField = stringCols.length > 0 ? stringCols[0].key : columns[0]?.key ?? "";
  const yField = numberCols.length > 0 ? numberCols[0].key : columns[columns.length > 1 ? 1 : 0]?.key ?? "";
  const type = numberCols.length >= 2 ? "bar" : "pie";

  return { type, xField, yField };
}

const monoColors = ["#ffffff", "#cccccc", "#999999", "#666666", "#aaaaaa", "#888888", "#dddddd"];

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
      legend: { bottom: 0, textStyle: { color: "rgba(255,255,255,0.5)", fontSize: 12 } },
      series: [{
        type: "pie",
        radius: ["45%", "72%"],
        center: ["50%", "45%"],
        data: xData.map((name, i) => ({
          name,
          value: yData[i],
          itemStyle: { color: monoColors[i % monoColors.length] },
        })),
        label: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
        emphasis: {
          itemStyle: { shadowBlur: 0 },
          label: { fontSize: 14, fontWeight: 500 },
        },
      }],
    };
  }

  if (config.type === "scatter") {
    return {
      backgroundColor: "transparent",
      tooltip: { trigger: "item" as const },
      xAxis: {
        type: "category" as const, data: xData,
        axisLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      },
      yAxis: {
        type: "value" as const,
        axisLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      series: [{
        type: "scatter",
        data: yData,
        symbolSize: 6,
        itemStyle: { color: "#fff" },
      }],
    };
  }

  return {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" as const },
    grid: { left: "0%", right: "2%", bottom: "0%", top: "5%", containLabel: true },
    xAxis: {
      type: "category" as const, data: xData,
      axisLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, rotate: xData.length > 8 ? 30 : 0 },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
    },
    series: [{
      name: config.yField,
      type: config.type,
      data: yData,
      barWidth: config.type === "bar" ? "60%" : undefined,
      smooth: config.type === "line",
      itemStyle: {
        color: "#ffffff",
        borderRadius: config.type === "bar" ? [2, 2, 0, 0] : undefined,
      },
      lineStyle: config.type === "line" ? { color: "#ffffff", width: 1.5 } : undefined,
      areaStyle: config.type === "line" ? {
        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: "rgba(255,255,255,0.15)" }, { offset: 1, color: "rgba(255,255,255,0)" }] },
      } : undefined,
    }],
  };
}
