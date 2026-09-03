-- Patient/doctor shared journey. user_id columns are TEXT (Better Auth ids).

create table if not exists profiles (
  user_id text primary key,
  role text not null check (role in ('patient', 'doctor')),
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists journeys (
  id text primary key,
  patient_user_id text not null unique,
  doctor_user_id text,
  invite_code text not null unique,
  onboarded boolean not null default false,
  name text not null default '',
  first_consult_date text not null default '',
  injection_weekday int,
  dose text not null default '',
  consults text not null,
  nutrition text not null,
  tasks text not null,
  updated_at timestamptz not null default now()
);

create index if not exists journeys_doctor_idx on journeys (doctor_user_id);
create index if not exists journeys_invite_idx on journeys (invite_code);

create table if not exists day_logs (
  journey_id text not null references journeys (id) on delete cascade,
  day text not null,
  log text not null,
  primary key (journey_id, day)
);

create table if not exists month_notes (
  journey_id text not null references journeys (id) on delete cascade,
  month text not null,
  notes text not null,
  primary key (journey_id, month)
);
