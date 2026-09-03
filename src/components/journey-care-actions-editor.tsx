import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useJournal } from "@/lib/journal-store";
import type {
  JourneyAppointment,
  JourneyExam,
  JourneyTask,
  JourneyTaskCategory,
  JourneyTaskResponsible,
} from "@/lib/types";

const TASK_CATEGORIES: { id: JourneyTaskCategory; label: string }[] = [
  { id: "exam", label: "Exame" },
  { id: "appointment", label: "Consulta/agendamento" },
  { id: "medication", label: "Medicação" },
  { id: "food", label: "Alimentação" },
  { id: "movement", label: "Movimento" },
  { id: "sleep", label: "Sono" },
  { id: "document", label: "Documento" },
  { id: "other", label: "Outro" },
];

const RESPONSIBLES: { id: JourneyTaskResponsible; label: string }[] = [
  { id: "patient", label: "Paciente" },
  { id: "doctor", label: "Médica" },
  { id: "team", label: "Equipe" },
  { id: "nutritionist", label: "Nutricionista" },
  { id: "other", label: "Outro" },
];

export function JourneyCareActionsEditor() {
  const plan = useJournal((s) => s.journeyPlan);
  const setPlan = useJournal((s) => s.setJourneyPlan);

  function updateTask(id: string, patch: Partial<JourneyTask>) {
    setPlan({
      tasks: plan.tasks.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function updateExam(id: string, patch: Partial<JourneyExam>) {
    setPlan({
      exams: plan.exams.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function updateAppointment(id: string, patch: Partial<JourneyAppointment>) {
    setPlan({
      appointments: plan.appointments.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionHeader
          title="Tarefas"
          detail="Ações que fazem parte deste ciclo e serão publicadas junto da Jornada."
          onAdd={() =>
            setPlan({
              tasks: [
                ...plan.tasks,
                {
                  id: crypto.randomUUID(),
                  title: "",
                  description: "",
                  category: "other",
                  responsible: "patient",
                  dueDate: "",
                  priority: "normal",
                  visibleToPatient: true,
                },
              ],
            })
          }
        />
        {plan.tasks.length === 0 && <Empty label="Nenhuma tarefa neste rascunho." />}
        {plan.tasks.map((task) => (
          <div key={task.id} className="space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">Tarefa</p>
              <button
                type="button"
                className="text-xs text-destructive"
                onClick={() =>
                  setPlan({ tasks: plan.tasks.filter((item) => item.id !== task.id) })
                }
              >
                Remover
              </button>
            </div>
            <Field label="Título">
              <Input
                value={task.title}
                onChange={(event) => updateTask(task.id, { title: event.target.value })}
                placeholder="Ex.: Realizar avaliação cardiológica"
              />
            </Field>
            <Field label="Descrição">
              <Textarea
                value={task.description}
                onChange={(event) => updateTask(task.id, { description: event.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Categoria">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={task.category}
                  onChange={(event) =>
                    updateTask(task.id, {
                      category: event.target.value as JourneyTaskCategory,
                    })
                  }
                >
                  {TASK_CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Responsável">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={task.responsible}
                  onChange={(event) =>
                    updateTask(task.id, {
                      responsible: event.target.value as JourneyTaskResponsible,
                    })
                  }
                >
                  {RESPONSIBLES.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Prazo">
                <Input
                  type="date"
                  value={task.dueDate}
                  onChange={(event) => updateTask(task.id, { dueDate: event.target.value })}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              <ToggleChip
                active={task.priority === "important"}
                label={task.priority === "important" ? "Importante" : "Prioridade normal"}
                onClick={() =>
                  updateTask(task.id, {
                    priority: task.priority === "important" ? "normal" : "important",
                  })
                }
              />
              <ToggleChip
                active={task.visibleToPatient}
                label={task.visibleToPatient ? "Visível ao paciente" : "Somente equipe"}
                onClick={() =>
                  updateTask(task.id, { visibleToPatient: !task.visibleToPatient })
                }
              />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Exames e avaliações"
          detail="Solicitações estruturadas, separadas das tarefas gerais."
          onAdd={() =>
            setPlan({
              exams: [
                ...plan.exams,
                {
                  id: crypto.randomUUID(),
                  title: "",
                  instructions: "",
                  requestedDate: "",
                  dueDate: "",
                  visibleToPatient: true,
                },
              ],
            })
          }
        />
        {plan.exams.length === 0 && <Empty label="Nenhum exame neste rascunho." />}
        {plan.exams.map((exam) => (
          <div key={exam.id} className="space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">Exame / avaliação</p>
              <button
                type="button"
                className="text-xs text-destructive"
                onClick={() =>
                  setPlan({ exams: plan.exams.filter((item) => item.id !== exam.id) })
                }
              >
                Remover
              </button>
            </div>
            <Field label="Nome">
              <Input
                value={exam.title}
                onChange={(event) => updateExam(exam.id, { title: event.target.value })}
                placeholder="Ex.: Polissonografia"
              />
            </Field>
            <Field label="Orientação">
              <Textarea
                value={exam.instructions}
                onChange={(event) =>
                  updateExam(exam.id, { instructions: event.target.value })
                }
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Solicitado em">
                <Input
                  type="date"
                  value={exam.requestedDate}
                  onChange={(event) =>
                    updateExam(exam.id, { requestedDate: event.target.value })
                  }
                />
              </Field>
              <Field label="Prazo sugerido">
                <Input
                  type="date"
                  value={exam.dueDate}
                  onChange={(event) => updateExam(exam.id, { dueDate: event.target.value })}
                />
              </Field>
            </div>
            <ToggleChip
              active={exam.visibleToPatient}
              label={exam.visibleToPatient ? "Visível ao paciente" : "Somente equipe"}
              onClick={() =>
                updateExam(exam.id, { visibleToPatient: !exam.visibleToPatient })
              }
            />
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Consultas e encontros"
          detail="Datas podem ser definidas agora ou ficar em aberto no rascunho."
          onAdd={() =>
            setPlan({
              appointments: [
                ...plan.appointments,
                {
                  id: crypto.randomUUID(),
                  type: "doctor",
                  professional: "",
                  date: "",
                  offsetDays: null,
                  mode: "unspecified",
                  notes: "",
                  status: "planned",
                  visibleToPatient: true,
                },
              ],
            })
          }
        />
        {plan.appointments.length === 0 && <Empty label="Nenhum encontro neste rascunho." />}
        {plan.appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">Consulta / encontro</p>
              <button
                type="button"
                className="text-xs text-destructive"
                onClick={() =>
                  setPlan({
                    appointments: plan.appointments.filter(
                      (item) => item.id !== appointment.id,
                    ),
                  })
                }
              >
                Remover
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tipo">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={appointment.type}
                  onChange={(event) =>
                    updateAppointment(appointment.id, {
                      type: event.target.value as JourneyAppointment["type"],
                    })
                  }
                >
                  <option value="doctor">Médica</option>
                  <option value="nutrition">Nutricionista</option>
                  <option value="psychology">Psicologia</option>
                  <option value="nursing">Enfermagem</option>
                  <option value="other">Outro</option>
                </select>
              </Field>
              <Field label="Profissional">
                <Input
                  value={appointment.professional}
                  onChange={(event) =>
                    updateAppointment(appointment.id, {
                      professional: event.target.value,
                    })
                  }
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Data">
                <Input
                  type="date"
                  value={appointment.date}
                  onChange={(event) =>
                    updateAppointment(appointment.id, { date: event.target.value })
                  }
                />
              </Field>
              <Field label="Ou intervalo após início (dias)">
                <Input
                  type="number"
                  min={0}
                  max={3650}
                  value={appointment.offsetDays ?? ""}
                  onChange={(event) =>
                    updateAppointment(appointment.id, {
                      offsetDays: event.target.value ? Number(event.target.value) : null,
                    })
                  }
                />
              </Field>
              <Field label="Modalidade">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={appointment.mode}
                  onChange={(event) =>
                    updateAppointment(appointment.id, {
                      mode: event.target.value as JourneyAppointment["mode"],
                    })
                  }
                >
                  <option value="unspecified">A definir</option>
                  <option value="in_person">Presencial</option>
                  <option value="online">Online</option>
                </select>
              </Field>
            </div>
            <Field label="Observação">
              <Textarea
                value={appointment.notes}
                onChange={(event) =>
                  updateAppointment(appointment.id, { notes: event.target.value })
                }
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Status">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={appointment.status}
                  onChange={(event) =>
                    updateAppointment(appointment.id, {
                      status: event.target.value as JourneyAppointment["status"],
                    })
                  }
                >
                  <option value="planned">Prevista</option>
                  <option value="scheduled">Agendada</option>
                  <option value="completed">Realizada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </Field>
              <div className="flex items-end">
                <ToggleChip
                  active={appointment.visibleToPatient}
                  label={
                    appointment.visibleToPatient
                      ? "Visível ao paciente"
                      : "Somente equipe"
                  }
                  onClick={() =>
                    updateAppointment(appointment.id, {
                      visibleToPatient: !appointment.visibleToPatient,
                    })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  detail,
  onAdd,
}: {
  title: string;
  detail: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus className="size-4" />
        Adicionar
      </Button>
    </div>
  );
}

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
          : "rounded-md bg-secondary px-3 py-2 text-xs font-medium"
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
