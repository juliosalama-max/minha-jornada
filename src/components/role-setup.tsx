import { useNavigate } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignOutButton } from "@/components/sign-out-button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { CLINIC_NAME } from "@/lib/constants";
import { useJournal } from "@/lib/journal-store";

export function RoleSetup() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const chooseRole = useJournal((s) => s.chooseRole);
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
        Acessar minha Jornada
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Use o código de 6 caracteres enviado pela equipe. Contas profissionais são
        liberadas administrativamente e não podem ser criadas por esta tela.
      </p>

      <div className="mt-6 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
        <div className="flex items-center gap-3">
          <UserRound className="size-5 text-primary" />
          <div>
            <p className="font-display text-lg font-semibold">Paciente</p>
            <p className="text-xs text-muted-foreground">Entrar com o código do plano.</p>
          </div>
        </div>
      </div>

      <form
        className="mt-6 flex flex-1 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          void chooseRole("patient", name.trim() || user?.displayName || "Usuário", inviteCode)
            .then(() => void navigate({ to: "/jornada" }))
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : "Não foi possível continuar.");
              setBusy(false);
            });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="display">Seu nome</Label>
          <Input id="display" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
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
            O código é gerado pela equipe ao preparar sua Jornada.
          </p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={busy || inviteCode.trim().length < 6}>
          {busy ? "Salvando…" : "Continuar"}
        </Button>
        <SignOutButton variant="ghost" className="w-full" />
      </form>
    </div>
  );
}
