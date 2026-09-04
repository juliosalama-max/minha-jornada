-- Patient progress for versioned Journey V2 tasks and exams.
-- The care-plan definitions stay inside the published Journey document; only
-- execution state lives here, preserving plan authorship and version history.

create table if not exists journey_action_progress (
  journey_id text not null references journeys (id) on delete cascade,
  action_type text not null check (action_type in ('task', 'exam')),
  action_id text not null,
  status text not null default 'pending'
    check (status in ('pending', 'scheduled', 'completed', 'cancelled')),
  scheduled_date date,
  note text not null default '',
  completed_at timestamptz,
  updated_by_user_id text not null,
  updated_at timestamptz not null default now(),
  primary key (journey_id, action_type, action_id)
);

create index if not exists journey_action_progress_journey_idx
  on journey_action_progress (journey_id, updated_at desc);
