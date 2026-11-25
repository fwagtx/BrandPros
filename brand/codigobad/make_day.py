"""CÓDIGO BAD · daily data builder.
    python3 make_day.py YYYY-MM-DD
Fetches the Item Shop in pt-BR from fortnite-api.com, saves shop/<day>/src/shop-ptbr.json, downloads the art it needs,
writes shop/<day>/plan-ptbr.json and the three shorts' data files (video/dia-<day>/s1..s3.js) plus the long video's
items.js and vo.json (video/long-<day>-og25/). Run from brand/codigobad/.
"""
import json, re, os, sys, urllib.request
day = sys.argv[1]
S = f"shop/{day}"; os.makedirs(S + "/src", exist_ok=True); os.makedirs(S + "/img", exist_ok=True)
for name, url in (("shop-ptbr", "https://fortnite-api.com/v2/shop?language=pt-BR"), ("news-ptbr", "https://fortnite-api.com/v2/news?language=pt-BR")):
    urllib.request.urlretrieve(url, f"{S}/src/{name}.json")
s = json.load(open(f"{S}/src/shop-ptbr.json"))["data"]
assert s["date"][:10] == day, f"live shop is {s['date'][:10]}, not {day}: wait for the reset"
def intro(it):
    t = (it.get("introduction") or {}).get("text", "") or ""; m = re.search(r"(\d+).*?(\d+)", t); return (int(m.group(1)), int(m.group(2))) if m else None
def img(it): im = it.get("images") or {}; return im.get("featured") or im.get("icon")
bid = lambda name: "bundle_" + re.sub(r"\W", "_", name)
rows = []
for e in s["entries"]:
    items = e.get("brItems") or []; b = e.get("bundle")
    if not items and not b: continue
    m = items[0] if items else None
    rows.append(dict(id=(bid(b["name"]) if b and b.get("image") else (m["id"] if m else e.get("offerId"))), name=(b["name"] if b else m["name"]), bundle=bool(b) or len(items) >= 3, n=len(items),
        type=(m["type"]["value"] if m else "bundle"), typeLabel=(("Traje" if m["type"]["value"] == "outfit" else m["type"]["displayValue"]) if m else "Pacote"), rarity=("bundle" if (b or len(items) >= 3) else m["rarity"]["value"]), rarityLabel=(m["rarity"]["displayValue"] if m else ""),
        final=e["finalPrice"], regular=e["regularPrice"], inDate=e.get("inDate", "")[:10], outDate=e.get("outDate", "")[:10], intro=intro(m) if m else None,
        img=(b["image"] if b and b.get("image") else (img(m) if m else None)), setName=((m.get("set") or {}).get("value") if m else None)))
new = [r for r in rows if r["inDate"] == day]; leaving = [r for r in rows if r["outDate"] == day]
bundles = sorted([r for r in rows if r["bundle"]], key=lambda r: -(r["regular"] - r["final"]))
outfits = [r for r in rows if r["type"] == "outfit" and not r["bundle"]]
oldest = sorted([r for r in outfits if r["intro"]], key=lambda r: r["intro"])
json.dump(dict(date=day, new=new, leaving=leaving, bundles=bundles, oldest=oldest[:30], rows=rows), open(f"{S}/plan-ptbr.json", "w"), ensure_ascii=False, indent=1)
num = lambda n: f"{n:,}".replace(",", ".")
def fetch(r):
    p = f"{S}/img/{r['id']}.png"
    if r["img"] and not os.path.exists(p): urllib.request.urlretrieve(r["img"], p)
def item(n, r, facts, frm): fetch(r); return dict(n=n, name=r["name"], id=r["id"], r=r["rarity"], price=r["final"], frm=frm, facts=facts, label=f"#{n} · {num(r['final'])} v-bucks")
def dpt(d): m = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]; return f"{int(d[8:10])} de {m[int(d[5:7]) - 1]}"
D = f"video/dia-{day}"; os.makedirs(D, exist_ok=True)
def write(key, hook, sub, teaser, worth, picks, recapQ):
    items = [item(5 - i, r, f, max(100, int(r["final"] * 0.22))) for i, (r, f) in enumerate(picks)]
    open(f"{D}/{key}.js", "w").write("window.GRABS=" + json.dumps(dict(hook=hook, sub=sub, wait="espera o #1 👀", teaser=teaser, worth=worth, items=items, recapQ=recapQ, imgBase=f"../shop/{day}/img/"), ensure_ascii=False) + ";\n")
# S1 rotates by weekday: Mon/Fri bundles with the biggest saving, Wed/Sun OG check, Tue/Thu/Sat priciest outfits
import datetime
wd = datetime.date.fromisoformat(day).weekday()
import glob
used = set()
for f in glob.glob("video/dia-*/s1-pacotoes.js") + glob.glob("video/dia-*/s2-chegou-hoje.js"):
    d0 = f.split("dia-")[1][:10]
    if d0 < day and (datetime.date.fromisoformat(day) - datetime.date.fromisoformat(d0)).days <= 7:
        try: used |= {i["name"] for i in json.loads(open(f).read().split("=", 1)[1].rstrip(";\n"))["items"]}
        except Exception: pass
top_new = {r["name"] for r in sorted(new, key=lambda r: -r["final"])[:5]}
back = sorted([r for r in new if r["type"] == "outfit" and r["intro"] and not r["bundle"] and r["outDate"] != day and r["name"] not in top_new], key=lambda r: r["intro"])
strict = [r for r in back if not any((r.get("setName") or "\x00").lower() in t.lower() for t in top_new)]
back = strict if len(strict) >= 5 else back
c5 = list(reversed(sorted(outfits, key=lambda r: (-r["final"], r["name"]))[:5]))
stale = sum(1 for r in (oldest[:5] if wd in (2, 6) else c5) if r["name"] in used or r["outDate"] == day)
if wd in (1, 2, 3, 5, 6) and stale >= 3 and len(back) >= 5:
    k5 = list(reversed(back[:5]))
    write("s1-pacotoes", ["voltou pra loja hoje 🔁", "os 5 trajes mais OG que chegaram"], f"pelo capítulo e temporada de lançamento · {dpt(day)}", "o mais OG que voltou hoje 👀", "vale",
          [(r, [f"traje · capítulo {r['intro'][0]}, temporada {r['intro'][1]}", f"{r['rarityLabel'].lower()}" + (f" · {r['setName'].lower()}" if r.get("setName") else ""), "voltou hoje 🔁"]) for r in k5], "qual você estava esperando? 👇")
elif wd in (2, 6):
    o5 = list(reversed(oldest[:5]))
    write("s1-pacotoes", ["OG check 👴", "os 5 trajes mais antigos de hoje"], f"pelo capítulo e temporada de lançamento · {dpt(day)}", "o mais OG da loja de hoje 👀", "vale",
          [(r, [f"traje · capítulo {r['intro'][0]}, temporada {r['intro'][1]}", f"{r['rarityLabel'].lower()}" + (f" · {r['setName'].lower()}" if r.get("setName") else ""), "você tem esse? 👀"]) for r in o5], "qual desses você tem no armário? 👇")
elif wd in (1, 3, 5):
    write("s1-pacotoes", ["loja do Fortnite de hoje 🛒", "os 5 trajes mais caros"], f"os trajes mais caros da loja de itens, {dpt(day)}", "o traje mais caro de hoje 👀", "vale",
          [(r, [f"traje · {r['rarityLabel'].lower()}"] + ([f"capítulo {r['intro'][0]}, temporada {r['intro'][1]}"] if r["intro"] else []) + ([f"sai da loja em {dpt(r['outDate'])} ⏰"] if r["outDate"] else []) + ["vale pegar? ☠"]) for r in c5], "qual você pega? 👇")
pool = [r for r in bundles if r["outDate"] != day and r["inDate"] != day and r["name"] not in used] or [r for r in bundles if r["outDate"] != day and r["inDate"] != day] or bundles
pool = [r for r in pool if r["n"] > 0 and r["regular"] - r["final"] >= 1000]
b5 = list(reversed(pool[:5]))
back = sorted([r for r in new if r["type"] == "outfit" and r["intro"] and not r["bundle"]], key=lambda r: r["intro"])
if wd in (0, 4) and len(pool) < 5 and len(back) >= 5:
    # not enough fresh bundle deals: the returning OG outfits among today's arrivals
    v5 = list(reversed(back[:5]))
    write("s1-pacotoes", ["voltou pra loja hoje 🔁", "os 5 trajes mais OG que chegaram"], f"entre os {len(new)} itens novos de hoje · {dpt(day)}", "o mais OG que voltou hoje 👀", "vale",
          [(r, [f"traje · capítulo {r['intro'][0]}, temporada {r['intro'][1]}", "voltou pra loja hoje 🔁"] + ([f"sai em {dpt(r['outDate'])} ⏰"] if r["outDate"] else []) + ["você estava esperando? 👀"]) for r in v5], "qual você estava esperando? 👇")
elif wd in (0, 4) and len(pool) < 5:
    c5 = list(reversed(sorted(outfits, key=lambda r: (-r["final"], r["name"]))[:5]))
    write("s1-pacotoes", ["loja do Fortnite de hoje 🛒", "os 5 trajes mais caros"], f"os trajes mais caros da loja de itens, {dpt(day)}", "o traje mais caro de hoje 👀", "vale",
          [(r, [f"traje · {r['rarityLabel'].lower()}"] + ([f"capítulo {r['intro'][0]}, temporada {r['intro'][1]}"] if r["intro"] else []) + ["vale pegar? ☠"]) for r in c5], "qual você pega? 👇")
elif wd in (0, 4): write("s1-pacotoes", ["loja do Fortnite de hoje 🛒", "5 pacotões com a maior economia"], f"quanto você economiza em cada pacotão, {dpt(day)}", "a maior economia de hoje 👀", "por",
      [(r, [f"pacote · {r['n']} itens", f"em vez de {num(r['regular'])} v-bucks", f"economia de {num(r['regular'] - r['final'])} 💚"] + ([f"sai da loja em {dpt(r['outDate'])} ⏰"] if r["outDate"] else [])) for r in b5], "qual pacotão você pega? 👇")
# S2: priciest new items
n5 = list(reversed(sorted(new, key=lambda r: -r["final"])[:5]))
write("s2-chegou-hoje", ["chegou hoje na loja 🆕", "os 5 itens novos mais caros"], f"{len(new)} itens novos na loja de itens, {dpt(day)}", "o mais caro que chegou hoje 👀", "vale",
      [(r, ([f"pacote · {r['n']} itens · novo hoje 🆕" if r["n"] else "pacote · novo hoje 🆕"] if r["bundle"] else [f"{r['typeLabel'].lower()} · novo hoje 🆕"]) + ([f"em vez de {num(r['regular'])} v-bucks"] if r["regular"] > r["final"] else []) + ([f"capítulo {r['intro'][0]}, temporada {r['intro'][1]}"] if (r["intro"] and not r["bundle"]) else []) + ["você pegaria? 👀"]) for r in n5], "qual você pega primeiro? 👇")
# S3: priciest leaving tonight
l5 = list(reversed(sorted(leaving, key=lambda r: -r["final"])[:5]))
write("s3-sai-hoje", ["sai da loja hoje à noite ⏰", "os 5 mais caros que vão embora"], f"{len(leaving)} itens saem às 21h, horário de Brasília · {dpt(day)}", "o mais caro que sai hoje 👀", "vale",
      [(r, [((f"pacote · {r['n']} itens" if r["n"] else "pacote") if r["bundle"] else r["typeLabel"].lower() + (f" · capítulo {r['intro'][0]}, temporada {r['intro'][1]}" if r["intro"] else "")), "sai da loja hoje às 21h", "última chance ⏰"]) for r in l5], "vai pegar algum antes de sair? 👇")
# long: 25 oldest outfits
L = oldest[:25]; [fetch(r) for r in L]
U = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove", "vinte", "vinte e um", "vinte e dois", "vinte e três", "vinte e quatro", "vinte e cinco", "vinte e seis", "vinte e sete", "vinte e oito", "vinte e nove", "trinta"]
PR = {800: "oitocentos", 1200: "mil e duzentos", 1500: "mil e quinhentos", 1000: "mil", 500: "quinhentos", 400: "quatrocentos", 1800: "mil e oitocentos", 2000: "dois mil"}
months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
dlong = f"{int(day[8:10])} de {months[int(day[5:7]) - 1]}"
lines = [{"text": f"Esses são os 25 trajes mais antigos da loja do Fortnite de hoje, {dlong}.", "say": f"Esses são os vinte e cinco trajes mais antigos da loja do Fortnite de hoje, {U[int(day[8:10])]} de {months[int(day[5:7]) - 1]}.", "pause": 0.3}, {"text": "Do mais novo pro mais OG. Vamos lá!", "pause": 0.5}]
items = []
for k, r in enumerate(reversed(L)):
    n = 25 - k; c, t = r["intro"]
    lines.append({"text": f"Número {n}: {r['name']}.", "say": f"Número {U[n]}: {r['name']}.", "pause": 0.25})
    lines.append({"text": f"Lançado no Capítulo {c}, Temporada {t}. {num(r['final'])} V-Bucks.", "say": f"Lançado no Capítulo {U[c]}, Temporada {U[t]}. {PR.get(r['final'], str(r['final']))} vi-baks.", "pause": 0.6})
    items.append(dict(n=n, name=r["name"], id=r["id"], r=r["rarity"], rarityLabel=r["rarityLabel"], price=r["final"], chapter=c, season=t, setName=r.get("setName")))
lines += [{"text": "Qual desses você tem no armário?", "pause": 0.3}, {"text": "Usa o código BAD na Loja de Itens. Isso ajuda muito o canal.", "say": "Usa o código béd na Loja de Itens. Isso ajuda muito o canal.", "pause": 0.3}, {"text": "Valeu por assistir! Segue pra mais conteúdo todo dia.", "pause": 0.4}]
LD = f"video/long-{day}-og25"; os.makedirs(LD, exist_ok=True)
json.dump({"voice": "pf_dora", "speed": 1.15, "lang": "pt-br", "lead": 0.3, "mode": "flow", "mic": False, "phrases": lines}, open(f"{LD}/vo.json", "w"), ensure_ascii=False, indent=1)
open(f"{LD}/items.js", "w").write("window.LONG=" + json.dumps(dict(items=items, imgBase=f"../shop/{day}/img/", date=dlong), ensure_ascii=False) + ";\n")
print("ok", day, "new", len(new), "leaving", len(leaving), "bundles", len(bundles), "oldest", [(r["name"], r["intro"]) for r in L[:3]])
