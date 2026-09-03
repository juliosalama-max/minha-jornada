import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { a as CLINIC_INSTAGRAM, c as CLINIC_WHATSAPP, i as CLINIC_EMAIL, l as CLINIC_WHATSAPP_LABEL, n as BIOIMPEDANCE_PREP, o as CLINIC_NAME, p as EMERGENCY_COPY, s as CLINIC_TAGLINE, v as WEEKDAY_LABELS } from "./constants-Bbft6W_r.mjs";
import { c as MessageCircle, l as Mail, m as Copy, r as TriangleAlert, v as Check } from "../_libs/lucide-react.mjs";
import { a as Label, c as LogoMark, i as useJournal, l as cn, n as useCurrentUser, o as Input, s as Button } from "./router-l_Cu-CUH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/perfil-CnR_H_6h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PerfilPage() {
	const profile = useJournal((s) => s.profile);
	const setProfile = useJournal((s) => s.setProfile);
	const resetAll = useJournal((s) => s.resetAll);
	const role = useJournal((s) => s.role);
	const inviteCode = useJournal((s) => s.inviteCode);
	const doctorName = useJournal((s) => s.doctorName);
	const patients = useJournal((s) => s.patients);
	const journeyId = useJournal((s) => s.journeyId);
	const openPatient = useJournal((s) => s.openPatient);
	const leavePatient = useJournal((s) => s.leavePatient);
	const user = useCurrentUser();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-12" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-semibold tracking-tight",
					children: "Perfil"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: role === "doctor" ? "Acompanhamento médico" : CLINIC_NAME
				})] })]
			}),
			role === "patient" && inviteCode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteCard, {
				code: inviteCode,
				doctorName
			}),
			role === "doctor" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Pacientes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Tudo o que o paciente registra aparece aqui. Use o código do perfil para vincular uma nova jornada."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: patients.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void openPatient(p.id),
							className: cn("flex w-full items-center justify-between rounded-lg px-3 py-3 text-left", p.id === journeyId ? "bg-accent text-accent-foreground" : "bg-secondary"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium",
								children: p.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs tracking-widest opacity-70",
								children: p.inviteCode
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs",
								children: p.id === journeyId ? "Atual" : "Abrir"
							})]
						}) }, p.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "w-full",
						onClick: () => leavePatient(),
						children: "Vincular outro paciente"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "nome",
							children: role === "doctor" ? "Nome do paciente" : "Nome"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "nome",
							value: profile.name,
							onChange: (e) => setProfile({ name: e.target.value })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "first",
							children: "Data da primeira consulta"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "first",
							type: "date",
							value: profile.firstConsultDate,
							onChange: (e) => setProfile({ firstConsultDate: e.target.value })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Dia fixo da aplicação" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-7 gap-1",
							children: WEEKDAY_LABELS.map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setProfile({ injectionWeekday: profile.injectionWeekday === i ? null : i }),
								className: cn("flex h-11 items-center justify-center rounded-md text-[11px] font-medium", profile.injectionWeekday === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"),
								children: label.slice(0, 3)
							}, label))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "dose",
							children: "Dose utilizada"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "dose",
							value: profile.dose,
							onChange: (e) => setProfile({ dose: e.target.value }),
							placeholder: "Ex.: 2,5 mg"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Equipe"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm italic text-muted-foreground",
						children: CLINIC_TAGLINE
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `https://wa.me/${CLINIC_WHATSAPP}`,
								className: "flex items-center gap-2 text-primary",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }),
									"WhatsApp ",
									CLINIC_WHATSAPP_LABEL
								]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `https://instagram.com/${CLINIC_INSTAGRAM}`,
								className: "flex items-center gap-2 text-primary",
								children: ["@", CLINIC_INSTAGRAM]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `mailto:${CLINIC_EMAIL}`,
								className: "flex items-center gap-2 text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), CLINIC_EMAIL]
							}) })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Preparo da bioimpedância"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: BIOIMPEDANCE_PREP
				})]
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Conta"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: user?.primaryEmail ?? user?.displayName ?? "Sessão ativa"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-relaxed text-muted-foreground",
						children: "Os registros ficam na sua conta e são visíveis para a paciente e a médica vinculadas. Este app é um mapa de acompanhamento e não substitui avaliação médica."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "mt-4 w-full",
						onClick: () => void signOut().catch(() => void 0),
						children: "Sair da conta"
					})
				]
			}),
			role === "patient" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				className: "mb-6 w-full text-destructive",
				onClick: () => {
					if (confirm("Zerar a jornada salva na conta? A médica também deixa de ver esses registros.")) resetAll();
				},
				children: "Zerar jornada"
			})
		]
	});
}
function InviteCard({ code, doctorName }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-accent/70 p-5 text-accent-foreground shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
				children: "Acompanhamento"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm leading-relaxed",
				children: doctorName ? `Jornada compartilhada com ${doctorName}. Qualquer registro novo aparece para os dois.` : "Envie este código para a médica. Com ele ela abre a mesma jornada e acompanha tudo o que você preencher."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center justify-between gap-3 rounded-lg bg-card px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-2xl tracking-[0.22em]",
					children: code
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					"aria-label": "Copiar código",
					onClick: () => {
						navigator.clipboard.writeText(code).then(() => {
							setCopied(true);
							window.setTimeout(() => setCopied(false), 1600);
						});
					},
					children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
				})]
			})
		]
	});
}
//#endregion
export { PerfilPage as component };
