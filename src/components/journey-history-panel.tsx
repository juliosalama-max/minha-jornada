import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJournal } from "@/lib/journal-store";
import type { JourneyStatus } from "@/lib/types";

export function JourneyHistoryPanel() {
  const history = useJournal((s) => s.journeyHistory);
  const journeyId = useJournal((s) => s.journeyId);
  const meta = useJournal((s) => s.journeyMeta);
  const closeJourney = useJournal((s) => s.closeCurrentJourney);
  const startNext = useJournal((s) => s.startNextJourney);
  const openJourney = useJournal((s) => s.openPatient);
  const [firstConsult, setFirstConsult] = useState("");
  const [busy, setBusy] = useState<"complete" | "archive" | "next" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!journeyId) return null;

  const closed = meta.status === "completed" || meta.status === "archived";

  async function close(status: "completed" | "archived") {
    const label = status === "completed" ? "concluir" : "arquivar";
    if (!window.confirm(`Deseja realmente ${label} esta Jornada? O histórico será preservado.`)) {
      return;
    }
    setBusy(status === "completed" ? "complete" : "archive");
    setError(null);
    try {
      await closeJourney(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível encerrar o ciclo.");
    } finally {
      setBusy(null);
    }
  }

  async function nextCycle() {
    setBusy("next");
    setError(null);
    try {
      await startNext(firstConsult || undefined);
      setFirstConsult("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar nova Jornada.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-4 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <History className="size-4 text-primary" />
          Ciclos de acompanhamento
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Cada Jornada mantém suas próprias versões, registros, ações e alertas.
        </p>
      </div>

      {!closed ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null}
            onClick={() => void close("completed")}
          >
            {busy === "complete" ? "Concluindo…" : "Concluir Jornada"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy !== null}
            onClick={() => void close("archived")}
          >
            {busy === "archive" ? "Arquivando…" : "Arquivar ciclo"}
          </Button>
        </div>
      ) : (
        <div className="rounded-lg bg-accent/50 p-4">
          <p className="text-sm font-medium">
            Este ciclo está {meta.status === "completed" ? "concluído" : "arquivado"}.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Inicie uma nova Jornada vazia para continuar o acompanhamento sem alterar o histórico.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              type="date"
              value={firstConsult}
              onChange={(event) => setFirstConsult(event.target.value)}
              aria-label="Primeira consulta do novo ciclo"
            />
            <Button
              type="button"
              disabled={busy !== null}
              onClick={() => void nextCycle()}
            >
              {busy === "next" ? "Criando…" : "Nova Jornada"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-2">
        {history.map((cycle) => {
          const selected = cycle.id === journeyId;
          return (
            <div
              key={cycle.id}
              className={
                selected
                  ? "rounded-lg border border-primary/40 bg-accent/40 p-3"
                  : "rounded-lg border border-border/60 p-3"
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{cycle.title || "Jornada"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {statusLabel(cycle.status)}
                    {cycle.currentVersion > 0 ? ` · versão ${cycle.currentVersion}` : ""}
                    {cycle.startDate
                      ? ` · início ${format(parseISO(cycle.startDate), "dd/MM/yyyy", { locale: ptBR })}`
                      : ""}
                  </p>
                </div>
                {selected ? (
                  <span className="text-xs font-medium text-primary">Aberta</span>
                ) : (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary"
                    onClick={() => void openJourney(cycle.id)}
                  >
                    Ver
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function statusLabel(status: JourneyStatus): string {
  if (status === "published") return "Em acompanhamento";
  if (status === "in_review") return "Em revisão";
  if (status === "completed") return "Concluída";
  if (status === "archived") return "Arquivada";
  return "Rascunho";
}
