"""Add a Spanish voiceover to a rendered tienda video.

Usage:
  python3 voiceover.py <model_dir> <episode_dir> <video.mp4> <out.mp4> [lines.json]

- lines.json (optional): [{"text": ..., "emo": ...}, ...] one per segment
  (intro, bundle, 8 items, outro, code). Without it, lines are written
  automatically from episode.json.
- The voice is set by voice.json next to this script ({"name": ..., "description": ...}).
"""
import json, os, random, subprocess, sys, time
import numpy as np, soundfile as sf, torch

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL, EP, VIDEO, OUT = sys.argv[1:5]
LINES_FILE = sys.argv[5] if len(sys.argv) > 5 else None

# Segment windows (seconds) of the usecodebad timeline: intro, bundle, 8 items, outro grid, creator code
STARTS = [0.0, 4.767, 11.867, 16.667, 21.367, 26.2, 31.0, 35.733, 40.433, 45.167, 49.967, 56.967]
END = 62.167
LEAD = 0.12          # voice starts this long after the cut
MAX_SPEEDUP = 1.12   # lines may be sped up this much to fit

# ---------------------------------------------------------------- numbers & names
UNI = "cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte".split()
DEC = {30: "treinta", 40: "cuarenta", 50: "cincuenta", 60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa"}
CEN = {100: "cien", 200: "doscientos", 300: "trescientos", 400: "cuatrocientos", 500: "quinientos",
       600: "seiscientos", 700: "setecientos", 800: "ochocientos", 900: "novecientos"}

def words(n):
    if n <= 20: return UNI[n]
    if n < 30: return "veinti" + UNI[n - 20]
    if n < 100: return DEC[n // 10 * 10] + ("" if n % 10 == 0 else " y " + UNI[n % 10])
    if n < 1000:
        if n == 100: return "cien"
        c = n // 100 * 100
        return ("ciento" if c == 100 else CEN[c]) + ("" if n % 100 == 0 else " " + words(n % 100))
    m = n // 1000
    return ("mil" if m == 1 else words(m) + " mil") + ("" if n % 1000 == 0 else " " + words(n % 1000))

SAY = {"A$AP": "Asap", "PWR": "Power", "RX1": "R X uno", "-": " "}
def say(name):
    for a, b in SAY.items(): name = name.replace(a, b)
    return name

# ---------------------------------------------------------------- automatic script
def auto_lines(ep, seed):
    rnd = random.Random(seed)
    pick = lambda xs: rnd.choice(xs)
    lines = [dict(text=pick(["¡Qué onda, banda! Ya cambió la tienda… y hoy viene con todo.",
                              "¡Qué tal, banda! Ya está la tienda nueva… vamos a ver qué hay.",
                              "¡Qué onda! Nueva tienda… y hoy hay cosas que no te puedes perder."]),
                  emo="very excited greeting, big energy")]
    for s in ep["segments"]:
        n = say(s["name"])
        caps = " ".join(c["text"] for c in s["captions"])
        if s["kind"] == "bundle":
            k = caps.split(" objetos")[0].split()[-1] if " objetos" in caps else ""
            count = f" {words(int(k)).capitalize()} objetos." if k.isdigit() else ""
            t = (f"El lote de {n} costaba {words(s['regular'])}… ¡y hoy está en {words(s['price'])}!"
                 f"{count} Una locura.")
            lines.append(dict(text=t, emo="builds suspense, then shocked and hyped at the price drop"))
        elif "og ·" in caps:
            lines.append(dict(text=pick([f"¡{n}! Algo OG del capítulo uno… ¡a {words(s['price'])} nomás!",
                                         f"Ojo con {n}… es OG del capítulo uno, y se va hoy."]),
                              emo="excited, playful"))
        elif "llegó el" in caps and "se va" in caps:
            lines.append(dict(text=f"{n}: llegó ayer… y ya se va. Así de rápido.", emo="surprised, slight disappointed sigh"))
        elif "del capítulo" in caps:
            lines.append(dict(text=f"{n}, del capítulo {words(int(caps.split('capítulo ')[1].split(',')[0]))}… y se va hoy.",
                              emo="casual, then lowers voice like sharing a secret"))
        elif "se va" in caps:
            lines.append(dict(text=pick([f"{n}: se despide hoy… último chance.",
                                         f"{n}: se va hoy a las seis. ¡Apúrate!"]), emo="dramatic urgency"))
        elif "nuevo" in caps:
            lines.append(dict(text=pick([f"Nuevo en la tienda: {n}… por {words(s['price'])}.",
                                         f"Y acaba de llegar {n}… {words(s['price'])}."]), emo="curious and impressed"))
        elif "llegó el" in caps:
            lines.append(dict(text=f"Desde ayer en la tienda: {n}… {words(s['price'])}.", emo="relaxed, informative"))
        else:
            lines.append(dict(text=f"{n}, {words(s['price'])}.", emo="relaxed, informative"))
    lines.append(dict(text="¿Y tú qué vas a comprar? Déjamelo en los comentarios… y si compras algo, usa el código BAD.",
                      emo="curious, friendly, engaging the audience, warm at the end"))
    lines.append(dict(text="Pones be, a, de… le das aceptar… ¡y listo! ¡Nos vemos mañana!",
                      emo="step by step, then cheerful sign-off"))
    return lines

# ---------------------------------------------------------------- main
ep = json.load(open(os.path.join(EP, "episode.json")))
lines = json.load(open(LINES_FILE)) if LINES_FILE else auto_lines(ep, ep["date"])
assert len(lines) == len(STARTS), f"need {len(STARTS)} lines, got {len(lines)}"
voice = json.load(open(os.path.join(HERE, "voice.json")))

from qwen_tts import Qwen3TTSModel
torch.set_num_threads(os.cpu_count())
model = Qwen3TTSModel.from_pretrained(MODEL, device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")
clone = voice.get("mode") == "clone"   # clone mode: MODEL must be the Base model; keeps the voice identical on every line
if clone:
    prompt = model.create_voice_clone_prompt(ref_audio=os.path.join(HERE, voice["ref_audio"]), ref_text=voice["ref_text"])

work = os.path.join(EP, "vo"); os.makedirs(work, exist_ok=True)
sr_out, placed = 44100, []
for i, ln in enumerate(lines):
    budget = (STARTS[i + 1] if i + 1 < len(STARTS) else END) - STARTS[i] - LEAD - 0.15
    best = None
    for attempt in range(3):  # keep the take that fits best
        torch.manual_seed(voice.get("seed", 7) + attempt)
        t = time.time()
        if clone:
            wavs, sr = model.generate_voice_clone(text=ln["text"], language="Spanish", voice_clone_prompt=prompt)
        else:
            wavs, sr = model.generate_voice_design(text=ln["text"], language="Spanish",
                                                   instruct=f"{voice['description']} Emotion for this line: {ln['emo']}.")
        w = wavs[0]
        # trim leading/trailing silence
        idx = np.where(np.abs(w) > 0.01)[0]
        if len(idx): w = w[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
        dur = len(w) / sr
        print(f"line {i}: {dur:.2f}s (budget {budget:.2f}s) in {time.time()-t:.0f}s", flush=True)
        if best is None or abs(dur - budget * 0.9) < abs(best[1] - budget * 0.9) and dur <= budget * MAX_SPEEDUP:
            best = (w, dur)
        if dur <= budget: break
    w, dur = best
    raw = os.path.join(work, f"{i:02d}_raw.wav"); sf.write(raw, w, sr)
    fitted = os.path.join(work, f"{i:02d}.wav")
    speed = max(1.0, dur / budget)
    if speed > MAX_SPEEDUP: print(f"  WARNING line {i} is {dur:.2f}s for a {budget:.2f}s slot; rewrite it shorter", flush=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                    f"atempo={min(speed, MAX_SPEEDUP):.3f},aresample={sr_out}", "-ac", "2", fitted], check=True)
    placed.append((fitted, STARTS[i] + LEAD))

# voice track: each line delayed to its slot; light compression + presence boost
inputs, chains = [], []
for k, (f, at) in enumerate(placed):
    inputs += ["-i", f]
    chains.append(f"[{k+1}:a]adelay={int(at*1000)}|{int(at*1000)}[v{k}]")
n = len(placed)
fc = ";".join(chains) + ";" + "".join(f"[v{k}]" for k in range(n)) + \
     f"amix=inputs={n}:normalize=0,acompressor=threshold=-18dB:ratio=3:attack=5:release=120," \
     "equalizer=f=3000:t=q:w=1:g=2,volume=1.6[voice];" \
     "[voice]asplit=2[vmix][vkey];" \
     "[0:a]volume=0.9[music];[music][vkey]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350:makeup=1[duck];" \
     "[duck][vmix]amix=inputs=2:normalize=0,alimiter=limit=0.95[aout]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", VIDEO, *inputs, "-filter_complex", fc,
                "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", OUT], check=True)
json.dump(lines, open(os.path.join(EP, "vo", "lines.json"), "w"), ensure_ascii=False, indent=1)
print("done", OUT)
