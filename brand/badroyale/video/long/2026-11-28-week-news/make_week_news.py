"""Generate the "Fortnite This Week" long video (Nov 22 - Nov 28) from the saved daily sources.

    python3 make_week_news.py      (writes long.json, vo.json, post.json, sources/, img/ next to this file)

News: the v43.11 update (build change on Nov 26), the Golden Week + Community Day tile (added Nov 24) and the
Adventure Awaits! tile (gone after Nov 23), quoted word for word. Shop: the collab bundles that went live this week,
with prices, from the Item Shop archive (shop/archive/<day>.json, one snapshot per reset; "in" = Epic's in-date).
All folded into sources/week-news.json. Outfit art from fortnite-api.com cosmetics search (pictures only, no facts).
"""
import glob
import json
import os
import shutil
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SLUG = os.path.basename(HERE)
BR = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC = os.path.join(BR, "sources")
HIST = os.path.join(SRC, "history")
FIRST, LAST = "2026-11-22", "2026-11-28"
PICKS = ["Overwatch Bundle", "Noodle & 2D Bundle", "Crash Bandicoot & Spyro the Dragon Bundle",
         "Pirates of the Caribbean Bundle", "Jack Sparrow Bundle", "Phineas and Ferb Bundle",
         "One-Punch Man Bundle",
         "Persona 5 Royal Bundle", "Amazing Digital Circus Bundle",
         "KizunaAI Bundle",
         "Puss in Boots Bundle", "Addison Rae Bundle", "Becky Lynch & Bianca Belair Bundle", "John Cena Bundle",
         "Solo Leveling:ARISE Bundle", "Daft Punk Bundle", "Doki Doki Literature Club! Bundle"]
SAY = {"Joker (P5R)": "Joker", "Panther (P5R)": "Panther", "Death (Puss in Boots)": "Death", "GM08": "G M zero eight", "TB3": "T B three", " & ": " and ", "2D": "Two D", "KizunaAI": "Kizuna A I", "11/28": "November 28th", "12/5": "December 5th", "2X": "double",
       "Solo Leveling:ARISE": "Solo Leveling Arise", "Doki Doki Literature Club!": "Doki Doki Literature Club", "Spyro the Dragon": "Spyro the Dragon",
       "$.$.": "S S"}

# ---- week file
tiles, builds, places = {}, {}, {}
for f in sorted(glob.glob(os.path.join(HIST, "*-news.json"))):
    d = os.path.basename(f)[:10]
    if FIRST <= d <= LAST:
        for t in json.load(open(f))["data"]["br"]["motds"]:
            tiles.setdefault(t["title"], {"title": t["title"], "body": t["body"], "days": []})["days"].append(d)
for f in sorted(glob.glob(os.path.join(HIST, "*-build.json"))):
    d = os.path.basename(f)[:10]
    if FIRST <= d <= LAST:
        builds[d] = json.load(open(f))["data"]["build"]
for f in sorted(glob.glob(os.path.join(HIST, "*-map.json"))):
    d = os.path.basename(f)[:10]
    if FIRST <= d <= LAST:
        places[d] = sorted(p["name"] for p in json.load(open(f))["data"]["pois"])
days = sorted(builds)
B, shop_days = {}, {}
for f in sorted(glob.glob(os.path.join(BR, "shop", "archive", "*.json"))):
    a = json.load(open(f))
    if FIRST <= a["date"] <= LAST:
        for e in a["entries"]:
            if e.get("bundle"):
                B.setdefault(e["bundle"], dict(e, shop_days=[]))["shop_days"].append(a["date"])
bundles = {}
for n in PICKS:
    e = B[n]
    assert FIRST <= e["in"] <= LAST, (n, e["in"])
    bundles[n] = {"in": e["in"], "out": e["out"], "finalPrice": e["final"], "regularPrice": e["regular"], "items": e["items"],
                  "in_todays_shop": LAST in e["shop_days"]}
week = {"note": f"Daily snapshots {FIRST}..{LAST}: Epic's Battle Royale news tiles, build and map places (sources/history/), and the Item Shop "
                "bundles from the saved reset snapshots (shop/archive/). in/out = Epic's in-date and out-date for the listing.",
        "tiles": list(tiles.values()), "builds": builds, "place_counts": {d: len(v) for d, v in places.items()}, "bundles": bundles}
os.makedirs(os.path.join(HERE, "sources"), exist_ok=True)
json.dump(week, open(os.path.join(HERE, "sources", "week-news.json"), "w"), indent=1, ensure_ascii=False)
man = json.load(open(os.path.join(SRC, "manifest.json")))
fetched = next(f["fetched_utc"] for f in man["files"] if f["file"] == "news.json")
for f in ("news.json", "build.json", "map.json"):
    shutil.copy(os.path.join(SRC, f), os.path.join(HERE, "sources", f))
files = [f for f in man["files"] if f["file"] in ("news.json", "build.json", "map.json")]
files.append({"file": "week-news.json", "source": f"News tiles, builds, map places and Item Shop bundles per day {FIRST}..{LAST}",
              "url": "https://fortnite-api.com/v2/news", "fetched_utc": fetched,
              "note": "fetched_utc is today's snapshot; older days come from the saved daily snapshots (sources/history/, shop/archive/)"})
json.dump({"via": "fortnite-api.com (mirror of Epic's in-game news, build, map and Item Shop)", "files": files},
          open(os.path.join(HERE, "sources", "manifest.json"), "w"), indent=1)

# ---- helpers
os.makedirs(os.path.join(HERE, "img"), exist_ok=True)
phrases, segs, claims = [], [], []
IMG = {}


def ph(text, pause=0.25):
    d = {"text": text, "pause": round(pause + 0.1, 2)}
    s = text
    for k, v in SAY.items():
        s = s.replace(k, v)
    if s != text:
        d["say"] = s
    phrases.append(d)


def day(d):
    n = int(d[-2:])
    m = {"11": "November", "12": "December"}[d[5:7]]
    return f"{m} {n}{'th' if 11 <= n <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"


def art(name):
    """featured (else icon) art of an outfit, looked up by its exact name; returns (rel path, local path, id)"""
    if name in IMG:
        return IMG[name]
    q = urllib.parse.quote(name)
    r = json.load(urllib.request.urlopen(f"https://fortnite-api.com/v2/cosmetics/br/search?name={q}&type=outfit", timeout=60))["data"]
    url = r["images"].get("featured") or r["images"]["icon"]
    p = os.path.join(HERE, "img", r["id"].lower() + ".png")
    if not os.path.exists(p):
        open(p, "wb").write(urllib.request.urlopen(url, timeout=60).read())
        from PIL import Image
        Image.open(p).convert("RGBA").save(p)
    IMG[name] = (f"../../badroyale/video/long/{SLUG}/img/{r['id'].lower()}.png", f"img/{r['id'].lower()}.png")
    return IMG[name]


def outfits(name, k=3):
    return [i[0] for i in bundles[name]["items"] if i[1] == "outfit"][:k]


def names(o):
    return o[0] if len(o) == 1 else ", ".join(o[:-1]) + " and " + o[-1]


def quote(chapter, title, lines, intro):
    body = tiles[title]["body"]
    for ln in lines:
        assert ln.rstrip(".,") in body, (title, ln)
    p0 = len(phrases)
    seg = {"type": "quote", "p": p0, "kicker": "IN-GAME NEWS", "title": title, "lines": [{"p": p0 + 1 + i, "text": ln} for i, ln in enumerate(lines)]}
    if chapter:
        seg["chapter"] = chapter
    segs.append(seg)
    ph(intro, 0.2)
    for ln in lines:
        ph(ln, 0.2)
    claims.append({"text": f"{title} tile, live {tiles[title]['days'][0]}..{tiles[title]['days'][-1]}", "source": "week-news.json",
                   "match": [title] + [ln.rstrip(".,!") for ln in lines]})


def show(name, chapter=None, label=None):
    b = bundles[name]
    o = outfits(name)
    s = {"type": "items", "p": len(phrases), "title": label or name.replace(" Bundle", ""), "items": [{"img": art(i)[0], "name": i, "rarity": "epic", "price": None} for i in o]}
    if chapter:
        s["chapter"] = chapter
    segs.append(s)
    claims.append({"text": f"{name}: in {b['in']}, {b['finalPrice']} (listed {b['regularPrice']}), {len(b['items'])} items, out {b['out']}, in today's shop {b['in_todays_shop']}; outfits {o}",
                   "source": "week-news.json", "match": [name, f'"finalPrice": {b["finalPrice"]}', f'"regularPrice": {b["regularPrice"]}', b["out"]] + o})
    return b, o


# ---- facts checked up front
v_old = builds[FIRST].split("Release-")[1].split("-")[0]
v_new = builds[LAST].split("Release-")[1].split("-")[0]
upd = min(d for d, b in builds.items() if v_new in b)
assert v_old != v_new and upd == "2026-11-26", (v_old, v_new, upd)
assert len({tuple(p) for p in places.values()}) == 1
gw, aa = tiles["Golden Week + Community Day"], tiles["Adventure Awaits!"]
assert gw["days"][0] == "2026-11-24" and aa["days"][-1] == "2026-11-23"
for n in PICKS:
    assert len(outfits(n)) >= 1, n

# ---- intro
segs.append({"type": "title", "p": 0, "kicker": "FORTNITE THIS WEEK", "lines": [f"v{v_new}, Golden Week", f"and {len(PICKS)} collabs"]})
ph(f"Fortnite got a new update this week, Golden Week starts today, and the Item Shop dropped {len(PICKS)} collabs, from Overwatch and One-Punch Man to Daft Punk and Solo Leveling.")
ph(f"This is everything that happened from {day(FIRST)} to {day(LAST)}, straight from Epic's in-game news and Item Shop.", 0.25)
ph("Let's get into it!", 0.4)
claims.append({"text": "Hook collabs are all picked bundles that went live this week", "source": "week-news.json",
               "match": ["Overwatch Bundle", "One-Punch Man Bundle", "Daft Punk Bundle", "Solo Leveling:ARISE Bundle"]})

# ---- the update
segs.append({"type": "stat", "p": len(phrases), "chapter": "The update", "big": f"v{v_new}", "label": f"live from {day(upd).replace('November', 'Nov')}"})
ph(f"First, the game. On {day(upd)}, Fortnite moved from version {v_old} to version {v_new}.", 0.2)
ph(f"The official map didn't change with it: still the same {len(places[LAST])} places.", 0.3)
claims.append({"text": f"Build {v_old} until {upd}, then {v_new}; {len(places[LAST])} places unchanged", "source": "week-news.json",
               "match": [f"Release-{v_old}", f"Release-{v_new}", f'"{LAST}": {len(places[LAST])}']})

# ---- news
quote("The news", "Golden Week + Community Day",
      ["Starting 11/28, refreshed loot meets unvaulted Treasure during Golden Week,",
       "where each Captain’s golden goods are back in Chests alongside 2X Sprite Dust and XP!",
       "Then, hop aboard for Community Day on 12/5."],
      f"The big news tile this week showed up on {day(gw['days'][0])}: Golden Week and Community Day.")
ph("Starting the 28th means Golden Week starts today.", 0.3)
quote(None, "Adventure Awaits!", [aa["body"].split(" on this")[0] + ","],
      f"And one tile left the news. Adventure Awaits! was last up on {day(aa['days'][-1])}.")
ph("That one was about the island itself, and it's gone now.", 0.3)
ph(f"The other {len([t for t in tiles.values() if t['days'] == days])} tiles stayed up all week: the Devil Fruits, the TWINDRILL DIVA Music Pass, the Straw Hats outfits and the Multi-Punches Flex.", 0.3)
claims.append({"text": "Four tiles up every day of the week", "source": "week-news.json",
               "match": ["Devil Fruits Across the Island", "TWINDRILL DIVA Music Pass", "Monkey D. Luffy, Nami, and Usopp Outfits", "Multi-Punches Flex"]})
assert len([t for t in tiles.values() if t["days"] == days]) == 4

# ---- collabs, day by day
segs.append({"type": "stat", "p": len(phrases), "chapter": "The shop", "big": str(len(PICKS)), "label": "collab bundles this week"})
ph(f"Now the Item Shop. {len(PICKS)} collab bundles went live this week. Here they are, day by day, with every price.", 0.3)
claims.append({"text": f"{len(PICKS)} picked collab bundles with an in-date {FIRST}..{LAST}", "source": "week-news.json", "match": PICKS})
seen_day = set()
code_done = False
for n in sorted(PICKS, key=lambda x: (bundles[x]["in"], PICKS.index(x))):
    d = bundles[n]["in"]
    b, o = show(n, chapter=day(d) if d not in seen_day else None)
    lead = f"On {day(d)}," if d not in seen_day else "Same day,"
    seen_day.add(d)
    short = n.replace(" Bundle", "")
    still = f"still in the shop until {day(b['out'])}" if b["out"] > LAST else ("in the shop until today" if b["out"] == LAST else f"gone after {day(b['out'])}")
    ph(f"{lead} {short}, with {names(o)}.", 0.15)
    ph(f"{b['finalPrice']:,} V-Bucks, listed at {b['regularPrice']:,}. It's {still}." if b["out"] >= LAST else
       f"{b['finalPrice']:,} V-Bucks, listed at {b['regularPrice']:,}. It was in the shop until {day(b['out'])}.", 0.25)
    if not code_done and d >= "2026-11-24":
        segs.append({"type": "code", "p": len(phrases)})
        ph("Quick one: if you're grabbing anything from the Item Shop this week, use code BAD. It really helps the channel.", 0.4)
        code_done = True

# ---- by the numbers
segs.append({"type": "title", "p": len(phrases), "chapter": "By the numbers", "kicker": "BY THE NUMBERS", "lines": ["The week's collabs", "by the numbers"]})
ph("A few numbers from all of that.", 0.25)
top = max(PICKS, key=lambda n: bundles[n]["finalPrice"])
tops = [n for n in PICKS if bundles[n]["finalPrice"] == bundles[top]["finalPrice"]]
low = min(PICKS, key=lambda n: bundles[n]["finalPrice"])
lows = [n for n in PICKS if bundles[n]["finalPrice"] == bundles[low]["finalPrice"]]
g = max(bundles[n]["regularPrice"] - bundles[n]["finalPrice"] for n in PICKS)
gaps = [n for n in PICKS if bundles[n]["regularPrice"] - bundles[n]["finalPrice"] == g]
most = max(len(bundles[n]["items"]) for n in PICKS)
mostn = [n for n in PICKS if len(bundles[n]["items"]) == most]
j = lambda ns: " and the ".join(ns)
ph(f"The priciest: the {j(tops)}, at {bundles[top]['finalPrice']:,} V-Bucks.", 0.2)
ph(f"The lowest: the {j(lows)}, at {bundles[low]['finalPrice']:,}.", 0.2)
ph(f"The biggest gap between the listed price and the real price: the {j(gaps)}, {g:,} V-Bucks apart.", 0.2)
ph(f"And the most items in one bundle: {most}, in the {j(mostn)}.", 0.3)
claims.append({"text": f"Priciest {tops}, lowest {lows}, biggest gap {gaps} ({g}), most items {most} in {mostn}", "source": "week-news.json",
               "match": tops + lows + gaps + mostn})

# ---- recap
still_now = [n for n in PICKS if bundles[n]["out"] > LAST]
segs.append({"type": "title", "p": len(phrases), "chapter": "Recap", "kicker": "QUICK RECAP", "lines": [f"v{v_new} · Golden Week", f"{len(PICKS)} collabs"]})
ph(f"Quick recap. A new version, {v_new}. Golden Week from today, and Community Day on December 5th. And {len(PICKS)} collabs in the shop.", 0.2)
ph("Still in the shop after today: " + ", ".join(n.replace(" Bundle", "") for n in still_now[:-1]) + f" and {still_now[-1].replace(' Bundle', '')}.", 0.25)
claims.append({"text": f"Out after {LAST}: {still_now}", "source": "week-news.json", "match": still_now})
ph("Which collab was your favorite this week? Tell me in the comments!", 0.4)
segs.append({"type": "code", "p": len(phrases)})
ph("Use code BAD in the Item Shop. It really helps the channel.", 0.25)
ph("Thank you for watching! Follow for more daily content.", 0.6)

json.dump({"title": f"Fortnite This Week: v{v_new}, Golden Week and {len(PICKS)} Collabs", "map": "blank",
           "caption": "#EpicPartner Everything that happened in Fortnite this week. Use code BAD in the Item Shop.\n#Fortnite #FortniteNews",
           "claims": claims, "segments": segs}, open(os.path.join(HERE, "long.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": phrases}, open(os.path.join(HERE, "vo.json"), "w"), indent=1, ensure_ascii=False)
yt = f"Fortnite This Week 🏆 v{v_new}, Golden Week, Overwatch, One-Punch Man & Daft Punk (Nov 22 - Nov 28)"
assert len(yt) <= 100, len(yt)
json.dump({"youtubeTitle": yt,
           "youtube": f"#EpicPartner Everything that happened in Fortnite this week 🏆 the v{v_new} update, Golden Week (starting today) and Community Day on 12/5, "
                      f"and {len(PICKS)} collabs in the Item Shop: " + ", ".join(n.replace(' Bundle', '') for n in PICKS) +
                      ", with every price and which ones are still in the shop. Straight from Epic's in-game news and Item Shop.\n\n"
                      "Which collab was your favorite? 👇\n\nUse code BAD in the Item Shop 💛\n\n{chapters}\n\n#Fortnite #FortniteNews #FortniteItemShop",
           "tags": ["fortnite", "fortnite news", "fortnite this week", "fortnite golden week", "fortnite collabs", "fortnite item shop", "fortnite overwatch", "fortnite one punch man"],
           "thumb": {"lines": ["THIS WEEK"], "big": "COLLABS!", "chip": "NOV 22 - NOV 28", "chars": [art("Saitama")[1], art("Sung Jinwoo")[1]]}},
          open(os.path.join(HERE, "post.json"), "w"), indent=1, ensure_ascii=False)
print(len(phrases), "phrases,", len(segs), "segments,", len(claims), "claims,", sum(len(p["text"].split()) for p in phrases), "words")
