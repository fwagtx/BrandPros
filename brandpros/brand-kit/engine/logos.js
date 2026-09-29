/* BrandPros logo concepts (v3 exploration).
 * Each concept: a mark drawn on a 400x400 grid centred at 0,0 (fits within radius ~200),
 * a wordmark lockup, and light/dark palettes. Requires bp-engine.js (window.BP).
 *   BP.LOGOS[id].mark(pal)   BP.logoLockup(id, dark, size)   BP.logoAvatar(id)   BP.logoBoard(id)   BP.logoCompare()
 */
(function (root) {
  "use strict";
  const BP = root.BP;
  const { g, text, measure } = BP;

  const LIGHT = { fg: "#17150F", bg: "#F2EAD7", accent: "#C8372D", alt: "#133A2C", brass: "#C49A3A", soft: "#E4D8BE" };
  const DARK = { fg: "#F2EAD7", bg: "#133A2C", accent: "#E8735F", alt: "#8FD1AE", brass: "#D9B25A", soft: "#1D4A3A" };

  // ---------- A. Case File: the ® becomes a magnifying glass ----------
  function markCaseFile(c) {
    const cx = -22, cy = -22, r = 124;
    let s = "";
    s += g(`<rect x="${r + 4}" y="-27" width="128" height="54" rx="27" fill="${c.fg}"/>` +
      `<rect x="${r - 6}" y="-35" width="30" height="70" rx="7" fill="${c.brass}"/>`, `translate(${cx} ${cy}) rotate(45)`);
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c.bg}" stroke="${c.fg}" stroke-width="36"/>`;
    s += `<text x="${cx + 3}" y="${cy + 54}" font-family="'Archivo Black', 'Arial Black', sans-serif" font-size="158" fill="${c.accent}" text-anchor="middle">R</text>`;
    s += `<path d="M ${cx - 96} ${cy - 46} A ${r - 18} ${r - 18} 0 0 1 ${cx - 46} ${cy - 96}" fill="none" stroke="${c.bg}" stroke-width="10" stroke-linecap="round" opacity="0.9"/>`;
    return s;
  }

  // ---------- B. Shelf Chart: book spines rise, peak, and one falls ----------
  function markShelf(c) {
    const books = [
      { x: -150, w: 60, h: 150, col: c.alt },
      { x: -84, w: 62, h: 232, col: c.alt },
      { x: -16, w: 66, h: 300, col: c.accent },
      { x: 56, w: 60, h: 200, col: c.fg, lean: 22 },
    ];
    const base = 150;
    let s = "";
    books.forEach((b) => {
      let book = `<rect x="${b.x}" y="${base - b.h}" width="${b.w}" height="${b.h}" rx="6" fill="${b.col}"/>`;
      book += `<rect x="${b.x}" y="${base - b.h + 22}" width="${b.w}" height="9" fill="${c.bg}" opacity="0.85"/>`;
      book += `<rect x="${b.x}" y="${base - 34}" width="${b.w}" height="9" fill="${c.bg}" opacity="0.85"/>`;
      book += `<rect x="${b.x + b.w * 0.22}" y="${base - b.h * 0.62}" width="${b.w * 0.56}" height="${Math.min(60, b.h * 0.22)}" rx="3" fill="${c.bg}" opacity="0.85"/>`;
      s += b.lean ? g(book, `rotate(${b.lean} ${b.x + b.w} ${base})`) : book;
    });
    s += `<rect x="-172" y="${base}" width="344" height="18" rx="4" fill="${c.fg}"/>`;
    return g(s, "translate(0 18)");
  }

  // ---------- C. Curtain Call: a proscenium arch, drapes pulled back, a spotlight ----------
  function markCurtain(c) {
    const arch = "M -150 168 L -150 -40 A 150 150 0 0 1 150 -40 L 150 168 Z";
    const id = BP.ID.key("arch" + (c === DARK ? "d" : "l"));
    let s = `<clipPath id="${id}"><path d="${arch}"/></clipPath>`;
    let inside = `<rect x="-160" y="-200" width="320" height="380" fill="${c === DARK ? "#0A241A" : "#17150F"}"/>`;
    inside += `<path d="M -16 -150 L 16 -150 L 78 158 L -78 158 Z" fill="${c === DARK ? "#F2EAD7" : "#F2EAD7"}" opacity="0.92"/>`;
    inside += `<ellipse cx="0" cy="158" rx="86" ry="15" fill="#FFFDF6"/>`;
    const drape = (k) => {
      const p = `M ${-152 * k} -40 Q ${-148 * k} -170 ${-44 * k} -186 Q ${-66 * k} -60 ${-116 * k} 34 Q ${-96 * k} 104 ${-84 * k} 170 L ${-160 * k} 170 Z`;
      const folds = [0.3, 0.6].map((f) => `<path d="M ${lerp(-140, -60, f) * k} ${-170 + f * 8} Q ${lerp(-140, -104, f) * k} -30 ${lerp(-150, -122, f) * k} 30" fill="none" stroke="#8E231C" stroke-width="6" opacity="0.75"/>`).join("") +
        `<path d="M ${-122 * k} 44 Q ${-112 * k} 110 ${-106 * k} 168" fill="none" stroke="#8E231C" stroke-width="6" opacity="0.75"/>`;
      return `<path d="${p}" fill="${c.accent}"/>` + folds + `<ellipse cx="${-116 * k}" cy="36" rx="17" ry="11" fill="${c.brass}"/>`;
    };
    inside += drape(1) + drape(-1);
    inside += `<path d="M -160 -205 L 160 -205 L 150 -120 Q 112 -100 75 -120 Q 37 -100 0 -120 Q -37 -100 -75 -120 Q -112 -100 -150 -120 Z" fill="${c.accent}"/>`;
    inside += `<path d="M -150 -120 Q -112 -100 -75 -120 Q -37 -100 0 -120 Q 37 -100 75 -120 Q 112 -100 150 -120" fill="none" stroke="${c.brass}" stroke-width="6"/>`;
    s += g(inside, "", `clip-path="url(#${id})"`);
    s += `<path d="${arch}" fill="none" stroke="${c.fg}" stroke-width="16" stroke-linejoin="round"/>`;
    s += `<rect x="-176" y="164" width="352" height="22" rx="4" fill="${c.fg}"/>`;
    return s;
  }
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------- D. Story B: the letter B built from an open book ----------
  function markStoryB(c) {
    let s = "";
    const sheet = (dx, dy, fill, sw) =>
      `<path d="M -74 -170 L 34 -170 C 128 -170 128 -12 34 -12 L -74 -12 Z" transform="translate(${dx} ${dy})" fill="${fill}" stroke="${c.fg}" stroke-width="${sw}" stroke-linejoin="round"/>` +
      `<path d="M -74 -12 L 52 -12 C 158 -12 158 170 52 170 L -74 170 Z" transform="translate(${dx} ${dy})" fill="${fill}" stroke="${c.fg}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    s += sheet(16, 10, c.soft, 12) + sheet(8, 5, c.soft, 12) + sheet(0, 0, c.bg, 14);
    const lines = [[-128, 58], [-96, 80], [-64, 62], [30, 96], [64, 110], [98, 104], [132, 70]];
    lines.forEach(([y, w]) => { s += `<path d="M -46 ${y} L ${-46 + w} ${y}" stroke="${c.fg}" stroke-width="10" stroke-linecap="round" opacity="0.55"/>`; });
    s += `<rect x="-136" y="-178" width="66" height="356" rx="10" fill="${c.fg}"/>`;
    s += `<path d="M -120 150 L -120 222 L -104 206 L -88 222 L -88 150 Z" fill="${c.accent}"/>`;
    s += `<rect x="-136" y="-150" width="66" height="10" fill="${c.brass}"/><rect x="-136" y="140" width="66" height="10" fill="${c.brass}"/>`;
    return g(s, "translate(8 -18)");
  }

  // ---------- E. Keyhole Seal (current), for comparison ----------
  function markSeal(c) {
    return BP.seal({ ring: c === DARK ? c.fg : "#133A2C", face: c === DARK ? "#133A2C" : c.bg, hole: c === DARK ? c.fg : "#133A2C" });
  }

  const LOGOS = {
    casefile: {
      name: "Case File", mark: markCaseFile,
      font: "'Archivo Black', 'Arial Black', sans-serif", caps: true, word: ["BRAND", "PROS"], italicPros: false,
      idea: "The ® is the universal symbol for a brand. Here it becomes a magnifying glass: we investigate brands.",
      strengths: ["Instantly says 'brands' plus 'investigation'", "Bold and simple; the strongest at 28 px", "Works in one color (stamps, merch, watermark)"],
      watch: ["Magnifying glasses are common in search and legal logos, so the R and colors must stay distinctive", "Run a trademark search before committing"],
      avatarBg: LIGHT.bg,
    },
    shelf: {
      name: "Shelf Chart", mark: markShelf,
      font: "'Instrument Serif', Georgia, serif", caps: false, word: ["Brand", "Pros"], italicPros: true,
      idea: "Four book spines rise, peak and topple: a stock chart made of stories. Rise, fall and the lesson in between.",
      strengths: ["Business and storytelling in one shape", "The leaning book is a built-in 'fall' story", "Very ownable; nothing like the brands we cover"],
      watch: ["Needs color to read best (in one color it's still clearly books)", "Slightly more detailed; keep the avatar crop tight"],
      avatarBg: LIGHT.bg,
    },
    curtain: {
      name: "Curtain Call", mark: markCurtain,
      font: "'Abril Fatface', Georgia, serif", caps: false, word: ["Brand", "Pros"], italicPros: false,
      idea: "The curtain is pulled back and the spotlight is on: the story behind the brand, told like a show.",
      strengths: ["Most dramatic and entertaining", "Great as an intro sting: the curtains open on every video", "Nostalgic, theatrical feel for the Facebook audience"],
      watch: ["Theatre imagery also suggests movies and entertainment news", "Most detailed mark; simplify further for favicons"],
      avatarBg: LIGHT.bg,
    },
    storyb: {
      name: "Story B", mark: markStoryB,
      font: "'Libre Baskerville', Georgia, serif", caps: false, word: ["Brand", "Pros"], italicPros: false,
      idea: "A capital B built from an open book, with a red bookmark: every brand has a backstory.",
      strengths: ["Letter mark: B for Brand, and a book for the story", "Classic, trustworthy, bookish", "The bookmark ribbon is a small, ownable detail"],
      watch: ["Book-and-letter marks are common in education and publishing", "Less energetic than the others"],
      avatarBg: LIGHT.bg,
    },
    seal: {
      name: "Keyhole Seal (current)", mark: markSeal,
      font: "'DM Serif Display', Georgia, serif", caps: false, word: ["Brand", "Pros"], italicPros: true,
      idea: "An engraved stock-certificate seal with a keyhole: we unlock the story behind the brand.",
      strengths: ["Elegant, premium", "Keyhole reads clearly at small sizes"],
      watch: ["Seals and keyholes are common in security and locksmith branding", "The quietest of the five on a busy feed"],
      avatarBg: LIGHT.bg,
    },
  };
  const LOGO_ORDER = ["casefile", "shelf", "curtain", "storyb", "seal"];

  function lockup(id, dark = false, size = 150) {
    const L = LOGOS[id], c = dark ? DARK : LIGHT;
    const [w1, w2] = L.word;
    const f1 = `${size}px ${L.font}`, f2 = `${L.italicPros ? "italic " : ""}${size}px ${L.font}`;
    const a = measure(w1, f1, size * 0.6), b = measure(w2, f2, size * 0.6);
    const markS = (size * 1.45) / 400, gap = size * 0.3;
    let s = g(L.mark(c), `translate(${size * 0.72} 0) scale(${markS})`);
    const x0 = size * 1.45 + gap, base = size * 0.35;
    s += `<text x="${x0}" y="${base}" font-family="${L.font}" font-size="${size}" fill="${c.fg}"${L.caps ? ' letter-spacing="1"' : ""}>${w1}</text>`;
    s += `<text x="${x0 + a + (L.caps ? size * 0.02 : 0)}" y="${base}" font-family="${L.font}" font-size="${size}" fill="${c.accent}"${L.italicPros ? ' font-style="italic"' : ""}>${w2}</text>`;
    return { svg: s, width: x0 + a + b + size * 0.1, height: size * 1.5 };
  }

  function wrap(w, h, inner, bg) {
    const defs = BP.makeDefs(2, { amp: 0 });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${defs}${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}${inner}</svg>`;
  }
  const logoMarkSvg = (id, dark) => wrap(440, 440, g(LOGOS[id].mark(dark ? DARK : LIGHT), "translate(220 220)"), (dark ? DARK : LIGHT).bg);
  function logoAvatar(id, dark = false) {
    const c = dark ? DARK : LIGHT;
    const clip = BP.ID.key("av" + id + (dark ? "d" : "l"));
    const inner = `<clipPath id="${clip}"><circle cx="200" cy="200" r="200"/></clipPath>` + g(`<rect width="400" height="400" fill="${c.bg}"/>` + g(LOGOS[id].mark(c), "translate(200 200) scale(0.74)"), "", `clip-path="url(#${clip})"`);
    return wrap(400, 400, inner, null);
  }
  function logoLockupSvg(id, dark) {
    const lk = lockup(id, dark, 150), pad = 60;
    const w = Math.ceil(lk.width + pad * 2), h = 300;
    return wrap(w, h, g(lk.svg, `translate(${pad} ${h / 2})`), (dark ? DARK : LIGHT).bg);
  }

  // Board: one concept at every size that matters (1600x900)
  function logoBoard(id) {
    const L = LOGOS[id];
    BP.makeDefs(2, { amp: 0 });
    let s = `<rect width="1600" height="900" fill="#EDE3CC"/>`;
    s += `<rect x="40" y="40" width="560" height="560" fill="${LIGHT.bg}" stroke="#17150F" stroke-width="3"/>` + g(L.mark(LIGHT), "translate(320 320) scale(1.12)");
    s += `<rect x="640" y="40" width="920" height="270" fill="${LIGHT.bg}" stroke="#17150F" stroke-width="3"/>`;
    const lkL = lockup(id, false, 110), kL = Math.min(1, 820 / lkL.width);
    s += g(lkL.svg, `translate(${640 + (920 - lkL.width * kL) / 2} 175) scale(${kL})`);
    s += `<rect x="640" y="330" width="920" height="270" fill="${DARK.bg}"/>`;
    const lkD = lockup(id, true, 110), kD = Math.min(1, 820 / lkD.width);
    s += g(lkD.svg, `translate(${640 + (920 - lkD.width * kD) / 2} 465) scale(${kD})`);
    // avatars at 160 / 64 / 32 on light and dark
    const av = (x, y, d, dark) => {
      const c = dark ? DARK : LIGHT, clip = BP.ID.key(`b${id}${x}${y}`);
      return `<clipPath id="${clip}"><circle cx="${x}" cy="${y}" r="${d / 2}"/></clipPath>` +
        g(`<rect x="${x - d / 2}" y="${y - d / 2}" width="${d}" height="${d}" fill="${c.bg}"/>` + g(L.mark(c), `translate(${x} ${y}) scale(${(d / 400) * 0.74})`), "", `clip-path="url(#${clip})"`) +
        `<circle cx="${x}" cy="${y}" r="${d / 2}" fill="none" stroke="#17150F" stroke-opacity="0.25" stroke-width="1.5"/>`;
    };
    s += av(130, 740, 160, false) + av(260, 772, 64, false) + av(320, 788, 32, false);
    s += av(450, 740, 160, true) + av(580, 772, 64, true) + av(640, 788, 32, true);
    s += `<text x="40" y="880" font-family="Inter, Arial" font-weight="800" font-size="16" letter-spacing="2" fill="#5E6B73">PROFILE PICTURE · 160 · 64 · 32 PX · LIGHT AND DARK</text>`;
    // channel header mock
    s += `<rect x="720" y="640" width="840" height="200" fill="#FFFFFF" stroke="#17150F" stroke-width="3"/>`;
    s += av(810, 740, 120, false);
    s += text("BrandPros", 900, 725, { size: 44, font: "Inter, Arial", weight: 800, fill: "#17150F", anchor: "start" });
    s += text("@brandpros · 12.4K subscribers · 86 videos", 900, 765, { size: 22, font: "Inter, Arial", weight: 400, fill: "#5E6B73", anchor: "start" });
    s += `<rect x="1380" y="702" width="150" height="48" rx="24" fill="#17150F"/>` + text("Subscribe", 1455, 734, { size: 20, font: "Inter, Arial", weight: 800, fill: "#FFFFFF" });
    s += text(L.name.toUpperCase(), 40, 30, { size: 0.1, fill: "#EDE3CC" });
    return wrap(1600, 900, s, null);
  }

  // Side-by-side comparison: mark + lockup + small avatars for all five
  function logoCompare() {
    BP.makeDefs(2, { amp: 0 });
    const W = 2000, rowH = 250, H = 120 + rowH * LOGO_ORDER.length;
    let s = `<rect width="${W}" height="${H}" fill="#EDE3CC"/>`;
    s += text("BrandPros logo options", 60, 80, { size: 56, font: "'DM Serif Display', Georgia", fill: "#133A2C", anchor: "start" });
    LOGO_ORDER.forEach((id, i) => {
      const y = 120 + i * rowH, L = LOGOS[id];
      s += `<rect x="40" y="${y}" width="${W - 80}" height="${rowH - 20}" fill="${LIGHT.bg}" stroke="#17150F" stroke-width="2"/>`;
      s += text(String.fromCharCode(65 + i), 80, y + 60, { size: 40, font: "'Permanent Marker', cursive", fill: "#C8372D" });
      s += text(L.name.replace(" (current)", ""), 80, y + 104, { size: 22, font: "Inter, Arial", weight: 800, fill: "#17150F", anchor: "start" });
      if (id === "seal") s += text("(current)", 80, y + 132, { size: 18, font: "Inter, Arial", weight: 600, fill: "#5E6B73", anchor: "start" });
      s += g(L.mark(LIGHT), `translate(${390} ${y + (rowH - 20) / 2}) scale(0.48)`);
      const lk = lockup(id, false, 84);
      s += g(lk.svg, `translate(560 ${y + (rowH - 20) / 2})`);
      const dx = 1380;
      s += `<rect x="${dx}" y="${y + 20}" width="${W - 40 - dx - 20}" height="${rowH - 60}" fill="${DARK.bg}"/>`;
      [[120, 1460], [48, 1580], [28, 1650]].forEach(([d, x]) => {
        const clip = BP.ID.key(`c${id}${d}`);
        s += `<clipPath id="${clip}"><circle cx="${x}" cy="${y + (rowH - 20) / 2}" r="${d / 2}"/></clipPath>` +
          g(`<rect x="${x - d / 2}" y="${y}" width="${d}" height="${rowH}" fill="${LIGHT.bg}"/>` + g(L.mark(LIGHT), `translate(${x} ${y + (rowH - 20) / 2}) scale(${(d / 400) * 0.74})`), "", `clip-path="url(#${clip})"`);
      });
      const lk2 = lockup(id, true, 40);
      s += g(lk2.svg, `translate(1700 ${y + (rowH - 20) / 2}) scale(${Math.min(1, 230 / lk2.width)})`);
    });
    return wrap(W, H, s, null);
  }

  Object.assign(BP, { LOGOS, LOGO_ORDER, LOGO_LIGHT: LIGHT, LOGO_DARK: DARK, logoLockup: lockup, logoMarkSvg, logoAvatar, logoLockupSvg, logoBoard, logoCompare });
})(typeof window !== "undefined" ? window : globalThis);
