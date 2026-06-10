-- 在 Supabase 控制台 SQL Editor 中执行此脚本
-- https://app.supabase.com > 你的项目 > SQL Editor

-- 1. 数据集表
CREATE TABLE IF NOT EXISTS datasets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '[]',
  columns JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 日记表
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 文件存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('excel-files', 'excel-files', true)
ON CONFLICT DO NOTHING;

-- 4. RLS 策略：用户只能读写自己的数据
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own datasets" ON datasets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own datasets" ON datasets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets" ON datasets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own diary entries" ON diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries" ON diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries" ON diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries" ON diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Storage RLS
CREATE POLICY "Auth users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public can read files" ON storage.objects
  FOR SELECT USING (bucket_id = 'excel-files');
