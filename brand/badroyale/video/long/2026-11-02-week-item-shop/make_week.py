"""Builds brand/badroyale/video/long/2026-11-02-week-item-shop from the saved shop archive (run from repo root)."""
import glob, json, os, urllib.request, datetime

D = "brand/badroyale/video/long/2026-11-02-week-item-shop"
REL = "../../badroyale/video/long/2026-11-02-week-item-shop"
os.makedirs(D + "/sources", exist_ok=True)
os.makedirs(D + "/img", exist_ok=True)

# ---- sources: the week's daily shop snapshots + Epic's intro lines, and today's full shop ----
days = sorted(glob.glob("brand/badroyale/shop/archive/*.json"))
week = {"note": "Daily Item Shop snapshots saved by the SHOP run at each reset, 2026-10-28 to 2026-11-02, plus each day's 'Introduced in' lines from Epic's cosmetics data.",
        "shop_days": {}, "introduced": {}}
for f in days:
    d = json.load(open(f))
    week["shop_days"][d["date"]] = d["entries"]
for f in sorted(glob.glob("brand/badroyale/shop/2026-1*/history.json")):
    week["introduced"][f.split("/")[3]] = json.load(open(f))
json.dump(week, open(D + "/sources/week.json", "w"), indent=1, ensure_ascii=False)
shop_now = json.load(open("brand/badroyale/shop/2026-11-02/shop.json"))
json.dump(shop_now, open(D + "/sources/shop-2026-11-02.json", "w"), indent=1, ensure_ascii=False)
m_now = json.load(open("brand/badroyale/shop/2026-11-02/manifest.json"))
fetched_now = next((f["fetched_utc"] for f in m_now.get("files", []) if "fetched_utc" in f), None) or m_now.get("fetched_utc")
json.dump({"via": "fortnite-api.com (mirror of Epic's Item Shop and cosmetics data)", "files": [
    {"file": "week.json", "source": "Item Shop archive 2026-10-28..2026-11-02 (one snapshot per reset) + 'Introduced in' lines",
     "url": "https://fortnite-api.com/v2/shop", "fetched_utc": fetched_now,
     "note": "fetched_utc is the newest snapshot in the file (today's reset); older days are the saved snapshots of their own resets"},
    {"file": "shop-2026-11-02.json", "source": "Item Shop for 2026-11-02", "url": "https://fortnite-api.com/v2/shop", "fetched_utc": fetched_now}]},
    open(D + "/sources/manifest.json", "w"), indent=1)

# ---- art: icons straight from the saved shop data ----
icons = {}
for day in ["2026-10-28", "2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]:
    s = json.load(open(f"brand/badroyale/shop/{day}/shop.json"))
    for e in s["data"]["entries"]:
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


P = []  # voice phrases


def say(text, pause=0.25):
    P.append({"text": text, "pause": pause})
    return len(P) - 1


S, C = [], []  # segments, claims


def claim(text, *match, src="week.json"):
    C.append({"text": text, "source": src, "match": list(match)})


# ---------------- script ----------------
p = say("This is this week's Fortnite Item Shop! Every big bundle, every new drop, and every OG that came back.")
say("Six days of the shop, from October 28th to November 2nd, straight from Epic's own Item Shop data.")
say("Let's get into it!", 0.4)
S.append({"type": "title", "p": p, "kicker": "OCT 28 - NOV 2", "lines": ["This Week's", "Item Shop"]})

# 1. biggest bundle
p = say("First, the biggest bundle of the whole week.")
q = say("The Five Nights at Freddy's Bundle!")
say("Freddy Fazbear, Foxy, Chica, Bonnie, and more. Eighteen items in total.")
say("Listed at 11,000 V-Bucks, it sold for 4,500.")
say("It was in the shop until October 31st, so if you missed it, it's gone for now.", 0.4)
S.append({"type": "title", "p": p, "chapter": "Biggest bundle of the week", "kicker": "BIGGEST BUNDLE", "lines": ["Five Nights", "at Freddy's"]})
S.append({"type": "items", "p": q, "title": "Five Nights at Freddy's · 4,500",
          "items": [it("Freddy Fazbear"), it("Foxy The Pirate"), it("Chica the Chicken"), it("Bonnie the Rabbit")]})
claim("FNAF Bundle: 18 items, 4,500 V-Bucks (listed 11,000), out 2026-10-31", "Five Nights at Freddy's Bundle", '"final": 4500, "regular": 11000, "in": "2026-10-01", "out": "2026-10-31"', "Foxy The Pirate", "Chica the Chicken", "Bonnie the Rabbit")

# 2. new this week
p = say("Now, the new stuff. These all went live this week.")
S.append({"type": "title", "p": p, "chapter": "New this week", "kicker": "NEW THIS WEEK", "lines": ["Fresh in", "the shop"]})
q = say("The Adventure Time Bundle landed today, November 2nd!")
say("Finn the Human, Jake the Dog, Princess Bubblegum, Marceline, and more. Thirteen items.")
say("It's 3,800 V-Bucks, listed at 10,300, and it's in the shop until November 6th.")
S.append({"type": "items", "p": q, "title": "Adventure Time Bundle · 3,800 V-Bucks",
          "items": [it("Finn the Human"), it("Jake the Dog"), it("Princess Bubblegum"), it("Marceline")]})
claim("Adventure Time Bundle: 13 items, 3,800 (listed 10,300), in 11-02 out 11-06", "Adventure Time Bundle", '"final": 3800, "regular": 10300, "in": "2026-11-02", "out": "2026-11-06"', "Finn the Human", "Jake the Dog", "Princess Bubblegum", "Marceline")
q = say("Right next to it, the Ice King and Lemongrab Bundle. 3,200 V-Bucks, listed at 5,400.", 0.4)
S.append({"type": "items", "p": q, "title": "Ice King & Lemongrab · 3,200 V-Bucks", "items": [it("Ice King"), it("The Earl of Lemongrab")]})
claim("Ice King and Lemongrab Bundle 3,200 (listed 5,400)", "Ice King and Lemongrab Bundle", '"final": 3200, "regular": 5400', "The Earl of Lemongrab")
q = say("On November 1st, the One Piece Bundle dropped.")
say("Monkey D. Luffy, Nami, and Usopp, fifteen items, for 4,000 V-Bucks, listed at 8,200.")
say("And this one sticks around. It's in the shop until December 3rd!", 0.4)
S.append({"type": "items", "p": q, "title": "One Piece Bundle · 4,000 V-Bucks", "items": [it("Monkey D. Luffy"), it("Nami"), it("Usopp")]})
claim("One Piece Bundle: Luffy, Nami, Usopp; 15 items; 4,000 (listed 8,200); in 11-01 out 12-03", "One Piece Bundle", '"final": 4000, "regular": 8200, "in": "2026-11-01", "out": "2026-12-03"', "Monkey D. Luffy", "Nami", "Usopp")
q = say("Same day, the Mariah Carey Bundle arrived. 2,800 V-Bucks, listed at 4,300, until November 4th.", 0.4)
S.append({"type": "items", "p": q, "title": "Mariah Carey Bundle · 2,800 V-Bucks", "items": [it("Santa Suit Mariah"), it("Mariah Carey"), it("Angelic Wings")]})
claim("Mariah Carey Bundle 2,800 (listed 4,300) out 11-04", "Mariah Carey Bundle", '"final": 2800, "regular": 4300, "in": "2026-11-01", "out": "2026-11-04"', "Santa Suit Mariah", "Angelic Wings")
q = say("And today, Harley Quinn is back too, with her own bundle for 2,000 V-Bucks.", 0.4)
S.append({"type": "items", "p": q, "title": "Harley Quinn Bundle · 2,000 V-Bucks", "items": [it("Harley Quinn")]})
claim("Harley Quinn Bundle 2,000 (listed 3,100) in 11-02", "Harley Quinn Bundle", '"final": 2000, "regular": 3100, "in": "2026-11-02"')
q = say("Also new today, the Catwoman Zero Bundle, 1,500 V-Bucks, listed at 2,000.", 0.4)
S.append({"type": "items", "p": q, "title": "Catwoman Zero Bundle · 1,500 V-Bucks", "items": [it("Catwoman Zero")]})
claim("Catwoman Zero Bundle 1,500 (listed 2,000) in 11-02 out 11-06", "Catwoman Zero Bundle", '"final": 1500, "regular": 2000, "in": "2026-11-02", "out": "2026-11-06"')
p = say("That's not all. A bunch more bundles showed up during the week.")
S.append({"type": "title", "p": p, "chapter": "More new bundles", "kicker": "MORE NEW BUNDLES", "lines": ["The rest of", "the new drops"]})
q = say("On October 29th, the HIT SQUAD Bundle, with Siren and Wolf, for 2,400 V-Bucks, listed at 3,700.")
S.append({"type": "items", "p": q, "title": "HIT SQUAD Bundle · 2,400 V-Bucks", "items": [it("Siren"), it("Wolf")]})
claim("HIT SQUAD BUNDLE 2,400 (listed 3,700) in 10-29, Siren and Wolf", "HIT SQUAD BUNDLE", '"final": 2400, "regular": 3700, "in": "2026-10-29", "out": "2026-10-31"', '"Siren"', '"Wolf"')
q = say("On October 30th, the Art the Clown Bundle, for 2,200.")
S.append({"type": "items", "p": q, "title": "Art the Clown Bundle · 2,200 V-Bucks", "items": [it("Art the Clown")]})
claim("Art the Clown Bundle 2,200 (listed 3,300) in 10-30 out 11-02", "Art the Clown Bundle", '"final": 2200, "regular": 3300, "in": "2026-10-30", "out": "2026-11-02"')
q = say("Same day, the Knightmare Bundle for 2,000, and the Focal Point Bundle, with Focus, for 1,800.")
S.append({"type": "items", "p": q, "title": "Knightmare · Focal Point", "items": [it("Knightmare", 2000), it("Focus", 1800)]})
claim("Knightmare Bundle 2,000 in 10-30; Focal Point Bundle 1,800 in 10-30 with Focus", "Knightmare Bundle", '"final": 2000, "regular": 2800, "in": "2026-10-30", "out": "2026-11-01"', "Focal Point Bundle", '"final": 1800, "regular": 3300, "in": "2026-10-30", "out": "2026-11-01"', '"Focus"')
q = say("And on October 31st, the Chaos Agent Bundle and the Xenomorph, Alien: Earth Bundle, both for 2,000 V-Bucks.", 0.4)
S.append({"type": "items", "p": q, "title": "Chaos Agent · Alien: Earth", "items": [it("Chaos Agent", 2000), it("Xenomorph (Alien: Earth)", 2000)]})
claim("Chaos Agent Bundle 2,000 in 10-31; Xenomorph (Alien: Earth) Bundle 2,000 in 10-31", "Chaos Agent Bundle", '"final": 2000, "regular": 2800, "in": "2026-10-31", "out": "2026-11-04"', "Xenomorph (Alien: Earth) Bundle", '"final": 2000, "regular": 2700, "in": "2026-10-31", "out": "2026-11-03"')

# 3. horror week
p = say("Halloween week brought the horror icons.")
S.append({"type": "title", "p": p, "chapter": "Halloween week", "kicker": "HALLOWEEN WEEK", "lines": ["The horror", "icons"]})
q = say("On October 28th, the A Nightmare on Elm Street Bundle came in, with Freddy Krueger, for 2,300 V-Bucks.")
S.append({"type": "items", "p": q, "title": "Nightmare on Elm Street · 2,300", "items": [it("Freddy Krueger")]})
claim("Elm Street Bundle in 10-28, 2,300", "A Nightmare on Elm Street Bundle", '"final": 2300, "regular": 4700, "in": "2026-10-28"', "Freddy Krueger")
q = say("On October 31st, the Ripley and Xenomorph Bundle, for 2,200.")
S.append({"type": "items", "p": q, "title": "Ripley & Xenomorph · 2,200 V-Bucks", "items": [it("Xenomorph"), it("Ellen Ripley")]})
claim("Ripley & Xenomorph Bundle in 10-31, 2,200, out 11-03", "Ripley & Xenomorph Bundle", '"final": 2200, "regular": 3100, "in": "2026-10-31", "out": "2026-11-03"', "Ellen Ripley")
q = say("And the Predator: Badlands Bundle, with Dek, for 2,000 V-Bucks.")
S.append({"type": "items", "p": q, "title": "Predator: Badlands · 2,000 V-Bucks", "items": [it("Dek"), it("Thia")]})
claim("Predator: Badlands Bundle in 10-29, 2,000, out 11-04", "Predator: Badlands Bundle", '"final": 2000, "regular": 2900, "in": "2026-10-29", "out": "2026-11-04"', '"Dek"', '"Thia"')
q = say("Plus two bundles with five outfits each, Grave The Day and Hero Horde, 3,500 V-Bucks each, listed at 7,500. Those were in the shop until October 30th.", 0.4)
S.append({"type": "stat", "p": q, "big": "3,500", "label": "Grave The Day · Hero Horde"})
claim("Grave The Day and Hero Horde: 3,500 (listed 7,500), in 10-28 out 10-30, five outfits each", "Grave The Day Bundle", "Hero Horde Bundle", '"final": 3500, "regular": 7500, "in": "2026-10-28", "out": "2026-10-30"', "Jolterror", "Haunted Hunter")

p = say("If you're grabbing any of these, use code BAD in the Item Shop. It really helps the channel.", 0.4)
S.append({"type": "code", "p": p})

# 4. collabs that left
p = say("A few big collaborations also left the shop this week.")
S.append({"type": "title", "p": p, "chapter": "Gone this week", "kicker": "GONE THIS WEEK", "lines": ["Last chance", "was this week"]})
q = say("The Shadow the Hedgehog and Knuckles the Echidna Bundle, 3,600 V-Bucks, was in the shop until October 31st.")
S.append({"type": "items", "p": q, "title": "Shadow & Knuckles · 3,600 V-Bucks", "items": [it("Shadow the Hedgehog"), it("Knuckles the Echidna")]})
claim("Shadow & Knuckles Bundle 3,600 (listed 8,300) out 10-31", "Shadow the Hedgehog & Knuckles the Echidna Bundle", '"final": 3600, "regular": 8300, "in": "2026-10-25", "out": "2026-10-31"')
q = say("The Yeat Bundle, also 3,600, left the same day.")
S.append({"type": "items", "p": q, "title": "Yeat Bundle · 3,600 V-Bucks", "items": [it("Yeat"), it("Twizz")]})
claim("Yeat Bundle 3,600 (listed 7,300) out 10-31", "Yeat Bundle", '"final": 3600, "regular": 7300, "in": "2026-10-16", "out": "2026-10-31"', "Twizz")
q = say("And the Doja Cat Bundle, 3,200 V-Bucks, was in the shop until October 30th.", 0.4)
S.append({"type": "items", "p": q, "title": "Doja Cat Bundle · 3,200 V-Bucks", "items": [it("Doja Cat"), it("Mother of Thorns Doja")]})
claim("Doja Cat Bundle 3,200 (listed 7,700) out 10-30", "Doja Cat Bundle", '"final": 3200, "regular": 7700, "in": "2026-10-26", "out": "2026-10-30"', "Mother of Thorns Doja")
q = say("The Dr. Eggman Bundle, 2,000 V-Bucks, left on October 31st.")
S.append({"type": "items", "p": q, "title": "Dr. Eggman Bundle · 2,000 V-Bucks", "items": [it("Dr. Eggman")]})
claim("Dr. Eggman Bundle 2,000 (listed 3,600) out 10-31", "Dr. Eggman Bundle", '"final": 2000, "regular": 3600, "in": "2026-10-25", "out": "2026-10-31"')
q = say("And today is the last day for the Beetlejuice Bundle. Nine items for 2,400 V-Bucks, listed at 5,300.", 0.4)
S.append({"type": "items", "p": q, "title": "Beetlejuice Bundle · 2,400 V-Bucks", "items": [it("Beetlejuice")]})
claim("Beetlejuice Bundle: 9 items, 2,400 (listed 5,300), out 11-02", "Beetlejuice Bundle", '"final": 2400, "regular": 5300, "in": "2026-10-24", "out": "2026-11-02"')

# 5. OGs
p = say("Now, the OGs!")
S.append({"type": "title", "p": p, "chapter": "OG check", "kicker": "OG CHECK", "lines": ["The OGs", "that came back"]})
q = say("Commando and Shadow Ops, both from Chapter 1, Season 1, were in the shop every single day this week.")
say("Commando is 800 V-Bucks. Shadow Ops is 1,500.")
S.append({"type": "items", "p": q, "title": "Chapter 1, Season 1 · all week", "items": [it("Commando", 800), it("Shadow Ops", 1500)]})
claim("Commando and Shadow Ops: Chapter 1, Season 1, in every daily snapshot 10-28..11-02", '"name": "Commando ", "introduction": "Introduced in Chapter 1, Season 1."', '"name": "Shadow Ops", "introduction": "Introduced in Chapter 1, Season 1."')
claim("Commando 800, Shadow Ops 1,500 today", '"finalPrice": 800', "Shadow Ops", src="shop-2026-11-02.json")
q = say("Snowstrike, from Chapter 1, Season 7, was there all week too.")
say("Rex, from Chapter 1, Season 3, showed up for three days.")
say("And today, Fishstick, from Chapter 1, Season 7, is back in the shop.", 0.4)
S.append({"type": "items", "p": q, "title": "More OGs this week", "items": [it("Snowstrike"), it("Rex"), it("Fishstick")]})
claim("Snowstrike Ch1 S7, Rex Ch1 S3, Fishstick Ch1 S7", '"name": "Snowstrike", "introduction": "Introduced in Chapter 1, Season 7."', '"name": "Rex", "introduction": "Introduced in Chapter 1, Season 3."', '"name": "Fishstick", "introduction": "Introduced in Chapter 1, Season 7."')
q = say("A few more Chapter 1 outfits stopped by during the week.")
say("On October 28th, Mayhem and Ruckus, both from Chapter 1, Season 6.")
say("On October 30th, Highrise Assault Trooper from Season 2, and Astro Assassin and Focus from Season 9.", 0.4)
S.append({"type": "items", "p": q, "title": "Chapter 1 · Oct 28 - Oct 30", "items": [it("Mayhem"), it("Ruckus"), it("Highrise Assault Trooper"), it("Astro Assassin")]})
claim("Mayhem, Ruckus Ch1 S6; Highrise Assault Trooper Ch1 S2; Astro Assassin, Focus Ch1 S9",
      '"name": "Mayhem", "introduction": "Introduced in Chapter 1, Season 6."', '"name": "Ruckus", "introduction": "Introduced in Chapter 1, Season 6."',
      '"name": "Highrise Assault Trooper", "introduction": "Introduced in Chapter 1, Season 2."', '"name": "Astro Assassin", "introduction": "Introduced in Chapter 1, Season 9."',
      '"name": "Focus", "introduction": "Introduced in Chapter 1, Season 9."')
q = say("Moxie from Season X came in on October 30th, and Guaco, also from Season X, on November 1st.")
say("And today, Hime from Season 5, Rosa from Season 6, and Aura, Buccaneer and Sea Wolf from Season 8.", 0.4)
S.append({"type": "items", "p": q, "title": "Chapter 1 · Oct 30 - Nov 2", "items": [it("Moxie"), it("Guaco"), it("Hime"), it("Rosa"), it("Aura")]})
claim("Moxie, Guaco Ch1 SX; Hime S5; Rosa S6; Aura, Buccaneer, Sea Wolf S8",
      '"name": "Moxie", "introduction": "Introduced in Chapter 1, Season X."', '"name": "Guaco", "introduction": "Introduced in Chapter 1, Season X."',
      '"name": "Hime", "introduction": "Introduced in Chapter 1, Season 5."', '"name": "Rosa", "introduction": "Introduced in Chapter 1, Season 6."',
      '"name": "Aura", "introduction": "Introduced in Chapter 1, Season 8."', '"name": "Buccaneer", "introduction": "Introduced in Chapter 1, Season 8."',
      '"name": "Sea Wolf", "introduction": "Introduced in Chapter 1, Season 8."')

# 6. leaving soon
p = say("Last, what's leaving soon.")
say("The Ripley and Xenomorph Bundle is in the shop until November 3rd.")
say("Mariah Carey and Predator: Badlands, until November 4th.")
say("Rest in Peace and Chaos Agent, also until November 4th.")
say("Inoxtag, until November 5th.")
say("Adventure Time, Ice King and Lemongrab, Harley Quinn, and Catwoman Zero, until November 6th.")
say("And One Piece, all the way to December 3rd.", 0.4)
claim("Rest in Peace out 11-04; Inoxtag out 11-05", "Rest in Peace Bundle", '"final": 1800, "regular": 2800, "in": "2026-10-27", "out": "2026-11-04"', "Inoxtag Bundle", '"final": 2000, "regular": 3400, "in": "2026-10-27", "out": "2026-11-05"')
S.append({"type": "title", "p": p, "chapter": "Leaving soon", "kicker": "LEAVING SOON", "lines": ["Nov 3 · Nov 4", "Nov 6"]})
claim("Harley Quinn Bundle out 11-06", "Harley Quinn Bundle", '"out": "2026-11-06"')

# recap + end
p = say("Quick recap!")
say("Biggest bundle of the week: Five Nights at Freddy's. Newest: Adventure Time. The one that stays the longest: One Piece.")
say("And Commando and Shadow Ops never left.")
say("Which bundle did you grab this week? Tell me in the comments!", 0.4)
S.append({"type": "title", "p": p, "chapter": "Recap", "kicker": "QUICK RECAP", "lines": ["FNAF · Adventure Time", "One Piece · the OGs"]})
p = say("Use code BAD in the Item Shop. It really helps the channel.")
say("Thank you for watching! Follow for more daily content.", 0.6)
S.append({"type": "code", "p": p})

caption = "#EpicPartner This week's Fortnite Item Shop: every big bundle, every new drop and every OG that came back. Use code BAD in the Item Shop.\n#Fortnite #FortniteItemShop"
json.dump({"title": "This Week's Item Shop", "caption": caption, "claims": C, "segments": S}, open(D + "/long.json", "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": P}, open(D + "/vo.json", "w"), indent=1, ensure_ascii=False)
json.dump({
    "youtubeTitle": "This Week's Fortnite Item Shop 🛒 Adventure Time, One Piece, FNAF & Every OG (Oct 28 - Nov 2)",
    "youtube": "#EpicPartner Everything that hit the Fortnite Item Shop this week 🛒 the Five Nights at Freddy's Bundle, Adventure Time, One Piece, Mariah Carey, the Halloween horror icons, and every Chapter 1 OG that came back.\n\nWhich bundle did you grab this week? Tell me in the comments 👇\n\nUse code BAD in the Item Shop 💛\n\n{chapters}\n\n#Fortnite #FortniteItemShop #OnePiece",
    "tags": ["fortnite", "fortnite item shop", "item shop this week", "adventure time fortnite", "one piece fortnite", "fnaf fortnite", "fortnite og skins"],
    "thumb_t": 1.6}, open(D + "/post.json", "w"), indent=1, ensure_ascii=False)
print(len(P), "phrases,", len(S), "segments,", len(C), "claims; fetched_utc", fetched_now)
