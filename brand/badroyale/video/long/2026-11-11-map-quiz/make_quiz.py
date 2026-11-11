"""Generate long.json, vo.json, post.json and sources/ for the v43.00 map quiz from the official map data.

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
ph(f"Can you name every place on the new Fortnite map? Here are all {total} of them, with no labels.")
segs.append({"type": "stat", "p": 1, "big": str(total), "label": "places on the official map"})
ph(f"The official map has {len(named)} named locations and {len(marks)} landmarks.", 0.25)
ph("I'll pin a spot, give you a moment, then reveal it. Keep score, and tell me how you did at the end!", 0.4)
claims.append({"text": f"{total} places on the map: {len(named)} named locations, {len(marks)} landmarks", "source": "map.json",
               "match": [p["name"] for p in pois], "visual": f"{len(named)} ids with .POI., {len(marks)} UnNamedPOI ids"})
claims.append({"text": "Game build is v43.00", "source": "build.json", "match": ["Release-43.00"]})

# ---- round 1: named locations, hopping around the map
ring = sorted(named, key=ang)
order = [ring[(k * 5) % len(ring)] for k in range(len(ring))]
segs.append({"type": "title", "p": len(phrases), "chapter": "Round 1: named locations", "kicker": "ROUND 1", "lines": [f"The {len(named)} named", "locations"]})
ph(f"Round one: the {len(named)} named locations. These are the big ones, so let's see how you do.", 0.3)
for i, p in enumerate(order):
    question(i, p, "Named location")

segs.append({"type": "code", "p": len(phrases)})
ph("Halfway check: if you're grabbing anything from the Item Shop, use code BAD. It really helps the channel.", 0.4)

# ---- round 2: landmarks
segs.append({"type": "title", "p": len(phrases), "chapter": "Round 2: landmarks", "kicker": "ROUND 2", "lines": [f"The {len(marks)} landmarks"]})
ph(f"Round two: the {len(marks)} landmarks. These are smaller, so they're harder.", 0.3)
for j, p in enumerate(sorted(marks, key=ang)):
    question(len(named) + j, p, "Landmark")

# ---- score
segs.append({"type": "title", "p": len(phrases), "chapter": "Your score", "kicker": "YOUR SCORE", "lines": [f"How many out", f"of {total}?"]})
ph(f"That's all {total}. So, how many did you get?", 0.25)
ph(f"All {total}? You know this map better than most.", 0.2)
ph("Ten or more is a solid score.", 0.2)
ph("Under ten? Time to drop in and explore.", 0.3)
ph("Tell me your score in the comments!", 0.4)
segs.append({"type": "code", "p": len(phrases)})
ph("Use code BAD in the Item Shop. It really helps the channel.", 0.25)
ph("Thank you for watching! Follow for more daily content.", 0.6)

L = {"title": "Fortnite Map Quiz", "map": "blank",
     "caption": "#EpicPartner Can you name every place on the new Fortnite map? Use code BAD in the Item Shop.\n#Fortnite #FortniteMap",
     "claims": claims, "segments": segs}
json.dump(L, open(os.path.join(HERE, "long.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"phrases": phrases}, open(os.path.join(HERE, "vo.json"), "w"), indent=1, ensure_ascii=False)
json.dump({"youtubeTitle": f"Can You Name Every Place on the NEW Fortnite Map? 🗺️ Map Quiz (All {total} Spots)",
           "youtube": f"#EpicPartner Fortnite map quiz 🗺️ every place on the new map, pinned on the official map with the labels hidden. "
                      f"All {len(named)} named locations, then all {len(marks)} landmarks. Guess each one before the reveal and keep score!\n\n"
                      f"How many out of {total} did you get? 👇\n\nUse code BAD in the Item Shop 💛\n\n{{chapters}}\n\n#Fortnite #FortniteMap #FortniteQuiz",
           "tags": ["fortnite", "fortnite map", "fortnite map quiz", "fortnite quiz", "new fortnite map", "fortnite locations", "fortnite poi"],
           "thumb_t": 1.6}, open(os.path.join(HERE, "post.json"), "w"), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, "sources"), exist_ok=True)
man = json.load(open(os.path.join(SRC, "manifest.json")))
for f in ("map.json", "build.json"):
    shutil.copy(os.path.join(SRC, f), os.path.join(HERE, "sources", f))
man["files"] = [f for f in man["files"] if f["file"] in ("map.json", "build.json")]
json.dump(man, open(os.path.join(HERE, "sources", "manifest.json"), "w"), indent=1)
print(len(phrases), "phrases,", len(segs), "segments,", len(claims), "claims")
