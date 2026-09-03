import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const mark = readFileSync("public/app-icon.svg", "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function shot(size, dest) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!doctype html><html><head><style>
      html,body{margin:0;padding:0;width:${size}px;height:${size}px;background:#1B7A72}
      svg{display:block;width:${size}px;height:${size}px}
    </style></head><body>${mark}</body></html>`,
    { waitUntil: "load" },
  );
  const buf = await page.screenshot({ type: "png", omitBackground: false });
  writeFileSync(dest, buf);
  console.log("wrote", dest, buf.length);
}

await shot(180, "public/apple-touch-icon.png");
await shot(192, "public/icon-192.png");
await shot(512, "public/icon-512.png");
await browser.close();
