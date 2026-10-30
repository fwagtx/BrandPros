"""Make a "Guess the Season" short folder from three outfit names, straight from Epic's cosmetics data.

    python3 brand/badroyale/auto/new_guess.py <folder> "Renegade Raider" "Midas" "Drift"

Writes <folder>/: sources/<id>.json + sources/manifest.json (the facts), img/<id>.png (the art), scene.js
(TPL.guess), vo.json and post.json. Then build and ship it with make_short.py like any short, passing
--sources <folder>/sources. Outfits whose season is "X" or missing are refused (the voice can't say them cleanly).
"""
import datetime
import json
import os
import re
import sys
import urllib.parse
import urllib.request

API = "https://fortnite-api.com/v2/cosmetics/br"


def get(url):
    return urllib.request.urlopen(url, timeout=90).read()


def main(folder, names):
    os.makedirs(os.path.join(folder, "sources"), exist_ok=True)
    os.makedirs(os.path.join(folder, "img"), exist_ok=True)
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    rounds, files = [], []
    for nm in names:
        url = f"{API}/search?type=outfit&name={urllib.parse.quote(nm)}"
        raw = get(url)
        d = json.loads(raw)["data"]
        intro = (d.get("introduction") or {}).get("text") or ""
        m = re.match(r"Introduced in Chapter (\d+), Season (\d+)\.", intro)
        if not m:
            raise SystemExit(f"STOP: {nm}: no usable season ({intro!r})")
        open(os.path.join(folder, "sources", f"{d['id']}.json"), "wb").write(raw)
        files.append({"file": f"{d['id']}.json", "source": f"Epic cosmetics data for {d['name']}", "url": url, "fetched_utc": now})
        art = d["images"].get("featured") or d["images"]["icon"]
        open(os.path.join(folder, "img", f"{d['id']}.png"), "wb").write(get(art))
        rounds.append({"id": d["id"], "name": d["name"].strip(), "rarity": d["rarity"]["value"], "chapter": int(m.group(1)), "season": int(m.group(2)), "intro": intro})
    json.dump({"via": "fortnite-api.com (mirror of Epic's cosmetics data)", "files": files}, open(os.path.join(folder, "sources", "manifest.json"), "w"), indent=1)
    slug = os.path.basename(folder.rstrip("/"))
    cfg = {"title": ["Guess the season", f"{len(rounds)} skins · no cheating"],
           "rounds": [{**{k: r[k] for k in ("id", "name", "rarity", "chapter", "season")}, "img": f"../../badroyale/video/auto/{slug}/img/{r['id']}.png"} for r in rounds],
           "caption": "#EpicPartner Guess the season 👀 Only true OGs get all 3 right. Drop your score below 👇\nUse code BAD in the Item Shop 💛\n#fortnite #fortniteog #guesstheseason",
           "claims": [{"text": f"{r['name']}: Chapter {r['chapter']}, Season {r['season']}", "source": f"{r['id']}.json", "match": [r["name"], r["intro"]]} for r in rounds]}
    open(os.path.join(folder, "scene.js"), "w").write("/* BAD ROYALE · Guess the Season. Facts: Epic's cosmetics data in sources/. */\nwindow.SCENE = TPL.guess(" + json.dumps(cfg, indent=1, ensure_ascii=False) + ");\n")
    phrases = [{"text": "Guess the season! Only true OGs get all three.", "pause": 0.25}]
    for r in rounds:
        phrases += [{"text": f"{r['name']}.", "pause": 1.7}, {"text": f"Chapter {r['chapter']}, Season {r['season']}.", "pause": 0.4}]
    phrases += [{"text": "How many did you get right? Tell me in the comments.", "pause": 0.2}, {"text": "Use code BAD in the Item Shop. It really helps the channel.", "pause": 0.25}, {"text": "Thank you for watching! Follow for more daily content.", "pause": 0.3}]
    json.dump({"phrases": phrases}, open(os.path.join(folder, "vo.json"), "w"), indent=1)
    body = "Guess the season 👀 Only true OGs get all 3 right\nDrop your score in the comments 👇\nUse code BAD in the Item Shop 💛"
    json.dump({"tiktok": f"#EpicPartner {body}\n#fortnite #fortniteog #guesstheseason", "tiktokTitle": "Guess the season 👀",
               "instagram": f"#EpicPartner {body}\n#fortnite #fortniteog #guesstheseason", "facebook": f"#EpicPartner {body}", "facebookTitle": "Guess the season",
               "youtube": f"#EpicPartner {body}\n#Fortnite #FortniteOG #Shorts", "youtubeTitle": "Guess the Season These Fortnite Skins Came Out 👀 #Shorts",
               "tags": ["fortnite", "fortnite og", "fortnite quiz", "guess the season", "fortnite skins"], "cover_t": 0.6},
              open(os.path.join(folder, "post.json"), "w"), indent=1, ensure_ascii=False)
    print(json.dumps([(r["name"], r["chapter"], r["season"]) for r in rounds]))


if __name__ == "__main__":
    if len(sys.argv) < 4:
        raise SystemExit(__doc__)
    main(os.path.abspath(sys.argv[1]), sys.argv[2:])
