"""Original beat-synced music and sound effects for BAD channel reels, synthesized from scratch with numpy
(no samples, no loops from anywhere, nothing taken from any game or song).

A scene asks for it with window.SCENE.music = {"style": "bounce"|"house"|"trap"|"phonk"|"chip", "bpm": 116, "seed": 123, "hook": "impact"|"stutter"|"arp",
"t0": 0, "sections": [[t, "intro"|"main"|"grid"|"break"|"end"], ...]} (optional overrides: lead, chords, hats, bass, swing)
and its cues ([[t, name], ...]) name effects from FX below. render.mjs passes both to mix.py, which calls render().

The style sets the genre (drums, bass, chords, lead); each day's seed picks the key, the chord loop and the melody, so no two days
sound the same. brand/badroyale/shop/audio_lab.py decides which style each day's shop video gets.
"""
import math
import wave

import numpy as np

SR = 48000
NOTE = lambda m: 440.0 * 2 ** ((m - 69) / 12)


def env(n, a=0.002, d=0.2, s=0.0, r=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * (s + (1 - s) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4)))
    if r:
        e *= np.clip((n / SR - t) / r, 0, 1)
    return e


def lp(x, cut):
    """Brick-ish low-pass via FFT with a soft knee (fine for short one-shots and whole stems)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cut) ** 4)
    return np.fft.irfft(X, len(x))


def hp(x, cut):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (cut / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X, len(x))


def saw(f, n, harm=24, bright=1.0, decay=None, phase=0.0):
    """Band-limited saw by additive synthesis; with decay, high harmonics die faster (a pluck)."""
    t = np.arange(n) / SR
    out = np.zeros(n)
    for h in range(1, harm + 1):
        if f * h > 16000:
            break
        a = 1 / h
        if decay is not None:
            a = a * np.exp(-t * (decay[0] + decay[1] * (h - 1) / bright))
        out += a * np.sin(2 * math.pi * f * h * t + phase * h)
    return out


# ---------------- drums ----------------
def kick(rng):
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t / 0.035)
    body = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2)
    click = hp(rng.standard_normal(n) * np.exp(-t / 0.004), 2500) * 0.35
    return np.tanh(1.6 * (body + click)) * 0.95


def clap(rng):
    n = int(0.3 * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    e = sum(np.exp(-np.maximum(0, t - d) / 0.008) * (t >= d) for d in (0, 0.011, 0.022)) * 0.5 + np.exp(-np.maximum(0, t - 0.03) / 0.09) * (t >= 0.03)
    x = hp(lp(noise * e, 6000), 900)
    tone = np.sin(2 * math.pi * 190 * t) * np.exp(-t / 0.05) * 0.4
    return (x / np.abs(x).max() + tone) * 0.55


def hat(rng, open_=False):
    n = int((0.22 if open_ else 0.05) * SR); t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 7500) * np.exp(-t / (0.07 if open_ else 0.012))
    return x / np.abs(x).max() * 0.3


def place(buf, clip, t, gain=1.0):
    i = int(round(t * SR))
    if i >= len(buf) or i + len(clip) <= 0:
        return
    j0 = max(0, -i); i = max(0, i)
    m = min(len(buf) - i, len(clip) - j0)
    buf[i:i + m] += clip[j0:j0 + m] * gain


# ---------------- effects (FX cues) ----------------
def fx_whoosh(rng, d=0.32, up=True):
    n = int(d * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    out = np.zeros(n); w = 2048
    win = np.hanning(w)
    for i in range(0, n - w, w // 4):
        p = i / n
        c = 600 * (12 ** (p if up else 1 - p))
        seg = lp(hp(x[i:i + w] * win, c * 0.5), c * 2)
        out[i:i + w] += seg
    e = np.sin(np.clip(t / d, 0, 1) * math.pi) ** 1.5
    out = out * e
    return out / (np.abs(out).max() + 1e-9) * 0.5


def fx_pop(rng):
    n = int(0.09 * SR); t = np.arange(n) / SR
    f = 420 + 900 * (1 - np.exp(-t / 0.02))
    x = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03)
    return x * 0.45


def fx_tick(rng):
    n = int(0.018 * SR); t = np.arange(n) / SR
    return np.sin(2 * math.pi * 2600 * t) * np.exp(-t / 0.004) * 0.28


def fx_coin(rng):
    out = np.zeros(int(0.5 * SR))
    for k, (m, t0, dur) in enumerate(((95, 0.0, 0.07), (100, 0.065, 0.42))):
        n = int(dur * SR); t = np.arange(n) / SR
        f = NOTE(m)
        x = (np.sign(np.sin(2 * math.pi * f * t)) * 0.25 + np.sin(2 * math.pi * f * t) * 0.6) * np.exp(-t / (0.05 if k == 0 else 0.16))
        place(out, lp(x, 9000), t0)
    return out * 0.4


def fx_impact(rng):
    n = int(0.9 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * math.pi * np.cumsum(38 + 60 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.35)
    crack = lp(rng.standard_normal(n), 3500) * np.exp(-t / 0.06) * 0.5
    return np.tanh(1.4 * (boom + crack)) * 0.7


def fx_riser(rng, d=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    up = fx_whoosh(rng, d, True)
    f = 220 * (8 ** (t / d))
    tone = np.sin(2 * math.pi * np.cumsum(f) / SR) * 0.15
    e = (t / d) ** 2
    return (up + tone) * e * 0.8


def fx_key(rng):
    n = int(0.03 * SR); t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.004) + np.sin(2 * math.pi * 1800 * t) * np.exp(-t / 0.006) * 0.5
    return x / np.abs(x).max() * 0.5


def fx_click(rng):
    out = np.zeros(int(0.08 * SR))
    for t0, g in ((0, 1), (0.045, 0.6)):
        place(out, fx_key(rng) * g, t0)
    return out


def fx_success(rng):
    out = np.zeros(int(0.9 * SR))
    for k, m in enumerate((84, 88, 91, 96)):
        n = int(0.6 * SR); t = np.arange(n) / SR
        f = NOTE(m)
        x = (np.sin(2 * math.pi * f * t) + 0.3 * np.sin(2 * math.pi * f * 2.76 * t) * np.exp(-t / 0.05)) * np.exp(-t / 0.22)
        place(out, x, k * 0.07)
    return out * 0.32


def fx_sparkle(rng):
    out = np.zeros(int(0.6 * SR))
    for k in range(7):
        m = 96 + rng.integers(-5, 8)
        n = int(0.25 * SR); t = np.arange(n) / SR
        place(out, np.sin(2 * math.pi * NOTE(m) * t) * np.exp(-t / 0.06), k * 0.045)
    return out * 0.16


FX = {"whoosh": fx_whoosh, "pop": fx_pop, "tick": fx_tick, "coin": fx_coin, "impact": fx_impact, "riser": fx_riser,
      "key": fx_key, "click": fx_click, "success": fx_success, "sparkle": fx_sparkle,
      "whoosh_down": lambda r: fx_whoosh(r, 0.32, False)}


# ---------------- more instruments for the styles ----------------
def k808(f, n, glide=None, drive=2.2):
    t = np.arange(n) / SR
    ff = np.full(n, f)
    if glide:
        ff = f + (glide - f) * np.clip((t - n / SR * 0.6) / (n / SR * 0.25 + 1e-6), 0, 1)
    x = np.sin(2 * math.pi * np.cumsum(ff * (1 + 0.6 * np.exp(-t / 0.02))) / SR)
    return np.tanh(drive * x) / np.tanh(drive) * env(n, 0.003, 0.9, 0.6, 0.06)


def snare(rng):
    n = int(0.25 * SR); t = np.arange(n) / SR
    noise = hp(lp(rng.standard_normal(n), 9000), 1500) * np.exp(-t / 0.07)
    body = np.sin(2 * math.pi * np.cumsum(185 * (1 + 0.4 * np.exp(-t / 0.01))) / SR) * np.exp(-t / 0.05)
    return (noise / np.abs(noise).max() * 0.8 + body * 0.6) * 0.6


def chip_drum(rng, kind):
    if kind == "kick":
        n = int(0.16 * SR); t = np.arange(n) / SR
        return np.sign(np.sin(2 * math.pi * np.cumsum(60 + 300 * np.exp(-t / 0.02)) / SR)) * np.exp(-t / 0.05) * 0.5
    n = int((0.12 if kind == "snare" else 0.03) * SR); t = np.arange(n) / SR
    x = np.sign(rng.standard_normal(n // 8 + 1)).repeat(8)[:n]           # low-rate noise, like an old console
    return x * np.exp(-t / (0.05 if kind == "snare" else 0.008)) * (0.4 if kind == "snare" else 0.18)


def cowbell(f, n):
    t = np.arange(n) / SR
    x = np.sign(np.sin(2 * math.pi * f * t)) + np.sign(np.sin(2 * math.pi * f * 1.48 * t))
    x = hp(lp(x, 4500), 400)
    return x / (np.abs(x).max() + 1e-9) * np.exp(-t / 0.11) * (0.6 + 0.4 * np.exp(-t / 0.02))


def pulse(f, n, duty=0.25, harm=20, dec=None):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for h in range(1, harm + 1):
        if f * h > 15000:
            break
        out += math.sin(math.pi * h * duty) / h * np.sin(2 * math.pi * f * h * t)
    return out * (np.exp(-t / dec) if dec else 1)


def tri(f, n):
    t = np.arange(n) / SR
    return sum(((-1) ** k) / h ** 2 * np.sin(2 * math.pi * f * h * t) for k, h in enumerate(range(1, 16, 2)))


def bell(f, n):
    t = np.arange(n) / SR
    return (np.sin(2 * math.pi * f * t) + 0.5 * np.sin(4 * math.pi * f * t) * np.exp(-t / 0.3)
            + 0.35 * np.sin(2 * math.pi * f * 2.76 * t) * np.exp(-t / 0.08)) * np.exp(-t / 0.45)


def lead_note(kind, f, n, soft=False):
    if kind == "square":
        return pulse(f, n, 0.25, dec=0.16) * 0.6
    if kind == "bell":
        return bell(f, n) * 0.8
    if kind == "cowbell":
        return cowbell(f, n) * 0.55
    return saw(f, n, harm=16, decay=(9, 7), bright=0.5 if soft else 1.0)          # pluck


# ---------------- the styles ----------------
# Each style is a recipe (drum pattern in 16ths of a bar, bass, chords, lead). The audio lab (brand/badroyale/shop/audio_lab.py)
# rotates them on the daily shop video and keeps the ones viewers stay for.
PROGS = [[0, 5, 2, 6], [0, 5, 6, 4], [0, 3, 5, 4], [5, 3, 0, 4], [0, 6, 5, 6]]      # minor-scale degrees, one chord a bar
SCALE = [0, 2, 3, 5, 7, 8, 10]
GROOVES = [[0, 6, 8, 11], [0, 3, 8, 10], [0, 7, 8, 14], [0, 6, 10]]
STYLES = {
    #          tempo range   kick (16ths)        backbeat          hats        bass       chords   lead      lead density
    "bounce": {"bpm": (110, 120), "kick": "groove", "snare": ("clap", (4, 12)), "hats": "8rand", "bass": "kick", "chords": "pad", "lead": "pluck", "rest": 2},
    "house":  {"bpm": (120, 126), "kick": [0, 4, 8, 12], "snare": ("clap", (4, 12)), "hats": "16", "bass": "offbeat", "chords": "stab", "lead": "pluck", "rest": 3},
    "trap":   {"bpm": (136, 144), "kick": [0, 7, 10], "snare": ("snare", (8,)), "hats": "8rolls", "bass": "808", "chords": "dark", "lead": "bell", "rest": 5},
    "phonk":  {"bpm": (122, 130), "kick": [0, 3, 8, 11], "snare": ("clap", (4, 12)), "hats": "8", "bass": "808", "chords": "dark", "lead": "cowbell", "rest": 1},
    "chip":   {"bpm": (124, 132), "kick": [0, 8, 11], "snare": ("chip", (4, 12)), "hats": "chip", "bass": "tri", "chords": "arp", "lead": "square", "rest": 2},
}


def chord(root, deg):
    notes = [SCALE[(deg + i) % 7] + 12 * ((deg + i) // 7) for i in (0, 2, 4)]
    return [root + n for n in notes]


def render(spec, cues, dur, path):
    rng = np.random.default_rng(int(spec.get("seed", 1)))
    style = spec.get("style", "bounce")
    S = {**STYLES[style], **{k: v for k, v in spec.items() if k in ("lead", "chords", "hats", "bass")}}
    bpm = float(spec.get("bpm", 116))
    beat = 60.0 / bpm
    s16 = beat / 4
    t0 = float(spec.get("t0", 0.0))
    N = int((dur + 1.0) * SR)
    sec = sorted(spec.get("sections", [[0, "main"]]))
    def section(t):
        name = sec[0][1]
        for ts, nm in sec:
            if t + 1e-6 >= ts:
                name = nm
        return name

    root = 45 + int(rng.integers(0, 7))                     # A2..D#3
    prog = PROGS[int(rng.integers(0, len(PROGS)))]
    kick_pat = GROOVES[int(rng.integers(0, len(GROOVES)))] if S["kick"] == "groove" else S["kick"]
    # a one-bar melody motif (16ths), chord-tone based, with a variation every other bar
    rests = [-1] * S["rest"]
    motif = [int(x) for x in rng.choice([0, 1, 2, 3, 4] + rests, 16)]
    for i in (0, 8):
        motif[i] = int(rng.integers(0, 3))
    motif_b = motif[:8] + [int(x) for x in rng.choice([0, 1, 2, 3, 4] + rests, 8)]
    if S["lead"] == "bell":                                   # trap: sparse, eighths only
        motif = [v if i % 2 == 0 else -1 for i, v in enumerate(motif)]
        motif_b = [v if i % 2 == 0 else -1 for i, v in enumerate(motif_b)]
    swing = float(spec.get("swing", 0.012))

    drums = np.zeros(N); bass = np.zeros(N); pad_l = np.zeros(N); pad_r = np.zeros(N); lead_l = np.zeros(N); lead_r = np.zeros(N)
    if S["snare"][0] == "chip":
        K, C, H, O = chip_drum(rng, "kick"), chip_drum(rng, "snare"), chip_drum(rng, "hat"), chip_drum(rng, "hat")
    else:
        K, C, H, O = kick(rng), (snare(rng) if S["snare"][0] == "snare" else clap(rng)), hat(rng), hat(rng, True)
    CL = clap(rng)
    kicks = []
    nbars = int(math.ceil((dur - t0) / (4 * beat))) + 1
    for b in range(nbars):
        tb = t0 + b * 4 * beat
        if tb > dur:
            break
        ch = chord(root, prog[b % 4])
        nxt = chord(root, prog[(b + 1) % 4])
        sname = section(tb + 0.01)
        if sname == "end":
            sname = "main"
        brk = sname == "break"
        big = sname in ("grid", "intro")
        sw = lambda i: swing if i % 2 else 0
        # ---- drums
        for i in range(16):
            t = tb + i * s16 + sw(i)
            if t > dur:
                break
            if not brk and i in kick_pat:
                place(drums, K, t, 0.85); kicks.append(t)
            if not brk and i in S["snare"][1]:
                place(drums, C, t, 0.7)
                if style == "trap":
                    place(drums, CL, t, 0.35)
            h = S["hats"]
            if h == "8rand":
                if i % 2 == 0 or big or (not brk and rng.random() < 0.5):
                    place(drums, H, t, (0.55 if i % 4 == 0 else 0.35) * (0.6 if brk else 1))
            elif h == "16":
                place(drums, H, t, (0.25 if i % 4 == 0 else 0.4 if i % 2 else 0.3) * (0.6 if brk else 1))
            elif h in ("8", "chip"):
                if i % 2 == 0:
                    place(drums, H, t, 0.45 * (0.6 if brk else 1))
            elif h == "8rolls":
                if i % 2 == 0:
                    place(drums, H, t, 0.42 * (0.6 if brk else 1))
                    if not brk and rng.random() < 0.22:                     # a hat roll: triplets or 32nds
                        k_ = 3 if rng.random() < 0.5 else 4
                        for j in range(1, k_):
                            place(drums, H, t + j * (2 * s16) / k_, 0.3)
            if (big or style == "house") and not brk and i in (2, 6, 10, 14) and (style == "house" or i in (2, 10)):
                place(drums, O, t, 0.3)
        if not brk and b % 2 == 1 and style in ("bounce", "house", "chip"):    # fill into the next card
            for j in (13, 14, 15):
                place(drums, C, tb + j * s16, 0.3 + 0.1 * (j - 13))
        # ---- bass
        if not brk:
            f = NOTE(ch[0] - 12)
            if S["bass"] == "kick":
                for i in kick_pat:
                    t = tb + i * s16
                    n = int(min(beat * 1.2, dur - t) * SR)
                    if n > 0:
                        tt = np.arange(n) / SR
                        ff = f * (2 if i == kick_pat[-1] and b % 2 else 1)
                        x = np.sin(2 * math.pi * ff * tt) + 0.25 * np.sin(4 * math.pi * ff * tt)
                        place(bass, np.tanh(1.8 * x) * env(n, 0.004, 0.35, 0.5, 0.05), t, 0.55)
            elif S["bass"] == "offbeat":
                for i in (2, 6, 10, 14):
                    n = int(beat * 0.4 * SR)
                    x = saw(f, n, harm=8) * 0.5 + np.sin(2 * math.pi * f * np.arange(n) / SR)
                    place(bass, x * env(n, 0.003, 0.12, 0.2, 0.03), tb + i * s16, 0.5)
            elif S["bass"] == "808":
                hits = sorted(kick_pat)
                for j, i in enumerate(hits):
                    t = tb + i * s16
                    end_i = hits[j + 1] if j + 1 < len(hits) else 16
                    n = int(min((end_i - i) * s16, dur - t) * SR)
                    if n > 0:
                        glide = NOTE(nxt[0] - 12) if j + 1 == len(hits) and b % 2 else None
                        place(bass, k808(f, n, glide, 3.0 if style == "phonk" else 2.0), t, 0.6)
            elif S["bass"] == "tri":
                for i in range(0, 16, 2):
                    n = int(s16 * 1.8 * SR)
                    place(bass, tri(f * (2 if (i // 2) % 2 else 1), n) * env(n, 0.002, 0.2, 0.6, 0.02), tb + i * s16, 0.6)
        # ---- chords
        n = int(min(4 * beat, dur - tb + 0.2) * SR)
        a0 = int(tb * SR)
        if S["chords"] in ("pad", "dark"):
            gain_ = (0.085 if S["chords"] == "pad" else 0.07) if not brk else 0.11
            for m in ch:
                for det, side in ((-0.06, pad_l), (0.06, pad_r)):
                    x = saw(NOTE(m + (12 if S["chords"] == "pad" else 0)) * 2 ** (det / 12), n, harm=10 if S["chords"] == "pad" else 6)
                    side[a0:a0 + n] += (x * env(n, 0.08 if not brk else 0.4, 0.8, 0.7, 0.1))[:len(side) - a0] * gain_
        elif S["chords"] == "stab" and not brk:
            for i in (3, 6, 10, 13):                                      # syncopated house stabs
                m_ = int(beat * 0.35 * SR)
                for m in ch:
                    x = saw(NOTE(m + 12), m_, harm=14, decay=(6, 4))
                    place(pad_l, x, tb + i * s16, 0.09); place(pad_r, x, tb + i * s16 + 0.006, 0.09)
        elif S["chords"] == "arp":
            tones = ch + [ch[0] + 12]
            for i in range(32):
                t = tb + i * s16 / 2
                if t > dur:
                    break
                m_ = int(s16 / 2 * SR)
                x = pulse(NOTE(tones[i % 4] + 12), m_, 0.125, harm=12) * env(m_, 0.001, 0.05, 0.3, 0.01)
                place(pad_l, x, t, 0.07 if not brk else 0.1); place(pad_r, x, t, 0.07 if not brk else 0.1)
        # ---- lead: the day's motif on chord tones, an octave up in the big sections
        mot = motif if b % 2 == 0 else motif_b
        for i, v in enumerate(mot):
            if v < 0:
                continue
            t = tb + i * s16 + sw(i)
            if t > dur - 0.05:
                continue
            tones = ch + [c + 12 for c in ch]
            up = 12 if big and S["lead"] in ("pluck", "square") else 0
            m = tones[v] + 12 + up + (12 if S["lead"] in ("bell", "cowbell") else 0)
            n = int(0.42 * SR)
            x = lead_note(S["lead"], NOTE(m), n, soft=brk)
            g = (0.22 if not brk else 0.13) * (0.8 if S["lead"] == "cowbell" else 1)
            place(lead_l, x, t, g); place(lead_r, x, t + 0.009, g)
    # ---- the hook: what the first beat sounds like
    hook = spec.get("hook", "impact")
    ch0 = chord(root, prog[0])
    if hook == "stutter":                                          # the first chord gated in 32nds
        for i in range(8):
            m_ = int(s16 / 2 * 0.7 * SR)
            for m in ch0:
                x = saw(NOTE(m + 12), m_, harm=12) * env(m_, 0.001, 0.05, 0.6, 0.005)
                place(lead_l, x, t0 + i * s16 / 2, 0.12); place(lead_r, x, t0 + i * s16 / 2, 0.12)
    elif hook == "arp":                                            # a rising four-note call
        for i, m in enumerate(ch0 + [ch0[0] + 12]):
            x = bell(NOTE(m + 24), int(0.5 * SR))
            place(lead_l, x, t0 + i * s16, 0.3); place(lead_r, x, t0 + i * s16 + 0.008, 0.3)
    # ping-pong echo on the lead, dotted eighth
    d = int(beat * 0.75 * SR)
    ll, rr = lead_l.copy(), lead_r.copy()
    lead_l[d:] += rr[:-d] * (0.32 if S["lead"] != "cowbell" else 0.15); lead_r[2 * d:] += ll[:-2 * d] * 0.22
    # sidechain: pad, bass and lead duck under every kick
    gain = np.ones(N)
    if kicks:
        idx = np.arange(N) / SR
        ks = np.array(sorted(kicks))
        pos = np.searchsorted(ks, idx, side="right") - 1
        since = np.where(pos >= 0, idx - ks[np.clip(pos, 0, None)], 10)
        gain = 1 - (0.5 if style == "house" else 0.35) * np.exp(-since / 0.1)
    # break: low-pass the melodic parts so the drop hits harder after it
    melodic_l = (pad_l + lead_l) * gain
    melodic_r = (pad_r + lead_r) * gain
    for ts, nm in sec:
        if nm == "break":
            te = next((t for t, n2 in sec if t > ts), dur)
            a, b_ = int(ts * SR), min(N, int(te * SR))
            if b_ - a > 1024:
                melodic_l[a:b_] = lp(melodic_l[a:b_], 1400); melodic_r[a:b_] = lp(melodic_r[a:b_], 1400)
    bass_g = bass * (gain if S["bass"] != "808" else 1)              # an 808 is the kick's partner, not ducked
    music_l = drums + bass_g + melodic_l
    music_r = drums + bass_g + melodic_r
    # short room reverb on the melodic parts (FFT convolution with a decaying noise tail)
    ir_n = int(0.9 * SR)
    ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.25)
    ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    L = 1 << int(math.ceil(math.log2(N + ir_n)))
    def conv(x):
        return np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[:N]
    music_l += conv(melodic_l) * 0.18
    music_r += conv(melodic_r) * 0.18
    # effects on top
    fx = np.zeros(N)
    cache = {}
    for t, name in cues:
        if name not in FX:
            continue
        if name not in cache:
            cache[name] = FX[name](rng)
        clip = cache[name]
        lead_in = {"whoosh": 0.22, "whoosh_down": 0.1, "riser": len(clip) / SR}.get(name, 0)   # sweeps peak on the cut
        place(fx, clip, t - lead_in, 1.0)
    # music level against the effects: louder styles sit a little lower
    out_l = music_l * 0.62 + fx * 0.75
    out_r = music_r * 0.62 + fx * 0.75
    st = np.stack([out_l, out_r], 1)[: int(dur * SR)]
    # gentle fade in over 10 ms (no click) and out over the last 0.25 s
    n = len(st)
    st[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    st[n - int(0.25 * SR):] *= np.linspace(1, 0.2, int(0.25 * SR))[:, None]
    st = np.tanh(st / max(1e-6, np.abs(st).max()) * 1.2) * 0.9
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())
    return path


if __name__ == "__main__":
    import json, sys
    spec = json.loads(sys.argv[1]); dur = float(sys.argv[2])
    cues = json.loads(sys.argv[3]) if len(sys.argv) > 3 else []
    render(spec, cues, dur, sys.argv[4] if len(sys.argv) > 4 else "music.wav")
    print("ok")
