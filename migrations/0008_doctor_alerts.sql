create table if not exists doctor_alerts (
  id text primary key,
  doctor_user_id text not null,
  journey_id text not null references journeys (id) on delete cascade,
  patient_name text not null default '',
  module_id text not null,
  module_title text not null default '',
  rule_id text not null,
  title text not null,
  severity text not null default 'attention'
    check (severity in ('attention', 'important')),
  source_response_id text not null,
  occurred_on date not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (journey_id, rule_id, source_response_id)
);

create index if not exists doctor_alerts_doctor_idx
  on doctor_alerts (doctor_user_id, created_at desc);

create index if not exists doctor_alerts_journey_idx
  on doctor_alerts (journey_id, created_at desc);
