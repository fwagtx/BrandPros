"""Pre-render blurred backgrounds for each segment (keeps per-frame rendering fast)."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

EP = sys.argv[1]
ep = json.load(open(os.path.join(EP, "episode.json")))
W, H = 1080, 1920

def hex2rgb(h): h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def gradient(size, inner, outer):
    w, h = size
    g = Image.new("RGB", (w, h), hex2rgb(outer))
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    steps = 60
    for i in range(steps):
        f = i / steps
        rx, ry = w * 0.75 * (1 - f), h * 0.75 * (1 - f)
        cx, cy = w / 2, h * 0.45
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=int(255 * f))
    g.paste(Image.new("RGB", (w, h), hex2rgb(inner)), (0, 0), mask.filter(ImageFilter.GaussianBlur(w / 12)))
    return g

def card_image(seg, size):
    w, h = size
    card = gradient((w, h), *seg["color"])
    item = Image.open(os.path.join(EP, seg["img"])).convert("RGBA")
    s = h / item.height
    item = item.resize((int(item.width * s), h), Image.LANCZOS)
    card.paste(item, ((w - item.width) // 2, h - item.height), item)
    return card

def blurred_bg(seg, out, dim=0.82):
    # card art scaled to cover the frame, heavy blur, slightly darker
    c = card_image(seg, (1080, 1240))
    s = H / c.height * 1.15
    c = c.resize((int(c.width * s), int(c.height * s)), Image.LANCZOS)
    x0, y0 = (c.width - W) // 2, int((c.height - H) * 0.25)
    c = c.crop((x0, y0, x0 + W, y0 + H)).filter(ImageFilter.GaussianBlur(48))
    ImageEnhance.Brightness(c).enhance(dim).save(out, quality=92)

os.makedirs(os.path.join(EP, "bg"), exist_ok=True)
for i, seg in enumerate(ep["segments"]):
    blurred_bg(seg, os.path.join(EP, "bg", f"{i:02d}.jpg"))
# intro uses the first intro card, darker
first = next(s for s in ep["segments"] if s["img"] == ep["intro_cards"][0]["img"])
blurred_bg(first, os.path.join(EP, "bg", "intro.jpg"), dim=0.62)

# creator-code screen: dim grid of shop tiles
grid = Image.new("RGB", (W, H), (12, 10, 20))
tw, th, gap = 330, 400, 16
segs = ep["segments"][1:] or ep["segments"]
k = 0
for row in range(-1, 5):
    for col in range(4):
        seg = segs[k % len(segs)]; k += 1
        x = col * (tw + gap) - 120 + (row % 2) * 60
        y = row * (th + gap) + 60
        grid.paste(card_image(seg, (tw, th)), (x, y))
grid = ImageEnhance.Brightness(grid.filter(ImageFilter.GaussianBlur(5))).enhance(0.3)
tint = Image.new("RGB", (W, H), (60, 20, 90))
Image.blend(grid, tint, 0.18).save(os.path.join(EP, "bg", "code.jpg"), quality=92)
print("backgrounds:", sorted(os.listdir(os.path.join(EP, "bg"))))
