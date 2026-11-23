"""BAD ROYALE daily Item Shop video, start to finish, for the autopilot.

    python3 brand/badroyale/auto/shop_daily.py build [YYYY-MM-DD]
        Waits for the live shop to be that day (default: today in UTC), picks six offers and their
        fact stickers (reel_pick.py), renders the reel (reel.js: the owner's new look from 2026-11-23,
        no voice, an original beat-synced track from music.py) and a review sheet of stills
        (shop/<day>/qa/review-sheet.png). Then a reviewer looks at the sheet and writes
        shop/<day>/review.json ({"status": "PASS" or "FAIL", "notes": "..."}).
    python3 brand/badroyale/auto/shop_daily.py ship [YYYY-MM-DD]
        Runs the pre-post checklist in autopilot mode and stops unless it says READY TO POST.
        Makes the upload copy and the cover, uploads both for Metricool to import, and writes
        shop/<day>/posts.json: one ready createScheduledPost call per network, posting about
        12 minutes from now.
    python3 brand/badroyale/auto/shop_daily.py done [YYYY-MM-DD]
        After every post in posts.json is scheduled: deletes the uploaded copies (Metricool
        keeps its own) and archives the day's shop for the weekly long video.

Exit code 0 means the step worked; anything else means stop: post nothing for that day.
"""
import datetime
import glob
import json
import math
import os
import shutil
import subprocess
import sys
import time
from zoneinfo import ZoneInfo

BRAND = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SHOP = os.path.join(BRAND, "badroyale", "shop")
VIDEO = os.path.join(BRAND, "_shared", "video")
ENGINE = os.path.join(BRAND, "_shared", "engine")
STORE = os.path.join(BRAND, "_shared", "store.py")
BLOG = "7408112"            # Metricool brand ItemShopBad (BAD ROYALE). Never any other.
CT = ZoneInfo("America/Chicago")


def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def run(cmd, cwd, quiet=False):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write((r.stdout or "")[-3000:] + (r.stderr or "")[-3000:])
        raise SystemExit(f"FAILED: {' '.join(cmd)}")
    if not quiet:
        sys.stdout.write(r.stdout)
    return r.stdout


def day_arg():
    a = [x for x in sys.argv[2:] if not x.startswith("-")]
    return a[0] if a else datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")


SCENE = os.path.join(SHOP, "reel.js")


def beats(plan):
    """Key moments of the reel, in seconds (same grid as reel.js: intro 8 beats, 8 per card, grid 8, code 12)."""
    B = 60 / plan["music"]["bpm"]
    n = len(plan["picks"])
    card = lambda i: (8 + 8 * i) * B
    grid = card(n)
    return {"B": B, "card": card, "grid": grid, "code": grid + 8 * B, "end": grid + 20 * B}


def build(day):
    for attempt in range(25):            # the live shop can lag the reset by a few minutes
        r = subprocess.run([sys.executable, "reel_pick.py", day], cwd=SHOP, capture_output=True, text=True)
        if r.returncode == 0:
            print(r.stdout)
            break
        if "Live shop is" in (r.stderr + r.stdout) and attempt < 24:
            print(f"live shop isn't {day} yet; waiting a minute")
            time.sleep(60)
            continue
        sys.stderr.write(r.stdout[-2000:] + r.stderr[-2000:])
        raise SystemExit("FAILED: reel_pick.py")
    D = os.path.join(SHOP, day)
    shutil.copy(os.path.join(D, "plan.js"), os.path.join(D, "data.js"))
    rel = lambda p: os.path.relpath(p, VIDEO)
    mp4 = os.path.join(D, f"badroyale-shop-{day}.mp4")
    run(["node", "render.mjs", rel(SCENE), rel(mp4), "--data", rel(os.path.join(D, "data.js"))], VIDEO, quiet=True)
    # review sheet: the hook, the first card, two more cards, the grid, the sign-off
    plan = json.load(open(os.path.join(D, "plan.json")))
    b = beats(plan)
    n = len(plan["picks"])
    times = [4 * b["B"] + 0.4, b["card"](0) + 3.2 * b["B"], b["card"](1) + 1.2 * b["B"], b["card"](n - 1) + 1.2 * b["B"], b["grid"] + 5 * b["B"], b["code"] + 8 * b["B"]]
    stills = os.path.join(D, "qa", "stills")
    shutil.rmtree(stills, ignore_errors=True)
    run(["node", "render.mjs", rel(SCENE), "x.mp4", "--data", rel(os.path.join(D, "data.js")),
         "--stills", ",".join(f"{t:.2f}" for t in times), "--stillsDir", stills], VIDEO, quiet=True)
    files = sorted(glob.glob(os.path.join(stills, "t*.png")))
    inputs = sum([["-i", f] for f in files], [])
    graph = "".join(f"[{i}]scale=432:-1[s{i}];" for i in range(len(files))) + "".join(f"[s{i}]" for i in range(len(files))) + f"hstack={len(files)}"
    run([ffmpeg(), "-y", "-loglevel", "error", *inputs, "-filter_complex", graph, os.path.join(D, "qa", "review-sheet.png")], D, quiet=True)
    print(json.dumps({"day": day, "video": os.path.relpath(mp4, BRAND), "duration": round(b["end"], 1), "bpm": plan["music"]["bpm"],
                      "review_sheet": os.path.relpath(os.path.join(D, "qa", "review-sheet.png"), BRAND),
                      "cards": [[c["tag"], c["name"], c["final"], c["facts"]] for c in plan["picks"]]}, indent=1, ensure_ascii=False))
    print("NEXT: look at the review sheet, write review.json in the day's folder, then run ship.")


def captions(p):
    """Hook first (what's new today, so the title changes every day), one question to pull comments, the code ask,
    and #EpicPartner as the only disclosure."""
    d = datetime.date.fromisoformat(p["date"])
    day, long_day = d.strftime("%b %-d"), d.strftime("%B %-d")             # "Nov 23", "November 23"
    short = lambda n: n[:-7] if n.lower().endswith(" bundle") else n
    P = p["picks"]
    lead = P[0]
    L = short(lead["name"])
    if lead["tag"] == "new":
        hook, yt = f"{L} just hit the shop for {lead['final']:,} V-Bucks 👀", f"{L} just dropped 👀"
    elif lead["regular"] > lead["final"]:
        hook, yt = f"{L} is {lead['final']:,} V-Bucks today instead of {lead['regular']:,} 🔥", f"{L} for {lead['final']:,} V-Bucks 🔥"
    else:
        hook, yt = f"{L} is in the shop for {lead['final']:,} V-Bucks 👀", f"{L} is back 👀" if lead["tag"] in ("og", "recent") else f"{L} is here 👀"
    others = [short(c["name"]) for c in P[1:4]]
    also = f"Also in today: {', '.join(others[:-1])} & {others[-1]}" if len(others) > 1 else (f"Also in today: {others[0]}" if others else "")
    last = [short(c["name"]) for c in P if c["out"] == p["date"]]
    gone = f"\n{' & '.join(last[:2])} {'leave' if len(last[:2]) > 1 else 'leaves'} at the next reset ⏰" if last else ""
    body = f"{hook}\n{also}{gone}"
    ask = "What are you buying? 👇"
    code = "Use code BAD in the Item Shop 💛"
    yt_title = f"Fortnite Item Shop {day}: {yt} #Shorts"
    if len(yt_title) > 100:
        yt_title = f"Fortnite Item Shop {day} 👀 #Shorts"
    head = f"#EpicPartner Today's Item Shop for {long_day} 🛒"
    return {
        "tiktok": f"{head}\n{body}\n{ask}\n{code}\n#fortnite #fortniteitemshop #itemshop",
        "tiktokTitle": f"Item Shop {day}: {L}"[:90],
        "instagram": f"{head}\n{body}\n{ask}\n{code}\n#fortnite #fortniteitemshop #itemshop",
        "facebook": f"{head}\n{body}\n{ask}\n{code}",
        "facebookTitle": f"Item Shop {day}: {L}"[:90],
        "youtube": f"#EpicPartner Today's Fortnite Item Shop for {long_day} 🛒\n{body}\n{ask}\n{code}\n#Fortnite #FortniteItemShop #Shorts",
        "youtubeTitle": yt_title,
        "tags": ["fortnite", "fortnite item shop", "item shop today", "fortnite shop", f"fortnite item shop {long_day.lower()}", L.lower()[:60]],
    }


def post_calls(day, when, video, cover, c):
    iso, local = when.isoformat(timespec="seconds"), when.strftime("%Y-%m-%dT%H:%M:%S")
    base = {"autoPublish": True, "draft": False, "descendants": [], "firstCommentText": "", "hasNotReadNotes": False, "mediaAltText": [],
            "media": [video], "publicationDate": {"dateTime": local, "timezone": "America/Chicago"}, "shortener": False, "smartLinkData": {"ids": []}}
    thumb = {"videoThumbnailUrl": cover}
    nets = {
        "tiktok": {**base, **thumb, "providers": [{"network": "tiktok"}], "text": c["tiktok"],
                   "tiktokData": {"title": c["tiktokTitle"], "disableComment": False, "disableDuet": False, "disableStitch": False, "privacyOption": "PUBLIC_TO_EVERYONE",
                                  "commercialContentThirdParty": True, "commercialContentOwnBrand": False, "autoAddMusic": False, "isAigc": False}},
        "instagram": {**base, **thumb, "providers": [{"network": "instagram"}], "text": c["instagram"],
                      "instagramData": {"type": "REEL", "showReelOnFeed": True, "isAiGenerated": False}},
        "facebook": {**base, **thumb, "providers": [{"network": "facebook"}], "text": c["facebook"],
                     "facebookData": {"type": "REEL", "title": c["facebookTitle"]}},
        # the channel was verified on 2026-11-01, so YouTube takes the custom thumbnail too (owner: always use thumbnails)
        "youtube": {**base, **thumb, "providers": [{"network": "youtube"}], "text": c["youtube"],
                    "youtubeData": {"title": c["youtubeTitle"], "type": "short", "privacy": "public", "tags": c["tags"], "category": "GAMING",
                                    "madeForKids": False, "isAiGeneratedContent": False}},
    }
    return [{"network": k, "blogId": BLOG, "date": iso, "info": v, "match": {"tiktok": c["tiktokTitle"], "youtube": c["youtubeTitle"]}.get(k, v["text"][:60])} for k, v in nets.items()]


def ship(day):
    D = os.path.join(SHOP, day)
    rv = os.path.join(D, "review.json")
    if not os.path.exists(rv) or json.load(open(rv)).get("status") != "PASS":
        raise SystemExit("STOP: review.json is missing or not PASS.")
    run([sys.executable, os.path.join(BRAND, "_shared", "qa", "check_video.py"), SCENE, os.path.join(D, f"badroyale-shop-{day}.mp4"),
         D, os.path.join(D, "qa"), "--review", rv, "--data", os.path.join(D, "data.js"), "--autopilot"], BRAND)
    verdict = json.load(open(os.path.join(D, "qa", "qa-log.json")))["verdict"]
    if verdict != "READY TO POST":
        raise SystemExit(f"STOP: checklist says {verdict}. See {os.path.relpath(os.path.join(D, 'qa', 'qa-log.md'), BRAND)}.")
    # the shop ends at the next 00:00 UTC; a post with under 3 hours left isn't worth it
    end = datetime.datetime.combine(datetime.date.fromisoformat(day) + datetime.timedelta(days=1), datetime.time(0), datetime.timezone.utc)
    now = datetime.datetime.now(datetime.timezone.utc)
    if end - now < datetime.timedelta(hours=3):
        raise SystemExit("STOP: this shop ends in under 3 hours; skip it.")
    out = os.path.join(D, "out")
    os.makedirs(out, exist_ok=True)
    FF = ffmpeg()
    run([FF, "-y", "-loglevel", "error", "-i", os.path.join(D, f"badroyale-shop-{day}.mp4"), "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "14M", "-bufsize", "28M",
         "-pix_fmt", "yuv420p", "-r", "60", "-c:a", "copy", "-movflags", "+faststart", os.path.join(out, "video.mp4")], D, quiet=True)
    sys.path.insert(0, os.path.join(BRAND, "badroyale", "video"))
    import cover                                           # house-style cover (owner pick 2026-11-17)
    cover.render(cover.shop_spec(day), os.path.join(out, "cover.jpg"))
    video = run([sys.executable, STORE, "put", os.path.join(out, "video.mp4"), f"shop-{day}/video.mp4"], BRAND, quiet=True).strip()
    cover = run([sys.executable, STORE, "put", os.path.join(out, "cover.jpg"), f"shop-{day}/cover.jpg"], BRAND, quiet=True).strip()
    when = (now + datetime.timedelta(minutes=12)).astimezone(CT)
    when = when.replace(second=0, microsecond=0) + datetime.timedelta(minutes=(5 - when.minute % 5) % 5)
    plan = json.load(open(os.path.join(D, "plan.json")))
    calls = post_calls(day, when, video, cover, captions(plan))
    json.dump({"day": day, "blogId": BLOG, "post_at": when.isoformat(timespec="minutes"), "calls": calls}, open(os.path.join(D, "posts.json"), "w"), indent=1, ensure_ascii=False)
    print(json.dumps({"verdict": verdict, "post_at_ct": when.strftime("%Y-%m-%d %-I:%M %p CT"), "posts": os.path.relpath(os.path.join(D, "posts.json"), BRAND),
                      "networks": [c["network"] for c in calls]}, indent=1))
    print("NEXT: call createScheduledPost once per entry in posts.json calls (blogId, date, info exactly as given), then run done.")


def done(day):
    D = os.path.join(SHOP, day)
    for name in ("video.mp4", "cover.jpg"):
        run([sys.executable, STORE, "rm", f"shop-{day}/{name}"], BRAND, quiet=True)
    # a small archive of the whole shop (names, prices, dates) for the weekly shop video
    shop = json.load(open(os.path.join(D, "shop.json")))["data"]
    rows = []
    for e in shop["entries"]:
        items = e.get("brItems") or []
        if not items:
            continue
        rows.append({"bundle": (e.get("bundle") or {}).get("name"), "items": [[i["name"].strip(), i["type"]["value"], i["rarity"]["value"]] for i in items],
                     "final": e["finalPrice"], "regular": e["regularPrice"], "in": e["inDate"][:10], "out": e["outDate"][:10]})
    os.makedirs(os.path.join(SHOP, "archive"), exist_ok=True)
    json.dump({"date": day, "entries": rows}, open(os.path.join(SHOP, "archive", f"{day}.json"), "w"), separators=(",", ":"), ensure_ascii=False)
    print(f"cleaned up shop-{day}; archived {len(rows)} entries")


if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else ""
    {"build": build, "ship": ship, "done": done}.get(step, lambda d: sys.exit(__doc__))(day_arg())
