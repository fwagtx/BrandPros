# 08 — Production Workflow

The goal is **maximum automation with three short human checkpoints**. Automation handles the busywork (research gathering, first drafts, voiceover, image generation, assembly, captions, scheduling). A human handles what keeps the channel *monetizable and legally safe*: the point of view, the facts, and the final watch.

> **Why not 100% hands-off?** YouTube's monetization policy targets "inauthentic" (formerly "repetitious") content: mass-produced, templated videos with little human creative input. Hands-off faceless channels are exactly what gets demonetized, and an unreviewed AI fact error about a real company is a legal risk. The three checkpoints below add about 45 minutes per Short and keep the channel eligible for ad revenue.

The automation architecture, tool choices and cartoon-character system are in **`12-visual-automation.md`**. This file is the step-by-step process.

---

## The pipeline at a glance

```
[1 Idea queue] → [2 Research pack] → [3 Script draft] → ✋ GATE 1: POV + script edit
      → [4 Fact-check] → ✋ GATE 2: facts signed off
      → [5 Voiceover] → [6 Scene art] → [7 Assembly + captions] → [8 Thumbnail/cover]
      → ✋ GATE 3: final watch → [9 Schedule in Metricool] → [10 Post-publish loop]
```

Everything lives on one **production board** (Airtable, Notion or a Google Sheet) with one row per video and these columns: `ID, Series, Status, Idea #, Thesis, Research pack link, Script link, Fact-check status, VO file, Scenes folder, Render link, Thumbnail A/B, Publish date, Platforms, Metricool status, 48h metrics`.

---

## Step-by-step

### 1. Idea selection (weekly, batch) · human, 15 min/week
- Pull the next ideas from `04-video-ideas.md` (⭐ first) into the board.
- Balance series per `02-content-pillars.md` and check the calendar for seasonal hooks (Halloween candy, holiday catalogs).
- **Automatable:** a weekly job that suggests the next 7 ideas based on pillar balance and last week's KPIs (see `11-kpis.md`).

### 2. Research pack · automated, ~5 min of compute
An AI research step (Claude via the API, or a Claude Project with web search) produces a **research pack** per idea:
- Timeline of key events with dates.
- Every number with its **source URL and the date of the figure**.
- Quotes with exact wording and origin.
- A "contested/uncertain" section (myths, disputed accounts).
- A list of living people and current companies mentioned (for the legal check).

**Source priority** (the pack must say which tier each fact came from):
1. Primary: SEC EDGAR filings (10-K, S-1, proxy), annual reports, court records, the company's own newsroom or history pages, patents.
2. Books by participants or respected journalists (e.g. *That Will Never Work*, *Brick by Brick*, *Sneaker Wars*).
3. Major outlets: NYT, WSJ, Bloomberg, Reuters, AP, FT, and local papers of record.
4. Wikipedia **only as a map** to find the sources above. Never cite it.

### 3. Script draft · automated, then ✋ GATE 1 (human, 20 min Short / 90 min long-form)
- The AI drafts the script from the research pack using the series template (`05-scripts/README.md`), including the cartoon scene column.
- **Human edit (Gate 1):** is the thesis sharp? Is there a surprising fact? Does it sound like BrandPros (`01-brand-identity.md` tone rules)? Rewrite the hook and the "Pros know" line yourself. Those two lines are the brand's voice and your strongest originality evidence.
- Word count: 115–150 words for Shorts; ~1,700–2,000 words for 12–13 min long-form.

### 4. Fact-check · ✋ GATE 2 (human-led, 15 min Short / 60–90 min long-form)
A checklist to run on every script:
- [ ] **Every [VERIFY] tag is cleared** with a source link on the fact sheet, or the line is cut or softened.
- [ ] **Two-source rule** for any number or claim that isn't in a primary document.
- [ ] Every figure has a **year or fiscal year** ("in fiscal 2024", not "Costco makes…").
- [ ] **Quotes** match the source word for word, or they're labeled as a paraphrase.
- [ ] **Living people / current companies:** only documented actions; no motives, character judgments or implied wrongdoing; contested claims are attributed ("according to…", "reportedly"); both sides are represented where there's a dispute.
- [ ] **Myths** are labeled as myths or legends ("as the story goes"), never stated as fact.
- [ ] Nothing presents financial *advice* ("buy this stock"). Business history only.
- [ ] Caricature check: no demeaning portrayals, and no speech bubbles with invented quotes from real people.
- [ ] Save the **fact sheet** (sources list) to the board. It becomes the YouTube description's "Sources" section.

**Automation assist:** a second AI pass acts as a "skeptical fact-checker". It re-reads the script against the research pack and flags any sentence without a matching source. The human then decides. It catches most errors, but it never replaces the sign-off.

**Corrections policy:** if a viewer points out an error, pin a correction comment within 24 hours, fix the description, and log it. For long-form, if the error is material, edit it out in YouTube Studio's editor.

### 5. Voiceover · automated, 2–5 min
- **ElevenLabs** (or similar) API with **one consistent licensed voice** for the brand (a stock or designed voice; **never a clone of a real person**). Use a paid tier that includes commercial rights.
- Request **word-level timestamps**; they drive the auto captions and the scene timing in step 7.
- Long-form upgrade (recommended from month 2): hire a human voice actor (Voices.com, Fiverr Pro) at about $100–250 per 12-min script [estimate]. It improves retention and strengthens originality.

### 6. Scene art (cartoons) · automated, 5–15 min compute
- Each row of the "Visual / cartoon scene" column becomes an image prompt: **house style prefix + character sheet reference + scene description** (templates in `12-visual-automation.md`).
- Generate 2 options per scene and auto-pick with a vision check ("does this match the character sheet? any garbled text? any real logo?"). Only flagged scenes go to a human.
- Shorts: 8–15 scenes; long-form: 60–120 scenes plus charts and maps.

### 7. Assembly, motion and captions · automated, 5–10 min render
- A **template-driven video engine** (Remotion, Creatomate or Shotstack; see file 12) places the scenes on the VO timeline and adds:
  - Ken Burns pan/zoom and parallax on every still (no static frames longer than about 3 s),
  - on-screen text from the script's "On-screen text" column,
  - burned-in captions from the word timestamps (Inter Bold, gold keyword highlight),
  - series lower-thirds and color coding, music bed (licensed library) and the sonic logo,
  - optional 3–5 s AI image-to-video shots for 1–2 hero moments per video.
- Output: a 1080×1920 vertical master (Shorts/Reels/TikTok) and 1920×1080 (long-form).

### 8. Thumbnail and cover · automated plus human pick, 10 min
- The thumbnail template (Bannerbear/Placid API or a Figma/Canva template) combines the hero caricature, a 3-word hook and the series tag, generating **2 variants** for YouTube Test & Compare.
- Reel/TikTok cover: the same art as a vertical crop.

### 9. ✋ GATE 3: final watch (human, 5 min Short / 15 min long-form)
Watch it once, at full speed, on a phone. Check: hook lands in 2 s; no misspelled names; no garbled AI text in images; captions synced; no real logos redrawn; audio levels. Then approve.

### 10. Schedule · automated
- On approval, the pipeline creates the posts in **Metricool** for all four networks with the per-platform captions from `07-content-calendar.csv` (via the Metricool API, or through me via the Metricool connector: I can create scheduled posts or send them to review).
- YouTube specifics: title, description with sources and chapters, the Shorts "Related video" link, tags, playlist, end screen (long-form).
- **Upload the master file to each platform**, never a TikTok download with a watermark.

### 11. Post-publish loop · 10 min/day human plus automated report
- First hour: reply to the first 10–20 comments; pin a source or question comment.
- 48 hours: the automated metrics pull goes into the board (views, retention, CTR, shares).
- Weekly: KPI review per `11-kpis.md`.

---

## Time estimates per video

| Step | Short: manual | Short: automated (human time) | Long-form: manual | Long-form: automated (human time) |
|---|---|---|---|---|
| Idea selection | 5 min | 2 min | 15 min | 10 min |
| Research | 45 min | 5 min (skim the pack) | 4–6 h | 45 min |
| Script | 30 min | 20 min (Gate 1) | 3–4 h | 1.5 h |
| Fact-check | 20 min | 15 min (Gate 2) | 1.5 h | 1–1.5 h |
| Voiceover | 15 min | 0 | 1 h | 0 (or book a VO actor) |
| Visuals | 90 min | 5 min (flagged scenes only) | 8–10 h | 1–1.5 h |
| Edit/assembly | 60 min | 0 | 4–6 h | 30 min (tweaks) |
| Thumbnail/cover | 15 min | 3 min | 1 h | 15 min |
| Final watch | 5 min | 5 min (Gate 3) | 15 min | 15 min |
| Scheduling | 10 min | 1 min | 20 min | 5 min |
| **Total** | **~4.5 h** | **~55 min** | **~23–29 h** | **~5–6 h** |

**Weekly load at launch cadence** (7 Shorts plus 1 long-form, automated): about **6.5 h plus 6 h ≈ 12–13 h/week of human time**, plus 1–2 h of comment replies. Batch it: script and fact-check Monday and Tuesday, review renders Wednesday, final watches and scheduling Thursday.

## Suggested tool stack

| Job | Recommended | Alternatives | Notes |
|---|---|---|---|
| Production board | Airtable | Notion, Google Sheets | Airtable automations trigger each pipeline step |
| Research and script drafts | Claude (API or Projects) | — | Research pack plus script template |
| Primary sources | SEC EDGAR full-text search, company IR pages | Newspapers.com, NYT TimesMachine, Internet Archive, Google Books | Budget ~$20/mo for a newspaper archive |
| Voiceover | ElevenLabs (API, commercial tier) | Human VO for long-form | Word-level timestamps |
| Cartoon images | See `12-visual-automation.md` | — | Style reference plus character sheets |
| Assembly | Remotion (code, free for individuals [VERIFY license]) | Creatomate, Shotstack (JSON template APIs) | Fully automatable rendering |
| Manual edit fallback | CapCut / DaVinci Resolve | Premiere Pro | For long-form polish |
| Music | Epidemic Sound | Artlist | Clear your channels in the dashboard to avoid Content ID claims |
| Thumbnails | Bannerbear or Placid (API) | Canva / Figma templates | 2 variants per long-form |
| Scheduling | Metricool | — | Already your hub; America/Chicago |
| Captions QA | Built into the render step | CapCut auto-captions | |

Rough monthly software cost at launch cadence: **$150–$350/month** [estimate; see file 12 for the breakdown].

## Copyright and platform-policy checklist (every video)
- [ ] All visuals are original cartoon art, licensed stock, or public-domain archival. **No clips ripped from TV, ads, movies or other creators.**
- [ ] Real logos: only shown unaltered from official press kits, briefly, in an editorial context. They are never redrawn, animated or used in thumbnails in a way that implies endorsement.
- [ ] Trademarked mascots or characters (Geoffrey, Ronald McDonald, minifigures, Mickey) are **not recreated**. Use generic stand-ins.
- [ ] Music is licensed; no brand jingles.
- [ ] YouTube's altered/synthetic content setting: our clearly cartoon style generally doesn't require the label, but **tick it if any scene could be mistaken for real footage of a real person or event** [VERIFY current YouTube rule when uploading].
- [ ] Sponsor or affiliate: YouTube's "includes paid promotion" box is ticked plus a verbal disclosure; `#ad` or "affiliate link" in captions (FTC).
