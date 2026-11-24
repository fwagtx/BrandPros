"""Final audio for a Bad Tienda de Hoy shop video: original synthesized music + effects (brand/_shared/video/music.py,
nothing taken from any song or game) with the voz-3 host on top. The music ducks under the voice; the result is
normalized to -14 LUFS with a -2.6 dBTP ceiling, the same loudness standard as the owner's other channels.

    python3 mix_av.py <silent.mp4> <voice.wav> <out.mp4> '<music spec json>'
"""
import json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "..", "_shared", "video"))
import music  # noqa: E402
from timeline import STARTS, END  # noqa: E402

FF = os.environ.get("FFMPEG", "ffmpeg")
SR = 48000


def cues():
    c = [[0.02, "impact"]]
    for i, s in enumerate(STARTS[1:-2], start=1):
        c.append([s, "whoosh"])
        if i == 1:                       # bundle: strike, price drop lands, fire badge
            c += [[s + 2.0, "impact"], [s + 3.65, "coin"], [s + 4.33, "pop"]]
        else:                            # item: price lands, badge/caption pops
            c += [[s + 1.4, "coin"], [s + 1.9, "pop"]]
    g, k = STARTS[-2], STARTS[-1]
    c += [[g, "whoosh"]] + [[g + j * 0.27, "tick"] for j in range(9)] + [[g + 3.0, "sparkle"]]
    c += [[k, "whoosh_down"], [k + 1.0, "key"], [k + 1.17, "key"], [k + 1.34, "key"], [k + 2.8, "click"], [k + 3.33, "success"]]
    return c


def run(args):
    subprocess.run([FF, "-y", "-loglevel", "error", *args], check=True)


def main():
    silent, voice, out, spec = sys.argv[1], sys.argv[2], sys.argv[3], json.loads(sys.argv[4])
    tmp = tempfile.mkdtemp()
    bed = music.render(spec, cues(), END, os.path.join(tmp, "music.wav"))
    mixed = os.path.join(tmp, "mixed.wav")
    fc = (f"[0]aresample={SR},volume=0.62[m];"
          f"[1]aresample={SR},highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
          f"equalizer=f=3000:t=q:w=1.2:g=2.5,volume=1.35,asplit=2[vo][key];"
          f"[m][key]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=300[duck];"
          f"[duck][vo]amix=inputs=2:normalize=0:duration=first,atrim=0:{END}[a]")
    run(["-i", bed, "-i", voice, "-filter_complex", fc, "-map", "[a]", "-ac", "2", mixed])
    p = subprocess.run([FF, "-hide_banner", "-i", mixed, "-af", "loudnorm=I=-14:TP=-2.6:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True)
    m = json.loads(re.findall(r"\{[^{}]+\}", p.stderr)[-1])
    ln = (f"loudnorm=I=-14:TP=-2.6:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    run(["-i", silent, "-i", mixed, "-filter_complex", f"[1]{ln},alimiter=limit=0.7:level=false,aresample={SR}[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", out])
    print("mixed", out)


if __name__ == "__main__":
    main()
