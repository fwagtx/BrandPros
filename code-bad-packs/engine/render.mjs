// Renders every brand-pack asset to ../exports/<name>.png
// Usage: node render.mjs [name ...]
import { createRequire } from "module";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require("playwright"); }
catch { playwright = require(path.join(execSync("npm root -g").toString().trim(), "playwright")); }

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto("file://" + path.join(here, "stage.html"));
await page.evaluate(() => window.ready);
const names = process.argv.slice(2).length ? process.argv.slice(2) : await page.evaluate(() => window.assetNames());
for (const name of names) {
  const [w, h] = await page.evaluate((n) => window.renderAsset(n), name);
  await page.setViewportSize({ width: w, height: h });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  await page.screenshot({ path: path.join(here, "..", "exports", `${name}.png`), clip: { x: 0, y: 0, width: w, height: h } });
  console.log("rendered", name);
}
await browser.close();
