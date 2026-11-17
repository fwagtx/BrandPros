/* CÓDIGO BAD · long video (1920x1080): "os 25 trajes mais OG da loja de hoje". Pack style with narration: one tile left, facts right. */
(function () {
  "use strict";
  const { k, lerp, E, win, mk, T } = window.FX;
  const L = window.LONG, VO = window.VO, P = VO.phrases;
  const IMG = (id) => `${L.imgBase}${id}.png`;
  const LIME = "#EEFF41", INK = "#0B0B0F", WHITE = "#FFFFFF";
  const INTER = (s, w = 800) => `font-family:Inter;font-weight:${w};font-size:${s}px;line-height:1.15`;
  const RAR = { common: ["#B9BFCC", "#4E5566"], uncommon: ["#7FD95A", "#1E6B16"], rare: ["#59B8FF", "#1B49B8"], epic: ["#C46DFF", "#5A1BA8"], legendary: ["#F5A742", "#9C4A0E"], icon: ["#5FEAF0", "#0E6A7C"], dc: ["#5A84FF", "#14205E"] };
  const rar = (r) => RAR[r] || RAR.epic;
  const num = (n) => n.toLocaleString("pt-BR");
  const N = L.items.length, nameP = (i) => P[2 + 2 * i], factP = (i) => P[3 + 2 * i];
  const qP = P[2 + 2 * N], codeP = P[3 + 2 * N], thanksP = P[4 + 2 * N];
  const DUR = Math.round((P[P.length - 1].t1 + 1.0) * 10) / 10;
  const pill = (parent, css, text, size = 40, bg = WHITE, fg = INK) => mk(parent, `${css};padding:${size * 0.22}px ${size * 0.5}px;border-radius:${size * 0.3}px;background:${bg};color:${fg};${INTER(size)};white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,.25)`, text, text);
  function tile(parent, it, w, h, css = "") {
    const [a, b] = rar(it.r);
    return mk(parent, `left:0;top:0;width:${w}px;height:${h}px;border-radius:${w * 0.06}px;overflow:hidden;background:radial-gradient(ellipse 80% 60% at 50% 25%,${a},${b} 85%);box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 0 0 3px rgba(255,255,255,.18);transform-origin:50% 50%;${css}`,
      `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.16),transparent 40%)"></div><img src="${IMG(it.id)}" style="position:absolute;left:${-w * 0.1}px;top:${h * 0.02}px;width:${w * 1.2}px;filter:drop-shadow(0 14px 14px rgba(0,0,0,.4))">`);
  }
  function build(stage) {
    mk(stage, `inset:0;background:#1A1030`);
    const bgs = L.items.map((it) => { const [a, b] = rar(it.r); const g = mk(stage, `inset:0;background:radial-gradient(ellipse 60% 80% at 35% 50%,${a},${b} 70%,#0A0A14 130%)`); mk(g, `left:-200px;top:-300px;width:2320px;height:1680px;filter:blur(80px) brightness(.6);opacity:.9`, `<img src="${IMG(it.id)}" style="position:absolute;left:300px;top:100px;width:1200px">`); return g; });
    const introBg = mk(stage, `inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,#7A1A24,#3A0A12 70%,#14060A 130%)`);
    mk(introBg, `left:-200px;top:-300px;width:2320px;height:1680px;filter:blur(80px) brightness(.5)`, `<img src="${IMG(L.items[N - 1].id)}" style="position:absolute;left:560px;top:100px;width:1000px">`);
    const endBg = mk(stage, `inset:0;background:#0E0E12`);
    { const g = mk(endBg, `left:-60px;top:-80px;width:2040px;height:1240px;filter:blur(6px) brightness(.45);display:grid;grid-template-columns:repeat(7,1fr);gap:16px;padding:0 20px`);
      for (let i = 0; i < 21; i++) { const it = L.items[i % N]; const [a, b] = rar(it.r); mk(g, `position:relative;height:300px;border-radius:20px;overflow:hidden;background:radial-gradient(ellipse 80% 60% at 50% 25%,${a},${b} 85%)`, `<img src="${IMG(it.id)}" style="position:absolute;left:-26px;top:6px;width:330px">`); } }
    const sticker = mk(stage, `right:60px;top:50px`, `<div style="display:inline-block;background:${LIME};border-radius:18px;padding:10px 24px 8px;box-shadow:0 8px 24px rgba(0,0,0,.35)"><div style="${INTER(26)};color:${INK}">USE O CÓDIGO:</div><div style="font-family:'Barlow Condensed';font-weight:900;font-size:92px;line-height:.9;color:${INK};letter-spacing:1px">BAD</div></div><div style="${INTER(20)};color:${WHITE};margin-top:8px;text-align:right;opacity:.9">#EpicPartner</div>`);
    // intro
    const intro = mk(stage, `inset:0`);
    const i1 = pill(intro, `left:120px;top:300px`, "os 25 trajes mais OG", 72);
    const i2 = pill(intro, `left:120px;top:420px`, `da loja do Fortnite de hoje · ${L.date}`, 36);
    const i3 = pill(intro, `left:120px;top:520px`, "do mais novo pro mais antigo 👀", 30, "rgba(10,10,15,.85)", WHITE);
    const introTiles = [N - 1, N - 2, N - 3, N - 4].map((j, i) => tile(intro, L.items[j], 300, 420, `left:${1120 + i * 180}px;top:${300 + (i % 2) * 40}px;transform:rotate(${[-4, 3, -3, 4][i]}deg)`));
    // items
    const items = L.items.map((it, i) => {
      const g = mk(stage, `inset:0`);
      const card = tile(g, it, 620, 870, `left:200px;top:105px`);
      const numEl = mk(g, `left:900px;top:150px;${INTER(170)};color:${WHITE};-webkit-text-stroke:12px ${INK};paint-order:stroke fill;line-height:1`, `#${it.n}`);
      const name = pill(g, `left:900px;top:360px`, it.name, it.name.length > 22 ? 44 : 56);
      const typeP = pill(g, `left:900px;top:470px`, `traje · ${it.rarityLabel.toLowerCase()}${it.setName ? " · " + it.setName.toLowerCase() : ""}`, 26, "rgba(10,10,15,.88)", WHITE);
      const lan = pill(g, `left:900px;top:560px`, "lançado no", 24, "rgba(10,10,15,.88)", WHITE);
      const season = pill(g, `left:900px;top:616px`, `Capítulo ${it.chapter} · Temporada ${it.season}`, 60);
      const vale = pill(g, `left:900px;top:740px`, "vale", 24, "rgba(10,10,15,.88)", WHITE);
      const price = pill(g, `left:900px;top:796px`, `${num(it.price)} v-bucks`, 54);
      const prog = mk(g, `left:200px;top:1000px;width:620px;height:10px;border-radius:5px;background:rgba(255,255,255,.14);overflow:hidden`, `<div class="f" style="position:absolute;left:0;top:0;bottom:0;width:100%;background:${LIME};transform-origin:0 50%"></div>`);
      return { g, card, numEl, name, typeP, lan, season, vale, price, prog: prog.querySelector(".f"), it };
    });
    // end: question + code box
    const end = mk(stage, `inset:0`);
    const q = pill(end, `left:0;right:0;top:200px;margin:0 auto;width:max-content`, "qual desses você tem no armário? 👇", 54);
    const endTiles = [N - 5, N - 4, N - 3, N - 2, N - 1].map((j, i) => tile(end, L.items[j], 240, 340, `left:${330 + i * 265}px;top:330px;transform:rotate(${[-3, 2, -2, 3, -2][i]}deg)`));
    const endLabels = [N - 5, N - 4, N - 3, N - 2, N - 1].map((j, i) => pill(end, `left:${330 + i * 265}px;top:690px;width:240px;text-align:center`, `#${L.items[j].n} · C${L.items[j].chapter} T${L.items[j].season}`, 20));
    const panel = mk(end, `left:560px;top:760px;width:800px;background:${INK};border-radius:16px;padding:26px 36px 28px;box-shadow:0 20px 50px rgba(0,0,0,.6)`,
      `<div style="font-family:'Barlow Condensed';font-weight:900;font-size:56px;line-height:1;color:#fff;text-transform:uppercase">Código de criador</div><div style="height:5px;background:${LIME};margin:14px 0 18px"></div>
       <div style="height:64px;background:#fff;border:4px solid ${LIME};border-radius:6px;display:flex;align-items:center;padding:0 16px;${INTER(38)};color:${INK};letter-spacing:2px"><span class="typed"></span><span class="caret" style="display:inline-block;width:3px;height:40px;background:${INK};margin-left:3px"></span></div>
       <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px"><div style="${INTER(28, 400)};color:#fff">#EpicPartner · canal de fã, sem vínculo com a Epic</div><div class="accept" style="padding:10px 26px;border-radius:10px;background:${LIME};${INTER(28)};color:${INK}">Aceitar</div></div>`);
    const typed = panel.querySelector(".typed"), caret = panel.querySelector(".caret"), accept = panel.querySelector(".accept");
    const show = (el, on) => { el.style.display = on ? "" : "none"; };
    const tItems = nameP(0).t0 - 0.3, tEnd = qP.t0 - 0.3, wBad = VO.words.find((w) => w.p === 3 + 2 * N && /b[eé]d|bad/i.test(w.w)), tBad = wBad ? wBad.t0 : codeP.t0 + 0.9;
    return function renderAt(t) {
      show(introBg, t < tItems); show(endBg, t >= tEnd);
      T(sticker, { s: lerp(0.6, 1, E.back(k(t, 0.05, 0.45))), r: -3, a: k(t, 0.05, 0.2) });
      const introOn = t < tItems; show(intro, introOn);
      if (introOn) { T(i1, { x: lerp(-80, 0, E.out(k(t, 0.2, 0.6))), a: k(t, 0.2, 0.4) }); T(i2, { x: lerp(-80, 0, E.out(k(t, 0.4, 0.8))), a: k(t, 0.4, 0.6) }); T(i3, { a: k(t, P[1].t0, P[1].t0 + 0.2) }); introTiles.forEach((el, i) => T(el, { s: E.back(k(t, 0.8 + i * 0.12, 1.2 + i * 0.12)), r: [-4, 3, -3, 4][i], a: t >= 0.8 + i * 0.12 ? 1 : 0 })); }
      items.forEach((o, i) => {
        const t0 = nameP(i).t0 - 0.3, t1 = i < N - 1 ? nameP(i + 1).t0 - 0.3 : tEnd, on = t >= t0 && t < t1;
        show(bgs[i], on); show(o.g, on); if (!on) return;
        const d = t - t0, tf = factP(i).t0 - t0, wV = VO.words.find((w) => w.p === 3 + 2 * i && /vi-?baks|v-?bucks/i.test(w.w)), tv = wV ? wV.t0 - t0 : tf + 2.2;
        T(o.card, { s: lerp(0.9, 1, E.back(k(d, 0, 0.5))), a: k(d, 0, 0.2) });
        T(o.numEl, { s: E.back(k(d, 0.1, 0.5)), a: d >= 0.1 ? 1 : 0 });
        T(o.name, { x: lerp(60, 0, E.out(k(d, 0.3, 0.7))), a: k(d, 0.3, 0.5) });
        T(o.typeP, { a: k(d, 0.6, 0.8) });
        T(o.lan, { a: k(d, tf, tf + 0.2) }); T(o.season, { s: lerp(0.85, 1, E.back(k(d, tf + 0.05, tf + 0.4))), a: d >= tf + 0.05 ? 1 : 0 });
        T(o.vale, { a: k(d, tv - 0.3, tv - 0.1) }); T(o.price, { s: lerp(0.85, 1, E.back(k(d, tv - 0.1, tv + 0.3))), a: d >= tv - 0.1 ? 1 : 0 });
        o.prog.style.transform = `scaleX(${1 - k(d, 0, t1 - t0)})`;
      });
      const endOn = t >= tEnd; show(end, endOn);
      if (endOn) {
        const d = t - tEnd;
        T(q, { a: k(d, 0.1, 0.3), y: lerp(-20, 0, E.out(k(d, 0.1, 0.4))) });
        endTiles.forEach((el, i) => T(el, { s: E.back(k(d, 0.4 + i * 0.1, 0.8 + i * 0.1)), r: [-3, 2, -2, 3, -2][i], a: d >= 0.4 + i * 0.1 ? 1 : 0 }));
        endLabels.forEach((el, i) => T(el, { a: k(d, 0.8 + i * 0.1, 1.0 + i * 0.1) }));
        const pc = t >= codeP.t0 - 0.2;
        T(panel, { a: pc ? 1 : 0, s: lerp(0.92, 1, E.out(k(t, codeP.t0 - 0.2, codeP.t0 + 0.2))) });
        const n = t < tBad ? 0 : Math.min(3, 1 + Math.floor((t - tBad) / 0.16));
        typed.textContent = "BAD".slice(0, n); caret.style.opacity = Math.floor(t * 3) % 2 ? 0 : 1;
        const pressed = t >= tBad + 1.0; accept.style.transform = pressed ? "scale(.94)" : "none";
      }
    };
  }
  const cues = [[0.1, "pop"], [0.25, "whoosh"], ...[0, 1, 2, 3].map((i) => [0.85 + i * 0.12, "flip"]),
    ...L.items.flatMap((it, i) => [[nameP(i).t0 - 0.3, "whoosh"], [nameP(i).t0 - 0.15, "pop"], [factP(i).t0 + 0.05, "pop"], [factP(i).t0 + 2.0, "pop"]]),
    [qP.t0 - 0.3, "whoosh"], ...[0, 1, 2, 3, 4].map((i) => [qP.t0 + 0.15 + i * 0.1, "flip"]), [codeP.t0 - 0.2, "tick"], [thanksP.t0 - 0.03, "chime"]];
  window.SCENE = { duration: DUR, build, cues, caption: "", claims: [] };
})();
