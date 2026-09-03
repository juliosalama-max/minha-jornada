import { useState } from "react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { CARE_FOCUS, CLINIC_NAME, CLINIC_TAGLINE } from "@/lib/constants";
import { useJournal } from "@/lib/journal-store";

export function Onboarding() {
  const complete = useJournal((s) => s.completeOnboarding);
  const storedName = useJournal((s) => s.profile.name);
  const user = useCurrentUser();
  const [name, setName] = useState(storedName || user?.displayName || "");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <div className="mb-8 flex flex-col items-start gap-4">
        <LogoMark className="size-16 rounded-[1.25rem]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          {CLINIC_NAME}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
          Minha jornada
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {CLINIC_TAGLINE}. Acompanhe medicação, movimento, sono e refeições com
          calendários sinceros — não medem perfeição, mostram o que ajustar.
          Tudo fica salvo na sua conta para você e a médica verem juntos.
        </p>
      </div>

      <div className="rounded-xl bg-accent/70 p-4 text-sm leading-relaxed text-accent-foreground">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Foco do cuidado
        </p>
        <p className="mt-1.5">{CARE_FOCUS}</p>
      </div>

      <form
        className="mt-8 flex flex-1 flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          complete({ name: name.trim() });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Seu nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como gostaria de ser chamado"
            autoComplete="name"
          />
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Button type="submit" size="lg" className="w-full">
            Começar acompanhamento
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => complete({ name: name.trim() })}
          >
            Entrar sem preencher agora
          </Button>
        </div>
      </form>
    </div>
  );
}
