"""Builds brand/badroyale/video/long/2026-11-23-week-item-shop from the saved shop archive (run from repo root).

Facts: brand/badroyale/shop/archive/<day>.json (one Item Shop snapshot per reset, saved by the SHOP run) for
2026-11-17..2026-11-23, each day's history.json ('Introduced in' lines from Epic's cosmetics data), and today's
full shop.json. Combined into sources/week.json; claims match its exact text.
"""
import glob
import json
import os
import urllib.request

FIRST, LAST = "2026-11-17", "2026-11-23"
D = "brand/badroyale/video/long/2026-11-23-week-item-shop"
REL = "../../badroyale/video/long/2026-11-23-week-item-shop"
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
FN = {}
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
    FN[name] = fn
    o = {"img": f"{REL}/img/{fn}", "name": name, "rarity": rar}
    if price:
        o["price"] = price
    return o


P, S, C = [], [], []
SAY = {"Kaiju No. 8": "Kaiju Number 8", "D.Va": "Dee Va", "LAROI": "Laroi", "CouRage": "Courage", "Dr. Doofenshmirtz": "Doctor Doofenshmirtz",
       "2D": "Two D", "B.R.U.T.E.": "Brute", "Season X": "Season Ten", "Spyro": "Spyro"}


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




def featured(name):
    """transparent featured art for the thumbnail (house style)"""
    cid = FN[name][:-4]
    fn = f"featured-{cid}.png"
    if not os.path.exists(f"{D}/img/{fn}"):
        url = f"https://fortnite-api.com/images/cosmetics/br/{cid}/featured.png"
        open(f"{D}/img/{fn}", "wb").write(urllib.request.urlopen(url, timeout=60).read())
        from PIL import Image
        Image.open(f"{D}/img/{fn}").convert("RGBA").save(f"{D}/img/{fn}")  # palette PNGs render blank
    return f"img/{fn}"


# ---------------- script ----------------
p = say("This is this week's Fortnite Item Shop! The biggest bundles, every new drop, and every OG that came back.")
say(f"Seven days of the shop, from {day(FIRST)} to {day(LAST)}, straight from Epic's own Item Shop data.")
say("Let's get into it!", 0.4)
S.append({"type": "title", "p": p, "kicker": "NOV 17 - NOV 23", "lines": ["This Week's", "Item Shop"]})

new_b = sorted(k for k, v in B.items() if FIRST <= v["in"] <= LAST and k.endswith("Bundle"))
big = max(new_b, key=lambda k: B[k]["regular"])
assert big == "Overwatch Bundle", big
most = max(new_b, key=lambda k: len(B[k]["items"]))
assert most == "Overwatch Bundle", most

# 1. biggest bundle
p = say("First, the biggest new bundle of the week.")
S.append({"type": "title", "p": p, "chapter": "Biggest bundle of the week", "kicker": "BIGGEST BUNDLE", "lines": ["Overwatch"]})
e = show("Overwatch Bundle", ["Mercy", "D.Va", "Tracer", "Genji"])
say(f"The Overwatch Bundle! Mercy, D.Va, Tracer and Genji, all in one. {len(e['items'])} items, the most in any new bundle this week.")
say(f"Listed at {vb(e['regular'])} V-Bucks, it's {vb(e['final'])}. That's the highest listed price of the week, too.")
dv, dm = bundle("D.Va")
say(f"Each hero is also sold on their own for {vb(dv['final'])} V-Bucks.")
for h in ("Mercy", "Tracer", "Genji"):
    he, hm = bundle(h)
    assert he["final"] == dv["final"]
    claim(f"{h} entry {he['final']}", h, hm)
claim(f"D.Va entry {dv['final']}", "D.Va", dm)
say(f"It went live on {day(e['in'])}, and it's in the shop until {day(e['out'])}, so you've got time.", 0.4)
claim("Overwatch Bundle has the highest listed price and most items of the week's new bundles", "Overwatch Bundle")

# 2. new this week
p = say("Now, the new stuff. These all went live this week.")
S.append({"type": "title", "p": p, "chapter": "New this week", "kicker": "NEW THIS WEEK", "lines": ["Fresh in", "the shop"]})
e = show("Kaiju No. 8 Bundle", ["Kafka Hibino", "Kikoru Shinomiya", "Reno Ichikawa"])
say(f"On {day(e['in'])}, the Kaiju No. 8 Bundle. Kafka Hibino, Kikoru Shinomiya and Reno Ichikawa, {len(e['items'])} items for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
say(f"That one was in the shop until {day(e['out'])}.", 0.4)
e = show("Madison Beer Bundle", ["Make You Mine Madison", "Satin Angel Madison"])
say(f"Also on {day(e['in'])}, the Madison Beer Bundle, with Make You Mine Madison and Satin Angel Madison, for {vb(e['final'])}, until {day(e['out'])}.", 0.4)
e = show("Naruto & Kakashi Bundle", ["Naruto Uzumaki", "Kakashi Hatake", "Sasuke Uchiha", "Sakura Haruno"], title="Naruto · four bundles")
for n in ("Sasuke & Sakura Bundle", "Gaara & Hinata Bundle", "Itachi & Orochimaru Bundle"):
    x, xm = bundle(n)
    assert x["in"] == e["in"] and x["out"] == e["out"]
    claim(n, n, xm)
g, gm = bundle("Gaara & Hinata Bundle")
say(f"On {day(e['in'])}, Naruto! Four bundles at once. Naruto and Kakashi for {vb(e['final'])}, Sasuke and Sakura, Gaara and Hinata, and Itachi and Orochimaru.")
say(f"The priciest of the four was Gaara and Hinata, at {vb(g['final'])}. All four were in until {day(e['out'])}.", 0.4)
assert max(B[n]["final"] for n in ("Naruto & Kakashi Bundle", "Sasuke & Sakura Bundle", "Gaara & Hinata Bundle", "Itachi & Orochimaru Bundle")) == g["final"]
e = show("Falcon Clan Bundle", ["Kuno", "Kenji"])
say(f"Same day, the Falcon Clan Bundle, with Kuno and Kenji, for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}. It was only around until {day(e['out'])}.", 0.4)
e = show("CouRage Bundle", ["CouRage", "Courageous Knight"])
say(f"On {day(e['in'])}, the CouRage Bundle, {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
e = show("Regular Show Bundle", ["Mordecai", "Skips"])
say(f"And the Regular Show Bundle, with Mordecai and Skips, for {vb(e['final'])}. That one is in the shop until {day(e['out'])}, today.", 0.4)
e = show("Cowboy Bebop Bundle", ["Spike Spiegel", "Faye Valentine"])
say(f"On {day(e['in'])}, the Cowboy Bebop Bundle, with Spike Spiegel and Faye Valentine, for {vb(e['final'])} V-Bucks, also until {day(e['out'])}.")
e = show("Kim Kardashian Bundle", ["Kim Kardashian", "Iconic Kim Kardashian"])
say(f"The Kim Kardashian Bundle, for {vb(e['final'])}, listed at {vb(e['regular'])}.")
e = show("The Kid LAROI Bundle", ["The Kid LAROI", "The Rogue LAROI"])
say(f"And The Kid LAROI Bundle, for {vb(e['final'])}, in the shop until {day(e['out'])}.", 0.4)
e = show("Ice Spice Bundle", ["Ice Spice", "Rap Princess Ice Spice"])
say(f"On {day(e['in'])}, the Ice Spice Bundle, with Ice Spice and Rap Princess Ice Spice, for {vb(e['final'])} V-Bucks.", 0.4)
e = show("Noodle & 2D Bundle", ["Noodle", "2D"])
say(f"On {day(e['in'])}, Noodle and 2D, for {vb(e['final'])}. Listed at {vb(e['regular'])}, so that's {vb(e['regular'] - e['final'])} under the listed price.")
e = show("Crash Bandicoot & Spyro the Dragon Bundle", ["Crash Bandicoot"], title="Crash & Spyro · 3,000")
say(f"And the Crash Bandicoot and Spyro the Dragon Bundle, for {vb(e['final'])} V-Bucks, until {day(e['out'])}.", 0.4)

p = say("If you're grabbing any of these, use code BAD in the Item Shop. It really helps the channel.", 0.4)
S.append({"type": "code", "p": p})

# creators
p = say("It was a big week for creators too.")
S.append({"type": "title", "p": p, "chapter": "Creator bundles", "kicker": "CREATORS", "lines": ["Creator", "bundles"]})
e = show("Lazarbeam Bundle", ["Lazarbeam"])
say(f"On {day(e['in'])}, the Lazarbeam Bundle, for {vb(e['final'])} V-Bucks.")
e = show("Lachlan Bundle", ["Lachlan"])
r, rm = bundle("Rubius Bundle")
say(f"On {day(e['in'])}, the Lachlan Bundle, for {vb(e['final'])}, and the Rubius Bundle, for {vb(r['final'])}.", 0.4)
S.append({"type": "items", "p": len(P) - 1, "title": f"Rubius · {vb(r['final'])}", "items": [it("Rubius")]})
claim("Rubius Bundle", "Rubius Bundle", rm, "Rubius")
S.append({"type": "stat", "p": len(P), "big": str(len(new_b)), "label": "new bundles this week"})
say(f"Add it all up, and {len(new_b)} new bundles went live this week.", 0.4)
claim(f"{len(new_b)} bundles with an in date {FIRST}..{LAST}", *new_b)

# new today
p = say("And a big batch landed in today's shop.")
S.append({"type": "title", "p": p, "chapter": "New today", "kicker": "NEW TODAY", "lines": ["Fresh this", "morning"]})
e = show("Pirates of the Caribbean Bundle", ["Davy Jones", "Elizabeth Swann", "Captain Barbossa"])
say(f"The Pirates of the Caribbean Bundle, with Davy Jones, Elizabeth Swann and Captain Barbossa. {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
e = show("Jack Sparrow Bundle", ["Jack Sparrow", "Cursed Jack Sparrow"])
say(f"Jack Sparrow gets his own bundle, with Cursed Jack Sparrow, for {vb(e['final'])}.")
e = show("Phineas and Ferb Bundle", ["Buff Perry", "Dr. Doofenshmirtz"])
say(f"And the Phineas and Ferb Bundle, with Buff Perry and Dr. Doofenshmirtz, for {vb(e['final'])} V-Bucks, listed at {vb(e['regular'])}.")
say(f"All three are in the shop until {day(e['out'])}.", 0.4)
for n in ("Pirates of the Caribbean Bundle", "Jack Sparrow Bundle"):
    assert B[n]["out"] == e["out"] and B[n]["in"] == LAST
assert e["in"] == LAST

# OGs
p = say("Now, the OG check. These Chapter 1 outfits were all in the shop this week.")
S.append({"type": "title", "p": p, "chapter": "OG check", "kicker": "OG CHECK", "lines": ["Chapter 1", "returns"]})
OG = [("Love Ranger", "2"), ("Bandolier", "4"), ("Scoundrel", "4"), ("Moniker", "5"), ("Grill Sergeant", "5"), ("Growler", "6"), ("Ludwig", "6"),
      ("Heidi", "6"), ("Deep Sea Destroyer", "7"), ("Firewalker", "7"), ("Kuno", "8"), ("Kenji", "8"), ("Sterling", "8"), ("Guild", "8"),
      ("Sunflower", "8"), ("Hayseed", "8"), ("Branded Brigadier", "9"), ("B.R.U.T.E. Navigator", "X"), ("Ruby", "X"), ("Stoneheart", "X"), ("Bronto", "X")]
S.append({"type": "items", "p": len(P), "title": "Chapter 1 OGs this week", "items": [it(n) for n in ("Love Ranger", "Bandolier", "Scoundrel", "Moniker", "Grill Sergeant")]})
say("Love Ranger, from Chapter 1, Season 2. That's the oldest one this week, and it came back with Stoneheart in the Hearts of Stone Bundle.")
say("Bandolier and Scoundrel, from Season 4, and Moniker and Grill Sergeant, from Season 5.")
S.append({"type": "items", "p": len(P), "title": "Chapter 1 OGs this week", "items": [it(n) for n in ("Growler", "Ludwig", "Heidi", "Deep Sea Destroyer", "Firewalker")]})
say("Growler, Ludwig and Heidi, from Season 6. Deep Sea Destroyer and Firewalker, from Season 7.")
S.append({"type": "items", "p": len(P), "title": "Chapter 1 OGs this week", "items": [it(n) for n in ("Sterling", "Guild", "Sunflower", "Hayseed", "Branded Brigadier")]})
say("From Season 8, Kuno and Kenji from the Falcon Clan Bundle, plus Sterling, Guild, Sunflower and Hayseed. And Branded Brigadier, from Season 9.")
S.append({"type": "items", "p": len(P), "title": "Chapter 1 OGs this week", "items": [it(n) for n in ("B.R.U.T.E. Navigator", "Ruby", "Stoneheart", "Bronto")]})
say("And from Season X, B.R.U.T.E. Navigator, Ruby, Stoneheart and Bronto.")
say("Scoundrel, Branded Brigadier, B.R.U.T.E. Navigator and Ruby were in the shop all seven days.", 0.4)
for n, s in OG:
    claim(f"{n}: Chapter 1, Season {s}", f'"name": "{n}", "introduction": "Introduced in Chapter 1, Season {s}."')
for n in ("Scoundrel", "Branded Brigadier", "B.R.U.T.E. Navigator", "Ruby"):
    ds = [d for d, v in week["introduced"].items() if any(x.get("name") == n for x in v.values())]
    assert len(ds) == 7, (n, ds)
hs, hsm = bundle("Hearts of Stone Bundle")
assert "Love Ranger" in [i[0] for i in hs["items"]] and "Stoneheart" in [i[0] for i in hs["items"]]
claim("Hearts of Stone Bundle has Love Ranger and Stoneheart", "Hearts of Stone Bundle", hsm, "Love Ranger", "Stoneheart")
assert {"Kuno", "Kenji"} <= {i[0] for i in B["Falcon Clan Bundle"]["items"]}

# still here for weeks
p = say("And some bundles are sticking around for weeks.")
S.append({"type": "title", "p": p, "chapter": "Still in the shop", "kicker": "STILL HERE", "lines": ["In the shop", "for weeks"]})
e = show("One Piece Bundle", ["Monkey D. Luffy", "Nami", "Usopp"])
s3, sm3 = bundle("Straw Hats Bundle")
say(f"The One Piece Bundle, {vb(e['final'])} V-Bucks, and the Straw Hats Bundle, {vb(s3['final'])}, are both in the shop until {day(e['out'])}.")
claim("Straw Hats Bundle", "Straw Hats Bundle", sm3)
e = show("A$AP Rocky Bundle", ["Helicopter Flacko", "Rocky Rugahand"])
say(f"The A$AP Rocky Bundle is still {vb(e['final'])} V-Bucks, until {day(e['out'])}.")
e = show("Lil Uzi Vert Bundle", ["Lil Uzi Vert", "Pink Star Lil Uzi Vert"])
say(f"And the Lil Uzi Vert Bundle, {vb(e['final'])}, is in until {day(e['out'])}.", 0.4)

# leaving tomorrow
p = say("And a few are leaving fast.")
S.append({"type": "title", "p": p, "chapter": "Leaving soon", "kicker": "LEAVING SOON", "lines": ["In the shop", "until Nov 24"]})
LEAVE = ["Kim Kardashian Bundle", "Ice Spice Bundle", "Noodle & 2D Bundle", "Rubius Bundle", "Lachlan Bundle"]
for n in LEAVE:
    assert B[n]["out"] == "2026-11-24", n
    claim(f"{n} out 2026-11-24", n, '"out": "2026-11-24"')
S.append({"type": "items", "p": len(P), "title": "Until Nov 24", "items": [it(n) for n in ("Kim Kardashian", "Ice Spice", "Noodle", "Rubius", "Lachlan")]})
say("Kim Kardashian, Ice Spice, Noodle and 2D, Rubius and Lachlan are all in the shop until tomorrow, November 24th.", 0.4)

# recap
p = say("Quick recap.")
S.append({"type": "title", "p": p, "chapter": "Recap", "kicker": "QUICK RECAP", "lines": ["Overwatch · Kaiju No. 8 · Naruto", "Pirates · Phineas and Ferb"]})
say(f"Biggest bundle: Overwatch, in the shop until {day(B['Overwatch Bundle']['out'])}.")
say(f"New today: Pirates of the Caribbean, Jack Sparrow, and Phineas and Ferb. {len(new_b)} new bundles in seven days, and {len(OG)} Chapter 1 OGs in the shop.")
say("Which bundle did you grab this week? Tell me in the comments!", 0.4)
p = say("Use code BAD in the Item Shop. It really helps the channel.")
S.append({"type": "code", "p": p})
say("Thank you for watching! Follow for more daily content.", 0.6)

json.dump({"title": "This Week's Fortnite Item Shop", "caption": "#EpicPartner Everything in the Fortnite Item Shop this week. Use code BAD in the Item Shop.\n#Fortnite #FortniteItemShop",
           "claims": C, "segments": S}, open(D + "/long.json", "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": P}, open(D + "/vo.json", "w"), indent=1, ensure_ascii=False)
yt = f"This Week's Fortnite Item Shop 🛒 Overwatch, Kaiju No. 8, Naruto & {len(OG)} OGs (Nov 17 - Nov 23)"
assert len(yt) <= 100, len(yt)
json.dump({"youtubeTitle": yt,
           "youtube": "#EpicPartner Everything that hit the Fortnite Item Shop this week 🛒 Overwatch, Kaiju No. 8, Naruto, Madison Beer, "
                      "Regular Show, Cowboy Bebop, Kim Kardashian, Ice Spice, today's Pirates of the Caribbean and Phineas and Ferb bundles, "
                      f"and {len(OG)} Chapter 1 OGs.\n\nWhich bundle did you grab this week? Tell me in the comments 👇\n\nUse code BAD in the Item Shop 💛\n\n{{chapters}}\n\n#Fortnite #FortniteItemShop #Overwatch",
           "tags": ["fortnite", "fortnite item shop", "item shop this week", "overwatch fortnite", "kaiju no 8 fortnite", "naruto fortnite", "fortnite og skins"],
           "thumb": {"lines": ["THIS WEEK"], "big": "OVERWATCH", "chip": "NOV 17 - NOV 23",
                     "chars": [featured("D.Va"), featured("Tracer")]}}, open(D + "/post.json", "w"), indent=1, ensure_ascii=False)
print(len(P), "phrases,", len(S), "segments,", len(C), "claims,", sum(len(x["text"].split()) for x in P), "words")
