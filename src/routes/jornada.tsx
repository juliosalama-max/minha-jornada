import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Leaf } from "lucide-react";
import { PlanEditor } from "@/components/plan-editor";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AEROBIC_OPTIONS,
  BIOIMPEDANCE_PREP,
  STRENGTH_OPTIONS,
  SYMPTOMS,
  TASK_CATEGORY_LABEL,
} from "@/lib/constants";
import { useJournal } from "@/lib/journal-store";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/jornada")({ component: JornadaPage });

function JornadaPage() {
  const role = useJournal((s) => s.role);
  if (role === "doctor") return <PlanEditor />;
  return <PatientJornada />;
}

function PatientJornada() {
  const consults = useJournal((s) => s.consults);
  const nutrition = useJournal((s) => s.nutrition);
  const tasks = useJournal((s) => s.tasks);
  const plan = useJournal((s) => s.plan);
  const journeyPlan = useJournal((s) => s.journeyPlan);
  const journeyMeta = useJournal((s) => s.journeyMeta);
  const toggleTask = useJournal((s) => s.toggleTask);
  const updateTaskMeta = useJournal((s) => s.updateTaskMeta);
  const done = tasks.filter((t) => t.done).length;
  const categories = Array.from(new Set(tasks.map((t) => t.category)));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Sua Jornada · versão {journeyMeta.currentVersion || 1}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {journeyPlan.title || "Como será nossa jornada"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Este é o mapa montado para você. Use os registros com sinceridade: eles
          não medem perfeição, mostram o que ajustar.
        </p>
      </header>

      {journeyPlan.objective && (
        <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Objetivo deste ciclo
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">{journeyPlan.objective}</p>
        </section>
      )}

      {journeyPlan.priorities.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Prioridades atuais</h2>
          {journeyPlan.priorities.map((priority, index) => (
            <div key={priority.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <p className="text-xs font-semibold text-primary">Prioridade {index + 1}</p>
              <p className="mt-1 font-medium">{priority.title}</p>
              {priority.description && (
                <p className="mt-1 text-sm text-muted-foreground">{priority.description}</p>
              )}
              {priority.tracking && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Como vamos acompanhar: {priority.tracking}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {journeyPlan.modules.length > 0 && (
        <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-lg font-semibold">O que estamos acompanhando</h2>
          <div className="mt-3 grid gap-2">
            {journeyPlan.modules
              .filter((module) => module.enabled)
              .map((module) => (
                <div key={module.id} className="rounded-lg bg-secondary/60 p-3">
                  <p className="text-sm font-medium">{module.title}</p>
                  {module.instructions && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {module.instructions}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {plan.motivation && (
        <section className="rounded-xl bg-accent p-5 text-accent-foreground">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Motivação
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">{plan.motivation}</p>
        </section>
      )}

      {plan.workOn && (
        <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-lg font-semibold">O que vamos trabalhar</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.workOn}</p>
        </section>
      )}

      <section className="rounded-xl bg-accent p-5 text-accent-foreground">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Foco do cuidado
        </p>
        <p className="mt-1.5 text-sm leading-relaxed">{plan.focus}</p>
      </section>

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold">Seu acompanhamento</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed">
          {plan.medication.enabled && (
            <li>
              Medicação
              {plan.medication.hasInjection ? " com dia de aplicação" : ""}
              {plan.medication.symptoms.length
                ? ` · sintomas: ${plan.medication.symptoms
                    .map((c) => SYMPTOMS.find((s) => s.code === c)?.label ?? c)
                    .join(", ")}`
                : ""}
            </li>
          )}
          {plan.movement.enabled && (
            <li>
              Movimento
              {plan.movement.aerobic.length
                ? ` · aeróbico: ${plan.movement.aerobic
                    .map((id) => AEROBIC_OPTIONS.find((o) => o.id === id)?.label ?? id)
                    .join(", ")}`
                : ""}
              {plan.movement.strength.length
                ? ` · força: ${plan.movement.strength
                    .map((id) => STRENGTH_OPTIONS.find((o) => o.id === id)?.label ?? id)
                    .join(", ")}`
                : ""}
            </li>
          )}
          {plan.sleep.enabled && (
            <li>Sono {plan.sleep.mode === "cpap" ? "com CPAP" : "em geral"}</li>
          )}
          {plan.spirituality.enabled && <li>Espiritualidade</li>}
          {plan.food.enabled && <li>Alimentação</li>}
          {plan.social.enabled && <li>Conexões sociais</li>}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Consultas médicas</h2>
        <ol className="space-y-3">
          {consults.map((c, i) => (
            <li key={c.stage} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-semibold",
                    c.date ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {c.stage}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{c.period}</p>
                    {i < consults.length - 1 && c.date && <Badge variant="mint">Agendada</Badge>}
                  </div>
                  {c.focus && <p className="text-sm text-muted-foreground">{c.focus}</p>}
                  <p className="mt-3 text-xs text-muted-foreground">Data</p>
                  <p className="mt-1 text-sm font-medium capitalize">
                    {c.date
                      ? format(parseISO(c.date), "EEEE, d 'de' MMMM", { locale: ptBR })
                      : "A definir pela equipe"}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {nutrition.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Consultas com a nutricionista</h2>
          <div className="grid gap-3">
            {nutrition.map((n) => (
              <div key={n.index} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
                <p className="text-sm font-medium">{n.index}ª consulta</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {n.date
                    ? format(parseISO(n.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : "A definir pela equipe"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {tasks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Minhas tarefas iniciais</h2>
            <span className="text-xs tabular-nums text-muted-foreground">
              {done}/{tasks.length}
            </span>
          </div>
          <Progress value={tasks.length ? (done / tasks.length) * 100 : 0} />
          {categories.map((cat) => (
            <div key={cat} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {TASK_CATEGORY_LABEL[cat] ?? cat}
              </h3>
              {tasks
                .filter((t) => t.category === cat)
                .map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onToggle={() => toggleTask(t.id)}
                    onMeta={(meta) => updateTaskMeta(t.id, meta)}
                  />
                ))}
            </div>
          ))}
        </section>
      )}

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Leaf className="size-4 text-primary" />
          Antes de cada bioimpedância
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{BIOIMPEDANCE_PREP}</p>
      </section>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onMeta,
}: {
  task: Task;
  onToggle: () => void;
  onMeta: (meta: Record<string, string>) => void;
}) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <label className="flex items-start gap-3">
        <Checkbox checked={task.done} onCheckedChange={() => onToggle()} className="mt-0.5" />
        <span className={cn("text-sm leading-relaxed", task.done && "text-muted-foreground line-through")}>
          {task.title}
        </span>
      </label>
      {task.id === "polissonografia" && (
        <div className="mt-3 grid gap-2 pl-8">
          <div>
            <Label htmlFor="psg-date" className="text-xs">
              Data agendada
            </Label>
            <Input
              id="psg-date"
              type="date"
              className="mt-1"
              value={task.meta?.date ?? ""}
              onChange={(e) => onMeta({ date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="psg-local" className="text-xs">
              Local
            </Label>
            <Input
              id="psg-local"
              className="mt-1"
              value={task.meta?.local ?? ""}
              onChange={(e) => onMeta({ local: e.target.value })}
            />
          </div>
        </div>
      )}
      {task.id === "cardio" && (
        <div className="mt-3 grid gap-2 pl-8">
          <div>
            <Label htmlFor="cardio-ex" className="text-xs">
              Exames solicitados
            </Label>
            <Input
              id="cardio-ex"
              className="mt-1"
              value={task.meta?.exams ?? ""}
              onChange={(e) => onMeta({ exams: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="cardio-dt" className="text-xs">
              Data(s)
            </Label>
            <Input
              id="cardio-dt"
              className="mt-1"
              value={task.meta?.dates ?? ""}
              onChange={(e) => onMeta({ dates: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={task.meta?.delivered === "true"}
              onCheckedChange={(v) => onMeta({ delivered: v ? "true" : "false" })}
            />
            Resultado entregue
          </label>
        </div>
      )}
    </div>
  );
}
