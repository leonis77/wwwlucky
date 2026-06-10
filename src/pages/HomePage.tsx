import { useAuthStore } from "../stores/authStore";
import { useDiaryStore } from "../stores/diaryStore";
import FileUploader from "../components/dashboard/FileUploader";
import FilterPanel from "../components/filter/FilterPanel";
import ChartSection from "../components/dashboard/ChartViewer";
import DataTable from "../components/dashboard/DataTable";
import DiaryEditor from "../components/diary/DiaryEditor";
import DiaryList from "../components/diary/DiaryList";
import { LogOut, BookOpen } from "lucide-react";
import { useEffect } from "react";

export default function HomePage() {
  const { user, logout } = useAuthStore();
  const { loadEntries } = useDiaryStore();

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <div className="home-page">
      <header className="top-bar">
        <div className="top-bar-left">
          <span className="top-bar-title">数据工作台</span>
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
          <div className="col-main">
            <FileUploader />
            <FilterPanel />
            <ChartSection />
            <DataTable />
          </div>
          <div className="col-side">
            <section className="diary-section">
              <div className="diary-section-header">
                <BookOpen size={15} strokeWidth={1.5} />
                日记
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
