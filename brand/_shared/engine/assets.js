/* Brand assets for the new code-BAD channel concepts.
 * Step 1 (direction check): three profile pictures, a circle/size comparison, and the headline font comparison.
 * Every mark is original: no Epic or Fortnite logos, no skin art in logos or profile pictures.
 */
(function (root) {
  "use strict";
  const box = (css, inner = "") => `<div style="position:absolute;${css}">${inner}</div>`;
  const svg = (w, h, inner, css = "") => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible;${css}">${inner}</svg>`;

  // ---------- headline font candidates (Burbank Big Condensed is commercial and not installed) ----------
  const FONTS = {
    barlow: { family: "'Barlow Condensed'", weight: 900, name: "Barlow Condensed Black", lh: 0.9, track: 0 },
    anton: { family: "Anton", weight: 400, name: "Anton", lh: 1.0, track: 0 },
    lucky: { family: "'Luckiest Guy'", weight: 400, name: "Luckiest Guy", lh: 1.0, track: 1 },
    league: { family: "'League Gothic'", weight: 400, name: "League Gothic", lh: 0.95, track: 1 },
    bebas: { family: "'Bebas Neue'", weight: 400, name: "Bebas Neue", lh: 0.95, track: 1 },
  };
  let HEAD = FONTS.barlow; // the face the profile pictures use until the font is approved

  // Fortnite-UI treatment: caps, heavy outline drawn behind the fill, short hard drop shadow, slight forward lean
  function fn(text, size, o = {}) {
    const f = o.font || HEAD;
    const { fill = "#fff", stroke = "#0A0A14", sw = size * 0.07, shadow = true, skew = -6, track = f.track, lh = f.lh } = o;
    return `<span style="display:inline-block;font-family:${f.family};font-weight:${f.weight};font-size:${size}px;line-height:${lh};letter-spacing:${track}px;text-transform:uppercase;color:${fill};-webkit-text-stroke:${sw}px ${stroke};paint-order:stroke fill;${shadow ? `text-shadow:0 ${Math.round(size * 0.07)}px 0 rgba(0,0,0,.38);` : ""}transform:skewX(${skew}deg);white-space:nowrap">${text}</span>`;
  }

  // in-game rarity colors (approximations of the item-card gradients)
  const RARITY = {
    common: ["#BEBEBE", "#5E5E5E"], uncommon: ["#87E339", "#1F6E0E"], rare: ["#5BD0FF", "#1A5BB5"],
    epic: ["#D27BFF", "#5B1F9C"], legendary: ["#F3A64A", "#8A3B12"],
  };

  // ======================= profile pictures (1080 × 1080, read inside a circle) =======================
  const NEWS = { red: "#D7261E", navy: "#0B1530", navy2: "#18295C", white: "#F4F6FA", yellow: "#FFC400" };
  const IDEAS = { yellow: "#FFD60A", black: "#111111", white: "#F2F2EE" };
  const UNREAL = { ink: "#14112B", ink2: "#2A2257", bronze: "#C7783E", silver: "#C3CCDA", gold: "#F2B630", unrealA: "#8E5BFF", unrealB: "#FF4FD8", white: "#F5F3FF" };

  function pfpNews() {
    let s = box(`inset:0;background:radial-gradient(circle at 50% 42%,${NEWS.navy2},${NEWS.navy} 70%)`);
    s += box(`inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.045) 0 3px,transparent 3px 9px)`);
    s += box(`left:0;right:0;top:190px;text-align:center`, fn("BAD", 480, { fill: NEWS.white, stroke: "#050A1A", sw: 26 }));
    s += box(`left:160px;right:160px;top:668px;height:196px;background:${NEWS.red};transform:skewX(-8deg);box-shadow:0 14px 0 rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center`,
      fn("NEWS", 190, { fill: NEWS.white, stroke: "#5A0B07", sw: 12, skew: 0, track: 14, shadow: false }));
    s += box(`left:200px;right:200px;top:880px;height:26px;background:${NEWS.yellow};transform:skewX(-8deg)`);
    s += box(`left:868px;top:236px;width:64px;height:64px;border-radius:50%;background:${NEWS.yellow};box-shadow:0 0 0 12px rgba(255,196,0,.28)`);
    return s;
  }

  function pfpIdeas() {
    let s = box(`inset:0;background:${IDEAS.yellow}`);
    s += box(`left:0;top:0`, svg(1080, 1080,
      `<defs><pattern id="hz" width="112" height="112" patternUnits="userSpaceOnUse" patternTransform="rotate(45 540 540)"><rect width="56" height="112" fill="${IDEAS.black}"/></pattern></defs>
       <circle cx="540" cy="540" r="540" fill="url(#hz)"/>
       <circle cx="540" cy="540" r="448" fill="${IDEAS.yellow}" stroke="${IDEAS.black}" stroke-width="28"/>`));
    // bulb: glass, neck, screw base, sparks
    const cx = 540, cy = 470;
    let sparks = "";
    [-150, -115, -65, -30].forEach((a) => {
      const r = (a * Math.PI) / 180, x1 = cx + Math.cos(r) * 262, y1 = cy + Math.sin(r) * 262, x2 = cx + Math.cos(r) * 330, y2 = cy + Math.sin(r) * 330;
      sparks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${IDEAS.black}" stroke-width="30" stroke-linecap="round"/>`;
    });
    // one broken spark: a small bolt
    sparks += `<path d="M ${cx - 12} ${cy - 268} L ${cx + 18} ${cy - 312} L ${cx - 8} ${cy - 312} L ${cx + 20} ${cy - 360}" fill="none" stroke="${IDEAS.black}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += box(`left:0;top:0`, svg(1080, 1080,
      `${sparks}
       <path d="M ${cx} ${cy - 225} C ${cx + 130} ${cy - 225} ${cx + 228} ${cy - 128} ${cx + 228} ${cy} C ${cx + 228} ${cy + 92} ${cx + 160} ${cy + 140} ${cx + 128} ${cy + 210} L ${cx + 120} ${cy + 250} L ${cx - 120} ${cy + 250} L ${cx - 128} ${cy + 210} C ${cx - 160} ${cy + 140} ${cx - 228} ${cy + 92} ${cx - 228} ${cy} C ${cx - 228} ${cy - 128} ${cx - 130} ${cy - 225} ${cx} ${cy - 225} Z" fill="${IDEAS.black}"/>
       <rect x="${cx - 112}" y="${cy + 266}" width="224" height="40" rx="14" fill="${IDEAS.black}"/>
       <rect x="${cx - 104}" y="${cy + 318}" width="208" height="40" rx="14" fill="${IDEAS.black}"/>
       <path d="M ${cx - 70} ${cy + 370} L ${cx + 70} ${cy + 370} L ${cx + 40} ${cy + 405} L ${cx - 40} ${cy + 405} Z" fill="${IDEAS.black}"/>`));
    s += box(`left:0;right:0;top:${cy - 128}px;text-align:center`, fn("BAD", 250, { fill: IDEAS.yellow, stroke: IDEAS.black, sw: 0, shadow: false, skew: -4 }));
    return s;
  }

  function pfpUnreal() {
    let s = box(`inset:0;background:radial-gradient(circle at 50% 40%,${UNREAL.ink2},${UNREAL.ink} 68%)`);
    // four chevrons climbing: bronze, silver, gold, unreal
    const chev = (y, w, h, t, fill, extra = "") => {
      const x = 540 - w / 2;
      return `<path d="M ${x} ${y + h} L 540 ${y} L ${x + w} ${y + h} L ${x + w - t * 1.15} ${y + h} L 540 ${y + t * 1.05} L ${x + t * 1.15} ${y + h} Z" fill="${fill}" ${extra}/>`;
    };
    s += box(`left:0;top:0`, svg(1080, 1080,
      `<defs><linearGradient id="ug" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${UNREAL.unrealA}"/><stop offset="1" stop-color="${UNREAL.unrealB}"/></linearGradient>
         <filter id="gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
       ${chev(560, 470, 150, 64, UNREAL.bronze)}
       ${chev(445, 470, 150, 64, UNREAL.silver)}
       ${chev(330, 470, 150, 64, UNREAL.gold)}
       ${chev(170, 560, 190, 80, "url(#ug)", 'filter="url(#gl)"')}`));
    s += box(`left:0;right:0;top:735px;text-align:center`, fn("BAD", 230, { fill: UNREAL.white, stroke: "#07051A", sw: 14 }));
    return s;
  }

  const PFP = { badnews: pfpNews, badideas: pfpIdeas, badtounreal: pfpUnreal };
  const LABEL = { badnews: "BAD NEWS", badideas: "BAD IDEAS", badtounreal: "BAD TO UNREAL" };

  // a pfp scaled into a circle of diameter d
  const circle = (key, d, ring = "") => `<div style="position:relative;width:${d}px;height:${d}px;border-radius:50%;overflow:hidden;${ring}"><div style="position:absolute;left:0;top:0;width:1080px;height:1080px;transform:scale(${d / 1080});transform-origin:0 0">${PFP[key]()}</div></div>`;

  function pfpCompare() {
    const W = 2100, H = 1260;
    let s = box(`inset:0;background:#ECEEF2`);
    s += box(`left:70px;top:46px;font:700 40px Barlow;color:#14161C`, `Profile pictures, circle-cropped`);
    s += box(`left:70px;top:100px;font:600 28px Barlow;color:#5A6070`, `Big: as on a profile page. Small row: 110px and 40px, on dark and light app backgrounds.`);
    Object.keys(PFP).forEach((k, i) => {
      const x = 70 + i * 680;
      s += box(`left:${x}px;top:170px`, circle(k, 600, "box-shadow:0 10px 30px rgba(0,0,0,.18)"));
      s += box(`left:${x}px;top:790px;width:600px;text-align:center;font:700 40px Barlow;color:#14161C`, LABEL[k]);
      s += box(`left:${x}px;top:860px;width:290px;height:330px;background:#000;border-radius:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px`,
        circle(k, 110) + `<div style="display:flex;gap:16px;align-items:center">${circle(k, 40)}<span style="font:600 26px Barlow;color:#fff">@handle</span></div>`);
      s += box(`left:${x + 310}px;top:860px;width:290px;height:330px;background:#fff;border:2px solid #D5D9E0;border-radius:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px`,
        circle(k, 110) + `<div style="display:flex;gap:16px;align-items:center">${circle(k, 40)}<span style="font:600 26px Barlow;color:#111">@handle</span></div>`);
    });
    return [W, H, s];
  }

  // ======================= headline font comparison =======================
  function fontCompare() {
    const W = 2100, ROW = 330, keys = ["barlow", "anton", "league", "bebas", "lucky"];
    const H = 300 + ROW * (keys.length + 1) + 60;
    let s = box(`inset:0;background:#ECEEF2`);
    s += box(`left:70px;top:46px;font:700 40px Barlow;color:#14161C`, `Headline font: free stand-ins for Burbank Big Condensed`);
    s += box(`left:70px;top:100px;width:1900px;font:600 28px/1.4 Barlow;color:#5A6070`,
      `Each sample uses the same in-game treatment: all caps, heavy outline, short drop shadow, slight forward lean. The card shows the face on a Legendary item card.`);
    // Burbank reference row (not installed, so described instead of drawn)
    const y0 = 220;
    s += box(`left:70px;top:${y0}px;width:1960px;height:${ROW - 30}px;background:#fff;border:3px dashed #9AA1AF;border-radius:20px`);
    s += box(`left:110px;top:${y0 + 40}px;width:560px;font:700 36px/1.15 Barlow;color:#14161C`, `Burbank Big Condensed Black`);
    s += box(`left:110px;top:${y0 + 140}px;width:520px;font:600 26px/1.45 Barlow;color:#5A6070`, `The real in-game face. Commercial (House Industries), not installed, so it can't be previewed here.`);
    s += box(`left:700px;top:${y0 + 40}px;width:1280px;font:600 30px/1.5 Barlow;color:#14161C`,
      `What to match: very condensed, very heavy, tall caps, squared letters with softly rounded corners, tight spacing. Built to stay readable at small sizes over busy game art.`);
    keys.forEach((k, i) => {
      const f = FONTS[k], y = y0 + ROW * (i + 1);
      const verdict = {
        barlow: ["Closest match. Recommended.", "#1E8E4E"], anton: ["Close. A little narrower and stiffer.", "#1E8E4E"],
        league: ["Right width, too light at small sizes.", "#B7791F"], bebas: ["Too thin for outlines.", "#C2412D"],
        lucky: ["Fun, but wide and bubbly. Reads as cartoon, not as Fortnite UI.", "#C2412D"],
      }[k];
      s += box(`left:70px;top:${y}px;width:1960px;height:${ROW - 30}px;background:linear-gradient(100deg,#1D4FB8,#2E8BEA 55%,#57B7F5);border-radius:20px;overflow:hidden`);
      s += box(`left:70px;top:${y}px;width:560px;height:${ROW - 30}px;background:rgba(255,255,255,.94);border-radius:20px 0 0 20px`);
      s += box(`left:110px;top:${y + 40}px;width:500px;font:700 40px Barlow;color:#14161C`, f.name);
      s += box(`left:110px;top:${y + 100}px;width:490px;font:700 28px/1.4 Barlow;color:${verdict[1]}`, verdict[0]);
      s += box(`left:110px;top:${y + 200}px;width:490px;font:600 22px Barlow;color:#5A6070`, `Free · Google Fonts (OFL/Apache)`);
      s += box(`left:680px;top:${y + 22}px`, fn("Breaking: collab confirmed", 76, { font: f }));
      s += box(`left:680px;top:${y + 124}px`, fn("Experiment #014", 62, { font: f, fill: "#FFD60A" }));
      s += box(`left:680px;top:${y + 208}px`, fn("Day 23 · Gold II", 52, { font: f }));
      // legendary item card
      const [a, b] = RARITY.legendary;
      s += box(`left:1780px;top:${y + 18}px;width:220px;height:264px;border-radius:12px;overflow:hidden;background:radial-gradient(circle at 50% 35%,${a},${b});border:4px solid ${a};box-shadow:0 6px 0 rgba(0,0,0,.3)`,
        `<img src="../../../code-bad-packs/art/renegade.png" style="position:absolute;width:300px;left:-40px;top:-6px">
         <div style="position:absolute;left:0;right:0;bottom:0;height:82px;background:linear-gradient(transparent,rgba(0,0,0,.75) 35%);padding:16px 12px 0">${fn("Renegade Raider", 26, { font: f, sw: 3, skew: 0 })}</div>`);
    });
    return [W, H, s];
  }

  // ======================= registry =======================
  const ASSETS_MAP = {
    "_direction/font-compare": fontCompare,
    "_direction/pfp-compare": pfpCompare,
    ...Object.fromEntries(Object.keys(PFP).map((k) => [`${k}/pfp-${k}-1080`, () => [1080, 1080, PFP[k]()]])),
  };
  root.ASSETS = {
    names: () => Object.keys(ASSETS_MAP),
    asset: (name) => ASSETS_MAP[name](),
    setHeadline: (key) => { HEAD = FONTS[key]; },
    // brand files add their own assets and reuse these helpers
    add: (map) => Object.assign(ASSETS_MAP, map),
    lib: { box, svg, fn, RARITY, NEWS, IDEAS, UNREAL, PFP, circle },
  };
})(window);
