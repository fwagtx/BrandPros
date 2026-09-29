// Renders the BrandPros brand assets (PNG/SVG) and the S01 preview video (MP4).
// Usage: node render.mjs [--fps 30] [--only assets|video] [--scale 0.5]
// Needs: playwright (Chromium) and an ffmpeg binary (FFMPEG env var or `ffmpeg` on PATH).
import { createRequire } from "module";
import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require("playwright"); }
catch { playwright = require(path.join(execSync("npm root -g").toString().trim(), "playwright")); }

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const FPS = Number(args.fps || 30);
const SCALE = Number(args.scale || 1);
const ONLY = args.only || "all";
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const OUT = path.resolve(here, "..");
const exportsDir = path.join(OUT, "exports");
fs.mkdirSync(exportsDir, { recursive: true });

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto("file://" + path.join(here, "stage.html"));
await page.evaluate(() => window.ready);

if (ONLY !== "video") {
  const founders = await page.evaluate(() => BP.FOUNDER_ORDER.map((id) => "founder-" + id));
  fs.mkdirSync(path.join(exportsDir, "founders"), { recursive: true });
  const logoNames = await page.evaluate(() => ["logo-compare", ...BP.LOGO_ORDER.map((id) => "logo-board-" + id)]);
  fs.mkdirSync(path.join(exportsDir, "logo-options"), { recursive: true });
  for (const name of [...logoNames, "avatar", "seal", "wordmark", "wordmark-light", "mascot", "banner", "thumbA", "thumbB", "cast", ...founders]) {
    const [w, h] = await page.evaluate((n) => window.renderAsset(n), name);
    await page.setViewportSize({ width: w, height: h });
    const base = name.startsWith("founder-") ? path.join(exportsDir, "founders", name.slice(8))
      : name.startsWith("logo-") ? path.join(exportsDir, "logo-options", name.slice(5)) : path.join(exportsDir, name);
    await page.screenshot({ path: `${base}.png`, clip: { x: 0, y: 0, width: w, height: h } });
    const svg = await page.evaluate(() => document.querySelector("#stage").innerHTML);
    fs.writeFileSync(`${base}.svg`, svg);
    console.log("asset", name);
  }
  // storyboard stills at key moments
  await page.setViewportSize({ width: 1080, height: 1920 });
  await page.evaluate(() => { const s = document.getElementById("stage"); s.style.width = "1080px"; s.style.height = "1920px"; });
  const keys = await page.evaluate(() => {
    const b = (id) => BP.S01.timeline.beats.find((x) => x.id === id);
    return [["01-hook", b("hook").e - 0.6], ["02-meeting", b("b1").e - 0.8], ["03-late-fees", b("b2").e - 0.5],
      ["04-race", b("b3").s + (b("b3").e - b("b3").s) * 0.35], ["05-door", b("b3").e - 0.7], ["06-one-store", b("b4").e - 0.2],
      ["07-lesson", b("b5").e - 0.6], ["08-end-card", BP.S01.duration - 0.3]];
  });
  for (const [name, t] of keys) {
    await page.evaluate((tt) => window.renderAt(tt), t);
    await page.screenshot({ path: path.join(exportsDir, `s01-frame-${name}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  }
  console.log("storyboard frames done");
}

if (ONLY !== "assets") {
  await page.setViewportSize({ width: 1080, height: 1920 });
  const dur = await page.evaluate(() => window.duration);
  const total = Math.ceil(dur * FPS);
  const outW = Math.round(1080 * SCALE / 2) * 2, outH = Math.round(1920 * SCALE / 2) * 2;
  const ff = spawn(FFMPEG, ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-vf", `scale=${outW}:${outH}:flags=lanczos,format=yuv420p`, "-c:v", "libx264", "-preset", "medium", "-crf", "20",
    "-movflags", "+faststart", path.join(exportsDir, "s01-blockbuster-preview.mp4")], { stdio: ["pipe", "ignore", "inherit"] });
  for (let i = 0; i < total; i++) {
    await page.evaluate((tt) => window.renderAt(tt), i / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 92, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % (FPS * 5) === 0) console.log(`frame ${i}/${total}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log("video done", dur.toFixed(1) + "s");
}
await browser.close();
