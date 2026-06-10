import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useDatasetStore } from "../stores/datasetStore";
import { useDiaryStore } from "../stores/diaryStore";
import FileUploader from "../components/dashboard/FileUploader";
import ChartViewer from "../components/dashboard/ChartViewer";
import DiaryEditor from "../components/diary/DiaryEditor";
import DiaryList from "../components/diary/DiaryList";
import { LogOut, User, BookOpen } from "lucide-react";

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
          <div className="logo">PD</div>
          <span className="logo-text">Personal Dashboard</span>
        </div>
        <div className="top-bar-right">
          <div className="user-badge">
            <User size={16} />
            <span>{user?.email}</span>
          </div>
          <button className="btn-logout" onClick={logout} title="退出登录">
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
              <h2 className="section-title">
                <BookOpen size={18} />
                日记空间
              </h2>
              <DiaryEditor />
              <DiaryList />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
