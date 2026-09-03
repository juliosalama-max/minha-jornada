import { o as __toESM } from "../_runtime.mjs";
import { l as Slot, m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, t as authClient } from "./client-B40BzJxt.mjs";
import { d as DEFAULT_NUTRITION, f as DEFAULT_TASKS, o as CLINIC_NAME, r as CARE_FOCUS, s as CLINIC_TAGLINE, t as APP_NAME, u as DEFAULT_CONSULTS, v as WEEKDAY_LABELS, y as authMiddleware } from "./constants-Bbft6W_r.mjs";
import { n as auth } from "./server-CyVcbk-U.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { d as House, h as ClipboardCheck, i as Stethoscope, n as UserRound, o as Route, r as TriangleAlert, y as CalendarDays } from "../_libs/lucide-react.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-C_uf36nf.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-l_Cu-CUH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function LogoMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 40 40",
		className: cn("text-primary", className),
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "40",
				height: "40",
				rx: "12",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12.2 26.4c1.8-4.6 4.4-8.6 8.6-12.2 1.4 2.2 2.2 4.8 2.2 7.4 0 2.2-.6 4.2-1.8 6",
				fill: "none",
				stroke: "#F4F0E6",
				strokeWidth: "1.7",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M20.4 10.6c2.4 1.1 4.2 3.1 5.2 5.6",
				fill: "none",
				stroke: "#F4F0E6",
				strokeWidth: "1.7",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "14.6",
				cy: "15.4",
				rx: "3.2",
				ry: "5.2",
				transform: "rotate(-28 14.6 15.4)",
				fill: "#F4F0E6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "18.2",
				cy: "12.2",
				rx: "2.4",
				ry: "4.2",
				transform: "rotate(-8 18.2 12.2)",
				fill: "#D7EBE6"
			})
		]
	});
}
function LogoLockup({ compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-9" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 leading-tight",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-[15px] font-semibold tracking-tight text-foreground",
				children: compact ? "AGIR" : "Método AGIR"
			}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
				children: "Minha jornada"
			})]
		})]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			outline: "border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 px-4 py-2",
			sm: "h-9 rounded-sm px-3 text-xs",
			lg: "h-12 rounded-lg px-6",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className),
	...props
}));
Label.displayName = Root.displayName;
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getBootstrap = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("1b0ac0cec49946a15bba5de64ca5c2092d634b1f80f3fef34ee8d7fe0e610eac"));
var chooseRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({
	role: data.role === "doctor" ? "doctor" : "patient",
	name: data.name.trim()
})).handler(createSsrRpc("7f61b51001e006a2f7bf4f00df9719e502be18e2f18f026c77e97ed0f4d6f009"));
var linkPatientByCode = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({ code: data.code.replace(/[^A-Za-z0-9]/g, "").toUpperCase() })).handler(createSsrRpc("455d17bd5d826cd69b3a7718924f6d34c906ced29ba60ae7b51718371d06308f"));
var saveOnboarding = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("54df7c4dc9564b8f7189fc354ad78c8b737624851236f3f0f62af919b99f7f8c"));
var saveProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("339b5a8b92d0bedf055073daa02630900ea672dfcc49be7371147625968a4178"));
var saveConsults = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("aa5ff95d6331f253f74bd0df334ace4e78297fbc90d7976a683932668f99a413"));
var saveTasks = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("2913e2c0068a16f0b27917b5460d9f4aeef22828b1693b356c31418cb7df3b94"));
var saveDayLog = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("9db50b72520feea187c3eb8feacef7d53ace57c684415294934a28b26761a267"));
var saveMonthNotes = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("9f1d79ae34595bfdb30c792b5dbdea8db45d2e51751f90308c9eb299840dfaab"));
var resetJourney = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("bfcf546444c8655f7a61eb1ab1f5064394c1b2dcd67a1c6d6bd3406a42320844"));
var emptyProfile = () => ({
	name: "",
	firstConsultDate: "",
	injectionWeekday: null,
	dose: ""
});
var seed = () => ({
	onboarded: false,
	profile: emptyProfile(),
	consults: DEFAULT_CONSULTS.map((c) => ({ ...c })),
	nutrition: DEFAULT_NUTRITION.map((c) => ({ ...c })),
	tasks: DEFAULT_TASKS.map((t) => ({
		...t,
		meta: t.meta ? { ...t.meta } : void 0
	})),
	days: {},
	monthNotes: {}
});
function applySnapshot(s) {
	return {
		onboarded: s.onboarded,
		profile: s.profile,
		consults: s.consults,
		nutrition: s.nutrition,
		tasks: s.tasks,
		days: s.days,
		monthNotes: s.monthNotes
	};
}
var profileTimer;
var useJournal = create((set, get) => ({
	...seed(),
	ready: false,
	role: null,
	journeyId: null,
	inviteCode: null,
	doctorName: null,
	patientName: null,
	patients: [],
	applyBootstrap: (b) => {
		if (b.kind === "needs-role") {
			set({
				...seed(),
				ready: true,
				role: null,
				journeyId: null,
				inviteCode: null,
				doctorName: null,
				patientName: null,
				patients: []
			});
			return;
		}
		if (b.kind === "patient") {
			set({
				ready: true,
				role: "patient",
				journeyId: b.journeyId,
				inviteCode: b.inviteCode,
				doctorName: b.doctorName,
				patientName: b.snapshot.profile.name,
				patients: [],
				...applySnapshot(b.snapshot)
			});
			return;
		}
		set({
			ready: true,
			role: "doctor",
			journeyId: b.journeyId,
			inviteCode: b.inviteCode,
			doctorName: b.doctorName,
			patientName: b.patientName,
			patients: b.patients,
			...b.snapshot ? applySnapshot(b.snapshot) : seed()
		});
	},
	hydrate: async (journeyId) => {
		const b = await getBootstrap({ data: journeyId === void 0 ? get().journeyId ? { journeyId: get().journeyId } : {} : { journeyId } });
		get().applyBootstrap(b);
	},
	chooseRole: async (role, name) => {
		const b = await chooseRole({ data: {
			role,
			name
		} });
		get().applyBootstrap(b);
	},
	linkCode: async (code) => {
		const b = await linkPatientByCode({ data: { code } });
		get().applyBootstrap(b);
	},
	openPatient: async (journeyId) => {
		const b = await getBootstrap({ data: { journeyId } });
		get().applyBootstrap(b);
	},
	leavePatient: () => {
		const { patients, doctorName } = get();
		set({
			...seed(),
			ready: true,
			role: "doctor",
			journeyId: null,
			inviteCode: null,
			doctorName,
			patientName: null,
			patients
		});
	},
	completeOnboarding: (profile) => {
		set((s) => ({
			onboarded: true,
			profile: {
				...s.profile,
				...profile
			},
			patientName: profile.name ?? s.patientName
		}));
		saveOnboarding({ data: {
			journeyId: get().journeyId,
			profile
		} });
	},
	setProfile: (patch) => {
		set((s) => ({
			profile: {
				...s.profile,
				...patch
			},
			patientName: patch.name ?? s.patientName
		}));
		clearTimeout(profileTimer);
		profileTimer = setTimeout(() => {
			const s = get();
			saveProfile({ data: {
				journeyId: s.journeyId,
				profile: s.profile
			} });
		}, 400);
	},
	setConsultDate: (stage, date) => {
		set((s) => ({ consults: s.consults.map((c) => c.stage === stage ? {
			...c,
			date
		} : c) }));
		const s = get();
		saveConsults({ data: {
			journeyId: s.journeyId,
			consults: s.consults
		} });
	},
	setNutritionDate: (index, date) => {
		set((s) => ({ nutrition: s.nutrition.map((c) => c.index === index ? {
			...c,
			date
		} : c) }));
		const s = get();
		saveConsults({ data: {
			journeyId: s.journeyId,
			nutrition: s.nutrition
		} });
	},
	toggleTask: (id) => {
		set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? {
			...t,
			done: !t.done
		} : t) }));
		const s = get();
		saveTasks({ data: {
			journeyId: s.journeyId,
			tasks: s.tasks
		} });
	},
	updateTaskMeta: (id, meta) => {
		set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? {
			...t,
			meta: {
				...t.meta ?? {},
				...meta
			}
		} : t) }));
		const s = get();
		saveTasks({ data: {
			journeyId: s.journeyId,
			tasks: s.tasks
		} });
	},
	patchDay: (date, patch) => {
		set((s) => {
			const next = {
				...s.days[date] ?? {},
				...patch
			};
			return { days: {
				...s.days,
				[date]: next
			} };
		});
		saveDayLog({ data: {
			journeyId: get().journeyId,
			date,
			patch
		} });
	},
	setMonthNotes: (month, patch) => {
		set((s) => ({ monthNotes: {
			...s.monthNotes,
			[month]: {
				...s.monthNotes[month] ?? {},
				...patch
			}
		} }));
		saveMonthNotes({ data: {
			journeyId: get().journeyId,
			month,
			patch
		} });
	},
	resetAll: () => {
		resetJourney({ data: { journeyId: get().journeyId } }).then((b) => {
			get().applyBootstrap(b);
		});
	},
	clear: () => set({
		...seed(),
		ready: false,
		role: null,
		journeyId: null,
		inviteCode: null,
		doctorName: null,
		patientName: null,
		patients: []
	})
}));
function DoctorDesk() {
	const patients = useJournal((s) => s.patients);
	const doctorName = useJournal((s) => s.doctorName);
	const linkCode = useJournal((s) => s.linkCode);
	const openPatient = useJournal((s) => s.openPatient);
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-12" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-5 font-display text-3xl font-semibold tracking-tight",
				children: "Pacientes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: [
					"Olá",
					doctorName ? `, ${doctorName}` : "",
					". Peça o código de 6 letras que aparece no perfil do paciente e vincule a jornada."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				onSubmit: (e) => {
					e.preventDefault();
					setBusy(true);
					setError(null);
					linkCode(code).catch((err) => {
						setError(err instanceof Error ? err.message : "Não foi possível vincular.");
					}).finally(() => setBusy(false));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "code",
						children: "Código do paciente"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "code",
						value: code,
						onChange: (e) => setCode(e.target.value.toUpperCase()),
						placeholder: "Ex.: 7K2M9P",
						className: "tracking-[0.2em]",
						autoCapitalize: "characters"
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-destructive",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: busy || code.trim().length < 6,
						children: busy ? "Vinculando…" : "Vincular jornada"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-2",
				children: patients.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void openPatient(p.id),
					className: "flex w-full items-center justify-between rounded-xl bg-card px-4 py-4 text-left shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: p.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs tracking-widest text-muted-foreground",
						children: p.inviteCode
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-primary",
						children: "Abrir"
					})]
				}) }, p.id))
			}),
			patients.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted-foreground",
				children: "Nenhum paciente vinculado ainda."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				className: "mt-auto",
				onClick: () => void signOut(),
				children: "Sair"
			})
		]
	});
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
function Onboarding() {
	const complete = useJournal((s) => s.completeOnboarding);
	const inviteCode = useJournal((s) => s.inviteCode);
	const storedName = useJournal((s) => s.profile.name);
	const user = useCurrentUser();
	const [name, setName] = (0, import_react.useState)(storedName || user?.displayName || "");
	const [firstConsultDate, setFirstConsultDate] = (0, import_react.useState)("");
	const [injectionWeekday, setInjectionWeekday] = (0, import_react.useState)(null);
	const [dose, setDose] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex flex-col items-start gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-14" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-semibold uppercase tracking-[0.22em] text-primary",
						children: CLINIC_NAME
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl font-semibold tracking-tight text-foreground",
						children: "Minha jornada"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-sm text-sm leading-relaxed text-muted-foreground",
						children: [CLINIC_TAGLINE, ". Acompanhe medicação, movimento, sono e refeições com calendários sinceros — não medem perfeição, mostram o que ajustar. Tudo fica salvo na sua conta para você e a médica verem juntos."]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-accent/70 p-4 text-sm leading-relaxed text-accent-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
					children: "Foco do cuidado"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5",
					children: CARE_FOCUS
				})]
			}),
			inviteCode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
						children: "Código para a médica"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-2xl tracking-[0.22em]",
						children: inviteCode
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Ela entra com a própria conta e usa este código para abrir a mesma jornada."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-8 flex flex-1 flex-col gap-5",
				onSubmit: (e) => {
					e.preventDefault();
					complete({
						name: name.trim(),
						firstConsultDate,
						injectionWeekday,
						dose: dose.trim()
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "name",
							children: "Seu nome"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "name",
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Como gostaria de ser chamado",
							autoComplete: "name"
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
							value: firstConsultDate,
							onChange: (e) => setFirstConsultDate(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Dia fixo da aplicação" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-7 gap-1",
							children: WEEKDAY_LABELS.map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setInjectionWeekday(injectionWeekday === i ? null : i),
								className: cn("flex h-11 flex-col items-center justify-center rounded-md text-[11px] font-medium whitespace-nowrap transition-colors", injectionWeekday === i ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-[var(--shadow-border)]"),
								"aria-pressed": injectionWeekday === i,
								children: label.slice(0, 3)
							}, label))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "dose",
							children: "Dose utilizada (opcional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "dose",
							value: dose,
							onChange: (e) => setDose(e.target.value),
							placeholder: "Ex.: 2,5 mg"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex flex-col gap-2 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "lg",
							className: "w-full",
							children: "Começar acompanhamento"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							className: "w-full",
							onClick: () => complete({ name: name.trim() }),
							children: "Entrar sem preencher agora"
						})]
					})
				]
			})
		]
	});
}
function RoleSetup() {
	const user = useCurrentUser();
	const chooseRole = useJournal((s) => s.chooseRole);
	const [role, setRole] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)(user?.displayName ?? "");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-12" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary",
				children: CLINIC_NAME
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl font-semibold tracking-tight",
				children: "Como você vai usar o app?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted-foreground",
				children: "A jornada fica na sua conta. Paciente e médica compartilham os mesmos registros depois do vínculo pelo código."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setRole("patient"),
					className: cn("flex min-h-28 flex-col items-start gap-2 rounded-xl p-4 text-left shadow-[var(--shadow-border)]", role === "patient" ? "bg-primary text-primary-foreground" : "bg-card"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-5" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg font-semibold",
							children: "Paciente"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs opacity-80",
							children: "Registrar o dia a dia e gerar o código."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setRole("doctor"),
					className: cn("flex min-h-28 flex-col items-start gap-2 rounded-xl p-4 text-left shadow-[var(--shadow-border)]", role === "doctor" ? "bg-primary text-primary-foreground" : "bg-card"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stethoscope, { className: "size-5" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg font-semibold",
							children: "Médica"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs opacity-80",
							children: "Acompanhar pacientes com o código."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex flex-1 flex-col gap-4",
				onSubmit: (e) => {
					e.preventDefault();
					if (!role) {
						setError("Escolha paciente ou médica.");
						return;
					}
					setBusy(true);
					setError(null);
					chooseRole(role, name.trim() || user?.displayName || "Usuário").catch((err) => {
						setError(err instanceof Error ? err.message : "Não foi possível continuar.");
						setBusy(false);
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "display",
							children: role === "doctor" ? "Nome profissional" : "Seu nome"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "display",
							value: name,
							onChange: (e) => setName(e.target.value),
							required: true
						})]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-destructive",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "lg",
						disabled: busy || !role,
						children: busy ? "Salvando…" : "Continuar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => void signOut(),
						children: "Sair"
					})
				]
			})
		]
	});
}
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
var NAV = [
	{
		to: "/",
		label: "Início",
		icon: House
	},
	{
		to: "/hoje",
		label: "Hoje",
		icon: ClipboardCheck
	},
	{
		to: "/mes",
		label: "Mês",
		icon: CalendarDays
	},
	{
		to: "/jornada",
		label: "Jornada",
		icon: Route
	},
	{
		to: "/perfil",
		label: "Perfil",
		icon: UserRound
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user, isPending } = useCurrentUserState();
	const ready = useJournal((s) => s.ready);
	const role = useJournal((s) => s.role);
	const onboarded = useJournal((s) => s.onboarded);
	const journeyId = useJournal((s) => s.journeyId);
	const hydrate = useJournal((s) => s.hydrate);
	const clear = useJournal((s) => s.clear);
	const [bootError, setBootError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!user) {
			clear();
			setBootError(null);
			return;
		}
		setBootError(null);
		hydrate().catch((err) => {
			setBootError(err instanceof Error ? err.message : "Não foi possível carregar a jornada.");
		});
	}, [
		user?.id,
		hydrate,
		clear
	]);
	if (pathname === "/login") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, { label: "Carregando sua sessão…" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (bootError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {
		label: bootError,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			className: "mt-3",
			onClick: () => {
				setBootError(null);
				hydrate().catch((err) => {
					setBootError(err instanceof Error ? err.message : "Não foi possível carregar a jornada.");
				});
			},
			children: "Tentar de novo"
		})
	});
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, { label: "Carregando sua jornada…" });
	if (!role) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleSetup, {});
	if (role === "doctor" && !journeyId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoctorDesk, {});
	if (!onboarded && role === "patient") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Onboarding, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh w-full max-w-lg md:max-w-5xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border/70 bg-card/60 px-3 py-5 md:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoLockup, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mt-8 flex flex-col gap-1",
					"aria-label": "Principal",
					children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
						...item,
						active: pathname === item.to
					}, item.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountChip, { className: "mt-auto" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "md:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoLockup, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SharingBanner, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountChip, { className: "ml-auto hidden sm:flex md:hidden" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-8",
					children
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden",
					"aria-label": "Principal",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mx-auto grid max-w-lg grid-cols-5 px-1 pt-1",
						children: NAV.map((item) => {
							const active = pathname === item.to;
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground hover:text-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-5",
									strokeWidth: active ? 2.2 : 1.8
								}), item.label]
							}) }, item.to);
						})
					})
				})
			]
		})]
	});
}
function NavLink({ to, label, icon: Icon, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors", active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-4",
			strokeWidth: active ? 2.2 : 1.8
		}), label]
	});
}
function BootScreen({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3 text-center text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoLockup, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: label
				}),
				children
			]
		})
	});
}
function SharingBanner() {
	const role = useJournal((s) => s.role);
	const inviteCode = useJournal((s) => s.inviteCode);
	const doctorName = useJournal((s) => s.doctorName);
	const patientName = useJournal((s) => s.patientName);
	const leavePatient = useJournal((s) => s.leavePatient);
	if (role === "doctor") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "truncate text-sm font-medium",
			children: patientName || "Paciente"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "text-xs text-primary",
			onClick: () => leavePatient(),
			children: "Trocar paciente"
		})]
	});
	if (!inviteCode) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "truncate text-xs text-muted-foreground",
			children: doctorName ? `Compartilhado com ${doctorName}` : "Código para a médica"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-sm tracking-[0.18em]",
			children: inviteCode
		})]
	});
}
function AccountChip({ className }) {
	const { user } = useCurrentUserState();
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-8 w-8 animate-pulse rounded-full bg-secondary", className) });
	const label = user.displayName ?? user.primaryEmail ?? "Conta";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2", className),
		children: [user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: user.profileImageUrl,
			alt: "",
			className: "size-8 rounded-full object-cover"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-8 place-items-center rounded-full bg-secondary text-xs font-medium",
			children: label.charAt(0).toUpperCase()
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "text-xs text-muted-foreground underline-offset-4 hover:underline",
			onClick: () => void signOut().catch(() => void 0),
			children: "Sair"
		})]
	});
}
var styles_default = "/assets/styles-HjWpfms0.css";
var Route$8 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#1B7A72"
			},
			{
				name: "description",
				content: "Plano de acompanhamento e registros mensais do Método AGIR — medicação, movimento, sono e refeições."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "pt-BR",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$5 = () => import("./routes-DRmPqJJu.mjs");
var Route$7 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./hoje-D2h7QB_L.mjs");
var Route$6 = createFileRoute("/hoje")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./jornada-yP-G3A7j.mjs");
var Route$5 = createFileRoute("/jornada")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./login-tvMocdKv.mjs");
var Route$4 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./mes-Da2Iwbqi.mjs");
var Route$3 = createFileRoute("/mes")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./perfil-CnR_H_6h.mjs");
var Route$2 = createFileRoute("/perfil")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$1 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var rootRouteChildren = {
	IndexRoute: Route$7.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$8
	}),
	HojeRoute: Route$6.update({
		id: "/hoje",
		path: "/hoje",
		getParentRoute: () => Route$8
	}),
	JornadaRoute: Route$5.update({
		id: "/jornada",
		path: "/jornada",
		getParentRoute: () => Route$8
	}),
	LoginRoute: Route$4.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$8
	}),
	MesRoute: Route$3.update({
		id: "/mes",
		path: "/mes",
		getParentRoute: () => Route$8
	}),
	PerfilRoute: Route$2.update({
		id: "/perfil",
		path: "/perfil",
		getParentRoute: () => Route$8
	}),
	ApiAuthSplatRoute: Route$1.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$8
	})
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Label as a, LogoMark as c, useJournal as i, cn as l, useCurrentUser as n, Input as o, useCurrentUserState as r, Button as s, router_exports as t };
