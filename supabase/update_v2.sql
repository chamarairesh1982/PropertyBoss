-- Update script for v2 features (floor plans, virtual tours, price history)
-- Run this against an existing project already seeded with seed.sql

alter table public.property_images rename to property_media;

alter table public.property_media
  add column type text not null default 'photo' check (type in ('photo','floor_plan','video')); 

-- RLS must be re-enabled after rename
alter table public.property_media enable row level security;

create policy "Public can view property images" on public.property_media
for select using (true);

create policy "Agents can add images to their properties" on public.property_media
for insert with check (
  exists(select 1 from public.properties p where p.id = property_media.property_id and p.agent_id = auth.uid())
);

create policy "Agents can delete images for their properties" on public.property_media
for delete using (
  exists(select 1 from public.properties p where p.id = property_media.property_id and p.agent_id = auth.uid())
);

create table if not exists public.price_history (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade,
  price numeric not null,
  recorded_at timestamp with time zone default now()
);

alter table public.price_history enable row level security;

create policy "Public can view price history" on public.price_history
for select using (true);

create policy "Agents can record price history" on public.price_history
for insert with check (
  exists(select 1 from public.properties p where p.id = price_history.property_id and p.agent_id = auth.uid())
);

create or replace function public.update_property_has_photo()
returns trigger language plpgsql as $$
begin
  update public.properties
  set has_photo = exists (select 1 from public.property_media where property_id = new.property_id and type = 'photo')
  where id = new.property_id;
  return new;
end;
$$;

drop trigger if exists property_image_after_insert on public.property_media;
create trigger property_image_after_insert
after insert on public.property_media
for each row execute procedure public.update_property_has_photo();

drop trigger if exists property_image_after_delete on public.property_media;
create trigger property_image_after_delete
after delete on public.property_media
for each row execute procedure public.update_property_has_photo();
