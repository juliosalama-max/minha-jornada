-- Idempotent rollout compatibility repair.
-- Fresh production deployments already receive these protections from 0005
-- and 0010. This file also upgrades preview/staging databases that may have
-- applied earlier revisions of those migrations before the final integration.

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

insert into journey_versions (
  id,
  journey_id,
  version,
  plan,
  published_by_user_id,
  published_at
)
select
  'compat-repair-' || id || '-' || current_version,
  id,
  current_version,
  published_plan,
  coalesce(doctor_user_id, 'migration'),
  coalesce(published_at, updated_at)
from journeys
where current_version >= 1
on conflict (journey_id, version) do nothing;

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
