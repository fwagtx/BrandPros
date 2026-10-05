"""Synthesizes simple sound effects + a light beat with ffmpeg and lays them under a silent video.
Usage: python3 mix.py silent.mp4 out.mp4 <duration> '<cues json [[t, type], ...]>'
The beat is a placeholder: on TikTok/Reels, swap it for a trending sound in-app.
"""
import json, os, subprocess, sys, tempfile

FF = os.environ.get("FFMPEG", "ffmpeg")
SR = 44100
# aevalsrc expressions, t = seconds since the sound started
SFX = {
    "pop":      ("0.55*sin(2*PI*(380*t+2600*t*t))*exp(-28*t)", 0.16),
    "slam":     ("0.9*sin(2*PI*(95*t-60*t*t))*exp(-7*t)+0.35*(2*random(0)-1)*exp(-30*t)", 0.5),
    "thud":     ("0.7*sin(2*PI*(140*t-120*t*t))*exp(-14*t)+0.15*(2*random(0)-1)*exp(-40*t)", 0.3),
    "whoosh":   ("0.32*(2*random(0)-1)*sin(PI*t/0.32)*sin(PI*t/0.32)", 0.32),
    "tick":     ("0.35*sin(2*PI*2100*t)*exp(-90*t)", 0.06),
    "key":      ("0.45*(2*random(0)-1)*exp(-110*t)+0.2*sin(2*PI*900*t)*exp(-80*t)", 0.06),
    "coin":     ("0.32*sin(2*PI*988*t)*exp(-14*t)*lt(t,0.08)+0.32*sin(2*PI*1319*t)*exp(-7*(t-0.08))*gte(t,0.08)", 0.45),
    "ding":     ("0.3*sin(2*PI*880*t)*exp(-3.5*t)+0.2*sin(2*PI*1320*t)*exp(-4*t)+0.12*sin(2*PI*1760*t)*exp(-5*t)", 1.2),
    "sad":      ("0.35*sin(2*PI*(420*t-110*t*t))*exp(-1.8*t)*(0.8+0.2*sin(2*PI*7*t))", 0.9),
    "rise":     ("0.25*sin(2*PI*(200*t+500*t*t))*min(1,t*4)", 0.7),
    "scribble": ("0.22*(2*random(0)-1)*(0.5+0.5*sin(2*PI*22*t))*sin(PI*t/0.35)", 0.35),
}
P = 60 / 112  # beat length
BED = (f"0.55*sin(2*PI*58*mod(t,{P})+18*(1-exp(-30*mod(t,{P}))))*exp(-9*mod(t,{P}))"
       f"+0.07*(2*random(0)-1)*exp(-70*mod(t+{P/2},{P}))"
       f"+0.05*sin(2*PI*110*t)*exp(-3*mod(t,{P*4}))*(0.6+0.4*sin(2*PI*0.25*t))")

def run(args):
    subprocess.run([FF, "-y", "-loglevel", "error", *args], check=True)

def main():
    silent, out, dur, cues = sys.argv[1], sys.argv[2], float(sys.argv[3]), json.loads(sys.argv[4])
    tmp = tempfile.mkdtemp()
    used = sorted({c[1] for c in cues})
    for n in used:
        expr, d = SFX[n]
        run(["-f", "lavfi", "-i", f"aevalsrc=exprs='{expr}':s={SR}:d={d}", os.path.join(tmp, n + ".wav")])
    bed = os.path.join(tmp, "bed.wav")
    run(["-f", "lavfi", "-i", f"aevalsrc=exprs='{BED}':s={SR}:d={dur}", "-af", f"afade=t=out:st={dur-1.2}:d=1.2", bed])
    inputs = ["-i", silent, "-i", bed]
    for n in used:
        inputs += ["-i", os.path.join(tmp, n + ".wav")]
    idx = {n: i + 2 for i, n in enumerate(used)}
    parts, labels = [], ["[b]"]
    parts.append("[1]volume=0.55[b]")
    # split each sfx input as many times as it is used
    for n in used:
        times = [c[0] for c in cues if c[1] == n]
        outs = "".join(f"[{n}{j}]" for j in range(len(times)))
        parts.append(f"[{idx[n]}]asplit={len(times)}{outs}" if len(times) > 1 else f"[{idx[n]}]anull{outs}")
        for j, t in enumerate(times):
            ms = int(t * 1000)
            parts.append(f"[{n}{j}]adelay={ms}|{ms},apad[{n}d{j}]")
            labels.append(f"[{n}d{j}]")
    parts.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:duration=first,alimiter=limit=0.9,atrim=0:{dur}[a]")
    run([*inputs, "-filter_complex", ";".join(parts), "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out])

main()
