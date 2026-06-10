import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useDiaryStore } from "../../stores/diaryStore";
import type { DiaryEntry } from "../../types";

export default function DiaryList() {
  const { entries, removeEntry, editEntry } = useDiaryStore();

  if (entries.length === 0) {
    return (
      <div className="diary-empty">
        <p>还没有日记，写下第一条吧</p>
      </div>
    );
  }

  return (
    <div className="diary-list">
      {entries.map((entry) => (
        <DiaryItem key={entry.id} entry={entry} onDelete={removeEntry} onEdit={editEntry} />
      ))}
    </div>
  );
}

function DiaryItem({
  entry, onDelete, onEdit,
}: {
  entry: DiaryEntry; onDelete: (id: string) => Promise<void>; onEdit: (id: string, content: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.content);

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await onEdit(entry.id, trimmed);
    setEditing(false);
  };

  const handleCancel = () => {
    setText(entry.content);
    setEditing(false);
  };

  return (
    <div className="diary-item">
      <div className="diary-item-header">
        <span className="diary-date">
          {new Date(entry.created_at).toLocaleString("zh-CN", {
            month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </span>
        {!editing && (
          <div className="diary-actions">
            <button className="diary-action-btn" onClick={() => setEditing(true)} title="编辑">
              <Pencil size={13} />
            </button>
            <button className="diary-action-btn diary-action-delete" onClick={() => onDelete(entry.id)} title="删除">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="diary-edit-mode">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} autoFocus />
          <div className="diary-edit-actions">
            <button className="diary-save-btn" onClick={handleSave}><Check size={13} /> 保存</button>
            <button className="diary-cancel-btn" onClick={handleCancel}><X size={13} /> 取消</button>
          </div>
        </div>
      ) : (
        <p className="diary-content">{entry.content}</p>
      )}
    </div>
  );
}
