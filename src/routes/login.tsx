import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CLINIC_NAME, CLINIC_TAGLINE } from "@/lib/constants";
import { resetPasswordByEmail } from "@/lib/password-reset";

export const Route = createFileRoute("/login")({ component: Login });

function loginErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid origin")) {
    return "Não foi possível validar este acesso. Atualize a página e tente de novo.";
  }
  if (m.includes("invalid email or password") || m.includes("invalid password")) {
    return "E-mail ou senha incorretos. Você pode redefinir a senha abaixo.";
  }
  if (m.includes("user already exists") || m.includes("already exists")) {
    return "Este e-mail já tem conta. Entre ou redefina a senha.";
  }
  if (m.includes("unauthorized")) return "Não autorizado. Tente entrar de novo.";
  return raw;
}

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </main>
    );
  }
  if (user) return <Navigate to="/" />;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "reset") {
        if (password !== confirm) {
          throw new Error("As senhas não coincidem.");
        }
        await resetPasswordByEmail({ data: { email, newPassword: password } });
        setPassword("");
        setConfirm("");
        setMode("in");
        setNotice("Senha atualizada. Entre com a nova senha.");
        setBusy(false);
        return;
      }
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "Paciente",
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message);
      }
      await authClient.getSession();
      window.location.href = "/";
    } catch (err) {
      setError(
        loginErrorMessage(err instanceof Error ? err.message : "Não foi possível entrar."),
      );
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <LogoMark className="size-16 rounded-[1.25rem]" />
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        {CLINIC_NAME}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        {mode === "reset" ? "Redefinir senha" : "Entrar"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {mode === "reset"
          ? "Informe o e-mail cadastrado e escolha uma nova senha. Depois você entra normalmente."
          : `${CLINIC_TAGLINE}. Paciente e médica usam a mesma jornada — os registros ficam salvos na conta e acompanham o tratamento em qualquer aparelho.`}
      </p>

      {authEnabled ? (
        <div className="mt-8 space-y-3">
          {mode !== "reset" && (
            <>
              {GROK_PROVIDERS.filter((p) => p.idp !== "twitter").map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                >
                  Continuar com {p.label}
                </Button>
              ))}

              <div className="relative py-3 text-center text-xs text-muted-foreground">
                <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
                <span className="relative bg-background px-2">ou e-mail</span>
              </div>

              <div className="flex rounded-lg bg-secondary p-1">
                <button
                  type="button"
                  className={`h-9 flex-1 rounded-md text-sm font-medium ${mode === "in" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                  onClick={() => {
                    setMode("in");
                    setError(null);
                    setNotice(null);
                  }}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  className={`h-9 flex-1 rounded-md text-sm font-medium ${mode === "up" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                  onClick={() => {
                    setMode("up");
                    setError(null);
                    setNotice(null);
                  }}
                >
                  Criar conta
                </button>
              </div>
            </>
          )}

          <form className="space-y-3" onSubmit={onEmail}>
            {mode === "up" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{mode === "reset" ? "Nova senha" : "Senha"}</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
              />
            </div>
            {mode === "reset" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirmar nova senha</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            )}
            {notice && <p className="text-sm text-primary">{notice}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy} size="lg">
              {busy
                ? "Aguarde…"
                : mode === "up"
                  ? "Criar conta"
                  : mode === "reset"
                    ? "Redefinir senha"
                    : "Entrar"}
            </Button>
          </form>

          {mode === "in" && (
            <button
              type="button"
              className="w-full text-center text-sm font-medium text-primary"
              onClick={() => {
                setMode("reset");
                setPassword("");
                setConfirm("");
                setError(null);
                setNotice(null);
              }}
            >
              Esqueci a senha
            </button>
          )}
          {mode === "reset" && (
            <button
              type="button"
              className="w-full text-center text-sm font-medium text-muted-foreground"
              onClick={() => {
                setMode("in");
                setPassword("");
                setConfirm("");
                setError(null);
              }}
            >
              Voltar ao login
            </button>
          )}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">O acesso está desativado.</p>
      )}
    </main>
  );
}
