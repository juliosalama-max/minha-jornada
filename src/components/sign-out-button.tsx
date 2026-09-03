import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logOut } from "@/lib/logout";
import { cn } from "@/lib/utils";

export function SignOutButton({
  className,
  variant = "outline",
  compact = false,
}: {
  className?: string;
  variant?: "outline" | "ghost";
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={cn(compact ? "inline-flex flex-col items-end" : "space-y-2")}>
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError(null);
          void logOut().catch((err: unknown) => {
            setBusy(false);
            setError(err instanceof Error ? err.message : "Não foi possível sair. Tente de novo.");
          });
        }}
      >
        {busy ? "Saindo…" : "Sair da conta"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
