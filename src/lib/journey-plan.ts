import { emptyPlan, normalizePlan } from "./plan-templates";
import type {
  JourneyFrequency,
  JourneyModule,
  JourneyModuleType,
  JourneyPlanV2,
  JourneyPriority,
  JourneyQuestion,
  PlanConfig,
} from "./types";

export const JOURNEY_MODULE_LABELS: Record<JourneyModuleType, string> = {
  medication: "Medicação",
  food: "Alimentação",
  movement: "Movimento",
  sleep: "Sono",
  cpap: "CPAP",
  symptoms: "Sintomas",
  eating_behavior: "Comportamento alimentar",
  stress: "Estresse e regulação emocional",
  social: "Conexões sociais",
  spirituality: "Espiritualidade, valores e propósito",
  questionnaire: "Questionário",
  custom: "Campo personalizado",
};

export const JOURNEY_FREQUENCY_LABELS: Record<JourneyFrequency["kind"], string> = {
  daily: "Diariamente",
  weekly: "Semanalmente",
  selected_days: "Dias selecionados",
  monthly: "Mensalmente",
  event_based: "Somente quando acontecer",
  one_time: "Uma única vez",
};

export function emptyJourneyPlan(): JourneyPlanV2 {
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
    legacy: emptyPlan(),
  };
}

function normalizePriority(raw: Partial<JourneyPriority>, index: number): JourneyPriority {
  return {
    id: String(raw.id || `priority-${index + 1}`),
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    tracking: String(raw.tracking ?? ""),
    reviewDate: String(raw.reviewDate ?? ""),
  };
}

function normalizeQuestion(raw: Partial<JourneyQuestion>, index: number): JourneyQuestion {
  return {
    id: String(raw.id || `question-${index + 1}`),
    label: String(raw.label ?? ""),
    type: raw.type ?? "short_text",
    required: Boolean(raw.required),
    options: raw.options?.map((option, optionIndex) => ({
      id: String(option.id || `option-${optionIndex + 1}`),
      label: String(option.label ?? ""),
    })),
    min: raw.min,
    max: raw.max,
    step: raw.step,
    condition: raw.condition,
  };
}

function normalizeModule(raw: Partial<JourneyModule>, index: number): JourneyModule {
  const type = raw.type ?? "custom";
  return {
    id: String(raw.id || `module-${index + 1}`),
    type,
    title: String(raw.title || JOURNEY_MODULE_LABELS[type]),
    enabled: raw.enabled !== false,
    instructions: String(raw.instructions ?? ""),
    frequency: {
      kind: raw.frequency?.kind ?? "daily",
      daysOfWeek: raw.frequency?.daysOfWeek?.filter(
        (day) => Number.isInteger(day) && day >= 0 && day <= 6,
      ),
      timesPerWeek:
        raw.frequency?.timesPerWeek == null
          ? undefined
          : Math.max(1, Math.min(7, Number(raw.frequency.timesPerWeek))),
    },
    startDate: String(raw.startDate ?? ""),
    endDate: String(raw.endDate ?? ""),
    reviewDate: String(raw.reviewDate ?? ""),
    required: Boolean(raw.required),
    questions: (raw.questions ?? []).map(normalizeQuestion),
  };
}

export function legacyModulesFromPlan(plan: PlanConfig): JourneyModule[] {
  const modules: JourneyModule[] = [];
  const add = (
    type: JourneyModuleType,
    title: string,
    frequency: JourneyFrequency = { kind: "daily" },
  ) => {
    modules.push({
      id: `legacy-${type}`,
      type,
      title,
      enabled: true,
      instructions: "",
      frequency,
      startDate: "",
      endDate: "",
      reviewDate: "",
      required: false,
      questions: [],
    });
  };

  if (plan.medication.enabled) {
    add("medication", "Medicação");
    if (plan.medication.symptoms.some((code) => code !== "S")) {
      add("symptoms", "Sintomas");
    }
  }
  if (plan.movement.enabled) add("movement", "Movimento");
  if (plan.sleep.enabled) {
    add(plan.sleep.mode === "cpap" ? "cpap" : "sleep", plan.sleep.mode === "cpap" ? "CPAP" : "Sono");
  }
  if (plan.food.enabled) add("food", "Alimentação");
  if (plan.social.enabled) add("social", "Conexões sociais", { kind: "weekly" });
  if (plan.spirituality.enabled) add("spirituality", "Espiritualidade, valores e propósito");

  return modules;
}

export function normalizeJourneyPlan(raw: unknown): JourneyPlanV2 {
  const base = emptyJourneyPlan();
  if (!raw || typeof raw !== "object") return base;

  const candidate = raw as Partial<JourneyPlanV2> & Partial<PlanConfig>;
  if (candidate.schemaVersion !== 2) {
    const legacy = normalizePlan(candidate as Partial<PlanConfig>);
    return {
      ...base,
      motivation: legacy.motivation,
      objective: legacy.workOn,
      legacy,
      modules: legacyModulesFromPlan(legacy),
    };
  }

  const legacy = normalizePlan(candidate.legacy);
  return {
    schemaVersion: 2,
    title: String(candidate.title ?? ""),
    startDate: String(candidate.startDate ?? ""),
    durationDays:
      candidate.durationDays == null
        ? null
        : Math.max(1, Math.min(3650, Number(candidate.durationDays))),
    reviewDate: String(candidate.reviewDate ?? ""),
    motivation: String(candidate.motivation ?? ""),
    patientValues: String(candidate.patientValues ?? ""),
    objective: String(candidate.objective ?? ""),
    priorities: (candidate.priorities ?? []).slice(0, 3).map(normalizePriority),
    modules: (candidate.modules ?? []).map(normalizeModule),
    legacy,
  };
}

export function withLegacyPlan(
  journeyPlan: JourneyPlanV2,
  legacy: PlanConfig,
): JourneyPlanV2 {
  return {
    ...journeyPlan,
    motivation: legacy.motivation,
    objective: journeyPlan.objective || legacy.workOn,
    legacy: normalizePlan(legacy),
  };
}
