"""BAD ROYALE long-video thumbnails (1280x720), rendered from HTML with Playwright.

    python3 brand/badroyale/long/thumbs/thumbs.py [name ...]     (renders thumbs/out/<name>.jpg)

Rules (from what makes a gaming thumbnail get clicked):
  - one or two characters, huge, faces large and on the left or right third, cut at the waist or chest
  - three to four words max, giant, heavy outline, readable on a phone at 160 px wide
  - one hook badge (a price slash, a number, NEW) - no caption text, no subtitles, no logos fighting for space
  - loud saturated background with a burst behind the characters, dark vignette for contrast
  - every word and number on it is a fact from the video's own sources
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
FONTS = "../../../_shared/fonts"
INK = "#0B0D1A"
Y = "#FFD12E"
RED = "#FF2D3D"


def page(body, bg):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Anton;src:url({FONTS}/Anton-Regular.ttf)}}
@font-face{{font-family:Lucky;src:url({FONTS}/LuckiestGuy-Regular.ttf)}}
@font-face{{font-family:BarlowC;src:url({FONTS}/BarlowCondensed-Black.ttf)}}
html,body{{margin:0;width:1280px;height:720px;overflow:hidden;background:#000}}
.s{{position:absolute;inset:0;overflow:hidden;{bg}}}
.a{{position:absolute}}
.t{{font-family:Lucky;text-transform:uppercase;line-height:.9;color:#fff;-webkit-text-stroke:14px {INK};paint-order:stroke fill;
    text-shadow:0 10px 0 {INK},0 14px 24px rgba(0,0,0,.6);letter-spacing:1px}}
.chip{{font-family:BarlowC;font-weight:900;text-transform:uppercase;border:6px solid {INK};border-radius:14px;padding:4px 18px 0;
      box-shadow:0 7px 0 {INK};transform:rotate(-4deg)}}
.char{{position:absolute;filter:drop-shadow(0 0 0 #fff) drop-shadow(8px 0 0 {INK}) drop-shadow(-8px 0 0 {INK}) drop-shadow(0 -8px 0 {INK}) drop-shadow(0 18px 30px rgba(0,0,0,.65))}}
</style></head><body><div class="s">{body}</div></body></html>"""


def rays(color, cx="30%", cy="55%", alpha=.18):
    return (f'<div class="a" style="inset:-400px;background:repeating-conic-gradient(from 0deg at {cx} {cy},rgba(255,255,255,{alpha}) 0 7deg,transparent 7deg 18deg)"></div>'
            f'<div class="a" style="inset:0;background:radial-gradient(circle at {cx} {cy},{color} 0,transparent 45%)"></div>')


def vignette():
    return '<div class="a" style="inset:0;background:radial-gradient(ellipse 75% 75% at 50% 50%,transparent 55%,rgba(0,0,0,.55))"></div>'


def char(name, left, top, h, flip=False, z=2):
    return (f'<img class="char" src="art/{name}_featured.png" style="left:{left}px;top:{top}px;height:{h}px;z-index:{z};'
            f'{"transform:scaleX(-1);" if flip else ""}">')


def code_tag(right=26, bottom=22):
    return (f'<div class="a" style="right:{right}px;bottom:{bottom}px;display:flex;gap:8px;align-items:center;z-index:9">'
            f'<div class="chip" style="background:{Y};color:{INK};font-size:30px;transform:rotate(0)">CODE</div>'
            f'<div style="font-family:Lucky;font-size:54px;color:{Y};-webkit-text-stroke:9px {INK};paint-order:stroke fill;text-shadow:0 6px 0 {INK}">BAD</div></div>')


def slash(new, old, left, top, scale=1.0):
    return (f'<div class="a" style="left:{left}px;top:{top}px;transform:rotate(-5deg) scale({scale});transform-origin:left top;z-index:6;'
            f'display:flex;align-items:flex-end;gap:16px">'
            f'<div style="font-family:Anton;font-size:122px;line-height:1;color:{Y};-webkit-text-stroke:12px {INK};paint-order:stroke fill;text-shadow:0 9px 0 {INK}">{new}</div>'
            f'<div style="position:relative;font-family:Anton;font-size:70px;line-height:1;color:#fff;-webkit-text-stroke:9px {INK};paint-order:stroke fill;margin-bottom:12px">{old}'
            f'<div style="position:absolute;left:-8px;right:-8px;top:44%;height:10px;background:{RED};border:3px solid {INK};border-radius:6px;transform:rotate(-8deg)"></div></div>'
            f'<div style="font-family:BarlowC;font-size:46px;color:#fff;-webkit-text-stroke:7px {INK};paint-order:stroke fill;margin-bottom:22px;white-space:nowrap">V-BUCKS</div></div>')


T = {}

# This Week's Item Shop (Nov 10 - Nov 16): biggest new bundle Mega Man, 3,800 listed 7,300; 24 new bundles
T["week-shop-a"] = page(
    rays("#3BA7FF", "28%", "60%") + vignette()
    + char("tackleshow", -150, 120, 900, z=1) + char("dunebriefshift", 60, 40, 1020, z=3)
    + f'<div class="a t" style="right:40px;top:40px;text-align:right;font-size:132px;z-index:5">MEGA<br><span style="color:{Y}">MAN!</span></div>'
    + slash("3,800", "7,300", 700, 335, .88)
    + f'<div class="a chip" style="right:44px;top:560px;background:{RED};color:#fff;font-size:44px;z-index:7">THIS WEEK\'S SHOP</div>'
    + code_tag(),
    "background:linear-gradient(135deg,#0A2A8F,#1B0F6B 55%,#4A0F7A)")

T["week-shop-b"] = page(
    rays("#FF7A1A", "50%", "100%", .14) + vignette()
    + char("dunebriefshift", -40, 150, 760, z=2) + char("rebeltempo", 300, 170, 740, z=3)
    + char("tidecompost", 560, 160, 750, z=2) + char("jadetowelgloss", 820, 170, 740, z=3)
    + f'<div class="a t" style="left:0;right:0;top:18px;text-align:center;font-size:118px;z-index:6">24 NEW <span style="color:{Y}">BUNDLES</span></div>'
    + f'<div class="a chip" style="left:50%;top:150px;margin-left:-190px;background:{Y};color:{INK};font-size:46px;z-index:7">IN ONE WEEK</div>'
    + code_tag(),
    "background:linear-gradient(160deg,#7A1030,#2A0B5E 60%,#0C1450)")

# Fortnite This Week (Nov 8 - Nov 14): two new captains, Buggy and Lil Uzi Vert; v43.10
T["week-news"] = page(
    rays("#FF3D3D", "50%", "40%", .16) + vignette()
    + char("flipperbalm", -40, -10, 900, z=3) + char("rookgeckorod", 470, -10, 900, flip=True, z=3)
    + '<div class="a" style="left:0;right:0;bottom:0;height:300px;background:linear-gradient(transparent,rgba(5,8,25,.85) 55%);z-index:4"></div>'
    + f'<div class="a t" style="left:0;right:0;top:455px;text-align:center;font-size:150px;z-index:6">2 NEW <span style="color:{Y}">CAPTAINS</span></div>'
    + f'<div class="a chip" style="left:50%;top:34px;margin-left:-150px;background:{RED};color:#fff;font-size:50px;z-index:7">UPDATE 43.10</div>'
    + code_tag(),
    "background:linear-gradient(150deg,#0B3A6B,#0A1C46 50%,#5A0E2A)")

# Map quiz (Nov 11): can you name all 17 places on the new map
pins = "".join(
    f'<div class="a" style="left:{x}px;top:{y}px;width:110px;height:110px;border-radius:50%;background:{RED};border:8px solid {INK};'
    f'box-shadow:0 8px 0 {INK};font-family:Lucky;font-size:84px;line-height:118px;text-align:center;color:#fff;-webkit-text-stroke:6px {INK};paint-order:stroke fill;z-index:4;transform:rotate({r}deg)">?</div>'
    for x, y, r in ((560, 300, -8), (760, 470, 6), (930, 250, -4)))
T["map-quiz"] = page(
    '<div class="a" style="left:330px;top:-260px;width:1200px;height:1200px;background:url(../../sources/map-blank.png) center/cover;filter:saturate(1.35) contrast(1.1)"></div>'
    + '<div class="a" style="inset:0;background:linear-gradient(90deg,rgba(6,12,40,.95) 0,rgba(6,12,40,.75) 34%,rgba(6,12,40,0) 60%)"></div>' + vignette()
    + pins
    + f'<div class="a t" style="left:36px;top:40px;font-size:118px;z-index:6">CAN YOU<br>NAME ALL<br><span style="color:{Y};font-size:190px">17?</span></div>'
    + f'<div class="a chip" style="left:44px;top:560px;background:{Y};color:{INK};font-size:48px;z-index:7">MAP QUIZ</div>'
    + code_tag(),
    "background:#0A2A6B")


def render(names):
    os.makedirs(OUT, exist_ok=True)
    js = []
    for n in names:
        p = os.path.join(HERE, f"_{n}.html")
        open(p, "w").write(T[n])
        js.append(f"await pg.goto('file://{p}'); await pg.waitForTimeout(400); await pg.screenshot({{path:'{OUT}/{n}.jpg',type:'jpeg',quality:92}});")
    script = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();"
              "const pg=await b.newPage({viewport:{width:1280,height:720}});" + "".join(js) + "await b.close();})();")
    subprocess.run(["node", "-e", script], check=True)
    for n in names:
        os.remove(os.path.join(HERE, f"_{n}.html"))
        print(os.path.join(OUT, n + ".jpg"))


if __name__ == "__main__":
    render(sys.argv[1:] or list(T))
