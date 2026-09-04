import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

test("patient onboarding does not hardcode universal clinical modules", () => {
  const onboarding = readFileSync(
    join(root, "src/components/onboarding.tsx"),
    "utf8",
  );

  assert.doesNotMatch(onboarding, /CARE_FOCUS/);
  assert.doesNotMatch(
    onboarding,
    /Acompanhe medicação, movimento, sono e refeições/,
  );
  assert.match(
    onboarding,
    /somente os registros e ações que fazem\s+parte da Jornada/,
  );
});

test("Profile does not expose legacy medication controls outside the Journey", () => {
  const profile = readFileSync(join(root, "src/routes/perfil.tsx"), "utf8");

  assert.doesNotMatch(profile, /WEEKDAY_LABELS/);
  assert.doesNotMatch(profile, /Dia fixo da aplicação/);
  assert.doesNotMatch(profile, /Dose utilizada/);
  assert.doesNotMatch(profile, /BIOIMPEDANCE_PREP/);
  assert.match(profile, /editadas na Jornada, com histórico de versões/);
});

test("doctor Profile opens the current journey id rather than the patient id", () => {
  const profile = readFileSync(join(root, "src/routes/perfil.tsx"), "utf8");

  assert.match(profile, /p\.journeyId/);
  assert.match(profile, /openPatient\(p\.journeyId\)/);
  assert.doesNotMatch(profile, /openPatient\(p\.id\)/);
});

test("application metadata describes modular longitudinal follow-up", () => {
  const rootRoute = readFileSync(join(root, "src/routes/__root.tsx"), "utf8");

  assert.match(rootRoute, /Jornadas personalizadas/);
  assert.doesNotMatch(
    rootRoute,
    /medicação, movimento, sono e refeições/,
  );
});
