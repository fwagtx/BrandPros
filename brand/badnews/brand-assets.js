/* BAD NEWS brand package: logo lockups, platform banners, one-page brand guide.
 * Original marks only: no Epic or Fortnite logos, no skin or game art in any brand asset.
 */
(function () {
  "use strict";
  const { box, svg, fn, RARITY, NEWS: N, PFP, circle } = window.ASSETS.lib;
  const INK = "#070C1C";
  const TAGLINE = "Fortnite news. Checked.";
  const SCAN = `repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 3px,transparent 3px 9px)`;

  // stacked mark (icon): BAD over the red NEWS bar and yellow strip
  function mark(size, dark = true) {
    const u = size / 1080;
    const fill = dark ? N.white : N.navy, stroke = dark ? "#050A1A" : "#050A1A";
    return box(`left:0;top:0;width:${size}px;height:${size}px`,
      box(`left:0;right:0;top:${190 * u}px;text-align:center`, fn("BAD", 480 * u, { fill, stroke, sw: 26 * u, shadow: dark })) +
      box(`left:${160 * u}px;right:${160 * u}px;top:${668 * u}px;height:${196 * u}px;background:${N.red};transform:skewX(-8deg);display:flex;align-items:center;justify-content:center;${dark ? `box-shadow:0 ${14 * u}px 0 rgba(0,0,0,.35)` : ""}`,
        fn("NEWS", 190 * u, { fill: N.white, stroke: "#5A0B07", sw: 12 * u, skew: 0, track: 14 * u, shadow: false })) +
      box(`left:${200 * u}px;right:${200 * u}px;top:${880 * u}px;height:${26 * u}px;background:${N.yellow};transform:skewX(-8deg)`));
  }
  // horizontal lockup: BAD + skewed NEWS bar, yellow strip, optional tagline
  function lockup(h, dark = true, tagline = true) {
    const u = h / 300;
    const fill = dark ? N.white : N.navy;
    return `<div style="display:flex;align-items:center;gap:${26 * u}px">
      ${fn("BAD", 250 * u, { fill, stroke: "#050A1A", sw: 15 * u, shadow: dark })}
      <div style="position:relative;display:flex;flex-direction:column;gap:${10 * u}px">
        <div style="background:${N.red};transform:skewX(-8deg);padding:${8 * u}px ${30 * u}px ${2 * u}px;${dark ? `box-shadow:0 ${8 * u}px 0 rgba(0,0,0,.35)` : ""}">${fn("NEWS", 150 * u, { fill: N.white, stroke: "#5A0B07", sw: 8 * u, skew: 0, track: 8 * u, shadow: false })}</div>
        <div style="height:${14 * u}px;background:${N.yellow};transform:skewX(-8deg);margin:0 ${14 * u}px"></div>
        ${tagline ? `<div style="font:700 ${34 * u}px Barlow;letter-spacing:${3 * u}px;text-transform:uppercase;color:${dark ? N.white : N.navy};white-space:nowrap">${TAGLINE}</div>` : ""}
      </div></div>`;
  }
  const ticker = (items, size) => `<div style="display:flex;align-items:center;height:100%;white-space:nowrap">${items.map((s) =>
    `<span style="font:700 ${size}px Barlow;letter-spacing:1px;text-transform:uppercase;color:${N.white}">${s}</span><span style="color:${N.red};font:900 ${size}px 'Barlow Condensed';margin:0 ${size}px">■</span>`).join("")}</div>`;
  const TICK = ["Updates", "Patch notes", "Collab watch", "Map Easter eggs", "Server status", "Every claim sourced"];
  const studio = (w, h) => box(`inset:0;background:radial-gradient(ellipse 60% 70% at 50% 45%,${N.navy2},${N.navy} 70%,${INK})`) + box(`inset:0;background:${SCAN}`) +
    box(`left:0;top:0`, svg(w, h, `<g stroke="rgba(255,255,255,.06)" stroke-width="2">${Array.from({ length: 18 }, (_, i) => `<line x1="${(i * w) / 17}" y1="0" x2="${(i * w) / 17 - h * 0.35}" y2="${h}"/>`).join("")}</g>`));

  function youtube() {
    const W = 2560, H = 1440;
    let s = studio(W, H);
    // safe area for every device: 1546 x 423 centered (x 507-2053, y 508-931)
    s += box(`left:${W / 2 - 773}px;top:${H / 2 - 212}px;width:1546px;height:423px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px`,
      lockup(250, true, false) + `<div style="font:700 44px Barlow;letter-spacing:6px;text-transform:uppercase;color:${N.yellow}">${TAGLINE} New reports daily.</div>`);
    // ticker strip (decorative, also inside the TV-safe width)
    s += box(`left:0;right:0;top:1000px;height:70px;background:${INK};border-top:4px solid ${N.red};border-bottom:4px solid #22305C;overflow:hidden`,
      box(`left:0;top:0;bottom:0;width:240px;background:${N.yellow};display:flex;align-items:center;justify-content:center`, fn("BAD NEWS", 40, { fill: INK, sw: 0, skew: 0, shadow: false })) +
      box(`left:270px;top:0;bottom:0`, ticker([...TICK, ...TICK], 30)));
    return [W, H, s];
  }
  function xHeader() {
    const W = 1500, H = 500;
    let s = studio(W, H);
    s += box(`left:420px;top:92px`, lockup(220, true, true));
    s += box(`left:0;right:0;top:${H - 62}px;height:62px;background:${INK};border-top:4px solid ${N.red};overflow:hidden`, box(`left:330px;top:0;bottom:0`, ticker(TICK, 24)));
    return [W, H, s];
  }
  function facebook() {
    const W = 1640, H = 624;
    let s = studio(W, H);
    s += box(`left:0;right:0;top:110px;display:flex;justify-content:center`, lockup(250, true, true));
    s += box(`left:0;right:0;top:${H - 72}px;height:72px;background:${INK};border-top:4px solid ${N.red};overflow:hidden;display:flex;justify-content:center`, ticker(TICK, 26));
    return [W, H, s];
  }

  // ---------- one-page brand guide (1700 x 2200) ----------
  function guide() {
    const W = 1700, H = 2200;
    const sec = (y, title) => box(`left:80px;top:${y}px;font:700 22px Barlow;letter-spacing:5px;text-transform:uppercase;color:${N.red}`, title) + box(`left:80px;right:80px;top:${y + 34}px;height:2px;background:#D9DDE6`);
    const p = (x, y, w, html, size = 24) => box(`left:${x}px;top:${y}px;width:${w}px;font:600 ${size}px/1.45 Barlow;color:#1A2033`, html);
    let s = box(`inset:0;background:#F4F6FA`);
    s += box(`left:0;right:0;top:0;height:300px;background:${N.navy}`) + box(`left:0;right:0;top:0;height:300px;background:${SCAN}`);
    s += box(`left:80px;top:62px`, lockup(170, true, true));
    s += box(`right:80px;top:96px;text-align:right;font:700 26px/1.5 Barlow;color:${N.white}`, `Brand guide · v1<br><span style="color:${N.yellow}">Fan-run, not affiliated with Epic Games</span>`);

    // logos
    s += sec(350, "Logos");
    s += box(`left:80px;top:410px;width:500px;height:300px;background:${N.navy};border-radius:16px;display:flex;align-items:center;justify-content:center`, lockup(95, true, false));
    s += box(`left:610px;top:410px;width:500px;height:300px;background:#fff;border:2px solid #D9DDE6;border-radius:16px;display:flex;align-items:center;justify-content:center`, lockup(95, false, false));
    s += box(`left:1140px;top:410px;width:220px;height:300px;background:${N.navy};border-radius:16px;overflow:hidden`, `<div style="position:absolute;left:10px;top:50px;width:200px;height:200px">${mark(200)}</div>`);
    s += box(`left:1390px;top:440px`, circle("badnews", 230));
    s += p(80, 722, 1540, "Horizontal on dark · horizontal on light · icon · profile picture. Keep clear space equal to the height of the yellow strip ×3. Never recolor, stretch, add effects, or place on busy game art without a navy plate.", 22);

    // palette
    s += sec(820, "Palette");
    const sw = [["Broadcast red", N.red, "Headlines tags, NEWS bar, alerts"], ["Navy", N.navy, "Backgrounds, plates"], ["Signal white", N.white, "Text on navy"], ["Alert yellow", N.yellow, "Highlights, ticker label"], ["Ink", INK, "Outlines, ticker"]];
    sw.forEach(([n, c, use], i) => {
      const x = 80 + i * 312;
      s += box(`left:${x}px;top:880px;width:292px;height:130px;border-radius:14px;background:${c};border:2px solid #D9DDE6`);
      s += p(x, 1018, 292, `<b style="font-weight:700">${n}</b> ${c}<br><span style="color:#5A6070;font-size:20px">${use}</span>`, 22);
    });
    s += p(80, 1110, 300, `<b>In-game rarity colors</b><br><span style="font-size:20px;color:#5A6070">Item cards and frames only, never brand moments</span>`, 22);
    Object.entries(RARITY).forEach(([n, [a, b]], i) => {
      s += box(`left:${420 + i * 244}px;top:1108px;width:224px;height:84px;border-radius:12px;background:radial-gradient(circle at 50% 30%,${a},${b});display:flex;align-items:center;justify-content:center`, fn(n, 36, { sw: 3, skew: 0 }));
    });

    // type
    s += sec(1240, "Type");
    s += box(`left:80px;top:1296px`, fn("Breaking: collab confirmed", 66));
    s += p(80, 1384, 760, `<b>Headlines: Barlow Condensed Black</b> (free stand-in until Burbank Big Condensed Black is licensed, then swap 1:1). All caps, outline 7.5% of size, short hard drop shadow, -6° lean.`, 22);
    s += box(`left:900px;top:1300px;width:720px;font:700 40px Barlow;color:${N.navy}`, `Body and labels: Barlow Bold / SemiBold`);
    s += p(900, 1360, 720, `Sentence case for captions, ALL CAPS for labels and tickers. No other typefaces.`, 22);

    // voice + do/don't
    s += sec(1540, "Voice");
    s += p(80, 1596, 760, `A calm anchor with a fan's excitement. Facts first, then why it matters, in short sentences. Say "rumor" when it's a rumor and name the source. Sound like a person: <i>"Two of his ghosts are here too."</i> Not: <i>"You won't BELIEVE this insane secret!!"</i>`, 24);
    s += box(`left:900px;top:1596px;width:340px;font:700 24px/1.6 Barlow;color:#1E8E4E`, `DO<br><span style="font-weight:600;color:#1A2033">· Trace every claim to a saved source<br>· Show the payoff in frame 1<br>· Use the official map and news art<br>· Label rumors with source + confidence<br>· Credit other reporters by name</span>`);
    s += box(`left:1270px;top:1596px;width:350px;font:700 24px/1.6 Barlow;color:#C2412D`, `DON'T<br><span style="font-weight:600;color:#1A2033">· Post datamined leak images<br>· Use Epic/Fortnite logos or skin art in brand assets<br>· Clickbait, all-caps shouting, fake urgency<br>· "Tell us below" endings<br>· Text-to-speech voices</span>`);

    // code moment rules
    s += sec(1930, "Code moment rules");
    s += box(`left:80px;top:1986px;width:560px;height:196px;background:${N.navy};border:5px solid ${N.yellow};border-radius:16px;overflow:hidden`,
      box(`left:0;right:0;top:0;height:54px;background:${N.red};display:flex;align-items:center;justify-content:center`, fn("This broadcast supported by", 30, { sw: 0, skew: 0, shadow: false })) +
      box(`left:0;right:0;top:62px;text-align:center`, fn("Code BAD", 90, { skew: -4 })) +
      box(`left:0;right:0;top:146px;text-align:center;font:700 22px Barlow;color:${N.yellow}`, `#EpicPartner`));
    s += p(680, 1990, 940, `· 1–2 seconds near the end, as the ticker line or this sponsor card.<br>· #EpicPartner on screen from frame 1, and the first hashtag in caption line 1.<br>· Spell it exactly <b>BAD</b>. Never "discount", "free", "save", or any reward for using it.<br>· Never imply Epic endorses the channel. Bios say "Fan-run, not affiliated with Epic".`, 23);
    return [W, H, s];
  }

  const D = "badnews/";
  window.ASSETS.add({
    [D + "logo/badnews-icon-1024"]: () => [1024, 1024, mark(1024)],
    [D + "logo/badnews-icon-light-1024"]: () => [1024, 1024, mark(1024, false)],
    [D + "logo/badnews-horizontal-dark"]: () => [1800, 560, box(`left:90px;top:90px`, lockup(300, true, true))],
    [D + "logo/badnews-horizontal-light"]: () => [1800, 560, box(`left:90px;top:90px`, lockup(300, false, true))],
    [D + "banners/youtube-banner-2560x1440"]: youtube,
    [D + "banners/x-header-1500x500"]: xHeader,
    [D + "banners/facebook-cover-1640x624"]: facebook,
    [D + "brand-guide"]: guide,
  });
})();
