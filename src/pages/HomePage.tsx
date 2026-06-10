import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useDatasetStore } from "../stores/datasetStore";
import { useDiaryStore } from "../stores/diaryStore";
import FileUploader from "../components/dashboard/FileUploader";
import ChartViewer from "../components/dashboard/ChartViewer";
import DiaryEditor from "../components/diary/DiaryEditor";
import DiaryList from "../components/diary/DiaryList";
import { LogOut, User, BookOpen, BarChart3 } from "lucide-react";

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
          <BarChart3 size={22} strokeWidth={1.5} />
          <span className="top-bar-title">工作台</span>
        </div>
        <div className="top-bar-right">
          <div className="user-badge">
            <User size={14} />
            <span>{user?.email}</span>
          </div>
          <button className="btn-logout" onClick={logout} title="退出登录">
            <LogOut size={15} />
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
              <div className="diary-section-header">
                <BookOpen size={17} strokeWidth={1.5} />
                <span>日记</span>
              </div>
              <DiaryEditor />
              <DiaryList />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
