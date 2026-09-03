import { createFileRoute, Link } from "@tanstack/react-router";
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
import { TASK_CATEGORY_LABEL } from "@/lib/constants";
import { moduleIsDue } from "@/lib/journey-schedule";
import { useJournal } from "@/lib/journal-store";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/pendencias")({ component: PendenciasPage });

function PendenciasPage() {
  const role = useJournal((s) => s.role);
  const tasks = useJournal((s) => s.tasks);
  const consults = useJournal((s) => s.consults);
  const nutrition = useJournal((s) => s.nutrition);
  const journeyPlan = useJournal((s) => s.journeyPlan);
  const responses = useJournal((s) => s.journeyResponses);
  const toggleTask = useJournal((s) => s.toggleTask);
  const today = new Date();

  const openTasks = tasks.filter((task) => !task.done && task.category !== "exames");
  const examTasks = tasks.filter((task) => !task.done && task.category === "exames");
  const completedTasks = tasks.filter((task) => task.done);
  const dueQuestionnaires = journeyPlan.modules.filter(
    (module) =>
      module.enabled &&
      module.type === "questionnaire" &&
      moduleIsDue(
        module,
        today,
        responses.filter((response) => response.moduleId === module.id),
      ),
  );

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
            ? "Visão das ações ainda abertas deste paciente."
            : "Veja o que ainda precisa ser organizado ou realizado ao longo da sua Jornada."}
        </p>
      </header>

      <PendingSection
        icon={ClipboardList}
        title="Tarefas"
        empty="Nenhuma tarefa pendente."
      >
        {openTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            canComplete={role === "patient"}
            onComplete={() => toggleTask(task.id)}
          />
        ))}
      </PendingSection>

      <PendingSection
        icon={FileCheck2}
        title="Exames e avaliações"
        empty="Nenhum exame ou avaliação pendente."
      >
        {examTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            canComplete={role === "patient"}
            onComplete={() => toggleTask(task.id)}
          />
        ))}
      </PendingSection>

      <PendingSection
        icon={Stethoscope}
        title="Consultas médicas"
        empty="Nenhuma consulta prevista."
      >
        {consults.map((consult) => (
          <div
            key={consult.stage}
            className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  Encontro {consult.stage}
                  {consult.period ? ` · ${consult.period}` : ""}
                </p>
                {consult.focus && (
                  <p className="mt-1 text-sm text-muted-foreground">{consult.focus}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {consult.date
                  ? format(parseISO(consult.date), "dd/MM/yyyy")
                  : "A definir"}
              </span>
            </div>
          </div>
        ))}
      </PendingSection>

      {nutrition.length > 0 && (
        <PendingSection
          icon={CalendarDays}
          title="Nutricionista"
          empty="Nenhuma consulta com nutricionista prevista."
        >
          {nutrition.map((consult) => (
            <div
              key={consult.index}
              className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
            >
              <p className="text-sm font-medium">{consult.index}ª consulta</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {consult.date
                  ? format(parseISO(consult.date), "d 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })
                  : "Data a definir pela equipe"}
              </p>
            </div>
          ))}
        </PendingSection>
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
              {role === "patient" && (
                <Button asChild size="sm" className="mt-3">
                  <Link to="/hoje">Responder</Link>
                </Button>
              )}
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

      {role === "doctor" && (
        <section className="rounded-xl bg-accent/50 p-4">
          <p className="text-sm text-muted-foreground">
            Para criar, remover ou reorganizar tarefas e consultas, edite o rascunho da Jornada.
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

function PendingSection({
  icon: Icon,
  title,
  empty,
  children,
}: {
  icon: typeof ClipboardList;
  title: string;
  empty: string;
  children: React.ReactNode;
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

function TaskCard({
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
