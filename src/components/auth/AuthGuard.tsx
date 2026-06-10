import { useAuthStore } from "../../stores/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading } = useAuthStore();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return <>{children}</>;
}
