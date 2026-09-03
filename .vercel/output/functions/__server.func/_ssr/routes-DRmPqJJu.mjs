import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as EMERGENCY_COPY, r as CARE_FOCUS } from "./constants-Bbft6W_r.mjs";
import { b as ArrowRight, i as Stethoscope, r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { i as useJournal, l as cn, s as Button } from "./router-l_Cu-CUH.mjs";
import { n as parseISO, o as format, t as ptBR, u as addMonths } from "../_libs/date-fns.mjs";
import { c as monthStats, i as hasAnyLog, t as formatLong, u as toKey } from "./calendar-CEOEGpQf.mjs";
import { n as Progress, t as Badge } from "./progress-D1na0Yvx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DRmPqJJu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HabitRing({ value, max, label, detail, className }) {
	const pct = max <= 0 ? 0 : Math.min(1, value / max);
	const r = 18;
	const c = 2 * Math.PI * r;
	const dash = c * pct;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-3", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 44 44",
			className: "size-12 shrink-0 -rotate-90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "22",
				cy: "22",
				r,
				fill: "none",
				className: "stroke-secondary",
				strokeWidth: "5"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "22",
				cy: "22",
				r,
				fill: "none",
				className: "stroke-primary",
				strokeWidth: "5",
				strokeLinecap: "round",
				strokeDasharray: `${dash} ${c - dash}`
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium leading-tight",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground tabular-nums",
				children: detail
			})]
		})]
	});
}
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl bg-card text-card-foreground shadow-[var(--shadow-border)]", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col gap-1.5 p-5", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-display text-lg font-semibold leading-snug tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-5 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-5 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
function Home() {
	const name = useJournal((s) => s.profile.name);
	const days = useJournal((s) => s.days);
	const consults = useJournal((s) => s.consults);
	const tasks = useJournal((s) => s.tasks);
	const role = useJournal((s) => s.role);
	const inviteCode = useJournal((s) => s.inviteCode);
	const doctorName = useJournal((s) => s.doctorName);
	const today = /* @__PURE__ */ new Date();
	const stats = monthStats(today, days);
	const todayLog = days[toKey(today)];
	const doneToday = hasAnyLog(todayLog);
	const nextConsult = consults.find((c) => !c.date) ?? consults.find((c) => {
		if (!c.date) return false;
		return parseISO(c.date) >= new Date(toKey(today));
	});
	const shown = consults.filter((c) => c.date && parseISO(c.date) >= new Date(toKey(today))).sort((a, b) => a.date.localeCompare(b.date))[0] ?? nextConsult;
	const tasksDone = tasks.filter((t) => t.done).length;
	const greeting = greetingFor(today);
	const first = name.trim().split(" ")[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-[0.16em] text-primary",
						children: format(today, "MMMM yyyy", { locale: ptBR })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display text-3xl font-semibold tracking-tight",
						children: [greeting, first ? `, ${first}` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground first-letter:uppercase",
						children: formatLong(today)
					})
				]
			}),
			role === "patient" && inviteCode && !doctorName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-accent/70 p-4 text-accent-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
					children: "Convide a médica"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm",
					children: [
						"Compartilhe o código",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tracking-[0.18em]",
							children: inviteCode
						}),
						" para ela acompanhar os mesmos registros."
					]
				})]
			}),
			role === "doctor" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Você está vendo a jornada compartilhada. Qualquer alteração fica disponível para o paciente na conta dele."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center justify-between gap-3 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg font-semibold",
						children: "Registro de hoje"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: doneToday ? "Você já anotou este dia." : "Ainda não preenchido."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/hoje",
							children: [doneToday ? "Revisar" : "Registrar", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Este mês"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/mes",
							className: "text-xs font-medium text-primary",
							children: "Ver calendários"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HabitRing, {
								value: stats.applications,
								max: 5,
								label: "Aplicações",
								detail: `${stats.applications} no mês`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HabitRing, {
								value: stats.walks,
								max: stats.daysTotal,
								label: "Caminhada",
								detail: `${stats.walks} ${stats.walks === 1 ? "dia" : "dias"} · ${stats.walkMinutes} min`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HabitRing, {
								value: stats.gymSessions,
								max: stats.gymTarget,
								label: "Musculação",
								detail: `${stats.gymSessions} de ${stats.gymTarget} (meta 3×/sem)`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HabitRing, {
								value: stats.cpapNights,
								max: stats.daysTotal,
								label: "CPAP",
								detail: stats.cpapNights ? `${stats.cpapAvg.toFixed(1)} h média · ${stats.cpapFullNights} ${stats.cpapFullNights === 1 ? "noite completa" : "noites completas"}` : "Sem registros"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HabitRing, {
								value: stats.mealsOk,
								max: stats.daysTotal,
								label: "Refeições",
								detail: `${stats.mealsOk} ${stats.mealsOk === 1 ? "dia ok" : "dias ok"} · ${stats.mealsFast} ${stats.mealsFast === 1 ? "jejum" : "jejuns"}`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 flex justify-between text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dias com algum registro" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums",
								children: [
									stats.daysLogged,
									"/",
									stats.daysTotal
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: stats.daysLogged / stats.daysTotal * 100 })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stethoscope, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Próxima consulta"
						})]
					}),
					shown ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium",
							children: [
								"Etapa ",
								shown.stage,
								" · ",
								shown.period
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: shown.focus
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							children: shown.date ? format(parseISO(shown.date), "d 'de' MMMM", { locale: ptBR }) : "Data ainda não definida"
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Nenhuma consulta pendente."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "mt-4 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/jornada",
							children: "Abrir jornada"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Tarefas iniciais"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs tabular-nums text-muted-foreground",
							children: [
								tasksDone,
								"/",
								tasks.length
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: tasksDone / tasks.length * 100 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-1.5",
						children: tasks.filter((t) => !t.done).slice(0, 3).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-muted-foreground",
							children: t.title
						}, t.id))
					}),
					tasksDone === tasks.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "mint",
						className: "mt-3",
						children: "Todas concluídas"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						className: "mt-2 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/jornada",
							children: "Ver checklist"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "rounded-xl bg-warn p-4 text-warn-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }), "Atenção"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed",
					children: EMERGENCY_COPY
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-1 pb-2 text-xs leading-relaxed text-muted-foreground",
				children: [
					CARE_FOCUS,
					" Próximo mês: ",
					format(addMonths(today, 1), "MMMM", { locale: ptBR }),
					"."
				]
			})
		]
	});
}
function greetingFor(date) {
	const h = date.getHours();
	if (h < 12) return "Bom dia";
	if (h < 18) return "Boa tarde";
	return "Boa noite";
}
//#endregion
export { Home as component };
