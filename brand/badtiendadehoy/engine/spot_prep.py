""""Lote del día": plan one bundle spotlight per day for the next days, so videos can be queued ahead on every platform.

    python3 -I spot_prep.py <api_dir> <spot_root> <ledger.json> <first_day YYYY-MM-DD> <days>

For each day (earliest first) it picks a bundle not featured before (ledger kind "spot") that is still in the shop the
day after posting, with a saving of at least 1,000 monedas V; among those, the one leaving soonest goes first (so every
bundle gets its turn before it leaves), ties by bigger saving. Facts come only from the shop data.
Writes <spot_root>/<day>/spot.json (bundle data + script) and downloads the images to <spot_root>/<day>/img/.
"""
import datetime, json, os, sys, time, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voice import words, words_f, say  # noqa: E402

API, ROOT, LEDGER, FIRST, DAYS = sys.argv[1], sys.argv[2], sys.argv[3], datetime.date.fromisoformat(sys.argv[4]), int(sys.argv[5])
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
fecha = lambda d: f"{d.day} de {MESES[d.month - 1]}"
day = lambda s: datetime.datetime.fromisoformat(s.replace("Z", "+00:00")).date()
en = json.load(open(os.path.join(API, "shop_en.json")))["data"]
es = {x["offerId"]: x for x in json.load(open(os.path.join(API, "shop_es.json")))["data"]["entries"]}
used = {r["bundle"] for r in (json.load(open(LEDGER)) if os.path.exists(LEDGER) else []) if r.get("kind") == "spot"}


def fetch(url, path):
    if not os.path.exists(path):
        for attempt in range(4):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "badtiendadehoy"}), timeout=40) as r:
                    open(path, "wb").write(r.read())
                return
            except OSError:
                if attempt == 3: raise
                time.sleep(2 ** attempt)


cands, seen = [], set()
for x in en["entries"]:
    if not (x.get("bundle") and x.get("brItems") and x["finalPrice"] > 0): continue
    s = es.get(x["offerId"])
    if not s: continue
    name = s["bundle"]["name"]
    for pre in ("Lote de ", "Lote "):
        if name.startswith(pre): name = name[len(pre):]
    save = x["regularPrice"] - x["finalPrice"]
    if name in seen or name in used or save < 1000: continue
    seen.add(name)
    cands.append(dict(x=x, s=s, name=name, save=save, out=day(x["outDate"])))

plans = []
for k in range(DAYS):
    d = FIRST + datetime.timedelta(days=k)
    if os.path.exists(os.path.join(ROOT, d.isoformat(), "spot.json")):
        continue                                          # already planned (or built) for that day
    ok = [c for c in cands if c["out"] > d]               # still in the shop the day after it posts
    if not ok:
        print(f"{d}: no bundle left that stays past this day"); continue
    c = sorted(ok, key=lambda c: (c["out"], -c["save"]))[0]
    cands.remove(c)
    x, s = c["x"], c["s"]
    items_es = {i["id"]: i for i in s["brItems"]}
    outfits = [i for i in x["brItems"] if i["type"]["value"] == "outfit"]
    show = (outfits + [i for i in x["brItems"] if i["type"]["value"] != "outfit"])[:6]
    out_dir = os.path.join(ROOT, d.isoformat()); os.makedirs(os.path.join(out_dir, "img"), exist_ok=True)
    fetch(x["bundle"]["image"], os.path.join(out_dir, "img", "bundle.png"))
    icons = []
    for j, it in enumerate(show):
        url = (it.get("images") or {}).get("icon") or (it.get("images") or {}).get("smallIcon")
        if url:
            fetch(url, os.path.join(out_dir, "img", f"i{j}.png"))
            icons.append(dict(img=f"img/i{j}.png", rarity=it["rarity"]["value"]))
    pct = round(100 * c["save"] / x["regularPrice"])
    names = [items_es.get(i["id"], i)["name"] for i in outfits][:2]
    n = say(c["name"])
    lines = [
        dict(scene="hook", text=f"¿Vale la pena el lote de {n}? ¡Mira!"),
        dict(scene="detail", text=" ".join([
            f"Trae {words(len(x['brItems']))} objetos" + (", con " + ", ".join(say(m) for m in names) if names else "") + "… y más.",
            f"Por separado costaría {words_f(x['regularPrice'])} monedas… y el lote está en {words_f(x['finalPrice'])}.",
            f"¡Te ahorras el {words(pct)} por ciento!",
            f"Está en la tienda hasta el {words(c['out'].day)} de {MESES[c['out'].month - 1]}."])),
        dict(scene="cta", text="¿Lo vas a comprar? Dímelo en los comentarios… y si lo compras, usa el código BAD. ¡Gracias!"),
    ]
    json.dump(dict(day=d.isoformat(), day_es=fecha(d), name=c["name"], regular=x["regularPrice"], price=x["finalPrice"], save=c["save"],
                   pct=pct, count=len(x["brItems"]), out=c["out"].isoformat(), out_es=fecha(c["out"]), img="img/bundle.png",
                   outfits=names, icons=icons, lines=lines, shop_date=en["date"][:10]),
              open(os.path.join(out_dir, "spot.json"), "w"), ensure_ascii=False, indent=1)
    plans.append((d.isoformat(), c["name"], c["save"], pct, c["out"].isoformat()))
for p in plans:
    print("PLAN", *p)
