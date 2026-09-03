-- Generic answers for Journey V2 modules.
-- Scheduled modules use one response per module/date. Event-based modules may
-- create multiple independent responses on the same date.

create table if not exists journey_module_responses (
  id text primary key,
  journey_id text not null references journeys (id) on delete cascade,
  module_id text not null,
  occurred_on date not null,
  answers text not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journey_module_responses_journey_idx
  on journey_module_responses (journey_id, occurred_on desc);

create index if not exists journey_module_responses_module_idx
  on journey_module_responses (journey_id, module_id, occurred_on desc);
