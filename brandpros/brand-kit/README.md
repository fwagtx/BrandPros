# BrandPros Brand Kit (v2)

v2 replaces the v1 gold-tag-on-navy logo, which was too close to Blockbuster's torn-ticket logo, and drops every borrowed brand color from the illustrations.

Everything that makes BrandPros look like BrandPros: the **Keyhole Seal** logo, the wordmark, the mascot, the **Founder Files cast**, colors, type, thumbnails, channel art, and a working **render engine** that draws the hand-inked scenes and outputs finished video.

## What's here

| Path | What it is |
|---|---|
| `exports/seal.png` | The full Keyhole Seal with the motto rim (900×900) |
| `exports/avatar.png` | Profile picture for all four platforms (800×800) |
| `exports/wordmark-light.png`, `wordmark.png` | Wordmark on cream (default) and on ledger green |
| `exports/founders/*.png` | **10 founder cast cards** (800×1000): Sanders, Disney, Woolworth, Adi and Rudolf Dassler, Kroc, Hershey, Ford, Sears, Madam C.J. Walker |
| `exports/cast.png` | The whole cast on one sheet (2100×1350) |
| `exports/mascot.png` | The Pro in 4 poses |
| `exports/banner.png` | YouTube banner (2560×1440; logo inside the 1546×423 safe area) |
| `exports/thumbA.png`, `thumbB.png` | LF01 thumbnail A/B pair (1920×1080) |
| `exports/s01-frame-*.png` | 8 storyboard frames from Short S01 |
| `exports/s01-blockbuster-preview.mp4` | **55-second rendered preview of Short S01** (1080×1920, 30 fps, silent with captions) |
| `tokens.css` | Colors, fonts and sizes as CSS variables |
| `fonts/` | DM Serif Display (roman and italic), Anton, Inter, Permanent Marker (all SIL Open Font License) |
| `engine/bp-engine.js` | Drawing engine: seal, mascot, generic characters, stores, props, labels, captions, S01 scenes |
| `engine/founders.js` | The Founder Files cast: feature-based caricature busts plus portrait cards |
| `engine/stage.html` + `engine/render.mjs` | Renders every PNG/SVG export and the MP4 |
| `index.html` | The visual brand kit page with a live player (published as an artifact) |

## Logo: the Keyhole Seal
- **Idea:** we unlock the story behind the brand. An engraved stock-certificate seal in ledger green with a keyhole at the center; the full version carries "EVERY BRAND HAS A BACKSTORY ✦ ESTD 2026" on its rim.
- **Wordmark:** seal plus "Brand" (DM Serif Display) plus "*Pros*" (DM Serif Display Italic, Seal Red `#C8372D`; `#E8735F` on green).
- **Clear space:** the keyhole's height on every side. **Minimum size:** 40 px for the simple seal.
- **Never:** a "BP" monogram (another company's name), price tags or tickets, recoloring outside the palette, or effects.

## Non-negotiable rules for anything we draw
1. **No real logos, mascots or trade dress.** Stores and products are generic (e.g. a slate strip-mall store with a cream "VIDEO" board), identified by **handwritten labels**.
2. **A company's name is never set in its own brand colors** ("NETFLIX" is never white on red; "BLOCKBUSTER" is never blue and yellow).
3. **Historical founders** come from the approved cast. **Living people** are generic characters, named in the voiceover.
4. Quotes on screen are always attributed, with a marker note naming the source.

## Colors
| Name | Hex | Use |
|---|---|---|
| Ledger Green | `#133A2C` | The seal, backgrounds, the mascot's blazer |
| Certificate Cream | `#F2EAD7` | Paper, cards, caption strips |
| Seal Red | `#C8372D` | "*Pros*", losses, stamps, $1B Mistake |
| Mint | `#8FD1AE` | Gains, The Comeback |
| Brass | `#C49A3A` | Money, the keyhole pin |
| Ink | `#17150F` | All line work |
| Highlighter | `#F4E36B` | The spoken caption word; notes on green |

Series chips: $1B Mistake = red · Dead Brands = sepia `#B9A27A` · How They Make Money = brass · The Comeback = mint · Founder Files = ledger green · Brand Wars = red/slate split.

## Type
| Role | Font | Rules |
|---|---|---|
| Wordmark, titles, quotes | **DM Serif Display** (+ Italic) | "Pros" always italic |
| Headlines, thumbnails | **Anton** | On cut-paper labels with tape, 2 lines max |
| Captions | **Inter Bold** | Sentence case on a cream paper strip, max 4 words, spoken word highlighted, at ~69% of frame height |
| Hand notes | **Permanent Marker** | Sources, arrows, who's who |

## The hand-made look (how the engine does it)
- **Line boil:** every frame is redrawn with 3 slightly different ink wobbles, swapped 8×/second (an SVG turbulence displacement with a changing seed).
- **Motion on twos:** all movement steps at 12 fps; camera pushes are slow (3–5%).
- **Paper:** static grain and fiber blotches, a soft vignette and halftone dots for shading. No gradients, no sunbursts.
- **Cuts:** hard cuts; labels slap on with a one-frame overshoot; stamps land in two frames.

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
