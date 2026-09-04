import { useState } from "react";
import { AlertFeed } from "@/components/alert-feed";
import { LogoMark } from "@/components/logo";
import { NoticeFeed } from "@/components/notice-feed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignOutButton } from "@/components/sign-out-button";
import { useJournal } from "@/lib/journal-store";

export function DoctorDesk() {
  const patients = useJournal((s) => s.patients);
  const doctorName = useJournal((s) => s.doctorName);
  const createPlan = useJournal((s) => s.createPlan);
  const openPatient = useJournal((s) => s.openPatient);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [patient, setPatient] = useState("");
  const [firstConsult, setFirstConsult] = useState("");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <LogoMark className="size-16 rounded-[1.25rem]" />
      <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">Pacientes</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Olá{doctorName ? `, ${doctorName}` : ""}. Monte o plano de cada pessoa, gere o
        código e envie. O paciente entra com o código e vê só o que foi definido para ele.
      </p>

      {creating ? (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            void createPlan({ patientName: patient, firstConsultDate: firstConsult })
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Não foi possível criar o plano.");
              })
              .finally(() => setBusy(false));
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="pname">Nome do paciente</Label>
            <Input id="pname" value={patient} onChange={(e) => setPatient(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cdate">Primeira consulta (opcional)</Label>
            <Input
              id="cdate"
              type="date"
              value={firstConsult}
              onChange={(e) => setFirstConsult(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy || !patient.trim()}>
            {busy ? "Gerando código…" : "Criar plano e gerar código"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setCreating(false)}>
            Cancelar
          </Button>
        </form>
      ) : (
        <>
          <Button type="button" className="mt-6 w-full" onClick={() => setCreating(true)}>
            Novo paciente
          </Button>

          <ul className="mt-6 space-y-2">
            {patients.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={!p.journeyId}
                  onClick={() => {
                    if (p.journeyId) void openPatient(p.journeyId);
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-card px-4 py-4 text-left shadow-[var(--shadow-border)] disabled:opacity-60"
                >
                  <span>
                    <span className="block font-medium">{p.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {p.journeyCount} {p.journeyCount === 1 ? "Jornada" : "Jornadas"}
                      {p.journeyStatus ? ` · ${statusLabel(p.journeyStatus)}` : ""}
                      {p.pending ? " · aguardando entrada" : ""}
                    </span>
                    {p.pending && p.inviteCode && (
                      <span className="mt-1 block font-mono text-xs tracking-[0.16em] text-muted-foreground">
                        {p.inviteCode}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-primary">Abrir</span>
                </button>
              </li>
            ))}
          </ul>

          {patients.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">Nenhum paciente criado ainda.</p>
          )}

          <div className="mt-8 space-y-4">
            <AlertFeed />
            <NoticeFeed />
          </div>
        </>
      )}

      <SignOutButton variant="ghost" className="mt-auto w-full" />
    </div>
  );
}

function statusLabel(status: string): string {
  if (status === "published") return "em acompanhamento";
  if (status === "in_review") return "em revisão";
  if (status === "completed") return "concluída";
  if (status === "archived") return "arquivada";
  return "rascunho";
}
