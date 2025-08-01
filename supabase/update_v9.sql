-- Rate limiting support
-- Run this after update_v8.sql if upgrading an existing project

create table if not exists public.rate_limits (
  identifier text not null,
  event text not null,
  count integer not null default 0,
  last_request timestamp with time zone not null default now(),
  primary key (identifier, event)
);
