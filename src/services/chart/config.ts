import type { ChartConfig, ColumnInfo } from "../../types";

export function recommendChart(columns: ColumnInfo[]): ChartConfig {
  const numberCols = columns.filter((c) => c.type === "number");
  const stringCols = columns.filter((c) => c.type === "string");

  const xField = stringCols.length > 0 ? stringCols[0].key : columns[0]?.key ?? "";
  const yField = numberCols.length > 0 ? numberCols[0].key : columns[columns.length > 1 ? 1 : 0]?.key ?? "";
  const type = numberCols.length >= 2 ? "bar" : "pie";

  return { type, xField, yField };
}

export function buildEChartsOption(
  rows: Record<string, unknown>[],
  config: ChartConfig
): object {
  const xData = rows.map((r) => String(r[config.xField] ?? ""));
  const yData = rows.map((r) => Number(r[config.yField]) || 0);

  if (config.type === "pie") {
    return {
      tooltip: { trigger: "item" as const },
      legend: { bottom: 0, textStyle: { color: "#aaa" } },
      series: [{
        type: "pie",
        radius: ["35%", "65%"],
        center: ["50%", "45%"],
        data: xData.map((name, i) => ({ name, value: yData[i] })),
        label: { color: "#aaa" },
        itemStyle: { borderRadius: 4, borderColor: "#1a1a2e", borderWidth: 3 },
      }],
    };
  }

  if (config.type === "scatter") {
    return {
      tooltip: { trigger: "item" as const },
      xAxis: {
        type: "category" as const, data: xData,
        axisLabel: { color: "#888" },
        axisLine: { lineStyle: { color: "#333" } },
      },
      yAxis: {
        type: "value" as const,
        axisLabel: { color: "#888" },
        axisLine: { lineStyle: { color: "#333" } },
        splitLine: { lineStyle: { color: "#222" } },
      },
      series: [{
        type: "scatter",
        data: yData,
        symbolSize: 10,
        itemStyle: { color: "#7c5cfc" },
      }],
    };
  }

  return {
    tooltip: { trigger: "axis" as const },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category" as const, data: xData,
      axisLabel: { color: "#888", rotate: xData.length > 8 ? 30 : 0 },
      axisLine: { lineStyle: { color: "#333" } },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { color: "#888" },
      axisLine: { lineStyle: { color: "#333" } },
      splitLine: { lineStyle: { color: "#222" } },
    },
    series: [{
      name: config.yField,
      type: config.type,
      data: yData,
      smooth: config.type === "line",
      itemStyle: {
        color: "#7c5cfc",
        borderRadius: config.type === "bar" ? [6, 6, 0, 0] : undefined,
      },
      ...(config.type === "line" ? {
        lineStyle: { color: "#7c5cfc", width: 2 },
        areaStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(124,92,252,0.3)" },
              { offset: 1, color: "rgba(124,92,252,0)" },
            ],
          },
        },
      } : {}),
    }],
  };
}
