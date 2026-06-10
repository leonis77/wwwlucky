import { supabase } from "./client";
import type { Dataset, DiaryEntry } from "../../types";

export async function fetchDatasets(): Promise<Dataset[]> {
  const { data, error } = await supabase
    .from("datasets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Dataset[];
}

export async function createDataset(
  name: string,
  rows: Record<string, unknown>[],
  columns: Dataset["columns"]
): Promise<Dataset> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("用户未登录");

  const { data, error } = await supabase
    .from("datasets")
    .insert({ name, data: rows, columns, user_id: userId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Dataset;
}

export async function deleteDataset(id: string): Promise<void> {
  const { error } = await supabase.from("datasets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function uploadExcelFile(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("excel-files").upload(fileName, file);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("excel-files").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function fetchDiaryEntries(): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as DiaryEntry[];
}

export async function createDiaryEntry(content: string): Promise<DiaryEntry> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("用户未登录");

  const { data, error } = await supabase
    .from("diary_entries")
    .insert({ content, user_id: userId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as DiaryEntry;
}

export async function updateDiaryEntry(id: string, content: string): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from("diary_entries")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as DiaryEntry;
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  const { error } = await supabase.from("diary_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
