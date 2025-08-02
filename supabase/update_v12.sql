-- Appointment scheduling upgrades
-- Run this after update_v11.sql if upgrading an existing project

-- Add separate start and end timestamps
alter table public.appointments
  add column if not exists starts_at timestamp with time zone,
  add column if not exists ends_at timestamp with time zone;

-- Migrate existing timeslot values into the new columns
update public.appointments
  set starts_at = timeslot,
      ends_at = timeslot + interval '1 hour'
  where starts_at is null;

alter table public.appointments
  alter column starts_at set not null,
  alter column ends_at set not null;

-- Remove legacy column
alter table public.appointments
  drop column if exists timeslot;

-- Update status values and constraints
update public.appointments set status = 'approved' where status = 'confirmed';
update public.appointments set status = 'declined' where status = 'cancelled';

alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
    check (status in ('pending','approved','declined'));

alter table public.appointments
  alter column status set default 'pending';
