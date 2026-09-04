-- Explicit authorization layer for professional accounts.
-- Existing doctor profiles are preserved by backfilling an active authorization.
-- Future professional accounts must be authorized administratively before the
-- application can provision or use a doctor profile.

create table if not exists doctor_authorizations (
  user_id text primary key,
  active boolean not null default true,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  note text not null default ''
);

insert into doctor_authorizations (user_id, active, note)
select user_id, true, 'Backfill de perfil médico existente'
from profiles
where role = 'doctor'
on conflict (user_id) do nothing;

create or replace function enforce_authorized_doctor_profile()
returns trigger
as $fn$
begin
  if new.role = 'doctor' and not exists (
    select 1
    from doctor_authorizations authorization
    where authorization.user_id = new.user_id
      and authorization.active = true
  ) then
    raise exception 'doctor profile requires active administrative authorization';
  end if;
  return new;
end;
$fn$ language plpgsql;

drop trigger if exists profiles_doctor_authorization_guard on profiles;

create trigger profiles_doctor_authorization_guard
before insert or update of role on profiles
for each row
execute function enforce_authorized_doctor_profile();

create index if not exists doctor_authorizations_active_idx
  on doctor_authorizations (active, user_id);
