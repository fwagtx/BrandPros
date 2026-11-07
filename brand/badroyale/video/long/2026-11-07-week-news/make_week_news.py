"""Generate the "Fortnite This Week" long video (Oct 31 - Nov 7) from the saved daily sources.

    python3 make_week_news.py      (run from anywhere; writes long.json, vo.json, post.json, sources/, img/ here)

Facts: brand/badroyale/sources/history/<day>-news|build|map.json (one snapshot a day, Epic's in-game data via
fortnite-api.com), combined into sources/week-news.json; today's map.json for pins; today's Item Shop (shop.json)
for the outfit tiles and prices. Every news line is quoted word for word from its tile.
"""
import glob
import json
import os
import shutil
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
BR = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC = os.path.join(BR, "sources")
HIST = os.path.join(SRC, "history")
sys.path.insert(0, os.path.join(BR, "auto"))
import new_where as W  # noqa: E402

FIRST, LAST = "2026-10-31", "2026-11-07"
SHOP_DAY = "2026-11-07"

# ---- week file: every tile with the days it was live, builds and map size per day
tiles, builds, places = {}, {}, {}
for f in sorted(glob.glob(os.path.join(HIST, "*-news.json"))):
    d = os.path.basename(f)[:10]
    if not FIRST <= d <= LAST:
        continue
    for m in json.load(open(f))["data"]["br"]["motds"]:
        t = tiles.setdefault(m["title"], {"title": m["title"], "body": m["body"], "days": []})
        t["days"].append(d)
for f in sorted(glob.glob(os.path.join(HIST, "*-build.json"))):
    d = os.path.basename(f)[:10]
    if FIRST <= d <= LAST:
        builds[d] = json.load(open(f))["data"]["build"]
for f in sorted(glob.glob(os.path.join(HIST, "*-map.json"))):
    d = os.path.basename(f)[:10]
    if FIRST <= d <= LAST:
        places[d] = [p["name"] for p in json.load(open(f))["data"]["pois"]]
man_now = json.load(open(os.path.join(SRC, "manifest.json")))
fetched = next(f["fetched_utc"] for f in man_now["files"] if f["file"] == "news.json")
week = {"note": f"Daily snapshots {FIRST}..{LAST} of Epic's Battle Royale news, build and map (sources/history/)",
        "tiles": list(tiles.values()), "builds": builds,
        "place_counts": {d: len(v) for d, v in places.items()}, "places": places}
os.makedirs(os.path.join(HERE, "sources"), exist_ok=True)
json.dump(week, open(os.path.join(HERE, "sources", "week-news.json"), "w"), indent=1, ensure_ascii=False)
shutil.copy(os.path.join(SRC, "map.json"), os.path.join(HERE, "sources", "map.json"))
shutil.copy(os.path.join(BR, "shop", SHOP_DAY, "shop.json"), os.path.join(HERE, "sources", f"shop-{SHOP_DAY}.json"))
shop_man = json.load(open(os.path.join(BR, "shop", SHOP_DAY, "manifest.json")))
shop_fetched = next(f["fetched_utc"] for f in shop_man["files"] if f["file"] == "shop.json")
json.dump({"via": "fortnite-api.com (mirror of Epic's in-game news, build, map and Item Shop)", "files": [
    {"file": "week-news.json", "source": f"News tiles, builds and map places per day {FIRST}..{LAST}", "url": "https://fortnite-api.com/v2/news",
     "fetched_utc": fetched, "note": "fetched_utc is today's snapshot; older days are the saved daily snapshots in sources/history/"},
    {"file": "map.json", "source": "Battle Royale map POI data", "url": "https://fortnite-api.com/v1/map", "fetched_utc": fetched},
    {"file": f"shop-{SHOP_DAY}.json", "source": f"Item Shop for {SHOP_DAY}", "url": "https://fortnite-api.com/v2/shop", "fetched_utc": shop_fetched}]},
    open(os.path.join(HERE, "sources", "manifest.json"), "w"), indent=1)

# ---- shop tiles (art downloaded into img/, used only inside the video)
shop = json.load(open(os.path.join(BR, "shop", SHOP_DAY, "shop.json")))["data"]["entries"]


def outfit(name, bundle=None):
    for e in shop:
        if (e.get("bundle") or {}).get("name") != bundle:
            continue
        for it in e.get("brItems") or []:
            if it["name"] == name and it["type"]["value"] == "outfit":
                return it, e
    raise SystemExit(f"STOP: {name} not in the {SHOP_DAY} shop")


os.makedirs(os.path.join(HERE, "img"), exist_ok=True)


def tile(name, bundle=None):
    it, e = outfit(name, bundle)
    p = os.path.join(HERE, "img", it["id"] + ".png")
    if not os.path.exists(p):
        urllib.request.urlretrieve(it["images"].get("featured") or it["images"]["icon"], p)
    return {"img": f"../../badroyale/video/long/2026-11-07-week-news/img/{it['id']}.png", "name": it["name"], "rarity": it["rarity"]["value"],
            "price": e["finalPrice"] if not bundle else None}


phrases, segs, claims = [], [], []
SAY = {"The $.$. Rocky": "the S S Rocky"}


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
    """lines: exact substrings of the tile body, read one per phrase"""
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


def pin(name, z=1.4, sub=None, chapter=None):
    p = next(q for q in json.load(open(os.path.join(SRC, "map.json")))["data"]["pois"] if q["name"] == name)
    x, y = W.px(p)
    s = {"type": "map", "p": len(phrases), "x": x, "y": y, "z": z, "name": name, "sub": sub or "On the new map", "pins": [{"x": x, "y": y, "label": ""}]}
    if chapter:
        s["chapter"] = chapter
    segs.append(s)
    claims.append({"text": f"{name} is on the map", "source": "map.json", "match": [name]})


old_n, new_n = len(places[FIRST]), len(places[LAST])
v_old = builds[FIRST].split("Release-")[1].split("-")[0]
v_new = builds[LAST].split("Release-")[1].split("-")[0]
day_new = min(d for d, b in builds.items() if v_new in b)

# ---- intro
segs.append({"type": "title", "p": 0, "kicker": "FORTNITE THIS WEEK", "lines": ["A whole new island", "Oct 31 - Nov 7"]})
ph("This was the week Fortnite got a whole new island. Here's everything that changed, straight from Epic's own in-game news.", 0.25)
ph("Every news tile, every update, from October 31st to November 7th.", 0.25)
ph("Let's get into it!", 0.4)

# ---- the update
segs.append({"type": "stat", "p": len(phrases), "chapter": "The new season", "big": f"v{v_new}", "label": f"live since November {int(day_new[-2:])}"})
ph(f"First, the big one. On November {int(day_new[-2:])}nd, the game updated from version {v_old} to version {v_new}." if day_new.endswith("02") else
   f"First, the big one. The game updated from version {v_old} to version {v_new}.", 0.25)
claims.append({"text": f"Build {v_old} on {FIRST}, {v_new} from {day_new}", "source": "week-news.json", "match": [f"Release-{v_old}", f"Release-{v_new}", day_new]})
segs.append({"type": "stat", "p": len(phrases), "big": f"{old_n} → {new_n}", "label": "places on the official map"})
ph(f"And the map changed with it. Last week the official map had {old_n} places. Now it has {new_n}.", 0.2)
ph("And not one of the old places made it to the new island.", 0.3)
assert not set(places[FIRST]) & set(places[LAST])
claims.append({"text": f"Map: {old_n} places on {FIRST}, {new_n} on {LAST}, none in common", "source": "week-news.json",
               "match": [f'"{FIRST}": {old_n}', f'"{LAST}": {new_n}'], "visual": "place lists per day in week-news.json have no name in common"})

# ---- Halloween send-off
quote("The Horror Is Here", "The Horror Is Here", ["A cursed cartridge is spreading through the Island, corrupting everything it touches."],
      "The week started on Halloween, with the last day of this tile in the news.")
ph("That was the final day it showed up. The next day, the news was all new.", 0.3)

# ---- A$AP Rocky
quote("A$AP Rocky Sails In", "A$AP Rocky Sails In",
      ["A new Captain has taken over part of the Island!", "Face the A$AP Rocky Boss to earn Lil' Flacko,", "and blast away the competition with the A$AP Rocky's Shock Rocket."],
      "On November 1st, a new captain showed up.")
segs.append({"type": "items", "p": len(phrases), "title": f"A$AP Rocky Bundle · in the shop {SHOP_DAY[5:7]}/{SHOP_DAY[8:]}",
             "items": [tile("Helicopter Flacko", "A$AP Rocky Bundle"), tile("Rocky Rugahand", "A$AP Rocky Bundle")]})
_, e = outfit("Helicopter Flacko", "A$AP Rocky Bundle")
ph(f"And the A$AP Rocky Bundle is in today's Item Shop, listed at {e['finalPrice']:,} V-Bucks.", 0.3)
claims.append({"text": f"A$AP Rocky Bundle in the {SHOP_DAY} shop at {e['finalPrice']}", "source": f"shop-{SHOP_DAY}.json",
               "match": ["A$AP Rocky Bundle", "Helicopter Flacko", "Rocky Rugahand", f'"finalPrice": {e["finalPrice"]}']})

# ---- Straw Hats
quote("The Straw Hats", "Monkey D. Luffy, Nami, and Usopp Outfits",
      ["When adventure calls, the Straw Hats answer!", "Set sail with Monkey D. Luffy, Nami, and Usopp Outfits and chart a course to uncharted waters."],
      "The same day, One Piece arrived.")
segs.append({"type": "items", "p": len(phrases), "title": f"One Piece outfits · in the shop {SHOP_DAY[5:7]}/{SHOP_DAY[8:]}",
             "items": [tile("Monkey D. Luffy"), tile("Nami"), tile("Usopp")]})
lp, np_, up = (outfit(n)[1]["finalPrice"] for n in ("Monkey D. Luffy", "Nami", "Usopp"))
ph(f"All three are in today's shop on their own: Luffy at {lp:,} V-Bucks, Nami and Usopp at {np_:,} each.", 0.25)
claims.append({"text": f"Luffy {lp}, Nami {np_}, Usopp {up} in the {SHOP_DAY} shop", "source": f"shop-{SHOP_DAY}.json",
               "match": ["Monkey D. Luffy", "Nami", "Usopp", f'"finalPrice": {lp}', f'"finalPrice": {np_}']})
quote(None, "Multi-Punches Flex", ["GUM-GUM GATLING!"], "And there's an emote tile with just three words on it.")
ph("Still in the news today, a whole week later.", 0.4)

segs.append({"type": "code", "p": len(phrases)})
ph("Quick one: if you're grabbing anything from the Item Shop this week, use code BAD. It really helps the channel.", 0.4)

# ---- the island
quote("The new island", "Adventure Awaits!",
      ["Explore One Piece's Arlong Park, sail past Baratie Bay,", "or storm The $.$. Rocky on this mysterious skull-shaped island."],
      "On November 4th, Epic described the new island.")
pin("Arlong Park", 1.4, "Named location · west of the island")
ph("Here's Arlong Park, on the west side of the island.", 0.25)
pin("Baratie", 1.5, "Landmark · next to Busy Bay")
ph("Baratie sits right next to Busy Bay, in the south-east.", 0.25)
claims.append({"text": "Baratie is about 40 m from Busy Bay", "source": "map.json", "match": ["Baratie", "Busy Bay"], "visual": "distance between official POI coordinates (36 m)"})
pin("The $.$. Rocky", 1.4, "Named location · east of the island")
ph("And The $.$. Rocky is out on the east side.", 0.3)

# ---- Devil Fruits
quote("Devil Fruits", "Devil Fruits Across the Island",
      ["Rare Devil Fruits have dropped in across the map!", "Eat the Gum-Gum Fruit to stretch your skills as Luffy,", "or the Flame-Flame Fruit to come in hot as Ace...", "just stay away from water."],
      "The same day, a gameplay tile went up.")

# ---- Treasure Tab (Nov 2-4)
quote("The Treasure Tab", "Keep Tabs on the Adventure!",
      ["All great adventures begin with a treasure map!", "Head to the Treasure Tab to follow along with weekly progress and chart your next move."],
      "From November 2nd to the 4th, this one pointed players to a new tab.")

# ---- Epic's tips of the week (Nov 1-2)
quote("Epic's tips", "Bring Your Squad Back From the Brink",
      ["All hope is not lost when a teammate goes down!", "When they fall, they leave behind a Reboot Card.", "Pick it up, take it to a Reboot Van, and bring them back into the fight for a better shot at victory."],
      "Epic also ran a couple of tips in the news on November 1st and 2nd. This one is for squads.")
quote(None, "Rarer Color, Better Weapons!",
      ["Weapons come in five rarities: Gray (Common), Green (Uncommon), Blue (Rare), Purple (Epic), and Orange (Legendary).", "Higher rarity means better stats, so open Chests and swap out weapons when finding something better!"],
      "And this one is the color code for every weapon.")

# ---- Fortune Sprites (today)
quote("Fortune Sprites today", "Fortune Sprite Variants - November 7",
      ["Set sail for sparkling Sprites from 2-4 PM ET and 9-11 PM ET!", "Drop in with A$AP Rocky's Shock Rocket and a Self Revive,", "and find more Fortune Sprite variants across the Island."],
      "And the newest tile is about today, November 7th.")
ph("This video goes up at 4 PM Eastern, so the evening window, 9 to 11 PM Eastern, is still ahead.", 0.3)

# ---- recap
segs.append({"type": "title", "p": len(phrases), "chapter": "Recap", "kicker": "QUICK RECAP", "lines": [f"v{v_new} · {new_n} new places", "A$AP Rocky · One Piece · Devil Fruits"]})
ph(f"Quick recap. A new version, {v_new}, and a new island with {new_n} places.", 0.2)
ph("A$AP Rocky as a boss, the Straw Hats in the shop, Devil Fruits on the map,", 0.2)
ph("and Fortune Sprites tonight.", 0.3)
ph("Which change is your favorite? Tell me in the comments!", 0.4)
segs.append({"type": "code", "p": len(phrases)})
ph("Use code BAD in the Item Shop. It really helps the channel.", 0.25)
ph("Thank you for watching! Follow for more daily content.", 0.6)

json.dump({"title": "Fortnite This Week: A Whole New Island", "map": "blank",
           "caption": "#EpicPartner Everything that changed in Fortnite this week. Use code BAD in the Item Shop.\n#Fortnite #FortniteNews",
           "claims": claims, "segments": segs}, open(os.path.join(HERE, "long.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": phrases}, open(os.path.join(HERE, "vo.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"youtubeTitle": "Fortnite This Week 🏴‍☠️ A Whole New Island, A$AP Rocky, One Piece & Devil Fruits (Oct 31 - Nov 7)",
           "youtube": "#EpicPartner Everything that changed in Fortnite this week 🏴‍☠️ the new version, a whole new island, A$AP Rocky as a boss, "
                      "the One Piece Straw Hats, Devil Fruits, the Treasure Tab and today's Fortune Sprites, straight from Epic's in-game news.\n\n"
                      "Which change is your favorite? Tell me in the comments 👇\n\nUse code BAD in the Item Shop 💛\n\n{chapters}\n\n#Fortnite #FortniteNews #OnePiece",
           "tags": ["fortnite", "fortnite news", "fortnite this week", "fortnite one piece", "asap rocky fortnite", "devil fruit fortnite", "fortnite new map"],
           "thumb_t": 1.6}, open(os.path.join(HERE, "post.json"), "w"), indent=1, ensure_ascii=False)
print(len(phrases), "phrases,", len(segs), "segments,", len(claims), "claims")
