import { supabase } from "./client";
import type { User } from "../../types";
import { validateEmail, sanitizeInput } from "../../utils/security";

const errorMessages: Record<string, string> = {
  "Invalid login credentials": "邮箱或密码错误",
  "User already registered": "该邮箱已注册",
  "Password should be at least 6 characters": "密码至少需要 6 位",
  "Email not confirmed": "邮箱尚未验证，请检查邮件（可能进了垃圾箱）",
  "Email rate limit exceeded": "邮件发送已达上限（免费版每小时仅 2 封），请等待约 1 小时或前往 Supabase 控制台关闭邮箱验证后重试",
  "For security purposes": "安全校验未通过，请重试",
  "Unable to validate email address": "邮箱地址无效，请检查格式",
};

function translateError(message: string): string {
  for (const [key, val] of Object.entries(errorMessages)) {
    if (message.includes(key)) return val;
  }
  return "操作失败，请重试";
}

export async function signUp(email: string, password: string) {
  const cleanEmail = sanitizeInput(email, 254);
  const validation = validateEmail(cleanEmail);
  if (!validation.valid) {
    return { user: null, error: validation.error };
  }

  if (password.length < 6) {
    return { user: null, error: "密码至少需要 6 位字符" };
  }
  if (password.length > 128) {
    return { user: null, error: "密码过长" };
  }

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
  });

  if (error) return { user: null, error: translateError(error.message) };
  return {
    user: data.user ? { id: data.user.id, email: data.user.email ?? "" } : null,
    error: data.user ? null : "注册请求已提交，请查收验证邮件后登录",
  };
}

export async function signIn(email: string, password: string) {
  const cleanEmail = sanitizeInput(email, 254);
  const validation = validateEmail(cleanEmail);
  if (!validation.valid) {
    return { user: null, error: validation.error };
  }

  if (password.length > 128) {
    return { user: null, error: "密码过长" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

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
  const cleanEmail = sanitizeInput(email, 254);
  const validation = validateEmail(cleanEmail);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
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
