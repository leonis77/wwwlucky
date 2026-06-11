import * as XLSX from "xlsx";

export interface Product {
  name: string;
  price: number;
  category: string;
  raw: Record<string, unknown>;
}

export interface NormalizedData {
  products: Product[];
  columns: string[];
  totalRows: number;
}

export function parseExcelFile(file: File): Promise<NormalizedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

        if (rows.length === 0) {
          reject(new Error("工作表为空"));
          return;
        }

        const rawKeys = Object.keys(rows[0]);

        // Column 3 (index 2) = product name
        // Column 5 (index 4) = price
        const nameCol = rawKeys[2];
        const priceCol = rawKeys[4];
        const catCol = rawKeys[3] ?? rawKeys[0];

        if (!nameCol || !priceCol) {
          reject(new Error("文件格式不正确，需要第3列为产品名称、第5列为价格"));
          return;
        }

        const columns = rawKeys.filter((k) =>
          rows.some((r) => String(r[k] ?? "").trim() !== "")
        );

        const products: Product[] = [];
        for (const row of rows) {
          const name = String(row[nameCol] ?? "").trim();
          if (!name) continue;

          const price = parseFloat(String(row[priceCol] ?? "0")) || 0;
          const category = String(row[catCol] ?? "").trim() || "未分类";

          products.push({ name, price, category, raw: row });
        }

        resolve({ products, columns, totalRows: rows.length });
      } catch {
        reject(new Error("文件解析失败，请检查格式"));
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

export function exportToExcel(products: Product[], fileName: string): void {
  const rows = products.map((p) => ({
    产品名称: p.name,
    价格: p.price,
    分类: p.category,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
