"""Voice track for a Bad Tienda de Hoy shop video: the locked voz-3 host (Qwen3-TTS, cloned from voice/voz-3-mujer-hype.wav).

    python3 voice.py <model_dir> <shop_dir> [--hook greet|stat] [--lines lines.json]

Writes <shop_dir>/vo/voice.wav (the whole video's length, every line placed at its segment) and <shop_dir>/vo/lines.json.
Lines are written from episode.json unless --lines gives them (one per segment: intro, bundle, 8 items, grid, code).
Each line must fit its segment so the cuts and the music stay in sync: a take that is too long is retried (3 takes),
then sped up by at most 12%; anything still too long is reported as TOO_LONG and the build fails its check.
"""
import argparse, json, os, random, subprocess, sys, time
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from timeline import STARTS, END  # noqa: E402

LEAD = 0.12          # the voice starts this long after the cut
TAIL = 0.15          # and stops this long before the next one
MAX_SPEEDUP = 1.12

# ------------------------------------------------------------------ Spanish numbers and names, said the right way
UNI = ("cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis "
       "diecisiete dieciocho diecinueve veinte").split()
DEC = {30: "treinta", 40: "cuarenta", 50: "cincuenta", 60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa"}
CEN = {200: "doscientos", 300: "trescientos", 400: "cuatrocientos", 500: "quinientos", 600: "seiscientos",
       700: "setecientos", 800: "ochocientos", 900: "novecientos"}


def words(n):
    n = int(n)
    if n <= 20: return UNI[n]
    if n < 30: return "veinti" + UNI[n - 20]
    if n < 100: return DEC[n // 10 * 10] + ("" if n % 10 == 0 else " y " + UNI[n % 10])
    if n < 1000:
        if n == 100: return "cien"
        c = n // 100 * 100
        return ("ciento" if c == 100 else CEN[c]) + ("" if n % 100 == 0 else " " + words(n % 100))
    m = n // 1000
    return ("mil" if m == 1 else words(m) + " mil") + ("" if n % 1000 == 0 else " " + words(n % 1000))


SAY = [("A$AP", "Asap"), ("PWR", "Power"), ("RX1", "R X uno"), (" OG", " ou yi"), ("OG ", "ou yi "), ("-", " ")]


def say(text):
    for a, b in SAY:
        text = text.replace(a, b)
    return text


# ------------------------------------------------------------------ the script, written from today's data
def auto_lines(ep, seed, hook="greet"):
    rnd = random.Random(seed)
    pick = rnd.choice
    segs = ep["segments"]
    bundle = segs[0]
    if hook == "stat" and bundle["kind"] == "bundle":
        first = f"¡Ojo! Hoy te puedes ahorrar {words(bundle['regular'] - bundle['price'])} monedas V… mira esto."
    else:
        first = pick(["¡Qué onda, banda! Ya cambió la tienda… y hoy viene con todo.",
                      "¡Qué onda, banda! Ya está la tienda nueva… vamos a ver qué hay.",
                      "¡Qué onda! Nueva tienda… y hoy hay cosas que no te puedes perder."])
    lines = [dict(text=first)]
    for s in segs:
        n = say(s["name"])
        caps = " ".join(c["text"] for c in s["captions"])
        p = words(s["price"])
        if s["kind"] == "bundle":
            lines.append(dict(text=f"El lote de {n}… ¡de {words(s['regular'])} a {p}! Una locura."))
        elif "og ·" in caps:
            lines.append(dict(text=pick([f"¡{n}! Es ou yi del capítulo uno… ¡a {p} nomás!",
                                         f"Ojo con {n}: es ou yi del capítulo uno… y se va hoy."])))
        elif "llegó el" in caps and "se va" in caps:
            lines.append(dict(text=f"{n}: llegó ayer… y ya se va hoy."))
        elif "del capítulo" in caps:
            ch = caps.split("capítulo ")[1].split(",")[0]
            lines.append(dict(text=f"{n}, del capítulo {words(ch) if ch.isdigit() else ch}… y se va hoy."))
        elif "se va" in caps:
            lines.append(dict(text=pick([f"{n}: se despide hoy… último chance.",
                                         f"{n}: se va hoy a las seis. ¡Apúrate!"])))
        elif "nuevo" in caps:
            lines.append(dict(text=pick([f"Nuevo en la tienda: {n}… por {p}.",
                                         f"Y acaba de llegar {n}… {p}."])))
        elif "llegó el" in caps:
            lines.append(dict(text=f"Desde ayer en la tienda: {n}… {p}."))
        else:
            lines.append(dict(text=f"{n}… {p}."))
    lines.append(dict(text="¿Y tú qué vas a comprar? Déjamelo en los comentarios… y si compras algo, usa el código BAD."))
    lines.append(dict(text="Pones be, a, de… aceptar… ¡y listo! ¡Nos vemos mañana!"))
    return lines


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("model"); ap.add_argument("shop")
    ap.add_argument("--hook", default="greet", choices=["greet", "stat"])
    ap.add_argument("--lines")
    a = ap.parse_args()
    ep = json.load(open(os.path.join(a.shop, "episode.json")))
    lines = json.load(open(a.lines)) if a.lines else auto_lines(ep, ep["date"], a.hook)
    assert len(lines) == len(STARTS), f"need {len(STARTS)} lines, got {len(lines)}"
    voice = json.load(open(os.path.join(BRAND, "voice", "voice.json")))

    import torch
    from qwen_tts import Qwen3TTSModel
    torch.set_num_threads(os.cpu_count())
    model = Qwen3TTSModel.from_pretrained(a.model, device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")
    prompt = model.create_voice_clone_prompt(ref_audio=os.path.join(BRAND, "voice", voice["ref_audio"]),
                                             ref_text=voice["ref_text"])
    work = os.path.join(a.shop, "vo"); os.makedirs(work, exist_ok=True)
    SR = 48000
    track = np.zeros(int((END + 0.5) * SR), dtype=np.float32)
    report = []
    for i, ln in enumerate(lines):
        start = STARTS[i]
        budget = (STARTS[i + 1] if i + 1 < len(STARTS) else END) - start - LEAD - TAIL
        best = None
        for attempt in range(3):
            torch.manual_seed(voice.get("seed", 7) + attempt)
            t = time.time()
            wavs, sr = model.generate_voice_clone(text=ln["text"], language="Spanish", voice_clone_prompt=prompt)
            w = wavs[0]
            idx = np.where(np.abs(w) > 0.01)[0]
            if len(idx): w = w[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
            dur = len(w) / sr
            print(f"line {i}: {dur:.2f}s (slot {budget:.2f}s) take {attempt+1} in {time.time()-t:.0f}s", flush=True)
            if best is None or (dur <= budget * MAX_SPEEDUP and (best[1] > budget * MAX_SPEEDUP or abs(dur - budget * .9) < abs(best[1] - budget * .9))):
                best = (w, dur, sr)
            if dur <= budget: break
        w, dur, sr = best
        raw = os.path.join(work, f"{i:02d}_raw.wav"); sf.write(raw, w, sr)
        fit = os.path.join(work, f"{i:02d}.wav")
        speed = max(1.0, dur / budget)
        status = "OK" if speed <= MAX_SPEEDUP else "TOO_LONG"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                        f"atempo={min(speed, MAX_SPEEDUP):.3f},aresample={SR}", "-ac", "1", fit], check=True)
        y, _ = sf.read(fit, dtype="float32")
        at = int((start + LEAD) * SR)
        y = y[: max(0, len(track) - at)]
        track[at: at + len(y)] += y
        report.append(dict(i=i, text=ln["text"], seconds=round(dur, 2), slot=round(budget, 2), speed=round(speed, 3), status=status))
    sf.write(os.path.join(work, "voice.wav"), track[: int(END * SR)], SR)
    json.dump(dict(hook=a.hook, voice=voice["name"], lines=report), open(os.path.join(work, "lines.json"), "w"),
              ensure_ascii=False, indent=1)
    bad = [r for r in report if r["status"] != "OK"]
    print("VOICE", "OK" if not bad else f"TOO_LONG lines {[r['i'] for r in bad]}")


if __name__ == "__main__":
    main()
