import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LogIn, UserPlus, Mail, Lock } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password);
    }
    navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Personal Dashboard</h1>
        <p className="auth-subtitle">
          {isLogin ? "欢迎回来" : "创建新账户"}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              required
              minLength={6}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <div className="spinner-small" />
            ) : isLogin ? (
              <><LogIn size={16} /> 登录</>
            ) : (
              <><UserPlus size={16} /> 注册</>
            )}
          </button>
        </form>

        <button
          className="auth-toggle"
          onClick={() => { setIsLogin(!isLogin); clearError(); }}
        >
          {isLogin ? "没有账户？点击注册" : "已有账户？点击登录"}
        </button>
      </div>
    </div>
  );
}
