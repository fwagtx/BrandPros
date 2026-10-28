"""The queue of finished, checked posts waiting to be scheduled (brand/badroyale/auto/backlog.json).

    python3 brand/badroyale/auto/backlog.py add <short folder>   # after make_short.py ship: queue its posts.json calls
    python3 brand/badroyale/auto/backlog.py links                # write backlog.live.json: the same calls with fresh signed links
                                                                 # (6 h); schedule from that file, it is never committed
    python3 brand/badroyale/auto/backlog.py show                 # what's queued, by time

The autopilot runs `links`, then schedules each call from backlog.live.json (createScheduledPost with blogId, date
and info exactly as given), then removes what it scheduled from backlog.json. Hosted files are deleted with `python3 brand/_shared/store.py rm KEY`
once every call that uses them is scheduled (the "r2" keys on each call).
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BACKLOG = os.path.join(HERE, "backlog.json")
LIVE = os.path.join(HERE, "backlog.live.json")   # gitignored: signed links never go into the public repo
STORE = os.path.join(HERE, "..", "..", "_shared", "store.py")


def load():
    return json.load(open(BACKLOG)) if os.path.exists(BACKLOG) else {"calls": []}


def save(b):
    b["calls"].sort(key=lambda c: c["date"])
    json.dump(b, open(BACKLOG, "w"), indent=1, ensure_ascii=False)


def link(key):
    return subprocess.run([sys.executable, STORE, "link", key], capture_output=True, text=True, check=True).stdout.strip()


def add(folder):
    folder = os.path.abspath(folder)
    slug = os.path.basename(folder.rstrip("/"))
    p = json.load(open(os.path.join(folder, "posts.json")))
    b = load()
    b["calls"] = [c for c in b["calls"] if c.get("slug") != slug]
    for c in p["calls"]:
        c = {"slug": slug, **c, "r2": {"video": f"{slug}/video.mp4"}}
        c["info"]["media"] = ["r2:" + c["r2"]["video"]]          # placeholders: `links` fills in signed links right before scheduling
        if "videoThumbnailUrl" in c["info"]:
            c["r2"]["cover"] = f"{slug}/" + os.path.basename(c["info"]["videoThumbnailUrl"].split("?")[0])
            c["info"]["videoThumbnailUrl"] = "r2:" + c["r2"]["cover"]
        b["calls"].append(c)
    save(b)
    print(f"queued {len(p['calls'])} posts for {slug} at {p['post_at']}")


def links():
    b = load()
    cache = {}
    for c in b["calls"]:
        r2 = c.get("r2")
        if not r2:
            continue
        for key in r2.values():
            cache.setdefault(key, link(key))
        c["info"]["media"] = [cache[r2["video"]]]
        if "cover" in r2:
            c["info"]["videoThumbnailUrl"] = cache[r2["cover"]]
    json.dump(b, open(LIVE, "w"), indent=1, ensure_ascii=False)
    print(f"wrote {os.path.relpath(LIVE)}: {len(cache)} fresh links on {sum(1 for c in b['calls'] if c.get('r2'))} queued posts")


def show():
    for c in load()["calls"]:
        print(c["date"], c["network"].ljust(9), c.get("slug", ""))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "add" and len(sys.argv) > 2:
        add(sys.argv[2])
    elif cmd == "links":
        links()
    elif cmd == "show":
        show()
    else:
        raise SystemExit(__doc__)
