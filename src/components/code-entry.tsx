import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignOutButton } from "@/components/sign-out-button";
import { CLINIC_NAME } from "@/lib/constants";
import { useJournal } from "@/lib/journal-store";

export function CodeEntry() {
  const claimCode = useJournal((s) => s.claimCode);
  const patientName = useJournal((s) => s.patientName);
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <LogoMark className="size-16 rounded-[1.25rem]" />
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        {CLINIC_NAME}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        {patientName ? `Olá, ${patientName.split(" ")[0]}` : "Entre com o código"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        A médica envia o código do seu plano. Depois de incluir, você vai
        direto para a jornada.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          void claimCode(code)
            .then(() => navigate({ to: "/jornada" }))
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : "Código inválido.");
              setBusy(false);
            });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="plan-code">Código do plano</Label>
          <Input
            id="plan-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex.: 7K2M9P"
            className="tracking-[0.2em]"
            autoCapitalize="characters"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy || code.trim().length < 6}>
          {busy ? "Abrindo jornada…" : "Entrar na jornada"}
        </Button>
      </form>
      <SignOutButton variant="ghost" className="mt-auto w-full" />
    </div>
  );
}
