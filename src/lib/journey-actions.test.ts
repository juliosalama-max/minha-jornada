import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  actionIsCompleted,
  actionProgressFor,
  openCareActionCount,
  resolvedAppointmentDate,
} from "./journey-actions.ts";
import type {
  JourneyActionProgress,
  JourneyAppointment,
  JourneyExam,
  JourneyPlanV2,
  JourneyTask,
} from "./types.ts";

function plan(patch: Partial<JourneyPlanV2> = {}): JourneyPlanV2 {
  return {
    schemaVersion: 2,
    title: "",
    startDate: "",
    durationDays: null,
    reviewDate: "",
    motivation: "",
    patientValues: "",
    objective: "",
    priorities: [],
    modules: [],
    tasks: [],
    exams: [],
    appointments: [],
    legacy: {
      motivation: "",
      workOn: "",
      focus: "",
      medication: { enabled: false, hasInjection: false, symptoms: [] },
      movement: { enabled: false, aerobic: [], strength: [] },
      sleep: { enabled: false, mode: "general" },
      spirituality: { enabled: false },
      food: { enabled: false },
      social: { enabled: false },
    },
    ...patch,
  };
}

function task(id: string, visibleToPatient = true): JourneyTask {
  return {
    id,
    title: id,
    description: "",
    category: "other",
    responsible: "patient",
    dueDate: "",
    priority: "normal",
    visibleToPatient,
  };
}

function exam(id: string, visibleToPatient = true): JourneyExam {
  return {
    id,
    title: id,
    instructions: "",
    requestedDate: "",
    dueDate: "",
    visibleToPatient,
  };
}

function progress(
  actionType: "task" | "exam",
  actionId: string,
  status: JourneyActionProgress["status"],
): JourneyActionProgress {
  return {
    actionType,
    actionId,
    status,
    scheduledDate: "",
    note: "",
    completedAt: status === "completed" ? "2026-09-04T10:00:00Z" : null,
    updatedAt: "2026-09-04T10:00:00Z",
  };
}

describe("journey care actions", () => {
  it("finds progress by action identity", () => {
    const items = [progress("exam", "x", "scheduled")];
    assert.equal(actionProgressFor(items, "exam", "x")?.status, "scheduled");
    assert.equal(actionProgressFor(items, "task", "x"), undefined);
  });

  it("treats only completed progress as completed", () => {
    assert.equal(actionIsCompleted([progress("task", "t1", "completed")], "task", "t1"), true);
    assert.equal(actionIsCompleted([progress("task", "t1", "pending")], "task", "t1"), false);
  });

  it("counts visible open tasks and exams from the published plan", () => {
    const currentPlan = plan({
      tasks: [task("t1"), task("hidden", false)],
      exams: [exam("e1"), exam("e2")],
    });
    const items = [progress("exam", "e1", "completed")];
    assert.equal(openCareActionCount(currentPlan, items), 2);
  });

  it("uses an explicit appointment date when present", () => {
    const currentPlan = plan({ startDate: "2026-09-10" });
    const appointment: JourneyAppointment = {
      id: "a1",
      type: "doctor",
      professional: "",
      date: "2026-10-20",
      offsetDays: 30,
      mode: "in_person",
      notes: "",
      status: "scheduled",
      visibleToPatient: true,
    };
    assert.equal(resolvedAppointmentDate(currentPlan, appointment), "2026-10-20");
  });

  it("resolves an appointment offset from the journey start date", () => {
    const currentPlan = plan({ startDate: "2026-09-10" });
    const appointment: JourneyAppointment = {
      id: "a2",
      type: "doctor",
      professional: "",
      date: "",
      offsetDays: 30,
      mode: "unspecified",
      notes: "",
      status: "planned",
      visibleToPatient: true,
    };
    assert.equal(resolvedAppointmentDate(currentPlan, appointment), "2026-10-10");
  });

  it("keeps undated appointments unresolved without a journey start", () => {
    const currentPlan = plan();
    const appointment: JourneyAppointment = {
      id: "a3",
      type: "nutrition",
      professional: "",
      date: "",
      offsetDays: 30,
      mode: "unspecified",
      notes: "",
      status: "planned",
      visibleToPatient: true,
    };
    assert.equal(resolvedAppointmentDate(currentPlan, appointment), "");
  });
});
