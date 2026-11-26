-- ============================================================
-- Iconic Faculty — 30-Day Recycle Bin support
-- Paste into Supabase SQL Editor and click Run.
-- ============================================================

alter table public.iconic_social_links
  add column if not exists deleted_at timestamptz;

create index if not exists iconic_social_links_deleted_idx
  on public.iconic_social_links (deleted_at);
