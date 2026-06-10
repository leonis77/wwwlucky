import { supabase } from "./client";
import type { User } from "../../types";

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { user: null, error: error.message };
  return {
    user: data.user ? { id: data.user.id, email: data.user.email ?? "" } : null,
    error: null,
  };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  return {
    user: data.user ? { id: data.user.id, email: data.user.email ?? "" } : null,
    error: null,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
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
