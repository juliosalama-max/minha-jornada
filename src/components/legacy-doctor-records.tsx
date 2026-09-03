import { addMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { MonthGrid } from "@/components/month-grid";
import { Button } from "@/components/ui/button";
import {
  formatMonthTitle,
  formatSymptoms,
  hasAnyLog,
  monthStats,
  toKey,
} from "@/lib/calendar";
import { useJournal } from "@/lib/journal-store";
import type { DayLog } from "@/lib/types";

export function LegacyDoctorRecords() {
  const [month, setMonth] = useState(() => new Date());
  const days = useJournal((s) => s.days);
  const stats = useMemo(() => monthStats(month, days), [month, days]);
  const loggedDays = useMemo(
    () =>
      Object.entries(days)
        .filter(([key, log]) => key.startsWith(format(month, "yyyy-MM")) && hasAnyLog(log))
        .sort(([a], [b]) => b.localeCompare(a)),
    [days, month],
  );

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Registros do paciente
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Acompanhamento anterior
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Visualização somente leitura dos registros feitos no modelo anterior da Jornada.
        </p>
      </header>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonth((value) => addMonths(value, -1))}
          aria-label="Mês anterior"
        >
          <ChevronLeft />
        </Button>
        <h2 className="font-display text-xl font-semibold">
          {formatMonthTitle(month)}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonth((value) => addMonths(value, 1))}
          aria-label="Próximo mês"
        >
          <ChevronRight />
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Dias com registro" value={String(stats.daysLogged)} />
        <Metric label="Caminhadas" value={String(stats.walks)} />
        <Metric label="Treinos de força" value={String(stats.gymSessions)} />
        <Metric label="Noites com CPAP" value={String(stats.cpapNights)} />
      </section>

      <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
        <p className="mb-3 text-sm font-medium">Dias com algum registro</p>
        <MonthGrid
          month={month}
          renderCell={(cell) => <LegacyCell log={days[cell.key]} />}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Linha do tempo do mês</h2>
        {loggedDays.length === 0 ? (
          <div className="rounded-xl bg-card p-5 text-sm text-muted-foreground shadow-[var(--shadow-border)]">
            Nenhum registro neste mês.
          </div>
        ) : (
          loggedDays.map(([key, log]) => (
            <article
              key={key}
              className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
            >
              <p className="text-sm font-medium">
                {format(new Date(`${key}T12:00:00`), "dd/MM/yyyy")}
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                {log.applied && <Row label="Medicação" value="Aplicação registrada" />}
                {log.symptoms?.length ? (
                  <Row label="Sintomas" value={formatSymptoms(log.symptoms)} />
                ) : null}
                {(log.aerobic?.walk ?? log.walkMinutes ?? 0) > 0 && (
                  <Row
                    label="Caminhada"
                    value={`${log.aerobic?.walk ?? log.walkMinutes ?? 0} min`}
                  />
                )}
                {Boolean(log.strength?.gym ?? log.gym) && (
                  <Row label="Musculação" value="Realizada" />
                )}
                {(log.cpapHours ?? 0) > 0 && (
                  <Row label="CPAP" value={`${log.cpapHours} h`} />
                )}
                {(log.sleepHours ?? 0) > 0 && (
                  <Row label="Sono" value={`${log.sleepHours} h`} />
                )}
                {log.meals && <Row label="Alimentação" value={mealLabel(log.meals)} />}
                {log.social && <Row label="Conexões sociais" value={socialLabel(log.social)} />}
              </dl>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function LegacyCell({ log }: { log?: DayLog }) {
  if (!hasAnyLog(log)) return null;
  return <span className="inline-block size-2 rounded-full bg-primary" aria-label="Com registro" />;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function mealLabel(value: NonNullable<DayLog["meals"]>): string {
  if (value === "ok") return "Rotina registrada";
  if (value === "fast") return "Jejum prolongado";
  return "Improvisação das refeições";
}

function socialLabel(value: NonNullable<DayLog["social"]>): string {
  if (value === "support") return "Rede de apoio";
  if (value === "present") return "Presença/conexão";
  return "Solidão percebida";
}
