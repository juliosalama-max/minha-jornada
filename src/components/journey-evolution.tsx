import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";
import { responseEntries } from "@/lib/journey-response-format";
import { useJournal } from "@/lib/journal-store";
import type {
  JourneyModule,
  JourneyModuleResponse,
  JourneyQuestion,
} from "@/lib/types";

type Period = "7" | "30" | "90" | "all";

export function JourneyEvolution() {
  const plan = useJournal((s) => s.journeyPlan);
  const responses = useJournal((s) => s.journeyResponses);
  const [period, setPeriod] = useState<Period>("30");
  const [moduleId, setModuleId] = useState("all");

  const activeModules = plan.modules.filter((module) => module.enabled);
  const filteredResponses = useMemo(
    () => filterResponses(responses, period),
    [responses, period],
  );
  const visibleModules =
    moduleId === "all"
      ? activeModules
      : activeModules.filter((module) => module.id === moduleId);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          {plan.title || "Minha Jornada"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Evolução
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Veja seus registros ao longo do tempo. Estes dados ajudam a observar padrões;
          não são uma nota de desempenho.
        </p>
      </header>

      <section className="space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Período</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["7", "7 dias"],
                ["30", "30 dias"],
                ["90", "3 meses"],
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
          <label className="text-xs font-medium text-muted-foreground" htmlFor="module-filter">
            Módulo
          </label>
          <select
            id="module-filter"
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

      {visibleModules.map((module) => (
        <ModuleEvolution
          key={module.id}
          module={module}
          responses={filteredResponses.filter(
            (response) => response.moduleId === module.id,
          )}
        />
      ))}

      {visibleModules.length === 0 && (
        <section className="rounded-xl bg-card p-5 text-center shadow-[var(--shadow-border)]">
          <p className="font-medium">Nenhum módulo ativo neste ciclo.</p>
        </section>
      )}
    </div>
  );
}

function ModuleEvolution({
  module,
  responses,
}: {
  module: JourneyModule;
  responses: JourneyModuleResponse[];
}) {
  const sorted = [...responses].sort((a, b) =>
    b.occurredOn.localeCompare(a.occurredOn),
  );
  const last = sorted[0];

  return (
    <section className="space-y-4 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">{module.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {responses.length} {responses.length === 1 ? "registro" : "registros"}
          </p>
        </div>
        {last && (
          <p className="text-xs text-muted-foreground">
            Último: {format(parseISO(last.occurredOn), "d 'de' MMM", { locale: ptBR })}
          </p>
        )}
      </div>

      {responses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ainda não há registros deste módulo no período selecionado.
        </p>
      ) : (
        <>
          {module.questions.map((question) => (
            <QuestionEvolution
              key={question.id}
              question={question}
              responses={responses}
            />
          ))}

          {module.questions.length === 0 && (
            <RecentDates responses={sorted} />
          )}
        </>
      )}
    </section>
  );
}

function QuestionEvolution({
  question,
  responses,
}: {
  question: JourneyQuestion;
  responses: JourneyModuleResponse[];
}) {
  const values = responses
    .map((response) => ({
      response,
      value: response.answers[question.id],
    }))
    .filter(({ value }) => value !== undefined && value !== null && value !== "");

  if (values.length === 0) return null;

  if (
    question.type === "scale" ||
    question.type === "number" ||
    question.type === "duration"
  ) {
    const numbers = values
      .map(({ value }) => (typeof value === "number" ? value : Number.NaN))
      .filter(Number.isFinite);
    if (numbers.length === 0) return null;
    const average = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
    const suffix = question.type === "duration" ? " min" : "";
    return (
      <div className="rounded-lg bg-secondary/50 p-3">
        <p className="text-sm font-medium">{question.label}</p>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Metric label="Média" value={`${formatNumber(average)}${suffix}`} />
          <Metric label="Menor" value={`${formatNumber(Math.min(...numbers))}${suffix}`} />
          <Metric label="Maior" value={`${formatNumber(Math.max(...numbers))}${suffix}`} />
        </dl>
      </div>
    );
  }

  if (question.type === "boolean" || question.type === "event") {
    const yes = values.filter(({ value }) => value === true).length;
    const no = values.filter(({ value }) => value === false).length;
    return (
      <Distribution
        title={question.label}
        rows={[
          ["Sim", yes],
          ["Não", no],
        ]}
      />
    );
  }

  if (
    question.type === "single_choice" ||
    question.type === "emotion"
  ) {
    const rows = (question.options ?? []).map(
      (option) =>
        [
          option.label,
          values.filter(({ value }) => value === option.id).length,
        ] as [string, number],
    );
    return <Distribution title={question.label} rows={rows} />;
  }

  if (question.type === "multiple_choice") {
    const rows = (question.options ?? []).map((option) => [
      option.label,
      values.filter(
        ({ value }) => Array.isArray(value) && value.includes(option.id),
      ).length,
    ] as [string, number]);
    return <Distribution title={question.label} rows={rows} />;
  }

  const recent = values
    .sort((a, b) => b.response.occurredOn.localeCompare(a.response.occurredOn))
    .slice(0, 4);

  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <p className="text-sm font-medium">{question.label}</p>
      <div className="mt-2 space-y-2">
        {recent.map(({ response, value }) => (
          <div key={response.id} className="text-sm">
            <p className="text-xs text-muted-foreground">
              {format(parseISO(response.occurredOn), "d 'de' MMM", { locale: ptBR })}
            </p>
            <p className="mt-0.5 leading-relaxed">
              {Array.isArray(value) ? value.join(", ") : String(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Distribution({
  title,
  rows,
}: {
  title: string;
  rows: [string, number][];
}) {
  const max = Math.max(1, ...rows.map(([, count]) => count));
  const total = rows.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-3 space-y-2">
        {rows
          .filter(([, count]) => count > 0 || rows.length <= 4)
          .map(([label, count]) => (
            <div key={label}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span>{label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {count}{total ? ` · ${Math.round((count / total) * 100)}%` : ""}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function RecentDates({ responses }: { responses: JourneyModuleResponse[] }) {
  return (
    <div>
      <p className="text-sm font-medium">Registros recentes</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {responses.slice(0, 8).map((response) => (
          <span
            key={response.id}
            className="rounded-md bg-secondary px-2.5 py-1.5 text-xs"
          >
            {format(parseISO(response.occurredOn), "d MMM", { locale: ptBR })}
          </span>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function filterResponses(
  responses: JourneyModuleResponse[],
  period: Period,
): JourneyModuleResponse[] {
  if (period === "all") return responses;
  const days = Number(period);
  const cutoff = subDays(new Date(), days - 1);
  cutoff.setHours(0, 0, 0, 0);
  return responses.filter(
    (response) => parseISO(response.occurredOn) >= cutoff,
  );
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}
