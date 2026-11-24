"""Long YouTube video, "TOP 10 lotes con más ahorro": pick the bundles and write the script from the day's shop data.

    python3 -I long_prep.py <api_dir> <out_dir> <publish_date YYYY-MM-DD>

Only facts from the shop data: names (official Latin American Spanish), item counts, regular and bundle prices, savings,
and the date each bundle leaves. Bundles leaving before the day after publishing are left out (the video must stay true
for at least a day), so are bundles that save less than 500 monedas V. Top 10 by saving.
Writes <out_dir>/long.json and downloads the bundle and item images to <out_dir>/img/.
"""
import datetime, json, os, sys, time, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voice import words, words_f, say  # noqa: E402

API, OUT, PUB = sys.argv[1], sys.argv[2], datetime.date.fromisoformat(sys.argv[3])
os.makedirs(os.path.join(OUT, "img"), exist_ok=True)
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
fecha = lambda d: f"{d.day} de {MESES[d.month - 1]}"
day = lambda s: datetime.datetime.fromisoformat(s.replace("Z", "+00:00")).date()

en = json.load(open(os.path.join(API, "shop_en.json")))["data"]
es = {x["offerId"]: x for x in json.load(open(os.path.join(API, "shop_es.json")))["data"]["entries"]}
shop_date = day(en["date"])


def fetch(url, name):
    path = os.path.join(OUT, "img", name)
    if not os.path.exists(path):
        for attempt in range(4):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "badtiendadehoy"})
                with urllib.request.urlopen(req, timeout=40) as r:
                    open(path, "wb").write(r.read())
                break
            except OSError:
                if attempt == 3: raise
                time.sleep(2 ** attempt)
    return "img/" + name


TYPE_ES = {"outfit": "skin", "backpack": "mochila", "pickaxe": "pico", "glider": "planeador", "emote": "gesto",
           "wrap": "envoltorio", "contrail": "estela", "loadingscreen": "pantalla de carga", "shoe": "calzado", "sidekick": "compañero"}

seen, picks = set(), []
for x in sorted((x for x in en["entries"] if x.get("bundle") and x.get("brItems") and x["finalPrice"] > 0),
                key=lambda x: -(x["regularPrice"] - x["finalPrice"])):
    s = es.get(x["offerId"])
    if not s: continue
    name = s["bundle"]["name"]
    for pre in ("Lote de ", "Lote "):
        if name.startswith(pre): name = name[len(pre):]
    save = x["regularPrice"] - x["finalPrice"]
    out = day(x["outDate"])
    if name in seen or save < 500 or out <= PUB:
        continue
    seen.add(name)
    items_es = {i["id"]: i for i in s["brItems"]}
    outfits = [i for i in x["brItems"] if i["type"]["value"] == "outfit"]
    show = (outfits + [i for i in x["brItems"] if i["type"]["value"] != "outfit"])[:8]
    icons = []
    for k, it in enumerate(show):
        im = it.get("images", {})
        url = im.get("icon") or im.get("smallIcon")
        if url:
            icons.append(dict(img=fetch(url, f"b{len(picks):02d}_{k}.png"), name=items_es.get(it["id"], it)["name"],
                              rarity=it["rarity"]["value"]))
    picks.append(dict(name=name, regular=x["regularPrice"], price=x["finalPrice"], save=save,
                      pct=round(100 * save / x["regularPrice"]), count=len(x["brItems"]), out=out.isoformat(),
                      out_es=fecha(out), new=day(x["inDate"]) == shop_date,
                      img=fetch(x["bundle"]["image"], f"b{len(picks):02d}.png"),
                      outfits=[items_es.get(i["id"], i)["name"] for i in outfits][:3],
                      types=sorted({TYPE_ES.get(i["type"]["value"], "") for i in x["brItems"]} - {""}), icons=icons))
    if len(picks) == 10:
        break

top3 = sorted(picks, key=lambda b: -b["pct"])[:3]
lines = [dict(scene="intro", text=f"¡Qué onda, banda! Hoy te enseño los {words(len(picks))} lotes con más ahorro de la tienda de Fortnite: "
                                  "qué traen, cuánto te ahorras… y hasta cuándo están. Al final, el top tres por porcentaje. ¡Vamos!")]
for k, b in enumerate(picks, 1):
    n = say(b["name"])
    who = (", ".join(say(o) for o in b["outfits"][:2]) if b["outfits"] else "")
    t = [f"Número {words(k)}: el lote de {n}."]
    t.append(f"Trae {words(b['count'])} objetos" + (f", con {who}" if who else "") + ("… y más." if b["count"] > 2 else "."))
    t.append(f"Por separado costaría {words_f(b['regular'])} monedas V… y el lote está en {words_f(b['price'])}.")
    t.append(f"¡Te ahorras {words_f(b['save'])}! O sea, el {words(b['pct'])} por ciento.")
    if b["new"]:
        t.append("Y ojo: llegó hoy a la tienda.")
    t.append(f"Está disponible hasta el {words(int(b['out_es'].split()[0]))} de {b['out_es'].split(' de ')[1]}.")
    lines.append(dict(scene=f"b{k-1}", text=" ".join(t)))
lines.append(dict(scene="top", text=f"¿Y cuáles tienen el mayor porcentaje de ahorro? En tercer lugar, {say(top3[2]['name'])}. En segundo, {say(top3[1]['name'])}. "
                                    f"¡Y en primer lugar, {say(top3[0]['name'])}, con el {words(top3[0]['pct'])} por ciento!"))
lines.append(dict(scene="outro", text="¿Tú cuál vas a comprar? Déjamelo en los comentarios. Si te sirvió, suscríbete para la próxima guía… "
                                      "y si compras algo, usa el código BAD en la tienda. ¡Nos vemos!"))
json.dump(dict(shop_date=shop_date.isoformat(), publish=PUB.isoformat(), publish_es=fecha(PUB), bundles=picks,
               top3=[b["name"] for b in top3], lines=lines), open(os.path.join(OUT, "long.json"), "w"), ensure_ascii=False, indent=1)
for b in picks:
    print(f"{b['name']:32} {b['regular']:>6} -> {b['price']:>5} save {b['save']:>5} ({b['pct']}%) until {b['out']}  {b['outfits']}")
print("top3:", [b["name"] for b in top3])
