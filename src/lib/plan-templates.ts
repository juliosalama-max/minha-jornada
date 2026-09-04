import type { PlanConfig } from "./types";

export function emptyPlan(): PlanConfig {
  return {
    motivation: "",
    workOn: "",
    focus: "",
    medication: {
      enabled: false,
      hasInjection: false,
      symptoms: [],
    },
    movement: {
      enabled: false,
      aerobic: [],
      strength: [],
    },
    sleep: {
      enabled: false,
      mode: "general",
    },
    spirituality: { enabled: false },
    food: { enabled: false },
    social: { enabled: false },
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
  const hasLegacyModules = modules.length > 0;

  return {
    motivation: String(raw.motivation ?? ""),
    workOn: String(raw.workOn ?? ""),
    focus: String(raw.focus ?? ""),
    medication: raw.medication ?? {
      enabled: hasLegacyModules && modules.includes("meds"),
      hasInjection: hasLegacyModules && modules.includes("meds"),
      symptoms: [],
    },
    movement: raw.movement ?? {
      enabled: hasLegacyModules && modules.some((m) => ["walk", "gym", "run"].includes(m)),
      aerobic: [
        ...(modules.includes("walk") ? (["walk"] as const) : []),
        ...(modules.includes("run") ? (["run"] as const) : []),
      ],
      strength: modules.includes("gym") ? ["gym"] : [],
    },
    sleep: raw.sleep ?? {
      enabled: hasLegacyModules && modules.includes("sleep"),
      mode: "general",
    },
    spirituality: raw.spirituality ?? { enabled: false },
    food: raw.food ?? {
      enabled: hasLegacyModules && modules.includes("meals"),
    },
    social: raw.social ?? { enabled: false },
  };
}
