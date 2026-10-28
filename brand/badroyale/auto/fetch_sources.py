"""Refresh BAD ROYALE's official-data sources (brand/badroyale/sources/) and say what changed.

    python3 brand/badroyale/auto/fetch_sources.py

Fetches Epic's in-game news feed, the map POI data, the current build and the two official map
images from fortnite-api.com (a mirror of Epic's data; Epic's own hosts are blocked here), stamps
manifest.json with the fetch time (the pre-post checklist needs sources under 24 hours old), keeps a
dated copy of the small JSON files in sources/history/, and prints what changed since the last fetch:
new or removed news tiles, new or removed places on the map, and a new build. Those changes are
what the "What changed" and "Breaking" videos are made from.
"""
import datetime
import json
import os
import time
import urllib.request

SRC = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sources"))
API = "https://fortnite-api.com"
FILES = [("news.json", "Epic in-game news feed (Battle Royale MOTDs)", f"{API}/v2/news"),
         ("map.json", "Battle Royale map POI data", f"{API}/v1/map"),
         ("build.json", "Current game build (version)", f"{API}/v2/aes"),
         ("map-blank.png", "Official Battle Royale map image, no labels", f"{API}/images/map.png"),
         ("map-labels.png", "Official Battle Royale map image, POI labels", f"{API}/images/map_en.png")]


def get(url):
    for i in range(4):
        try:
            return urllib.request.urlopen(url, timeout=120).read()
        except Exception:
            if i == 3:
                raise
            time.sleep(4 * (i + 1))


def load(name):
    try:
        return json.load(open(os.path.join(SRC, name)))
    except Exception:
        return None


def tiles(news):
    br = ((news or {}).get("data") or {}).get("br") or {}
    return {m.get("title"): (m.get("body") or "") for m in (br.get("motds") or [])}


def pois(m):
    return {p.get("id"): (p.get("name") or "") for p in (((m or {}).get("data") or {}).get("pois") or [])}


def main():
    old = {"news": load("news.json"), "map": load("map.json"), "build": load("build.json")}
    now = datetime.datetime.now(datetime.timezone.utc)
    stamp = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    man = {"via": "fortnite-api.com (mirror of Epic in-game data). Epic CDN and fortnite.com are blocked from cloud sessions.", "files": []}
    for name, what, url in FILES:
        open(os.path.join(SRC, name), "wb").write(get(url))
        man["files"].append({"file": name, "source": what, "url": url, "fetched_utc": stamp})
    json.dump(man, open(os.path.join(SRC, "manifest.json"), "w"), indent=2)
    hist = os.path.join(SRC, "history")
    os.makedirs(hist, exist_ok=True)
    day = now.strftime("%Y-%m-%d")
    for name in ("news.json", "map.json", "build.json"):
        open(os.path.join(hist, f"{day}-{name}"), "w").write(open(os.path.join(SRC, name)).read())

    new = {"news": load("news.json"), "map": load("map.json"), "build": load("build.json")}
    t0, t1 = tiles(old["news"]), tiles(new["news"])
    p0, p1 = pois(old["map"]), pois(new["map"])
    b0 = ((old["build"] or {}).get("data") or {}).get("build")
    b1 = ((new["build"] or {}).get("data") or {}).get("build")
    print(json.dumps({
        "fetched_utc": stamp,
        "build": b1, "new_build": bool(b0 and b1 and b0 != b1),
        "news_tiles": list(t1),
        "news_added": [t for t in t1 if t not in t0], "news_removed": [t for t in t0 if t not in t1],
        "places_added": sorted({p1[k] for k in p1 if k not in p0 and p1[k]}), "places_removed": sorted({p0[k] for k in p0 if k not in p1 and p0[k]}),
    }, indent=1, ensure_ascii=False))


main()
