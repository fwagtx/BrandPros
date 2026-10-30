"""Make a "Where is <place> in Fortnite?" short folder from one name on the official map.

    python3 brand/badroyale/auto/new_where.py <folder> "<place name from map.json>"

People search for these when a quest names a spot. Everything comes from brand/badroyale/sources/map.json
(the place, its direction from the island center and its nearest named location). Writes scene.js (TPL.map),
vo.json and post.json; then build and ship with make_short.py like any short.
"""
import json
import math
import os
import re
import sys

SRC = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sources"))
C = (1010, 1010)                                    # island center on the 2048 map image


def px(p):
    return (round(0.0066081 * p["location"]["x"] + 976.46, 1), round(0.0066058 * p["location"]["y"] + 1016.67, 1))


def direction(x, y):
    dx, dy = x - C[0], C[1] - y
    if math.hypot(dx, dy) < 170:
        return "near the center of the island"
    d = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][int(((math.degrees(math.atan2(dx, dy)) + 360) % 360 + 22.5) // 45) % 8]
    return f"on the far {d} edge of the island" if math.hypot(dx, dy) > 620 else f"in the {d} of the island"


def main(folder, name):
    pois = json.load(open(os.path.join(SRC, "map.json")))["data"]["pois"]
    me = [p for p in pois if p["name"] == name]
    if len(me) != 1:
        raise SystemExit(f"STOP: {name!r} must be exactly one place on the map (found {len(me)})")
    x, y = px(me[0])
    named = [p for p in pois if ".POI." in p["id"] and p["name"] != name]
    near = min(named, key=lambda q: math.hypot(px(q)[0] - x, px(q)[1] - y))["name"]
    d = direction(x, y)
    slug = os.path.basename(folder.rstrip("/"))
    tag = "#" + re.sub(r"[^a-z0-9]", "", name.lower())
    # wide shot: centered on the island, but slid toward the place so its pin lands at screen x 300-700, y 430-900
    # (the camera focus is (540, 820) at zoom 0.55); lower than that the label runs into the captions at y 1150
    wx, wy = min(max(1010, x - 291), x + 436), min(max(1010, y - 145), y + 709)
    cfg = {"title": [f"Where is {name}?", "Fortnite map"], "map": "labels", "titleSize": 56 if len(name) < 18 else 48,
           "shots": [{"p": 0, "x": x, "y": y, "z": 1.6}, {"p": 1, "x": round(wx, 1), "y": round(wy, 1), "z": 0.55, "ease": "out5", "whoosh": 1},
                     {"p": 2, "x": x, "y": y, "z": 1.7, "ease": "out5", "whoosh": 1}, {"p": "end", "x": x, "y": y, "z": 1.8}],
           "pins": [{"x": x, "y": y, "p": 0, "dt": 0.35, "label": name if len(name) < 16 else "HERE", "lx": -160, "ly": 90}],
           "caption": f"#EpicPartner Where is {name} in Fortnite? 📍\nUse code BAD in the Item Shop 💛\n#fortnite #fortnitemap #fortnitelocations",
           "claims": [{"text": f"{name} is a place on the official map", "source": "map.json", "match": [name]},
                      {"text": f"It is {d}, nearest named location {near}", "source": "map-labels.png", "visual": f"map pixel ({x:.0f}, {y:.0f}); nearest named POI by coordinates: {near}"}]}
    os.makedirs(folder, exist_ok=True)
    open(os.path.join(folder, "scene.js"), "w").write(f"/* BAD ROYALE · Where is {name}? Facts: brand/badroyale/sources/map.json. */\nwindow.SCENE = TPL.map(" + json.dumps(cfg, indent=1, ensure_ascii=False) + ");\n")
    phrases = [{"text": f"Can't find {name} in Fortnite? Here's exactly where it is.", "pause": 0.25},
               {"text": f"It's {d},", "pause": 0.1},
               {"text": f"right here, closest to {near}.", "pause": 0.3},
               {"text": "Save this for your next quest!", "pause": 0.2},
               {"text": "Use code BAD in the Item Shop. It really helps the channel.", "pause": 0.25}, {"text": "Thank you for watching! Follow for more daily content.", "pause": 0.3}]
    json.dump({"phrases": phrases}, open(os.path.join(folder, "vo.json"), "w"), indent=1, ensure_ascii=False)
    # "in the south of the island" -> "south on the map"; edges and the center keep their own wording
    where_map = d.replace(" of the island", " of the map") if not d.startswith("in the ") else d[7:].replace(" of the island", "") + " on the map"
    body = f"Can't find {name}? 📍 It's {where_map}, closest to {near}\nSave this for your next quest 📌"
    json.dump({"tiktok": f"#EpicPartner {body}\nUse code BAD in the Item Shop 💛\n#fortnite #fortnitemap #fortnitelocations", "tiktokTitle": f"Where is {name}? 📍",
               "instagram": f"#EpicPartner {body}\nUse code BAD in the Item Shop 💛\n#fortnite #fortnitemap #fortnitelocations",
               "facebook": f"#EpicPartner {body}\nUse code BAD in the Item Shop 💛", "facebookTitle": f"Where is {name} in Fortnite?",
               "youtube": f"#EpicPartner {body}\nUse code BAD in the Item Shop 💛\n#Fortnite #FortniteMap #Shorts", "youtubeTitle": f"Where Is {name} in Fortnite? 📍 #Shorts",
               "tags": ["fortnite", f"{name.lower()} fortnite", f"where is {name.lower()}", "fortnite map", "fortnite locations"], "cover_t": 0.8},
              open(os.path.join(folder, "post.json"), "w"), indent=1, ensure_ascii=False)
    print(json.dumps({"place": name, "where": d, "closest": near}))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(os.path.abspath(sys.argv[1]), sys.argv[2])
