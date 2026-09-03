import { CARE_FOCUS, SYMPTOMS } from "./constants";
import type { PlanConfig, SymptomCode } from "./types";

const ALL_SYMPTOMS = SYMPTOMS.map((s) => s.code) as SymptomCode[];

export function emptyPlan(): PlanConfig {
  return {
    motivation: "",
    workOn: "",
    focus: CARE_FOCUS,
    medication: {
      enabled: true,
      hasInjection: true,
      symptoms: ALL_SYMPTOMS,
    },
    movement: {
      enabled: true,
      aerobic: ["walk"],
      strength: ["gym"],
    },
    sleep: {
      enabled: true,
      mode: "general",
    },
    spirituality: { enabled: true },
    food: { enabled: true },
    social: { enabled: true },
  };
}

export function normalizePlan(raw: Partial<PlanConfig> | null | undefined): PlanConfig {
  const base = emptyPlan();
  if (!raw) return base;
  const legacy = raw as Partial<PlanConfig> & {
    checkin?: string;
    modules?: string[];
    included?: string[];
  };
  const modules = legacy.modules ?? [];
  const hasLegacy = !raw.medication && modules.length > 0;
  return {
    motivation: String(raw.motivation ?? ""),
    workOn: String(raw.workOn ?? ""),
    focus: raw.focus?.trim() ? raw.focus : base.focus,
    medication: raw.medication ?? {
      enabled: !hasLegacy || modules.includes("meds"),
      hasInjection: true,
      symptoms: ALL_SYMPTOMS,
    },
    movement: raw.movement ?? {
      enabled: !hasLegacy || modules.some((m) => ["walk", "gym", "run"].includes(m)),
      aerobic: modules.includes("run") ? ["walk", "run"] : ["walk"],
      strength: ["gym"],
    },
    sleep: raw.sleep ?? {
      enabled: !hasLegacy || modules.includes("sleep"),
      mode: "general",
    },
    spirituality: raw.spirituality ?? { enabled: true },
    food: raw.food ?? {
      enabled: !hasLegacy || modules.includes("meals"),
    },
    social: raw.social ?? { enabled: true },
  };
}
