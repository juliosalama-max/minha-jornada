import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo-256.png";

export function BrandGlyph({ className }: { className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt=""
      draggable={false}
      className={cn("object-contain", className)}
    />
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-grid size-14 place-items-center overflow-hidden rounded-[1.15rem] bg-white shadow-[var(--shadow-border)]",
        className,
      )}
    >
      <img
        src={LOGO_SRC}
        alt="Método AGIR"
        draggable={false}
        className="h-[78%] w-[78%] object-contain"
      />
    </span>
  );
}

export function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className="size-9 rounded-[0.85rem]" />
      <div className="min-w-0 leading-tight">
        <p className="font-display text-[15px] font-semibold tracking-tight text-foreground">
          {compact ? "AGIR" : "Método AGIR"}
        </p>
        {!compact && (
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Minha jornada
          </p>
        )}
      </div>
    </div>
  );
}
