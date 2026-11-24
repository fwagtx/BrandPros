"""Build episode.json for the Spanish item-shop video from fortnite-api.com data.

Usage: python3 -I prep.py <api_dir> <out_dir> [English item names, in order...]
With no names, picks automatically: today's biggest-saving bundle + 8 items
(leaving today, new today, added yesterday, OG), the same mix as the English video.
Pass exactly 1 bundle + 8 items if choosing by hand (the timeline is built for 9 segments).
"""
import json, os, sys, time, urllib.request, datetime

API, OUT = sys.argv[1], sys.argv[2]
ORDER = sys.argv[3:]
os.makedirs(os.path.join(OUT, "img"), exist_ok=True)

en_d = json.load(open(os.path.join(API, "shop_en.json")))["data"]
es_d = json.load(open(os.path.join(API, "shop_es.json")))["data"]
en, es = en_d["entries"], {x["offerId"]: x for x in es_d["entries"]}
shop_date = datetime.datetime.fromisoformat(en_d["date"].replace("Z", "+00:00")).date()

MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
def fecha(d): return f"{d.day} {MESES[d.month-1]}"
def num(n): return f"{n:,}"

# Card colours by rarity / series (sampled from the English video)
RARITY = {
    "common": ("#b9c3cc", "#6b7883"), "uncommon": ("#7ee83a", "#2f9a1c"),
    "rare": ("#2fb3f0", "#1d5fd6"), "epic": ("#c45cff", "#6a1fc4"),
    "legendary": ("#ffb347", "#c2571a"), "icon": ("#56dde3", "#13868f"),
    "bundle": ("#4fd9e3", "#167f8c"),
}

def title(x):
    if x.get("bundle"): return x["bundle"]["name"]
    return (x.get("brItems") or [{}])[0].get("name")

def find(name):
    exact = [x for x in en if title(x) == name and x.get("brItems")]
    if exact: return exact[0]
    loose = [x for x in en if title(x) and name.lower() in title(x).lower() and x.get("brItems")]
    if not loose: raise SystemExit(f"not in shop: {name}")
    return loose[0]

def fetch(url, name):
    path = os.path.join(OUT, "img", name)
    if not os.path.exists(path):
        req = urllib.request.Request(url, headers={"User-Agent": "shop-video-builder"})
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req, timeout=30) as r:
                    data = r.read()
                break
            except OSError:
                if attempt == 3: raise
                time.sleep(2 ** attempt)
        with open(path, "wb") as f:
            f.write(data)
    return "img/" + name

def parse_day(s): return datetime.datetime.fromisoformat(s.replace("Z", "+00:00")).date()

# Shop resets at 00:00 UTC = 6 PM in Mexico City (no DST since 2022)
RESET = "6 PM 🇲🇽"
CURRENT_CH = max((int((b.get("introduction") or {}).get("chapter") or 0)
                  for x in en for b in (x.get("brItems") or [])), default=0)
CURRENT_CH = str(CURRENT_CH)

def auto_pick():
    """Biggest-saving bundle + 8 items scored like the English video's picks."""
    bundles = [x for x in en if x.get("bundle") and x.get("brItems")]
    bundle = max(bundles, key=lambda x: x["regularPrice"] - x["finalPrice"])
    seen, scored = set(), []
    for x in en:
        items = x.get("brItems") or []
        if x.get("bundle") or len(items) != 1 or x.get("tracks") or x.get("cars") or x.get("instruments"):
            continue
        it = items[0]
        typ = it["type"]["value"]
        if typ not in ("outfit", "glider", "pickaxe", "sidekick", "backpack") or it["name"] in seen:
            continue
        seen.add(it["name"])
        indate, outdate = parse_day(x["inDate"]), parse_day(x["outDate"])
        ch = (it.get("introduction") or {}).get("chapter")
        price = x["finalPrice"]
        score = (3 if outdate <= shop_date else 0) + (3 if indate == shop_date else 0) \
            + (2 if indate == shop_date - datetime.timedelta(days=1) else 0) + (3 if ch == "1" else 0) \
            + (3 if typ == "outfit" else 0) + (1 if ch and ch != CURRENT_CH else 0) \
            + (1 if price >= 1200 else 0) - (2 if price < 500 else 0)
        scored.append((score, x["sortPriority"], x, typ))
    scored.sort(key=lambda r: (-r[0], -r[1]))
    picks, per_type = [], {}
    for score, _, x, typ in scored:
        if score < 4 or per_type.get(typ, 0) >= (5 if typ == "outfit" else 2):
            continue
        picks.append((x, typ)); per_type[typ] = per_type.get(typ, 0) + 1
        if len(picks) == 8: break
    # alternate outfits with other types, like the English video
    outfits = [x for x, t in picks if t == "outfit"]; others = [x for x, t in picks if t != "outfit"]
    order = []
    while outfits or others:
        if outfits: order.append(outfits.pop(0))
        if others: order.append(others.pop(0))
    return [bundle] + order

picks = [find(n) for n in ORDER] if ORDER else auto_pick()
segments = []
for i, x in enumerate(picks):
    s = es[x["offerId"]]
    is_bundle = bool(x.get("bundle"))
    it_en = x["brItems"][0]; it_es = s["brItems"][0]
    if is_bundle:
        img = fetch(x["bundle"]["image"], f"{i:02d}.png")
        es_name = s["bundle"]["name"]
        for pre in ("Lote de ", "Lote "):
            if es_name.startswith(pre): es_name = es_name[len(pre):]
        n_items = len(x["brItems"])
        names = [b["name"] for b in s["brItems"] if b["type"]["value"] != "shoe"][:3]
        save = x["regularPrice"] - x["finalPrice"]
        seg = dict(kind="bundle", name=es_name, img=img, color=RARITY["bundle"],
                   regular=x["regularPrice"], price=x["finalPrice"],
                   captions=[
                       dict(text="el lote con más ahorro hoy 🔥", style="dark", at=1.33),
                       dict(text=f"ahorra {num(save)} monedas V 🔥", style="yellow", at=4.33),
                       dict(text=f"{n_items} objetos: {', '.join(names[:2])} y más", style="dark", at=6.0),
                   ], badge=dict(emoji="🔥", at=4.33))
    else:
        im = it_en["images"]
        img = fetch(im.get("featured") or im["icon"], f"{i:02d}.png")
        rarity = it_en["rarity"]["value"]
        if (it_en.get("series") or {}).get("value") == "Icon Series": rarity = "icon"
        color = RARITY.get(rarity, RARITY["rare"])
        indate, outdate = parse_day(x["inDate"]), parse_day(x["outDate"])
        leaving = outdate <= shop_date
        intro = it_en.get("introduction") or {}
        ch, se = intro.get("chapter"), intro.get("season")
        og = ch == "1"
        old = ch and ch != CURRENT_CH
        new_today = indate == shop_date
        yesterday = indate == shop_date - datetime.timedelta(days=1)
        # Same caption rules as the English usecodebad video
        if leaving and (og or yesterday):
            fact = (f"og · capítulo {ch}, temporada {se} 🔥" if og else f"llegó el {fecha(indate)} 🆕")
            caps = [dict(text=f"se va en el próximo\nreinicio ({RESET}) ⏰", style="yellow", at=1.9),
                    dict(text=fact, style="yellow", at=3.0)]
        elif leaving and old:
            caps = [dict(text=f"del capítulo {ch}, temporada {se}", style="dark", at=1.9)]
        elif leaving:
            caps = [dict(text="se va en el próximo reinicio ⏰", style="yellow", at=1.9),
                    dict(text=f"el reinicio es a las {RESET} 👀", style="dark", at=3.0)]
        elif new_today:
            caps = [dict(text="nuevo en la tienda de hoy 🆕", style="yellow", at=1.9)]
        elif yesterday:
            caps = [dict(text=f"llegó el {fecha(indate)} 🆕", style="yellow", at=1.9)]
        elif og:
            caps = [dict(text=f"og · capítulo {ch}, temporada {se} 🔥", style="yellow", at=1.9)]
        else:
            caps = []
        seg = dict(kind="item", name=it_es["name"], img=img, color=color, price=x["finalPrice"],
                   captions=caps, badge=dict(emoji="⏰", at=1.9) if leaving else None, rarity=rarity,
                   type=it_en["type"]["value"])
    segments.append(seg)

# Intro: first three outfits in the list
outfits = [s for s in segments if s.get("type") == "outfit"][:3]
offers = sum(1 for x in en if x.get("brItems"))
episode = dict(
    date=fecha(shop_date), offers=offers,
    strings=dict(
        use_code="USA EL CÓDIGO:", code="BAD", partner="#EpicPartner",
        intro_title="la tienda de hoy 🛒", offers=f"{offers} ofertas en la tienda hoy",
        worth="esto es lo que vale la pena 👀", vbucks="monedas V", regular="precio normal",
        vbucks_today="monedas V hoy", buying="¿qué vas a comprar? 👇",
        use_code_cta="usa el código BAD en la tienda 💚", creator_code="CÓDIGO DE CREADOR",
        accept="Aceptar", sac="APOYA A UN CREADOR: BAD"),
    intro_cards=[dict(img=o["img"], color=o["color"], price=o["price"]) for o in outfits],
    segments=segments)
json.dump(episode, open(os.path.join(OUT, "episode.json"), "w"), ensure_ascii=False, indent=1)
for s in segments:
    print(s["kind"], "|", s["name"], "|", s["price"], "|", [c["text"] for c in s["captions"]])
