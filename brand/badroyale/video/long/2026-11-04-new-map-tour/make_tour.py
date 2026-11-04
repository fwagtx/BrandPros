"""Generate long.json, vo.json, post.json and sources/ for the v43.00 map tour from the official map data.

    python3 make_tour.py        (run from anywhere; reads brand/badroyale/sources/, writes next to this file)

Every place, direction and distance comes from map.json: directions are measured from the middle of the named
locations (as new_where.py does), distances are straight lines between POI coordinates (100 map units = 1 meter),
rounded to the nearest 10 meters and always said as "about".
"""
import json
import math
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BR = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC = os.path.join(BR, "sources")
sys.path.insert(0, os.path.join(BR, "auto"))
import new_where as W  # noqa: E402

pois = json.load(open(os.path.join(SRC, "map.json")))["data"]["pois"]
news = json.load(open(os.path.join(SRC, "news.json")))["data"]["br"]["motds"]
named = [p for p in pois if ".POI." in p["id"]]
marks = [p for p in pois if ".POI." not in p["id"]]
a = [W.px(p) for p in named]
W.C[0], W.C[1] = sum(x for x, y in a) / len(a), sum(y for x, y in a) / len(a)
SAY = {"The $.$. Rocky": "The S S Rocky"}


def m(p, q):
    return math.hypot(p["location"]["x"] - q["location"]["x"], p["location"]["y"] - q["location"]["y"]) / 100


def r10(v):
    return int(round(v / 10.0) * 10)


def ang(p):
    x, y = W.px(p)
    return math.degrees(math.atan2(x - W.C[0], W.C[1] - y)) % 360


def compass(p, q):
    (x0, y0), (x1, y1) = W.px(p), W.px(q)
    a_ = math.degrees(math.atan2(x1 - x0, y0 - y1)) % 360
    return ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][int((a_ + 22.5) // 45) % 8]


def where(p):
    return W.direction(*W.px(p))


def say(t):
    for k, v in SAY.items():
        t = t.replace(k, v)
    return t


phrases, segs, claims = [], [], []


def ph(text, pause=0.25):
    d = {"text": text, "pause": pause}
    if say(text) != text:
        d["say"] = say(text)
    phrases.append(d)
    return len(phrases) - 1


def pin(p, z, kind, label=""):
    x, y = W.px(p)
    return {"type": "map", "p": len(phrases), "x": x, "y": y, "z": z, "name": p["name"],
            "sub": f"{kind} · {where(p).replace(' of the island', ' of the map').replace('the island', 'the map')}", "pins": [{"x": x, "y": y, "label": label}]}


adv = next(t for t in news if t["title"] == "Adventure Awaits!")
old = sorted({p["name"] for p in json.load(open(os.path.join(SRC, "history", "2026-10-31-map.json")))["data"]["pois"]})
assert not set(old) & {p["name"] for p in pois}

# ---- intro
segs.append({"type": "title", "p": 0, "kicker": "NEW MAP TOUR", "lines": ["Every place on the", "new Fortnite map"]})
ph("Fortnite has a whole new island, and this is a full tour of every place on it, straight from Epic's official map data.")
segs.append({"type": "stat", "p": 1, "big": str(len(pois)), "label": "places on the official map"})
ph(f"There are {len(pois)} places on it: {len(named)} named locations and {len(marks)} landmarks.")
ph("And it really is new. Not one place from last week's map is still on it.")
ph("We'll go clockwise from the north, with real distances between every stop. Save this one for your next drop!", 0.4)
claims += [{"text": f"{len(pois)} places on the map: {len(named)} named locations, {len(marks)} landmarks", "source": "map.json",
            "match": [p["name"] for p in pois], "visual": f"{len(named)} ids with .POI., {len(marks)} UnNamedPOI ids"},
           {"text": f"None of last week's {len(old)} places (2026-10-31 snapshot) is on the map", "source": "map.json", "absent": old},
           {"text": "Game build is v43.00", "source": "build.json", "match": ["Release-43.00"]}]

# ---- the news tile about the island
segs.append({"type": "quote", "p": len(phrases), "kicker": "IN-GAME NEWS", "title": adv["title"],
             "lines": [{"p": len(phrases) + 1, "text": "Explore One Piece's Arlong Park, sail past Baratie Bay,"},
                       {"p": len(phrases) + 2, "text": "or storm The $.$. Rocky on this mysterious skull-shaped island."}]})
ph("Here's how Epic sums it up in the in-game news.", 0.2)
ph("Explore One Piece's Arlong Park, sail past Baratie Bay,", 0.15)
ph("or storm The $.$. Rocky on this mysterious skull-shaped island.", 0.4)
claims.append({"text": "Adventure Awaits! news tile", "source": "news.json", "match": ["Adventure Awaits!", adv["body"]]})

NEWS_LINE = {"Arlong Park": "Epic's news tile tells you to explore it.", "The $.$. Rocky": "Epic's news tile says to storm it.",
             "Baratie": "Epic's news tile says to sail past Baratie Bay."}

# ---- part 1: named locations, clockwise from the north
tour = sorted(named, key=ang)
segs.append({"type": "title", "p": len(phrases), "chapter": f"{len(named)} named locations", "kicker": "PART 1", "lines": [f"The {len(named)} named", "locations"]})
ph(f"Part one: the {len(named)} named locations.", 0.3)
opener = ["First up, {n}, {w}.", "Next, {n}, {w}.", "{n} is {w}.", "Then {n}, {w}.", "After that, {n}, {w}.", "Keep going and you hit {n}, {w}."]
for i, p in enumerate(tour):
    segs.append(pin(p, 1.35, "Named location"))
    ph(opener[0 if i == 0 else 1 + (i - 1) % 5].format(n=p["name"], w=where(p)), 0.2)
    nn = sorted([q for q in named if q is not p], key=lambda q: m(p, q))
    ph(f"Its closest neighbors are {nn[0]['name']} and {nn[1]['name']}.", 0.25)
    claims.append({"text": f"{p['name']}: named location, {where(p)}, closest {nn[0]['name']}, then {nn[1]['name']}",
                   "source": "map.json", "match": [p["name"], nn[0]["name"], nn[1]["name"]],
                   "visual": f"map pixel {W.px(p)}; distances between official POI coordinates"})
    lm = [k for k in marks if min(named, key=lambda q: m(k, q)) is p]
    for k in lm:
        ph(f"Landmark nearby: {k['name']}, about {r10(m(p, k))} meters away.", 0.25)
        claims.append({"text": f"{k['name']} ~{r10(m(p, k))} m from {p['name']}", "source": "map.json", "match": [k["name"], p["name"]], "visual": "distance between official POI coordinates"})
    if p["name"] in NEWS_LINE:
        ph(NEWS_LINE[p["name"]], 0.25)
    if i < len(tour) - 1:
        q = tour[i + 1]
        ph(f"Next stop: {q['name']}, about {r10(m(p, q))} meters to the {compass(p, q)}.", 0.3)
        claims.append({"text": f"{p['name']} to {q['name']}: ~{r10(m(p, q))} m {compass(p, q)}", "source": "map.json", "match": [p["name"], q["name"]],
                       "visual": "distance and compass bearing between official POI coordinates"})

segs.append({"type": "code", "p": len(phrases)})
ph("Quick one: if you're grabbing anything from the Item Shop, use code BAD. It really helps the channel.", 0.4)

# ---- part 2: landmarks
segs.append({"type": "title", "p": len(phrases), "chapter": f"{len(marks)} landmarks", "kicker": "PART 2", "lines": [f"The {len(marks)} landmarks"]})
ph(f"Part two: the {len(marks)} landmarks.", 0.3)
for i, p in enumerate(sorted(marks, key=ang)):
    segs.append(pin(p, 1.5, "Landmark"))
    ph(opener[0 if i == 0 else i % 5 + 1].format(n=p["name"], w=where(p)), 0.2)
    nn = sorted(named, key=lambda q: m(p, q))
    d0 = r10(m(p, nn[0]))
    ph(f"It's about {d0} meters from {nn[0]['name']}, the closest named location." if d0 > 50 else f"It sits right at {nn[0]['name']}, only about {d0} meters away.", 0.25)
    claims.append({"text": f"{p['name']}: landmark, {where(p)}, closest named {nn[0]['name']} ~{d0} m", "source": "map.json", "match": [p["name"], nn[0]["name"]],
                   "visual": f"map pixel {W.px(p)}; distances between official POI coordinates"})
    if p["name"] in NEWS_LINE:
        ph(NEWS_LINE[p["name"]], 0.25)

# ---- part 3: drop guide from the distances
pairs = [(m(p, q), p, q) for i, p in enumerate(named) for q in named[i + 1:]]
close, far = min(pairs, key=lambda t: t[0]), max(pairs, key=lambda t: t[0])
lone = max(named, key=lambda p: min(m(p, q) for q in named if q is not p))
lone_d = min(m(lone, q) for q in named if q is not lone)
mid = min(named, key=lambda p: math.hypot(W.px(p)[0] - W.C[0], W.px(p)[1] - W.C[1]))


def pair_seg(p, q, title, sub):
    (x0, y0), (x1, y1) = W.px(p), W.px(q)
    return {"type": "map", "p": len(phrases), "x": round((x0 + x1) / 2, 1), "y": round((y0 + y1) / 2, 1), "z": 1.1 if m(p, q) < 500 else 0.62,
            "name": title, "sub": sub, "pins": [{"x": x0, "y": y0, "label": ""}, {"x": x1, "y": y1, "label": ""}]}


segs.append({"type": "title", "p": len(phrases), "chapter": "Drop guide", "kicker": "PART 3", "lines": ["Drop guide"]})
ph("Part three: a quick drop guide, from the same map data.", 0.3)
segs.append(pair_seg(close[1], close[2], "Closest pair", f"{close[1]['name']} + {close[2]['name']}"))
ph(f"The two named locations closest together are {close[1]['name']} and {close[2]['name']}, about {r10(close[0])} meters apart.", 0.2)
ph("Land at one, and you can rotate into the other fast.", 0.3)
segs.append(pin(lone, 1.3, "Most isolated"))
ph(f"The most isolated named location is {lone['name']}. Its closest neighbor is about {r10(lone_d)} meters away.", 0.2)
ph("More room to loot before anyone shows up.", 0.3)
segs.append(pair_seg(far[1], far[2], "Farthest apart", f"{far[1]['name']} ↔ {far[2]['name']}"))
ph(f"The two named locations farthest apart are {far[1]['name']} and {far[2]['name']}, about {r10(far[0])} meters across the island.", 0.3)
segs.append(pin(mid, 1.3, "Closest to the middle"))
ph(f"And the named location closest to the middle of the island is {mid['name']}.", 0.3)
claims += [{"text": f"Closest named pair {close[1]['name']} / {close[2]['name']} ~{r10(close[0])} m", "source": "map.json", "match": [close[1]["name"], close[2]["name"]], "visual": "minimum over all named pairs"},
           {"text": f"Most isolated named location {lone['name']}, nearest ~{r10(lone_d)} m", "source": "map.json", "match": [lone["name"]], "visual": "maximum nearest-neighbor distance over named locations"},
           {"text": f"Farthest named pair {far[1]['name']} / {far[2]['name']} ~{r10(far[0])} m", "source": "map.json", "match": [far[1]["name"], far[2]["name"]], "visual": "maximum over all named pairs"},
           {"text": f"Closest named location to the middle: {mid['name']}", "source": "map.json", "match": [mid["name"]], "visual": "middle = centroid of the named locations"}]

# ---- recap in tour order
segs.append({"type": "title", "p": len(phrases), "chapter": "Recap", "kicker": "RECAP", "lines": [f"All {len(named)} named", "locations"]})
ph("Quick recap of all the named locations, clockwise from the north.", 0.25)
names = [p["name"] for p in tour]
for j in range(0, len(names), 3):
    g = names[j:j + 3]
    ph((", ".join(g[:-1]) + ", and " + g[-1] + ("." if j + 3 >= len(names) else ",")) if j + 3 >= len(names) else ", ".join(g) + ",", 0.2)
claims.append({"text": "Recap of the named locations", "source": "map.json", "match": names})

# ---- wrap-up
segs.append({"type": "title", "p": len(phrases), "chapter": "Wrap-up", "kicker": "THAT'S THE MAP", "lines": ["Where are you", "dropping first?"]})
ph("That's every place on the new map.", 0.2)
ph("Where are you dropping first? Tell me in the comments!", 0.4)
segs.append({"type": "code", "p": len(phrases)})
ph("Use code BAD in the Item Shop. It really helps the channel.", 0.25)
ph("Thank you for watching! Follow for more daily content.", 0.6)

L = {"title": "Every Place on the New Fortnite Map", "map": "blank",
     "caption": "#EpicPartner A full tour of every place on the new Fortnite map. Use code BAD in the Item Shop.\n#Fortnite #FortniteMap",
     "claims": claims, "segments": segs}
json.dump(L, open(os.path.join(HERE, "long.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": phrases}, open(os.path.join(HERE, "vo.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"youtubeTitle": f"Every Place on the NEW Fortnite Map 🗺️ Full Tour (All {len(pois)} Spots)",
           "youtube": f"#EpicPartner A full tour of EVERY place on the new Fortnite map 🗺️ all {len(named)} named locations and all {len(marks)} landmarks, "
                      "clockwise from the north, with the real distance to every next stop, straight from the official map data. "
                      "Plus a quick drop guide: the closest pair, the most isolated spot and more.\n\nWhere are you dropping first? 👇\n\n"
                      "Use code BAD in the Item Shop 💛\n\n{chapters}\n\n#Fortnite #FortniteMap #OnePiece",
           "tags": ["fortnite", "fortnite map", "new fortnite map", "fortnite map tour", "fortnite locations", "fortnite one piece", "fortnite poi"],
           "thumb_t": 1.6}, open(os.path.join(HERE, "post.json"), "w"), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, "sources"), exist_ok=True)
man = json.load(open(os.path.join(SRC, "manifest.json")))
for f in ("map.json", "news.json", "build.json"):
    shutil.copy(os.path.join(SRC, f), os.path.join(HERE, "sources", f))
man["files"] = [f for f in man["files"] if f["file"] in ("map.json", "news.json", "build.json")]
json.dump(man, open(os.path.join(HERE, "sources", "manifest.json"), "w"), indent=1)
print(len(phrases), "phrases,", len(segs), "segments,", len(claims), "claims")
