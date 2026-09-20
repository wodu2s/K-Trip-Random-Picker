-- Pick&Go 방명록 / 저장한 장소 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 한 번 실행하세요.

-- ---------------------------------------------------------------
-- 1. 프로필 (auth.users 와 1:1). 후기 작성자 닉네임 표시용.
-- ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 20),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 프로필은 누구나 조회 가능 (비로그인 사용자도 작성자 이름을 봐야 함)
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 회원가입 시 프로필 자동 생성 (signUp 의 user_metadata.nickname 사용)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nickname', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- 2. 지역별 방명록 / 후기
--    region 은 시·도 축약 표기(강원·제주·충남 …) — lib/guestbook.ts의 sidoOf() 결과.
--    destination_id/name 은 이 후기가 남겨진 구체적인 추천 여행지를 가리킨다.
-- ---------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination_id text not null,
  destination_name text not null,
  region text not null,
  nickname text not null,
  content text not null check (char_length(content) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_region_idx on public.reviews (region, created_at desc);
create index if not exists reviews_destination_idx on public.reviews (destination_id, created_at desc);

alter table public.reviews enable row level security;

-- 조회는 비로그인 사용자도 가능
drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews
  for select using (true);

-- 작성은 로그인 사용자가 본인 user_id 로만
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id);

-- 수정/삭제는 작성자 본인만 (다른 사용자의 후기는 서버에서 거부된다)
drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete using (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reviews_touch_updated_at on public.reviews;
create trigger reviews_touch_updated_at
  before update on public.reviews
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------
-- 3. 저장한 장소
--    TourAPI 여행지는 새로고침 후 다시 조회되지 않을 수 있어
--    화면 표시에 필요한 최소 정보를 함께 저장한다.
-- ---------------------------------------------------------------
create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination_id text not null,
  destination_name text not null,
  region text not null,
  image text,
  short_description text,
  created_at timestamptz not null default now(),
  unique (user_id, destination_id)
);

create index if not exists saved_places_user_idx on public.saved_places (user_id, created_at desc);

alter table public.saved_places enable row level security;

-- 저장 목록은 본인 것만 조회/추가/삭제 가능 (남의 목록은 조회조차 되지 않는다)
drop policy if exists "saved_places_select_own" on public.saved_places;
create policy "saved_places_select_own" on public.saved_places
  for select using (auth.uid() = user_id);

drop policy if exists "saved_places_insert_own" on public.saved_places;
create policy "saved_places_insert_own" on public.saved_places
  for insert with check (auth.uid() = user_id);

drop policy if exists "saved_places_delete_own" on public.saved_places;
create policy "saved_places_delete_own" on public.saved_places
  for delete using (auth.uid() = user_id);
