"""Make one Pirate Shop Access short (TPL.guide, facts over the real map) from a bank of angles.

    python3 brand/badroyale/auto/new_pirate.py <folder> [--angle <id>|auto] [--date YYYY-MM-DD]

The owner (2026-11-11) wants about three of these a day until the token leaves the game (Treasure Hunters ends
December 5, 2026). Facts come from video/auto/pirate-shop-sources/ (press copies of Epic's Fortnite Status post);
build and ship with make_short.py and `--sources brand/badroyale/video/auto/pirate-shop-sources`.
`auto` picks the angle used least recently (ledger topics and existing folders carry "pirate:<id>"), never an
angle already used today; on a Saturday the first pick is treasure-hours-today. Prints the chosen angle as JSON.
"""
import datetime
import glob
import json
import os
import re
import sys

AUTO = os.path.dirname(os.path.abspath(__file__))
VIDEOS = os.path.abspath(os.path.join(AUTO, "..", "video", "auto"))
SEASON_END = datetime.date(2026, 12, 5)
CODE = "Use code BAD in the Item Shop. It really helps the channel."
THANKS = "Thank you for watching! Follow for more daily content."
RED = "#FF2D2D"
ODDS = "one in one hundred thirty seven thousand five hundred"
TAGS = ["fortnite", "pirate shop access", "fortnite pirate shop", "fortnite treasure hunters", "pirate shop token"]
TAIL = {"tt": "\nUse code BAD in the Item Shop 💛\n#fortnite #pirateshop #treasurehunters", "fb": "\nUse code BAD in the Item Shop 💛", "yt": "\nUse code BAD in the Item Shop 💛\n#Fortnite #PirateShop #Shorts"}
G, O, V, B, GB = "vgc-guide.json", "vgc-odds-confirmed.json", "vice-treasure-hours.json", "biglead-pirate-shop.json", "gamingbible.json"
C_ODDS = {"text": "Pirate Shop Access is 1 in 137,500 per chest", "source": O, "match": ["Pirate Shop Access – 1 in 137,500", "Epic has now officially confirmed the drop rates"]}
C_GOLD = {"text": "Weekly Gold Outfit is 1 in 1,562,500", "source": O, "match": ["Weekly Gold Outfit – 1 in 1,562,500"]}
C_FREE14 = {"text": "Every V-Bucks item is free for 14 days after activation", "source": G, "match": ["every single item in the Fortnite Shop which costs V-Bucks becomes entirely free for the next 14 days"]}
C_KEEP = {"text": "You keep the claimed items", "source": B, "match": ["you keep the items forever"]}
C_SQUAD = {"text": "If anyone in the squad finds it, every member gets it", "source": G, "match": ["if anyone in your Squad finds the Pirate Shop Token in a chest, every member of the Squad gets it"]}
C_TH = {"text": "Treasure Hours run on Saturdays with boosted Pirate Shop Access odds", "source": V, "match": ["boosted drop rates during Treasure Hours, which run on Saturdays"]}
C_END = {"text": "Treasure Hunters ends December 5", "source": O, "match": ["started on November 1 and is set to end on December 5"]}


def next_saturday(d):
    return d + datetime.timedelta(days=(5 - d.weekday()) % 7 or 7)


def angles(today):
    left = (SEASON_END - today).days
    sat = next_saturday(today)
    sat_s = sat.strftime("%B %-d")
    return [
     dict(id="explained", kicker="TREASURE HUNTERS", title=["The whole Item Shop", "for FREE?!"],
      voice=[("Fortnite is giving away the entire Item Shop for free. Here's how it works!", .3), ("This season, every chest you open has a tiny chance to drop Pirate Shop Access.", .25), ("Activate it, and for 14 days, everything that costs V-Bucks is free.", .25), ("Skins, emotes, pickaxes, gliders. And you keep them forever.", .3), ("Would you even know what to grab first?", .25)],
      facts=[("CHESTS", "Can drop Pirate Shop Access", None), ("14 DAYS", "Every V-Bucks item is free", None), ("FOREVER", "You keep what you claim", None)],
      claims=[{"text": "Chests can drop Pirate Shop Access", "source": G, "match": ["every time you open or break a chest, there's a small chance that you'll get a treasure reward", "Pirate Shop Access"]}, C_FREE14, C_KEEP],
      body="Fortnite is giving the WHOLE Item Shop away for free 😳 Find Pirate Shop Access in a chest and every V-Bucks item is free for 14 days, and you keep it all\nWhat would you grab first? 👇",
      ttt="The whole Item Shop for FREE 😳", fbt="Fortnite's Pirate Shop Access, explained", ytt="Fortnite's Pirate Shop Access Explained: The Whole Item Shop for FREE 😳 #Shorts"),
     dict(id="odds", kicker="TREASURE HUNTERS", title=["The REAL odds of", "Pirate Shop Access"],
      voice=[("Epic just revealed the real odds of finding Pirate Shop Access. Ready?", .3), (f"{ODDS[0].upper()}{ODDS[1:]}. Per chest, in a normal match.", .3), ("The weekly gold outfit is even rarer: one in over one and a half million.", .25), ("A gizmo? One in one hundred twenty seven. That's the common one.", .3), ("How many chests have you opened this season?", .25)],
      facts=[("PER CHEST", "1 in 137,500", None), ("GOLD OUTFIT", "1 in 1,562,500", None), ("ANY GIZMO", "1 in 127", None)],
      claims=[C_ODDS, {"text": "Per chest in a normal match", "source": V, "match": ["per chest in a normal match"]}, C_GOLD, {"text": "Any gizmo is 1 in 127", "source": O, "match": ["Gizmo (any) – 1 in 127"]}],
      body="Epic confirmed the odds 😅 Pirate Shop Access is 1 in 137,500 per chest. The weekly gold outfit? 1 in 1,562,500\nHow many chests have you opened this season? 👇",
      ttt="The REAL Pirate Shop odds 😅", fbt="The real odds of Pirate Shop Access", ytt="The REAL Odds of Pirate Shop Access in Fortnite 😅 1 in 137,500 #Shorts"),
     dict(id="squad", kicker="TREASURE HUNTERS", title=["Pirate Shop Access:", "the squad trick"],
      voice=[("Stop hunting Pirate Shop Access solo. Here's why!", .3), ("If anyone in your squad finds it in a chest, every member of the squad gets it.", .25), ("No friends online? Hit Fill. Four players means four times the chests.", .25), ("And every chest counts: normal, rare, Sprite, buried, Wanted Poster, even Relic chests.", .3), ("Who are you teaming up with tonight?", .25)],
      facts=[("SQUAD", "One find, the whole squad gets it", None), ("FILL", "4 players, 4x the chests", None), ("ANY CHEST", "Normal, Rare, Sprite, Buried, Relic", None)],
      claims=[C_SQUAD, {"text": "Fill gives a squad of four, four times the chests", "source": G, "match": ["just choose the Fill option to add random players to your squad of four", "four times as many chests"]}, {"text": "Every chest type counts", "source": G, "match": ["Normal chests, Rare chests, Sprite Chests, Buried Chests, Wanted Poster Chests, Relic Chests"]}],
      body="Hunting Pirate Shop Access solo is the slow way 👀 If anyone in your squad finds it, the whole squad gets it. Use Fill and open every chest\nWho are you teaming up with? 👇",
      ttt="The squad trick for Pirate Shop Access 👀", fbt="The squad trick for Pirate Shop Access", ytt="The Squad Trick for Pirate Shop Access in Fortnite 👀 #Shorts"),
     dict(id="activate", kicker="TREASURE HUNTERS", title=["Got Pirate Shop Access?", "Do THIS next"], titleSize=54,
      voice=[("You found Pirate Shop Access? Don't waste it. Here's exactly what to do.", .3), ("Open the Item Shop and look for the Plunder the Item Shop option.", .25), ("Hit Activate Now, and your 14 days start right there.", .25), ("You actually get two: one for this year, and one you can save for 2027.", .25), ("And you have to claim each item yourself. Nothing lands automatically!", .3), ("Which skin would you claim first?", .25)],
      facts=[("STEP 1", "Item Shop: Plunder the Item Shop", None), ("STEP 2", "Activate Now. 14 days start", None), ("BONUS", "A second token for 2027", None), ("CLAIM IT", "Nothing lands automatically", None)],
      claims=[{"text": "Activate via Plunder the Item Shop and Activate Now", "source": GB, "match": ["return to the item shop, where you'll be met with the option to", "Plunder the Item Shop", "Activate Now", "your free 14-day 2026 access will begin"]}, {"text": "Two tokens: 2026 and 2027", "source": O, "match": ["receive two tokens – one which can be activated at any point in 2026 between November 1 and December 15, and one which can be activated at any point in 2027"]}, {"text": "Items must be claimed yourself", "source": GB, "match": ["You do have to claim everything in the item shop", "automatically land in your account"]}],
      body="Found Pirate Shop Access? Here's what to do 🏴‍☠️ Item Shop → Plunder the Item Shop → Activate Now. Your 14 days start, and you get a second token for 2027\nWhich skin would you claim first? 👇",
      ttt="Got Pirate Shop Access? Do this 🏴‍☠️", fbt="How to activate Pirate Shop Access", ytt="How to Activate Pirate Shop Access in Fortnite 🏴‍☠️ #Shorts"),
     dict(id="notfree", kicker="TREASURE HUNTERS", title=["Pirate Shop Access:", "what's NOT free"],
      voice=[("Pirate Shop Access makes the Item Shop free. But not everything! Watch out for these.", .3), ("Battle Pass levels? Not included.", .2), ("Bundles that cost real money instead of V-Bucks? Not included.", .2), ("Gifting is off. And you can claim only one free Sidekick.", .25), ("Everything else, skins, emotes, gliders, cars, jam tracks, is free to claim.", .3), ("Still the best thing in Fortnite right now, right?", .25)],
      facts=[("NO", "Battle Pass levels", RED), ("NO", "Real-money bundles", RED), ("NO", "Gifts. Only 1 Sidekick", RED), ("YES", "Skins, emotes, gliders, cars", None)],
      claims=[{"text": "Battle Pass levels are not included", "source": G, "match": ["you can't claim Battle Pass levels"]}, {"text": "Real-money bundles are not included", "source": G, "match": ["you can't get bundles that cost real money (instead of V-Bucks)"]}, {"text": "No gifting, one free Sidekick", "source": G, "match": ["you can't gift items to other players, and you can only claim one free sidekick"]}, {"text": "Skins, emotes, gliders, cars, jam tracks are free", "source": G, "match": ["skins, emotes, backpacks, pickaxes, instruments, cars, gliders, jam tracks – is entirely free for you to claim"]}],
      body="Pirate Shop Access makes the Item Shop free, but NOT everything 👀 No Battle Pass levels, no real-money bundles, no gifting, and only one Sidekick. Skins, emotes, gliders, cars and jam tracks? All free\nStill the best thing in Fortnite right now? 👇",
      ttt="What's NOT free with Pirate Shop Access 👀", fbt="Pirate Shop Access: what is not free", ytt="What's NOT Free With Pirate Shop Access in Fortnite 👀 #Shorts"),
     dict(id="myths", kicker="TREASURE HUNTERS", title=["Pirate Shop Access", "myths, BUSTED"],
      voice=[("Everyone has a theory about Pirate Shop Access. Here's what Epic actually says.", .3), ("The Token Compass? Not real. There is no such thing.", .25), ("Wearing a One Piece skin? Your skin has no effect on your odds.", .25), ("Lucky chests? Nope. Everyone has an equal chance. Just open chests.", .3), ("Treasure Hours are every Saturday, with boosted odds. Get your squad ready!", .3), ("Which myth did you fall for?", .25)],
      facts=[("MYTH", "The Token Compass", RED), ("MYTH", "Skins change your odds", RED), ("FACT", "Everyone has equal odds", None), ("SATURDAYS", "Treasure Hours: boosted odds", None)],
      claims=[{"text": "No Token Compass", "source": G, "match": ["There's no such thing as a Token Compass"]}, {"text": "Skins do not change the odds", "source": G, "match": ["the skin you choose has no effect on your odds", "wear a One Piece skin"]}, {"text": "Everyone has an equal chance", "source": G, "match": ["according to Epic games, everyone has an equal chance of finding a Pirate Shop Token"]}, C_TH],
      body="Pirate Shop Access myths, busted 🧐 No Token Compass, your skin changes nothing, and no chest is luckier than another. Epic says everyone has the same odds\nWhich myth did you fall for? 👇",
      ttt="Pirate Shop Access myths, busted 🧐", fbt="Pirate Shop Access myths, busted", ytt="Pirate Shop Access Myths BUSTED: What Epic Actually Says 🧐 #Shorts"),
     dict(id="days-left", kicker="TREASURE HUNTERS", title=["Pirate Shop Access", "ends soon"],
      voice=[(f"Treasure Hunters ends December 5. That's {left} days left to find Pirate Shop Access!", .3), (f"Every chest you open is a ticket: {ODDS}.", .25), ("Find it, and the Item Shop is free for 14 days. You keep everything.", .25), ("And Treasure Hours boost the odds every Saturday.", .3), ("How many chests will you open before it's gone?", .25)],
      facts=[("SEASON ENDS", "December 5", RED), ("DAYS LEFT", f"{left} days", None), ("PER CHEST", "1 in 137,500", None), ("SATURDAYS", "Treasure Hours: boosted odds", None)],
      claims=[C_END, {"text": f"{left} days from today to December 5", "source": O, "match": ["December 5"], "visual": f"{left} days counted from {today.isoformat()}"}, C_ODDS, C_FREE14, C_TH],
      body=f"Pirate Shop Access ends with the season on December 5 ⏳ {left} days left, 1 in 137,500 per chest, and Treasure Hours every Saturday\nHow many chests will you open before it's gone? 👇",
      ttt=f"{left} days left for Pirate Shop Access ⏳", fbt="Pirate Shop Access ends soon", ytt=f"{left} Days Left to Find Pirate Shop Access in Fortnite ⏳ #Shorts"),
     dict(id="28-days", kicker="TREASURE HUNTERS", title=["Pirate Shop Access", "is really 28 days"],
      voice=[("You don't get 14 days of free Item Shop. You get 28!", .3), ("Token one is for this year: activate it any time until December 15.", .25), ("Token two is for 2027: any time from January 1 to December 31.", .25), ("Each one is 14 days of every V-Bucks item, free.", .3), ("Would you use the second one right away, or save it?", .25)],
      facts=[("TOKEN 1", "2026: use by December 15", None), ("TOKEN 2", "2027: January 1 to December 31", None), ("EACH", "14 days of free items", None)],
      claims=[{"text": "Two tokens, 2026 until December 15 and 2027 all year", "source": O, "match": ["receive two tokens – one which can be activated at any point in 2026 between November 1 and December 15, and one which can be activated at any point in 2027 between January 1 and December 31"]}, {"text": "28 days in two 14-day chunks", "source": GB, "match": ["28 days of free access to Fortnite's Item Shop, split into two 14-day chunks"]}],
      body="Pirate Shop Access is really 28 days, not 14 🏴‍☠️ One token for this year (use it by Dec 15) and a second for any time in 2027\nWould you use the second one right away or save it? 👇",
      ttt="Pirate Shop Access is really 28 days 🏴‍☠️", fbt="Pirate Shop Access is really 28 days", ytt="Pirate Shop Access Is Really 28 Days: The Second Token Explained 🏴‍☠️ #Shorts"),
     dict(id="how-it-drops", kicker="TREASURE HUNTERS", title=["It doesn't drop", "like loot"],
      voice=[("Pirate Shop Access doesn't come out of the chest like a weapon. Here's what actually happens.", .3), ("When you open a chest, there's a small chance of a treasure prize.", .25), ("It doesn't hit the floor. You get a message on screen telling you what you got.", .25), ("So don't dig through the loot. Just keep opening chests!", .3), ("Have you seen a treasure message yet?", .25)],
      facts=[("NOT LOOT", "Nothing to pick up", None), ("ON SCREEN", "A message tells you what you got", None), ("JUST", "Keep opening chests", None)],
      claims=[{"text": "A treasure prize is a message on screen, not loot to pick up", "source": G, "match": ["This won't come out of the chest like the usual weapons and other items, so you won't have to pick it up – you'll just get a message on the screen telling you what you got"]}],
      body="Pirate Shop Access doesn't drop like loot 👀 It's a message on your screen when you open a chest, nothing to pick up\nHave you seen a treasure message yet? 👇",
      ttt="It doesn't drop like loot 👀", fbt="How Pirate Shop Access actually drops", ytt="Pirate Shop Access Doesn't Drop Like Loot: Here's What Happens 👀 #Shorts"),
     dict(id="tiers", kicker="TREASURE HUNTERS", title=["The 3 tiers of", "treasure"],
      voice=[("Every treasure you get from a chest is one of three tiers. Here they are!", .3), ("Standard: a gizmo, like a Sprite Locator or a Golden Firework.", .25), ("Major: one of this week's special cosmetics.", .25), ("Supreme: the weekly gold skin, or Pirate Shop Access.", .3), ("Which tier have you hit so far?", .25)],
      facts=[("STANDARD", "A gizmo", None), ("MAJOR", "This week's cosmetics", None), ("SUPREME", "Gold skin or Pirate Shop Access", None)],
      claims=[{"text": "Three tiers: Standard, Major, Supreme", "source": G, "match": ["Treasure Hunt prizes are split into three tiers – Standard, Major and Supreme", "Sprite Locator", "Golden Firework", "If it's Major you'll get one of the current week's special cosmetics", "that week's gold skin or the Pirate Shop Token"]}],
      body="Every chest treasure is one of 3 tiers 🏴‍☠️ Standard (a gizmo), Major (this week's cosmetics), Supreme (the gold skin or Pirate Shop Access)\nWhich tier have you hit? 👇",
      ttt="The 3 tiers of treasure 🏴‍☠️", fbt="The three tiers of Treasure Hunters prizes", ytt="The 3 Tiers of Treasure in Fortnite Treasure Hunters 🏴‍☠️ #Shorts"),
     dict(id="all-odds", kicker="TREASURE HUNTERS", title=["Every treasure", "and its odds"],
      voice=[("Here are Epic's odds for every treasure, per chest.", .3), ("A gizmo: one in one hundred twenty seven. A pickaxe or back bling: one in five hundred sixty eight.", .25), (f"Pirate Shop Access: {ODDS}.", .25), ("And the gold outfit? One in over one and a half million.", .3), ("Which one do you want most?", .25)],
      facts=[("GIZMO", "1 in 127", None), ("PICKAXE OR BACK BLING", "1 in 568", None), ("PIRATE SHOP", "1 in 137,500", None), ("GOLD OUTFIT", "1 in 1,562,500", None)],
      claims=[{"text": "Epic's per-chest odds", "source": O, "match": ["Gizmo (any) – 1 in 127", "Weekly Pickaxe or Backbling – 1 in 568", "Pirate Shop Access – 1 in 137,500", "Weekly Gold Outfit – 1 in 1,562,500"]}],
      body="Epic's odds for every chest treasure 🎲 Gizmo 1 in 127, pickaxe or back bling 1 in 568, Pirate Shop Access 1 in 137,500, gold outfit 1 in 1,562,500\nWhich one do you want most? 👇",
      ttt="Every treasure and its odds 🎲", fbt="Every Treasure Hunters prize and its odds", ytt="Every Fortnite Treasure and Its Odds, Per Chest 🎲 #Shorts"),
     dict(id="treasure-hours", kicker="TREASURE HUNTERS", title=["Treasure Hours", "explained"],
      voice=[("Treasure Hours are the best time to hunt Pirate Shop Access. Here's how they work.", .3), ("They run on Saturdays, two rounds: two to four PM Eastern, and nine to eleven PM Eastern.", .25), ("Pirate Shop Access odds get boosted one point five times. One round even hit two times.", .25), (f"The next one is Saturday, {sat_s}. Set a reminder!", .3), ("Are you playing both rounds?", .25)],
      facts=[("WHEN", "Saturdays", None), ("ROUNDS", "2 to 4 PM ET · 9 to 11 PM ET", None), ("BOOST", "1.5x, once even 2x", None), ("NEXT", f"Saturday {sat_s}", None)],
      claims=[C_TH, {"text": "Rounds 2-4 PM ET and 9-11 PM ET, 1.5x", "source": V, "match": ["2–4 PM ET", "9–11 PM ET", "1.5× both rounds"]}, {"text": "Boost 1.5x, once 2x", "source": O, "match": ["boost the drop rates for the Pirate Shop Access by 1.5x", "Pirate Shop Access was boosted to 2x"]}, {"text": f"Next Saturday is {sat.isoformat()}", "source": V, "match": ["Saturdays"], "visual": f"next Saturday after {today.isoformat()} is {sat.isoformat()}"}],
      body=f"Treasure Hours, explained ⏰ Saturdays, 2 to 4 PM ET and 9 to 11 PM ET, with Pirate Shop Access odds boosted 1.5x (one round even hit 2x). Next one: Saturday {sat_s}\nAre you playing both rounds? 👇",
      ttt="Treasure Hours, explained ⏰", fbt="Fortnite Treasure Hours, explained", ytt="Fortnite Treasure Hours Explained: When Pirate Shop Access Odds Go Up ⏰ #Shorts"),
     dict(id="zero-build", kicker="TREASURE HUNTERS", title=["Zero Build", "counts too"],
      voice=[("You don't need to build to find Pirate Shop Access.", .3), ("Chests in Battle Royale and Zero Build both count.", .25), ("Every type of chest too: normal, rare, Sprite, buried, Wanted Poster, Relic.", .25), ("Same odds for everyone, in every mode.", .3), ("Builds or Zero Build: where are you hunting?", .25)],
      facts=[("MODES", "Battle Royale and Zero Build", None), ("CHESTS", "Every type counts", None), ("ODDS", "Equal for everyone", None)],
      claims=[{"text": "Battle Royale and Zero Build chests count", "source": G, "match": ["open chests during Battle Royale and Zero Build modes"]}, {"text": "Every chest type", "source": G, "match": ["Normal chests, Rare chests, Sprite Chests, Buried Chests, Wanted Poster Chests, Relic Chests"]}, {"text": "Equal chance for everyone", "source": G, "match": ["everyone who plays Fortnite has an equal chance of finding a Pirate Shop Token"]}],
      body="You don't need to build to find Pirate Shop Access 🏗️ Battle Royale and Zero Build chests both count, every chest type, same odds for everyone\nBuilds or Zero Build? 👇",
      ttt="Zero Build counts too 🏗️", fbt="Zero Build counts for Pirate Shop Access too", ytt="Zero Build Counts Too: Pirate Shop Access in Every Mode 🏗️ #Shorts"),
     dict(id="no-nerf", kicker="TREASURE HUNTERS", title=["Did Epic nerf", "Pirate Shop Access?"],
      voice=[("Everyone says Epic nerfed Pirate Shop Access. Did they?", .3), ("No. Epic says the normal chest drop rates have stayed the same since the season launched.", .25), (f"It's {ODDS}, and it always was.", .25), ("The only thing that changes the odds is a Treasure Hour boost.", .3), ("Did you think it got nerfed?", .25)],
      facts=[("NERFED?", "No", None), ("SINCE LAUNCH", "Same drop rates", None), ("ONLY BOOSTS", "Treasure Hours", None)],
      claims=[{"text": "Drop rates unchanged since launch", "source": V, "match": ["the developer says the normal chest drop rates have stayed the same since Fortnite Treasure Hunters launched"]}, C_ODDS, C_TH],
      body="Did Epic nerf Pirate Shop Access? No 🙅 Epic says the normal chest drop rates have stayed the same since the season launched: 1 in 137,500. Only Treasure Hours change the odds\nDid you think it got nerfed? 👇",
      ttt="Did Epic nerf Pirate Shop Access? 🙅", fbt="Did Epic nerf Pirate Shop Access?", ytt="Did Epic Nerf Pirate Shop Access? What Epic Says 🙅 #Shorts"),
     dict(id="everything-free", kicker="TREASURE HUNTERS", title=["What you can claim", "with Pirate Shop Access"], titleSize=54,
      voice=[("What exactly is free with Pirate Shop Access? Almost everything.", .3), ("Skins, emotes, backpacks, pickaxes.", .25), ("Instruments, cars, gliders, jam tracks.", .25), ("Anything that costs V-Bucks: free to claim, and yours forever.", .3), ("What's the first thing you'd claim?", .25)],
      facts=[("FREE", "Skins, emotes, backpacks, pickaxes", None), ("FREE", "Instruments, cars, gliders, jam tracks", None), ("FOREVER", "You keep what you claim", None)],
      claims=[{"text": "Skins, emotes, backpacks, pickaxes, instruments, cars, gliders, jam tracks are free", "source": G, "match": ["skins, emotes, backpacks, pickaxes, instruments, cars, gliders, jam tracks – is entirely free for you to claim"]}, C_KEEP],
      body="What's free with Pirate Shop Access? Almost everything 😳 Skins, emotes, backpacks, pickaxes, instruments, cars, gliders, jam tracks. Anything that costs V-Bucks, and you keep it\nWhat's the first thing you'd claim? 👇",
      ttt="Everything you can claim 😳", fbt="Everything you can claim with Pirate Shop Access", ytt="Everything You Can Claim With Pirate Shop Access in Fortnite 😳 #Shorts"),
     dict(id="lantern-landing", kicker="TREASURE HUNTERS", title=["The chest hot drop", "for token hunters"], titleSize=56,
      voice=[("Where do token hunters land? Lantern Landing. Here's why, and the catch.", .3), ("Lots of chests in a small area, so you open more, faster.", .25), ("The catch: everyone else lands there too, and you can die early.", .25), ("The safer play: squad up, pick a quieter spot, and open every chest you see.", .3), ("Hot drop or quiet drop: which one are you?", .25)],
      facts=[("HOT DROP", "Lantern Landing: lots of chests", None), ("THE CATCH", "Everyone lands there", RED), ("SAFER", "Quiet spot, every chest", None)],
      claims=[{"text": "Lantern Landing has many chests close together but is contested", "source": G, "match": ["head straight for Lantern Landing when you start a game because there are a lot of chests in a small area", "lots of other players will be heading for Lantern Landing too"]}, C_SQUAD],
      body="The hot drop for Pirate Shop Access hunters is Lantern Landing 📍 Lots of chests close together, but everyone lands there. Squad up and open every chest wherever you drop\nHot drop or quiet drop? 👇",
      ttt="The hot drop for token hunters 📍", fbt="The chest hot drop for Pirate Shop Access hunters", ytt="The Chest Hot Drop for Pirate Shop Access Hunters: Lantern Landing 📍 #Shorts"),
     dict(id="one-sidekick", kicker="TREASURE HUNTERS", title=["The one Sidekick", "rule"],
      voice=[("Pirate Shop Access has one weird limit: Sidekicks.", .3), ("You can claim only one free Sidekick, and only one you don't already own.", .25), ("Everything else that costs V-Bucks? Claim it all, for 14 days.", .25), ("Gifting is off too, so it's all for you.", .3), ("Which Sidekick would you pick?", .25)],
      facts=[("SIDEKICKS", "Only 1 free", RED), ("EVERYTHING ELSE", "Claim it all, 14 days", None), ("GIFTING", "Off", RED)],
      claims=[{"text": "Only one free Sidekick, no gifting", "source": G, "match": ["you can only claim one free sidekick", "you can't gift items to other players"]}, {"text": "One Sidekick you do not already own", "source": GB, "match": ["players only able to claim one for free that they do not already own"]}, C_FREE14],
      body="Pirate Shop Access has one weird limit 👀 Only one free Sidekick (one you don't own yet), and gifting is off. Everything else that costs V-Bucks? Claim it all for 14 days\nWhich Sidekick would you pick? 👇",
      ttt="The one Sidekick rule 👀", fbt="The one Sidekick rule of Pirate Shop Access", ytt="The One Sidekick Rule of Pirate Shop Access in Fortnite 👀 #Shorts"),
     dict(id="chest-math", kicker="TREASURE HUNTERS", title=["How many chests", "for Pirate Shop Access?"], titleSize=54,
      voice=[(f"At {ODDS}, how many chests does it take? Let's do the math.", .3), ("For a fifty percent chance, about ninety five thousand chests.", .25), ("In a squad of four, every member's chest counts for you. Four times faster.", .25), ("During a Treasure Hour, the odds go up by half.", .3), ("How many chests do you open per match?", .25)],
      facts=[("50% CHANCE", "About 95,000 chests", None), ("SQUAD OF 4", "4x faster", None), ("TREASURE HOUR", "Odds up 1.5x", None)],
      claims=[C_ODDS, {"text": "About 95,000 chests for a 50% chance", "source": O, "match": ["1 in 137,500"], "visual": "1 - (1 - 1/137500)^n = 0.5 at n = 95,310 chests"}, C_SQUAD, {"text": "1.5x during Treasure Hours", "source": V, "match": ["1.5× both rounds"]}],
      body="How many chests for Pirate Shop Access? 🧮 At 1 in 137,500, a 50% chance takes about 95,000 chests. A squad of 4 makes it 4x faster, Treasure Hours add 1.5x\nHow many chests do you open per match? 👇",
      ttt="The chest math 🧮", fbt="How many chests does Pirate Shop Access take?", ytt="How Many Chests Does Pirate Shop Access Take? The Math 🧮 #Shorts"),
     dict(id="gold-vs-pirate", kicker="TREASURE HUNTERS", title=["Rarer than", "Pirate Shop Access?"],
      voice=[("There's one treasure rarer than Pirate Shop Access.", .3), ("The weekly gold outfit: one in over one and a half million per chest.", .25), (f"Pirate Shop Access is {ODDS}. About eleven times more common!", .25), ("So if you ever see the gold skin, you beat both.", .3), ("Gold skin or free shop: which would you rather find?", .25)],
      facts=[("GOLD OUTFIT", "1 in 1,562,500", None), ("PIRATE SHOP", "1 in 137,500", None), ("RATIO", "About 11x more common", None)],
      claims=[C_GOLD, C_ODDS, {"text": "About 11 times more common", "source": O, "match": ["1 in 1,562,500", "1 in 137,500"], "visual": "1,562,500 / 137,500 = 11.4"}],
      body="One treasure is rarer than Pirate Shop Access 😮 The weekly gold outfit: 1 in 1,562,500 per chest. Pirate Shop Access (1 in 137,500) is about 11x more common\nGold skin or free shop? 👇",
      ttt="Rarer than Pirate Shop Access? 😮", fbt="The one treasure rarer than Pirate Shop Access", ytt="The One Treasure Rarer Than Pirate Shop Access 😮 #Shorts"),
     dict(id="treasure-hours-today", saturday=True, kicker=f"SATURDAY {today.strftime('%b %-d').upper()}", title=["Treasure Hours", "TODAY"],
      voice=[("Treasure Hours are today, and Pirate Shop Access odds are boosted. Here's the schedule!", .3), ("Round one: two to four PM Eastern. That's one to three Central.", .25), ("Round two: nine to eleven PM Eastern. Eight to ten Central.", .25), ("Both rounds: one point five times the normal odds for Pirate Shop Access.", .3), ("Squad up and open every chest. Are you playing both rounds?", .25)],
      facts=[("ROUND 1", "2 to 4 PM ET · 1 to 3 PM Central", None), ("ROUND 2", "9 to 11 PM ET · 8 to 10 PM Central", None), ("BOOST", "1.5x Pirate Shop Access odds", None)],
      claims=[{"text": f"{today.strftime('%B %-d')} Treasure Hours 2-4 PM ET and 9-11 PM ET, 1.5x both rounds", "source": V, "match": [f"| {today.strftime('%B %-d')} | 11 AM–1 PM PT / 2–4 PM ET | 6–8 PM PT / 9–11 PM ET | 1.5× both rounds |"], "visual": "Central is Eastern minus one hour"}, C_TH],
      body="Treasure Hours are TODAY 🏴‍☠️ 2 to 4 PM ET (1 to 3 Central) and 9 to 11 PM ET (8 to 10 Central), with 1.5x odds on Pirate Shop Access both rounds\nAre you playing both? 👇",
      ttt="Treasure Hours TODAY 🏴‍☠️", fbt="Fortnite Treasure Hours today: the schedule", ytt="Fortnite Treasure Hours TODAY: Boosted Pirate Shop Access Odds 🏴‍☠️ #Shorts", tags=["fortnite", "treasure hours", "pirate shop access", "fortnite treasure hunters", "pirate shop token"]),
    ]


def used(today):
    """angle id -> last date used, from the ledger and from folders that already exist (markers 'pirate:<id>')."""
    last = {}
    led = os.path.join(AUTO, "ledger.json")
    for t in json.load(open(led))["topics"] if os.path.exists(led) else []:
        for m in re.findall(r"pirate:([a-z0-9-]+)", t["topic"]):
            last[m] = max(last.get(m, ""), t["date"])
    for s in glob.glob(os.path.join(VIDEOS, "*", "scene.js")):
        m = re.search(r"pirate:([a-z0-9-]+)", open(s).read(500))
        if m:
            last[m.group(1)] = max(last.get(m.group(1), ""), os.path.basename(os.path.dirname(s))[:10])
    return last


def pick(bank, today):
    last = used(today)
    t = today.isoformat()
    if today.weekday() == 5 and last.get("treasure-hours-today", "") != t:
        return next(a for a in bank if a["id"] == "treasure-hours-today")
    cands = [a for a in bank if not a.get("saturday") and last.get(a["id"], "") != t]
    return min(cands, key=lambda a: (last.get(a["id"], ""), bank.index(a)))


def write(folder, a, today):
    if today > SEASON_END:
        raise SystemExit("STOP: Treasure Hunters ended December 5; the Pirate Shop Access series is over")
    os.makedirs(folder, exist_ok=True)
    phrases = [{"text": t, "pause": p} for t, p in a["voice"]] + [{"text": CODE, "pause": .25}, {"text": THANKS, "pause": .3}]
    cfg = {"kicker": a["kicker"], "title": a["title"], "facts": [{"p": i + 1, "label": l, "text": t, **({"color": c} if c else {})} for i, (l, t, c) in enumerate(a["facts"])],
           "caption": f"#EpicPartner {a['body']}{TAIL['tt']}", "claims": a["claims"]}
    if a.get("titleSize"):
        cfg["titleSize"] = a["titleSize"]
    open(os.path.join(folder, "scene.js"), "w").write(f"/* BAD ROYALE · Pirate Shop Access series, pirate:{a['id']} ({today}). Facts: video/auto/pirate-shop-sources/ (press copies of Epic's Fortnite Status post). */\nwindow.SCENE = TPL.guide(" + json.dumps(cfg, indent=1, ensure_ascii=False) + ");\n")
    json.dump({"phrases": phrases}, open(os.path.join(folder, "vo.json"), "w"), indent=1, ensure_ascii=False)
    json.dump({"tiktok": f"#EpicPartner {a['body']}{TAIL['tt']}", "tiktokTitle": a["ttt"], "instagram": f"#EpicPartner {a['body']}{TAIL['tt']}",
               "facebook": f"#EpicPartner {a['body']}{TAIL['fb']}", "facebookTitle": a["fbt"], "youtube": f"#EpicPartner {a['body']}{TAIL['yt']}", "youtubeTitle": a["ytt"],
               "tags": a.get("tags", TAGS), "cover_t": 0.9}, open(os.path.join(folder, "post.json"), "w"), indent=1, ensure_ascii=False)


def main(argv):
    folder = os.path.abspath(argv[1])
    today = datetime.date.fromisoformat(argv[argv.index("--date") + 1]) if "--date" in argv else datetime.date.today()
    want = argv[argv.index("--angle") + 1] if "--angle" in argv else "auto"
    bank = angles(today)
    a = pick(bank, today) if want == "auto" else next(x for x in bank if x["id"] == want)
    write(folder, a, today)
    print(json.dumps({"angle": a["id"], "folder": folder, "ledger_topic": f"Pirate Shop Access: {a['ytt']} (pirate:{a['id']}) ({os.path.relpath(folder, os.path.dirname(VIDEOS))})"}))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    main(sys.argv)
