import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { buildPreConsultSummary } from "@/lib/pre-consult-summary";
import { useJournal } from "@/lib/journal-store";

type Period = 14 | 30 | 90;

export function DoctorPreConsultSummary() {
  const plan = useJournal((s) => s.publishedJourneyPlan);
  const responses = useJournal((s) => s.journeyResponses);
  const progress = useJournal((s) => s.journeyActionProgress);
  const alerts = useJournal((s) => s.alerts);
  const journeyId = useJournal((s) => s.journeyId);
  const [days, setDays] = useState<Period>(30);

  const patientAlerts = useMemo(
    () => alerts.filter((alert) => alert.journeyId === journeyId),
    [alerts, journeyId],
  );
  const summary = useMemo(
    () =>
      buildPreConsultSummary({
        plan,
        responses,
        progress,
        alerts: patientAlerts,
        days,
      }),
    [plan, responses, progress, patientAlerts, days],
  );

  return (
    <section className="space-y-4 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <ClipboardList className="size-4 text-primary" />
            Resumo pré-consulta
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Síntese descritiva dos dados registrados. Não substitui avaliação clínica.
          </p>
        </div>
        <div className="flex gap-1">
          {([14, 30, 90] as const).map((period) => (
            <button
              key={period}
              type="button"
              className={
                days === period
                  ? "rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
                  : "rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium"
              }
              onClick={() => setDays(period)}
            >
              {period + " dias"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Registros" value={String(summary.totalResponses)} />
        <Metric label="Dias registrados" value={String(summary.daysWithResponses)} />
        <Metric label="Módulos ativos no período" value={String(summary.modulesWithResponses)} />
        <Metric label="Ações abertas" value={String(summary.openCareActions)} />
        <Metric label="Alertas no período" value={String(summary.alertsInPeriod)} />
      </div>

      {summary.upcomingAppointments.length > 0 && (
        <div>
          <p className="text-sm font-medium">Próximos encontros</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {summary.upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="rounded-lg bg-secondary/50 p-3">
                <p className="text-sm font-medium">{appointment.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(parseISO(appointment.date), "d 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Módulos com registros no período</p>
        {summary.moduleSummaries.length === 0 ? (
          <p className="rounded-lg bg-secondary/40 p-3 text-sm text-muted-foreground">
            Nenhum registro V2 neste período.
          </p>
        ) : (
          summary.moduleSummaries.map((module) => (
            <details
              key={module.moduleId}
              className="rounded-lg border border-border/60 bg-background/50 p-3"
            >
              <summary className="cursor-pointer">
                <span className="text-sm font-medium">{module.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {module.responseCount} {module.responseCount === 1 ? "registro" : "registros"}
                  {module.lastResponseOn
                    ? " · último " + module.lastResponseOn.split("-").reverse().join("/")
                    : ""}
                </span>
              </summary>

              {module.highlights.length > 0 ? (
                <dl className="mt-3 divide-y divide-border/60">
                  {module.highlights.map((highlight) => (
                    <div
                      key={highlight.label}
                      className="grid gap-1 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-4"
                    >
                      <dt className="text-muted-foreground">{highlight.label}</dt>
                      <dd className="font-medium sm:text-right">{highlight.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  Registros sem campos resumíveis adicionais.
                </p>
              )}
            </details>
          ))
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
