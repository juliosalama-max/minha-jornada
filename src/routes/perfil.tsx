import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Mail, MessageCircle, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignOutButton } from "@/components/sign-out-button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import {
  BIOIMPEDANCE_PREP,
  CLINIC_EMAIL,
  CLINIC_INSTAGRAM,
  CLINIC_NAME,
  CLINIC_TAGLINE,
  CLINIC_WHATSAPP,
  CLINIC_WHATSAPP_LABEL,
  EMERGENCY_COPY,
  WEEKDAY_LABELS,
} from "@/lib/constants";
import { useJournal } from "@/lib/journal-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/perfil")({ component: PerfilPage });

function PerfilPage() {
  const profile = useJournal((s) => s.profile);
  const setProfile = useJournal((s) => s.setProfile);
  const role = useJournal((s) => s.role);
  const inviteCode = useJournal((s) => s.inviteCode);
  const doctorName = useJournal((s) => s.doctorName);
  const patients = useJournal((s) => s.patients);
  const journeyId = useJournal((s) => s.journeyId);
  const openPatient = useJournal((s) => s.openPatient);
  const leavePatient = useJournal((s) => s.leavePatient);
  const user = useCurrentUser();

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <LogoMark className="size-12 rounded-[1.05rem]" />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Perfil</h1>
          <p className="text-sm text-muted-foreground">
            {role === "doctor" ? "Acompanhamento médico" : CLINIC_NAME}
          </p>
        </div>
      </header>

      {role === "patient" && inviteCode && (
        <InviteCard code={inviteCode} doctorName={doctorName} />
      )}

      {role === "doctor" && (
        <section className="space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-lg font-semibold">Pacientes</h2>
          <p className="text-sm text-muted-foreground">
            Tudo o que o paciente registra aparece aqui. Use o código do perfil
            para vincular uma nova jornada.
          </p>
          <ul className="space-y-2">
            {patients.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => void openPatient(p.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left",
                    p.id === journeyId ? "bg-accent text-accent-foreground" : "bg-secondary",
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium">{p.name}</span>
                    <span className="font-mono text-xs tracking-widest opacity-70">
                      {p.inviteCode}
                    </span>
                  </span>
                  <span className="text-xs">{p.id === journeyId ? "Atual" : "Abrir"}</span>
                </button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="outline" className="w-full" onClick={() => leavePatient()}>
            Vincular outro paciente
          </Button>
        </section>
      )}

      <section className="space-y-4 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <div className="space-y-2">
          <Label htmlFor="nome">{role === "doctor" ? "Nome do paciente" : "Nome"}</Label>
          <Input
            id="nome"
            value={profile.name}
            onChange={(e) => setProfile({ name: e.target.value })}
          />
        </div>
        {role === "doctor" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="first">Data da primeira consulta</Label>
              <Input
                id="first"
                type="date"
                value={profile.firstConsultDate}
                onChange={(e) => setProfile({ firstConsultDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Dia fixo da aplicação</Label>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAY_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setProfile({
                        injectionWeekday: profile.injectionWeekday === i ? null : i,
                      })
                    }
                    className={cn(
                      "flex h-11 items-center justify-center rounded-md text-[11px] font-medium",
                      profile.injectionWeekday === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dose">Dose utilizada</Label>
              <Input
                id="dose"
                value={profile.dose}
                onChange={(e) => setProfile({ dose: e.target.value })}
                placeholder="Ex.: 2,5 mg"
              />
            </div>
          </>
        )}
      </section>

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold">Equipe</h2>
        <p className="mt-1 text-sm italic text-muted-foreground">{CLINIC_TAGLINE}</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li>
            <a
              href={`https://wa.me/${CLINIC_WHATSAPP}`}
              className="flex items-center gap-2 text-primary"
            >
              <MessageCircle className="size-4" />
              WhatsApp {CLINIC_WHATSAPP_LABEL}
            </a>
          </li>
          <li>
            <a
              href={`https://instagram.com/${CLINIC_INSTAGRAM}`}
              className="flex items-center gap-2 text-primary"
            >
              @{CLINIC_INSTAGRAM}
            </a>
          </li>
          <li>
            <a href={`mailto:${CLINIC_EMAIL}`} className="flex items-center gap-2 text-primary">
              <Mail className="size-4" />
              {CLINIC_EMAIL}
            </a>
          </li>
        </ul>
      </section>

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold">Preparo da bioimpedância</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{BIOIMPEDANCE_PREP}</p>
      </section>

      <aside className="rounded-xl bg-warn p-4 text-warn-foreground">
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
          <TriangleAlert className="size-3.5" />
          Atenção
        </p>
        <p className="text-sm leading-relaxed">{EMERGENCY_COPY}</p>
      </aside>

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold">Conta</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {user?.primaryEmail ?? user?.displayName ?? "Sessão ativa"}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Os registros ficam na sua conta e são visíveis para a paciente e a
          médica vinculadas. Este app é um mapa de acompanhamento e não substitui
          avaliação médica.
        </p>
        <SignOutButton className="mt-4 w-full" />
      </section>

    </div>
  );
}

function InviteCard({ code, doctorName }: { code: string; doctorName: string | null }) {
  const [copied, setCopied] = useState(false);

  return (
    <section className="rounded-xl bg-accent/70 p-5 text-accent-foreground shadow-[var(--shadow-border)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        Acompanhamento
      </p>
      <p className="mt-1 text-sm leading-relaxed">
        {doctorName
          ? `Jornada compartilhada com ${doctorName}. Qualquer registro novo aparece para os dois.`
          : "Este é o código do seu plano, enviado pela médica."}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-card px-4 py-3">
        <p className="font-mono text-2xl tracking-[0.22em]">{code}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Copiar código"
          onClick={() => {
            void navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
    </section>
  );
}
