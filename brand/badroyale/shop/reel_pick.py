"""Daily Item Shop reel (owner's new look, 2026-11-23): pick six offers worth a card each, with the facts for their stickers.

Usage: python3 reel_pick.py [YYYY-MM-DD] [--out DIR]   (default: today's shop, UTC, into shop/<date>/)
Writes shop/<date>/: shop.json, manifest.json, img/<key>.png + img/bg_<key>.jpg, plan.json, plan.js (window.SHOP)

What gets a card (all straight from Epic's shop data, mirrored by fortnite-api.com):
  new    - offers that entered the shop today (outfits and bundles first, the priciest first)
  deal   - the bundle furthest under its listed regular price, only when it is new, leaving, or wasn't shown yesterday
  og     - the oldest outfit on sale, by the season Epic says it was introduced
  last   - outfits whose listing ends at the next reset
  fill   - other new items (pickaxes, emotes, gliders...), then yesterday's arrivals
Anything shown yesterday is skipped unless it leaves at the next reset, so the video changes every day.
Nothing here is opinion: no "worth it" verdicts, only prices, dates and seasons.
"""
import datetime, json, os, re, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://fortnite-api.com"
N_CARDS = 6
KIND = {"outfit": ("outfit", "👤"), "backpack": ("back bling", "🎒"), "pickaxe": ("pickaxe", "⛏️"), "emote": ("emote", "💃"), "glider": ("glider", "🪂"),
        "wrap": ("wrap", "🎨"), "shoe": ("kicks", "👟"), "sidekick": ("sidekick", "🐾"), "contrail": ("contrail", "✨"), "bundle": ("bundle", "📦")}
RAR = {"common": ("9aa0a6", "3c4043"), "uncommon": ("69d13a", "1c6b10"), "rare": ("49b8ff", "1a4fa5"), "epic": ("c46bff", "4b1a8c"), "legendary": ("f7a64a", "7a3210"),
       "icon": ("4fe0e8", "0d5e6e"), "marvel": ("ef4a3c", "5a0f0b"), "dc": ("5a84ff", "14205e"), "gaminglegends": ("7b6bff", "1e1557"), "starwars": ("8a8a8a", "151515")}


def get(url, tries=4):
    for i in range(tries):
        try:
            return urllib.request.urlopen(url, timeout=120).read()
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(3 * (i + 1))


def mon(d):
    return d.strftime("%b %-d").lower()                      # "nov 23"


def col(c):
    return (c or "")[:6] or None


def main():
    raw = json.loads(get(f"{API}/v2/shop"))
    shop = raw["data"]
    day = shop["date"][:10]
    args = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith("--") and sys.argv[i - 1] != "--out"]
    want = args[0] if args else day
    if want != day:
        raise SystemExit(f"Live shop is {day}, not {want}. Run after the reset.")
    d0 = datetime.date.fromisoformat(day)
    y0 = (d0 - datetime.timedelta(days=1)).isoformat()
    out = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else os.path.join(HERE, day)   # --out DIR for a test render
    os.makedirs(os.path.join(out, "img"), exist_ok=True)
    json.dump(raw, open(os.path.join(out, "shop.json"), "w"))

    # one record per offer
    offers = []
    for e in shop["entries"]:
        items = [i for i in (e.get("brItems") or []) if i["type"]["value"] in KIND]
        if not items:
            continue
        outfits = [i for i in items if i["type"]["value"] == "outfit"]
        main = (outfits or items)[0]
        b = e.get("bundle")
        intro = main.get("introduction") or {}
        img = (b or {}).get("image") if b else (main["images"].get("featured") or main["images"].get("icon"))
        if not img:
            continue
        c = e.get("colors") or {}
        rk = main["rarity"]["value"]
        offers.append({
            "key": re.sub(r"[^A-Za-z0-9_]", "", (b["name"] if b else main["id"]).replace(" ", "_"))[:60] or main["id"],
            "name": (b["name"] if b else main["name"]).strip(), "kind": "bundle" if b else main["type"]["value"],
            "final": e["finalPrice"], "regular": e["regularPrice"], "in": e["inDate"][:10], "out": e["outDate"][:10],
            "chapter": int(intro["chapter"]) if intro.get("chapter") else None, "season": intro.get("season"),
            "introText": intro.get("text"), "backend": intro.get("backendValue") or 0, "rarity": rk,
            "set": ((main.get("set") or {}).get("value") or "").strip(), "count": len(e.get("brItems") or []),
            "items": [i["name"].strip() for i in (e.get("brItems") or [])],
            "c1": col(c.get("color1")) or RAR.get(rk, RAR["epic"])[0], "c2": col(c.get("color3")) or col(c.get("color2")) or RAR.get(rk, RAR["epic"])[1],
            "img": img, "isOutfit": bool(outfits)})
    # the same item can be listed twice (alone and in a set): keep the cheapest single listing per name
    seen = {}
    for o in sorted(offers, key=lambda o: (o["kind"] == "bundle", o["final"])):
        seen.setdefault(o["name"].lower(), o)
    offers = list(seen.values())
    cur = max(o["backend"] for o in offers)

    # what yesterday's video showed (new plan has "picks"; the old one had deal/og/last)
    yesterday = set()
    yp = os.path.join(HERE, y0, "plan.json")
    if os.path.exists(yp):
        p = json.load(open(yp))
        yesterday |= {x["name"].lower() for x in p.get("picks", [])}
        if p.get("deal"):
            yesterday.add(p["deal"]["name"].lower())
            yesterday |= {x["name"].lower() for x in p.get("og", {}).get("outfits", [])}

    picks, tags = [], {}
    def add(o, tag):
        if o and len(picks) < N_CARDS and o["name"].lower() not in {p["name"].lower() for p in picks} \
                and not (o["kind"] == "bundle" and sum(p["kind"] == "bundle" for p in picks) >= 2):      # at most two bundles
            picks.append(o); tags[o["name"]] = tag
    fresh = lambda o: o["name"].lower() not in yesterday or o["out"] == day
    big = lambda o: (o["kind"] == "bundle" or o["isOutfit"])
    nb = sorted([o for o in offers if o["in"] == day and o["kind"] == "bundle"], key=lambda o: (-o["final"], o["name"]))
    no = sorted([o for o in offers if o["in"] == day and o["isOutfit"] and o["kind"] != "bundle"], key=lambda o: (-o["final"], o["name"]))
    new = nb[:1] + no[:2] + nb[1:2] + no[2:] + nb[2:]                     # lead with a bundle, then outfits
    bundles = [o for o in offers if o["kind"] == "bundle" and o["regular"] > o["final"]]
    deal = max(bundles, key=lambda o: (o["regular"] - o["final"], o["regular"])) if bundles else None
    singles = [o for o in offers if o["isOutfit"] and o["kind"] != "bundle" and o["chapter"]]
    og = min(singles, key=lambda o: (o["backend"], o["name"])) if singles else None
    last = sorted([o for o in offers if o["out"] == day and big(o) and o["kind"] != "bundle"], key=lambda o: (o["backend"], -o["final"]))
    for o in new[:3]:
        add(o, "new")
    if deal and (deal["in"] >= y0 or fresh(deal)):
        add(deal, "deal")
    if og and fresh(og):
        add(og, "og")
    for o in last[:2]:
        add(o, "last")
    for o in new[3:] + sorted([o for o in offers if o["in"] == day and not big(o)], key=lambda o: -o["final"]):
        if fresh(o):
            add(o, "new")
    for o in sorted([o for o in offers if o["in"] == y0 and big(o)], key=lambda o: -o["final"]):
        if fresh(o):
            add(o, "recent")
    for o in sorted(offers, key=lambda o: o["backend"]):                       # quiet day: oldest first
        if fresh(o) and big(o):
            add(o, "og" if o["chapter"] == 1 else "recent")
    order = {"new": 0, "deal": 1, "recent": 2, "og": 3, "last": 4}
    picks.sort(key=lambda o: order[tags[o["name"]]])

    # stickers: up to three facts per card, each with the claim the checklist verifies against shop.json
    def facts(o):
        f, tag = [], tags[o["name"]]
        name_m = [o["name"]]
        if o["kind"] == "bundle" and o["regular"] > o["final"]:
            if deal and o["name"] == deal["name"]:
                f.append(("biggest bundle saving today 🔥", {"match": name_m + [f'"regularPrice": {o["regular"]}', f'"finalPrice": {o["final"]}'],
                                                            "visual": "largest regularPrice - finalPrice among today's bundles (reel_pick.py)"}))
            f.append((f"{o['regular'] - o['final']:,} V-Bucks below regular 🔥", {"match": name_m + [f'"regularPrice": {o["regular"]}', f'"finalPrice": {o["final"]}']}))
        if o["in"] == day:
            f.append(("new in today's shop 🆕", {"match": name_m + [f'"inDate": "{day}T']}))
        elif o["in"] == y0:
            f.append((f"added {mon(datetime.date.fromisoformat(y0))} 🆕", {"match": name_m + [f'"inDate": "{y0}T']}))
        if o["out"] == day:
            f.append(("leaves at the next reset ⏰", {"match": name_m + [f'"outDate": "{day}T23:59:59']}))
            f.append(("the reset is 7 PM ET · 6 PM CT 👀", {"match": [f'"outDate": "{day}T23:59:59'], "visual": "00:00 UTC = 7 PM ET = 6 PM CT"}))
        elif (datetime.date.fromisoformat(o["out"]) - d0).days <= 3:
            f.append((f"in the shop until {mon(datetime.date.fromisoformat(o['out']))} ⏰", {"match": name_m + [f'"outDate": "{o["out"]}T']}))
        if o["chapter"]:
            it = {"match": name_m + [o["introText"]]} if o["introText"] else {"match": name_m}
            if o["chapter"] == 1:
                f.append((f"og · chapter 1, season {o['season']} 🔥", it))
            elif o["backend"] == cur:
                f.append(("brand new this season ✨", {**it, "visual": "introduced in the newest season in today's shop data"}))
            else:
                f.append((f"from chapter {o['chapter']}, season {o['season']}", it))
        if o["kind"] == "bundle" and o["count"] > 2:
            names = [n for n in o["items"] if n.lower() != o["name"].lower()][:3]
            f.append((f"{o['count']} items: {', '.join(names[:2])} & more", {"match": names[:2]}))
        elif o["kind"] not in ("bundle", "outfit"):
            lab, em = KIND[o["kind"]]
            f.append((f"{lab} {em}", {"match": name_m, "visual": "item type from shop.json"}))
        if o["set"] and len(f) < 3:
            f.append((f"{o['set'].lower()} set", {"match": name_m + [o["set"]]}))
        # lead with the reason the card is here
        lead = {"new": "new in", "last": "leaves at", "og": "og", "deal": "biggest"}.get(tag)
        if lead:
            f.sort(key=lambda x: not x[0].startswith(lead))
        return f[:3]

    emoji = {"new": "🔥", "deal": "🔥", "og": "👑", "last": "⏰", "recent": "👀"}
    cards = []
    for o in picks:
        ff = facts(o)
        cards.append({**{k: o[k] for k in ("key", "name", "kind", "final", "regular", "in", "out", "c1", "c2", "count")}, "tag": tags[o["name"]], "emoji": emoji[tags[o["name"]]],
                      "facts": [t for t, _ in ff], "claims": [{"text": f"{o['name']}: {t}", "source": "shop.json", **c} for t, c in ff],
                      "kindLabel": KIND[o["kind"]][0]})

    # images: the card art, plus a small pre-blurred copy for the background (a live CSS blur is slow to render)
    import subprocess, imageio_ffmpeg
    byname = {o["name"]: o for o in offers}
    for c in cards:
        p = os.path.join(out, "img", c["key"] + ".png")
        if not os.path.exists(p):
            open(p, "wb").write(get(byname[c["name"]]["img"]))
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"color=c=#{c['c2']}:s=540x540", "-i", p, "-filter_complex",
                        "[1]scale=540:540[f];[0][f]overlay=format=auto,gblur=sigma=26", "-frames:v", "1", "-q:v", "3", os.path.join(out, "img", "bg_" + c["key"] + ".jpg")], check=True)
    open(os.path.join(out, "img", "vbuck.png"), "wb").write(get(shop["vbuckIcon"]))

    # the music: the audio lab picks today's style (tempo, opening hook, lead) and the date seeds the key and melody;
    # a test build (--out) doesn't count as a trial
    import audio_lab
    music = audio_lab.pick(day, len(cards), dry="--out" in sys.argv)
    plan = {"date": day, "dateLabel": mon(d0), "offers": sum(1 for e in shop["entries"] if e.get("brItems")), "picks": cards, "hero": [c["key"] for c in cards[:3]],
            "newCount": sum(1 for o in offers if o["in"] == day), "music": music}
    json.dump(plan, open(os.path.join(out, "plan.json"), "w"), indent=1, ensure_ascii=False)
    open(os.path.join(out, "plan.js"), "w").write("window.SHOP=" + json.dumps(plan, ensure_ascii=False) + ";\n")

    now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    json.dump({"via": "fortnite-api.com (mirror of Epic's in-game shop)", "files": [
        {"file": "shop.json", "source": f"Item Shop for {day}", "url": f"{API}/v2/shop", "fetched_utc": now},
        {"file": "plan.json", "source": "Counts computed from shop.json by reel_pick.py", "url": f"{API}/v2/shop", "fetched_utc": now}]},
        open(os.path.join(out, "manifest.json"), "w"), indent=1)
    print(json.dumps({"date": day, "offers": len(offers), "music": music,
                      "cards": [[c["tag"], c["name"], c["final"], c["facts"]] for c in cards]}, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
