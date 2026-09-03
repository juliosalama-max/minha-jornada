import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import {
  DEFAULT_CONSULTS,
  DEFAULT_NUTRITION,
  DEFAULT_TASKS,
} from "@/lib/constants";
import type {
  DayLog,
  DoctorNotice,
  JournalSnapshot,
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

function emptySnapshot(): JournalSnapshot {
  return {
    onboarded: false,
    profile: {
      name: "",
      firstConsultDate: "",
      injectionWeekday: null,
      dose: "",
    },
    consults: DEFAULT_CONSULTS.map((c) => ({ ...c })),
    nutrition: DEFAULT_NUTRITION.map((c) => ({ ...c })),
    tasks: DEFAULT_TASKS.map((t) => ({ ...t, meta: t.meta ? { ...t.meta } : undefined })),
    days: {},
    monthNotes: {},
    plan: emptyPlan(),
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

async function loadSnapshot(sql: Sql, journey: JourneyRow): Promise<JournalSnapshot> {
  const dayRows = await sql<{ day: string; log: string }>`
    select day, log from day_logs where journey_id = ${journey.id}
  `;
  const noteRows = await sql<{ month: string; notes: string }>`
    select month, notes from month_notes where journey_id = ${journey.id}
  `;
  const days: Record<string, DayLog> = {};
  for (const r of dayRows) days[r.day] = parseJson<DayLog>(r.log, {});
  const monthNotes: Record<string, MonthNotes> = {};
  for (const r of noteRows) monthNotes[r.month] = parseJson<MonthNotes>(r.notes, {});
  return {
    onboarded: Boolean(journey.onboarded),
    profile: rowProfile(journey),
    consults: parseJson<MedicalConsult[]>(journey.consults, emptySnapshot().consults),
    nutrition: parseJson<NutritionConsult[]>(journey.nutrition, emptySnapshot().nutrition),
    tasks: parseJson<Task[]>(journey.tasks, emptySnapshot().tasks),
    days,
    monthNotes,
    plan: parsePlan(journey.plan),
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
          first_consult_date, injection_weekday, dose, consults, nutrition, tasks, plan
        ) values (
          ${id}, ${userId}, ${invite}, false, ${name},
          '', null, '',
          ${JSON.stringify(seed.consults)},
          ${JSON.stringify(seed.nutrition)},
          ${JSON.stringify(seed.tasks)},
          ${JSON.stringify(seed.plan)}
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

async function getProfile(sql: Sql, userId: string) {
  const rows = await sql<{ user_id: string; role: Role; display_name: string }>`
    select user_id, role, display_name from profiles where user_id = ${userId}
  `;
  return rows[0] ?? null;
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
  const profile = await getProfile(sql, userId);
  if (!profile || profile.role !== "doctor") {
    throw new Error("Apenas a equipe médica pode alterar o plano.");
  }
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
    };

async function loadBootstrap(
  sql: Sql,
  userId: string,
  requestedJourneyId?: string | null,
): Promise<Bootstrap> {
  const profile = await getProfile(sql, userId);
  if (!profile) return { kind: "needs-role" };

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
      snapshot: await loadSnapshot(sql, journey),
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
    snapshot: active ? await loadSnapshot(sql, active) : null,
    inviteCode: active?.invite_code ?? null,
    patientName: active?.name ?? null,
    notices: await loadNotices(sql, userId),
  };
}

export const getBootstrap = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { journeyId?: string | null } | undefined) => data ?? {})
  .handler(async ({ context, data }): Promise<Bootstrap> => {
    const sql = await getSql();
    return loadBootstrap(sql, context.userId, data.journeyId);
  });

export const listDoctorNotices = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DoctorNotice[]> => {
    const sql = await getSql();
    const profile = await getProfile(sql, context.userId);
    if (!profile || profile.role !== "doctor") return [];
    return loadNotices(sql, context.userId);
  });

export const markNoticesRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { ids?: string[] } | undefined) => data ?? {})
  .handler(async ({ context, data }): Promise<DoctorNotice[]> => {
    const sql = await getSql();
    const profile = await getProfile(sql, context.userId);
    if (!profile || profile.role !== "doctor") return [];
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
      if (!existing || existing.role !== "doctor") {
        throw new Error("Contas profissionais são liberadas apenas pela administração.");
      }
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
    const profile = await getProfile(sql, context.userId);
    if (!profile || profile.role !== "doctor") {
      throw new Error("Apenas a equipe médica pode criar um plano.");
    }
    const name = data.patientName.trim();
    if (!name) throw new Error("Informe o nome do paciente.");
    const seed = emptySnapshot();
    const first = data.firstConsultDate ?? "";
    const consults = seed.consults.map((c, i) =>
      i === 0 && first ? { ...c, date: first } : { ...c },
    );
    for (let i = 0; i < 8; i++) {
      const id = crypto.randomUUID();
      const invite = makeInviteCode();
      try {
        await sql`
          insert into journeys (
            id, patient_user_id, doctor_user_id, invite_code, onboarded, name,
            first_consult_date, injection_weekday, dose, consults, nutrition, tasks, plan
          ) values (
            ${id}, null, ${context.userId}, ${invite}, true, ${name},
            ${first}, null, '',
            ${JSON.stringify(consults)},
            ${JSON.stringify(seed.nutrition)},
            ${JSON.stringify(seed.tasks)},
            ${JSON.stringify(seed.plan)}
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
    const profile = await getProfile(sql, context.userId);
    if (!profile || profile.role !== "doctor") {
      throw new Error("Apenas a equipe médica pode vincular pacientes.");
    }
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
    await sql`
      update journeys
      set plan = ${JSON.stringify(normalizePlan(data.plan))},
          updated_at = now()
      where id = ${journey.id}
    `;
    return true;
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
