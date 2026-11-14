"""Generate the "Fortnite This Week" long video (Nov 8 - Nov 14) from the saved daily sources.

    python3 make_week_news.py      (run from anywhere; writes long.json, vo.json, post.json, sources/, img/ here)

Facts: brand/badroyale/sources/history/<day>-news|build|map.json (one snapshot a day, Epic's in-game data via
fortnite-api.com), combined into sources/week-news.json; today's map.json for pins; the daily Item Shops
(shop/<day>/shop.json) for outfit tiles, prices and the days each item was in the shop. Every news line is quoted
word for word from its tile. Distances are straight lines between official POI coordinates (100 units = 1 m).
"""
import glob
import json
import math
import os
import shutil
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SLUG = os.path.basename(HERE)
BR = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC = os.path.join(BR, "sources")
HIST = os.path.join(SRC, "history")
sys.path.insert(0, os.path.join(BR, "auto"))
import new_where as W  # noqa: E402

PREV, FIRST, LAST = "2026-11-07", "2026-11-08", "2026-11-14"
SHOPS = ["2026-11-10", LAST]

# ---- week file
tiles, builds, places, pois_by_day = {}, {}, {}, {}
for f in sorted(glob.glob(os.path.join(HIST, "*-news.json"))):
    d = os.path.basename(f)[:10]
    if not FIRST <= d <= LAST:
        continue
    for m in json.load(open(f))["data"]["br"]["motds"]:
        t = tiles.setdefault(m["title"], {"title": m["title"], "body": m["body"], "days": []})
        t["days"].append(d)
for f in sorted(glob.glob(os.path.join(HIST, "*-build.json"))):
    d = os.path.basename(f)[:10]
    if PREV <= d <= LAST:
        builds[d] = json.load(open(f))["data"]["build"]
for f in sorted(glob.glob(os.path.join(HIST, "*-map.json"))):
    d = os.path.basename(f)[:10]
    if PREV <= d <= LAST:
        pois_by_day[d] = json.load(open(f))["data"]["pois"]
        places[d] = [p["name"] for p in pois_by_day[d]]
shop_days = {}
for f in sorted(glob.glob(os.path.join(BR, "shop", "2026-11-*", "shop.json"))):
    d = f.split(os.sep)[-2]
    if FIRST <= d <= LAST:
        shop_days[d] = sorted({i["name"] for e in json.load(open(f))["data"]["entries"] for i in (e.get("brItems") or []) if i["type"]["value"] == "outfit"})
man_now = json.load(open(os.path.join(SRC, "manifest.json")))
fetched = next(f["fetched_utc"] for f in man_now["files"] if f["file"] == "news.json")
week = {"note": f"Daily snapshots {PREV}..{LAST} of Epic's Battle Royale news, build and map (sources/history/), and the outfits in each day's Item Shop",
        "tiles": list(tiles.values()), "builds": builds, "place_counts": {d: len(v) for d, v in places.items()}, "places": places,
        "map_coords": {d: {p["name"]: [p["location"]["x"], p["location"]["y"]] for p in v} for d, v in pois_by_day.items() if d in (PREV, LAST)},
        "shop_outfits_by_day": shop_days}
os.makedirs(os.path.join(HERE, "sources"), exist_ok=True)
json.dump(week, open(os.path.join(HERE, "sources", "week-news.json"), "w"), indent=1, ensure_ascii=False)
shutil.copy(os.path.join(SRC, "map.json"), os.path.join(HERE, "sources", "map.json"))
files = [{"file": "week-news.json", "source": f"News tiles, builds and map places per day {PREV}..{LAST}, outfits per shop day", "url": "https://fortnite-api.com/v2/news",
          "fetched_utc": fetched, "note": "fetched_utc is today's snapshot; older days are the saved daily snapshots in sources/history/ and shop/<day>/shop.json"},
         {"file": "map.json", "source": "Battle Royale map POI data", "url": "https://fortnite-api.com/v1/map", "fetched_utc": fetched}]
for d in SHOPS:
    shutil.copy(os.path.join(BR, "shop", d, "shop.json"), os.path.join(HERE, "sources", f"shop-{d}.json"))
    sm = json.load(open(os.path.join(BR, "shop", d, "manifest.json")))
    files.append({"file": f"shop-{d}.json", "source": f"Item Shop for {d}", "url": "https://fortnite-api.com/v2/shop",
                  "fetched_utc": next(f["fetched_utc"] for f in sm["files"] if f["file"] == "shop.json")})
json.dump({"via": "fortnite-api.com (mirror of Epic's in-game news, build, map and Item Shop)", "files": files},
          open(os.path.join(HERE, "sources", "manifest.json"), "w"), indent=1)

SHOP = {d: json.load(open(os.path.join(BR, "shop", d, "shop.json")))["data"]["entries"] for d in SHOPS}
os.makedirs(os.path.join(HERE, "img"), exist_ok=True)


def outfit(name, day=LAST, bundle=None):
    for e in SHOP[day]:
        if (e.get("bundle") or {}).get("name") != bundle:
            continue
        for it in e.get("brItems") or []:
            if it["name"] == name and it["type"]["value"] == "outfit":
                return it, e
    raise SystemExit(f"STOP: {name} not in the {day} shop")


def tile(name, day=LAST, bundle=None, price=True):
    it, e = outfit(name, day, bundle)
    p = os.path.join(HERE, "img", it["id"] + ".png")
    if not os.path.exists(p):
        urllib.request.urlretrieve(it["images"].get("featured") or it["images"]["icon"], p)
    return {"img": f"../../badroyale/video/long/{SLUG}/img/{it['id']}.png", "name": it["name"], "rarity": it["rarity"]["value"],
            "price": e["finalPrice"] if price and not bundle else None}


def bundle(name, day):
    e = next(e for e in SHOP[day] if (e.get("bundle") or {}).get("name") == name)
    return e


phrases, segs, claims = [], [], []
SAY = {"The $.$. Rocky": "the S S Rocky", "Kasane Teto": "Kasane Teto"}


def ph(text, pause=0.25):
    d = {"text": text, "pause": pause}
    s = text
    for k, v in SAY.items():
        s = s.replace(k, v)
    if s != text:
        d["say"] = s
    phrases.append(d)
    return len(phrases) - 1


def quote(chapter, title, lines, intro, kicker="IN-GAME NEWS"):
    body = tiles[title]["body"]
    for ln in lines:
        assert ln.rstrip(".,") in body, (title, ln)
    p0 = len(phrases)
    seg = {"type": "quote", "p": p0, "kicker": kicker, "title": title, "lines": [{"p": p0 + 1 + i, "text": ln} for i, ln in enumerate(lines)]}
    if chapter:
        seg["chapter"] = chapter
    segs.append(seg)
    ph(intro, 0.2)
    for ln in lines:
        ph(ln, 0.2)
    claims.append({"text": f"{title} tile, live {tiles[title]['days'][0]}..{tiles[title]['days'][-1]}", "source": "week-news.json",
                   "match": [title] + [ln.rstrip(".,!") for ln in lines]})


now = {p["name"]: p for p in pois_by_day[LAST]}
named = [p for p in pois_by_day[LAST] if ".POI." in p["id"]]
a_ = [W.px(q) for q in named]
W.C[0], W.C[1] = sum(x for x, y in a_) / len(a_), sum(y for x, y in a_) / len(a_)


def m(p, q):
    return math.hypot(p["location"]["x"] - q["location"]["x"], p["location"]["y"] - q["location"]["y"]) / 100


def where(p):
    return W.direction(*W.px(p)).replace("the island", "the map")


def pin(name, z=1.4, sub=None, chapter=None):
    p = now[name]
    x, y = W.px(p)
    s = {"type": "map", "p": len(phrases), "x": x, "y": y, "z": z, "name": name, "sub": sub or "On the map", "pins": [{"x": x, "y": y, "label": ""}]}
    if chapter:
        s["chapter"] = chapter
    segs.append(s)


def day(d):
    n = int(d[-2:])
    return f"November {n}{'st' if n in (1, 21, 31) else 'nd' if n in (2, 22) else 'rd' if n in (3, 23) else 'th'}"


v_old = builds[PREV].split("Release-")[1].split("-")[0]
v_new = builds[LAST].split("Release-")[1].split("-")[0]
day_new = min(d for d, b in builds.items() if v_new in b)
removed = [n for n in places[PREV] if n not in places[LAST]]
added = [n for n in places[LAST] if n not in places[PREV]]
assert set(removed) == {"Fortune's Fort", "Loot Lagoon", "Boogie Boat"} and set(added) == {"Buggy's Beachhead", "Nami's Tangerine Grove"}, (removed, added)
old = {p["name"]: p for p in pois_by_day[PREV]}
bb_ll = m(now["Buggy's Beachhead"], old["Loot Lagoon"])

# ---- intro
segs.append({"type": "title", "p": 0, "kicker": "FORTNITE THIS WEEK", "lines": ["Two new captains", "Nov 8 - Nov 14"]})
ph("Two new captains, a new update, and a map that changed overnight. This is everything that happened in Fortnite this week.", 0.25)
ph("All of it straight from Epic's own in-game news and Item Shop, from November 8th to November 14th.", 0.25)
ph("Let's get into it!", 0.4)

# ---- the update
segs.append({"type": "stat", "p": len(phrases), "chapter": "The update", "big": f"v{v_new}", "label": f"live since {day(day_new)}"})
ph(f"First, the update. On {day(day_new)}, the game went from version {v_old} to version {v_new}.", 0.25)
claims.append({"text": f"Build {v_old} on {PREV}, {v_new} from {day_new}", "source": "week-news.json", "match": [f"Release-{v_old}", f"Release-{v_new}", day_new]})
segs.append({"type": "stat", "p": len(phrases), "big": f"{len(places[PREV])} → {len(places[LAST])}", "label": "places on the official map"})
ph(f"And the map changed with it. The official map went from {len(places[PREV])} places to {len(places[LAST])}.", 0.2)
ph(f"Three places are gone: Fortune's Fort, Loot Lagoon and Boogie Boat.", 0.25)
ph("And two new ones showed up.", 0.3)
claims.append({"text": f"Map {len(places[PREV])} -> {len(places[LAST])} places; removed {removed}; added {added}", "source": "week-news.json",
               "match": [f'"{PREV}": {len(places[PREV])}', f'"{LAST}": {len(places[LAST])}'] + removed + added})
bb = now["Buggy's Beachhead"]
pin("Buggy's Beachhead", 1.35, "New named location · " + where(bb))
nb = min([q for q in named if q is not bb], key=lambda q: m(bb, q))
ph(f"Buggy's Beachhead, a new named location {where(bb)}, closest to {nb['name']}.", 0.2)
ph(f"It sits about {int(round(bb_ll / 10.0) * 10)} meters from where Loot Lagoon used to be.", 0.3)
claims.append({"text": f"Buggy's Beachhead: named, {where(bb)}, closest {nb['name']}; ~{int(round(bb_ll / 10.0) * 10)} m from Loot Lagoon's old coordinates",
               "source": "week-news.json", "match": ["Buggy's Beachhead", "Loot Lagoon", nb["name"]], "visual": "map_coords for both days; distance between them"})
ng = now["Nami's Tangerine Grove"]
nn = min(named, key=lambda q: m(ng, q))
pin("Nami's Tangerine Grove", 1.45, "New landmark · " + where(ng))
ph(f"And Nami's Tangerine Grove, a new landmark {where(ng)}, about {int(round(m(ng, nn) / 10.0) * 10)} meters from {nn['name']}.", 0.3)
claims.append({"text": f"Nami's Tangerine Grove: landmark, {where(ng)}, ~{int(round(m(ng, nn) / 10.0) * 10)} m from {nn['name']}", "source": "map.json",
               "match": ["Nami's Tangerine Grove", nn["name"]], "visual": "UnNamedPOI id; distance between official POI coordinates"})

# ---- the map now: every named location, clockwise from the north
order = sorted(named, key=lambda q: math.degrees(math.atan2(W.px(q)[0] - W.C[0], W.C[1] - W.px(q)[1])) % 360)
segs.append({"type": "stat", "p": len(phrases), "chapter": "The map now", "big": str(len(named)), "label": "named locations on the map today"})
ph(f"So here's the map as it stands today: {len(named)} named locations. Quick tour, clockwise from the north.", 0.25)
for q in order:
    pin(q["name"], 1.3, "Named location · " + where(q))
    ph(f"{q['name']}, {where(q)}.", 0.2)
marks = [q["name"] for q in pois_by_day[LAST] if ".POI." not in q["id"]]
ph(f"Plus {len(marks)} landmarks, including the new one, Nami's Tangerine Grove.", 0.3)
claims.append({"text": f"{len(named)} named locations and {len(marks)} landmarks on {LAST}, directions from the middle of the named locations", "source": "map.json",
               "match": [q["name"] for q in named] + marks})

# ---- Lil Uzi Vert
quote("Lil Uzi Vert", "Lil Uzi Vert Drops Anchor",
      ["A new Captain has sailed in!", "Face the Lil Uzi Vert Boss to earn Lil' Uzi Vert Jr.,", "and get ahead with the lightning-fast Lil Uzi Vert's Lil' SMG."],
      f"Captain number one. On {day(tiles['Lil Uzi Vert Drops Anchor']['days'][0])}, this tile went up.")
ub = bundle("Lil Uzi Vert Bundle", LAST)
segs.append({"type": "items", "p": len(phrases), "title": "Lil Uzi Vert Bundle · in the shop now",
             "items": [tile("Lil Uzi Vert", LAST, "Lil Uzi Vert Bundle"), tile("Pink Star Lil Uzi Vert", LAST, "Lil Uzi Vert Bundle")]})
uzi_first = min(d for d, v in shop_days.items() if "Lil Uzi Vert" in v)
ph(f"Then on {day(uzi_first)}, the Lil Uzi Vert Bundle hit the Item Shop.", 0.2)
ph(f"It's {ub['finalPrice']:,} V-Bucks, listed at {ub['regularPrice']:,}, with {len(ub['brItems'])} items, and it stays until December {int(ub['outDate'][8:10])}th.", 0.3)
claims.append({"text": f"Lil Uzi Vert Bundle {ub['finalPrice']} (listed {ub['regularPrice']}), {len(ub['brItems'])} items, out {ub['outDate'][:10]}, first in shop {uzi_first}",
               "source": f"shop-{LAST}.json", "match": ["Lil Uzi Vert Bundle", f'"finalPrice": {ub["finalPrice"]}', f'"regularPrice": {ub["regularPrice"]}', ub["outDate"][:10]]})

# ---- Buggy
quote("Buggy", "One Piece's Buggy Makes Landfall",
      ["A new Captain has claimed territory!", "Defeat the Buggy Boss, claim the Transponder Snail Sprite,", "and explode into action with the Special Buggy Ball."],
      f"Captain number two showed up the same day as the update, {day(tiles["One Piece's Buggy Makes Landfall"]['days'][0])}.")
segs.append({"type": "items", "p": len(phrases), "title": "Buggy · new in today's shop", "items": [tile("Buggy")]})
_, be = outfit("Buggy")
assert min(d for d, v in shop_days.items() if "Buggy" in v) == LAST
ph(f"And as of today, Buggy is in the Item Shop too, at {be['finalPrice']:,} V-Bucks.", 0.3)
claims.append({"text": f"Buggy outfit {be['finalPrice']}, first in the shop {LAST}", "source": f"shop-{LAST}.json", "match": ["Buggy", f'"finalPrice": {be["finalPrice"]}']})

segs.append({"type": "code", "p": len(phrases)})
ph("Quick one: if you're grabbing anything from the Item Shop this week, use code BAD. It really helps the channel.", 0.4)

# ---- Straw Hats
quote("The Straw Hats", "Monkey D. Luffy, Nami, and Usopp Outfits",
      ["When adventure calls, the Straw Hats answer!", "Set sail with Monkey D. Luffy, Nami, and Usopp Outfits and chart a course to uncharted waters."],
      "The Straw Hats were in the news every single day this week.")
segs.append({"type": "items", "p": len(phrases), "title": "One Piece outfits · in today's shop",
             "items": [tile("Monkey D. Luffy"), tile("Roronoa Zoro"), tile("Nami"), tile("Usopp")]})
lp, zp, np_ = (outfit(n)[1]["finalPrice"] for n in ("Monkey D. Luffy", "Roronoa Zoro", "Nami"))
zoro_days = [d for d, v in shop_days.items() if "Roronoa Zoro" in v]
ph(f"In today's shop: Luffy and Roronoa Zoro at {lp:,} V-Bucks each, Nami and Usopp at {np_:,}.", 0.2)
ph(f"Zoro was in the shop all {len(zoro_days)} days this week.", 0.3)
claims.append({"text": f"Luffy {lp}, Zoro {zp}, Nami/Usopp {np_} in the {LAST} shop; Zoro in the shop {len(zoro_days)} days {zoro_days[0]}..{zoro_days[-1]}",
               "source": "week-news.json", "match": ["Roronoa Zoro", "Monkey D. Luffy", "Nami", "Usopp"]})
quote(None, "Devil Fruits Across the Island",
      ["Rare Devil Fruits have dropped in across the map!", "Eat the Gum-Gum Fruit to stretch your skills as Luffy,", "or the Flame-Flame Fruit to come in hot as Ace...", "just stay away from water."],
      "And the Devil Fruits are still out there.")
quote(None, "Multi-Punches Flex", ["GUM-GUM GATLING!"], "Along with this emote tile, still just three words.")

# ---- the island tile
quote("Adventure Awaits!", "Adventure Awaits!",
      ["Explore One Piece's Arlong Park, sail past Baratie Bay,", "or storm The $.$. Rocky on this mysterious skull-shaped island."],
      "This island tile was up almost all week. It dropped out on November 12th, and came back the next day.")
pin("Arlong Park", 1.4, "Named location · " + where(now["Arlong Park"]))
ph(f"Arlong Park is {where(now['Arlong Park'])}.", 0.2)
pin("Baratie", 1.5, "Landmark · next to Busy Bay")
ph("Baratie sits right next to Busy Bay.", 0.2)
pin("The $.$. Rocky", 1.4, "Named location · " + where(now["The $.$. Rocky"]))
ph(f"And The $.$. Rocky is {where(now['The $.$. Rocky'])}.", 0.3)
assert "2026-11-12" not in tiles["Adventure Awaits!"]["days"] and "2026-11-13" in tiles["Adventure Awaits!"]["days"]
claims.append({"text": "Adventure Awaits! absent 2026-11-12, back 2026-11-13; Arlong Park, Baratie, The $.$. Rocky positions", "source": "week-news.json",
               "match": ["Adventure Awaits!", "Arlong Park", "Baratie", "The $.$. Rocky", "Busy Bay"]})

# ---- Music Pass and Treasure Tab
quote("TWINDRILL DIVA", "TWINDRILL DIVA Music Pass",
      ["Virtual Diva Kasane Teto takes the stage!", "TWINDRILL DIVA Music Pass holders get access to the Kasane Teto Outfit, Back Bling, Emote, and more.", "Dive into Festival to start unlocking rewards!"],
      f"Over in Festival, a new Music Pass went into the news on {day(tiles['TWINDRILL DIVA Music Pass']['days'][0])}.")
t = tiles["Keep Tabs on the Adventure!"]["days"]
quote("The Treasure Tab", "Keep Tabs on the Adventure!",
      ["All great adventures begin with a treasure map!", "Head to the Treasure Tab to follow along with weekly progress and chart your next move."],
      f"And the Treasure Tab tile was back from {day(t[0])} to the {int(t[-1][-2:])}th.")

# ---- the week's bundles
segs.append({"type": "title", "p": len(phrases), "chapter": "The week's bundles", "kicker": "ITEM SHOP", "lines": ["The week's", "big bundles"]})
ph("Two more big bundles came and went in the shop this week.", 0.25)
mb = bundle("Masters of the Universe Bundle", "2026-11-10")
segs.append({"type": "items", "p": len(phrases), "title": "Masters of the Universe Bundle",
             "items": [tile("He-Man", "2026-11-10", "Masters of the Universe Bundle"), tile("Skeletor", "2026-11-10", "Masters of the Universe Bundle"),
                       tile("She-Ra", "2026-11-10", "Masters of the Universe Bundle")]})
hm = [d for d, v in shop_days.items() if "He-Man" in v]
ph(f"The Masters of the Universe Bundle, with He-Man, Skeletor and She-Ra, was in from {day(hm[0])} to the {int(hm[-1][-2:])}th, at {mb['finalPrice']:,} V-Bucks, listed at {mb['regularPrice']:,}.", 0.3)
claims.append({"text": f"Masters of the Universe Bundle {mb['finalPrice']} (listed {mb['regularPrice']}), in the shop {hm[0]}..{hm[-1]}", "source": "shop-2026-11-10.json",
               "match": ["Masters of the Universe Bundle", "He-Man", "Skeletor", "She-Ra", f'"finalPrice": {mb["finalPrice"]}', f'"regularPrice": {mb["regularPrice"]}']})
gb = bundle("Mega Man Bundle", LAST)
segs.append({"type": "items", "p": len(phrases), "title": "Mega Man Bundle · last day tomorrow",
             "items": [tile("Mega Man (Dual Override)", LAST, "Mega Man Bundle"), tile("Mega Man X", LAST, "Mega Man Bundle"), tile("Zero (Mega Man)", LAST, "Mega Man Bundle")]})
mm = [d for d, v in shop_days.items() if "Mega Man X" in v]
ph(f"And the Mega Man Bundle, in since {day(mm[0])}, is {gb['finalPrice']:,} V-Bucks, listed at {gb['regularPrice']:,}.", 0.2)
ph(f"It leaves the shop after November {int(gb['outDate'][8:10])}th, so tomorrow is the last day.", 0.3)
claims.append({"text": f"Mega Man Bundle {gb['finalPrice']} (listed {gb['regularPrice']}), first {mm[0]}, outDate {gb['outDate'][:10]}", "source": f"shop-{LAST}.json",
               "match": ["Mega Man Bundle", f'"finalPrice": {gb["finalPrice"]}', f'"regularPrice": {gb["regularPrice"]}', gb["outDate"][:10]]})

# ---- recap
segs.append({"type": "title", "p": len(phrases), "chapter": "Recap", "kicker": "QUICK RECAP", "lines": [f"v{v_new} · Buggy's Beachhead", "Lil Uzi Vert · Buggy · Mega Man"]})
ph(f"Quick recap. Version {v_new}, three places gone and two new ones, led by Buggy's Beachhead.", 0.2)
ph("Lil Uzi Vert and Buggy as the new captains, both now in the shop,", 0.2)
ph("and one last day tomorrow for the Mega Man Bundle.", 0.3)
ph("Which captain are you going after first? Tell me in the comments!", 0.4)
segs.append({"type": "code", "p": len(phrases)})
ph("Use code BAD in the Item Shop. It really helps the channel.", 0.25)
ph("Thank you for watching! Follow for more daily content.", 0.6)

json.dump({"title": "Fortnite This Week: Two New Captains", "map": "blank",
           "caption": "#EpicPartner Everything that changed in Fortnite this week. Use code BAD in the Item Shop.\n#Fortnite #FortniteNews",
           "claims": claims, "segments": segs}, open(os.path.join(HERE, "long.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": phrases}, open(os.path.join(HERE, "vo.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"youtubeTitle": "Fortnite This Week 🏴‍☠️ Buggy, Lil Uzi Vert, v43.10 Map Changes & Mega Man (Nov 8 - Nov 14)",
           "youtube": "#EpicPartner Everything that changed in Fortnite this week 🏴‍☠️ version 43.10, three places gone and Buggy's Beachhead new on the map, "
                      "Lil Uzi Vert and Buggy as the new captains, the Straw Hats, the TWINDRILL DIVA Music Pass, and the week's big bundles, "
                      "straight from Epic's in-game news and Item Shop.\n\nWhich captain are you going after first? 👇\n\nUse code BAD in the Item Shop 💛\n\n{chapters}\n\n#Fortnite #FortniteNews #OnePiece",
           "tags": ["fortnite", "fortnite news", "fortnite this week", "fortnite buggy", "lil uzi vert fortnite", "fortnite one piece", "fortnite map changes"],
           "thumb_t": 1.6}, open(os.path.join(HERE, "post.json"), "w"), indent=1, ensure_ascii=False)
print(len(phrases), "phrases,", len(segs), "segments,", len(claims), "claims,", sum(len(p["text"].split()) for p in phrases), "words")
