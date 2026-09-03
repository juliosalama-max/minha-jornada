import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  completedModulesForDate,
  dueModulesForDate,
  eventModules,
  isLegacyGeneratedJourney,
  moduleIsDue,
  responseMatchesPeriod,
} from "./journey-schedule.ts";
import type { JourneyModule, JourneyModuleResponse } from "./types.ts";

function module(
  id: string,
  kind: JourneyModule["frequency"]["kind"],
  patch: Partial<JourneyModule> = {},
): JourneyModule {
  return {
    id,
    type: "custom",
    title: id,
    enabled: true,
    instructions: "",
    frequency: { kind },
    startDate: "",
    endDate: "",
    reviewDate: "",
    required: false,
    questions: [],
    ...patch,
  };
}

function response(
  id: string,
  moduleId: string,
  occurredOn: string,
): JourneyModuleResponse {
  return {
    id,
    moduleId,
    occurredOn,
    answers: {},
    createdAt: `${occurredOn}T12:00:00Z`,
    updatedAt: `${occurredOn}T12:00:00Z`,
  };
}

describe("journey schedule", () => {
  const thursday = new Date(2026, 8, 3, 23, 30, 0);

  it("keeps daily matching on the local calendar date", () => {
    const daily = module("daily", "daily");
    const done = response("r1", "daily", "2026-09-03");
    assert.equal(responseMatchesPeriod(daily, done, thursday), true);
    assert.equal(moduleIsDue(daily, thursday, [done]), false);
  });

  it("shows selected-day modules only on configured weekdays", () => {
    const selected = module("selected", "selected_days", {
      frequency: { kind: "selected_days", daysOfWeek: [4] },
    });
    assert.equal(moduleIsDue(selected, thursday, []), true);
    const friday = new Date(2026, 8, 4, 12, 0, 0);
    assert.equal(moduleIsDue(selected, friday, []), false);
  });

  it("weekly modules remain due until one response exists in that week", () => {
    const weekly = module("weekly", "weekly");
    assert.equal(moduleIsDue(weekly, thursday, []), true);
    const mondayResponse = response("r2", "weekly", "2026-08-31");
    assert.equal(moduleIsDue(weekly, thursday, [mondayResponse]), false);
  });

  it("monthly modules complete for the current month only", () => {
    const monthly = module("monthly", "monthly");
    const september = response("r3", "monthly", "2026-09-01");
    assert.equal(moduleIsDue(monthly, thursday, [september]), false);
    const october = new Date(2026, 9, 1, 12, 0, 0);
    assert.equal(moduleIsDue(monthly, october, [september]), true);
  });

  it("event-based modules are never due but remain available as events", () => {
    const event = module("event", "event_based");
    assert.equal(moduleIsDue(event, thursday, []), false);
    assert.deepEqual(eventModules([event], thursday).map((item) => item.id), ["event"]);
  });

  it("one-time modules disappear after completion and do not clutter later days", () => {
    const once = module("once", "one_time");
    assert.equal(moduleIsDue(once, thursday, []), true);
    const done = response("r4", "once", "2026-09-03");
    assert.equal(moduleIsDue(once, thursday, [done]), false);
    assert.deepEqual(completedModulesForDate([once], thursday, [done]).map((item) => item.id), ["once"]);
    const friday = new Date(2026, 8, 4, 12, 0, 0);
    assert.deepEqual(completedModulesForDate([once], friday, [done]), []);
  });

  it("returns due and completed module groups for Today", () => {
    const dailyA = module("a", "daily");
    const dailyB = module("b", "daily");
    const done = response("r5", "b", "2026-09-03");
    assert.deepEqual(dueModulesForDate([dailyA, dailyB], thursday, [done]).map((item) => item.id), ["a"]);
    assert.deepEqual(completedModulesForDate([dailyA, dailyB], thursday, [done]).map((item) => item.id), ["b"]);
  });

  it("detects migrated legacy-only journeys", () => {
    assert.equal(
      isLegacyGeneratedJourney([
        module("legacy-food", "daily"),
        module("legacy-sleep", "daily"),
      ]),
      true,
    );
    assert.equal(
      isLegacyGeneratedJourney([
        module("legacy-food", "daily"),
        module("custom-new", "daily"),
      ]),
      false,
    );
    assert.equal(isLegacyGeneratedJourney([]), false);
  });
});
