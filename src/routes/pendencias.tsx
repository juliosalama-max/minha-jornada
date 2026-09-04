import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Stethoscope,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TASK_CATEGORY_LABEL } from "@/lib/constants";
import {
  actionProgressFor,
  resolvedAppointmentDate,
} from "@/lib/journey-actions";
import { moduleIsDue } from "@/lib/journey-schedule";
import { useJournal } from "@/lib/journal-store";
import type {
  JourneyActionProgress,
  JourneyExam,
  JourneyTask,
  Task,
} from "@/lib/types";

export const Route = createFileRoute("/pendencias")({ component: PendenciasPage });

function PendenciasPage() {
  const role = useJournal((s) => s.role);
  const draftOrPatientPlan = useJournal((s) => s.journeyPlan);
  const publishedPlan = useJournal((s) => s.publishedJourneyPlan);
  const plan = role === "doctor" ? publishedPlan : draftOrPatientPlan;
  const progress = useJournal((s) => s.journeyActionProgress);
  const updateProgress = useJournal((s) => s.updateActionProgress);
  const legacyTasks = useJournal((s) => s.tasks);
  const consults = useJournal((s) => s.consults);
  const nutrition = useJournal((s) => s.nutrition);
  const responses = useJournal((s) => s.journeyResponses);
  const journeyMeta = useJournal((s) => s.journeyMeta);
  const toggleTask = useJournal((s) => s.toggleTask);
  const today = new Date();
  const closed =
    journeyMeta.status === "completed" || journeyMeta.status === "archived";
  const patientCanUpdate = role === "patient" && !closed;

  const visibleTasks =
    role === "patient"
      ? plan.tasks.filter((task) => task.visibleToPatient)
      : plan.tasks;
  const visibleExams =
    role === "patient"
      ? plan.exams.filter((exam) => exam.visibleToPatient)
      : plan.exams;
  const visibleAppointments =
    role === "patient"
      ? plan.appointments.filter((appointment) => appointment.visibleToPatient)
      : plan.appointments;

  const hasVersionedActions =
    plan.tasks.length > 0 ||
    plan.exams.length > 0 ||
    plan.appointments.length > 0;

  const dueQuestionnaires = plan.modules.filter(
    (module) =>
      module.enabled &&
      module.type === "questionnaire" &&
      moduleIsDue(
        module,
        today,
        responses.filter((response) => response.moduleId === module.id),
      ),
  );

  const legacyOpenTasks = legacyTasks.filter(
    (task) => !task.done && task.category !== "exames",
  );
  const legacyExamTasks = legacyTasks.filter(
    (task) => !task.done && task.category === "exames",
  );
  const legacyCompletedTasks = legacyTasks.filter((task) => task.done);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Acompanhamento
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Pendências
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {role === "doctor"
            ? "Ações da última versão publicada desta Jornada."
            : closed
              ? "Consulta em modo histórico. Este ciclo não aceita novas alterações."
              : "Veja o que ainda precisa ser organizado ou realizado ao longo da sua Jornada."}
        </p>
      </header>

      {hasVersionedActions ? (
        <>
          <PendingSection
            icon={ClipboardList}
            title="Tarefas"
            empty="Nenhuma tarefa nesta Jornada."
          >
            {visibleTasks.map((task) => (
              <VersionedTaskCard
                key={task.id}
                task={task}
                progress={actionProgressFor(progress, "task", task.id)}
                patient={role === "patient" && task.responsible === "patient"}
                onStatus={(status) =>
                  void updateProgress("task", task.id, status)
                }
              />
            ))}
          </PendingSection>

          <PendingSection
            icon={FileCheck2}
            title="Exames e avaliações"
            empty="Nenhum exame ou avaliação nesta Jornada."
          >
            {visibleExams.map((exam) => (
              <VersionedExamCard
                key={exam.id}
                exam={exam}
                progress={actionProgressFor(progress, "exam", exam.id)}
                patient={patientCanUpdate}
                onUpdate={(status, scheduledDate) =>
                  updateProgress("exam", exam.id, status, { scheduledDate })
                }
              />
            ))}
          </PendingSection>

          <PendingSection
            icon={Stethoscope}
            title="Consultas e encontros"
            empty="Nenhum encontro previsto."
          >
            {visibleAppointments
              .filter((appointment) => appointment.status !== "cancelled")
              .map((appointment) => {
                const date = resolvedAppointmentDate(plan, appointment);
                return (
                  <div
                    key={appointment.id}
                    className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {appointmentTypeLabel(appointment.type)}
                        </p>
                        {appointment.professional && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {appointment.professional}
                          </p>
                        )}
                        {appointment.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">
                          {appointmentStatusLabel(appointment.status)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {date
                            ? format(parseISO(date), "dd/MM/yyyy")
                            : "Data a definir"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </PendingSection>
        </>
      ) : (
        <LegacyPending
          role={role}
          openTasks={legacyOpenTasks}
          examTasks={legacyExamTasks}
          completedTasks={legacyCompletedTasks}
          consults={consults}
          nutrition={nutrition}
          onToggle={toggleTask}
        />
      )}

      {dueQuestionnaires.length > 0 && (
        <PendingSection
          icon={FileCheck2}
          title="Questionários"
          empty="Nenhum questionário pendente."
        >
          {dueQuestionnaires.map((module) => (
            <div
              key={module.id}
              className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
            >
              <p className="text-sm font-medium">{module.title}</p>
              {module.instructions && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.instructions}
                </p>
              )}
              {patientCanUpdate && (
                <Button asChild size="sm" className="mt-3">
                  <Link to="/hoje">Responder</Link>
                </Button>
              )}
            </div>
          ))}
        </PendingSection>
      )}

      {role === "doctor" && (
        <section className="rounded-xl bg-accent/50 p-4">
          <p className="text-sm text-muted-foreground">
            Alterações em tarefas, exames e consultas devem ser feitas no rascunho e
            publicadas para chegarem ao paciente.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/jornada">Editar Jornada</Link>
          </Button>
        </section>
      )}

      {role === "patient" && (
        <div className="text-center">
          <Button asChild variant="ghost" size="sm">
            <Link to="/perfil">Perfil e configurações</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function VersionedTaskCard({
  task,
  progress,
  patient,
  onStatus,
}: {
  task: JourneyTask;
  progress?: JourneyActionProgress;
  patient: boolean;
  onStatus: (status: "pending" | "completed") => void;
}) {
  const completed = progress?.status === "completed";

  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-start gap-3">
        {patient && (
          <Checkbox
            checked={completed}
            onCheckedChange={() => onStatus(completed ? "pending" : "completed")}
            className="mt-0.5"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className={completed ? "text-sm font-medium line-through opacity-60" : "text-sm font-medium"}>
              {task.title || "Tarefa sem título"}
            </p>
            <span className="text-xs text-muted-foreground">
              {completed ? "Concluída" : task.priority === "important" ? "Importante" : "Pendente"}
            </span>
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Responsável: {responsibleLabel(task.responsible)}</span>
            {task.dueDate && (
              <span>Prazo: {format(parseISO(task.dueDate), "dd/MM/yyyy")}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VersionedExamCard({
  exam,
  progress,
  patient,
  onUpdate,
}: {
  exam: JourneyExam;
  progress?: JourneyActionProgress;
  patient: boolean;
  onUpdate: (
    status: "pending" | "scheduled" | "completed",
    scheduledDate?: string,
  ) => Promise<JourneyActionProgress>;
}) {
  const [scheduledDate, setScheduledDate] = useState(progress?.scheduledDate ?? "");
  const [busy, setBusy] = useState(false);
  const completed = progress?.status === "completed";

  async function update(
    status: "pending" | "scheduled" | "completed",
    date?: string,
  ) {
    setBusy(true);
    try {
      await onUpdate(status, date);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{exam.title || "Exame sem título"}</p>
          {exam.instructions && (
            <p className="mt-1 text-sm text-muted-foreground">{exam.instructions}</p>
          )}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {actionStatusLabel(progress?.status ?? "pending")}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {exam.requestedDate && (
          <span>Solicitado: {format(parseISO(exam.requestedDate), "dd/MM/yyyy")}</span>
        )}
        {exam.dueDate && (
          <span>Prazo: {format(parseISO(exam.dueDate), "dd/MM/yyyy")}</span>
        )}
        {progress?.scheduledDate && (
          <span>Agendado: {format(parseISO(progress.scheduledDate), "dd/MM/yyyy")}</span>
        )}
      </div>

      {patient && !completed && (
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input
            type="date"
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy || !scheduledDate}
            onClick={() => void update("scheduled", scheduledDate)}
          >
            Informar agendamento
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={() => void update("completed", scheduledDate)}
          >
            Marcar realizado
          </Button>
        </div>
      )}

      {patient && completed && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3"
          disabled={busy}
          onClick={() => void update("pending")}
        >
          Corrigir: ainda não realizado
        </Button>
      )}
    </div>
  );
}

function LegacyPending({
  role,
  openTasks,
  examTasks,
  completedTasks,
  consults,
  nutrition,
  onToggle,
}: {
  role: "patient" | "doctor" | null;
  openTasks: Task[];
  examTasks: Task[];
  completedTasks: Task[];
  consults: Array<{ stage: number; period: string; focus: string; date: string }>;
  nutrition: Array<{ index: number; date: string }>;
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <PendingSection icon={ClipboardList} title="Tarefas" empty="Nenhuma tarefa pendente.">
        {openTasks.map((task) => (
          <LegacyTaskCard
            key={task.id}
            task={task}
            canComplete={patientCanUpdate}
            onComplete={() => onToggle(task.id)}
          />
        ))}
      </PendingSection>

      <PendingSection icon={FileCheck2} title="Exames e avaliações" empty="Nenhum exame pendente.">
        {examTasks.map((task) => (
          <LegacyTaskCard
            key={task.id}
            task={task}
            canComplete={patientCanUpdate}
            onComplete={() => onToggle(task.id)}
          />
        ))}
      </PendingSection>

      <PendingSection icon={Stethoscope} title="Consultas médicas" empty="Nenhuma consulta prevista.">
        {consults.map((consult) => (
          <div key={consult.stage} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="text-sm font-medium">
              Encontro {consult.stage}{consult.period ? ` · ${consult.period}` : ""}
            </p>
            {consult.focus && <p className="mt-1 text-sm text-muted-foreground">{consult.focus}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              {consult.date ? format(parseISO(consult.date), "dd/MM/yyyy") : "A definir"}
            </p>
          </div>
        ))}
      </PendingSection>

      {nutrition.length > 0 && (
        <PendingSection icon={CalendarDays} title="Nutricionista" empty="Nenhuma consulta prevista.">
          {nutrition.map((consult) => (
            <div key={consult.index} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <p className="text-sm font-medium">{consult.index}ª consulta</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {consult.date
                  ? format(parseISO(consult.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : "Data a definir pela equipe"}
              </p>
            </div>
          ))}
        </PendingSection>
      )}

      {completedTasks.length > 0 && (
        <details className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <summary className="cursor-pointer text-sm font-medium">
            Itens concluídos ({completedTasks.length})
          </summary>
          <div className="mt-3 space-y-2">
            {completedTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{task.title}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </>
  );
}

function PendingSection({
  icon: Icon,
  title,
  empty,
  children,
}: {
  icon: typeof ClipboardList;
  title: string;
  empty: string;
  children: ReactNode;
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </h2>
      {Array.isArray(items) && items.length === 0 ? (
        <div className="rounded-xl bg-card p-4 text-sm text-muted-foreground shadow-[var(--shadow-border)]">
          {empty}
        </div>
      ) : (
        items
      )}
    </section>
  );
}

function LegacyTaskCard({
  task,
  canComplete,
  onComplete,
}: {
  task: Task;
  canComplete: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-start gap-3">
        {canComplete && (
          <Checkbox
            checked={task.done}
            onCheckedChange={() => onComplete()}
            className="mt-0.5"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-relaxed">{task.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {TASK_CATEGORY_LABEL[task.category] ?? task.category}
          </p>
        </div>
      </div>
    </div>
  );
}

function responsibleLabel(value: JourneyTask["responsible"]): string {
  if (value === "patient") return "Paciente";
  if (value === "doctor") return "Médica";
  if (value === "team") return "Equipe";
  if (value === "nutritionist") return "Nutricionista";
  return "Outro";
}

function actionStatusLabel(value: JourneyActionProgress["status"]): string {
  if (value === "scheduled") return "Agendado";
  if (value === "completed") return "Realizado";
  if (value === "cancelled") return "Cancelado";
  return "Pendente";
}

function appointmentTypeLabel(value: string): string {
  if (value === "doctor") return "Consulta médica";
  if (value === "nutrition") return "Consulta com nutricionista";
  if (value === "psychology") return "Psicologia";
  if (value === "nursing") return "Enfermagem";
  return "Outro encontro";
}

function appointmentStatusLabel(value: string): string {
  if (value === "scheduled") return "Agendada";
  if (value === "completed") return "Realizada";
  if (value === "cancelled") return "Cancelada";
  return "Prevista";
}
