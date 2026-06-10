import * as XLSX from "xlsx";
import type { ColumnInfo } from "../../types";

export interface ParseResult {
  rows: Record<string, unknown>[];
  columns: ColumnInfo[];
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

        if (jsonData.length === 0) {
          reject(new Error("工作表为空"));
          return;
        }

        const rawKeys = Object.keys(jsonData[0]);
        const columns: ColumnInfo[] = rawKeys.map((key) => ({
          key,
          label: key,
          type: inferColumnType(jsonData, key),
        }));

        resolve({ rows: jsonData, columns });
      } catch {
        reject(new Error("Excel文件解析失败"));
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

function inferColumnType(rows: Record<string, unknown>[], key: string): ColumnInfo["type"] {
  const sample = rows.slice(0, 20);
  let numberCount = 0;
  let dateCount = 0;
  let totalCount = 0;

  for (const row of sample) {
    const val = row[key];
    if (val === null || val === undefined || val === "") continue;
    totalCount++;
    const str = String(val).trim();
    if (!isNaN(Number(str)) && str !== "") {
      numberCount++;
    } else if (!isNaN(Date.parse(str))) {
      dateCount++;
    }
  }

  if (totalCount === 0) return "string";
  if (numberCount / totalCount >= 0.7) return "number";
  if (dateCount / totalCount >= 0.7) return "date";
  return "string";
}

export function exportToExcel(rows: Record<string, unknown>[], fileName: string): void {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
