"""Bad Tienda de Hoy · long YouTube video: "TOP 10 lotes con más ahorro" (1920x1080, voz-3, original music, chapters,
custom thumbnail). Brand 8343092, YouTube only.

    python3 brand/badtiendadehoy/auto/long.py build P    P = publish date (Central). Fetch the live shop, script, voice, render, mix, thumbnail
    python3 brand/badtiendadehoy/auto/long.py check P    QA stills sheet + automatic checks (re-run after a fix)
    python3 brand/badtiendadehoy/auto/long.py ship P     needs long/P/review.json PASS: host files, write posts.json (4:00 PM Central)
    python3 brand/badtiendadehoy/auto/long.py done P     record it in ledger.json
"""
import datetime, difflib, json, os, re, subprocess, sys, tempfile, urllib.request, zoneinfo

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.dirname(HERE)
ENGINE = os.path.join(BRAND, "engine")
MODELS = os.path.join(BRAND, "voice", "models")
BLOG = "8343092"
TZ = zoneinfo.ZoneInfo("America/Chicago")
SR = 48000
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.join(BRAND, "..", "_shared", "video"))


def sh(*cmd):
    print("+", " ".join(str(c) for c in cmd)[:200], flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def ldir(P):
    return os.path.join(BRAND, "long", P)


def fetch(api):
    os.makedirs(api, exist_ok=True)
    for lang, name in (("es-419", "shop_es.json"), ("en", "shop_en.json")):
        for attempt in range(4):
            try:
                req = urllib.request.Request(f"https://fortnite-api.com/v2/shop?language={lang}", headers={"User-Agent": "badtiendadehoy"})
                with urllib.request.urlopen(req, timeout=60) as r:
                    open(os.path.join(api, name), "wb").write(r.read())
                break
            except OSError as e:
                if attempt == 3: raise SystemExit(f"STOP: shop fetch failed: {e}")


def mix(d):
    """Original music bed (quieter than the shorts) + effects + voice, -14 LUFS."""
    import music
    tl = json.load(open(os.path.join(d, "timeline.json")))
    total = tl["total"]
    cues = [[0.02, "impact"]]
    for s in tl["scenes"][1:]:
        cues.append([s["start"], "whoosh"])
        if s["id"].startswith("b"):
            v, L = s["voice_at"], s["voice_len"]
            cues += [[v + 0.42 * L, "impact"], [v + 0.45 * L, "coin"], [v + 0.6 * L, "pop"]]
    out = tl["scenes"][-1]
    k = out["voice_at"] + 0.55 * out["voice_len"]
    cues += [[k + 0.8, "key"], [k + 0.98, "key"], [k + 1.16, "key"], [k + 2.6, "click"], [k + 3.4, "success"]]
    sections = [[0, "intro"]] + [[s["start"], "main" if s["id"].startswith("b") else ("break" if s["id"] == "top" else "end")]
                                 for s in tl["scenes"][1:]]
    spec = dict(style="bounce", bpm=108, seed=int(os.path.basename(d).replace("-", "")) + 7, hook="impact", sections=sections)
    tmp = tempfile.mkdtemp()
    bed = music.render(spec, cues, total, os.path.join(tmp, "music.wav"))
    mixed = os.path.join(tmp, "mixed.wav")
    fc = (f"[0]aresample={SR},volume=0.42[m];"
          f"[1]aresample={SR},highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
          f"equalizer=f=3000:t=q:w=1.2:g=2.5,volume=1.35,asplit=2[vo][key];"
          f"[m][key]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=350[duck];"
          f"[duck][vo]amix=inputs=2:normalize=0:duration=first,atrim=0:{total}[a]")
    sh("ffmpeg", "-y", "-loglevel", "error", "-i", bed, "-i", os.path.join(d, "vo", "voice.wav"), "-filter_complex", fc, "-map", "[a]", "-ac", "2", mixed)
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", mixed, "-af", "loudnorm=I=-14:TP=-2.6:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(re.findall(r"\{[^{}]+\}", p.stderr)[-1])
    ln = (f"loudnorm=I=-14:TP=-2.6:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    sh("ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(d, "silent.mp4"), "-i", mixed, "-filter_complex",
       f"[1]{ln},alimiter=limit=0.7:level=false,aresample={SR}[a]", "-map", "0:v", "-map", "[a]", "-c:v", "copy",
       "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", os.path.join(d, "video.mp4"))


def build(P):
    d = ldir(P); os.makedirs(d, exist_ok=True)
    fetch(os.path.join(d, "api"))
    sh("python3", "-I", os.path.join(ENGINE, "long_prep.py"), os.path.join(d, "api"), d, P)
    sh("python3", os.path.join(ENGINE, "long_voice.py"), os.path.join(MODELS, "Base"), d)
    sh("node", os.path.join(ENGINE, "long_render.js"), d, "video", os.path.join(d, "silent.mp4"))
    mix(d)
    sh("node", os.path.join(ENGINE, "long_render.js"), d, "thumb", os.path.join(d, "thumb.jpg"))
    check(P)


def check(P):
    d = ldir(P)
    tl = json.load(open(os.path.join(d, "timeline.json")))
    times = []
    for s in tl["scenes"]:
        times.append(s["start"] + min(s["dur"] - 0.4, max(1.0, s["dur"] * 0.9)))
    sh("node", os.path.join(ENGINE, "long_render.js"), d, "stills", ",".join(f"{t:.1f}" for t in times))
    qa = os.path.join(d, "qa")
    stills = [os.path.join(qa, f"still_{t:.1f}.jpg") for t in times] + [os.path.join(d, "thumb.jpg")]
    from PIL import Image
    W, cols = 480, 4
    rows = (len(stills) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * W, rows * 270), (20, 20, 24))
    for i, f in enumerate(stills):
        sheet.paste(Image.open(f).convert("RGB").resize((W, 270)), ((i % cols) * W, (i // cols) * 270))
    sheet.save(os.path.join(qa, "review-sheet.jpg"), quality=85)
    # automatic checks
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(d, "video.mp4"), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", p)[-1])
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(d, "video.mp4")],
                               capture_output=True, text=True).stdout)
    from faster_whisper import WhisperModel
    import librosa
    wav = os.path.join(qa, "audio16k.wav")
    sh("ffmpeg", "-v", "error", "-y", "-i", os.path.join(d, "video.mp4"), "-vn", "-ac", "1", "-ar", "16000", wav)
    m = WhisperModel(os.path.join(MODELS, "whisper-small"), device="cpu", compute_type="int8")
    data = json.load(open(os.path.join(d, "long.json")))
    norm = lambda s: re.sub(r"[^a-záéíóúñü0-9 ]", " ", s.lower())
    speech = []
    for ln, s in zip(data["lines"], tl["scenes"]):
        y, _ = librosa.load(wav, sr=16000, offset=s["voice_at"], duration=s["voice_len"] + 0.3)
        heard = " ".join(x.text for x in m.transcribe(y, language="es", beam_size=5)[0]).strip()
        r = difflib.SequenceMatcher(None, norm(ln["text"]).split(), norm(heard).split()).ratio()
        speech.append(dict(scene=s["id"], match=round(r, 2), heard=heard))
    checks = dict(loudness_ok=-15.5 <= lufs <= -12.5, lufs=lufs, duration=round(dur, 1), duration_ok=abs(dur - tl["total"]) < 1.0 and dur >= 180,
                  speech_ok=all(x["match"] >= 0.45 for x in speech), chapters_ok=all(s["dur"] >= 10 for s in tl["scenes"]),
                  thumb_ok=os.path.getsize(os.path.join(d, "thumb.jpg")) < 2_000_000, size_mb=round(os.path.getsize(os.path.join(d, "video.mp4")) / 1e6, 1))
    json.dump(dict(P=P, checks=checks, speech=speech), open(os.path.join(qa, "checks.json"), "w"), ensure_ascii=False, indent=1)
    print("BUNDLES:")
    for b in data["bundles"]:
        print(f"  {b['name']} · {b['regular']} -> {b['price']} · ahorra {b['save']} ({b['pct']}%) · hasta {b['out']}")
    print("SPEECH:")
    for x in speech:
        print(f"  {x['scene']:6} {x['match']:.2f}  {x['heard'][:150]}")
    print("CHECKS", json.dumps(checks))
    print("REVIEW SHEET:", os.path.join(qa, "review-sheet.jpg"))
    print("THUMBNAIL:", os.path.join(d, "thumb.jpg"))
    ok = all(v for k, v in checks.items() if k.endswith("_ok"))
    print("AUTO CHECKS", "PASS" if ok else "FAIL")


def chapters(d):
    tl = json.load(open(os.path.join(d, "timeline.json")))
    data = json.load(open(os.path.join(d, "long.json")))
    names = {"intro": "Intro", "top": "Top 3: mayor porcentaje de ahorro", "outro": "¿Cuál vas a comprar? + código BAD"}
    for i, b in enumerate(data["bundles"]):
        names[f"b{i}"] = f"{b['name']} (ahorra {b['save']:,})"
    fmt = lambda t: f"{int(t // 60):02d}:{int(t % 60):02d}"
    return "\n".join(f"{fmt(s['start'])} {names.get(s['id'], s['id'])}" for s in tl["scenes"])


def ship(P):
    d = ldir(P)
    rv = json.load(open(os.path.join(d, "review.json")))
    if rv.get("status") != "PASS":
        print("STOP: review is", rv.get("status"), rv.get("notes")); return
    when = datetime.datetime.combine(datetime.date.fromisoformat(P), datetime.time(16, 0), TZ)
    if when < datetime.datetime.now(TZ) + datetime.timedelta(minutes=20):
        print("STOP: 4:00 PM Central on", P, "has passed"); return
    sys.path.insert(0, HERE)
    import ghmedia
    urls = ghmedia.publish({f"long-{P}.mp4": os.path.join(d, "video.mp4"), f"long-{P}-thumb.jpg": os.path.join(d, "thumb.jpg")})
    data = json.load(open(os.path.join(d, "long.json")))
    n, top = len(data["bundles"]), data["bundles"][0]
    title = f"TOP {n} lotes con MÁS AHORRO de la tienda de Fortnite 🛒 ({data['publish_es']})"[:100]
    match = f"Los {n} lotes con más ahorro de la tienda de Fortnite"
    text = "\n".join([
        f"{match} ({data['publish_es']}): qué traen, cuánto te ahorras y hasta cuándo están 🛒",
        f"🔥 El mayor ahorro: {top['name']}, de {top['regular']:,} a {top['price']:,} monedas V.",
        "", "Capítulos:", chapters(d), "",
        "¿Cuál vas a comprar? Déjamelo en los comentarios 👇",
        "💚 Si compras algo, usa el código BAD en la tienda de Fortnite. No te cuesta nada extra y apoyas al canal. #EpicPartner",
        "", "Canal de fans: no es oficial ni está respaldado por Epic Games. Fortnite es una marca de Epic Games, Inc.",
        "#fortnite #tiendadefortnite #lotesfortnite"])
    info = dict(autoPublish=True, draft=False, descendants=[], firstCommentText="", hasNotReadNotes=False, media=[urls[f"long-{P}.mp4"]],
                mediaAltText=[], shortener=False, smartLinkData={"ids": []}, text=text, providers=[{"network": "youtube"}],
                publicationDate={"dateTime": when.strftime("%Y-%m-%dT%H:%M:%S"), "timezone": "America/Chicago"},
                videoThumbnailUrl=urls[f"long-{P}-thumb.jpg"],
                youtubeData=dict(title=title, type="video", privacy="public", category="GAMING", madeForKids=False, isAiGeneratedContent=False,
                                 tags=["fortnite", "tienda de fortnite", "lotes fortnite", "fortnite mexico", "skins fortnite", "codigo BAD"]))
    json.dump(dict(P=P, at=when.isoformat(timespec="seconds"), title=title, match=match,
                   calls=[dict(network="youtube", blogId=BLOG, date=when.isoformat(timespec="seconds"), match=match, info=info)]),
              open(os.path.join(d, "posts.json"), "w"), ensure_ascii=False, indent=1)
    print(f"SHIP long {P}: YouTube at {when.isoformat(timespec='minutes')} · {title}")


def done(P):
    d = ldir(P)
    p = json.load(open(os.path.join(d, "posts.json")))
    led_path = os.path.join(HERE, "ledger.json")
    led = json.load(open(led_path)) if os.path.exists(led_path) else []
    led = [r for r in led if not (r.get("kind") == "long" and r.get("P") == P)]
    data = json.load(open(os.path.join(d, "long.json")))
    led.append(dict(kind="long", P=P, at=p["at"], title=p["title"], match=p["match"], bundles=[b["name"] for b in data["bundles"]],
                    minutes=round(json.load(open(os.path.join(d, "timeline.json")))["total"] / 60, 1)))
    json.dump(led, open(led_path, "w"), ensure_ascii=False, indent=1)
    print("ledger updated: long", P)


if __name__ == "__main__":
    cmd, P = sys.argv[1], sys.argv[2]
    {"build": build, "check": check, "ship": ship, "done": done}[cmd](P)
