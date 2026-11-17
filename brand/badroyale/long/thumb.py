"""BAD ROYALE long-video thumbnail, house style (owner pick 2026-11-17: the "CAN YOU NAME ALL 17?" map design).

    from thumb import render;  render(spec, "out/thumb.jpg")
    python3 brand/badroyale/long/thumb.py spec.json out.jpg

Layout, 1280x720: dark panel on the left with the headline (two short white lines, then one huge yellow line), a
chip under it, CODE BAD bottom right. The right side is the official map (brand/badroyale/sources/map-blank.png).
Optional: red "?" pins on map spots, and up to two characters standing on the map side.

spec = {"lines": ["CAN YOU", "NAME ALL"], "big": "17?", "chip": "MAP QUIZ",
        "pins": [[x, y], ...],              # map pixels on the 2048 map (optional, up to 3 look best)
        "chars": ["/abs/path/char.png"],    # transparent full-body renders (optional, 0-2)
        "focus": [x, y]}                    # map pixel to centre the map crop on (optional)
Every word and number must come from the video's own sources.
"""
import json
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
BR = os.path.dirname(HERE)
FONTS = os.path.join(os.path.dirname(BR), "_shared", "fonts")
MAP = os.path.join(BR, "sources", "map-blank.png")
INK, Y, RED = "#0B0D1A", "#FFD12E", "#FF2D3D"
MW = 1200                      # map drawn 1200 px wide
SCALE = MW / 2048


def html(spec):
    fx, fy = spec.get("focus") or [1024, 1024]
    mx, my = 930 - fx * SCALE, 360 - fy * SCALE          # put the focus point at (930, 360)
    mx, my = max(min(mx, 330), 1280 - MW), max(min(my, 0), 720 - MW)
    chars = spec.get("chars") or []
    body = (f'<div class="a" style="left:{mx}px;top:{my}px;width:{MW}px;height:{MW}px;background:url(file://{MAP}) center/cover;'
            f'filter:saturate(1.35) contrast(1.1){";brightness(.8)" if chars else ""}"></div>')
    body += '<div class="a" style="inset:0;background:linear-gradient(90deg,rgba(6,12,40,.95) 0,rgba(6,12,40,.75) 34%,rgba(6,12,40,0) 60%)"></div>'
    body += '<div class="a" style="inset:0;background:radial-gradient(ellipse 75% 75% at 50% 50%,transparent 55%,rgba(0,0,0,.55))"></div>'
    for i, (x, y) in enumerate((spec.get("pins") or [])[:3]):
        px, py = mx + x * SCALE - 55, my + y * SCALE - 55
        body += (f'<div class="a pin" style="left:{px:.0f}px;top:{py:.0f}px;transform:rotate({(-8, 6, -4)[i]}deg)">?</div>')
    pos = {1: [(700, 50, 760)], 2: [(500, 70, 720), (790, 50, 740)]}.get(len(chars[:2]), [])
    for (left, top, h), src in zip(pos, chars[:2]):
        body += f'<img class="char" src="file://{src}" style="left:{left}px;top:{top}px;height:{h}px">'
    lines = "<br>".join(spec["lines"])
    big = spec["big"]
    bsize = 190 if len(big) <= 4 else 150 if len(big) <= 6 else 118
    body += (f'<div class="a t" style="left:36px;top:40px;font-size:118px;z-index:6">{lines}<br>'
             f'<span style="color:{Y};font-size:{bsize}px">{big}</span></div>')
    body += f'<div class="a chip" style="left:44px;top:560px;background:{Y};color:{INK};font-size:48px;z-index:7">{spec["chip"]}</div>'
    body += (f'<div class="a" style="right:26px;bottom:22px;display:flex;gap:8px;align-items:center;z-index:9">'
             f'<div class="chip" style="background:{Y};color:{INK};font-size:30px;transform:rotate(0)">CODE</div>'
             f'<div style="font-family:Lucky;font-size:54px;color:{Y};-webkit-text-stroke:9px {INK};paint-order:stroke fill;text-shadow:0 6px 0 {INK}">BAD</div></div>')
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Lucky;src:url(file://{FONTS}/LuckiestGuy-Regular.ttf)}}
@font-face{{font-family:BarlowC;src:url(file://{FONTS}/BarlowCondensed-Black.ttf)}}
html,body{{margin:0;width:1280px;height:720px;overflow:hidden;background:#0A2A6B}}
.a{{position:absolute}}
.t{{font-family:Lucky;text-transform:uppercase;line-height:.9;color:#fff;-webkit-text-stroke:14px {INK};paint-order:stroke fill;
    text-shadow:0 10px 0 {INK},0 14px 24px rgba(0,0,0,.6);letter-spacing:1px;white-space:nowrap}}
.chip{{font-family:BarlowC;font-weight:900;text-transform:uppercase;border:6px solid {INK};border-radius:14px;padding:4px 18px 0;
      box-shadow:0 7px 0 {INK};transform:rotate(-4deg);white-space:nowrap}}
.pin{{width:110px;height:110px;border-radius:50%;background:{RED};border:8px solid {INK};box-shadow:0 8px 0 {INK};font-family:Lucky;
     font-size:84px;line-height:118px;text-align:center;color:#fff;-webkit-text-stroke:6px {INK};paint-order:stroke fill;z-index:4}}
.char{{position:absolute;z-index:5;filter:drop-shadow(8px 0 0 {INK}) drop-shadow(-8px 0 0 {INK}) drop-shadow(0 -8px 0 {INK}) drop-shadow(0 18px 30px rgba(0,0,0,.65))}}
</style></head><body>{body}</body></html>"""


def check(spec):
    for k in ("lines", "big", "chip"):
        if not spec.get(k):
            raise SystemExit(f"STOP: thumbnail spec needs '{k}'.")
    if len(spec["lines"]) > 2 or any(len(l) > 9 for l in spec["lines"]) or len(spec["big"]) > 9 or len(spec["chip"]) > 18:
        raise SystemExit("STOP: thumbnail text too long: up to 2 lines of 9 characters, a big line of 9, a chip of 18.")
    for c in spec.get("chars") or []:
        if not os.path.exists(c):
            raise SystemExit(f"STOP: thumbnail character art missing: {c}")


def render(spec, out):
    check(spec)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(html(spec))
    js = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();"
          "const p=await b.newPage({viewport:{width:1280,height:720}});"
          f"await p.goto('file://{f.name}');await p.waitForTimeout(500);"
          f"await p.screenshot({{path:'{os.path.abspath(out)}',type:'jpeg',quality:92}});await b.close();}})();")
    subprocess.run(["node", "-e", js], check=True)
    os.remove(f.name)
    return out


if __name__ == "__main__":
    render(json.load(open(sys.argv[1])), sys.argv[2])
    print(sys.argv[2])
