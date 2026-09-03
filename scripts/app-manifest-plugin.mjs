/**
 * Vite-dev interceptor so the install prompt matches production.
 * Registered before grokPwaPlugin so it wins on /__grok/manifest.webmanifest.
 */
import { APP_MANIFEST_BODY, isAppManifestPath } from "./app-manifest.mjs";

function serveAppManifest(middlewares) {
  middlewares.use((req, res, next) => {
    const pathOnly = String(req.url ?? "").split("?", 1)[0] ?? "";
    const method = (req.method ?? "GET").toUpperCase();
    if (method !== "GET" || !isAppManifestPath(pathOnly)) {
      next();
      return;
    }
    const body = Buffer.from(APP_MANIFEST_BODY, "utf8");
    res.statusCode = 200;
    res.setHeader("content-type", "application/manifest+json; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.setHeader("content-length", String(body.byteLength));
    res.end(body);
  });
}

export function appManifestPlugin() {
  return {
    name: "app:pwa-manifest",
    enforce: "pre",
    configureServer(server) {
      serveAppManifest(server.middlewares);
    },
    configurePreviewServer(server) {
      serveAppManifest(server.middlewares);
    },
  };
}
