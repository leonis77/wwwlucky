import { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { useDatasetStore } from "../../stores/datasetStore";
import { exportToExcel } from "../../services/excel/parser";

export default function FileUploader() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { datasets, uploadFile, preview, loading, error, clearError } = useDatasetStore();

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      useDatasetStore.setState({ error: "请上传 .xlsx 或 .xls 文件" });
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

  const handleExport = () => {
    if (preview) {
      exportToExcel(preview.rows, "exported-data");
    }
  };

  return (
    <section className="upload-section">
      <h2 className="section-title">数据工作区</h2>

      <div
        className={`drop-zone ${dragging ? "drop-zone-active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="drop-icon" size={28} />
        <p>拖拽 Excel 文件到此处，或点击上传</p>
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

      {loading && <div className="loading-bar"><div className="loading-bar-inner" /></div>}

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError}>关闭</button>
        </div>
      )}

      {datasets.length > 0 && (
        <div className="dataset-list">
          <div className="dataset-list-header">
            <span>已上传数据集</span>
            {preview && (
              <button className="btn-icon" onClick={handleExport} title="导出当前数据">
                <Download size={16} /> 导出
              </button>
            )}
          </div>
          <div className="dataset-items">
            {datasets.map((ds) => (
              <DatasetItem key={ds.id} dataset={ds} />
            ))}
          </div>
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
      <FileSpreadsheet size={18} />
      <span className="dataset-name">{dataset.name}</span>
      <span className="dataset-date">
        {new Date(dataset.created_at).toLocaleDateString("zh-CN")}
      </span>
      <span className="dataset-rows">{dataset.data.length} 行</span>
      <button
        className="dataset-delete"
        onClick={(e) => {
          e.stopPropagation();
          removeDataset(dataset.id);
        }}
      >
        删除
      </button>
    </div>
  );
}
