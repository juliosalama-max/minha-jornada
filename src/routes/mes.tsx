import { createFileRoute } from "@tanstack/react-router";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { DayEditor } from "@/components/day-editor";
import { MonthGrid } from "@/components/month-grid";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  formatMonthTitle,
  formatSymptoms,
  monthKey,
  monthStats,
  parseKey,
} from "@/lib/calendar";
import { useJournal } from "@/lib/journal-store";
import type { DayLog, MonthNotes } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mes")({ component: MesPage });

type Tab = "med" | "walk" | "gym" | "cpap" | "meals";

const EMPTY_NOTES: MonthNotes = {};

function MesPage() {
  const [month, setMonth] = useState(() => new Date());
  const [tab, setTab] = useState<Tab>("med");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const days = useJournal((s) => s.days);
  const notes = useJournal((s) => s.monthNotes[monthKey(month)]) ?? EMPTY_NOTES;
  const setNotes = useJournal((s) => s.setMonthNotes);
  const weekday = useJournal((s) => s.profile.injectionWeekday);
  const dose = useJournal((s) => s.profile.dose);
  const stats = useMemo(() => monthStats(month, days), [month, days]);
  const mk = monthKey(month);

  const openDate = openKey ? parseKey(openKey) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label="Mês anterior"
        >
          <ChevronLeft />
        </Button>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {formatMonthTitle(month)}
        </h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Próximo mês"
        >
          <ChevronRight />
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="med" className="px-2.5">
            Med
          </TabsTrigger>
          <TabsTrigger value="walk" className="px-2.5">
            Andar
          </TabsTrigger>
          <TabsTrigger value="gym" className="px-2.5">
            Treino
          </TabsTrigger>
          <TabsTrigger value="cpap" className="px-2.5">
            CPAP
          </TabsTrigger>
          <TabsTrigger value="meals" className="px-2.5">
            Refeições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="med">
          <p className="mb-3 text-sm text-muted-foreground">
            Código do sintoma e intensidade 0 a 3. No dia da aplicação, marque também a letra A.
          </p>
          <MonthGrid
            month={month}
            injectionWeekday={weekday}
            onSelect={(c) => setOpenKey(c.key)}
            renderCell={(c) => <MedCell log={days[c.key]} />}
          />
          <Summary
            rows={[
              ["Dia fixo da aplicação", weekdayLabel(weekday)],
              ["Dose utilizada", dose || "—"],
              ["Aplicações no mês", String(stats.applications)],
            ]}
          />
          <NoteField
            label="Sintoma que mais incomodou"
            value={notes.worstSymptom ?? ""}
            onChange={(v) => setNotes(mk, { worstSymptom: v })}
          />
        </TabsContent>

        <TabsContent value="walk">
          <p className="mb-3 text-sm text-muted-foreground">
            Escreva os minutos realizados. Exemplo: 30 min.
          </p>
          <MonthGrid
            month={month}
            onSelect={(c) => setOpenKey(c.key)}
            renderCell={(c) => <WalkCell log={days[c.key]} />}
          />
          <Summary
            rows={[
              ["Total de caminhadas", String(stats.walks)],
              ["Total aproximado de minutos", `${stats.walkMinutes} min`],
            ]}
          />
          <NoteField
            label="Como me senti durante as caminhadas"
            value={notes.walkFeeling ?? ""}
            onChange={(v) => setNotes(mk, { walkFeeling: v })}
          />
        </TabsContent>

        <TabsContent value="gym">
          <p className="mb-3 text-sm text-muted-foreground">
            Marque os dias de musculação. Meta: até 3 vezes por semana.
          </p>
          <MonthGrid
            month={month}
            onSelect={(c) => setOpenKey(c.key)}
            renderCell={(c) => <GymCell log={days[c.key]} />}
          />
          <Summary
            rows={[
              ["Total de treinos", `${stats.gymSessions} (meta ${stats.gymTarget})`],
            ]}
          />
          <NoteField
            label="Houve falta de ar fora do habitual?"
            value={notes.gymBreathlessness ?? ""}
            onChange={(v) => setNotes(mk, { gymBreathlessness: v })}
          />
          <NoteField
            label="Dificuldade principal"
            value={notes.gymDifficulty ?? ""}
            onChange={(v) => setNotes(mk, { gymDifficulty: v })}
          />
        </TabsContent>

        <TabsContent value="cpap">
          <p className="mb-3 text-sm text-muted-foreground">
            Horas aproximadas de uso. Objetivo: desde o começo do sono.
          </p>
          <MonthGrid
            month={month}
            onSelect={(c) => setOpenKey(c.key)}
            renderCell={(c) => <CpapCell log={days[c.key]} />}
          />
          <Summary
            rows={[
              ["Noites com CPAP durante todo o sono", String(stats.cpapFullNights)],
              [
                "Média aproximada de horas por noite",
                stats.cpapNights ? `${stats.cpapAvg.toFixed(1)} h` : "—",
              ],
            ]}
          />
          <NoteField
            label="Principal dificuldade com o CPAP"
            value={notes.cpapDifficulty ?? ""}
            onChange={(v) => setNotes(mk, { cpapDifficulty: v })}
          />
        </TabsContent>

        <TabsContent value="meals">
          <p className="mb-3 text-sm text-muted-foreground">
            ✓ pelo menos 3 refeições sem jejum maior que 6 h. J quando houver jejum prolongado.
          </p>
          <MonthGrid
            month={month}
            onSelect={(c) => setOpenKey(c.key)}
            renderCell={(c) => <MealCell log={days[c.key]} />}
          />
          <Summary
            rows={[
              ["Dias com rotina alimentar organizada", String(stats.mealsOk)],
              ["Dias com jejum prolongado", String(stats.mealsFast)],
            ]}
          />
          <NoteField
            label="Situação mais difícil da semana ou do mês"
            value={notes.mealHardest ?? ""}
            onChange={(v) => setNotes(mk, { mealHardest: v })}
          />
        </TabsContent>
      </Tabs>

      <Drawer open={Boolean(openKey)} onOpenChange={(o) => !o && setOpenKey(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Registro do dia</DrawerTitle>
            <DrawerDescription>
              {openDate
                ? format(openDate, "EEEE, d 'de' MMMM", { locale: ptBR })
                : ""}
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-5 pb-8">
            {openKey && openDate && <DayEditor dateKey={openKey} date={openDate} />}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function MedCell({ log }: { log?: DayLog }) {
  if (!log) return null;
  const text = `${log.applied ? "A " : ""}${formatSymptoms(log.symptoms)}`.trim();
  if (!text) return null;
  return <p className="truncate font-medium text-foreground">{text}</p>;
}

function WalkCell({ log }: { log?: DayLog }) {
  if (!log?.walkMinutes) return null;
  return <p className="truncate font-medium tabular-nums text-foreground">{log.walkMinutes}'</p>;
}

function GymCell({ log }: { log?: DayLog }) {
  if (!log?.gym) return null;
  return <p className="font-semibold text-primary">X</p>;
}

function CpapCell({ log }: { log?: DayLog }) {
  if (!log) return null;
  if (!log.cpapHours && !log.cpapFullNight) return null;
  return (
    <p className="truncate font-medium tabular-nums text-foreground">
      {log.cpapHours ? `${log.cpapHours}h` : ""}
      {log.cpapFullNight ? " •" : ""}
    </p>
  );
}

function MealCell({ log }: { log?: DayLog }) {
  if (!log?.meals) return null;
  return (
    <p className={cn("font-semibold", log.meals === "ok" ? "text-ok" : "text-fast")}>
      {log.meals === "ok" ? "✓" : "J"}
    </p>
  );
}

function Summary({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-4 space-y-2 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="font-display text-base font-semibold">Resumo do mês</p>
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-3 text-sm">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-right font-medium tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function NoteField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-3 space-y-1.5">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function weekdayLabel(day: number | null) {
  if (day === null) return "Não definido";
  const names = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  return names[day];
}
