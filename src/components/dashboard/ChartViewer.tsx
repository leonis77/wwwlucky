import { useAppStore } from "../../stores/datasetStore";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { BarChart3, PieChart as PieIcon } from "lucide-react";
import { useState } from "react";

const COLORS = ["#A18A68", "#C4A882", "#8B7355", "#D4C4A8", "#9B8B72", "#B8A88A", "#6B5B4A", "#E8DCC8"];

export default function ChartSection() {
  const { allProducts, filteredProducts, categories } = useAppStore();
  const [activeChart, setActiveChart] = useState<"price" | "category">("price");

  if (allProducts.length === 0) return null;

  // Category distribution data
  const categoryData = categories.map((cat) => ({
    name: cat,
    value: allProducts.filter((p) => p.category === cat).length,
  }));

  // Price data (top 20 for bar chart)
  const priceData = filteredProducts
    .slice(0, 30)
    .map((p) => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name, price: p.price }));

  return (
    <section className="chart-section">
      <div className="section-head">
        <span>数据可视化</span>
        <div className="ml-auto flex gap-2">
          <button
            className={`chart-toggle-btn ${activeChart === "price" ? "active" : ""}`}
            onClick={() => setActiveChart("price")}
          >
            <BarChart3 size={14} /> 价格分布
          </button>
          <button
            className={`chart-toggle-btn ${activeChart === "category" ? "active" : ""}`}
            onClick={() => setActiveChart("category")}
          >
            <PieIcon size={14} /> 分类占比
          </button>
        </div>
      </div>

      {activeChart === "price" ? (
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={priceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#999" }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: "#999" }} />
              <Tooltip contentStyle={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.06)", background: "#fff" }} />
              <Bar dataKey="price" fill="#A18A68" radius={[2, 2, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.06)", background: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

