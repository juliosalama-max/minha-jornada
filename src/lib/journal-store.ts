import { create } from "zustand";
import {
  DEFAULT_CONSULTS,
  DEFAULT_NUTRITION,
  DEFAULT_TASKS,
} from "./constants";
import {
  chooseRole as chooseRoleFn,
  claimPlanByCode,
  createDoctorPlan,
  getBootstrap,
  linkPatientByCode,
  listDoctorNotices,
  markNoticesRead as markNoticesReadFn,
  saveConsults,
  saveDayLog,
  saveMonthNotes,
  saveOnboarding,
  savePlan,
  saveJourneyDraft,
  publishJourney,
  saveJourneyResponse,
  saveProfile,
  saveTasks,
  updatePatientTask,
  updateJourneyActionProgress,
  type Bootstrap,
} from "./journal-api";
import { emptyPlan } from "./plan-templates";
import { emptyJourneyPlan } from "./journey-plan";
import type {
  DayLog,
  JournalSnapshot,
  JourneyActionProgress,
  JourneyPlanV2,
  JourneyAnswerValue,
  JourneyModuleResponse,
  MonthNotes,
  PatientSummary,
  PlanConfig,
  DoctorNotice,
  Profile,
  Role,
  Task,
  TaskMeta,
} from "./types";

const emptyProfile = (): Profile => ({
  name: "",
  firstConsultDate: "",
  injectionWeekday: null,
  dose: "",
});

const seed = (): JournalSnapshot => ({
  onboarded: false,
  profile: emptyProfile(),
  consults: DEFAULT_CONSULTS.map((c) => ({ ...c })),
  nutrition: DEFAULT_NUTRITION.map((c) => ({ ...c })),
  tasks: DEFAULT_TASKS.map((t) => ({ ...t, meta: t.meta ? { ...t.meta } : undefined })),
  days: {},
  monthNotes: {},
  plan: emptyPlan(),
  journeyPlan: emptyJourneyPlan(),
  journeyMeta: {
    status: "draft",
    currentVersion: 0,
    publishedAt: null,
    draftUpdatedAt: null,
  },
  journeyResponses: [],
  journeyActionProgress: [],
});

type JournalState = JournalSnapshot & {
  ready: boolean;
  role: Role | null;
  journeyId: string | null;
  inviteCode: string | null;
  doctorName: string | null;
  patientName: string | null;
  patients: PatientSummary[];
  notices: DoctorNotice[];
  applyBootstrap: (b: Bootstrap) => void;
  hydrate: (journeyId?: string | null) => Promise<void>;
  chooseRole: (role: Role, name: string, inviteCode?: string) => Promise<void>;
  linkCode: (code: string) => Promise<void>;
  claimCode: (code: string) => Promise<void>;
  createPlan: (data: { patientName: string; firstConsultDate?: string }) => Promise<void>;
  openPatient: (journeyId: string) => Promise<void>;
  leavePatient: () => void;
  completeOnboarding: (profile: Partial<Profile>) => void;
  setProfile: (patch: Partial<Profile>) => void;
  setConsultDate: (stage: number, date: string) => void;
  setConsults: (consults: JournalSnapshot["consults"]) => void;
  setNutritionDate: (index: number, date: string) => void;
  setNutritionList: (nutrition: JournalSnapshot["nutrition"]) => void;
  setPlan: (patch: Partial<PlanConfig>) => void;
  setJourneyPlan: (patch: Partial<JourneyPlanV2>) => void;
  saveJourneyDraft: () => Promise<void>;
  publishJourney: () => Promise<void>;
  saveModuleResponse: (
    moduleId: string,
    occurredOn: string,
    answers: Record<string, JourneyAnswerValue>,
  ) => Promise<JourneyModuleResponse>;
  updateActionProgress: (
    actionType: "task" | "exam",
    actionId: string,
    status: "pending" | "scheduled" | "completed",
    patch?: { scheduledDate?: string; note?: string },
  ) => Promise<JourneyActionProgress>;
  setTasksList: (tasks: Task[]) => void;
  toggleTask: (id: string) => void;
  updateTaskMeta: (id: string, meta: TaskMeta) => void;
  patchDay: (date: string, patch: Partial<DayLog>) => void;
  setMonthNotes: (month: string, patch: Partial<MonthNotes>) => void;
  clear: () => void;
  refreshNotices: () => Promise<void>;
  markNoticesRead: (ids?: string[]) => Promise<void>;
};

function applySnapshot(s: JournalSnapshot) {
  return {
    onboarded: s.onboarded,
    profile: s.profile,
    consults: s.consults,
    nutrition: s.nutrition,
    tasks: s.tasks,
    days: s.days,
    monthNotes: s.monthNotes,
    plan: s.plan ?? emptyPlan(),
    journeyPlan: s.journeyPlan ?? emptyJourneyPlan(),
    journeyMeta: s.journeyMeta ?? {
      status: "draft",
      currentVersion: 0,
      publishedAt: null,
      draftUpdatedAt: null,
    },
    journeyResponses: s.journeyResponses ?? [],
    journeyActionProgress: s.journeyActionProgress ?? [],
  };
}

let profileTimer: ReturnType<typeof setTimeout> | undefined;

export const useJournal = create<JournalState>((set, get) => ({
  ...seed(),
  ready: false,
  role: null,
  journeyId: null,
  inviteCode: null,
  doctorName: null,
  patientName: null,
  patients: [],
  notices: [],
  applyBootstrap: (b) => {
    if (b.kind === "needs-role") {
      set({
        ...seed(),
        ready: true,
        role: null,
        journeyId: null,
        inviteCode: null,
        doctorName: null,
        patientName: null,
        patients: [],
        notices: [],
      });
      return;
    }
    if (b.kind === "needs-code") {
      set({
        ...seed(),
        ready: true,
        role: "patient",
        journeyId: null,
        inviteCode: null,
        doctorName: null,
        patientName: b.name,
        patients: [],
        notices: [],
      });
      return;
    }
    if (b.kind === "patient") {
      set({
        ready: true,
        role: "patient",
        journeyId: b.journeyId,
        inviteCode: b.inviteCode,
        doctorName: b.doctorName,
        patientName: b.snapshot.profile.name,
        patients: [],
        notices: [],
        ...applySnapshot(b.snapshot),
      });
      return;
    }
    set({
      ready: true,
      role: "doctor",
      journeyId: b.journeyId,
      inviteCode: b.inviteCode,
      doctorName: b.doctorName,
      patientName: b.patientName,
      patients: b.patients,
      notices: b.notices ?? [],
      ...(b.snapshot ? applySnapshot(b.snapshot) : seed()),
    });
  },
  hydrate: async (journeyId) => {
    const payload =
      journeyId === undefined
        ? get().journeyId
          ? { journeyId: get().journeyId }
          : {}
        : { journeyId };
    const b = await getBootstrap({ data: payload });
    get().applyBootstrap(b);
  },
  chooseRole: async (role, name, inviteCode) => {
    const b = await chooseRoleFn({ data: { role, name, inviteCode } });
    get().applyBootstrap(b);
  },
  linkCode: async (code) => {
    const b = await linkPatientByCode({ data: { code } });
    get().applyBootstrap(b);
  },
  claimCode: async (code) => {
    const b = await claimPlanByCode({ data: { code } });
    get().applyBootstrap(b);
  },
  createPlan: async (data) => {
    const b = await createDoctorPlan({ data });
    get().applyBootstrap(b);
  },
  openPatient: async (journeyId) => {
    const b = await getBootstrap({ data: { journeyId } });
    get().applyBootstrap(b);
  },
  leavePatient: () => {
    const { patients, doctorName } = get();
    set({
      ...seed(),
      ready: true,
      role: "doctor",
      journeyId: null,
      inviteCode: null,
      doctorName,
      patientName: null,
      patients,
      notices: get().notices,
    });
  },
  completeOnboarding: (profile) => {
    set((s) => ({
      onboarded: true,
      profile: { ...s.profile, ...profile },
      patientName: profile.name ?? s.patientName,
    }));
    const s = get();
    void saveOnboarding({ data: { journeyId: s.journeyId, profile } });
  },
  setProfile: (patch) => {
    set((s) => ({
      profile: { ...s.profile, ...patch },
      patientName: patch.name ?? s.patientName,
    }));
    clearTimeout(profileTimer);
    profileTimer = setTimeout(() => {
      const s = get();
      void saveProfile({ data: { journeyId: s.journeyId, profile: s.profile } });
    }, 400);
  },
  setConsultDate: (stage, date) => {
    set((s) => ({
      consults: s.consults.map((c) => (c.stage === stage ? { ...c, date } : c)),
    }));
    const s = get();
    void saveConsults({ data: { journeyId: s.journeyId, consults: s.consults } });
  },
  setConsults: (consults) => {
    set({ consults });
    const s = get();
    void saveConsults({ data: { journeyId: s.journeyId, consults } });
  },
  setNutritionDate: (index, date) => {
    set((s) => ({
      nutrition: s.nutrition.map((c) => (c.index === index ? { ...c, date } : c)),
    }));
    const s = get();
    void saveConsults({ data: { journeyId: s.journeyId, nutrition: s.nutrition } });
  },
  setNutritionList: (nutrition) => {
    set({ nutrition });
    const s = get();
    void saveConsults({ data: { journeyId: s.journeyId, nutrition } });
  },
  setPlan: (patch) => {
    set((s) => ({
      plan: { ...s.plan, ...patch },
      journeyPlan: {
        ...s.journeyPlan,
        legacy: { ...s.plan, ...patch },
        motivation: patch.motivation ?? s.journeyPlan.motivation,
        objective: patch.workOn ?? s.journeyPlan.objective,
      },
    }));
    const s = get();
    void savePlan({ data: { journeyId: s.journeyId, plan: s.plan } });
  },
  setJourneyPlan: (patch) => {
    set((s) => ({
      journeyPlan: {
        ...s.journeyPlan,
        ...patch,
        legacy: patch.legacy ?? s.journeyPlan.legacy,
      },
    }));
  },
  saveJourneyDraft: async () => {
    const s = get();
    const snapshot = await saveJourneyDraft({
      data: { journeyId: s.journeyId, plan: s.journeyPlan },
    });
    set(applySnapshot(snapshot));
  },
  publishJourney: async () => {
    const s = get();
    const snapshot = await publishJourney({ data: { journeyId: s.journeyId } });
    set(applySnapshot(snapshot));
  },
  saveModuleResponse: async (moduleId, occurredOn, answers) => {
    const response = await saveJourneyResponse({
      data: { moduleId, occurredOn, answers },
    });
    set((s) => ({
      journeyResponses: [
        response,
        ...s.journeyResponses.filter((item) => item.id !== response.id),
      ],
    }));
    return response;
  },
  updateActionProgress: async (actionType, actionId, status, patch = {}) => {
    const progress = await updateJourneyActionProgress({
      data: {
        actionType,
        actionId,
        status,
        scheduledDate: patch.scheduledDate,
        note: patch.note,
      },
    });
    set((s) => ({
      journeyActionProgress: [
        progress,
        ...s.journeyActionProgress.filter(
          (item) =>
            !(item.actionType === actionType && item.actionId === actionId),
        ),
      ],
    }));
    return progress;
  },
  setTasksList: (tasks) => {
    set({ tasks });
    const s = get();
    void saveTasks({ data: { journeyId: s.journeyId, tasks } });
  },
  toggleTask: (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) return;
    const done = !current.done;
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, done } : t)),
    }));
    const s = get();
    if (s.role === "patient") {
      void updatePatientTask({ data: { taskId: id, done } });
    } else {
      void saveTasks({ data: { journeyId: s.journeyId, tasks: s.tasks } });
    }
  },
  updateTaskMeta: (id, meta) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, meta: { ...(t.meta ?? {}), ...meta } } : t,
      ),
    }));
    const s = get();
    if (s.role === "patient") {
      void updatePatientTask({ data: { taskId: id, meta } });
    } else {
      void saveTasks({ data: { journeyId: s.journeyId, tasks: s.tasks } });
    }
  },
  patchDay: (date, patch) => {
    set((s) => {
      const prev = s.days[date] ?? {};
      const next: DayLog = { ...prev, ...patch };
      return { days: { ...s.days, [date]: next } };
    });
    const s = get();
    void saveDayLog({ data: { journeyId: s.journeyId, date, patch } });
  },
  setMonthNotes: (month, patch) => {
    set((s) => ({
      monthNotes: {
        ...s.monthNotes,
        [month]: { ...(s.monthNotes[month] ?? {}), ...patch },
      },
    }));
    const s = get();
    void saveMonthNotes({ data: { journeyId: s.journeyId, month, patch } });
  },
  clear: () =>
    set({
      ...seed(),
      ready: false,
      role: null,
      journeyId: null,
      inviteCode: null,
      doctorName: null,
      patientName: null,
      patients: [],
      notices: [],
    }),
  refreshNotices: async () => {
    if (get().role !== "doctor") return;
    const notices = await listDoctorNotices();
    set({ notices });
  },
  markNoticesRead: async (ids) => {
    if (get().role !== "doctor") return;
    const notices = await markNoticesReadFn({ data: { ids } });
    set({ notices });
  },
}));
