"""Audio lab: which original music keeps viewers on the daily Item Shop video? (owner, 2026-11-23: "keep changing those
attention grabbing audios around to find the best ones")

Each day's shop reel gets one music *variant* (a style from brand/_shared/video/music.py plus its tempo, opening hook and
lead sound). Three days after a video goes out, the DAY run saves its Metricool numbers and this script scores it.
Variants are rotated so each gets a fair try, the best ones play more often, and every few weeks the weakest is retired
and replaced by a mutation of the best (or a fresh style), so the music keeps changing and keeps improving.

    python3 audio_lab.py pick DAY [--cards N] [--dry]   the variant for DAY's video (records the trial unless --dry); prints JSON
    python3 audio_lab.py score IG.json TT.json YT.json  record Metricool numbers for videos 3+ days old, then evolve; prints the report
    python3 audio_lab.py report                         the table: every variant, its trials and its score

The score of a video is a weighted mix, each part compared with the median of all scored shop videos (1.00 = typical):
  35% Instagram hold (100 - skip rate: viewers still there after 3 s), 25% Instagram watch time / video length,
  10% YouTube watch time / video length (when it has 5+ views), 30% views (TikTok, Instagram, YouTube; log scale).
The old voiced shop videos (before 2026-11-24) are scored too, as the "old-voice" baseline; they are never picked.
"""
import datetime
import hashlib
import json
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.join(HERE, "audio_lab.json")
MIN_TRIALS = 3          # every variant gets this many videos before the scores decide
EVOLVE_AFTER = 4        # scored videos each active variant needs before the weakest can be retired
MAX_ACTIVE = 5
WEIGHTS = {"ig_hold": 0.35, "ig_watch": 0.25, "yt_watch": 0.10, "tt_views": 0.10, "ig_views": 0.10, "yt_views": 0.10}
RANGES = {"bounce": (108, 122), "house": (118, 128), "trap": (136, 148), "phonk": (120, 132), "chip": (122, 132)}
LEADS = {"bounce": ["pluck", "square", "bell"], "house": ["pluck", "square", "bell"], "trap": ["bell", "pluck"], "phonk": ["cowbell"], "chip": ["square", "bell"]}
HOOKS = ["impact", "stutter", "arp"]
START = [  # the first five: one of each style, each with a different opening
    ("bounce-a", {"style": "bounce", "bpm": 116, "hook": "impact"}),
    ("house-a", {"style": "house", "bpm": 124, "hook": "stutter"}),
    ("trap-a", {"style": "trap", "bpm": 140, "hook": "arp"}),
    ("phonk-a", {"style": "phonk", "bpm": 126, "hook": "impact"}),
    ("chip-a", {"style": "chip", "bpm": 128, "hook": "arp"}),
]


def h(s):
    return int(hashlib.sha1(s.encode()).hexdigest(), 16)


def load():
    if os.path.exists(STATE):
        return json.load(open(STATE))
    born = "2026-11-24"
    return {"variants": {k: {**v, "born": born, "active": True, "parent": None} for k, v in START}, "trials": [], "evolutions": []}


def save(st):
    json.dump(st, open(STATE, "w"), indent=1, ensure_ascii=False)


def card_beats(bpm):
    return 12 if bpm >= 134 else 8                         # fast styles get longer cards so the stickers stay readable


def duration(bpm, cards):
    return round((8 + card_beats(bpm) * cards + 8 + 12) * 60 / bpm, 2)


# ---------------- scoring ----------------
def components(m):
    c = {}
    dur = m.get("duration") or 0
    if m.get("ig_skip") is not None:
        c["ig_hold"] = 100 - m["ig_skip"]
    if m.get("ig_avg") is not None and dur:
        c["ig_watch"] = m["ig_avg"] / dur
    if m.get("yt_avg") is not None and (m.get("yt_views") or 0) >= 5 and dur:
        c["yt_watch"] = m["yt_avg"] / dur
    for net in ("tt", "ig", "yt"):
        if m.get(f"{net}_views") is not None:
            c[f"{net}_views"] = math.log1p(m[f"{net}_views"])
    return c


def scores(st):
    """Score every measured trial against the medians of all measured trials."""
    rows = [(t, components(t["metrics"])) for t in st["trials"] if t.get("metrics")]
    med = {}
    for k in WEIGHTS:
        vals = sorted(c[k] for _, c in rows if k in c)
        if vals:
            m = vals[len(vals) // 2] if len(vals) % 2 else (vals[len(vals) // 2 - 1] + vals[len(vals) // 2]) / 2
            med[k] = m if m > 0 else None
    out = {}
    for t, c in rows:
        num = den = 0.0
        for k, w in WEIGHTS.items():
            if k in c and med.get(k):
                num += w * c[k] / med[k]
                den += w
        if den >= 0.3:                                     # needs at least Instagram or most of the views to count
            out[t["day"]] = round(num / den, 3)
    return out


def stats(st):
    sc = scores(st)
    s = {}
    for t in st["trials"]:
        v = s.setdefault(t["variant"], {"trials": 0, "scored": []})
        v["trials"] += 1
        if t["day"] in sc:
            v["scored"].append(sc[t["day"]])
    for v in s.values():
        v["mean"] = round(sum(v["scored"]) / len(v["scored"]), 3) if v["scored"] else None
    return s


# ---------------- picking ----------------
def pick(day, cards=6, dry=False):
    st = load()
    for t in st["trials"]:
        if t["day"] == day and t["variant"] in st["variants"]:
            return spec_of(st, t)                           # a rebuild of the same day keeps its music
    active = [k for k, v in st["variants"].items() if v["active"]]
    s = stats(st)
    n = lambda k: s.get(k, {}).get("trials", 0)
    recent = [t["variant"] for t in sorted(st["trials"], key=lambda t: t["day"]) if t["day"] < day][-2:]
    seed = h(day) % 100000
    fresh = [k for k in active if n(k) < MIN_TRIALS]
    if fresh:                                               # everyone gets a fair try first
        least = min(n(k) for k in fresh)
        pool = [k for k in fresh if n(k) == least and (not recent or k != recent[-1])] or [k for k in fresh if n(k) == least]
        choice = sorted(pool, key=lambda k: h(day + k))[0]
    elif datetime.date.fromisoformat(day).toordinal() % 7 == 0:
        choice = min(active, key=lambda k: (len(s.get(k, {}).get("scored", [])), h(day + k)))   # weekly exploration
    else:                                                   # best so far, with a bonus for being less tested (UCB)
        def ucb(k):
            sc = s.get(k, {}).get("scored", [])
            return (sum(sc) / len(sc) if sc else 1.0) + 0.15 / math.sqrt(len(sc) + 1)
        ranked = sorted(active, key=lambda k: (-ucb(k), h(day + k)))
        choice = ranked[0]
        if len(recent) == 2 and recent[0] == recent[1] == choice and len(ranked) > 1:
            choice = ranked[1]                              # never three days running: the feed rewards variety
    v = st["variants"][choice]
    t = {"day": day, "variant": choice, "seed": seed, "duration": duration(v["bpm"], cards), "metrics": None}
    if not dry:
        st["trials"].append(t)
        save(st)
    return spec_of(st, t)


def spec_of(st, t):
    v = st["variants"][t["variant"]]
    spec = {k: v[k] for k in ("style", "bpm", "hook", "lead", "swing") if k in v}
    return {**spec, "seed": t["seed"], "card": card_beats(v["bpm"]), "variant": t["variant"]}


# ---------------- evolving ----------------
def evolve(st, today):
    s = stats(st)
    active = [k for k, v in st["variants"].items() if v["active"]]
    ready = [k for k in active if len(s.get(k, {}).get("scored", [])) >= EVOLVE_AFTER]
    if len(ready) < len(active) or len(active) < 3:
        return None
    best = max(active, key=lambda k: s[k]["mean"])
    worst = min(active, key=lambda k: s[k]["mean"])
    if s[best]["mean"] - s[worst]["mean"] < 0.05:
        return None                                         # too close to call: keep testing
    st["variants"][worst]["active"] = False
    st["variants"][worst]["retired"] = today
    r = h(today)
    used = {v["style"] for k, v in st["variants"].items() if v["active"]}
    if len(st.get("evolutions", [])) % 2 == 0:              # a mutation of the best
        parent = st["variants"][best]
        child = {k: parent[k] for k in ("style", "bpm", "hook", "lead", "swing") if k in parent}
        what = ["bpm", "hook", "lead", "swing"][r % 4]
        lo, hi = RANGES[child["style"]]
        if what == "bpm":
            child["bpm"] = min(hi, max(lo, child["bpm"] + [-6, -4, 4, 6][(r >> 3) % 4]))
        elif what == "hook":
            child["hook"] = [x for x in HOOKS if x != child.get("hook")][(r >> 3) % 2]
        elif what == "lead" and len(LEADS[child["style"]]) > 1:
            cur = child.get("lead", LEADS[child["style"]][0])
            child["lead"] = [x for x in LEADS[child["style"]] if x != cur][(r >> 3) % (len(LEADS[child["style"]]) - 1)]
        else:
            child["swing"] = [0.0, 0.012, 0.025][((r >> 3) % 3)]
        name, how = child["style"], f"mutation of {best} ({what})"
    else:                                                   # a fresh take on a style that isn't playing now
        styles = [x for x in RANGES if x not in used] or list(RANGES)
        name = styles[r % len(styles)]
        lo, hi = RANGES[name]
        child = {"style": name, "bpm": lo + (r >> 4) % (hi - lo + 1), "hook": HOOKS[(r >> 8) % 3], "lead": LEADS[name][(r >> 10) % len(LEADS[name])]}
        how = f"new {name} variant"
    letters = "abcdefghijklmnopqrstuvwxyz"
    n = sum(1 for k in st["variants"] if k.startswith(name + "-"))
    cid = f"{name}-{letters[n % 26]}{'' if n < 26 else n // 26}"
    st["variants"][cid] = {**child, "born": today, "active": True, "parent": best if "mutation" in how else None}
    ev = {"day": today, "retired": worst, "retired_mean": s[worst]["mean"], "best": best, "best_mean": s[best]["mean"], "added": cid, "how": how}
    st.setdefault("evolutions", []).append(ev)
    return ev


# ---------------- Metricool numbers ----------------
def rows(path):
    d = json.load(open(path))
    return d.get("rows", d) if isinstance(d, dict) else d


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def score_cmd(ig, tt, yt):
    st = load()
    today = datetime.datetime.now(datetime.timezone.utc).date()
    known = {t["day"]: t for t in st["trials"]}
    # match each network's posts to a shop day by its caption or title (new reel and old voiced format)
    found = {}
    def put(day, key, val):
        if val is not None:
            cur = found.setdefault(day, {})
            if key.endswith("_views"):
                cur[key] = max(cur.get(key) or 0, val)
            else:
                cur[key] = val
    def day_from_text(text):
        m = re.search(r"[Tt]oday's (?:Fortnite )?Item Shop for ([A-Z][a-z]+) (\d{1,2})\b", text or "")
        return (m.group(1), int(m.group(2))) if m else None
    def iso(month, d, posted):
        p = str(posted)
        when = datetime.date(int(p[:4]), int(p[4:6]), int(p[6:8]))
        for yy in (when.year, when.year + 1, when.year - 1):
            for fmt in ("%B %d %Y", "%b %d %Y"):
                try:
                    dt = datetime.datetime.strptime(f"{month} {d} {yy}", fmt).date()
                except ValueError:
                    continue
                if abs((dt - when).days) <= 3:
                    return dt.isoformat()
        return None
    for r in rows(ig):                                      # [IGRE02 date, IGRE03 text, IGRE23 views, IGRE24 avg watch, IGRE28 view rate, IGRE30 skip rate]
        md = day_from_text(r[1])
        if md and (d := iso(*md, r[0])):
            put(d, "ig_views", num(r[2])); put(d, "ig_avg", num(r[3])); put(d, "ig_skip", num(r[5]))
    for r in rows(tt):                                      # [TKPO02 date, TKPO05 text, TKPO06 duration, TKPO07 views]
        md = day_from_text(r[1])
        if md and (d := iso(*md, r[0])):
            put(d, "tt_views", num(r[3])); put(d, "duration_tt", num(r[2]))
    for r in rows(yt):                                      # [YTVP02 date, YTVP17 title, YTVP06 views, YTVP08 avg view duration]
        m = re.search(r"Fortnite Item Shop \(?([A-Z][a-z]{2}) (\d{1,2})\b", r[1] or "")
        if m and (d := iso(m.group(1), int(m.group(2)), r[0])):
            put(d, "yt_views", num(r[2])); put(d, "yt_avg", num(r[3]))
    done = []
    for day, m in sorted(found.items()):
        if (today - datetime.date.fromisoformat(day)).days < 3:
            continue                                        # too fresh: the numbers are still climbing
        t = known.get(day)
        if t is None:
            if day >= "2026-11-24":
                continue                                    # a reel day the lab didn't pick (a test or a manual build)
            t = {"day": day, "variant": "old-voice", "seed": None, "duration": m.get("duration_tt"), "metrics": None}
            st["trials"].append(t); known[day] = t
        if t.get("metrics") and t["metrics"].get("final"):
            continue
        t["metrics"] = {**m, "duration": t.get("duration") or m.get("duration_tt"), "final": True, "saved": today.isoformat()}
        done.append(day)
    st["variants"].setdefault("old-voice", {"style": "voice", "bpm": None, "hook": "voice", "born": "2026-10-28", "active": False, "parent": None,
                                            "note": "the voiced shop video before 2026-11-24 (baseline)"})
    ev = evolve(st, today.isoformat())
    save(st)
    print(f"recorded {len(done)} video(s): {', '.join(done) or 'none'}")
    if ev:
        print(f"EVOLVED: retired {ev['retired']} ({ev['retired_mean']}), added {ev['added']} ({ev['how']}); best is {ev['best']} ({ev['best_mean']})")
    report(st)


def report(st=None):
    st = st or load()
    s = stats(st)
    print(f"{'variant':10} {'style':7} {'bpm':>4} {'hook':8} {'lead':8} {'videos':>6} {'scored':>6} {'score':>6}  status")
    order = sorted(st["variants"], key=lambda k: (-(s.get(k, {}).get("mean") or 0)))
    for k in order:
        v = st["variants"][k]
        x = s.get(k, {"trials": 0, "scored": [], "mean": None})
        lead = v.get("lead") or {"bounce": "pluck", "house": "pluck", "trap": "bell", "phonk": "cowbell", "chip": "square"}.get(v["style"], "-")
        status = "active" if v["active"] else ("baseline" if k == "old-voice" else f"retired {v.get('retired', '')}")
        print(f"{k:10} {v['style']:7} {str(v.get('bpm') or '-'):>4} {v.get('hook', '-'):8} {lead:8} {x['trials']:>6} {len(x['scored']):>6} "
              f"{(str(x['mean']) if x['mean'] is not None else '-'):>6}  {status}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == "pick":
        cards = int(a[a.index("--cards") + 1]) if "--cards" in a else 6
        print(json.dumps(pick(a[1], cards, dry="--dry" in a)))
    elif a[0] == "score":
        score_cmd(a[1], a[2], a[3])
    elif a[0] == "report":
        report()
    else:
        sys.exit(__doc__)
