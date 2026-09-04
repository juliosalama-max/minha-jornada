import { useEffect } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJournal } from "@/lib/journal-store";

export function AlertFeed({ journeyOnly = false }: { journeyOnly?: boolean }) {
  const alerts = useJournal((s) => s.alerts);
  const journeyId = useJournal((s) => s.journeyId);
  const refresh = useJournal((s) => s.refreshAlerts);
  const markRead = useJournal((s) => s.markAlertsRead);
  const openPatient = useJournal((s) => s.openPatient);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const visible = journeyOnly && journeyId
    ? alerts.filter((alert) => alert.journeyId === journeyId)
    : alerts;
  const unread = visible.filter((alert) => !alert.read).length;

  if (!visible.length) {
    return (
      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <BellRing className="size-4 text-primary" />
          Alertas
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Nenhuma regra configurada foi acionada nos registros exibidos.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <BellRing className="size-4 text-primary" />
            Alertas
            {unread > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {unread}
              </span>
            )}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Apenas regras publicadas e configuradas pela médica.
          </p>
        </div>
        {unread > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void markRead(visible.filter((item) => !item.read).map((item) => item.id))}
          >
            Marcar lidos
          </Button>
        )}
      </div>

      <ul className="space-y-2">
        {visible.slice(0, 12).map((alert) => (
          <li key={alert.id}>
            <button
              type="button"
              className="w-full rounded-lg border border-border/60 px-3 py-3 text-left hover:bg-secondary"
              onClick={() => {
                if (!alert.read) void markRead([alert.id]);
                if (!journeyOnly) void openPatient(alert.journeyId);
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {!alert.read && (
                      <span className="mr-2 inline-block size-2 rounded-full bg-primary align-middle" />
                    )}
                    {alert.patientName}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{alert.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {alert.moduleTitle} · registro de {alert.occurredOn.split("-").reverse().join("/")}
                  </p>
                </div>
                <span
                  className={
                    alert.severity === "important"
                      ? "rounded-md bg-warn px-2 py-1 text-[11px] font-medium text-warn-foreground"
                      : "rounded-md bg-secondary px-2 py-1 text-[11px] font-medium"
                  }
                >
                  {alert.severity === "important" ? "Importante" : "Atenção"}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
