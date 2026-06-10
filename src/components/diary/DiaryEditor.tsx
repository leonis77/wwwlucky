import { useState } from "react";
import { Send } from "lucide-react";
import { useDiaryStore } from "../../stores/diaryStore";

export default function DiaryEditor() {
  const [content, setContent] = useState("");
  const { addEntry } = useDiaryStore();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await addEntry(content.trim());
    setContent("");
  };

  return (
    <div className="diary-editor">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下此刻的想法..."
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.ctrlKey) handleSubmit();
        }}
      />
      <div className="diary-editor-footer">
        <span className="diary-hint">Ctrl + Enter 快速提交</span>
        <button className="diary-submit" onClick={handleSubmit} disabled={!content.trim()}>
          <Send size={13} /> 记录
        </button>
      </div>
    </div>
  );
}
