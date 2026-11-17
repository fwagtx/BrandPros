# CÓDIGO BAD · daily playbook (Brazilian Portuguese Fortnite channel)

Metricool brand **8179363** only (CodigoBad; still labelled "ElFortniteBadPGSE"). Never read or write any other brand.
Networks: YouTube (Shorts + long videos), TikTok, Instagram Reels, Facebook Reels. Timezone America/Chicago; Brasília is +3h (winter) / +2h (summer).

## Every day (one run, start about 09:30 Chicago)
1. `git pull`, `bash brand/badroyale/auto/setup.sh` (installs kokoro-onnx, boto3, Playwright check, voice model; sweeps R2).
2. `cd brand/codigobad && python3 make_day.py <today YYYY-MM-DD>` → shop data in pt-BR, art, three shorts' data files, long video script.
3. Voice for the long video: `python3 ../_shared/voice/vo.py video/long-<day>-og25/vo.json video/long-<day>-og25/vo.wav video/long-<day>-og25/timings.json`,
   then `(cat video/long-<day>-og25/items.js; echo "window.VO=$(cat video/long-<day>-og25/timings.json);") > video/long-<day>-og25/data.js`.
4. Render (FFMPEG=path to ffmpeg; from brand/codigobad/video):
   - shorts: `node render-pack.mjs grabs/scene.js dia-<day>/codigobad-<key>-<day>.mp4 --data dia-<day>/<key>.js --fps 30` for s1-pacotoes, s2-chegou-hoje, s3-sai-hoje;
     cover: same with `--stills 3.9 --stillsDir dia-<day>/cover-<key>` (frame t03.90.png).
   - long: `node render-pack.mjs long/scene.js long-<day>-og25/codigobad-og25-<day>.mp4 --data long-<day>-og25/data.js --voice long-<day>-og25/vo.wav --size 1920x1080 --fps 30`;
     thumbnail: `node render-pack.mjs long/thumb.js x.mp4 --data long-<day>-og25/items.js --size 1280x720 --stills 0 --stillsDir long-<day>-og25/thumb`.
5. QC: look at a contact sheet of each video (ffmpeg select frames). Names readable, no clipped pill, #EpicPartner on the sticker, code box at the end. Loudness −14 to −16 LUFS. Portuguese reads naturally. If anything is off, fix and re-render; never post a broken video.
6. Host: `python3 brand/_shared/store.py put <file> codigobad-<day>/<name>` for every mp4, cover png and thumbnail (signed links, 6 h).
7. Schedule with createScheduledPost on blogId 8179363 (see posts/<day>.json for copy; chapters from timings.json):
   - 12:30 CT s2-chegou-hoje · 14:30 CT s1-pacotoes · 16:30 CT s3-sai-hoje, each on youtube (type short), tiktok, instagram (REEL), facebook (REEL), with videoThumbnailUrl = cover.
   - Mon/Wed/Sat 15:00 CT the long video on youtube (type video) with the thumbnail.
   - Every caption starts with #EpicPartner; tiktokData.commercialContentThirdParty true; isAiGenerated / isAigc / isAiGeneratedContent false; madeForKids false; category GAMING.
   - Everything about today's shop posts before 18:00 CT (the shop resets then). If the run starts late, compress the slots, never cross the reset.
8. Verify with getScheduledPosts (D 00:00 to D 23:59), then `store.py rm` the hosted copies. Commit small files only (data, posts, scripts), push to the working branch.
9. Log one line per run in brand/codigobad/auto/log.md.

## Rules
- Facts only from today's shop file; names, types, rarities are Epic's pt-BR strings. No leaks, no invented dates.
- Code wording: "Usa o código BAD na Loja de Itens". Never desconto, grátis, economize (as a promise), exclusivo, oficial, parceiro oficial, patrocinado pela Epic. "economia de X" states the bundle's own price difference, which is factual.
- Pack visual style only (lime sticker, blurred rarity background, tiles, pills). No captions on shorts. Narration only on long videos.
- Skip a slot rather than post something weak or wrong.
