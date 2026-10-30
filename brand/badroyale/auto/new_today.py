"""Make today's "right now in Fortnite" short: the newest true thing in the game today, straight from Epic's data.

    python3 brand/badroyale/auto/new_today.py <folder> [--pick news|new|last]

Picks the first of these that exists and isn't in the ledger yet (or only the kind --pick names):
  news  a tile in the in-game news that no earlier snapshot in sources/history/ has (run fetch_sources.py first)  -> TPL.news
  new   the biggest Item Shop listing that went live at today's reset, other than the shop video's deal          -> TPL.drop
  last  the priciest outfit listing that leaves the shop at tonight's reset                                      -> TPL.drop
Writes <folder>/: sources/ (+ manifest.json), img/, scene.js, vo.json and post.json; then build and ship it with
make_short.py, passing --sources <folder>/sources. Prints the pick and the line to add to the ledger.
"""
import datetime
import glob
import json
import os
import re
import sys
import time
import urllib.request
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
BR = os.path.abspath(os.path.join(HERE, ".."))
API = "https://fortnite-api.com"
CODE = "Use code BAD in the Item Shop. It really helps the channel."
THANKS = "Thank you for watching! Follow for more daily content."


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
    return d.strftime("%B ") + f"{n}{'th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"


def used_topics():
    p = os.path.join(HERE, "ledger.json")
    return [t["topic"] for t in json.load(open(p))["topics"]] if os.path.exists(p) else []


def manifest(folder, files):
    json.dump({"via": "fortnite-api.com (mirror of Epic's in-game data)", "files": files}, open(os.path.join(folder, "sources", "manifest.json"), "w"), indent=1)


def write(folder, tpl, cfg, phrases, post, comment):
    open(os.path.join(folder, "scene.js"), "w").write(f"/* BAD ROYALE · {comment}. Facts: sources/. */\nwindow.SCENE = TPL.{tpl}(" + json.dumps(cfg, indent=1, ensure_ascii=False) + ");\n")
    json.dump({"phrases": [{"text": t, "pause": p} for t, p in phrases]}, open(os.path.join(folder, "vo.json"), "w"), indent=1, ensure_ascii=False)
    json.dump(post, open(os.path.join(folder, "post.json"), "w"), indent=1, ensure_ascii=False)


def captions(body, fb_title, tt_title, yt_title, tags, tag3):
    yt_title = yt_title if len(yt_title) <= 100 else yt_title[:yt_title.rfind(" ", 0, 88)] + "… #Shorts"
    return {"tiktok": f"#EpicPartner {body}\nUse code BAD in the Item Shop 💛\n{tag3}", "tiktokTitle": tt_title[:90],
            "instagram": f"#EpicPartner {body}\nUse code BAD in the Item Shop 💛\n{tag3}",
            "facebook": f"#EpicPartner {body}\nUse code BAD in the Item Shop 💛", "facebookTitle": fb_title[:95],
            "youtube": f"#EpicPartner {body}\nUse code BAD in the Item Shop 💛\n#Fortnite #FortniteNews #Shorts", "youtubeTitle": yt_title,
            "tags": tags, "cover_t": 1.0}


# ---------------- a new in-game news tile ----------------
def pick_news(folder, today, used):
    cur_path = os.path.join(BR, "sources", "news.json")
    motds = json.load(open(cur_path))["data"]["br"].get("motds") or []
    earlier = [f for f in glob.glob(os.path.join(BR, "sources", "history", "*-news.json")) if os.path.basename(f)[:10] < today]
    if not earlier:
        return None                                   # nothing to compare with: can't tell what's new
    seen = set()
    for f in earlier:
        seen |= {m["id"] for m in (json.load(open(f)).get("data", {}).get("br", {}).get("motds") or [])}
    # Epic also rotates evergreen gameplay tips through the feed ("Open Chests for the Best Loot"); only a tile that talks
    # about something current counts as news
    current = re.compile(r"\b(new|now|event|limited|update|available|returns?|until|this week|today|collab\w*|quests?|fortnitemares|winterfest|"
                         r"reload|season|chapter|battle pass|tournament|cup|ranked|live)\b", re.I)
    fresh = [m for m in motds if m["id"] not in seen and not any(m["title"] in t for t in used) and current.search(f"{m['title']} {m.get('body') or ''}")]
    if not fresh:
        return None
    m = fresh[0]
    title = m["title"].strip()
    sents = [s.strip() for s in re.split(r"(?<=[.!?…])\s+", (m.get("body") or "").strip()) if s.strip()]
    sents = [s for s in sents if len(s) <= 160][:2]
    if not sents:
        return None
    os.makedirs(os.path.join(folder, "sources"), exist_ok=True)
    open(os.path.join(folder, "sources", "news.json"), "wb").write(open(cur_path, "rb").read())
    src = json.load(open(os.path.join(BR, "sources", "manifest.json")))
    manifest(folder, [f for f in src["files"] if f["file"] == "news.json"])
    phrases = [("Fortnite just put this in the in-game news!", 0.2), (f"{title}.", 0.25)] + [(s, 0.2) for s in sents] + \
              [("What do you think? Tell me in the comments.", 0.2), (CODE, 0.25), (THANKS, 0.3)]
    cfg = {"kicker": "NEW IN FORTNITE", "tile": title, "tileSize": 62 if len(title) < 24 else 50, "hook": ["Just added", "in Fortnite"],
           "quote": [{"p": 2 + i, "text": s} for i, s in enumerate(sents)], "points": [],
           "caption": f"#EpicPartner New in Fortnite's in-game news 📰 {title}",
           "claims": [{"text": f"In-game news tile: {title}", "source": "news.json", "match": [title]}] +
                     [{"text": f"The tile says: {s}", "source": "news.json", "match": [s]} for s in sents]}
    body = f"New in Fortnite's in-game news 📰 {title}\n{sents[0]}\nWhat do you think? 👇"
    post = captions(body, f"New in Fortnite: {title}", f"New in Fortnite: {title} 📰", f"New in Fortnite: {title} 📰 #Shorts",
                    ["fortnite", "fortnite news", "fortnite update", f"{title.lower()} fortnite", "fortnite today"], "#fortnite #fortnitenews #fortniteupdate")
    write(folder, "news", cfg, phrases, post, f"In-game news: {title}")
    return {"pick": "news", "name": title, "topic": f"News tile: {title}"}


# ---------------- a shop listing: new today, or leaving tonight ----------------
def outfits(e):
    return [i for i in e.get("brItems") or [] if i["type"]["value"] == "outfit"]


def label(e):
    n = (e["bundle"]["name"] if e.get("bundle") else outfits(e)[0]["name"]).strip()
    return n.title() if n.isupper() else n            # Epic writes some bundle names in capitals ("HIT SQUAD BUNDLE")


def brand_new(e, day):
    # first release: an outfit Epic added to the game in the last 14 days (not a returning item)
    d0 = datetime.date.fromisoformat(day)
    return any((d0 - datetime.date.fromisoformat((i.get("added") or "2000-01-01")[:10])).days <= 14 for i in outfits(e))


def pick_shop(folder, day, kind, used):
    raw = get(f"{API}/v2/shop")
    shop = json.loads(raw)["data"]
    if shop["date"][:10] != day:
        raise SystemExit(f"STOP: the live shop is {shop['date'][:10]}, not {day}")
    plan = os.path.join(BR, "shop", day, "plan.json")
    deal = json.load(open(plan))["deal"]["name"] if os.path.exists(plan) else None
    entries = [e for e in shop["entries"] if outfits(e)]
    prefix = "New in shop" if kind == "new" else "Leaving tonight"
    fresh = lambda e: not any(t.startswith(prefix) and label(e) in t for t in used)
    if kind == "new":
        pool = sorted((e for e in entries if e["inDate"][:10] == day and label(e) != deal and fresh(e)), key=lambda e: (not brand_new(e, day), -len(outfits(e)), -e["regularPrice"]))
    else:
        pool = sorted((e for e in entries if e["outDate"][:10] == day and fresh(e)), key=lambda e: (-e["finalPrice"], label(e)))
    if not pool:
        return None
    e = pool[0]
    name = label(e)
    items, seen = [], set()
    # outfits first, then gear with real art; emotes, emoji and sprays (white silhouettes) last
    order = ["outfit", "backpack", "pickaxe", "glider", "wrap", "contrail"]
    rank = lambda i: order.index(i["type"]["value"]) if i["type"]["value"] in order else len(order)
    for i in sorted(e["brItems"], key=rank):
        if i["name"].strip() not in seen:
            seen.add(i["name"].strip())
            items.append(i)
    os.makedirs(os.path.join(folder, "sources"), exist_ok=True)
    os.makedirs(os.path.join(folder, "img"), exist_ok=True)
    open(os.path.join(folder, "sources", "shop.json"), "wb").write(raw)
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    manifest(folder, [{"file": "shop.json", "source": f"Item Shop for {day}", "url": f"{API}/v2/shop", "fetched_utc": now}])
    slug = os.path.basename(folder.rstrip("/"))
    cards = []
    for i in items[:3]:
        art = i["images"].get("featured") or i["images"].get("icon")
        if not art:
            continue
        open(os.path.join(folder, "img", f"{i['id']}.png"), "wb").write(get(art))
        cards.append({"name": i["name"].strip(), "rarity": i["rarity"]["value"], "img": f"../../badroyale/video/auto/{slug}/img/{i['id']}.png"})
    names = [i["name"].strip() for i in items]
    contents = None
    if len(names) > 1:
        shown = names[:4] if len(names) <= 4 else names[:3] + [f"{len(names) - 3} more items"]
        contents = ", ".join(shown[:-1]) + " and " + shown[-1]
    final, regular = e["finalPrice"], e["regularPrice"]
    out = datetime.date.fromisoformat(e["outDate"][:10])
    reset = datetime.datetime.combine(datetime.date.fromisoformat(day) + datetime.timedelta(days=1), datetime.time(0), datetime.timezone.utc).astimezone(ZoneInfo("America/Chicago"))
    reset_t = reset.strftime("%-I %p")
    said = name if not e.get("bundle") or name.lower().startswith("the ") else f"The {name}"
    price_line = f"{final:,} V-Bucks, instead of {regular:,}." if regular > final else f"{final:,} V-Bucks."
    fresh_release = kind == "new" and brand_new(e, day)
    if kind == "new":
        hook, when_say, when_show, ask_say, ask_show = "Just dropped in the Fortnite Item Shop!", f"It's in the shop until {words_date(out)}.", f"In the shop until {out.strftime('%b %-d')}", "Are you getting it?", ["Are you", "getting it?"]
        title = ["Just dropped", "in the Item Shop"]
        if fresh_release:
            hook, title = "Brand new in the Fortnite Item Shop!", ["Brand new", "in the Item Shop"]
    else:
        hook, when_say, when_show, ask_say, ask_show = "Last chance! This leaves the Fortnite Item Shop tonight.", f"It leaves the shop tonight at {reset_t} Central.", f"Leaves tonight · {reset_t} CT", "Getting it before it's gone?", ["Getting it", "before it's gone?"]
        title = ["Last chance", "leaving tonight"]
    phrases = [(hook, 0.25), (f"{said}.", 0.2)] + ([(f"{contents}.", 0.2)] if contents else []) + [(price_line, 0.25), (when_say, 0.25), (ask_say, 0.2), (CODE, 0.25), (THANKS, 0.3)]
    cfg = {"title": title, "tone": kind, "cards": cards, "name": name, "contents": contents, "price": {"final": final, "regular": regular},
           "when": when_show, "ask": ask_show,
           "caption": f"#EpicPartner {title[0]} {title[1]}: {name}",
           "claims": [{"text": f"{name} is in the Item Shop for {day}", "source": "shop.json", "match": [name, f'"date": "{day}']},
                      {"text": f"Price {final:,} V-Bucks (listed regular price {regular:,})", "source": "shop.json", "match": [f'"regularPrice": {regular}, "finalPrice": {final}']},
                      {"text": f"Listing {'started' if kind == 'new' else 'ends'} {e['inDate'][:10] if kind == 'new' else e['outDate'][:10]}", "source": "shop.json",
                       "match": [e["inDate"] if kind == "new" else e["outDate"]]}] +
                     [{"text": f"{n} is part of the listing", "source": "shop.json", "match": [n]} for n in names[:4]] +
                     ([{"text": "Brand new: first added to the game in the last 14 days", "source": "shop.json",
                        "match": [f'"added": "{i["added"]}"' for i in outfits(e) if (datetime.date.fromisoformat(day) - datetime.date.fromisoformat(i["added"][:10])).days <= 14][:1]}] if fresh_release else [])}
    was = f" instead of {regular:,}" if regular > final else ""
    if kind == "new":
        body = f"{'Brand new' if fresh_release else 'Just dropped'} in the Item Shop 🔥 {name}: {final:,} V-Bucks{was}, in the shop until {out.strftime('%b %-d')} 🛒\nAre you getting it? 👇"
        lead = "Brand New" if fresh_release else "Just Dropped"
        post = captions(body, f"{lead.capitalize()}: {name}", f"{lead.capitalize()}: {name} 🔥", f"{lead} in the Fortnite Item Shop: {name} 🔥 #Shorts",
                        ["fortnite", "fortnite item shop", f"{name.lower()} fortnite", "new fortnite skins", "fortnite shop today"], "#fortnite #fortniteitemshop #fortniteskins")
    else:
        body = f"Last chance ⏳ {name} leaves the Item Shop tonight at {reset_t} CT\n{final:,} V-Bucks{was}. Getting it before it's gone? 👇"
        post = captions(body, f"Last chance: {name}", f"Last chance: {name} ⏳", f"Last Chance: {name} Leaves the Fortnite Item Shop Tonight ⏳ #Shorts",
                        ["fortnite", "fortnite item shop", f"{name.lower()} fortnite", "fortnite last chance", "fortnite shop today"], "#fortnite #fortniteitemshop #fortniteskins")
    write(folder, "drop", cfg, phrases, post, f"{title[0]} {title[1]}: {name}")
    return {"pick": kind, "name": name, "topic": f"{prefix}: {name}"}


def main(folder, only):
    today = datetime.datetime.now(datetime.timezone.utc).date().isoformat()     # the shop day
    used = used_topics()
    for kind in ([only] if only else ["news", "new", "last"]):
        r = pick_news(folder, today, used) if kind == "news" else pick_shop(folder, today, kind, used)
        if r:
            r["ledger"] = {"date": datetime.datetime.now(ZoneInfo("America/Chicago")).date().isoformat(), "format": "Right now", "topic": r.pop("topic") + f" (video/auto/{os.path.basename(folder.rstrip('/'))})"}
            print(json.dumps(r, ensure_ascii=False, indent=1))
            return
    raise SystemExit("STOP: nothing new and true to say today (no new news tile, no new listing, nothing leaving tonight)")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    only = sys.argv[sys.argv.index("--pick") + 1] if "--pick" in sys.argv else None
    if only:
        args = [a for a in args if a != only]
    if len(args) != 1 or only not in (None, "news", "new", "last"):
        raise SystemExit(__doc__)
    main(os.path.abspath(args[0]), only)
