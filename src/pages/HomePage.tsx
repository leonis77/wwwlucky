import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useDatasetStore } from "../stores/datasetStore";
import { useDiaryStore } from "../stores/diaryStore";
import FileUploader from "../components/dashboard/FileUploader";
import ChartViewer from "../components/dashboard/ChartViewer";
import DiaryEditor from "../components/diary/DiaryEditor";
import DiaryList from "../components/diary/DiaryList";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logout } = useAuthStore();
  const { loadDatasets } = useDatasetStore();
  const { loadEntries } = useDiaryStore();

  useEffect(() => {
    loadDatasets();
    loadEntries();
  }, []);

  return (
    <div className="home-page">
      <header className="top-bar">
        <div className="top-bar-left">
          <span className="top-bar-title">工作台</span>
        </div>
        <div className="top-bar-right">
          <span className="user-badge">{user?.email}</span>
          <button className="btn-logout" onClick={logout} title="退出">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="main-grid">
          <div className="col-data">
            <FileUploader />
            <ChartViewer />
          </div>
          <div className="col-diary">
            <section className="diary-section">
              <div className="diary-section-header">日记</div>
              <DiaryEditor />
              <DiaryList />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
