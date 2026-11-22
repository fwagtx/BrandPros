/* CÓDIGO BAD · "tem acesso à Loja Pirata? os 5 mais caros de hoje". Same format as the usecodebad pirate-grabs short:
 * sticker top-left, blurred rarity background, one tile per item, a name pill, a counting price, one fact pill at a time. No captions. */
(function () {
  "use strict";
  const { k, lerp, E, win, mk, T, svg } = window.FX;
  const G = window.GRABS; const IMG = (id) => `${G.imgBase}${id}.png`;
  const LIME = "#EEFF41", INK = "#0B0B0F", WHITE = "#FFFFFF";
  const INTER = (s, w = 800) => `font-family:Inter;font-weight:${w};font-size:${s}px;line-height:1.15`;
  const RAR = { common: ["#B9BFCC", "#4E5566"], uncommon: ["#7FD95A", "#1E6B16"], rare: ["#59B8FF", "#1B49B8"], epic: ["#C46DFF", "#5A1BA8"], legendary: ["#F5A742", "#9C4A0E"], gaminglegends: ["#8E7CFF", "#2A2080"], icon: ["#5FEAF0", "#0E6A7C"], dc: ["#5A84FF", "#14205E"], bundle: ["#FF8A5B", "#7A2A10"] }; const rar = (k) => RAR[k] || RAR.epic;
  const num = (n) => n.toLocaleString("pt-BR");
  const ITEMS = G.items.map((i) => ({ n: i.n, id: i.id, name: i.name, r: i.r, price: i.price, from: i.frm, facts: i.facts, label: i.label }));
  const HOOK = 6, ITEM = 9.2, TEASE = 3.2, RECAP = 6, CODE = 5.5;
  const tItem = (i) => HOOK + i * ITEM + (i === 4 ? TEASE : 0);
  const tTease = HOOK + 4 * ITEM, tRecap = tItem(4) + ITEM, tCode = tRecap + RECAP, DUR = tCode + CODE;

  const pill = (parent, css, text, size = 44, bg = WHITE, fg = INK) => mk(parent, `${css};padding:${size * 0.22}px ${size * 0.5}px;border-radius:${size * 0.3}px;background:${bg};color:${fg};${INTER(size)};white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,.25)`, text, text);
  function tile(parent, it, w, h, css = "") {
    const [a, b] = rar(it.r);
    const el = mk(parent, `left:0;top:0;width:${w}px;height:${h}px;border-radius:${w * 0.07}px;overflow:hidden;background:radial-gradient(ellipse 80% 60% at 50% 25%,${a},${b} 85%);box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 0 0 3px rgba(255,255,255,.18);transform-origin:50% 50%;${css}`,
      `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.16),transparent 40%)"></div>` +
      (it.r === "bundle" ? `<img src="${IMG(it.id)}" style="position:absolute;left:0;top:0;width:${w}px;height:${h}px;object-fit:cover;object-position:50% 20%">` : `<img src="${IMG(it.id)}" style="position:absolute;left:${-w * 0.1}px;top:${h * 0.02}px;width:${w * 1.2}px;filter:drop-shadow(0 14px 14px rgba(0,0,0,.4))">`));
    return el;
  }
  const bgFor = (stage, it) => { const [a, b] = rar(it.r); const g = mk(stage, `inset:0;background:radial-gradient(ellipse 70% 55% at 50% 45%,${a},${b} 70%,#0A0A14 130%)`); const blur = mk(g, `left:-200px;top:-200px;width:1480px;height:2320px;filter:blur(70px) brightness(.65);opacity:.9`, `<img src="${IMG(it.id)}" style="position:absolute;left:140px;top:300px;width:1200px">`); return g; };

  function build(stage) {
    mk(stage, `inset:0;background:#2A0A10`);
    // hook background: blurred bundle art on deep red (like the reference)
    const hookBg = mk(stage, `inset:0;background:radial-gradient(ellipse 70% 55% at 50% 45%,#7A1A24,#3A0A12 70%,#14060A 130%)`);
    mk(hookBg, `left:-200px;top:-200px;width:1480px;height:2320px;filter:blur(80px) brightness(.5)`, `<img src="${IMG(ITEMS[4].id)}" style="position:absolute;left:140px;top:300px;width:1200px">`);
    const itemBgs = ITEMS.map((it) => bgFor(stage, it));
    const teaseBg = mk(stage, `inset:0;background:#0E0E12`);
    const gridBg = mk(stage, `inset:0;background:#0E0E12`);
    { const ids = ITEMS.map((i) => i.id), rs = ITEMS.map((i) => i.r);
      const g = mk(gridBg, `left:-60px;top:-80px;width:1200px;height:2100px;filter:blur(6px) brightness(.45);display:grid;grid-template-columns:repeat(4,1fr);gap:18px;padding:0 20px`);
      for (let i = 0; i < 24; i++) { const j = i % ids.length; const [a, b] = rar(rs[j]); mk(g, `position:relative;height:330px;border-radius:22px;overflow:hidden;background:radial-gradient(ellipse 80% 60% at 50% 25%,${a},${b} 85%)`, `<img src="${IMG(ids[j])}" style="position:absolute;left:-30px;top:6px;width:340px">`); } }

    // the sticker, always on
    const sticker = mk(stage, `left:60px;top:250px`, `<div style="display:inline-block;background:${LIME};border-radius:22px;padding:14px 30px 10px;box-shadow:0 8px 24px rgba(0,0,0,.35)"><div style="${INTER(34)};color:${INK};letter-spacing:-.5px">USE O CÓDIGO:</div><div style="font-family:'Barlow Condensed';font-weight:900;font-size:120px;line-height:.9;color:${INK};letter-spacing:1px;margin-top:2px">BAD</div></div><div style="${INTER(24)};color:${WHITE};margin-top:10px;margin-left:6px;opacity:.9">#EpicPartner</div>`);

    // ---- hook ----
    const hook = mk(stage, `inset:0`);
    const h1 = pill(hook, `left:120px;top:530px`, G.hook[0], 54);
    const h2 = pill(hook, `left:120px;top:630px`, G.hook[1], G.hook[1].length > 28 ? 44 : 54);
    const h3 = pill(hook, `left:120px;top:742px`, G.sub, 26, "rgba(10,10,15,.85)", WHITE);
    const h3b = pill(hook, `left:120px;top:742px`, G.wait, 30, "rgba(10,10,15,.85)", WHITE);
    const spots = [[90, 830], [400, 830], [710, 830], [245, 1150], [555, 1150]];
    const hookTiles = ITEMS.map((it, i) => tile(hook, it, 280, 280, `left:${spots[i][0]}px;top:${spots[i][1]}px`));

    // ---- items ----
    const items = ITEMS.map((it, i) => {
      const g = mk(stage, `inset:0`);
      const numEl = mk(g, `right:60px;top:245px;${INTER(150)};color:${WHITE};-webkit-text-stroke:12px ${INK};paint-order:stroke fill;line-height:1`, `#${it.n}`);
      const name = pill(g, `right:60px;top:410px`, it.name, it.name.length > 34 ? 30 : it.name.length > 18 ? 40 : 46);
      const card = tile(g, it, 640, 900, `left:220px;top:520px`);
      const fact = ITEMS[i].facts.map((f) => pill(g, `left:0;right:0;top:1222px;margin:0 auto;width:max-content`, f, 30, "rgba(10,10,15,.88)", WHITE));
      const worth = pill(g, `left:0;right:0;top:1296px;margin:0 auto;width:max-content`, G.worth || "vale", 26, "rgba(10,10,15,.88)", WHITE);
      const price = pill(g, `left:0;right:0;top:1352px;margin:0 auto;width:max-content`, `${num(it.price)} v-bucks`, 64);
      return { g, numEl, name, card, fact, worth, price, it };
    });
    // ---- teaser before #1 ----
    const tease = mk(stage, `inset:0`);
    const teaseTop = pill(tease, `right:60px;top:270px`, "e o #1 é... 🥁", 46, "rgba(10,10,15,.9)", WHITE);
    const teaseCard = tile(tease, { ...ITEMS[4], r: "shadow" }, 640, 900, `left:220px;top:520px`);
    teaseCard.innerHTML = `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 25%,#8A1420,#2A0A10 85%)"></div><img src="${IMG(ITEMS[4].id)}" style="position:absolute;left:0;top:0;width:640px;height:900px;object-fit:cover;object-position:50% 20%;filter:brightness(0) opacity(.85)"><div style="position:absolute;left:0;right:0;bottom:60px;display:flex;justify-content:center"><div style="padding:8px 20px;border-radius:12px;background:rgba(10,10,15,.88);color:#fff;${INTER(30)}">${G.teaser}</div></div>`;
    // ---- recap ----
    const recap = mk(stage, `inset:0`);
    const rq = pill(recap, `left:0;right:0;top:560px;margin:0 auto;width:max-content`, G.recapQ, 44);
    const order = [3, 4, 1, 0, 2];
    const rTiles = order.map((j, i) => { const it = ITEMS[j]; const w = mk(recap, `left:${spots[i][0]}px;top:${spots[i][1] - 120}px;width:280px`); tile(w, it, 280, 280, "position:relative;left:0;top:0"); pill(w, `left:0;right:0;top:296px;margin:0 auto;width:max-content`, it.label, 20); return w; });
    const rCode = pill(recap, `left:0;right:0;top:1450px;margin:0 auto;width:max-content`, "usa o código BAD na loja de itens 💚", 34, "#7CFF5A", INK);
    // ---- code box ----
    const code = mk(stage, `inset:0`);
    const panel = mk(code, `left:60px;top:700px;width:760px;background:${INK};border-radius:16px;padding:34px 40px 36px;box-shadow:0 20px 50px rgba(0,0,0,.6)`,
      `<div style="font-family:'Barlow Condensed';font-weight:900;font-size:72px;line-height:1;color:#fff;text-transform:uppercase">Código de criador</div>
       <div style="height:5px;background:${LIME};margin:18px 0 26px"></div>
       <div style="height:76px;background:#fff;border:4px solid ${LIME};border-radius:6px;display:flex;align-items:center;padding:0 18px;${INTER(44)};color:${INK};letter-spacing:2px"><span class="typed"></span><span class="caret" style="display:inline-block;width:3px;height:48px;background:${INK};margin-left:3px"></span></div>
       <div style="display:flex;justify-content:space-between;align-items:center;margin-top:22px"><div style="${INTER(36, 400)};color:#fff">#EpicPartner</div><div class="accept" style="padding:12px 30px;border-radius:10px;background:${LIME};${INTER(34)};color:${INK}">Aceitar</div></div>`);
    const typed = panel.querySelector(".typed"), caret = panel.querySelector(".caret"), accept = panel.querySelector(".accept");
    const done = mk(code, `left:0;right:0;top:760px;display:flex;justify-content:center`, `<div style="display:flex;align-items:center;gap:16px;padding:16px 34px;border-radius:40px;background:${LIME};${INTER(40)};color:${INK}"><div style="width:44px;height:44px;border-radius:50%;background:${INK};color:${LIME};display:flex;align-items:center;justify-content:center;font-size:30px">✓</div>APOIE UM CRIADOR: BAD</div>`);
    const doneTag = mk(code, `left:0;right:0;top:860px;text-align:center;${INTER(30, 400)};color:#fff;opacity:.9`, "#EpicPartner");

    const show = (el, on) => { el.style.display = on ? "" : "none"; };
    return function renderAt(t) {
      // backgrounds
      show(hookBg, t < tItem(0)); itemBgs.forEach((b, i) => show(b, t >= tItem(i) && t < (i < 4 ? tItem(i) + ITEM : tRecap) && !(i === 4 && t < tItem(4))));
      show(teaseBg, t >= tTease && t < tItem(4)); show(gridBg, t >= tCode);
      // sticker breathes in
      T(sticker, { s: lerp(0.6, 1, E.back(k(t, 0.05, 0.45))), r: -3, a: k(t, 0.05, 0.2) });
      // hook
      const hookOn = t < tItem(0);
      show(hook, hookOn);
      if (hookOn) {
        T(h1, { x: lerp(-80, 0, E.out(k(t, 0.3, 0.7))), a: k(t, 0.3, 0.5) });
        T(h2, { x: lerp(-80, 0, E.out(k(t, 0.45, 0.85))), a: k(t, 0.45, 0.65) });
        T(h3, { a: win(t, 0.9, 3.6, 0.15, 0.15) }); T(h3b, { a: k(t, 3.7, 3.9), s: lerp(0.8, 1, E.back(k(t, 3.7, 4.0))) });
        hookTiles.forEach((el, i) => T(el, { s: E.back(k(t, 1.1 + i * 0.12, 1.5 + i * 0.12)), r: [-4, 3, -3, 4, -2][i] + Math.sin(t * 1.5 + i) * 0.8, a: t >= 1.1 + i * 0.12 ? 1 : 0 }));
      }
      // items
      items.forEach((o, i) => {
        const t0 = tItem(i), on = t >= t0 && t < t0 + ITEM; show(o.g, on); if (!on) return;
        const d = t - t0;
        T(o.numEl, { s: E.back(k(d, 0.05, 0.4)), a: d >= 0.05 ? 1 : 0 });
        T(o.name, { x: lerp(60, 0, E.out(k(d, 0.25, 0.6))), a: k(d, 0.25, 0.45) });
        T(o.card, { s: lerp(0.86, 1, E.back(k(d, 0.5, 0.95))), a: k(d, 0.5, 0.65), r: Math.sin(d * 0.9) * 0.6 });
        const tw = 1.7, countEnd = tw + 1.3;
        T(o.worth, { a: k(d, tw, tw + 0.2), y: lerp(16, 0, E.out(k(d, tw, tw + 0.3))) });
        const v = Math.round(lerp(o.it.from, o.it.price, E.out(k(d, tw + 0.1, countEnd))));
        o.price.textContent = `${num(v)} v-bucks`;
        T(o.price, { s: (d < tw + 0.1 ? 0.001 : 1) * (1 + 0.1 * (1 - E.out(k(d, countEnd, countEnd + 0.3)))), a: d >= tw + 0.1 ? 1 : 0 });
        o.fact.forEach((f, j) => { const f0 = 3.6 + j * 1.8, f1 = j < o.fact.length - 1 ? 3.6 + (j + 1) * 1.8 : ITEM; T(f, { a: win(d, f0, f1, 0.15, 0.12), s: lerp(0.85, 1, E.back(k(d, f0, f0 + 0.3))) }); });
      });
      // teaser
      const teOn = t >= tTease && t < tItem(4); show(tease, teOn);
      if (teOn) { const d = t - tTease; T(teaseCard, { s: lerp(0.9, 1, E.out(k(d, 0, 0.4))), a: k(d, 0, 0.3) }); T(teaseTop, { a: k(d, 0.5, 0.7), y: lerp(-20, 0, E.out(k(d, 0.5, 0.8))) }); }
      // recap
      const rOn = t >= tRecap && t < tCode; show(recap, rOn);
      if (rOn) { const d = t - tRecap; T(rq, { a: k(d, 0.1, 0.3), y: lerp(-20, 0, E.out(k(d, 0.1, 0.4))) }); rTiles.forEach((el, i) => T(el, { s: E.back(k(d, 0.4 + i * 0.1, 0.8 + i * 0.1)), r: [-4, 3, -3, 4, -2][i], a: d >= 0.4 + i * 0.1 ? 1 : 0 })); T(rCode, { a: k(d, 1.6, 1.8), s: lerp(0.85, 1, E.back(k(d, 1.6, 1.9))) }); }
      // code
      const cOn = t >= tCode; show(code, cOn);
      if (cOn) {
        const d = t - tCode, n = Math.min(3, Math.floor(Math.max(0, d - 0.8) / 0.35)), pressed = d >= 2.4, finished = d >= 3.0;
        T(panel, { a: finished ? 0 : k(d, 0, 0.25), s: lerp(0.92, 1, E.out(k(d, 0, 0.35))) });
        typed.textContent = "BAD".slice(0, n); caret.style.opacity = Math.floor(d * 3) % 2 ? 0 : 1;
        accept.style.transform = pressed ? "scale(.94)" : "none";
        T(done, { a: finished ? 1 : 0, s: lerp(0.8, 1, E.back(k(d, 3.0, 3.4))) }); T(doneTag, { a: finished ? 1 : 0 });
      }
    };
  }
  const cues = [[0.1, "pop"], [0.35, "whoosh"], [0.5, "whoosh"], ...[0, 1, 2, 3, 4].map((i) => [1.15 + i * 0.12, "flip"]), [3.7, "pop"],
    ...ITEMS.flatMap((it, i) => { const t0 = tItem(i); return [[t0, "whoosh"], [t0 + 0.1, "pop"], [t0 + 0.55, "flip"], ...Array.from({ length: 10 }, (_, j) => [t0 + 1.85 + j * 0.12, "tick"]), [t0 + 3.0, "pop"], [t0 + 3.65, "pop"], [t0 + 5.45, "pop"], [t0 + 7.25, "pop"]]; }),
    [tTease, "locked"], [tTease + 0.55, "blips"], [tItem(4), "reveal"], [tRecap, "whoosh"], ...[0, 1, 2, 3, 4].map((i) => [tRecap + 0.45 + i * 0.1, "flip"]), [tRecap + 1.65, "pop"],
    [tCode, "whoosh"], [tCode + 0.8, "tick"], [tCode + 1.15, "tick"], [tCode + 1.5, "tick"], [tCode + 2.4, "pop"], [tCode + 3.0, "chime"]];
  window.SCENE = { duration: DUR, build, cues, caption: "", claims: [] };
})();
