/* Code BAD: three alternative brand packs, each distinct from @usecodebad (lime/black, shop facts, quizzes).
 *  notbad  : NOT BAD.   Fortnite fashion, judged honestly (combos, lockers, verdicts)
 *  badmath : BAD MATH   the V-Bucks math nobody does for you (value, cost per wear, bundle math)
 *  tycoon  : BAD TYCOON building a Fortnite tycoon map in public (dev logs, challenges, players)
 * Every asset that shows the code carries #EpicPartner. Nothing says the code is a discount.
 */
(function (root) {
  "use strict";
  const A = (n) => `../art/${n}.png`;
  const img = (n, css) => `<img src="${A(n)}" style="position:absolute;${css}">`;
  const box = (css, inner = "") => `<div style="position:absolute;${css}">${inner}</div>`;

  // ======================= A. NOT BAD. =======================
  const NB = { paper: "#F4F0E8", ink: "#141212", red: "#E1262D", blush: "#F2CFC6", stone: "#8C857B" };
  const nbMast = (size, color = NB.ink) =>
    `<span style="font-family:'Bodoni Moda';font-weight:900;font-size:${size}px;letter-spacing:${-size * 0.035}px;color:${color};line-height:1">NOT BAD<span style="color:${NB.red}">.</span></span>`;
  const nbCodeLine = (color = NB.ink) =>
    `<div style="font:800 24px Inter;letter-spacing:5px;color:${color};text-transform:uppercase">Support-a-Creator code: <span style="color:${NB.red}">BAD</span> · #EpicPartner</div>`;

  function nbF1() {
    let s = box(`inset:0;background:${NB.paper}`);
    s += box(`left:0;right:0;top:170px;text-align:center`, nbMast(196));
    s += box(`left:70px;right:70px;top:405px;border-top:3px solid ${NB.ink};padding-top:16px;display:flex;justify-content:space-between;font:800 22px Inter;letter-spacing:6px`, `<span>ISSUE 014</span><span>THE COMBO COURT</span><span>OCT 2026</span>`);
    s += box(`left:70px;top:478px`, nbCodeLine());
    s += img("midas", `width:1260px;left:-30px;top:540px`);
    s += box(`left:70px;top:640px;width:430px;font-family:'Bodoni Moda';font-style:italic;font-weight:700;font-size:78px;line-height:1.02;color:${NB.ink}`, `Midas,<br>but make it<br><span style="color:${NB.red}">Fall.</span>`);
    s += box(`left:72px;top:960px;width:360px;font:800 28px/1.35 Inter;color:${NB.ink}`, `+ the gold pickaxe nobody wears<br>+ a back bling that actually matches`);
    s += box(`left:640px;top:1220px;width:340px;height:340px;border-radius:50%;background:${NB.red};display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-8deg);box-shadow:0 0 0 10px ${NB.paper},0 0 0 13px ${NB.red}`,
      `<div style="font:800 24px Inter;letter-spacing:6px;color:#fff">VERDICT</div><div style="font-family:'Bodoni Moda';font-weight:900;font-size:66px;color:#fff;line-height:1">BAD</div><div style="font-family:'Bodoni Moda';font-style:italic;font-weight:700;font-size:40px;color:#fff">or</div><div style="font-family:'Bodoni Moda';font-weight:900;font-size:44px;color:#fff;line-height:1">NOT BAD?</div>`);
    return s;
  }
  function nbF2() {
    let s = box(`inset:0;background:${NB.paper}`);
    s += box(`left:70px;top:150px;font-family:'Bodoni Moda';font-weight:900;font-size:170px;line-height:.92;color:${NB.red};letter-spacing:-6px`, `DRIP`);
    s += box(`left:540px;top:192px;font-family:'Bodoni Moda';font-style:italic;font-weight:700;font-size:118px;line-height:1;color:${NB.ink}`, `or drop`);
    s += box(`left:72px;top:345px;font:800 30px Inter;color:${NB.ink}`, `Your lockers, rated. Send yours in the comments ↓`);
    s += box(`left:72px;top:400px`, nbCodeLine(NB.stone));
    const cards = [["peely", "9.1", "DRIP"], ["renegade", "8.7", "DRIP"], ["fishstick", "4.2", "DROP"]];
    cards.forEach(([n, score, tag], i) => {
      const x = 60 + i * 330;
      s += box(`left:${x}px;top:500px;width:300px;height:880px;background:#fff;border:3px solid ${NB.ink}`);
      s += box(`left:${x}px;top:500px;width:300px;height:620px;overflow:hidden;background:${i === 2 ? "#E9E3D8" : NB.blush}`, `<img src="${A(n)}" style="position:absolute;width:560px;left:-130px;top:-10px">`);
      s += box(`left:${x}px;top:1130px;width:300px;text-align:center;font-family:'Bodoni Moda';font-weight:900;font-size:130px;line-height:1;color:${NB.ink}`, score);
      s += box(`left:${x + 60}px;top:1290px;width:180px;text-align:center;border:5px solid ${tag === "DRIP" ? NB.ink : NB.red};color:${tag === "DRIP" ? NB.ink : NB.red};font:800 34px Inter;letter-spacing:8px;padding:6px 0;transform:rotate(${i === 2 ? -6 : 3}deg)`, tag);
    });
    s += box(`left:72px;top:1420px;font-family:'Bodoni Moda';font-style:italic;font-weight:700;font-size:52px;color:${NB.ink}`, `Next week: <span style="color:${NB.red}">your</span> locker.`);
    return s;
  }
  function nbF3() {
    let s = box(`inset:0;background:${NB.blush}`);
    s += img("aura", `width:1300px;left:-110px;top:120px`);
    s += box(`left:70px;top:520px;transform:rotate(-11deg);border:14px solid ${NB.red};padding:10px 40px;font-family:'Bodoni Moda';font-weight:900;font-size:168px;line-height:1.05;color:${NB.red};background:rgba(244,240,232,.55)`, `NOT BAD<span>.</span>`);
    s += box(`left:90px;right:90px;top:1150px;height:330px;background:#FFFDF8;border:3px solid ${NB.ink};box-shadow:8px 10px 0 rgba(0,0,0,.18)`);
    s += box(`left:108px;right:108px;top:1168px;height:294px;border:3px dashed ${NB.stone}`);
    s += box(`left:90px;right:90px;top:1190px;text-align:center`,
      `<div style="font:800 28px Inter;letter-spacing:10px;color:${NB.ink}">SUPPORT-A-CREATOR CODE</div>
       <div style="font-family:'Bodoni Moda';font-weight:900;font-size:150px;line-height:1.02;color:${NB.red};letter-spacing:6px">BAD</div>
       <div style="font:800 30px Inter;color:${NB.ink}">Item Shop → Support-A-Creator → BAD</div>
       <div style="font:800 24px Inter;letter-spacing:4px;color:${NB.stone};margin-top:6px">#EpicPartner</div>`);
    return s;
  }
  const nbAvatar = () => box(`inset:0;background:${NB.paper};display:flex;align-items:center;justify-content:center`,
    `<span style="font-family:'Bodoni Moda';font-weight:900;font-size:380px;letter-spacing:-14px;color:${NB.ink};line-height:1;margin-top:-40px">NB<span style="color:${NB.red}">.</span></span>`);
  function nbBanner() {
    let s = box(`inset:0;background:${NB.paper}`);
    s += img("peely", `width:820px;left:-40px;top:420px`);
    s += img("aura", `width:820px;right:-40px;top:420px`);
    s += box(`left:0;right:0;top:560px;text-align:center`, nbMast(300));
    s += box(`left:0;right:0;top:880px;text-align:center;font-family:'Bodoni Moda';font-style:italic;font-weight:700;font-size:64px;color:${NB.ink}`, `Fortnite fashion, judged honestly.`);
    return s;
  }

  // ======================= B. BAD MATH =======================
  const BM = { paper: "#F7F9FC", grid: "#D3DDF7", navy: "#13204A", blue: "#2F5BFF", lcd: "#C5D3B5", lcdInk: "#1C2716", body: "#2A2F3A", red: "#FF4D3D" };
  const grid = `background-color:${BM.paper};background-image:linear-gradient(${BM.grid} 2px,transparent 2px),linear-gradient(90deg,${BM.grid} 2px,transparent 2px);background-size:54px 54px`;
  const bmLogo = (size = 44) => `<span style="display:inline-block;background:${BM.blue};color:#fff;font-family:'Archivo Black';font-size:${size}px;padding:${size * 0.18}px ${size * 0.4}px;border-radius:${size * 0.22}px;letter-spacing:1px">BAD <span style="font-family:'JetBrains Mono';font-weight:800">×</span> MATH</span>`;
  const bmCode = (color = BM.navy) => `<div style="font:800 26px 'JetBrains Mono';color:${color}">code BAD · #EpicPartner</div>`;
  const marker = (txt, css) => box(`font-family:'Permanent Marker';color:${BM.red};${css}`, txt);
  const lcd = (lines, css) => box(`background:${BM.body};border-radius:40px;padding:34px;${css}`,
    `<div style="background:${BM.lcd};border-radius:16px;padding:22px 34px;box-shadow:inset 0 6px 0 rgba(0,0,0,.18);text-align:right;font-family:'JetBrains Mono';font-weight:800;color:${BM.lcdInk}">${lines}</div>`);

  function bmF1() {
    let s = box(`inset:0;${grid}`);
    s += box(`left:70px;top:150px`, bmLogo(46));
    s += box(`left:70px;top:235px`, bmCode());
    s += box(`left:70px;top:320px;font-family:'Archivo Black';font-size:118px;line-height:.98;color:${BM.navy}`, `IS THIS<br>BUNDLE<br><span style="color:${BM.blue}">WORTH IT?</span>`);
    s += lcd(`<div style="font-size:150px;line-height:1">2,800<span style="font-size:70px"> V</span></div><div style="font-size:52px;opacity:.75">÷ 4 items = 700 each</div>`, `left:70px;right:150px;top:740px`);
    s += marker(`do the math ↓`, `left:640px;top:690px;font-size:46px;transform:rotate(-6deg)`);
    ["peely", "drift", "raven", "brite"].forEach((n, i) => {
      s += box(`left:${70 + i * 210}px;top:1150px;width:190px;height:260px;background:#fff;border:3px solid ${BM.navy};border-radius:18px;overflow:hidden`, `<img src="${A(n)}" style="position:absolute;width:360px;left:-85px;top:-14px">`);
      s += box(`left:${70 + i * 210}px;top:1420px;width:190px;text-align:center;font:800 34px 'JetBrains Mono';color:${BM.navy}`, `700`);
    });
    s += marker(`vs. buying them one by one?`, `left:70px;top:1490px;font-size:44px;transform:rotate(-2deg)`);
    return s;
  }
  function bmF2() {
    let s = box(`inset:0;${grid}`);
    s += box(`left:70px;top:150px`, bmLogo(40));
    s += box(`left:70px;top:230px;font-family:'Archivo Black';font-size:120px;line-height:.95;color:${BM.navy}`, `COST PER<br><span style="color:${BM.blue}">WEAR</span>`);
    s += box(`left:72px;top:480px;font:800 30px 'JetBrains Mono';color:${BM.navy}`, `if you play 3× a week for a year`);
    const rows = [["midas", 0.42, "6.2¢"], ["renegade", 0.3, "4.5¢"], ["aura", 0.62, "9.1¢"], ["fishstick", 0.95, "14¢"]];
    rows.forEach(([n, f, v], i) => {
      const y = 580 + i * 220;
      s += box(`left:70px;top:${y}px;width:170px;height:190px;background:#fff;border:3px solid ${BM.navy};border-radius:16px;overflow:hidden`, `<img src="${A(n)}" style="position:absolute;width:330px;left:-80px;top:-10px">`);
      s += box(`left:270px;top:${y + 50}px;width:${Math.round(f * 600)}px;height:90px;border-radius:12px;background:${i === 3 ? BM.red : BM.blue}`);
      s += box(`left:${290 + Math.round(f * 600)}px;top:${y + 66}px;font:800 52px 'JetBrains Mono';color:${BM.navy}`, v);
    });
    s += marker(`ouch ↑`, `left:640px;top:1470px;font-size:56px;transform:rotate(-8deg)`);
    s += box(`left:70px;top:1490px`, bmCode());
    return s;
  }
  function bmF3() {
    let s = box(`inset:0;${grid}`);
    s += box(`left:70px;top:150px;font-family:'Archivo Black';font-size:92px;line-height:1;color:${BM.navy}`, `TYPE IT IN:`);
    s += box(`left:90px;right:90px;top:280px;height:1080px;background:${BM.body};border-radius:56px;box-shadow:0 18px 0 #1B1F27`);
    s += box(`left:140px;right:140px;top:330px;height:250px;background:${BM.lcd};border-radius:22px;box-shadow:inset 0 8px 0 rgba(0,0,0,.18);display:flex;align-items:center;justify-content:flex-end;padding-right:50px;font:800 210px 'JetBrains Mono';color:${BM.lcdInk};letter-spacing:12px`, `BAD`);
    const keys = ["A", "B", "C", "D", "E", "F", "7", "8", "9", "4", "5", "6", "1", "2", "3", "="];
    keys.forEach((k, i) => {
      const col = i % 4, row = Math.floor(i / 4), on = k === "B" || k === "A" || k === "D";
      s += box(`left:${150 + col * 200}px;top:${630 + row * 175}px;width:178px;height:150px;border-radius:26px;background:${on ? BM.blue : k === "=" ? BM.red : "#454C5B"};color:#fff;display:flex;align-items:center;justify-content:center;font:800 70px 'JetBrains Mono';box-shadow:0 10px 0 ${on ? "#1C3BB8" : "#20242C"}`, k);
    });
    s += box(`left:70px;right:70px;top:1410px;text-align:center;font:800 40px Inter;color:${BM.navy}`, `Item Shop → Support-A-Creator → <span style="color:${BM.blue}">BAD</span>`);
    s += box(`left:70px;right:70px;top:1470px;text-align:center;font:800 30px 'JetBrains Mono';color:${BM.navy};opacity:.8`, `#EpicPartner`);
    s += marker(`fun fact: BAD is valid hex (= 2989)`, `left:110px;top:1530px;font-size:40px;transform:rotate(-3deg)`);
    return s;
  }
  const bmAvatar = () => box(`inset:0;background:${BM.blue};display:flex;align-items:center;justify-content:center`,
    `<div style="background:${BM.body};border-radius:60px;padding:46px"><div style="background:${BM.lcd};border-radius:26px;padding:36px 46px;font:800 190px 'JetBrains Mono';color:${BM.lcdInk};letter-spacing:6px;box-shadow:inset 0 8px 0 rgba(0,0,0,.18)">BAD</div></div>`);
  function bmBanner() {
    let s = box(`inset:0;${grid}`);
    s += box(`left:0;right:0;top:540px;display:flex;justify-content:center`, `<div style="background:${BM.body};border-radius:50px;padding:34px"><div style="background:${BM.lcd};border-radius:20px;padding:20px 60px;font:800 200px 'JetBrains Mono';color:${BM.lcdInk};box-shadow:inset 0 8px 0 rgba(0,0,0,.18)">BAD×MATH</div></div>`);
    s += box(`left:0;right:0;top:960px;text-align:center;font:800 54px 'JetBrains Mono';color:${BM.navy}`, `The V-Bucks math nobody does for you.`);
    s += marker(`= ?`, `left:1910px;top:560px;font-size:120px;transform:rotate(-10deg)`);
    return s;
  }

  // ======================= C. BAD TYCOON =======================
  const BT = { sky: "#8FD3FF", sky2: "#BDE6FF", grass: "#58C25B", dirt: "#B9773E", coral: "#FF6B57", sun: "#FFD23F", ink: "#1D1B3A", cream: "#FFF8EC" };
  const stroke = (w, c = BT.ink) => `-webkit-text-stroke:${w}px ${c};paint-order:stroke fill`;
  const cloud = (x, y, k = 1) => box(`left:${x}px;top:${y}px;transform:scale(${k});transform-origin:0 0`,
    `<div style="position:absolute;left:0;top:40px;width:260px;height:90px;border-radius:60px;background:#fff"></div><div style="position:absolute;left:50px;top:0;width:120px;height:120px;border-radius:50%;background:#fff"></div><div style="position:absolute;left:130px;top:20px;width:100px;height:100px;border-radius:50%;background:#fff"></div>`);
  const coin = (d, letter = "B") => `<div style="width:${d}px;height:${d}px;border-radius:50%;background:${BT.sun};box-shadow:inset 0 -${d * 0.08}px 0 #E3A91B,0 0 0 ${d * 0.05}px ${BT.ink};display:flex;align-items:center;justify-content:center;font-family:'Lilita One';font-size:${d * 0.62}px;color:${BT.ink};line-height:1">${letter}</div>`;
  function island(w) {
    // floating island with tycoon buildings, drawn in SVG (w = width)
    const h = w * 0.62;
    return `<svg viewBox="0 0 1000 620" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M 80 300 Q 500 200 920 300 L 760 520 Q 600 610 500 600 Q 380 610 250 520 Z" fill="${BT.dirt}" stroke="${BT.ink}" stroke-width="12" stroke-linejoin="round"/>
      <path d="M 120 330 L 300 470 M 880 330 L 700 480 M 500 420 L 500 580" stroke="#8E5527" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="500" cy="290" rx="440" ry="80" fill="${BT.grass}" stroke="${BT.ink}" stroke-width="12"/>
      <rect x="230" y="150" width="140" height="140" rx="10" fill="${BT.coral}" stroke="${BT.ink}" stroke-width="10"/>
      <path d="M 215 160 L 300 95 L 385 160 Z" fill="${BT.cream}" stroke="${BT.ink}" stroke-width="10" stroke-linejoin="round"/>
      <rect x="430" y="70" width="120" height="220" rx="10" fill="${BT.cream}" stroke="${BT.ink}" stroke-width="10"/>
      <rect x="455" y="100" width="30" height="30" fill="${BT.sky}" stroke="${BT.ink}" stroke-width="6"/><rect x="495" y="100" width="30" height="30" fill="${BT.sky}" stroke="${BT.ink}" stroke-width="6"/>
      <rect x="455" y="150" width="30" height="30" fill="${BT.sky}" stroke="${BT.ink}" stroke-width="6"/><rect x="495" y="150" width="30" height="30" fill="${BT.sky}" stroke="${BT.ink}" stroke-width="6"/>
      <rect x="620" y="190" width="170" height="100" rx="10" fill="${BT.sun}" stroke="${BT.ink}" stroke-width="10"/>
      <text x="705" y="262" text-anchor="middle" font-family="Lilita One" font-size="70" fill="${BT.ink}">$</text>
      <circle cx="160" cy="250" r="34" fill="#3FA24A" stroke="${BT.ink}" stroke-width="8"/><circle cx="850" cy="255" r="30" fill="#3FA24A" stroke="${BT.ink}" stroke-width="8"/>
    </svg>`;
  }
  const btLogo = (size) => `<div style="text-align:center;line-height:.86"><div style="font-family:'Lilita One';font-size:${size}px;color:#fff;${stroke(size * 0.09)};letter-spacing:4px">BAD</div><div style="font-family:'Lilita One';font-size:${size * 0.52}px;color:${BT.sun};${stroke(size * 0.06)};letter-spacing:10px">TYCOON</div></div>`;
  const btCode = () => `<span style="display:inline-block;background:${BT.ink};color:${BT.cream};font:900 26px Nunito;padding:10px 20px;border-radius:30px">Support code BAD · #EpicPartner</span>`;
  const sky = () => box(`inset:0;background:linear-gradient(${BT.sky},${BT.sky2})`) + cloud(60, 620, 0.9) + cloud(720, 760, 0.7) + cloud(560, 330, 0.5);

  function btF1() {
    let s = sky();
    s += box(`left:60px;top:140px;display:flex;align-items:center;gap:16px;background:${BT.cream};border:6px solid ${BT.ink};border-radius:50px;padding:8px 30px 8px 10px;font:900 56px Nunito;color:${BT.ink}`, coin(70, "$") + `1,240,000`);
    s += box(`left:640px;top:140px;background:${BT.coral};border:6px solid ${BT.ink};border-radius:50px;padding:10px 34px;font-family:'Lilita One';font-size:62px;color:#fff`, `⏱ 4:12`);
    s += box(`left:62px;top:250px`, btCode());
    s += box(`left:0;right:0;top:330px`, btLogo(220));
    s += box(`left:40px;top:860px`, island(1000));
    s += img("peely", `width:440px;left:320px;top:735px`);
    s += box(`left:70px;right:70px;top:1420px;text-align:center;background:${BT.sun};border:8px solid ${BT.ink};border-radius:40px;padding:18px 0;font-family:'Lilita One';font-size:84px;color:${BT.ink}`, `CAN YOU BEAT 4:12?`);
    return s;
  }
  function btF2() {
    let s = box(`inset:0;background:${BT.cream};background-image:radial-gradient(#E9DFC9 3px,transparent 3px);background-size:40px 40px`);
    s += box(`left:70px;top:150px;font-family:'Lilita One';font-size:170px;line-height:1;color:${BT.coral};${stroke(12)}`, `DEV LOG`);
    s += box(`left:700px;top:330px;transform:rotate(8deg);background:${BT.sun};border:6px solid ${BT.ink};border-radius:20px;padding:6px 26px;font-family:'Lilita One';font-size:64px;color:${BT.ink}`, `DAY 12`);
    s += box(`left:62px;top:345px`, btCode());
    s += box(`left:70px;right:70px;top:450px;height:560px;border:8px solid ${BT.ink};border-radius:36px;background:linear-gradient(${BT.sky},${BT.sky2});overflow:hidden`, `<div style="position:absolute;left:-20px;top:120px">${island(980)}</div>`);
    const items = [["✓", "Money goes up on its own"], ["✓", "Upgrade button works"], ["", "Boss fight"], ["", "Your idea? Comment it ↓"]];
    items.forEach(([c, t], i) => {
      const y = 1060 + i * 110;
      s += box(`left:80px;top:${y}px;width:76px;height:76px;border:7px solid ${BT.ink};border-radius:18px;background:${c ? BT.grass : "#fff"};display:flex;align-items:center;justify-content:center;font:900 54px Nunito;color:#fff`, c);
      s += box(`left:190px;top:${y + 4}px;font:900 54px Nunito;color:${BT.ink}`, t);
    });
    return s;
  }
  function btF3() {
    let s = sky();
    s += box(`left:40px;top:980px;opacity:.9`, island(1000));
    s += box(`inset:0;background:rgba(29,27,58,.45)`);
    s += box(`left:90px;right:90px;top:360px;height:1110px;background:${BT.cream};border:10px solid ${BT.ink};border-radius:48px;box-shadow:0 18px 0 rgba(0,0,0,.25);overflow:hidden`);
    s += box(`left:100px;right:100px;top:370px;height:150px;background:${BT.coral};border-bottom:10px solid ${BT.ink};border-radius:38px 38px 0 0;display:flex;align-items:center;gap:24px;padding-left:40px`, coin(96, "!") + `<span style="font-family:'Lilita One';font-size:96px;color:#fff;${stroke(8)}">TIP</span>`);
    s += box(`left:150px;right:150px;top:560px;font:900 60px/1.15 Nunito;color:${BT.ink}`, `Enjoying Bad Tycoon?<br><span style="font-size:44px">Support the creator:</span>`);
    ["Open the Item Shop", "Pick Support-A-Creator", "Type the code"].forEach((t, i) => {
      s += box(`left:150px;top:${830 + i * 92}px;display:flex;align-items:center;gap:20px;font:900 44px Nunito;color:${BT.ink}`, coin(70, String(i + 1)) + t);
    });
    s += box(`left:230px;right:230px;top:1120px;background:#fff;border:8px solid ${BT.ink};border-radius:26px;text-align:center;font-family:'Lilita One';font-size:150px;line-height:1.2;color:${BT.coral};letter-spacing:12px`, `BAD`);
    s += box(`left:0;right:0;top:1335px;text-align:center;font:900 30px Nunito;color:${BT.ink};opacity:.8`, `#EpicPartner`);
    s += box(`left:330px;right:330px;top:1385px;background:${BT.sun};border:8px solid ${BT.ink};border-radius:40px;text-align:center;font-family:'Lilita One';font-size:56px;color:${BT.ink};padding:6px 0`, `GOT IT`);
    return s;
  }
  const btAvatar = () => box(`inset:0;background:linear-gradient(${BT.sky},${BT.sky2});display:flex;align-items:center;justify-content:center`, coin(560, "B"));
  function btBanner() {
    let s = box(`inset:0;background:linear-gradient(${BT.sky},${BT.sky2})`) + cloud(200, 300, 1.4) + cloud(1900, 420, 1.2) + cloud(1300, 1050, 1);
    s += box(`left:300px;top:560px`, island(760));
    s += img("peely", `width:360px;left:500px;top:438px`);
    s += box(`left:1150px;width:900px;top:470px`, btLogo(230));
    s += box(`left:1150px;width:900px;top:800px;text-align:center;font:900 50px/1.2 Nunito;color:${BT.ink}`, `Building a Fortnite tycoon map<br>in public.`);
    return s;
  }

  // ======================= registry =======================
  const BRANDS = {
    notbad: { f1: nbF1, f2: nbF2, f3: nbF3, avatar: nbAvatar, banner: nbBanner },
    badmath: { f1: bmF1, f2: bmF2, f3: bmF3, avatar: bmAvatar, banner: bmBanner },
    tycoon: { f1: btF1, f2: btF2, f3: btF3, avatar: btAvatar, banner: btBanner },
  };
  const SIZES = { f1: [1080, 1920], f2: [1080, 1920], f3: [1080, 1920], avatar: [800, 800], banner: [2560, 1440] };
  root.PACKS = {
    names: () => Object.keys(BRANDS).flatMap((b) => Object.keys(SIZES).map((k) => `${b}-${k}`)),
    asset: (name) => { const [b, k] = name.split("-"); const [w, h] = SIZES[k]; return [w, h, BRANDS[b][k]()]; },
  };
})(window);
