import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { pendingMigrations } from "./migration-plan.mjs";

const root = process.cwd();

async function migratedDb() {
  const pg = new PGlite();
  await pg.waitReady;

  const migrationsDir = join(root, "migrations");
  const entries = await readdir(migrationsDir);
  for (const { name } of pendingMigrations(entries, [])) {
    const sql = await readFile(join(migrationsDir, name), "utf8");
    await pg.transaction(async (tx) => {
      await tx.exec(sql);
    });
  }

  return pg;
}

test("all application migrations execute from an empty database", async () => {
  const pg = await migratedDb();
  try {
    const tables = await pg.query(
      "select tablename from pg_tables where schemaname = 'public'",
    );
    const names = new Set(tables.rows.map((row) => row.tablename));
    for (const name of [
      "profiles",
      "journeys",
      "patients",
      "journey_versions",
      "journey_module_responses",
      "journey_action_progress",
      "doctor_alerts",
      "doctor_authorizations",
    ]) {
      assert.ok(names.has(name), `missing table: ${name}`);
    }
  } finally {
    await pg.close();
  }
});

test("legacy inserts remain valid after the full V2 schema", async () => {
  const pg = await migratedDb();
  try {
    await pg.query(
      `insert into journeys (
        id,
        patient_user_id,
        doctor_user_id,
        invite_code,
        onboarded,
        name,
        first_consult_date,
        injection_weekday,
        dose,
        consults,
        nutrition,
        tasks,
        plan
      ) values (
        'legacy-j1',
        null,
        'doctor-1',
        'ABC123',
        false,
        'Paciente legado',
        '',
        null,
        '',
        '[]',
        '[]',
        '[]',
        '{"medication":{"enabled":false}}'
      )`,
    );

    const journey = (
      await pg.query(
        "select patient_id, journey_status, current_version from journeys where id = 'legacy-j1'",
      )
    ).rows[0];

    assert.ok(journey.patient_id);
    assert.equal(journey.journey_status, "published");
    assert.equal(Number(journey.current_version), 1);

    const versions = await pg.query(
      "select count(*) as count from journey_versions where journey_id = 'legacy-j1'",
    );
    assert.equal(Number(versions.rows[0]?.count ?? 0), 1);

    await pg.query(
      "update journeys set patient_user_id = 'patient-user-1', name = 'Paciente vinculado' where id = 'legacy-j1'",
    );

    const patient = (
      await pg.query(
        "select patient_user_id, name from patients where id = $1",
        [journey.patient_id],
      )
    ).rows[0];

    assert.equal(patient.patient_user_id, "patient-user-1");
    assert.equal(patient.name, "Paciente vinculado");
  } finally {
    await pg.close();
  }
});

test("new V2 drafts are not auto-published by rollout compatibility triggers", async () => {
  const pg = await migratedDb();
  try {
    await pg.query(
      `insert into patients (
        id,
        doctor_user_id,
        patient_user_id,
        name
      ) values (
        'patient-v2',
        'doctor-1',
        null,
        'Paciente V2'
      )`,
    );

    await pg.query(
      `insert into journeys (
        id,
        patient_id,
        patient_user_id,
        doctor_user_id,
        invite_code,
        onboarded,
        name,
        first_consult_date,
        injection_weekday,
        dose,
        consults,
        nutrition,
        tasks,
        plan,
        journey_status,
        draft_plan,
        published_plan,
        current_version
      ) values (
        'journey-v2',
        'patient-v2',
        null,
        'doctor-1',
        'V2D123',
        false,
        'Paciente V2',
        '',
        null,
        '',
        '[]',
        '[]',
        '[]',
        '{}',
        'draft',
        '{"schemaVersion":2,"title":"Novo ciclo"}',
        '{}',
        0
      )`,
    );

    const row = (
      await pg.query(
        "select journey_status, current_version from journeys where id = 'journey-v2'",
      )
    ).rows[0];

    assert.equal(row.journey_status, "draft");
    assert.equal(Number(row.current_version), 0);

    const versions = await pg.query(
      "select count(*) as count from journey_versions where journey_id = 'journey-v2'",
    );
    assert.equal(Number(versions.rows[0]?.count ?? 0), 0);
  } finally {
    await pg.close();
  }
});

test("doctor profile requires administrative authorization", async () => {
  const pg = await migratedDb();
  try {
    await assert.rejects(
      pg.query(
        "insert into profiles (user_id, role, display_name) values ('doctor-x', 'doctor', 'Dra. X')",
      ),
    );

    await pg.query(
      "insert into doctor_authorizations (user_id, active, note) values ('doctor-x', true, 'teste')",
    );
    await pg.query(
      "insert into profiles (user_id, role, display_name) values ('doctor-x', 'doctor', 'Dra. X')",
    );

    const row = (
      await pg.query(
        "select role from profiles where user_id = 'doctor-x'",
      )
    ).rows[0];
    assert.equal(row.role, "doctor");
  } finally {
    await pg.close();
  }
});

test("one patient account cannot represent two patient entities", async () => {
  const pg = await migratedDb();
  try {
    await pg.query(
      "insert into patients (id, doctor_user_id, patient_user_id, name) values ('p1', 'doctor-1', 'account-1', 'P1')",
    );

    await assert.rejects(
      pg.query(
        "insert into patients (id, doctor_user_id, patient_user_id, name) values ('p2', 'doctor-2', 'account-1', 'P2')",
      ),
    );
  } finally {
    await pg.close();
  }
});
