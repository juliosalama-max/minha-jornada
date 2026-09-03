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

export type JourneyStatus =
  | "draft"
  | "published"
  | "in_review"
  | "completed"
  | "archived";

export type JourneyFrequencyKind =
  | "daily"
  | "weekly"
  | "selected_days"
  | "monthly"
  | "event_based"
  | "one_time";

export type JourneyFrequency = {
  kind: JourneyFrequencyKind;
  daysOfWeek?: number[];
  timesPerWeek?: number;
};

export type JourneyQuestionType =
  | "boolean"
  | "single_choice"
  | "multiple_choice"
  | "scale"
  | "number"
  | "duration"
  | "short_text"
  | "long_text"
  | "emotion"
  | "event";

export type JourneyQuestionOption = {
  id: string;
  label: string;
};

export type JourneyQuestionCondition = {
  questionId: string;
  operator: "equals" | "not_equals" | "includes";
  value: string | number | boolean;
};

export type JourneyQuestion = {
  id: string;
  label: string;
  type: JourneyQuestionType;
  required: boolean;
  options?: JourneyQuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  condition?: JourneyQuestionCondition;
};

export type JourneyModuleType =
  | "medication"
  | "food"
  | "movement"
  | "sleep"
  | "cpap"
  | "symptoms"
  | "eating_behavior"
  | "stress"
  | "social"
  | "spirituality"
  | "questionnaire"
  | "custom";

export type JourneyModule = {
  id: string;
  type: JourneyModuleType;
  title: string;
  enabled: boolean;
  instructions: string;
  frequency: JourneyFrequency;
  startDate: string;
  endDate: string;
  reviewDate: string;
  required: boolean;
  questions: JourneyQuestion[];
};

export type JourneyPriority = {
  id: string;
  title: string;
  description: string;
  tracking: string;
  reviewDate: string;
};

export type JourneyPlanV2 = {
  schemaVersion: 2;
  title: string;
  startDate: string;
  durationDays: number | null;
  reviewDate: string;
  motivation: string;
  patientValues: string;
  objective: string;
  priorities: JourneyPriority[];
  modules: JourneyModule[];
  legacy: PlanConfig;
};

export type JourneyMeta = {
  status: JourneyStatus;
  currentVersion: number;
  publishedAt: string | null;
  draftUpdatedAt: string | null;
};

export type JourneyVersionSummary = {
  version: number;
  publishedAt: string;
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
  journeyPlan: JourneyPlanV2;
  journeyMeta: JourneyMeta;
};

export type Role = "patient" | "doctor";

export type PatientSummary = {
  id: string;
  name: string;
  inviteCode: string;
  onboarded: boolean;
  pending: boolean;
  journeyStatus?: JourneyStatus;
  currentVersion?: number;
};

export type DoctorNotice = {
  id: string;
  journeyId: string;
  patientName: string;
  summary: string;
  createdAt: string;
  read: boolean;
};
