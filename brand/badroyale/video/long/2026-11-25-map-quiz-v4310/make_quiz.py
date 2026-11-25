"""Generate long.json, vo.json, post.json and sources/ for the v43.10 map quiz (Nov 25) from the official map data.

    python3 make_quiz.py        (run from anywhere; reads brand/badroyale/sources/, writes next to this file)

Each place is pinned on the unlabeled official map; the viewer guesses, then the name is revealed. Places, types
(named location or landmark), directions and distances all come from map.json, measured as in new_where.py and the
2026-11-04 map tour (100 map units = 1 meter, rounded to 10 meters, always said as "about").
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
named = [p for p in pois if ".POI." in p["id"]]
marks = [p for p in pois if ".POI." not in p["id"]]
a = [W.px(p) for p in named]
W.C[0], W.C[1] = sum(x for x, y in a) / len(a), sum(y for x, y in a) / len(a)
SAY = {"The $.$. Rocky": "The S S Rocky"}
NUM = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
       "thirteen", "fourteen", "fifteen", "sixteen", "seventeen"]


def m(p, q):
    return math.hypot(p["location"]["x"] - q["location"]["x"], p["location"]["y"] - q["location"]["y"]) / 100


def r10(v):
    return int(round(v / 10.0) * 10)


def ang(p):
    x, y = W.px(p)
    return math.degrees(math.atan2(x - W.C[0], W.C[1] - y)) % 360


def where(p):
    return W.direction(*W.px(p)).replace("the island", "the map")


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


def pin(p, z, name, sub, label):
    x, y = W.px(p)
    return {"type": "map", "p": len(phrases), "x": x, "y": y, "z": z, "name": name, "sub": sub, "pins": [{"x": x, "y": y, "label": label}]}


total = len(pois)
seen = []


def question(i, p, kind):
    segs.append(pin(p, 1.0, f"Place {i + 1} of {total}", f"{kind} · {where(p)}", "?"))
    ph(f"Number {NUM[i]}. A {kind.lower()}, {where(p)}.", 0.2)
    nn = sorted([q for q in named if q is not p], key=lambda q: m(p, q))
    got = [q for q in nn[:2] if q in seen]
    if got:
        ph(f"Hint: it's about {r10(m(p, got[0]))} meters from {got[0]['name']}, which you already got.", 0.2)
        claims.append({"text": f"{p['name']} ~{r10(m(p, got[0]))} m from {got[0]['name']}", "source": "map.json",
                       "match": [p["name"], got[0]["name"]], "visual": "distance between official POI coordinates"})
    ph("Three, two, one.", 1.0)
    segs.append(pin(p, 1.35, p["name"], kind, ""))
    ph(f"It's {p['name']}!", 0.25)
    k = nn[1] if got and got[0] is nn[0] else nn[0]
    rank = "closest" if k is nn[0] else "second closest"
    noun = "named location" if kind == "Landmark" else "named neighbor"
    ph(f"Its {rank} {noun} is {k['name']}, about {r10(m(p, k))} meters away.", 0.35)
    claims.append({"text": f"{p['name']}: {kind.lower()}, {where(p)}, {rank} named {k['name']} ~{r10(m(p, k))} m",
                   "source": "map.json", "match": [p["name"], k["name"]],
                   "visual": f"map pixel {W.px(p)}; unlabeled official map; distances between official POI coordinates"})
    seen.append(p)


# ---- intro
segs.append({"type": "title", "p": 0, "kicker": "MAP QUIZ", "lines": ["Can you name every", "place on the map?"]})
ph(f"Can you name every place on the Fortnite map after the v43.10 update? Here are all {total} of them, with no labels.")
segs.append({"type": "stat", "p": 1, "big": str(total), "label": "places on the official map"})
ph(f"The official map has {len(named)} named locations and {len(marks)} landmarks.", 0.25)
ph("I'll pin a spot, give you a moment, then reveal it. Keep score, and tell me how you did at the end!", 0.4)
claims.append({"text": f"{total} places on the map: {len(named)} named locations, {len(marks)} landmarks", "source": "map.json",
               "match": [p["name"] for p in pois], "visual": f"{len(named)} ids with .POI., {len(marks)} UnNamedPOI ids"})
claims.append({"text": "Game build is v43.10", "source": "build.json", "match": ["Release-43.10"]})

# ---- what changed since the v43.00 quiz (Nov 11 snapshot)
old = json.load(open(os.path.join(SRC, "history", "2026-11-11-map.json")))["data"]["pois"]
on, nn_ = {p["name"] for p in old}, {p["name"] for p in pois}
added, gone = sorted(nn_ - on), sorted(on - nn_)
assert added and gone, (added, gone)
segs.append({"type": "title", "p": len(phrases), "chapter": "What changed since the last quiz", "kicker": "SINCE THE LAST QUIZ",
             "lines": [f"{len(added)} new, {len(gone)} gone"]})
ph(f"If you took my last map quiz, heads up: the map changed since then.", 0.2)
ph(f"{NUM[len(added) - 1].capitalize()} places are new: {', '.join(added[:-1])} and {added[-1]}.", 0.2)
ph(f"And {NUM[len(gone) - 1]} are gone: {', '.join(gone[:-1])} and {gone[-1]}. So you can't just remember the old answers.", 0.35)
claims.append({"text": f"New since Nov 11: {added}; gone: {gone}", "source": "history/2026-11-11-map.json",
               "match": gone, "visual": "set difference of POI names, Nov 11 snapshot vs today"})
claims.append({"text": f"In today's map: {added}", "source": "map.json", "match": added})

# ---- round 1: named locations, hopping around the map
ring = sorted(named, key=ang)
order = [ring[(k * 4) % len(ring)] for k in range(len(ring))]   # different hop than the v43.00 quiz
segs.append({"type": "title", "p": len(phrases), "chapter": "Round 1: named locations", "kicker": "ROUND 1", "lines": [f"The {len(named)} named", "locations"]})
ph(f"Round one: the {len(named)} named locations. These are the big ones, so let's see how you do.", 0.3)
for i, p in enumerate(order):
    question(i, p, "Named location")

segs.append({"type": "code", "p": len(phrases)})
ph("Halfway check: if you're grabbing anything from the Item Shop, use code BAD. It really helps the channel.", 0.4)

# ---- round 2: landmarks
segs.append({"type": "title", "p": len(phrases), "chapter": "Round 2: landmarks", "kicker": "ROUND 2", "lines": [f"The {len(marks)} landmarks"]})
ph(f"Round two: the {len(marks)} landmarks. These are smaller, so they're harder.", 0.3)
for j, p in enumerate(sorted(marks, key=ang, reverse=True)):
    question(len(named) + j, p, "Landmark")

# ---- bonus: closest and farthest pair
pairs = sorted(((m(p, q), p, q) for i, p in enumerate(pois) for q in pois[i + 1:]), key=lambda t: t[0])
(d1, a1, b1), (d2, a2, b2) = pairs[0], pairs[-1]
segs.append({"type": "title", "p": len(phrases), "chapter": "Bonus round", "kicker": "BONUS ROUND", "lines": ["Closest and", "farthest"]})
ph("Bonus round, two quick ones.", 0.2)
ph("Which two places are the closest together on the whole map?", 0.2)
ph("Three, two, one.", 1.0)
x1, y1 = W.px(a1); x2, y2 = W.px(b1)
segs.append({"type": "map", "p": len(phrases), "x": (x1 + x2) / 2, "y": (y1 + y2) / 2, "z": 1.35, "name": f"{a1['name']} + {b1['name']}",
             "sub": f"about {r10(d1)} m apart", "pins": [{"x": x1, "y": y1, "label": ""}, {"x": x2, "y": y2, "label": ""}]})
ph(f"It's {a1['name']} and {b1['name']}, only about {r10(d1)} meters apart.", 0.3)
ph("And which two are the farthest apart?", 0.2)
ph("Three, two, one.", 1.0)
x1, y1 = W.px(a2); x2, y2 = W.px(b2)
segs.append({"type": "map", "p": len(phrases), "x": (x1 + x2) / 2, "y": (y1 + y2) / 2, "z": 1.0, "name": f"{a2['name']} + {b2['name']}",
             "sub": f"about {r10(d2)} m apart", "pins": [{"x": x1, "y": y1, "label": ""}, {"x": x2, "y": y2, "label": ""}]})
ph(f"{a2['name']} and {b2['name']}, about {r10(d2):,} meters apart, corner to corner.", 0.35)
claims.append({"text": f"Closest pair {a1['name']} / {b1['name']} ~{r10(d1)} m; farthest {a2['name']} / {b2['name']} ~{r10(d2)} m",
               "source": "map.json", "match": [a1["name"], b1["name"], a2["name"], b2["name"]], "visual": "all pairwise distances between official POI coordinates"})

# ---- score
segs.append({"type": "title", "p": len(phrases), "chapter": "Your score", "kicker": "YOUR SCORE", "lines": [f"How many out", f"of {total}?"]})
ph(f"That's all {total}. So, how many did you get?", 0.25)
ph(f"All {total}? You know this map better than most.", 0.2)
ph("Ten or more is a solid score, and bonus points if you got the bonus round.", 0.2)
ph("Under ten? Time to drop in and explore.", 0.3)
ph("Tell me your score in the comments!", 0.4)
segs.append({"type": "code", "p": len(phrases)})
ph("Use code BAD in the Item Shop. It really helps the channel.", 0.25)
ph("Thank you for watching! Follow for more daily content.", 0.6)

L = {"title": "Fortnite Map Quiz", "map": "blank",
     "caption": "#EpicPartner Can you name every place on the Fortnite map after v43.10? Use code BAD in the Item Shop.\n#Fortnite #FortniteMap",
     "claims": claims, "segments": segs}
json.dump(L, open(os.path.join(HERE, "long.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": phrases}, open(os.path.join(HERE, "vo.json"), "w"), indent=1, ensure_ascii=False)
pick = [p for p in pois if p["name"] in added] + [p for p in order if p["name"] not in added][:1]
yt = f"Can You Name Every Place on the Fortnite Map After v43.10? 🗺️ Map Quiz (All {total} Spots)"
assert len(yt) <= 100, len(yt)
json.dump({"youtubeTitle": yt,
           "youtube": f"#EpicPartner Fortnite map quiz 🗺️ every place on the map after the v43.10 update, pinned on the official map with the labels hidden. "
                      f"What changed since the last quiz ({len(added)} new, {len(gone)} gone), all {len(named)} named locations, all {len(marks)} landmarks, "
                      f"and a bonus round. Guess each one before the reveal and keep score!\n\n"
                      f"How many out of {total} did you get? 👇\n\nUse code BAD in the Item Shop 💛\n\n{{chapters}}\n\n#Fortnite #FortniteMap #FortniteQuiz",
           "tags": ["fortnite", "fortnite map", "fortnite map quiz", "fortnite quiz", "fortnite v43.10", "fortnite locations", "fortnite poi"],
           "thumb": {"lines": ["CAN YOU", "NAME ALL"], "big": f"{total}?", "chip": "V43.10 MAP QUIZ", "pins": [list(W.px(p)) for p in pick[:3]],
                     "focus": [int(sum(W.px(p)[0] for p in pick[:3]) / 3), int(sum(W.px(p)[1] for p in pick[:3]) / 3)]}},
          open(os.path.join(HERE, "post.json"), "w"), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, "sources"), exist_ok=True)
man = json.load(open(os.path.join(SRC, "manifest.json")))
for f in ("map.json", "build.json"):
    shutil.copy(os.path.join(SRC, f), os.path.join(HERE, "sources", f))
os.makedirs(os.path.join(HERE, "sources", "history"), exist_ok=True)
shutil.copy(os.path.join(SRC, "history", "2026-11-11-map.json"), os.path.join(HERE, "sources", "history", "2026-11-11-map.json"))
mf = next(f for f in man["files"] if f["file"] == "map.json")
man["files"] = [f for f in man["files"] if f["file"] in ("map.json", "build.json")] + [
    dict(mf, file="history/2026-11-11-map.json", fetched_utc="2026-11-11", note="snapshot saved by fetch_sources.py on 2026-11-11 (v43.00 map)")]
json.dump(man, open(os.path.join(HERE, "sources", "manifest.json"), "w"), indent=1)
print(len(phrases), "phrases,", len(segs), "segments,", len(claims), "claims")
