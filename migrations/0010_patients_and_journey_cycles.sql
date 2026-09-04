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
