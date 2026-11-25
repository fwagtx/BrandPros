"""Every named location on the Fortnite map: all .POI. places from map.json, pinned in order clockwise from the north.
Directions and nearest named places are computed the same way as new_where.py."""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
BR = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(BR, "auto"))
import new_where as W
pois = json.load(open(os.path.join(BR, "sources", "map.json")))["data"]["pois"]
named = [p for p in pois if ".POI." in p["id"]]
marks = [p for p in pois if ".POI." not in p["id"]]
a = [W.px(p) for p in named]
W.C[0], W.C[1] = sum(x for x, y in a) / len(a), sum(y for x, y in a) / len(a)
d = lambda p, q: math.hypot(p["location"]["x"] - q["location"]["x"], p["location"]["y"] - q["location"]["y"])
ang = lambda p: math.degrees(math.atan2(W.px(p)[0] - W.C[0], W.C[1] - W.px(p)[1])) % 360
named.sort(key=ang)
N = len(named)
words = {11: "eleven"}
phr = [{"text": f"There are {words.get(N, N)} named locations on the Fortnite map. Here's every single one, in under a minute.", "pause": 0.2}]
shots = [{"p": 0, "x": W.C[0], "y": W.C[1], "z": 0.55}]
pins, claims = [], [{"text": f"{N} landmarks on the map", "source": "map.json", "match": [m["name"] for m in marks], "visual": f"{N} UnNamedPOI ids"}]
lead = ["Starting with"] + [""] * (N - 2) + ["And last,"]
SAY = {"The $.$. Rocky": "The S S Rocky"}
for i, m in enumerate(named):
    x, y = W.px(m)
    where = W.direction(x, y).replace(" of the island", "").replace("the island", "the map")
    t = f"{lead[i]} {m['name']}, {where}.".strip()
    t = t[0].upper() + t[1:]
    ph_ = {"text": t, "pause": 0.15}
    if any(k in t for k in SAY):
        ph_["say"] = t.replace("The $.$. Rocky", "The S S Rocky")
    phr.append(ph_)
    p = len(phr) - 1
    shots.append({"p": p, "x": round(x, 1), "y": round(y, 1), "z": 1.25, "ease": "out5", "whoosh": 1})
    pins.append({"x": round(x, 1), "y": round(y, 1), "p": p, "dt": 0.1, "label": m["name"], "lx": -160, "ly": 90, "labUntil": p + 1})   # one label at a time: 11 would pile up under the title
    claims.append({"text": f"{m['name']}: named location, {where}", "source": "map.json", "match": [m["name"]],
                   "visual": f"map pixel ({x:.0f}, {y:.0f})"})
phr.append({"text": "Which one is your favorite drop? Tell me in the comments!", "pause": 0.25})
shots.append({"p": len(phr) - 1, "x": W.C[0], "y": W.C[1], "z": 0.55, "ease": "out5", "whoosh": 1})
phr += [{"text": "Use code BAD in the Item Shop. It really helps the channel.", "pause": 0.25},
        {"text": "Thank you for watching! Follow for more daily content.", "pause": 0.3}]
shots.append({"p": "end", "x": W.C[0], "y": W.C[1], "z": 0.6})
scene = {"title": [f"Every named location", "on the Fortnite map"], "map": "blank", "titleSize": 56, "shots": shots, "pins": pins,
         "caption": f"#EpicPartner Every named location on the Fortnite map 📍 all {N} of them\nUse code BAD in the Item Shop 💛\n#fortnite #fortnitemap #fortnitelocations",
         "claims": claims}
open(os.path.join(HERE, "scene.js"), "w").write("/* BAD ROYALE · Every named location on the map. Facts: brand/badroyale/sources/map.json. */\nwindow.SCENE = TPL.map("
                                               + json.dumps(scene, indent=1, ensure_ascii=False) + ");\n")
json.dump({"phrases": phr}, open(os.path.join(HERE, "vo.json"), "w"), indent=1, ensure_ascii=False)
names = ", ".join(m["name"] for m in named[:-1]) + " and " + named[-1]["name"]
cap = f"#EpicPartner Every named location on the Fortnite map 📍 all {N}: {names}\nWhich one is your favorite drop? 👇\nUse code BAD in the Item Shop 💛"
json.dump({"tiktok": cap + "\n#fortnite #fortnitemap #fortnitelocations", "tiktokTitle": f"Every named location on the map 📍",
           "instagram": cap + "\n#fortnite #fortnitemap #fortnitelocations", "facebook": cap, "facebookTitle": "Every named location on the Fortnite map",
           "youtube": cap + "\n#Fortnite #FortniteMap #Shorts", "youtubeTitle": f"Every Named Location on the Fortnite Map (All {N}) 📍 #Shorts",
           "tags": ["fortnite", "fortnite map", "fortnite named locations", "fortnite locations", "fortnite pois"],
           "cover": {"lines": ["EVERY NAMED"], "big": "LOCATION", "chip": f"ALL {N} ON THE MAP", "map": [round(W.C[0], 1), round(W.C[1], 1)]}},
          open(os.path.join(HERE, "post.json"), "w"), indent=1, ensure_ascii=False)
print([p["text"] for p in phr])
