-- Update script for v4 features (stats, appointments, listing status)
-- Run this after update_v3.sql if upgrading an existing project

alter table public.properties
  add column if not exists status text not null default 'available'
  check (status in ('available','sold','let'));

create table if not exists public.listing_stats (
  property_id uuid references public.properties(id) on delete cascade primary key,
  views integer not null default 0,
  enquiries integer not null default 0,
  favorites integer not null default 0
);

create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  agent_id uuid references public.profiles(id) on delete cascade,
  timeslot timestamp with time zone not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamp with time zone default now()
);

alter table public.listing_stats enable row level security;
alter table public.appointments enable row level security;

create policy "Agents can view stats for their listings" on public.listing_stats
for select using (
  exists(select 1 from public.properties p where p.id = listing_stats.property_id and p.agent_id = auth.uid())
);

create policy "Participants can view appointments" on public.appointments
for select using (user_id = auth.uid() or agent_id = auth.uid());
create policy "Users can request appointments" on public.appointments
for insert with check (user_id = auth.uid());
create policy "Agents can update appointment status" on public.appointments
for update using (agent_id = auth.uid()) with check (agent_id = auth.uid());
create policy "Participants can delete appointments" on public.appointments
for delete using (user_id = auth.uid() or agent_id = auth.uid());

create or replace function public.init_listing_stats()
returns trigger language plpgsql as $$
begin
  insert into public.listing_stats(property_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists property_after_insert on public.properties;
create trigger property_after_insert
after insert on public.properties
for each row execute procedure public.init_listing_stats();

create or replace function public.increment_enquiry()
returns trigger language plpgsql as $$
begin
  if new.property_id is not null then
    update public.listing_stats set enquiries = enquiries + 1 where property_id = new.property_id;
  end if;
  return new;
end;
$$;

drop trigger if exists message_after_insert on public.messages;
create trigger message_after_insert
after insert on public.messages
for each row execute procedure public.increment_enquiry();

create or replace function public.increment_favorite()
returns trigger language plpgsql as $$
begin
  update public.listing_stats set favorites = favorites + 1 where property_id = new.property_id;
  return new;
end;
$$;

create or replace function public.decrement_favorite()
returns trigger language plpgsql as $$
begin
  update public.listing_stats set favorites = greatest(favorites - 1,0) where property_id = old.property_id;
  return old;
end;
$$;

drop trigger if exists favorite_after_insert on public.favorites;
create trigger favorite_after_insert
after insert on public.favorites
for each row execute procedure public.increment_favorite();

drop trigger if exists favorite_after_delete on public.favorites;
create trigger favorite_after_delete
after delete on public.favorites
for each row execute procedure public.decrement_favorite();

create or replace function public.increment_property_view(p_id uuid)
returns void language plpgsql as $$
begin
  update public.listing_stats set views = views + 1 where property_id = p_id;
end;
$$;

-- populate stats for existing properties
insert into public.listing_stats(property_id)
select id from public.properties
where id not in (select property_id from public.listing_stats);
