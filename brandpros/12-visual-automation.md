# 12 — Cartoon Visuals and the Automation Pipeline

This file covers two things you asked for: **cartoon graphics of every person and brand we cover**, and **automating as much of production as possible** while staying informative, light and fun.

---

## Part A: The cartoon system

### A1. Recognizable founders, drawn safely
Viewers should recognize Colonel Sanders or Walt Disney at a glance. We get there with **faithful caricature**: the right face shape, hairline, facial hair, glasses, era clothing and signature props, drawn in the BrandPros house style. The Founder Files cast (`brand-kit/exports/founders/`, `cast.png`) is the approved starting set. Each character is drawn once, approved, and reused in every video.

We stay stylized rather than photorealistic because:
1. **Platform rules.** YouTube, TikTok and Meta require labels on *realistic* AI depictions of real people. A clearly hand-drawn style never risks being mistaken for real footage.
2. **Likeness and defamation risk.** A realistic image of a living person in a scene they weren't in reads as a factual claim.
3. **Consistency.** One house style across hundreds of videos is what makes the channel recognizable and original.

*(Practical guidance, not legal advice. For ads, merch or sponsor segments, ask a lawyer.)*

**Getting likenesses even closer (recommended for the highest quality):**
- For each founder, collect 3–5 public-domain or licensed reference portraits (Library of Congress, Wikimedia Commons with license checked, company archives/press kits).
- Commission a caricature illustrator for the character sheets (typically $50–$200 per character [estimate]), or generate candidates with an image model **using the reference photos plus the house style**, then have a human pick and fix the best one.
- Approve each sheet once against the references (face shape, hairline, facial hair, glasses, age for the era of the story), then reuse it everywhere.
- The code-drawn cast in `brand-kit/` was built from each founder's documented signature look, without photo references (Wikipedia is blocked by this session's network settings). Treat it as the style guide and first draft of each sheet.

### A2. Likeness rules

| Subject | Allowed | Not allowed |
|---|---|---|
| **Deceased historical founders** (Sanders, Disney, Woolworth, the Dassler brothers, Kroc, Hershey, Ford, Sears, Madam C.J. Walker) | Faithful, affectionate caricature from the approved cast, era-accurate | Mocking real tragedies; invented quotes in speech bubbles |
| **Living people** (Reed Hastings, Marc Randolph, current CEOs) | **Generic characters**, named in the voiceover | Recognizable depictions in scenes; any use in thumbnails, ads, merch or sponsor reads |
| **Private individuals** (employees, customers) | Generic anonymous characters | Recognizable depictions |
| **Brands** | Generic cartoon stores and products, identified by **handwritten labels**; official logos only if needed, overlaid unaltered in the edit | AI-drawn or altered logos; **the brand's trade-dress colors** (no blue-and-yellow video store, no red Netflix-style envelopes, no red-and-yellow burger joint); **a company's name set in its own colors**; trademarked mascots (Geoffrey, Ronald, Mickey, minifigures) |

### A3. House style prompt (prefix every image prompt with this)
```
BrandPros house style: hand-inked 2D editorial cartoon, slightly wobbly ink outlines (#17150F),
flat fills with halftone-dot shading, visible paper grain, limited palette of ledger green #133A2C,
certificate cream #F2EAD7, seal red #C8372D, mint #8FD1AE, brass #C49A3A, slate #5E6B73,
muted paper backgrounds (no gradients, no sunbursts), vertical 9:16 composition with the subject in the upper
two-thirds (keep the bottom 25% calm for captions). No text, no letters, no logos, no brand colors of real companies,
no watermarks, not photorealistic, not glossy vector.
```
For long-form, swap the composition to `horizontal 16:9`. For Dead Brands "glory days" scenes, append `faded sepia print`.

**Negative prompt / exclusions:** `photorealistic, 3D render, glossy vector, gradient, sunburst, text, letters, logo, brand name, trade dress, watermark, extra fingers, distorted face, gore`.

### A4. Character sheets
Every recurring person gets a **character sheet**, approved once and reused as the **reference image** for every scene.

```
[HOUSE STYLE PREFIX]
Character sheet of [NAME, as they looked in YEAR], matching the attached reference portraits:
[FACE SHAPE], [HAIRLINE AND HAIR], [FACIAL HAIR], [GLASSES], [ERA CLOTHING], [SIGNATURE PROP],
front and three-quarter views plus 4 expressions (warm, shocked, thinking, determined), plain cream paper background.
```

**The approved cast (in `brand-kit/exports/founders/`):**

| Character | Signature look | Used in |
|---|---|---|
| **The Pro** (mascot) | Face is the BrandPros seal (engraved ledger-green ring, cream face), ledger-green blazer, red tie, brass keyhole lapel pin, white gloves | Every video |
| Colonel Harland Sanders | White suit, black string tie, thick black frames, swept-back white hair, white mustache and goatee, cane | S05 |
| Walt Disney | Long face, side-parted dark hair with a wave, pencil mustache, arched brows, easy grin, pencil | I-73 |
| Frank W. Woolworth | Heavy walrus mustache, balding crown, round face, three-piece suit, watch chain, a nickel | S10 |
| Adi Dassler | Round face, combed-back dark hair, soft smile, cardigan, a spiked shoe | S08 |
| Rudolf Dassler | Narrow face, glossy slicked-back hair, sharp suit, pocket square, stopwatch | S08 |
| Ray Kroc | Long face, slicked-back hair, big salesman's grin, milkshake cup | S09 |
| Milton S. Hershey | White walrus mustache, receding white hair, vest and bow tie, chocolate bar | I-50 |
| Henry Ford | Lean long face, gray side part, prominent ears, high collar, clean-shaven, wrench | I-74 |
| Richard W. Sears | 1890s part, thick dark mustache, high collar, pocket watch | LF04 |
| Madam C.J. Walker | Hair swept up high, lace high collar, pearls, poised half-smile, hair-care jar | Idea #76 |

**Generic characters (never likenesses):** the Netflix co-founders, the 2000/2007 Blockbuster executives, Costco leadership, Steve Sasson, Jørgen Vig Knudstorp, and any other living person.

**Brand "characters":** generic stores and products in the BrandPros palette, identified by handwritten labels (e.g. a slate strip-mall store with a cream "VIDEO" board and a striped awning). Keep one sheet per recurring store.

### A5. Scene prompt template
```
[HOUSE STYLE PREFIX]
Scene: [the "Visual / cartoon scene" text from the script beat].
Characters: [cast name] matching the attached character sheet, [expression]; [generic characters].
Setting: [place], [year/era details].
Camera: [close-up | medium | wide], [angle].
Mood: [tense seal-red accents for $1B Mistake / faded sepia for Dead Brands / warm brass for How They Make Money / fresh mint for The Comeback / ledger green for Founder Files / red-vs-slate for Brand Wars].
```

### A6. Motion: hand-made, not template-y
- **Line boil:** 3 slightly different ink drawings of every frame, swapped 8 times a second.
- **Motion on twos:** 12 frames per second for all movement; slow camera pushes (3–5%).
- **Cut-paper labels** slap on with a 1-frame overshoot; **stamps** land in 2 frames. No springy easing, no white flashes, no sunbursts.
- **Handwritten notes and arrows** point out who's who and cite sources on screen.
- Charts, maps, cheques and timelines are built as templates in the engine, so the numbers are always exactly right.

---

## Part B: The automation pipeline

### B1. Architecture
```
 Airtable production board  (one row per video; the Status column drives everything)
        │  status = "Approved idea"
        ▼
 Orchestrator (n8n or Make, or a small Python worker on a schedule)
        ├─► Claude API: research pack → script draft (series template) ─► ✋ GATE 1 (human edits the script)
        ├─► Claude API: skeptical fact-check pass ─────────────────────► ✋ GATE 2 (human signs off facts)
        ├─► ElevenLabs API: voiceover plus word timestamps
        ├─► Image API: scene prompts (house style + character sheets) → 2 options each → vision QC
        ├─► Render engine (Remotion or Creatomate): scenes + VO + captions + charts + music
        │        → vertical master (Shorts) / horizontal master (long-form)
        ├─► Thumbnail API (Bannerbear/Placid): 2 variants
        ├─► Google Drive: every asset saved in /BrandPros/<ID>/ ───────► ✋ GATE 3 (final phone watch)
        └─► Metricool: scheduled posts ×4 networks with per-platform captions from 07-content-calendar.csv
                 ▲
 Weekly job: Metricool analytics → KPI sheet → suggested next ideas (11-kpis.md rules)
```

### B2. Tool options for the cartoon images

| Option | Consistency method | Automatable via API? | Notes |
|---|---|---|---|
| **Google Gemini image models** | Multiple reference images per prompt | ✅ | Strong at keeping a character consistent across scenes [VERIFY current model and pricing] |
| **OpenAI image API** | Reference image input and editing | ✅ | Good prompt-following; reliable text-free scenes [VERIFY] |
| **FLUX (via Replicate or fal)** | **Train a style LoRA** on ~20–30 approved BrandPros images plus reference-based editing models | ✅ | The most "locked" house style once trained; cheapest at volume [VERIFY] |
| Midjourney | Style and character references | ⚠️ No official public API | Great aesthetics, so use it to *design* the style and the first character sheets, then generate at scale with an API option |

**Recommendation:** in **week 0**, run a bake-off. Generate the same 10 scenes (from S01, S05, S10) with each API option, using the style prefix plus 3 character sheets. Pick the winner on consistency, zero garbled text, and cost. Then optionally train a FLUX style LoRA on your approved images to lock the look permanently.

### B3. Render engine options

| Option | Pros | Cons |
|---|---|---|
| **Remotion** (React/code) | Full control, templates in code, runs locally or in the cloud; captions and charts programmatically | Needs a developer (I can build the templates) [VERIFY license terms for your use] |
| **Creatomate** / **Shotstack** | JSON templates via API, a visual template editor, no code | Per-render pricing; less flexible |
| CapCut (manual) | Fast, familiar | Not automatable; use it as a fallback and for long-form polish |

### B4. Cost estimate (launch cadence: 30 Shorts plus 4–5 long-forms per month) [estimates; VERIFY current pricing]

| Item | Per Short | Per long-form | Monthly |
|---|---|---|---|
| Claude API (research, script, fact-check pass) | $0.20–$0.60 | $2–$5 | ~$15–$40 |
| Voiceover (ElevenLabs commercial tier) | — | — | $22–$99 subscription |
| Images (12 scenes × 2 options Short; ~90 × 2 long-form) | $0.50–$2 | $5–$15 | ~$40–$100 |
| AI image-to-video hero shots (optional) | $0.50–$1 | $2–$5 | ~$20–$50 |
| Render (Creatomate) or Remotion cloud | $0.10–$0.50 | $1–$3 | ~$0–$50 (plan-dependent) |
| Airtable, orchestrator, thumbnail API | — | — | ~$40–$100 |
| Music library | — | — | ~$10–$20 |
| **Total** | **~$1.50–$4** | **~$10–$30** | **~$150–$350/month** |

### B5. What stays human (and why)

| Gate | Time | Why it can't be skipped |
|---|---|---|
| Gate 1: script POV edit | ~20 min Short | The thesis, hook and "Pros know" lines are the originality YouTube's policy looks for |
| Gate 2: fact sign-off | ~15 min Short | Legal safety with real companies and people; credibility |
| Gate 3: final watch | ~5 min Short | Catches garbled AI text, off-model characters and accidental logos |

Total: about **45–55 minutes of human time per Short**, down from roughly 4.5 hours manual (see `08-production-workflow.md`).

### B6. Build roadmap

| Week | Deliverable |
|---|---|
| **Week 0** (before Oct 5) | Logo and The Pro mascot finalized; image-API bake-off; character sheets for the first 10 people; Airtable board set up |
| **Week 1** (Oct 5–11) | *Semi-automated:* scripts → auto-generated scene prompts → batch images; assemble in CapCut manually; schedule via Metricool |
| **Weeks 2–3** | Automated VO plus captions; render templates (Remotion or Creatomate) for Shorts; auto-save to Google Drive |
| **Week 4** | Long-form render template (chapters, charts, maps); automatic Metricool scheduling and the weekly KPI pull |
| **Month 2** | Style LoRA trained on approved art; vision QC auto-rejects off-model scenes; human time per Short ≈ 45 min |

### B7. Transparency
Add one line to every YouTube description and bio: *"Illustrations are created with AI-assisted tools in the BrandPros house style. All stories are researched from the sources listed."* It's honest, it builds trust, and it's consistent with platform labeling expectations. Tick an AI label on any platform where a scene could be mistaken for real footage [VERIFY each platform's current rule].
