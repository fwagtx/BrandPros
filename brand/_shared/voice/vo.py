"""Voiceover with word timings, using Kokoro-82M (Apache-2.0, runs offline).

The model export has no timing output, so the script is read one phrase at a time: each phrase is
synthesized on its own (phrases are where a person would pause anyway), trimmed, and placed on the
timeline. Inside a phrase, word times are split in proportion to each word's phoneme count.

Usage: python3 vo.py <script.json> <out.wav> <out-timings.json>
script.json: {"voice": "af_heart", "speed": 1.1, "lang": "en-us", "lead": 0.25,
              "phrases": [{"text": "There's a Pac-Man hidden on the map.", "pause": 0.18}, ...]}
"text" is what the captions show; the voice says it through PRONOUNCE (or a phrase's own "say").
"""
import json, os, re, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 24000


# How words are SAID, when that differs from how they're SHOWN in captions.
# The model reads all-caps words as acronyms ("BAD" -> "B, A, D"), so the code is fed in lowercase.
# Keys are matched case-sensitively on the bare word; punctuation around the word is kept.
PRONOUNCE = {
    "BAD": "bad",
    "CODE": "code",
    "v42.40": "version forty-two point four oh",
    "FNCS": "F N C S",
    "LTM": "limited time mode",
}


def spoken(tok):
    m = re.match(r"^([^\w]*)(.*?)([^\w]*)$", tok)
    lead, core, tail = m.groups()
    return lead + PRONOUNCE.get(core, core) + tail


def trim(a, thr=0.012, pad=0.035):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    s, e = max(0, idx[0] - int(pad * SR)), min(len(a), idx[-1] + int(pad * SR))
    return a[s:e]


def main():
    script, out_wav, out_json = sys.argv[1:4]
    cfg = json.load(open(script))
    k = Kokoro(os.path.join(HERE, "models/model_quantized.onnx"), os.path.join(HERE, "models/voices.npz"))
    voice, speed, lang = cfg.get("voice", "af_heart"), cfg.get("speed", 1.1), cfg.get("lang", "en-us")
    # a blend like "af_heart:0.6+af_bella:0.4" mixes voices into one that no stock voice matches
    if "+" in voice or ":" in voice:
        parts = [v.split(":") for v in voice.split("+")]
        voice_arr = sum(float(w) * k.voices[n] for n, w in parts) / sum(float(w) for _, w in parts)
    else:
        voice_arr = voice
    t = cfg.get("lead", 0.25)
    chunks, words, phrases = [np.zeros(int(t * SR), dtype=np.float32)], [], []
    for i, ph in enumerate(cfg["phrases"]):
        say = ph.get("say") or " ".join(spoken(t) for t in ph["text"].split())
        a, _ = k.create(say, voice=voice_arr, speed=ph.get("speed", speed), lang=lang)
        a = trim(a.astype(np.float32))
        dur = len(a) / SR
        toks = ph["text"].split()
        # weight each word by its phoneme count (spoken length), with a floor for short words
        w = []
        for tok in toks:
            core = re.sub(r"[^\w'\-]", "", spoken(tok))
            try:
                n = len(k.tokenizer.phonemize(core, lang)) if core else 1
            except Exception:
                n = len(core)
            w.append(max(2, n))
        total, acc = sum(w), 0.0
        lead_in, tail = 0.04, 0.06
        span = max(0.05, dur - lead_in - tail)
        for tok, wi in zip(toks, w):
            s = t + lead_in + span * acc / total
            acc += wi
            words.append({"w": tok, "t0": round(s, 3), "t1": round(t + lead_in + span * acc / total, 3), "p": i})
        phrases.append({"text": ph["text"], "t0": round(t, 3), "t1": round(t + dur, 3)})
        chunks.append(a)
        gap = ph.get("pause", 0.12)
        chunks.append(np.zeros(int(gap * SR), dtype=np.float32))
        t += dur + gap
    audio = np.concatenate(chunks)
    peak = float(np.abs(audio).max()) or 1.0
    audio = audio * (0.89 / peak)
    sf.write(out_wav, audio, SR)
    json.dump({"voice": voice, "speed": speed, "duration": round(len(audio) / SR, 3), "phrases": phrases, "words": words}, open(out_json, "w"), indent=1)
    print(f"{out_wav}: {len(audio) / SR:.2f}s, {len(words)} words, voice {voice}")


main()
