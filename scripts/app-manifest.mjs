/** App identity for the install prompt. Shared by Vite + Nitro interceptors. */
export const APP_MANIFEST = {
  name: "Minha Jornada",
  short_name: "Jornada",
  id: "/",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#FFFFFF",
  theme_color: "#1B7A72",
  icons: [
    {
      src: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-512-maskable.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};

export const APP_MANIFEST_BODY = `${JSON.stringify(APP_MANIFEST, null, 2)}\n`;

/** @param {unknown} pathname */
export function isAppManifestPath(pathname) {
  const path = String(pathname ?? "").split("?")[0];
  return (
    path === "/__grok/manifest.webmanifest" ||
    path === "/__grok/manifest.json" ||
    path === "/manifest.webmanifest"
  );
}
