"""Bad Tienda de Hoy · daily shop video (Spanish, voz-3 host, original music), brand 8343092.

    python3 brand/badtiendadehoy/auto/shop.py build D    fetch shop D, pick, render, voice, mix, cover, QA sheet + checks
    python3 brand/badtiendadehoy/auto/shop.py check D    re-run only the QA sheet and checks (after a fix)
    python3 brand/badtiendadehoy/auto/shop.py ship D     needs shop/D/review.json PASS: upload to R2, write posts.json
    python3 brand/badtiendadehoy/auto/shop.py fallback D   when the full video fails: a 14 s short from the day's cover (never skip a day)
    python3 brand/badtiendadehoy/auto/shop.py done D     record the run in ledger.json (call after the posts are verified)

D is the shop day (UTC date; the shop resets at 00:00 UTC = 6:00 PM Central). Heavy files stay out of git;
ship hosts the video and cover on the media branch (auto/ghmedia.py) for Metricool to import.
"""
import datetime, json, os, re, subprocess, sys, time, urllib.request, zoneinfo

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(BRAND))
ENGINE = os.path.join(BRAND, "engine")
MODELS = os.path.join(BRAND, "voice", "models")
BLOG = "8343092"
TZ = zoneinfo.ZoneInfo("America/Chicago")
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
sys.path.insert(0, ENGINE)


def sh(*cmd, **kw):
    print("+", " ".join(str(c) for c in cmd)[:200], flush=True)
    return subprocess.run([str(c) for c in cmd], check=True, **kw)


def fecha_larga(d):
    return f"{d.day} de {MESES[d.month - 1]}"


def experiment(D):
    """This week's controlled test (auto/experiments.json). Returns the variant for shop day D."""
    ex = json.load(open(os.path.join(HERE, "experiments.json")))
    for e in ex["schedule"]:
        if e["from"] <= D <= e["to"]:
            start = datetime.date.fromisoformat(e["from"])
            k = (datetime.date.fromisoformat(D) - start).days % len(e["variants"])
            v = dict(ex["defaults"]); v.update(e["variants"][k]); v["experiment"] = e["id"]; v["variant"] = e["variants"][k]["name"]
            return v
    v = dict(ex["defaults"]); v["experiment"] = None; v["variant"] = "default"
    return v


def post_time(D, slot):
    """'evening' = 40 min after the reset (6:40 PM CST); 'late' = 2 h 15 min after (8:15 PM CST); 'midday' = 11:30 AM on D."""
    d = datetime.date.fromisoformat(D)
    reset = datetime.datetime.combine(d, datetime.time(0, 0), datetime.timezone.utc)   # 6 PM CST / 7 PM CDT
    if slot == "evening":
        t = (reset + datetime.timedelta(minutes=40)).astimezone(TZ)
    elif slot == "late":
        t = (reset + datetime.timedelta(hours=2, minutes=15)).astimezone(TZ)
    else:
        t = datetime.datetime.combine(d, datetime.time(11, 30), TZ)
    soonest = datetime.datetime.now(TZ) + datetime.timedelta(minutes=20)
    if t < soonest:
        t = soonest.replace(second=0, microsecond=0)
    close = datetime.datetime.combine(d, datetime.time(17, 15), TZ)   # never post a shop that is about to reset
    return t, t <= close


# ------------------------------------------------------------------ build
def fetch(D, api):
    os.makedirs(api, exist_ok=True)
    for attempt in range(26):
        ok = True
        for lang, name in (("es-419", "shop_es.json"), ("en", "shop_en.json")):
            req = urllib.request.Request(f"https://fortnite-api.com/v2/shop?language={lang}", headers={"User-Agent": "badtiendadehoy"})
            try:
                with urllib.request.urlopen(req, timeout=60) as r:
                    data = r.read()
                j = json.loads(data)
                if not j.get("data", {}).get("date", "").startswith(D):
                    ok = False
                open(os.path.join(api, name), "wb").write(data)
            except Exception as e:
                print("fetch failed:", e, flush=True); ok = False
        if ok:
            return
        print(f"shop not on {D} yet; waiting 60 s ({attempt+1}/25)", flush=True)
        time.sleep(60)
    raise SystemExit(f"STOP: the live shop never turned over to {D}")


def qa_sheet(shop):
    """Stills at the moments that matter, side by side, for the reviewer to Read."""
    qa = os.path.join(shop, "qa"); os.makedirs(qa, exist_ok=True)
    times = [0.6, 3.5, 7.2, 10.5, 14.5, 19.5, 24.5, 29.5, 34.0, 38.5, 43.5, 48.0, 53.5, 58.8, 61.5]
    files = []
    for t in times:
        f = os.path.join(qa, f"t{t:05.1f}.jpg")
        sh("ffmpeg", "-v", "error", "-y", "-ss", t, "-i", os.path.join(shop, "video.mp4"), "-frames:v", "1", "-vf", "scale=270:-1", f)
        files.append(f)
    args = []
    for f in files: args += ["-i", f]
    row = lambda a, b: "".join(f"[{i}]" for i in range(a, b)) + f"hstack={b-a}"
    fc = f"{row(0,8)}[r1];[{8}][{9}][{10}][{11}][{12}][{13}][{14}]hstack=7,pad=270*8:ih[r2];[r1][r2]vstack=2"
    sh("ffmpeg", "-v", "error", "-y", *args, "-filter_complex", fc, os.path.join(qa, "review-sheet.png"))


def speech_check(shop):
    """Whisper must hear each line's words in the final mix (catches mumbles, wrong language, music burying the voice)."""
    import difflib
    from timeline import STARTS, END
    lines = json.load(open(os.path.join(shop, "vo", "lines.json")))["lines"]
    from faster_whisper import WhisperModel
    import librosa
    m = WhisperModel(os.path.join(MODELS, "whisper-small"), device="cpu", compute_type="int8")
    wav = os.path.join(shop, "qa", "audio16k.wav")
    sh("ffmpeg", "-v", "error", "-y", "-i", os.path.join(shop, "video.mp4"), "-vn", "-ac", "1", "-ar", "16000", wav)
    norm = lambda s: re.sub(r"[^a-záéíóúñü0-9 ]", " ", s.lower())
    out = []
    for ln in lines:
        i = ln["i"]; a = STARTS[i]; b = STARTS[i + 1] if i + 1 < len(STARTS) else END
        y, _ = librosa.load(wav, sr=16000, offset=a, duration=b - a)
        heard = " ".join(s.text for s in m.transcribe(y, language="es", beam_size=5)[0])
        r = difflib.SequenceMatcher(None, norm(ln["text"]).split(), norm(heard).split()).ratio()
        out.append(dict(i=i, said=ln["text"], heard=heard.strip(), match=round(r, 2)))
    return out


def build(D):
    shop = os.path.join(BRAND, "shop", D); os.makedirs(shop, exist_ok=True)
    v = experiment(D)
    fetch(D, os.path.join(shop, "api"))
    sh("python3", "-I", os.path.join(ENGINE, "prep.py"), os.path.join(shop, "api"), shop)
    sh("python3", "-I", os.path.join(ENGINE, "bg.py"), shop)
    sh("node", os.path.join(ENGINE, "render.js"), shop, os.path.join(shop, "silent.mp4"), "-")
    sh("python3", os.path.join(ENGINE, "voice.py"), os.path.join(MODELS, "Base"), shop, "--hook", v["hook"])
    spec = dict(v["music"]); spec["seed"] = int(D.replace("-", "")); spec["sections"] = __import__("timeline").SECTIONS
    sh("python3", os.path.join(ENGINE, "mix_av.py"), os.path.join(shop, "silent.mp4"), os.path.join(shop, "vo", "voice.wav"),
       os.path.join(shop, "video.mp4"), json.dumps(spec))
    sh("node", os.path.join(ENGINE, "cover.js"), shop, os.path.join(shop, "cover.jpg"))   # designed thumbnail
    check(D)


def check(D):
    shop = os.path.join(BRAND, "shop", D)
    v = experiment(D)
    qa_sheet(shop)
    # automatic checks
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(shop, "video.mp4"), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", p)[-1])
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                os.path.join(shop, "video.mp4")], capture_output=True, text=True).stdout)
    vo = json.load(open(os.path.join(shop, "vo", "lines.json")))
    speech = speech_check(shop)
    checks = dict(
        loudness_ok=-15.5 <= lufs <= -12.5, lufs=lufs, duration_ok=abs(dur - 62.17) < 0.5, duration=dur,
        voice_fits=all(l["status"] == "OK" for l in vo["lines"]),
        speech_ok=all(s["match"] >= 0.5 for s in speech), weakest_line=min(speech, key=lambda s: s["match"]),
        size_mb=round(os.path.getsize(os.path.join(shop, "video.mp4")) / 1e6, 1))
    json.dump(dict(D=D, variant=v, checks=checks, speech=speech), open(os.path.join(shop, "qa", "checks.json"), "w"),
              ensure_ascii=False, indent=1)
    ep = json.load(open(os.path.join(shop, "episode.json")))
    print("CARDS:")
    for s in ep["segments"]:
        print(f"  {s['kind']:6} {s['name']} · {s['price']} · {[c['text'] for c in s['captions']]}")
    print("LINES:")
    for s in speech:
        print(f"  {s['i']:2} {s['match']:.2f} said: {s['said']}\n          heard: {s['heard']}")
    print("CHECKS", json.dumps({k: v for k, v in checks.items() if k != "weakest_line"}))
    print("REVIEW SHEET:", os.path.join(shop, "qa", "review-sheet.png"))
    print("COVER:", os.path.join(shop, "cover.jpg"))
    auto_ok = checks["loudness_ok"] and checks["duration_ok"] and checks["voice_fits"] and checks["speech_ok"]
    print("AUTO CHECKS", "PASS" if auto_ok else "FAIL")


# ------------------------------------------------------------------ ship
HASHTAGS = {"tiktok": "#fortnite #tiendafortnite #fortnitemexico #fortnitelatam",
            "instagram": "#fortnite #tiendadefortnite #fortnitemexico #fortnitelatam #skinsfortnite",
            "facebook": "#fortnite #tiendadefortnite",
            "threads": "#fortnite"}


def captions(ep, D):
    d = datetime.date.fromisoformat(D)
    head = f"#EpicPartner La tienda de Fortnite de hoy, {fecha_larga(d)} 🛒"
    segs = ep["segments"]
    b = segs[0] if segs[0]["kind"] == "bundle" else None
    leaving = [s["name"] for s in segs[1:] if (s.get("badge") or {}).get("emoji") == "⏰"]
    new = [s["name"] for s in segs[1:] if any("nuevo" in c["text"] for c in s["captions"])]
    og = [s["name"] for s in segs[1:] if any("og ·" in c["text"] for c in s["captions"])]
    facts = []
    if b: facts.append(f"🔥 Lote de {b['name']}: de {b['regular']:,} a {b['price']:,} monedas V")
    if new: facts.append("🆕 Nuevo hoy: " + ", ".join(new[:3]))
    if leaving: facts.append("⏰ Se va hoy: " + ", ".join(leaving[:3]))
    elif og: facts.append("🕹️ OG de regreso: " + ", ".join(og[:2]))
    q = "¿Qué vas a comprar? 👇"
    code = "Usa el código BAD en la tienda 💚"
    long = "\n".join([head, *facts[:3], q, code])
    return dict(
        tiktok=f"{long}\n{HASHTAGS['tiktok']}",
        instagram=f"{long}\n.\n{HASHTAGS['instagram']}",
        facebook="\n".join([head, *facts[:2], q, code, HASHTAGS["facebook"]]),
        youtube_title=f"La tienda de Fortnite de hoy 🛒 {fecha_larga(d)} | código BAD #shorts"[:100],
        youtube="\n".join([head, *facts[:3], q, code, "#fortnite #tiendadefortnite #shorts"]),
        threads="\n".join([head, (facts[0] if facts else ""), "¿Ustedes qué van a comprar? Los leo 👇", code]),
        match=head)


def ship(D):
    shop = os.path.join(BRAND, "shop", D)
    rv = json.load(open(os.path.join(shop, "review.json")))
    if rv.get("status") != "PASS":
        print("STOP: review is", rv.get("status"), rv.get("notes")); return
    v = experiment(D)
    when, ok = post_time(D, v["slot"])
    if not ok:
        print("STOP: too close to the next reset to post shop", D); return
    sys.path.insert(0, HERE)
    import ghmedia
    urls = ghmedia.publish({f"shop-{D}.mp4": os.path.join(shop, "video.mp4"), f"shop-{D}-cover.jpg": os.path.join(shop, "cover.jpg")})
    vurl, curl = urls[f"shop-{D}.mp4"], urls[f"shop-{D}-cover.jpg"]
    ep = json.load(open(os.path.join(shop, "episode.json")))
    cap = captions(ep, D)
    date = when.isoformat(timespec="seconds")
    base = lambda text, prov: dict(autoPublish=True, draft=False, descendants=[], firstCommentText="", hasNotReadNotes=False,
                                   media=[vurl], mediaAltText=[], shortener=False, smartLinkData={"ids": []}, text=text,
                                   providers=[{"network": prov}],
                                   publicationDate={"dateTime": when.strftime("%Y-%m-%dT%H:%M:%S"), "timezone": "America/Chicago"})
    calls = []
    def add(net, info, thumb=True):
        if thumb: info["videoThumbnailUrl"] = curl
        calls.append(dict(network=net, blogId=BLOG, date=date, match=cap["match"], info=info))
    i = base(cap["tiktok"], "tiktok")
    i["tiktokData"] = dict(disableComment=False, disableDuet=False, disableStitch=False, privacyOption="PUBLIC_TO_EVERYONE",
                           commercialContentThirdParty=True, commercialContentOwnBrand=False, title=cap["tiktok"], autoAddMusic=False, isAigc=True)
    # Metricool requires the TikTok title; it is the caption TikTok shows, so it carries the full TikTok caption
    add("tiktok", i)
    i = base(cap["instagram"], "instagram")
    i["instagramData"] = dict(type="REEL", showReelOnFeed=True, isAiGenerated=True, collaborators=[], carouselTags={})
    add("instagram", i)
    i = base(cap["facebook"], "facebook")
    i["facebookData"] = dict(type="REEL", title="")
    add("facebook", i)
    i = base(cap["youtube"], "youtube")
    i["youtubeData"] = dict(title=cap["youtube_title"], type="short", privacy="public", tags=["fortnite", "tienda de fortnite", "fortnite mexico", "codigo BAD"],
                            category="GAMING", madeForKids=False, isAiGeneratedContent=False)
    add("youtube", i)
    i = base(cap["threads"], "threads")
    i["threadsData"] = {}
    add("threads", i, thumb=False)
    json.dump(dict(D=D, at=date, variant=v, video=vurl, cover=curl, calls=calls),
              open(os.path.join(shop, "posts.json"), "w"), ensure_ascii=False, indent=1)
    print(f"SHIP {D}: {len(calls)} posts at {date} ({v['experiment']} · {v['variant']}); posts.json written")


def fallback(D):
    """A day is never skipped (owner, 2026-11-24: post short-form every day). When the full video can't be made or fails
    its review, this makes a 14-second short from the day's designed cover (real shop data only) with original music,
    and the normal ship step posts it with the normal captions."""
    shop = os.path.join(BRAND, "shop", D); os.makedirs(os.path.join(shop, "qa"), exist_ok=True)
    api = os.path.join(shop, "api")
    if not os.path.exists(os.path.join(api, "shop_es.json")):
        fetch(D, api)
    if not os.path.exists(os.path.join(shop, "episode.json")):
        sh("python3", "-I", os.path.join(ENGINE, "prep.py"), api, shop)
    if not os.path.exists(os.path.join(shop, "bg", "intro.jpg")):
        sh("python3", "-I", os.path.join(ENGINE, "bg.py"), shop)
    sh("node", os.path.join(ENGINE, "cover.js"), shop, os.path.join(shop, "cover.jpg"))
    dur = 14
    silent = os.path.join(shop, "fallback_silent.mp4")
    sh("ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", os.path.join(shop, "cover.jpg"), "-vf",
       f"scale=1080:1920,zoompan=z='min(1+0.0009*on,1.12)':d={dur*30}:s=1080x1920:fps=30,format=yuv420p",
       "-t", str(dur), "-c:v", "libx264", "-preset", "medium", "-crf", "20", silent)
    sys.path.insert(0, os.path.join(BRAND, "..", "_shared", "video"))
    import music, tempfile
    tmp = tempfile.mkdtemp()
    spec = dict(experiment(D)["music"]); spec["seed"] = int(D.replace("-", "")); spec["sections"] = [[0, "intro"], [1.5, "main"], [12, "end"]]
    bed = music.render(spec, [[0.02, "impact"], [1.5, "whoosh"], [6.0, "pop"], [10.0, "sparkle"]], dur, os.path.join(tmp, "m.wav"))
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", bed, "-af", "loudnorm=I=-14:TP=-2.6:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(re.findall(r"\{[^{}]+\}", p.stderr)[-1])
    ln = (f"loudnorm=I=-14:TP=-2.6:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    sh("ffmpeg", "-v", "error", "-y", "-i", silent, "-i", bed, "-filter_complex", f"[1]{ln},alimiter=limit=0.7:level=false[a]",
       "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart",
       os.path.join(shop, "video.mp4"))
    json.dump(dict(D=D, fallback=True), open(os.path.join(shop, "qa", "checks.json"), "w"))
    print("FALLBACK READY: read", os.path.join(shop, "cover.jpg"), "then write review.json PASS (notes: fallback + why) and ship")


def done(D):
    shop = os.path.join(BRAND, "shop", D)
    p = json.load(open(os.path.join(shop, "posts.json")))
    led_path = os.path.join(HERE, "ledger.json")
    led = json.load(open(led_path)) if os.path.exists(led_path) else []
    ep = json.load(open(os.path.join(shop, "episode.json")))
    led = [r for r in led if not (r.get("kind") == "shop" and r.get("D") == D)]
    led.append(dict(kind="shop", D=D, at=p["at"], match=p["calls"][0]["match"], experiment=p["variant"]["experiment"],
                    variant=p["variant"]["variant"], hook=p["variant"]["hook"], music=p["variant"]["music"]["style"],
                    items=[s["name"] for s in ep["segments"]], networks=[c["network"] for c in p["calls"]]))
    json.dump(led, open(led_path, "w"), ensure_ascii=False, indent=1)
    print("ledger updated:", D)


if __name__ == "__main__":
    cmd, D = sys.argv[1], sys.argv[2]
    {"build": build, "check": check, "ship": ship, "done": done, "fallback": fallback}[cmd](D)
