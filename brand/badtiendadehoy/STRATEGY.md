# Bad Tienda de Hoy · strategy

**Goal:** a recognizable Spanish-language Fortnite channel whose audience uses code **BAD** in the Item Shop.
**Promise to the viewer:** "La tienda de hoy en un minuto, contada por alguien que sí sabe": what's new, what leaves
tonight, which bundle is actually worth it. It's one daily habit, timed to the reset.

## What makes it ours
- **The host:** voz-3, a hyped young Mexican gamer voice. She's the only voiced channel of the owner's BAD family.
- **The look:** green "BAD / TIENDA DE HOY" logo, lime #e6ff3a sticker with #EpicPartner always on screen, rarity-colored
  cards, the price counter, and the typed creator-code ending (from the owner's usecodebad reference video).
- **The sound:** original music synthesized each day (new melody, same style for the week), plus our own effects.
- **The language:** Mexican Spanish ("qué onda, banda", "nomás", "¡apúrate!"); the official Latin American item names.

## Platform roles
| Platform | Role | Now | Later (once it's earned) |
|---|---|---|---|
| TikTok | Discovery + code conversions | Daily shop video, 6:40 PM CST, question in the caption | Trends/sounds that fit, a "Se va hoy" short at 11:30 AM |
| Instagram | Reels + brand recognition | Same video as a Reel; full caption + 5 hashtags | Stories ("se va hoy" countdown), carousels for big bundles |
| YouTube | Shorts for discovery + long-form for watch time | Daily Short + **long video Wed & Sat 4:00 PM**: "TOP 10 lotes con más ahorro" (5-6 min, chapters, custom thumbnail) | Weekly recap long video (needs a week of saved shop data) |
| Facebook | Reels + community | Same video as a Reel, shorter caption | Shareable "¿qué comprarías?" posts |
| Threads | Conversation | One question post a day (12:15 PM; 12:45 PM weekends) + the shop video at 6:40 PM | Reply to comments; polls |

Captions differ per platform (shop.py `captions()`); the video is the same because it's the brand's daily anchor.

## Cadence (Central time)
- **Daily 6:40 PM CST** (7:40 PM CDT): shop video on TikTok, IG Reels, FB Reels, YT Shorts, Threads.
- **Daily 12:15 PM** (12:45 PM Sat/Sun): Threads conversation post.
- **Wednesday & Saturday 4:00 PM**: long YouTube video (the YouTube peak in the proxy data is 2-5 PM).
- Every video has a designed thumbnail/cover (the channel has custom thumbnails).
- Weekly review Monday morning. A second daily short only after the first one runs reliably for a week.

## Code conversion (without being an ad)
- The code shows up in three places: the sticker (always), the last voice line ("…y si compras algo, usa el código BAD")
  and the typed creator-code ending. Captions ask a question first and then the code line.
- Threads mentions the code in at most one post in four.
- Test next: one early, light mention vs. only at the end (test 3).
- Never: "discount", rewards or giveaways for using the code, or implying Epic sponsors us.

## Measurement
Saved daily into auto/metrics.json and reviewed weekly (auto/learnings.md):
views/reach, IG skip rate and avg watch time, TikTok full-watch rate and avg time watched, shares/saves, comments,
follower growth per network, Threads replies. Creator-code conversions aren't visible to Metricool. The Support-A-Creator
dashboard (owner) is the only place that shows them, so the weekly review asks the owner for the weekly number when
there's a reason to compare.

## First 7 days (Nov 24-Dec 1)
| Day | 12:15 PM Threads | 6:40 PM shop video (5 networks) | Test E1 hook |
|---|---|---|---|
| Tue 11/24 | — | Shop of Nov 25 | greeting |
| Wed 11/25 | "¿Cuánto es lo máximo que has gastado…?" | Shop of Nov 26 | saving stat |
| Thu 11/26 | "Ranking rápido: ¿qué compras primero?" | Shop of Nov 27 | greeting |
| Fri 11/27 | "Es Black Friday y yo nomás pienso en la tienda…" | Shop of Nov 28 | saving stat |
| Sat 11/28 (12:45) | "¿Una skin que compraste y NUNCA usaste?" | Shop of Nov 29 | greeting |
| Sun 11/29 (12:45) | "Cuando regresa una skin OG…" | Shop of Nov 30 | saving stat |
| Mon 11/30 | "#EpicPartner usar un código no te cuesta nada extra…" | Shop of Dec 1 · weekly review 9:27 AM | greeting |
| Tue 12/1 | "Ya es diciembre 🎄 ¿qué te gustaría ver…?" | Shop of Dec 2 | E2 starts (post time) |
