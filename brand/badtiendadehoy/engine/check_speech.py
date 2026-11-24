"""Transcribe audio files with Whisper to check the voice says the right Spanish words.
Usage: python3 check_speech.py <whisper_model_dir> <file.wav> [...]
"""
import sys
import librosa
from faster_whisper import WhisperModel

m = WhisperModel(sys.argv[1], device="cpu", compute_type="int8")
for f in sys.argv[2:]:
    audio, _ = librosa.load(f, sr=16000, mono=True)
    segs, info = m.transcribe(audio, language="es", beam_size=5)
    text = " ".join(s.text.strip() for s in segs)
    print(f"{f.split('/')[-1]} [{info.duration:.1f}s]: {text}", flush=True)
