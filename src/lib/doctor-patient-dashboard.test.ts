import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterPatientSummaries,
  patientPopulationStats,
} from "./doctor-patient-dashboard.ts";
import type { PatientSummary } from "./types.ts";

function patient(
  id: string,
  patch: Partial<PatientSummary> = {},
): PatientSummary {
  return {
    id,
    journeyId: id + "-journey",
    name: id,
    inviteCode: "",
    onboarded: true,
    pending: false,
    journeyStatus: "published",
    currentVersion: 1,
    journeyCount: 1,
    lastRecordAt: null,
    unreadAlerts: 0,
    openActions: 0,
    ...patch,
  };
}

describe("doctor patient dashboard", () => {
  const patients = [
    patient("Ana", { unreadAlerts: 2 }),
    patient("Bruno", { journeyStatus: "draft", pending: true }),
    patient("Carla", { journeyStatus: "completed" }),
    patient("Daniel", { openActions: 3, journeyStatus: "in_review" }),
  ];

  it("filters by name without case sensitivity", () => {
    assert.deepEqual(
      filterPatientSummaries(patients, "ana", "all").map((item) => item.name),
      ["Ana"],
    );
  });

  it("filters active, draft, closed and awaiting-entry patients", () => {
    assert.deepEqual(
      filterPatientSummaries(patients, "", "active").map((item) => item.name),
      ["Ana", "Daniel"],
    );
    assert.deepEqual(
      filterPatientSummaries(patients, "", "draft").map((item) => item.name),
      ["Bruno"],
    );
    assert.deepEqual(
      filterPatientSummaries(patients, "", "closed").map((item) => item.name),
      ["Carla"],
    );
    assert.deepEqual(
      filterPatientSummaries(patients, "", "pending").map((item) => item.name),
      ["Bruno"],
    );
  });

  it("defines attention only from configured alerts or open care actions", () => {
    assert.deepEqual(
      filterPatientSummaries(patients, "", "attention").map((item) => item.name),
      ["Ana", "Daniel"],
    );
  });

  it("computes population operational counters", () => {
    assert.deepEqual(patientPopulationStats(patients), {
      total: 4,
      active: 2,
      withUnreadAlerts: 1,
      awaitingEntry: 1,
    });
  });
});
