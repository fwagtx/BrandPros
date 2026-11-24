"""Bad Tienda de Hoy's corner of the owner's R2 bucket: the shared store (brand/_shared/store.py) with its own folder,
badtiendadehoy/. Nothing outside badtiendadehoy/ is ever written, listed for deletion, or deleted.

    python3 brand/badtiendadehoy/auto/bstore.py put FILE KEY | link KEY | rm KEY | ls [PREFIX] | sweep [HOURS]
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shared"))
import store  # noqa: E402

store.ROOT = "badtiendadehoy/"

put, link, rm, ls, sweep = store.put, store.link, store.rm, store.ls, store.sweep

if __name__ == "__main__":
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == "put":
        print(put(args[0], args[1]))
    elif cmd == "link":
        print(link(args[0]))
    elif cmd == "rm":
        rm(args[0]); print("removed", args[0])
    elif cmd == "ls":
        for o in ls(args[0] if args else ""):
            print(o["LastModified"].isoformat(), o["Size"], o["Key"])
    elif cmd == "sweep":
        sweep(float(args[0]) if args else 48); print("swept")
    else:
        raise SystemExit(__doc__)
