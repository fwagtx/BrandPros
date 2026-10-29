# BAD ROYALE autopilot playbook

The owner (2026-10-28): *"this should be fully autonomous for years to come ... I shouldn't need to accept anything at all."*
So every run decides and continues on its own. Nobody approves posts. That makes the checks below the only
safety net: **when anything is off, skip that post and say why in the summary. Never guess, never substitute,
never post something that didn't pass.** A skipped slot costs nothing; a wrong post costs the channel.

## Hard rules (every run, no exceptions)

1. **Metricool brand: blogId `7408112` (ItemShopBad = BAD ROYALE) only.** Verify the id before every Metricool call.
   Never read, write or mention any other brand (7066444 is the usecodebad channel, run by a different session).
2. **Disclosure:** every caption starts with `#EpicPartner`, and `#EpicPartner` is on screen in every frame (the
   style kit's `S.disclosure`). The code ask is exactly "Use code BAD in the Item Shop" or "Code BAD in the Item Shop
   supports the channel." Never call the code a discount or a saving, never promise rewards, never imply Epic
   endorses or sponsors the channel.
3. **Facts only from saved official data** (sources/ refreshed by fetch_sources.py, or that day's shop folder).
   Every on-screen fact is a claim in `SCENE.claims` that matches the source text. No leaks, no datamines, no
   rumors, no "coming soon", no invented dates, no opinions presented as fact ("best skin ever").
4. **Voice:** always the owner's locked voice, `brand/badroyale/voice.json` (Kokoro `af_heart`, speed 1.1). The
   scripts enforce it; never edit voice.json. BAD is said as the word "bad" (vo.py's PRONOUNCE map).
5. **Art:** skin and item art only inside videos and covers about that item (Epic's fan content policy).
   Never in logos, profile pictures or banners.
6. **Labels:** `isAigc`, `isAiGenerated` and `isAiGeneratedContent` stay false (a generic narrator voice over
   graphics, not a realistic person or event). TikTok `commercialContentThirdParty` is true (the code earns a
   commission).
7. Run commands **exactly as written here, one per Bash call** (no `cd`, `&&`, pipes or `;` around them), from the
   repository root. Nobody is watching to approve anything: if a step is refused, don't look for another way to do
   it; skip what depends on it and name the refused step in the summary.
8. Git: commit only small files (the .gitignore keeps videos, audio and images out) and push with
   `git push origin HEAD:claude/eloquent-lovelace-vu2quk`. Never force-push, never touch other branches.
9. **No drafts, ever.** Every post goes in with `"draft": false` and `"autoPublish": true` and publishes by
   itself at its time (owner, 2026-10-28). The scripts' posts.json already says so; never change it.
10. **Captions** (owner, 2026-10-28): engaging, never stiff or AI-sounding. Line 1 is the hook, then one or two short
   lines of the best facts with a few emojis, one question that gets comments, then the code push
   `Use code BAD in the Item Shop 💛`, then 3 hashtags. `#EpicPartner` at the very start is the only disclosure:
   no "from official data", "positions from the map" or any other disclaimer lines.
11. **The first 3 seconds decide everything.** Frame 1 already shows the subject and big text; the first voice
   line is the hook. Every Item Shop video opens with "This is today's Item Shop for <Month> <day>." (shop_pick.py
   writes it). A short whose first second is empty, slow or confusing fails review.

## Schedule (all times America/Chicago)

| Run | When | Posts |
|---|---|---|
| **SHOP** | 00:05 UTC (7:05 PM CDT, 6:05 PM CST), right after the Item Shop resets | Today's shop video, about 15 min after the run starts, on TikTok, Instagram Reels, Facebook Reels, YouTube Shorts |
| **SHOP safety** | 01:47 UTC | The SHOP run again; it stops at step 3 when the shop video is already scheduled, so a failed or missed 00:05 run still gets the video out the same evening |
| **DAY** | 9:41 AM | Two shorts on all 4 networks: **12:30 PM** today's current game content (made that morning from today's data) and **4:30 PM** evergreen (kept 7 days ahead) |
| **LONG** | 5:13 AM Mon, Wed, Sat | One long YouTube video at **3:00 PM** |

3 shorts a day on every network, plus 3 long YouTube videos a week (LONG run).

## SHOP run

1. `git pull origin claude/eloquent-lovelace-vu2quk`
2. `bash brand/badroyale/auto/setup.sh`
3. `date -u +%F` gives D, the shop day. **Already posted?** `getScheduledPosts` (brandId 7408112, timezone
   America/Chicago, D-1 17:00 to D 23:59): if TikTok, Instagram, Facebook and YouTube each have a post whose text
   starts `#EpicPartner This is today's Item Shop for <Month day of D>`, stop here and log "shop already posted" (this
   is how the 01:47 UTC safety run ends on a normal day). If only some networks have it, post just the missing ones
   in step 6. Otherwise `python3 brand/badroyale/auto/shop_daily.py build D` (it waits up to 25 min for the live shop
   to turn over).
4. Open `brand/badroyale/shop/D/qa/review-sheet.png` with Read and look hard: the first frame grabs you (date
   and items visible at once), real items on every tile, prices and names readable, nothing cut off or
   overlapping, the code card at the end. Read the voice lines it printed: the first is "This is today's Item Shop
   for <date>.", and they all make sense as spoken English. Write `brand/badroyale/shop/D/review.json`:
   `{"status": "PASS", "notes": "<what you checked>"}`, or `"FAIL"` with the reason (then skip to step 9).
5. `python3 brand/badroyale/auto/shop_daily.py ship D`. If it prints STOP, post nothing; go to step 9.
6. Read `brand/badroyale/shop/D/posts.json`. Call `getScheduledPosts` (brandId 7408112, timezone America/Chicago,
   D-1 00:00 to D 23:59). For each entry in `calls` whose `match` text is not already the tiktokData.title /
   youtubeData.title / text of a post in that list, call `createScheduledPost` with that entry's `blogId`, `date`
   and `info` exactly as given (info as a JSON string). If one network's call fails, the others still go; name
   the error in the summary. If it says "Failed to normalize media", run
   `python3 brand/_shared/store.py link shop-D/video.mp4` (and cover.jpg), swap the links in, retry once.
7. `getScheduledPosts` again: confirm 4 new posts (TikTok, Instagram, Facebook, YouTube), draft false, at the time
   ship printed.
8. `python3 brand/badroyale/auto/shop_daily.py done D`
9. Append one line to `brand/badroyale/auto/log.md` (date, run, what posted or why not), then
   `git add brand/badroyale/shop brand/badroyale/auto/log.md`, `git commit -m "Shop D"`, push (rule 8).
10. Summary: D, post time, the 4 networks, or exactly what stopped it.

## DAY run

1. `git pull origin claude/eloquent-lovelace-vu2quk`, then `bash brand/badroyale/auto/setup.sh`
1b. **Backlog first:** run `python3 brand/badroyale/auto/backlog.py links` (writes backlog.live.json with fresh hosted
   links; never commit that file), then for each entry in `brand/badroyale/auto/backlog.live.json` whose `date` is at least 15 minutes away and whose `match` isn't already
   scheduled (SHOP step 6), call `createScheduledPost` with its blogId, date and info exactly as given. Remove
   scheduled and past entries from backlog.json; once every entry of a slug is gone, delete its hosted files
   (`python3 brand/_shared/store.py rm <key>` for each of its "r2" keys).
1c. `python3 brand/badroyale/auto/fetch_sources.py` (prints new news tiles, new or removed places, a new build).
2. **Today's current short, 12:30 PM, every day.** If today's 12:30 slot is empty (getScheduledPosts), run
   `python3 brand/badroyale/auto/new_today.py brand/badroyale/video/auto/<today>-now`. From today's own data it picks
   the first that exists: a new in-game news tile about something current (an event, a quest, an update), else the
   biggest Item Shop listing that went live at today's reset (brand-new skins first, never the shop video's deal),
   else the priciest outfit leaving the shop at tonight's reset. Then steps 5–8 with `--at "<today> 12:30"` and
   `--sources <folder>/sources`, and add the ledger line it printed. It is about today: never schedule it for a later
   day. If the pick is a news tile that reads like a generic gameplay tip, or the sheet still looks wrong after a
   rebuild, run it again with `--pick new` (then `--pick last`). If it prints STOP, make a Where Is short for 12:30.
3. **Keep the 4:30 PM evergreen slot 7 days ahead.** Look at the 4:30 slots for today and the next 6 days and fill
   the empty ones, earliest first, at most 2 new shorts per run, alternating:
   - Guess the Season via `python3 brand/badroyale/auto/new_guess.py <folder> "<outfit>" "<outfit>" "<outfit>"`
     with outfits never used in the ledger (`--sources <folder>/sources`).
   - Where Is via `python3 brand/badroyale/auto/new_where.py <folder> "<place name from map.json>"` with a place
     never used in the ledger ("Can't find X? Here's exactly where it is", pinned on the official map). These hold
     only while the map does: ship them within a day of `fetch_sources.py`, and if fetch_sources.py later reports the
     place removed, set its queued posts to draft (Facts change, below).
   Never fill a 12:30 slot for a later day: each 12:30 is made that morning. When there's a bigger story than the
   generators give (a new map area, a big update, a new mode), make it by hand from the grid below for today's 12:30
   instead, with steps 4–8.

   Hand-made formats by weekday (ideas for a bigger story at 12:30; the generators cover the normal days):

| Day | Map & secrets | News & games |
|---|---|---|
| Mon | Easter Egg Files | Guess the Season |
| Tue | What Changed (fallback: Easter Egg Files) | Breaking (fallback: news explainer) |
| Wed | Easter Egg Files | Set Complete (fallback: Guess the Season) |
| Thu | Every X on the map | Price Check (fallback: This or That) |
| Fri | Easter Egg Files | This or That |
| Sat | Feature guide (fallback: Easter Egg Files) | Guess the Season |
| Sun | Every X on the map | Week in 30 |

   **Formats** (12–25 s, 5–8 short voice lines, hook in the first line, code line last):
   - **Easter Egg Files:** one reference or secret you can prove from the map data or a news tile (a named place
     that nods to a game or film, an island shaped like something, a tile's hidden detail), pinned on the official
     map. The reference itself must be undeniable from the name (e.g. "Green Hill Zone" is Sonic); anything that
     needs outside knowledge beyond that is out.
   - **What Changed:** places added or removed and new tiles since the last update (fetch_sources.py output and
     sources/history/), shown on the map.
   - **Every X on the map:** every place of one kind from map.json (like the Override Consoles video), all pinned,
     with the exact count.
   - **Feature guide:** how one current feature works, word for word from its news tile, shown on the map or in
     cards.
   - **Guess the Season:** 3 outfits in today's shop; each appears, a 2-second "guess" beat, then the chapter and
     season Epic lists (shop/D/history.json). Sources: `--sources brand/badroyale/shop/D`.
   - **Breaking / news explainer:** a news tile added since yesterday (or, as the fallback, one not yet in the
     ledger), quoted, with what it means in one line.
   - **Set Complete:** every item in one set that has items in today's shop (fetch each item from
     `https://fortnite-api.com/v2/cosmetics/br/<id>` into the short's own `sources/` with a manifest.json, and pass
     `--sources` that folder), showing which ones are in the shop and their prices.
   - **Price Check:** a bundle in today's shop against the separate prices of its items, only when every item is
     also sold on its own today. State the two totals; no verdict words.
   - **This or That:** two outfits in today's shop side by side with prices; "Comment which one you'd buy."
   - **Week in 30:** the week's biggest bundle, the oldest outfit that showed up, and any map or news change, from
     `brand/badroyale/shop/archive/` and sources/history/.

4. For a hand-made short (formats above; read `brand/badroyale/auto/ledger.json` first and never repeat a topic) make a folder `brand/badroyale/video/auto/<D>-<slug>/` with:
   - `scene.js`: build it like the ones in `brand/badroyale/video/v2/` (consoles, pacman, freddys) and
     `brand/badroyale/shop/scene.js`, using `window.FX`, `window.STYLE2` (map camera, captions, markers, code card,
     disclosure, finish). Map work uses `../../badroyale/sources/map-blank.png` and POI coordinates from map.json.
     Item art comes from the image URLs in the source JSON (download into the folder's `img/`).
     `SCENE.claims` lists every fact with its source file and exact matching text; `SCENE.caption` starts with
     `#EpicPartner`.
   - `vo.json`: `{"phrases": [{"text": "...", "pause": 0.2}, ...]}`. Plain spoken English, short lines.
   - `post.json`: `tiktok`, `tiktokTitle`, `instagram` (5 hashtags at most), `facebook`, `facebookTitle`,
     `youtube`, `youtubeTitle` (searchable, 100 characters at most, ends with #Shorts), `tags`, `cover_t`.
     Every caption starts with `#EpicPartner` and carries the code line. Match the house style in `brand/badroyale/auto/backlog.json`
     (rule 10).
5. `python3 brand/badroyale/auto/make_short.py build <folder>` (add `--sources <dir>` when the facts come from
   somewhere other than brand/badroyale/sources). Open `<folder>/qa/review-sheet.png` and judge it like a fan
   scrolling: does frame 1 make you stop? Is every word readable on a phone? Anything overlapping, cut off, empty
   or ugly? If so, fix the scene and build again (up to 3 tries). Then write `<folder>/review.json`.
6. `python3 brand/badroyale/auto/make_short.py ship <folder> --at "<D> 12:30"` (or 16:30), plus the same
   `--sources`. On STOP, read `<folder>/qa/qa-log.md`, fix what failed and repeat 5–6 (up to 3 tries); if it still
   stops, skip that slot.
7. Schedule `posts.json` exactly as in SHOP steps 6–7, then `python3 brand/badroyale/auto/make_short.py done <folder>`.
8. Add each posted topic to `brand/badroyale/auto/ledger.json` (`{"topics": [{"date", "format", "topic"}]}`).
9. Check yesterday: `getScheduledPosts` for D-1; any network whose status is not PUBLISHED goes in the summary
   with its detailedStatus.
10. Log line, `git add brand/badroyale/video/auto brand/badroyale/auto brand/badroyale/sources`, commit, push.
11. Summary: each slot's format, topic, time and networks, or why it was skipped; yesterday's failures.

## Facts change: pull outdated posts

After fetch_sources.py, if it reports `news_removed` or `places_removed`, check every post scheduled for the next
7 days (getScheduledPosts) against the ledger topics: a post whose fact is gone (a removed news tile or place) is
set back to draft with updateScheduledPost (same content, `"draft": true`), and its slot is refilled. This is the
one time a post becomes a draft: an outdated post is worse than an empty slot.

## LONG run (Mon, Wed, Sat; posts 3:00 PM)

1. Pull, setup, fetch_sources.py.
2. Pick the episode, never repeating a ledger topic: **Mon** "This Week's Item Shop" (every big bundle, price and
   OG return of the last 7 days from `brand/badroyale/shop/archive/`); **Wed** a full map tour or "every X on the
   map" (map.json); **Sat** the week's news explained (news tiles, what changed in sources/history/). 4-10 min.
3. Make `brand/badroyale/video/long/<D>-<slug>/` like `video/long/2026-10-29-fortnitemares/`: long.json (segments,
   claims), vo.json, post.json (description starts with #EpicPartner, has `{chapters}`), sources/ with manifest.json.
   Open with the hook in the first sentence; put the code ask once mid-video and once at the end.
4. `python3 brand/badroyale/auto/make_long.py build <folder>`; review the sheet like a viewer (fix and rebuild up to
   3 times); write review.json; `python3 brand/badroyale/auto/make_long.py ship <folder> --at "<D> 15:00"`.
5. Schedule posts.json (if Metricool rejects the thumbnail, again without videoThumbnailUrl), then
   `python3 brand/badroyale/auto/make_long.py done <folder>`, ledger, log, commit, push, summary.

## If something breaks

- A script fails: read its error, fix the cause if it is in this repository (a bug, a missing allowlist word for
  a real name), commit the fix, try once more. Never weaken a check to get a post through.
- fortnite-api.com is down: skip what needs it; the next run tries again.
- Metricool rejects a call: retry once if the error is about media; otherwise skip that network and report it.

