/* BAD ROYALE brand package: the title-lettering logo (yellow CODE tag, 3D BAD, blue ROYALE plate)
 * and everything built from it. Fortnite's visual language, drawn from scratch:
 * no Epic or Fortnite logos, no skin or game art in any brand asset.
 */
(function () {
  "use strict";
  const { box, svg, fn, RARITY } = window.ASSETS.lib;
  const C = { blue: "#1A63E6", sky: "#3DA6FF", deep: "#0E2F9E", night: "#071A5E", yellow: "#FFD21E", gold: "#B06A00", cream: "#FFF3A6", ink: "#0B0D1A", white: "#FFFFFF", red: "#E8352B" };
  const NAME = "BAD ROYALE";
  const TAGLINE = "Fortnite news. Checked.";
  const BG = `linear-gradient(115deg,rgba(255,255,255,.16) 0 22%,transparent 22% 100%),radial-gradient(circle at 50% 35%,${C.sky},${C.blue} 55%,${C.deep})`;
  const BG_WIDE = `repeating-linear-gradient(115deg,rgba(255,255,255,.045) 0 60px,transparent 60px 180px),radial-gradient(ellipse 70% 90% at 50% 40%,${C.sky},${C.blue} 50%,${C.deep})`;

  // chunky game-title lettering: fill, thick outline, stacked extrusion, hard ground shadow
  function t3d(text, size, o = {}) {
    const { fill = C.white, side = C.night, out = C.ink, depth = Math.round(size * 0.09), sw = size * 0.085, skew = -7, track = 1, lh = 0.88, top = null } = o;
    const sh = [];
    for (let i = 1; i <= depth; i++) sh.push(`${(i * 0.35).toFixed(1)}px ${i}px 0 ${side}`);
    if (depth > 0) {
      sh.push(`${(depth * 0.35 + 2).toFixed(1)}px ${depth + Math.round(sw * 0.6)}px 0 ${out}`);
      sh.push(`${(depth * 0.35 + 4).toFixed(1)}px ${depth + Math.round(sw * 0.6) + size * 0.05}px 0 rgba(0,0,0,.28)`);
    }
    const grad = top ? `background:linear-gradient(${top} 0 46%,${fill} 54%);-webkit-background-clip:text;background-clip:text;color:transparent;` : `color:${fill};`;
    return `<span style="position:relative;display:inline-block;transform:skewX(${skew}deg);font-family:'Barlow Condensed';font-weight:900;font-size:${size}px;line-height:${lh};letter-spacing:${track}px;text-transform:uppercase;white-space:nowrap">
      <span style="position:absolute;left:0;top:0;color:${out};-webkit-text-stroke:${sw * 2}px ${out};${sh.length ? `text-shadow:${sh.join(",")}` : ""}">${text}</span>
      <span style="position:relative;${grad}">${text}</span></span>`;
  }
  // the yellow CODE tag
  const codeTag = (u) => `<div style="display:inline-block;background:${C.yellow};border:${u * 0.14}px solid ${C.ink};border-radius:${u * 0.3}px;transform:skewX(-7deg);padding:${u * 0.06}px ${u * 0.5}px;box-shadow:0 ${u * 0.14}px 0 ${C.ink}">
      <span style="display:inline-block;font-family:'Barlow Condensed';font-weight:900;font-size:${u}px;line-height:1;letter-spacing:${u * 0.08}px;color:${C.deep}">CODE</span></div>`;
  // the blue ROYALE plate
  const plate = (u, wide = false) => `<div style="display:inline-flex;align-items:center;justify-content:center;background:${C.deep};border:${u * 0.11}px solid ${C.ink};border-radius:${u * 0.28}px;transform:skewX(-7deg);box-shadow:0 ${u * 0.14}px 0 ${C.ink};padding:${u * (wide ? 0.08 : 0.12)}px ${u * 0.55}px">${t3d("ROYALE", u, { side: C.night, depth: Math.max(1, Math.round(u * 0.07)), skew: 0, track: u * 0.06 })}</div>`;
  const bad = (size) => t3d("BAD", size, { fill: C.yellow, side: C.gold, top: C.cream, depth: Math.round(size * 0.07) });

  // stacked logo in an S x S box (profile pictures, watermark, highlight)
  const stacked = (S) =>
    box(`left:0;right:0;top:${S * 0.09}px;display:flex;justify-content:center`, codeTag(S * 0.1)) +
    box(`left:0;right:0;top:${S * 0.245}px;text-align:center`, bad(S * 0.43)) +
    box(`left:0;right:0;top:${S * 0.655}px;display:flex;justify-content:center`, plate(S * 0.135));
  // horizontal lockup: CODE tag over BAD, ROYALE plate to the right
  function lockup(h, tagline = false) {
    return `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:${h * 0.22}px">
      <div style="display:flex;align-items:center;gap:${h * 0.1}px">
        <div style="position:relative;padding-top:${h * 0.2}px">
          <div style="position:absolute;left:${h * 0.02}px;top:${-h * 0.06}px">${codeTag(h * 0.2)}</div>${bad(h)}</div>
        <div style="padding-top:${h * 0.2}px">${plate(h * 0.42, true)}</div>
      </div>
      ${tagline ? `<div style="font:700 ${h * 0.17}px Barlow;letter-spacing:${h * 0.03}px;text-transform:uppercase;color:${C.white};white-space:nowrap;text-shadow:0 ${h * 0.02}px 0 ${C.ink}">${TAGLINE}</div>` : ""}
    </div>`;
  }
  const center = (W, H, inner) => box(`left:0;top:0;width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center`, inner);
  const pfp = (S) => [S, S, box(`inset:0;background:${BG}`) + stacked(S)];
  const disclosure = (size) => `<span style="font:700 ${size}px Barlow;letter-spacing:1px;color:${C.white};opacity:.9">#EpicPartner · fan-run, not affiliated with Epic Games</span>`;

  // ---------- banners ----------
  // cel-shaded cloud: flat white puffs with a light-blue underside, no outline
  const cloud = (x, y, w, o = 1) => box(`left:${x}px;top:${y}px;width:${w}px;height:${w * 0.42}px;opacity:${o}`, svg(500, 210,
    `<g fill="#DCEFFF"><circle cx="120" cy="140" r="70"/><circle cx="230" cy="110" r="95"/><circle cx="350" cy="135" r="75"/><rect x="110" y="140" width="290" height="62" rx="31"/></g>
     <g fill="#FFFFFF"><circle cx="120" cy="125" r="62"/><circle cx="230" cy="95" r="86"/><circle cx="350" cy="122" r="66"/><rect x="118" y="120" width="272" height="56" rx="28"/></g>`, `width:${w}px;height:${w * 0.42}px`));
  // a series shown as an in-game item card in its rarity color
  function seriesCard(x, y, rot, rarity, icon, label) {
    const [a, b] = RARITY[rarity];
    return box(`left:${x}px;top:${y}px;width:210px;height:270px;transform:rotate(${rot}deg);border-radius:14px;overflow:hidden;
      background:radial-gradient(circle at 50% 32%,${a},${b} 78%);border:5px solid ${C.ink};box-shadow:0 10px 0 rgba(7,26,94,.55)`,
      box(`left:25px;top:18px;width:160px;height:160px`, `<div style="transform:scale(.4);transform-origin:0 0">${svg(400, 400, `<g transform="translate(200 200)">${ICONS[icon]}</g>`)}</div>`) +
      box(`left:0;right:0;bottom:0;height:78px;background:linear-gradient(transparent,rgba(5,10,30,.85) 35%);display:flex;align-items:flex-end;justify-content:center;padding-bottom:12px`, fn(label, 30, { skew: 0, sw: 3 })));
  }
  // ---------- banners: the Storm look (purple storm swirl, dashed storm edge, yellow lightning) ----------
  const bolt = (x, y, sc, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"><path d="M22 -120 L-60 20 L-4 20 L-26 130 L66 -30 L8 -30 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="9" stroke-linejoin="round"/></g>`;
  function storm(W, H, bolts) {
    let swirl = "";
    for (let i = 0; i < 9; i++) swirl += `<ellipse cx="${W / 2}" cy="${H / 2}" rx="${W * (0.18 + i * 0.07)}" ry="${H * (0.2 + i * 0.09)}" fill="none" stroke="rgba(190,140,255,${0.16 - i * 0.012})" stroke-width="${W * 0.02}" transform="rotate(${i * 7 - 20} ${W / 2} ${H / 2})"/>`;
    const u = H / 1000;
    return box(`inset:0;background:radial-gradient(ellipse 60% 85% at 50% 50%,#7B3BEA,#4A1BA8 45%,#1E0A55 85%)`) +
      box(`left:0;top:0`, svg(W, H, `${swirl}<ellipse cx="${W / 2}" cy="${H / 2}" rx="${W * 0.42}" ry="${H * 0.62}" fill="none" stroke="#FF6BD6" stroke-width="${8 * u + 4}" stroke-dasharray="${60 * u} ${26 * u}" opacity=".85"/>
        ${bolts.map(([fx, fy, sc, r]) => bolt(W * fx, H * fy, sc, r)).join("")}`)) +
      box(`inset:0;background:radial-gradient(ellipse 30% 40% at 50% 50%,rgba(30,10,85,.55),transparent 70%)`);
  }
  // logo + "USE CODE BAD IN THE ITEM SHOP" + the required #EpicPartner tag
  function stormCenter(x, y, w, h, logo, tagSize, chipSize) {
    return box(`left:${x}px;top:${y}px;width:${w}px;height:${h}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(logo * 0.07)}px`,
      lockup(logo) +
      `<div style="font:800 ${tagSize}px Barlow;letter-spacing:${tagSize * 0.08}px;text-transform:uppercase;color:#fff;text-shadow:0 ${tagSize * 0.08}px 0 ${C.ink};white-space:nowrap">Use code <span style="color:${C.yellow}">BAD</span> in the Item Shop</div>` +
      `<div style="padding:${chipSize * 0.18}px ${chipSize * 0.65}px;border-radius:${chipSize}px;background:rgba(7,15,50,.6);font:700 ${chipSize}px Barlow;color:#fff;letter-spacing:1px">#EpicPartner</div>`);
  }
  function youtube() {
    // TV shows all 2560x1440; desktop the full-width band y 508-931; phones only the 1546x423 center
    const W = 2560, H = 1440;
    const bolts = [[0.1, 0.48, 1.3 * 1.44 + 0.4 - 1.3, -12], [0.9, 0.5, 1.9, 14], [0.22, 0.2, 1.25, 8], [0.8, 0.82, 1.4, -10]];
    return [W, H, storm(W, H, bolts) + stormCenter(507, 508, 1546, 423, 200, 50, 24)];
  }
  function xHeader() {
    // X puts the profile picture over the bottom-left; content sits right of it
    const W = 1500, H = 500;
    return [W, H, storm(W, H, [[0.07, 0.5, 0.75, -12], [0.93, 0.5, 0.85, 14], [0.2, 0.18, 0.4, 8]]) + stormCenter(400, 10, 1000, 480, 135, 34, 18)];
  }
  function facebook() {
    // Facebook now centers the profile picture over the bottom-middle (about x 41-59%, y 54%+), and phones crop the sides:
    // logo and text sit in the top half, middle ~1000 px.
    const W = 1640, H = 624;
    return [W, H, storm(W, H, [[0.09, 0.48, 0.95, -12], [0.91, 0.5, 1.05, 14], [0.2, 0.18, 0.5, 8], [0.8, 0.84, 0.55, -10]]) + stormCenter(320, 12, 1000, 300, 118, 32, 16)];
  }


  const watermark = () => [150, 150, stacked(150)];

  // ---------- Instagram highlight covers (only the center circle shows) ----------
  const ICONS = {
    "easter-eggs": `<path d="M0 -150 C 70 -150 115 -40 115 40 C 115 115 65 160 0 160 C -65 160 -115 115 -115 40 C -115 -40 -70 -150 0 -150 Z" fill="#fff" stroke="${C.ink}" stroke-width="18"/><path d="M-110 30 L-60 -5 L-20 30 L20 -5 L60 30 L110 -5" fill="none" stroke="${C.ink}" stroke-width="16" stroke-linejoin="round"/><path d="M-60 -95 Q -40 -125 -10 -130" fill="none" stroke="${C.sky}" stroke-width="14" stroke-linecap="round"/>`,
    breaking: `<path d="M25 -165 L-85 20 L-5 20 L-30 165 L90 -30 L10 -30 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="18" stroke-linejoin="round"/>`,
    "patch-notes": `<rect x="-110" y="-150" width="220" height="300" rx="22" fill="#fff" stroke="${C.ink}" stroke-width="18"/><line x1="-60" y1="-75" x2="60" y2="-75" stroke="${C.deep}" stroke-width="20" stroke-linecap="round"/><line x1="-60" y1="0" x2="60" y2="0" stroke="${C.deep}" stroke-width="20" stroke-linecap="round"/><line x1="-60" y1="75" x2="20" y2="75" stroke="${C.deep}" stroke-width="20" stroke-linecap="round"/>`,
    "collab-watch": `<circle cx="-55" cy="0" r="95" fill="none" stroke="${C.ink}" stroke-width="34"/><circle cx="55" cy="0" r="95" fill="none" stroke="${C.ink}" stroke-width="34"/><circle cx="-55" cy="0" r="95" fill="none" stroke="#fff" stroke-width="18"/><circle cx="55" cy="0" r="95" fill="none" stroke="${C.yellow}" stroke-width="18"/>`,
    recap: `<path d="M-70 60 L-70 -120 M-130 -60 L-70 -120 L-10 -60" fill="none" stroke="${C.ink}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/><path d="M-70 60 L-70 -120 M-130 -60 L-70 -120 L-10 -60" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 -60 L70 120 M10 60 L70 120 L130 60" fill="none" stroke="${C.ink}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 -60 L70 120 M10 60 L70 120 L130 60" fill="none" stroke="${C.yellow}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`,
    "code-bad": null,
  };
  function highlight(key) {
    const W = 1080, H = 1920;
    let s = box(`inset:0;background:${C.deep}`);
    const inner = ICONS[key] ? svg(400, 400, `<g transform="translate(200 200)">${ICONS[key]}</g>`) : `<div style="position:relative;width:560px;height:560px">${stacked(560)}</div>`;
    s += box(`left:${W / 2 - 330}px;top:${H / 2 - 330}px;width:660px;height:660px;border-radius:50%;background:${BG};border:14px solid ${C.ink};display:flex;align-items:center;justify-content:center;overflow:hidden`, inner);
    return [W, H, s];
  }

  // ---------- one-page brand guide (1700 x 2200) ----------
  function guide() {
    const W = 1700, H = 2200;
    const sec = (y, title) => box(`left:80px;top:${y}px;font:700 22px Barlow;letter-spacing:5px;text-transform:uppercase;color:${C.blue}`, title) + box(`left:80px;right:80px;top:${y + 34}px;height:2px;background:#D9DDE6`);
    const p = (x, y, w, html, size = 24) => box(`left:${x}px;top:${y}px;width:${w}px;font:600 ${size}px/1.45 Barlow;color:#1A2033`, html);
    const mini = (d) => `<div style="width:${d}px;height:${d}px;border-radius:50%;overflow:hidden;position:relative;flex:none">${box(`left:0;top:0;width:1080px;height:1080px;transform:scale(${d / 1080});transform-origin:0 0`, pfp(1080)[2])}</div>`;
    let s = box(`inset:0;background:#F4F6FA`);
    s += box(`left:0;right:0;top:0;height:320px;background:${BG_WIDE}`);
    s += box(`left:80px;top:0;height:320px;display:flex;align-items:center`, lockup(120, true));
    s += box(`right:80px;top:116px;text-align:right;font:700 26px/1.5 Barlow;color:${C.white}`, `Brand guide · v3<br><span style="color:${C.yellow}">Fan-run, not affiliated with Epic Games</span>`);

    s += sec(370, "Logo");
    s += box(`left:80px;top:430px;width:620px;height:300px;background:${BG_WIDE};border-radius:16px;display:flex;align-items:center;justify-content:center`, lockup(120));
    s += box(`left:730px;top:430px;width:500px;height:300px;background:#fff;border:2px solid #D9DDE6;border-radius:16px;display:flex;align-items:center;justify-content:center`, lockup(96));
    s += box(`left:1260px;top:430px;width:360px;height:300px;display:flex;gap:26px;align-items:center;justify-content:center`, mini(210) + `<div style="display:flex;flex-direction:column;gap:18px;align-items:center">${mini(80)}${mini(40)}</div>`);
    s += p(80, 742, 1540, "Three parts, always together: the yellow CODE tag, the 3D yellow BAD, the blue ROYALE plate. Works on blue and on white thanks to the dark outline. Clear space = the height of the CODE tag. Never recolor BAD, never drop the CODE tag, never set it on busy game art without a blue plate.", 22);

    s += sec(840, "Palette");
    const sw = [["Royale blue", C.blue, "Backgrounds, banners"], ["Deep blue", C.deep, "ROYALE plate, panels"], ["BAD yellow", C.yellow, "BAD, CODE tag, highlights"], ["Ink", C.ink, "Outlines, text shadows"], ["Breaking red", C.red, "BREAKING / RUMOR tags in videos"]];
    sw.forEach(([n, c, use], i) => {
      const x = 80 + i * 312;
      s += box(`left:${x}px;top:900px;width:292px;height:120px;border-radius:14px;background:${c};border:2px solid #D9DDE6`);
      s += p(x, 1028, 292, `<b style="font-weight:700">${n}</b> ${c}<br><span style="color:#5A6070;font-size:20px">${use}</span>`, 22);
    });
    s += p(80, 1120, 300, `<b>In-game rarity colors</b><br><span style="font-size:20px;color:#5A6070">Item cards in videos and the banner's series cards</span>`, 22);
    Object.entries(RARITY).forEach(([n, [a, b]], i) => {
      s += box(`left:${420 + i * 244}px;top:1118px;width:224px;height:84px;border-radius:12px;background:radial-gradient(circle at 50% 30%,${a},${b});display:flex;align-items:center;justify-content:center`, fn(n, 36, { sw: 3, skew: 0 }));
    });

    s += sec(1250, "Type");
    s += box(`left:80px;top:1306px`, fn("Breaking: collab confirmed", 66));
    s += p(80, 1394, 760, `<b>Headlines: Barlow Condensed Black</b> (stand-in until Burbank Big Condensed Black is licensed, then swap 1:1). All caps, thick outline, short hard shadow, slight lean. The logo adds 3D depth; headlines in videos don't.`, 22);
    s += box(`left:900px;top:1310px;width:720px;font:700 40px Barlow;color:${C.deep}`, `Body and labels: Barlow Bold / SemiBold`);
    s += p(900, 1370, 720, `Sentence case for captions, ALL CAPS for labels and tickers. No other typefaces.`, 22);

    s += sec(1550, "Voice");
    s += p(80, 1606, 760, `A calm anchor with a fan's excitement. Facts first, then why it matters, in short sentences. Say "rumor" when it's a rumor and name the source. Sound like a person: <i>"Two of his ghosts are here too."</i> Not: <i>"You won't BELIEVE this insane secret!!"</i>`, 24);
    s += box(`left:900px;top:1606px;width:340px;font:700 24px/1.6 Barlow;color:#1E8E4E`, `DO<br><span style="font-weight:600;color:#1A2033">· Trace every claim to a saved source<br>· Show the payoff in frame 1<br>· Use the official map and news art<br>· Label rumors with source + confidence<br>· Credit other reporters by name</span>`);
    s += box(`left:1270px;top:1606px;width:350px;font:700 24px/1.6 Barlow;color:#C2412D`, `DON'T<br><span style="font-weight:600;color:#1A2033">· Post datamined leak images<br>· Use Epic/Fortnite logos or skin art in brand assets<br>· Clickbait, all-caps shouting, fake urgency<br>· "Tell us below" endings<br>· Text-to-speech voices</span>`);

    s += sec(1930, "Code moment rules");
    s += box(`left:80px;top:1986px;width:560px;height:196px;background:${C.deep};border:6px solid ${C.ink};border-radius:16px;overflow:hidden`,
      box(`left:0;right:0;top:0;height:54px;background:${C.yellow};display:flex;align-items:center;justify-content:center`, `<span style="font-family:'Barlow Condensed';font-weight:900;font-size:32px;color:${C.deep};letter-spacing:1px">THIS REPORT SUPPORTED BY</span>`) +
      box(`left:0;right:0;top:64px;text-align:center`, fn("Code BAD", 86, { skew: -4 })) +
      box(`left:0;right:0;top:150px;text-align:center;font:700 22px Barlow;color:${C.yellow}`, `#EpicPartner`));
    s += p(680, 1990, 940, `· 1–2 seconds near the end, as the ticker line or this card.<br>· #EpicPartner on screen from frame 1, and the first hashtag in caption line 1.<br>· Spell it exactly <b>BAD</b>. Never "discount", "free", "save", or any reward for using it.<br>· Never imply Epic endorses the channel. Bios say "Fan-run, not affiliated with Epic".`, 23);
    return [W, H, s];
  }

  // ---------- platform overview sheet ----------
  function overview() {
    const W = 2000, H = 1300;
    let s = box(`inset:0;background:#ECEEF2`);
    s += box(`left:60px;top:40px;font:700 40px Barlow;color:#14161C`, `${NAME}: every platform`);
    ["TikTok", "Instagram", "Threads", "X", "Facebook", "YouTube"].forEach((n, i) => {
      const x = 60 + i * 318;
      s += box(`left:${x}px;top:120px;width:290px;height:330px;background:#fff;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px`,
        `<div style="width:180px;height:180px;border-radius:50%;overflow:hidden;position:relative">${box(`left:0;top:0;width:1080px;height:1080px;transform:scale(${180 / 1080});transform-origin:0 0`, pfp(1080)[2])}</div><div style="font:700 30px Barlow;color:#14161C">${n}</div>`);
    });
    const thumb = (fnc, x, y, w, label) => { const [bw, bh, html] = fnc(); const k = w / bw; return box(`left:${x}px;top:${y}px;width:${w}px;height:${bh * k}px;overflow:hidden;border-radius:12px`, box(`left:0;top:0;width:${bw}px;height:${bh}px;transform:scale(${k});transform-origin:0 0`, html)) + box(`left:${x}px;top:${y + bh * k + 8}px;font:600 22px Barlow;color:#5A6070`, label); };
    s += thumb(youtube, 60, 500, 900, "YouTube banner 2560×1440");
    s += thumb(xHeader, 1000, 500, 940, "X header 1500×500");
    s += thumb(facebook, 1000, 860, 940, "Facebook cover 1640×624");
    return [W, H, s];
  }

  const R = "badroyale/", P = R + "platforms/";
  window.ASSETS.add({
    [R + "pfp-badroyale-1080"]: () => pfp(1080),
    [R + "logo/badroyale-logo-horizontal"]: () => [1500, 560, center(1500, 560, lockup(260))],
    [R + "logo/badroyale-logo-horizontal-tagline"]: () => [1500, 640, center(1500, 640, lockup(240, true))],
    [R + "logo/badroyale-logo-stacked"]: () => [1000, 1000, stacked(1000)],
    [P + "tiktok/badroyale-tiktok-profile-1080x1080"]: () => pfp(1080),
    [P + "instagram/badroyale-instagram-profile-1080x1080"]: () => pfp(1080),
    ...Object.fromEntries(Object.keys(ICONS).map((k) => [P + `instagram/highlights/badroyale-highlight-${k}-1080x1920`, () => highlight(k)])),
    [P + "threads/badroyale-threads-profile-1080x1080"]: () => pfp(1080),
    [P + "x/badroyale-x-profile-400x400"]: () => pfp(400),
    [P + "x/badroyale-x-header-1500x500"]: xHeader,
    [P + "facebook/badroyale-facebook-profile-720x720"]: () => pfp(720),
    [P + "facebook/badroyale-facebook-cover-1640x624"]: facebook,
    [P + "youtube/badroyale-youtube-profile-800x800"]: () => pfp(800),
    [P + "youtube/badroyale-youtube-banner-2560x1440"]: youtube,
    [P + "youtube/badroyale-youtube-watermark-150x150"]: watermark,
    [R + "brand-guide"]: guide,
    [P + "overview"]: overview,
  });
  window.BRAND_ROYALE = { t3d, codeTag, plate, bad, stacked, lockup, C };
})();
