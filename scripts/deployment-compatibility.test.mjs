import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

test("legacy app inserts remain usable while V2 deploys", () => {
  const sql = readFileSync(
    join(root, "migrations/0005_journey_versions.sql"),
    "utf8",
  );

  assert.match(sql, /prepare_legacy_journey_v2_fields/);
  assert.match(sql, /before insert on journeys/i);
  assert.match(sql, /new\.journey_status := 'published'/);
  assert.match(sql, /record_legacy_journey_initial_version/);
});

test("legacy journey writes remain compatible after patient separation", () => {
  const sql = readFileSync(
    join(root, "migrations/0010_patients_and_journey_cycles.sql"),
    "utf8",
  );

  assert.match(sql, /ensure_journey_patient_link/);
  assert.match(sql, /before insert on journeys/i);
  assert.match(sql, /sync_patient_from_legacy_journey/);
  assert.match(
    sql,
    /after update of patient_user_id, doctor_user_id, name on journeys/i,
  );
});

test("rollout compatibility is repaired idempotently in later environments", () => {
  const sql = readFileSync(
    join(root, "migrations/0012_rollout_compatibility.sql"),
    "utf8",
  );

  assert.match(sql, /where current_version = 0/);
  assert.match(sql, /on conflict \(journey_id, version\) do nothing/i);
  assert.match(sql, /create or replace function prepare_legacy_journey_v2_fields/);
  assert.match(sql, /create or replace function ensure_journey_patient_link/);
});


test("PL/pgSQL migrations use complete named dollar delimiters", () => {
  for (const name of [
    "0005_journey_versions.sql",
    "0009_doctor_authorizations.sql",
    "0010_patients_and_journey_cycles.sql",
    "0012_rollout_compatibility.sql",
  ]) {
    const sql = readFileSync(join(root, "migrations", name), "utf8");
    assert.doesNotMatch(sql, /\nas \$\s*\n/);
    assert.doesNotMatch(sql, /\n\$;\s*(?:\n|$)/);
    const starts = sql.match(/as \$fn\$/g) ?? [];
    const ends = sql.match(/\$fn\$ language plpgsql;/g) ?? [];
    assert.equal(starts.length, ends.length, `unbalanced PL/pgSQL delimiter in ${name}`);
  }
});
