"""Builds brand/badroyale/video/long/2026-11-09-week-item-shop from the saved shop archive (run from repo root).

Facts: brand/badroyale/shop/archive/<day>.json (one Item Shop snapshot per reset, saved by the SHOP run) for
2026-11-03..2026-11-09, each day's history.json ('Introduced in' lines from Epic's cosmetics data), and today's
full shop.json. Combined into sources/week.json; claims match its exact text.
"""
import glob
import json
import os
import urllib.request

FIRST, LAST = "2026-11-03", "2026-11-09"
D = "brand/badroyale/video/long/2026-11-09-week-item-shop"
REL = "../../badroyale/video/long/2026-11-09-week-item-shop"
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
SAY = {"HUNTR/X": "Huntrix", "Ben 10": "Ben Ten"}


def say(text, pause=0.25):
    d = {"text": text, "pause": pause}
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
    S.append({"type": "items", "p": len(P), "title": title or f"{name} · {vb(e['final'])} V-Bucks", "items": [it(o) for o in outfits]})
    claim(f"{name}: {e['final']} (listed {e['regular']}), in {e['in']} out {e['out']}", name, m, *outfits)
    return e


# ---------------- script ----------------
p = say("This is this week's Fortnite Item Shop! The biggest bundles, every new drop, and every OG that came back.")
say(f"Seven days of the shop, from {day(FIRST)} to {day(LAST)}, straight from Epic's own Item Shop data.")
say("Let's get into it!", 0.4)
S.append({"type": "title", "p": p, "kicker": "NOV 3 - NOV 9", "lines": ["This Week's", "Item Shop"]})

# 1. biggest bundle
p = say("First, the biggest bundle of the week.")
S.append({"type": "title", "p": p, "chapter": "Biggest bundle of the week", "kicker": "BIGGEST BUNDLE", "lines": ["Adventure", "Time"]})
e = show("Adventure Time Bundle", ["Finn the Human", "Jake the Dog", "Princess Bubblegum", "Marceline"])
say(f"The Adventure Time Bundle! Finn, Jake, Princess Bubblegum, Marceline, and more. {len(e['items'])} items.")
say(f"Listed at {vb(e['regular'])} V-Bucks, it sold for {vb(e['final'])}.")
say(f"It was in the shop until {day(e['out'])}, so if you missed it, it's gone for now.", 0.4)

# 2. new this week, the big ones
p = say("Now, the new stuff. These all went live this week.")
S.append({"type": "title", "p": p, "chapter": "New this week", "kicker": "NEW THIS WEEK", "lines": ["Fresh in", "the shop"]})
e = show("A$AP Rocky Bundle", ["Helicopter Flacko", "Rocky Rugahand"])
say(f"On {day(e['in'])}, the A$AP Rocky Bundle dropped, with Helicopter Flacko and Rocky Rugahand.")
say(f"{len(e['items'])} items for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}. And it stays until {day(e['out'])}.", 0.4)
e = show("Straw Hats Bundle", ["Roronoa Zoro", "Sanji"])
say(f"On {day(e['in'])}, more One Piece. The Straw Hats Bundle, with Roronoa Zoro and Sanji, for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
o, _ = bundle("One Piece Bundle")
say(f"It's in the shop until {day(e['out'])}, and the One Piece Bundle stays until {day(o['out'])} too.", 0.4)
claim("One Piece Bundle out 12-05", "One Piece Bundle", f'"out": "{o["out"]}"')
e = show("KPop Demon Hunters Bundle", ["Rumi (HUNTR/X)", "Mira (HUNTR/X)", "Zoey (HUNTR/X)"])
say(f"On {day(e['in'])}, the KPop Demon Hunters Bundle. Rumi, Mira and Zoey of HUNTR/X, for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
say(f"That one was in the shop until {day(e['out'])}.", 0.4)
e = show("Ben 10 Bundle", ["Ben Tennyson", "Gwen Tennyson"])
say(f"On {day(e['in'])}, the Ben 10 Bundle, with Ben and Gwen Tennyson. {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}, until {day(e['out'])}.", 0.4)
e = show("Star Wars Samurai Bundle", ["Darth Vader Samurai", "Stormtrooper Samurai"])
say(f"And today, the Star Wars Samurai Bundle. Darth Vader Samurai and Stormtrooper Samurai, {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.", 0.4)

p = say("If you're grabbing any of these, use code BAD in the Item Shop. It really helps the channel.", 0.4)
S.append({"type": "code", "p": p})

# 3. more new bundles
p = say("A lot more bundles showed up during the week.")
S.append({"type": "title", "p": p, "chapter": "More new bundles", "kicker": "MORE NEW BUNDLES", "lines": ["The rest of", "the new drops"]})
e = show("Pumpkin King & Sally Bundle", ["Pumpkin King", "Sally"])
j, jm = bundle("Jack Skellington Bundle")
say(f"On {day(e['in'])}, the Pumpkin King and Sally Bundle for {vb(e['final'])}, with a Jack Skellington Bundle for {vb(j['final'])}.")
claim("Jack Skellington Bundle", "Jack Skellington Bundle", jm)
e = show("Lola Bunny & Daffy Duck Bundle", ["Lola Bunny", "Daffy Duck"])
say(f"On {day(e['in'])}, Lola Bunny and Daffy Duck, {vb(e['final'])} V-Bucks for the pair.")
e = show("Rambo Bundle", ["John Rambo"])
say(f"On {day(e['in'])}, the Rambo Bundle, for {vb(e['final'])} V-Bucks.")
e = show("Champions of Mandalore Bundle", ["Mandalorian Warrior"])
say(f"And the Champions of Mandalore Bundle, for {vb(e['final'])} V-Bucks.")
e = show("Edward Scissorhands Bundle", ["Edward Scissorhands"])
say(f"On {day(e['in'])}, the Edward Scissorhands Bundle, for {vb(e['final'])} V-Bucks.")
e = show("Deadpool Mashups", ["Ravenpool", "Cuddlepool"])
say(f"And on {day(e['in'])}, Deadpool Mashups, with Ravenpool and Cuddlepool, for {vb(e['final'])} V-Bucks.", 0.4)

# one-day deal
e = show("Aerosol Assassins Bundle", ["Komplex", "Abstrakt"])
say(f"One more you might have missed. On {day(e['in'])}, the Aerosol Assassins Bundle, with Komplex and Abstrakt.")
say(f"{vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}, and it was in the shop until {day(e['out'])}.", 0.4)

# new today
p = say("And a few more landed in today's shop.")
S.append({"type": "title", "p": p, "chapter": "New today", "kicker": "NEW TODAY", "lines": ["Fresh this", "morning"]})
e = show("Golden King Bundle", ["Ascendant Midas"])
say(f"The Golden King Bundle, with Ascendant Midas, for {vb(e['final'])} V-Bucks.")
e = show("Orelia Bundle", ["Orelia"])
say(f"The Orelia Bundle, for {vb(e['final'])}.")
e = show("Cyber Infiltration Pack", ["Chigusa", "Megumi", "Yuki"])
say(f"And the Cyber Infiltration Pack, with Chigusa, Megumi and Yuki, for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.", 0.4)

# 4. OGs
p = say("Now, the OG check. These Chapter 1 outfits all came back this week.")
S.append({"type": "title", "p": p, "chapter": "OG check", "kicker": "OG CHECK", "lines": ["Chapter 1", "returns"]})
OG = [("Infiltrator", 1), ("Steelsight", 3), ("Abstrakt", 4), ("Dante", 6), ("Rosa", 6), ("Tender Defender", 6), ("Fishstick", 7), ("Skully", 7), ("Sparkplug", 7)]
S.append({"type": "items", "p": len(P), "title": "Chapter 1 OGs this week", "items": [it(n) for n, _ in OG[:5]]})
say("Infiltrator, from Chapter 1, Season 1. That's the oldest one this week.")
say("Steelsight, from Season 3, and Abstrakt, from Season 4.")
S.append({"type": "items", "p": len(P), "title": "Chapter 1 OGs this week", "items": [it(n) for n, _ in OG[5:]]})
say("Dante, Rosa and Tender Defender, all from Season 6.")
say("And Fishstick, Skully and Sparkplug, from Season 7.", 0.4)
for n, s in OG:
    claim(f"{n}: Chapter 1, Season {s}", f'"name": "{n}", "introduction": "Introduced in Chapter 1, Season {s}."')

# 5. gone this week
p = say("A few big ones also left the shop this week.")
S.append({"type": "title", "p": p, "chapter": "Gone this week", "kicker": "GONE THIS WEEK", "lines": ["Last chance", "was this week"]})
e = show("Ice King and Lemongrab Bundle", ["Ice King", "The Earl of Lemongrab"])
say(f"The Ice King and Lemongrab Bundle was in the shop until {day(e['out'])}, same as Adventure Time.")
e = show("Mariah Carey Bundle", ["Santa Suit Mariah", "Mariah Carey"])
say(f"The Mariah Carey Bundle was in the shop until {day(e['out'])}.")
e = show("Guardians of the Globe Bundle", ["Omni-Man", "Invincible", "Atom Eve"])
say(f"And the Guardians of the Globe Bundle, with Omni-Man, Invincible and Atom Eve, came in on {day(e['in'])} for {vb(e['final'])} V-Bucks and was in the shop until {day(e['out'])}, same as KPop Demon Hunters.", 0.4)

# 6. recap
p = say("Quick recap.")
S.append({"type": "title", "p": p, "chapter": "Recap", "kicker": "QUICK RECAP", "lines": ["A$AP Rocky · Straw Hats", "Ben 10 · Star Wars Samurai"]})
say("Biggest bundle: Adventure Time. Staying the longest: A$AP Rocky, the One Piece Bundle and the Straw Hats.")
say("New today: Star Wars Samurai. And nine Chapter 1 OGs came back.")
say("Which bundle did you grab this week? Tell me in the comments!", 0.4)
p = say("Use code BAD in the Item Shop. It really helps the channel.")
S.append({"type": "code", "p": p})
say("Thank you for watching! Follow for more daily content.", 0.6)

json.dump({"title": "This Week's Fortnite Item Shop", "caption": "#EpicPartner Everything in the Fortnite Item Shop this week. Use code BAD in the Item Shop.\n#Fortnite #FortniteItemShop",
           "claims": C, "segments": S}, open(D + "/long.json", "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": P}, open(D + "/vo.json", "w"), indent=1, ensure_ascii=False)
json.dump({"youtubeTitle": "This Week's Fortnite Item Shop 🛒 A$AP Rocky, Straw Hats, KPop Demon Hunters & 9 OGs (Nov 3 - Nov 9)",
           "youtube": "#EpicPartner Everything that hit the Fortnite Item Shop this week 🛒 the A$AP Rocky Bundle, the One Piece Straw Hats, "
                      "KPop Demon Hunters, Ben 10, Star Wars Samurai, and nine Chapter 1 OGs that came back.\n\n"
                      "Which bundle did you grab this week? Tell me in the comments 👇\n\nUse code BAD in the Item Shop 💛\n\n{chapters}\n\n#Fortnite #FortniteItemShop #OnePiece",
           "tags": ["fortnite", "fortnite item shop", "item shop this week", "asap rocky fortnite", "one piece fortnite", "kpop demon hunters fortnite", "fortnite og skins"],
           "thumb_t": 1.6}, open(D + "/post.json", "w"), indent=1, ensure_ascii=False)
print(len(P), "phrases,", len(S), "segments,", len(C), "claims")
