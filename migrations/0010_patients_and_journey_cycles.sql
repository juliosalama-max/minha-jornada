-- Separate the person being followed from each longitudinal Journey cycle.
-- Existing rows are backfilled one-to-one, preserving all current journey ids
-- and child records. Future cycles reuse patients.id while keeping a new journey id.

create table if not exists patients (
  id text primary key,
  doctor_user_id text,
  patient_user_id text,
  name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table journeys add column if not exists patient_id text;

insert into patients (
  id,
  doctor_user_id,
  patient_user_id,
  name,
  created_at,
  updated_at
)
select
  'legacy-patient-' || journey.id,
  journey.doctor_user_id,
  journey.patient_user_id,
  journey.name,
  now(),
  journey.updated_at
from journeys journey
where journey.patient_id is null
on conflict (id) do nothing;

update journeys
set patient_id = 'legacy-patient-' || id
where patient_id is null;

alter table journeys
  drop constraint if exists journeys_patient_user_id_key;

-- Rollout/rollback compatibility: the previous application version does not
-- know about patients or journeys.patient_id. Keep old inserts and claim/link
-- updates valid while old and new application instances may briefly coexist.
create or replace function ensure_journey_patient_link()
returns trigger
as $fn$
declare
  existing_patient_id text;
begin
  if new.patient_id is null then
    if new.patient_user_id is not null then
      select id
      into existing_patient_id
      from patients
      where patient_user_id = new.patient_user_id
      limit 1;
    end if;

    new.patient_id := coalesce(existing_patient_id, 'legacy-patient-' || new.id);

    insert into patients (
      id,
      doctor_user_id,
      patient_user_id,
      name,
      created_at,
      updated_at
    ) values (
      new.patient_id,
      new.doctor_user_id,
      new.patient_user_id,
      new.name,
      now(),
      coalesce(new.updated_at, now())
    )
    on conflict (id) do update set
      doctor_user_id = coalesce(excluded.doctor_user_id, patients.doctor_user_id),
      patient_user_id = coalesce(excluded.patient_user_id, patients.patient_user_id),
      name = case
        when excluded.name <> '' then excluded.name
        else patients.name
      end,
      updated_at = now();
  end if;

  return new;
end;
$fn$ language plpgsql;

drop trigger if exists journeys_patient_link_guard on journeys;

create trigger journeys_patient_link_guard
before insert on journeys
for each row
execute function ensure_journey_patient_link();

create or replace function sync_patient_from_legacy_journey()
returns trigger
as $fn$
begin
  update patients
  set doctor_user_id = coalesce(new.doctor_user_id, doctor_user_id),
      patient_user_id = coalesce(new.patient_user_id, patient_user_id),
      name = case when new.name <> '' then new.name else name end,
      updated_at = now()
  where id = new.patient_id;

  return new;
end;
$fn$ language plpgsql;

drop trigger if exists journeys_patient_sync on journeys;

create trigger journeys_patient_sync
after update of patient_user_id, doctor_user_id, name on journeys
for each row
execute function sync_patient_from_legacy_journey();

alter table journeys
  alter column patient_id set not null;

alter table journeys
  drop constraint if exists journeys_patient_id_fkey;

alter table journeys
  add constraint journeys_patient_id_fkey
  foreign key (patient_id) references patients (id) on delete restrict;

create index if not exists patients_doctor_idx
  on patients (doctor_user_id, name);

create unique index if not exists patients_doctor_account_unique
  on patients (doctor_user_id, patient_user_id)
  where doctor_user_id is not null and patient_user_id is not null;

create index if not exists journeys_patient_idx
  on journeys (patient_id, updated_at desc);

create unique index if not exists journeys_one_active_cycle_per_patient
  on journeys (patient_id)
  where journey_status in ('draft', 'published', 'in_review');
