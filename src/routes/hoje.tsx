import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";
import { DayEditor } from "@/components/day-editor";
import { JourneyModuleForm } from "@/components/journey-module-form";
import { formatLong, toKey } from "@/lib/calendar";
import {
  completedModulesForDate,
  dueModulesForDate,
  eventModules,
  isLegacyGeneratedJourney,
} from "@/lib/journey-schedule";
import { useJournal } from "@/lib/journal-store";

export const Route = createFileRoute("/hoje")({ component: HojePage });

function HojePage() {
  const role = useJournal((s) => s.role);
  const journeyPlan = useJournal((s) => s.journeyPlan);
  const responses = useJournal((s) => s.journeyResponses);

  if (role === "doctor") return <Navigate to="/mes" />;

  const date = new Date();
  const key = toKey(date);
  const activeModules = journeyPlan.modules.filter((module) => module.enabled);
  const legacyOnly = isLegacyGeneratedJourney(activeModules);

  if (legacyOnly) {
    return (
      <div className="space-y-4">
        <header className="text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Hoje</h1>
          <p className="text-xs text-muted-foreground first-letter:uppercase">
            {formatLong(date)}
          </p>
        </header>
        <DayEditor dateKey={key} date={date} />
      </div>
    );
  }

  const due = dueModulesForDate(activeModules, date, responses);
  const completed = completedModulesForDate(activeModules, date, responses);
  const events = eventModules(activeModules, date);
  const scheduledTotal = due.length + completed.length;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          {journeyPlan.title || "Minha Jornada"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Hoje</h1>
        <p className="mt-1 text-sm text-muted-foreground first-letter:uppercase">
          {formatLong(date)}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Veja apenas o que faz parte da sua Jornada neste momento.
        </p>
      </header>

      {scheduledTotal > 0 && (
        <section className="rounded-xl bg-accent/60 p-4 text-accent-foreground">
          <p className="text-sm font-medium">
            {completed.length} de {scheduledTotal} registros previstos concluídos
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/60">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${scheduledTotal ? (completed.length / scheduledTotal) * 100 : 0}%`,
              }}
            />
          </div>
        </section>
      )}

      {due.length > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Para registrar</h2>
            <p className="text-xs text-muted-foreground">
              Preencha apenas o que estiver previsto para hoje.
            </p>
          </div>
          {due.map((module) => (
            <JourneyModuleForm key={module.id} module={module} occurredOn={key} />
          ))}
        </section>
      )}

      {completed.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold">Registrado</h2>
          {completed.map((module) => (
            <div
              key={module.id}
              className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
            >
              <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{module.title}</p>
                <p className="text-xs text-muted-foreground">
                  Registro concluído neste período.
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {scheduledTotal === 0 && (
        <section className="rounded-xl bg-card p-5 text-center shadow-[var(--shadow-border)]">
          <p className="font-medium">Nenhum registro previsto para hoje.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Isso não significa que você precise compensar depois. Siga sua Jornada normalmente.
          </p>
        </section>
      )}

      {events.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            <div>
              <h2 className="font-display text-lg font-semibold">Registrar um evento</h2>
              <p className="text-xs text-muted-foreground">
                Use somente quando alguma destas situações acontecer.
              </p>
            </div>
          </div>
          {events.map((module) => (
            <JourneyModuleForm
              key={module.id}
              module={module}
              occurredOn={key}
              collapsible
            />
          ))}
        </section>
      )}
    </div>
  );
}
