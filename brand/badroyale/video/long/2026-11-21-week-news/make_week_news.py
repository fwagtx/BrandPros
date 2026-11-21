"""Generate the "Fortnite This Week" long video (Nov 15 - Nov 21) from the saved daily sources.

    python3 make_week_news.py      (writes long.json, vo.json, post.json, sources/, img/ next to this file)

A quiet week in the news (no update, no map change, the same tiles every day), so the story is the collab bundles
that landed in the Item Shop. Facts: sources/history/<day>-news|build|map.json and shop/<day>/shop.json, folded
into sources/week-news.json; today's news.json/build.json/map.json. News lines are quoted word for word.
"""
import glob
import json
import os
import shutil
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SLUG = os.path.basename(HERE)
BR = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC = os.path.join(BR, "sources")
HIST = os.path.join(SRC, "history")
FIRST, LAST = "2026-11-15", "2026-11-21"
PICKS = [("2026-11-16", "Hatsune Miku Bundle"), ("2026-11-16", "Gotham City Summer Bundle"), ("2026-11-16", "Shohei Ohtani Bundle"),
         ("2026-11-17", "Madison Beer Bundle"), ("2026-11-17", "Kaiju No. 8 Bundle"),
         ("2026-11-18", "Naruto & Kakashi Bundle"), ("2026-11-18", "Sasuke & Sakura Bundle"), ("2026-11-18", "Gaara & Hinata Bundle"), ("2026-11-18", "Itachi & Orochimaru Bundle"),
         ("2026-11-19", "Regular Show Bundle"), ("2026-11-19", "CouRage Bundle"),
         ("2026-11-20", "Kim Kardashian Bundle"), ("2026-11-20", "Cowboy Bebop Bundle"), ("2026-11-20", "The Kid LAROI Bundle"),
         ("2026-11-21", "Ice Spice Bundle")]

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
seen, first_day = set(), {}
SHOPS = {}
for f in sorted(glob.glob(os.path.join(BR, "shop", "2026-1*-*", "shop.json"))):
    d = f.split(os.sep)[-2]
    ents = json.load(open(f))["data"]["entries"]
    if FIRST <= d <= LAST:
        SHOPS[d] = ents
    for e in ents:
        b = (e.get("bundle") or {}).get("name")
        if b and b not in seen:
            seen.add(b)
            first_day[b] = d
bundles = {}
for d, name in PICKS:
    assert first_day.get(name) == d, (name, first_day.get(name), d)
    e = next(e for e in SHOPS[d] if (e.get("bundle") or {}).get("name") == name)
    in_days = [x for x in sorted(SHOPS) if any((g.get("bundle") or {}).get("name") == name for g in SHOPS[x])]
    bundles[name] = {"first_shop_day": d, "days_in_shop": in_days, "finalPrice": e["finalPrice"], "regularPrice": e["regularPrice"],
                     "outDate": e["outDate"][:10], "items": [{"name": i["name"], "type": i["type"]["value"], "id": i["id"],
                                                            "img": i["images"].get("featured") or i["images"]["icon"]} for i in e["brItems"]]}
n_new = sum(1 for b, d in first_day.items() if FIRST <= d <= LAST)
week = {"note": f"Daily snapshots {FIRST}..{LAST}: Epic's Battle Royale news tiles, build and map places (sources/history/), and the bundles in each day's Item Shop (shop/<day>/shop.json). first_shop_day = first day in our shop archive (since 2026-10-28).",
        "tiles": list(tiles.values()), "builds": builds, "place_counts": {d: len(v) for d, v in places.items()},
        "bundles_first_seen_this_week": n_new, "bundles": bundles}
os.makedirs(os.path.join(HERE, "sources"), exist_ok=True)
json.dump(week, open(os.path.join(HERE, "sources", "week-news.json"), "w"), indent=1, ensure_ascii=False)
man = json.load(open(os.path.join(SRC, "manifest.json")))
fetched = next(f["fetched_utc"] for f in man["files"] if f["file"] == "news.json")
for f in ("news.json", "build.json", "map.json"):
    shutil.copy(os.path.join(SRC, f), os.path.join(HERE, "sources", f))
files = [f for f in man["files"] if f["file"] in ("news.json", "build.json", "map.json")]
files.append({"file": "week-news.json", "source": f"News tiles, builds, map places and Item Shop bundles per day {FIRST}..{LAST}",
              "url": "https://fortnite-api.com/v2/news", "fetched_utc": fetched,
              "note": "fetched_utc is today's snapshot; older days come from the saved daily snapshots (sources/history/, shop/<day>/shop.json)"})
json.dump({"via": "fortnite-api.com (mirror of Epic's in-game news, build, map and Item Shop)", "files": files},
          open(os.path.join(HERE, "sources", "manifest.json"), "w"), indent=1)

# ---- helpers
os.makedirs(os.path.join(HERE, "img"), exist_ok=True)
phrases, segs, claims = [], [], []
SAY = {"No. 8": "Number 8", "CouRage": "Courage", "LAROI": "Laroi"}


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
    return f"November {n}{'st' if n in (1, 21, 31) else 'nd' if n in (2, 22) else 'rd' if n in (3, 23) else 'th'}"


def img(it):
    p = os.path.join(HERE, "img", it["id"] + ".png")
    if not os.path.exists(p):
        urllib.request.urlretrieve(it["img"], p)
    return f"../../badroyale/video/long/{SLUG}/img/{it['id']}.png"


def outfits(name, k=3):
    return [i for i in bundles[name]["items"] if i["type"] == "outfit"][:k]


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
    s = {"type": "items", "p": len(phrases), "title": label or name, "items": [{"img": img(i), "name": i["name"], "rarity": "epic", "price": None} for i in o]}
    if chapter:
        s["chapter"] = chapter
    segs.append(s)
    still = LAST in b["days_in_shop"]
    out = day(b["outDate"])
    claims.append({"text": f"{name}: first {b['first_shop_day']}, {b['finalPrice']} (listed {b['regularPrice']}), {len(b['items'])} items, outDate {b['outDate']}, in today's shop {still}; outfits {[i['name'] for i in o]}",
                   "source": "week-news.json", "match": [name, f'"finalPrice": {b["finalPrice"]}', f'"regularPrice": {b["regularPrice"]}', b["outDate"]] + [i["name"] for i in o]})
    return b, o, still, out


def names(o):
    n = [i["name"] for i in o]
    return n[0] if len(n) == 1 else ", ".join(n[:-1]) + " and " + n[-1]


# ---- intro
v = builds[LAST].split("Release-")[1].split("-")[0]
assert len({b for b in builds.values()}) == 1 and len({tuple(p) for p in places.values()}) == 1
same_tiles = all(t["days"] == days for t in tiles.values())
assert same_tiles
segs.append({"type": "title", "p": 0, "kicker": "FORTNITE THIS WEEK", "lines": ["A week of collabs", "Nov 15 - Nov 21"]})
ph("No new update this week, but the Item Shop went all out: Hatsune Miku, Gotham City Summer, Shohei Ohtani, Naruto, Cowboy Bebop, Regular Show, Ice Spice and more.")
ph(f"This is everything that happened in Fortnite from {day(FIRST)} to {day(LAST)}, straight from Epic's in-game news and Item Shop.", 0.25)
ph("Let's get into it!", 0.4)
claims.append({"text": "Collab names in the hook are all bundles that first showed up this week", "source": "week-news.json",
               "match": ["Hatsune Miku Bundle", "Gotham City Summer Bundle", "Shohei Ohtani Bundle", "Naruto & Kakashi Bundle", "Cowboy Bebop Bundle", "Regular Show Bundle", "Ice Spice Bundle"]})

# ---- the news
segs.append({"type": "stat", "p": len(phrases), "chapter": "The news", "big": f"v{v}", "label": f"all week, {len(places[LAST])} places on the map"})
ph(f"First, the game itself. It stayed on version {v} all week, and the official map didn't change: still {len(places[LAST])} places.", 0.25)
ph(f"The in-game news didn't change either. The same {len(tiles)} tiles were up every single day.", 0.3)
claims.append({"text": f"Build {v} every day {FIRST}..{LAST}; {len(places[LAST])} places unchanged; same {len(tiles)} news tiles every day", "source": "week-news.json",
               "match": [f"Release-{v}", f'"{LAST}": {len(places[LAST])}'] + list(tiles)})
quote(None, "Devil Fruits Across the Island",
      ["Rare Devil Fruits have dropped in across the map!", "Eat the Gum-Gum Fruit to stretch your skills as Luffy,", "or the Flame-Flame Fruit to come in hot as Ace...", "just stay away from water."],
      "The Devil Fruits are still out there.")
quote(None, "TWINDRILL DIVA Music Pass", ["Virtual Diva Kasane Teto takes the stage!", "Dive into Festival to start unlocking rewards!"],
      "The TWINDRILL DIVA Music Pass is still on in Festival.")
quote(None, "Monkey D. Luffy, Nami, and Usopp Outfits", ["When adventure calls, the Straw Hats answer!"],
      "The Straw Hats are still in the news too.")
quote(None, "Multi-Punches Flex", ["GUM-GUM GATLING!"], "And this emote tile is still just three words.")

# ---- the bundles, day by day
segs.append({"type": "stat", "p": len(phrases), "chapter": "The shop", "big": str(len(PICKS)), "label": "collab bundles in six days"})
ph(f"Now the Item Shop. We check it every day, and from {day('2026-11-16')} to today, {len(PICKS)} collab bundles showed up that we hadn't seen in it before.", 0.25)
ph("Here they are, day by day, with every price.", 0.3)
claims.append({"text": f"{len(PICKS)} picked collab bundles, each first seen in our archive on its day", "source": "week-news.json", "match": [n for _, n in PICKS]})

chap = {}
for d, name in PICKS:
    b, o, still, out = show(name, chapter=day(d) if d not in chap else None)
    lead = f"On {day(d)}," if d not in chap else "Same day,"
    chap[d] = 1
    tail = ("Today is its last day." if b["outDate"] == LAST else f"It's still in today's shop, until {out}.") if still else f"It was in the shop until {out}."
    if name.startswith(("Naruto", "Sasuke", "Gaara", "Itachi")):
        if name == "Naruto & Kakashi Bundle":
            ph(f"{day(d)} was Naruto day. Four bundles at once.", 0.2)
        ph(f"{name.replace(' Bundle', '')}: {b['finalPrice']:,} V-Bucks, listed at {b['regularPrice']:,}, with {len(b['items'])} items.", 0.2)
        if name == "Itachi & Orochimaru Bundle":
            ph(f"All four were in the shop until {out}.", 0.3)
        continue
    ph(f"{lead} the {name.replace('The Kid LAROI Bundle', 'bundle for The Kid LAROI')}, with {names(o)}.", 0.2)
    ph(f"{b['finalPrice']:,} V-Bucks, listed at {b['regularPrice']:,}, with {len(b['items'])} items. {tail}", 0.3)
    if name == "Kaiju No. 8 Bundle":
        segs.append({"type": "code", "p": len(phrases)})
        ph("Quick one: if you're grabbing anything from the Item Shop this week, use code BAD. It really helps the channel.", 0.4)

# ---- by the numbers
segs.append({"type": "title", "p": len(phrases), "chapter": "By the numbers", "kicker": "BY THE NUMBERS", "lines": ["The week's collabs", "by the numbers"]})
ph("A few numbers from all of that.", 0.25)
top = max(PICKS, key=lambda t: bundles[t[1]]["finalPrice"])[1]
gap = max(PICKS, key=lambda t: bundles[t[1]]["regularPrice"] - bundles[t[1]]["finalPrice"])[1]
most = max(bundles[n]["items"].__len__() for _, n in PICKS)
mostn = [n for _, n in PICKS if len(bundles[n]["items"]) == most]
low = min(PICKS, key=lambda t: bundles[t[1]]["finalPrice"])[1]
ph(f"The priciest was the {top}, at {bundles[top]['finalPrice']:,} V-Bucks.", 0.2)
ph(f"The lowest was {low.replace(' Bundle', '')}, at {bundles[low]['finalPrice']:,}.", 0.2)
g = bundles[gap]["regularPrice"] - bundles[gap]["finalPrice"]
gaps = [n for _, n in PICKS if bundles[n]["regularPrice"] - bundles[n]["finalPrice"] == g]
if len(gaps) == 1:
    ph(f"The biggest gap between the listed price and the real price was the {gap}: {bundles[gap]['regularPrice']:,} listed, {bundles[gap]['finalPrice']:,} to buy. That's {g:,} V-Bucks apart.", 0.25)
else:
    ph(f"The biggest gap between the listed price and the real price was a tie, {g:,} V-Bucks apart: the " + " and the ".join(gaps) + ".", 0.25)
gap = gaps
ph(f"And the most items in one bundle: {most}, in the " + " and the ".join(mostn) + ".", 0.3)
claims.append({"text": f"Priciest {top}, lowest {low}, biggest listed-vs-price gap {gap} ({g}), most items {most} in {mostn}", "source": "week-news.json",
               "match": [top, low] + gap + mostn})

# ---- recap
segs.append({"type": "title", "p": len(phrases), "chapter": "Recap", "kicker": "QUICK RECAP", "lines": [f"v{v} · same map, same news", "a week of collabs"]})
still_now = [n for _, n in PICKS if LAST in bundles[n]["days_in_shop"]]
ph(f"Quick recap. Same version, same map, same news tiles, and a shop full of collabs.", 0.2)
ph("Still in today's shop: " + ", ".join(n.replace(" Bundle", "") for n in still_now[:-1]) + f" and {still_now[-1].replace(' Bundle', '')}.", 0.25)
claims.append({"text": f"Still in the {LAST} shop: {still_now}", "source": "week-news.json", "match": still_now})
ph("Which collab was your favorite this week? Tell me in the comments!", 0.4)
segs.append({"type": "code", "p": len(phrases)})
ph("Use code BAD in the Item Shop. It really helps the channel.", 0.25)
ph("Thank you for watching! Follow for more daily content.", 0.6)

json.dump({"title": "Fortnite This Week: A Week of Collabs", "map": "blank",
           "caption": "#EpicPartner Everything that happened in Fortnite this week. Use code BAD in the Item Shop.\n#Fortnite #FortniteNews",
           "claims": claims, "segments": segs}, open(os.path.join(HERE, "long.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": phrases}, open(os.path.join(HERE, "vo.json"), "w"), indent=1, ensure_ascii=False)
mk = outfits("Hatsune Miku Bundle", 1)[0]
sp = next(i for i in bundles["Cowboy Bebop Bundle"]["items"] if i["name"] == "Spike Spiegel")
img(mk), img(sp)
json.dump({"youtubeTitle": "Fortnite This Week 🎤 Hatsune Miku, Naruto, Cowboy Bebop, Kaiju No. 8 & More (Nov 15 - Nov 21)",
           "youtube": "#EpicPartner Everything that happened in Fortnite this week 🎤 no new update and the same map, but a week packed with collabs in the Item Shop: "
                      "Hatsune Miku, Gotham City Summer, Shohei Ohtani, Madison Beer, Kaiju No. 8, four Naruto bundles, Regular Show, CouRage, Kim Kardashian, "
                      "Cowboy Bebop, The Kid LAROI and Ice Spice, with every price and which ones are still in the shop. Straight from Epic's in-game news and Item Shop.\n\n"
                      "Which collab was your favorite? 👇\n\nUse code BAD in the Item Shop 💛\n\n{chapters}\n\n#Fortnite #FortniteNews #FortniteItemShop",
           "tags": ["fortnite", "fortnite news", "fortnite this week", "fortnite collabs", "fortnite item shop", "fortnite naruto", "fortnite hatsune miku", "fortnite cowboy bebop"],
           "thumb": {"lines": ["THIS WEEK"], "big": "COLLABS!", "chip": "NOV 15 - NOV 21", "chars": [f"img/{mk['id']}.png", f"img/{sp['id']}.png"]}},
          open(os.path.join(HERE, "post.json"), "w"), indent=1, ensure_ascii=False)
print(len(phrases), "phrases,", len(segs), "segments,", len(claims), "claims,", sum(len(p["text"].split()) for p in phrases), "words")
