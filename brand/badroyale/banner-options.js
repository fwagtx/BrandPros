/* BAD ROYALE banner / cover directions (round 2): four different worlds for the YouTube banner and Facebook cover.
 * All drawn here: no Epic or Fortnite logos, no game or skin art.
 * Layout rule for every option: logo, tagline and disclosure stay inside the area every device shows
 * (YouTube: 1546x423 center; Facebook: middle ~1000 px).
 */
(function () {
  "use strict";
  const { box, svg } = window.ASSETS.lib;
  const { lockup, C } = window.BRAND_ROYALE;
  const INK = C.ink;

  const disclosure = (size) => `<div style="padding:5px 16px;border-radius:22px;background:rgba(7,15,50,.6)"><span style="font:700 ${size}px Barlow;letter-spacing:1px;color:#fff">#EpicPartner · fan-run, not affiliated with Epic Games</span></div>`;
  const center = (x, y, w, h, logo, disc) => box(`left:${x}px;top:${y}px;width:${w}px;height:${h}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px`, lockup(logo, true) + disclosure(disc));
  // seeded random so every render matches
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // irregular island outline
  function blob(cx, cy, r, seed, n = 14) {
    const R = rng(seed); let d = "";
    const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, rr = r * (0.72 + R() * 0.5); return [cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr]; });
    pts.forEach((p, i) => { const q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; d += i ? `Q${p[0].toFixed(0)} ${p[1].toFixed(0)} ${m[0].toFixed(0)} ${m[1].toFixed(0)} ` : `M${m[0].toFixed(0)} ${m[1].toFixed(0)} `; });
    return d + "Z";
  }
  const pin = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C -8 -18 -34 -34 -34 -60 A34 34 0 0 1 34 -60 C 34 -34 8 -18 0 0 Z" fill="${C.yellow}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><text x="0" y="-48" text-anchor="middle" font-family="Barlow Condensed" font-weight="900" font-size="44" fill="${INK}">!</text></g>`;
  const bolt = (x, y, s, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M22 -120 L-60 20 L-4 20 L-26 130 L66 -30 L8 -30 Z" fill="${C.yellow}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/></g>`;

  // ---------- 1. ISLAND MAP: drawn islands, dashed route, map pins ----------
  function map(W, H, cx, cy, cw, ch, logo, disc) {
    const R = rng(11);
    let isl = "", pins = [];
    const band = [[0.06, 0.45, 0.42], [0.2, 0.62, 0.3], [0.86, 0.4, 0.4], [0.95, 0.75, 0.3]];   // x of W, y of band, r of band height
    const outer = H > 900 ? [[0.12, 0.12, 0.09], [0.45, 0.07, 0.06], [0.78, 0.1, 0.08], [0.25, 0.9, 0.08], [0.62, 0.93, 0.07], [0.92, 0.88, 0.07]] : [];
    const draw = (x, y, r, sd) => `<path d="${blob(x, y, r * 1.12, sd)}" fill="#F3D58A" stroke="${INK}" stroke-width="8"/><path d="${blob(x, y, r * 0.92, sd)}" fill="#46B04A"/><path d="${blob(x + r * 0.15, y - r * 0.1, r * 0.45, sd + 50)}" fill="#2F8A3A"/>`;
    const bandX0 = H > 900 ? 0 : 0;
    band.forEach(([fx, fy, fr], i) => { const x = fx * W, y = cy + fy * ch, r = fr * ch; isl += draw(x, y, r, 40 + i); pins.push([x + r * 0.25, y - r * 0.05]); });
    outer.forEach(([fx, fy, fr], i) => { isl += draw(fx * W, fy * H, fr * W * 0.6, 70 + i); });
    const route = pins.map((p, i) => (i ? "L" : "M") + p[0].toFixed(0) + " " + p[1].toFixed(0)).join(" ");
    let s = box(`inset:0;background:radial-gradient(ellipse 80% 90% at 50% 50%,#2A8BE8,#0F4FB8 70%,#0A3A8F)`);
    s += box(`inset:0;background:repeating-radial-gradient(circle at 50% 50%,rgba(255,255,255,.05) 0 3px,transparent 3px 60px)`);
    s += box(`left:0;top:0`, svg(W, H, `${isl}<path d="${route}" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="4 18" stroke-linecap="round" opacity=".9"/>${pins.map(([x, y]) => pin(x, y, ch / 420)).join("")}`));
    // a soft plate under the logo so the map never fights the lettering
    s += box(`left:${cx + cw * 0.12}px;top:${cy + ch * 0.06}px;width:${cw * 0.76}px;height:${ch * 0.88}px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(10,58,143,.75),transparent 70%)`);
    return s + center(cx, cy, cw, ch, logo, disc);
  }

  // ---------- 2. STORM: purple storm wall, lightning, the storm-edge ring ----------
  function storm(W, H, cx, cy, cw, ch, logo, disc) {
    let s = box(`inset:0;background:radial-gradient(ellipse 60% 85% at 50% 50%,#7B3BEA,#4A1BA8 45%,#1E0A55 85%)`);
    let swirl = "";
    for (let i = 0; i < 9; i++) swirl += `<ellipse cx="${W / 2}" cy="${H / 2}" rx="${W * (0.18 + i * 0.07)}" ry="${H * (0.2 + i * 0.09)}" fill="none" stroke="rgba(190,140,255,${0.16 - i * 0.012})" stroke-width="${W * 0.02}" transform="rotate(${i * 7 - 20} ${W / 2} ${H / 2})"/>`;
    const u = H / 1000;
    s += box(`left:0;top:0`, svg(W, H, `${swirl}
      <ellipse cx="${W / 2}" cy="${H / 2}" rx="${W * 0.42}" ry="${H * 0.62}" fill="none" stroke="#FF6BD6" stroke-width="${8 * u + 4}" stroke-dasharray="${60 * u} ${26 * u}" opacity=".85"/>
      ${bolt(W * 0.1, H * 0.48, 1.3 * u + 0.4, -12)}${bolt(W * 0.9, H * 0.5, 1.5 * u + 0.4, 14)}${bolt(W * 0.22, H * 0.2, 0.7 * u + 0.25, 8)}${bolt(W * 0.8, H * 0.82, 0.8 * u + 0.25, -10)}`));
    s += box(`inset:0;background:radial-gradient(ellipse 30% 40% at 50% 50%,rgba(30,10,85,.55),transparent 70%)`);
    return s + center(cx, cy, cw, ch, logo, disc);
  }

  window.__stormArt = (W, H) => {
    let swirl = "";
    for (let i = 0; i < 9; i++) swirl += `<ellipse cx="${W / 2}" cy="${H / 2}" rx="${W * (0.18 + i * 0.07)}" ry="${H * (0.2 + i * 0.09)}" fill="none" stroke="rgba(190,140,255,${0.16 - i * 0.012})" stroke-width="${W * 0.02}" transform="rotate(${i * 7 - 20} ${W / 2} ${H / 2})"/>`;
    const u = H / 1000;
    return svg(W, H, `${swirl}<ellipse cx="${W / 2}" cy="${H / 2}" rx="${W * 0.42}" ry="${H * 0.62}" fill="none" stroke="#FF6BD6" stroke-width="${8 * u + 4}" stroke-dasharray="${60 * u} ${26 * u}" opacity=".85"/>
      ${bolt(W * 0.1, H * 0.48, 1.3 * u + 0.4, -12)}${bolt(W * 0.9, H * 0.5, 1.5 * u + 0.4, 14)}${bolt(W * 0.22, H * 0.2, 0.7 * u + 0.25, 8)}${bolt(W * 0.8, H * 0.82, 0.8 * u + 0.25, -10)}`) +
      box(`inset:0;background:radial-gradient(ellipse 30% 40% at 50% 50%,rgba(30,10,85,.55),transparent 70%)`);
  };

  // ---------- 3. SUPPLY DROP: a BAD crate drifting in on a balloon ----------
  function drop(W, H, cx, cy, cw, ch, logo, disc, side = "right") {
    let s = box(`inset:0;background:linear-gradient(180deg,#7FD3FF,#3DA6FF 45%,#1A63E6)`);
    const u = H / 1000;
    const crate = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})">
      <path d="M0 -330 C -120 -330 -170 -250 -170 -170 C -170 -90 -90 -40 0 -30 C 90 -40 170 -90 170 -170 C 170 -250 120 -330 0 -330 Z" fill="#E8352B" stroke="${INK}" stroke-width="10"/>
      <path d="M0 -330 C -50 -300 -60 -160 0 -30 C 60 -160 50 -300 0 -330 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="8"/>
      <path d="M-60 -40 L-90 60 M60 -40 L90 60 M0 -30 L0 60" stroke="${INK}" stroke-width="7"/>
      <rect x="-120" y="60" width="240" height="190" rx="12" fill="#1F6FE5" stroke="${INK}" stroke-width="10"/>
      <rect x="-120" y="60" width="240" height="44" fill="${C.yellow}" stroke="${INK}" stroke-width="8"/>
      <path d="M-120 104 L120 250 M120 104 L-120 250" stroke="#0E2F9E" stroke-width="10"/>
      <rect x="-70" y="142" width="140" height="70" rx="8" fill="${C.yellow}" stroke="${INK}" stroke-width="7"/>
      <text x="0" y="198" text-anchor="middle" font-family="Barlow Condensed" font-weight="900" font-size="62" fill="${INK}">BAD</text></g>`;
    const puff = (x, y, w) => `<g transform="translate(${x} ${y}) scale(${w / 400})" opacity=".95"><circle cx="0" cy="0" r="80" fill="#fff"/><circle cx="100" cy="-30" r="100" fill="#fff"/><circle cx="210" cy="0" r="80" fill="#fff"/><rect x="0" y="0" width="210" height="80" fill="#fff"/></g>`;
    const k = ch / 640;
    const bx = W > 2000 ? W * 0.9 : W * 0.89, sx = W > 2000 ? W * 0.1 : W * 0.11;
    s += box(`left:0;top:0`, svg(W, H, `${H > 900 ? puff(W * 0.04, H * 0.14, 520) + puff(W * 0.7, H * 0.08, 460) + puff(W * 0.38, H * 0.88, 560) : ""}
      ${puff(W * 0.2, cy + ch * 0.82, ch * 0.6)}${puff(W * 0.66, cy + ch * 0.12, ch * 0.5)}
      ${crate(bx, cy + ch * 0.4, k)}${crate(sx, cy + ch * 0.48, k * 0.75)}`));
    return s + center(cx, cy, cw, ch, logo, disc);
  }

  // ---------- 4. COMIC BURST: yellow halftone, ink shards, big logo ----------
  function comic(W, H, cx, cy, cw, ch, logo, disc) {
    let s = box(`inset:0;background:${C.yellow}`);
    s += box(`inset:0;background-image:radial-gradient(circle,rgba(230,140,0,.55) 22%,transparent 24%);background-size:26px 26px;-webkit-mask-image:radial-gradient(ellipse 70% 80% at 50% 50%,transparent 30%,#000 75%);mask-image:radial-gradient(ellipse 70% 80% at 50% 50%,transparent 30%,#000 75%)`);
    const R = rng(7); let shards = "";
    for (let i = 0; i < 14; i++) {
      const left = i % 2 === 0, x = left ? R() * W * 0.22 : W - R() * W * 0.22, y = R() * H, sz = (60 + R() * 140) * (H / 1000 + 0.4);
      const col = [C.blue, "#fff", C.deep, "#E8352B"][i % 4];
      shards += `<path d="M${x} ${y} l${sz} ${-sz * 0.35} l${-sz * 0.25} ${sz * 0.9} Z" fill="${col}" stroke="${INK}" stroke-width="7" stroke-linejoin="round" transform="rotate(${R() * 360} ${x} ${y})"/>`;
    }
    s += box(`left:0;top:0`, svg(W, H, shards));
    s += box(`left:${cx}px;top:${cy}px;width:${cw}px;height:${ch}px;display:flex;align-items:center;justify-content:center`,
      `<div style="width:${cw * 0.62}px;height:${ch * 0.96}px;background:${C.blue};border:10px solid ${INK};transform:skewX(-8deg) rotate(-2deg);box-shadow:14px 14px 0 ${INK}"></div>`);
    return s + center(cx, cy, cw, ch, logo, disc);
  }

  const OPTS = { map: ["A · Island map", map], storm: ["B · Storm", storm], drop: ["C · Supply drop", drop], comic: ["D · Comic burst", comic] };
  // YouTube: center 1546x423 is what every device shows
  const yt = (fnc) => [2560, 1440, fnc(2560, 1440, 507, 508, 1546, 423, 190, 22)];
  const fb = (fnc) => [1640, 624, fnc(1640, 624, 320, 50, 1000, 524, 160, 20)];

  // comparison sheet: desktop band of the YouTube banner, the full TV view, and the Facebook cover
  function sheet() {
    const W = 2200, rowH = 480;
    let s = box(`inset:0;background:#ECEEF2`);
    s += box(`left:60px;top:36px;font:700 42px Barlow;color:#14161C`, `Banner and cover options`);
    s += box(`left:60px;top:92px;font:600 25px Barlow;color:#5A6070`, `Left: YouTube as desktop shows it (full-width strip). Middle: the full banner as a TV shows it. Right: the Facebook cover.`);
    Object.entries(OPTS).forEach(([k, [name, fnc]], i) => {
      const y = 150 + i * rowH;
      const scaled = (w, h, html, tw, crop) => `<div style="position:relative;width:${tw}px;height:${(crop ? crop.h : h) * tw / (crop ? crop.w : w)}px;overflow:hidden;border-radius:10px">${box(`left:${crop ? -crop.x * tw / crop.w : 0}px;top:${crop ? -crop.y * tw / crop.w : 0}px;width:${w}px;height:${h}px;transform:scale(${tw / (crop ? crop.w : w)});transform-origin:0 0`, html)}</div>`;
      const [yw, yh, yhtml] = yt(fnc), [fw, fh, fhtml] = fb(fnc);
      s += box(`left:60px;top:${y}px;font:700 34px Barlow;color:#14161C`, name);
      s += box(`left:60px;top:${y + 52}px`, scaled(yw, yh, yhtml, 1000, { x: 0, y: 508, w: 2560, h: 423 }));
      s += box(`left:1090px;top:${y + 52}px`, scaled(yw, yh, yhtml, 470));
      s += box(`left:1590px;top:${y + 52}px`, scaled(fw, fh, fhtml, 550));
    });
    return [W, 150 + 4 * rowH + 20, s];
  }

  const add = { "_direction/banner-options": sheet };
  Object.entries(OPTS).forEach(([k, [, fnc]]) => {
    add[`_direction/banner-${k}-youtube-2560x1440`] = () => yt(fnc);
    add[`_direction/banner-${k}-facebook-1640x624`] = () => fb(fnc);
  });
  window.ASSETS.add(add);
})();

/* Tagline options, shown on the Storm banner as desktop sees it. Disclosure trimmed to the required #EpicPartner tag. */
(function () {
  "use strict";
  const { box } = window.ASSETS.lib;
  const { lockup, C } = window.BRAND_ROYALE;
  const TAGS = [
    ["", "No tagline: just the logo"],
    ["What's new on the Island. Every day.", "Says what the channel is, in Fortnite words"],
    ["Every update. Every secret.", "Short and punchy, covers news and Easter eggs"],
    ["Drop in. Catch up.", "A play on dropping from the bus"],
    ["The Island, explained.", "Calm and confident, like a show title"],
    ["Use code BAD in the Item Shop", "Turns the banner into the ask"],
  ];
  // storm backdrop (same drawing as option B), with a custom tagline
  function banner(tag) {
    const W = 2560, H = 1440, cx = 507, cy = 508, cw = 1546, ch = 423;
    let s = box(`inset:0;background:radial-gradient(ellipse 60% 85% at 50% 50%,#7B3BEA,#4A1BA8 45%,#1E0A55 85%)`);
    const strip = box(`left:0;top:0;width:${W}px;height:${H}px`, window.__stormArt ? window.__stormArt(W, H) : "");
    const tagHtml = tag ? `<div style="font:800 ${tag.length > 30 ? 46 : 52}px Barlow;letter-spacing:4px;text-transform:uppercase;color:#fff;text-shadow:0 4px 0 ${C.ink}">${tag.replace("BAD", `<span style="color:${C.yellow}">BAD</span>`)}</div>` : "";
    const chip = `<div style="padding:4px 16px;border-radius:20px;background:rgba(7,15,50,.6);font:700 24px Barlow;color:#fff;letter-spacing:1px">#EpicPartner</div>`;
    return s + strip + box(`left:${cx}px;top:${cy}px;width:${cw}px;height:${ch}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px`, lockup(tag ? 200 : 230) + tagHtml + chip);
  }
  function sheet() {
    const tw = 1000, th = 423 * tw / 2560, W = 2160, rowH = th + 90;
    let s = box(`inset:0;background:#ECEEF2`);
    s += box(`left:60px;top:36px;font:700 42px Barlow;color:#14161C`, `Tagline options (on the Storm banner, as desktop shows it)`);
    s += box(`left:60px;top:92px;font:600 25px Barlow;color:#5A6070`, `The long "fan-run, not affiliated" line is gone; the small #EpicPartner tag is the part Epic requires.`);
    TAGS.forEach(([tag, why], i) => {
      const x = 60 + (i % 2) * (tw + 40), y = 150 + Math.floor(i / 2) * rowH;
      s += box(`left:${x}px;top:${y}px;width:${tw}px;height:${th}px;overflow:hidden;border-radius:10px`, box(`left:0;top:${-508 * tw / 2560}px;width:2560px;height:1440px;transform:scale(${tw / 2560});transform-origin:0 0`, banner(tag)));
      s += box(`left:${x}px;top:${y + th + 10}px;font:700 26px Barlow;color:#14161C`, `${i + 1} · ${tag || "No tagline"} <span style="font-weight:600;color:#5A6070">· ${why}</span>`);
    });
    return [W, Math.ceil(150 + 3 * rowH + 20), s];
  }
  window.ASSETS.add({ "_direction/tagline-options": sheet });
})();
