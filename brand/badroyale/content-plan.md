# BAD ROYALE: content plan

Fortnite news, checked. A fan-run news desk that covers what's happening in Fortnite right now, plus the Easter eggs hiding in it. Every post is built from official sources (Epic's in-game news feed, the official map and POI data, the live build version, official patch notes) and passes the pre-post checklist before it goes anywhere.

**Why people follow:** one place to find out what changed today, without leaks dressed up as facts.
**Why they use the code:** "Support the channel." The ask is short, honest, and the same every time.

## How every post is made

1. **Pull the sources.** Re-fetch the news feed, map, POIs and build within 24 hours of posting, and save them with a manifest (`sources/`).
2. **Write only what the sources say.** Every on-screen claim goes in the scene's claim list with the exact source text it matches.
3. **Build in the in-game style.** Use the official map, Fortnite-style item cards, map pins, menu-style labels, and the broadcast lower third and ticker. No stock templates, no glow-and-rays.
4. **Add gameplay when there's a clean source** (see "Gameplay" below). Every template has a slot for it.
5. **Run the checklist** (`_shared/qa/check_video.py`). Anything that fails or is flagged doesn't post.
6. **Owner approves** the first 5 videos of every series, then spot-checks a sample every week.

## The 5 recurring series

| Series | What it is | Source | Length |
|---|---|---|---|
| **EASTER EGG FILES** | One map secret per video, pinned on the official map. Example: the Pac-Man and ghost islands. | Official map image + POI data | 12–18 s |
| **BREAKING** | A new item in Epic's in-game news feed, or a new build, explained in one card. | In-game news feed, build version | 8–14 s |
| **PATCH IN 30** | Each update's official patch notes boiled down to the 3–5 changes players notice. | Epic's official patch notes* | 20–30 s |
| **COLLAB WATCH** | A board of collabs: CONFIRMED (Epic said it) vs RUMOR (with source name and a confidence meter). A rumor moves to confirmed only when Epic says so. | News feed for confirmed; named reporters for rumors | 12–18 s |
| **GOOD NEWS / BAD NEWS** | Sunday recap: what got better and what got worse this week (buffs, nerfs, returns, removals). | Patch notes + news feed | 20–30 s |

\* Epic's sites are blocked from this cloud session. Patch-note posts need a session or machine that can reach fortnite.com.

**Not allowed in any series:** datamined leak images or audio, unreleased cosmetics presented as coming, invented dates, and "confirmed" without an Epic source.

## Weekly rhythm

Quality first: a slot is skipped rather than filled with a weak post.

| Platform | Posts | Notes |
|---|---|---|
| TikTok | 1 a day, plus BREAKING when it happens | Main growth channel |
| YouTube Shorts | Same video as TikTok, 1 a day | Searchable titles ("Fortnite Pac-Man Easter egg") |
| Instagram Reels | 5 a week | Plus a daily Story headline card |
| X | 2–4 a day | Headline cards and short text first; BREAKING within minutes |
| Threads | 1–2 a day | Text-first version of the day's story |
| Facebook | 3 Reels a week | Reuse the best TikToks |

Weekly shape: Mon EASTER EGG FILES · Tue PATCH IN 30 (update day, when there is one) · Wed COLLAB WATCH · Thu EASTER EGG FILES · Fri BREAKING / best of week · Sat EASTER EGG FILES · Sun GOOD NEWS / BAD NEWS.

Times: avoid @usecodebad's shop-reset slot (7 PM CT). After the Metricool brand exists, set exact times from its best-time data for each network.

## First week: 10 posts (all facts from the v42.40 data saved in `sources/`)

1. **EASTER EGG FILES: Pac-Man** (the sample video). Hook: *"There's a Pac-Man hidden on the map."* Pac-Man Island, Blinky Island and Pinky Island; no Inky or Clyde.
2. **EASTER EGG FILES: 7 Override Consoles.** Hook: *"There are 7 Override Consoles on the map. Here's every one."* All 7 pinned from the POI data.
3. **BREAKING: Freddy's is open.** Hook: *"One animatronic boss is always at Freddy Fazbear's."* News feed: bosses in Battle Royale, one always at the Pizza Parlor; defeat one to possess the suit. Pinned on the map at Freddy Fazbear's Pizzeria.
4. **EASTER EGG FILES: Green Hill Zone.** Hook: *"Sonic's first level is now a place on the island."* Green Hill Zone POI plus the Override news line about Sonic. The fact that it's Sonic's first zone is outside knowledge, so it gets flagged for your confirmation.
5. **BREAKING: Sprites in Ranked.** Hook: *"Sprites are in Ranked now, but their powers are off."* News feed, word for word on the key point.
6. **EASTER EGG FILES: the Dark Cartridge.** Hook: *"The cursed cartridge from the trailer has a spot on the map."* Dark Cartridge POI plus "The Horror Is Here" news.
7. **BREAKING: Safety in Numbers.** Hook: *"There's a quest you can only unlock with friends."* Fortnitemares Collection islands plus the Safety in Numbers Quest, from the news feed.
8. **COLLAB WATCH #1.** Hook: *"Every collab Epic has confirmed this season."* Confirmed: Five Nights at Freddy's, Sonic, Tetris, Pac-Man (news feed). Rumor column empty until there's a named source.
9. **BREAKING: Override explained.** Hook: *"Fortnite: Override, in 15 seconds."* Activate Overrides; areas inspired by Sonic, Tetris and Pac-Man.
10. **GOOD NEWS / BAD NEWS #1 (Sunday).** Hook: *"The week in Fortnite: what got better, what got worse."* Built only from that week's official notes and news.

## Gameplay

You asked for gameplay where it's available. Rules that keep the channel safe:

- **OK:** clips you or a teammate record (Replay Mode is enough for location flyovers), Epic's own trailers and in-game cinematics *if* Epic's fan content policy covers that use (check it before the first post), and clips licensed from creators in writing, credited on screen.
- **Not OK:** downloading other creators' videos, leak footage, or ripped game files.
- Every template has a gameplay slot. When there's no clean clip, the post uses the official map and in-game recreations instead.

## Voice and code moment

Calm anchor, fan's excitement, facts first. The code appears once, near the end, for 1–2 seconds: *"This report supported by code BAD."* #EpicPartner is on screen from frame 1 and is the first hashtag in caption line 1.
