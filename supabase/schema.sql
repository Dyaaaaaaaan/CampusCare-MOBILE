-- ============================================================
-- CampusCare - Modul 4 (Database & Authentication)
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query -> Run
-- Aman dijalankan berulang kali.
-- ============================================================

-- 1. Tabel laporan fasilitas kampus
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  title       text not null,
  location    text not null,
  description text not null,
  status      text not null default 'Menunggu'
                check (status in ('Menunggu', 'Diproses', 'Selesai')),
  created_at  timestamptz not null default timezone('utc', now())
);

-- 2. Aktifkan Row Level Security
alter table public.reports enable row level security;

-- 3. Policy: setiap user hanya boleh mengakses baris miliknya sendiri
drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own" on public.reports
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "reports_update_own" on public.reports;
create policy "reports_update_own" on public.reports
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "reports_delete_own" on public.reports;
create policy "reports_delete_own" on public.reports
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 4. Index untuk query "terbaru dulu"
create index if not exists reports_user_created_idx
  on public.reports (user_id, created_at desc);
