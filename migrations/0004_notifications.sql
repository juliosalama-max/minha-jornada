create table if not exists doctor_notices (
  id text primary key,
  doctor_user_id text not null,
  journey_id text not null references journeys (id) on delete cascade,
  patient_name text not null default '',
  summary text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists doctor_notices_doctor_idx
  on doctor_notices (doctor_user_id, created_at desc);
