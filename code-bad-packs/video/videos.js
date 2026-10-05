/* NOT BAD. — three short vertical videos promoting Support-A-Creator code BAD.
 *  skin   : "PEELY mains"      what your skin says about you (gauges + counter)
 *  roast  : "roast my locker"  viewer locker roast, 3/10, the fish carried
 *  payout : "FIRST PAYOUT"     road to the first $100 payout (progress bar + clock)
 * Every video is driven by renderAt(t): the DOM is built once, then each frame only sets transforms/opacity.
 * Each video lists sound cues; mix.py synthesizes the sounds and lays them under the frames.
 */
(function (root) {
  "use strict";
  const C = { paper: "#F4F0E8", ink: "#141212", red: "#E1262D", blush: "#F2CFC6", stone: "#8C857B", gold: "#F4B728", goldDark: "#C98A0B", green: "#1E9E5A", white: "#FFFFFF" };
  const BODONI = "font-family:'Bodoni Moda';font-weight:900";
  const BODONI_I = "font-family:'Bodoni Moda';font-style:italic;font-weight:700";
  const INTER = (s) => `font:800 ${s}px Inter`;
  const MARKER = "font-family:'Permanent Marker'";
  const ART = (n) => `../art/${n}.png`;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const k = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, x) => a + (b - a) * x;
  const E = {
    out: (x) => 1 - Math.pow(1 - x, 3),
    in: (x) => x * x * x,
    inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    back: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    elastic: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin(((x * 10 - 0.75) * 2 * Math.PI) / 3) + 1),
  };
  const pop = (t, t0, d = 0.35) => E.back(k(t, t0, t0 + d));
  // visible between a and b, with fades
  const win = (t, a, b, fi = 0.15, fo = 0.15) => Math.min(k(t, a, a + fi), 1 - k(t, b - fo, b));
  const shake = (t, t0, dur, amp) => { const p = k(t, t0, t0 + dur); if (p <= 0 || p >= 1) return [0, 0]; const f = (1 - p) * amp; return [Math.sin(t * 97) * f, Math.cos(t * 83) * f]; };
  const punch = (t, t0, amt = 0.25, d = 0.3) => (t < t0 ? 1 : 1 + amt * (1 - E.out(k(t, t0, t0 + d))));

  function mk(parent, css, html = "") { const d = document.createElement("div"); d.style.cssText = "position:absolute;" + css; d.innerHTML = html; parent.appendChild(d); return d; }
  function T(e, o = {}) {
    const { x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, a = 1 } = o;
    e.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${s * sx},${s * sy})`;
    e.style.opacity = a;
    e.style.visibility = a <= 0.001 ? "hidden" : "visible";
  }
  const svg = (w, h, inner, css = "") => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible;${css}">${inner}</svg>`;
  // a stroke that draws itself: set p in [0,1]
  const drawStroke = (path, p) => { const L = path.getTotalLength(); path.style.strokeDasharray = L; path.style.strokeDashoffset = L * (1 - p); };

  // ---------- shared end card: the NOT BAD. garment label drops in on a string and swings ----------
  function endCard(stage) {
    const bg = mk(stage, `inset:0;background:${C.blush}`);
    const sw = mk(stage, `left:0;top:0;width:1080px;height:1200px;transform-origin:540px 0`);
    mk(sw, `left:536px;top:-20px;width:8px;height:640px;background:${C.ink};border-radius:4px`);
    mk(sw, `left:140px;top:560px;width:800px;height:560px;background:#FFFDF8;border:6px solid ${C.ink};border-radius:18px;box-shadow:14px 18px 0 rgba(20,18,18,.18)`,
      `<div style="position:absolute;inset:20px;border:4px dashed ${C.stone};border-radius:10px"></div>
       <div style="position:absolute;left:372px;top:34px;width:44px;height:44px;border-radius:50%;background:${C.blush};border:6px solid ${C.ink}"></div>
       <div style="position:absolute;left:0;right:0;top:118px;text-align:center;${INTER(30)};letter-spacing:12px;color:${C.ink}">SUPPORT-A-CREATOR CODE</div>
       <div style="position:absolute;left:0;right:0;top:150px;text-align:center;${BODONI};font-size:250px;line-height:1.05;letter-spacing:10px;color:${C.red}">BAD</div>
       <div style="position:absolute;left:0;right:0;top:432px;text-align:center;${INTER(30)};color:${C.ink}">Item Shop → Support-A-Creator → BAD</div>
       <div style="position:absolute;left:0;right:0;top:478px;text-align:center;${INTER(26)};letter-spacing:5px;color:${C.stone}">#EpicPartner</div>`);
    const mark = mk(stage, `left:0;width:1080px;top:1210px;text-align:center`,
      `<span style="${BODONI};font-size:120px;letter-spacing:-4px;color:${C.ink}">NOT BAD<span style="color:${C.red}">.</span></span>`);
    return (t, t0) => {
      const on = t >= t0;
      const R = E.out(k(t, t0, t0 + 0.45)) * 1250;
      bg.style.clipPath = `circle(${R}px at 540px 960px)`;
      bg.style.visibility = on ? "visible" : "hidden";
      const dt = t - t0;
      const drop = E.back(k(t, t0 + 0.15, t0 + 0.65));
      const swing = dt > 0.3 ? 9 * Math.exp(-2.6 * (dt - 0.3)) * Math.sin(7 * (dt - 0.3)) : 0;
      T(sw, { y: lerp(-1300, 0, drop), r: swing, a: on ? 1 : 0 });
      T(mark, { y: lerp(40, 0, E.out(k(t, t0 + 0.75, t0 + 1.1))), a: on ? k(t, t0 + 0.75, t0 + 1.0) : 0 });
    };
  }

  // ======================= 1. PEELY mains =======================
  function skin(stage) {
    const bg = mk(stage, `inset:0;background:${C.red}`);
    const paper = mk(stage, `left:0;top:330px;width:1080px;height:1600px;background:${C.paper}`);
    const flash = mk(stage, `inset:0;background:${C.red}`);

    // gauge
    const gauge = mk(stage, `left:90px;top:420px;width:900px;height:640px;transform-origin:50% 75%`);
    let ticks = "";
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * (1 - i / 10), x1 = 450 + Math.cos(a) * 300, y1 = 470 - Math.sin(a) * 300, x2 = 450 + Math.cos(a) * 262, y2 = 470 - Math.sin(a) * 262;
      ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.ink}" stroke-width="${i % 5 ? 6 : 12}" stroke-linecap="round"/>`;
    }
    gauge.innerHTML = svg(900, 520,
      `<path d="M 70 470 A 380 380 0 0 1 830 470" fill="none" stroke="#E2DACB" stroke-width="80"/>
       <path d="M 637 141 A 380 380 0 0 1 830 470" fill="none" stroke="${C.red}" stroke-width="80"/>
       <path d="M 70 470 A 380 380 0 0 1 830 470" fill="none" stroke="${C.ink}" stroke-width="8" transform="translate(0,0)" opacity=".0"/>
       ${ticks}
       <g id="needle"><line x1="450" y1="470" x2="450" y2="150" stroke="${C.ink}" stroke-width="22" stroke-linecap="round"/></g>
       <circle cx="450" cy="470" r="44" fill="${C.red}" stroke="${C.ink}" stroke-width="10"/>`)
      + `<div id="labA" style="position:absolute;left:0;right:0;top:540px;text-align:center;${INTER(92)};letter-spacing:16px;color:${C.ink}">SKILL</div>
         <div id="labB" style="position:absolute;left:0;right:0;top:540px;text-align:center;${INTER(92)};letter-spacing:16px;color:${C.red}">CHAOS</div>`;
    const needle = gauge.querySelector("#needle"), labA = gauge.querySelector("#labA"), labB = gauge.querySelector("#labB");
    const maxStamp = mk(stage, `left:690px;top:400px;border:12px solid ${C.red};color:${C.red};${BODONI};font-size:110px;line-height:1;padding:4px 26px;background:${C.paper}`, `MAX`);

    // emote counter
    const count = mk(stage, `left:0;width:1080px;top:380px;text-align:center;${BODONI};font-size:400px;line-height:1;color:${C.red};transform-origin:50% 60%`, `0`);
    const countLab = mk(stage, `left:0;width:1080px;top:800px;text-align:center;${INTER(56)};letter-spacing:10px;color:${C.ink}`, `EMOTES PER GAME`);

    // tag prompt
    const tag1 = mk(stage, `left:0;width:1080px;top:400px;text-align:center;${BODONI_I};font-size:120px;line-height:1;color:${C.ink}`, `tag a`);
    const tag2 = mk(stage, `left:0;width:1080px;top:520px;text-align:center;${BODONI};font-size:170px;line-height:1;letter-spacing:-4px;color:${C.red}`, `Peely main`);
    const arrow = mk(stage, `left:0;top:0;width:1080px;height:1920px`, svg(1080, 1920,
      `<path id="arw" d="M 760 760 C 980 820 1010 1000 930 1150" fill="none" stroke="${C.ink}" stroke-width="16" stroke-linecap="round"/>
       <path id="arh" d="M 880 1100 L 930 1160 L 985 1105" fill="none" stroke="${C.ink}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`));
    const arw = arrow.querySelector("#arw"), arh = arrow.querySelector("#arh");

    const peely = mk(stage, `left:40px;top:640px;width:1000px;height:1000px;transform-origin:50% 95%`, `<img src="${ART("peely")}" style="width:100%">`);

    // title (on top of everything but the end card)
    const t1 = mk(stage, `left:0;width:1080px;top:230px;text-align:center;transform-origin:50% 0;${BODONI};font-size:250px;line-height:.9;color:#fff;letter-spacing:-6px`, `PEELY`);
    const t2 = mk(stage, `left:0;width:1080px;top:455px;text-align:center;transform-origin:50% 0;${BODONI_I};font-size:150px;line-height:1;color:${C.ink}`, `mains`);

    const end = endCard(stage);
    const DUR = 13.2;

    function needleV(t) {
      if (t < 2.3) return 0;
      if (t < 3.0) return lerp(0, 0.62, E.out(k(t, 2.3, 3.0)));
      if (t < 3.35) return 0.62 + Math.sin(t * 40) * 0.015;
      if (t < 4.9) return lerp(0.62, 0.04, E.elastic(k(t, 3.35, 4.3)));
      if (t < 5.12) return lerp(0.04, 1.12, E.in(k(t, 4.9, 5.12)));
      return 1.12 + Math.sin(t * 55) * 0.03;
    }

    function renderAt(t) {
      // background panel
      T(paper, { y: lerp(1600, 0, E.out(k(t, 1.8, 2.25))) });
      T(flash, { a: t >= 5.12 ? 0.9 * (1 - k(t, 5.12, 5.45)) : 0 });

      // title → header
      const h = E.inOut(k(t, 1.8, 2.25));
      T(t1, { y: lerp(lerp(-400, 0, E.back(k(t, 0.1, 0.5))), -80, h), s: lerp(1, 0.42, h) });
      T(t2, { y: lerp(0, -210, h), s: lerp(pop(t, 0.45, 0.35), 0.52, h) });

      // gauge
      const [gx, gy] = shake(t, 5.12, 1.6, 26);
      T(gauge, { x: gx, y: gy, s: pop(t, 1.95, 0.4), a: win(t, 1.95, 7.3, 0.05, 0.2) });
      needle.setAttribute("transform", `rotate(${-90 + 180 * needleV(t)} 450 470)`);
      const swap = E.inOut(k(t, 4.55, 4.85));
      T(labA, { y: -60 * swap, a: 1 - swap });
      T(labB, { y: 60 * (1 - swap), a: swap });
      T(maxStamp, { s: t < 5.25 ? 0 : lerp(2.6, 1, E.in(k(t, 5.25, 5.45))), r: -12, a: t < 5.25 ? 0 : win(t, 5.25, 7.3, 0.08, 0.2) });

      // emote counter
      const ca = win(t, 7.3, 9.65, 0.1, 0.15);
      count.textContent = String(Math.round(47 * E.out(k(t, 7.5, 9.0))));
      T(count, { s: pop(t, 7.3, 0.35) * punch(t, 9.0, 0.28, 0.35), a: ca });
      T(countLab, { y: lerp(40, 0, E.out(k(t, 7.45, 7.75))), a: ca });

      // tag prompt
      const ta = win(t, 9.65, 11.3, 0.1, 0.1);
      T(tag1, { y: lerp(-60, 0, E.out(k(t, 9.65, 9.95))), a: ta });
      T(tag2, { s: pop(t, 9.85, 0.4), a: ta });
      T(arrow, { a: ta });
      drawStroke(arw, E.out(k(t, 10.05, 10.5)));
      drawStroke(arh, E.out(k(t, 10.45, 10.65)));

      // peely
      const bob = Math.sin(t * 5.5) * 10;
      let x = 0, y = lerp(1300, 0, E.back(k(t, 0.2, 0.75))) + bob, s = 1, r = Math.sin(t * 2.8) * 2;
      const toSide = E.inOut(k(t, 1.8, 2.3)), toMid = E.inOut(k(t, 7.2, 7.6));
      x = lerp(x, -250, toSide); y = lerp(y, 200 + bob, toSide); s = lerp(1, 0.74, toSide);
      if (t > 4.1 && t < 4.9) { r += -6 * E.out(k(t, 4.1, 4.3)) * (1 - k(t, 4.7, 4.9)); } // slump after the skill drop
      if (t >= 5.12 && t < 6.9) { r += Math.sin(t * 50) * 6; } // vibrating with chaos
      x = lerp(x, 0, toMid); s = lerp(s, 0.82, toMid);
      if (t >= 7.2) {
        const dance = k(t, 7.4, 7.6) * (1 - k(t, 9.4, 9.6));
        y = lerp(y, 130, toMid) - Math.abs(Math.sin(t * 7.5)) * 80 * dance;
        r = Math.sin(t * 7.5) * 8 * dance;
      }
      if (t >= 9.6) { const w = k(t, 9.7, 9.9); x = lerp(0, 120, E.inOut(k(t, 9.6, 9.9))); s = lerp(0.82, 0.7, E.inOut(k(t, 9.6, 9.9))); y = 250 + bob; r = Math.sin(t * 9) * 6 * w; }
      T(peely, { x, y, s, r });

      end(t, 11.3);
    }
    const cues = [[0.12, "whoosh"], [0.3, "pop"], [0.55, "slam"], [0.62, "pop"], [1.8, "whoosh"], [1.97, "pop"], [2.3, "rise"], [3.4, "sad"],
      [4.6, "whoosh"], [5.12, "slam"], [5.27, "pop"], [7.25, "whoosh"], ...Array.from({ length: 16 }, (_, i) => [7.5 + i * 0.094, "tick"]), [9.0, "slam"],
      [9.67, "pop"], [9.87, "pop"], [10.08, "whoosh"], [11.3, "whoosh"], [11.75, "ding"]];
    return { renderAt, duration: DUR, cues };
  }

  // ======================= 2. roast my locker =======================
  function roast(stage) {
    const bg = mk(stage, `inset:0;background:${C.ink}`);
    const world = mk(stage, `inset:0`);
    const paper = mk(world, `left:0;top:380px;width:1080px;height:1600px;background:${C.paper}`);

    // locker
    const card = (x, y, w, h, label, inner) => mk(world, `left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:#fff;border:6px solid ${C.ink};border-radius:24px;overflow:hidden;transform-origin:50% 50%`,
      `${inner}<div style="position:absolute;left:22px;top:18px;${INTER(22)};letter-spacing:5px;color:${C.stone}">${label}</div>`);
    const outfit = card(60, 450, 560, 1000, "OUTFIT", `<div style="position:absolute;inset:0;background:${C.blush}"></div><img src="${ART("fishstick")}" style="position:absolute;width:980px;left:-210px;top:30px">`);
    const slots = [
      card(650, 450, 370, 310, "BACK BLING", `<img src="${ART("backbling-shield")}" style="position:absolute;width:250px;left:60px;top:46px">`),
      card(650, 795, 370, 310, "PICKAXE", `<img src="${ART("pickaxe-flamingo")}" style="position:absolute;width:270px;left:50px;top:40px">`),
      card(650, 1140, 370, 310, "GLIDER", `<img src="${ART("glider-rainbow")}" style="position:absolute;width:280px;left:45px;top:40px">`),
    ];
    // marker circles + notes
    const marks = mk(world, `left:0;top:0;width:1080px;height:1920px`, svg(1080, 1920,
      `<path id="m0" d="M 835 470 C 1060 470 1070 760 830 765 C 600 770 610 470 850 462" fill="none" stroke="${C.red}" stroke-width="12" stroke-linecap="round"/>
       <path id="m1" d="M 835 815 C 1060 815 1070 1105 830 1110 C 600 1115 610 815 850 807" fill="none" stroke="${C.red}" stroke-width="12" stroke-linecap="round"/>
       <path id="m2" d="M 835 1160 C 1060 1160 1070 1450 830 1455 C 600 1460 610 1160 850 1152" fill="none" stroke="${C.red}" stroke-width="12" stroke-linecap="round"/>
       <path id="m3" d="M 340 440 C 680 440 690 1460 330 1462 C -20 1464 -10 440 360 432" fill="none" stroke="${C.green}" stroke-width="14" stroke-linecap="round"/>`));
    const mPaths = [0, 1, 2, 3].map((i) => marks.querySelector("#m" + i));
    const notes = [["why", 690, 660, -10], ["flamingo??", 640, 1010, -7], ["nope", 700, 1355, -9]].map(([txt, x, y, r]) =>
      mk(world, `left:${x}px;top:${y}px;${MARKER};font-size:68px;color:${C.red};background:${C.paper};padding:0 14px;border-radius:10px;transform-origin:0 50%;white-space:nowrap`, txt));
    notes.forEach((n, i) => (n.dataset.r = [-10, -7, -9][i]));
    const heart = mk(world, `left:420px;top:470px;width:170px;height:160px;transform-origin:50% 50%`, svg(170, 160,
      `<path d="M85 150 C 20 100 0 70 0 42 C 0 18 20 0 44 0 C 62 0 76 10 85 26 C 94 10 108 0 126 0 C 150 0 170 18 170 42 C 170 70 150 100 85 150 Z" fill="${C.green}" stroke="${C.ink}" stroke-width="8"/>`));

    // comment bubble
    const bubble = mk(stage, `left:90px;top:760px;width:900px;height:220px;background:#fff;border-radius:60px;transform-origin:50% 0;box-shadow:0 14px 0 rgba(0,0,0,.25)`,
      `<div style="position:absolute;left:44px;top:50px;width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#5B8CFF,#FF8A5B)"></div>
       <div style="position:absolute;left:196px;top:42px;${INTER(34)};color:${C.stone}">@sam.builds</div>
       <div id="btxt" style="position:absolute;left:196px;top:86px;${INTER(76)};color:${C.ink};white-space:nowrap"></div>`);
    const btxt = bubble.querySelector("#btxt");
    const LINE = "roast my locker";

    // verdict
    const shade = mk(stage, `inset:0;background:rgba(20,18,18,.78)`);
    const stamp = mk(stage, `left:190px;top:600px;width:700px;text-align:center;border:18px solid ${C.red};border-radius:20px;background:${C.paper};${BODONI};font-size:300px;line-height:1.08;color:${C.red};transform-origin:50% 50%`, `3/10`);
    const sub = mk(stage, `left:0;width:1080px;top:1030px;text-align:center;${BODONI_I};font-size:84px;color:${C.paper}`, `(the fish carried)`);
    const next1 = mk(stage, `left:0;width:1080px;top:600px;text-align:center;${BODONI};font-size:150px;line-height:1;color:${C.paper};letter-spacing:-3px`, `your locker`);
    const next2 = mk(stage, `left:0;width:1080px;top:800px;text-align:center;${BODONI_I};font-size:170px;line-height:1;color:${C.red}`, `next?`);
    const arrow = mk(stage, `left:0;top:0;width:1080px;height:1920px`, svg(1080, 1920,
      `<path id="arw" d="M 760 900 C 980 960 1010 1110 930 1240" fill="none" stroke="${C.paper}" stroke-width="16" stroke-linecap="round"/>
       <path id="arh" d="M 880 1190 L 930 1250 L 985 1195" fill="none" stroke="${C.paper}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`));
    const arw = arrow.querySelector("#arw"), arh = arrow.querySelector("#arh");

    const end = endCard(stage);
    const DUR = 13.8;
    const R0 = [3.0, 4.3, 5.6];

    function renderAt(t) {
      // bubble: types, then parks at the top
      const n = Math.round(LINE.length * k(t, 0.45, 1.05));
      btxt.textContent = LINE.slice(0, n) + (t < 1.3 && Math.floor(t * 4) % 2 === 0 ? "|" : "");
      const park = E.inOut(k(t, 1.55, 1.95));
      T(bubble, { y: lerp(0, -600, park), s: pop(t, 0.12, 0.4) * lerp(1, 0.66, park), a: 1 - k(t, 8.35, 8.5) });

      T(paper, { y: lerp(1600, 0, E.out(k(t, 1.55, 1.95))) });
      const [wx, wy] = shake(t, 8.62, 0.6, 30);
      T(world, { x: wx, y: wy });

      // cards fly in, then each gets roasted
      T(outfit, { y: lerp(1500, 0, E.back(k(t, 1.95, 2.45))), r: lerp(-8, 0, E.out(k(t, 1.95, 2.45))) });
      slots.forEach((c, i) => {
        const t0 = 2.08 + i * 0.13;
        const [sx, sy] = shake(t, R0[i], 0.35, 16);
        T(c, { x: sx, y: lerp(1500, 0, E.back(k(t, t0, t0 + 0.5))) + sy, r: lerp(10, 0, E.out(k(t, t0, t0 + 0.5))) });
        drawStroke(mPaths[i], E.out(k(t, R0[i], R0[i] + 0.35)));
        const nr = Number(notes[i].dataset.r);
        T(notes[i], { s: pop(t, R0[i] + 0.3, 0.3), r: nr, a: t < R0[i] + 0.3 ? 0 : 1 });
      });
      drawStroke(mPaths[3], E.out(k(t, 7.0, 7.45)));
      T(heart, { s: pop(t, 7.35, 0.4) * (1 + 0.06 * Math.sin(t * 10) * k(t, 7.7, 7.8)), a: t < 7.35 ? 0 : 1 });

      // verdict
      T(shade, { a: 0.95 * k(t, 8.45, 8.6) });
      const sa = win(t, 8.6, 10.45, 0.02, 0.15);
      T(stamp, { s: t < 8.6 ? 0 : lerp(3, 1, E.in(k(t, 8.6, 8.8))), r: -8, a: sa });
      T(sub, { y: lerp(30, 0, E.out(k(t, 9.3, 9.6))), a: Math.min(k(t, 9.3, 9.5), 1 - k(t, 10.3, 10.45)) });

      const na = win(t, 10.5, 12.0, 0.1, 0.1);
      T(next1, { y: lerp(-50, 0, E.out(k(t, 10.5, 10.8))), a: na });
      T(next2, { s: pop(t, 10.7, 0.4), a: na });
      T(arrow, { a: na });
      drawStroke(arw, E.out(k(t, 10.95, 11.4)));
      drawStroke(arh, E.out(k(t, 11.35, 11.55)));

      end(t, 12.0);
    }
    const cues = [[0.12, "pop"], ...Array.from({ length: 11 }, (_, i) => [0.47 + i * 0.054, "key"]), [1.55, "whoosh"],
      [2.0, "pop"], [2.13, "pop"], [2.26, "pop"], [2.39, "pop"],
      ...R0.flatMap((r) => [[r, "scribble"], [r + 0.3, "thud"]]), [7.0, "scribble"], [7.35, "coin"],
      [8.45, "whoosh"], [8.62, "slam"], [9.3, "pop"], [10.5, "whoosh"], [10.72, "pop"], [10.95, "whoosh"], [12.0, "whoosh"], [12.45, "ding"]];
    return { renderAt, duration: DUR, cues };
  }

  // ======================= 3. FIRST PAYOUT =======================
  function payout(stage) {
    mk(stage, `inset:0;background:${C.paper}`);
    const tA = mk(stage, `left:0;width:1080px;top:250px;text-align:center;${BODONI};font-size:180px;line-height:1;letter-spacing:-4px;color:${C.ink}`, `FIRST`);
    const tB = mk(stage, `left:0;width:1080px;top:420px;text-align:center;${BODONI};font-size:180px;line-height:1;letter-spacing:-4px;color:${C.red}`, `PAYOUT`);
    const cnt = mk(stage, `left:0;width:1080px;top:650px;text-align:center;${BODONI};font-size:220px;line-height:1;color:${C.ink};transform-origin:50% 60%`, `$0`);

    const bar = mk(stage, `left:90px;top:960px;width:900px;height:150px;transform-origin:50% 50%`,
      `<div style="position:absolute;inset:0;background:#fff;border:10px solid ${C.ink};border-radius:75px;overflow:hidden">
         <div id="fill" style="position:absolute;left:0;top:0;bottom:0;width:0;background:${C.red}"></div>
         <div id="shine" style="position:absolute;top:0;bottom:0;width:180px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)"></div>
       </div>
       <div style="position:absolute;left:10px;top:175px;${INTER(46)};color:${C.stone}">$0</div>
       <div style="position:absolute;right:10px;top:175px;${INTER(46)};color:${C.ink}">$100</div>
       <div style="position:absolute;right:28px;top:-120px">${svg(90, 110,
         `<line x1="8" y1="4" x2="8" y2="108" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>
          <rect x="8" y="6" width="76" height="52" fill="#fff" stroke="${C.ink}" stroke-width="6"/>
          <rect x="8" y="6" width="19" height="13" fill="${C.ink}"/><rect x="46" y="6" width="19" height="13" fill="${C.ink}"/>
          <rect x="27" y="19" width="19" height="13" fill="${C.ink}"/><rect x="65" y="19" width="19" height="13" fill="${C.ink}"/>
          <rect x="8" y="32" width="19" height="13" fill="${C.ink}"/><rect x="46" y="32" width="19" height="13" fill="${C.ink}"/>
          <rect x="27" y="45" width="19" height="13" fill="${C.ink}"/><rect x="65" y="45" width="19" height="13" fill="${C.ink}"/>`)}</div>`);
    const fill = bar.querySelector("#fill"), shine = bar.querySelector("#shine");

    // coins
    const N = 12, GOAL = 41;
    const seed = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const coins = Array.from({ length: N }, (_, i) => {
      const c = mk(stage, `left:0;top:0;width:110px;height:110px;border-radius:50%;background:${C.gold};border:8px solid ${C.ink};box-shadow:inset 0 -10px 0 ${C.goldDark};display:flex;align-items:center;justify-content:center;${BODONI};font-size:70px;color:${C.ink}`, `$`);
      return { el: c, t0: 1.3 + i * 0.26, dur: 0.45, dx: (seed(i) - 0.5) * 520, rot: (seed(i + 40) - 0.5) * 400 };
    });
    const arrive = (c) => c.t0 + c.dur;
    const value = (t) => coins.reduce((v, c) => v + (GOAL / N) * E.out(k(t, arrive(c), arrive(c) + 0.15)), 0);
    const sparks = coins.map(() => mk(stage, `left:0;top:0;width:220px;height:220px`, svg(220, 220,
      Array.from({ length: 8 }, (_, j) => { const a = (j / 8) * Math.PI * 2; return `<line x1="${110 + Math.cos(a) * 40}" y1="${110 + Math.sin(a) * 40}" x2="${110 + Math.cos(a) * 95}" y2="${110 + Math.sin(a) * 95}" stroke="${C.gold}" stroke-width="12" stroke-linecap="round"/>`; }).join(""))));

    // clock
    const clock = mk(stage, `left:110px;top:1200px;width:300px;height:300px;transform-origin:50% 50%`, svg(300, 300,
      `<circle cx="150" cy="150" r="138" fill="#fff" stroke="${C.ink}" stroke-width="14"/>
       ${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<line x1="${150 + Math.sin(a) * 104}" y1="${150 - Math.cos(a) * 104}" x2="${150 + Math.sin(a) * 120}" y2="${150 - Math.cos(a) * 120}" stroke="${C.ink}" stroke-width="${i % 3 ? 5 : 10}" stroke-linecap="round"/>`; }).join("")}
       <g id="hh"><line x1="150" y1="150" x2="150" y2="85" stroke="${C.ink}" stroke-width="14" stroke-linecap="round"/></g>
       <g id="mh"><line x1="150" y1="150" x2="150" y2="48" stroke="${C.red}" stroke-width="9" stroke-linecap="round"/></g>
       <circle cx="150" cy="150" r="14" fill="${C.ink}"/>`));
    const hh = clock.querySelector("#hh"), mh = clock.querySelector("#mh");
    const months = mk(stage, `left:450px;top:1235px;width:600px;white-space:nowrap`, `<div style="${BODONI};font-size:104px;line-height:1;color:${C.ink};letter-spacing:-3px">9 MONTHS</div><div style="${BODONI_I};font-size:96px;line-height:1.1;color:${C.red}">to get there</div>`);

    // help me + typing
    const help = mk(stage, `left:0;width:1080px;top:1205px;text-align:center;${BODONI_I};font-size:88px;color:${C.ink}`, `help me get there`);
    const field = mk(stage, `left:190px;top:1385px;width:700px;height:140px;background:#fff;border:8px solid ${C.ink};border-radius:30px;transform-origin:50% 50%`,
      `<div style="position:absolute;left:30px;top:-46px;${INTER(26)};letter-spacing:6px;color:${C.stone}">SUPPORT-A-CREATOR</div>
       <div id="typed" style="position:absolute;left:40px;top:14px;${INTER(100)};letter-spacing:22px;color:${C.ink}"></div>
       <div id="okc" style="position:absolute;right:22px;top:22px;width:92px;height:92px;border-radius:50%;background:${C.green};border:6px solid ${C.ink};display:flex;align-items:center;justify-content:center">${svg(50, 40, `<path d="M4 20 L19 34 L46 5" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`)}</div>`);
    const typed = field.querySelector("#typed"), okc = field.querySelector("#okc");

    const end = endCard(stage);
    const DUR = 12.4;
    const KEYS = [8.6, 8.9, 9.2];

    function renderAt(t) {
      T(tA, { y: lerp(-500, 0, E.back(k(t, 0.08, 0.5))) });
      T(tB, { y: lerp(-500, 0, E.back(k(t, 0.22, 0.64))) });
      T(bar, { s: pop(t, 0.55, 0.4) });

      const v = value(t);
      cnt.textContent = "$" + Math.round(v);
      const lastHit = coins.map(arrive).filter((a) => a <= t).pop();
      T(cnt, { s: pop(t, 0.7, 0.35) * (lastHit ? punch(t, lastHit, 0.16, 0.22) : 1) });
      fill.style.width = (v / 100) * 880 + "px";
      const shineX = lerp(-200, 1000, k(t, 9.6, 10.2));
      shine.style.left = shineX + "px";

      coins.forEach((c, i) => {
        const p = k(t, c.t0, arrive(c));
        const tx = 90 + ((value(c.t0) + GOAL / N / 2) / 100) * 880 - 55, ty = 980;
        const x = lerp(tx + c.dx, tx, E.out(p)), y = lerp(-180, ty, E.in(p));
        T(c.el, { x, y, r: c.rot * p, sx: Math.cos(t * 9 + i), a: t >= c.t0 && t < arrive(c) ? 1 : 0 });
        const sp = k(t, arrive(c), arrive(c) + 0.3);
        T(sparks[i], { x: tx - 55, y: ty - 55, s: 0.5 + sp * 0.8, a: sp > 0 && sp < 1 ? 1 - sp : 0 });
      });

      // clock
      const ca = win(t, 4.9, 7.7, 0.1, 0.15);
      T(clock, { s: pop(t, 4.9, 0.4), a: ca });
      const spin = Math.max(0, t - 5.1);
      mh.setAttribute("transform", `rotate(${spin * 900} 150 150)`);
      hh.setAttribute("transform", `rotate(${spin * 75} 150 150)`);
      T(months, { x: lerp(60, 0, E.out(k(t, 5.05, 5.4))), a: Math.min(k(t, 5.05, 5.3), 1 - k(t, 7.55, 7.7)) });
      // bar warns while the clock runs
      if (t > 5.3 && t < 7.5) T(bar, { s: 1 + 0.025 * Math.sin((t - 5.3) * 12) });

      // help + typing
      const ha = win(t, 7.8, 10.5, 0.15, 0.1);
      T(help, { y: lerp(40, 0, E.out(k(t, 7.8, 8.1))), a: ha });
      T(field, { s: pop(t, 8.05, 0.4), a: ha });
      const nk = KEYS.filter((kt) => t >= kt).length;
      typed.textContent = "BAD".slice(0, nk) + (t < 9.5 && Math.floor(t * 3) % 2 === 0 ? "|" : "");
      T(okc, { s: pop(t, 9.6, 0.35), a: t < 9.6 ? 0 : 1 });

      end(t, 10.4);
    }
    const cues = [[0.1, "pop"], [0.24, "pop"], [0.55, "pop"], ...coins.map((c) => [arrive(c), "coin"]),
      [4.88, "whoosh"], ...Array.from({ length: 10 }, (_, i) => [5.1 + i * 0.25, "tick"]), [7.8, "whoosh"], [8.07, "pop"],
      ...KEYS.map((kt) => [kt, "key"]), [9.6, "ding"], [10.4, "whoosh"], [10.85, "ding"]];
    return { renderAt, duration: DUR, cues };
  }

  root.VIDEOS = { skin, roast, payout };
})(window);
