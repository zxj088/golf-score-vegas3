-- Paste this whole file into Supabase SQL Editor and run it once.
-- This setup allows anyone with the public anon key to read/write these
-- scorecard tables. Use it only for non-sensitive golf score data.

create table if not exists public.vegas_courses (
  id text primary key,
  sync_key text not null default 'default',
  course_id text not null,
  name text not null,
  pars jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sync_key, course_id)
);

create table if not exists public.vegas_rounds (
  id text primary key,
  sync_key text not null default 'default',
  saved_at bigint not null,
  name text not null,
  file_name text,
  course_id text not null,
  course_name text not null,
  pars jsonb not null,
  players jsonb not null,
  point_value numeric not null default 1,
  birdie_flip boolean not null default true,
  scores jsonb not null,
  totals jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vegas_courses_sync_key_idx on public.vegas_courses (sync_key);
create index if not exists vegas_rounds_sync_key_saved_at_idx on public.vegas_rounds (sync_key, saved_at desc);

create or replace function public.vegas_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vegas_courses_updated_at on public.vegas_courses;
create trigger vegas_courses_updated_at
before update on public.vegas_courses
for each row execute function public.vegas_set_updated_at();

drop trigger if exists vegas_rounds_updated_at on public.vegas_rounds;
create trigger vegas_rounds_updated_at
before update on public.vegas_rounds
for each row execute function public.vegas_set_updated_at();

alter table public.vegas_courses enable row level security;
alter table public.vegas_rounds enable row level security;

grant usage on schema public to anon;
grant select, insert, update, delete on public.vegas_courses to anon;
grant select, insert, update, delete on public.vegas_rounds to anon;

drop policy if exists "vegas_courses_select" on public.vegas_courses;
create policy "vegas_courses_select"
on public.vegas_courses for select
to anon
using (true);

drop policy if exists "vegas_courses_insert" on public.vegas_courses;
create policy "vegas_courses_insert"
on public.vegas_courses for insert
to anon
with check (true);

drop policy if exists "vegas_courses_update" on public.vegas_courses;
create policy "vegas_courses_update"
on public.vegas_courses for update
to anon
using (true)
with check (true);

drop policy if exists "vegas_courses_delete" on public.vegas_courses;
create policy "vegas_courses_delete"
on public.vegas_courses for delete
to anon
using (true);

drop policy if exists "vegas_rounds_select" on public.vegas_rounds;
create policy "vegas_rounds_select"
on public.vegas_rounds for select
to anon
using (true);

drop policy if exists "vegas_rounds_insert" on public.vegas_rounds;
create policy "vegas_rounds_insert"
on public.vegas_rounds for insert
to anon
with check (true);

drop policy if exists "vegas_rounds_update" on public.vegas_rounds;
create policy "vegas_rounds_update"
on public.vegas_rounds for update
to anon
using (true)
with check (true);

drop policy if exists "vegas_rounds_delete" on public.vegas_rounds;
create policy "vegas_rounds_delete"
on public.vegas_rounds for delete
to anon
using (true);
