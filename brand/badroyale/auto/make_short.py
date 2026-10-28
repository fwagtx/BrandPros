"""Build, check and ship one BAD ROYALE short that the autopilot wrote, the same way as the shop video.

A short is a folder (brand/badroyale/video/auto/<YYYY-MM-DD>-<slug>/) holding:
    scene.js    the animation (reads the voice timings from window.VO; see video/v2/*/scene.js)
    vo.json     {"phrases": [{"text": ..., "pause": ...}, ...]}; the voice settings are always
                taken from brand/badroyale/voice.json (the owner's locked voice), whatever this says
    post.json   captions and titles: tiktok, tiktokTitle, instagram, facebook, facebookTitle,
                youtube, youtubeTitle, tags, and cover_t (the second of the video used as its cover)

    python3 brand/badroyale/auto/make_short.py build DIR [--sources SRC]
        Records the voice, renders the video and a review sheet (DIR/qa/review-sheet.png).
        Then a reviewer looks at it and writes DIR/review.json ({"status": "PASS"|"FAIL", "notes"}).
    python3 brand/badroyale/auto/make_short.py ship DIR --at "YYYY-MM-DD HH:MM" [--sources SRC]
        Pre-post checklist in autopilot mode (must say READY TO POST), caption rules, upload copy,
        cover, upload for Metricool, and DIR/posts.json with one createScheduledPost call per network
        at that Central time.
    python3 brand/badroyale/auto/make_short.py done DIR
        Deletes the uploaded copies once every post is scheduled.

SRC is the folder of source files the claims are checked against (default brand/badroyale/sources).
"""
import datetime
import glob
import json
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shop_daily import BRAND, BLOG, CT, STORE, VIDEO, ffmpeg, post_calls, run  # noqa: E402

VOICE = os.path.join(BRAND, "badroyale", "voice.json")
BANNED = re.compile(r"\b(discount|discounted|% ?off|save money|cheaper with|free v-?bucks|giveaway|sponsored by epic|epic partnered with us)\b", re.I)


def opt(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def folder():
    d = os.path.abspath(sys.argv[2])
    for f in ("scene.js", "vo.json", "post.json"):
        if not os.path.exists(os.path.join(d, f)):
            raise SystemExit(f"STOP: {f} is missing in {d}")
    return d, os.path.basename(d.rstrip("/"))


def build():
    d, slug = folder()
    vo = json.load(open(os.path.join(d, "vo.json")))
    v = json.load(open(VOICE))
    vo.update({k: v[k] for k in ("voice", "speed", "lang", "lead")})     # the agreed voice, always
    json.dump(vo, open(os.path.join(d, "vo.json"), "w"), indent=1, ensure_ascii=False)
    run([sys.executable, os.path.join(BRAND, "_shared", "voice", "vo.py"), "vo.json", "vo.wav", "timings.json"], d, quiet=True)
    t = json.load(open(os.path.join(d, "timings.json")))
    open(os.path.join(d, "timings.js"), "w").write("window.VO=" + json.dumps(t) + ";\n")
    rel = lambda p: os.path.relpath(p, VIDEO)
    mp4 = os.path.join(d, f"badroyale-{slug}.mp4")
    run(["node", "render.mjs", rel(os.path.join(d, "scene.js")), rel(mp4), "--data", rel(os.path.join(d, "timings.js")), "--voice", rel(os.path.join(d, "vo.wav"))], VIDEO, quiet=True)
    P = t["phrases"]
    times = sorted({0.5} | {round(p["t0"] + 0.45, 2) for p in P})[:8]
    stills = os.path.join(d, "qa", "stills")
    shutil.rmtree(stills, ignore_errors=True)
    run(["node", "render.mjs", rel(os.path.join(d, "scene.js")), "x.mp4", "--data", rel(os.path.join(d, "timings.js")),
         "--stills", ",".join(f"{x:.2f}" for x in times), "--stillsDir", stills], VIDEO, quiet=True)
    files = sorted(glob.glob(os.path.join(stills, "t*.png")))
    inputs = sum([["-i", f] for f in files], [])
    graph = "".join(f"[{i}]scale=360:-1[s{i}];" for i in range(len(files))) + "".join(f"[s{i}]" for i in range(len(files))) + f"hstack={len(files)}"
    run([ffmpeg(), "-y", "-loglevel", "error", *inputs, "-filter_complex", graph, os.path.join(d, "qa", "review-sheet.png")], d, quiet=True)
    print(json.dumps({"video": os.path.relpath(mp4, BRAND), "duration": round(P[-1]["t1"] + 0.75, 1), "review_sheet": os.path.relpath(os.path.join(d, "qa", "review-sheet.png"), BRAND),
                      "voice": [p["text"] for p in P]}, indent=1))
    print("NEXT: look at the review sheet (and a few more stills if anything looks off), write review.json, then run ship.")


def caption_problems(c):
    bad = []
    for k in ("tiktok", "instagram", "facebook", "youtube"):
        txt = c.get(k) or ""
        if not txt.startswith("#EpicPartner"):
            bad.append(f"{k}: must start with #EpicPartner")
        if "code BAD" not in txt and "Code BAD" not in txt:
            bad.append(f"{k}: must say code BAD")
        if BANNED.search(txt):
            bad.append(f"{k}: banned wording ({BANNED.search(txt).group(0)})")
    if len(re.findall(r"#\w+", c.get("instagram", ""))) > 5:
        bad.append("instagram: more than 5 hashtags")
    if not (c.get("youtubeTitle") or "").strip() or len(c["youtubeTitle"]) > 100:
        bad.append("youtubeTitle: empty or over 100 characters")
    for k in ("tiktokTitle", "facebookTitle"):
        if not (c.get(k) or "").strip():
            bad.append(f"{k}: empty")
    if not isinstance(c.get("tags"), list) or not c["tags"]:
        bad.append("tags: empty")
    return bad


def ship():
    d, slug = folder()
    at = opt("--at")
    if not at:
        raise SystemExit("STOP: --at \"YYYY-MM-DD HH:MM\" (Central time) is required")
    when = datetime.datetime.strptime(at, "%Y-%m-%d %H:%M").replace(tzinfo=CT)
    if when < datetime.datetime.now(CT) + datetime.timedelta(minutes=15):
        raise SystemExit("STOP: that time is less than 15 minutes away; pick the next slot or skip.")
    rv = os.path.join(d, "review.json")
    if not os.path.exists(rv) or json.load(open(rv)).get("status") != "PASS":
        raise SystemExit("STOP: review.json is missing or not PASS.")
    c = json.load(open(os.path.join(d, "post.json")))
    bad = caption_problems(c)
    if bad:
        raise SystemExit("STOP: post.json: " + "; ".join(bad))
    src = os.path.abspath(opt("--sources", os.path.join(BRAND, "badroyale", "sources")))
    mp4 = os.path.join(d, f"badroyale-{slug}.mp4")
    run([sys.executable, os.path.join(BRAND, "_shared", "qa", "check_video.py"), os.path.join(d, "scene.js"), mp4, src, os.path.join(d, "qa"),
         "--review", rv, "--data", os.path.join(d, "timings.js"), "--autopilot"], BRAND)
    verdict = json.load(open(os.path.join(d, "qa", "qa-log.json")))["verdict"]
    if verdict != "READY TO POST":
        raise SystemExit(f"STOP: checklist says {verdict}. See {os.path.relpath(os.path.join(d, 'qa', 'qa-log.md'), BRAND)}.")
    out = os.path.join(d, "out")
    os.makedirs(out, exist_ok=True)
    FF = ffmpeg()
    run([FF, "-y", "-loglevel", "error", "-i", mp4, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "14M", "-bufsize", "28M",
         "-pix_fmt", "yuv420p", "-r", "60", "-c:a", "copy", "-movflags", "+faststart", os.path.join(out, "video.mp4")], d, quiet=True)
    run([FF, "-y", "-loglevel", "error", "-ss", str(c.get("cover_t", 0.5)), "-i", mp4, "-frames:v", "1", "-q:v", "2", os.path.join(out, "cover.jpg")], d, quiet=True)
    video = run([sys.executable, STORE, "put", os.path.join(out, "video.mp4"), f"{slug}/video.mp4"], BRAND, quiet=True).strip()
    cover = run([sys.executable, STORE, "put", os.path.join(out, "cover.jpg"), f"{slug}/cover.jpg"], BRAND, quiet=True).strip()
    calls = post_calls(slug, when, video, cover, c)
    json.dump({"slug": slug, "blogId": BLOG, "post_at": when.isoformat(timespec="minutes"), "calls": calls}, open(os.path.join(d, "posts.json"), "w"), indent=1, ensure_ascii=False)
    print(json.dumps({"verdict": verdict, "post_at_ct": when.strftime("%Y-%m-%d %-I:%M %p CT"), "posts": os.path.relpath(os.path.join(d, "posts.json"), BRAND),
                      "networks": [x["network"] for x in calls]}, indent=1))
    print("NEXT: call createScheduledPost once per entry in posts.json calls (blogId, date, info exactly as given), then run done.")


def done():
    d, slug = os.path.abspath(sys.argv[2]), os.path.basename(sys.argv[2].rstrip("/"))
    for name in ("video.mp4", "cover.jpg"):
        run([sys.executable, STORE, "rm", f"{slug}/{name}"], BRAND, quiet=True)
    print(f"cleaned up {slug}")


if __name__ == "__main__":
    {"build": build, "ship": ship, "done": done}.get(sys.argv[1] if len(sys.argv) > 2 else "", lambda: sys.exit(__doc__))()
