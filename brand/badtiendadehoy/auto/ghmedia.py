"""Temporary public hosting for finished videos on GitHub, the way the owner's other brands do it (a media branch,
served from raw.githubusercontent.com). Metricool copies each file into its own storage when the post is scheduled,
so the branch only ever holds the current files: every `put` replaces the branch with one commit containing just
those files (no history piles up; the repo never grows). Only this brand's media branch is ever written.

    python3 brand/badtiendadehoy/auto/ghmedia.py put NAME=FILE [NAME=FILE ...]   print one public URL per file
    python3 brand/badtiendadehoy/auto/ghmedia.py clear                           leave only README.md on the branch
"""
import os, shutil, subprocess, sys, tempfile, time, urllib.request

REPO = "fwagtx/BrandPros"
BRANCH = "claude/badtiendadehoy-media"
URL = f"https://raw.githubusercontent.com/{REPO}/refs/heads/{BRANCH}/"
README = ("# Bad Tienda de Hoy · media\n\nTemporary files for scheduled posts. Metricool imports them when a post is "
          "scheduled; the next upload replaces everything here.\n")


def git(cwd, *args):
    subprocess.run(["git", "-C", cwd, *args], check=True, capture_output=True, text=True)


def publish(files):
    tmp = tempfile.mkdtemp()
    git(tmp, "init", "-q")
    git(tmp, "checkout", "-q", "--orphan", BRANCH)
    open(os.path.join(tmp, "README.md"), "w").write(README)
    for name, path in files.items():
        shutil.copy(path, os.path.join(tmp, name))
    git(tmp, "add", "-A")
    git(tmp, "-c", "user.name=Claude", "-c", "user.email=noreply@anthropic.com", "commit", "-q", "-m", "media")
    remote = subprocess.run(["git", "-C", os.path.dirname(os.path.abspath(__file__)), "remote", "get-url", "origin"],
                            capture_output=True, text=True).stdout.strip() or f"https://github.com/{REPO}"
    for attempt in range(4):
        p = subprocess.run(["git", "-C", tmp, "push", "-q", "--force", remote, f"HEAD:refs/heads/{BRANCH}"], capture_output=True, text=True)
        if p.returncode == 0:
            break
        time.sleep(4 * (attempt + 1))
    else:
        raise SystemExit("push failed: " + p.stderr)
    shutil.rmtree(tmp, ignore_errors=True)
    urls = {n: URL + n for n in files}
    for n, u in urls.items():           # wait until the CDN serves the new file
        for _ in range(20):
            try:
                with urllib.request.urlopen(urllib.request.Request(u, method="HEAD"), timeout=30) as r:
                    if int(r.headers.get("Content-Length", 0)) == os.path.getsize(files[n]):
                        break
            except Exception:
                pass
            time.sleep(3)
    return urls


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "put":
        files = dict(a.split("=", 1) for a in sys.argv[2:])
        for n, u in publish(files).items():
            print(u)
    elif cmd == "clear":
        publish({}); print("cleared")
    else:
        raise SystemExit(__doc__)
