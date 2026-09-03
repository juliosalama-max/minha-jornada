import type { LucideIcon } from "lucide-react";
import { Droplets, Footprints, Moon, Salad, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";
import { AEROBIC_OPTIONS, STRENGTH_OPTIONS, SYMPTOMS } from "@/lib/constants";
import { isInjectionDay } from "@/lib/calendar";
import { useJournal } from "@/lib/journal-store";
import type { AerobicKind, DayLog, MealsStatus, SocialStatus, SymptomCode, SymptomEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  dateKey: string;
  date: Date;
};

const EMPTY_LOG: DayLog = {};

export function DayEditor({ dateKey, date }: Props) {
  const log = useJournal((s) => s.days[dateKey]) ?? EMPTY_LOG;
  const patch = useJournal((s) => s.patchDay);
  const weekday = useJournal((s) => s.profile.injectionWeekday);
  const plan = useJournal((s) => s.plan);
  const inj = isInjectionDay(date, weekday);
  const symptoms = SYMPTOMS.filter((s) => plan.medication.symptoms.includes(s.code));

  return (
    <div className="space-y-5">
      {plan.medication.enabled && (
        <Section icon={Droplets} title="Medicação e efeitos">
          {plan.medication.hasInjection && inj && (
            <p className="mb-3 rounded-md bg-accent px-3 py-2 text-xs text-accent-foreground">
              Dia fixo da aplicação.
            </p>
          )}
          {plan.medication.hasInjection && (
            <ToggleRow
              label="Apliquei hoje"
              on={Boolean(log.applied)}
              onToggle={() => patch(dateKey, { applied: !log.applied })}
            />
          )}
          <p className="mt-4 mb-2 text-xs font-medium text-muted-foreground">
            Sintomas · intensidade 0 a 3
          </p>
          <div className="flex flex-col gap-2">
            {symptoms.map((s) => {
              const current = log.symptoms?.find((x) => x.code === s.code);
              const active = Boolean(current);
              return (
                <div key={s.code} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => patch(dateKey, { symptoms: toggleSymptom(log, s.code) })}
                    className={cn(
                      "flex h-10 min-w-14 items-center justify-center rounded-md text-xs font-semibold",
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {s.code}
                  </button>
                  <span className="flex-1 text-sm">{s.label}</span>
                  {s.code !== "S" && (
                    <div className="flex gap-1">
                      {[1, 2, 3].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => patch(dateKey, { symptoms: setIntensity(log, s.code, n) })}
                          className={cn(
                            "size-9 rounded-md text-xs font-semibold tabular-nums",
                            current?.intensity === n
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground",
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {log.symptoms?.some((s) => s.code === "O") && (
            <div className="mt-3 space-y-1.5">
              <Label htmlFor="other">Descreva o outro sintoma</Label>
              <Input
                id="other"
                value={log.otherNote ?? ""}
                onChange={(e) => patch(dateKey, { otherNote: e.target.value })}
              />
            </div>
          )}
        </Section>
      )}

      {plan.movement.enabled && (
        <Section icon={Footprints} title="Movimento">
          {plan.movement.aerobic.map((kind) => (
            <MinutesRow
              key={kind}
              label={AEROBIC_OPTIONS.find((o) => o.id === kind)?.label ?? kind}
              value={minutesFor(log, kind)}
              onChange={(n) => patch(dateKey, { aerobic: { ...(log.aerobic ?? {}), [kind]: n } })}
            />
          ))}
          {plan.movement.strength.map((kind) => (
            <div key={kind} className="mt-3">
              <ToggleRow
                label={STRENGTH_OPTIONS.find((o) => o.id === kind)?.label ?? kind}
                on={Boolean(log.strength?.[kind] ?? (kind === "gym" ? log.gym : false))}
                onToggle={() =>
                  patch(dateKey, {
                    strength: {
                      ...(log.strength ?? {}),
                      [kind]: !(log.strength?.[kind] ?? (kind === "gym" ? log.gym : false)),
                    },
                  })
                }
              />
            </div>
          ))}
        </Section>
      )}

      {plan.sleep.enabled && (
        <Section icon={Moon} title="Sono">
          {plan.sleep.mode === "cpap" ? (
            <>
              <MinutesRow
                label="Horas de CPAP"
                value={log.cpapHours ?? 0}
                step={0.5}
                suffix="h"
                onChange={(n) => patch(dateKey, { cpapHours: n })}
              />
              <div className="mt-3">
                <ToggleRow
                  label="Usei durante todo o sono"
                  on={Boolean(log.cpapFullNight)}
                  onToggle={() => patch(dateKey, { cpapFullNight: !log.cpapFullNight })}
                />
              </div>
            </>
          ) : (
            <>
              <MinutesRow
                label="Horas de sono"
                value={log.sleepHours ?? 0}
                step={0.5}
                suffix="h"
                onChange={(n) => patch(dateKey, { sleepHours: n })}
              />
              <div className="mt-3">
                <ToggleRow
                  label="Me senti satisfeito com o sono"
                  on={Boolean(log.sleepSatisfied)}
                  onToggle={() => patch(dateKey, { sleepSatisfied: !log.sleepSatisfied })}
                />
              </div>
            </>
          )}
        </Section>
      )}

      {plan.spirituality.enabled && (
        <Section icon={Sparkles} title="Espiritualidade">
          <ToggleRow
            label="Oração diária"
            on={Boolean(log.prayer)}
            onToggle={() => patch(dateKey, { prayer: !log.prayer })}
          />
          <div className="mt-2">
            <ToggleRow
              label="Contato com a natureza"
              on={Boolean(log.nature)}
              onToggle={() => patch(dateKey, { nature: !log.nature })}
            />
          </div>
          <div className="mt-2">
            <ToggleRow
              label="Tempo de contemplação"
              on={Boolean(log.contemplation)}
              onToggle={() => patch(dateKey, { contemplation: !log.contemplation })}
            />
          </div>
          <div className="mt-2">
            <ToggleRow
              label="Oração ou meditação"
              on={Boolean(log.meditation)}
              onToggle={() => patch(dateKey, { meditation: !log.meditation })}
            />
          </div>
        </Section>
      )}

      {plan.food.enabled && (
        <Section icon={Salad} title="Alimentação">
          <div className="grid grid-cols-1 gap-2">
            <MealChoice
              label="Segui a rotina da nutricionista"
              hint="✓"
              active={log.meals === "ok"}
              onClick={() => patch(dateKey, { meals: toggleMeal(log.meals, "ok") })}
            />
            <MealChoice
              label="Jejum prolongado"
              hint="J"
              active={log.meals === "fast"}
              onClick={() => patch(dateKey, { meals: toggleMeal(log.meals, "fast") })}
            />
            <MealChoice
              label="Improvisação total das refeições"
              hint="I"
              active={log.meals === "improv"}
              onClick={() => patch(dateKey, { meals: toggleMeal(log.meals, "improv") })}
            />
          </div>
        </Section>
      )}

      {plan.social.enabled && (
        <Section icon={Users} title="Conexões sociais">
          <p className="mb-3 text-xs text-muted-foreground">Como foi a rede de apoio nesta semana.</p>
          <div className="grid gap-2">
            {(
              [
                ["support", "Tive rede de apoio"],
                ["present", "Me senti presente"],
                ["lonely", "Me senti sozinho"],
              ] as [SocialStatus, string][]
            ).map(([id, label]) => (
              <MealChoice
                key={id}
                label={label}
                hint=""
                active={log.social === id}
                onClick={() => patch(dateKey, { social: log.social === id ? undefined : id })}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function minutesFor(log: DayLog, kind: AerobicKind): number {
  if (log.aerobic?.[kind] != null) return log.aerobic[kind] ?? 0;
  if (kind === "walk") return log.walkMinutes ?? 0;
  return 0;
}

function toggleMeal(current: MealsStatus | undefined, next: MealsStatus): MealsStatus | undefined {
  return current === next ? undefined : next;
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function ToggleRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-md bg-secondary/70 px-3 py-3 text-left"
    >
      <span className="text-sm font-medium">{label}</span>
      <span className={cn("flex h-6 w-11 items-center rounded-full p-0.5 transition-colors", on ? "bg-primary" : "bg-border")}>
        <span className={cn("size-5 rounded-full bg-card shadow-sm transition-transform", on && "translate-x-5")} />
      </span>
    </button>
  );
}

function MinutesRow({
  label,
  value,
  onChange,
  step = 10,
  suffix = "min",
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="mt-3">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={() => onChange(Math.max(0, Math.round((value - step) * 10) / 10))}>
          −
        </Button>
        <Input
          type="number"
          min={0}
          step={step}
          inputMode="decimal"
          className="text-center text-lg tabular-nums"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
        <span className="text-sm text-muted-foreground">{suffix}</span>
        <Button type="button" variant="outline" onClick={() => onChange(Math.round((value + step) * 10) / 10)}>
          +
        </Button>
      </div>
    </div>
  );
}

function MealChoice({
  label,
  hint,
  active,
  onClick,
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-12 items-center justify-between rounded-md px-3 py-3 text-left text-sm",
        active ? "bg-primary text-primary-foreground" : "bg-secondary",
      )}
    >
      <span>{label}</span>
      {hint ? <span className="text-xs font-semibold">{hint}</span> : null}
    </button>
  );
}

function toggleSymptom(log: DayLog, code: SymptomCode): SymptomEntry[] {
  const current = log.symptoms ?? [];
  if (current.some((s) => s.code === code)) return current.filter((s) => s.code !== code);
  if (code === "S") return [{ code: "S", intensity: 0 }];
  return [...current.filter((s) => s.code !== "S"), { code, intensity: 1 }];
}

function setIntensity(log: DayLog, code: SymptomCode, intensity: number): SymptomEntry[] {
  const current = log.symptoms ?? [];
  const found = current.find((s) => s.code === code);
  if (!found) return [...current.filter((s) => s.code !== "S"), { code, intensity }];
  return current.map((s) => (s.code === code ? { ...s, intensity } : s));
}

