"""Daily Item Shop short: fetch today's shop, pick the three facts worth a video, write the voice script.

Usage: python3 shop_pick.py [YYYY-MM-DD]   (default: today's shop, UTC)
Writes shop/<date>/: shop.json, history.json, manifest.json, img/*.png, plan.json, vo.json, plan.js

Picks (all straight from Epic's shop data, mirrored by fortnite-api.com):
  deal  - the bundle with the biggest gap between Epic's listed regular price and its price today
  og    - the oldest outfit(s) in the shop, by the season Epic says they were introduced
  last  - outfits on their last day: their shop listing ends at the next reset
Nothing here is opinion: no "worth it" verdicts, only prices, dates and seasons.
"""
import datetime, json, os, re, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://fortnite-api.com"


def get(url, tries=4):
    for i in range(tries):
        try:
            return urllib.request.urlopen(url, timeout=120).read()
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(3 * (i + 1))


def words_date(d):
    n = d.day
    suf = "th" if 10 <= n % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return d.strftime("%B ") + f"{n}{suf}"


def season_key(text):
    m = re.search(r"Chapter (\d+), Season (\d+)", text or "")
    return (int(m.group(1)), int(m.group(2))) if m else (99, 99)


def main():
    raw = json.loads(get(f"{API}/v2/shop"))
    shop = raw["data"]
    day = shop["date"][:10]
    want = sys.argv[1] if len(sys.argv) > 1 else day
    if want != day:
        raise SystemExit(f"Live shop is {day}, not {want}. Run after the reset.")
    out = os.path.join(HERE, day)
    os.makedirs(os.path.join(out, "img"), exist_ok=True)
    json.dump(raw, open(os.path.join(out, "shop.json"), "w"))

    # one record per outfit (cheapest single listing), plus bundles
    outfits, bundles = {}, []
    for e in shop["entries"]:
        items = [i for i in (e.get("brItems") or []) if i["type"]["value"] == "outfit"]
        if not items:
            continue
        if e.get("bundle"):
            bundles.append({"name": e["bundle"]["name"], "final": e["finalPrice"], "regular": e["regularPrice"], "out": e["outDate"][:10], "outfits": [i["id"] for i in items]})
        for i in items:
            rec = outfits.setdefault(i["id"], {"id": i["id"], "name": i["name"].strip(), "rarity": i["rarity"]["displayValue"], "rarityKey": i["rarity"]["value"],
                                               "series": (i.get("series") or {}).get("value"), "img": i["images"].get("featured") or i["images"]["icon"], "price": None, "out": None, "in": None})
            if not e.get("bundle") and len(e.get("brItems") or []) <= 2 and (rec["price"] is None or e["finalPrice"] < rec["price"]):
                rec["price"], rec["out"], rec["in"] = e["finalPrice"], e["outDate"][:10], e["inDate"][:10]

    # introduction season for each outfit
    hist = {}
    for oid in outfits:
        try:
            c = json.loads(get(f"{API}/v2/cosmetics/br/{oid}"))["data"]
            hist[oid] = {"name": c["name"], "introduction": (c.get("introduction") or {}).get("text")}
        except Exception as ex:
            hist[oid] = {"name": outfits[oid]["name"], "error": str(ex)}
    json.dump(hist, open(os.path.join(out, "history.json"), "w"), indent=1)

    deal = max(bundles, key=lambda b: (b["regular"] - b["final"], b["regular"]))
    ranked = sorted((season_key(hist[o].get("introduction")), outfits[o]["name"], o) for o in outfits if outfits[o]["price"])
    oldest = ranked[0][0]
    og = [o for k, _, o in ranked if k == oldest][:2]
    last = [o for o, r in outfits.items() if r["out"] == day and r["price"]]
    last.sort(key=lambda o: (-outfits[o]["price"], outfits[o]["name"]))


    d0 = datetime.date.fromisoformat(day)
    deal_out = datetime.date.fromisoformat(deal["out"])
    og_recs = [outfits[o] for o in og]
    ch, se = oldest
    last_recs = [outfits[o] for o in last]
    n_words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"]

    # short on purpose: dates and prices also sit on screen, the voice only says what matters
    # the opening line is fixed by the owner: "This is today's Item Shop for <date>", straight into the hook
    phrases = [(f"This is today's Item Shop for {words_date(d0)}.", 0.08), ("Three things before you spend a single V-Buck!", 0.22),
               (f"The {deal['name']}:", 0.06), (f"{deal['final']:,} V-Bucks, instead of {deal['regular']:,}.", 0.26)]
    if len(og_recs) == 2:
        phrases += [(f"{og_recs[0]['name']} and {og_recs[1]['name']} are in the shop.", 0.06), (f"Both from Chapter {ch}, Season {se}.", 0.26)]
    else:
        phrases += [(f"{og_recs[0]['name']} is in the shop.", 0.06), (f"It's from Chapter {ch}, Season {se}.", 0.26)]
    if last_recs:
        num = lambda n: n_words[n] if n < len(n_words) else str(n)
        # name the biggest same-rarity group so the line says something concrete
        from collections import Counter
        top, k = Counter(r["rarity"] for r in last_recs).most_common(1)[0]
        # "last day" rather than "tonight": the video posts right after the reset, a day before they go
        if k == len(last_recs):
            line = f"And {num(k)} {top} skin{'s are' if k > 1 else ' is'} on {'their' if k > 1 else 'its'} last day."
        else:
            line = f"And {num(len(last_recs))} skins are on their last day, {num(k)} of them {top}."
        phrases += [(line, 0.3)]
        last.sort(key=lambda o: (outfits[o]["rarity"] != top, -outfits[o]["price"], outfits[o]["name"]))
        last_recs = [outfits[o] for o in last]
    phrases += [("Buying anything today?", 0.06), ("Use code BAD in the Item Shop. It really helps the channel.", 0.25), ("Thank you for watching! Follow for more daily content.", 0.3)]

    need = set(deal["outfits"][:4]) | set(og) | set(last[:6])
    for oid in need:
        p = os.path.join(out, "img", oid + ".png")
        if not os.path.exists(p):
            open(p, "wb").write(get(outfits[oid]["img"]))
    open(os.path.join(out, "img", "vbuck.png"), "wb").write(get(shop["vbuckIcon"]))

    voice = json.load(open(os.path.join(HERE, "..", "voice.json")))
    json.dump({**{k: voice[k] for k in ("voice", "speed", "lang", "lead", "mode", "slack") if k in voice}, "phrases": [{"text": t, "pause": p} for t, p in phrases]},
              open(os.path.join(out, "vo.json"), "w"), indent=1)

    from zoneinfo import ZoneInfo
    reset = (datetime.datetime.combine(d0 + datetime.timedelta(days=1), datetime.time(0), datetime.timezone.utc)).astimezone(ZoneInfo("America/Chicago"))
    plan = {"date": day, "dateLabel": d0.strftime("%b %-d").upper(), "resetLabel": reset.strftime("%-I %p CT"), "dealOutLabel": deal_out.strftime("%b %-d").upper(), "deal": {**deal, "outfits": [outfits[o] for o in deal["outfits"][:4]]},
            "og": {"chapter": ch, "season": se, "outfits": og_recs}, "last": {"count": len(last_recs), "outfits": last_recs[:6]},
            "phrases": [t for t, _ in phrases]}
    json.dump(plan, open(os.path.join(out, "plan.json"), "w"), indent=1)
    open(os.path.join(out, "plan.js"), "w").write("window.SHOP=" + json.dumps(plan) + ";\n")

    now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    json.dump({"via": "fortnite-api.com (mirror of Epic's in-game shop)", "files": [
        {"file": "shop.json", "source": f"Item Shop for {day}", "url": f"{API}/v2/shop", "fetched_utc": now},
        {"file": "history.json", "source": "Cosmetic introduction seasons", "url": f"{API}/v2/cosmetics/br/<id>", "fetched_utc": now}]},
        open(os.path.join(out, "manifest.json"), "w"), indent=1)
    print(json.dumps({"date": day, "deal": [deal["name"], deal["final"], deal["regular"], deal["out"]], "og": [r["name"] for r in og_recs], "season": oldest,
                      "last": [r["name"] for r in last_recs]}, indent=1))
    print("\n".join(t for t, _ in phrases))


main()
