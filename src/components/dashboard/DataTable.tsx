import { useAppStore } from "../../stores/datasetStore";
import { Table2 } from "lucide-react";

export default function DataTable() {
  const { allProducts, filteredProducts, search, category, sortOrder } = useAppStore();

  if (allProducts.length === 0) return null;

  const data = filteredProducts.slice(0, 100); // limit to 100 rows

  return (
    <section className="data-section">
      <div className="section-head">
        <Table2 size={15} strokeWidth={1.5} />
        <span>数据明细</span>
        <span className="ml-auto text-xs text-ink-muted">
          {search || category || sortOrder !== "none" ? "已筛选" : "全部"} · {data.length} 行
        </span>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>产品名称</th>
              <th>价格</th>
              <th>分类</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr key={i}>
                <td className="font-medium">{p.name}</td>
                <td>{p.price.toFixed(2)}</td>
                <td>{p.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
