/* BAD ROYALE short templates. A short's scene.js is just a config:  window.SCENE = TPL.guess({...})
 * Every template: hook on screen from frame 1, word-by-word captions, #EpicPartner on screen, the code card on the
 * last voice line. Beats are tied to the voice: "p" is a phrase index in vo.json (P[p].t0 = when it starts).
 *   TPL.guess({ title, rounds: [{id, name, img, rarity, chapter, season}] })      Guess the Season
 *   TPL.map({ title, map, shots, pins, toasts })                                  a place / Easter egg on the map
 *   TPL.news({ kicker, tile, quote: [{p, text}], points: [{p, label, text}] })    an in-game news tile explained
 * Each takes caption and claims too (see make_short.py and the pre-post checklist).
 */
(function (root) {
  "use strict";
  const { k, lerp, E, win, mk, T } = root.FX;
  const S = root.STYLE2;
  const INK = "#0B0D1A", YEL = "#FFD21E", RED = "#FF2D2D";
  const RAR = { common: ["#C2C2C2", "#5E5E5E"], uncommon: ["#8BE33B", "#1C6B10"], rare: ["#5BD0FF", "#1A5BB5"], epic: ["#D27BFF", "#5B1F9C"], legendary: ["#F7AE52", "#8A3B12"],
    gaminglegends: ["#7B6BFF", "#1E1557"], icon: ["#5CF2F3", "#0F6B7A"], marvel: ["#F0473C", "#5A0F0B"], dc: ["#5A84FF", "#14205E"], starwars: ["#3D3D3D", "#0A0A0A"], dark: ["#FF4FD8", "#3A0A4F"], shadow: ["#6E6E6E", "#141414"] };
  // official map: game coordinates -> pixels on the 2048 map image (fitted to the POI data, error < 1 px)
  const mapPx = (w) => ({ x: 0.0066081 * w.x + 976.46, y: 0.0066058 * w.y + 1016.67 });
  const timing = () => { const VO = root.VO, P = VO.phrases; return { VO, P, DUR: Math.round((P[P.length - 1].t1 + 0.7) * 10) / 10 }; };
  const wall = (stage) => {
    mk(stage, `inset:0;background:linear-gradient(160deg,#1D2E8F,#14156B 45%,#2A0F5E)`);
    return mk(stage, `left:-600px;top:0;width:2400px;height:1920px;background:repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 90px,transparent 90px 260px)`);
  };
  const chip = (stage, text, color = YEL, top = 250) => mk(stage, `left:60px;top:${top}px;padding:8px 22px 4px;background:${color};border:5px solid ${INK};border-radius:10px;transform:skewX(-8deg);box-shadow:0 6px 0 ${INK}`,
    `<span style="display:inline-block;font-family:'Barlow Condensed';font-weight:900;font-size:50px;line-height:1;color:${INK};text-transform:uppercase">${text}</span>`, text.toUpperCase());
  function tile(stage, o, w, h) {
    const [a, b] = RAR[o.rarity] || RAR.epic;
    const el = mk(stage, `left:0;top:0;width:${w}px;height:${h}px;border-radius:${w * 0.05}px;overflow:hidden;background:radial-gradient(circle at 50% 30%,${a},${b} 80%);border:${Math.max(5, w * 0.018)}px solid ${INK};box-shadow:0 ${w * 0.03}px 0 rgba(0,0,0,.45);transform-origin:50% 60%`,
      `<div style="position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.18) 0 18%,transparent 18%)"></div>
       <img src="${o.img}" style="position:absolute;left:${-w * 0.2}px;top:${-h * 0.02}px;width:${w * 1.4}px;height:auto">
       <div style="position:absolute;left:0;right:0;bottom:0;padding:${w * 0.05}px ${w * 0.06}px ${w * 0.045}px;background:linear-gradient(transparent,rgba(5,8,22,.92) 30%)">
         <div style="font-family:'Barlow Condensed';font-weight:900;font-size:${Math.min(w * 0.14, (w * 0.86) / (o.name.length * 0.43))}px;line-height:.95;text-transform:uppercase;color:#fff;-webkit-text-stroke:${w * 0.012}px ${INK};paint-order:stroke fill;white-space:nowrap">${o.name}</div>
       </div>`, o.name.toUpperCase());
    return el;
  }
  const end = (stage, VO) => ({ code: S.codeCard(stage, 520), caps: S.captions(stage, VO.words, { y: 1150 }), disc: S.disclosure(stage), fin: S.finish(stage) });

  // ---------------- Guess the Season ----------------
  // voice: [hook, name1, answer1, name2, answer2, ..., "How many did you get?", code line]
  function guess(cfg) {
    const { VO, P, DUR } = timing();
    const R = cfg.rounds, nameP = (i) => P[1 + 2 * i], ansP = (i) => P[2 + 2 * i];
    const outro = P[P.length - 2], codeP = P[P.length - 1];
    function build(stage) {
      const bands = wall(stage);
      const hook = mk(stage, `inset:0`);
      const hookTiles = R.map((o) => tile(hook, o, 250, 360));
      const qs = R.map((_, i) => mk(hook, `left:0;top:0;width:250px;text-align:center;font-family:'Barlow Condensed';font-weight:900;font-size:150px;line-height:1;color:${YEL};-webkit-text-stroke:12px ${INK};paint-order:stroke fill`, "?", "?"));
      const title = S.title(stage, cfg.title || ["Guess the season", "3 skins · no cheating"], { y: 236, size: 66 });
      const rounds = R.map((o, i) => {
        const g = mk(stage, `inset:0`);
        const card = tile(g, o, 500, 680);
        const counter = chip(g, `${i + 1} / ${R.length}`, "#fff");
        const ring = mk(g, `left:810px;top:300px;width:170px;height:170px;border-radius:50%;background:${INK};border:8px solid ${YEL};display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed';font-weight:900;font-size:110px;color:#fff`, "3", "COUNTDOWN");
        const stamp = mk(g, `left:210px;top:1012px;width:660px;text-align:center;padding:10px 0 4px;background:${YEL};border:8px solid ${INK};transform:rotate(-5deg);box-shadow:0 10px 0 ${INK}`,
          `<span style="font-family:'Barlow Condensed';font-weight:900;font-size:70px;line-height:1;color:${INK}">CHAPTER ${o.chapter} · SEASON ${o.season}</span>`, `CHAPTER ${o.chapter} · SEASON ${o.season}`);
        const ask = mk(g, `left:170px;top:1018px;width:740px;text-align:center;font-family:Montserrat;font-weight:900;font-size:64px;color:#fff;-webkit-text-stroke:9px ${INK};paint-order:stroke fill`, "WHICH SEASON?", "WHICH SEASON?");
        return { g, card, counter, ring, stamp, ask };
      });
      const score = S.title(stage, ["How many", "did you get?"], { y: 330, size: 96 });
      const e = end(stage, VO);
      const dim = mk(stage, `inset:0;background:rgba(5,8,25,.55)`);
      stage.appendChild(e.code);
      return function renderAt(t) {
        bands.style.transform = `translateX(${(t * 40) % 260}px)`;
        const r0 = nameP(0).t0 - 0.12;
        const hookOn = t < r0 ? 1 : 1 - k(t, r0, r0 + 0.2);
        T(hook, { a: hookOn });
        hookTiles.forEach((el, i) => T(el, { x: 85 + i * 275, y: 560 + (i === 1 ? -40 : 0), r: (i - 1) * 6, s: E.back(k(t, 0.02 + i * 0.06, 0.3 + i * 0.06)) }));
        qs.forEach((q, i) => T(q, { x: 85 + i * 275, y: 630 + (i === 1 ? -40 : 0), s: E.back(k(t, 0.25 + i * 0.08, 0.5 + i * 0.08)), a: hookOn }));
        T(title, { a: hookOn, s: 1 - 0.06 * k(t, 0, r0) });
        rounds.forEach((r, i) => {
          const tIn = nameP(i).t0 - 0.12, tOut = i < R.length - 1 ? nameP(i + 1).t0 - 0.12 : outro.t0 - 0.1;
          const on = t >= tIn && t < tOut + 0.25;
          const pin = E.out5(k(t, tIn, tIn + 0.28)), pout = E.in(k(t, tOut - 0.05, tOut + 0.2));
          const gx = (1 - pin) * 900 - pout * 900;
          T(r.g, { a: on ? Math.max(0, 1 - Math.abs(gx) / 15) : 0, x: gx });   // visible only within 15 px of rest: never over the app UI
          T(r.card, { x: 290, y: 300, r: -2 + Math.sin(t * 1.3) * 1.2, s: 0.94 + 0.06 * E.back(k(t, tIn, tIn + 0.35)) });
          // countdown in the silence between the name and the answer
          const g0 = nameP(i).t1, g1 = ansP(i).t0, left = Math.max(1, Math.ceil(3 * (1 - k(t, g0, g1))));
          r.ring.textContent = String(left);
          T(r.ring, { a: t >= g0 - 0.1 && t < g1 ? 1 : 0, s: 1 + 0.12 * (1 - k((t - g0) % ((g1 - g0) / 3 || 1), 0, 0.2)) });
          const revealed = t >= ansP(i).t0 - 0.05;
          T(r.ask, { a: revealed ? 0 : 1 });
          T(r.stamp, { a: revealed ? 1 : 0, s: revealed ? 1.15 - 0.15 * E.out(k(t, ansP(i).t0 - 0.05, ansP(i).t0 + 0.18)) : 1.15, r: -5 });
        });
        const sc = win(t, outro.t0 - 0.1, codeP.t0 - 0.05, 0.15, 0.1);
        T(score, { a: sc, s: 0.9 + 0.1 * E.back(k(t, outro.t0 - 0.1, outro.t0 + 0.25)) });
        const codeOn = win(t, codeP.t0 - 0.05, DUR + 1, 0.12, 0.1);
        T(dim, { a: codeOn }); T(e.code, { a: codeOn, s: 0.86 + 0.14 * E.back(k(t, codeP.t0 - 0.05, codeP.t0 + 0.3)) });
        e.caps(t); e.fin(t, R.map((_, i) => ansP(i).t0 - 0.03));
      };
    }
    const cues = [[0.03, "pop"], [0.1, "flip"], [0.16, "flip"], [0.22, "flip"]];
    R.forEach((_, i) => cues.push([nameP(i).t0 - 0.12, "whoosh"], [nameP(i).t1 + 0.05, "tick"], [ansP(i).t0 - 0.03, "reveal"]));
    cues.push([codeP.t0 - 0.05, "notify"]);
    return { duration: DUR, build, cues, caption: cfg.caption, claims: cfg.claims };
  }

  // ---------------- a spot on the map ----------------
  // shots: [{p, dt?, x, y, z, ease?}] camera keyframes (map pixels); pins: [{x, y, p, label, color?}]; toasts: [{p, label, text}]
  function map(cfg) {
    const { VO, P, DUR } = timing();
    const codeP = P[P.length - 1];
    const at = (s) => (s.p === "end" ? DUR : P[s.p].t0 + (s.dt || 0));
    // the camera holds still and only moves in a short whip before each shot, so no frame is a slow blur
    const kf = [];
    cfg.shots.forEach((s, i) => {
      const t = i === 0 ? 0 : at(s);
      if (i > 0) { const [pt, pp, pz] = kf[kf.length - 1]; kf.push([Math.max(pt + 0.01, t - (s.move || 0.6)), pp, pz]); }
      kf.push([t, { x: s.x, y: s.y }, s.z, s.ease || "inOut"]);
    });
    function build(stage) {
      mk(stage, `inset:0;background:#084687`);
      const cam = S.mapCam(stage, `../../badroyale/sources/${cfg.map === "blank" ? "map-blank" : "map-labels"}.png`, kf);
      const shade = mk(stage, `inset:0;background:rgba(5,10,28,.35)`);
      const pins = cfg.pins.map((p, i) => ({ ...p, ring: S.marker(stage, p.r || 70, p.r || 70, p.color || RED, i * 1.9 + 0.7), lab: p.label ? S.scrawl(stage, p.label, p.size || 66, YEL, -7) : null,
        pulse: mk(stage, `left:0;top:0;width:200px;height:200px;border-radius:50%;border:8px solid ${YEL}`) }));
      const dim = mk(stage, `inset:0;background:rgba(5,10,28,.72)`);
      const toasts = (cfg.toasts || []).map((o, i) => ({ ...o, el: S.toast(stage, o.label, o.text, 520 + i * 190, o.color || YEL) }));
      const title = S.title(stage, cfg.title, { y: 236, size: cfg.titleSize || 60 });
      const e = end(stage, VO);
      return function renderAt(t) {
        const { toScreen } = cam.draw(t);
        pins.forEach((p) => {
          const f = toScreen(p), t0 = P[p.p].t0 + (p.dt || 0.2), pr = (t % 1.1) / 1.1;
          T(p.pulse, { x: f.x - 100, y: f.y - 100, s: 0.4 + pr * 0.9, a: t < t0 && t >= P[p.p].t0 - 0.6 ? 1 - pr : 0 });
          p.ring.place(f.x, f.y, t, t0, t >= t0 ? 1 : 0, 1);
          if (p.lab) p.lab.place(f.x + (p.lx ?? 40), f.y + (p.ly ?? 80), t, t0 + 0.15, t >= t0 + 0.15 ? 1 : 0);
        });
        const tOn = toasts.length ? win(t, P[toasts[0].p].t0 - 0.05, codeP.t0, 0.08, 0.12) : 0;
        const codeOn = win(t, codeP.t0 - 0.05, DUR + 1, 0.12, 0.1);
        T(dim, { a: Math.max(tOn, codeOn) });
        toasts.forEach((o) => { const x = (1 - E.out(k(t, P[o.p].t0 - 0.05, P[o.p].t0 + 0.22))) * -700; T(o.el, { a: t >= P[o.p].t0 - 0.05 ? tOn * Math.max(0, 1 - Math.abs(x) / 60) : 0, x }); });
        T(e.code, { a: codeOn, s: 0.86 + 0.14 * E.back(k(t, codeP.t0 - 0.05, codeP.t0 + 0.3)) });
        T(title, { a: 1 - Math.max(tOn, codeOn), s: 0.96 + 0.04 * E.out(k(t, 0, 0.3)) });
        e.caps(t); e.fin(t);
      };
    }
    const cues = [[0.03, "ping"], ...cfg.pins.map((p) => [P[p.p].t0 + (p.dt || 0.2), "marker"]), ...cfg.shots.slice(1).filter((s) => s.p !== "end" && s.whoosh).map((s) => [at(s) - 0.1, "whoosh"]),
      ...(cfg.toasts || []).map((o) => [P[o.p].t0, "notify"]), [codeP.t0 - 0.05, "pop"]];
    return { duration: DUR, build, cues, caption: cfg.caption, claims: cfg.claims };
  }

  // ---------------- an in-game news tile, explained ----------------
  // quote: lines of the tile's own text, each shown from phrase p; points: takeaways as in-game toasts
  function news(cfg) {
    const { VO, P, DUR } = timing();
    const codeP = P[P.length - 1];
    function build(stage) {
      const bands = wall(stage);
      const panel = mk(stage, `left:50px;top:330px;width:860px;border-radius:18px;overflow:hidden;border:6px solid ${INK};box-shadow:0 14px 0 rgba(0,0,0,.4);background:linear-gradient(180deg,#0E1B5C,#0A1240)`,
        `<div style="display:flex;align-items:center;gap:14px;padding:16px 26px;background:${YEL};border-bottom:6px solid ${INK}">
           <span style="font-family:'Barlow Condensed';font-weight:900;font-size:44px;color:${INK}">${cfg.kicker || "IN-GAME NEWS"}</span></div>
         <div style="padding:26px 34px 34px">
           <div style="font-family:Montserrat;font-weight:900;font-size:${cfg.tileSize || 62}px;line-height:1.02;text-transform:uppercase;color:#fff;-webkit-text-stroke:3px ${INK};paint-order:stroke fill">${cfg.tile}</div>
           <div class="q" style="margin-top:22px;min-height:120px"></div></div>`, `${cfg.kicker || "IN-GAME NEWS"} / ${cfg.tile}`.toUpperCase());
      const q = panel.querySelector(".q");
      const lines = cfg.quote.map((l) => { const d = document.createElement("div"); d.style.cssText = `font:700 40px/1.25 Montserrat;color:#C9D6FF;margin-top:10px;opacity:0`; d.textContent = `“${l.text}”`; d.dataset.text = l.text.toUpperCase(); q.appendChild(d); return { ...l, d }; });
      const hook = cfg.hook ? S.title(stage, cfg.hook, { y: 900, size: 78 }) : null;
      const hookEnd = P[cfg.quote[0].p].t0 - 0.1;
      const dim = mk(stage, `inset:0;background:rgba(5,8,25,.75)`);
      const points = (cfg.points || []).map((o, i) => ({ ...o, el: S.toast(stage, o.label, o.text, 480 + i * 190, o.color || YEL) }));
      const e = end(stage, VO);
      return function renderAt(t) {
        bands.style.transform = `translateX(${(t * 40) % 260}px)`;
        T(panel, { y: 0, s: 0.94 + 0.06 * E.out(k(t, 0, 0.3)), r: -0.6 + Math.sin(t * 0.8) * 0.3 });
        if (hook) T(hook, { a: 1 - k(t, hookEnd, hookEnd + 0.2), s: 0.88 + 0.12 * E.out(k(t, 0, 0.3)) });
        lines.forEach((l) => { const on = t >= P[l.p].t0 - 0.05; l.d.style.opacity = on ? 1 : 0; l.d.style.color = on && t < P[l.p].t1 + 0.1 ? "#fff" : "#C9D6FF"; });
        const pOn = points.length ? win(t, P[points[0].p].t0 - 0.05, codeP.t0, 0.08, 0.12) : 0;
        const codeOn = win(t, codeP.t0 - 0.05, DUR + 1, 0.12, 0.1);
        T(dim, { a: Math.max(pOn, codeOn) });
        points.forEach((o) => { const x = (1 - E.out(k(t, P[o.p].t0 - 0.05, P[o.p].t0 + 0.22))) * -700; T(o.el, { a: t >= P[o.p].t0 - 0.05 ? pOn * Math.max(0, 1 - Math.abs(x) / 60) : 0, x }); });
        T(e.code, { a: codeOn, s: 0.86 + 0.14 * E.back(k(t, codeP.t0 - 0.05, codeP.t0 + 0.3)) });
        e.caps(t); e.fin(t);
      };
    }
    const cues = [[0.03, "pop"], ...cfg.quote.map((l) => [P[l.p].t0, "tick"]), ...(cfg.points || []).map((o) => [P[o.p].t0, "notify"]), [codeP.t0 - 0.05, "pop"]];
    return { duration: DUR, build, cues, caption: cfg.caption, claims: cfg.claims };
  }

  root.TPL = { guess, map, news, mapPx };
})(window);
