import { AEROBIC_OPTIONS, MONTHS_PT, STRENGTH_OPTIONS, SYMPTOMS } from "@/lib/constants";
import { JourneyEngineEditor } from "@/components/journey-engine-editor";
import { useJournal } from "@/lib/journal-store";
import type { PlanConfig, SymptomCode, Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PlanEditor() {
  const plan = useJournal((s) => s.plan);
  const setPlan = useJournal((s) => s.setPlan);
  const consults = useJournal((s) => s.consults);
  const setConsults = useJournal((s) => s.setConsults);
  const nutrition = useJournal((s) => s.nutrition);
  const setNutritionList = useJournal((s) => s.setNutritionList);
  const tasks = useJournal((s) => s.tasks);
  const setTasksList = useJournal((s) => s.setTasksList);
  const inviteCode = useJournal((s) => s.inviteCode);
  const patientName = useJournal((s) => s.patientName);
  const showLegacyCompatibility =
    consults.length > 0 ||
    nutrition.length > 0 ||
    tasks.length > 0 ||
    plan.medication.enabled ||
    plan.movement.enabled ||
    plan.sleep.enabled ||
    plan.spirituality.enabled ||
    plan.food.enabled ||
    plan.social.enabled;

  function patchPlan(patch: Partial<PlanConfig>) {
    setPlan(patch);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Montar o plano
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {patientName || "Paciente"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Defina o acompanhamento desta pessoa. O que você marcar aqui é o que
          aparece para ela depois do código
          {inviteCode ? (
            <>
              {" "}
              <span className="font-mono tracking-[0.16em]">{inviteCode}</span>
            </>
          ) : null}
          .
        </p>
      </header>

      <JourneyEngineEditor />

      {showLegacyCompatibility && (
        <details className="rounded-xl border border-dashed border-border p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Acompanhamento anterior · compatibilidade
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Estes controles existem apenas para preservar pacientes e registros do modelo anterior.
            Para novas Jornadas, use o editor V2 acima.
          </p>
          <div className="mt-5 space-y-6">

      <section className="space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold">Compatibilidade com o acompanhamento atual</h2>
        <div className="space-y-1.5">
          <Label htmlFor="mot">Motivação</Label>
          <Textarea
            id="mot"
            value={plan.motivation}
            onChange={(e) => patchPlan({ motivation: e.target.value })}
            placeholder="Por que esta pessoa está no método."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="work">O que vamos trabalhar</Label>
          <Textarea
            id="work"
            value={plan.workOn}
            onChange={(e) => patchPlan({ workOn: e.target.value })}
            placeholder="Resumo do que importa neste ciclo."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="focus">Foco do cuidado</Label>
          <Textarea
            id="focus"
            value={plan.focus}
            onChange={(e) => patchPlan({ focus: e.target.value })}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <Toggle
          label="Medicação"
          on={plan.medication.enabled}
          onToggle={() =>
            patchPlan({ medication: { ...plan.medication, enabled: !plan.medication.enabled } })
          }
        />
        {plan.medication.enabled && (
          <>
            <Toggle
              label="Tem dia de aplicação"
              on={plan.medication.hasInjection}
              onToggle={() =>
                patchPlan({
                  medication: { ...plan.medication, hasInjection: !plan.medication.hasInjection },
                })
              }
            />
            <p className="text-xs font-medium text-muted-foreground">Sintomas para monitorar</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => {
                const on = plan.medication.symptoms.includes(s.code);
                return (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      const next = on
                        ? plan.medication.symptoms.filter((c) => c !== s.code)
                        : [...plan.medication.symptoms, s.code];
                      patchPlan({
                        medication: {
                          ...plan.medication,
                          symptoms: next.length ? next : (["S"] as SymptomCode[]),
                        },
                      });
                    }}
                    className={cn(
                      "rounded-md px-3 py-2 text-xs font-medium",
                      on ? "bg-primary text-primary-foreground" : "bg-secondary",
                    )}
                  >
                    {s.code} · {s.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <Toggle
          label="Pilar movimento"
          on={plan.movement.enabled}
          onToggle={() =>
            patchPlan({ movement: { ...plan.movement, enabled: !plan.movement.enabled } })
          }
        />
        {plan.movement.enabled && (
          <>
            <p className="text-xs font-medium text-muted-foreground">Aeróbico</p>
            <ChipRow
              options={AEROBIC_OPTIONS}
              selected={plan.movement.aerobic}
              onToggle={(id) => {
                const on = plan.movement.aerobic.includes(id);
                const aerobic = on
                  ? plan.movement.aerobic.filter((x) => x !== id)
                  : [...plan.movement.aerobic, id];
                patchPlan({ movement: { ...plan.movement, aerobic } });
              }}
            />
            <p className="text-xs font-medium text-muted-foreground">Força</p>
            <ChipRow
              options={STRENGTH_OPTIONS}
              selected={plan.movement.strength}
              onToggle={(id) => {
                const on = plan.movement.strength.includes(id);
                const strength = on
                  ? plan.movement.strength.filter((x) => x !== id)
                  : [...plan.movement.strength, id];
                patchPlan({ movement: { ...plan.movement, strength } });
              }}
            />
          </>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <Toggle
          label="Pilar sono"
          on={plan.sleep.enabled}
          onToggle={() => patchPlan({ sleep: { ...plan.sleep, enabled: !plan.sleep.enabled } })}
        />
        {plan.sleep.enabled && (
          <div className="grid grid-cols-2 gap-2">
            <Choice
              label="Uso de CPAP"
              on={plan.sleep.mode === "cpap"}
              onClick={() => patchPlan({ sleep: { ...plan.sleep, mode: "cpap" } })}
            />
            <Choice
              label="Sono em geral"
              on={plan.sleep.mode === "general"}
              onClick={() => patchPlan({ sleep: { ...plan.sleep, mode: "general" } })}
            />
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <Toggle
          label="Pilar espiritualidade"
          on={plan.spirituality.enabled}
          onToggle={() =>
            patchPlan({ spirituality: { enabled: !plan.spirituality.enabled } })
          }
        />
        <p className="text-xs text-muted-foreground">
          Oração diária, contato com a natureza, contemplação e meditação.
        </p>
      </section>

      <section className="space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <Toggle
          label="Pilar alimentação"
          on={plan.food.enabled}
          onToggle={() => patchPlan({ food: { enabled: !plan.food.enabled } })}
        />
        <p className="text-xs text-muted-foreground">
          Rotina da nutricionista, jejum prolongado ou improvisação das refeições.
        </p>
      </section>

      <section className="space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <Toggle
          label="Pilar conexões sociais"
          on={plan.social.enabled}
          onToggle={() => patchPlan({ social: { enabled: !plan.social.enabled } })}
        />
        <p className="text-xs text-muted-foreground">
          Rede de apoio, presença ou solidão na semana.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Consultas médicas</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={consults.length >= 12}
            onClick={() =>
              setConsults([
                ...consults,
                {
                  stage: consults.length + 1,
                  period: MONTHS_PT[Math.min(consults.length, 11)],
                  focus: "",
                  date: "",
                },
              ])
            }
          >
            Adicionar
          </Button>
        </div>
        {consults.map((c, i) => (
          <div key={`${c.stage}-${i}`} className="space-y-2 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Encontro {i + 1}</p>
              {consults.length > 1 && (
                <button
                  type="button"
                  className="text-xs text-destructive"
                  onClick={() =>
                    setConsults(
                      consults.filter((_, idx) => idx !== i).map((item, idx) => ({ ...item, stage: idx + 1 })),
                    )
                  }
                >
                  Remover
                </button>
              )}
            </div>
            <Label className="text-xs">Mês</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={c.period}
              onChange={(e) =>
                setConsults(consults.map((item, idx) => (idx === i ? { ...item, period: e.target.value } : item)))
              }
            >
              {MONTHS_PT.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              {!MONTHS_PT.includes(c.period as (typeof MONTHS_PT)[number]) && (
                <option value={c.period}>{c.period}</option>
              )}
            </select>
            <Label className="text-xs">Foco</Label>
            <Input
              value={c.focus}
              onChange={(e) =>
                setConsults(consults.map((item, idx) => (idx === i ? { ...item, focus: e.target.value } : item)))
              }
            />
            <Label className="text-xs">Data (pode ficar em aberto)</Label>
            <Input
              type="date"
              value={c.date}
              onChange={(e) =>
                setConsults(consults.map((item, idx) => (idx === i ? { ...item, date: e.target.value } : item)))
              }
            />
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Consultas com a nutricionista</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={nutrition.length >= 12}
            onClick={() =>
              setNutritionList([...nutrition, { index: nutrition.length + 1, date: "" }])
            }
          >
            Adicionar
          </Button>
        </div>
        {nutrition.map((n, i) => (
          <div key={n.index} className="flex items-end gap-2 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex-1 space-y-1.5">
              <Label>{i + 1}ª consulta</Label>
              <Input
                type="date"
                value={n.date}
                onChange={(e) =>
                  setNutritionList(
                    nutrition.map((item, idx) => (idx === i ? { ...item, date: e.target.value } : item)),
                  )
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setNutritionList(
                  nutrition.filter((_, idx) => idx !== i).map((item, idx) => ({ ...item, index: idx + 1 })),
                )
              }
            >
              Remover
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Tarefas iniciais</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setTasksList([
                ...tasks,
                {
                  id: crypto.randomUUID(),
                  category: "other",
                  title: "",
                  done: false,
                },
              ])
            }
          >
            Adicionar
          </Button>
        </div>
        {tasks.map((t) => (
          <TaskEdit key={t.id} task={t} tasks={tasks} onChange={setTasksList} />
        ))}
      </section>
          </div>
        </details>
      )}
    </div>
  );
}

function TaskEdit({
  task,
  tasks,
  onChange,
}: {
  task: Task;
  tasks: Task[];
  onChange: (next: Task[]) => void;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-card p-3 shadow-[var(--shadow-border)]">
      <Input
        value={task.title}
        placeholder="Descreva a tarefa"
        onChange={(e) =>
          onChange(tasks.map((item) => (item.id === task.id ? { ...item, title: e.target.value } : item)))
        }
      />
      <Button
        type="button"
        variant="ghost"
        onClick={() => onChange(tasks.filter((item) => item.id !== task.id))}
      >
        Remover
      </Button>
    </div>
  );
}

function Toggle({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between text-left">
      <span className="font-display text-lg font-semibold">{label}</span>
      <span className={cn("flex h-6 w-11 items-center rounded-full p-0.5", on ? "bg-primary" : "bg-border")}>
        <span className={cn("size-5 rounded-full bg-card shadow-sm transition-transform", on && "translate-x-5")} />
      </span>
    </button>
  );
}

function Choice({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-3 text-sm font-medium",
        on ? "bg-primary text-primary-foreground" : "bg-secondary",
      )}
    >
      {label}
    </button>
  );
}

function ChipRow<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { id: T; label: string }[];
  selected: T[];
  onToggle: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={cn(
              "rounded-md px-3 py-2 text-xs font-medium",
              on ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

