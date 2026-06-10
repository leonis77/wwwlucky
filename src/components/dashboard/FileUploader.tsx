import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { useAppStore } from "../../stores/datasetStore";

export default function FileUploader() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { uploadFile, loading, error, clearError, fileName, allProducts } = useAppStore();

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      useAppStore.setState({ error: "仅支持 .xlsx 和 .xls 格式" });
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

  const hasData = allProducts.length > 0;

  return (
    <section className="upload-section">
      <div
        className={`drop-zone ${dragging ? "drop-zone-active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !hasData && fileRef.current?.click()}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-ink-secondary" />
            <p className="text-ink-secondary">正在解析文件...</p>
          </div>
        ) : hasData ? (
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={22} className="text-ink-secondary" />
            <div className="text-left">
              <p className="text-sm text-ink font-medium">{fileName}</p>
              <p className="text-xs text-ink-secondary">{allProducts.length} 条记录</p>
            </div>
            <button
              className="btn-ghost ml-4"
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            >
              更换文件
            </button>
          </div>
        ) : (
          <>
            <div className="drop-icon-wrap">
              <Upload size={24} strokeWidth={1.5} />
            </div>
            <p>拖拽 Excel 文件到此处，或点击上传</p>
            <span className="drop-hint">支持 .xlsx / .xls</span>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="file-input-hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
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
    </section>
  );
}
