-- Journey V2: draft/publish/versioning while preserving the existing plan column.
--
-- Existing journeys are treated as already published so current patients keep
-- seeing the same plan after this migration. New journeys explicitly start as
-- drafts in application code.

alter table journeys
  add column if not exists journey_status text not null default 'draft';

alter table journeys
  add column if not exists draft_plan text not null default '{}';

alter table journeys
  add column if not exists published_plan text not null default '{}';

alter table journeys
  add column if not exists current_version int not null default 0;

alter table journeys
  add column if not exists published_at timestamptz;

alter table journeys
  add column if not exists plan_updated_at timestamptz;

update journeys
set draft_plan = plan,
    published_plan = plan,
    journey_status = 'published',
    current_version = 1,
    published_at = coalesce(published_at, updated_at),
    plan_updated_at = coalesce(plan_updated_at, updated_at)
where current_version = 0
  and draft_plan = '{}'
  and published_plan = '{}';

create table if not exists journey_versions (
  id text primary key,
  journey_id text not null references journeys (id) on delete cascade,
  version int not null,
  plan text not null,
  published_by_user_id text not null,
  published_at timestamptz not null default now(),
  unique (journey_id, version)
);

-- Rollout compatibility: while a new deployment is building, the previous
-- application version may still insert journeys without V2 draft/version
-- fields. Those legacy-shaped inserts must keep their old "immediately
-- available" semantics instead of becoming invisible V2 drafts.
create or replace function prepare_legacy_journey_v2_fields()
returns trigger
as $fn$
begin
  if new.current_version = 0
     and new.draft_plan = '{}'
     and new.published_plan = '{}' then
    new.draft_plan := new.plan;
    new.published_plan := new.plan;
    new.journey_status := 'published';
    new.current_version := 1;
    new.published_at := coalesce(new.published_at, new.updated_at, now());
    new.plan_updated_at := coalesce(new.plan_updated_at, new.updated_at, now());
  end if;
  return new;
end;
$fn$ language plpgsql;

drop trigger if exists journeys_legacy_v2_prepare on journeys;

create trigger journeys_legacy_v2_prepare
before insert on journeys
for each row
execute function prepare_legacy_journey_v2_fields();

create or replace function record_legacy_journey_initial_version()
returns trigger
as $fn$
begin
  if new.current_version >= 1 then
    insert into journey_versions (
      id,
      journey_id,
      version,
      plan,
      published_by_user_id,
      published_at
    ) values (
      'compat-' || new.id || '-' || new.current_version,
      new.id,
      new.current_version,
      new.published_plan,
      coalesce(new.doctor_user_id, 'migration'),
      coalesce(new.published_at, new.updated_at, now())
    )
    on conflict (journey_id, version) do nothing;
  end if;
  return new;
end;
$fn$ language plpgsql;

drop trigger if exists journeys_legacy_initial_version on journeys;

create trigger journeys_legacy_initial_version
after insert on journeys
for each row
execute function record_legacy_journey_initial_version();

insert into journey_versions (
  id,
  journey_id,
  version,
  plan,
  published_by_user_id,
  published_at
)
select
  'migration-' || id,
  id,
  1,
  published_plan,
  coalesce(doctor_user_id, 'migration'),
  coalesce(published_at, updated_at)
from journeys
where current_version >= 1
on conflict (journey_id, version) do nothing;

create index if not exists journey_versions_journey_idx
  on journey_versions (journey_id, version desc);

create index if not exists journeys_status_idx
  on journeys (doctor_user_id, journey_status);
