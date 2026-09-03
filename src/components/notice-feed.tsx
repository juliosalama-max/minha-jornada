import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJournal } from "@/lib/journal-store";

export function NoticeFeed() {
  const notices = useJournal((s) => s.notices);
  const refreshNotices = useJournal((s) => s.refreshNotices);
  const markNoticesRead = useJournal((s) => s.markNoticesRead);
  const openPatient = useJournal((s) => s.openPatient);
  const unread = notices.filter((n) => !n.read).length;

  useEffect(() => {
    void refreshNotices();
    const id = window.setInterval(() => void refreshNotices(), 45_000);
    return () => window.clearInterval(id);
  }, [refreshNotices]);

  if (!notices.length) {
    return (
      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Bell className="size-4 text-primary" />
          Registros dos pacientes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Quando o paciente preencher o app, o aviso aparece aqui com o nome e o
          que foi feito.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Bell className="size-4 text-primary" />
          Registros dos pacientes
          {unread > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {unread}
            </span>
          )}
        </h2>
        {unread > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => void markNoticesRead()}>
            Marcar lidos
          </Button>
        )}
      </div>
      <ul className="space-y-3">
        {notices.slice(0, 12).map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => {
                if (!n.read) void markNoticesRead([n.id]);
                void openPatient(n.journeyId);
              }}
              className="w-full rounded-lg px-3 py-3 text-left hover:bg-secondary"
            >
              <p className="text-sm font-medium">
                {!n.read && (
                  <span className="mr-2 inline-block size-2 rounded-full bg-primary align-middle" />
                )}
                {n.patientName}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{n.summary}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
