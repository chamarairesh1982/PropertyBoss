-- Update script for favorite lists and comparison features
-- Run this after update_v6.sql if upgrading an existing project

create table if not exists public.favorite_lists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.favorite_list_items (
  list_id uuid references public.favorite_lists(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (list_id, property_id)
);

alter table public.favorite_lists enable row level security;
alter table public.favorite_list_items enable row level security;

create policy "Users can view their favorite lists" on public.favorite_lists
  for select using (user_id = auth.uid());

create policy "Users can create favorite lists" on public.favorite_lists
  for insert with check (user_id = auth.uid());

create policy "Users can delete favorite lists" on public.favorite_lists
  for delete using (user_id = auth.uid());

create policy "Users can view list items" on public.favorite_list_items
  for select using (
    exists (
      select 1 from public.favorite_lists fl
      where fl.id = favorite_list_items.list_id and fl.user_id = auth.uid()
    )
  );

create policy "Users can add list items" on public.favorite_list_items
  for insert with check (
    exists (
      select 1 from public.favorite_lists fl
      where fl.id = favorite_list_items.list_id and fl.user_id = auth.uid()
    )
  );

create policy "Users can remove list items" on public.favorite_list_items
  for delete using (
    exists (
      select 1 from public.favorite_lists fl
      where fl.id = favorite_list_items.list_id and fl.user_id = auth.uid()
    )
  );
