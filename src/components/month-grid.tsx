import type { ReactNode } from "react";
import { WEEKDAYS_MON } from "@/lib/constants";
import { isInjectionDay, monthGrid, type GridCell } from "@/lib/calendar";
import { cn } from "@/lib/utils";

type Props = {
  month: Date;
  injectionWeekday?: number | null;
  renderCell: (cell: GridCell) => ReactNode;
  onSelect?: (cell: GridCell) => void;
};

export function MonthGrid({ month, injectionWeekday = null, renderCell, onSelect }: Props) {
  const cells = monthGrid(month);

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-semibold tracking-wide text-muted-foreground">
        {WEEKDAYS_MON.map((d) => (
          <div key={d} className="py-1 whitespace-nowrap">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const inj = cell.inMonth && isInjectionDay(cell.date, injectionWeekday);
          return (
            <button
              key={cell.key}
              type="button"
              disabled={!cell.inMonth}
              onClick={() => cell.inMonth && onSelect?.(cell)}
              className={cn(
                "relative flex min-h-14 flex-col items-stretch overflow-hidden rounded-md p-1 text-left transition-colors",
                cell.inMonth
                  ? "bg-card shadow-[var(--shadow-border)] hover:bg-accent/60"
                  : "opacity-0",
                cell.isToday && cell.inMonth && "ring-2 ring-primary/50",
                inj && "bg-accent",
              )}
            >
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] font-semibold tabular-nums leading-none",
                  cell.isToday ? "text-primary" : "text-muted-foreground",
                )}
              >
                {cell.date.getDate()}
              </span>
              <div className="mt-1 min-h-5 flex-1 overflow-hidden text-[10px] leading-tight">
                {cell.inMonth ? renderCell(cell) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
