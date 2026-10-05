// Renders a NOT BAD. video: frames → silent mp4, then mix.py adds synthesized sound → ../exports/video-<name>.mp4
// Usage: node render.mjs <skin|roast> [--fps 30] [--stills 1.0,2.5,...] [--out dir]
import { createRequire } from "module";
import { execSync, spawn, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require("playwright"); }
catch { playwright = require(path.join(execSync("npm root -g").toString().trim(), "playwright")); }

const name = process.argv[2];
const args = Object.fromEntries(process.argv.slice(3).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const FPS = Number(args.fps || 30);
const OUT = path.resolve(args.out || path.join(here, "..", "exports"));
const FFMPEG = process.env.FFMPEG || execSync(`python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`).toString().trim();
fs.mkdirSync(OUT, { recursive: true });

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto("file://" + path.join(here, "video.html") + "?v=" + name);
await page.evaluate(() => window.ready);
const clip = { x: 0, y: 0, width: 1080, height: 1920 };

if (args.stills) {
  for (const t of args.stills.split(",").map(Number)) {
    await page.evaluate((tt) => window.renderAt(tt), t);
    await page.screenshot({ path: path.join(OUT, `${name}-${t.toFixed(2)}.png`), clip });
  }
  await browser.close();
  process.exit(0);
}

const dur = await page.evaluate(() => window.duration);
const cues = await page.evaluate(() => window.cues);
const silent = path.join(OUT, `.${name}-silent.mp4`);
const total = Math.round(dur * FPS);
const ff = spawn(FFMPEG, ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-vf", "format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", silent], { stdio: ["pipe", "inherit", "inherit"] });
for (let i = 0; i < total; i++) {
  await page.evaluate((tt) => window.renderAt(tt), i / FPS);
  const buf = await page.screenshot({ type: "jpeg", quality: 93, clip });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % (FPS * 3) === 0) console.log(`${name} frame ${i}/${total}`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();

const final = path.join(OUT, `video-${name}.mp4`);
const mix = spawnSync("python3", [path.join(here, "mix.py"), silent, final, String(dur), JSON.stringify(cues)], { stdio: "inherit", env: { ...process.env, FFMPEG } });
if (mix.status !== 0) process.exit(mix.status);
fs.unlinkSync(silent);
console.log("done", final);
