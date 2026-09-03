import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { S as getSql, d as DEFAULT_NUTRITION, f as DEFAULT_TASKS, u as DEFAULT_CONSULTS, y as authMiddleware } from "./constants-Bbft6W_r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/journal-api-oX_XQb9-.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function parseJson(raw, fallback) {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}
function emptySnapshot() {
	return {
		onboarded: false,
		profile: {
			name: "",
			firstConsultDate: "",
			injectionWeekday: null,
			dose: ""
		},
		consults: DEFAULT_CONSULTS.map((c) => ({ ...c })),
		nutrition: DEFAULT_NUTRITION.map((c) => ({ ...c })),
		tasks: DEFAULT_TASKS.map((t) => ({
			...t,
			meta: t.meta ? { ...t.meta } : void 0
		})),
		days: {},
		monthNotes: {}
	};
}
function rowProfile(row) {
	return {
		name: row.name,
		firstConsultDate: row.first_consult_date,
		injectionWeekday: row.injection_weekday,
		dose: row.dose
	};
}
async function loadSnapshot(sql, journey) {
	const dayRows = await sql`
    select day, log from day_logs where journey_id = ${journey.id}
  `;
	const noteRows = await sql`
    select month, notes from month_notes where journey_id = ${journey.id}
  `;
	const days = {};
	for (const r of dayRows) days[r.day] = parseJson(r.log, {});
	const monthNotes = {};
	for (const r of noteRows) monthNotes[r.month] = parseJson(r.notes, {});
	return {
		onboarded: Boolean(journey.onboarded),
		profile: rowProfile(journey),
		consults: parseJson(journey.consults, emptySnapshot().consults),
		nutrition: parseJson(journey.nutrition, emptySnapshot().nutrition),
		tasks: parseJson(journey.tasks, emptySnapshot().tasks),
		days,
		monthNotes
	};
}
function makeInviteCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	const bytes = /* @__PURE__ */ new Uint8Array(6);
	crypto.getRandomValues(bytes);
	return [...bytes].map((b) => alphabet[b % 32]).join("");
}
async function createPatientJourney(sql, userId, name) {
	const seed = emptySnapshot();
	for (let i = 0; i < 8; i++) {
		const id = crypto.randomUUID();
		const invite = makeInviteCode();
		try {
			await sql`
        insert into journeys (
          id, patient_user_id, invite_code, onboarded, name,
          first_consult_date, injection_weekday, dose, consults, nutrition, tasks
        ) values (
          ${id}, ${userId}, ${invite}, false, ${name},
          '', null, '',
          ${JSON.stringify(seed.consults)},
          ${JSON.stringify(seed.nutrition)},
          ${JSON.stringify(seed.tasks)}
        )
      `;
			return (await sql`select * from journeys where id = ${id}`)[0];
		} catch {}
	}
	throw new Error("Não foi possível criar o código de acompanhamento.");
}
async function getProfile(sql, userId) {
	return (await sql`
    select user_id, role, display_name from profiles where user_id = ${userId}
  `)[0] ?? null;
}
async function patientJourney(sql, userId) {
	return (await sql`
    select * from journeys where patient_user_id = ${userId}
  `)[0] ?? null;
}
async function resolveWritableJourney(sql, userId, journeyId) {
	const profile = await getProfile(sql, userId);
	if (!profile) throw new Error("Perfil não encontrado");
	if (profile.role === "patient") {
		const row = await patientJourney(sql, userId);
		if (!row) throw new Error("Jornada não encontrada");
		return row;
	}
	if (!journeyId) throw new Error("Selecione um paciente");
	const rows = await sql`
    select * from journeys
    where id = ${journeyId} and doctor_user_id = ${userId}
  `;
	if (!rows[0]) throw new Error("Sem permissão para esta jornada");
	return rows[0];
}
async function doctorNameFor(sql, doctorUserId) {
	if (!doctorUserId) return null;
	return (await sql`
    select display_name from profiles where user_id = ${doctorUserId}
  `)[0]?.display_name || null;
}
async function loadBootstrap(sql, userId, requestedJourneyId) {
	const profile = await getProfile(sql, userId);
	if (!profile) return { kind: "needs-role" };
	if (profile.role === "patient") {
		let journey = await patientJourney(sql, userId);
		if (!journey) journey = await createPatientJourney(sql, userId, profile.display_name);
		return {
			kind: "patient",
			journeyId: journey.id,
			inviteCode: journey.invite_code,
			doctorName: await doctorNameFor(sql, journey.doctor_user_id),
			snapshot: await loadSnapshot(sql, journey)
		};
	}
	const patientRows = await sql`
    select * from journeys
    where doctor_user_id = ${userId}
    order by name asc
  `;
	const patients = patientRows.map((r) => ({
		id: r.id,
		name: r.name || "Paciente",
		inviteCode: r.invite_code,
		onboarded: Boolean(r.onboarded)
	}));
	let active;
	if (requestedJourneyId) active = patientRows.find((r) => r.id === requestedJourneyId);
	else if (requestedJourneyId === void 0 && patientRows.length === 1) active = patientRows[0];
	return {
		kind: "doctor",
		journeyId: active?.id ?? null,
		patients,
		doctorName: profile.display_name,
		snapshot: active ? await loadSnapshot(sql, active) : null,
		inviteCode: active?.invite_code ?? null,
		patientName: active?.name ?? null
	};
}
var getBootstrap_createServerFn_handler = createServerRpc({
	id: "1b0ac0cec49946a15bba5de64ca5c2092d634b1f80f3fef34ee8d7fe0e610eac",
	name: "getBootstrap",
	filename: "src/lib/journal-api.ts"
}, (opts) => getBootstrap.__executeServer(opts));
var getBootstrap = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(getBootstrap_createServerFn_handler, async ({ context, data }) => {
	return loadBootstrap(await getSql(), context.userId, data.journeyId);
});
var chooseRole_createServerFn_handler = createServerRpc({
	id: "7f61b51001e006a2f7bf4f00df9719e502be18e2f18f026c77e97ed0f4d6f009",
	name: "chooseRole",
	filename: "src/lib/journal-api.ts"
}, (opts) => chooseRole.__executeServer(opts));
var chooseRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({
	role: data.role === "doctor" ? "doctor" : "patient",
	name: data.name.trim()
})).handler(chooseRole_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!await getProfile(sql, context.userId)) await sql`
        insert into profiles (user_id, role, display_name)
        values (${context.userId}, ${data.role}, ${data.name})
      `;
	return loadBootstrap(sql, context.userId, null);
});
var linkPatientByCode_createServerFn_handler = createServerRpc({
	id: "455d17bd5d826cd69b3a7718924f6d34c906ced29ba60ae7b51718371d06308f",
	name: "linkPatientByCode",
	filename: "src/lib/journal-api.ts"
}, (opts) => linkPatientByCode.__executeServer(opts));
var linkPatientByCode = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({ code: data.code.replace(/[^A-Za-z0-9]/g, "").toUpperCase() })).handler(linkPatientByCode_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const profile = await getProfile(sql, context.userId);
	if (!profile || profile.role !== "doctor") throw new Error("Apenas a equipe médica pode vincular pacientes.");
	if (data.code.length < 6) throw new Error("Código incompleto.");
	const journey = (await sql`
      select * from journeys where invite_code = ${data.code}
    `)[0];
	if (!journey) throw new Error("Código não encontrado.");
	if (journey.doctor_user_id && journey.doctor_user_id !== context.userId) throw new Error("Esta jornada já está vinculada a outra profissional.");
	await sql`
      update journeys
      set doctor_user_id = ${context.userId}, updated_at = now()
      where id = ${journey.id}
    `;
	return loadBootstrap(sql, context.userId, journey.id);
});
var saveOnboarding_createServerFn_handler = createServerRpc({
	id: "54df7c4dc9564b8f7189fc354ad78c8b737624851236f3f0f62af919b99f7f8c",
	name: "saveOnboarding",
	filename: "src/lib/journal-api.ts"
}, (opts) => saveOnboarding.__executeServer(opts));
var saveOnboarding = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveOnboarding_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const journey = await resolveWritableJourney(sql, context.userId, data.journeyId);
	const name = data.profile.name ?? journey.name;
	await sql`
      update journeys
      set onboarded = true,
          name = ${name},
          first_consult_date = ${data.profile.firstConsultDate ?? journey.first_consult_date},
          injection_weekday = ${data.profile.injectionWeekday === void 0 ? journey.injection_weekday : data.profile.injectionWeekday},
          dose = ${data.profile.dose ?? journey.dose},
          updated_at = now()
      where id = ${journey.id}
    `;
	await sql`
      update profiles set display_name = ${name}
      where user_id = ${journey.patient_user_id}
    `;
	return true;
});
var saveProfile_createServerFn_handler = createServerRpc({
	id: "339b5a8b92d0bedf055073daa02630900ea672dfcc49be7371147625968a4178",
	name: "saveProfile",
	filename: "src/lib/journal-api.ts"
}, (opts) => saveProfile.__executeServer(opts));
var saveProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const journey = await resolveWritableJourney(sql, context.userId, data.journeyId);
	await sql`
      update journeys
      set name = ${data.profile.name},
          first_consult_date = ${data.profile.firstConsultDate},
          injection_weekday = ${data.profile.injectionWeekday},
          dose = ${data.profile.dose},
          updated_at = now()
      where id = ${journey.id}
    `;
	await sql`
      update profiles set display_name = ${data.profile.name}
      where user_id = ${journey.patient_user_id}
    `;
	return true;
});
var saveConsults_createServerFn_handler = createServerRpc({
	id: "aa5ff95d6331f253f74bd0df334ace4e78297fbc90d7976a683932668f99a413",
	name: "saveConsults",
	filename: "src/lib/journal-api.ts"
}, (opts) => saveConsults.__executeServer(opts));
var saveConsults = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveConsults_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const journey = await resolveWritableJourney(sql, context.userId, data.journeyId);
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
var saveTasks_createServerFn_handler = createServerRpc({
	id: "2913e2c0068a16f0b27917b5460d9f4aeef22828b1693b356c31418cb7df3b94",
	name: "saveTasks",
	filename: "src/lib/journal-api.ts"
}, (opts) => saveTasks.__executeServer(opts));
var saveTasks = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveTasks_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const journey = await resolveWritableJourney(sql, context.userId, data.journeyId);
	await sql`
      update journeys
      set tasks = ${JSON.stringify(data.tasks)},
          updated_at = now()
      where id = ${journey.id}
    `;
	return true;
});
var saveDayLog_createServerFn_handler = createServerRpc({
	id: "9db50b72520feea187c3eb8feacef7d53ace57c684415294934a28b26761a267",
	name: "saveDayLog",
	filename: "src/lib/journal-api.ts"
}, (opts) => saveDayLog.__executeServer(opts));
var saveDayLog = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveDayLog_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const journey = await resolveWritableJourney(sql, context.userId, data.journeyId);
	const next = {
		...parseJson((await sql`
      select log from day_logs where journey_id = ${journey.id} and day = ${data.date}
    `)[0]?.log, {}),
		...data.patch
	};
	await sql`
      insert into day_logs (journey_id, day, log)
      values (${journey.id}, ${data.date}, ${JSON.stringify(next)})
      on conflict (journey_id, day) do update set log = excluded.log
    `;
	return true;
});
var saveMonthNotes_createServerFn_handler = createServerRpc({
	id: "9f1d79ae34595bfdb30c792b5dbdea8db45d2e51751f90308c9eb299840dfaab",
	name: "saveMonthNotes",
	filename: "src/lib/journal-api.ts"
}, (opts) => saveMonthNotes.__executeServer(opts));
var saveMonthNotes = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveMonthNotes_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const journey = await resolveWritableJourney(sql, context.userId, data.journeyId);
	const next = {
		...parseJson((await sql`
      select notes from month_notes
      where journey_id = ${journey.id} and month = ${data.month}
    `)[0]?.notes, {}),
		...data.patch
	};
	await sql`
      insert into month_notes (journey_id, month, notes)
      values (${journey.id}, ${data.month}, ${JSON.stringify(next)})
      on conflict (journey_id, month) do update set notes = excluded.notes
    `;
	return true;
});
var resetJourney_createServerFn_handler = createServerRpc({
	id: "bfcf546444c8655f7a61eb1ab1f5064394c1b2dcd67a1c6d6bd3406a42320844",
	name: "resetJourney",
	filename: "src/lib/journal-api.ts"
}, (opts) => resetJourney.__executeServer(opts));
var resetJourney = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(resetJourney_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const profile = await getProfile(sql, context.userId);
	if (!profile || profile.role !== "patient") throw new Error("Apenas o paciente pode zerar a própria jornada.");
	const journey = await resolveWritableJourney(sql, context.userId, data.journeyId);
	const seed = emptySnapshot();
	await sql`delete from day_logs where journey_id = ${journey.id}`;
	await sql`delete from month_notes where journey_id = ${journey.id}`;
	await sql`
      update journeys
      set onboarded = false,
          name = ${profile.display_name},
          first_consult_date = '',
          injection_weekday = null,
          dose = '',
          consults = ${JSON.stringify(seed.consults)},
          nutrition = ${JSON.stringify(seed.nutrition)},
          tasks = ${JSON.stringify(seed.tasks)},
          updated_at = now()
      where id = ${journey.id}
    `;
	return loadBootstrap(sql, context.userId, null);
});
//#endregion
export { chooseRole_createServerFn_handler, getBootstrap_createServerFn_handler, linkPatientByCode_createServerFn_handler, resetJourney_createServerFn_handler, saveConsults_createServerFn_handler, saveDayLog_createServerFn_handler, saveMonthNotes_createServerFn_handler, saveOnboarding_createServerFn_handler, saveProfile_createServerFn_handler, saveTasks_createServerFn_handler };
