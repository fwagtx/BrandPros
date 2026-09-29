/* BrandPros Founder Files cast.
 * Caricature busts of deceased, historical founders, built from their documented signature looks
 * (face shape, hair, facial hair, glasses, period clothing, props). Drawn in the house style.
 * Living founders are NOT in this cast: per the legal rules they appear as generic characters.
 * Requires bp-engine.js (window.BP).
 *   BP.founder(id, {expr})      -> SVG group markup for one bust (origin = bottom centre, ~560 tall)
 *   BP.founderCard(id)          -> 800x1000 SVG portrait card
 *   BP.castSheet()              -> 2100x1250 SVG with the whole cast
 *   BP.FOUNDERS                 -> the cast data (names, years, stories, likeness notes)
 */
(function (root) {
  "use strict";
  const BP = root.BP;
  const { C, F, g, text, S, note, label, tape, halftone, measure } = BP;
  const INK = "#17150F";

  // ---------- cast ----------
  const FOUNDERS = {
    sanders: {
      name: "Colonel Harland Sanders", short: "Colonel Sanders", years: "1890–1980", brand: "KFC", story: "S05 · Founder Files",
      look: "white suit, black string tie, black frames, white goatee",
      skin: "#F1C8A8", face: { w: 112, h: 122, jaw: 96, chin: 124 }, nose: "round", ears: 1.05, age: 3,
      hair: { style: "swept", color: "#F4F1EA" }, brows: { color: "#9A9A9A", thick: 9, arch: 4 },
      mustache: { style: "colonel", color: "#F7F4EE" }, beard: { style: "goatee", color: "#F7F4EE" },
      glasses: "thick", outfit: { style: "white-suit" }, expr: "grin", prop: "cane", bg: "red",
    },
    disney: {
      name: "Walt Disney", short: "Walt Disney", years: "1901–1966", brand: "Disney", story: "I-73 · Founder Files",
      look: "pencil mustache, side-parted dark hair, arched brows, easy grin",
      skin: "#EFC5A2", face: { w: 98, h: 132, jaw: 62, chin: 132 }, nose: "long", ears: 1, age: 1,
      hair: { style: "sidepart", color: "#4A3526" }, brows: { color: "#3A2A1E", thick: 8, arch: 12 },
      mustache: { style: "pencil", color: "#3A2A1E" }, outfit: { style: "suit", color: "#6D6250", tie: "#8C2F2A" },
      expr: "smile", prop: "pencil", bg: "navy",
    },
    woolworth: {
      name: "Frank W. Woolworth", short: "Frank Woolworth", years: "1852–1919", brand: "Woolworth", story: "S10 · Dead Brands",
      look: "heavy walrus mustache, balding crown, three-piece suit, watch chain",
      skin: "#EDC3A0", face: { w: 116, h: 120, jaw: 100, chin: 118 }, nose: "round", ears: 1, age: 2,
      hair: { style: "bald-sides", color: "#6E655C" }, brows: { color: "#5A4E44", thick: 9, arch: 2 },
      mustache: { style: "walrus", color: "#6A5E52" }, outfit: { style: "three-piece", color: "#3C3A38", tie: "#2A2522" },
      expr: "stern", prop: "nickel", bg: "brass",
    },
    adi: {
      name: "Adi Dassler", short: "Adi Dassler", years: "1900–1978", brand: "adidas", story: "S08 · Brand Wars",
      look: "round face, combed-back dark hair, soft smile, cardigan, a shoe in hand",
      skin: "#EFC6A4", face: { w: 110, h: 118, jaw: 84, chin: 118 }, nose: "button", ears: 1.1, age: 1,
      hair: { style: "comb-back", color: "#3B2E25" }, brows: { color: "#3B2E25", thick: 8, arch: 3 },
      outfit: { style: "cardigan", color: "#6F7F6B" }, expr: "warm", prop: "shoe", bg: "mint",
    },
    rudolf: {
      name: "Rudolf Dassler", short: "Rudolf Dassler", years: "1898–1974", brand: "Puma", story: "S08 · Brand Wars",
      look: "narrow face, glossy slicked-back hair, sharp suit, pocket square",
      skin: "#EBC19E", face: { w: 98, h: 128, jaw: 62, chin: 128 }, nose: "long", ears: 1, age: 1,
      hair: { style: "slick", color: "#2A221C" }, brows: { color: "#2A221C", thick: 8, arch: 8 },
      outfit: { style: "suit", color: "#2F3A48", tie: "#6B1F1F", pocket: true }, expr: "smirk", prop: "stopwatch", bg: "red",
    },
    kroc: {
      name: "Ray Kroc", short: "Ray Kroc", years: "1902–1984", brand: "McDonald's", story: "S09 · How They Make Money",
      look: "slicked-back hair, long face, big salesman's grin, milkshake mixer",
      skin: "#EDC3A2", face: { w: 100, h: 130, jaw: 66, chin: 130 }, nose: "long", ears: 1.08, age: 2,
      hair: { style: "slick", color: "#8A8580" }, brows: { color: "#5E5750", thick: 8, arch: 6 },
      outfit: { style: "suit", color: "#4A5560", tie: "#A33A2E" }, expr: "grin", prop: "shake", bg: "brass",
    },
    hershey: {
      name: "Milton S. Hershey", short: "Milton Hershey", years: "1857–1945", brand: "Hershey", story: "I-50 · How They Make Money",
      look: "white walrus mustache, receding white hair, round face, vest and bow tie",
      skin: "#F0C9A8", face: { w: 110, h: 118, jaw: 90, chin: 118 }, nose: "round", ears: 1, age: 3,
      hair: { style: "bald-sides", color: "#E8E4DC" }, brows: { color: "#CFC9BF", thick: 8, arch: 3 },
      mustache: { style: "walrus", color: "#F2EFE8" }, outfit: { style: "three-piece", color: "#4B4034", bow: true, tie: "#2A2522" },
      expr: "warm", prop: "chocolate", bg: "mint",
    },
    ford: {
      name: "Henry Ford", short: "Henry Ford", years: "1863–1947", brand: "Ford", story: "I-74 · Founder Files",
      look: "lean long face, neat gray side part, prominent ears, high collar, clean-shaven",
      skin: "#EEC7A6", face: { w: 94, h: 136, jaw: 58, chin: 136 }, nose: "long", ears: 1.25, age: 2,
      hair: { style: "sidepart", color: "#9D968D" }, brows: { color: "#7A736A", thick: 7, arch: 5 },
      outfit: { style: "high-collar", color: "#3E4247", tie: "#23262A" }, expr: "neutral", prop: "wrench", bg: "navy",
    },
    sears: {
      name: "Richard W. Sears", short: "Richard Sears", years: "1863–1914", brand: "Sears", story: "LF04 · Dead Brands",
      look: "1890s dark center-ish part, thick dark mustache, high collar, pocket watch",
      skin: "#EFC7A5", face: { w: 100, h: 124, jaw: 72, chin: 124 }, nose: "straight", ears: 1, age: 1,
      hair: { style: "centerpart", color: "#2E241C" }, brows: { color: "#2E241C", thick: 9, arch: 4 },
      mustache: { style: "bushy", color: "#2E241C" }, outfit: { style: "high-collar", color: "#33302C", tie: "#5A2A22" },
      expr: "neutral", prop: "watch", bg: "brass",
    },
    walker: {
      name: "Madam C.J. Walker", short: "Madam C.J. Walker", years: "1867–1919", brand: "Walker Co.", story: "#76 · Founder Files",
      look: "hair swept up high, high lace collar, pearls, poised half-smile",
      skin: "#8A5A3C", face: { w: 104, h: 124, jaw: 78, chin: 124 }, nose: "round", ears: 0.95, age: 1,
      hair: { style: "updo", color: "#1E1712" }, brows: { color: "#1E1712", thick: 7, arch: 8 },
      outfit: { style: "blouse", color: "#EFE6D6" }, expr: "warm", prop: "jar", bg: "red", female: true,
    },
  };
  const ORDER = ["sanders", "disney", "woolworth", "adi", "rudolf", "kroc", "hershey", "ford", "sears", "walker"];

  // ---------- drawing helpers ----------
  const shade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
    return "#" + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join("");
  };
  function facePath(f) {
    const { w, h, jaw, chin } = f;
    return `M ${-w} -6 C ${-w} ${-h * 1.28} ${w} ${-h * 1.28} ${w} -6 C ${w} ${h * 0.42} ${jaw} ${chin * 0.9} 0 ${chin} C ${-jaw} ${chin * 0.9} ${-w} ${h * 0.42} ${-w} -6 Z`;
  }

  function outfit(p) {
    const o = p.outfit, skin = p.skin;
    let s = "", front = "";
    const body = (col) => `<path d="M -230 0 L -215 -120 Q -200 -170 -120 -188 L -52 -200 L 52 -200 L 120 -188 Q 200 -170 215 -120 L 230 0 Z" ${S(col)}/>`;
    const shadowR = `<path d="M 60 -196 L 120 -188 Q 200 -170 215 -120 L 230 0 L 70 0 Z" fill="url(#${BP.ID.dI})"/>`;
    const lapels = (col, shirt = "#FBF7EE") =>
      `<path d="M -52 -200 L 0 -60 L 52 -200 Z" ${S(shirt, 6)}/>` +
      `<path d="M -52 -200 L -95 -150 L -40 -110 L -70 -80 L 0 -40 Z" ${S(shade(col, 0.88), 6)}/>` +
      `<path d="M 52 -200 L 95 -150 L 40 -110 L 70 -80 L 0 -40 Z" ${S(shade(col, 0.88), 6)}/>`;
    const longTie = (col) => `<path d="M -12 -186 L 12 -186 L 18 -110 L 0 -80 L -18 -110 Z" ${S(col, 5)}/>`;
    const neck = `<path d="M -42 -236 L -46 -190 Q 0 -168 46 -190 L 42 -236 Z" ${S(skin, 6)}/>`;
    if (o.style === "white-suit") {
      s += body("#F6F3EC") + shadowR + neck + lapels("#F6F3EC");
      front += `<path d="M -40 -178 Q -20 -196 0 -176 Q 20 -196 40 -178 Q 20 -160 0 -176 Q -20 -160 -40 -178 Z" fill="${INK}"/>` +
        `<path d="M -4 -172 L -16 -110 M 4 -172 L 16 -112" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    } else if (o.style === "suit") {
      s += body(o.color) + shadowR + neck + lapels(o.color) + longTie(o.tie);
      if (o.pocket) front += `<path d="M 118 -130 L 150 -140 L 158 -122 L 124 -114 Z" ${S("#F2EAD7", 4)}/>`;
    } else if (o.style === "three-piece") {
      s += body(o.color) + shadowR + neck;
      s += `<path d="M -52 -200 L 0 -80 L 52 -200 Z" ${S("#FBF7EE", 6)}/>`;
      s += `<path d="M -70 -170 L 0 -70 L 70 -170 L 80 0 L -80 0 Z" ${S(shade(o.color, 1.25), 6)}/>`;
      s += `<path d="M -52 -200 L -110 -140 L -84 0 M 52 -200 L 110 -140 L 84 0" fill="none" stroke="${INK}" stroke-width="6"/>`;
      for (let i = 0; i < 3; i++) s += `<circle cx="0" cy="${-50 + i * 34}" r="6" fill="${INK}"/>`;
      front += `<path d="M 10 -30 Q 40 -8 64 -40" fill="none" stroke="${C.brass}" stroke-width="5" stroke-dasharray="7 5"/>`;
      front += o.bow ? `<path d="M -34 -196 L 0 -184 L -34 -170 Z M 34 -196 L 0 -184 L 34 -170 Z" ${S(o.tie, 4)}/>` : longTie(o.tie);
    } else if (o.style === "high-collar") {
      s += body(o.color) + shadowR + neck + lapels(o.color);
      s += `<path d="M -44 -206 L -40 -176 L -6 -180 L -2 -206 M 44 -206 L 40 -176 L 6 -180 L 2 -206" ${S("#FBF7EE", 5)}/>`;
      front += `<path d="M -18 -178 Q 0 -168 18 -178 L 14 -130 Q 0 -120 -14 -130 Z" ${S(o.tie, 5)}/>`;
    } else if (o.style === "cardigan") {
      s += body(o.color) + shadowR + neck;
      s += `<path d="M -48 -200 Q 0 -150 48 -200 L 40 0 L -40 0 Z" ${S("#F1EDE4", 6)}/>`;
      s += `<path d="M -48 -200 L -40 0 M 48 -200 L 40 0" stroke="${INK}" stroke-width="6"/>`;
      for (let i = 0; i < 4; i++) s += `<circle cx="-52" cy="${-150 + i * 40}" r="6" ${S(C.cream, 3)}/>`;
    } else if (o.style === "blouse") {
      s += body("#5B3B46") + shadowR;
      s += `<path d="M -70 -200 Q 0 -160 70 -200 L 60 -120 Q 0 -90 -60 -120 Z" ${S(o.color, 6)}/>`;
      s += `<path d="M -44 -246 L -48 -186 Q 0 -168 48 -186 L 44 -246 Z" ${S(o.color, 6)}/>`;
      for (let i = -3; i <= 3; i++) s += `<path d="M ${i * 13} -246 L ${i * 13} -190" stroke="${shade(o.color, 0.8)}" stroke-width="3"/>`;
      front += Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (0.15 + 0.7 * i / 10); return `<circle cx="${Math.cos(a) * 58}" cy="${-150 + Math.sin(a) * 36}" r="8" ${S("#FFFDF6", 3)}/>`; }).join("");
    }
    return { s, front };
  }

  function hairBack(p) {
    const H = p.hair, f = p.face;
    if (H.style === "updo") return `<ellipse cx="0" cy="${-f.h * 1.05}" rx="${f.w * 0.62}" ry="${f.h * 0.42}" ${S(H.color)}/>`;
    return "";
  }
  // Hair mass with a real hairline: covers the crown, comes down to sideburns, leaves the forehead visible.
  function cap(f, o) {
    const { w, h } = f, vt = o.vt || 0.1, hc = o.hc || -0.66, tp = o.tp || -0.6, sy = o.sy || -0.12, px = o.px || 0;
    return `M ${-w - 7} ${h * sy} C ${-w - 16} ${-h * 0.75} ${-w * 0.72} ${-h * (1.02 + vt)} 0 ${-h * (1.02 + vt)} ` +
      `C ${w * 0.72} ${-h * (1.02 + vt)} ${w + 16} ${-h * 0.75} ${w + 7} ${h * sy} ` +
      `C ${w * 0.92} ${h * (sy - 0.1)} ${w * 0.82} ${-h * 0.5} ${w * 0.6} ${h * tp} ` +
      `C ${w * 0.35 + px} ${h * (hc - 0.06)} ${-w * 0.35 + px} ${h * (hc - 0.06)} ${-w * 0.6} ${h * tp} ` +
      `C ${-w * 0.82} ${-h * 0.5} ${-w * 0.92} ${h * (sy - 0.1)} ${-w - 7} ${h * sy} Z`;
  }
  const strands = (arr, col, sw = 4, op = 0.7) => arr.map((d) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`).join("");
  function hairFront(p) {
    const H = p.hair, f = p.face, w = f.w, h = f.h, col = H.color, dark = shade(col, 0.72), light = shade(col, 1.35);
    switch (H.style) {
      case "swept": // Sanders: full white hair swept straight back, high forehead, wavy crown
        return `<path d="${cap(f, { vt: 0.2, hc: -0.82, tp: -0.7, sy: -0.02 })}" ${S(col)}/>` +
          `<path d="M ${-w * 0.7} ${-h * 1.02} Q ${-w * 0.45} ${-h * 1.3} ${-w * 0.15} ${-h * 1.2} Q ${w * 0.15} ${-h * 1.34} ${w * 0.45} ${-h * 1.2} Q ${w * 0.7} ${-h * 1.25} ${w * 0.8} ${-h * 1.0}" ${S(col, 7)}/>` +
          strands([`M ${-w * 0.45} ${-h * 0.86} Q ${-w * 0.35} ${-h * 1.05} ${-w * 0.1} ${-h * 1.12}`, `M ${-w * 0.05} ${-h * 0.9} Q ${w * 0.05} ${-h * 1.1} ${w * 0.3} ${-h * 1.16}`, `M ${w * 0.35} ${-h * 0.86} Q ${w * 0.45} ${-h * 1.0} ${w * 0.62} ${-h * 1.04}`], "#BDB7AC", 5, 0.9);
      case "sidepart": // Disney / Ford: side part on the left, wave rising over the right brow
        return `<path d="${cap(f, { vt: 0.16, hc: -0.7, tp: -0.58, sy: -0.14, px: w * 0.1 })}" ${S(col)}/>` +
          `<path d="M ${-w * 0.42} ${-h * 0.92} C ${-w * 0.1} ${-h * 1.02} ${w * 0.45} ${-h * 1.0} ${w * 0.62} ${-h * 0.62} C ${w * 0.4} ${-h * 0.82} ${-w * 0.05} ${-h * 0.84} ${-w * 0.42} ${-h * 0.92} Z" ${S(shade(col, 1.1), 6)}/>` +
          `<path d="M ${-w * 0.42} ${-h * 0.92} L ${-w * 0.36} ${-h * 1.16}" stroke="${dark}" stroke-width="5" stroke-linecap="round"/>` +
          strands([`M ${-w * 0.2} ${-h * 1.04} Q ${w * 0.2} ${-h * 1.12} ${w * 0.6} ${-h * 0.9}`, `M ${-w * 0.7} ${-h * 0.8} Q ${-w * 0.6} ${-h * 1.0} ${-w * 0.45} ${-h * 1.06}`], light, 5, 0.55);
      case "centerpart": // Sears: 1890s centre part, hair combed flat to each side
        return `<path d="${cap(f, { vt: 0.08, hc: -0.74, tp: -0.62, sy: -0.16 })}" ${S(col)}/>` +
          `<path d="M 0 ${-h * 0.72} L 0 ${-h * 1.08}" stroke="${light}" stroke-width="5" stroke-linecap="round"/>` +
          strands([`M -6 ${-h * 0.8} Q ${-w * 0.4} ${-h * 0.9} ${-w * 0.78} ${-h * 0.62}`, `M 6 ${-h * 0.8} Q ${w * 0.4} ${-h * 0.9} ${w * 0.78} ${-h * 0.62}`], light, 4, 0.55);
      case "comb-back": // Adi: short, combed straight back
        return `<path d="${cap(f, { vt: 0.12, hc: -0.76, tp: -0.62, sy: -0.18 })}" ${S(col)}/>` +
          strands([-0.45, -0.15, 0.15, 0.45].map((k) => `M ${w * k} ${-h * 0.78} Q ${w * k * 0.9} ${-h * 1.0} ${w * k * 0.7} ${-h * 1.1}`), light, 4, 0.6);
      case "slick": // Kroc / Rudolf: glossy, slicked back, widow's-peak hairline
        return `<path d="${cap(f, { vt: 0.1, hc: -0.66, tp: -0.64, sy: -0.16 })}" ${S(col)}/>` +
          `<path d="M ${-w * 0.5} ${-h * 0.95} Q 0 ${-h * 1.1} ${w * 0.5} ${-h * 0.95}" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="0.4"/>` +
          strands([`M ${-w * 0.25} ${-h * 0.74} Q ${-w * 0.3} ${-h * 0.95} ${-w * 0.4} ${-h * 1.06}`, `M ${w * 0.25} ${-h * 0.74} Q ${w * 0.3} ${-h * 0.95} ${w * 0.4} ${-h * 1.06}`], dark, 4, 0.7);
      case "bald-sides":
        return `<path d="M ${-w - 7} ${-h * 0.02} C ${-w - 14} ${-h * 0.5} ${-w * 0.86} ${-h * 0.74} ${-w * 0.6} ${-h * 0.82} C ${-w * 0.7} ${-h * 0.55} ${-w * 0.78} ${-h * 0.25} ${-w - 7} ${-h * 0.02} Z" ${S(col, 6)}/>` +
          `<path d="M ${w + 7} ${-h * 0.02} C ${w + 14} ${-h * 0.5} ${w * 0.86} ${-h * 0.74} ${w * 0.6} ${-h * 0.82} C ${w * 0.7} ${-h * 0.55} ${w * 0.78} ${-h * 0.25} ${w + 7} ${-h * 0.02} Z" ${S(col, 6)}/>` +
          `<path d="M ${-w * 0.35} ${-h * 0.98} Q ${-w * 0.1} ${-h * 1.1} ${w * 0.15} ${-h * 1.02}" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" opacity="0.35"/>`;
      case "updo": // Walker: tall swept-up pompadour
        return `<path d="${cap(f, { vt: 0.46, hc: -0.66, tp: -0.56, sy: -0.1 })}" ${S(col)}/>` +
          strands([`M ${-w * 0.55} ${-h * 0.75} Q ${-w * 0.5} ${-h * 1.3} 0 ${-h * 1.36}`, `M ${w * 0.55} ${-h * 0.75} Q ${w * 0.5} ${-h * 1.3} 0 ${-h * 1.36}`, `M ${-w * 0.25} ${-h * 0.72} Q ${-w * 0.2} ${-h * 1.15} ${w * 0.1} ${-h * 1.24}`], "#5A4638", 5, 0.8);
      default: return "";
    }
  }
  function mustache(p) {
    const m = p.mustache; if (!m) return "";
    const col = m.color;
    switch (m.style) {
      case "pencil": return `<path d="M -34 46 Q -18 38 0 44 Q 18 38 34 46" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`;
      case "walrus": return `<path d="M -64 58 C -60 30 -30 26 0 36 C 30 26 60 30 64 58 C 56 74 40 70 30 64 C 20 70 8 66 0 60 C -8 66 -20 70 -30 64 C -40 70 -56 74 -64 58 Z" ${S(col, 6)}/>` +
        `<path d="M -40 44 L -44 60 M -20 40 L -22 60 M 20 40 L 22 60 M 40 44 L 44 60" stroke="${shade(col, 0.8)}" stroke-width="3"/>`;
      case "bushy": return `<path d="M -54 52 C -48 32 -20 30 0 38 C 20 30 48 32 54 52 C 40 60 20 56 0 52 C -20 56 -40 60 -54 52 Z" ${S(col, 6)}/>`;
      case "colonel": return `<path d="M -50 52 C -44 34 -18 32 0 40 C 18 32 44 34 50 52 C 36 58 18 54 0 50 C -18 54 -36 58 -50 52 Z" ${S(col, 6)}/>`;
      default: return "";
    }
  }
  function beard(p) {
    const b = p.beard; if (!b) return "";
    if (b.style === "goatee") return `<path d="M -30 84 C -34 110 -18 140 0 146 C 18 140 34 110 30 84 C 16 92 -16 92 -30 84 Z" ${S(b.color, 6)}/>` +
      `<path d="M -10 100 L -8 130 M 10 100 L 8 130" stroke="#D8D3C9" stroke-width="3"/>`;
    return "";
  }
  function eyes(p, expr) {
    const bc = p.brows, sw = bc.thick, a = bc.arch;
    let s = "";
    if (expr === "grin" || expr === "warm") {
      s += `<path d="M -54 0 Q -38 -14 -22 0 M 22 0 Q 38 -14 54 0" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
    } else {
      s += `<ellipse cx="-38" cy="-2" rx="11" ry="12" fill="${INK}"/><ellipse cx="38" cy="-2" rx="11" ry="12" fill="${INK}"/>`;
      s += `<circle cx="-34" cy="-6" r="3.5" fill="#FFFFFF"/><circle cx="42" cy="-6" r="3.5" fill="#FFFFFF"/>`;
    }
    const by = expr === "stern" ? -24 : -30;
    const inner = expr === "stern" ? 6 : 0, smirk = expr === "smirk" ? -8 : 0;
    s += `<path d="M -64 ${by + 4} Q -44 ${by - a} -18 ${by + inner}" fill="none" stroke="${bc.color}" stroke-width="${sw}" stroke-linecap="round"/>`;
    s += `<path d="M 18 ${by + inner + smirk} Q 44 ${by - a + smirk} 64 ${by + 4 + smirk}" fill="none" stroke="${bc.color}" stroke-width="${sw}" stroke-linecap="round"/>`;
    if (p.age >= 2) s += `<path d="M -62 12 Q -56 18 -48 16 M 62 12 Q 56 18 48 16" fill="none" stroke="${shade(p.skin, 0.72)}" stroke-width="4" stroke-linecap="round"/>`;
    return s;
  }
  function noseMouth(p, expr) {
    const sk = shade(p.skin, 0.72);
    let s = "";
    if (p.nose === "round") s += `<ellipse cx="2" cy="24" rx="20" ry="15" fill="${shade(p.skin, 0.9)}"/><path d="M -20 30 Q -12 40 -4 34 M 4 34 Q 12 40 20 30" fill="none" stroke="${sk}" stroke-width="5" stroke-linecap="round"/><circle cx="8" cy="18" r="4" fill="#FFFFFF" opacity="0.5"/>`;
    else if (p.nose === "long") s += `<path d="M -4 -6 L -12 30 Q -4 40 10 32" fill="none" stroke="${sk}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (p.nose === "straight") s += `<path d="M -2 -4 L -8 28 Q 0 34 10 28" fill="none" stroke="${sk}" stroke-width="5" stroke-linecap="round"/>`;
    else s += `<path d="M -10 28 Q 0 36 10 28" fill="none" stroke="${sk}" stroke-width="5" stroke-linecap="round"/>`;
    const my = p.mustache && p.mustache.style !== "pencil" ? 72 : 62;
    if (expr === "grin") s += `<path d="M -44 ${my - 6} Q 0 ${my + 44} 44 ${my - 6} Z" ${S("#FFFDF6", 6)}/><path d="M -30 ${my + 16} Q 0 ${my + 34} 30 ${my + 16}" fill="none" stroke="${C.red}" stroke-width="8" stroke-linecap="round" opacity="0.7"/>`;
    else if (expr === "smile") s += `<path d="M -36 ${my - 2} Q 0 ${my + 30} 36 ${my - 2}" ${S("#FFFDF6", 6)}/>`;
    else if (expr === "warm") s += `<path d="M -30 ${my} Q 0 ${my + 22} 30 ${my}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    else if (expr === "smirk") s += `<path d="M -26 ${my + 6} Q 4 ${my + 14} 32 ${my - 6}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    else if (expr === "stern") s += `<path d="M -24 ${my + 6} L 24 ${my + 6}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    else s += `<path d="M -24 ${my + 4} Q 0 ${my + 10} 24 ${my + 4}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    if (p.age >= 2) s += `<path d="M -40 30 Q -52 56 -40 80 M 40 30 Q 52 56 40 80" fill="none" stroke="${sk}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`;
    if (p.age >= 3) s += `<path d="M -40 -62 Q 0 -70 40 -62 M -30 -76 Q 0 -82 30 -76" fill="none" stroke="${sk}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
    if (p.female) s += `<path d="M -26 ${my + 2} Q 0 ${my + 14} 26 ${my + 2}" fill="none" stroke="#7A2E2A" stroke-width="4" opacity="0.6"/>`;
    return s;
  }
  function glasses(p) {
    if (p.glasses === "thick") return `<rect x="-76" y="-26" width="64" height="46" rx="10" fill="#FFFFFF" fill-opacity="0.18" stroke="${INK}" stroke-width="11"/><rect x="12" y="-26" width="64" height="46" rx="10" fill="#FFFFFF" fill-opacity="0.18" stroke="${INK}" stroke-width="11"/><path d="M -12 -8 L 12 -8 M -76 -14 L -${p.face.w} -18 M 76 -14 L ${p.face.w} -18" stroke="${INK}" stroke-width="9"/>`;
    return "";
  }
  function prop(id, kind) {
    switch (kind) {
      case "cane": return `<path d="M 170 0 L 190 -330 Q 196 -380 240 -372 Q 270 -364 262 -330" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M 170 0 L 190 -330 Q 196 -380 240 -372 Q 270 -364 262 -330" fill="none" stroke="#6B4A2E" stroke-width="12" stroke-linecap="round"/>`;
      case "pencil": return g(`<rect x="-8" y="-90" width="16" height="170" ${S(C.brass, 5)}/><path d="M -8 80 L 0 110 L 8 80 Z" ${S("#E9CFA8", 4)}/><rect x="-8" y="-104" width="16" height="16" ${S("#D98C8C", 4)}/>`, "translate(118 -340) rotate(-70)");
      case "nickel": return g(`<circle r="54" ${S("#B9B6AE", 6)}/><circle r="40" fill="none" stroke="#8C8980" stroke-width="4"/>` + text("5¢", 0, 18, { size: 50, fill: INK }), "translate(-200 -110) rotate(-10)");
      case "shoe": return g(`<path d="M -90 10 Q -96 -40 -60 -44 L -20 -44 Q 0 -80 30 -64 L 60 -30 Q 100 -20 96 10 Z" ${S("#F2EAD7", 6)}/><path d="M -96 10 L 98 10 L 96 26 L -94 26 Z" ${S("#2B2B2B", 5)}/><path d="M -10 -44 L 20 -20 M 4 -54 L 34 -30" stroke="${INK}" stroke-width="4"/>` + [-70, -40, -10, 20, 50, 80].map((x) => `<path d="M ${x} 26 L ${x} 36" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`).join(""), "translate(-170 -60) rotate(-12)");
      case "stopwatch": return g(`<circle r="46" ${S("#D9D4C8", 6)}/><circle r="34" fill="#FFFDF6" stroke="${INK}" stroke-width="3"/><rect x="-8" y="-66" width="16" height="16" ${S("#D9D4C8", 4)}/><path d="M 0 0 L 0 -24 M 0 0 L 16 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`, "translate(190 -80)");
      case "shake": return g(`<path d="M -34 -80 L 34 -80 L 24 40 L -24 40 Z" ${S("#E4E8EA", 6)}/><path d="M -30 -40 L 30 -40 L 26 10 L -26 10 Z" fill="#F4E3D2"/><path d="M 10 -80 L 30 -150" stroke="${C.red}" stroke-width="10" stroke-linecap="round"/>`, "translate(195 -70) rotate(8)");
      case "chocolate": return g(`<rect x="-70" y="-40" width="140" height="80" rx="6" ${S("#6B3E26", 6)}/>` + [-35, 0, 35].map((x) => `<path d="M ${x} -40 L ${x} 40" stroke="#4A2A18" stroke-width="4"/>`).join("") + `<path d="M -70 0 L 70 0" stroke="#4A2A18" stroke-width="4"/><path d="M -70 -40 L -10 -40 L -30 40 L -70 40 Z" ${S(C.cream, 5)}/>`, "translate(-190 -90) rotate(-14)");
      case "wrench": return g(`<path d="M -10 60 L -10 -60 M 10 60 L 10 -60" stroke="${INK}" stroke-width="4"/><rect x="-12" y="-60" width="24" height="130" rx="6" ${S("#A9ADB0", 5)}/><path d="M -32 -60 Q -36 -100 -12 -110 L -12 -84 L 12 -84 L 12 -110 Q 36 -100 32 -60 Z" ${S("#A9ADB0", 5)}/>`, "translate(195 -110) rotate(24)");
      case "watch": return g(`<circle r="48" ${S(C.brass, 6)}/><circle r="36" fill="#FFFDF6" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="-58" r="10" fill="none" stroke="${INK}" stroke-width="5"/><path d="M 0 0 L 0 -22 M 0 0 L 14 10" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M 0 -66 Q -40 -110 -80 -90" fill="none" stroke="${C.brass}" stroke-width="5" stroke-dasharray="8 5"/>`, "translate(185 -80) rotate(10)");
      case "jar": return g(`<rect x="-44" y="-50" width="88" height="90" rx="10" ${S("#E9DFC9", 6)}/><rect x="-50" y="-66" width="100" height="22" rx="5" ${S("#6E4A5C", 5)}/><rect x="-32" y="-26" width="64" height="40" fill="#F4ECDC" stroke="${INK}" stroke-width="3"/><path d="M -22 -12 L 22 -12 M -22 2 L 12 2" stroke="${C.slate}" stroke-width="4"/>`, "translate(-190 -80) rotate(-8)");
      default: return "";
    }
  }

  function founder(id, o = {}) {
    const p = FOUNDERS[id];
    const expr = o.expr || p.expr;
    const out = outfit(p);
    const f = p.face;
    let head = hairBack(p);
    head += `<ellipse cx="${-f.w - 6}" cy="10" rx="${20 * p.ears}" ry="${30 * p.ears}" ${S(p.skin, 6)}/><ellipse cx="${f.w + 6}" cy="10" rx="${20 * p.ears}" ry="${30 * p.ears}" ${S(p.skin, 6)}/>`;
    head += `<path d="${facePath(f)}" ${S(p.skin)}/>`;
    head += `<path d="M ${f.w * 0.35} ${-f.h * 0.9} C ${f.w * 1.05} ${-f.h * 0.5} ${f.w * 0.95} ${f.h * 0.5} ${f.jaw * 0.2} ${f.chin * 0.98}" fill="none" stroke="${shade(p.skin, 0.82)}" stroke-width="16" opacity="0.35"/>`;
    head += `<circle cx="-62" cy="34" r="18" fill="url(#${BP.ID.dR})" opacity="0.7"/><circle cx="62" cy="34" r="18" fill="url(#${BP.ID.dR})" opacity="0.7"/>`;
    head += eyes(p, expr) + noseMouth(p, expr) + mustache(p) + beard(p) + hairFront(p) + glasses(p);
    const neckTop = -236;
    const headG = g(head, `translate(0 ${neckTop - f.chin + 18})`);
    return g(prop(id, p.prop) + out.s + headG + out.front);
  }

  const BGS = { red: ["#E9C3B6", "dR"], navy: ["#C8D2D6", "dI"], brass: ["#E3C47E", "dB"], mint: ["#CFE3D6", "dI"] };

  function cardInner(id, w, h) {
    const p = FOUNDERS[id];
    const [bgc, dots] = BGS[p.bg];
    let s = `<rect width="${w}" height="${h}" fill="${C.pCream}"/>`;
    // oval portrait window
    const cx = w / 2, cy = h * 0.43, rx = w * 0.4, ry = h * 0.36;
    const clipId = BP.ID.key("oval" + id);
    s += `<clipPath id="${clipId}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath>`;
    s += g(`<rect width="${w}" height="${h}" fill="${bgc}"/>` + halftone(cx + rx * 0.4, cy - ry * 0.3, rx * 0.9, dots) + g(founder(id), `translate(${cx} ${cy + ry + 95 * (w / 800)}) scale(${(w / 800) * 1.32})`), "", `clip-path="url(#${clipId})"`);
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${INK}" stroke-width="7"/>`;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx + 16}" ry="${ry + 16}" fill="none" stroke="${C.ledger}" stroke-width="3"/>`;
    // name plate
    const nameSize = w * 0.068;
    s += text(p.name, cx, h * 0.87, { size: nameSize, font: F.serif, fill: C.ledger });
    s += text(`${p.years}  ·  ${p.brand.toUpperCase()}`, cx, h * 0.92, { size: w * 0.028, font: F.body, weight: 800, fill: C.slate, ls: 3 });
    s += note(p.story, cx, h * 0.972, { size: w * 0.032, rot: -1.5, fill: C.red });
    s += tape(w * 0.16, h * 0.035, w * 0.22, h * 0.04, -24) + tape(w * 0.84, h * 0.035, w * 0.22, h * 0.04, 24);
    return s;
  }
  const founderCard = (id) => BP.asset(800, 1000, () => cardInner(id, 800, 1000), { seed: 6, amp: 5, grain: 0.8, bg: C.pCream });

  function castSheet() {
    const W = 2100, H = 1350, cw = 380, ch = 475, gap = 24, x0 = (W - (5 * cw + 4 * gap)) / 2;
    return BP.asset(W, H, () => {
      let s = BP.paper(C.ledger) + halftone(W * 0.5, H * 0.5, 900, "dC");
      s += text("Founder Files", 90, 118, { size: 84, font: F.serif, fill: C.cream, anchor: "start" });
      s += note("the cast · historical founders only", 640, 112, { size: 40, fill: C.hl, rot: -2, anchor: "start" });
      ORDER.forEach((id, i) => {
        const col = i % 5, row = Math.floor(i / 5);
        const x = x0 + col * (cw + gap), y = 170 + row * (ch + gap);
        const rot = [-1.5, 1, -0.6, 1.4, -1.1][col] * (row ? -1 : 1);
        s += g(`<rect x="8" y="10" width="${cw}" height="${ch}" fill="${C.ink}" opacity="0.3"/>` + g(cardInner(id, cw, ch), "", ""), `translate(${x} ${y}) rotate(${rot} ${cw / 2} ${ch / 2})`);
      });
      return s;
    }, { seed: 7, amp: 4, grain: 0.8, bg: C.ledger });
  }

  Object.assign(BP, { FOUNDERS, FOUNDER_ORDER: ORDER, founder, founderCard, castSheet });
})(typeof window !== "undefined" ? window : globalThis);
