# BrandPros Brand Kit (v1)

Everything needed to make BrandPros content look like BrandPros: the logo, mascot, colors, type, caption and thumbnail rules, channel art, and a working **render engine** that draws the cartoon scenes and outputs finished video.

## What's here

| Path | What it is |
|---|---|
| `exports/avatar.png` / `.svg` | Profile picture (800×800), for all four platforms |
| `exports/wordmark.png`, `wordmark-light.png` | Horizontal logo lockups (dark and light backgrounds) |
| `exports/mascot.png` | "The Pro" mascot in 4 poses (smile/wave, shock/hold, think/shrug, wink/point) |
| `exports/banner.png` | YouTube channel banner (2560×1440; key content inside the 1546×423 safe area) |
| `exports/thumbA.png`, `thumbB.png` | LF01 Blockbuster thumbnail A/B test pair (1920×1080) |
| `exports/s01-frame-*.png` | 8 storyboard frames from Short S01 |
| `exports/s01-blockbuster-preview.mp4` | **55-second rendered preview of Short S01** (1080×1920, 30 fps, silent with timed captions) |
| `tokens.css` | Colors, fonts and sizes as CSS variables |
| `fonts/` | Anton, Inter (400/600/800), DM Serif Display (all SIL Open Font License, from Google Fonts) |
| `engine/bp-engine.js` | The drawing engine: mascot, characters, storefronts, props, captions, scenes |
| `engine/stage.html` + `engine/render.mjs` | Renders the PNG assets and the MP4 |
| `index.html` | The visual brand kit page with a live player (also published as an artifact) |

> The `.svg` exports reference the brand fonts by name. Install the fonts in `fonts/` before opening them in a design tool, or use the PNGs.

## Logo
- **Mark:** a gold price tag with a navy hole, the **BP** monogram in Anton, and a rise-and-fall line underneath.
- **Wordmark:** "BRAND" in cream (or navy on light) plus "PROS" in gold, both Anton.
- **Clear space:** the height of the tag's hole on every side (about 1/10 of the tag's height).
- **Minimum size:** 40 px tall for the mark (avatar), 24 px tall for the wordmark.
- **Don't:** recolor the tag (except all-navy or all-cream one-color versions), stretch it, add effects or gradients, or put it on a busy image without a navy panel.

## The Pro (mascot)
A narrator in a navy blazer whose head is a gold price tag. The Pro appears in hooks, "Pros know" lessons and CTAs, never as a story character.
- **Expressions:** smile, wink (lesson/CTA), shock (twists), think (questions).
- **Arm poses:** wave, hold (presenting a number), point (the lesson), down (point at comments), shrug.
- The Pro never speaks for real people and never appears in sponsor reads as a stand-in for the sponsor.

## Colors
| Token | Hex | Use |
|---|---|---|
| Boardroom Navy | `#0E1A2B` | Backgrounds, all outlines, text on light |
| Navy 2 / Navy 3 | `#1B2C45` / `#27405F` | Scene backgrounds, burst rays |
| Ledger Gold | `#F4B942` | Logo, key numbers, the highlighted caption word |
| Markdown Red | `#E63946` | Losses, stamps, $1B Mistake |
| Comeback Green | `#2BB673` | Gains, The Comeback |
| Receipt Cream | `#F5EFE0` | Cards, light backgrounds |
| Filing Gray | `#8A94A6` | Secondary text |

Series chips: $1B Mistake = red, Dead Brands = sepia `#C9B27A`, How They Make Money = gold, The Comeback = green, Founder Files = navy with a gold frame, Brand Wars = split red/navy.

## Type
| Role | Font | Rules |
|---|---|---|
| Headlines, thumbnails, numbers | **Anton** | All caps, 2 lines max, white or gold with a navy stroke of about 14% of the size |
| Captions | **Inter ExtraBold (800)** | All caps, 72 px at 1080 wide, white with a 16 px navy stroke, **spoken word in gold**, max 3 words per chunk, centered at about 68% of the frame height |
| Vintage titles and quotes | **DM Serif Display** | Dead Brands and Founder Files titles, on-screen quotes (always attributed) |
| UI and body | Inter 400/600 | Descriptions, media kit, website |

## Illustration rules (summary; full rules in `../12-visual-automation.md`)
- 8 px navy outline at 1080 wide, flat fills, one soft shadow at most, oversized heads.
- Real people: recognizable, friendly caricature for documented events only. Living executives default to generic characters.
- Brands: color *hints* only (e.g. a blue-and-yellow "VIDEO" store). **Never draw a real logo or mascot.** Official logos, if needed, are overlaid unaltered in the edit.
- Safe zones for vertical video: nothing important in the top 120 px or the bottom 360 px (platform UI); captions at about 1300 px.

## Motion rules (as used in the S01 preview)
- A new visual idea every 2–4 s. Every scene has a slow Ken Burns push (3–6%).
- **Cuts:** a 0.25 s "pop" (106% → 100%) plus a short white flash on each beat.
- **Headlines:** spring in (overshoot) and stay until the next idea.
- **Stamps** (PASSED, LATE FEES = $$$) slam from 240% to 100%.
- **The end card** is the logo, the wordmark, "Every brand has a backstory." and the cha-ching sonic logo.

## Re-rendering
```bash
cd brandpros/brand-kit/engine
pip install imageio-ffmpeg                        # provides an ffmpeg binary
FFMPEG=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") node render.mjs
# --only assets | --only video   --fps 30   --scale 0.5 (faster drafts)
```
Word timings in the preview are estimated from the script. In production, replace `buildTimeline()` input with the word-level timestamps returned by the voiceover API (see `../08-production-workflow.md` step 5), and mux the voiceover and music into the MP4.
