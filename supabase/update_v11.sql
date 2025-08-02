-- Area guides cache
-- Run this after update_v10.sql if upgrading an existing project

create table if not exists public.area_guides (
  area text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now()
);

alter table public.area_guides enable row level security;

create policy "Area guides are viewable by everyone" on public.area_guides
  for select using (true);

create policy "Service role can manage area guides" on public.area_guides
  for insert with check (auth.role() = 'service_role');

create policy "Service role can manage area guides" on public.area_guides
  for update using (auth.role() = 'service_role');
