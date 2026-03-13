-- ========================================
-- 生成UI - データ永続化マイグレーション (v2)
-- 既存の supabase-setup.sql 実行後にこのSQLを実行してください
-- ========================================

-- 1. Generated UIs テーブル（生成履歴の永続化）
CREATE TABLE IF NOT EXISTS public.generated_uis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_data JSONB NOT NULL DEFAULT '{}',
  title TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Shared UIs テーブル（公開共有リンク）
CREATE TABLE IF NOT EXISTS public.shared_uis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  tool_data JSONB NOT NULL DEFAULT '{}',
  title TEXT,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Feedback Comments テーブル（共有UIへのフィードバック）
CREATE TABLE IF NOT EXISTS public.feedback_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public.shared_uis(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment', 'approval', 'revision_request')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. インデックス
CREATE INDEX IF NOT EXISTS idx_generated_uis_user_id ON public.generated_uis(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_uis_created_at ON public.generated_uis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_uis_is_favorite ON public.generated_uis(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_shared_uis_user_id ON public.shared_uis(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_comments_share_id ON public.feedback_comments(share_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id_created ON public.usage_logs(user_id, created_at DESC);

-- 5. Row Level Security 有効化
ALTER TABLE public.generated_uis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_uis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;

-- 6. RLS ポリシー - Generated UIs
CREATE POLICY "Users manage own generated UIs" ON public.generated_uis
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role full access generated_uis" ON public.generated_uis
  FOR ALL USING (auth.role() = 'service_role');

-- 7. RLS ポリシー - Shared UIs
CREATE POLICY "Anyone can view shared UIs" ON public.shared_uis
  FOR SELECT USING (true);

CREATE POLICY "Users manage own shared UIs" ON public.shared_uis
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role full access shared_uis" ON public.shared_uis
  FOR ALL USING (auth.role() = 'service_role');

-- 8. RLS ポリシー - Feedback Comments
CREATE POLICY "Anyone can view and create feedback" ON public.feedback_comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert feedback" ON public.feedback_comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access feedback" ON public.feedback_comments
  FOR ALL USING (auth.role() = 'service_role');

-- 9. 共有UIの閲覧数インクリメント関数
CREATE OR REPLACE FUNCTION increment_view_count(p_share_id UUID)
RETURNS void AS $$
  UPDATE public.shared_uis
  SET view_count = view_count + 1
  WHERE id = p_share_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 完了メッセージ
SELECT 'Migration v2 complete! Tables: generated_uis, shared_uis, feedback_comments' as status;
