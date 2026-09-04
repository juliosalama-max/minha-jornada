import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alertRuleMatches,
  matchingAlertRules,
} from "./journey-alerts.ts";
import type { JourneyAlertRule, JourneyModule } from "./types.ts";

function rule(
  operator: JourneyAlertRule["operator"],
  value: JourneyAlertRule["value"],
): JourneyAlertRule {
  return {
    id: "r1",
    questionId: "q1",
    operator,
    value,
    title: "Revisar resposta",
    severity: "attention",
  };
}

function moduleWith(alerts: JourneyAlertRule[]): JourneyModule {
  return {
    id: "m1",
    type: "custom",
    title: "Módulo",
    enabled: true,
    instructions: "",
    frequency: { kind: "daily" },
    startDate: "",
    endDate: "",
    reviewDate: "",
    required: false,
    questions: [],
    alerts,
  };
}

describe("journey alerts", () => {
  it("matches equality and inequality", () => {
    assert.equal(alertRuleMatches(rule("equals", true), { q1: true }), true);
    assert.equal(alertRuleMatches(rule("equals", true), { q1: false }), false);
    assert.equal(alertRuleMatches(rule("not_equals", "none"), { q1: "some" }), true);
  });

  it("matches inclusion for arrays and text", () => {
    assert.equal(
      alertRuleMatches(rule("includes", "anxiety"), {
        q1: ["tired", "anxiety"],
      }),
      true,
    );
    assert.equal(
      alertRuleMatches(rule("includes", "late"), {
        q1: "late afternoon",
      }),
      true,
    );
  });

  it("matches numeric thresholds only for numeric values", () => {
    assert.equal(alertRuleMatches(rule("gte", 7), { q1: 8 }), true);
    assert.equal(alertRuleMatches(rule("lte", 3), { q1: 2 }), true);
    assert.equal(alertRuleMatches(rule("gte", 7), { q1: "8" }), false);
  });

  it("returns only matching rules with a visible title", () => {
    const visible = rule("equals", "yes");
    const hidden = { ...rule("equals", "yes"), id: "r2", title: "" };
    const noMatch = { ...rule("equals", "no"), id: "r3" };
    assert.deepEqual(
      matchingAlertRules(moduleWith([visible, hidden, noMatch]), { q1: "yes" }).map(
        (item) => item.id,
      ),
      ["r1"],
    );
  });
});
