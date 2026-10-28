"""Temporary hosting for finished videos, so Metricool can import them.

Metricool copies a post's media to its own storage the moment the post is scheduled, so a
file only has to be reachable for a few minutes. Files go to the owner's Cloudflare R2
bucket (the one the usecodebad pipeline uses) under BAD ROYALE's own folder, badroyale/,
and are deleted once the posts that use them are scheduled. Nothing outside badroyale/ is
ever written, listed for deletion, or deleted.

Keys come from the cloud environment (CODEBAD_R2_ACCESS_KEY_ID / CODEBAD_R2_SECRET_ACCESS_KEY);
the bucket name and account id are not secret and live in BUCKET below.

    python3 brand/_shared/store.py put FILE KEY        # upload, print a signed link (valid 6 h)
    python3 brand/_shared/store.py link KEY            # fresh signed link for an uploaded file
    python3 brand/_shared/store.py rm KEY              # delete one file
    python3 brand/_shared/store.py ls [PREFIX]         # list files under badroyale/
    python3 brand/_shared/store.py sweep [HOURS]       # delete badroyale/ files older than HOURS (default 48)

KEY is relative to badroyale/, e.g. shop-2026-10-29/video.mp4.
"""
import datetime
import os
import sys

import boto3
from botocore.config import Config

BUCKET = {"account_id": "231999c96851bc148ac14dfa00c54bae", "bucket": "usecodebad-media"}
ROOT = "badroyale/"
TYPES = {".mp4": "video/mp4", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".json": "application/json"}


def _client():
    kid = os.environ.get("CODEBAD_R2_ACCESS_KEY_ID") or os.environ.get("AWS_ACCESS_KEY_ID")
    sec = os.environ.get("CODEBAD_R2_SECRET_ACCESS_KEY") or os.environ.get("AWS_SECRET_ACCESS_KEY")
    if not (kid and sec):
        raise SystemExit("No R2 keys in this environment (CODEBAD_R2_ACCESS_KEY_ID / CODEBAD_R2_SECRET_ACCESS_KEY).")
    return boto3.client("s3", endpoint_url=f"https://{BUCKET['account_id']}.r2.cloudflarestorage.com",
                        aws_access_key_id=kid, aws_secret_access_key=sec, region_name="auto",
                        config=Config(signature_version="s3v4", retries={"max_attempts": 5}))


def _key(key):
    key = key.lstrip("/")
    if ".." in key.split("/"):
        raise SystemExit("Bad key: " + key)
    return key if key.startswith(ROOT) else ROOT + key


def link(key, seconds=6 * 3600):
    return _client().generate_presigned_url("get_object", Params={"Bucket": BUCKET["bucket"], "Key": _key(key)}, ExpiresIn=seconds)


def put(path, key):
    ext = os.path.splitext(path)[1].lower()
    _client().upload_file(path, BUCKET["bucket"], _key(key), ExtraArgs={"ContentType": TYPES.get(ext, "application/octet-stream")})
    return link(key)


def ls(prefix=""):
    c, out, token = _client(), [], None
    while True:
        kw = {"Bucket": BUCKET["bucket"], "Prefix": _key(prefix)}
        if token:
            kw["ContinuationToken"] = token
        r = c.list_objects_v2(**kw)
        out += r.get("Contents", [])
        if not r.get("IsTruncated"):
            return out
        token = r["NextContinuationToken"]


def rm(key):
    _client().delete_object(Bucket=BUCKET["bucket"], Key=_key(key))


def sweep(hours=48):
    cut = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=hours)
    old = [o["Key"] for o in ls() if o["LastModified"] < cut and o["Key"].startswith(ROOT)]
    for k in old:
        _client().delete_object(Bucket=BUCKET["bucket"], Key=k)
    return old


def main(a):
    if not a:
        raise SystemExit(__doc__)
    cmd = a[0]
    if cmd == "put":
        print(put(a[1], a[2]))
    elif cmd == "link":
        print(link(a[1]))
    elif cmd == "rm":
        rm(a[1]); print("deleted", _key(a[1]))
    elif cmd == "ls":
        for o in ls(a[1] if len(a) > 1 else ""):
            print(o["LastModified"].strftime("%Y-%m-%d %H:%M"), o["Size"], o["Key"])
    elif cmd == "sweep":
        old = sweep(float(a[1]) if len(a) > 1 else 48)
        print(len(old), "old files deleted")
    else:
        raise SystemExit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
