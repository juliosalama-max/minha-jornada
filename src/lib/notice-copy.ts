import { AEROBIC_OPTIONS, STRENGTH_OPTIONS, SYMPTOMS } from "./constants";
import type { DayLog } from "./types";

export function summarizeDayPatch(date: string, patch: DayLog): string {
  const bits: string[] = [];
  if (patch.applied) bits.push("aplicou a medicação");
  if (patch.symptoms?.length) {
    const labels = patch.symptoms
      .map((s) => SYMPTOMS.find((x) => x.code === s.code)?.label ?? s.code)
      .join(", ");
    bits.push(`sintomas: ${labels}`);
  }
  if (patch.otherNote) bits.push(`observação: ${patch.otherNote}`);
  const aerobic = patch.aerobic ?? {};
  for (const [kind, mins] of Object.entries(aerobic)) {
    if (!mins) continue;
    const label = AEROBIC_OPTIONS.find((o) => o.id === kind)?.label ?? kind;
    bits.push(`${label} ${mins} min`);
  }
  if (patch.walkMinutes) bits.push(`caminhada ${patch.walkMinutes} min`);
  if (patch.gym) bits.push("musculação");
  const strength = patch.strength ?? {};
  for (const [kind, on] of Object.entries(strength)) {
    if (!on) continue;
    bits.push(STRENGTH_OPTIONS.find((o) => o.id === kind)?.label ?? kind);
  }
  if (patch.cpapHours) bits.push(`CPAP ${patch.cpapHours} h`);
  if (patch.sleepHours) bits.push(`sono ${patch.sleepHours} h`);
  if (patch.sleepSatisfied) bits.push("sono satisfatório");
  if (patch.prayer) bits.push("oração");
  if (patch.nature) bits.push("contato com a natureza");
  if (patch.contemplation) bits.push("contemplação");
  if (patch.meditation) bits.push("meditação");
  if (patch.meals === "ok") bits.push("seguiu a rotina alimentar");
  if (patch.meals === "fast") bits.push("jejum prolongado");
  if (patch.meals === "improv") bits.push("improvisou as refeições");
  if (patch.social === "support") bits.push("teve rede de apoio");
  if (patch.social === "present") bits.push("se sentiu presente");
  if (patch.social === "lonely") bits.push("se sentiu sozinho");
  const when = formatBrDate(date);
  if (!bits.length) return `${when}: atualizou o registro do dia`;
  return `${when}: ${bits.join("; ")}`;
}

function formatBrDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!d) return iso;
  return `${d}/${m}/${y}`;
}
