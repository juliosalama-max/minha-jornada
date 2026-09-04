import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import type {
  DayLog,
  DoctorAlert,
  DoctorNotice,
  JournalSnapshot,
  JourneyActionProgress,
  JourneyAnswerValue,
  JourneyMeta,
  JourneyModule,
  JourneyModuleResponse,
  JourneyPlanV2,
  MedicalConsult,
  MonthNotes,
  NutritionConsult,
  PatientSummary,
  PlanConfig,
  Profile,
  Role,
  Task,
  TaskMeta,
} from "@/lib/types";
import { summarizeDayPatch } from "@/lib/notice-copy";
import { emptyPlan, normalizePlan } from "@/lib/plan-templates";
import {
  emptyJourneyPlan,
  normalizeJourneyPlan,
  withLegacyPlan,
} from "@/lib/journey-plan";
import { matchingAlertRules } from "@/lib/journey-alerts";
import { moduleIsDue, responseMatchesPeriod } from "@/lib/journey-schedule";

type JourneyRow = {
  id: string;
  patient_user_id: string | null;
  doctor_user_id: string | null;
  invite_code: string;
  onboarded: boolean;
  name: string;
  first_consult_date: string;
  injection_weekday: number | null;
  dose: string;
  consults: string;
  nutrition: string;
  tasks: string;
  plan: string;
  journey_status: "draft" | "published" | "in_review" | "completed" | "archived";
  draft_plan: string;
  published_plan: string;
  current_version: number;
  published_at: string | null;
  plan_updated_at: string | null;
};

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function parsePlan(raw: string | null | undefined): PlanConfig {
  return normalizePlan(parseJson<Partial<PlanConfig>>(raw, {}));
}

function parseJourneyPlan(raw: string | null | undefined, legacyRaw?: string | null): JourneyPlanV2 {
  const parsed = parseJson<unknown>(raw, null);
  if (parsed && typeof parsed === "object") {
    return normalizeJourneyPlan(parsed);
  }
  return normalizeJourneyPlan(parseJson<Partial<PlanConfig>>(legacyRaw, {}));
}

function journeyMeta(row: JourneyRow): JourneyMeta {
  return {
    status: row.journey_status,
    currentVersion: Number(row.current_version || 0),
    publishedAt: row.published_at,
    draftUpdatedAt: row.plan_updated_at,
  };
}

function questionConditionMatches(
  condition: JourneyModule["questions"][number]["condition"],
  answers: Record<string, JourneyAnswerValue>,
): boolean {
  if (!condition) return true;
  const current = answers[condition.questionId];
  if (condition.operator === "equals") return current === condition.value;
  if (condition.operator === "not_equals") {
    return current !== undefined && current !== condition.value;
  }
  if (condition.operator === "includes") {
    if (Array.isArray(current)) return current.includes(String(condition.value));
    if (typeof current === "string") return current.includes(String(condition.value));
    return false;
  }
  return true;
}

function sanitizeModuleAnswers(
  module: JourneyModule,
  rawAnswers: Record<string, JourneyAnswerValue>,
): Record<string, JourneyAnswerValue> {
  const answers: Record<string, JourneyAnswerValue> = {};

  for (const question of module.questions) {
    if (!questionConditionMatches(question.condition, answers)) continue;
    const value = rawAnswers[question.id];
    const empty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (empty) {
      if (question.required) {
        throw new Error(`Preencha o campo obrigatório: ${question.label}`);
      }
      continue;
    }

    if (question.type === "boolean" || question.type === "event") {
      if (typeof value !== "boolean") {
        throw new Error(`Resposta inválida: ${question.label}`);
      }
      answers[question.id] = value;
      continue;
    }

    if (question.type === "single_choice" || question.type === "emotion") {
      const allowed = new Set((question.options ?? []).map((option) => option.id));
      if (typeof value !== "string" || !allowed.has(value)) {
        throw new Error(`Opção inválida: ${question.label}`);
      }
      answers[question.id] = value;
      continue;
    }

    if (question.type === "multiple_choice") {
      const allowed = new Set((question.options ?? []).map((option) => option.id));
      if (!Array.isArray(value) || !value.every((item) => allowed.has(item))) {
        throw new Error(`Opções inválidas: ${question.label}`);
      }
      answers[question.id] = value;
      continue;
    }

    if (
      question.type === "scale" ||
      question.type === "number" ||
      question.type === "duration"
    ) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(`Número inválido: ${question.label}`);
      }
      if (question.min != null && value < question.min) {
        throw new Error(`Valor abaixo do mínimo: ${question.label}`);
      }
      if (question.max != null && value > question.max) {
        throw new Error(`Valor acima do máximo: ${question.label}`);
      }
      if (question.type === "duration" && value < 0) {
        throw new Error(`Duração inválida: ${question.label}`);
      }
      answers[question.id] = value;
      continue;
    }

    if (typeof value !== "string") {
      throw new Error(`Texto inválido: ${question.label}`);
    }
    answers[question.id] = value.slice(0, 5000);
  }

  return answers;
}

function emptySnapshot(): JournalSnapshot {
  return {
    onboarded: false,
    profile: {
      name: "",
      firstConsultDate: "",
      injectionWeekday: null,
      dose: "",
    },
    consults: [],
    nutrition: [],
    tasks: [],
    days: {},
    monthNotes: {},
    plan: emptyPlan(),
    journeyPlan: emptyJourneyPlan(),
    publishedJourneyPlan: emptyJourneyPlan(),
    journeyMeta: {
      status: "draft",
      currentVersion: 0,
      publishedAt: null,
      draftUpdatedAt: null,
    },
    journeyResponses: [],
    journeyActionProgress: [],
  };
}

function rowProfile(row: JourneyRow): Profile {
  return {
    name: row.name,
    firstConsultDate: row.first_consult_date,
    injectionWeekday: row.injection_weekday,
    dose: row.dose,
  };
}

async function loadSnapshot(
  sql: Sql,
  journey: JourneyRow,
  view: "doctor" | "patient",
): Promise<JournalSnapshot> {
  const dayRows = await sql<{ day: string; log: string }>`
    select day, log from day_logs where journey_id = ${journey.id}
  `;
  const noteRows = await sql<{ month: string; notes: string }>`
    select month, notes from month_notes where journey_id = ${journey.id}
  `;
  const responseRows = await sql<{
    id: string;
    module_id: string;
    occurred_on: string;
    answers: string;
    created_at: string;
    updated_at: string;
  }>`
    select
      id,
      module_id,
      occurred_on::text,
      answers,
      created_at::text,
      updated_at::text
    from journey_module_responses
    where journey_id = ${journey.id}
    order by occurred_on desc, created_at desc
  `;
  const progressRows = await sql<{
    action_type: "task" | "exam";
    action_id: string;
    status: "pending" | "scheduled" | "completed" | "cancelled";
    scheduled_date: string | null;
    note: string;
    completed_at: string | null;
    updated_at: string;
  }>`
    select
      action_type,
      action_id,
      status,
      scheduled_date::text,
      note,
      completed_at::text,
      updated_at::text
    from journey_action_progress
    where journey_id = ${journey.id}
    order by updated_at desc
  `;
  const days: Record<string, DayLog> = {};
  for (const r of dayRows) days[r.day] = parseJson<DayLog>(r.log, {});
  const monthNotes: Record<string, MonthNotes> = {};
  for (const r of noteRows) monthNotes[r.month] = parseJson<MonthNotes>(r.notes, {});
  const journeyResponses: JourneyModuleResponse[] = responseRows.map((row) => ({
    id: row.id,
    moduleId: row.module_id,
    occurredOn: row.occurred_on,
    answers: parseJson<Record<string, JourneyAnswerValue>>(row.answers, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  const journeyActionProgress: JourneyActionProgress[] = progressRows.map((row) => ({
    actionType: row.action_type,
    actionId: row.action_id,
    status: row.status,
    scheduledDate: row.scheduled_date ?? "",
    note: row.note,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  }));

  const publishedJourneyPlan = parseJourneyPlan(
    journey.published_plan || journey.plan,
    journey.plan,
  );
  const journeyPlan =
    view === "doctor"
      ? parseJourneyPlan(journey.draft_plan || journey.plan, journey.plan)
      : publishedJourneyPlan;

  return {
    onboarded: Boolean(journey.onboarded),
    profile: rowProfile(journey),
    consults: parseJson<MedicalConsult[]>(journey.consults, emptySnapshot().consults),
    nutrition: parseJson<NutritionConsult[]>(journey.nutrition, emptySnapshot().nutrition),
    tasks: parseJson<Task[]>(journey.tasks, emptySnapshot().tasks),
    days,
    monthNotes,
    plan: journeyPlan.legacy,
    journeyPlan,
    publishedJourneyPlan,
    journeyMeta: journeyMeta(journey),
    journeyResponses,
    journeyActionProgress,
  };
}

function makeInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}

async function createPatientJourney(sql: Sql, userId: string, name: string) {
  const seed = emptySnapshot();
  for (let i = 0; i < 8; i++) {
    const id = crypto.randomUUID();
    const invite = makeInviteCode();
    try {
      await sql`
        insert into journeys (
          id, patient_user_id, invite_code, onboarded, name,
          first_consult_date, injection_weekday, dose, consults, nutrition, tasks, plan,
          journey_status, draft_plan, published_plan, current_version
        ) values (
          ${id}, ${userId}, ${invite}, false, ${name},
          '', null, '',
          ${JSON.stringify(seed.consults)},
          ${JSON.stringify(seed.nutrition)},
          ${JSON.stringify(seed.tasks)},
          ${JSON.stringify(seed.plan)},
          'draft',
          ${JSON.stringify(seed.journeyPlan)},
          '{}',
          0
        )
      `;
      const rows = await sql<JourneyRow>`select * from journeys where id = ${id}`;
      return rows[0]!;
    } catch {
      /* unique invite collision — retry */
    }
  }
  throw new Error("Não foi possível criar o código de acompanhamento.");
}

type ProfileRow = {
  user_id: string;
  role: Role;
  display_name: string;
};

async function getProfile(sql: Sql, userId: string): Promise<ProfileRow | null> {
  const rows = await sql<ProfileRow>`
    select user_id, role, display_name from profiles where user_id = ${userId}
  `;
  return rows[0] ?? null;
}

async function doctorAuthorizationActive(sql: Sql, userId: string): Promise<boolean> {
  try {
    const rows = await sql<{ active: boolean }>`
      select active
      from doctor_authorizations
      where user_id = ${userId}
      limit 1
    `;
    return rows[0]?.active === true;
  } catch {
    return false;
  }
}

async function provisionAuthorizedDoctorProfile(
  sql: Sql,
  userId: string,
): Promise<ProfileRow | null> {
  if (!(await doctorAuthorizationActive(sql, userId))) return null;

  const existing = await getProfile(sql, userId);
  if (existing) return existing.role === "doctor" ? existing : null;

  const users = await sql<{ name: string }>`
    select name
    from "user"
    where id = ${userId}
    limit 1
  `;
  const displayName = users[0]?.name?.trim() || "Profissional";

  await sql`
    insert into profiles (user_id, role, display_name)
    values (${userId}, 'doctor', ${displayName})
    on conflict (user_id) do nothing
  `;

  const profile = await getProfile(sql, userId);
  return profile?.role === "doctor" ? profile : null;
}

async function requireAuthorizedDoctor(
  sql: Sql,
  userId: string,
): Promise<ProfileRow> {
  const profile = await getProfile(sql, userId);
  const authorized = await doctorAuthorizationActive(sql, userId);
  if (!profile || profile.role !== "doctor" || !authorized) {
    throw new Error("Acesso profissional não autorizado.");
  }
  return profile;
}

async function patientJourney(sql: Sql, userId: string) {
  const rows = await sql<JourneyRow>`
    select * from journeys where patient_user_id = ${userId}
  `;
  return rows[0] ?? null;
}

async function resolvePatientJourney(sql: Sql, userId: string) {
  const profile = await getProfile(sql, userId);
  if (!profile || profile.role !== "patient") {
    throw new Error("Apenas o paciente pode registrar esta informação.");
  }
  const row = await patientJourney(sql, userId);
  if (!row) throw new Error("Jornada não encontrada");
  return row;
}

async function resolveDoctorJourney(sql: Sql, userId: string, journeyId?: string | null) {
  await requireAuthorizedDoctor(sql, userId);
  if (!journeyId) throw new Error("Selecione um paciente");
  const rows = await sql<JourneyRow>`
    select * from journeys
    where id = ${journeyId} and doctor_user_id = ${userId}
  `;
  if (!rows[0]) throw new Error("Sem permissão para esta jornada");
  return rows[0];
}

async function doctorNameFor(sql: Sql, doctorUserId: string | null) {
  if (!doctorUserId) return null;
  const rows = await sql<{ display_name: string }>`
    select display_name from profiles where user_id = ${doctorUserId}
  `;
  return rows[0]?.display_name || null;
}

async function loadNotices(sql: Sql, doctorUserId: string): Promise<DoctorNotice[]> {
  try {
    const rows = await sql<{
      id: string;
      journey_id: string;
      patient_name: string;
      summary: string;
      created_at: string;
      read_at: string | null;
    }>`
      select id, journey_id, patient_name, summary, created_at::text, read_at::text
      from doctor_notices
      where doctor_user_id = ${doctorUserId}
      order by created_at desc
      limit 40
    `;
    return rows.map((r) => ({
      id: r.id,
      journeyId: r.journey_id,
      patientName: r.patient_name,
      summary: r.summary,
      createdAt: r.created_at,
      read: Boolean(r.read_at),
    }));
  } catch {
    return [];
  }
}

async function loadAlerts(sql: Sql, doctorUserId: string): Promise<DoctorAlert[]> {
  try {
    const rows = await sql<{
      id: string;
      journey_id: string;
      patient_name: string;
      module_title: string;
      title: string;
      severity: "attention" | "important";
      occurred_on: string;
      created_at: string;
      read_at: string | null;
    }>`
      select
        id,
        journey_id,
        patient_name,
        module_title,
        title,
        severity,
        occurred_on::text,
        created_at::text,
        read_at::text
      from doctor_alerts
      where doctor_user_id = ${doctorUserId}
      order by
        case when read_at is null then 0 else 1 end,
        case when severity = 'important' then 0 else 1 end,
        created_at desc
      limit 80
    `;
    return rows.map((row) => ({
      id: row.id,
      journeyId: row.journey_id,
      patientName: row.patient_name,
      moduleTitle: row.module_title,
      title: row.title,
      severity: row.severity,
      occurredOn: row.occurred_on,
      createdAt: row.created_at,
      read: Boolean(row.read_at),
    }));
  } catch {
    return [];
  }
}

async function recordConfiguredAlerts(
  sql: Sql,
  journey: JourneyRow,
  module: JourneyModule,
  responseId: string,
  occurredOn: string,
  answers: Record<string, JourneyAnswerValue>,
) {
  if (!journey.doctor_user_id) return;
  const matches = matchingAlertRules(module, answers);
  for (const rule of matches) {
    try {
      await sql`
        insert into doctor_alerts (
          id,
          doctor_user_id,
          journey_id,
          patient_name,
          module_id,
          module_title,
          rule_id,
          title,
          severity,
          source_response_id,
          occurred_on
        ) values (
          ${crypto.randomUUID()},
          ${journey.doctor_user_id},
          ${journey.id},
          ${journey.name || "Paciente"},
          ${module.id},
          ${module.title},
          ${rule.id},
          ${rule.title},
          ${rule.severity},
          ${responseId},
          ${occurredOn}
        )
        on conflict (journey_id, rule_id, source_response_id) do nothing
      `;
    } catch {
      /* table may not exist until migration runs */
    }
  }
}

async function notifyDoctor(sql: Sql, journey: JourneyRow, summary: string) {
  if (!journey.doctor_user_id) return;
  const text = summary.trim();
  if (!text) return;
  try {
    await sql`
      insert into doctor_notices (id, doctor_user_id, journey_id, patient_name, summary)
      values (
        ${crypto.randomUUID()},
        ${journey.doctor_user_id},
        ${journey.id},
        ${journey.name || "Paciente"},
        ${text}
      )
    `;
  } catch {
    /* table may not exist until migration runs */
  }
}

export type Bootstrap =
  | { kind: "needs-role" }
  | { kind: "needs-code"; name: string }
  | {
      kind: "patient";
      journeyId: string;
      inviteCode: string;
      doctorName: string | null;
      snapshot: JournalSnapshot;
    }
  | {
      kind: "doctor";
      journeyId: string | null;
      patients: PatientSummary[];
      doctorName: string;
      snapshot: JournalSnapshot | null;
      inviteCode: string | null;
      patientName: string | null;
      notices: DoctorNotice[];
      alerts: DoctorAlert[];
    };

async function loadBootstrap(
  sql: Sql,
  userId: string,
  requestedJourneyId?: string | null,
): Promise<Bootstrap> {
  let profile = await getProfile(sql, userId);
  if (!profile) {
    profile = await provisionAuthorizedDoctorProfile(sql, userId);
  }
  if (!profile) return { kind: "needs-role" };

  if (profile.role === "doctor" && !(await doctorAuthorizationActive(sql, userId))) {
    throw new Error("Acesso profissional revogado ou não autorizado.");
  }

  if (profile.role === "patient") {
    const journey = await patientJourney(sql, userId);
    if (!journey) {
      return { kind: "needs-code", name: profile.display_name };
    }
    return {
      kind: "patient",
      journeyId: journey.id,
      inviteCode: journey.invite_code,
      doctorName: await doctorNameFor(sql, journey.doctor_user_id),
      snapshot: await loadSnapshot(sql, journey, "patient"),
    };
  }

  const patientRows = await sql<JourneyRow>`
    select * from journeys
    where doctor_user_id = ${userId}
    order by name asc
  `;
  const patients: PatientSummary[] = patientRows.map((r) => ({
    id: r.id,
    name: r.name || (r.patient_user_id ? "Paciente" : "Aguardando paciente"),
    inviteCode: r.invite_code,
    onboarded: Boolean(r.onboarded),
    pending: !r.patient_user_id,
    journeyStatus: r.journey_status,
    currentVersion: Number(r.current_version || 0),
  }));

  let active: JourneyRow | undefined;
  if (requestedJourneyId) {
    active = patientRows.find((r) => r.id === requestedJourneyId);
  } else if (requestedJourneyId === undefined && patientRows.length === 1) {
    active = patientRows[0];
  }

  return {
    kind: "doctor",
    journeyId: active?.id ?? null,
    patients,
    doctorName: profile.display_name,
    snapshot: active ? await loadSnapshot(sql, active, "doctor") : null,
    inviteCode: active?.invite_code ?? null,
    patientName: active?.name ?? null,
    notices: await loadNotices(sql, userId),
    alerts: await loadAlerts(sql, userId),
  };
}

export const getBootstrap = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { journeyId?: string | null } | undefined) => data ?? {})
  .handler(async ({ context, data }): Promise<Bootstrap> => {
    const sql = await getSql();
    return loadBootstrap(sql, context.userId, data.journeyId);
  });

export const listDoctorAlerts = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DoctorAlert[]> => {
    const sql = await getSql();
    try {
      await requireAuthorizedDoctor(sql, context.userId);
    } catch {
      return [];
    }
    return loadAlerts(sql, context.userId);
  });

export const markDoctorAlertsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { ids?: string[] } | undefined) => data ?? {})
  .handler(async ({ context, data }): Promise<DoctorAlert[]> => {
    const sql = await getSql();
    try {
      await requireAuthorizedDoctor(sql, context.userId);
    } catch {
      return [];
    }

    if (data.ids?.length) {
      for (const id of data.ids) {
        await sql`
          update doctor_alerts
          set read_at = now()
          where id = ${id}
            and doctor_user_id = ${context.userId}
            and read_at is null
        `;
      }
    } else {
      await sql`
        update doctor_alerts
        set read_at = now()
        where doctor_user_id = ${context.userId}
          and read_at is null
      `;
    }
    return loadAlerts(sql, context.userId);
  });

export const listDoctorNotices = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DoctorNotice[]> => {
    const sql = await getSql();
    try {
      await requireAuthorizedDoctor(sql, context.userId);
    } catch {
      return [];
    }
    return loadNotices(sql, context.userId);
  });

export const markNoticesRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { ids?: string[] } | undefined) => data ?? {})
  .handler(async ({ context, data }): Promise<DoctorNotice[]> => {
    const sql = await getSql();
    try {
      await requireAuthorizedDoctor(sql, context.userId);
    } catch {
      return [];
    }
    if (data.ids?.length) {
      for (const id of data.ids) {
        await sql`
          update doctor_notices
          set read_at = now()
          where id = ${id} and doctor_user_id = ${context.userId} and read_at is null
        `;
      }
    } else {
      await sql`
        update doctor_notices
        set read_at = now()
        where doctor_user_id = ${context.userId} and read_at is null
      `;
    }
    return loadNotices(sql, context.userId);
  });

export const chooseRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { role: Role; name: string; inviteCode?: string }) => ({
    role: data.role,
    name: data.name.trim(),
    inviteCode: String(data.inviteCode ?? "")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase(),
  }))
  .handler(async ({ context, data }): Promise<Bootstrap> => {
    const sql = await getSql();
    const existing = await getProfile(sql, context.userId);
    if (data.role === "doctor") {
      await requireAuthorizedDoctor(sql, context.userId);
      return loadBootstrap(sql, context.userId, null);
    }
    if (!existing) {
      await sql`
        insert into profiles (user_id, role, display_name)
        values (${context.userId}, 'patient', ${data.name})
      `;
    } else if (existing.role !== "patient") {
      throw new Error("Esta conta não está autorizada como paciente.");
    }
    if (data.role === "patient") {
      if (data.inviteCode.length < 6) {
        throw new Error("Informe o código de 6 caracteres enviado pela médica.");
      }
      await claimJourney(sql, context.userId, data.inviteCode, data.name);
    }
    return loadBootstrap(sql, context.userId, null);
  });

async function claimJourney(sql: Sql, userId: string, code: string, displayName?: string) {
  const existing = await patientJourney(sql, userId);
  if (existing) throw new Error("Você já tem uma jornada nesta conta.");
  const rows = await sql<JourneyRow>`
    select * from journeys where invite_code = ${code}
  `;
  const journey = rows[0];
  if (!journey) throw new Error("Código não encontrado.");
  if (journey.patient_user_id && journey.patient_user_id !== userId) {
    throw new Error("Este código já foi usado por outro paciente.");
  }
  if (journey.journey_status === "draft" || journey.current_version < 1) {
    throw new Error("A Jornada ainda não foi publicada pela equipe.");
  }
  const name = journey.name || displayName || "";
  await sql`
    update journeys
    set patient_user_id = ${userId},
        name = ${name},
        updated_at = now()
    where id = ${journey.id}
  `;
  if (name) {
    await sql`update profiles set display_name = ${name} where user_id = ${userId}`;
  }
  return journey.id;
}

export const createDoctorPlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { patientName: string; firstConsultDate?: string }) => data)
  .handler(async ({ context, data }): Promise<Bootstrap> => {
    const sql = await getSql();
    await requireAuthorizedDoctor(sql, context.userId);
    const name = data.patientName.trim();
    if (!name) throw new Error("Informe o nome do paciente.");
    const seed = emptySnapshot();
    const first = data.firstConsultDate ?? "";
    const initialJourneyPlan: JourneyPlanV2 = first
      ? {
          ...seed.journeyPlan,
          startDate: first,
          appointments: [
            {
              id: crypto.randomUUID(),
              type: "doctor",
              professional: "",
              date: first,
              offsetDays: null,
              mode: "unspecified",
              notes: "Consulta inicial",
              status: "scheduled",
              visibleToPatient: true,
            },
          ],
        }
      : seed.journeyPlan;
    for (let i = 0; i < 8; i++) {
      const id = crypto.randomUUID();
      const invite = makeInviteCode();
      try {
        await sql`
          insert into journeys (
            id, patient_user_id, doctor_user_id, invite_code, onboarded, name,
            first_consult_date, injection_weekday, dose, consults, nutrition, tasks, plan,
            journey_status, draft_plan, published_plan, current_version, plan_updated_at
          ) values (
            ${id}, null, ${context.userId}, ${invite}, false, ${name},
            ${first}, null, '',
            ${JSON.stringify(seed.consults)},
            ${JSON.stringify(seed.nutrition)},
            ${JSON.stringify(seed.tasks)},
            ${JSON.stringify(seed.plan)},
            'draft',
            ${JSON.stringify(initialJourneyPlan)},
            '{}',
            0,
            now()
          )
        `;
        return loadBootstrap(sql, context.userId, id);
      } catch {
        /* invite collision */
      }
    }
    throw new Error("Não foi possível gerar o código do plano.");
  });

export const claimPlanByCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code: string }) => ({
    code: data.code.replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
  }))
  .handler(async ({ context, data }): Promise<Bootstrap> => {
    const sql = await getSql();
    const profile = await getProfile(sql, context.userId);
    if (!profile || profile.role !== "patient") {
      throw new Error("Entre como paciente para usar o código do plano.");
    }
    if (data.code.length < 6) throw new Error("Código incompleto.");
    await claimJourney(sql, context.userId, data.code, profile.display_name);
    return loadBootstrap(sql, context.userId, null);
  });

export const linkPatientByCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code: string }) => ({
    code: data.code.replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
  }))
  .handler(async ({ context, data }): Promise<Bootstrap> => {
    const sql = await getSql();
    await requireAuthorizedDoctor(sql, context.userId);
    if (data.code.length < 6) throw new Error("Código incompleto.");
    const rows = await sql<JourneyRow>`
      select * from journeys where invite_code = ${data.code}
    `;
    const journey = rows[0];
    if (!journey) throw new Error("Código não encontrado.");
    if (journey.doctor_user_id && journey.doctor_user_id !== context.userId) {
      throw new Error("Esta jornada já está vinculada a outra profissional.");
    }
    await sql`
      update journeys
      set doctor_user_id = ${context.userId}, updated_at = now()
      where id = ${journey.id}
    `;
    return loadBootstrap(sql, context.userId, journey.id);
  });

export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { journeyId?: string | null; profile: Partial<Profile> }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const journey = await resolvePatientJourney(sql, context.userId);
    const name = (data.profile.name ?? journey.name).trim();
    await sql`
      update journeys
      set onboarded = true,
          name = ${name},
          updated_at = now()
      where id = ${journey.id}
    `;
    await sql`
      update profiles set display_name = ${name}
      where user_id = ${context.userId}
    `;
    return true;
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { journeyId?: string | null; profile: Profile }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await getProfile(sql, context.userId);
    if (!actor) throw new Error("Perfil não encontrado");

    if (actor.role === "patient") {
      const journey = await resolvePatientJourney(sql, context.userId);
      const name = data.profile.name.trim();
      await sql`
        update journeys
        set name = ${name}, updated_at = now()
        where id = ${journey.id}
      `;
      await sql`
        update profiles set display_name = ${name}
        where user_id = ${context.userId}
      `;
      return true;
    }

    const journey = await resolveDoctorJourney(sql, context.userId, data.journeyId);
    await sql`
      update journeys
      set name = ${data.profile.name},
          first_consult_date = ${data.profile.firstConsultDate},
          injection_weekday = ${data.profile.injectionWeekday},
          dose = ${data.profile.dose},
          updated_at = now()
      where id = ${journey.id}
    `;
    if (journey.patient_user_id) {
      await sql`
        update profiles set display_name = ${data.profile.name}
        where user_id = ${journey.patient_user_id}
      `;
    }
    return true;
  });

export const saveConsults = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      journeyId?: string | null;
      consults?: MedicalConsult[];
      nutrition?: NutritionConsult[];
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const journey = await resolveDoctorJourney(sql, context.userId, data.journeyId);
    const consults = data.consults ?? parseJson(journey.consults, emptySnapshot().consults);
    const nutrition = data.nutrition ?? parseJson(journey.nutrition, emptySnapshot().nutrition);
    await sql`
      update journeys
      set consults = ${JSON.stringify(consults)},
          nutrition = ${JSON.stringify(nutrition)},
          updated_at = now()
      where id = ${journey.id}
    `;
    return true;
  });

export const saveTasks = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { journeyId?: string | null; tasks: Task[] }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const journey = await resolveDoctorJourney(sql, context.userId, data.journeyId);
    await sql`
      update journeys
      set tasks = ${JSON.stringify(data.tasks)},
          updated_at = now()
      where id = ${journey.id}
    `;
    return true;
  });

export const updatePatientTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { taskId: string; done?: boolean; meta?: TaskMeta }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const journey = await resolvePatientJourney(sql, context.userId);
    const tasks = parseJson<Task[]>(journey.tasks, []);
    const current = tasks.find((task) => task.id === data.taskId);
    if (!current) throw new Error("Tarefa não encontrada");

    const next = tasks.map((task) =>
      task.id === data.taskId
        ? {
            ...task,
            done: data.done === undefined ? task.done : Boolean(data.done),
            meta: data.meta ? { ...(task.meta ?? {}), ...data.meta } : task.meta,
          }
        : task,
    );

    await sql`
      update journeys
      set tasks = ${JSON.stringify(next)}, updated_at = now()
      where id = ${journey.id}
    `;

    if (data.done === true && !current.done) {
      await notifyDoctor(sql, journey, `concluiu a tarefa: ${current.title}`);
    }
    return true;
  });

export const savePlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { journeyId?: string | null; plan: PlanConfig }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const journey = await resolveDoctorJourney(sql, context.userId, data.journeyId);
    const legacy = normalizePlan(data.plan);
    const currentDraft = parseJourneyPlan(journey.draft_plan, journey.plan);
    const nextDraft = withLegacyPlan(currentDraft, legacy);
    const nextStatus =
      journey.current_version > 0 && journey.journey_status !== "draft"
        ? "in_review"
        : "draft";

    await sql`
      update journeys
      set plan = ${JSON.stringify(legacy)},
          draft_plan = ${JSON.stringify(nextDraft)},
          journey_status = ${nextStatus},
          plan_updated_at = now(),
          updated_at = now()
      where id = ${journey.id}
    `;
    return true;
  });

export const saveJourneyDraft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { journeyId?: string | null; plan: JourneyPlanV2 }) => data)
  .handler(async ({ context, data }): Promise<JournalSnapshot> => {
    const sql = await getSql();
    const journey = await resolveDoctorJourney(sql, context.userId, data.journeyId);
    const next = normalizeJourneyPlan(data.plan);
    const nextStatus =
      journey.current_version > 0 && journey.journey_status !== "draft"
        ? "in_review"
        : "draft";

    await sql`
      update journeys
      set draft_plan = ${JSON.stringify(next)},
          plan = ${JSON.stringify(next.legacy)},
          journey_status = ${nextStatus},
          plan_updated_at = now(),
          updated_at = now()
      where id = ${journey.id}
    `;

    const rows = await sql<JourneyRow>`select * from journeys where id = ${journey.id}`;
    return loadSnapshot(sql, rows[0]!, "doctor");
  });

export const publishJourney = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { journeyId?: string | null }) => data)
  .handler(async ({ context, data }): Promise<JournalSnapshot> => {
    const sql = await getSql();
    const journey = await resolveDoctorJourney(sql, context.userId, data.journeyId);
    const draft = normalizeJourneyPlan(
      parseJson<unknown>(journey.draft_plan, parseJson<unknown>(journey.plan, {})),
    );
    const version = Number(journey.current_version || 0) + 1;
    const publishedAt = new Date().toISOString();

    await sql`
      insert into journey_versions (
        id, journey_id, version, plan, published_by_user_id, published_at
      ) values (
        ${crypto.randomUUID()},
        ${journey.id},
        ${version},
        ${JSON.stringify(draft)},
        ${context.userId},
        ${publishedAt}
      )
    `;

    await sql`
      update journeys
      set published_plan = ${JSON.stringify(draft)},
          draft_plan = ${JSON.stringify(draft)},
          plan = ${JSON.stringify(draft.legacy)},
          journey_status = 'published',
          current_version = ${version},
          published_at = ${publishedAt},
          plan_updated_at = now(),
          updated_at = now()
      where id = ${journey.id}
    `;

    const rows = await sql<JourneyRow>`select * from journeys where id = ${journey.id}`;
    return loadSnapshot(sql, rows[0]!, "doctor");
  });

export const saveJourneyResponse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      moduleId: string;
      occurredOn: string;
      answers: Record<string, JourneyAnswerValue>;
    }) => data,
  )
  .handler(async ({ context, data }): Promise<JourneyModuleResponse> => {
    const sql = await getSql();
    const journey = await resolvePatientJourney(sql, context.userId);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.occurredOn)) {
      throw new Error("Data de registro inválida.");
    }

    const publishedPlan = parseJourneyPlan(journey.published_plan, journey.plan);
    const module = publishedPlan.modules.find(
      (item) => item.id === data.moduleId && item.enabled,
    );
    if (!module) {
      throw new Error("Este módulo não está ativo na Jornada publicada.");
    }

    const sanitizedAnswers = sanitizeModuleAnswers(module, data.answers ?? {});

    const existingRows = await sql<{
      id: string;
      module_id: string;
      occurred_on: string;
      answers: string;
      created_at: string;
      updated_at: string;
    }>`
      select
        id,
        module_id,
        occurred_on::text,
        answers,
        created_at::text,
        updated_at::text
      from journey_module_responses
      where journey_id = ${journey.id}
        and module_id = ${module.id}
      order by occurred_on desc, created_at desc
    `;

    if (module.frequency.kind !== "event_based") {
      const date = new Date(`${data.occurredOn}T12:00:00`);
      const existingResponses = existingRows.map((row) => ({
        id: row.id,
        moduleId: row.module_id,
        occurredOn: row.occurred_on,
        answers: parseJson<Record<string, JourneyAnswerValue>>(row.answers, {}),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      const duplicate = existingResponses.find((response) =>
        responseMatchesPeriod(module, response, date),
      );

      if (!duplicate && !moduleIsDue(module, date, existingResponses)) {
        throw new Error("Este registro não está previsto para esta data.");
      }

      if (duplicate) {
        await sql`
          update journey_module_responses
          set answers = ${JSON.stringify(sanitizedAnswers)},
              occurred_on = ${data.occurredOn},
              updated_at = now()
          where id = ${duplicate.id}
            and journey_id = ${journey.id}
        `;
        const rows = await sql<{
          id: string;
          module_id: string;
          occurred_on: string;
          answers: string;
          created_at: string;
          updated_at: string;
        }>`
          select
            id,
            module_id,
            occurred_on::text,
            answers,
            created_at::text,
            updated_at::text
          from journey_module_responses
          where id = ${duplicate.id}
        `;
        const row = rows[0]!;
        const savedAnswers = parseJson<Record<string, JourneyAnswerValue>>(row.answers, {});
        await recordConfiguredAlerts(
          sql,
          journey,
          module,
          row.id,
          row.occurred_on,
          savedAnswers,
        );
        return {
          id: row.id,
          moduleId: row.module_id,
          occurredOn: row.occurred_on,
          answers: savedAnswers,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
    }

    const id = crypto.randomUUID();
    await sql`
      insert into journey_module_responses (
        id, journey_id, module_id, occurred_on, answers
      ) values (
        ${id},
        ${journey.id},
        ${module.id},
        ${data.occurredOn},
        ${JSON.stringify(sanitizedAnswers)}
      )
    `;

    await notifyDoctor(sql, journey, `registrou: ${module.title}`);

    const rows = await sql<{
      id: string;
      module_id: string;
      occurred_on: string;
      answers: string;
      created_at: string;
      updated_at: string;
    }>`
      select
        id,
        module_id,
        occurred_on::text,
        answers,
        created_at::text,
        updated_at::text
      from journey_module_responses
      where id = ${id}
    `;
    const row = rows[0]!;
    const savedAnswers = parseJson<Record<string, JourneyAnswerValue>>(row.answers, {});
    await recordConfiguredAlerts(
      sql,
      journey,
      module,
      row.id,
      row.occurred_on,
      savedAnswers,
    );
    return {
      id: row.id,
      moduleId: row.module_id,
      occurredOn: row.occurred_on,
      answers: savedAnswers,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

export const updateJourneyActionProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      actionType: "task" | "exam";
      actionId: string;
      status: "pending" | "scheduled" | "completed";
      scheduledDate?: string;
      note?: string;
    }) => data,
  )
  .handler(async ({ context, data }): Promise<JourneyActionProgress> => {
    const sql = await getSql();
    const journey = await resolvePatientJourney(sql, context.userId);
    const published = parseJourneyPlan(journey.published_plan, journey.plan);

    const task =
      data.actionType === "task"
        ? published.tasks.find(
            (item) => item.id === data.actionId && item.visibleToPatient,
          )
        : undefined;
    const exam =
      data.actionType === "exam"
        ? published.exams.find(
            (item) => item.id === data.actionId && item.visibleToPatient,
          )
        : undefined;

    if (!task && !exam) {
      throw new Error("Esta ação não faz parte da Jornada publicada.");
    }

    if (data.actionType === "task" && data.status === "scheduled") {
      throw new Error("Tarefas só podem ser marcadas como pendentes ou concluídas.");
    }
    if (task && task.responsible !== "patient") {
      throw new Error("Esta tarefa não é de responsabilidade do paciente.");
    }

    const scheduledDate = String(data.scheduledDate ?? "");
    if (data.status === "scheduled" && !scheduledDate) {
      throw new Error("Informe a data do agendamento.");
    }
    if (
      scheduledDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)
    ) {
      throw new Error("Data agendada inválida.");
    }

    const note = String(data.note ?? "").slice(0, 1000);
    const completedAt = data.status === "completed" ? new Date().toISOString() : null;

    await sql`
      insert into journey_action_progress (
        journey_id,
        action_type,
        action_id,
        status,
        scheduled_date,
        note,
        completed_at,
        updated_by_user_id,
        updated_at
      ) values (
        ${journey.id},
        ${data.actionType},
        ${data.actionId},
        ${data.status},
        ${scheduledDate || null},
        ${note},
        ${completedAt},
        ${context.userId},
        now()
      )
      on conflict (journey_id, action_type, action_id)
      do update set
        status = excluded.status,
        scheduled_date = excluded.scheduled_date,
        note = excluded.note,
        completed_at = excluded.completed_at,
        updated_by_user_id = excluded.updated_by_user_id,
        updated_at = now()
    `;

    const rows = await sql<{
      action_type: "task" | "exam";
      action_id: string;
      status: "pending" | "scheduled" | "completed" | "cancelled";
      scheduled_date: string | null;
      note: string;
      completed_at: string | null;
      updated_at: string;
    }>`
      select
        action_type,
        action_id,
        status,
        scheduled_date::text,
        note,
        completed_at::text,
        updated_at::text
      from journey_action_progress
      where journey_id = ${journey.id}
        and action_type = ${data.actionType}
        and action_id = ${data.actionId}
    `;
    const row = rows[0]!;
    const label = task?.title ?? exam?.title ?? "ação";
    await notifyDoctor(
      sql,
      journey,
      data.status === "completed"
        ? `concluiu: ${label}`
        : data.status === "scheduled"
          ? `informou agendamento: ${label}`
          : `reabriu: ${label}`,
    );

    return {
      actionType: row.action_type,
      actionId: row.action_id,
      status: row.status,
      scheduledDate: row.scheduled_date ?? "",
      note: row.note,
      completedAt: row.completed_at,
      updatedAt: row.updated_at,
    };
  });

export const saveDayLog = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { journeyId?: string | null; date: string; patch: DayLog }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const journey = await resolvePatientJourney(sql, context.userId);
    const existing = await sql<{ log: string }>`
      select log from day_logs where journey_id = ${journey.id} and day = ${data.date}
    `;
    const next: DayLog = { ...parseJson<DayLog>(existing[0]?.log, {}), ...data.patch };
    await sql`
      insert into day_logs (journey_id, day, log)
      values (${journey.id}, ${data.date}, ${JSON.stringify(next)})
      on conflict (journey_id, day) do update set log = excluded.log
    `;
    await notifyDoctor(sql, journey, summarizeDayPatch(data.date, data.patch));
    return true;
  });

export const saveMonthNotes = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: { journeyId?: string | null; month: string; patch: Partial<MonthNotes> }) => data,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const journey = await resolvePatientJourney(sql, context.userId);
    const existing = await sql<{ notes: string }>`
      select notes from month_notes
      where journey_id = ${journey.id} and month = ${data.month}
    `;
    const next: MonthNotes = { ...parseJson<MonthNotes>(existing[0]?.notes, {}), ...data.patch };
    await sql`
      insert into month_notes (journey_id, month, notes)
      values (${journey.id}, ${data.month}, ${JSON.stringify(next)})
      on conflict (journey_id, month) do update set notes = excluded.notes
    `;
    await notifyDoctor(sql, journey, `atualizou o resumo de ${data.month}`);
    return true;
  });

export type { TaskMeta };
