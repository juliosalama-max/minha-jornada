import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useJournal } from "@/lib/journal-store";
import type {
  JourneyAnswerValue,
  JourneyModule,
  JourneyQuestion,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function JourneyModuleForm({
  module,
  occurredOn,
  collapsible = false,
}: {
  module: JourneyModule;
  occurredOn: string;
  collapsible?: boolean;
}) {
  const save = useJournal((s) => s.saveModuleResponse);
  const [answers, setAnswers] = useState<Record<string, JourneyAnswerValue>>({});
  const [open, setOpen] = useState(!collapsible);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleQuestions = useMemo(
    () => module.questions.filter((question) => questionIsVisible(question, answers)),
    [module.questions, answers],
  );

  const missingRequired = visibleQuestions.some(
    (question) => question.required && isEmptyAnswer(answers[question.id]),
  );

  function setAnswer(questionId: string, value: JourneyAnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function submit() {
    if (missingRequired) {
      setError("Preencha os campos obrigatórios antes de salvar.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await save(module.id, occurredOn, answers);
      setAnswers({});
      if (collapsible) setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o registro.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold">{module.title}</h2>
          {module.instructions && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {module.instructions}
            </p>
          )}
        </div>
        {collapsible && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Fechar registro" : "Abrir registro"}
          >
            {open ? <ChevronUp /> : <ChevronDown />}
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-4 space-y-5">
          {visibleQuestions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => setAnswer(question.id, value)}
            />
          ))}

          {module.questions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Confirme este item quando tiver realizado o que foi combinado na Jornada.
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="button" className="w-full" disabled={busy} onClick={() => void submit()}>
            {busy ? "Salvando…" : module.questions.length ? "Salvar registro" : "Marcar como realizado"}
          </Button>
        </div>
      )}
    </section>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: JourneyQuestion;
  value: JourneyAnswerValue | undefined;
  onChange: (value: JourneyAnswerValue) => void;
}) {
  const required = question.required ? " *" : "";

  if (question.type === "boolean" || question.type === "event") {
    return (
      <Field label={question.label + required}>
        <div className="grid grid-cols-2 gap-2">
          <ChoiceButton active={value === true} onClick={() => onChange(true)}>
            Sim
          </ChoiceButton>
          <ChoiceButton active={value === false} onClick={() => onChange(false)}>
            Não
          </ChoiceButton>
        </div>
      </Field>
    );
  }

  if (
    question.type === "single_choice" ||
    question.type === "emotion"
  ) {
    return (
      <Field label={question.label + required}>
        {(question.options ?? []).length ? (
          <div className="grid gap-2">
            {(question.options ?? []).map((option) => (
              <ChoiceButton
                key={option.id}
                active={value === option.id}
                onClick={() => onChange(option.id)}
              >
                {option.label}
              </ChoiceButton>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Sem opções configuradas.</p>
        )}
      </Field>
    );
  }

  if (question.type === "multiple_choice") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <Field label={question.label + required}>
        <div className="grid gap-2">
          {(question.options ?? []).map((option) => {
            const active = selected.includes(option.id);
            return (
              <ChoiceButton
                key={option.id}
                active={active}
                onClick={() =>
                  onChange(
                    active
                      ? selected.filter((item) => item !== option.id)
                      : [...selected, option.id],
                  )
                }
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded border text-[10px]",
                      active ? "border-primary-foreground" : "border-border",
                    )}
                  >
                    {active && <Check className="size-3" />}
                  </span>
                  {option.label}
                </span>
              </ChoiceButton>
            );
          })}
        </div>
      </Field>
    );
  }

  if (question.type === "scale" || question.type === "number") {
    return (
      <Field label={question.label + required}>
        <Input
          type="number"
          inputMode="decimal"
          min={question.min}
          max={question.max}
          step={question.step ?? 1}
          value={typeof value === "number" ? value : ""}
          onChange={(event) =>
            onChange(event.target.value === "" ? null : Number(event.target.value))
          }
        />
        {(question.min != null || question.max != null) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {question.min != null ? `Mínimo: ${question.min}` : ""}
            {question.min != null && question.max != null ? " · " : ""}
            {question.max != null ? `Máximo: ${question.max}` : ""}
          </p>
        )}
      </Field>
    );
  }

  if (question.type === "duration") {
    return (
      <Field label={question.label + required}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            step={question.step ?? 5}
            inputMode="decimal"
            value={typeof value === "number" ? value : ""}
            onChange={(event) =>
              onChange(event.target.value === "" ? null : Number(event.target.value))
            }
          />
          <span className="text-sm text-muted-foreground">min</span>
        </div>
      </Field>
    );
  }

  if (question.type === "long_text") {
    return (
      <Field label={question.label + required}>
        <Textarea
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      </Field>
    );
  }

  return (
    <Field label={question.label + required}>
      <Input
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "min-h-12 rounded-lg px-3 py-3 text-left text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function questionIsVisible(
  question: JourneyQuestion,
  answers: Record<string, JourneyAnswerValue>,
): boolean {
  const condition = question.condition;
  if (!condition) return true;
  const current = answers[condition.questionId];

  if (condition.operator === "equals") return current === condition.value;
  if (condition.operator === "not_equals") {
    return current !== undefined && current !== condition.value;
  }
  if (condition.operator === "includes") {
    if (Array.isArray(current)) return current.includes(String(condition.value));
    if (typeof current === "string") return current.includes(String(condition.value));
    return false;
  }
  return true;
}

function isEmptyAnswer(value: JourneyAnswerValue | undefined): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}
