import { supabase } from "./client";
import type { User } from "../../types";

const errorMessages: Record<string, string> = {
  "Invalid login credentials": "邮箱或密码错误",
  "User already registered": "该邮箱已注册",
  "Password should be at least 6 characters": "密码至少需要 6 位",
  "Email not confirmed": "邮箱尚未验证，请检查邮件",
  "Email rate limit exceeded": "操作过于频繁，请稍后再试",
};

function translateError(message: string): string {
  for (const [key, val] of Object.entries(errorMessages)) {
    if (message.includes(key)) return val;
  }
  return message || "操作失败，请重试";
}

export async function signUp(email: string, password: string) {
  if (password.length < 6) {
    return { user: null, error: "密码至少需要 6 位字符" };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { user: null, error: translateError(error.message) };
  return {
    user: data.user ? { id: data.user.id, email: data.user.email ?? "" } : null,
    error: data.user ? null : "注册成功，请前往邮箱验证后登录",
  };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: translateError(error.message) };
  return {
    user: data.user ? { id: data.user.id, email: data.user.email ?? "" } : null,
    error: null,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/#/auth",
  });
  if (error) return { error: translateError(error.message) };
  return { error: null };
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    callback(user ? { id: user.id, email: user.email ?? "" } : null);
  });
}
