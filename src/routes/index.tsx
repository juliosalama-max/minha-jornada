import { createFileRoute, Link } from "@tanstack/react-router";
import { addMonths, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, Stethoscope, TriangleAlert } from "lucide-react";
import { HabitRing } from "@/components/habit-ring";
import { NoticeFeed } from "@/components/notice-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatLong, hasAnyLog, monthStats, toKey } from "@/lib/calendar";
import { CARE_FOCUS, EMERGENCY_COPY } from "@/lib/constants";
import { useJournal } from "@/lib/journal-store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const name = useJournal((s) => s.profile.name);
  const days = useJournal((s) => s.days);
  const consults = useJournal((s) => s.consults);
  const tasks = useJournal((s) => s.tasks);
  const role = useJournal((s) => s.role);
  const inviteCode = useJournal((s) => s.inviteCode);
  const doctorName = useJournal((s) => s.doctorName);
  const plan = useJournal((s) => s.plan);
  const patients = useJournal((s) => s.patients);
  const journeyId = useJournal((s) => s.journeyId);
  const today = new Date();
  const stats = monthStats(today, days);
  const todayLog = days[toKey(today)];
  const doneToday = hasAnyLog(todayLog);
  const nextConsult = consults.find((c) => !c.date) ?? consults.find((c) => {
    if (!c.date) return false;
    return parseISO(c.date) >= new Date(toKey(today));
  });
  const upcomingDated = consults
    .filter((c) => c.date && parseISO(c.date) >= new Date(toKey(today)))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const shown = upcomingDated ?? nextConsult;
  const tasksDone = tasks.filter((t) => t.done).length;
  const greeting = greetingFor(today);
  const first = name.trim().split(" ")[0];

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          {format(today, "MMMM yyyy", { locale: ptBR })}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {greeting}
          {first ? `, ${first}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground first-letter:uppercase">{formatLong(today)}</p>
      </header>

      {role === "patient" && (
        <Card className="overflow-hidden">
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div>
              <p className="font-display text-lg font-semibold">Como será nossa jornada</p>
              <p className="text-sm text-muted-foreground">
                Veja o plano montado para você.
              </p>
            </div>
            <Button asChild>
              <Link to="/jornada">
                Abrir
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {plan.motivation && (
        <section className="rounded-xl bg-accent/70 p-4 text-accent-foreground">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Sua jornada
          </p>
          <p className="mt-1 text-sm leading-relaxed">{plan.motivation}</p>
        </section>
      )}

      {role === "doctor" && patients.find((p) => p.id === journeyId)?.pending && inviteCode && (
        <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Aguardando o paciente
          </p>
          <p className="mt-1 text-sm">
            Envie o código{" "}
            <span className="font-mono tracking-[0.18em]">{inviteCode}</span>. Quando
            ele entrar no app com esse código, o plano já aparece montado.
          </p>
        </section>
      )}

      {role === "doctor" && !patients.find((p) => p.id === journeyId)?.pending && (
        <p className="text-sm text-muted-foreground">
          Você está vendo a jornada compartilhada. Qualquer alteração fica
          disponível para o paciente na conta dele.
        </p>
      )}

      {plan.workOn && (
        <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            O que vamos trabalhar
          </p>
          <p className="mt-1 text-sm leading-relaxed">{plan.workOn}</p>
        </section>
      )}

      {role === "doctor" && <NoticeFeed />}

      {role === "doctor" ? (
        <Card className="overflow-hidden">
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div>
              <p className="font-display text-lg font-semibold">Plano deste paciente</p>
              <p className="text-sm text-muted-foreground">
                Ajuste consultas, pilares e tarefas na Jornada.
              </p>
            </div>
            <Button asChild>
              <Link to="/jornada">
                Montar
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div>
              <p className="font-display text-lg font-semibold">Registro de hoje</p>
              <p className="text-sm text-muted-foreground">
                {doneToday ? "Você já anotou este dia." : "Ainda não preenchido."}
              </p>
            </div>
            <Button asChild>
              <Link to="/hoje">
                {doneToday ? "Revisar" : "Registrar"}
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">Este mês</h2>
          <Link to="/mes" className="text-xs font-medium text-primary">
            Ver calendários
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <HabitRing
            value={stats.applications}
            max={5}
            label="Aplicações"
            detail={`${stats.applications} no mês`}
          />
          <HabitRing
            value={stats.walks}
            max={stats.daysTotal}
            label="Caminhada"
            detail={`${stats.walks} ${stats.walks === 1 ? "dia" : "dias"} · ${stats.walkMinutes} min`}
          />
          <HabitRing
            value={stats.gymSessions}
            max={stats.gymTarget}
            label="Musculação"
            detail={`${stats.gymSessions} de ${stats.gymTarget} (meta 3×/sem)`}
          />
          <HabitRing
            value={stats.cpapNights}
            max={stats.daysTotal}
            label="CPAP"
            detail={
              stats.cpapNights
                ? `${stats.cpapAvg.toFixed(1)} h média · ${stats.cpapFullNights} ${stats.cpapFullNights === 1 ? "noite completa" : "noites completas"}`
                : "Sem registros"
            }
          />
          <HabitRing
            value={stats.mealsOk}
            max={stats.daysTotal}
            label="Refeições"
            detail={`${stats.mealsOk} ${stats.mealsOk === 1 ? "dia ok" : "dias ok"} · ${stats.mealsFast} ${stats.mealsFast === 1 ? "jejum" : "jejuns"}`}
          />
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Dias com algum registro</span>
            <span className="tabular-nums">
              {stats.daysLogged}/{stats.daysTotal}
            </span>
          </div>
          <Progress value={(stats.daysLogged / stats.daysTotal) * 100} />
        </div>
      </section>

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <div className="mb-3 flex items-center gap-2">
          <Stethoscope className="size-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Próxima consulta</h2>
        </div>
        {shown ? (
          <div>
            <p className="text-sm font-medium">
              Etapa {shown.stage} · {shown.period}
            </p>
            <p className="text-sm text-muted-foreground">{shown.focus}</p>
            <p className="mt-2 text-sm">
              {shown.date
                ? format(parseISO(shown.date), "d 'de' MMMM", { locale: ptBR })
                : "Data ainda não definida"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma consulta pendente.</p>
        )}
      </section>

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">Tarefas iniciais</h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {tasksDone}/{tasks.length}
          </span>
        </div>
        <Progress value={(tasksDone / tasks.length) * 100} />
        <ul className="mt-3 space-y-1.5">
          {tasks
            .filter((t) => !t.done)
            .slice(0, 3)
            .map((t) => (
              <li key={t.id} className="text-sm text-muted-foreground">
                {t.title}
              </li>
            ))}
        </ul>
        {tasksDone === tasks.length && (
          <Badge variant="mint" className="mt-3">
            Todas concluídas
          </Badge>
        )}
        <Button asChild variant="ghost" className="mt-2 w-full">
          <Link to="/jornada">Ver checklist</Link>
        </Button>
      </section>

      {role === "patient" && (
      <aside className="rounded-xl bg-warn p-4 text-warn-foreground">
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
          <TriangleAlert className="size-3.5" />
          Atenção
        </p>
        <p className="text-sm leading-relaxed">{EMERGENCY_COPY}</p>
      </aside>
      )}

      <p className="px-1 pb-2 text-xs leading-relaxed text-muted-foreground">
        {CARE_FOCUS} Próximo mês: {format(addMonths(today, 1), "MMMM", { locale: ptBR })}.
      </p>
    </div>
  );
}

function greetingFor(date: Date) {
  const h = date.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
