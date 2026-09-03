import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, n as CheckboxIndicator, p as require_jsx_runtime, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { g as TASK_CATEGORY_LABEL, m as INCLUDED, n as BIOIMPEDANCE_PREP, r as CARE_FOCUS } from "./constants-Bbft6W_r.mjs";
import { u as Leaf, v as Check } from "../_libs/lucide-react.mjs";
import { a as Label, i as useJournal, l as cn, o as Input } from "./router-l_Cu-CUH.mjs";
import { n as parseISO, o as format, t as ptBR } from "../_libs/date-fns.mjs";
import { n as Progress, t as Badge } from "./progress-D1na0Yvx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jornada-yP-G3A7j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("peer size-5 shrink-0 rounded-xs border border-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("flex items-center justify-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: "size-3.5",
			strokeWidth: 3
		})
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
function JornadaPage() {
	const consults = useJournal((s) => s.consults);
	const nutrition = useJournal((s) => s.nutrition);
	const setConsultDate = useJournal((s) => s.setConsultDate);
	const setNutritionDate = useJournal((s) => s.setNutritionDate);
	const tasks = useJournal((s) => s.tasks);
	const toggleTask = useJournal((s) => s.toggleTask);
	const updateTaskMeta = useJournal((s) => s.updateTaskMeta);
	const done = tasks.filter((t) => t.done).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
					children: "Bem-vindo ao Método AGIR"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-semibold tracking-tight",
					children: "Como será nossa jornada"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: "Este material é o mapa de acompanhamento. Use os calendários com sinceridade: eles não medem perfeição, mas ajudam a identificar o que funciona e o que precisa ser ajustado."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "O que está incluído"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: INCLUDED.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2 text-sm leading-relaxed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-4 shrink-0 text-primary" }), item]
					}, item))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-accent p-5 text-accent-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
					children: "Foco do cuidado"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-sm leading-relaxed",
					children: CARE_FOCUS
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Consultas médicas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "space-y-3",
					children: consults.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-semibold", c.date ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"),
								children: c.stage
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium",
											children: c.period
										}), i < consults.length - 1 && c.date && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "mint",
											children: "Agendada"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: c.focus
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: `c-${c.stage}`,
										className: "mt-3 block text-xs",
										children: "Data"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: `c-${c.stage}`,
										type: "date",
										className: "mt-1",
										value: c.date,
										onChange: (e) => setConsultDate(c.stage, e.target.value)
									}),
									c.date && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs capitalize text-muted-foreground",
										children: format(parseISO(c.date), "EEEE, d 'de' MMMM", { locale: ptBR })
									})
								]
							})]
						})
					}, c.stage))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Consultas com a nutricionista"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3",
					children: nutrition.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: `n-${n.index}`,
							children: [n.index, "ª consulta"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: `n-${n.index}`,
							type: "date",
							className: "mt-2",
							value: n.date,
							onChange: (e) => setNutritionDate(n.index, e.target.value)
						})]
					}, n.index))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Minhas tarefas iniciais"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs tabular-nums text-muted-foreground",
							children: [
								done,
								"/",
								tasks.length
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: done / tasks.length * 100 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Marque cada item quando estiver concluído e leve os resultados às consultas."
					}),
					[
						"agenda",
						"exames",
						"docs"
					].map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs font-semibold uppercase tracking-[0.14em] text-primary",
							children: TASK_CATEGORY_LABEL[cat]
						}), tasks.filter((t) => t.category === cat).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskRow, {
							task: t,
							onToggle: () => toggleTask(t.id),
							onMeta: (meta) => updateTaskMeta(t.id, meta)
						}, t.id))]
					}, cat))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "flex items-center gap-2 font-display text-lg font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "size-4 text-primary" }), "Antes de cada bioimpedância"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: BIOIMPEDANCE_PREP
				})]
			})
		]
	});
}
function TaskRow({ task, onToggle, onMeta }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					checked: task.done,
					onCheckedChange: () => onToggle(),
					className: "mt-0.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("text-sm leading-relaxed", task.done && "text-muted-foreground line-through"),
					children: task.title
				})]
			}),
			task.id === "polissonografia" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 pl-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "psg-date",
					className: "text-xs",
					children: "Data agendada"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "psg-date",
					type: "date",
					className: "mt-1",
					value: task.meta?.date ?? "",
					onChange: (e) => onMeta({ date: e.target.value })
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "psg-local",
					className: "text-xs",
					children: "Local"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "psg-local",
					className: "mt-1",
					value: task.meta?.local ?? "",
					onChange: (e) => onMeta({ local: e.target.value })
				})] })]
			}),
			task.id === "cardio" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 pl-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cardio-ex",
						className: "text-xs",
						children: "Exames solicitados"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "cardio-ex",
						className: "mt-1",
						value: task.meta?.exams ?? "",
						onChange: (e) => onMeta({ exams: e.target.value })
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cardio-dt",
						className: "text-xs",
						children: "Data(s)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "cardio-dt",
						className: "mt-1",
						value: task.meta?.dates ?? "",
						onChange: (e) => onMeta({ dates: e.target.value })
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: task.meta?.delivered === "true",
							onCheckedChange: (v) => onMeta({ delivered: v ? "true" : "false" })
						}), "Resultado entregue"]
					})
				]
			})
		]
	});
}
//#endregion
export { JornadaPage as component };
