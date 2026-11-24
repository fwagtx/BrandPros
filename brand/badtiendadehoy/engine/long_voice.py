"""Voice + timeline for the long video. Each scene's narration is generated sentence by sentence with the locked voz-3
voice (steadier than one long take), and each scene lasts as long as its narration plus a short breath, so nothing is cut.

    python3 long_voice.py <model_dir> <long_dir>

Writes <long_dir>/vo/voice.wav, <long_dir>/vo/lines.json and <long_dir>/timeline.json.
"""
import json, os, re, sys, time
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.dirname(HERE)
SR = 48000
PAD = {"intro": (0.6, 1.0), "top": (0.4, 1.4), "outro": (0.4, 6.0)}   # (before, after) seconds; outro keeps the code screen
DEFAULT_PAD = (0.5, 1.1)
MIN_SCENE = 10.5   # YouTube chapters need 10 s or more


def sentences(text):
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p for p in parts if p]


def main():
    model_dir, ld = sys.argv[1], sys.argv[2]
    data = json.load(open(os.path.join(ld, "long.json")))
    voice = json.load(open(os.path.join(BRAND, "voice", "voice.json")))
    import torch, librosa
    from qwen_tts import Qwen3TTSModel
    torch.set_num_threads(os.cpu_count())
    model = Qwen3TTSModel.from_pretrained(model_dir, device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")
    prompt = model.create_voice_clone_prompt(ref_audio=os.path.join(BRAND, "voice", voice["ref_audio"]), ref_text=voice["ref_text"])
    os.makedirs(os.path.join(ld, "vo"), exist_ok=True)
    clips, report = [], []
    for li, ln in enumerate(data["lines"]):
        parts = []
        for si, s in enumerate(sentences(ln["text"])):
            torch.manual_seed(voice.get("seed", 7) + si)
            t = time.time()
            wavs, sr = model.generate_voice_clone(text=s, language="Spanish", voice_clone_prompt=prompt)
            w = wavs[0]
            idx = np.where(np.abs(w) > 0.01)[0]
            if len(idx): w = w[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
            w = librosa.resample(w.astype(np.float32), orig_sr=sr, target_sr=SR)
            # a take far longer than the words need is a model ramble: retry once
            if len(w) / SR > 0.75 * len(s.split()) + 2.0:
                torch.manual_seed(voice.get("seed", 7) + 100 + si)
                wavs, sr = model.generate_voice_clone(text=s, language="Spanish", voice_clone_prompt=prompt)
                w2 = wavs[0]; idx = np.where(np.abs(w2) > 0.01)[0]
                if len(idx): w2 = w2[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
                w2 = librosa.resample(w2.astype(np.float32), orig_sr=sr, target_sr=SR)
                if len(w2) < len(w): w = w2
            parts.append(w)
            parts.append(np.zeros(int(0.22 * SR), np.float32))
            print(f"scene {ln['scene']} sentence {si}: {len(w)/SR:.1f}s in {time.time()-t:.0f}s", flush=True)
        clip = np.concatenate(parts[:-1]) if parts else np.zeros(1, np.float32)
        clips.append(clip)
        report.append(dict(scene=ln["scene"], text=ln["text"], seconds=round(len(clip) / SR, 2)))
    # timeline
    t, scenes = 0.0, []
    for ln, clip in zip(data["lines"], clips):
        before, after = PAD.get(ln["scene"], DEFAULT_PAD)
        dur = max(MIN_SCENE, before + len(clip) / SR + after)
        scenes.append(dict(id=ln["scene"], start=round(t, 3), dur=round(dur, 3), voice_at=round(t + before, 3),
                           voice_len=round(len(clip) / SR, 3)))
        t += dur
    total = round(t, 3)
    track = np.zeros(int((total + 0.5) * SR), np.float32)
    for sc, clip in zip(scenes, clips):
        at = int(sc["voice_at"] * SR)
        track[at: at + len(clip)] += clip[: len(track) - at]
    sf.write(os.path.join(ld, "vo", "voice.wav"), track[: int(total * SR)], SR)
    json.dump(dict(total=total, scenes=scenes), open(os.path.join(ld, "timeline.json"), "w"), indent=1)
    json.dump(report, open(os.path.join(ld, "vo", "lines.json"), "w"), ensure_ascii=False, indent=1)
    print(f"LONG VOICE OK: {len(scenes)} scenes, {total/60:.1f} min")


if __name__ == "__main__":
    main()
