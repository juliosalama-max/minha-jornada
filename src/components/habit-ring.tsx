import { cn } from "@/lib/utils";

type Props = {
  value: number;
  max: number;
  label: string;
  detail: string;
  className?: string;
};

export function HabitRing({ value, max, label, detail, className }: Props) {
  const pct = max <= 0 ? 0 : Math.min(1, value / max);
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg viewBox="0 0 44 44" className="size-12 shrink-0 -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          className="stroke-secondary"
          strokeWidth="5"
        />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          className="stroke-primary"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground tabular-nums">{detail}</p>
      </div>
    </div>
  );
}
