/* BrandPros logo round 3: wordmark-led logos (the name IS the logo), one clever detail each.
 * Requires bp-engine.js. Exposes BP.L3 = { ORDER, SPECS, wordmark(id, variant, size), icon(id, variant), board(id), compare() }.
 * Every wordmark is built from real type (measured in the browser) plus custom glyphs drawn in SVG.
 */
(function (root) {
  "use strict";
  const BP = root.BP;
  const g = (inner, tf = "", extra = "") => `<g${tf ? ` transform="${tf}"` : ""}${extra ? " " + extra : ""}>${inner}</g>`;
  let ctx = null;
  function m(str, font) {
    if (!ctx) ctx = document.createElement("canvas").getContext("2d");
    ctx.font = font;
    const r = ctx.measureText(str);
    return { w: r.width, asc: r.actualBoundingBoxAscent, desc: r.actualBoundingBoxDescent };
  }
  const T = (str, x, y, font, size, fill, extra = "") =>
    `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" fill="${fill}"${extra}>${str}</text>`;
  let uid = 0; const nid = (p) => `${p}${++uid}`;

  // ---------------- palettes ----------------
  const SPECS = {
    risefall: {
      name: "Rise & Fall", font: "'Schibsted Grotesk', 'Arial Black', sans-serif", weight: 900,
      pal: { light: { bg: "#FFFFFF", ink: "#0E0E0E", up: "#12A36B", down: "#E0312B" }, dark: { bg: "#0E0E0E", ink: "#FFFFFF", up: "#2FD08C", down: "#FF4B42" } },
      brand: "#0E0E0E",
      idea: "The A is a rising green ▲ and the O holds a falling red ▼. Every story we tell is a rise, a fall, or both, written right into the name like a stock ticker.",
      works: ["Reads instantly as BRANDPROS; the detail rewards a second look", "Business and money without clichés like charts or dollar signs", "The ▲▼ pair becomes a signature you can use everywhere (series tags, transitions, merch)"],
      watch: ["Keep green and red exact; they carry the meaning", "In one-color use, the triangles still read by shape"],
    },
    slice: {
      name: "The Slice", font: "'Bricolage Grotesque', 'Arial Black', sans-serif", weight: 800,
      pal: { light: { bg: "#FFFFFF", ink: "#141414", accent: "#F26B1D" }, dark: { bg: "#141414", ink: "#FFFFFF", accent: "#FF8A3D" } },
      brand: "#F26B1D",
      idea: "The o is a pie chart with one slice pulled out: we take companies apart and show you how the money really works.",
      works: ["Friendly lowercase, modern and approachable", "The pie-o doubles as the icon, simple at 32 px", "Tangerine is rare among the brands we cover"],
      watch: ["Pie charts are common in finance, so the pulled slice and rounded letters keep it ours"],
    },
    label: {
      name: "The Label", font: "'Big Shoulders Display', 'Arial Narrow', sans-serif", weight: 900,
      pal: { light: { bg: "#FFFFFF", ink: "#0B0B0B", accent: "#E10600", paper: "#FFFFFF" }, dark: { bg: "#0B0B0B", ink: "#0B0B0B", accent: "#E10600", paper: "#FFFFFF" } },
      brand: "#0B0B0B",
      idea: "BRAND over PROS, stacked like a bold printed label with the tagline set in. Confident and newsy, like a magazine masthead.",
      works: ["The name is the whole logo; no symbol to explain", "Square format fits a profile picture perfectly", "Looks strongest on thumbnails and merch"],
      watch: ["Plain by design; its power comes from sticking to it everywhere"],
    },
    storyp: {
      name: "Story P", font: "'Instrument Sans', 'Helvetica Neue', Arial, sans-serif", weight: 700,
      pal: { light: { bg: "#FFFFFF", ink: "#1F2AD8", accent: "#1F2AD8", knock: "#FFFFFF" }, dark: { bg: "#1F2AD8", ink: "#FFFFFF", accent: "#FFFFFF", knock: "#1F2AD8" } },
      brand: "#1F2AD8",
      idea: "The P in Pros is a speech bubble: the stories people tell about brands, and the ones we tell back.",
      works: ["Storytelling built into the letterform", "The bubble-P works alone as the icon", "Clean, current, easy to animate (the bubble can pop in)"],
      watch: ["Speech bubbles appear in chat apps, so keep the full wordmark visible in most placements"],
    },
    crest: {
      name: "The Crest", font: "'Alfa Slab One', Georgia, serif", weight: 400,
      pal: { light: { bg: "#F3EBDD", ink: "#1F3D2B", accent: "#C9A24A", paper: "#F3EBDD" }, dark: { bg: "#1F3D2B", ink: "#F3EBDD", accent: "#D9B45A", paper: "#1F3D2B" } },
      brand: "#1F3D2B",
      idea: "A vintage badge with BRANDPROS arched across the top and 'Stories behind the brands' underneath, the look of an old company seal or a varsity patch.",
      works: ["Nostalgic, which suits the Dead Brands audience on Facebook", "Built for merch: hats, patches, stickers", "The name and the promise live together in one mark"],
      watch: ["Too detailed for tiny sizes, so it uses a simplified center 'B' as the profile picture"],
    },
  };
  const ORDER = ["risefall", "slice", "label", "storyp", "crest"];

  // ---------------- wordmarks ----------------
  // Each returns { svg, w, h } drawn with baseline at y=0 and left edge at x=0 (label/crest are centred boxes).
  function wmRiseFall(v, S) {
    const P = SPECS.risefall.pal[v], f = `900 ${S}px 'Schibsted Grotesk'`, F = SPECS.risefall.font;
    const cap = m("H", f).asc, tr = S * -0.01;
    let x = 0, s = "";
    const put = (str) => { s += T(str, x, 0, F, S, P.ink, ` font-weight="900"`); x += m(str, f).w + tr; };
    put("BR");
    const wA = m("A", f).w * 1.02;
    s += `<path d="M ${x + wA * 0.02} 0 L ${x + wA / 2} ${-cap} L ${x + wA * 0.98} 0 Z" fill="${P.up}"/>`;
    s += `<path d="M ${x + wA * 0.36} ${-cap * 0.18} L ${x + wA * 0.64} ${-cap * 0.18} L ${x + wA / 2} ${-cap * 0.46} Z" fill="${P.bg}"/>`;
    x += wA + tr;
    put("NDPR");
    const wO = m("O", f).w, cx = x + wO / 2, cy = -cap / 2, R = cap / 2, sw = wO * 0.22;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${wO / 2 - sw / 2}" ry="${R - sw / 2 + cap * 0.01}" fill="none" stroke="${P.ink}" stroke-width="${sw}"/>`;
    const tw = (wO / 2 - sw) * 1.05;
    s += `<path d="M ${cx - tw} ${cy - tw * 0.55} L ${cx + tw} ${cy - tw * 0.55} L ${cx} ${cy + tw * 0.75} Z" fill="${P.down}"/>`;
    x += wO + tr;
    put("S");
    return { svg: s, w: x, h: cap, cap };
  }
  function wmSlice(v, S) {
    const P = SPECS.slice.pal[v], f = `800 ${S}px 'Bricolage Grotesque'`, F = SPECS.slice.font;
    const xh = m("x", f).asc, tr = -S * 0.015;
    let x = 0, s = "";
    const put = (str) => { s += T(str, x, 0, F, S, P.ink, ` font-weight="800"`); x += m(str, f).w + tr; };
    put("brandpr");
    const wO = m("o", f).w, r = xh * 0.56, cx = x + wO / 2, cy = -xh / 2;
    s += g(pie(r, P.ink, P.accent), `translate(${cx} ${cy})`);
    x += wO + tr;
    put("s");
    return { svg: s, w: x, h: m("b", f).asc, cap: m("b", f).asc };
  }
  function pie(r, ink, acc) {
    const a0 = -58 * Math.PI / 180, a1 = 0;
    const p = (a, rr = r) => `${(Math.cos(a) * rr).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`;
    const body = `<path d="M 0 0 L ${p(a1)} A ${r} ${r} 0 1 1 ${p(a0)} Z" fill="${ink}"/>`;
    const mid = (a0 + a1) / 2, off = r * 0.2;
    const wedge = `<path d="M 0 0 L ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)} Z" fill="${acc}" transform="translate(${(Math.cos(mid) * off).toFixed(2)} ${(Math.sin(mid) * off).toFixed(2)})"/>`;
    return body + wedge;
  }
  function wmLabel(v, S) {
    const dark = v === "dark", F = SPECS.label.font;
    const top = dark ? "#FFFFFF" : "#0B0B0B", topText = dark ? "#0B0B0B" : "#FFFFFF", red = "#E10600";
    const W = S * 2.9, pad = S * 0.14;
    const fitSize = (str) => (100 * (W - pad * 2)) / m(str, `900 100px 'Big Shoulders Display'`).w;
    const s1 = fitSize("BRAND"), s2 = fitSize("PROS");
    const c1 = m("BRAND", `900 ${s1}px 'Big Shoulders Display'`).asc, c2 = m("PROS", `900 ${s2}px 'Big Shoulders Display'`).asc;
    const h1 = c1 + pad * 2, h2 = c2 + pad * 2;
    const tag = "THE STORIES BEHIND THE LOGOS", tagLS = 0.14;
    const tagSize = Math.min(S * 0.13, (W - pad * 2) / (m(tag, `800 100px Inter`).w / 100 + tag.length * tagLS));
    const tagH = tagSize * 2.2;
    let s = `<rect x="0" y="0" width="${W}" height="${h1}" fill="${top}"/>`;
    s += T("BRAND", pad, pad + c1, F, s1, topText, ` font-weight="900"`);
    s += `<rect x="0" y="${h1}" width="${W}" height="${h2 + tagH}" fill="${red}"/>`;
    s += T("PROS", pad, h1 + pad + c2, F, s2, "#FFFFFF", ` font-weight="900"`);
    s += `<rect x="${pad}" y="${h1 + h2 - pad * 0.35}" width="${W - pad * 2}" height="${Math.max(2, S * 0.012)}" fill="#FFFFFF" opacity="0.7"/>`;
    s += T(tag, W / 2, h1 + h2 + tagH * 0.52, "Inter, Arial", tagSize, "#FFFFFF", ` font-weight="800" text-anchor="middle" letter-spacing="${tagSize * tagLS}"`);
    return { svg: s, w: W, h: h1 + h2 + tagH, box: true };
  }
  function bubbleP(capH, stem, fill, knock) {
    // Speech-bubble P: rounded bowl, the stem is the bubble's tail.
    const bw = capH * 0.62, bh = capH * 0.64, r = bh / 2;
    let s = `<path d="M 0 ${-capH} L ${bw - r} ${-capH} A ${r} ${r} 0 0 1 ${bw - r} ${-capH + bh} L ${stem} ${-capH + bh} L ${stem} 0 L ${stem * 0.15} ${capH * 0.1} L 0 0 Z" fill="${fill}"/>`;
    s += `<rect x="${stem * 1.05}" y="${-capH + bh * 0.3}" width="${bw - r - stem * 1.05 + r * 0.35}" height="${bh * 0.4}" rx="${bh * 0.2}" fill="${knock}"/>`;
    return { svg: s, w: bw };
  }
  function wmStoryP(v, S) {
    const P = SPECS.storyp.pal[v], f = `700 ${S}px 'Instrument Sans'`, F = SPECS.storyp.font;
    const cap = m("H", f).asc, tr = -S * 0.01;
    let x = 0, s = "";
    const put = (str) => { s += T(str, x, 0, F, S, P.ink, ` font-weight="700"`); x += m(str, f).w + tr; };
    put("Brand");
    x += S * 0.03;
    const bp = bubbleP(cap, S * 0.14, P.accent, P.knock);
    s += g(bp.svg, `translate(${x} 0)`);
    x += bp.w + S * 0.05;
    put("ros");
    return { svg: s, w: x, h: cap, cap };
  }
  function crestSvg(v, R, simple) {
    const P = SPECS.crest.pal[v], F = SPECS.crest.font;
    let s = `<circle r="${R}" fill="${P.ink}"/>`;
    s += `<circle r="${R * 0.94}" fill="none" stroke="${P.accent}" stroke-width="${R * 0.018}"/>`;
    const inner = R * 0.62;
    if (!simple) {
      const top = nid("ct"), bot = nid("cb"), rt = R * 0.77, rb = R * 0.84;
      s += `<path id="${top}" d="M ${-rt} 0 A ${rt} ${rt} 0 0 1 ${rt} 0" fill="none"/>`;
      s += `<path id="${bot}" d="M ${-rb} 0 A ${rb} ${rb} 0 0 0 ${rb} 0" fill="none"/>`;
      s += `<text font-family="${F}" font-size="${R * 0.2}" fill="${P.paper}" letter-spacing="${R * 0.03}" text-anchor="middle"><textPath href="#${top}" startOffset="50%">BRANDPROS</textPath></text>`;
      s += `<text font-family="Inter, Arial" font-weight="800" font-size="${R * 0.085}" fill="${P.accent}" letter-spacing="${R * 0.022}" text-anchor="middle"><textPath href="#${bot}" startOffset="50%">STORIES BEHIND THE BRANDS</textPath></text>`;
      [-1, 1].forEach((k) => { s += star(k * R * 0.8, R * 0.03, R * 0.055, P.accent); });
    }
    s += `<circle r="${inner}" fill="${P.paper}"/>`;
    s += `<circle r="${inner * 0.9}" fill="none" stroke="${P.ink}" stroke-width="${R * 0.012}"/>`;
    s += T("B", 0, inner * 0.36, F, inner * 1.05, P.ink, ` text-anchor="middle"`);
    if (!simple) s += T("EST. 2026", 0, inner * 0.72, "Inter, Arial", inner * 0.12, P.ink, ` font-weight="800" text-anchor="middle" letter-spacing="${inner * 0.03}"`);
    return s;
  }
  function star(x, y, r, fill) {
    let d = "";
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? "L" : "M"} ${x + Math.cos(a) * rr} ${y + Math.sin(a) * rr} `; }
    return `<path d="${d}Z" fill="${fill}"/>`;
  }

  // Normalised wordmark: returns svg centred in a w x h box
  function wordmark(id, v = "light", S = 140) {
    if (id === "risefall") return wmRiseFall(v, S);
    if (id === "slice") return wmSlice(v, S);
    if (id === "label") return wmLabel(v, S);
    if (id === "storyp") return wmStoryP(v, S);
    if (id === "crest") { const R = S * 1.3; return { svg: crestSvg(v, R, false), w: R * 2, h: R * 2, centered: true }; }
  }
  function placeWordmark(id, v, S, cx, cy, maxW) {
    const wm = wordmark(id, v, S);
    const k = maxW ? Math.min(1, maxW / wm.w) : 1;
    if (wm.centered) return g(wm.svg, `translate(${cx} ${cy}) scale(${k})`);
    if (wm.box) return g(wm.svg, `translate(${cx - (wm.w * k) / 2} ${cy - (wm.h * k) / 2}) scale(${k})`);
    return g(wm.svg, `translate(${cx - (wm.w * k) / 2} ${cy + (wm.cap * k) / 2}) scale(${k})`);
  }

  // Icons (profile pictures), drawn in a 400x400 box
  function icon(id, v = "light") {
    const clip = nid("ic");
    let bg, inner;
    if (id === "risefall") {
      const P = SPECS.risefall.pal.dark; bg = P.bg;
      inner = `<path d="M 88 250 L 170 108 L 252 250 Z" fill="${P.up}"/><path d="M 148 152 L 312 152 L 230 294 Z" fill="${P.down}"/>`;
      inner = `<path d="M 70 262 L 158 110 L 246 262 Z" fill="${P.up}"/><path d="M 156 138 L 330 138 L 243 290 Z" fill="${P.down}" style="mix-blend-mode:normal"/>`;
    } else if (id === "slice") {
      const P = SPECS.slice.pal.light; bg = P.accent;
      inner = g(pie(120, "#141414", "#FFFFFF"), "translate(195 208)");
    } else if (id === "label") {
      bg = "#0B0B0B"; const wm = wmLabel("light", 110);
      const k = 300 / wm.w; inner = g(wm.svg, `translate(${200 - (wm.w * k) / 2} ${200 - (wm.h * k) / 2}) scale(${k})`);
    } else if (id === "storyp") {
      bg = SPECS.storyp.pal.dark.bg; const bp = bubbleP(230, 60, "#FFFFFF", bg);
      inner = g(bp.svg, `translate(${200 - bp.w / 2} ${315})`);
    } else if (id === "crest") {
      bg = SPECS.crest.pal.light.bg; inner = g(crestSvg("light", 190, true), "translate(200 200)");
    }
    return `<clipPath id="${clip}"><circle cx="200" cy="200" r="200"/></clipPath>` + g(`<rect width="400" height="400" fill="${bg}"/>` + inner, "", `clip-path="url(#${clip})"`);
  }
  const iconAt = (id, x, y, d) => g(icon(id) + `<circle cx="200" cy="200" r="199" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="3"/>`, `translate(${x - d / 2} ${y - d / 2}) scale(${d / 400})`);

  // ---------------- mockups ----------------
  function tshirt(x, y, w, shirt, content) {
    const k = w / 400;
    const path = "M 120 20 Q 200 60 280 20 L 370 60 L 400 150 L 330 175 L 330 400 L 70 400 L 70 175 L 0 150 L 30 60 Z";
    return g(`<path d="${path}" fill="${shirt}" stroke="#000" stroke-opacity="0.15" stroke-width="3"/><path d="M 150 28 Q 200 62 250 28" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="5"/>` + content, `translate(${x} ${y}) scale(${k})`);
  }

  function board(id) {
    const sp = SPECS[id], W = 1600, H = 1060;
    let s = `<rect width="${W}" height="${H}" fill="#EFEDE8"/>`;
    // hero: primary logo on light, and on dark
    s += `<rect x="40" y="40" width="1000" height="440" fill="${sp.pal.light.bg}"/>`;
    s += placeWordmark(id, "light", id === "label" ? 120 : id === "crest" ? 150 : 150, 540, 260, 860);
    s += `<rect x="1060" y="40" width="500" height="440" fill="${sp.pal.dark.bg}"/>`;
    s += placeWordmark(id, "dark", id === "label" ? 60 : id === "crest" ? 72 : 70, 1310, 260, 420);
    // icons
    s += `<rect x="40" y="500" width="500" height="250" fill="#FFFFFF"/>`;
    s += iconAt(id, 150, 625, 170) + iconAt(id, 300, 625, 80) + iconAt(id, 380, 625, 48) + iconAt(id, 435, 625, 32);
    s += `<text x="60" y="735" font-family="Inter, Arial" font-weight="800" font-size="14" letter-spacing="2" fill="#8A8A8A">PROFILE PICTURE · 170 · 80 · 48 · 32 PX</text>`;
    // channel header mock
    s += `<rect x="560" y="500" width="1000" height="250" fill="#FFFFFF"/>`;
    s += `<rect x="560" y="500" width="1000" height="120" fill="${sp.brand}"/>`;
    s += placeWordmark(id, id === "crest" ? "dark" : sp.brand === "#FFFFFF" ? "light" : "dark", id === "label" ? 30 : id === "crest" ? 36 : 44, 1060, 560, 420);
    s += iconAt(id, 650, 650, 110);
    s += `<text x="720" y="660" font-family="Inter, Arial" font-weight="800" font-size="30" fill="#0F0F0F">BrandPros</text>`;
    s += `<text x="720" y="692" font-family="Inter, Arial" font-size="17" fill="#606060">@brandpros · 12.4K subscribers · 86 videos</text>`;
    s += `<rect x="1400" y="640" width="130" height="42" rx="21" fill="#0F0F0F"/><text x="1465" y="667" font-family="Inter, Arial" font-weight="800" font-size="16" fill="#FFFFFF" text-anchor="middle">Subscribe</text>`;
    // thumbnail with logo bug
    s += `<rect x="40" y="770" width="480" height="270" fill="#2B2F36"/>`;
    s += `<rect x="40" y="770" width="480" height="270" fill="url(#${BP.ID.dI})" opacity="0.6"/>`;
    s += `<text x="60" y="880" font-family="Anton, Impact" font-size="64" fill="#FFFFFF">IT WASN'T</text><text x="60" y="950" font-family="Anton, Impact" font-size="64" fill="#FFD84A">NETFLIX</text>`;
    s += iconAt(id, 478, 998, 60);
    s += `<text x="60" y="1030" font-family="Inter, Arial" font-weight="800" font-size="13" letter-spacing="2" fill="#B8BCC4">THUMBNAIL CORNER</text>`;
    // merch
    s += `<rect x="540" y="770" width="1020" height="270" fill="#FFFFFF"/>`;
    s += tshirt(600, 790, 240, "#1A1A1A", placeWordmark(id, "dark", id === "label" ? 26 : id === "crest" ? 30 : 34, 200, 170, 150));
    s += tshirt(880, 790, 240, "#F4F2EE", placeWordmark(id, "light", id === "label" ? 26 : id === "crest" ? 30 : 34, 200, 170, 150));
    s += g(`<rect x="0" y="0" width="130" height="130" rx="65" fill="#FFFFFF" stroke="#DDD" stroke-width="2"/>` + iconAt(id, 65, 65, 118), "translate(1220 840)");
    s += `<text x="1380" y="900" font-family="Inter, Arial" font-weight="800" font-size="14" letter-spacing="2" fill="#8A8A8A">STICKER</text>`;
    return s;
  }

  function wrap(w, h, draw) {
    const defs = BP.makeDefs(2, { amp: 0 });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${defs}${draw()}</svg>`;
  }
  const boardSvg = (id) => wrap(1600, 1060, () => board(id));
  function compareSvg() {
    return wrap(2000, 1220, () => {
      let s = `<rect width="2000" height="1220" fill="#EFEDE8"/>`;
      ORDER.forEach((id, i) => {
        const y = 30 + i * 238, sp = SPECS[id];
        s += `<rect x="30" y="${y}" width="1280" height="218" fill="${sp.pal.light.bg}"/>`;
        s += `<text x="60" y="${y + 50}" font-family="Inter, Arial" font-weight="800" font-size="22" fill="#9A9A9A">${String.fromCharCode(65 + i)} · ${sp.name.toUpperCase()}</text>`;
        s += placeWordmark(id, "light", id === "label" ? 62 : id === "crest" ? 72 : 96, 700, y + 118, 900);
        s += `<rect x="1330" y="${y}" width="420" height="218" fill="${sp.pal.dark.bg}"/>`;
        s += placeWordmark(id, "dark", id === "label" ? 34 : id === "crest" ? 60 : 44, 1540, y + 109, 360);
        s += iconAt(id, 1840, y + 80, 110) + iconAt(id, 1810, y + 175, 40) + iconAt(id, 1870, y + 175, 28);
      });
      return s;
    });
  }

  BP.L3 = { ORDER, SPECS, wordmark, icon, boardSvg, compareSvg, iconSvg: (id) => wrap(400, 400, () => icon(id)), wordmarkSvg: (id, v) => wrap(1400, 520, () => `<rect width="1400" height="520" fill="${SPECS[id].pal[v].bg}"/>` + placeWordmark(id, v, id === "label" ? 130 : id === "crest" ? 150 : 150, 700, 260, 1200)) };
})(typeof window !== "undefined" ? window : globalThis);
