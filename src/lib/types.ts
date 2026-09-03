export type SymptomCode = "S" | "N" | "V" | "C" | "D" | "DA" | "O";

export type SymptomEntry = {
  code: SymptomCode;
  intensity: number;
};

export type MealsStatus = "ok" | "fast" | "improv";

export type AerobicKind = "walk" | "swim" | "run" | "bike" | "dance";
export type StrengthKind = "gym" | "pilates";
export type SleepMode = "cpap" | "general";
export type SocialStatus = "support" | "present" | "lonely";

export type DayLog = {
  applied?: boolean;
  symptoms?: SymptomEntry[];
  otherNote?: string;
  aerobic?: Partial<Record<AerobicKind, number>>;
  walkMinutes?: number;
  gym?: boolean;
  gymNote?: string;
  strength?: Partial<Record<StrengthKind, boolean>>;
  strengthNote?: string;
  cpapHours?: number;
  cpapFullNight?: boolean;
  sleepHours?: number;
  sleepSatisfied?: boolean;
  prayer?: boolean;
  nature?: boolean;
  contemplation?: boolean;
  meditation?: boolean;
  meals?: MealsStatus;
  social?: SocialStatus;
};

export type Profile = {
  name: string;
  firstConsultDate: string;
  injectionWeekday: number | null;
  dose: string;
};

export type MedicalConsult = {
  stage: number;
  period: string;
  focus: string;
  date: string;
};

export type NutritionConsult = {
  index: number;
  date: string;
};

export type TaskMeta = Record<string, string>;

export type TaskCategory =
  | "agenda"
  | "exames"
  | "docs"
  | "meds"
  | "move"
  | "sleep"
  | "food"
  | "other";

export type Task = {
  id: string;
  category: TaskCategory;
  title: string;
  done: boolean;
  meta?: TaskMeta;
};

export type PlanConfig = {
  motivation: string;
  workOn: string;
  focus: string;
  medication: {
    enabled: boolean;
    hasInjection: boolean;
    symptoms: SymptomCode[];
  };
  movement: {
    enabled: boolean;
    aerobic: AerobicKind[];
    strength: StrengthKind[];
  };
  sleep: {
    enabled: boolean;
    mode: SleepMode;
  };
  spirituality: { enabled: boolean };
  food: { enabled: boolean };
  social: { enabled: boolean };
};

export type MonthNotes = {
  worstSymptom?: string;
  walkFeeling?: string;
  gymBreathlessness?: string;
  gymDifficulty?: string;
  cpapDifficulty?: string;
  mealHardest?: string;
};

export type JournalSnapshot = {
  onboarded: boolean;
  profile: Profile;
  consults: MedicalConsult[];
  nutrition: NutritionConsult[];
  tasks: Task[];
  days: Record<string, DayLog>;
  monthNotes: Record<string, MonthNotes>;
  plan: PlanConfig;
};

export type Role = "patient" | "doctor";

export type PatientSummary = {
  id: string;
  name: string;
  inviteCode: string;
  onboarded: boolean;
  pending: boolean;
};

export type DoctorNotice = {
  id: string;
  journeyId: string;
  patientName: string;
  summary: string;
  createdAt: string;
  read: boolean;
};
