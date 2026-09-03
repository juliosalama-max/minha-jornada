import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatJourneyAnswer,
  responseEntries,
} from "./journey-response-format.ts";
import type {
  JourneyModule,
  JourneyModuleResponse,
  JourneyQuestion,
} from "./types.ts";

function question(
  id: string,
  type: JourneyQuestion["type"],
  patch: Partial<JourneyQuestion> = {},
): JourneyQuestion {
  return {
    id,
    label: id,
    type,
    required: false,
    ...patch,
  };
}

function moduleWith(questions: JourneyQuestion[]): JourneyModule {
  return {
    id: "module-1",
    type: "custom",
    title: "Teste",
    enabled: true,
    instructions: "",
    frequency: { kind: "daily" },
    startDate: "",
    endDate: "",
    reviewDate: "",
    required: false,
    questions,
  };
}

describe("journey response formatting", () => {
  it("formats booleans in patient-facing language", () => {
    const q = question("q", "boolean");
    assert.equal(formatJourneyAnswer(q, true), "Sim");
    assert.equal(formatJourneyAnswer(q, false), "Não");
  });

  it("maps stored option ids back to labels", () => {
    const q = question("q", "single_choice", {
      options: [
        { id: "none", label: "Nenhuma" },
        { id: "some", label: "1–3 vezes" },
      ],
    });
    assert.equal(formatJourneyAnswer(q, "some"), "1–3 vezes");
  });

  it("maps multiple choice ids and duration values", () => {
    const multi = question("multi", "multiple_choice", {
      options: [
        { id: "a", label: "Ansiedade" },
        { id: "b", label: "Cansaço" },
      ],
    });
    assert.equal(
      formatJourneyAnswer(multi, ["a", "b"]),
      "Ansiedade, Cansaço",
    );
    assert.equal(formatJourneyAnswer(question("duration", "duration"), 30), "30 min");
  });

  it("returns only answered questions in configured order", () => {
    const q1 = question("q1", "short_text", { label: "Contexto" });
    const q2 = question("q2", "boolean", { label: "Perda de controle" });
    const q3 = question("q3", "short_text", { label: "Vazio" });
    const module = moduleWith([q1, q2, q3]);
    const response: JourneyModuleResponse = {
      id: "r1",
      moduleId: module.id,
      occurredOn: "2026-09-03",
      answers: {
        q1: "Depois do trabalho",
        q2: false,
        q3: "",
      },
      createdAt: "2026-09-03T20:00:00Z",
      updatedAt: "2026-09-03T20:00:00Z",
    };

    assert.deepEqual(
      responseEntries(module, response).map(({ question, formatted }) => [
        question.label,
        formatted,
      ]),
      [
        ["Contexto", "Depois do trabalho"],
        ["Perda de controle", "Não"],
      ],
    );
  });
});
