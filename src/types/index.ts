export interface Dataset {
  id: string;
  user_id: string;
  name: string;
  data: Record<string, unknown>[];
  columns: ColumnInfo[];
  created_at: string;
}

export interface ColumnInfo {
  key: string;
  label: string;
  type: 'number' | 'string' | 'date';
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'table';

export interface ChartConfig {
  type: ChartType;
  xField: string;
  yField: string;
}

export interface User {
  id: string;
  email: string;
}

