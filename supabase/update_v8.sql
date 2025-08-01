-- Refresh derived data for existing records
-- Run this after update_v7.sql if upgrading an existing project

-- Set the has_photo flag correctly for all properties
update public.properties p
set has_photo = exists(
  select 1 from public.property_media m
  where m.property_id = p.id and m.type = 'photo'
);

-- Ensure listing_stats rows exist for every property
insert into public.listing_stats(property_id)
select id from public.properties p
where not exists (
  select 1 from public.listing_stats s where s.property_id = p.id
);
