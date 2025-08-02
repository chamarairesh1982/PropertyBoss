-- Update script for calendar view enhancements
-- Run this after update_v4.sql if upgrading an existing project

-- Sample appointment data for testing the calendar
insert into public.appointments (
  id,
  property_id,
  user_id,
  agent_id,
  starts_at,
  ends_at,
  status
) values (
  uuid_generate_v4(),
  '11111111-2222-4333-8444-555555555555',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  now() + interval '14 days',
  (now() + interval '14 days') + interval '1 hour',
  'pending'
);
