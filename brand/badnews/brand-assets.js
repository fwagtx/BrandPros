/* BAD NEWS brand package v2: one simple flat mark and everything built from it.
 * The mark: a BAD block and a red NEWS block, slanted like a broadcast bug. No outlines, no shadows, no extra strips.
 * Original marks only: no Epic or Fortnite logos, no skin or game art in any brand asset.
 */
(function () {
  "use strict";
  const { box, svg, fn, RARITY } = window.ASSETS.lib;
  const C = { red: "#D7261E", navy: "#0B1530", white: "#F4F6FA", yellow: "#FFC400", ink: "#070C1C" };
  const TAGLINE = "Fortnite news. Checked.";
  const SKEW = -10;
  const SCAN = `repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 3px,transparent 3px 9px)`;
  const word = (t, size, color, track = 0) => `<span style="font-family:'Barlow Condensed';font-weight:900;font-size:${size}px;line-height:1;letter-spacing:${track}px;color:${color};text-transform:uppercase;white-space:nowrap;transform:skewX(${-SKEW}deg) skewX(${SKEW}deg)">${t}</span>`;
  // a slanted block holding one word; text is not skewed separately (the whole block leans)
  const block = (t, h, bg, color, padX, size, track = 0) =>
    `<div style="height:${h}px;background:${bg};transform:skewX(${SKEW}deg);display:flex;align-items:center;justify-content:center;padding:0 ${padX}px">${word(t, size, color, track)}</div>`;

  // horizontal lockup: [BAD][NEWS]. dark = for dark backgrounds (white BAD block), light = navy BAD block
  function lockup(h, dark = true, tagline = false) {
    const badBg = dark ? C.white : C.navy, badFg = dark ? C.navy : C.white;
    return `<div style="display:inline-flex;flex-direction:column;align-items:flex-start;gap:${h * 0.16}px">
      <div style="display:flex;gap:${h * 0.07}px">${block("BAD", h, badBg, badFg, h * 0.22, h * 0.86)}${block("NEWS", h, C.red, C.white, h * 0.2, h * 0.86, h * 0.02)}</div>
      ${tagline ? `<div style="font:700 ${h * 0.19}px Barlow;letter-spacing:${h * 0.03}px;text-transform:uppercase;color:${dark ? C.yellow : C.navy};white-space:nowrap;padding-left:${h * 0.06}px">${TAGLINE}</div>` : ""}
    </div>`;
  }
  // stacked icon: BAD block over NEWS block, sized to a box of width w
  function stacked(w, dark = true) {
    const badBg = dark ? C.white : C.navy, badFg = dark ? C.navy : C.white;
    const h1 = w * 0.43, h2 = w * 0.235;
    return `<div style="width:${w}px;display:flex;flex-direction:column;gap:${w * 0.03}px">
      <div style="height:${h1}px;background:${badBg};transform:skewX(${SKEW}deg);display:flex;align-items:center;justify-content:center">${word("BAD", h1 * 0.98, badFg, w * 0.01)}</div>
      <div style="height:${h2}px;background:${C.red};transform:skewX(${SKEW}deg);display:flex;align-items:center;justify-content:center">${word("NEWS", h2 * 0.9, C.white, w * 0.035)}</div>
    </div>`;
  }
  const center = (W, H, inner) => box(`left:0;top:0;width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center`, inner);
  const ground = (extra = "") => box(`inset:0;background:radial-gradient(ellipse 75% 75% at 50% 45%,#13245A,${C.navy} 70%)${extra}`) + box(`inset:0;background:${SCAN}`);

  // ---------- profile picture (square, reads inside a circle crop and at 40 px) ----------
  const pfp = (S) => [S, S, ground() + center(S, S, stacked(S * 0.72))];

  // ---------- banners ----------
  function youtube() {
    const W = 2560, H = 1440;
    // every device shows the 1546 x 423 center; nothing important outside it
    let s = ground();
    s += box(`left:${W / 2 - 773}px;top:${H / 2 - 212}px;width:1546px;height:423px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px`,
      lockup(190, true, false) + `<div style="font:700 40px Barlow;letter-spacing:7px;text-transform:uppercase;color:${C.yellow}">${TAGLINE} New reports daily.</div>`);
    s += box(`left:0;right:0;top:${H / 2 + 230}px;height:6px;background:${C.red}`);
    return [W, H, s];
  }
  function xHeader() {
    // X puts the profile picture over the bottom-left; keep that corner empty
    const W = 1500, H = 500;
    let s = ground();
    s += box(`left:470px;top:0;height:${H}px;display:flex;align-items:center`, lockup(150, true, true));
    s += box(`left:0;right:0;bottom:0;height:8px;background:${C.red}`);
    return [W, H, s];
  }
  function facebook() {
    // mobile crops the sides: keep content in the middle ~1100 px
    const W = 1640, H = 624;
    let s = ground();
    s += center(W, H, lockup(160, true, true));
    s += box(`left:0;right:0;bottom:0;height:8px;background:${C.red}`);
    return [W, H, s];
  }
  // YouTube channel watermark (shown small in the corner of every video): transparent, simple
  const watermark = () => [150, 150, center(150, 150, stacked(132))];

  // ---------- Instagram highlight covers (only the center circle shows) ----------
  const ICONS = {
    "easter-eggs": `<path d="M0 -150 C 70 -150 115 -40 115 40 C 115 115 65 160 0 160 C -65 160 -115 115 -115 40 C -115 -40 -70 -150 0 -150 Z" fill="none" stroke="#fff" stroke-width="22"/><path d="M-110 30 L-60 -5 L-20 30 L20 -5 L60 30 L110 -5" fill="none" stroke="#fff" stroke-width="18" stroke-linejoin="round"/>`,
    breaking: `<path d="M25 -165 L-85 20 L-5 20 L-30 165 L90 -30 L10 -30 Z" fill="#fff"/>`,
    "patch-notes": `<rect x="-110" y="-150" width="220" height="300" rx="22" fill="none" stroke="#fff" stroke-width="22"/><line x1="-60" y1="-75" x2="60" y2="-75" stroke="#fff" stroke-width="20" stroke-linecap="round"/><line x1="-60" y1="0" x2="60" y2="0" stroke="#fff" stroke-width="20" stroke-linecap="round"/><line x1="-60" y1="75" x2="20" y2="75" stroke="#fff" stroke-width="20" stroke-linecap="round"/>`,
    "collab-watch": `<circle cx="-55" cy="0" r="95" fill="none" stroke="#fff" stroke-width="22"/><circle cx="55" cy="0" r="95" fill="none" stroke="#fff" stroke-width="22"/>`,
    recap: `<path d="M-70 60 L-70 -120 M-130 -60 L-70 -120 L-10 -60" fill="none" stroke="#fff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 -60 L70 120 M10 60 L70 120 L130 60" fill="none" stroke="${C.yellow}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>`,
    "code-bad": null,
  };
  function highlight(key) {
    const W = 1080, H = 1920;
    let s = box(`inset:0;background:${C.navy}`);
    const inner = ICONS[key] ? svg(400, 400, `<g transform="translate(200 200)">${ICONS[key]}</g>`) : stacked(360);
    s += box(`left:${W / 2 - 330}px;top:${H / 2 - 330}px;width:660px;height:660px;border-radius:50%;background:${C.red};display:flex;align-items:center;justify-content:center`, inner);
    return [W, H, s];
  }

  // ---------- one-page brand guide (1700 x 2200) ----------
  function guide() {
    const W = 1700, H = 2200;
    const sec = (y, title) => box(`left:80px;top:${y}px;font:700 22px Barlow;letter-spacing:5px;text-transform:uppercase;color:${C.red}`, title) + box(`left:80px;right:80px;top:${y + 34}px;height:2px;background:#D9DDE6`);
    const p = (x, y, w, html, size = 24) => box(`left:${x}px;top:${y}px;width:${w}px;font:600 ${size}px/1.45 Barlow;color:#1A2033`, html);
    let s = box(`inset:0;background:#F4F6FA`);
    s += box(`left:0;right:0;top:0;height:300px;background:${C.navy}`);
    s += box(`left:80px;top:0;height:300px;display:flex;align-items:center`, lockup(110, true, true));
    s += box(`right:80px;top:104px;text-align:right;font:700 26px/1.5 Barlow;color:${C.white}`, `Brand guide · v2<br><span style="color:${C.yellow}">Fan-run, not affiliated with Epic Games</span>`);

    s += sec(350, "Logo");
    s += box(`left:80px;top:410px;width:520px;height:300px;background:${C.navy};border-radius:16px;display:flex;align-items:center;justify-content:center`, lockup(100, true));
    s += box(`left:630px;top:410px;width:520px;height:300px;background:#fff;border:2px solid #D9DDE6;border-radius:16px;display:flex;align-items:center;justify-content:center`, lockup(100, false));
    s += box(`left:1180px;top:410px;width:440px;height:300px;display:flex;gap:30px;align-items:center;justify-content:center`,
      `<div style="width:220px;height:220px;border-radius:50%;overflow:hidden;position:relative">${box(`left:0;top:0;width:1080px;height:1080px;transform:scale(${220 / 1080});transform-origin:0 0`, pfp(1080)[2])}</div>
       <div style="display:flex;flex-direction:column;gap:20px;align-items:center"><div style="width:80px;height:80px;border-radius:50%;overflow:hidden;position:relative">${box(`left:0;top:0;width:1080px;height:1080px;transform:scale(${80 / 1080});transform-origin:0 0`, pfp(1080)[2])}</div>
       <div style="width:40px;height:40px;border-radius:50%;overflow:hidden;position:relative">${box(`left:0;top:0;width:1080px;height:1080px;transform:scale(${40 / 1080});transform-origin:0 0`, pfp(1080)[2])}</div></div>`);
    s += p(80, 722, 1540, "On dark: white BAD block. On light: navy BAD block. NEWS is always red. Both blocks lean 10°. Clear space on every side = the height of the NEWS block. No outlines, shadows, gradients, or extra strips on the logo; never put it straight on game art without a navy plate.", 22);

    s += sec(820, "Palette");
    const sw = [["Broadcast red", C.red, "NEWS block, tags, alerts"], ["Navy", C.navy, "Backgrounds, plates"], ["Signal white", C.white, "BAD block, text on navy"], ["Alert yellow", C.yellow, "Highlights in content only"], ["Ink", C.ink, "Outlines in content, ticker"]];
    sw.forEach(([n, c, use], i) => {
      const x = 80 + i * 312;
      s += box(`left:${x}px;top:880px;width:292px;height:130px;border-radius:14px;background:${c};border:2px solid #D9DDE6`);
      s += p(x, 1018, 292, `<b style="font-weight:700">${n}</b> ${c}<br><span style="color:#5A6070;font-size:20px">${use}</span>`, 22);
    });
    s += p(80, 1110, 300, `<b>In-game rarity colors</b><br><span style="font-size:20px;color:#5A6070">Item cards and frames in videos only</span>`, 22);
    Object.entries(RARITY).forEach(([n, [a, b]], i) => {
      s += box(`left:${420 + i * 244}px;top:1108px;width:224px;height:84px;border-radius:12px;background:radial-gradient(circle at 50% 30%,${a},${b});display:flex;align-items:center;justify-content:center`, fn(n, 36, { sw: 3, skew: 0 }));
    });

    s += sec(1240, "Type");
    s += box(`left:80px;top:1296px`, fn("Breaking: collab confirmed", 66));
    s += p(80, 1384, 760, `<b>Headlines in videos: Barlow Condensed Black</b> (stand-in until Burbank Big Condensed Black is licensed, then swap 1:1). All caps, outline 7.5% of size, short hard drop shadow, -6° lean. The logo itself stays flat.`, 22);
    s += box(`left:900px;top:1300px;width:720px;font:700 40px Barlow;color:${C.navy}`, `Body and labels: Barlow Bold / SemiBold`);
    s += p(900, 1360, 720, `Sentence case for captions, ALL CAPS for labels and tickers. No other typefaces.`, 22);

    s += sec(1540, "Voice");
    s += p(80, 1596, 760, `A calm anchor with a fan's excitement. Facts first, then why it matters, in short sentences. Say "rumor" when it's a rumor and name the source. Sound like a person: <i>"Two of his ghosts are here too."</i> Not: <i>"You won't BELIEVE this insane secret!!"</i>`, 24);
    s += box(`left:900px;top:1596px;width:340px;font:700 24px/1.6 Barlow;color:#1E8E4E`, `DO<br><span style="font-weight:600;color:#1A2033">· Trace every claim to a saved source<br>· Show the payoff in frame 1<br>· Use the official map and news art<br>· Label rumors with source + confidence<br>· Credit other reporters by name</span>`);
    s += box(`left:1270px;top:1596px;width:350px;font:700 24px/1.6 Barlow;color:#C2412D`, `DON'T<br><span style="font-weight:600;color:#1A2033">· Post datamined leak images<br>· Use Epic/Fortnite logos or skin art in brand assets<br>· Clickbait, all-caps shouting, fake urgency<br>· "Tell us below" endings<br>· Text-to-speech voices</span>`);

    s += sec(1930, "Code moment rules");
    s += box(`left:80px;top:1986px;width:560px;height:196px;background:${C.navy};border:5px solid ${C.yellow};border-radius:16px;overflow:hidden`,
      box(`left:0;right:0;top:0;height:54px;background:${C.red};display:flex;align-items:center;justify-content:center`, fn("This broadcast supported by", 30, { sw: 0, skew: 0, shadow: false })) +
      box(`left:0;right:0;top:62px;text-align:center`, fn("Code BAD", 90, { skew: -4 })) +
      box(`left:0;right:0;top:150px;text-align:center;font:700 22px Barlow;color:${C.yellow}`, `#EpicPartner`));
    s += p(680, 1990, 940, `· 1–2 seconds near the end, as the ticker line or this sponsor card.<br>· #EpicPartner on screen from frame 1, and the first hashtag in caption line 1.<br>· Spell it exactly <b>BAD</b>. Never "discount", "free", "save", or any reward for using it.<br>· Never imply Epic endorses the channel. Bios say "Fan-run, not affiliated with Epic".`, 23);
    return [W, H, s];
  }

  // ---------- platform overview sheet (for the owner) ----------
  function overview() {
    const W = 2000, H = 1300;
    let s = box(`inset:0;background:#ECEEF2`);
    s += box(`left:60px;top:40px;font:700 40px Barlow;color:#14161C`, `BAD NEWS: every platform`);
    const plats = [["TikTok", 1080], ["Instagram", 1080], ["Threads", 1080], ["X", 400], ["Facebook", 720], ["YouTube", 800]];
    plats.forEach(([n], i) => {
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

  // ---------- registry: one folder per platform ----------
  const P = "badnews/platforms/";
  const HL = Object.keys(ICONS);
  window.ASSETS.add({
    "badnews/pfp-badnews-1080": () => pfp(1080),
    "badnews/logo/badnews-logo-horizontal-on-dark": () => [1400, 420, box(`left:70px;top:70px`, lockup(280, true))],
    "badnews/logo/badnews-logo-horizontal-on-light": () => [1400, 420, box(`left:70px;top:70px`, lockup(280, false))],
    "badnews/logo/badnews-logo-stacked-on-dark": () => [1000, 1000, center(1000, 1000, stacked(820))],
    "badnews/logo/badnews-logo-stacked-on-light": () => [1000, 1000, center(1000, 1000, stacked(820, false))],
    [P + "tiktok/badnews-tiktok-profile-1080x1080"]: () => pfp(1080),
    [P + "instagram/badnews-instagram-profile-1080x1080"]: () => pfp(1080),
    ...Object.fromEntries(HL.map((k) => [P + `instagram/highlights/badnews-highlight-${k}-1080x1920`, () => highlight(k)])),
    [P + "threads/badnews-threads-profile-1080x1080"]: () => pfp(1080),
    [P + "x/badnews-x-profile-400x400"]: () => pfp(400),
    [P + "x/badnews-x-header-1500x500"]: xHeader,
    [P + "facebook/badnews-facebook-profile-720x720"]: () => pfp(720),
    [P + "facebook/badnews-facebook-cover-1640x624"]: facebook,
    [P + "youtube/badnews-youtube-profile-800x800"]: () => pfp(800),
    [P + "youtube/badnews-youtube-banner-2560x1440"]: youtube,
    [P + "youtube/badnews-youtube-watermark-150x150"]: watermark,
    "badnews/brand-guide": guide,
    "badnews/platforms/overview": overview,
  });
})();
