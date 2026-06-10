# Personal Dashboard

个人数据工作台 — 深色极简风格的 React 单页应用。

## 功能

- **Excel 数据管理** — 上传 `.xlsx/.xls` 文件，自动解析并用 ECharts 可视化
- **图表** — 柱状图、折线图、饼图、散点图、数据表格
- **日记空间** — 个人日记记录，支持增删改

## 技术栈

React 18 + Vite + TypeScript + ECharts + SheetJS + Supabase + Zustand

## 部署

部署于 GitHub Pages，后端数据服务使用 Supabase。

## 本地开发

```bash
npm install
cp .env.example .env   # 填入 Supabase URL 和 Anon Key
npm run dev
```
