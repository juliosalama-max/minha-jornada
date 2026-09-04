import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPreConsultSummary } from "./pre-consult-summary.ts";
import type {
  DoctorAlert,
  JourneyActionProgress,
  JourneyModuleResponse,
  JourneyPlanV2,
} from "./types.ts";

function basePlan(): JourneyPlanV2 {
  return {
    schemaVersion: 2,
    title: "Ciclo",
    startDate: "2026-08-01",
    durationDays: 180,
    reviewDate: "",
    motivation: "",
    patientValues: "",
    objective: "",
    priorities: [],
    modules: [
      {
        id: "sleep",
        type: "sleep",
        title: "Sono",
        enabled: true,
        instructions: "",
        frequency: { kind: "daily" },
        startDate: "",
        endDate: "",
        reviewDate: "",
        required: false,
        questions: [
          {
            id: "hours",
            label: "Horas de sono",
            type: "number",
            required: false,
          },
          {
            id: "ok",
            label: "Sono satisfatório?",
            type: "boolean",
            required: false,
          },
        ],
      },
    ],
    tasks: [
      {
        id: "task-1",
        title: "Tarefa",
        description: "",
        category: "other",
        responsible: "patient",
        dueDate: "",
        priority: "normal",
        visibleToPatient: true,
      },
    ],
    exams: [],
    appointments: [
      {
        id: "a1",
        type: "doctor",
        professional: "Consulta médica",
        date: "2026-09-20",
        offsetDays: null,
        mode: "in_person",
        notes: "",
        status: "scheduled",
        visibleToPatient: true,
      },
    ],
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
  };
}

function response(
  id: string,
  occurredOn: string,
  hours: number,
  ok: boolean,
): JourneyModuleResponse {
  return {
    id,
    moduleId: "sleep",
    occurredOn,
    answers: { hours, ok },
    createdAt: `${occurredOn}T12:00:00Z`,
    updatedAt: `${occurredOn}T12:00:00Z`,
  };
}

describe("pre-consult summary", () => {
  it("summarizes only responses inside the selected period", () => {
    const summary = buildPreConsultSummary({
      plan: basePlan(),
      responses: [
        response("r1", "2026-09-03", 6, false),
        response("r2", "2026-09-04", 8, true),
        response("old", "2026-07-01", 4, false),
      ],
      progress: [],
      alerts: [],
      days: 30,
      now: new Date(2026, 8, 4, 12, 0, 0),
    });

    assert.equal(summary.totalResponses, 2);
    assert.equal(summary.daysWithResponses, 2);
    assert.equal(summary.modulesWithResponses, 1);
    assert.match(summary.moduleSummaries[0]!.highlights[0]!.value, /média 7/);
  });

  it("includes open actions, upcoming appointments and alerts in period", () => {
    const alerts: DoctorAlert[] = [
      {
        id: "al1",
        journeyId: "j1",
        patientName: "Paciente",
        moduleTitle: "Sono",
        title: "Revisar",
        severity: "attention",
        occurredOn: "2026-09-03",
        createdAt: "2026-09-03T12:00:00Z",
        read: false,
      },
    ];
    const progress: JourneyActionProgress[] = [];

    const summary = buildPreConsultSummary({
      plan: basePlan(),
      responses: [],
      progress,
      alerts,
      days: 30,
      now: new Date(2026, 8, 4, 12, 0, 0),
    });

    assert.equal(summary.openCareActions, 1);
    assert.equal(summary.alertsInPeriod, 1);
    assert.deepEqual(summary.upcomingAppointments, [
      { id: "a1", label: "Consulta médica", date: "2026-09-20" },
    ]);
  });
});
