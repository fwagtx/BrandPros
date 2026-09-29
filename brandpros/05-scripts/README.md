# 05 — Short-Form Scripts

Ten fully written 45–60 s scripts. Voiceover word counts were measured (spoken pace ≈ 155 words/min).

| ID | Title | Series | Words | Publish (CT) | Long-form link |
|---|---|---|---|---|---|
| S01 | Blockbuster Could've Bought Netflix | $1B Mistake | 144 | Mon Oct 5 | LF01 |
| S02 | Costco's $1.50 Hot Dog Is a Trick | How They Make Money | 135 | Tue Oct 6 | LF02 |
| S05 | The Colonel Sanders Myth | Founder Files | 141 | Wed Oct 7 | — |
| S08 | Adidas vs. Puma | Brand Wars | 130 | Fri Oct 9 | — |
| S10 | Woolworth → Foot Locker | Dead Brands | 144 | Sat Oct 10 | — |
| S09 | McDonald's Is a Landlord | How They Make Money | 128 | Mon Oct 12 | — |
| S04 | Kodak's 1975 Digital Camera | $1B Mistake | 130 | Tue Oct 13 | — |
| S03 | New Coke: 79 Days | Brand Wars | 121 | Fri Oct 16 | — |
| S06 | Toys "R" Us Wasn't Killed by Amazon | Dead Brands | 135 | Mon Oct 19 | LF03 |
| S07 | LEGO's Comeback | The Comeback | 117 | Fri Oct 23 | LF05 |

## How the script files are structured (and why)
- **Metadata table:** series, calendar date, legal flags.
- **Thesis:** the one-sentence point of view. If you can't state it, don't produce the video.
- **Hook (0–3 s):** VO plus on-screen text plus the first visual. All three must land in the first frame.
- **Beats table:** `Voiceover | On-screen text | Visual / cartoon scene`. The **cartoon scene column is written to be turned into image prompts** by the pipeline in `12-visual-automation.md` (prefix it with the house style prompt).
- **CTA:** always a specific question (it drives comments), never a bare "like and subscribe".
- **Fact-check list:** every [VERIFY] must be cleared (or the line cut) before voiceover is generated.

## Template for the other 20 Shorts in the calendar
The calendar includes 8 long-form cutdowns (C01–C08) and 12 idea-list Shorts (I-numbers). Script them with this skeleton (the automation pipeline can draft it; a human edits it):

```markdown
# [ID] — [Title]
| Series | Idea # | Target length | Links to | Calendar | Legal flags |
**Thesis:** [one sentence: what we argue]
## Hook (0–3 s)  VO / On-screen / Visual
## Beats
| # | Time | Voiceover | On-screen text | Visual / cartoon scene |
(4–6 beats; the last is always "Pros know the lesson: …")
## CTA  specific question
## Fact-check before publishing  [VERIFY] list with the source to check
```

Rules: 115–150 spoken words; a new visual every 2–4 s; one number per beat, max; end on a question.
