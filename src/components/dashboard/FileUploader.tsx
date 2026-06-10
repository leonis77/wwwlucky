import { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, Trash2 } from "lucide-react";
import { useDatasetStore } from "../../stores/datasetStore";
import { exportToExcel } from "../../services/excel/parser";

export default function FileUploader() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { datasets, uploadFile, preview, loading, error, clearError } = useDatasetStore();

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      useDatasetStore.setState({ error: "仅支持 .xlsx 和 .xls 格式的文件" });
      return;
    }
    clearError();
    await uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <section className="upload-section">
      <div className="section-head">
        <FileSpreadsheet size={17} strokeWidth={1.5} />
        <span>数据</span>
        <div className="section-actions">
          {preview && (
            <button className="btn-ghost" onClick={() => exportToExcel(preview.rows, "导出数据")}>
              <Download size={14} /> 导出
            </button>
          )}
        </div>
      </div>

      <div
        className={`drop-zone ${dragging ? "drop-zone-active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <div className="drop-icon-wrap">
          <Upload size={22} strokeWidth={1.5} />
        </div>
        <p>拖拽文件到此处，或点击上传</p>
        <span className="drop-hint">支持 .xlsx / .xls</span>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="file-input-hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {loading && (
        <div className="loading-bar"><div className="loading-bar-inner" /></div>
      )}

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError}>关闭</button>
        </div>
      )}

      {datasets.length > 0 && (
        <div className="dataset-list">
          {datasets.map((ds) => (
            <DatasetItem key={ds.id} dataset={ds} />
          ))}
        </div>
      )}
    </section>
  );
}

function DatasetItem({ dataset }: { dataset: import("../../types").Dataset }) {
  const { selectDataset, currentDataset, removeDataset } = useDatasetStore();
  const isActive = currentDataset?.id === dataset.id;

  return (
    <div
      className={`dataset-item ${isActive ? "dataset-item-active" : ""}`}
      onClick={() => selectDataset(dataset)}
    >
      <FileSpreadsheet size={16} strokeWidth={1.5} />
      <span className="dataset-name">{dataset.name}</span>
      <span className="dataset-meta">
        {dataset.data.length} 行 &middot; {new Date(dataset.created_at).toLocaleDateString("zh-CN")}
      </span>
      <button
        className="dataset-delete"
        onClick={(e) => { e.stopPropagation(); removeDataset(dataset.id); }}
        title="删除"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
