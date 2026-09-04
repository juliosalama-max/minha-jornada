import type {
  JourneyAlertRule,
  JourneyAnswerValue,
  JourneyModule,
} from "./types";

export function alertRuleMatches(
  rule: JourneyAlertRule,
  answers: Record<string, JourneyAnswerValue>,
): boolean {
  const current = answers[rule.questionId];
  if (current === undefined || current === null) return false;

  if (rule.operator === "equals") return current === rule.value;
  if (rule.operator === "not_equals") return current !== rule.value;

  if (rule.operator === "includes") {
    if (Array.isArray(current)) return current.includes(String(rule.value));
    if (typeof current === "string") return current.includes(String(rule.value));
    return false;
  }

  if (rule.operator === "gte") {
    return (
      typeof current === "number" &&
      typeof rule.value === "number" &&
      current >= rule.value
    );
  }

  if (rule.operator === "lte") {
    return (
      typeof current === "number" &&
      typeof rule.value === "number" &&
      current <= rule.value
    );
  }

  return false;
}

export function matchingAlertRules(
  module: JourneyModule,
  answers: Record<string, JourneyAnswerValue>,
): JourneyAlertRule[] {
  return (module.alerts ?? []).filter(
    (rule) => rule.title.trim() && alertRuleMatches(rule, answers),
  );
}
