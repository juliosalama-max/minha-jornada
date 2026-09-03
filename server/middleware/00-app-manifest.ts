/**
 * Serves the Minha Jornada install identity on the platform manifest URL.
 * Must run before grok-pwa.ts (filename sorts first) so custom-domain
 * installs are not labeled "Grok App" with the black default icon.
 */
import { APP_MANIFEST_BODY, isAppManifestPath } from "../../scripts/app-manifest.mjs";

interface AppManifestEvent {
  url: URL;
  req: { method: string };
}

export default async function appManifestMiddleware(
  event: AppManifestEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method === "GET" && isAppManifestPath(event.url.pathname)) {
    return new Response(APP_MANIFEST_BODY, {
      headers: {
        "content-type": "application/manifest+json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
  return next();
}
