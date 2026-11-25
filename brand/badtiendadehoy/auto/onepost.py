"""One Metricool post for all five networks (owner, 2026-11-25: "connect them under one scheduled post").

One caption is shared by Instagram, Facebook, YouTube (description) and Threads; TikTok keeps its own caption in
tiktokData.title and YouTube its own title in youtubeData.title. Each network still gets its own status in Metricool.

    python3 onepost.py only <posts.json> <net1,net2,...> [--no-thumb]
        prints the info JSON of posts.json's call cut down to those networks: for posting only the networks that are
        missing, or for sending Threads on its own if Metricool ever refuses the cover on the combined post.
"""
import json, sys

NETS = ("tiktok", "instagram", "facebook", "youtube", "threads")
THUMB_NETS = ("tiktok", "instagram", "facebook", "youtube")
THREADS_MAX = 500


def fit(lines, tail, limit=THREADS_MAX):
    """Join caption lines + tail; drop lines from the end of the middle until it fits Threads' 500 characters."""
    head, mid = lines[0], list(lines[1:])
    while True:
        text = "\n".join([head, *mid, *tail])
        if len(text) <= limit or not mid:
            return text[:limit]
        mid.pop()


def combine(base, text, data, thumb=None):
    """base: the common fields; data: {network: its networkData}; thumb: cover URL (applies to all but Threads)."""
    info = dict(base, text=text, providers=[{"network": n} for n in data])
    for n, d in data.items():
        info[f"{n}Data"] = d
    if thumb:
        info["videoThumbnailUrl"] = thumb
    return info


def only(info, nets, thumb=True):
    i = json.loads(json.dumps(info))
    i["providers"] = [p for p in i["providers"] if p["network"] in nets]
    for n in NETS:
        if n not in nets:
            i.pop(f"{n}Data", None)
    if not thumb or not any(n in THUMB_NETS for n in nets):
        i.pop("videoThumbnailUrl", None)
    return i


if __name__ == "__main__":
    if len(sys.argv) < 4 or sys.argv[1] != "only":
        sys.exit(__doc__)
    p = json.load(open(sys.argv[2]))
    nets = [n.strip() for n in sys.argv[3].split(",") if n.strip()]
    bad = [n for n in nets if n not in NETS]
    if bad:
        sys.exit(f"unknown network(s): {bad}")
    print(json.dumps(only(p["calls"][0]["info"], nets, "--no-thumb" not in sys.argv), ensure_ascii=False))
