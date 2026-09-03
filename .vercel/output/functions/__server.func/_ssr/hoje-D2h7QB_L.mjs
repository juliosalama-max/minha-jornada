import { o as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { _ as ChevronLeft, g as ChevronRight } from "../_libs/lucide-react.mjs";
import { s as Button } from "./router-l_Cu-CUH.mjs";
import { d as addDays } from "../_libs/date-fns.mjs";
import { t as formatLong, u as toKey } from "./calendar-CEOEGpQf.mjs";
import { t as DayEditor } from "./day-editor-CONO7_om.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hoje-D2h7QB_L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HojePage() {
	const [date, setDate] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const key = toKey(date);
	const isToday = key === toKey(/* @__PURE__ */ new Date());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						onClick: () => setDate((d) => addDays(d, -1)),
						"aria-label": "Dia anterior",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl font-semibold tracking-tight",
							children: isToday ? "Hoje" : "Registro do dia"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground first-letter:uppercase",
							children: formatLong(date)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						onClick: () => setDate((d) => addDays(d, 1)),
						"aria-label": "Próximo dia",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
					})
				]
			}),
			!isToday && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "w-full",
				onClick: () => setDate(/* @__PURE__ */ new Date()),
				children: "Voltar para hoje"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayEditor, {
				dateKey: key,
				date
			})
		]
	});
}
//#endregion
export { HojePage as component };
