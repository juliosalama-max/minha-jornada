import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ClipboardCheck, House, Route, UserRound } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { CodeEntry } from "@/components/code-entry";
import { DoctorDesk } from "@/components/doctor-desk";
import { LogoLockup } from "@/components/logo";
import { Onboarding } from "@/components/onboarding";
import { RoleSetup } from "@/components/role-setup";
import { Button } from "@/components/ui/button";
import { logOut } from "@/lib/logout";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useJournal } from "@/lib/journal-store";
import { cn } from "@/lib/utils";

const NAV_PATIENT = [
  { to: "/", label: "Início", icon: House },
  { to: "/hoje", label: "Hoje", icon: ClipboardCheck },
  { to: "/mes", label: "Evolução", icon: CalendarDays },
  { to: "/jornada", label: "Jornada", icon: Route },
  { to: "/perfil", label: "Perfil", icon: UserRound },
] as const;

const NAV_DOCTOR = [
  { to: "/", label: "Início", icon: House },
  { to: "/mes", label: "Registros", icon: ClipboardCheck },
  { to: "/jornada", label: "Jornada", icon: Route },
  { to: "/perfil", label: "Perfil", icon: UserRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const ready = useJournal((s) => s.ready);
  const role = useJournal((s) => s.role);
  const onboarded = useJournal((s) => s.onboarded);
  const journeyId = useJournal((s) => s.journeyId);
  const hydrate = useJournal((s) => s.hydrate);
  const clear = useJournal((s) => s.clear);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      clear();
      setBootError(null);
      return;
    }
    setBootError(null);
    void hydrate().catch((err: unknown) => {
      setBootError(err instanceof Error ? err.message : "Não foi possível carregar a jornada.");
    });
  }, [user?.id, hydrate, clear]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isPending) {
    return <BootScreen label="Carregando sua sessão…" />;
  }
  if (!user) return <RedirectToSignIn />;
  if (bootError) {
    return (
      <BootScreen label={bootError}>
        <Button
          type="button"
          className="mt-3"
          onClick={() => {
            setBootError(null);
            void hydrate().catch((err: unknown) => {
              setBootError(
                err instanceof Error ? err.message : "Não foi possível carregar a jornada.",
              );
            });
          }}
        >
          Tentar de novo
        </Button>
      </BootScreen>
    );
  }
  if (!ready) return <BootScreen label="Carregando sua jornada…" />;
  if (!role) return <RoleSetup />;
  if (role === "doctor" && !journeyId) return <DoctorDesk />;
  if (role === "patient" && !journeyId) return <CodeEntry />;
  if (!onboarded && role === "patient") return <Onboarding />;

  const nav = role === "doctor" ? NAV_DOCTOR : NAV_PATIENT;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg md:max-w-5xl">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border/70 bg-card/60 px-3 py-5 md:flex">
        <LogoLockup />
        <nav className="mt-8 flex flex-col gap-1" aria-label="Principal">
          {nav.map((item) => (
            <NavLink key={item.to} {...item} active={pathname === item.to} />
          ))}
        </nav>
        <AccountChip className="mt-auto" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-md">
          <div className="md:hidden">
            <LogoLockup />
          </div>
          <SharingBanner />
          <HeaderSignOut />
          <AccountChip className="ml-auto hidden sm:flex md:hidden" />
        </header>
        <main className="flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-8">{children}</main>
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
          aria-label="Principal"
        >
          <ul className={cn("mx-auto grid max-w-lg px-1 pt-1", role === "doctor" ? "grid-cols-4" : "grid-cols-5")}>
            {nav.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium transition-colors",
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: (typeof NAV_PATIENT)[number]["icon"];
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="size-4" strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}

function BootScreen({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
        <LogoLockup />
        <span className="text-sm">{label}</span>
        {children}
      </div>
    </div>
  );
}

function HeaderSignOut() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:underline disabled:opacity-60 md:hidden"
      onClick={() => {
        setBusy(true);
        void logOut().catch(() => setBusy(false));
      }}
    >
      {busy ? "Saindo…" : "Sair"}
    </button>
  );
}

function SharingBanner() {
  const role = useJournal((s) => s.role);
  const inviteCode = useJournal((s) => s.inviteCode);
  const doctorName = useJournal((s) => s.doctorName);
  const patientName = useJournal((s) => s.patientName);
  const leavePatient = useJournal((s) => s.leavePatient);

  if (role === "doctor") {
    return (
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{patientName || "Paciente"}</p>
        <button type="button" className="text-xs text-primary" onClick={() => leavePatient()}>
          Trocar paciente
        </button>
      </div>
    );
  }

  if (!inviteCode) return <div className="flex-1" />;
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs text-muted-foreground">
        {doctorName ? `Acompanhamento com ${doctorName}` : "Seu plano"}
      </p>
    </div>
  );
}

function AccountChip({ className }: { className?: string }) {
  const { user } = useCurrentUserState();
  const [busy, setBusy] = useState(false);
  if (!user) {
    return <div className={cn("h-8 w-8 animate-pulse rounded-full bg-secondary", className)} />;
  }
  const label = user.displayName ?? user.primaryEmail ?? "Conta";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt="" className="size-8 rounded-full object-cover" />
      ) : (
        <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-medium">
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <button
        type="button"
        disabled={busy}
        className="text-xs text-muted-foreground underline-offset-4 hover:underline disabled:opacity-60"
        onClick={() => {
          setBusy(true);
          void logOut().catch(() => setBusy(false));
        }}
      >
        {busy ? "Saindo…" : "Sair"}
      </button>
    </div>
  );
}
