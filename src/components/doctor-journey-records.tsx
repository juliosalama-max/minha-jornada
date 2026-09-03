import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";
import { responseEntries } from "@/lib/journey-response-format";
import { useJournal } from "@/lib/journal-store";
import type { JourneyModuleResponse } from "@/lib/types";

type Period = "30" | "90" | "all";

export function DoctorJourneyRecords() {
  const plan = useJournal((s) => s.publishedJourneyPlan);
  const responses = useJournal((s) => s.journeyResponses);
  const patientName = useJournal((s) => s.patientName);
  const [period, setPeriod] = useState<Period>("30");
  const [moduleId, setModuleId] = useState("all");

  const activeModules = plan.modules.filter((module) => module.enabled);
  const moduleMap = new Map(activeModules.map((module) => [module.id, module]));
  const filtered = useMemo(() => {
    const byPeriod = filterResponses(responses, period);
    return byPeriod
      .filter((response) => moduleId === "all" || response.moduleId === moduleId)
      .sort((a, b) => {
        const byDate = b.occurredOn.localeCompare(a.occurredOn);
        if (byDate !== 0) return byDate;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [responses, period, moduleId]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Registros do paciente
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {patientName || "Paciente"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Dados informados pelo paciente. Esta área é somente leitura e preserva
          o conteúdo original dos registros.
        </p>
      </header>

      <section className="grid gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Período</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["30", "30 dias"],
                ["90", "90 dias"],
                ["all", "Todo o ciclo"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPeriod(id)}
                className={
                  period === id
                    ? "rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                    : "rounded-md bg-secondary px-3 py-2 text-xs font-medium"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="doctor-module-filter" className="text-xs font-medium text-muted-foreground">
            Módulo
          </label>
          <select
            id="doctor-module-filter"
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={moduleId}
            onChange={(event) => setModuleId(event.target.value)}
          >
            <option value="all">Todos os módulos</option>
            {activeModules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Registros no período" value={String(filtered.length)} />
        <MetricCard
          label="Módulos com registro"
          value={String(new Set(filtered.map((response) => response.moduleId)).size)}
        />
        <MetricCard
          label="Último registro"
          value={
            filtered[0]
              ? format(parseISO(filtered[0].occurredOn), "dd/MM/yyyy")
              : "—"
          }
        />
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-xl bg-card p-5 text-center shadow-[var(--shadow-border)]">
          <p className="font-medium">Nenhum registro neste período.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Os dados aparecerão aqui conforme o paciente preencher a Jornada publicada.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {filtered.map((response) => {
            const module = moduleMap.get(response.moduleId);
            if (!module) return null;
            const entries = responseEntries(module, response);
            return (
              <article
                key={response.id}
                className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                      {module.title}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-semibold capitalize">
                      {format(parseISO(response.occurredOn), "EEEE, d 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Informado pelo paciente
                  </p>
                </div>

                {entries.length > 0 ? (
                  <dl className="mt-4 divide-y divide-border/60">
                    {entries.map(({ question, formatted }) => (
                      <div
                        key={question.id}
                        className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4"
                      >
                        <dt className="text-sm text-muted-foreground">{question.label}</dt>
                        <dd className="text-sm font-medium leading-relaxed sm:text-right">
                          {formatted}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Item marcado como realizado, sem respostas adicionais.
                  </p>
                )}

                {response.updatedAt !== response.createdAt && (
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Registro atualizado posteriormente pelo paciente.
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function filterResponses(
  responses: JourneyModuleResponse[],
  period: Period,
): JourneyModuleResponse[] {
  if (period === "all") return responses;
  const cutoff = subDays(new Date(), Number(period) - 1);
  cutoff.setHours(0, 0, 0, 0);
  return responses.filter(
    (response) => parseISO(response.occurredOn) >= cutoff,
  );
}
