import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

test("patient and journey cycle are separate database entities", () => {
  const sql = readFileSync(
    join(root, "migrations/0010_patients_and_journey_cycles.sql"),
    "utf8",
  );

  assert.match(sql, /create table if not exists patients/i);
  assert.match(sql, /alter table journeys add column if not exists patient_id text/i);
  assert.match(sql, /drop constraint if exists journeys_patient_user_id_key/i);
  assert.match(sql, /foreign key \(patient_id\) references patients \(id\) on delete restrict/i);
  assert.match(sql, /legacy-patient-/i);
});

test("database permits history but only one open cycle per patient", () => {
  const sql = readFileSync(
    join(root, "migrations/0010_patients_and_journey_cycles.sql"),
    "utf8",
  );

  assert.match(sql, /journeys_one_active_cycle_per_patient/i);
  assert.match(
    sql,
    /where journey_status in \('draft', 'published', 'in_review'\)/i,
  );
});

test("patient access ignores drafts and writes only to active published cycles", () => {
  const api = readFileSync(join(root, "src/lib/journal-api.ts"), "utf8");

  assert.match(api, /join patients patient on patient\.id = journey\.patient_id/);
  assert.match(api, /journey\.journey_status <> 'draft'/);
  assert.match(
    api,
    /journey\.journey_status in \('published', 'in_review'\)/,
  );
  assert.match(api, /Não há uma Jornada ativa disponível para registro/);
});

test("closed cycles are immutable and support a new empty cycle", () => {
  const api = readFileSync(join(root, "src/lib/journal-api.ts"), "utf8");

  assert.match(api, /function assertJourneyEditable/);
  assert.match(api, /Este ciclo está encerrado e não pode mais ser alterado/);
  assert.match(api, /export const closeJourneyCycle/);
  assert.match(api, /export const createNextJourneyCycle/);
  assert.match(
    api,
    /Conclua ou arquive o ciclo atual antes de iniciar outro/,
  );
});

test("doctor list opens a journey through the patient summary", () => {
  const desk = readFileSync(
    join(root, "src/components/doctor-desk.tsx"),
    "utf8",
  );

  assert.match(desk, /\.journeyId/);
  assert.match(desk, /\.journeyCount/);
  assert.match(desk, /openPatient\(patientSummary\.journeyId\)/);
  assert.doesNotMatch(desk, /Vincular jornada já criada pelo paciente/);
});
