/* BrandPros render engine
 * Draws BrandPros house-style cartoon frames as SVG strings.
 * - BP.frameS01(t)            -> 1080x1920 SVG markup for Short S01 at time t (seconds)
 * - BP.S01.duration           -> total length in seconds
 * - BP.thumbLF01(variant)     -> 1920x1080 SVG markup for the LF01 thumbnail
 * - BP.logoMark(), BP.pro()   -> reusable brand pieces
 * The same file powers the live preview player and the frame-by-frame MP4 renderer.
 */
(function (root) {
  "use strict";

  // ---------- tokens ----------
  const C = {
    navy: "#0E1A2B", gold: "#F4B942", red: "#E63946", green: "#2BB673",
    cream: "#F5EFE0", gray: "#8A94A6", white: "#FFFFFF",
    navy2: "#1B2C45", navy3: "#27405F", goldDeep: "#D99A1E", redDeep: "#B82632",
    storeBlue: "#1F4FA3", storeYellow: "#FFD23F", sky: "#9FC6E8",
    skinA: "#F2C7A5", skinB: "#D9A07A", skinC: "#9C6644",
  };
  const OL = 8; // house outline weight at 1080 wide
  const F = {
    display: "Anton, 'Bebas Neue', Impact, 'Arial Narrow', sans-serif",
    body: "Inter, 'Helvetica Neue', Arial, sans-serif",
    serif: "'DM Serif Display', Georgia, serif",
  };

  // ---------- math ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const eOut = (t) => 1 - Math.pow(1 - t, 3);
  const eInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const wob = (t, f = 1, a = 1) => Math.sin(t * Math.PI * 2 * f) * a;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const g = (inner, tf = "", extra = "") => `<g${tf ? ` transform="${tf}"` : ""}${extra ? " " + extra : ""}>${inner}</g>`;
  const S = (fill = C.navy, sw = OL) => `fill="${fill}" stroke="${C.navy}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;

  function text(str, x, y, o = {}) {
    const size = o.size || 80, fam = o.font || F.display, fill = o.fill || C.white;
    const anchor = o.anchor || "middle", weight = o.weight || 400;
    const stroke = o.stroke === undefined ? C.navy : o.stroke;
    const sw = o.sw === undefined ? size * 0.16 : o.sw;
    const ls = o.ls ? ` letter-spacing="${o.ls}"` : "";
    const strokeAttr = stroke ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` : "";
    return `<text x="${x}" y="${y}" font-family="${fam}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls}${strokeAttr}>${esc(str)}</text>`;
  }

  // ---------- brand pieces ----------
  // Price tag, horizontal, notch on the left. (x,y) = centre.
  function tagPath(w, h) {
    const n = h * 0.42, r = h * 0.12;
    return `M ${-w / 2} 0 L ${-w / 2 + n} ${-h / 2} L ${w / 2 - r} ${-h / 2} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + r} L ${w / 2} ${h / 2 - r} Q ${w / 2} ${h / 2} ${w / 2 - r} ${h / 2} L ${-w / 2 + n} ${h / 2} Z`;
  }
  function priceTag(w, h, o = {}) {
    const fill = o.fill || C.gold;
    const holeX = -w / 2 + h * 0.36;
    let s = `<path d="${tagPath(w, h)}" ${S(fill, o.sw || OL)}/>`;
    s += `<circle cx="${holeX}" cy="0" r="${h * 0.09}" fill="${o.holeFill || C.navy}" stroke="${C.navy}" stroke-width="${(o.sw || OL) * 0.6}"/>`;
    if (o.string) s += `<path d="M ${holeX} 0 C ${holeX - h * 0.5} ${-h * 0.2} ${holeX - h * 0.8} ${-h * 0.6} ${holeX - h * 1.1} ${-h * 0.5}" fill="none" stroke="${C.navy}" stroke-width="${(o.sw || OL) * 0.7}" stroke-linecap="round"/>`;
    return s;
  }

  // Logo mark: gold tag, BP monogram, rise-and-fall line.
  function logoMark(o = {}) {
    const w = 460, h = 250;
    const line = `M ${-w / 2 + 150} 100 L ${-w / 2 + 215} 74 L ${-w / 2 + 262} 88 L ${-w / 2 + 330} 62 L ${-w / 2 + 400} 96`;
    let s = priceTag(w, h, { sw: o.sw || 12, fill: o.fill || C.gold, holeFill: o.holeFill || C.navy });
    s += text("BP", 45, 38, { size: 150, fill: C.navy, stroke: null, ls: 4 });
    s += `<path d="${line}" fill="none" stroke="${C.navy}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`;
    return s;
  }

  // "The Pro" mascot. (x,y) = feet. Head is a vertical gold price tag.
  function pro(o = {}) {
    const expr = o.expr || "smile", arm = o.arm || "wave", t = o.t || 0;
    const bob = wob(t, 0.8, 6);
    // body
    let s = "";
    const blazer = `M -120 -250 Q -150 -250 -150 -210 L -130 0 L 130 0 L 150 -210 Q 150 -250 120 -250 Z`;
    s += `<path d="${blazer}" ${S(C.navy2)}/>`;
    s += `<path d="M -48 -250 L 0 -150 L 48 -250 Z" ${S(C.white, 6)}/>`; // shirt
    s += `<path d="M -10 -238 L 10 -238 L 16 -170 L 0 -150 L -16 -170 Z" ${S(C.gold, 5)}/>`; // tie
    s += `<path d="M -48 -250 L -20 -120 L -70 -40" fill="none" stroke="${C.navy3}" stroke-width="6"/>`;
    s += `<path d="M 48 -250 L 20 -120 L 70 -40" fill="none" stroke="${C.navy3}" stroke-width="6"/>`;
    // arms
    const armShape = (side, pose) => {
      const sx = side * 138, sy = -225;
      let ex, ey, hx, hy;
      if (pose === "up") { ex = side * 200; ey = -330; hx = side * 215; hy = -430; }
      else if (pose === "point") { ex = side * 230; ey = -250; hx = side * 320; hy = -300; }
      else if (pose === "down") { ex = side * 200; ey = -130; hx = side * 230; hy = -30; }
      else if (pose === "hold") { ex = side * 190; ey = -300; hx = side * 150; hy = -380; }
      else if (pose === "shrug") { ex = side * 220; ey = -190; hx = side * 250; hy = -280; }
      else { ex = side * 175; ey = -130; hx = side * 170; hy = -40; } // rest
      return `<path d="M ${sx} ${sy} Q ${ex} ${ey} ${hx} ${hy}" fill="none" stroke="${C.navy}" stroke-width="54" stroke-linecap="round"/>` +
        `<path d="M ${sx} ${sy} Q ${ex} ${ey} ${hx} ${hy}" fill="none" stroke="${C.navy2}" stroke-width="38" stroke-linecap="round"/>` +
        `<circle cx="${hx}" cy="${hy}" r="30" ${S(C.white, 7)}/>`;
    };
    const la = arm === "hold" ? "hold" : arm === "shrug" ? "shrug" : "rest";
    const ra = arm === "wave" ? (Math.sin(t * 7) > 0 ? "up" : "point") : arm;
    s += armShape(-1, la) + armShape(1, ra);
    // neck + head (vertical tag, notch on top)
    const hw = 210, hh = 250, top = -250 - hh - 10;
    const n = 70, r = 26;
    const head = `M 0 ${top} L ${hw / 2} ${top + n} L ${hw / 2} ${top + hh - r} Q ${hw / 2} ${top + hh} ${hw / 2 - r} ${top + hh} L ${-hw / 2 + r} ${top + hh} Q ${-hw / 2} ${top + hh} ${-hw / 2} ${top + hh - r} L ${-hw / 2} ${top + n} Z`;
    let hd = `<path d="${head}" ${S(C.gold, 9)}/>`;
    hd += `<circle cx="0" cy="${top + 62}" r="15" ${S(C.navy, 6)}/>`;
    hd += `<text x="0" y="${top + hh - 22}" font-family="${F.display}" font-size="30" fill="${C.navy}" text-anchor="middle" opacity="0.55">BP</text>`;
    const ey = top + 140;
    if (expr === "shock") {
      hd += `<ellipse cx="-42" cy="${ey}" rx="24" ry="28" ${S(C.white, 6)}/><ellipse cx="42" cy="${ey}" rx="24" ry="28" ${S(C.white, 6)}/>`;
      hd += `<circle cx="-42" cy="${ey + 4}" r="10" fill="${C.navy}"/><circle cx="42" cy="${ey + 4}" r="10" fill="${C.navy}"/>`;
      hd += `<ellipse cx="0" cy="${ey + 70}" rx="20" ry="26" ${S(C.navy, 5)}/>`;
      hd += `<path d="M -72 ${ey - 52} L -20 ${ey - 62} M 20 ${ey - 62} L 72 ${ey - 52}" stroke="${C.navy}" stroke-width="10" stroke-linecap="round"/>`;
    } else if (expr === "wink") {
      hd += `<circle cx="-42" cy="${ey}" r="13" fill="${C.navy}"/><path d="M 26 ${ey} Q 42 ${ey - 14} 58 ${ey}" fill="none" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/>`;
      hd += `<path d="M -40 ${ey + 50} Q 0 ${ey + 88} 40 ${ey + 50}" fill="none" stroke="${C.navy}" stroke-width="10" stroke-linecap="round"/>`;
      hd += `<path d="M -70 ${ey - 44} L -20 ${ey - 40} M 20 ${ey - 50} L 70 ${ey - 58}" stroke="${C.navy}" stroke-width="10" stroke-linecap="round"/>`;
    } else if (expr === "think") {
      hd += `<circle cx="-42" cy="${ey}" r="13" fill="${C.navy}"/><circle cx="42" cy="${ey}" r="13" fill="${C.navy}"/>`;
      hd += `<path d="M -25 ${ey + 62} L 30 ${ey + 55}" stroke="${C.navy}" stroke-width="10" stroke-linecap="round"/>`;
      hd += `<path d="M -70 ${ey - 40} L -20 ${ey - 44} M 20 ${ey - 58} L 70 ${ey - 44}" stroke="${C.navy}" stroke-width="10" stroke-linecap="round"/>`;
    } else {
      hd += `<circle cx="-42" cy="${ey}" r="13" fill="${C.navy}"/><circle cx="42" cy="${ey}" r="13" fill="${C.navy}"/>`;
      hd += `<path d="M -45 ${ey + 48} Q 0 ${ey + 95} 45 ${ey + 48}" ${S(C.white, 8)}/>`;
      hd += `<path d="M -70 ${ey - 44} L -20 ${ey - 50} M 20 ${ey - 50} L 70 ${ey - 44}" stroke="${C.navy}" stroke-width="10" stroke-linecap="round"/>`;
    }
    s += g(hd, `rotate(${wob(t, 0.5, 2)} 0 ${top + hh})`);
    return g(s, `translate(${o.x || 0} ${(o.y || 0) + bob}) scale(${o.s || 1})`);
  }

  // Generic cartoon person. (x,y) = bottom of torso.
  function person(o = {}) {
    const skin = o.skin || C.skinA, suit = o.suit || C.gray, hairC = o.hairColor || "#3A2A1E";
    const expr = o.expr || "neutral", t = o.t || 0;
    let s = "";
    s += `<path d="M -125 -300 Q -160 -300 -160 -250 L -140 0 L 140 0 L 160 -250 Q 160 -300 125 -300 Z" ${S(suit)}/>`;
    if (o.casual) {
      s += `<path d="M -45 -300 Q 0 -250 45 -300" ${S(o.shirt || C.white, 6)}/>`;
    } else {
      s += `<path d="M -45 -300 L 0 -205 L 45 -300 Z" ${S(o.shirt || C.white, 6)}/>`;
      s += `<path d="M -10 -290 L 10 -290 L 15 -225 L 0 -205 L -15 -225 Z" ${S(o.tie || C.red, 5)}/>`;
    }
    s += `<rect x="-30" y="-330" width="60" height="45" ${S(skin, 6)}/>`;
    const hy = -420;
    s += `<circle cx="-98" cy="${hy + 5}" r="22" ${S(skin, 6)}/><circle cx="98" cy="${hy + 5}" r="22" ${S(skin, 6)}/>`;
    s += `<ellipse cx="0" cy="${hy}" rx="100" ry="108" ${S(skin)}/>`;
    // hair
    const hs = o.hair || "short";
    if (hs === "slick") s += `<path d="M -102 ${hy - 10} Q -110 ${hy - 120} 0 ${hy - 122} Q 110 ${hy - 120} 102 ${hy - 10} Q 70 ${hy - 70} -20 ${hy - 72} Q -80 ${hy - 70} -102 ${hy - 10} Z" ${S(hairC, 7)}/>`;
    else if (hs === "short") s += `<path d="M -104 ${hy} Q -104 ${hy - 118} 0 ${hy - 118} Q 104 ${hy - 118} 104 ${hy} L 90 ${hy - 40} Q 40 ${hy - 70} 30 ${hy - 50} Q -20 ${hy - 85} -90 ${hy - 40} Z" ${S(hairC, 7)}/>`;
    else if (hs === "bald") s += `<path d="M -100 ${hy - 10} Q -110 ${hy - 50} -80 ${hy - 60}" fill="none" stroke="${hairC}" stroke-width="22" stroke-linecap="round"/><path d="M 100 ${hy - 10} Q 110 ${hy - 50} 80 ${hy - 60}" fill="none" stroke="${hairC}" stroke-width="22" stroke-linecap="round"/>`;
    else if (hs === "curly") { for (let i = -4; i <= 4; i++) s += `<circle cx="${i * 24}" cy="${hy - 98 + Math.abs(i) * 9}" r="30" ${S(hairC, 6)}/>`; }
    // face
    const ey = hy - 5;
    if (expr === "laugh") {
      s += `<path d="M -55 ${ey} Q -38 ${ey - 18} -21 ${ey} M 21 ${ey} Q 38 ${ey - 18} 55 ${ey}" fill="none" stroke="${C.navy}" stroke-width="9" stroke-linecap="round"/>`;
      s += `<circle cx="-62" cy="${ey + 30}" r="14" fill="${C.red}" opacity="0.35"/><circle cx="62" cy="${ey + 30}" r="14" fill="${C.red}" opacity="0.35"/>`;
    } else if (expr === "worried") {
      s += `<circle cx="-38" cy="${ey}" r="11" fill="${C.navy}"/><circle cx="38" cy="${ey}" r="11" fill="${C.navy}"/>`;
      s += `<path d="M -62 ${ey - 30} L -18 ${ey - 42} M 18 ${ey - 42} L 62 ${ey - 30}" stroke="${C.navy}" stroke-width="8" stroke-linecap="round"/>`;
      s += `<path d="M -26 ${ey + 60} Q 0 ${ey + 44} 26 ${ey + 60}" fill="none" stroke="${C.navy}" stroke-width="8" stroke-linecap="round"/>`;
    } else if (expr === "hopeful") {
      s += `<circle cx="-38" cy="${ey}" r="11" fill="${C.navy}"/><circle cx="38" cy="${ey}" r="11" fill="${C.navy}"/>`;
      s += `<path d="M -32 ${ey + 46} Q 0 ${ey + 74} 32 ${ey + 46}" ${S(C.white, 7)}/>`;
      s += `<path d="M -60 ${ey - 36} L -18 ${ey - 40} M 18 ${ey - 40} L 60 ${ey - 36}" stroke="${C.navy}" stroke-width="8" stroke-linecap="round"/>`;
    } else {
      s += `<circle cx="-38" cy="${ey}" r="11" fill="${C.navy}"/><circle cx="38" cy="${ey}" r="11" fill="${C.navy}"/>`;
      s += `<path d="M -26 ${ey + 55} L 26 ${ey + 55}" stroke="${C.navy}" stroke-width="8" stroke-linecap="round"/>`;
    }
    if (o.glasses) s += `<rect x="-72" y="${ey - 24}" width="62" height="46" rx="14" fill="none" stroke="${C.navy}" stroke-width="7"/><rect x="10" y="${ey - 24}" width="62" height="46" rx="14" fill="none" stroke="${C.navy}" stroke-width="7"/><path d="M -10 ${ey - 4} L 10 ${ey - 4}" stroke="${C.navy}" stroke-width="7"/>`;
    if (o.stifle) {
      // hand over mouth + shaking
      s += `<ellipse cx="10" cy="${ey + 62}" rx="52" ry="38" ${S(skin, 7)}/>`;
      s += `<path d="M -20 ${ey + 40} L -20 ${ey + 80} M 5 ${ey + 36} L 5 ${ey + 84} M 30 ${ey + 38} L 30 ${ey + 82}" stroke="${C.navy}" stroke-width="5" opacity="0.5"/>`;
      s += `<path d="M 118 ${hy - 60} l 26 -22 M 124 ${hy - 20} l 34 -6 M 116 ${hy + 20} l 30 12" stroke="${C.navy}" stroke-width="7" stroke-linecap="round"/>`;
    } else if (expr === "laugh") {
      s += `<path d="M -40 ${ey + 40} Q 0 ${ey + 110} 40 ${ey + 40} Z" ${S(C.red, 7)}/>`;
    }
    const shake = o.stifle ? wob(t, 6, 3) : 0;
    return g(s, `translate(${(o.x || 0) + shake} ${o.y || 0}) scale(${o.s || 1})`);
  }

  // Generic 90s video rental storefront (blue + yellow hint, no real logo).
  function storefront(o = {}) {
    const w = o.w || 700, h = o.h || 520, lit = o.lit === undefined ? 1 : o.lit;
    const blue = o.sepia ? "#6E7A8A" : C.storeBlue, yellow = o.sepia ? "#C9B27A" : C.storeYellow;
    let s = "";
    s += `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="10" ${S(blue)}/>`;
    s += `<rect x="${-w / 2 - 20}" y="${-h - 20}" width="${w + 40}" height="40" rx="10" ${S(C.navy2)}/>`;
    // ticket-shaped sign
    const sw = w * 0.62, sh = h * 0.26, sy = -h + h * 0.08;
    s += `<path d="M ${-sw / 2} ${sy} L ${sw / 2} ${sy} L ${sw / 2 - 20} ${sy + sh / 2} L ${sw / 2} ${sy + sh} L ${-sw / 2} ${sy + sh} L ${-sw / 2 + 20} ${sy + sh / 2} Z" ${S(yellow)}/>`;
    s += text(o.sign || "VIDEO", 0, sy + sh * 0.76, { size: sh * 0.72, fill: blue, stroke: null, ls: 4 });
    // windows
    const wy = -h * 0.55, wh = h * 0.42, winFill = lit > 0.5 ? "#FFF2B8" : "#3B4656";
    s += `<rect x="${-w / 2 + 30}" y="${wy}" width="${w * 0.3}" height="${wh}" rx="6" ${S(winFill, 6)}/>`;
    s += `<rect x="${w / 2 - 30 - w * 0.3}" y="${wy}" width="${w * 0.3}" height="${wh}" rx="6" ${S(winFill, 6)}/>`;
    // poster rectangles
    if (lit > 0.5) {
      for (let i = 0; i < 3; i++) {
        s += `<rect x="${-w / 2 + 45 + i * w * 0.09}" y="${wy + 18}" width="${w * 0.07}" height="${wh * 0.55}" fill="${[C.red, C.navy3, C.green][i]}" stroke="${C.navy}" stroke-width="4"/>`;
        s += `<rect x="${w / 2 - 45 - w * 0.07 - i * w * 0.09}" y="${wy + 18}" width="${w * 0.07}" height="${wh * 0.55}" fill="${[C.gold, C.red, C.navy3][i]}" stroke="${C.navy}" stroke-width="4"/>`;
      }
    }
    // door
    s += `<rect x="${-w * 0.12}" y="${-h * 0.5}" width="${w * 0.24}" height="${h * 0.5}" rx="6" ${S(lit > 0.5 ? "#FFE58A" : "#2A3344", 6)}/>`;
    if (o.closed) {
      s += g(`<rect x="-80" y="-34" width="160" height="60" rx="6" ${S(C.red, 5)}/>` + text("CLOSED", 0, 14, { size: 38, fill: C.white, stroke: null, font: F.body, weight: 800 }), `translate(0 ${-h * 0.3}) rotate(-6)`);
    }
    return g(s, `translate(${o.x || 0} ${o.y || 0}) scale(${o.s || 1})`, o.sepia ? `opacity="${o.opacity || 1}"` : "");
  }

  function vhs(o = {}) {
    let s = `<rect x="-120" y="-70" width="240" height="140" rx="10" ${S("#1E232B")}/>`;
    s += `<rect x="-85" y="-52" width="170" height="44" rx="6" fill="${C.cream}" stroke="${C.navy}" stroke-width="4"/>`;
    s += `<rect x="-72" y="8" width="144" height="42" rx="21" fill="#3A4150" stroke="${C.navy}" stroke-width="4"/>`;
    s += `<circle cx="-40" cy="29" r="15" fill="${C.cream}"/><circle cx="40" cy="29" r="15" fill="${C.cream}"/>`;
    if (o.late) {
      s += `<path d="M 105 -60 C 150 -110 170 -120 190 -110" fill="none" stroke="${C.navy}" stroke-width="5"/>`;
      s += g(priceTag(150, 70, { fill: C.red, sw: 6 }) + text("LATE", 18, 16, { size: 40, fill: C.white, stroke: null }), "translate(240 -110) rotate(-18)");
    }
    return g(s, `translate(${o.x || 0} ${o.y || 0}) rotate(${o.r || 0}) scale(${o.s || 1})`);
  }

  function coin(x, y, r = 40, rot = 0) {
    return g(`<circle r="${r}" ${S(C.gold, 6)}/><circle r="${r * 0.72}" fill="none" stroke="${C.goldDeep}" stroke-width="5"/>` + text("$", 0, r * 0.38, { size: r * 1.05, fill: C.navy, stroke: null }), `translate(${x} ${y}) rotate(${rot})`);
  }

  function envelope(o = {}) {
    const col = o.color || C.red, w = 300, h = 190;
    let s = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="14" ${S(col)}/>`;
    s += `<path d="M ${-w / 2 + 10} ${-h / 2 + 10} L 0 ${10} L ${w / 2 - 10} ${-h / 2 + 10}" fill="none" stroke="${C.navy}" stroke-width="7" stroke-linejoin="round"/>`;
    if (o.stripe) s += `<rect x="${-w / 2}" y="${h / 2 - 44}" width="${w}" height="26" fill="${o.stripe}" stroke="${C.navy}" stroke-width="5"/>`;
    // disc peeking out
    s = g(`<circle cx="${w * 0.18}" cy="${-h / 2 - 10}" r="62" fill="#DCE3EA" stroke="${C.navy}" stroke-width="6"/><circle cx="${w * 0.18}" cy="${-h / 2 - 10}" r="14" fill="${C.navy}"/>`) + s;
    // face
    const f = o.face || "happy";
    if (f === "happy") s += `<circle cx="-40" cy="30" r="10" fill="${C.navy}"/><circle cx="30" cy="30" r="10" fill="${C.navy}"/><path d="M -30 58 Q -5 80 20 58" fill="none" stroke="${C.navy}" stroke-width="7" stroke-linecap="round"/>`;
    if (f === "sad") s += `<circle cx="-40" cy="34" r="10" fill="${C.navy}"/><circle cx="30" cy="34" r="10" fill="${C.navy}"/><path d="M -30 76 Q -5 56 20 76" fill="none" stroke="${C.navy}" stroke-width="7" stroke-linecap="round"/><path d="M -62 10 L -22 20 M 12 20 L 52 10" stroke="${C.navy}" stroke-width="6" stroke-linecap="round"/>`;
    // legs (running)
    const ph = o.run || 0;
    const leg = (dx, a) => `<path d="M ${dx} ${h / 2} l ${Math.sin(a) * 34} 56" stroke="${C.navy}" stroke-width="12" stroke-linecap="round"/>`;
    s += leg(-50, ph) + leg(40, ph + Math.PI);
    return g(s, `translate(${o.x || 0} ${o.y || 0}) rotate(${o.r || 0}) scale(${o.s || 1})`);
  }

  function speedLines(x, y, n = 4, len = 160, op = 1) {
    let s = "";
    for (let i = 0; i < n; i++) s += `<path d="M ${x - 40 - (i % 2) * 30} ${y - 60 + i * 40} l ${-len + i * 20} 0" stroke="${C.white}" stroke-width="10" stroke-linecap="round" opacity="${0.8 * op}"/>`;
    return s;
  }

  function stamp(label, x, y, p, o = {}) {
    // slams in from big to normal
    if (p <= 0) return "";
    const sc = lerp(2.4, 1, eOut(p)), op = clamp(p * 3);
    const w = o.w || 520, h = o.h || 150, col = o.color || C.red;
    const inner = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="14" fill="none" stroke="${col}" stroke-width="16"/><rect x="${-w / 2 + 16}" y="${-h / 2 + 16}" width="${w - 32}" height="${h - 32}" rx="8" fill="none" stroke="${col}" stroke-width="5"/>` +
      text(label, 0, h * 0.24, { size: h * 0.6, fill: col, stroke: null, ls: 6 });
    return g(inner, `translate(${x} ${y}) rotate(${o.rot || -12}) scale(${sc})`, `opacity="${op}"`);
  }

  function skyline(y, col = C.navy3) {
    const b = [[0, 260], [90, 360], [170, 300], [260, 470], [340, 380], [430, 520], [520, 330], [600, 440], [700, 300], [790, 400], [880, 350], [960, 460]];
    let s = "";
    b.forEach(([x, h], i) => { s += `<rect x="${x}" y="${y - h}" width="${86 + (i % 3) * 6}" height="${h}" fill="${col}"/>`; });
    // ball-topped tower (Dallas hint)
    s += `<rect x="455" y="${y - 700}" width="22" height="200" fill="${col}"/><circle cx="466" cy="${y - 720}" r="44" fill="${col}"/>`;
    for (let i = 0; i < 40; i++) {
      const bx = b[i % b.length][0] + 16 + (i * 13) % 50, by = y - 40 - ((i * 37) % 220);
      s += `<rect x="${bx}" y="${by}" width="14" height="18" fill="${C.gold}" opacity="0.55"/>`;
    }
    return s;
  }

  function mapPin(x, y, s = 1, col = C.red) {
    return g(`<path d="M 0 0 C -60 -70 -60 -140 0 -140 C 60 -140 60 -70 0 0 Z" ${S(col, 7)}/><circle cx="0" cy="-95" r="20" fill="${C.cream}" stroke="${C.navy}" stroke-width="6"/>`, `translate(${x} ${y}) scale(${s})`);
  }

  function seriesChip(label, col) {
    const w = 40 + label.length * 22;
    return g(`<rect x="0" y="-38" width="${w}" height="64" rx="12" fill="${col}" stroke="${C.navy}" stroke-width="6"/>` +
      text(label, w / 2, 10, { size: 36, fill: C.white, stroke: null, font: F.body, weight: 800, ls: 2 }), "translate(56 176)");
  }

  function headline(lines, y, p, o = {}) {
    if (p <= 0) return "";
    const sc = lerp(0.6, 1, eBack(clamp(p * 1.4))), op = clamp(p * 4);
    let s = "";
    lines.forEach((ln, i) => {
      const L = typeof ln === "string" ? { t: ln } : ln;
      s += text(L.t, 0, i * (L.size || o.size || 120) * 1.05, { size: L.size || o.size || 120, fill: L.fill || o.fill || C.white, sw: (L.size || o.size || 120) * 0.14 });
    });
    return g(s, `translate(540 ${y}) scale(${sc})`, `opacity="${op}"`);
  }

  let _ctx = null;
  function measure(str, font, fallbackPerChar) {
    try {
      if (!_ctx && typeof document !== "undefined") _ctx = document.createElement("canvas").getContext("2d");
      if (_ctx) { _ctx.font = font; return _ctx.measureText(str).width; }
    } catch (e) { /* fall through */ }
    return str.length * fallbackPerChar;
  }

  // Captions: word-by-word, gold highlight on the spoken word.
  function captions(timeline, t) {
    const w = timeline.words;
    let idx = -1;
    for (let i = 0; i < w.length; i++) if (t >= w[i].s) idx = i;
    if (idx < 0 || t > w[w.length - 1].e + 0.4) return "";
    const chunk = timeline.chunks.find((c) => idx >= c[0] && idx <= c[1]);
    if (!chunk) return "";
    const words = w.slice(chunk[0], chunk[1] + 1);
    const size = 72;
    const widths = words.map((x) => measure(x.w.toUpperCase(), `800 ${size}px Inter`, size * 0.66) * 1.1 + size * 0.34);
    const total = widths.reduce((a, b) => a + b, 0);
    let x = 540 - total / 2;
    const pop = eBack(clamp((t - w[chunk[0]].s) / 0.18));
    let s = "";
    words.forEach((wd, i) => {
      const gi = chunk[0] + i, on = gi === idx;
      const cx = x + widths[i] / 2;
      s += g(text(wd.w.toUpperCase(), 0, 0, { size, font: F.body, weight: 800, fill: on ? C.gold : C.white, sw: 16 }), `translate(${cx} 0) scale(${on ? 1.1 : 1})`);
      x += widths[i];
    });
    return g(s, `translate(0 1300) translate(540 0) scale(${lerp(0.85, 1, pop)}) translate(-540 0)`);
  }

  // Build a word timeline from narration beats (stand-in for TTS word timestamps).
  function buildTimeline(beats, start = 0.35) {
    const words = [], chunks = [], beatTimes = [];
    let t = start;
    beats.forEach((b) => {
      const bStart = t, toks = b.vo.split(/\s+/).filter(Boolean);
      let chunkStart = words.length;
      toks.forEach((tok, i) => {
        const clean = tok.replace(/[^\w$'’,.:?!-]/g, "");
        const d = 0.18 + clean.length * 0.026;
        words.push({ w: clean.replace(/[,.:?!]+$/, ""), s: t, e: t + d, beat: b.id });
        t += d;
        const endSentence = /[.?!:]$/.test(tok), comma = /,$/.test(tok);
        if (endSentence) t += 0.24; else if (comma) t += 0.1;
        const n = words.length - chunkStart;
        if (endSentence || comma || n >= 3 || i === toks.length - 1) { chunks.push([chunkStart, words.length - 1]); chunkStart = words.length; }
      });
      t += 0.15;
      beatTimes.push({ id: b.id, s: bStart, e: t, n: toks.length, first: words.length - toks.length });
    });
    return { words, chunks, beats: beatTimes, end: t };
  }

  // ---------- S01: Blockbuster could've bought Netflix ----------
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
  const END_CARD = 2.6;
  const S01 = { timeline: TL, duration: TL.end + END_CARD, beats: S01_BEATS };
  const beat = (id) => TL.beats.find((b) => b.id === id);
  const cue = (id, wordIdx) => { const b = beat(id); return TL.words[b.first + Math.min(wordIdx, b.n - 1)].s; };

  function bg(col, extra = "") { return `<rect x="-200" y="-200" width="1480" height="2320" fill="${col}"/>` + extra; }
  function burst(cx, cy, col, n = 16, r = 1400, rot = 0) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2 + rot, a1 = a0 + Math.PI / n;
      s += `<path d="M ${cx} ${cy} L ${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} L ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r} Z" fill="${col}"/>`;
    }
    return s;
  }
  function kenBurns(inner, p, z = 0.05, ox = 540, oy = 960) {
    const sc = 1 + z * p;
    return g(inner, `translate(${ox} ${oy}) scale(${sc}) translate(${-ox} ${-oy})`);
  }

  function sceneHook(t) {
    const b = beat("hook"), p = prog(t, b.s, b.e);
    const tMistake = cue("hook", 14);
    let s = bg(C.navy2, burst(540, 900, C.navy3, 18, 1500, t * 0.08));
    s += storefront({ x: 540, y: 1560, w: 900, h: 620, s: 1 });
    s += `<rect x="-100" y="1540" width="1300" height="420" fill="${C.navy}"/>`;
    // The Pro holding the giant tag
    const pin = eBack(prog(t, b.s, b.s + 0.5));
    const tagY = lerp(1300, 820, pin);
    s += pro({ x: 540, y: 2060, s: 1.05, arm: "hold", expr: t > tMistake ? "shock" : "wink", t });
    s += g(priceTag(820, 300, { string: true }) + text("$50,000,000", 40, 44, { size: 130, fill: C.navy, stroke: null }), `translate(540 ${tagY}) rotate(${-4 + wob(t, 0.4, 2)})`);
    s += stamp("PASSED", 590, 930, prog(t, tMistake - 0.1, tMistake + 0.25));
    s += headline(["BLOCKBUSTER", { t: "vs. NETFLIX", fill: C.gold }], 400, prog(t, b.s + 0.1, b.s + 0.6), { size: 120 });
    return kenBurns(s, p, 0.04);
  }

  function sceneMeeting(t) {
    const b = beat("b1"), p = prog(t, b.s, b.e);
    const tLaugh = cue("b1", 18);
    let s = bg("#F0D9B5");
    // window with skyline
    s += `<rect x="80" y="420" width="920" height="560" rx="16" fill="${C.sky}" stroke="${C.navy}" stroke-width="${OL}"/>`;
    s += `<clipPath id="win"><rect x="84" y="424" width="912" height="552" rx="14"/></clipPath>`;
    s += g(skyline(990, C.navy3), "", `clip-path="url(#win)"`);
    s += `<path d="M 540 420 L 540 980 M 80 700 L 1000 700" stroke="${C.navy}" stroke-width="10"/>`;
    // people
    s += person({ x: 250, y: 1420, s: 0.95, suit: "#6C7A89", casual: true, shirt: "#DDE6EE", hair: "short", hairColor: "#5A4632", expr: "hopeful", skin: C.skinA, t });
    s += person({ x: 430, y: 1450, s: 0.85, suit: "#8FA3B5", casual: true, shirt: C.cream, hair: "bald", hairColor: "#6B5846", glasses: true, expr: "hopeful", skin: C.skinB, t });
    const laughing = t > tLaugh;
    s += person({ x: 820, y: 1430, s: 1.0, suit: C.navy3, hair: "slick", hairColor: "#2B2B2B", tie: C.storeYellow, expr: laughing ? "laugh" : "neutral", stifle: laughing, skin: C.skinA, t });
    // table
    s += `<path d="M -40 1400 L 1120 1400 L 1080 1480 L 0 1480 Z" ${S("#8A5A3B")}/>`;
    s += `<rect x="-40" y="1480" width="1160" height="500" fill="#6E4630"/>`;
    // folder sliding across
    const fp = eOut(prog(t, cue("b1", 9), cue("b1", 12)));
    s += g(`<rect x="-120" y="-40" width="240" height="80" rx="8" ${S(C.cream, 6)}/>` + text("$50M", 0, 24, { size: 58, fill: C.navy, stroke: null }), `translate(${lerp(360, 640, fp)} 1375) rotate(-4)`);
    s += headline(["DALLAS, 2000"], 360, prog(t, b.s, b.s + 0.5), { size: 110 });
    if (laughing) s += text("“…trying not to laugh”", 540, 1640, { size: 68, font: F.serif, fill: C.cream, stroke: C.navy, sw: 12 });
    return kenBurns(s, p, 0.06, 700, 1100);
  }

  function sceneLateFees(t) {
    const b = beat("b2"), p = prog(t, b.s, b.e);
    const tFees = cue("b2", 17);
    let s = bg(C.navy2, burst(540, 1150, C.navy3, 14, 1500, -t * 0.05));
    // vault / money bag
    s += g(`<path d="M -210 0 Q -260 -260 -100 -330 L -130 -380 L 130 -380 L 100 -330 Q 260 -260 210 0 Z" ${S(C.green)}/>` +
      `<rect x="-120" y="-400" width="240" height="40" rx="12" ${S(C.goldDeep, 6)}/>` + text("$", 0, -80, { size: 260, fill: C.white, stroke: C.navy, sw: 18 }), "translate(540 1540)");
    // falling tapes + coins
    for (let i = 0; i < 6; i++) {
      const ph = ((t - b.s) * 0.55 + i / 6) % 1;
      const x = 180 + ((i * 173) % 720), y = lerp(520, 1250, ph);
      s += vhs({ x, y, r: -20 + i * 9 + ph * 40, s: 0.7, late: t > tFees - 1.2 || i % 2 === 0 });
      if (ph > 0.45) s += coin(x + 60, lerp(y, 1300, (ph - 0.45) / 0.55), 30, ph * 400);
    }
    s += headline(["SAYING NO", { t: "MADE SENSE", fill: C.gold }], 400, prog(t, cue("b2", 2), cue("b2", 2) + 0.5), { size: 120 });
    s += stamp("LATE FEES = $$$", 540, 1720, prog(t, tFees - 0.2, tFees + 0.2), { w: 820, h: 140, color: C.gold, rot: -4 });
    return kenBurns(s, p, 0.05);
  }

  function sceneRace(t) {
    const b = beat("b3"), p = prog(t, b.s, b.e);
    const tTA = cue("b3", 7), tFight = cue("b3", 22), tLeft = cue("b3", 29), tFocus = cue("b3", 36);
    let s = bg("#2F7D4F");
    // track lanes
    s += `<rect x="-100" y="760" width="1300" height="720" fill="#B8563C"/>`;
    for (let i = 0; i < 3; i++) s += `<path d="M -100 ${760 + i * 360} L 1200 ${760 + i * 360}" stroke="${C.white}" stroke-width="12"/>`;
    const dash = -((t * 900) % 200);
    s += `<path d="M ${-100 + dash} 1120 L 1300 1120" stroke="${C.white}" stroke-width="8" stroke-dasharray="80 120" opacity="0.7"/>`;
    // positions: red leads, blue overtakes after TA, blue stops after CEO leaves
    const overtake = eInOut(prog(t, tTA, tTA + 3.5));
    const stop = eInOut(prog(t, tLeft, tLeft + 1.2));
    const redX = lerp(640, 470, overtake) + stop * 520;
    const blueX = lerp(380, 700, overtake) - stop * 460;
    const run = t * 14;
    s += speedLines(redX - 140, 950, 4, 180);
    s += envelope({ x: redX, y: 940, s: 1.05, color: C.red, run, r: -4 + wob(t, 3, 2), face: "happy" });
    const blueStopped = stop > 0.6;
    if (!blueStopped) s += speedLines(blueX - 140, 1300, 4, 180, 1 - stop);
    s += envelope({ x: blueX, y: 1290, s: 1.05, color: C.storeBlue, stripe: C.storeYellow, run: blueStopped ? 0 : run, r: blueStopped ? 8 : -4 + wob(t, 3, 2), face: blueStopped ? "sad" : "happy" });
    // boardroom door slams in front of the blue lane
    const dp = eOut(prog(t, tFight, tFight + 0.9));
    if (dp > 0) {
      const dx = lerp(1300, 870, dp);
      s += g(`<rect x="-10" y="-330" width="300" height="660" rx="10" ${S("#6E4630")}/><rect x="30" y="-280" width="220" height="240" rx="8" fill="none" stroke="${C.navy}" stroke-width="7"/><rect x="30" y="0" width="220" height="260" rx="8" fill="none" stroke="${C.navy}" stroke-width="7"/><circle cx="40" cy="-20" r="16" ${S(C.gold, 5)}/>` +
        g(`<rect x="-120" y="-36" width="240" height="72" rx="8" ${S(C.cream, 6)}/>` + text("BOARD", 0, 22, { size: 50, fill: C.navy, stroke: null }), "translate(140 -380)"), `translate(${dx} 1290)`);
    }
    // headlines by phase
    if (t < tTA) s += headline(["THE REAL", { t: "TWIST", fill: C.gold }], 400, prog(t, b.s, b.s + 0.5));
    else if (t < tFight) s += headline(["TOTAL ACCESS", { t: "2006", fill: C.gold }], 400, prog(t, tTA, tTA + 0.5));
    else if (t < tFocus) s += headline(["CEO OUT", { t: "2007", fill: C.red }], 400, prog(t, tLeft - 0.6, tLeft - 0.1));
    else s += headline(["BACK TO", { t: "STORES", fill: C.red }], 400, prog(t, tFocus, tFocus + 0.5));
    // lane labels
    s += text("ONLINE ONLY", 90, 820, { size: 40, font: F.body, weight: 800, fill: C.white, anchor: "start", sw: 10 });
    s += text("ONLINE + STORES", 90, 1180, { size: 40, font: F.body, weight: 800, fill: C.white, anchor: "start", sw: 10 });
    return kenBurns(s, p, 0.04, 540, 1100);
  }

  function sceneBankrupt(t) {
    const b = beat("b4"), p = prog(t, b.s, b.e);
    const tLeft = cue("b4", 7);
    let s = bg("#D9C7A0");
    s += `<rect x="-100" y="1500" width="1300" height="500" fill="#B9A57C"/>`;
    // five small stores switch off one by one; last stays lit
    const xs = [150, 345, 540, 735, 930];
    xs.forEach((x, i) => {
      const off = t > b.s + 0.35 + i * 0.35 && i !== 4;
      s += storefront({ x, y: 1500, w: 180, h: 150, s: 1, sepia: true, lit: off ? 0 : 1, closed: off, opacity: off ? 0.8 : 1 });
    });
    const zoom = eInOut(prog(t, tLeft - 0.4, tLeft + 0.6));
    if (zoom > 0) {
      s += `<rect x="-200" y="-200" width="1480" height="2320" fill="${C.navy}" opacity="${0.55 * zoom}"/>`;
      s += storefront({ x: 540, y: lerp(1500, 1450, zoom), w: 180, h: 150, s: lerp(1, 3.6, zoom), lit: 1 });
      s += mapPin(540, lerp(1300, 820, zoom), lerp(0.4, 1.1, zoom));
      s += text("BEND, OREGON", 540, 1640, { size: 64, font: F.body, weight: 800, fill: C.cream, sw: 14 });
    }
    if (t < tLeft - 0.3) s += headline(["BANKRUPT", { t: "2010", fill: C.red }], 400, prog(t, b.s, b.s + 0.5));
    else s += headline(["1 STORE", { t: "LEFT", fill: C.gold }], 400, prog(t, tLeft - 0.3, tLeft + 0.2));
    return kenBurns(s, p, 0.05);
  }

  function sceneLesson(t) {
    const b = beat("b5"), p = prog(t, b.s, b.e);
    let s = bg(C.navy2, burst(540, 900, C.navy3, 20, 1500, t * 0.05));
    const cp = eBack(prog(t, b.s + 0.1, b.s + 0.7));
    const card = `<rect x="-400" y="-260" width="800" height="520" rx="30" ${S(C.cream, 10)}/>` +
      `<rect x="-400" y="-260" width="800" height="140" rx="30" ${S(C.gold, 10)}/><rect x="-395" y="-160" width="790" height="40" fill="${C.gold}"/>` +
      text("PROS KNOW:", 0, -165, { size: 96, fill: C.navy, stroke: null }) +
      text("DON'T QUIT", 0, 20, { size: 120, fill: C.navy, stroke: null }) +
      text("THE FIX HALFWAY", 0, 150, { size: 92, fill: C.red, stroke: null });
    s += g(card, `translate(540 ${lerp(1500, 700, cp)}) rotate(${-3 + wob(t, 0.3, 1)})`);
    s += pro({ x: 790, y: 1960, s: 0.8, arm: "point", expr: "wink", t });
    return kenBurns(s, p, 0.03);
  }

  function sceneCTA(t) {
    const b = beat("cta");
    let s = bg(C.navy2);
    s += pro({ x: 540, y: 1330, s: 1.0, arm: "down", expr: "smile", t });
    const bob = wob(t, 1.2, 14);
    s += headline(["WOULD YOU", { t: "HAVE BOUGHT IT?", fill: C.gold }], 400, prog(t, b.s, b.s + 0.5), { size: 110 });
    s += g(`<path d="M 0 0 L 0 120 M -50 70 L 0 120 L 50 70" fill="none" stroke="${C.gold}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`, `translate(800 ${1380 + bob})`);
    s += text("COMMENT BELOW", 540, 1600, { size: 60, font: F.body, weight: 800, fill: C.white, sw: 14 });
    return s;
  }

  function sceneEnd(t) {
    const p = prog(t, TL.end, TL.end + 0.6);
    let s = bg(C.navy);
    s += g(logoMark(), `translate(540 ${lerp(1000, 820, eBack(p))}) scale(${lerp(0.4, 1.2, eBack(p))}) rotate(-6)`, `opacity="${clamp(p * 3)}"`);
    s += text("BRAND", 390, 1180, { size: 150, fill: C.cream, stroke: null, anchor: "middle" }) + text("PROS", 725, 1180, { size: 150, fill: C.gold, stroke: null, anchor: "middle" });
    s += text("EVERY BRAND HAS A BACKSTORY.", 540, 1290, { size: 46, font: F.body, weight: 600, fill: C.gray, stroke: null, ls: 3 });
    s += text("♪ cha-ching", 540, 1480, { size: 40, font: F.body, weight: 600, fill: C.gold, stroke: null, ls: 2 });
    return g(s, "", `opacity="${clamp(p * 2)}"`);
  }

  function frameS01(t) {
    let scene;
    if (t < beat("b1").s) scene = sceneHook(t);
    else if (t < beat("b2").s) scene = sceneMeeting(t);
    else if (t < beat("b3").s) scene = sceneLateFees(t);
    else if (t < beat("b4").s) scene = sceneRace(t);
    else if (t < beat("b5").s) scene = sceneBankrupt(t);
    else if (t < beat("cta").s) scene = sceneLesson(t);
    else if (t < TL.end) scene = sceneCTA(t);
    else scene = sceneEnd(t);
    // pop-cut: scale 1.06 -> 1 over 0.25 s after each beat boundary
    const bNow = TL.beats.filter((x) => x.s <= t).pop();
    const since = bNow ? t - bNow.s : 1;
    const pop = since < 0.25 ? lerp(1.06, 1, eOut(since / 0.25)) : 1;
    let out = g(scene, `translate(540 960) scale(${pop}) translate(-540 -960)`);
    if (t < TL.end) {
      out += seriesChip("THE $1B MISTAKE", C.red);
      out += captions(TL, t);
    }
    // flash on cut
    if (since < 0.08 && t > 0.2) out += `<rect width="1080" height="1920" fill="${C.white}" opacity="${0.35 * (1 - since / 0.08)}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920"><defs></defs>${out}</svg>`;
  }

  // ---------- LF01 thumbnail (1920x1080) ----------
  function thumbLF01(variant = "A") {
    let s = `<rect width="1920" height="1080" fill="${C.navy2}"/>` + burst(700, 560, C.navy3, 22, 2000);
    if (variant === "A") {
      // cracked storefront + red envelope wedged in
      const left = g(storefront({ x: 0, y: 0, w: 900, h: 700 }), "translate(640 1000)");
      s += `<clipPath id="cl"><path d="M 0 0 L 690 0 L 620 300 L 700 520 L 610 760 L 680 1080 L 0 1080 Z"/></clipPath>`;
      s += `<clipPath id="cr"><path d="M 690 0 L 1920 0 L 1920 1080 L 680 1080 L 610 760 L 700 520 L 620 300 Z"/></clipPath>`;
      s += g(left, "rotate(-3 640 700)", `clip-path="url(#cl)"`);
      s += g(g(left, "translate(40 20)"), "rotate(4 640 700)", `clip-path="url(#cr)"`);
      s += `<path d="M 690 280 L 620 420 L 700 600 L 610 820" fill="none" stroke="${C.navy}" stroke-width="18" stroke-linecap="round"/>`;
      s += envelope({ x: 660, y: 470, s: 1.2, color: C.red, r: -28, face: "happy" });
      s += text("IT WASN'T", 1480, 400, { size: 200, fill: C.white, sw: 28 });
      s += text("NETFLIX", 1480, 620, { size: 240, fill: C.gold, sw: 32 });
    } else {
      s += person({ x: 520, y: 1080, s: 1.5, suit: C.navy3, hair: "slick", hairColor: "#2B2B2B", tie: C.storeYellow, expr: "laugh", skin: C.skinA });
      s += g(priceTag(520, 200) + text("NETFLIX", 40, 40, { size: 110, fill: C.navy, stroke: null }), "translate(1000 330) rotate(-10)");
      s += text("$50M", 1500, 470, { size: 230, fill: C.gold, sw: 32 });
      s += text("MISTAKE?", 1500, 700, { size: 200, fill: C.white, sw: 28 });
    }
    s += g(`<rect x="0" y="-40" width="360" height="72" rx="12" fill="${C.red}" stroke="${C.navy}" stroke-width="6"/>` + text("$1B MISTAKE", 180, 14, { size: 42, fill: C.white, stroke: null, font: F.body, weight: 800, ls: 2 }), "translate(60 100)");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">${s}</svg>`;
  }

  // ---------- static brand assets ----------
  function avatar() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800"><circle cx="400" cy="400" r="400" fill="${C.navy}"/>${g(logoMark(), "translate(400 410) scale(1.25) rotate(-8)")}</svg>`;
  }
  function wordmark(dark = true) {
    const bgc = dark ? C.navy : C.cream, brand = dark ? C.cream : C.navy;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 400" width="1400" height="400"><rect width="1400" height="400" fill="${bgc}"/>${g(logoMark(), "translate(250 200) scale(0.8) rotate(-6)")}${text("BRAND", 490, 262, { size: 190, fill: brand, stroke: null, anchor: "start" })}${text("PROS", 928, 262, { size: 190, fill: C.gold, stroke: null, anchor: "start" })}</svg>`;
  }
  function mascotSheet() {
    const poses = [["smile", "wave"], ["shock", "hold"], ["think", "shrug"], ["wink", "point"]];
    let s = `<rect width="2000" height="1000" fill="${C.cream}"/>`;
    poses.forEach(([e, a], i) => { s += pro({ x: 230 + i * 470, y: 900, s: 0.9, expr: e, arm: a, t: 0.3 }); });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1000" width="2000" height="1000">${s}</svg>`;
  }
  function ytBanner() {
    let s = `<rect width="2560" height="1440" fill="${C.navy}"/>` + burst(1280, 720, C.navy2, 28, 2600);
    // safe area 1546x423 centred
    s += g(logoMark(), "translate(760 720) scale(0.7) rotate(-6)");
    s += text("BRAND", 1010, 770, { size: 170, fill: C.cream, stroke: null, anchor: "start" }) + text("PROS", 1402, 770, { size: 170, fill: C.gold, stroke: null, anchor: "start" });
    s += text("EVERY BRAND HAS A BACKSTORY  ·  NEW STORY EVERY THURSDAY", 1280, 860, { size: 40, font: F.body, weight: 600, fill: C.gray, stroke: null, ls: 3 });
    s += pro({ x: 2280, y: 1130, s: 0.85, arm: "wave", expr: "smile", t: 0.2 });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2560 1440" width="2560" height="1440">${s}</svg>`;
  }

  root.BP = { C, F, S01, frameS01, thumbLF01, logoMark, pro, person, storefront, priceTag, avatar, wordmark, mascotSheet, ytBanner, text, g };
})(typeof window !== "undefined" ? window : globalThis);
