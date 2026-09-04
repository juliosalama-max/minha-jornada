import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type ReactNode, useMemo, useState } from "react";
import { AlertFeed } from "@/components/alert-feed";
import { LogoMark } from "@/components/logo";
import { NoticeFeed } from "@/components/notice-feed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignOutButton } from "@/components/sign-out-button";
import {
  filterPatientSummaries,
  patientPopulationStats,
  type PatientDashboardFilter,
} from "@/lib/doctor-patient-dashboard";
import { useJournal } from "@/lib/journal-store";
import type { PatientSummary } from "@/lib/types";

const FILTERS: Array<{ id: PatientDashboardFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Ativos" },
  { id: "draft", label: "Rascunhos" },
  { id: "attention", label: "Atenção" },
  { id: "pending", label: "Aguardando entrada" },
  { id: "closed", label: "Encerrados" },
];

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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PatientDashboardFilter>("all");

  const stats = useMemo(() => patientPopulationStats(patients), [patients]);
  const visiblePatients = useMemo(
    () => filterPatientSummaries(patients, query, filter),
    [patients, query, filter],
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <LogoMark className="size-16 rounded-[1.25rem]" />
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">
            Pacientes
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Olá{doctorName ? `, ${doctorName}` : ""}. Acompanhe cada pessoa pela
            Jornada atual e use os filtros abaixo para organizar o trabalho da equipe.
          </p>
        </div>
        {!creating && (
          <Button
            type="button"
            className="hidden sm:inline-flex"
            onClick={() => {
              setCreating(true);
              setError(null);
            }}
          >
            Novo paciente
          </Button>
        )}
      </div>

      {creating ? (
        <form
          className="mt-6 max-w-xl space-y-4 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            void createPlan({
              patientName: patient,
              firstConsultDate: firstConsult,
            })
              .catch((err: unknown) => {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Não foi possível criar o paciente.",
                );
              })
              .finally(() => setBusy(false));
          }}
        >
          <div>
            <p className="font-display text-lg font-semibold">Novo paciente</p>
            <p className="mt-1 text-xs text-muted-foreground">
              A primeira Jornada será criada em rascunho.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pname">Nome do paciente</Label>
            <Input
              id="pname"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              required
            />
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
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy || !patient.trim()}>
              {busy ? "Criando…" : "Criar paciente"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setCreating(false);
                setPatient("");
                setFirstConsult("");
                setError(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <>
          <Button
            type="button"
            className="mt-6 w-full sm:hidden"
            onClick={() => {
              setCreating(true);
              setError(null);
            }}
          >
            Novo paciente
          </Button>

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PopulationMetric label="Pacientes" value={stats.total} />
            <PopulationMetric label="Em acompanhamento" value={stats.active} />
            <PopulationMetric
              label="Com alertas não lidos"
              value={stats.withUnreadAlerts}
            />
            <PopulationMetric
              label="Aguardando entrada"
              value={stats.awaitingEntry}
            />
          </section>

          <section className="mt-6 space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div>
              <Label htmlFor="patient-search" className="text-xs">
                Buscar paciente
              </Label>
              <Input
                id="patient-search"
                className="mt-1.5"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite o nome"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Filtrar</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={
                      filter === item.id
                        ? "rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                        : "rounded-md bg-secondary px-3 py-2 text-xs font-medium"
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">Lista de pacientes</h2>
              <p className="text-xs text-muted-foreground">
                {visiblePatients.length} de {patients.length}
              </p>
            </div>

            <ul className="grid gap-3 lg:grid-cols-2">
              {visiblePatients.map((patientSummary) => (
                <li key={patientSummary.id}>
                  <PatientCard
                    patient={patientSummary}
                    onOpen={() => {
                      if (patientSummary.journeyId) {
                        void openPatient(patientSummary.journeyId);
                      }
                    }}
                  />
                </li>
              ))}
            </ul>

            {visiblePatients.length === 0 && patients.length > 0 && (
              <div className="rounded-xl bg-card p-5 text-center text-sm text-muted-foreground shadow-[var(--shadow-border)]">
                Nenhum paciente corresponde à busca ou ao filtro selecionado.
              </div>
            )}

            {patients.length === 0 && (
              <div className="rounded-xl bg-card p-5 text-center shadow-[var(--shadow-border)]">
                <p className="font-medium">Nenhum paciente criado ainda.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crie o primeiro paciente para montar uma Jornada individualizada.
                </p>
              </div>
            )}
          </section>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <AlertFeed />
            <NoticeFeed />
          </div>
        </>
      )}

      <SignOutButton variant="ghost" className="mt-8 w-full sm:w-auto" />
    </div>
  );
}

function PatientCard({
  patient,
  onOpen,
}: {
  patient: PatientSummary;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!patient.journeyId}
      onClick={onOpen}
      className="flex h-full w-full flex-col rounded-xl bg-card p-4 text-left shadow-[var(--shadow-border)] transition-colors hover:bg-accent/30 disabled:opacity-60"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{patient.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {patient.journeyCount}{" "}
            {patient.journeyCount === 1 ? "Jornada" : "Jornadas"}
            {patient.journeyStatus
              ? ` · ${statusLabel(patient.journeyStatus)}`
              : ""}
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-primary">Abrir</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {patient.unreadAlerts > 0 && (
          <OperationalBadge>
            {patient.unreadAlerts}{" "}
            {patient.unreadAlerts === 1 ? "alerta não lido" : "alertas não lidos"}
          </OperationalBadge>
        )}
        {patient.openActions > 0 && (
          <OperationalBadge>
            {patient.openActions}{" "}
            {patient.openActions === 1 ? "ação aberta" : "ações abertas"}
          </OperationalBadge>
        )}
        {patient.pending && (
          <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-medium">
            Aguardando entrada
          </span>
        )}
      </div>

      <div className="mt-auto pt-4 text-xs text-muted-foreground">
        {patient.lastRecordAt ? (
          <p>
            Último registro:{" "}
            {format(parseISO(patient.lastRecordAt), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </p>
        ) : (
          <p>Nenhum registro V2 ainda.</p>
        )}
        {patient.pending && patient.inviteCode && (
          <p className="mt-1 font-mono tracking-[0.16em]">
            Código: {patient.inviteCode}
          </p>
        )}
      </div>
    </button>
  );
}

function PopulationMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function OperationalBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-warn px-2 py-1 text-[11px] font-medium text-warn-foreground">
      {children}
    </span>
  );
}

function statusLabel(status: string): string {
  if (status === "published") return "em acompanhamento";
  if (status === "in_review") return "em revisão";
  if (status === "completed") return "concluída";
  if (status === "archived") return "arquivada";
  return "rascunho";
}
