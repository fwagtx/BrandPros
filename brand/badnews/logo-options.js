/* BAD NEWS logo directions, round 3: built from Fortnite's visual language (chunky 3D lettering,
 * cel-shaded objects with thick outlines, game UI colors, objects from the game world), all drawn here.
 * No Epic or Fortnite logos, no skin art.
 */
(function () {
  "use strict";
  const { box, svg } = window.ASSETS.lib;
  const OUT = "#0B0D1A";

  // chunky game-title lettering: fill, thick outline, stacked extrusion, hard ground shadow
  function t3d(text, size, o = {}) {
    const { fill = "#FFFFFF", side = "#1B2A6B", out = OUT, depth = Math.round(size * 0.09), sw = size * 0.085, skew = -7, track = 1, lh = 0.88, top = null } = o;
    const sh = [];
    for (let i = 1; i <= depth; i++) sh.push(`${(i * 0.35).toFixed(1)}px ${i}px 0 ${side}`);
    sh.push(`${(depth * 0.35 + 2).toFixed(1)}px ${depth + Math.round(sw * 0.6)}px 0 ${out}`);
    sh.push(`${(depth * 0.35 + 4).toFixed(1)}px ${depth + Math.round(sw * 0.6) + size * 0.05}px 0 rgba(0,0,0,.28)`);
    const grad = top ? `background:linear-gradient(${top} 0 46%,${fill} 54%);-webkit-background-clip:text;background-clip:text;` : "";
    return `<span style="position:relative;display:inline-block;transform:skewX(${skew}deg);font-family:'Barlow Condensed';font-weight:900;font-size:${size}px;line-height:${lh};letter-spacing:${track}px;text-transform:uppercase;white-space:nowrap">
      <span style="position:absolute;left:0;top:0;color:${out};-webkit-text-stroke:${sw * 2}px ${out};text-shadow:${sh.join(",")}">${text}</span>
      <span style="position:relative;color:${fill};${grad}${top ? "color:transparent;" : ""}">${text}</span></span>`;
  }

  // ---------- icons (cel-shaded: flat base, one shadow tone, one highlight, thick dark outline) ----------
  // news microphone with a cube "mic flag"
  const mic = `
    <g stroke="${OUT}" stroke-width="14" stroke-linejoin="round" stroke-linecap="round">
      <path d="M182 268 L218 268 L232 470 L168 470 Z" fill="#2A2F45"/>
      <path d="M200 268 L218 268 L232 470 L200 470 Z" fill="#1A1E30" stroke="none"/>
      <path d="M182 268 L218 268 L232 470 L168 470 Z" fill="none"/>
      <path d="M118 182 L200 150 L282 182 L282 268 L200 300 L118 268 Z" fill="#E8352B"/>
      <path d="M200 150 L282 182 L282 268 L200 300 Z" fill="#B3221A" stroke="none"/>
      <path d="M118 182 L200 150 L282 182 L200 214 Z" fill="#FF5A4A" stroke="none"/>
      <path d="M118 182 L200 150 L282 182 L282 268 L200 300 L118 268 Z" fill="none"/>
      <path d="M118 182 L200 214 L282 182 M200 214 L200 300" fill="none"/>
      <circle cx="200" cy="96" r="78" fill="#9AA3BD"/>
      <path d="M200 18 A78 78 0 0 1 200 174 A62 78 0 0 0 200 18 Z" fill="#6E7894" stroke="none"/>
      <circle cx="200" cy="96" r="78" fill="none"/>
      <path d="M150 70 L250 70 M140 100 L260 100 M150 130 L250 130" stroke="#5A637E" stroke-width="8"/>
      <path d="M160 46 Q 176 34 194 32" stroke="#E3E8F6" stroke-width="12" fill="none"/>
    </g>
    <text x="158" y="258" font-family="Barlow Condensed" font-weight="900" font-size="64" fill="#fff" transform="skewY(-21 158 258)">BAD</text>`;
  // map pin with a newspaper inside
  const pin = `
    <g stroke="${OUT}" stroke-width="16" stroke-linejoin="round">
      <ellipse cx="200" cy="452" rx="92" ry="22" fill="rgba(0,0,0,.25)" stroke="none"/>
      <path d="M200 450 C 168 380 62 300 62 190 A138 138 0 0 1 338 190 C 338 300 232 380 200 450 Z" fill="#FFC81E"/>
      <path d="M200 52 A138 138 0 0 1 338 190 C 338 300 232 380 200 450 C 250 360 300 290 300 190 A120 138 0 0 0 200 52 Z" fill="#E59E00" stroke="none"/>
      <path d="M110 120 Q 140 76 190 70" stroke="#FFF2B0" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M200 450 C 168 380 62 300 62 190 A138 138 0 0 1 338 190 C 338 300 232 380 200 450 Z" fill="none"/>
      <rect x="128" y="132" width="144" height="120" rx="10" fill="#fff"/>
      <path d="M150 162 L250 162" stroke-width="16"/><path d="M150 196 L200 196 M150 224 L200 224" stroke-width="10"/>
      <rect x="214" y="190" width="38" height="38" fill="#E8352B" stroke-width="8"/>
    </g>`;
  // storm eye: swirl with a lightning bolt
  const storm = `
    <g stroke="${OUT}" stroke-width="16" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="200" cy="230" r="180" fill="#5B2BC8"/>
      <path d="M200 50 A180 180 0 0 1 380 230 A180 180 0 0 1 200 410 A150 180 0 0 0 200 50 Z" fill="#45209E" stroke="none"/>
      <path d="M90 170 Q 200 70 320 160 Q 230 120 150 175" fill="#8A5BFF" stroke-width="10"/>
      <path d="M80 280 Q 190 360 310 290 Q 220 330 130 285" fill="#8A5BFF" stroke-width="10"/>
      <circle cx="200" cy="230" r="180" fill="none"/>
      <path d="M222 92 L132 250 L196 250 L170 372 L272 196 L206 196 Z" fill="#FFD21E"/>
      <path d="M222 92 L206 196 L272 196 L240 250 L206 250 Z" fill="#F0A800" stroke="none"/>
      <path d="M222 92 L132 250 L196 250 L170 372 L272 196 L206 196 Z" fill="none"/>
    </g>`;

  const BLUE = "radial-gradient(circle at 50% 35%,#3DA6FF,#1A63E6 55%,#0E2F9E)";
  const PURPLE = "radial-gradient(circle at 50% 35%,#A45CFF,#6A2BD6 55%,#2C0F78)";
  const LEGEND = "radial-gradient(circle at 50% 35%,#FFC15A,#F08A1C 50%,#8A3B0E)";
  // subtle in-game card texture: soft diagonal light, no rays or glow
  const sheen = `linear-gradient(115deg,rgba(255,255,255,.18) 0 22%,transparent 22% 100%)`;

  const OPTS = {
    a: {
      name: "A · Item card", note: "The logo is an item-shop card: a news mic with a BAD mic flag on a Legendary card. Reads like something you'd unlock in game.",
      pfp: (S) => box(`inset:0;background:${sheen},${LEGEND}`) + box(`left:${S * 0.22}px;top:${S * 0.08}px`, svg(400, 480, mic, `width:${S * 0.56}px;height:${S * 0.67}px`)) +
        box(`left:0;right:0;bottom:${S * 0.06}px;height:${S * 0.25}px;background:linear-gradient(transparent,rgba(30,8,0,.55) 40%);display:flex;align-items:center;justify-content:center`, t3d("BAD NEWS", S * 0.15, { side: "#7A2E0A", depth: Math.round(S * 0.012) })),
      word: (h) => `<div style="display:flex;align-items:center;gap:${h * 0.12}px">${svg(400, 480, mic, `width:${h * 0.9}px;height:${h * 1.08}px`)}${t3d("BAD NEWS", h * 0.62, { side: "#B4521A", top: "#FFE6A8" })}</div>`,
      bg: LEGEND,
    },
    b: {
      name: "B · Map pin", note: "A map ping holding a newspaper. Ties straight to the Easter-egg series: we pin what's new on the island.",
      pfp: (S) => box(`inset:0;background:${sheen},${BLUE}`) + box(`left:${S * 0.18}px;top:${S * 0.06}px`, svg(400, 480, pin, `width:${S * 0.64}px;height:${S * 0.77}px`)) +
        box(`left:0;right:0;top:${S * 0.77}px;text-align:center`, t3d("BAD NEWS", S * 0.14, { side: "#0E2F9E", depth: Math.round(S * 0.012) })),
      word: (h) => `<div style="display:flex;align-items:center;gap:${h * 0.1}px">${svg(400, 480, pin, `width:${h * 0.85}px;height:${h * 1.02}px`)}${t3d("BAD NEWS", h * 0.62, { side: "#123FB5", top: "#FFFFFF", fill: "#DCE9FF" })}</div>`,
      bg: BLUE,
    },
    c: {
      name: "C · Storm alert", note: "The storm eye with a lightning bolt: breaking news as a storm warning. Purple and yellow, the most \"Fortnite\" of the four.",
      pfp: (S) => box(`inset:0;background:${sheen},${PURPLE}`) + box(`left:${S * 0.2}px;top:${S * 0.07}px`, svg(400, 430, storm, `width:${S * 0.6}px;height:${S * 0.645}px`)) +
        box(`left:0;right:0;top:${S * 0.72}px;text-align:center`, t3d("BAD NEWS", S * 0.15, { fill: "#FFD21E", side: "#8A4A00", top: "#FFF3A6", depth: Math.round(S * 0.012) })),
      word: (h) => `<div style="display:flex;align-items:center;gap:${h * 0.1}px">${svg(400, 430, storm, `width:${h * 0.95}px;height:${h * 1.02}px`)}${t3d("BAD NEWS", h * 0.62, { fill: "#FFD21E", side: "#8A4A00", top: "#FFF3A6" })}</div>`,
      bg: PURPLE,
    },
    d: {
      name: "D · Title lettering", note: "No icon, just the name as a game title: stacked 3D lettering, BAD in yellow over a blue NEWS plate, like a mode or event logo.",
      pfp: (S) => box(`inset:0;background:${sheen},${BLUE}`) + box(`left:0;right:0;top:${S * 0.17}px;text-align:center`, t3d("BAD", S * 0.44, { fill: "#FFD21E", side: "#B06A00", top: "#FFF3A6", depth: Math.round(S * 0.03) })) +
        box(`left:${S * 0.16}px;right:${S * 0.16}px;top:${S * 0.6}px;height:${S * 0.22}px;background:#0E2F9E;border:${S * 0.016}px solid ${OUT};border-radius:${S * 0.04}px;transform:skewX(-7deg);box-shadow:0 ${S * 0.02}px 0 ${OUT};display:flex;align-items:center;justify-content:center`,
          t3d("NEWS", S * 0.16, { side: "#071A5E", depth: Math.round(S * 0.01), skew: 0, track: S * 0.01 })),
      word: (h) => `<div style="display:flex;align-items:center;gap:${h * 0.12}px">${t3d("BAD", h * 0.9, { fill: "#FFD21E", side: "#B06A00", top: "#FFF3A6" })}<div style="background:#0E2F9E;border:${h * 0.03}px solid ${OUT};border-radius:${h * 0.06}px;transform:skewX(-7deg);padding:${h * 0.06}px ${h * 0.14}px;box-shadow:0 ${h * 0.04}px 0 ${OUT}">${t3d("NEWS", h * 0.5, { side: "#071A5E", skew: 0 })}</div></div>`,
      bg: BLUE,
    },
  };

  const circ = (k, d) => `<div style="position:relative;width:${d}px;height:${d}px;border-radius:50%;overflow:hidden;flex:none">${box(`left:0;top:0;width:1080px;height:1080px;transform:scale(${d / 1080});transform-origin:0 0`, OPTS[k].pfp(1080))}</div>`;
  function sheet() {
    const W = 2200, H = 1580;
    let s = box(`inset:0;background:#ECEEF2`);
    s += box(`left:60px;top:40px;font:700 42px Barlow;color:#14161C`, `BAD NEWS logo: four Fortnite-style directions`);
    s += box(`left:60px;top:98px;font:600 26px Barlow;color:#5A6070`, `Profile picture in a circle (big, 110 px, 40 px) and the wide version for banners. All drawn from scratch; no Epic logos or skin art.`);
    Object.keys(OPTS).forEach((k, i) => {
      const x = 60 + i * 528;
      s += box(`left:${x}px;top:170px;width:500px;height:1360px;background:#fff;border-radius:22px`);
      s += box(`left:${x + 50}px;top:200px`, circ(k, 400));
      s += box(`left:${x + 30}px;top:630px;width:440px;height:150px;background:#0C111F;border-radius:16px;display:flex;align-items:center;justify-content:center;gap:24px`, circ(k, 110) + circ(k, 40) + `<span style="font:600 24px Barlow;color:#fff">@badnewsfn</span>`);
      s += box(`left:${x + 30}px;top:800px;width:440px;height:260px;border-radius:16px;overflow:hidden;background:${OPTS[k].bg};display:flex;align-items:center;justify-content:center`, `<div style="transform:scale(.5);transform-origin:center">${OPTS[k].word(220)}</div>`);
      s += box(`left:${x + 34}px;top:1090px;width:432px;font:700 34px Barlow;color:#14161C`, OPTS[k].name);
      s += box(`left:${x + 34}px;top:1140px;width:432px;font:600 25px/1.45 Barlow;color:#3A4152`, OPTS[k].note);
    });
    return [W, H, s];
  }

  // ---------- name options, all in direction D (BAD over a blue plate) ----------
  const NAMES = [
    ["INTEL", "Gamer word for info. \"Got intel?\" Fits news and secrets, sounds like a squad callout."],
    ["DROP", "News drops, and so do players. The most Fortnite word there is."],
    ["PING", "A map ping marks what's new. Also a joke: bad ping means lag, so it sticks."],
    ["LOBBY", "Fortnite news lives in the lobby. Feels like the screen you see before every match."],
    ["PATCH", "Built around update days and patch notes. \"Bad patch\" is a joke players already make."],
    ["SCOOP", "Plain news word, friendly. Clear to anyone, less Fortnite-specific."],
  ];
  const named = (word, S) => box(`inset:0;background:${sheen},${BLUE}`) + box(`left:0;right:0;top:${S * 0.17}px;text-align:center`, t3d("BAD", S * 0.44, { fill: "#FFD21E", side: "#B06A00", top: "#FFF3A6", depth: Math.round(S * 0.03) })) +
    box(`left:${S * 0.16}px;right:${S * 0.16}px;top:${S * 0.6}px;height:${S * 0.22}px;background:#0E2F9E;border:${S * 0.016}px solid ${OUT};border-radius:${S * 0.04}px;transform:skewX(-7deg);box-shadow:0 ${S * 0.02}px 0 ${OUT};display:flex;align-items:center;justify-content:center`,
      t3d(word, S * (word.length > 4 ? 0.15 : 0.16), { side: "#071A5E", depth: Math.round(S * 0.01), skew: 0, track: S * 0.01 }));
  const ncirc = (w, d) => `<div style="position:relative;width:${d}px;height:${d}px;border-radius:50%;overflow:hidden;flex:none">${box(`left:0;top:0;width:1080px;height:1080px;transform:scale(${d / 1080});transform-origin:0 0`, named(w, 1080))}</div>`;
  const nwide = (w, h) => `<div style="display:flex;align-items:center;gap:${h * 0.12}px">${t3d("BAD", h * 0.9, { fill: "#FFD21E", side: "#B06A00", top: "#FFF3A6" })}<div style="background:#0E2F9E;border:${h * 0.03}px solid ${OUT};border-radius:${h * 0.06}px;transform:skewX(-7deg);padding:${h * 0.06}px ${h * 0.14}px;box-shadow:0 ${h * 0.04}px 0 ${OUT}">${t3d(w, h * 0.5, { side: "#071A5E", skew: 0 })}</div></div>`;
  function nameSheet() {
    const W = 2160, H = 1560;
    let s = box(`inset:0;background:#ECEEF2`);
    s += box(`left:60px;top:40px;font:700 42px Barlow;color:#14161C`, `New name options, in the title-lettering style`);
    s += box(`left:60px;top:98px;font:600 26px Barlow;color:#5A6070`, `Every name keeps BAD up front, so the channel name is the code. Profile picture, 110 px / 40 px, and the wide logo.`);
    NAMES.forEach(([w, note], i) => {
      const x = 60 + (i % 3) * 690, y = 160 + Math.floor(i / 3) * 690;
      s += box(`left:${x}px;top:${y}px;width:660px;height:660px;background:#fff;border-radius:22px`);
      s += box(`left:${x + 30}px;top:${y + 30}px`, ncirc(w, 300));
      s += box(`left:${x + 360}px;top:${y + 40}px;display:flex;flex-direction:column;gap:22px;align-items:center;width:270px;background:#0C111F;border-radius:16px;padding:22px 0`, ncirc(w, 110) + ncirc(w, 40) + `<span style="font:600 22px Barlow;color:#fff">@bad${w.toLowerCase()}fn</span>`);
      s += box(`left:${x + 30}px;top:${y + 360}px;width:600px;height:150px;border-radius:14px;overflow:hidden;background:${BLUE};display:flex;align-items:center;justify-content:center`, `<div style="transform:scale(.42);transform-origin:center">${nwide(w, 220)}</div>`);
      s += box(`left:${x + 34}px;top:${y + 530}px;font:700 34px Barlow;color:#14161C`, `BAD ${w}`);
      s += box(`left:${x + 34}px;top:${y + 576}px;width:600px;font:600 23px/1.4 Barlow;color:#3A4152`, note);
    });
    return [W, H, s];
  }

  window.ASSETS.add({
    "_direction/name-options": nameSheet,
    "_direction/badnews-logo-round3": sheet,
    ...Object.fromEntries(Object.keys(OPTS).map((k) => [`_direction/badnews-logo-round3-${k}-pfp`, () => [1080, 1080, OPTS[k].pfp(1080)]])),
    ...Object.fromEntries(Object.keys(OPTS).map((k) => [`_direction/badnews-logo-round3-${k}-wide`, () => [1600, 520, box(`inset:0;background:${OPTS[k].bg}`) + box(`left:0;top:0;width:1600px;height:520px;display:flex;align-items:center;justify-content:center`, OPTS[k].word(300))]])),
  });
})();
