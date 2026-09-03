import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DayLog, MealsStatus, SymptomEntry } from "./types";

export function toKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseKey(key: string): Date {
  return parseISO(key);
}

export function monthKey(date: Date): string {
  return format(date, "yyyy-MM");
}

export function formatLong(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatMonthTitle(date: Date): string {
  const raw = format(date, "MMMM yyyy", { locale: ptBR });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function mondayOffset(date: Date): number {
  return (getDay(date) + 6) % 7;
}

export type GridCell = {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
};

export function monthGrid(month: Date): GridCell[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const pad = mondayOffset(start);
  const first = addDays(start, -pad);
  const lastWeekday = mondayOffset(end);
  const last = addDays(end, 6 - lastWeekday);
  return eachDayOfInterval({ start: first, end: last }).map((date) => ({
    date,
    key: toKey(date),
    inMonth: isSameMonth(date, month),
    isToday: isToday(date),
  }));
}

export function daysInMonth(month: Date): Date[] {
  return eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
}

export function isInjectionDay(date: Date, weekday: number | null): boolean {
  if (weekday === null) return false;
  return getDay(date) === weekday;
}

export function emptyDay(): DayLog {
  return {};
}

export function hasAnyLog(log: DayLog | undefined): boolean {
  if (!log) return false;
  return Boolean(
    log.applied ||
      (log.symptoms && log.symptoms.length > 0) ||
      (log.walkMinutes && log.walkMinutes > 0) ||
      log.gym ||
      (log.cpapHours && log.cpapHours > 0) ||
      log.cpapFullNight ||
      log.meals,
  );
}

export function formatSymptoms(entries: SymptomEntry[] | undefined): string {
  if (!entries || entries.length === 0) return "";
  return entries
    .map((s) => (s.code === "S" ? "S" : `${s.code}${s.intensity}`))
    .join(" ");
}

export type MonthStats = {
  daysLogged: number;
  daysTotal: number;
  applications: number;
  walks: number;
  walkMinutes: number;
  gymSessions: number;
  gymTarget: number;
  cpapNights: number;
  cpapFullNights: number;
  cpapAvg: number;
  mealsOk: number;
  mealsFast: number;
};

export function monthStats(month: Date, days: Record<string, DayLog>): MonthStats {
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
  const daysLogged = logs.filter(hasAnyLog).length;

  return {
    daysLogged,
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
    mealsFast,
  };
}

export function todayKey(): string {
  return toKey(new Date());
}

export function isSameDateKey(a: string, b: Date): boolean {
  return isSameDay(parseISO(a), b);
}

export const MEAL_LABEL: Record<MealsStatus, string> = {
  ok: "Rotina ok",
  fast: "Jejum longo",
  improv: "Improviso",
};
