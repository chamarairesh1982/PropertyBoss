-- Update script for v3 features (reviews)
-- Run this against an existing project already seeded with seed.sql or update_v2.sql

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;

create policy "Public can view reviews" on public.reviews
for select using (true);

create policy "Authenticated users can create reviews" on public.reviews
for insert with check (user_id = auth.uid());

create policy "Users can update their reviews" on public.reviews
for update using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their reviews" on public.reviews
for delete using (user_id = auth.uid());
