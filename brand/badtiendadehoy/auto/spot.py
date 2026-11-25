"""Bad Tienda de Hoy · "Lote del día": a ~30 s vertical bundle spotlight queued days ahead on all five networks (11:30 AM Central),
one Metricool post per day carrying all five networks (auto/onepost.py).

    python3 brand/badtiendadehoy/auto/spot.py plan FIRST DAYS   fetch the live shop, plan bundles for the days without a spot
    python3 brand/badtiendadehoy/auto/spot.py build DAY         voice, render, mix, cover, QA sheet + checks
    python3 brand/badtiendadehoy/auto/spot.py ship DAY          needs spot/DAY/review.json PASS: host files, write posts.json
    python3 brand/badtiendadehoy/auto/spot.py done DAY          record it in ledger.json
"""
import datetime, difflib, json, os, re, subprocess, sys, tempfile, urllib.request, zoneinfo

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.dirname(HERE)
ENGINE = os.path.join(BRAND, "engine")
MODELS = os.path.join(BRAND, "voice", "models")
BLOG = "8343092"
TZ = zoneinfo.ZoneInfo("America/Chicago")
SR = 48000
SLOT = datetime.time(11, 30)
sys.path.insert(0, os.path.join(BRAND, "..", "_shared", "video"))


def sh(*cmd):
    print("+", " ".join(str(c) for c in cmd)[:200], flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def sdir(day):
    return os.path.join(BRAND, "spot", day)


def plan(first, days):
    api = os.path.join(BRAND, "spot", "_api"); os.makedirs(api, exist_ok=True)
    for lang, name in (("es-419", "shop_es.json"), ("en", "shop_en.json")):
        req = urllib.request.Request(f"https://fortnite-api.com/v2/shop?language={lang}", headers={"User-Agent": "badtiendadehoy"})
        with urllib.request.urlopen(req, timeout=60) as r:
            open(os.path.join(api, name), "wb").write(r.read())
    sh("python3", "-I", os.path.join(ENGINE, "spot_prep.py"), api, os.path.join(BRAND, "spot"), os.path.join(HERE, "ledger.json"), first, days)


def mix(d, day):
    import music
    tl = json.load(open(os.path.join(d, "timeline.json")))
    S = {s["id"]: s for s in tl["scenes"]}
    de, ct = S["detail"], S["cta"]
    V, L = de["voice_at"], de["voice_len"]
    k = ct["voice_at"] + 0.45 * ct["voice_len"]
    cues = [[0.02, "impact"], [0.3, "whoosh"], [de["start"], "whoosh"], [V + 0.42 * L, "impact"], [V + 0.46 * L, "coin"],
            [V + 0.66 * L, "pop"], [ct["start"], "whoosh"], [k + 0.8, "key"], [k + 0.98, "key"], [k + 1.16, "key"], [k + 2.6, "click"], [k + 3.4, "success"]]
    spec = dict(style="bounce", bpm=116, seed=int(day.replace("-", "")) + 31, hook="impact",
                sections=[[0, "intro"], [de["start"], "main"], [ct["start"], "end"]])
    tmp = tempfile.mkdtemp()
    bed = music.render(spec, cues, tl["total"], os.path.join(tmp, "music.wav"))
    mixed = os.path.join(tmp, "mixed.wav")
    fc = (f"[0]aresample={SR},volume=0.6[m];[1]aresample={SR},highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
          f"equalizer=f=3000:t=q:w=1.2:g=2.5,volume=1.35,asplit=2[vo][key];[m][key]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=300[duck];"
          f"[duck][vo]amix=inputs=2:normalize=0:duration=first,atrim=0:{tl['total']}[a]")
    sh("ffmpeg", "-y", "-loglevel", "error", "-i", bed, "-i", os.path.join(d, "vo", "voice.wav"), "-filter_complex", fc, "-map", "[a]", "-ac", "2", mixed)
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", mixed, "-af", "loudnorm=I=-14:TP=-2.6:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(re.findall(r"\{[^{}]+\}", p.stderr)[-1])
    ln = (f"loudnorm=I=-14:TP=-2.6:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    sh("ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(d, "silent.mp4"), "-i", mixed, "-filter_complex",
       f"[1]{ln},alimiter=limit=0.7:level=false,aresample={SR}[a]", "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac",
       "-b:a", "256k", "-shortest", "-movflags", "+faststart", os.path.join(d, "video.mp4"))


def build(day):
    d = sdir(day)
    sh("python3", os.path.join(ENGINE, "long_voice.py"), os.path.join(MODELS, "Base"), d, "spot.json", "0")
    sh("node", os.path.join(ENGINE, "spot_render.js"), d, "video", os.path.join(d, "silent.mp4"))
    mix(d, day)
    sh("node", os.path.join(ENGINE, "spot_render.js"), d, "cover", os.path.join(d, "cover.jpg"))
    check(day)


def check(day):
    d = sdir(day)
    tl = json.load(open(os.path.join(d, "timeline.json")))
    S = {s["id"]: s for s in tl["scenes"]}
    times = [1.2, S["detail"]["start"] + 0.6, S["detail"]["start"] + S["detail"]["dur"] - 0.5, S["cta"]["start"] + 1.0, tl["total"] - 0.4]
    sh("node", os.path.join(ENGINE, "spot_render.js"), d, "stills", ",".join(f"{t:.1f}" for t in times))
    from PIL import Image
    files = [os.path.join(d, "qa", f"still_{t:.1f}.jpg") for t in times] + [os.path.join(d, "cover.jpg")]
    sheet = Image.new("RGB", (len(files) * 300, 533), (20, 20, 24))
    for i, f in enumerate(files):
        sheet.paste(Image.open(f).convert("RGB").resize((300, 533)), (i * 300, 0))
    sheet.save(os.path.join(d, "qa", "review-sheet.jpg"), quality=85)
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(d, "video.mp4"), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", p)[-1])
    from faster_whisper import WhisperModel
    import librosa
    wav = os.path.join(d, "qa", "audio16k.wav")
    sh("ffmpeg", "-v", "error", "-y", "-i", os.path.join(d, "video.mp4"), "-vn", "-ac", "1", "-ar", "16000", wav)
    m = WhisperModel(os.path.join(MODELS, "whisper-small"), device="cpu", compute_type="int8")
    data = json.load(open(os.path.join(d, "spot.json")))
    norm = lambda s: re.sub(r"[^a-záéíóúñü0-9 ]", " ", s.lower())
    speech = []
    for ln, s in zip(data["lines"], tl["scenes"]):
        y, _ = librosa.load(wav, sr=16000, offset=s["voice_at"], duration=s["voice_len"] + 0.3)
        heard = " ".join(x.text for x in m.transcribe(y, language="es", beam_size=5)[0]).strip()
        speech.append(dict(scene=s["id"], match=round(difflib.SequenceMatcher(None, norm(ln["text"]).split(), norm(heard).split()).ratio(), 2), heard=heard))
    checks = dict(loudness_ok=-15.5 <= lufs <= -12.5, lufs=lufs, duration=tl["total"], duration_ok=15 <= tl["total"] <= 60,
                  speech_ok=all(x["match"] >= 0.45 for x in speech))
    json.dump(dict(day=day, checks=checks, speech=speech), open(os.path.join(d, "qa", "checks.json"), "w"), ensure_ascii=False, indent=1)
    print(f"SPOT {day}: {data['name']} · {data['regular']} -> {data['price']} · ahorra {data['save']} ({data['pct']}%) · hasta {data['out']}")
    for x in speech:
        print(f"  {x['scene']:6} {x['match']:.2f}  {x['heard'][:160]}")
    print("CHECKS", json.dumps(checks))
    print("REVIEW SHEET:", os.path.join(d, "qa", "review-sheet.jpg"))
    print("AUTO CHECKS", "PASS" if all(v for k, v in checks.items() if k.endswith("_ok")) else "FAIL")


def ship(day):
    d = sdir(day)
    if json.load(open(os.path.join(d, "review.json"))).get("status") != "PASS":
        print("STOP: review is not PASS"); return
    data = json.load(open(os.path.join(d, "spot.json")))
    when = datetime.datetime.combine(datetime.date.fromisoformat(day), SLOT, TZ)
    if when < datetime.datetime.now(TZ) + datetime.timedelta(minutes=20):
        print("STOP: 11:30 AM on", day, "has passed"); return
    if datetime.date.fromisoformat(data["out"]) <= datetime.date.fromisoformat(day):
        print("STOP: the bundle leaves before it would post"); return
    sys.path.insert(0, HERE)
    import ghmedia
    urls = ghmedia.publish({f"spot-{day}.mp4": os.path.join(d, "video.mp4"), f"spot-{day}-cover.jpg": os.path.join(d, "cover.jpg")})
    vurl, curl = urls[f"spot-{day}.mp4"], urls[f"spot-{day}-cover.jpg"]
    match = f"#EpicPartner Lote del día: {data['name']}"
    who = (", ".join(data["outfits"]) + " y más") if data["outfits"] else f"{data['count']} objetos"
    long = "\n".join([f"{match} 🛒 ¿Vale la pena?",
                      f"🔥 De {data['regular']:,} a {data['price']:,} monedas V: te ahorras el {data['pct']}%",
                      f"🎁 {data['count']} objetos: {who}",
                      f"⏰ En la tienda hasta el {data['out_es']}",
                      "¿Lo vas a comprar? 👇", "Usa el código BAD en la tienda 💚"])
    import onepost
    tt = f"{long}\n#fortnite #tiendafortnite #lotesfortnite #fortnitemexico"
    shared = onepost.fit(long.split("\n"), ["#fortnite #tiendadefortnite #lotesfortnite #fortnitemexico #skinsfortnite"])
    base = dict(autoPublish=True, draft=False, descendants=[], firstCommentText="", hasNotReadNotes=False, media=[vurl], mediaAltText=[],
                shortener=False, smartLinkData={"ids": []},
                publicationDate={"dateTime": when.strftime("%Y-%m-%dT%H:%M:%S"), "timezone": "America/Chicago"})
    # One Metricool post for all five networks (owner's preference): TikTok's caption is tiktokData.title, YouTube has its own title,
    # Instagram, Facebook, YouTube (description) and Threads share one caption.
    info = onepost.combine(base, shared, dict(
        tiktok=dict(disableComment=False, disableDuet=False, disableStitch=False, privacyOption="PUBLIC_TO_EVERYONE", commercialContentThirdParty=True,
                    commercialContentOwnBrand=False, title=tt, autoAddMusic=False, isAigc=True),
        instagram=dict(type="REEL", showReelOnFeed=True, isAiGenerated=True, collaborators=[], carouselTags={}),
        facebook=dict(type="REEL", title=""),
        youtube=dict(title=f"¿Vale la pena el lote de {data['name']}? 🛒 Fortnite | código BAD #shorts"[:100], type="short", privacy="public",
                     tags=["fortnite", "lotes fortnite", "tienda de fortnite", data["name"], "codigo BAD"], category="GAMING", madeForKids=False,
                     isAiGeneratedContent=False),
        threads={}), thumb=curl)
    date = when.isoformat(timespec="seconds")
    json.dump(dict(day=day, at=date, match=match, video=vurl, cover=curl,
                   calls=[dict(network="all", networks=list(onepost.NETS), blogId=BLOG, date=date, match=match, info=info)]),
              open(os.path.join(d, "posts.json"), "w"), ensure_ascii=False, indent=1)
    print(f"SHIP spot {day}: one post for {', '.join(onepost.NETS)} at {date} · {data['name']}")


def done(day):
    d = sdir(day)
    p = json.load(open(os.path.join(d, "posts.json"))); data = json.load(open(os.path.join(d, "spot.json")))
    led_path = os.path.join(HERE, "ledger.json"); led = json.load(open(led_path)) if os.path.exists(led_path) else []
    led = [r for r in led if not (r.get("kind") == "spot" and r.get("day") == day)]
    led.append(dict(kind="spot", day=day, at=p["at"], match=p["match"], bundle=data["name"], out=data["out"], networks=[n for c in p["calls"] for n in c.get("networks", [c["network"]])]))
    json.dump(led, open(led_path, "w"), ensure_ascii=False, indent=1)
    print("ledger updated: spot", day)


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "plan":
        plan(sys.argv[2], sys.argv[3])
    else:
        {"build": build, "check": check, "ship": ship, "done": done}[cmd](sys.argv[2])
