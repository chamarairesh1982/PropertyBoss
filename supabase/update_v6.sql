-- Update script for nearby caching
-- Run this after update_v5.sql if upgrading an existing project

create table if not exists public.nearby_cache (
  lat numeric not null,
  lon numeric not null,
  results text[] not null,
  created_at timestamp with time zone default now(),
  primary key (lat, lon)
);
