import { createFileRoute, Navigate } from "@tanstack/react-router";
import { addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DayEditor } from "@/components/day-editor";
import { Button } from "@/components/ui/button";
import { formatLong, toKey } from "@/lib/calendar";
import { useJournal } from "@/lib/journal-store";

export const Route = createFileRoute("/hoje")({ component: HojePage });

function HojePage() {
  const role = useJournal((s) => s.role);
  const [date, setDate] = useState(() => new Date());
  const key = toKey(date);
  const isToday = key === toKey(new Date());

  if (role === "doctor") return <Navigate to="/mes" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDate((d) => addDays(d, -1))}
          aria-label="Dia anterior"
        >
          <ChevronLeft />
        </Button>
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {isToday ? "Hoje" : "Registro do dia"}
          </h1>
          <p className="text-xs text-muted-foreground first-letter:uppercase">{formatLong(date)}</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDate((d) => addDays(d, 1))}
          aria-label="Próximo dia"
        >
          <ChevronRight />
        </Button>
      </div>
      {!isToday && (
        <Button variant="ghost" className="w-full" onClick={() => setDate(new Date())}>
          Voltar para hoje
        </Button>
      )}
      <DayEditor dateKey={key} date={date} />
    </div>
  );
}
