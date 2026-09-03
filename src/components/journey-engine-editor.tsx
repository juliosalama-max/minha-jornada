import { useMemo, useState } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  JOURNEY_FREQUENCY_LABELS,
  JOURNEY_MODULE_LABELS,
} from "@/lib/journey-plan";
import { useJournal } from "@/lib/journal-store";
import type {
  JourneyFrequencyKind,
  JourneyModule,
  JourneyModuleType,
  JourneyQuestion,
  JourneyQuestionType,
} from "@/lib/types";

const MODULE_TYPES = Object.entries(JOURNEY_MODULE_LABELS) as [
  JourneyModuleType,
  string,
][];

const QUESTION_TYPES: { id: JourneyQuestionType; label: string }[] = [
  { id: "boolean", label: "Sim / não" },
  { id: "single_choice", label: "Escolha única" },
  { id: "multiple_choice", label: "Múltipla escolha" },
  { id: "scale", label: "Escala" },
  { id: "number", label: "Número" },
  { id: "duration", label: "Duração" },
  { id: "short_text", label: "Texto curto" },
  { id: "long_text", label: "Texto longo" },
  { id: "emotion", label: "Emoção" },
  { id: "event", label: "Evento" },
];

export function JourneyEngineEditor() {
  const plan = useJournal((s) => s.journeyPlan);
  const meta = useJournal((s) => s.journeyMeta);
  const setPlan = useJournal((s) => s.setJourneyPlan);
  const saveDraft = useJournal((s) => s.saveJourneyDraft);
  const publish = useJournal((s) => s.publishJourney);
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const statusLabel = useMemo(() => {
    if (meta.status === "published") return `Publicada · versão ${meta.currentVersion}`;
    if (meta.status === "in_review") return `Em revisão · publicada v${meta.currentVersion}`;
    if (meta.status === "completed") return "Concluída";
    if (meta.status === "archived") return "Arquivada";
    return "Rascunho";
  }, [meta]);

  function updateModule(id: string, patch: Partial<JourneyModule>) {
    setPlan({
      modules: plan.modules.map((module) =>
        module.id === id ? { ...module, ...patch } : module,
      ),
    });
  }

  function addModule(type: JourneyModuleType) {
    setPlan({
      modules: [
        ...plan.modules,
        {
          id: crypto.randomUUID(),
          type,
          title: JOURNEY_MODULE_LABELS[type],
          enabled: true,
          instructions: "",
          frequency: { kind: type === "eating_behavior" ? "event_based" : "daily" },
          startDate: "",
          endDate: "",
          reviewDate: "",
          required: false,
          questions: [],
        },
      ],
    });
  }

  async function persist(kind: "save" | "publish") {
    setBusy(kind);
    setMessage(null);
    try {
      if (kind === "save") {
        await saveDraft();
        setMessage("Rascunho salvo.");
      } else {
        await saveDraft();
        await publish();
        setMessage("Jornada publicada para o paciente.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-primary/20 bg-accent/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Motor da Jornada V2
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">Plano individual</h2>
            <p className="mt-1 text-sm text-muted-foreground">{statusLabel}</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(busy)}
              onClick={() => void persist("save")}
            >
              {busy === "save" ? "Salvando…" : "Salvar rascunho"}
            </Button>
            <Button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void persist("publish")}
            >
              <Send className="size-4" />
              {busy === "publish" ? "Publicando…" : "Publicar"}
            </Button>
          </div>
        </div>
        {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
      </section>

      <section className="space-y-4 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h3 className="font-display text-lg font-semibold">Identificação do ciclo</h3>
        <Field label="Nome da Jornada">
          <Input
            value={plan.title}
            onChange={(e) => setPlan({ title: e.target.value })}
            placeholder="Ex.: Ciclo inicial — saúde metabólica"
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Data de início">
            <Input
              type="date"
              value={plan.startDate}
              onChange={(e) => setPlan({ startDate: e.target.value })}
            />
          </Field>
          <Field label="Duração (dias)">
            <Input
              type="number"
              min={1}
              max={3650}
              value={plan.durationDays ?? ""}
              onChange={(e) =>
                setPlan({
                  durationDays: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </Field>
          <Field label="Data de revisão">
            <Input
              type="date"
              value={plan.reviewDate}
              onChange={(e) => setPlan({ reviewDate: e.target.value })}
            />
          </Field>
        </div>
        <Field label="O que trouxe o paciente até aqui?">
          <Textarea
            value={plan.motivation}
            onChange={(e) => setPlan({ motivation: e.target.value })}
          />
        </Field>
        <Field label="O que é importante para o paciente neste momento?">
          <Textarea
            value={plan.patientValues}
            onChange={(e) => setPlan({ patientValues: e.target.value })}
          />
        </Field>
        <Field label="Objetivo geral desta Jornada">
          <Textarea
            value={plan.objective}
            onChange={(e) => setPlan({ objective: e.target.value })}
          />
        </Field>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">Prioridades atuais</h3>
            <p className="text-xs text-muted-foreground">Até três por ciclo.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={plan.priorities.length >= 3}
            onClick={() =>
              setPlan({
                priorities: [
                  ...plan.priorities,
                  {
                    id: crypto.randomUUID(),
                    title: "",
                    description: "",
                    tracking: "",
                    reviewDate: "",
                  },
                ],
              })
            }
          >
            <Plus className="size-4" />
            Prioridade
          </Button>
        </div>
        {plan.priorities.map((priority, index) => (
          <div key={priority.id} className="space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex justify-between gap-3">
              <p className="font-medium">Prioridade {index + 1}</p>
              <button
                type="button"
                className="text-xs text-destructive"
                onClick={() =>
                  setPlan({
                    priorities: plan.priorities.filter((item) => item.id !== priority.id),
                  })
                }
              >
                Remover
              </button>
            </div>
            <Input
              value={priority.title}
              placeholder="Título"
              onChange={(e) =>
                setPlan({
                  priorities: plan.priorities.map((item) =>
                    item.id === priority.id ? { ...item, title: e.target.value } : item,
                  ),
                })
              }
            />
            <Textarea
              value={priority.description}
              placeholder="Descrição"
              onChange={(e) =>
                setPlan({
                  priorities: plan.priorities.map((item) =>
                    item.id === priority.id ? { ...item, description: e.target.value } : item,
                  ),
                })
              }
            />
            <Input
              value={priority.tracking}
              placeholder="Como vamos acompanhar"
              onChange={(e) =>
                setPlan({
                  priorities: plan.priorities.map((item) =>
                    item.id === priority.id ? { ...item, tracking: e.target.value } : item,
                  ),
                })
              }
            />
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="font-display text-lg font-semibold">Módulos do acompanhamento</h3>
          <p className="text-xs text-muted-foreground">
            O paciente verá somente os módulos publicados na Jornada.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {MODULE_TYPES.map(([type, label]) => (
            <Button
              key={type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addModule(type)}
            >
              <Plus className="size-3.5" />
              {label}
            </Button>
          ))}
        </div>

        {plan.modules.length === 0 && (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhum módulo configurado. A Jornada permanece sem registros obrigatórios.
          </div>
        )}

        {plan.modules.map((module) => (
          <ModuleEditor
            key={module.id}
            module={module}
            onChange={(patch) => updateModule(module.id, patch)}
            onRemove={() =>
              setPlan({ modules: plan.modules.filter((item) => item.id !== module.id) })
            }
          />
        ))}
      </section>
    </div>
  );
}

function ModuleEditor({
  module,
  onChange,
  onRemove,
}: {
  module: JourneyModule;
  onChange: (patch: Partial<JourneyModule>) => void;
  onRemove: () => void;
}) {
  const addQuestion = () => {
    const question: JourneyQuestion = {
      id: crypto.randomUUID(),
      label: "",
      type: "short_text",
      required: false,
    };
    onChange({ questions: [...module.questions, question] });
  };

  return (
    <div className="space-y-4 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {JOURNEY_MODULE_LABELS[module.type]}
          </p>
          <Input
            className="mt-2"
            value={module.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <button type="button" className="text-xs text-destructive" onClick={onRemove}>
          Remover
        </button>
      </div>

      <Field label="Orientação visível ao paciente">
        <Textarea
          value={module.instructions}
          onChange={(e) => onChange({ instructions: e.target.value })}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Frequência">
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={module.frequency.kind}
            onChange={(e) =>
              onChange({
                frequency: {
                  ...module.frequency,
                  kind: e.target.value as JourneyFrequencyKind,
                },
              })
            }
          >
            {Object.entries(JOURNEY_FREQUENCY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data de revisão">
          <Input
            type="date"
            value={module.reviewDate}
            onChange={(e) => onChange({ reviewDate: e.target.value })}
          />
        </Field>
      </div>

      {module.frequency.kind === "selected_days" && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Dias da semana</p>
          <div className="flex flex-wrap gap-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label, day) => {
              const selected = module.frequency.daysOfWeek?.includes(day) ?? false;
              return (
                <button
                  key={label}
                  type="button"
                  className={
                    selected
                      ? "rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
                      : "rounded-md bg-secondary px-3 py-2 text-xs"
                  }
                  onClick={() => {
                    const days = module.frequency.daysOfWeek ?? [];
                    onChange({
                      frequency: {
                        ...module.frequency,
                        daysOfWeek: selected
                          ? days.filter((item) => item !== day)
                          : [...days, day].sort(),
                      },
                    });
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Perguntas</p>
          <p className="text-xs text-muted-foreground">
            Defina apenas o que precisa ser acompanhado neste ciclo.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="size-4" />
          Pergunta
        </Button>
      </div>

      {module.questions.map((question) => (
        <QuestionEditor
          key={question.id}
          question={question}
          onChange={(patch) =>
            onChange({
              questions: module.questions.map((item) =>
                item.id === question.id ? { ...item, ...patch } : item,
              ),
            })
          }
          onRemove={() =>
            onChange({
              questions: module.questions.filter((item) => item.id !== question.id),
            })
          }
        />
      ))}
    </div>
  );
}

function QuestionEditor({
  question,
  onChange,
  onRemove,
}: {
  question: JourneyQuestion;
  onChange: (patch: Partial<JourneyQuestion>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-lg bg-secondary/40 p-3 sm:grid-cols-[1fr_180px_auto]">
      <Input
        value={question.label}
        placeholder="Pergunta para o paciente"
        onChange={(e) => onChange({ label: e.target.value })}
      />
      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={question.type}
        onChange={(e) => onChange({ type: e.target.value as JourneyQuestionType })}
      >
        {QUESTION_TYPES.map((type) => (
          <option key={type.id} value={type.id}>
            {type.label}
          </option>
        ))}
      </select>
      <Button type="button" variant="ghost" onClick={onRemove}>
        Remover
      </Button>
      {(question.type === "single_choice" ||
        question.type === "multiple_choice" ||
        question.type === "emotion") && (
        <div className="sm:col-span-3">
          <Label className="text-xs">Opções, separadas por ponto e vírgula</Label>
          <Input
            className="mt-1"
            value={(question.options ?? []).map((option) => option.label).join("; ")}
            onChange={(e) =>
              onChange({
                options: e.target.value
                  .split(";")
                  .map((label) => label.trim())
                  .filter(Boolean)
                  .map((label, index) => ({
                    id: `option-${index + 1}`,
                    label,
                  })),
              })
            }
          />
        </div>
      )}
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
