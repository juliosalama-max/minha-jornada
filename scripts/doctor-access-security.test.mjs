import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

test("doctor profiles are guarded by an administrative authorization table", () => {
  const sql = readFileSync(
    join(root, "migrations/0009_doctor_authorizations.sql"),
    "utf8",
  );
  assert.match(sql, /create table if not exists doctor_authorizations/i);
  assert.match(sql, /select user_id[\s\S]*from profiles[\s\S]*where role = 'doctor'/i);
  assert.match(sql, /profiles_doctor_authorization_guard/i);
  assert.match(sql, /before insert or update of role on profiles/i);
  assert.match(sql, /authorization\.active = true/i);
});

test("public role setup remains patient-only", () => {
  const ui = readFileSync(join(root, "src/components/role-setup.tsx"), "utf8");
  const api = readFileSync(join(root, "src/lib/journal-api.ts"), "utf8");
  const store = readFileSync(join(root, "src/lib/journal-store.ts"), "utf8");

  assert.match(ui, /chooseRole\("patient"/);
  assert.doesNotMatch(ui, /chooseRole\("doctor"/);
  assert.match(
    api,
    /O papel profissional não pode ser criado por este endpoint/,
  );
  assert.match(api, /requireAuthorizedDoctor/);
  assert.match(store, /chooseRole: \(role: "patient"/);
});

test("doctor backend access checks active authorization, not role alone", () => {
  const api = readFileSync(join(root, "src/lib/journal-api.ts"), "utf8");
  assert.match(api, /doctorAuthorizationActive/);
  assert.match(
    api,
    /profile\.role !== "doctor" \|\| !authorized/,
  );
  assert.match(api, /Acesso profissional não autorizado/);
});
