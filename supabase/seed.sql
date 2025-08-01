--
-- Supabase database schema and seed data for the property portal.
--

-- Enable useful extensions.  These extensions provide UUID generation and other helpers.
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

--
-- Table: profiles
--
-- This table stores additional information about users authenticated via Supabase Auth.  Each
-- profile row references the `auth.users` table via the same UUID.  A `role` column is used
-- to distinguish between normal users, estate agents and administrators.
create table if not exists public.profiles (
  id uuid references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'user', -- values: 'user', 'agent', 'admin'
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (id)
);

--
-- Table: properties
--
-- Stores the core details of each property listing.  Each property belongs to an agent
-- (referenced by `agent_id`) and can optionally include geolocation data.  The
-- `amenities` column is an array of text labels describing features such as "garden",
-- "garage" or "balcony".
create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  price numeric not null,
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  property_type text not null,
  listing_type text not null, -- 'rent' or 'sale'
  latitude double precision,
  longitude double precision,
  address text,
  city text,
  postcode text,
  floor_area numeric,
  epc_rating text,
  property_age integer,
  tenure text,
  amenities text[],
  has_photo boolean default false,
  status text not null default 'available' check (status in ('available','sold','let')),
  agent_id uuid references public.profiles (id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

--
-- Table: property_media
--
-- Each record in this table represents an image for a property.  The images themselves
-- should be uploaded to Supabase Storage and the resulting public URL stored here.  A
-- unique constraint on `(property_id, url)` prevents duplicate entries.
create table if not exists public.property_media (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties (id) on delete cascade,
  url text not null,
  type text not null default 'photo' check (type in ('photo','floor_plan','video')),
  ord integer default 0,
  created_at timestamp with time zone default now(),
  unique (property_id, url)
);

--
-- Table: price_history
--
-- Stores historical sale or rental prices for properties. Each record
-- represents a price at a specific point in time.
create table if not exists public.price_history (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties (id) on delete cascade,
  price numeric not null,
  recorded_at timestamp with time zone default now()
);

--
-- Table: favourites (aka favourites)
--
-- Links users to the properties they have saved.  The composite primary key ensures
-- uniqueness and makes it easy to look up all favourites for a user or property.
create table if not exists public.favorites (
  user_id uuid references public.profiles (id) on delete cascade,
  property_id uuid references public.properties (id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, property_id)
);

--
-- Table: saved_searches
--
-- Stores saved search criteria for users. The criteria column contains a JSON
-- object of filters used on the search page.
create table if not exists public.saved_searches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles (id) on delete cascade,
  criteria jsonb not null,
  created_at timestamp with time zone default now()
);

--
-- Table: messages
--
-- Messages are used for enquiries and replies between users and agents.  Each message
-- references the property it concerns as well as the sender and receiver.  Because
-- conversations may require multiple back‑and‑forth messages, storing them in a single
-- table simplifies retrieval of the entire thread.
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete cascade,
  receiver_id uuid references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

--
-- Table: reviews
--
-- Stores user reviews for properties. Each review references the property
-- being reviewed and the profile of the author. Ratings are limited to 1‑5.
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

--
-- Table: listing_stats
--
-- Stores aggregated view, enquiry and favourite counts per property.
create table if not exists public.listing_stats (
  property_id uuid references public.properties(id) on delete cascade primary key,
  views integer not null default 0,
  enquiries integer not null default 0,
  favorites integer not null default 0
);

--
-- Table: appointments
--
-- Viewing appointments requested by users. Agents confirm or cancel them.
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  agent_id uuid references public.profiles(id) on delete cascade,
  timeslot timestamp with time zone not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security for every table.  RLS must be enabled before policies can be
-- applied.  By default, Supabase denies all access until explicit policies permit it.
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_media enable row level security;
alter table public.price_history enable row level security;
alter table public.favorites enable row level security;
alter table public.messages enable row level security;
alter table public.saved_searches enable row level security;
alter table public.reviews enable row level security;
alter table public.listing_stats enable row level security;
alter table public.appointments enable row level security;

--
-- RLS Policies for profiles
--
-- Allow anyone (authenticated or anonymous) to select all profiles.  This is useful for
-- displaying agent names on property pages.  For sensitive applications you may want to
-- restrict which columns are returned at the API layer instead.
create policy "Public profiles are viewable by anyone" on public.profiles
for select
using (true);

-- Allow signed‑in users to create their own profile.  The with check condition ensures
-- that the `id` being inserted matches the authenticated user.
create policy "Users can insert their own profile" on public.profiles
for insert
with check (id = auth.uid());

-- Allow users to update their own profile.  Admins can update any profile by virtue of
-- their elevated privileges (handled by Supabase's service role key).
create policy "Users can update their own profile" on public.profiles
for update
using (id = auth.uid());

--
-- RLS Policies for properties
--
-- Anyone can view properties.  This includes unauthenticated users browsing the site.
create policy "Public can view properties" on public.properties
for select
using (true);

-- Agents can insert new properties.  The with check enforces that the `agent_id`
-- matches the authenticated user and that the user's role is either agent or admin.
create policy "Agents can create properties" on public.properties
for insert
with check (
  agent_id = auth.uid() and (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'agent' or p.role = 'admin'))
  )
);

-- Agents can update their own properties.  Admins can update any property via the service
-- key.  The with check mirrors the using condition to maintain integrity.
create policy "Agents can update their own properties" on public.properties
for update
using (
  agent_id = auth.uid() or (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
)
with check (
  agent_id = auth.uid() or (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
);

-- Agents can delete their own properties.  Deletion of records cascades to property_media
-- and favorites via foreign key constraints.
create policy "Agents can delete their own properties" on public.properties
for delete
using (
  agent_id = auth.uid() or (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
);

--
-- RLS Policies for property_media
--
-- Anyone can view images.
create policy "Public can view property images" on public.property_media
for select
using (true);

-- Agents can insert images for properties they own.  The with check verifies that the
-- property referenced belongs to the authenticated user.
create policy "Agents can add images to their properties" on public.property_media
for insert
with check (
  exists (
    select 1 from public.properties pr where pr.id = property_media.property_id and pr.agent_id = auth.uid()
  )
);

-- Agents can delete images for their own properties.
create policy "Agents can delete images for their properties" on public.property_media
for delete
using (
  exists (
    select 1 from public.properties pr where pr.id = property_media.property_id and pr.agent_id = auth.uid()
  )
);

--
-- RLS Policies for price_history
--
-- Anyone can view price history. Agents may insert records for properties they own.
create policy "Public can view price history" on public.price_history
for select
using (true);

create policy "Agents can record price history" on public.price_history
for insert
with check (
  exists (
    select 1 from public.properties pr where pr.id = price_history.property_id and pr.agent_id = auth.uid()
  )
);

--
-- RLS Policies for favourites
--
-- Users can read, add and remove their own favourites.  The composite key on
-- `(user_id, property_id)` prevents duplicates.
create policy "Users can view their favourites" on public.favorites
for select
using (user_id = auth.uid());

create policy "Users can favourite a property" on public.favorites
for insert
with check (user_id = auth.uid());

create policy "Users can unfavourite a property" on public.favorites
for delete
using (user_id = auth.uid());

--
-- RLS Policies for saved_searches
--
-- Users can view, create and delete their own saved searches.
create policy "Users can view their saved searches" on public.saved_searches
for select
using (user_id = auth.uid());

create policy "Users can save a search" on public.saved_searches
for insert
with check (user_id = auth.uid());

create policy "Users can delete a saved search" on public.saved_searches
for delete
using (user_id = auth.uid());

--
-- RLS Policies for messages
--
-- Only participants in a conversation (sender or receiver) can view the messages.
create policy "Participants can view messages" on public.messages
for select
using (sender_id = auth.uid() or receiver_id = auth.uid());

-- Any authenticated user can create a message.  The with check ensures that the sender
-- column matches the authenticated user.  The receiver must be specified in the insert.
create policy "Authenticated users can send messages" on public.messages
for insert
with check (sender_id = auth.uid());

--
-- RLS Policies for reviews
--
-- Anyone can read reviews. Only the author may modify or delete their review.
create policy "Public can view reviews" on public.reviews
for select using (true);

create policy "Authenticated users can create reviews" on public.reviews
for insert with check (user_id = auth.uid());

create policy "Users can update their reviews" on public.reviews
for update using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their reviews" on public.reviews
for delete using (user_id = auth.uid());

-- RLS Policies for listing_stats
create policy "Agents can view stats for their listings" on public.listing_stats
for select using (
  exists(
    select 1 from public.properties p
    where p.id = listing_stats.property_id and p.agent_id = auth.uid()
  )
);

-- RLS Policies for appointments
create policy "Participants can view appointments" on public.appointments
for select using (user_id = auth.uid() or agent_id = auth.uid());

create policy "Users can request appointments" on public.appointments
for insert with check (user_id = auth.uid());

create policy "Agents can update appointment status" on public.appointments
for update using (agent_id = auth.uid())
with check (agent_id = auth.uid());

create policy "Participants can delete appointments" on public.appointments
for delete using (user_id = auth.uid() or agent_id = auth.uid());

--
-- Trigger to update properties.has_photo whenever images are added or removed.
--
create or replace function public.update_property_has_photo()
returns trigger
language plpgsql
as $$
begin
  update public.properties
  set has_photo = exists (
    select 1 from public.property_media where property_id = new.property_id and type = 'photo'
  )
  where id = new.property_id;
  return new;
end;
$$;

drop trigger if exists property_image_after_insert on public.property_media;
create trigger property_image_after_insert
after insert on public.property_media
for each row
execute procedure public.update_property_has_photo();

drop trigger if exists property_image_after_delete on public.property_media;
create trigger property_image_after_delete
after delete on public.property_media
for each row
execute procedure public.update_property_has_photo();

-- Trigger to insert listing_stats row when a property is created
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

-- Trigger to increment enquiries when a message is sent
create or replace function public.increment_enquiry()
returns trigger language plpgsql as $$
begin
  if new.property_id is not null then
    update public.listing_stats
    set enquiries = enquiries + 1
    where property_id = new.property_id;
  end if;
  return new;
end;
$$;

drop trigger if exists message_after_insert on public.messages;
create trigger message_after_insert
after insert on public.messages
for each row execute procedure public.increment_enquiry();

-- Triggers for favourites count
create or replace function public.increment_favorite()
returns trigger language plpgsql as $$
begin
  update public.listing_stats
  set favorites = favorites + 1
  where property_id = new.property_id;
  return new;
end;
$$;

create or replace function public.decrement_favorite()
returns trigger language plpgsql as $$
begin
  update public.listing_stats
  set favorites = greatest(favorites - 1, 0)
  where property_id = old.property_id;
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

-- Function to increment view count called manually
create or replace function public.increment_property_view(p_id uuid)
returns void language plpgsql as $$
begin
  update public.listing_stats
  set views = views + 1
  where property_id = p_id;
end;
$$;

--
-- Seed some data for development purposes.  This makes it easier to see the app
-- working without having to create everything manually.
--
insert into public.profiles (id, email, full_name, role)
values
  ('00000000-0000-4000-8000-000000000001', 'agent@example.com', 'Alice Agent', 'agent'),
  ('00000000-0000-4000-8000-000000000002', 'user@example.com', 'Bob Buyer', 'user');

insert into public.properties (id, title, description, price, bedrooms, bathrooms, property_type, listing_type, latitude, longitude, address, city, postcode, floor_area, epc_rating, property_age, tenure, amenities, agent_id, created_at)
values
  ('11111111-2222-4333-8444-555555555555', 'Spacious Family Home', 'A bright and spacious detached house with a large garden.', 750000, 4, 2, 'house', 'sale', 51.3761, -0.1318, '123 Sutton Road', 'Sutton', 'SM1 2AB', 150.0, 'C', 10, 'freehold', ARRAY['garden','garage','driveway'], '00000000-0000-4000-8000-000000000001', now()),
  ('22222222-3333-4444-8555-666666666666', 'Modern Flat in City Centre', 'A modern two‑bed flat close to transport links.', 1850, 2, 1, 'apartment', 'rent', 51.5155, -0.1426, '45 City Street', 'London', 'W1D 3JL', 60.0, 'B', 2, 'leasehold', ARRAY['balcony','lift'], '00000000-0000-4000-8000-000000000001', now());

insert into public.property_media (id, property_id, url, type, ord)
values
  (uuid_generate_v4(), '11111111-2222-4333-8444-555555555555', 'https://images.unsplash.com/photo-1560185127-6ef63e15c150?auto=format&fit=crop&w=1024&q=80', 'photo', 0),
  (uuid_generate_v4(), '22222222-3333-4444-8555-666666666666', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1024&q=80', 'photo',0);

insert into public.price_history (property_id, price, recorded_at)
values
  ('11111111-2222-4333-8444-555555555555', 720000, now() - interval '1 year'),
  ('11111111-2222-4333-8444-555555555555', 750000, now());

insert into public.reviews (property_id, user_id, rating, comment, created_at)
values
  ('11111111-2222-4333-8444-555555555555',
    '00000000-0000-4000-8000-000000000002',
    4,
    'Great location and spacious rooms.',
    now() - interval '2 days'),
  ('22222222-3333-4444-8555-666666666666',
    '00000000-0000-4000-8000-000000000002',
    5,
    'Loved staying here!',
    now() - interval '1 day');

-- initialise stats for demo properties
insert into public.listing_stats(property_id)
select id from public.properties;

-- demo appointment
insert into public.appointments(id, property_id, user_id, agent_id, timeslot, status)
values (
  uuid_generate_v4(),
  '11111111-2222-4333-8444-555555555555',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  now() + interval '2 days',
  'confirmed'
);
