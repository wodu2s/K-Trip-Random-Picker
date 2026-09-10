-- 지역(시·도) 방명록 — Supabase SQL Editor에서 한 번 실행한다.
-- 읽기는 로그인 없이 열려 있고, 쓰기·삭제만 로그인한 본인에게 허용한다.

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  sido text not null check (sido in (
    '서울','부산','대구','인천','광주','대전','울산','세종',
    '경기','강원','충북','충남','전북','전남','경북','경남','제주'
  )),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  message text not null check (char_length(message) between 1 and 200),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_entries_sido_created_at_idx
  on public.guestbook_entries (sido, created_at desc);

alter table public.guestbook_entries enable row level security;

-- 읽기: 누구나 (비로그인 포함)
drop policy if exists guestbook_select_all on public.guestbook_entries;
create policy guestbook_select_all
  on public.guestbook_entries for select
  to anon, authenticated
  using (true);

-- 쓰기: 로그인한 본인 명의로만
drop policy if exists guestbook_insert_own on public.guestbook_entries;
create policy guestbook_insert_own
  on public.guestbook_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 삭제: 본인 글만
drop policy if exists guestbook_delete_own on public.guestbook_entries;
create policy guestbook_delete_own
  on public.guestbook_entries for delete
  to authenticated
  using (auth.uid() = user_id);
