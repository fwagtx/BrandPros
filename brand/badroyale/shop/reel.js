/* BAD ROYALE · daily Item Shop reel (owner's new look, 2026-11-23). Data: window.SHOP (reel_pick.py), window.SHOP_BASE (image folder).
 * No voice: an original beat-synced track (music.py) carries it, every cut lands on the beat.
 * Layout: USE CODE: BAD sticker top-left (with #EpicPartner) the whole time, a big price counter top-right,
 * one card per offer with rotating fact stickers, a grid of everything, then the creator code typed in.
 */
(function () {
  "use strict";
  const { k, lerp, E, mk, T } = window.FX;
  const D = window.SHOP, BASE = window.SHOP_BASE || `../../badroyale/shop/${D.date}`;
  const IMG = (key) => `${BASE}/img/${key}.png`, BG = (key) => `${BASE}/img/bg_${key}.jpg`;
  const INK = "#0B0D1A", LIME = "#DFFF3B";
  const B = 60 / D.music.bpm;
  const P = D.picks, N = P.length;
  const INTRO = 8, CARD = D.music.card || 8, GRID = 8, CODE = 12;      // fast styles (134+ BPM) get 12-beat cards
  const tCard = (i) => (INTRO + CARD * i) * B;
  const tGrid = tCard(N), tCode = tGrid + GRID * B;
  const DUR = Math.round((tCode + CODE * B) * 100) / 100;
  const FACT_AT = [0.5, 3, 5.5].map((x) => x * CARD / 8);
  const num = (n) => n.toLocaleString("en-US");
  const short = (n) => n.replace(/ Bundle$/i, "");
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const lum = (h) => { const v = parseInt(h, 16); return 0.2126 * (v >> 16) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255); };
  const grad = (p) => { const [a, b] = lum(p.c1) >= lum(p.c2) ? [p.c1, p.c2] : [p.c2, p.c1]; return `radial-gradient(circle at 50% 36%,#${a} 0%,#${b} 88%)`; };
  const font = (w, px) => `font-family:Montserrat;font-weight:${w};font-size:${px}px;`;

  function pill(parent, text, o = {}) {
    const { bg = "#fff", fg = INK, size = 40, top = 0, w = 720, r = -2 } = o;      // 720 wide max: the pop-in overshoot (~10%) stays clear of the button column
    const fs = Math.min(size, Math.floor((w - 60) / (text.length * 0.58)));
    const el = mk(parent, `left:${540 - w / 2}px;width:${w}px;top:${top}px;text-align:center`,
      `<span style="display:inline-block;padding:${fs * 0.2}px ${fs * 0.55}px ${fs * 0.16}px;background:${bg};border-radius:${fs * 0.35}px;${font(800, fs)}line-height:1.15;color:${fg};box-shadow:0 6px 0 rgba(0,0,0,.28);white-space:nowrap">${esc(text)}</span>`);
    el.firstChild.dataset.text = text.toUpperCase();
    el.dataset.r = r;
    return el;
  }

  function build(stage) {
    // ---------- backgrounds: the item's own art, pre-blurred, with a slow push-in ----------
    const bgs = [P[0], ...P, P[0]].map((p) => mk(stage, `left:-140px;top:-160px;width:1360px;height:2240px;background:#${p.c2} url(${BG(p.key)}) center/cover`));
    mk(stage, `inset:0;background:linear-gradient(180deg,rgba(0,0,0,.42),rgba(0,0,0,.08) 30%,rgba(0,0,0,.12) 70%,rgba(0,0,0,.5))`);
    // code section: a dark mosaic of today's art
    const mosaic = mk(stage, `left:-30px;top:-120px;width:1140px;height:2400px;display:grid;grid-template-columns:repeat(4,270px);grid-auto-rows:270px;gap:12px;background:#120A22`,
      Array.from({ length: 36 }, (_, i) => { const p = P[i % N]; return `<div style="background:${grad(p)};border-radius:14px;overflow:hidden"><img src="${IMG(p.key)}" style="width:100%;height:100%;object-fit:cover"></div>`; }).join(""));
    const mosaicDim = mk(stage, `inset:0;background:linear-gradient(180deg,rgba(18,6,40,.78),rgba(10,4,24,.86))`);

    // ---------- intro: today's item shop + three cards ----------
    const intro = mk(stage, `inset:0`);
    const introPill = pill(intro, "today's item shop 🛒", { size: 58, top: 452, r: -2 });
    const heroes = P.slice(0, 3).map((p, i) => {
      const c = mk(intro, `left:${140 + i * 275}px;top:560px;width:250px;height:470px;border-radius:26px;overflow:hidden;background:${grad(p)};box-shadow:0 14px 30px rgba(0,0,0,.4);border:3px solid rgba(255,255,255,.22)`,
        `<img src="${IMG(p.key)}" style="position:absolute;left:-60px;top:40px;width:370px;height:420px;object-fit:contain;object-position:50% 100%">`);
      const chip = mk(c, `left:0;right:0;bottom:16px;text-align:center`, `<span style="display:inline-block;padding:5px 16px 3px;background:${LIME};border-radius:10px;${font(900, 34)}color:${INK}">${num(p.final)}</span>`);
      chip.firstChild.dataset.text = num(p.final);
      return c;
    });
    const offersLine = mk(intro, `left:90px;width:900px;top:1066px;text-align:center;${font(800, 38)}color:#fff;text-shadow:0 3px 8px rgba(0,0,0,.8),0 0 2px #000`, `<span>${num(D.offers)} offers in today's shop</span>`);
    offersLine.firstChild.dataset.text = `${num(D.offers)} OFFERS IN TODAY'S SHOP`;
    const hookLine = pill(intro, D.picks.some((p) => p.tag === "new") ? "here's what's new today 👀" : "here's what's worth knowing 👀", { bg: LIME, size: 48, top: 1060, r: 2 });

    // ---------- one card per offer ----------
    const cards = P.map((p) => {
      const g = mk(stage, `inset:0`);
      const card = mk(g, `left:190px;top:470px;width:700px;height:780px;border-radius:40px;overflow:hidden;background:${grad(p)};box-shadow:0 20px 50px rgba(0,0,0,.45);border:3px solid rgba(255,255,255,.25)`,
        `<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 28%,rgba(255,255,255,.28),transparent 55%)"></div>
         <img src="${IMG(p.key)}" style="position:absolute;left:0;top:30px;width:700px;height:750px;object-fit:contain;object-position:50% 100%">`);
      const art = card.querySelector("img");
      const emoji = mk(g, `left:774px;top:420px;width:130px;height:130px;font-size:104px;line-height:130px;text-align:center`, p.emoji);
      const facts = p.facts.map((f, j) => pill(g, f, { bg: j === 1 ? LIME : "#fff", size: 40, top: 1166, w: 720, r: j % 2 ? 2 : -2 }));
      const nm = short(p.name);
      const big = nm.length <= 15;
      const name = mk(g, `left:190px;width:700px;top:1262px;text-align:center`,
        `<span style="display:inline-block;max-width:700px;padding:6px 30px 4px;background:#fff;border-radius:18px;${font(900, big ? 70 : 54)}line-height:1.08;color:${INK};box-shadow:0 8px 0 rgba(0,0,0,.3);white-space:${big ? "nowrap" : "normal"}">${esc(nm)}</span>`);
      name.firstChild.dataset.text = nm.toUpperCase();
      return { p, g, card, art, emoji, facts, name };
    });

    // ---------- grid: everything, then the ask ----------
    const grid = mk(stage, `inset:0`);
    const ask = pill(grid, "what are you buying? 👇", { size: 54, top: 430, r: -2 });
    const tiles = P.map((p, i) => {
      const c = mk(grid, `left:${105 + (i % 3) * 270}px;top:${525 + Math.floor(i / 3) * 330}px;width:240px;height:300px;border-radius:22px;overflow:hidden;background:${grad(p)};box-shadow:0 10px 24px rgba(0,0,0,.4);border:3px solid rgba(255,255,255,.22)`,
        `<img src="${IMG(p.key)}" style="position:absolute;left:-20px;top:10px;width:280px;height:290px;object-fit:contain;object-position:50% 100%">`);
      const chip = mk(c, `left:0;right:0;bottom:12px;text-align:center`, `<span style="display:inline-block;padding:4px 14px 2px;background:${LIME};border-radius:9px;${font(900, 30)}color:${INK}">${num(p.final)}</span>`);
      chip.firstChild.dataset.text = num(p.final);
      return c;
    });
    const useCode = pill(grid, "use code BAD in the Item Shop 💛", { bg: LIME, size: 44, top: 1200, r: 2 });

    // ---------- the code, typed in ----------
    const code = mk(stage, `inset:0`);
    const panel = mk(code, `left:120px;top:690px;width:760px;height:330px;border-radius:22px;background:rgba(14,16,28,.94);border:3px solid rgba(255,255,255,.14);box-shadow:0 20px 50px rgba(0,0,0,.5)`);
    const head = mk(panel, `left:40px;top:28px;font-family:'Barlow Condensed';font-weight:900;font-size:66px;line-height:1;color:#fff;letter-spacing:1px`, "CREATOR CODE", "CREATOR CODE");
    mk(panel, `left:40px;top:104px;width:680px;height:6px;background:${LIME};border-radius:3px`);
    const field = mk(panel, `left:40px;top:134px;width:680px;height:86px;border-radius:12px;background:#fff`);
    const typed = mk(field, `left:24px;top:12px;${font(900, 56)}line-height:62px;color:${INK}`, "");
    const caret = mk(field, `left:24px;top:16px;width:5px;height:54px;background:${INK}`);
    mk(panel, `left:40px;top:248px;${font(800, 34)}color:#fff`, "#EpicPartner", "#EPICPARTNER");
    const accept = mk(panel, `left:520px;top:236px;width:200px;height:68px;border-radius:14px;background:${LIME};text-align:center;${font(900, 36)}line-height:68px;color:${INK}`, "Accept", "ACCEPT");
    const cursor = mk(code, `left:0;top:0;width:60px;height:80px`, `<svg width="60" height="80" viewBox="0 0 24 32"><path d="M2 2 L2 26 L8 20 L12 30 L16 28 L12 18 L20 18 Z" fill="#fff" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>`);
    const done = mk(code, `left:90px;width:900px;top:760px;text-align:center`,
      `<span style="display:inline-flex;align-items:center;gap:16px;padding:12px 30px 10px;background:${LIME};border-radius:40px;${font(900, 38)}color:${INK};box-shadow:0 8px 0 rgba(0,0,0,.3)"><span style="display:inline-block;width:46px;height:46px;border-radius:50%;background:${INK};color:${LIME};font-size:32px;line-height:46px;text-align:center">✓</span>SUPPORT-A-CREATOR: BAD</span>`);
    done.firstChild.dataset.text = "SUPPORT-A-CREATOR: BAD";
    const thanks = pill(code, "thank you for watching! 💛", { size: 56, top: 930, r: -2 });
    const follow = mk(code, `left:90px;width:900px;top:1040px;text-align:center;${font(900, 46)}color:#fff;-webkit-text-stroke:8px ${INK};paint-order:stroke fill`, "<span>follow for more daily content</span>");
    follow.firstChild.dataset.text = "FOLLOW FOR MORE DAILY CONTENT";

    // ---------- always on: the sticker, the disclosure, the counter ----------
    const sticker = mk(stage, `left:56px;top:190px;padding:12px 26px 4px;background:${LIME};border-radius:20px;box-shadow:0 10px 0 rgba(0,0,0,.3);transform-origin:30% 50%`,
      `<div style="${font(900, 36)}line-height:1;color:${INK}">USE CODE:</div><div style="${font(900, 132)}line-height:.95;letter-spacing:-3px;color:${INK}">BAD</div>`, "USE CODE: BAD");
    const disc = mk(stage, `left:62px;top:388px;${font(800, 28)}color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.9),0 0 2px #000`, "#EpicPartner", "#EPICPARTNER");
    const counter = mk(stage, `right:52px;top:186px;text-align:right;${font(900, 150)}line-height:1;letter-spacing:-3px;color:#fff;-webkit-text-stroke:20px ${INK};paint-order:stroke fill;text-shadow:0 10px 0 rgba(0,0,0,.35);white-space:nowrap;transform-origin:100% 50%`, "", " ");
    const label = mk(stage, `right:56px;top:364px;padding:4px 16px 3px;border-radius:10px;background:rgba(11,13,26,.88);${font(800, 32)}color:#fff;white-space:nowrap`, "", " ");
    const flash = mk(stage, `inset:0;background:#fff;pointer-events:none`);

    const beatPulse = (t) => { const x = (t / B) % 1; return Math.exp(-x * 5); };
    const vis = (el, on) => { el.style.visibility = on ? "visible" : "hidden"; el.style.opacity = on ? 1 : 0; };
    // the counter: rolls from one value to the next in 0.45 s
    const roll = (a, b, t, t0) => Math.round(lerp(a, b, E.out(k(t, t0, t0 + 0.45))));

    return function renderAt(t) {
      const seg = t < tCard(0) ? 0 : t < tGrid ? 1 + Math.floor((t - tCard(0)) / (CARD * B)) : N + 1;
      bgs.forEach((el, i) => {
        const on = i === seg && t < tCode;
        el.style.visibility = on ? "visible" : "hidden";
        const t0 = i === 0 ? 0 : i <= N ? tCard(i - 1) : tGrid;
        el.style.transform = `scale(${1 + 0.06 * k(t, t0, t0 + CARD * B)})`;
      });
      const inCode = t >= tCode;
      vis(mosaic, inCode); vis(mosaicDim, inCode);
      mosaic.style.transform = `translateY(${-90 * k(t, tCode, DUR)}px)`;

      // intro
      vis(intro, t < tCard(0));
      if (t < tCard(0)) {
        T(introPill, { r: -2, s: E.back(k(t, 0, 0.22)) });
        heroes.forEach((c, i) => { const t0 = i * B / 2; T(c, { a: t >= t0 ? 1 : 0, s: E.back(k(t, t0, t0 + 0.25)) * (1 + 0.02 * beatPulse(t)), r: [-4, 0, 4][i], y: lerp(60, 0, E.out(k(t, t0, t0 + 0.25))) }); });
        T(offersLine, { a: t >= B && t < 4 * B ? 1 : 0, y: lerp(20, 0, E.out(k(t, B, B + 0.2))) });
        T(hookLine, { a: t >= 4 * B ? 1 : 0, s: E.back(k(t, 4 * B, 4 * B + 0.22)), r: 2 });
      }

      // cards
      cards.forEach((c, i) => {
        const t0 = tCard(i), t1 = t0 + CARD * B;
        const on = t >= t0 && t < t1;
        vis(c.g, on);
        if (!on) return;
        const pin = E.back(k(t, t0, t0 + 0.3));
        T(c.card, { s: lerp(0.86, 1, pin) * (1 + 0.012 * beatPulse(t)), y: lerp(50, 0, E.out(k(t, t0, t0 + 0.3))), r: lerp(-3, 0, pin) });
        c.art.style.transform = `scale(${1 + 0.05 * k(t, t0, t1)})`;
        const te = t0 + 1.5 * B * CARD / 8;
        T(c.emoji, { a: t >= te ? 1 : 0, s: E.back(k(t, te, te + 0.25)), r: 12 + 6 * Math.sin((t - te) * 6) });
        c.facts.forEach((f, j) => {
          const a = t0 + FACT_AT[j] * B, b = j + 1 < c.facts.length ? t0 + FACT_AT[j + 1] * B : t1;
          T(f, { a: t >= a && t < b ? 1 : 0, s: E.back(k(t, a, a + 0.2)), r: Number(f.dataset.r) });
        });
        T(c.name, { s: E.back(k(t, t0 + 0.08, t0 + 0.32)), r: -2 });
      });

      // grid
      vis(grid, t >= tGrid && t < tCode);
      if (t >= tGrid && t < tCode) {
        T(ask, { s: E.back(k(t, tGrid, tGrid + 0.22)), r: -2 });
        tiles.forEach((c, i) => { const t0 = tGrid + (i + 1) * B / 2; T(c, { a: t >= t0 ? 1 : 0, s: E.back(k(t, t0, t0 + 0.22)) * (1 + 0.02 * beatPulse(t)), r: (i % 2 ? 2 : -2) }); });
        T(useCode, { a: t >= tGrid + 4 * B ? 1 : 0, s: E.back(k(t, tGrid + 4 * B, tGrid + 4 * B + 0.22)), r: 2 });
      }

      // code
      vis(code, inCode);
      if (inCode) {
        const tk = [1, 1.5, 2].map((x) => tCode + x * B), tClick = tCode + 4 * B, tDone = tCode + 5 * B, tThanks = tCode + 6 * B;
        T(panel, { a: t < tDone ? 1 : Math.max(0, 1 - (t - tDone) / 0.15), s: E.back(k(t, tCode, tCode + 0.3)) * (t >= tDone ? lerp(1, 0.9, k(t, tDone, tDone + 0.15)) : 1) });
        const n = tk.filter((x) => t >= x).length;
        typed.textContent = "BAD".slice(0, n);
        typed.dataset.text = n ? "BAD".slice(0, n) : "";
        caret.style.left = `${26 + n * 44}px`;
        caret.style.opacity = Math.floor((t - tCode) / (B / 2)) % 2 ? 0.15 : 1;
        // the cursor glides to Accept and clicks
        const cx = lerp(980, 700, E.inOut(k(t, tCode + 2.4 * B, tClick - 0.05))), cy = lerp(1330, 960, E.inOut(k(t, tCode + 2.4 * B, tClick - 0.05)));
        T(cursor, { x: cx, y: cy, a: t >= tCode + 2.2 * B && t < tDone ? 1 : 0, s: t >= tClick && t < tClick + 0.12 ? 0.85 : 1 });
        T(accept, { s: t >= tClick && t < tClick + 0.12 ? 0.92 : 1 });
        T(done, { a: t >= tDone ? 1 : 0, s: E.back(k(t, tDone, tDone + 0.25)) });
        T(thanks, { a: t >= tThanks ? 1 : 0, s: E.back(k(t, tThanks, tThanks + 0.25)), r: -2 });
        T(follow, { a: t >= tThanks + B ? 1 : 0, y: lerp(24, 0, E.out(k(t, tThanks + B, tThanks + B + 0.25))) });
      }

      // sticker, disclosure: always
      T(sticker, { r: -4 + Math.sin(t * 2.2) * 1.2, s: 1 + 0.035 * beatPulse(t) });
      T(disc, { a: 1 });

      // counter + label
      let txt = "", lab = "", lime = false, pop = 0;
      if (t < tCard(0)) { txt = D.dateLabel; pop = k(t, 0, 0.25); }
      else if (t < tGrid) {
        const i = Math.min(N - 1, Math.floor((t - tCard(0)) / (CARD * B))), p = P[i], t0 = tCard(i);
        const prev = i ? P[i - 1].final : 0;
        if (p.regular > p.final) {
          const td = t0 + 2 * B * CARD / 8;
          if (t < td) { txt = num(roll(prev, p.regular, t, t0)); lab = "regular price"; }
          else { txt = num(roll(p.regular, p.final, t, td)); lab = "V-Bucks today"; lime = true; }
          pop = t < td ? k(t, t0 + 0.4, t0 + 0.6) : k(t, td + 0.4, td + 0.6);
        } else { txt = num(roll(prev, p.final, t, t0)); lab = "V-Bucks"; pop = k(t, t0 + 0.4, t0 + 0.6); }
      }
      counter.textContent = txt;
      counter.dataset.text = txt || " ";
      counter.style.color = lime ? LIME : "#fff";
      T(counter, { a: txt ? 1 : 0, s: 1 + 0.12 * Math.sin(Math.PI * pop) + 0.02 * beatPulse(t) });
      label.textContent = lab;
      label.dataset.text = lab.toUpperCase() || " ";
      T(label, { a: lab ? 1 : 0 });

      // a quick light flash on every cut
      const cuts = [0, ...P.map((_, i) => tCard(i)), tGrid, tCode];
      const fl = cuts.reduce((m, c) => Math.max(m, t >= c ? 1 - k(t, c, c + 0.12) : 0), 0);
      T(flash, { a: fl * 0.32 });
    };
  }

  // ---------- sound: every effect sits on the music's grid ----------
  const cues = [[0, "impact"], [0.01, "pop"], [B / 2, "pop"], [B, "pop"], [4 * B, "sparkle"], [4 * B, "pop"]];
  P.forEach((p, i) => {
    const t0 = tCard(i);
    cues.push([t0, "whoosh"], [t0 + 0.02, "pop"]);
    const rolls = p.regular > p.final ? [t0, t0 + 2 * B * CARD / 8] : [t0];
    rolls.forEach((r) => { for (let j = 0; j < 8; j++) cues.push([r + 0.03 + j * 0.05, "tick"]); cues.push([r + 0.45, "coin"]); });
    cues.push([t0 + 1.5 * B * CARD / 8, "sparkle"]);
    p.facts.forEach((_, j) => { if (j) cues.push([t0 + FACT_AT[j] * B, "pop"]); });
  });
  cues.push([tGrid, "riser"], [tGrid, "impact"], ...P.map((_, i) => [tGrid + (i + 1) * B / 2, "pop"]), [tGrid + 4 * B, "sparkle"]);
  cues.push([tCode, "whoosh_down"], [tCode + B, "key"], [tCode + 1.5 * B, "key"], [tCode + 2 * B, "key"], [tCode + 4 * B, "click"], [tCode + 5 * B, "success"], [tCode + 5 * B, "impact"], [tCode + 6 * B, "sparkle"]);
  cues.sort((a, b) => a[0] - b[0]);

  const lead = P[0];
  const claims = [{ text: `${D.offers} offers in today's shop`, source: "plan.json", match: [`"offers": ${D.offers}`], visual: "entries with cosmetics in shop.json, counted by reel_pick.py" }];
  P.forEach((p) => {
    claims.push({ text: `${p.name}: ${p.final} V-Bucks` + (p.regular > p.final ? `, regular ${p.regular}` : ""), source: "shop.json",
      match: [p.name, `"finalPrice": ${p.final}`, ...(p.regular > p.final ? [`"regularPrice": ${p.regular}`] : [])] });
    claims.push(...p.claims);
  });
  window.SCENE = {
    duration: DUR, build, cues,
    music: { style: D.music.style || "bounce", bpm: D.music.bpm, seed: D.music.seed, hook: D.music.hook || "impact", ...(D.music.lead ? { lead: D.music.lead } : {}),
      ...(D.music.swing !== undefined ? { swing: D.music.swing } : {}), t0: 0, sections: [[0, "intro"], [tCard(0), "main"], [tGrid, "grid"], [tCode, "break"], [tCode + 5 * B, "end"]] },
    caption: `#EpicPartner Today's Fortnite Item Shop (${D.dateLabel}): ${short(lead.name)} for ${num(lead.final)} V-Bucks and ${N - 1} more picks.\nUse code BAD in the Item Shop 💛\n#Fortnite #FortniteItemShop`,
    claims,
  };
})();
