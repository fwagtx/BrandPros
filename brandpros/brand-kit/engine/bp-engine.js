/* BrandPros render engine v2
 * Identity: The Slice ("brandpros" with a pie-chart o, one tangerine slice pulled out): ink, white/paper, tangerine.
 * Look: hand-inked lines that boil (3 drawings swapped 8x/sec), paper grain and halftone, motion on twos (12 fps),
 * cut-paper labels with tape, marker annotations, captions on a paper strip.
 * No real logos, mascots or trade-dress colors of any company are drawn: brands are identified by handwritten labels,
 * and a company's name is never set in that company's brand colors.
 *
 *  BP.frameS01(t) -> 1080x1920 SVG for Short S01 at t seconds   BP.S01.duration
 *  BP.thumbLF01("A"|"B"), BP.avatar(), BP.wordmark(dark), BP.sealAsset(), BP.mascotSheet(), BP.ytBanner()
 */
(function (root) {
  "use strict";

  const C = {
    ledger: "#141414", ledger2: "#262626", ledger3: "#3D3D3D", tang: "#F26B1D", tangLight: "#FF8A3D",
    cream: "#F2EAD7", red: "#C8372D", redLight: "#E8735F", mint: "#8FD1AE", brass: "#C49A3A", brassDeep: "#9C7526",
    ink: "#141414", slate: "#5E6B73", hl: "#FFA463", white: "#FFFDF6",
    skinA: "#EFC6A4", skinB: "#D6A07C", skinC: "#9C6644",
    pCream: "#EDE3CC", pMint: "#CFE3D6", pSand: "#E4D2AE", pSepia: "#D6C49F", pBrass: "#E3C47E", pGreen: "#8FB39A",
    track: "#B8674A", tape: "#F4EACB", sky: "#BFD3D6",
  };
  const OL = 8;
  const F = {
    display: "'Bricolage Grotesque', 'Arial Black', sans-serif",
    body: "Inter, 'Helvetica Neue', Arial, sans-serif",
    serif: "'DM Serif Display', Georgia, serif",
    marker: "'Permanent Marker', 'Comic Sans MS', cursive",
  };

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const eOut = (t) => 1 - Math.pow(1 - t, 3);
  const eInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const wob = (t, f = 1, a = 1) => Math.sin(t * Math.PI * 2 * f) * a;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const g = (inner, tf = "", extra = "") => `<g${tf ? ` transform="${tf}"` : ""}${extra ? " " + extra : ""}>${inner}</g>`;
  const S = (fill, sw = OL) => `fill="${fill}" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;

  let _mctx = null;
  function measure(str, font, perChar) {
    try {
      if (!_mctx && typeof document !== "undefined") _mctx = document.createElement("canvas").getContext("2d");
      if (_mctx) { _mctx.font = font; return _mctx.measureText(str).width; }
    } catch (e) { /* fall through */ }
    return str.length * perChar;
  }
  function text(str, x, y, o = {}) {
    const size = o.size || 80;
    const stroke = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || size * 0.14}" stroke-linejoin="round" paint-order="stroke"` : "";
    const ls = o.ls ? ` letter-spacing="${o.ls}"` : "";
    const it = o.italic ? ` font-style="italic"` : "";
    return `<text x="${x}" y="${y}" font-family="${o.font || F.display}" font-size="${size}" font-weight="${o.weight || ((o.font || F.display) === F.display ? 800 : 400)}"${it} fill="${o.fill || C.ink}" text-anchor="${o.anchor || "middle"}"${ls}${stroke}>${esc(str)}</text>`;
  }

  // ---------- per-render ids and shared defs ----------
  let _uid = 0, ID = {};
  function makeDefs(seed, o = {}) {
    const n = ++_uid;
    ID = { rough: `rg${n}`, roughT: `rt${n}`, grain: `gr${n}`, blot: `bl${n}`, vig: `vg${n}`,
      dI: `di${n}`, dB: `db${n}`, dR: `dr${n}`, dC: `dc${n}`, key: (k) => `k${n}${k}` };
    const amp = o.amp === undefined ? 6 : o.amp;
    const dots = (id, col, op, size = 16, r = 3.6) => `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${col}" opacity="${op}"/></pattern>`;
    return `<defs>
      <filter id="${ID.rough}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${amp}" xChannelSelector="R" yChannelSelector="G"/></filter>
      <filter id="${ID.roughT}" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${seed + 11}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${Math.max(2, amp * 0.4)}" xChannelSelector="R" yChannelSelector="G"/></filter>
      <filter id="${ID.grain}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.17  0 0 0 0 0.1  0 0 0 0.9 -0.28"/></filter>
      <filter id="${ID.blot}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.12  0 0 0 1.4 -0.62"/></filter>
      <radialGradient id="${ID.vig}" cx="50%" cy="48%" r="75%"><stop offset="60%" stop-color="${C.ink}" stop-opacity="0"/><stop offset="100%" stop-color="${C.ink}" stop-opacity="0.26"/></radialGradient>
      ${dots(ID.dI, C.ink, 0.2)}${dots(ID.dB, C.brassDeep, 0.5)}${dots(ID.dR, C.red, 0.45)}${dots(ID.dC, C.cream, 0.14)}
    </defs>`;
  }
  const paperOverlay = (w, h, k = 1) =>
    `<rect width="${w}" height="${h}" filter="url(#${ID.blot})" opacity="${0.22 * k}"/>` +
    `<rect width="${w}" height="${h}" filter="url(#${ID.grain})" opacity="${0.55 * k}"/>` +
    `<rect width="${w}" height="${h}" fill="url(#${ID.vig})"/>`;
  const rough = (inner) => g(inner, "", `filter="url(#${ID.rough})"`);
  const roughT = (inner) => g(inner, "", `filter="url(#${ID.roughT})"`);
  const halftone = (cx, cy, r, which = "dI") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${ID[which]})"/>`;
  const paper = (col) => `<rect x="-300" y="-300" width="3200" height="2600" fill="${col}"/>`;

  // ---------- hand-made pieces ----------
  const note = (str, x, y, o = {}) => g(text(str, 0, 0, { size: o.size || 46, font: F.marker, fill: o.fill || C.ink, anchor: o.anchor || "middle" }), `translate(${x} ${y}) rotate(${o.rot || -4})`);
  function arrow(x1, y1, x2, y2, o = {}) {
    const col = o.col || C.ink, bend = o.bend === undefined ? 0.25 : o.bend;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, cx = mx - (y2 - y1) * bend, cy = my + (x2 - x1) * bend;
    const a = Math.atan2(y2 - cy, x2 - cx), L = 30;
    return `<path d="M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2} M ${x2 - L * Math.cos(a - 0.5)} ${y2 - L * Math.sin(a - 0.5)} L ${x2} ${y2} L ${x2 - L * Math.cos(a + 0.5)} ${y2 - L * Math.sin(a + 0.5)}" fill="none" stroke="${col}" stroke-width="${o.w || 7}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  function scribbleUnder(x1, x2, y, col = C.red) {
    let d = `M ${x1} ${y}`;
    for (let i = 1; i <= 6; i++) d += ` L ${lerp(x1, x2, i / 6)} ${y + (i % 2 ? 10 : -6)}`;
    return `<path d="${d}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`;
  }
  const tape = (x, y, w, h, rot) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${C.tape}" opacity="0.8" transform="translate(${x} ${y}) rotate(${rot})"/>`;
  function label(str, o = {}) {
    const kind = o.kind || "cream", maxW = o.maxW || 960;
    let size = o.size || 110;
    const tw = (sz) => measure(str, `800 ${sz}px 'Bricolage Grotesque'`, sz * 0.6);
    if (tw(size) + size * 0.55 > maxW) size = size * (maxW / (tw(size) + size * 0.55));
    const bgc = { cream: C.cream, tang: C.tang, red: C.red, green: C.ledger2, ink: C.ledger, mint: C.mint }[kind];
    const ink = kind === "red" || kind === "green" || kind === "ink" ? C.cream : C.ink;
    const w = tw(size) + size * 0.55, h = size * 1.12;
    let s = `<rect x="${-w / 2 + 8}" y="${-h * 0.82 + 10}" width="${w}" height="${h}" fill="${C.ink}" opacity="0.2"/>`;
    s += `<rect x="${-w / 2}" y="${-h * 0.82}" width="${w}" height="${h}" fill="${bgc}" stroke="${C.ink}" stroke-width="4"/>`;
    s += text(str, 0, size * 0.1, { size, fill: ink });
    s += tape(-w / 2 + 4, -h * 0.82 - size * 0.02, size * 0.62, size * 0.22, -38);
    return s;
  }

  // ---------- identity: the Keyhole Seal ----------
  const keyholePath = (k = 1) => `M ${-26 * k} ${5.5 * k} A ${44 * k} ${44 * k} 0 1 1 ${26 * k} ${5.5 * k} L ${42 * k} ${92 * k} Q ${42 * k} ${98 * k} ${36 * k} ${98 * k} L ${-36 * k} ${98 * k} Q ${-42 * k} ${98 * k} ${-42 * k} ${92 * k} Z`;
  // Seal centred at 0,0, radius 200. rim: true draws the engraved motto ring.
  function seal(o = {}) {
    const R = 200, ring = o.ring || C.ledger, face = o.face || C.cream, hole = o.hole || C.ledger;
    let s = `<circle r="${R}" fill="${ring}"/>`;
    s += `<circle r="${R - 12}" fill="none" stroke="${face}" stroke-width="3"/>`;
    if (o.rim) {
      const pid = ID.key("rim" + (o.idk || ""));
      s += `<path id="${pid}" d="M 0 ${-(R - 44)} A ${R - 44} ${R - 44} 0 1 1 -0.01 ${-(R - 44)}" fill="none"/>`;
      s += `<text font-family="${F.body}" font-size="25" font-weight="800" letter-spacing="5.2" fill="${face}"><textPath href="#${pid}">EVERY BRAND HAS A BACKSTORY ✦ ESTD 2026 ✦ </textPath></text>`;
    } else {
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        s += `<path d="M ${Math.cos(a) * (R - 22)} ${Math.sin(a) * (R - 22)} L ${Math.cos(a) * (R - 34)} ${Math.sin(a) * (R - 34)}" stroke="${face}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`;
      }
    }
    const inner = o.rim ? R - 70 : R - 48;
    s += `<circle r="${inner}" fill="${face}"/>`;
    s += `<circle r="${inner - 10}" fill="none" stroke="${ring}" stroke-width="2.5" opacity="0.7"/>`;
    s += `<path d="${keyholePath(o.rim ? 1.02 : 1.2)}" transform="translate(0 ${o.rim ? -18 : -24})" fill="${hole}"/>`;
    return s;
  }
  // ---------- identity: The Slice ----------
  function measureAsc(str, font, fallback) {
    try {
      if (!_mctx && typeof document !== "undefined") _mctx = document.createElement("canvas").getContext("2d");
      if (_mctx) { _mctx.font = font; return _mctx.measureText(str).actualBoundingBoxAscent; }
    } catch (e) { /* fall through */ }
    return fallback;
  }
  // Pie with one slice pulled out. a0/a1 in degrees (default: the logo's top-right slice).
  function pie(r, body, slice, o = {}) {
    const a0 = ((o.a0 === undefined ? -58 : o.a0) * Math.PI) / 180, a1 = ((o.a1 === undefined ? 0 : o.a1) * Math.PI) / 180;
    const p = (a) => `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
    const st = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 6}" stroke-linejoin="round"` : "";
    const mid = (a0 + a1) / 2, off = r * (o.off === undefined ? 0.2 : o.off);
    return `<path d="M 0 0 L ${p(a1)} A ${r} ${r} 0 1 1 ${p(a0)} Z" fill="${body}"${st}/>` +
      `<path d="M 0 0 L ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)} Z" fill="${slice}"${st} transform="translate(${(Math.cos(mid) * off).toFixed(2)} ${(Math.sin(mid) * off).toFixed(2)})"/>`;
  }
  // Wordmark "brandpros" with the pie o. Baseline at y=0, left edge at x=0.
  function sliceWordmark(S, ink = C.ink, acc = C.tang) {
    const f = `800 ${S}px 'Bricolage Grotesque'`, fam = F.display, tr = -S * 0.015;
    const xh = measureAsc("x", f, S * 0.52);
    let x = 0, s = "";
    const put = (str) => { s += `<text x="${x}" y="0" font-family="${fam}" font-size="${S}" font-weight="800" fill="${ink}">${str}</text>`; x += measure(str, f, S * 0.58) + tr; };
    put("brandpr");
    const wO = measure("o", f, S * 0.58);
    s += g(pie(xh * 0.56, ink, acc), `translate(${x + wO / 2} ${-xh / 2})`);
    x += wO + tr;
    put("s");
    return { svg: s, w: x, xh, asc: measureAsc("b", f, S * 0.72) };
  }
  // Kept for pages that call it: now returns the Slice wordmark, vertically centred on y=0.
  function wordmarkGroup(dark = false, size = 170) {
    const wm = sliceWordmark(size, dark ? C.white : C.ink, dark ? C.tangLight : C.tang);
    return g(wm.svg, `translate(0 ${wm.asc / 2})`);
  }

  // ---------- The Pro (mascot): a pie-chart head with its slice popped up, charcoal blazer, tangerine tie ----------
  function pro(o = {}) {
    const expr = o.expr || "smile", arm = o.arm || "wave", t = o.t || 0;
    const bob = Math.round(wob(t, 0.8, 6));
    let s = `<path d="M -120 -250 Q -150 -250 -150 -210 L -130 0 L 130 0 L 150 -210 Q 150 -250 120 -250 Z" ${S(C.ledger2)}/>`;
    s += `<path d="M -150 -150 L -130 0 L -40 0 Z" fill="url(#${ID.dC})"/>`;
    s += `<path d="M -48 -250 L 0 -150 L 48 -250 Z" ${S(C.white, 6)}/>`;
    s += `<path d="M -10 -238 L 10 -238 L 16 -170 L 0 -150 L -16 -170 Z" ${S(C.tang, 5)}/>`;
    s += `<path d="M -48 -250 L -20 -120 L -70 -40 M 48 -250 L 20 -120 L 70 -40" fill="none" stroke="${C.ledger3}" stroke-width="6"/>`;
    s += g(pie(15, C.cream, C.tang, { stroke: C.ink, sw: 3 }), "translate(-78 -150)");
    const armShape = (side, pose) => {
      const sx = side * 138, sy = -225;
      const P = { up: [200, -330, 215, -430], point: [230, -250, 320, -300], down: [200, -130, 230, -30], hold: [190, -300, 150, -380], shrug: [220, -190, 250, -280], rest: [175, -130, 170, -40] }[pose];
      const [ex, ey, hx, hy] = [side * P[0], P[1], side * P[2], P[3]];
      return `<path d="M ${sx} ${sy} Q ${ex} ${ey} ${hx} ${hy}" fill="none" stroke="${C.ink}" stroke-width="54" stroke-linecap="round"/>` +
        `<path d="M ${sx} ${sy} Q ${ex} ${ey} ${hx} ${hy}" fill="none" stroke="${C.ledger2}" stroke-width="38" stroke-linecap="round"/>` +
        `<circle cx="${hx}" cy="${hy}" r="30" ${S(C.white, 7)}/>`;
    };
    const la = arm === "hold" ? "hold" : arm === "shrug" ? "shrug" : "rest";
    const ra = arm === "wave" ? (Math.sin(t * 7) > 0 ? "up" : "point") : arm;
    s += armShape(-1, la) + armShape(1, ra);
    // head = the pie, its slice popped up like a lid
    const hy = -400, R = 130;
    const r2 = R * 0.62, q = (d) => (d * Math.PI) / 180, pt = (d) => `${(Math.cos(q(d)) * r2).toFixed(1)} ${(Math.sin(q(d)) * r2).toFixed(1)}`;
    const capSlice = `<path d="M 0 0 L ${pt(-118)} A ${r2} ${r2} 0 0 1 ${pt(-62)} Z" fill="${C.tang}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>`;
    let hd = `<circle cy="${hy}" r="${R}" ${S(C.cream, 9)}/>` + g(capSlice, `translate(${R * 0.28} ${hy - R * 0.72}) rotate(18)`);
    hd += `<path d="M ${R * 0.55} ${hy + R * 0.25} A ${R * 0.8} ${R * 0.8} 0 0 1 ${R * 0.1} ${hy + R * 0.82}" fill="none" stroke="url(#${ID.dI})" stroke-width="30"/>`;
    const ey = hy + 6;
    const brow = (l, r) => `<path d="M -62 ${ey - l} L -20 ${ey - l - 6} M 20 ${ey - r - 6} L 62 ${ey - r}" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>`;
    if (expr === "shock") {
      hd += `<ellipse cx="-36" cy="${ey}" rx="20" ry="24" ${S(C.white, 6)}/><ellipse cx="36" cy="${ey}" rx="20" ry="24" ${S(C.white, 6)}/><circle cx="-36" cy="${ey + 4}" r="9" fill="${C.ink}"/><circle cx="36" cy="${ey + 4}" r="9" fill="${C.ink}"/>`;
      hd += `<ellipse cx="0" cy="${ey + 58}" rx="17" ry="22" ${S(C.ink, 5)}/>` + brow(48, 48);
    } else if (expr === "wink") {
      hd += `<circle cx="-36" cy="${ey}" r="11" fill="${C.ink}"/><path d="M 22 ${ey} Q 36 ${ey - 12} 50 ${ey}" fill="none" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`;
      hd += `<path d="M -34 ${ey + 40} Q 0 ${ey + 72} 34 ${ey + 40}" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>` + brow(34, 44);
    } else if (expr === "think") {
      hd += `<circle cx="-36" cy="${ey}" r="11" fill="${C.ink}"/><circle cx="36" cy="${ey}" r="11" fill="${C.ink}"/><path d="M -22 ${ey + 52} L 26 ${ey + 46}" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>` + brow(32, 46);
    } else {
      hd += `<circle cx="-36" cy="${ey}" r="11" fill="${C.ink}"/><circle cx="36" cy="${ey}" r="11" fill="${C.ink}"/>`;
      hd += `<path d="M -38 ${ey + 38} Q 0 ${ey + 80} 38 ${ey + 38}" ${S(C.white, 7)}/>` + brow(36, 36);
    }
    s += g(hd, `rotate(${Math.round(wob(t, 0.5, 2))} 0 ${hy + R})`);
    return g(s, `translate(${o.x || 0} ${(o.y || 0) + bob}) scale(${o.s || 1})`);
  }

  // ---------- story props (generic; no company trade dress) ----------
  function person(o = {}) {
    const skin = o.skin || C.skinA, suit = o.suit || C.slate, hairC = o.hairColor || "#3A2A1E", expr = o.expr || "neutral", t = o.t || 0;
    let s = `<path d="M -125 -300 Q -160 -300 -160 -250 L -140 0 L 140 0 L 160 -250 Q 160 -300 125 -300 Z" ${S(suit)}/>`;
    s += `<path d="M 60 -300 L 160 -250 L 140 0 L 60 0 Z" fill="url(#${ID.dI})"/>`;
    if (o.casual) s += `<path d="M -45 -300 Q 0 -250 45 -300" ${S(o.shirt || C.white, 6)}/>`;
    else s += `<path d="M -45 -300 L 0 -205 L 45 -300 Z" ${S(o.shirt || C.white, 6)}/><path d="M -10 -290 L 10 -290 L 15 -225 L 0 -205 L -15 -225 Z" ${S(o.tie || C.red, 5)}/>`;
    s += `<rect x="-30" y="-330" width="60" height="45" ${S(skin, 6)}/>`;
    const hy = -420;
    s += `<circle cx="-98" cy="${hy + 5}" r="22" ${S(skin, 6)}/><circle cx="98" cy="${hy + 5}" r="22" ${S(skin, 6)}/><ellipse cx="0" cy="${hy}" rx="100" ry="108" ${S(skin)}/>`;
    s += `<path d="M 40 ${hy - 95} Q 110 ${hy - 40} 90 ${hy + 50} Q 70 ${hy + 90} 30 ${hy + 104}" fill="none" stroke="${C.skinC}" stroke-width="10" opacity="0.25"/>`;
    const hs = o.hair || "short";
    if (hs === "slick") s += `<path d="M -102 ${hy - 10} Q -110 ${hy - 120} 0 ${hy - 122} Q 110 ${hy - 120} 102 ${hy - 10} Q 70 ${hy - 70} -20 ${hy - 72} Q -80 ${hy - 70} -102 ${hy - 10} Z" ${S(hairC, 7)}/>`;
    else if (hs === "short") s += `<path d="M -104 ${hy} Q -104 ${hy - 118} 0 ${hy - 118} Q 104 ${hy - 118} 104 ${hy} L 90 ${hy - 40} Q 40 ${hy - 70} 30 ${hy - 50} Q -20 ${hy - 85} -90 ${hy - 40} Z" ${S(hairC, 7)}/>`;
    else if (hs === "bald") s += `<path d="M -100 ${hy - 10} Q -110 ${hy - 50} -80 ${hy - 60} M 100 ${hy - 10} Q 110 ${hy - 50} 80 ${hy - 60}" fill="none" stroke="${hairC}" stroke-width="22" stroke-linecap="round"/>`;
    const ey = hy - 5;
    if (expr === "laugh") s += `<path d="M -55 ${ey} Q -38 ${ey - 18} -21 ${ey} M 21 ${ey} Q 38 ${ey - 18} 55 ${ey}" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/><circle cx="-62" cy="${ey + 30}" r="16" fill="url(#${ID.dR})"/><circle cx="62" cy="${ey + 30}" r="16" fill="url(#${ID.dR})"/>`;
    else if (expr === "hopeful") s += `<circle cx="-38" cy="${ey}" r="11" fill="${C.ink}"/><circle cx="38" cy="${ey}" r="11" fill="${C.ink}"/><path d="M -32 ${ey + 46} Q 0 ${ey + 74} 32 ${ey + 46}" ${S(C.white, 7)}/><path d="M -60 ${ey - 36} L -18 ${ey - 40} M 18 ${ey - 40} L 60 ${ey - 36}" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`;
    else s += `<circle cx="-38" cy="${ey}" r="11" fill="${C.ink}"/><circle cx="38" cy="${ey}" r="11" fill="${C.ink}"/><path d="M -26 ${ey + 55} L 26 ${ey + 55}" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`;
    if (o.glasses) s += `<rect x="-72" y="${ey - 24}" width="62" height="46" rx="14" fill="none" stroke="${C.ink}" stroke-width="7"/><rect x="10" y="${ey - 24}" width="62" height="46" rx="14" fill="none" stroke="${C.ink}" stroke-width="7"/><path d="M -10 ${ey - 4} L 10 ${ey - 4}" stroke="${C.ink}" stroke-width="7"/>`;
    if (o.stifle) s += `<ellipse cx="10" cy="${ey + 62}" rx="52" ry="38" ${S(skin, 7)}/><path d="M -20 ${ey + 40} L -20 ${ey + 80} M 5 ${ey + 36} L 5 ${ey + 84} M 30 ${ey + 38} L 30 ${ey + 82}" stroke="${C.ink}" stroke-width="5" opacity="0.5"/><path d="M 118 ${hy - 60} l 26 -22 M 124 ${hy - 20} l 34 -6 M 116 ${hy + 20} l 30 12" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`;
    else if (expr === "laugh") s += `<path d="M -40 ${ey + 40} Q 0 ${ey + 110} 40 ${ey + 40} Z" ${S(C.red, 7)}/>`;
    const shake = o.stifle ? Math.round(wob(t, 6, 3)) : 0;
    return g(s, `translate(${(o.x || 0) + shake} ${o.y || 0}) scale(${o.s || 1})`);
  }

  // Generic strip-mall video store: slate facade, cream sign board, striped awning.
  function storefront(o = {}) {
    const w = o.w || 700, h = o.h || 520, lit = o.lit === undefined ? 1 : o.lit, sep = o.sepia;
    const facade = sep ? "#8A8578" : C.slate, board = sep ? "#E5D7B6" : C.cream;
    let s = `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" ${S(facade)}/>`;
    for (let r = 0; r < 6; r++) s += `<path d="M ${-w / 2} ${-h + (r + 1) * h / 7} L ${w / 2} ${-h + (r + 1) * h / 7}" stroke="${C.ink}" stroke-width="2" opacity="0.18"/>`;
    s += `<rect x="${w * 0.1}" y="${-h}" width="${w * 0.4}" height="${h}" fill="url(#${ID.dI})"/>`;
    const bw = w * 0.7, bh = h * 0.22, by = -h + h * 0.06;
    s += `<rect x="${-bw / 2}" y="${by}" width="${bw}" height="${bh}" ${S(board)}/>`;
    s += text(o.sign || "VIDEO", 0, by + bh * 0.78, { size: bh * 0.7, fill: C.ink, ls: 10 });
    const ay = by + bh + h * 0.04, aw = w * 0.96, stripes = 8;
    for (let i = 0; i < stripes; i++) s += `<path d="M ${-aw / 2 + i * aw / stripes} ${ay} L ${-aw / 2 + (i + 1) * aw / stripes} ${ay} L ${-aw / 2 + (i + 1) * aw / stripes - 6} ${ay + h * 0.09} Q ${-aw / 2 + (i + 0.5) * aw / stripes} ${ay + h * 0.13} ${-aw / 2 + i * aw / stripes + 6} ${ay + h * 0.09} Z" fill="${i % 2 ? board : (sep ? "#A07A62" : C.red)}" stroke="${C.ink}" stroke-width="4"/>`;
    const wy = -h * 0.5, wh = h * 0.38, winFill = lit > 0.5 ? "#F6EBC4" : "#3B4448";
    s += `<rect x="${-w / 2 + 30}" y="${wy}" width="${w * 0.3}" height="${wh}" ${S(winFill, 6)}/><rect x="${w / 2 - 30 - w * 0.3}" y="${wy}" width="${w * 0.3}" height="${wh}" ${S(winFill, 6)}/>`;
    if (lit > 0.5) for (let i = 0; i < 3; i++) {
      s += `<rect x="${-w / 2 + 45 + i * w * 0.09}" y="${wy + 16}" width="${w * 0.07}" height="${wh * 0.55}" fill="${[C.red, C.ledger3, C.brass][i]}" stroke="${C.ink}" stroke-width="4"/>`;
      s += `<rect x="${w / 2 - 45 - w * 0.07 - i * w * 0.09}" y="${wy + 16}" width="${w * 0.07}" height="${wh * 0.55}" fill="${[C.mint, C.red, C.slate][i]}" stroke="${C.ink}" stroke-width="4"/>`;
    }
    s += `<rect x="${-w * 0.12}" y="${-h * 0.46}" width="${w * 0.24}" height="${h * 0.46}" ${S(lit > 0.5 ? "#EFD9A0" : "#2A3134", 6)}/>`;
    if (o.closed) s += g(`<rect x="-80" y="-34" width="160" height="60" ${S(C.red, 5)}/>` + text("CLOSED", 0, 14, { size: 38, fill: C.cream, font: F.body, weight: 800 }), `translate(0 ${-h * 0.28}) rotate(-6)`);
    return g(s, `translate(${o.x || 0} ${o.y || 0}) scale(${o.s || 1})`, sep ? `opacity="${o.opacity || 1}"` : "");
  }
  // Giant cheque: the $50M offer as an engraved bank cheque.
  function cheque(o = {}) {
    const w = 860, h = 380;
    let s = `<rect x="${-w / 2 + 10}" y="${-h / 2 + 12}" width="${w}" height="${h}" fill="${C.ink}" opacity="0.2"/>`;
    s += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" ${S(C.cream, 7)}/>`;
    s += `<rect x="${-w / 2 + 18}" y="${-h / 2 + 18}" width="${w - 36}" height="${h - 36}" fill="none" stroke="${C.ledger3}" stroke-width="3"/>`;
    for (let i = 0; i < 14; i++) s += `<path d="M ${-w / 2 + 30} ${-h / 2 + 40 + i * 22} Q ${-w / 4} ${-h / 2 + 28 + i * 22} 0 ${-h / 2 + 40 + i * 22} T ${w / 2 - 30} ${-h / 2 + 40 + i * 22}" fill="none" stroke="${C.mint}" stroke-width="2" opacity="0.55"/>`;
    s += text("PAY TO THE ORDER OF", -w / 2 + 50, -h / 2 + 78, { size: 24, font: F.body, weight: 800, fill: C.ledger, anchor: "start", ls: 3 });
    s += note(o.payee || "Netflix", -w / 2 + 390, -h / 2 + 84, { size: 48, rot: -2, anchor: "start" });
    s += `<path d="M ${-w / 2 + 360} ${-h / 2 + 98} L ${w / 2 - 50} ${-h / 2 + 98}" stroke="${C.ink}" stroke-width="3"/>`;
    s += `<rect x="${-w / 2 + 50}" y="${-h / 2 + 130}" width="${w - 100}" height="130" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/>`;
    s += text(o.amount || "$50,000,000", 0, -h / 2 + 228, { size: 100, fill: C.ink });
    s += text("MEMO", -w / 2 + 50, h / 2 - 50, { size: 22, font: F.body, weight: 800, fill: C.ledger, anchor: "start", ls: 3 });
    s += note(o.memo || "buy the startup?", -w / 2 + 150, h / 2 - 46, { size: 36, rot: -1, anchor: "start" });
    s += g(pie(30, C.ink, C.tang), `translate(${w / 2 - 80} ${h / 2 - 62})`);
    return g(s, `translate(${o.x || 0} ${o.y || 0}) rotate(${o.r || 0}) scale(${o.s || 1})`);
  }
  function vhs(o = {}) {
    let s = `<rect x="-120" y="-70" width="240" height="140" rx="8" ${S("#26282B")}/><rect x="-85" y="-52" width="170" height="44" fill="${C.cream}" stroke="${C.ink}" stroke-width="4"/>`;
    s += `<path d="M -70 -40 L 40 -40 M -70 -24 L 10 -24" stroke="${C.slate}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<rect x="-72" y="8" width="144" height="42" rx="21" fill="#3A3F44" stroke="${C.ink}" stroke-width="4"/><circle cx="-40" cy="29" r="15" fill="${C.cream}"/><circle cx="40" cy="29" r="15" fill="${C.cream}"/>`;
    if (o.late) s += `<path d="M 105 -60 C 150 -110 170 -120 190 -110" fill="none" stroke="${C.ink}" stroke-width="5"/>` +
      g(`<rect x="-70" y="-32" width="140" height="64" ${S(C.red, 5)}/>` + text("LATE", 0, 16, { size: 40, fill: C.cream }), "translate(240 -110) rotate(-18)");
    return g(s, `translate(${o.x || 0} ${o.y || 0}) rotate(${o.r || 0}) scale(${o.s || 1})`);
  }
  const coin = (x, y, r = 40, rot = 0) => g(`<circle r="${r}" ${S(C.brass, 6)}/><circle r="${r * 0.72}" fill="none" stroke="${C.brassDeep}" stroke-width="5"/>` + text("$", 0, r * 0.38, { size: r * 1.05, fill: C.ink }), `translate(${x} ${y}) rotate(${rot})`);
  function envelope(o = {}) {
    const col = o.color || C.mint, w = 300, h = 190;
    let s = g(`<circle cx="${w * 0.18}" cy="${-h / 2 - 10}" r="62" fill="#DDE2DE" stroke="${C.ink}" stroke-width="6"/><circle cx="${w * 0.18}" cy="${-h / 2 - 10}" r="14" fill="${C.ink}"/>`);
    s += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" ${S(col)}/><rect x="${w * 0.1}" y="${-h / 2}" width="${w * 0.4}" height="${h}" fill="url(#${ID.dI})"/>`;
    s += `<path d="M ${-w / 2 + 10} ${-h / 2 + 10} L 0 10 L ${w / 2 - 10} ${-h / 2 + 10}" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>`;
    if (o.stripe) s += `<rect x="${-w / 2}" y="${h / 2 - 44}" width="${w}" height="26" fill="${o.stripe}" stroke="${C.ink}" stroke-width="5"/>`;
    if ((o.face || "happy") === "happy") s += `<circle cx="-40" cy="30" r="10" fill="${C.ink}"/><circle cx="30" cy="30" r="10" fill="${C.ink}"/><path d="M -30 58 Q -5 80 20 58" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`;
    else s += `<circle cx="-40" cy="34" r="10" fill="${C.ink}"/><circle cx="30" cy="34" r="10" fill="${C.ink}"/><path d="M -30 76 Q -5 56 20 76" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/><path d="M -62 10 L -22 20 M 12 20 L 52 10" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
    const ph = o.run || 0, leg = (dx, a) => `<path d="M ${dx} ${h / 2} l ${Math.sin(a) * 34} 56" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/>`;
    s += leg(-50, ph) + leg(40, ph + Math.PI);
    return g(s, `translate(${o.x || 0} ${o.y || 0}) rotate(${o.r || 0}) scale(${o.s || 1})`);
  }
  function speedLines(x, y, n = 4, len = 160, op = 1) {
    let s = "";
    for (let i = 0; i < n; i++) s += `<path d="M ${x - 40 - (i % 2) * 30} ${y - 60 + i * 40} l ${-len + i * 20} 0" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" opacity="${0.55 * op}"/>`;
    return s;
  }
  function stamp(lbl, x, y, p, o = {}) {
    if (p <= 0) return "";
    const w = o.w || 520, h = o.h || 150, col = o.color || C.red;
    const inner = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="10" fill="none" stroke="${col}" stroke-width="16"/><rect x="${-w / 2 + 16}" y="${-h / 2 + 16}" width="${w - 32}" height="${h - 32}" rx="6" fill="none" stroke="${col}" stroke-width="5"/>` + text(lbl, 0, h * 0.24, { size: h * 0.6, fill: col, ls: 6 });
    return g(inner, `translate(${x} ${y}) rotate(${o.rot || -12}) scale(${p < 0.25 ? 1.35 : 1})`, `opacity="0.88"`);
  }
  function skyline(y, col = C.ledger3) {
    const b = [[0, 260], [90, 360], [170, 300], [260, 470], [340, 380], [430, 520], [520, 330], [600, 440], [700, 300], [790, 400], [880, 350], [960, 460]];
    let s = "";
    b.forEach(([x, h], i) => { s += `<rect x="${x}" y="${y - h}" width="${86 + (i % 3) * 6}" height="${h}" fill="${col}"/>`; });
    s += `<rect x="455" y="${y - 700}" width="22" height="200" fill="${col}"/><circle cx="466" cy="${y - 720}" r="44" fill="${col}"/>`;
    for (let i = 0; i < 40; i++) s += `<rect x="${b[i % b.length][0] + 16 + (i * 13) % 50}" y="${y - 40 - ((i * 37) % 220)}" width="14" height="18" fill="${C.hl}" opacity="0.6"/>`;
    return s;
  }
  const mapPin = (x, y, s = 1) => g(`<path d="M 0 0 C -60 -70 -60 -140 0 -140 C 60 -140 60 -70 0 0 Z" ${S(C.red, 7)}/><circle cx="0" cy="-95" r="20" fill="${C.cream}" stroke="${C.ink}" stroke-width="6"/>`, `translate(${x} ${y}) scale(${s})`);
  function seriesChip(lbl, col) {
    const w = measure(lbl, `800 32px Inter`, 20) + 44;
    return g(`<rect x="0" y="-34" width="${w}" height="56" fill="${col}" stroke="${C.ink}" stroke-width="4"/>` + text(lbl, w / 2, 8, { size: 32, fill: C.cream, font: F.body, weight: 800, ls: 2 }) + tape(w - 10, -30, 70, 24, 24), "translate(56 176) rotate(-1.5)");
  }
  function headline(lines, y, p) {
    if (p <= 0) return "";
    let s = "";
    lines.forEach((ln, i) => {
      const L = typeof ln === "string" ? { t: ln } : ln;
      const pi = clamp((p - i * 0.12) * 3);
      if (pi <= 0) return;
      const size = L.size || 110;
      s += g(label(L.t, { size, kind: L.kind || "cream" }), `translate(${540 + (i % 2 ? 18 : -12)} ${y + i * size * 1.3}) rotate(${[-2.5, 1.8, -1.2][i % 3]}) scale(${pi < 0.34 ? 1.08 : 1})`);
    });
    return s;
  }
  function captions(tl, t) {
    const w = tl.words;
    let idx = -1;
    for (let i = 0; i < w.length; i++) if (t >= w[i].s) idx = i;
    if (idx < 0 || t > w[w.length - 1].e + 0.4) return "";
    const ci = tl.chunks.findIndex((c) => idx >= c[0] && idx <= c[1]);
    if (ci < 0) return "";
    const chunk = tl.chunks[ci], words = w.slice(chunk[0], chunk[1] + 1);
    let size = 60;
    const font = (sz) => `700 ${sz}px Inter`;
    let widths = words.map((x) => measure(x.raw + " ", font(size), size * 0.55));
    let total = widths.reduce((a, b) => a + b, 0);
    if (total > 900) { const k = 900 / total; size *= k; widths = widths.map((x) => x * k); total = 900; }
    const stripW = total + 68 - size * 0.25, stripH = size * 1.7;
    let x = -total / 2 + size * 0.12, hl = "", tx = "";
    words.forEach((wd, i) => {
      const ww = measure(wd.raw, font(size), size * 0.55);
      if (chunk[0] + i === idx) hl += `<path d="M ${x - 8} ${size * 0.14} L ${x + ww + 10} ${size * 0.04} L ${x + ww + 6} ${-size * 0.6} L ${x - 6} ${-size * 0.54} Z" fill="${C.hl}" opacity="0.95"/>`;
      tx += text(wd.raw, x, size * 0.06, { size, font: F.body, weight: 700, fill: C.ink, anchor: "start" });
      x += widths[i];
    });
    const s = `<rect x="${-stripW / 2 + 7}" y="${-stripH / 2 - size * 0.2 + 9}" width="${stripW}" height="${stripH}" fill="${C.ink}" opacity="0.2"/>` +
      `<rect x="${-stripW / 2}" y="${-stripH / 2 - size * 0.2}" width="${stripW}" height="${stripH}" fill="${C.cream}" stroke="${C.ink}" stroke-width="3"/>` + hl + tx;
    return g(s, `translate(540 1330) rotate(${ci % 2 ? 1.2 : -1.0})`);
  }
  function buildTimeline(beats, start = 0.35) {
    const words = [], chunks = [], beatTimes = [];
    let t = start;
    beats.forEach((b) => {
      const bStart = t, toks = b.vo.split(/\s+/).filter(Boolean);
      let chunkStart = words.length;
      toks.forEach((tok, i) => {
        const clean = tok.replace(/[^\w$'’,.:?!-]/g, "");
        const d = 0.18 + clean.length * 0.026;
        words.push({ w: clean.replace(/[,.:?!]+$/, ""), raw: tok, s: t, e: t + d, beat: b.id });
        t += d;
        const endS = /[.?!:]$/.test(tok), comma = /,$/.test(tok);
        if (endS) t += 0.24; else if (comma) t += 0.1;
        if (endS || comma || words.length - chunkStart >= 4 || i === toks.length - 1) { chunks.push([chunkStart, words.length - 1]); chunkStart = words.length; }
      });
      t += 0.15;
      beatTimes.push({ id: b.id, s: bStart, e: t, n: toks.length, first: words.length - toks.length });
    });
    return { words, chunks, beats: beatTimes, end: t };
  }

  // ---------- S01 ----------
  const S01_BEATS = [
    { id: "hook", vo: "In 2000, Blockbuster could've bought Netflix for fifty million dollars. That wasn't even its biggest mistake." },
    { id: "b1", vo: "Here's the famous part. Netflix's co-founders flew to Dallas and offered to sell. According to co-founder Marc Randolph, Blockbuster's CEO was trying not to laugh." },
    { id: "b2", vo: "And honestly? Saying no made sense. Netflix was losing money. Blockbuster had thousands of stores and made a fortune on late fees." },
    { id: "b3", vo: "The real twist came later. In 2006, Blockbuster launched Total Access: rent online, return in store. It was winning subscribers. Then, after a boardroom fight with an activist investor, the CEO left, and the new leadership shifted focus back to stores." },
    { id: "b4", vo: "In 2010, Blockbuster filed for bankruptcy. Today there's one store left." },
    { id: "b5", vo: "Pros know the lesson: the deadliest mistake usually isn't the deal you pass on. It's quitting your fix halfway." },
    { id: "cta", vo: "Would you have bought Netflix? Full story on our channel." },
  ];
  const TL = buildTimeline(S01_BEATS);
  const S01 = { timeline: TL, duration: TL.end + 2.8, beats: S01_BEATS };
  const beat = (id) => TL.beats.find((b) => b.id === id);
  const cue = (id, wi) => { const b = beat(id); return TL.words[b.first + Math.min(wi, b.n - 1)].s; };
  const push = (inner, p, z = 0.04, ox = 540, oy = 960) => g(inner, `translate(${ox} ${oy}) scale(${(1 + z * p).toFixed(4)}) translate(${-ox} ${-oy})`);

  function sceneHook(t) {
    const b = beat("hook"), p = prog(t, b.s, b.e), tM = cue("hook", 14);
    let s = paper(C.pMint) + halftone(560, 880, 440, "dB");
    s += `<rect x="-100" y="1540" width="1300" height="420" fill="#9FA9A3"/><rect x="-100" y="1540" width="1300" height="420" fill="url(#${ID.dI})"/>`;
    s += storefront({ x: 540, y: 1560, w: 900, h: 620 });
    s += pro({ x: 540, y: 2080, s: 1.0, arm: "hold", expr: t > tM ? "shock" : "wink", t });
    const inn = prog(t, b.s, b.s + 0.35) > 0.5;
    s += cheque({ x: 540, y: inn ? 850 : 1000, r: -3, s: 1.08 });
    s += stamp("PASSED", 610, 900, prog(t, tM - 0.1, tM + 0.25));
    s += headline(["BLOCKBUSTER", { t: "VS. NETFLIX", kind: "tang" }], 390, prog(t, b.s + 0.1, b.s + 0.5));
    return push(s, p);
  }
  function sceneMeeting(t) {
    const b = beat("b1"), p = prog(t, b.s, b.e), tL = cue("b1", 18);
    let s = paper(C.pSand) + halftone(900, 300, 260, "dI");
    s += `<rect x="80" y="440" width="920" height="540" fill="${C.sky}" stroke="${C.ink}" stroke-width="${OL}"/>`;
    s += `<clipPath id="${ID.key("w")}"><rect x="84" y="444" width="912" height="532"/></clipPath>` + g(skyline(990), "", `clip-path="url(#${ID.key("w")})"`);
    s += `<path d="M 540 440 L 540 980 M 80 710 L 1000 710" stroke="${C.ink}" stroke-width="10"/>`;
    s += person({ x: 250, y: 1420, s: 0.95, suit: "#6F7C78", casual: true, shirt: "#E3E8E2", hair: "short", hairColor: "#5A4632", expr: "hopeful", t });
    s += person({ x: 430, y: 1450, s: 0.85, suit: "#96A39B", casual: true, shirt: C.cream, hair: "bald", hairColor: "#6B5846", glasses: true, expr: "hopeful", skin: C.skinB, t });
    const laughing = t > tL;
    s += person({ x: 820, y: 1430, s: 1.0, suit: C.ledger3, hair: "slick", hairColor: "#2B2B2B", tie: C.brass, expr: laughing ? "laugh" : "neutral", stifle: laughing, t });
    s += `<path d="M -40 1400 L 1120 1400 L 1080 1480 L 0 1480 Z" ${S("#8A5A3B")}/><rect x="-40" y="1480" width="1160" height="500" fill="#6E4630"/><rect x="-40" y="1480" width="1160" height="500" fill="url(#${ID.dI})"/>`;
    const fp = eOut(prog(t, cue("b1", 9), cue("b1", 12)));
    s += g(`<rect x="-120" y="-40" width="240" height="80" ${S(C.cream, 6)}/>` + text("$50M", 0, 24, { size: 58 }), `translate(${Math.round(lerp(360, 640, fp) / 12) * 12} 1375) rotate(-4)`);
    s += headline(["DALLAS, 2000"], 350, prog(t, b.s, b.s + 0.4));
    if (laughing) s += text("“…trying not to laugh”", 540, 1630, { size: 66, font: F.serif, fill: C.cream }) + note("per Marc Randolph's memoir", 560, 1720, { size: 40, fill: C.hl, rot: -2 });
    return push(s, p, 0.05, 700, 1100);
  }
  function sceneLateFees(t) {
    const b = beat("b2"), p = prog(t, b.s, b.e), tF = cue("b2", 17);
    let s = paper(C.pCream) + halftone(540, 1250, 520, "dI");
    s += g(`<path d="M -210 0 Q -260 -260 -100 -330 L -130 -380 L 130 -380 L 100 -330 Q 260 -260 210 0 Z" ${S(C.ledger2)}/><path d="M 60 -330 Q 240 -250 210 0 L 60 0 Z" fill="url(#${ID.dC})"/><rect x="-120" y="-400" width="240" height="40" rx="10" ${S(C.brass, 6)}/>` + text("$", 0, -80, { size: 260, fill: C.cream }), "translate(540 1540)");
    for (let i = 0; i < 6; i++) {
      const ph = ((t - b.s) * 0.55 + i / 6) % 1, x = 180 + ((i * 173) % 720), y = lerp(560, 1250, ph);
      s += vhs({ x, y, r: -20 + i * 9 + ph * 40, s: 0.7, late: t > tF - 1.2 || i % 2 === 0 });
      if (ph > 0.45) s += coin(x + 60, lerp(y, 1300, (ph - 0.45) / 0.55), 30, ph * 400);
    }
    s += headline(["SAYING NO", { t: "MADE SENSE", kind: "tang" }], 380, prog(t, cue("b2", 2), cue("b2", 2) + 0.4));
    if (t > tF - 1.5) s += note("the part customers hated", 300, 1790, { rot: -3, size: 44 }) + arrow(470, 1760, 560, 1700, { bend: 0.3 });
    s += stamp("LATE FEES = $$$", 540, 1640, prog(t, tF - 0.2, tF + 0.2), { w: 760, h: 130, rot: -4 });
    return push(s, p, 0.05);
  }
  function sceneRace(t) {
    const b = beat("b3"), p = prog(t, b.s, b.e);
    const tTA = cue("b3", 7), tFight = cue("b3", 22), tLeft = cue("b3", 29), tFocus = cue("b3", 36);
    let s = paper(C.pGreen) + `<rect x="-200" y="-200" width="1480" height="2320" fill="url(#${ID.dI})" opacity="0.5"/>`;
    s += `<rect x="-100" y="760" width="1300" height="720" fill="${C.track}"/>`;
    for (let i = 0; i < 3; i++) s += `<path d="M -100 ${760 + i * 360} L 1200 ${760 + i * 360}" stroke="${C.cream}" stroke-width="12"/>`;
    s += `<path d="M ${-100 - ((t * 900) % 200)} 1120 L 1300 1120" stroke="${C.cream}" stroke-width="8" stroke-dasharray="80 120" opacity="0.7"/>`;
    const ov = eInOut(prog(t, tTA, tTA + 3.5)), stop = eInOut(prog(t, tLeft, tLeft + 1.2));
    const nX = lerp(640, 470, ov) + stop * 520, bX = lerp(380, 700, ov) - stop * 460, run = Math.floor(t * 6) * 1.6, stopped = stop > 0.6;
    s += speedLines(nX - 140, 950, 4, 180) + envelope({ x: nX, y: 940, s: 1.05, color: C.mint, run, r: -4 });
    if (!stopped) s += speedLines(bX - 140, 1300, 4, 180, 1 - stop);
    s += envelope({ x: bX, y: 1290, s: 1.05, color: C.slate, stripe: C.cream, run: stopped ? 0 : run, r: stopped ? 8 : -4, face: stopped ? "sad" : "happy" });
    const dp = eOut(prog(t, tFight, tFight + 0.9));
    if (dp > 0) s += g(`<rect x="-10" y="-330" width="300" height="660" ${S("#6E4630")}/><rect x="30" y="-280" width="220" height="240" fill="none" stroke="${C.ink}" stroke-width="7"/><rect x="30" y="0" width="220" height="260" fill="none" stroke="${C.ink}" stroke-width="7"/><circle cx="40" cy="-20" r="16" ${S(C.brass, 5)}/>` + g(label("BOARD", { size: 56 }), "translate(140 -380) rotate(3)"), `translate(${lerp(1300, 870, dp)} 1290)`);
    const nx = Math.max(170, nX - 40);
    s += note("Netflix", nx, 715, { rot: -3, size: 50 }) + arrow(nx + 95, 700, nX + 40, 830, { bend: -0.3 });
    s += note("Blockbuster", Math.min(880, Math.max(220, bX)), 1555, { rot: 2, size: 50 });
    if (t < tTA) s += headline(["THE REAL", { t: "TWIST", kind: "tang" }], 380, prog(t, b.s, b.s + 0.4));
    else if (t < tFight) s += headline(["TOTAL ACCESS", { t: "2006", kind: "tang" }], 380, prog(t, tTA, tTA + 0.4));
    else if (t < tFocus) s += headline(["CEO OUT", { t: "2007", kind: "red" }], 380, prog(t, tLeft - 0.6, tLeft - 0.2));
    else s += headline(["BACK TO", { t: "STORES", kind: "red" }], 380, prog(t, tFocus, tFocus + 0.4));
    return push(s, p, 0.03, 540, 1100);
  }
  function sceneBankrupt(t) {
    const b = beat("b4"), p = prog(t, b.s, b.e), tL = cue("b4", 7);
    let s = paper(C.pSepia) + halftone(540, 1500, 600, "dI") + `<rect x="-100" y="1500" width="1300" height="500" fill="#B9A57C"/>`;
    [150, 345, 540, 735, 930].forEach((x, i) => {
      const off = t > b.s + 0.35 + i * 0.35 && i !== 4;
      s += storefront({ x, y: 1500, w: 180, h: 150, sepia: true, lit: off ? 0 : 1, closed: off, opacity: off ? 0.8 : 1 });
    });
    const z = eInOut(prog(t, tL - 0.4, tL + 0.6));
    if (z > 0) {
      s += `<rect x="-200" y="-200" width="1480" height="2320" fill="${C.pSepia}" opacity="${0.85 * z}"/>`;
      s += storefront({ x: 540, y: lerp(1500, 1450, z), w: 180, h: 150, s: lerp(1, 3.6, z), lit: 1 }) + mapPin(540, lerp(1300, 820, z), lerp(0.4, 1.1, z));
      if (z > 0.9) s += note("Bend, Oregon", 540, 1620, { size: 60, rot: -2 }) + note("the last one", 880, 760, { size: 44, rot: 6 }) + arrow(860, 790, 640, 860, { bend: 0.3 });
    }
    s += t < tL - 0.3 ? headline(["BANKRUPT", { t: "2010", kind: "red" }], 380, prog(t, b.s, b.s + 0.4)) : headline(["1 STORE", { t: "LEFT", kind: "tang" }], 380, prog(t, tL - 0.3, tL + 0.1));
    return push(s, p, 0.04);
  }
  function sceneLesson(t) {
    const b = beat("b5"), p = prog(t, b.s, b.e);
    let s = paper(C.pBrass) + halftone(260, 1700, 420, "dI");
    const card = `<rect x="-392" y="-252" width="800" height="520" fill="${C.ink}" opacity="0.2"/><rect x="-400" y="-260" width="800" height="520" ${S(C.cream, 6)}/><rect x="-400" y="-260" width="800" height="130" ${S(C.ledger, 6)}/>` +
      text("PROS KNOW:", 0, -165, { size: 76, fill: C.tangLight }) + text("DON'T QUIT", 0, 20, { size: 108 }) + text("THE FIX HALFWAY", 0, 150, { size: 74, fill: C.red }) +
      (t > b.s + 1.5 ? scribbleUnder(-250, 250, 60) : "") + tape(-360, -250, 120, 40, -30) + tape(360, -250, 120, 40, 30);
    s += g(card, `translate(540 ${prog(t, b.s + 0.1, b.s + 0.5) < 0.5 ? 1500 : 720}) rotate(-2.5)`);
    s += pro({ x: 790, y: 1960, s: 0.8, arm: "point", expr: "wink", t });
    return push(s, p, 0.03);
  }
  function sceneCTA(t) {
    const b = beat("cta");
    let s = paper(C.pCream) + halftone(540, 1100, 440, "dB");
    s += pro({ x: 540, y: 1330, s: 1.0, arm: "down", expr: "smile", t });
    s += headline(["WOULD YOU", { t: "HAVE BOUGHT IT?", kind: "red" }], 380, prog(t, b.s, b.s + 0.4));
    s += note("tell us below", 820, 1540, { size: 52, rot: -6 }) + arrow(850, 1570, 870, 1720, { bend: 0.25, w: 9 });
    return s;
  }
  function sceneEnd(t) {
    const p = prog(t, TL.end, TL.end + 0.5);
    let s = paper(C.ledger) + halftone(540, 820, 520, "dC");
    s += g(`<circle r="190" fill="${C.tang}"/>` + pie(118, C.ink, C.white), `translate(540 ${p < 0.4 ? 800 : 780}) scale(${p < 0.4 ? 1.1 : 1})`);
    const wm = sliceWordmark(150, C.white, C.tangLight);
    s += g(wm.svg, `translate(${540 - wm.w / 2} 1210)`);
    s += note("every brand has a backstory", 540, 1340, { size: 50, fill: C.hl, rot: -2 });
    return g(s, "", `opacity="${p < 0.2 ? 0.5 : 1}"`);
  }
  function frameS01(tIn) {
    const t = Math.floor(tIn * 12) / 12;
    const defs = makeDefs(1 + (Math.floor(tIn * 8) % 3));
    let sc;
    if (t < beat("b1").s) sc = sceneHook(t);
    else if (t < beat("b2").s) sc = sceneMeeting(t);
    else if (t < beat("b3").s) sc = sceneLateFees(t);
    else if (t < beat("b4").s) sc = sceneRace(t);
    else if (t < beat("b5").s) sc = sceneBankrupt(t);
    else if (t < beat("cta").s) sc = sceneLesson(t);
    else if (t < TL.end) sc = sceneCTA(t);
    else sc = sceneEnd(t);
    let out = rough(sc);
    if (t < TL.end) out += roughT(seriesChip("THE $1B MISTAKE", C.red) + captions(TL, t));
    out += paperOverlay(1080, 1920);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">${defs}${out}</svg>`;
  }

  // ---------- static assets ----------
  function asset(w, h, draw, o = {}) {
    const defs = makeDefs(o.seed || 2, { amp: o.amp });
    const body = draw();
    const inked = o.clean ? body : rough(body);
    const backing = o.bg ? `<rect width="${w}" height="${h}" fill="${o.bg}"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${defs}${backing}${inked}${o.overlay === false ? "" : paperOverlay(w, h, o.grain || 1)}</svg>`;
  }
  function thumbLF01(v = "A") {
    return asset(1920, 1080, () => {
      let s = paper(v === "A" ? C.pMint : C.pCream) + halftone(620, 560, 520, v === "A" ? "dB" : "dR");
      if (v === "A") {
        const store = g(storefront({ w: 900, h: 700 }), "translate(640 1000)");
        s += `<clipPath id="${ID.key("l")}"><path d="M 0 0 L 690 0 L 620 300 L 700 520 L 610 760 L 680 1080 L 0 1080 Z"/></clipPath><clipPath id="${ID.key("r")}"><path d="M 690 0 L 1920 0 L 1920 1080 L 680 1080 L 610 760 L 700 520 L 620 300 Z"/></clipPath>`;
        s += g(store, "rotate(-3 640 700)", `clip-path="url(#${ID.key("l")})"`) + g(g(store, "translate(40 20)"), "rotate(4 640 700)", `clip-path="url(#${ID.key("r")})"`);
        s += `<path d="M 690 280 L 620 420 L 700 600 L 610 820" fill="none" stroke="${C.ink}" stroke-width="18" stroke-linecap="round"/>`;
        s += envelope({ x: 660, y: 470, s: 1.2, color: C.mint, r: -28 });
        s += g(label("IT WASN'T", { size: 170, kind: "red", maxW: 800 }), "translate(1470 390) rotate(-3)") + g(label("NETFLIX", { size: 210, maxW: 820 }), "translate(1490 690) rotate(2)");
        s += note("the real reason", 1440, 930, { size: 62, rot: -4 }) + arrow(1230, 930, 900, 860, { bend: 0.25, w: 10 });
      } else {
        s += person({ x: 520, y: 1080, s: 1.5, suit: C.ledger3, hair: "slick", hairColor: "#2B2B2B", tie: C.brass, expr: "laugh" });
        s += cheque({ x: 1080, y: 250, r: -8, s: 0.62 });
        s += g(label("$50M", { size: 210, kind: "tang", maxW: 760 }), "translate(1500 560) rotate(-3)") + g(label("MISTAKE?", { size: 180, maxW: 800 }), "translate(1510 850) rotate(2)");
      }
      s += g(`<rect x="0" y="-36" width="330" height="64" fill="${C.red}" stroke="${C.ink}" stroke-width="4"/>` + text("$1B MISTAKE", 165, 12, { size: 38, fill: C.cream, font: F.body, weight: 800, ls: 2 }), "translate(60 100) rotate(-2)");
      return s;
    }, { seed: 4, amp: 7, bg: v === "A" ? C.pMint : C.pCream });
  }
  // Logo assets are drawn clean (no line boil) and get only a light paper tooth.
  // Logo assets: clean vector (no line boil), light paper tooth only.
  const avatar = () => asset(800, 800, () => `<rect width="800" height="800" fill="${C.tang}"/>` + g(pie(238, C.ink, C.white), "translate(390 416)"), { clean: true, grain: 0.25 });
  const sealAsset = () => asset(900, 900, () => `<rect width="900" height="900" fill="${C.white}"/>` + g(pie(300, C.ink, C.tang), "translate(440 470)"), { clean: true, grain: 0.25 });
  function wordmark(dark = false) {
    return asset(1500, 440, () => {
      const wm = sliceWordmark(230, dark ? C.white : C.ink, dark ? C.tangLight : C.tang);
      return `<rect width="1500" height="440" fill="${dark ? C.ledger : C.white}"/>` + g(wm.svg, `translate(${750 - wm.w / 2} ${220 + wm.xh / 2})`);
    }, { clean: true, grain: 0.25 });
  }
  function mascotSheet() {
    const poses = [["smile", "wave", "hello!"], ["shock", "hold", "the twist"], ["think", "shrug", "hmm…"], ["wink", "point", "the lesson"]];
    return asset(2000, 1000, () => {
      let s = paper(C.pCream);
      poses.forEach(([e, a, n], i) => { s += pro({ x: 230 + i * 470, y: 930, s: 0.9, expr: e, arm: a, t: 0.3 }) + note(n, 230 + i * 470, 110, { size: 46, rot: i % 2 ? 3 : -3 }); });
      return s;
    }, { seed: 3, bg: C.pCream });
  }
  function ytBanner() {
    return asset(2560, 1440, () => {
      let s = paper(C.ledger) + halftone(1280, 720, 900, "dC");
      const wm = sliceWordmark(250, C.white, C.tangLight);
      s += g(wm.svg, `translate(${1280 - wm.w / 2} 760)`);
      s += note("every brand has a backstory · new story every Thursday", 1280, 880, { size: 46, fill: C.hl, rot: -1.5 });
      s += pro({ x: 2290, y: 1150, s: 0.85, arm: "wave", expr: "smile", t: 0.2 });
      return s;
    }, { seed: 5, bg: C.ledger });
  }

  root.BP = { pie, sliceWordmark, C, F, S01, frameS01, thumbLF01, avatar, sealAsset, wordmark, mascotSheet, ytBanner, makeDefs, seal, wordmarkGroup, pro, text, g, S, measure, rough, roughT, paperOverlay, halftone, paper, note, arrow, label, tape, asset, get ID() { return ID; } };
})(typeof window !== "undefined" ? window : globalThis);
