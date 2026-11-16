"""Builds brand/badroyale/video/long/2026-11-16-week-item-shop from the saved shop archive (run from repo root).

Facts: brand/badroyale/shop/archive/<day>.json (one Item Shop snapshot per reset, saved by the SHOP run) for
2026-11-10..2026-11-16, each day's history.json ('Introduced in' lines from Epic's cosmetics data), and today's
full shop.json. Combined into sources/week.json; claims match its exact text.
"""
import glob
import json
import os
import urllib.request

FIRST, LAST = "2026-11-10", "2026-11-16"
D = "brand/badroyale/video/long/2026-11-16-week-item-shop"
REL = "../../badroyale/video/long/2026-11-16-week-item-shop"
os.makedirs(D + "/sources", exist_ok=True)
os.makedirs(D + "/img", exist_ok=True)

# ---- sources ----
week = {"note": f"Daily Item Shop snapshots saved by the SHOP run at each reset, {FIRST} to {LAST}, plus each day's "
                "'Introduced in' lines from Epic's cosmetics data.", "shop_days": {}, "introduced": {}}
for f in sorted(glob.glob("brand/badroyale/shop/archive/*.json")):
    d = json.load(open(f))
    if FIRST <= d["date"] <= LAST:
        week["shop_days"][d["date"]] = d["entries"]
for f in sorted(glob.glob("brand/badroyale/shop/2026-11-*/history.json")):
    day = f.split("/")[3]
    if FIRST <= day <= LAST:
        week["introduced"][day] = json.load(open(f))
json.dump(week, open(D + "/sources/week.json", "w"), indent=1, ensure_ascii=False)
shop_now = json.load(open(f"brand/badroyale/shop/{LAST}/shop.json"))
json.dump(shop_now, open(D + f"/sources/shop-{LAST}.json", "w"), indent=1, ensure_ascii=False)
m_now = json.load(open(f"brand/badroyale/shop/{LAST}/manifest.json"))
fetched_now = next(f["fetched_utc"] for f in m_now["files"] if f["file"] == "shop.json")
json.dump({"via": "fortnite-api.com (mirror of Epic's Item Shop and cosmetics data)", "files": [
    {"file": "week.json", "source": f"Item Shop archive {FIRST}..{LAST} (one snapshot per reset) + 'Introduced in' lines",
     "url": "https://fortnite-api.com/v2/shop", "fetched_utc": fetched_now,
     "note": "fetched_utc is the newest snapshot in the file (today's reset); older days are the saved snapshots of their own resets"},
    {"file": f"shop-{LAST}.json", "source": f"Item Shop for {LAST}", "url": "https://fortnite-api.com/v2/shop", "fetched_utc": fetched_now}]},
    open(D + "/sources/manifest.json", "w"), indent=1)

# ---- bundles of the week, read from the archive (never typed by hand) ----
B = {}
for day, entries in week["shop_days"].items():
    for e in entries:
        if e.get("bundle"):
            B.setdefault(e["bundle"], e)


def single(first):
    """the fullest non-bundle entry whose first item is `first`"""
    es = [e for es_ in week["shop_days"].values() for e in es_ if not e.get("bundle") and e["items"] and e["items"][0][0] == first]
    e = max(es, key=lambda x: len(x["items"]))
    return e, f'"final": {e["final"]}, "regular": {e["regular"]}, "in": "{e["in"]}", "out": "{e["out"]}"'


def bundle(name):
    e = B[name]
    return e, f'"final": {e["final"]}, "regular": {e["regular"]}, "in": "{e["in"]}", "out": "{e["out"]}"'


# ---- art: icons from the saved shop data of each day ----
icons = {}
for day in sorted(week["shop_days"]):
    p = f"brand/badroyale/shop/{day}/shop.json"
    if not os.path.exists(p):
        continue
    for e in json.load(open(p))["data"]["entries"]:
        for i in e.get("brItems") or []:
            icons.setdefault(i["name"].strip().lower(), ((i.get("images") or {}).get("icon"), i["rarity"]["value"]))


def it(name, price=None):
    url, rar = icons[name.lower()]
    fn = url.split("/br/")[1].split("/")[0] + ".png"
    p = f"{D}/img/{fn}"
    if not os.path.exists(p):
        open(p, "wb").write(urllib.request.urlopen(url, timeout=60).read())
    o = {"img": f"{REL}/img/{fn}", "name": name, "rarity": rar}
    if price:
        o["price"] = price
    return o


P, S, C = [], [], []
SAY = {"PIRATE D. SPEEDY": "Pirate D Speedy", "Cap'n": "Captain"}


def say(text, pause=0.25):
    d = {"text": text, "pause": round(pause + 0.1, 2)}
    s = text
    for k, v in SAY.items():
        s = s.replace(k, v)
    if s != text:
        d["say"] = s
    P.append(d)
    return len(P) - 1


def claim(text, *match, src="week.json"):
    C.append({"text": text, "source": src, "match": list(match)})


def day(d):
    m, n = {"11": "November", "12": "December", "10": "October"}[d[5:7]], int(d[8:])
    return f"{m} {n}{'th' if 11 <= n <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"


def vb(n):
    return f"{n:,}"


def show(name, outfits, title=None, extra=None):
    e, m = bundle(name)
    if not title:
        short = name.replace(" Bundle", "").replace(" & ", " + ")
        title = f"{short} · {vb(e['final'])} V-Bucks"
        if len(title) > 34:
            title = f"{short} · {vb(e['final'])}"
        if len(title) > 34:
            title = short
    S.append({"type": "items", "p": len(P), "title": title, "items": [it(o) for o in outfits]})
    claim(f"{name}: {e['final']} (listed {e['regular']}), in {e['in']} out {e['out']}", name, m, *outfits)
    return e


# ---------------- script ----------------
p = say("This is this week's Fortnite Item Shop! The biggest bundles, every new drop, and every OG that came back.")
say(f"Seven days of the shop, from {day(FIRST)} to {day(LAST)}, straight from Epic's own Item Shop data.")
say("Let's get into it!", 0.4)
S.append({"type": "title", "p": p, "kicker": "NOV 10 - NOV 16", "lines": ["This Week's", "Item Shop"]})

new_b = sorted(k for k, v in B.items() if FIRST <= v["in"] <= LAST and k.endswith("Bundle") and k != "J BALVIN BUNDLE")
big = max(new_b, key=lambda k: B[k]["regular"])
assert big == "Mega Man Bundle", big

# 1. biggest bundle
p = say("First, the biggest new bundle of the week.")
S.append({"type": "title", "p": p, "chapter": "Biggest bundle of the week", "kicker": "BIGGEST BUNDLE", "lines": ["Mega Man"]})
e = show("Mega Man Bundle", ["Mega Man (Dual Override)", "Mega Man X", "Zero (Mega Man)"])
S[-1]["items"][0]["name"] = "Mega Man (Dual Override)"
say(f"The Mega Man Bundle! Mega Man, Mega Man X and Zero, plus Rush as a sidekick. {len(e['items'])} items.")
say(f"Listed at {vb(e['regular'])} V-Bucks, it sold for {vb(e['final'])}.")
say(f"It went live on {day(e['in'])} and was in the shop until {day(e['out'])}, so if you missed it, it's gone for now.", 0.4)
claim("Mega Man Bundle has the highest listed price of the week's new bundles; Rush sidekick", "Mega Man Bundle", '"Rush (Mega Man)"')

# 2. new this week
p = say("Now, the new stuff. These all went live this week.")
S.append({"type": "title", "p": p, "chapter": "New this week", "kicker": "NEW THIS WEEK", "lines": ["Fresh in", "the shop"]})
e = show("Masters of the Universe Bundle", ["He-Man", "Skeletor", "She-Ra"])
say(f"On {day(e['in'])}, the Masters of the Universe Bundle. He-Man, Skeletor and She-Ra, {len(e['items'])} items for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
say(f"That one was in the shop until {day(e['out'])}.", 0.4)
e = show("J Balvin Bundle", ["J Balvin"])
j, jm = bundle("Jurassic J Bundle")
say(f"On {day(e['in'])}, J Balvin, with the J Balvin Bundle for {vb(e['final'])} and the Jurassic J Bundle for {vb(j['final'])}. Both were in until {day(e['out'])}.", 0.4)
claim("Jurassic J Bundle", "Jurassic J Bundle", jm)
e = show("Black Cat Bundle", ["Black Cat"])
s2, sm = bundle("Spider-Man Zero Bundle")
say(f"On {day(e['in'])}, Marvel. The Black Cat Bundle for {vb(e['final'])}, and the Spider-Man Zero Bundle for {vb(s2['final'])}.", 0.4)
claim("Spider-Man Zero Bundle", "Spider-Man Zero Bundle", sm)
e = show("Lil Uzi Vert Bundle", ["Lil Uzi Vert", "Pink Star Lil Uzi Vert"])
say(f"On {day(e['in'])}, the Lil Uzi Vert Bundle. {len(e['items'])} items for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
say(f"And this one stays a while, until {day(e['out'])}.", 0.4)
e = show("Jason Bundle", ["Jason"])
say(f"Also on {day(e['in'])}, the Jason Bundle, for {vb(e['final'])} V-Bucks, until {day(e['out'])}.", 0.4)
e = show("PIRATE D. SPEEDY Bundle", ["PIRATE D. SPEEDY"])
say(f"And on {day(e['in'])}, the PIRATE D. SPEEDY Bundle, for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}. It's in the shop until {day(e['out'])}.", 0.4)

# pirate captains, sold on their own
p = say("Two more captains landed in the shop on their own.")
S.append({"type": "title", "p": p, "chapter": "New captains", "kicker": "NEW CAPTAINS", "lines": ["Buggy and", "Cap'n Miku"]})
e, m = single("Buggy")
S.append({"type": "items", "p": len(P), "title": f"Buggy · {vb(e['final'])} V-Bucks", "items": [it("Buggy")]})
say(f"On {day(e['in'])}, Buggy, with his coat and knives, for {vb(e['final'])} V-Bucks. He stays until {day(e['out'])}.")
claim(f"Buggy entry {e['final']}, in {e['in']} out {e['out']}", "Buggy", m)
e, m = single("Cap'n Hatsune Miku")
S.append({"type": "items", "p": len(P), "title": f"Cap'n Hatsune Miku · {vb(e['final'])}", "items": [it("Cap'n Hatsune Miku")]})
say(f"And on {day(e['in'])}, Cap'n Hatsune Miku. The full set is {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}, with {len(e['items'])} items, until {day(e['out'])}.", 0.4)
claim(f"Cap'n Hatsune Miku entry {e['final']} (listed {e['regular']}), {len(e['items'])} items, in {e['in']} out {e['out']}", "Cap'n Hatsune Miku", m)

p = say("If you're grabbing any of these, use code BAD in the Item Shop. It really helps the channel.", 0.4)
S.append({"type": "code", "p": p})

# 3. more new bundles
p = say("A few more bundles showed up during the week.")
S.append({"type": "title", "p": p, "chapter": "More new bundles", "kicker": "MORE NEW BUNDLES", "lines": ["The rest of", "the new drops"]})
e = show("Escape Artists Bundle", ["Alias", "Caper", "Heartline"])
say(f"On {day(e['in'])}, the Escape Artists Bundle, with {len(e['items'])} items for {vb(e['final'])} V-Bucks. That's the most items in one bundle this week.")
assert max(B[k]["items"].__len__() for k in new_b) == len(e["items"])
claim(f"Escape Artists Bundle has the most items ({len(e['items'])}) of the week's new bundles", "Escape Artists Bundle")
e = show("Grim Medicine Bundle", ["Scourge", "Plague"])
say(f"On {day(e['in'])}, the Grim Medicine Bundle, with Scourge and Plague, for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
e = show("Archetype Bundle", ["Archetype"])
say(f"And on {day(e['in'])}, the Archetype Bundle, for {vb(e['final'])}.", 0.4)
S.append({"type": "stat", "p": len(P), "big": str(len(new_b)), "label": "new bundles this week"})
say(f"Add it all up, and {len(new_b)} new bundles went live this week.", 0.4)
claim(f"{len(new_b)} bundles with an in date {FIRST}..{LAST}", *new_b)

# new today
p = say("And a big batch landed in today's shop.")
S.append({"type": "title", "p": p, "chapter": "New today", "kicker": "NEW TODAY", "lines": ["Fresh this", "morning"]})
e = show("Gotham City Summer Bundle", ["Beach Bod Batman", "Coastal Catwoman"])
say(f"The Gotham City Summer Bundle, with Beach Bod Batman and Coastal Catwoman. {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
e = show("High Tide Harley & Chlorophyll Ivy Bundle", ["High Tide Harley", "Chlorophyll Ivy"])
say(f"High Tide Harley and Chlorophyll Ivy, for {vb(e['final'])}.")
e = show("Hatsune Miku Bundle", ["Hatsune Miku"])
say(f"The Hatsune Miku Bundle, for {vb(e['final'])}, listed at {vb(e['regular'])}.")
e = show("Shohei Ohtani Bundle", ["Shohei Ohtani", "Samurai Shohei"])
say(f"And the Shohei Ohtani Bundle, with Shohei Ohtani and Samurai Shohei, for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
say(f"All four are in the shop until {day(e['out'])}.")
e = show("Candywing's Glitch Locker Bundle", ["Glitch"])
say(f"Plus Candywing's Glitch Locker Bundle, with the Glitch outfit and {len(e['items']) - 1} more items, for {vb(e['final'])}, until {day(e['out'])}.", 0.4)
for n in ("Gotham City Summer Bundle", "High Tide Harley & Chlorophyll Ivy Bundle", "Hatsune Miku Bundle"):
    assert B[n]["out"] == B["Shohei Ohtani Bundle"]["out"]

# 4. OGs
p = say("Now, the OG check. These Chapter 1 outfits were all in the shop this week.")
S.append({"type": "title", "p": p, "chapter": "OG check", "kicker": "OG CHECK", "lines": ["Chapter 1", "returns"]})
OG = [("Snorkel Ops", 2), ("Radiant Striker", 3), ("Sleuth", 4), ("Bandolier", 4), ("Overtaker", 5), ("Archetype", 5), ("Moniker", 5),
      ("Tender Defender", 6), ("Arachne", 6), ("Flapjackie", 6), ("Firewalker", 7), ("Deep Sea Destroyer", 7), ("Signature Sniper", 9)]
S.append({"type": "items", "p": len(P), "title": "Chapter 1 OGs this week", "items": [it(n) for n in ("Snorkel Ops", "Radiant Striker", "Sleuth", "Bandolier")]})
say("Snorkel Ops, from Chapter 1, Season 2. That's the oldest one this week.")
say("Radiant Striker, from Season 3, and Sleuth and Bandolier, from Season 4.")
S.append({"type": "items", "p": len(P), "title": "Chapter 1 OGs this week", "items": [it(n) for n in ("Overtaker", "Archetype", "Moniker", "Tender Defender", "Arachne")]})
say("Overtaker, Archetype and Moniker, from Season 5. Overtaker was in the shop all seven days.")
say("Tender Defender, Arachne and Flapjackie, from Season 6.")
S.append({"type": "items", "p": len(P), "title": "Chapter 1 OGs this week", "items": [it(n) for n in ("Firewalker", "Deep Sea Destroyer", "Signature Sniper")]})
say("Firewalker and Deep Sea Destroyer, from Season 7, and Signature Sniper, from Season 9.", 0.4)
for n, s in OG:
    claim(f"{n}: Chapter 1, Season {s}", f'"name": "{n}", "introduction": "Introduced in Chapter 1, Season {s}."')
ov = [d for d, v in week["introduced"].items() if any(x.get("name") == "Overtaker" for x in v.values())]
assert len(ov) == 7, ov

# still here for weeks
p = say("And some bundles are sticking around for weeks.")
S.append({"type": "title", "p": p, "chapter": "Still in the shop", "kicker": "STILL HERE", "lines": ["In the shop", "for weeks"]})
e = show("One Piece Bundle", ["Monkey D. Luffy", "Nami", "Usopp"])
s3, sm3 = bundle("Straw Hats Bundle")
say(f"The One Piece Bundle, {vb(e['final'])} V-Bucks, and the Straw Hats Bundle, {vb(s3['final'])}, are both in the shop until {day(e['out'])}.")
claim("Straw Hats Bundle", "Straw Hats Bundle", sm3)
e = show("A$AP Rocky Bundle", ["Helicopter Flacko", "Rocky Rugahand"])
say(f"And the A$AP Rocky Bundle is still {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}, until {day(e['out'])}.", 0.4)

# 5. gone this week
p = say("Some big ones also left the shop this week.")
S.append({"type": "title", "p": p, "chapter": "Gone this week", "kicker": "GONE THIS WEEK", "lines": ["Last chance", "was this week"]})
e = show("Star Wars Samurai Bundle", ["Darth Vader Samurai", "Stormtrooper Samurai"])
say(f"The Star Wars Samurai Bundle was in the shop until {day(e['out'])}.")
e = show("Golden King Bundle", ["Ascendant Midas"])
say(f"So was the Golden King Bundle, with Ascendant Midas.")
e = show("Cyber Infiltration Pack", ["Chigusa", "Megumi", "Yuki"])
say(f"And the Cyber Infiltration Pack was in until {day(e['out'])}.", 0.4)

# leaving tomorrow
k = show("Katalina Bundle", ["Katalina"], title="Katalina · until Nov 17")
p = len(P) - 0
S.insert(len(S) - 1, {"type": "title", "p": p, "chapter": "Leaving soon", "kicker": "LEAVING SOON", "lines": ["In the shop", "until Nov 17"]})
S[-1]["p"] = p
say("And one is leaving fast. The Katalina Bundle came in today and is only in the shop until tomorrow, November 17th.")
say(f"{vb(k['final'])} V-Bucks, listed at {vb(k['regular'])}.", 0.4)
assert k["in"] == LAST and k["out"] == "2026-11-17"

# 6. recap
p = say("Quick recap.")
S.append({"type": "title", "p": p, "chapter": "Recap", "kicker": "QUICK RECAP", "lines": ["Mega Man · Lil Uzi Vert", "Gotham · Hatsune Miku · Ohtani"]})
say("Biggest bundle: Mega Man. Staying the longest: Cap'n Hatsune Miku, until December 14th, and the Lil Uzi Vert Bundle, until December 12th.")
say(f"New today: Gotham City Summer, Hatsune Miku and Shohei Ohtani. {len(new_b)} new bundles in seven days, and {len(OG)} Chapter 1 OGs in the shop.")
say("Which bundle did you grab this week? Tell me in the comments!", 0.4)
p = say("Use code BAD in the Item Shop. It really helps the channel.")
S.append({"type": "code", "p": p})
say("Thank you for watching! Follow for more daily content.", 0.6)

json.dump({"title": "This Week's Fortnite Item Shop", "caption": "#EpicPartner Everything in the Fortnite Item Shop this week. Use code BAD in the Item Shop.\n#Fortnite #FortniteItemShop",
           "claims": C, "segments": S}, open(D + "/long.json", "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": P}, open(D + "/vo.json", "w"), indent=1, ensure_ascii=False)
json.dump({"youtubeTitle": f"This Week's Fortnite Item Shop 🛒 Mega Man, Lil Uzi Vert, Batman & {len(OG)} OGs (Nov 10 - Nov 16)",
           "youtube": "#EpicPartner Everything that hit the Fortnite Item Shop this week 🛒 Mega Man, Masters of the Universe, Lil Uzi Vert, "
                      "J Balvin, Black Cat, PIRATE D. SPEEDY, today's Gotham City Summer, Hatsune Miku and Shohei Ohtani bundles, "
                      f"and {len(OG)} Chapter 1 OGs.\n\nWhich bundle did you grab this week? Tell me in the comments 👇\n\nUse code BAD in the Item Shop 💛\n\n{{chapters}}\n\n#Fortnite #FortniteItemShop #MegaMan",
           "tags": ["fortnite", "fortnite item shop", "item shop this week", "mega man fortnite", "lil uzi vert fortnite", "fortnite batman", "fortnite og skins"],
           "thumb_t": 1.6}, open(D + "/post.json", "w"), indent=1, ensure_ascii=False)
print(len(P), "phrases,", len(S), "segments,", len(C), "claims,", sum(len(x["text"].split()) for x in P), "words")
