import { useNavigate } from "@tanstack/react-router";
import { Stethoscope, UserRound } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignOutButton } from "@/components/sign-out-button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { CLINIC_NAME } from "@/lib/constants";
import { useJournal } from "@/lib/journal-store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoleSetup() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const chooseRole = useJournal((s) => s.chooseRole);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState(user?.displayName ?? "");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <LogoMark className="size-16 rounded-[1.25rem]" />
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        {CLINIC_NAME}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Como você vai usar o app?
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Se a médica já montou o seu plano, use o código de 6 caracteres que ela enviou.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("patient")}
          className={cn(
            "flex min-h-28 flex-col items-start gap-2 rounded-xl p-4 text-left shadow-[var(--shadow-border)]",
            role === "patient" ? "bg-primary text-primary-foreground" : "bg-card",
          )}
        >
          <UserRound className="size-5" />
          <span className="font-display text-lg font-semibold">Paciente</span>
          <span className="text-xs opacity-80">Entrar com o código do plano.</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("doctor")}
          className={cn(
            "flex min-h-28 flex-col items-start gap-2 rounded-xl p-4 text-left shadow-[var(--shadow-border)]",
            role === "doctor" ? "bg-primary text-primary-foreground" : "bg-card",
          )}
        >
          <Stethoscope className="size-5" />
          <span className="font-display text-lg font-semibold">Médica</span>
          <span className="text-xs opacity-80">Montar o plano e enviar o código.</span>
        </button>
      </div>

      <form
        className="mt-6 flex flex-1 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!role) {
            setError("Escolha paciente ou médica.");
            return;
          }
          setBusy(true);
          setError(null);
          void chooseRole(role, name.trim() || user?.displayName || "Usuário", inviteCode)
            .then(() => {
              if (role === "patient") void navigate({ to: "/jornada" });
            })
            .catch((err: unknown) => {
            setError(err instanceof Error ? err.message : "Não foi possível continuar.");
            setBusy(false);
          });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="display">{role === "doctor" ? "Nome profissional" : "Seu nome"}</Label>
          <Input
            id="display"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        {role === "patient" && (
          <div className="space-y-1.5">
            <Label htmlFor="invite">Código do plano</Label>
            <Input
              id="invite"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Ex.: 7K2M9P"
              className="tracking-[0.2em]"
              autoCapitalize="characters"
            />
            <p className="text-xs text-muted-foreground">
              Só a médica gera este código. Sem ele não é possível entrar.
            </p>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={busy || !role || (role === "patient" && inviteCode.trim().length < 6)}>
          {busy ? "Salvando…" : "Continuar"}
        </Button>
        <SignOutButton variant="ghost" className="w-full" />
      </form>
    </div>
  );
}
