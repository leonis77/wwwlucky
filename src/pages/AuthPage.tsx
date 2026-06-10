import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    login, register, forgotPassword,
    loading, error, resetSent, cooldown, clearError, clearResetSent,
  } = useAuthStore();

  const mode = showForgot ? "forgot" : isLogin ? "login" : "register";
  const isLocked = cooldown !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (mode === "forgot") {
      await forgotPassword(email);
      return;
    }
    if (mode === "login") {
      await login(email, password);
    } else {
      await register(email, password);
    }
  };

  const switchMode = () => {
    clearError();
    clearResetSent();
    setShowForgot(false);
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <div className="auth-card">
        <div className="auth-card-inner">
          <div className="auth-brand">
            <div className="auth-logo">
              <Sparkles size={20} />
            </div>
            <h1 className="auth-title">个人数据工作台</h1>
            <p className="auth-subtitle">
              {mode === "forgot"
                ? "输入注册邮箱，我们将发送重置链接"
                : mode === "login"
                ? "登录以继续使用"
                : "创建账户，开始使用"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <Mail className="input-icon" size={16} />
              <input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                required
                autoFocus
                maxLength={254}
                disabled={isLocked}
              />
            </div>

            {mode !== "forgot" && (
              <div className="input-group">
                <Lock className="input-icon" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="密码（至少 6 位）"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  required
                  minLength={6}
                  maxLength={128}
                  disabled={isLocked}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}

            {isLocked && !error && (
              <div className="auth-error">
                操作过于频繁，请等待 {cooldown} 秒
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}
            {resetSent && (
              <div className="auth-success">重置链接已发送至你的邮箱，请查收</div>
            )}

            <button type="submit" className="auth-submit" disabled={loading || isLocked}>
              {loading ? (
                <div className="spinner-small" />
              ) : isLocked ? (
                <>请等待 {cooldown}s</>
              ) : mode === "forgot" ? (
                <>发送重置链接</>
              ) : (
                <>{mode === "login" ? "登录" : "注册"}<ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            {!showForgot && (
              <button className="auth-link" onClick={() => { clearError(); setShowForgot(true); }}>
                忘记密码？
              </button>
            )}
            {showForgot && (
              <button className="auth-link" onClick={() => { clearError(); clearResetSent(); setShowForgot(false); }}>
                返回登录
              </button>
            )}
            <span className="auth-divider" />
            <button className="auth-link" onClick={switchMode}>
              {showForgot ? "" : isLogin ? "没有账户？注册" : "已有账户？登录"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
