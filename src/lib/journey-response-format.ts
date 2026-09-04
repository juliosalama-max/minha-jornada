import type {
  JourneyAnswerValue,
  JourneyModule,
  JourneyModuleResponse,
  JourneyQuestion,
} from "./types";

export function questionFor(
  module: JourneyModule,
  questionId: string,
): JourneyQuestion | undefined {
  return module.questions.find((question) => question.id === questionId);
}

export function formatJourneyAnswer(
  question: JourneyQuestion,
  value: JourneyAnswerValue,
): string {
  if (value === null) return "—";

  if (question.type === "boolean" || question.type === "event") {
    return value === true ? "Sim" : value === false ? "Não" : String(value);
  }

  if (
    question.type === "single_choice" ||
    question.type === "emotion"
  ) {
    if (typeof value !== "string") return String(value);
    return question.options?.find((option) => option.id === value)?.label ?? value;
  }

  if (question.type === "multiple_choice") {
    if (!Array.isArray(value)) return String(value);
    return value
      .map(
        (item) =>
          question.options?.find((option) => option.id === item)?.label ?? item,
      )
      .join(", ");
  }

  if (question.type === "duration") {
    return typeof value === "number" ? `${value} min` : String(value);
  }

  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export function responseEntries(
  module: JourneyModule,
  response: JourneyModuleResponse,
): Array<{ question: JourneyQuestion; value: JourneyAnswerValue; formatted: string }> {
  const entries: Array<{
    question: JourneyQuestion;
    value: JourneyAnswerValue;
    formatted: string;
  }> = [];

  for (const question of module.questions) {
    const value = response.answers[question.id];
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    entries.push({
      question,
      value,
      formatted: formatJourneyAnswer(question, value),
    });
  }

  return entries;
}

export function moduleResponseCount(
  module: JourneyModule,
  responses: JourneyModuleResponse[],
): number {
  return responses.filter((response) => response.moduleId === module.id).length;
}
