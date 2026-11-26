-- ============================================================
-- Iconic Faculty — Separate Linktree Tables (no collision)
-- Tables: public.iconic_social_links, public.iconic_link_events
-- Paste into Supabase SQL Editor and click Run.
-- ============================================================

create or replace function public.iconic_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.iconic_social_links (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  url         text not null,
  slug        text not null unique,
  icon        text not null default 'link',
  description text,
  category    text not null default 'Other',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists iconic_social_links_sort_idx
  on public.iconic_social_links (sort_order);

create index if not exists iconic_social_links_slug_idx
  on public.iconic_social_links (slug);

create index if not exists iconic_social_links_category_idx
  on public.iconic_social_links (category);

drop trigger if exists iconic_social_links_touch on public.iconic_social_links;
create trigger iconic_social_links_touch before update on public.iconic_social_links
  for each row execute function public.iconic_touch_updated_at();

alter table public.iconic_social_links enable row level security;

drop policy if exists iconic_social_links_public_select on public.iconic_social_links;
create policy iconic_social_links_public_select on public.iconic_social_links
  for select using (is_active = true);

-- Analytics events for Iconic Faculty Linktree
create table if not exists public.iconic_link_events (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('view', 'click')),
  link_id     uuid references public.iconic_social_links (id) on delete set null,
  occurred_at timestamptz not null default now(),
  source      text,
  device      text
);

create index if not exists iconic_link_events_time_idx on public.iconic_link_events (occurred_at);
create index if not exists iconic_link_events_type_idx on public.iconic_link_events (type);
create index if not exists iconic_link_events_link_idx on public.iconic_link_events (link_id);

alter table public.iconic_link_events enable row level security;

-- Seed default Iconic Faculty links
insert into public.iconic_social_links (title, url, slug, icon, description, category, sort_order) values
  ('Watch Free Lectures on YouTube', 'https://www.youtube.com/@TheIconicFaculty', 'youtube-lectures', 'youtube', 'Complete Intermediate MPC & BiPC video lectures — 100% free', 'Social', 1),
  ('Chat on WhatsApp',                'https://wa.me/917780218068',               'whatsapp-help',    'whatsapp','Ask doubts or request subject-wise study materials',         'Social', 2),
  ('Follow on Instagram',             'https://www.instagram.com/the_iconic_faculty', 'instagram',    'instagram','Short revision reels, exam tips & student updates',         'Social', 3),
  ('Visit Iconic Faculty Home',       'https://iconicfaculty.com',                'website',          'website', 'Our mission to protect intermediate students from college mafia', 'Resources', 4)
on conflict (slug) do nothing;
