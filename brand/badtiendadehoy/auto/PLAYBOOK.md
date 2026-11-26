# Bad Tienda de Hoy · autopilot playbook

The owner (2026-11-24): *"take an active role in managing and growing all five platforms … do not constantly ask me … just do
whatever you think is best."* Every run decides and continues on its own. Nobody approves posts, so the checks below are
the only safety net: **when anything is off, skip that post and say why in the summary. Never guess, never substitute,
never post something that didn't pass.** A skipped slot costs nothing; a wrong post costs the channel.

Brand: Spanish (Latin American, Mexican tone) Fortnite Item Shop channel that grows supporters of the creator code **BAD**.
Identity: the green "BAD / TIENDA DE HOY" logo (brand-kit/), lime #e6ff3a + black, Figtree, and the **voz-3 host**
(a young, hyped Mexican gamer voice, Qwen3-TTS cloned from voice/voz-3-mujer-hype.wav). Its sister channels (BAD ROYALE in
English, La Tiendita Bad in Spanish, CodigoBad in Portuguese) are run by other sessions: this brand is the one with a voice.

## Hard rules (every run, no exceptions)

0. **Short-form goes out every single day** (owner, 2026-11-24: "make sure you're posting every day … on the short form for
   sure"). The shop short is posted on TikTok, Instagram, Facebook, YouTube Shorts and Threads every day. If the full video
   can't be made or fails its review, post the fallback short (SHOP step 3b); a day is never skipped. Long-form is not daily.

1. **Metricool brand: blogId `8343092` (Bad Tienda De Hoy) only.** Verify the id before every Metricool call. Never read,
   write or mention another brand's posts.
2. **Disclosure:** every caption that mentions the code carries `#EpicPartner` at the end of the code line ("Usa el código
   BAD en la tienda 💚 #EpicPartner"); never as the first word (owner, 2026-11-26). `#EpicPartner` is on screen in every
   frame of the shop video (the sticker). The code ask is "Usa el código BAD en la tienda" or "apoya al canal con el código
   BAD". Never call the code a discount or a saving, never promise rewards or giveaways for using it, never imply Epic
   endorses or sponsors the channel.
3. **Facts only from the day's official shop data** (fortnite-api.com, saved in shop/D/api). No leaks, rumors, "coming soon",
   invented dates or prices. Threads posts are questions and opinions, never news.
4. **Voice:** always voz-3 (voice/voice.json), never edited. Lines are written the way they are said: `?` for questions,
   `!` for excitement, `…` for a beat. Numbers in words, names as they are said (engine/voice.py SAY map).
5. **Art:** item art only inside videos and covers about that item (Epic's fan content policy). Never in logos, profile
   pictures or banners.
6. **Labels:** the host is a realistic synthetic voice, so TikTok `isAigc` and Instagram `isAiGenerated` are **true**
   (both platforms ask for realistic AI audio to be labeled); YouTube `isAiGeneratedContent` stays false (no real person or
   real event is depicted). TikTok `commercialContentThirdParty` is true (the code earns a commission). YouTube
   `madeForKids` false, category GAMING.
7. **No drafts:** posts go in with `"draft": false` and `"autoPublish": true`.
8. **Git:** repository fwagtx/BrandPros, branch `claude/badtiendadehoy` only (push with
   `git -c push.negotiate=true push origin HEAD:claude/badtiendadehoy`). Videos never go in git; auto/ghmedia.py hosts them
   on the branch `claude/badtiendadehoy-media`, which it replaces on every upload. Never touch any other branch.
9. **Captions** are written by shop.py: line 1 the hook (`La tienda de Fortnite de hoy, <fecha> 🛒`), then the
   best facts with a few emojis, one question that gets comments, the code line, 1-5 hashtags. **One post, all networks**
   (owner, 2026-11-25: "connect them under one scheduled post for all"): each shop short and each Lote del día is ONE
   Metricool post whose providers are TikTok, Instagram, Facebook, YouTube and Threads (auto/onepost.py). Instagram,
   Facebook, YouTube (description) and Threads share one caption (≤500 characters for Threads); TikTok's caption is
   `tiktokData.title`; YouTube has its own title ≤100 characters. Never split it into one post per network unless only
   some networks are missing (then one post with just those networks, from `onepost.py only`). Long videos (YouTube only)
   and Threads conversation posts stay single-network.
10. **One variable per week** (auto/experiments.json). Never change two things at once; the WEEKLY run decides.
11. **The first second decides everything:** frame 1 already shows the date, "la tienda de hoy 🛒" and three cards, and the
   first voice line is the hook.
12. **Thumbnails on everything** (owner, 2026-11-24: the channel has custom thumbnails). Shorts carry the designed cover
   (engine/cover.js, 1080x1920, key text inside the 4:5 middle) as `videoThumbnailUrl` on TikTok, Instagram, Facebook and
   YouTube; long videos carry the designed 1280x720 thumbnail. Look at the cover/thumbnail in every review. If Metricool
   answers VIDEO_THUMBNAIL_NOT_APPLICABLE on the combined post, send `onepost.py only <posts.json> tiktok,instagram,facebook,youtube`
   (with the cover), then `onepost.py only <posts.json> threads` (Threads has no cover); say so in the summary.

## Setup (every run)

1. If `/home/user/brandpros` is missing: `git clone --depth 1 -b claude/badtiendadehoy https://github.com/fwagtx/BrandPros /home/user/brandpros`
   (attach the repo with push access first if the session asks for it). Otherwise `git -C /home/user/brandpros pull origin claude/badtiendadehoy`.
2. `bash brand/badtiendadehoy/auto/setup.sh` from the repository root (first run in a fresh container downloads ~5 GB of
   voice models; that is expected).

## Schedule (America/Chicago)

| Run | When | What |
|---|---|---|
| **SHOP** | 00:07 UTC (6:07 PM CST / 7:07 PM CDT), right after the reset | Today's shop video, 40 min after the reset (6:40 PM CST), on TikTok, Instagram Reels, Facebook Reels, YouTube Shorts and Threads |
| (queued) | every day **11:30 AM** | **"Lote del día"** short (one bundle spotlight, ~30 s) on all five networks, kept **7 days ahead** by the DAY run |
| **SHOP safety** | 02:19 UTC | Same run; stops at step 1 when the shop video is already scheduled everywhere |
| **DAY** | 10:33 AM | Check yesterday's posts, save metrics, keep 7 days of Threads conversation posts queued |
| **LONG** | Wednesday and Saturday 6:43 AM | One long YouTube video ("TOP 10 lotes con más ahorro"), published at **4:00 PM** |
| **WEEKLY** | Monday 9:27 AM | Weekly review, experiment decision, next week's plan |

## SHOP run

D = `date -u +%F` (the shop day).
1. **Already posted?** `getScheduledPosts` (blogId 8343092, America/Chicago, D-1 00:00 to D 23:59). If TikTok, Instagram,
   Facebook, YouTube and Threads each have a post whose text contains `La tienda de Fortnite de hoy, <día> de <mes>`
   for D, stop and log "shop already posted". If only some do, post just the missing ones at step 5.
2. `python3 brand/badtiendadehoy/auto/shop.py build D` (≈15 min; it waits for the live shop to turn over). It prints the
   cards, every voice line with what Whisper heard, the automatic checks and the review sheet path.
3. **Review.** Read `brand/badtiendadehoy/shop/D/qa/review-sheet.png` and look hard: the intro shows the date, "la tienda de
   hoy 🛒" and three real item cards; each card has real art, a readable price, name and sticker; nothing cut off or
   overlapping; the grid and the creator-code / "APOYA A UN CREADOR: BAD" end are there. Read the printed COVER too:
   date, "LA TIENDA DE HOY", real art, sticker, nothing cut off. Read the printed cards and lines:
   names, prices and captions make sense in Spanish; every line's match ≥ 0.5. AUTO CHECKS must say PASS. Write
   `brand/badtiendadehoy/shop/D/review.json`: `{"status": "PASS", "notes": "<what you checked>"}` or `"FAIL"` with the reason
   (then go to step 3b). One rebuild is allowed for a fixable problem (a bad line: rerun build).
3b. **Never skip a day.** If the build errors, or the review FAILs and one rebuild doesn't fix it, run
   `python3 brand/badtiendadehoy/auto/shop.py fallback D` (a 14 s short from the day's designed cover, real shop data,
   original music). Read `shop/D/cover.jpg`; if it is right, write review.json `{"status": "PASS", "notes": "fallback: <why>"}`
   and continue at step 4. If even the shop data can't be fetched, post one Threads conversation post now (if today has
   none yet) and say so; the safety runs try again.
4. `python3 brand/badtiendadehoy/auto/shop.py ship D` (hosts the files, writes shop/D/posts.json). If it prints STOP, post nothing.
5. posts.json has ONE call carrying all five networks (rule 9). If no network has the post yet, `createScheduledPost` with
   the call's blogId, date and info (as a JSON string). If some networks already have it (a post whose `providers` include
   that network and whose text contains `match`), send instead the info printed by
   `python3 brand/badtiendadehoy/auto/onepost.py only brand/badtiendadehoy/shop/D/posts.json <missing networks, comma-separated>`.
   If Metricool refuses the call, name the error; for VIDEO_THUMBNAIL_NOT_APPLICABLE follow rule 12.
6. `getScheduledPosts` again: confirm the post carries all five providers (TikTok, Instagram, Facebook, YouTube, Threads),
   draft false, at the printed time. Then `python3 brand/badtiendadehoy/auto/shop.py done D`.
7. Append one line to auto/log.md (date, run, variant, what posted or why not), `git add brand/badtiendadehoy/shop/D
   brand/badtiendadehoy/auto`, commit "Shop D", push (rule 8).
8. Summary: D, post time, the networks, the experiment variant, or exactly what stopped it.

## LONG run (Wednesday and Saturday)

P = `TZ=America/Chicago date +%F` (the publish day; the video goes out at 4:00 PM Central, YouTube only).
1. **Already scheduled?** `getScheduledPosts` (blogId 8343092, P 00:00 to P 23:59): a YouTube post whose text contains
   `lotes con más ahorro de la tienda de Fortnite` → stop and log "long already scheduled".
2. `python3 brand/badtiendadehoy/auto/long.py build P` (≈60-75 min: the voice is ~30-40 min on CPU, the render ~15 min).
   It fetches the live shop, keeps the 10 bundles with the biggest savings that are still in the shop after P, writes the
   script from the data only, records it, renders 1920x1080 with chapters, mixes original music under the voice and makes
   the thumbnail. It prints every bundle, what Whisper heard per scene, the checks, the review sheet and the thumbnail.
3. **Review.** Read `long/P/qa/review-sheet.jpg` (one still per scene + the thumbnail) and the printed lists: every bundle
   card has real art, the right name, regular price struck through, the bundle price, the saving and the date; nothing
   overlaps or is cut off; the top-3 podium and the creator-code ending are there; the thumbnail reads at a glance.
   AUTO CHECKS must say PASS. Write `long/P/review.json` (`PASS` + notes, or `FAIL` + reason, then skip to step 6).
4. `python3 brand/badtiendadehoy/auto/long.py ship P`, then `createScheduledPost` with posts.json's call (info as a JSON
   string; it carries the chapters in the description and the thumbnail). Verify with `getScheduledPosts`, then `long.py done P`.
5. If the build fails or runs past 3:20 PM, post nothing (a late long video beats a broken one); say why.
6. Log one line, `git add brand/badtiendadehoy/long/P brand/badtiendadehoy/auto`, commit "Long P", push.

## DAY run

0. **Today's short is out?** D = `date -u +%F` (in the morning this is still the shop that opened last night). If TikTok,
   Instagram, Facebook, YouTube or Threads has no post containing `La tienda de Fortnite de hoy, <día> de <mes>`
   for D (scheduled or published), do the SHOP run now for the missing networks (fallback if needed), posting 20 min out.
1. Setup, then `getScheduledPosts` for yesterday and today (blogId 8343092): list any provider not PUBLISHED with its
   detailedStatus. A failed network is re-tried once with a post for just that network (`onepost.py only <posts.json> <network>`;
   re-host with ghmedia if the media link is gone).
2. **Metrics.** `getAnalyticsDataByMetrics` for brand 8343092, last 10 days: TikTok posts (TKPO07 views, TKPO13 full-watch
   rate, TKPO15 avg time watched, TKPO08 likes, TKPO09 comments, TKPO10 shares), Instagram reels (IGRE23 views, IGRE30 skip
   rate, IGRE24 avg watch time, IGRE09 interactions, IGRE11 reach), YouTube (YTEV02 views, YTEV05 subscribers gained,
   YTEV13 published-video views), Facebook reels (FBEV22 views), Threads posts (THPO08 views, THPO10 replies, THPO09 likes),
   followers (TKEV07, IGEV01, YTEV01, FBEV17, THEV01). Match posts to the ledger by caption start and date; write the numbers
   into auto/metrics.json (one row per post per network, updated in place). Never invent a number: a metric Metricool
   doesn't return stays empty.
2b. **Lote del día: keep 7 days of videos queued on every network** (owner, 2026-11-25: "make sure you are scheduling
   videos for all platforms"). Check `getScheduledPosts` for the 11:30 AM slots of today+1 … today+7 (posts containing
   `Lote del día:`). For the missing days: `python3 brand/badtiendadehoy/auto/spot.py plan <first missing day> <days>`
   (it fetches the live shop and only plans a bundle that is still in the shop the day after it posts), then for each planned
   day `spot.py build DAY` (~8 min), Read `spot/DAY/qa/review-sheet.jpg` (hook, detail with icons, strike → bundle price,
   saving, date, creator-code end, cover), write `spot/DAY/review.json` PASS/FAIL, `spot.py ship DAY`, `createScheduledPost`
   with the one call in `spot/DAY/posts.json` (all five networks in one post, rule 9), verify the five providers, `spot.py done DAY`.
   Days queued before 2026-11-25 noon are five separate posts (one per network); leave them as they are.
   At most 3 new per run. If a queued bundle's leave date moves earlier (fetch shows it gone), set that post to draft and say so.
3. **Threads queue.** Keep a conversation post at 12:15 PM (12:45 PM Sat/Sun) for each of the next 7 days. Write new ones in
   the brand's voice: one question that's easy to answer, about buying habits, favorite skins, OG items, the code (at most
   one in four posts, with `#EpicPartner` at the end, never first); never news, never a fact that isn't in today's shop data. Record each in
   auto/ledger.json (kind "threads").
4. Log one line, commit, push. Summary: failures, yesterday's best post by views, queue status.

## WEEKLY run (Monday)

1. Setup and DAY step 2 for the last 14 days.
2. From metrics.json: best and worst posts per network (views at 72 h, IG skip rate and watch time, TikTok full-watch rate),
   follower growth per network, which Threads questions got the most replies.
3. **Experiment decision** (experiments.json): compare the variants of the week's test only. A variant wins when it is ≥10%
   better on the test's main measure across at least 3 videos each and not worse on views; then move it into `defaults`.
   Otherwise keep the default and say "no winner". Make sure the next test is scheduled (one variable per week; queue in
   learnings.md under "Next tests").
4. Append the week to auto/learnings.md: what won, what didn't, why we think so, what we test next. Commit, push.
5. Summary for the owner: followers per network and their change, best and worst posts with why, the experiment result, the
   next test, and anything broken.
