"""BAD ROYALE short-video covers (1080x1920), house style (owner approved 2026-11-17, same look as the long thumbnails).

    python3 brand/badroyale/video/cover.py DIR out.jpg        (a short folder: video/auto/<date>-<slug>)
    python3 brand/badroyale/video/cover.py --shop DAY out.jpg  (the daily shop video)

Layout: big two-line headline (white line, then a huge yellow line), a yellow chip, large characters (or the map),
CODE BAD at the bottom. The headline sits inside the middle 3:4 area so profile grids that crop covers keep it.
Covers are built from the format's own data, so every word is already a checked fact:
  now    title "Just dropped" + the bundle name, its outfits      (scene.js: name, cards)
  guess  "Guess the" + "season!", the three skins with "?" on them (scene.js: title, rounds)
  where  "Where is" + the place, the map around it, NO answer marker (scene.js: title, shots/pins)
  shop   "Today's shop", the deal's outfits, its price             (shop/DAY/plan.json)
Any other short needs post.json "cover": {"lines": ["WHITE LINE"], "big": "YELLOW LINE", "chip": "...",
  "chars": ["img/x.png", ...] (0-3, paths relative to the folder) or "map": [x, y] (a map pixel to centre on)}.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
BR = os.path.dirname(HERE)
BRAND = os.path.dirname(BR)
FONTS = os.path.join(BRAND, "_shared", "fonts")
ENGINE_VIDEO = os.path.join(BRAND, "_shared", "video")
MAP = os.path.join(BR, "sources", "map-blank.png")
INK, Y, RED = "#0B0D1A", "#FFD12E", "#FF2D3D"
BG = {"now": ("#B64BFF", "linear-gradient(160deg,#3A0F7A,#140B46 60%,#0C1450)"),
      "guess": ("#FF7A1A", "linear-gradient(160deg,#7A1030,#2A0B5E 60%,#0C1450)"),
      "shop": ("#3BA7FF", "linear-gradient(160deg,#0A2A8F,#1B0F6B 55%,#4A0F7A)"),
      "other": ("#3BA7FF", "linear-gradient(160deg,#0A3A6B,#0A1C46 50%,#5A0E2A)")}


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def scene(d):
    s = open(os.path.join(d, "scene.js")).read()
    return json.loads(s[s.index("{"):s.rindex("}") + 1])


def art(p, d):
    if p.startswith("http"):
        return p
    for base in (d, ENGINE_VIDEO):
        q = os.path.normpath(os.path.join(base, p))
        if os.path.exists(q):
            return "file://" + q
    raise SystemExit(f"STOP: cover art missing: {p}")


def spec_for(d):
    sc, post = scene(d), json.load(open(os.path.join(d, "post.json")))
    if post.get("cover"):
        c = dict(post["cover"])
        c["chars"] = [art(p, d) for p in c.get("chars") or []]
        c.setdefault("kind", "map" if c.get("map") else "other")
        return c
    if sc.get("cards") and sc.get("name"):
        return {"kind": "now", "lines": [sc["title"][0]], "big": re.sub(r"\s+Bundle$", "", sc["name"], flags=re.I),
                "chip": sc["title"][1] if len(sc["title"]) > 1 else "IN THE ITEM SHOP", "chars": [art(c["img"], d) for c in sc["cards"][:3]]}
    if sc.get("rounds"):
        words = sc["title"][0].split()
        return {"kind": "guess", "lines": [" ".join(words[:-1])], "big": words[-1] + "!",
                "chip": sc["title"][1] if len(sc["title"]) > 1 else "", "chars": [art(r["img"], d) for r in sc["rounds"][:3]], "marks": True}
    m = re.match(r"where is (.+?)\??$", (sc.get("title") or [""])[0], re.I)
    if m and sc.get("shots"):
        return {"kind": "map", "lines": ["Where is"], "big": m.group(1) + "?", "chip": sc["title"][1] if len(sc["title"]) > 1 else "FORTNITE MAP",
                "map": [sc["shots"][0]["x"], sc["shots"][0]["y"]], "decoys": True}
    return None


def shop_spec(day):
    D = os.path.join(BR, "shop", day)
    p = json.load(open(os.path.join(D, "plan.json")))
    if "picks" in p:                       # reel plan (reel_pick.py, 2026-11-23): the lead card's art and price
        lead = p["picks"][0]
        local = os.path.join(D, "img", lead["key"] + ".png")
        return {"kind": "shop", "lines": ["Today's"], "big": "Shop", "chip": p["dateLabel"].upper(), "chars": ["file://" + local],
                "price": [lead["final"], lead["regular"] if lead["regular"] > lead["final"] else None]}
    deal = p["deal"]
    chars = []
    for o in deal.get("outfits", [])[:2]:
        local = os.path.join(D, "img", o["id"] + ".png")
        chars.append("file://" + local if os.path.exists(local) else o["img"])
    return {"kind": "shop", "lines": ["Today's"], "big": "Shop", "chip": p["dateLabel"], "chars": chars,
            "price": [deal["final"], deal.get("regular")]}


def html(s):
    kind = s.get("kind", "other")
    body = ""
    if kind == "map":
        fx, fy = s["map"]
        mw = 2600
        k = mw / 2048
        mx, my = 540 - fx * k, 1150 - fy * k
        mx, my = max(min(mx, 0), 1080 - mw), max(min(my, 0), 1920 - mw)
        body += (f'<div class=a style="left:{mx:.0f}px;top:{my:.0f}px;width:{mw}px;height:{mw}px;background:url(file://{MAP}) center/cover;'
                 'filter:saturate(1.35) contrast(1.1) brightness(.9)"></div>'
                 '<div class=a style="inset:0;background:linear-gradient(180deg,rgba(6,12,40,.92) 0,rgba(6,12,40,.6) 33%,rgba(6,12,40,0) 48%,'
                 'rgba(6,12,40,0) 75%,rgba(6,12,40,.85) 100%)"></div>')
        if s.get("decoys"):      # two "?" marks well away from the real spot: the cover never gives the answer
            rx, ry = mx + fx * k, my + fy * k
            spots = [(280, 1065), (790, 1295), (790, 940), (280, 1330), (540, 1330), (540, 960)]
            far = [p for p in spots if (p[0] - rx) ** 2 + (p[1] - ry) ** 2 > 240 ** 2][:2]
            for (x, y), r in zip(far, (-8, 6)):
                body += f'<div class="a q" style="left:{x - 65}px;top:{y - 65}px;transform:rotate({r}deg)">?</div>'
        bg = "#0A2A6B"
    else:
        glow, bg = BG.get(kind, BG["other"])
        body += (f'<div class=a style="inset:-600px;background:repeating-conic-gradient(from 0deg at 50% 62%,rgba(255,255,255,.16) 0 7deg,transparent 7deg 18deg)"></div>'
                 f'<div class=a style="inset:0;background:radial-gradient(circle at 50% 62%,{glow} 0,transparent 50%)"></div>')
    body += '<div class=a style="inset:0;background:radial-gradient(ellipse 80% 70% at 50% 50%,transparent 55%,rgba(0,0,0,.55))"></div>'
    chars = (s.get("chars") or [])[:3]
    pos = {1: [(90, 600, 1000, 5)], 2: [(-90, 700, 880, 4), (330, 710, 880, 5)],
           3: [(-230, 640, 900, 4), (400, 640, 900, 4), (60, 580, 1000, 5)]}.get(len(chars), [])
    order = [chars[1], chars[2], chars[0]] if len(chars) == 3 else chars     # the first one stands in front, in the middle
    for (l, t, h, z), src in zip(pos, order):
        body += f'<img class=char src="{src}" style="left:{l}px;top:{t}px;height:{h}px;z-index:{z}">'
    if s.get("marks") and chars:
        xs = {1: [475], 2: [200, 750], 3: [70, 475, 880]}[len(chars)]
        body += "".join(f'<div class="a q" style="left:{x}px;top:1240px">?</div>' for x in xs)
    lines = "<br>".join(esc(l) for l in s.get("lines") or [])
    wrap = "normal" if kind == "map" else "nowrap"          # (kept out of the f-string so Python 3.11 can run this too)
    body += (f'<div class="a t" style="top:250px"><div class="fit" data-max="130" data-h="240" style="font-size:130px">{lines}</div>'
             f'<div class="fit" data-max="230" data-h="420" style="color:{Y};font-size:230px;white-space:{wrap}">{esc(s["big"])}</div></div>')
    chip_top = 1390 if kind in ("now", "other") and chars else 1450 if kind == "map" else 1430 if kind == "guess" else None  # guess: under the ? marks, off the faces
    if s.get("chip"):
        body += (f'<div class=a id=chip style="left:0;right:0;top:{chip_top or 0}px;text-align:center;z-index:7">'
                 f'<span class=chip style="display:inline-block;transform:rotate(-3deg)">{esc(s["chip"])}</span></div>')
    if s.get("price"):
        new, old = s["price"]
        body += (f'<div class=a style="left:0;right:0;top:1250px;display:flex;justify-content:center;align-items:flex-end;gap:22px;transform:rotate(-4deg);z-index:8">'
                 f'<div class=price style="font-size:190px;color:{Y}">{new:,}</div>'
                 + (f'<div class=price style="position:relative;font-size:100px;color:#fff;margin-bottom:22px">{old:,}'
                    f'<div style="position:absolute;left:-10px;right:-10px;top:44%;height:14px;background:{RED};border:4px solid {INK};border-radius:8px;transform:rotate(-8deg)"></div></div>'
                    if old and old > new else "") + '</div>')
    body += (f'<div class=a style="left:0;right:0;bottom:250px;display:flex;justify-content:center;gap:12px;align-items:center;z-index:9">'
             f'<div class=chip style="font-size:44px">CODE</div><div style="font-family:Lucky;font-size:92px;color:{Y};-webkit-text-stroke:12px {INK};'
             f'paint-order:stroke fill;text-shadow:0 8px 0 {INK}">BAD</div></div>')
    # fit: shrink each headline block until it is no wider than the frame and no taller than its budget;
    # then put the chip under the headline when it has no fixed place
    js = """<script>document.fonts.ready.then(()=>{for(const e of document.querySelectorAll('.fit')){let f=+e.dataset.max;
while(f>40&&(e.scrollWidth>e.clientWidth+2||e.offsetHeight>+e.dataset.h)){f-=4;e.style.fontSize=f+'px'}}
const c=document.getElementById('chip');if(c&&c.style.top=='0px'){c.style.top=(document.querySelector('.t').getBoundingClientRect().bottom+40)+'px'}
document.body.dataset.ready=1})</script>"""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Lucky;src:url(file://{FONTS}/LuckiestGuy-Regular.ttf)}}
@font-face{{font-family:BarlowC;src:url(file://{FONTS}/BarlowCondensed-Black.ttf)}}
@font-face{{font-family:Anton;src:url(file://{FONTS}/Anton-Regular.ttf)}}
html,body{{margin:0;width:1080px;height:1920px;overflow:hidden;background:{bg}}}
.a{{position:absolute}}
.t{{left:35px;right:35px;font-family:Lucky;text-transform:uppercase;line-height:.9;color:#fff;-webkit-text-stroke:16px {INK};paint-order:stroke fill;
 text-shadow:0 12px 0 {INK},0 16px 28px rgba(0,0,0,.6);white-space:nowrap;text-align:center;z-index:6}}
.chip{{font-family:BarlowC;text-transform:uppercase;border:7px solid {INK};border-radius:16px;padding:6px 24px 0;box-shadow:0 8px 0 {INK};
 white-space:nowrap;background:{Y};color:{INK};font-size:64px;z-index:7}}
.char{{position:absolute;filter:drop-shadow(9px 0 0 {INK}) drop-shadow(-9px 0 0 {INK}) drop-shadow(0 -9px 0 {INK}) drop-shadow(0 20px 30px rgba(0,0,0,.6))}}
.q{{width:130px;height:130px;border-radius:50%;background:{RED};border:9px solid {INK};box-shadow:0 9px 0 {INK};font-family:Lucky;font-size:100px;
 line-height:142px;text-align:center;color:#fff;-webkit-text-stroke:7px {INK};paint-order:stroke fill;z-index:8}}
.price{{font-family:Anton;line-height:1;-webkit-text-stroke:14px {INK};paint-order:stroke fill;text-shadow:0 12px 0 {INK}}}
</style></head><body>{body}{js}</body></html>"""


def render(spec, out):
    if not spec.get("big"):
        raise SystemExit("STOP: cover needs a 'big' line.")
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(html(spec))
    js = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();"
          "const p=await b.newPage({viewport:{width:1080,height:1920}});"
          f"await p.goto('file://{f.name}');await p.waitForSelector('body[data-ready]',{{timeout:15000}});await p.waitForTimeout(400);"
          f"await p.screenshot({{path:'{os.path.abspath(out)}',type:'jpeg',quality:90}});await b.close();}})();")
    subprocess.run(["node", "-e", js], check=True)
    os.remove(f.name)
    return out


def render_dir(d, out):
    s = spec_for(d)
    if not s:
        raise SystemExit('STOP: no cover for this format: add a "cover" spec to post.json (see brand/badroyale/video/cover.py).')
    return render(s, out)


if __name__ == "__main__":
    if sys.argv[1] == "--shop":
        render(shop_spec(sys.argv[2]), sys.argv[3])
    else:
        render_dir(os.path.abspath(sys.argv[1]), sys.argv[2])
    print(sys.argv[-1])
