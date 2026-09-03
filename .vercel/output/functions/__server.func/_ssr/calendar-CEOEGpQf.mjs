import { a as getDay, c as eachDayOfInterval, d as addDays, i as isSameMonth, l as endOfMonth, n as parseISO, o as format, r as isToday, s as startOfMonth, t as ptBR } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-CEOEGpQf.js
function toKey(date) {
	return format(date, "yyyy-MM-dd");
}
function parseKey(key) {
	return parseISO(key);
}
function monthKey(date) {
	return format(date, "yyyy-MM");
}
function formatLong(date) {
	return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}
function formatMonthTitle(date) {
	const raw = format(date, "MMMM yyyy", { locale: ptBR });
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}
function mondayOffset(date) {
	return (getDay(date) + 6) % 7;
}
function monthGrid(month) {
	const start = startOfMonth(month);
	const end = endOfMonth(month);
	const pad = mondayOffset(start);
	const first = addDays(start, -pad);
	const lastWeekday = mondayOffset(end);
	const last = addDays(end, 6 - lastWeekday);
	return eachDayOfInterval({
		start: first,
		end: last
	}).map((date) => ({
		date,
		key: toKey(date),
		inMonth: isSameMonth(date, month),
		isToday: isToday(date)
	}));
}
function daysInMonth(month) {
	return eachDayOfInterval({
		start: startOfMonth(month),
		end: endOfMonth(month)
	});
}
function isInjectionDay(date, weekday) {
	if (weekday === null) return false;
	return getDay(date) === weekday;
}
function hasAnyLog(log) {
	if (!log) return false;
	return Boolean(log.applied || log.symptoms && log.symptoms.length > 0 || log.walkMinutes && log.walkMinutes > 0 || log.gym || log.cpapHours && log.cpapHours > 0 || log.cpapFullNight || log.meals);
}
function formatSymptoms(entries) {
	if (!entries || entries.length === 0) return "";
	return entries.map((s) => s.code === "S" ? "S" : `${s.code}${s.intensity}`).join(" ");
}
function monthStats(month, days) {
	const list = daysInMonth(month);
	const logs = list.map((d) => days[toKey(d)]);
	const weeks = Math.max(1, Math.ceil(list.length / 7));
	const walkMinutes = logs.reduce((n, l) => n + (l?.walkMinutes ?? 0), 0);
	const walks = logs.filter((l) => (l?.walkMinutes ?? 0) > 0).length;
	const gymSessions = logs.filter((l) => l?.gym).length;
	const cpapNights = logs.filter((l) => (l?.cpapHours ?? 0) > 0 || l?.cpapFullNight).length;
	const cpapHours = logs.reduce((n, l) => n + (l?.cpapHours ?? 0), 0);
	const cpapFullNights = logs.filter((l) => l?.cpapFullNight).length;
	const mealsOk = logs.filter((l) => l?.meals === "ok").length;
	const mealsFast = logs.filter((l) => l?.meals === "fast").length;
	const applications = logs.filter((l) => l?.applied).length;
	return {
		daysLogged: logs.filter(hasAnyLog).length,
		daysTotal: list.length,
		applications,
		walks,
		walkMinutes,
		gymSessions,
		gymTarget: weeks * 3,
		cpapNights,
		cpapFullNights,
		cpapAvg: cpapNights ? cpapHours / cpapNights : 0,
		mealsOk,
		mealsFast
	};
}
//#endregion
export { isInjectionDay as a, monthStats as c, hasAnyLog as i, parseKey as l, formatMonthTitle as n, monthGrid as o, formatSymptoms as r, monthKey as s, formatLong as t, toKey as u };
