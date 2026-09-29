# BrandPros: Launch Plan

**Every brand has a backstory.** BrandPros is the fifth brand in your faceless network (alongside historypros, financeprostv, streak.pros and Creator Code Bad). It tells the stories behind companies and brands in an illustrated cartoon style, across Facebook, Instagram, TikTok and YouTube, managed in Metricool (America/Chicago).

**Launch window covered:** Mon **Oct 5, 2026** → Tue **Nov 3, 2026** (30 days).

---

## Assumptions (read first)

1. **Launch date:** Monday, Oct 5, 2026 (six days from when this plan was written) to leave a week to set up accounts, the style and the pipeline. To shift it, edit the dates in `automation/build_calendar.py` and re-run it.
2. **Handles:** `@brandpros` is assumed in captions. **Availability was not checked.** Backups are in `01-brand-identity.md`; find-and-replace in the CSV if you use one.
3. **Posting times** are based on **real Metricool best-time data pulled from your historypros brand** (Sep 21–27, 2026) as the closest proxy audience. BrandPros isn't in Metricool yet, so re-pull after 4 weeks.
4. **Cadence:** 1 Short per day (posted natively to all 4 platforms), 1 YouTube long-form per week (Thursdays), Facebook native long-form 2 days later, 3 Facebook engagement posts per week, 1 Instagram carousel per week. This assumes the semi-automated pipeline in files 08 and 12. Without automation, expect ~25 h/week.
5. **Voice:** one consistent licensed AI voice (never a clone of a real person) to start; a human voice actor for long-form is recommended from month 2.
6. **Visuals:** a hand-inked, paper-textured cartoon style under **The Slice** logo (lowercase "brandpros" whose o is a pie chart with a tangerine slice pulled out; ink, white and tangerine). Historical founders are drawn as recognizable caricatures from an approved cast; living people are generic characters; no company's logo, mascot or brand colors are ever drawn. Details are in `brand-kit/` and `12-visual-automation.md`.
7. **Automation level:** "as automated as possible" is interpreted as a full pipeline with **three short human checkpoints** (script POV, fact sign-off, final watch). That's about 45–55 min per Short. Fully hands-off production would put YouTube monetization at risk under its inauthentic-content policy.
8. **Audience** is mostly U.S.-based (this affects RPM estimates and posting times).
9. **Platform rules and thresholds** (YPP, TikTok Creator Rewards, Facebook Content Monetization) are stated as last published and marked **[VERIFY]**. Check them before relying on them.
10. **All statistics marked [VERIFY]** must be confirmed against primary sources before publishing. Numbers in captions are pulled from the scripts, and each calendar row has a `fact_check_before_posting` column.
11. **Revenue figures** are planning scenarios (conservative / base / upside), not predictions.
12. **Budget:** about $150–$350/month for software and APIs at launch cadence (estimate).
13. This plan is practical guidance, **not legal advice**. For sponsor contracts, merch using any real-brand reference, or a takedown/complaint, talk to a lawyer.

---

## What's in the folder

| File | What it's for | Use it when… |
|---|---|---|
| `01-brand-identity.md` | Positioning, tone rules, taglines, handles plus backups, **character-counted bios**, colors, fonts, thumbnail style, logo and mascot ("The Pro") | Setting up accounts; briefing a designer |
| `02-content-pillars.md` | 6 series (The $1B Mistake, Dead Brands, How They Make Money, The Comeback, Founder Files, Brand Wars), each with format rules | Writing any script |
| `03-platform-strategy.md` | Per-platform length, format, hooks, captions, hashtags, frequency, **best times in CT** | Scheduling; writing captions |
| `04-video-ideas.md` | **100 ideas** with hooks, grouped by series; **Top 20 flagged ⭐** | Weekly idea selection |
| `05-scripts/` | **10 fully written Shorts** (S01–S10) plus a template for the rest | Production, weeks 1–3 |
| `06-longform-outlines/` | **5 long-form outlines** (Blockbuster, Costco, Toys "R" Us, Sears, LEGO) with timestamps, titles, thumbnails and scripted cold opens | Long-form production |
| `07-content-calendar.csv` | **145 posts** over 30 days: per-platform captions, hashtags, times, script links, fact-check notes | Loading Metricool |
| `08-production-workflow.md` | Research → script → fact-check → VO → art → edit → schedule, with **time estimates** and the three human gates | Running production |
| `09-monetization.md` | YPP math, creator programs, sponsor categories, **outreach email**, affiliates, **6-month revenue roadmap** | Month 2 onward |
| `10-cross-promotion.md` | Specific historypros and financeprostv collabs plus a 30-day schedule | Weekly planning |
| `11-kpis.md` | Weekly scorecard, month 1/3/6 targets, **underperformance playbook** | Every Monday |
| `12-visual-automation.md` | Cartoon house-style prompts, character sheets, likeness rules, **automation architecture**, tool bake-off, costs, build roadmap | Setting up the pipeline |
| `brand-kit/` | **Logo (The Slice), wordmark, mascot, Founder Files cast, colors, fonts, thumbnails, banner, and the render engine** that produced the S01 preview video | Designing anything; making videos |
| `automation/build_calendar.py` | Regenerates the calendar CSV after you change dates or captions | Editing the calendar |

---

## How to import the calendar into Metricool

`07-content-calendar.csv` has one row **per post per platform** (so each network gets its own native caption). Columns:

`date, day, time_ct, platform, format, post_id, pillar, title, caption, hashtags, caption_with_hashtags, linked_script, link_note, fact_check_before_posting, status`

- Dates are `YYYY-MM-DD`, times are 24-hour **America/Chicago**, UTF-8 encoded (emoji included).
- **`caption_with_hashtags`** is the ready-to-paste text.

**Option A: Metricool bulk CSV import.** Metricool's planner supports CSV import with **its own template** (download it from the Planner's import option; menu names change, so [VERIFY] the current location). Copy `date`, `time_ct` and `caption_with_hashtags` into the template's date, time and text columns, and set the network flag from our `platform` column. Filter our CSV by platform in Google Sheets to make this quick. Then attach each rendered video file in the planner.

**Option B: let me do it.** Once the BrandPros brand is connected in Metricool, I can create the scheduled posts (or send them for review first) directly through the Metricool connector, one per row, using these captions and times. You'd just attach the video files.

**Option C: manual.** Sort by date and copy each caption into the planner. It takes about 2 hours for 30 days.

Before any post goes live, check that its `fact_check_before_posting` items are cleared.

---

## Do this first (week 0: Sep 30 → Oct 4)

1. **Lock the handles** (day 1): check `@brandpros` on all four platforms the same day and claim the best set (`01-brand-identity.md`). Create the Facebook Page, IG professional account, TikTok business/creator account and YouTube channel; paste the bios.
2. **Add BrandPros as a brand in Metricool** and connect all four networks.
3. **Lock the look:** logo, The Pro mascot, and character sheets for the first 10 people (`12-visual-automation.md` A3–A4). Run the image-API bake-off on 10 scenes.
4. **Fact-check and produce S01, S02, S05, S08 and S10** (the first week's scripted Shorts), and clear their [VERIFY] items. Start the LF01 Blockbuster research pack now, since it publishes Oct 8.
5. **Load week 1 into Metricool** (Oct 5–11).
6. **Tell your other brands' audiences:** one-time cross-promo post on historypros and financeprostv on Oct 5 (`10-cross-promotion.md`).

Then keep a rolling ~7-day buffer of finished Shorts, and follow the Monday KPI review in `11-kpis.md`.
