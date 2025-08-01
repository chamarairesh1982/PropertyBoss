-- Audit logs
-- Run this after update_v9.sql if upgrading an existing project

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  action text not null,
  "table" text not null,
  record_id uuid,
  "timestamp" timestamp with time zone default now()
);

create or replace function public.record_audit()
returns trigger language plpgsql as $$
begin
  insert into public.audit_logs(user_id, action, "table", record_id, "timestamp")
  values (auth.uid(), tg_op, tg_table_name, coalesce(new.id, old.id), now());
  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

drop trigger if exists profiles_audit on public.profiles;
create trigger profiles_audit
after insert or update or delete on public.profiles
for each row execute procedure public.record_audit();

drop trigger if exists properties_audit on public.properties;
create trigger properties_audit
after insert or update or delete on public.properties
for each row execute procedure public.record_audit();

drop trigger if exists messages_audit on public.messages;
create trigger messages_audit
after insert or update or delete on public.messages
for each row execute procedure public.record_audit();

drop trigger if exists reviews_audit on public.reviews;
create trigger reviews_audit
after insert or update or delete on public.reviews
for each row execute procedure public.record_audit();
