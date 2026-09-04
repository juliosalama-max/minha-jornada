import { addDays, format, parseISO, subDays } from "date-fns";
import type {
  DoctorAlert,
  JourneyActionProgress,
  JourneyModule,
  JourneyModuleResponse,
  JourneyPlanV2,
  JourneyQuestion,
} from "./types";

export type PreConsultHighlight = {
  label: string;
  value: string;
};

export type PreConsultModuleSummary = {
  moduleId: string;
  title: string;
  responseCount: number;
  daysWithResponses: number;
  lastResponseOn: string;
  highlights: PreConsultHighlight[];
};

export type PreConsultSummary = {
  days: number;
  periodStart: string;
  totalResponses: number;
  daysWithResponses: number;
  modulesWithResponses: number;
  openCareActions: number;
  alertsInPeriod: number;
  moduleSummaries: PreConsultModuleSummary[];
  upcomingAppointments: Array<{
    id: string;
    label: string;
    date: string;
  }>;
};

export function buildPreConsultSummary({
  plan,
  responses,
  progress,
  alerts,
  days,
  now = new Date(),
}: {
  plan: JourneyPlanV2;
  responses: JourneyModuleResponse[];
  progress: JourneyActionProgress[];
  alerts: DoctorAlert[];
  days: number;
  now?: Date;
}): PreConsultSummary {
  const start = subDays(now, Math.max(1, days) - 1);
  start.setHours(0, 0, 0, 0);
  const startKey = format(start, "yyyy-MM-dd");
  const todayKey = format(now, "yyyy-MM-dd");

  const recentResponses = responses.filter(
    (response) => response.occurredOn >= startKey && response.occurredOn <= todayKey,
  );

  const moduleSummaries = plan.modules
    .filter((module) => module.enabled)
    .map((module) => summarizeModule(module, recentResponses))
    .filter((summary) => summary.responseCount > 0);

  const upcomingAppointments = plan.appointments
    .filter(
      (appointment) =>
        appointment.status !== "cancelled" &&
        appointment.status !== "completed",
    )
    .map((appointment) => ({
      appointment,
      date: resolvedAppointmentDateForSummary(plan, appointment),
    }))
    .filter((item) => item.date && item.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
    .map(({ appointment, date }) => ({
      id: appointment.id,
      label:
        appointment.professional ||
        appointmentLabel(appointment.type),
      date,
    }));

  return {
    days,
    periodStart: startKey,
    totalResponses: recentResponses.length,
    daysWithResponses: new Set(recentResponses.map((response) => response.occurredOn)).size,
    modulesWithResponses: moduleSummaries.length,
    openCareActions: openCareActionCountForSummary(plan, progress),
    alertsInPeriod: alerts.filter(
      (alert) => alert.occurredOn >= startKey && alert.occurredOn <= todayKey,
    ).length,
    moduleSummaries,
    upcomingAppointments,
  };
}

function summarizeModule(
  module: JourneyModule,
  responses: JourneyModuleResponse[],
): PreConsultModuleSummary {
  const moduleResponses = responses
    .filter((response) => response.moduleId === module.id)
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn));

  return {
    moduleId: module.id,
    title: module.title,
    responseCount: moduleResponses.length,
    daysWithResponses: new Set(moduleResponses.map((response) => response.occurredOn)).size,
    lastResponseOn: moduleResponses[0]?.occurredOn ?? "",
    highlights: module.questions
      .map((question) => summarizeQuestion(question, moduleResponses))
      .filter((item): item is PreConsultHighlight => Boolean(item))
      .slice(0, 5),
  };
}

function summarizeQuestion(
  question: JourneyQuestion,
  responses: JourneyModuleResponse[],
): PreConsultHighlight | null {
  const values = responses
    .map((response) => ({
      response,
      value: response.answers[question.id],
    }))
    .filter(
      ({ value }) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0),
    );

  if (!values.length) return null;

  if (
    question.type === "scale" ||
    question.type === "number" ||
    question.type === "duration"
  ) {
    const numbers = values
      .map(({ value }) => (typeof value === "number" ? value : Number.NaN))
      .filter(Number.isFinite);
    if (!numbers.length) return null;
    const average = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
    const suffix = question.type === "duration" ? " min" : "";
    return {
      label: question.label,
      value: `média ${formatNumber(average)}${suffix} · faixa ${formatNumber(
        Math.min(...numbers),
      )}–${formatNumber(Math.max(...numbers))}${suffix}`,
    };
  }

  if (question.type === "boolean" || question.type === "event") {
    const yes = values.filter(({ value }) => value === true).length;
    const no = values.filter(({ value }) => value === false).length;
    return {
      label: question.label,
      value: `Sim ${yes} · Não ${no}`,
    };
  }

  if (question.type === "single_choice" || question.type === "emotion") {
    const counts = new Map<string, number>();
    for (const { value } of values) {
      if (typeof value !== "string") continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!top) return null;
    const label =
      question.options?.find((option) => option.id === top[0])?.label ?? top[0];
    return {
      label: question.label,
      value: `${label} · ${top[1]} de ${values.length}`,
    };
  }

  if (question.type === "multiple_choice") {
    const counts = new Map<string, number>();
    for (const { value } of values) {
      if (!Array.isArray(value)) continue;
      for (const item of value) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
      }
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!top) return null;
    const label =
      question.options?.find((option) => option.id === top[0])?.label ?? top[0];
    return {
      label: question.label,
      value: `${label} · ${top[1]} registros`,
    };
  }

  const latest = values
    .sort((a, b) => b.response.occurredOn.localeCompare(a.response.occurredOn))[0];
  if (!latest) return null;
  const formatted = formatAnswerForSummary(question, latest.value);
  return {
    label: question.label,
    value: formatted.length > 180 ? `${formatted.slice(0, 177)}…` : formatted,
  };
}

function openCareActionCountForSummary(
  plan: JourneyPlanV2,
  progress: JourneyActionProgress[],
): number {
  const completed = new Set(
    progress
      .filter((item) => item.status === "completed")
      .map((item) => `${item.actionType}:${item.actionId}`),
  );
  const tasks = plan.tasks.filter(
    (task) => !completed.has(`task:${task.id}`),
  ).length;
  const exams = plan.exams.filter(
    (exam) => !completed.has(`exam:${exam.id}`),
  ).length;
  return tasks + exams;
}

function resolvedAppointmentDateForSummary(
  plan: JourneyPlanV2,
  appointment: JourneyPlanV2["appointments"][number],
): string {
  if (appointment.date) return appointment.date;
  if (plan.startDate && appointment.offsetDays != null) {
    return format(
      addDays(parseISO(plan.startDate), appointment.offsetDays),
      "yyyy-MM-dd",
    );
  }
  return "";
}

function formatAnswerForSummary(
  question: JourneyQuestion,
  value: JourneyModuleResponse["answers"][string],
): string {
  if (value === null || value === undefined) return "—";
  if (question.type === "boolean" || question.type === "event") {
    return value === true ? "Sim" : value === false ? "Não" : String(value);
  }
  if (question.type === "single_choice" || question.type === "emotion") {
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

function appointmentLabel(
  type: JourneyPlanV2["appointments"][number]["type"],
): string {
  if (type === "doctor") return "Consulta médica";
  if (type === "nutrition") return "Nutricionista";
  if (type === "psychology") return "Psicologia";
  if (type === "nursing") return "Enfermagem";
  return "Outro encontro";
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}
