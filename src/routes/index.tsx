import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Route as RouteIcon,
  TriangleAlert,
} from "lucide-react";
import { AlertFeed } from "@/components/alert-feed";
import { DoctorPreConsultSummary } from "@/components/doctor-pre-consult-summary";
import { NoticeFeed } from "@/components/notice-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { openCareActionCount, resolvedAppointmentDate } from "@/lib/journey-actions";
import {
  completedModulesForDate,
  dueModulesForDate,
  isLegacyGeneratedJourney,
} from "@/lib/journey-schedule";
import { formatLong } from "@/lib/calendar";
import { EMERGENCY_COPY } from "@/lib/constants";
import { useJournal } from "@/lib/journal-store";
import type { JourneyPlanV2 } from "@/lib/types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const role = useJournal((s) => s.role);
  return role === "doctor" ? <DoctorHome /> : <PatientHome />;
}

function PatientHome() {
  const name = useJournal((s) => s.profile.name);
  const journeyPlan = useJournal((s) => s.journeyPlan);
  const journeyMeta = useJournal((s) => s.journeyMeta);
  const responses = useJournal((s) => s.journeyResponses);
  const days = useJournal((s) => s.days);
  const tasks = useJournal((s) => s.tasks);
  const consults = useJournal((s) => s.consults);
  const actionProgress = useJournal((s) => s.journeyActionProgress);
  const today = new Date();
  const first = name.trim().split(" ")[0];
  const activeModules = journeyPlan.modules.filter((module) => module.enabled);
  const legacyOnly = isLegacyGeneratedJourney(activeModules);

  const due = legacyOnly
    ? []
    : dueModulesForDate(activeModules, today, responses);
  const completed = legacyOnly
    ? []
    : completedModulesForDate(activeModules, today, responses);
  const recentResponses = responses.filter(
    (response) => parseISO(response.occurredOn) >= subDays(today, 6),
  );
  const legacyRecentDays = Object.keys(days).filter(
    (day) => parseISO(day) >= subDays(today, 6),
  ).length;
  const hasVersionedActions =
    journeyPlan.tasks.length > 0 ||
    journeyPlan.exams.length > 0 ||
    journeyPlan.appointments.length > 0;
  const openTasks = tasks.filter((task) => !task.done);
  const pendingCount = hasVersionedActions
    ? openCareActionCount(journeyPlan, actionProgress)
    : openTasks.length;
  const nextV2Appointment = findNextAppointment(journeyPlan, today);
  const nextConsult = nextV2Appointment
    ? null
    : findNextConsult(consults, today);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          {format(today, "MMMM yyyy", { locale: ptBR })}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {greetingFor(today)}
          {first ? `, ${first}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground first-letter:uppercase">
          {formatLong(today)}
        </p>
      </header>

      <section className="rounded-xl bg-accent/60 p-5 text-accent-foreground">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Sua Jornada
          {journeyMeta.currentVersion > 0 ? ` · versão ${journeyMeta.currentVersion}` : ""}
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold">
          {journeyPlan.title || "Acompanhamento atual"}
        </h2>
        {journeyPlan.objective && (
          <p className="mt-2 text-sm leading-relaxed">{journeyPlan.objective}</p>
        )}
        <Button asChild variant="outline" className="mt-4">
          <Link to="/jornada">
            Ver Jornada
            <ArrowRight />
          </Link>
        </Button>
      </section>

      {!legacyOnly && (
        <section className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Para hoje"
            value={String(due.length)}
            detail={
              due.length
                ? `${due.length} ${due.length === 1 ? "registro previsto" : "registros previstos"}`
                : "Nada pendente neste momento"
            }
            icon={ClipboardCheck}
          />
          <SummaryCard
            label="Concluído hoje"
            value={String(completed.length)}
            detail="Registros previstos já realizados"
            icon={CheckCircle2}
          />
          <SummaryCard
            label="Últimos 7 dias"
            value={String(recentResponses.length)}
            detail="Registros enviados"
            icon={CalendarDays}
          />
        </section>
      )}

      {legacyOnly && (
        <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          <p className="mt-1 font-display text-2xl font-semibold">
            {legacyRecentDays}
          </p>
          <p className="text-sm text-muted-foreground">
            dias com dados no acompanhamento anterior
          </p>
        </section>
      )}

      <ActionCard
        title="Hoje"
        detail={
          legacyOnly
            ? "Abra seu registro diário."
            : due.length
              ? "Há itens previstos na sua Jornada."
              : "Nenhum registro previsto agora."
        }
        to="/hoje"
        buttonLabel={due.length || legacyOnly ? "Abrir" : "Ver hoje"}
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <InfoCard
          title="Próxima consulta"
          content={
            nextV2Appointment
              ? format(parseISO(nextV2Appointment.date), "d 'de' MMMM", { locale: ptBR })
              : nextConsult
                ? nextConsult.date
                  ? format(parseISO(nextConsult.date), "d 'de' MMMM", { locale: ptBR })
                  : "Data ainda não definida"
                : "Nenhuma consulta prevista"
          }
          detail={
            nextV2Appointment?.appointment.notes ||
            nextV2Appointment?.appointment.professional ||
            nextConsult?.focus ||
            undefined
          }
        />
        <InfoCard
          title="Pendências"
          content={
            pendingCount
              ? `${pendingCount} ${pendingCount === 1 ? "item" : "itens"}`
              : "Nenhuma tarefa pendente"
          }
          detail="Consultas, exames e tarefas do acompanhamento."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/pendencias">Ver pendências</Link>
            </Button>
          }
        />
      </section>

      <ActionCard
        title="Evolução"
        detail="Veja seus registros ao longo do tempo, sem pontuação de desempenho."
        to="/mes"
        buttonLabel="Abrir"
      />

      <aside className="rounded-xl bg-warn p-4 text-warn-foreground">
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
          <TriangleAlert className="size-3.5" />
          Atenção
        </p>
        <p className="text-sm leading-relaxed">{EMERGENCY_COPY}</p>
      </aside>
    </div>
  );
}

function DoctorHome() {
  const patientName = useJournal((s) => s.patientName);
  const journeyPlan = useJournal((s) => s.publishedJourneyPlan);
  const journeyMeta = useJournal((s) => s.journeyMeta);
  const responses = useJournal((s) => s.journeyResponses);
  const tasks = useJournal((s) => s.tasks);
  const consults = useJournal((s) => s.consults);
  const actionProgress = useJournal((s) => s.journeyActionProgress);
  const inviteCode = useJournal((s) => s.inviteCode);
  const patients = useJournal((s) => s.patients);
  const journeyId = useJournal((s) => s.journeyId);
  const patientSummary = patients.find((patient) => patient.id === journeyId);
  const activeModules = journeyPlan.modules.filter((module) => module.enabled);
  const hasVersionedActions =
    journeyPlan.tasks.length > 0 ||
    journeyPlan.exams.length > 0 ||
    journeyPlan.appointments.length > 0;
  const openTasks = tasks.filter((task) => !task.done);
  const pendingCount = hasVersionedActions
    ? openCareActionCount(journeyPlan, actionProgress, "doctor")
    : openTasks.length;
  const nextV2Appointment = findNextAppointment(journeyPlan, new Date());
  const nextConsult = nextV2Appointment ? null : findNextConsult(consults, new Date());
  const lastResponse = [...responses].sort((a, b) =>
    b.occurredOn.localeCompare(a.occurredOn),
  )[0];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Visão geral
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {patientName || "Paciente"}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="outline">
            {statusLabel(journeyMeta.status)}
          </Badge>
          {journeyMeta.currentVersion > 0 && (
            <Badge variant="outline">Versão {journeyMeta.currentVersion}</Badge>
          )}
        </div>
      </header>

      {patientSummary?.pending && inviteCode && (
        <section className="rounded-xl bg-accent/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Aguardando entrada do paciente
          </p>
          <p className="mt-2 text-sm">
            Código de convite:{" "}
            <span className="font-mono font-medium tracking-[0.18em]">{inviteCode}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            O paciente só conseguirá utilizar uma Jornada publicada.
          </p>
        </section>
      )}

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          Jornada atual
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold">
          {journeyPlan.title || "Sem título"}
        </h2>
        {journeyPlan.objective && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {journeyPlan.objective}
          </p>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Módulos ativos"
          value={String(activeModules.length)}
          detail="Definidos neste ciclo"
          icon={RouteIcon}
        />
        <SummaryCard
          label="Registros"
          value={String(responses.length)}
          detail={
            lastResponse
              ? `Último em ${format(parseISO(lastResponse.occurredOn), "dd/MM")}`
              : "Nenhum registro V2"
          }
          icon={ClipboardCheck}
        />
        <SummaryCard
          label="Pendências"
          value={String(pendingCount)}
          detail="Tarefas e exames ainda abertos"
          icon={CheckCircle2}
        />
        <SummaryCard
          label="Próxima consulta"
          value={
            nextV2Appointment
              ? format(parseISO(nextV2Appointment.date), "dd/MM")
              : nextConsult?.date
                ? format(parseISO(nextConsult.date), "dd/MM")
                : "—"
          }
          detail={
            nextV2Appointment
              ? nextV2Appointment.appointment.professional || "Consulta prevista"
              : nextConsult
                ? nextConsult.focus || "Consulta prevista"
                : "Sem consulta"
          }
          icon={CalendarDays}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <ActionCard
          title="Jornada"
          detail="Editar rascunho, revisar módulos e publicar nova versão."
          to="/jornada"
          buttonLabel="Abrir"
        />
        <ActionCard
          title="Registros"
          detail="Ver dados informados pelo paciente em modo somente leitura."
          to="/mes"
          buttonLabel="Abrir"
        />
        <ActionCard
          title="Pendências"
          detail="Revisar tarefas, exames e próximos encontros."
          to="/pendencias"
          buttonLabel="Abrir"
        />
      </section>

      <DoctorPreConsultSummary />
      <AlertFeed journeyOnly />
      <NoticeFeed />
    </div>
  );
}

function ActionCard({
  title,
  detail,
  to,
  buttonLabel,
}: {
  title: string;
  detail: string;
  to: "/hoje" | "/jornada" | "/mes" | "/pendencias";
  buttonLabel: string;
}) {
  return (
    <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      <Button asChild className="mt-4">
        <Link to={to}>
          {buttonLabel}
          <ArrowRight />
        </Link>
      </Button>
    </section>
  );
}

function InfoCard({
  title,
  content,
  detail,
  action,
}: {
  title: string;
  content: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 font-display text-lg font-semibold">{content}</p>
      {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}
      {action && <div className="mt-2">{action}</div>}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof ClipboardCheck;
}) {
  return (
    <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </section>
  );
}

function findNextConsult(
  consults: Array<{ date: string; focus: string; stage: number; period: string }>,
  today: Date,
) {
  const todayKey = format(today, "yyyy-MM-dd");
  const dated = consults
    .filter((consult) => consult.date && consult.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  return dated ?? consults.find((consult) => !consult.date);
}

function findNextAppointment(
  plan: JourneyPlanV2,
  today: Date,
) {
  const todayKey = format(today, "yyyy-MM-dd");
  return plan.appointments
    .filter(
      (appointment) =>
        appointment.visibleToPatient &&
        appointment.status !== "cancelled" &&
        appointment.status !== "completed",
    )
    .map((appointment) => ({
      appointment,
      date: resolvedAppointmentDate(plan, appointment),
    }))
    .filter((item) => item.date && item.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

function statusLabel(status: string): string {
  if (status === "published") return "Publicada";
  if (status === "in_review") return "Em revisão";
  if (status === "completed") return "Concluída";
  if (status === "archived") return "Arquivada";
  return "Rascunho";
}

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
