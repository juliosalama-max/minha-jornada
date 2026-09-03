import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { _ as WEEKDAYS_MON } from "./constants-Bbft6W_r.mjs";
import { _ as ChevronLeft, g as ChevronRight } from "../_libs/lucide-react.mjs";
import { a as Label, i as useJournal, l as cn, s as Button } from "./router-l_Cu-CUH.mjs";
import { o as format, t as ptBR, u as addMonths } from "../_libs/date-fns.mjs";
import { a as isInjectionDay, c as monthStats, l as parseKey, n as formatMonthTitle, o as monthGrid, r as formatSymptoms, s as monthKey } from "./calendar-CEOEGpQf.mjs";
import { n as Textarea, t as DayEditor } from "./day-editor-CONO7_om.mjs";
import { t as Drawer } from "../_libs/vaul.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mes-Da2Iwbqi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MonthGrid({ month, injectionWeekday = null, renderCell, onSelect }) {
	const cells = monthGrid(month);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-1 grid grid-cols-7 text-center text-[10px] font-semibold tracking-wide text-muted-foreground",
		children: WEEKDAYS_MON.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "py-1 whitespace-nowrap",
			children: d
		}, d))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-7 gap-1",
		children: cells.map((cell) => {
			const inj = cell.inMonth && isInjectionDay(cell.date, injectionWeekday);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: !cell.inMonth,
				onClick: () => cell.inMonth && onSelect?.(cell),
				className: cn("relative flex min-h-14 flex-col items-stretch overflow-hidden rounded-md p-1 text-left transition-colors", cell.inMonth ? "bg-card shadow-[var(--shadow-border)] hover:bg-accent/60" : "opacity-0", cell.isToday && cell.inMonth && "ring-2 ring-primary/50", inj && "bg-accent"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("whitespace-nowrap text-[11px] font-semibold tabular-nums leading-none", cell.isToday ? "text-primary" : "text-muted-foreground"),
					children: cell.date.getDate()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 min-h-5 flex-1 overflow-hidden text-[10px] leading-tight",
					children: cell.inMonth ? renderCell(cell) : null
				})]
			}, cell.key);
		})
	})] });
}
var Drawer$1 = ({ shouldScaleBackground = false, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Root, {
	shouldScaleBackground,
	...props
});
Drawer$1.displayName = "Drawer";
Drawer.Trigger;
var DrawerPortal = Drawer.Portal;
Drawer.Close;
var DrawerOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, {
	ref,
	className: cn("fixed inset-0 z-50 bg-ink/40", className),
	...props
}));
DrawerOverlay.displayName = Drawer.Overlay.displayName;
var DrawerContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
	ref,
	className: cn("fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[92dvh] flex-col rounded-t-2xl bg-card", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-3 h-1.5 w-12 rounded-full bg-border" }), children]
})] }));
DrawerContent.displayName = "DrawerContent";
var DrawerHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("grid gap-1.5 p-5 pb-2 text-left", className),
	...props
});
DrawerHeader.displayName = "DrawerHeader";
var DrawerFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("mt-auto flex flex-col gap-2 p-5", className),
	...props
});
DrawerFooter.displayName = "DrawerFooter";
var DrawerTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Title, {
	ref,
	className: cn("font-display text-xl font-semibold leading-snug", className),
	...props
}));
DrawerTitle.displayName = Drawer.Title.displayName;
var DrawerDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DrawerDescription.displayName = Drawer.Description.displayName;
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-11 items-center justify-start gap-1 rounded-lg bg-secondary p-1 text-muted-foreground overflow-x-auto", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-[color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-4 focus-visible:outline-none", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var EMPTY_NOTES = {};
function MesPage() {
	const [month, setMonth] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const [tab, setTab] = (0, import_react.useState)("med");
	const [openKey, setOpenKey] = (0, import_react.useState)(null);
	const days = useJournal((s) => s.days);
	const notes = useJournal((s) => s.monthNotes[monthKey(month)]) ?? EMPTY_NOTES;
	const setNotes = useJournal((s) => s.setMonthNotes);
	const weekday = useJournal((s) => s.profile.injectionWeekday);
	const dose = useJournal((s) => s.profile.dose);
	const stats = (0, import_react.useMemo)(() => monthStats(month, days), [month, days]);
	const mk = monthKey(month);
	const openDate = openKey ? parseKey(openKey) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						onClick: () => setMonth((m) => addMonths(m, -1)),
						"aria-label": "Mês anterior",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-semibold tracking-tight",
						children: formatMonthTitle(month)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						onClick: () => setMonth((m) => addMonths(m, 1)),
						"aria-label": "Próximo mês",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: tab,
				onValueChange: (v) => setTab(v),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "w-full justify-start",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "med",
								className: "px-2.5",
								children: "Med"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "walk",
								className: "px-2.5",
								children: "Andar"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "gym",
								className: "px-2.5",
								children: "Treino"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "cpap",
								className: "px-2.5",
								children: "CPAP"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "meals",
								className: "px-2.5",
								children: "Refeições"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "med",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-sm text-muted-foreground",
								children: "Código do sintoma e intensidade 0 a 3. No dia da aplicação, marque também a letra A."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthGrid, {
								month,
								injectionWeekday: weekday,
								onSelect: (c) => setOpenKey(c.key),
								renderCell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedCell, { log: days[c.key] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, { rows: [
								["Dia fixo da aplicação", weekdayLabel(weekday)],
								["Dose utilizada", dose || "—"],
								["Aplicações no mês", String(stats.applications)]
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteField, {
								label: "Sintoma que mais incomodou",
								value: notes.worstSymptom ?? "",
								onChange: (v) => setNotes(mk, { worstSymptom: v })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "walk",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-sm text-muted-foreground",
								children: "Escreva os minutos realizados. Exemplo: 30 min."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthGrid, {
								month,
								onSelect: (c) => setOpenKey(c.key),
								renderCell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalkCell, { log: days[c.key] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, { rows: [["Total de caminhadas", String(stats.walks)], ["Total aproximado de minutos", `${stats.walkMinutes} min`]] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteField, {
								label: "Como me senti durante as caminhadas",
								value: notes.walkFeeling ?? "",
								onChange: (v) => setNotes(mk, { walkFeeling: v })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "gym",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-sm text-muted-foreground",
								children: "Marque os dias de musculação. Meta: até 3 vezes por semana."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthGrid, {
								month,
								onSelect: (c) => setOpenKey(c.key),
								renderCell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GymCell, { log: days[c.key] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, { rows: [["Total de treinos", `${stats.gymSessions} (meta ${stats.gymTarget})`]] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteField, {
								label: "Houve falta de ar fora do habitual?",
								value: notes.gymBreathlessness ?? "",
								onChange: (v) => setNotes(mk, { gymBreathlessness: v })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteField, {
								label: "Dificuldade principal",
								value: notes.gymDifficulty ?? "",
								onChange: (v) => setNotes(mk, { gymDifficulty: v })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "cpap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-sm text-muted-foreground",
								children: "Horas aproximadas de uso. Objetivo: desde o começo do sono."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthGrid, {
								month,
								onSelect: (c) => setOpenKey(c.key),
								renderCell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CpapCell, { log: days[c.key] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, { rows: [["Noites com CPAP durante todo o sono", String(stats.cpapFullNights)], ["Média aproximada de horas por noite", stats.cpapNights ? `${stats.cpapAvg.toFixed(1)} h` : "—"]] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteField, {
								label: "Principal dificuldade com o CPAP",
								value: notes.cpapDifficulty ?? "",
								onChange: (v) => setNotes(mk, { cpapDifficulty: v })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "meals",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-sm text-muted-foreground",
								children: "✓ pelo menos 3 refeições sem jejum maior que 6 h. J quando houver jejum prolongado."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthGrid, {
								month,
								onSelect: (c) => setOpenKey(c.key),
								renderCell: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MealCell, { log: days[c.key] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, { rows: [["Dias com rotina alimentar organizada", String(stats.mealsOk)], ["Dias com jejum prolongado", String(stats.mealsFast)]] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteField, {
								label: "Situação mais difícil da semana ou do mês",
								value: notes.mealHardest ?? "",
								onChange: (v) => setNotes(mk, { mealHardest: v })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
				open: Boolean(openKey),
				onOpenChange: (o) => !o && setOpenKey(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, { children: "Registro do dia" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerDescription, { children: openDate ? format(openDate, "EEEE, d 'de' MMMM", { locale: ptBR }) : "" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-y-auto px-5 pb-8",
					children: openKey && openDate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayEditor, {
						dateKey: openKey,
						date: openDate
					})
				})] })
			})
		]
	});
}
function MedCell({ log }) {
	if (!log) return null;
	const text = `${log.applied ? "A " : ""}${formatSymptoms(log.symptoms)}`.trim();
	if (!text) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "truncate font-medium text-foreground",
		children: text
	});
}
function WalkCell({ log }) {
	if (!log?.walkMinutes) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "truncate font-medium tabular-nums text-foreground",
		children: [log.walkMinutes, "'"]
	});
}
function GymCell({ log }) {
	if (!log?.gym) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-semibold text-primary",
		children: "X"
	});
}
function CpapCell({ log }) {
	if (!log) return null;
	if (!log.cpapHours && !log.cpapFullNight) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "truncate font-medium tabular-nums text-foreground",
		children: [log.cpapHours ? `${log.cpapHours}h` : "", log.cpapFullNight ? " •" : ""]
	});
}
function MealCell({ log }) {
	if (!log?.meals) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("font-semibold", log.meals === "ok" ? "text-ok" : "text-fast"),
		children: log.meals === "ok" ? "✓" : "J"
	});
}
function Summary({ rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
		className: "mt-4 space-y-2 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-base font-semibold",
			children: "Resumo do mês"
		}), rows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-muted-foreground",
				children: k
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "text-right font-medium tabular-nums",
				children: v
			})]
		}, k))]
	});
}
function NoteField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
function weekdayLabel(day) {
	if (day === null) return "Não definido";
	return [
		"Domingo",
		"Segunda",
		"Terça",
		"Quarta",
		"Quinta",
		"Sexta",
		"Sábado"
	][day];
}
//#endregion
export { MesPage as component };
