# BrandPros Brand Kit (v3: The Slice)

The logo is **The Slice**: lowercase **brandpros** whose "o" is a pie chart with one tangerine slice pulled out. We take companies apart and show you how the money really works. It was chosen from three rounds of options (`exports/logos-round3/`, `logo-options.html`).

## What's here

| Path | What it is |
|---|---|
| `exports/wordmark-light.png` / `wordmark.png` | The wordmark on white (default) and on ink |
| `exports/avatar.png` | Profile picture: the pie on a tangerine square (800×800; platforms crop to a circle) |
| `exports/seal.png` | Large icon: the pie on white (900×900) |
| `exports/mascot.png` | The Pro in 4 poses |
| `exports/banner.png` | YouTube banner (2560×1440; wordmark inside the 1546×423 safe area) |
| `exports/thumbA.png`, `thumbB.png` | LF01 thumbnail A/B pair |
| `exports/founders/*.png`, `cast.png` | Founder Files cast cards and sheet |
| `exports/s01-frame-*.png`, `s01-blockbuster-preview.mp4` | S01 storyboard and 55-second preview |
| `exports/logos-round3/` | All five round-3 logo directions (for the record) |
| `tokens.css`, `fonts/` | Colors, type and bundled fonts (all SIL Open Font License) |
| `engine/` | The drawing engine (`bp-engine.js`), founder cast, logo explorations and renderer |
| `index.html` | The visual brand kit page (published as an artifact) |

## Logo rules
- **Wordmark:** lowercase, Bricolage Grotesque ExtraBold, ink `#141414`; the pie-o's slice is always tangerine `#F26B1D` (on dark: white letters, `#FF8A3D` slice).
- **Icon:** the pie alone (ink pie, white slice) on tangerine.
- **Clear space:** the height of the pie on every side. **Minimum size:** 90 px wide (wordmark), 24 px (icon).
- **Never:** caps, recoloring the slice, rotating the pie, closing the gap, outlines, effects, or stretching.

## Non-negotiable rules for anything we draw
1. **No real logos, mascots or trade dress.** Stores and products are generic (e.g. a slate strip-mall store with a cream "VIDEO" board), identified by **handwritten labels**.
2. **A company's name is never set in its own brand colors** ("NETFLIX" is never white on red; "BLOCKBUSTER" is never blue and yellow).
3. **Historical founders** come from the approved cast. **Living people** are generic characters, named in the voiceover.
4. Quotes on screen are always attributed, with a marker note naming the source.

## Colors
| Name | Hex | Use |
|---|---|---|
| Ink | `#141414` | Wordmark, dark backgrounds, all line work, the mascot's blazer |
| White / Paper | `#FFFFFF` / `#F2EAD7` | Logo backgrounds / paper, cards, caption strips |
| Tangerine | `#F26B1D` (`#FF8A3D` on dark) | The slice, headline labels, "PROS KNOW" |
| Light tangerine | `#FFA463` | The spoken caption word; marker notes on dark |
| Red | `#C8372D` | Losses, stamps, $1B Mistake |
| Mint | `#8FD1AE` | Gains, The Comeback |
| Brass | `#C49A3A` | Coins and cash props only |

Series chips: $1B Mistake = red · Dead Brands = sepia `#B9A27A` · How They Make Money = tangerine · The Comeback = mint · Founder Files = ink · Brand Wars = red/slate split.

## Type
| Role | Font | Rules |
|---|---|---|
| Wordmark, headlines, thumbnails, numbers | **Bricolage Grotesque ExtraBold** | Wordmark lowercase; headlines on cut-paper labels with tape, 2 lines max |
| Quotes, founder name plates | **DM Serif Display** | Always attributed |
| Captions | **Inter Bold** | Sentence case on a cream paper strip, max 4 words, spoken word highlighted, at ~69% of frame height |
| Hand notes | **Permanent Marker** | Sources, arrows, who's who |

## The hand-made look (how the engine does it)
- **Line boil:** every frame is redrawn with 3 slightly different ink wobbles, swapped 8×/second (an SVG turbulence displacement with a changing seed).
- **Motion on twos:** all movement steps at 12 fps; camera pushes are slow (3–5%).
- **Paper:** static grain and fiber blotches, a soft vignette and halftone dots for shading. No gradients, no sunbursts.
- **Cuts:** hard cuts; labels slap on with a one-frame overshoot; stamps land in two frames.

## The Pro (mascot)
Round cream face, a tangerine pie slice for a cowlick, charcoal blazer, tangerine tie, pie-chart lapel pin. Hooks, lessons and CTAs only.

## The Founder Files cast
Each founder is built from their documented signature look (face shape, hairline, facial hair, glasses, era clothing, a signature prop), then approved and reused. The cast sheet lists each one's likeness notes in `engine/founders.js` (`look:`).

**To push likeness further** (recommended before a founder's first video):
1. Gather 3–5 public-domain or licensed reference portraits from the era of the story.
2. Compare them against the card and adjust the parameters in `founders.js` (face `w/h/jaw/chin`, hair `style`, `nose`, `ears`, facial hair, `age`), or have an illustrator redraw the sheet in this style.
3. Approve once, then reuse the card in every scene.

This session couldn't fetch reference photos because Wikipedia is blocked by the environment's network settings, so the cast was drawn from well-documented signature features.

## Re-rendering
```bash
cd brandpros/brand-kit/engine
pip install imageio-ffmpeg
FFMPEG=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") node render.mjs
# --only assets | --only video   --fps 30   --scale 0.5 (faster drafts)
```
Word timings in the preview are estimated from the script. In production, feed `buildTimeline()` the voiceover API's word timestamps and mux in the voiceover and music. Because of the paper grain, re-encode the final MP4 with `-crf 27 -tune grain` to keep files around 20 MB.
