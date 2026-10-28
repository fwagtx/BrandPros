// Renders brand assets from assets.js to PNG.
// Names may contain folders: "badroyale/pfp" → brand/badroyale/pfp.png (paths are relative to brand/).
// Usage: node render.mjs [--pre data.js ...] [name ...]   (no names = everything)
//   --pre loads a data script into the page first (e.g. a day's plan.js for the Item Shop cover).
import { createRequire } from "module";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const BRAND = path.resolve(here, "..", "..");
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require("playwright"); }
catch { playwright = require(path.join(execSync("npm root -g").toString().trim(), "playwright")); }

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto("file://" + path.join(here, "stage.html"));
await page.evaluate(() => window.ready);
const argv = process.argv.slice(2), pre = [];
for (let i = argv.indexOf("--pre"); i >= 0; i = argv.indexOf("--pre")) pre.push(...argv.splice(i, 2).slice(1));
for (const f of pre) await page.addScriptTag({ path: path.resolve(f) });
const names = argv.length ? argv : await page.evaluate(() => window.assetNames());
for (const name of names) {
  const [w, h] = await page.evaluate((n) => window.renderAsset(n), name);
  await page.setViewportSize({ width: w, height: h });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  const out = path.join(BRAND, name + ".png");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h }, omitBackground: true });
  console.log("rendered", path.relative(BRAND, out));
}
await browser.close();
