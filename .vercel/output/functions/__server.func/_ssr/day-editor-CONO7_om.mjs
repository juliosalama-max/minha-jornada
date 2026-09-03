import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { h as SYMPTOMS } from "./constants-Bbft6W_r.mjs";
import { a as Salad, f as Footprints, p as Droplets, s as Moon, t as Weight } from "../_libs/lucide-react.mjs";
import { a as Label, i as useJournal, l as cn, o as Input, s as Button } from "./router-l_Cu-CUH.mjs";
import { a as isInjectionDay } from "./calendar-CEOEGpQf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/day-editor-CONO7_om.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var EMPTY_LOG = {};
function DayEditor({ dateKey, date }) {
	const log = useJournal((s) => s.days[dateKey]) ?? EMPTY_LOG;
	const patch = useJournal((s) => s.patchDay);
	const weekday = useJournal((s) => s.profile.injectionWeekday);
	const inj = isInjectionDay(date, weekday);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				icon: Droplets,
				title: "Medicação e efeitos",
				children: [
					inj && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 rounded-md bg-accent px-3 py-2 text-xs text-accent-foreground",
						children: "Dia fixo da aplicação."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						label: "Apliquei hoje",
						on: Boolean(log.applied),
						onToggle: () => patch(dateKey, { applied: !log.applied })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 mb-2 text-xs font-medium text-muted-foreground",
						children: "Sintomas · intensidade 0 a 3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-2",
						children: SYMPTOMS.map((s) => {
							const current = log.symptoms?.find((x) => x.code === s.code);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => patch(dateKey, { symptoms: toggleSymptom(log, s.code) }),
										className: cn("flex h-10 min-w-14 items-center justify-center rounded-md text-xs font-semibold", Boolean(current) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"),
										children: s.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex-1 text-sm",
										children: s.label
									}),
									s.code !== "S" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex gap-1",
										children: [
											1,
											2,
											3
										].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => patch(dateKey, { symptoms: setIntensity(log, s.code, n) }),
											className: cn("size-9 rounded-md text-xs font-semibold tabular-nums", current?.intensity === n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
											children: n
										}, n))
									})
								]
							}, s.code);
						})
					}),
					log.symptoms?.some((s) => s.code === "O") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "other",
							children: "Descreva o outro sintoma"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "other",
							value: log.otherNote ?? "",
							onChange: (e) => patch(dateKey, { otherNote: e.target.value })
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				icon: Footprints,
				title: "Caminhada",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs text-muted-foreground",
					children: "Anote os minutos. Realize apenas o que foi orientado e o que estiver dentro da sua tolerância."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => patch(dateKey, { walkMinutes: Math.max(0, (log.walkMinutes ?? 0) - 10) }),
							children: "−10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 0,
							inputMode: "numeric",
							className: "text-center text-lg tabular-nums",
							value: log.walkMinutes ?? 0,
							onChange: (e) => patch(dateKey, { walkMinutes: Math.max(0, Number(e.target.value) || 0) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: "min"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => patch(dateKey, { walkMinutes: (log.walkMinutes ?? 0) + 10 }),
							children: "+10"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				icon: Weight,
				title: "Musculação",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs text-muted-foreground",
						children: "Meta inicial: até 3 vezes por semana, respeitando a avaliação cardiológica."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						label: "Treinei hoje",
						on: Boolean(log.gym),
						onToggle: () => patch(dateKey, { gym: !log.gym })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "gym-note",
							children: "Motivo se reduziu ou interrompeu"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "gym-note",
							value: log.gymNote ?? "",
							onChange: (e) => patch(dateKey, { gymNote: e.target.value }),
							placeholder: "Opcional"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				icon: Moon,
				title: "Sono e CPAP",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs text-muted-foreground",
						children: "Inicie o uso desde o começo do sono, inclusive quando adormecer no sofá."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => patch(dateKey, { cpapHours: Math.max(0, Math.round(((log.cpapHours ?? 0) - .5) * 10) / 10) }),
								children: "−0,5"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 0,
								step: .5,
								inputMode: "decimal",
								className: "text-center text-lg tabular-nums",
								value: log.cpapHours ?? 0,
								onChange: (e) => patch(dateKey, { cpapHours: Math.max(0, Number(e.target.value) || 0) })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: "h"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => patch(dateKey, { cpapHours: Math.round(((log.cpapHours ?? 0) + .5) * 10) / 10 }),
								children: "+0,5"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
							label: "Usei durante todo o sono",
							on: Boolean(log.cpapFullNight),
							onToggle: () => patch(dateKey, { cpapFullNight: !log.cpapFullNight })
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				icon: Salad,
				title: "Regularidade das refeições",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs text-muted-foreground",
					children: "Rotina ok: pelo menos 3 refeições e nenhum jejum maior que 6 horas. Fins de semana: programe uma refeição antes do almoço tardio."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MealChoice, {
						label: "Rotina organizada",
						hint: "✓",
						active: log.meals === "ok",
						onClick: () => patch(dateKey, { meals: log.meals === "ok" ? void 0 : "ok" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MealChoice, {
						label: "Jejum prolongado",
						hint: "J",
						active: log.meals === "fast",
						onClick: () => patch(dateKey, { meals: log.meals === "fast" ? void 0 : "fast" })
					})]
				})]
			})
		]
	});
}
function Section({ icon: Icon, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
			className: "mb-3 flex items-center gap-2 font-display text-base font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" }), title]
		}), children]
	});
}
function ToggleRow({ label, on, onToggle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onToggle,
		className: "flex w-full items-center justify-between rounded-md bg-secondary/70 px-3 py-3 text-left",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("flex h-6 w-11 items-center rounded-full p-0.5 transition-colors", on ? "bg-primary" : "bg-border"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-5 rounded-full bg-card shadow-sm transition-transform", on && "translate-x-5") })
		})]
	});
}
function MealChoice({ label, hint, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex min-h-16 flex-col items-start justify-center rounded-lg px-3 py-2 text-left transition-colors", active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-lg leading-none",
			children: hint
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-1 text-xs",
			children: label
		})]
	});
}
function toggleSymptom(log, code) {
	const current = log.symptoms ?? [];
	if (code === "S") return current.some((s) => s.code === "S") ? [] : [{
		code: "S",
		intensity: 0
	}];
	const exists = current.find((s) => s.code === code);
	const withoutS = current.filter((s) => s.code !== "S" && s.code !== code);
	if (exists) return withoutS;
	return [...withoutS, {
		code,
		intensity: 1
	}];
}
function setIntensity(log, code, intensity) {
	return [...(log.symptoms ?? []).filter((s) => s.code !== "S").filter((s) => s.code !== code), {
		code,
		intensity
	}];
}
//#endregion
export { Textarea as n, DayEditor as t };
