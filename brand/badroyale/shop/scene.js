/* BAD ROYALE · daily Item Shop short. Data: window.SHOP (shop_pick.py), voice timings: window.VO.
 * Beats follow the voice: hook, best deal, OG check, leaving tonight, code.
 */
(function () {
  "use strict";
  const { k, lerp, E, win, mk, T, svg } = window.FX;
  const S = window.STYLE2;
  const D = window.SHOP, VO = window.VO, P = VO.phrases;
  const IMG = (id) => `../../badroyale/shop/${D.date}/img/${id}.png`;
  const INK = "#0B0D1A", YEL = "#FFD21E";
  const DUR = Math.round((P[P.length - 1].t1 + 0.75) * 10) / 10;
  // beat boundaries from the voice
  const b1 = P[2].t0 - 0.12, b2 = P[4].t0 - 0.12, b3 = P[6].t0 - 0.12, b4 = P[7].t0 - 0.1;
  const RAR = { common: ["#C2C2C2", "#5E5E5E"], uncommon: ["#8BE33B", "#1C6B10"], rare: ["#5BD0FF", "#1A5BB5"], epic: ["#D27BFF", "#5B1F9C"], legendary: ["#F7AE52", "#8A3B12"],
    gaminglegends: ["#7B6BFF", "#1E1557"], icon: ["#5CF2F3", "#0F6B7A"], marvel: ["#F0473C", "#5A0F0B"], dc: ["#5A84FF", "#14205E"], starwars: ["#3D3D3D", "#0A0A0A"], slurp: ["#3FE3D2", "#0B5E7A"], dark: ["#FF4FD8", "#3A0A4F"], frozen: ["#C9E9FF", "#4C7FB0"], lava: ["#FF8A2B", "#6E1A06"], shadow: ["#6E6E6E", "#141414"] };
  const rar = (o) => RAR[o.rarityKey] || RAR.epic;
  const vb = (size) => `<img src="../../badroyale/shop/${D.date}/img/vbuck.png" style="display:inline-block;width:${size}px;height:${size}px;vertical-align:-${size * 0.14}px">`;
  const num = (n) => n.toLocaleString("en-US");

  // a shop tile: rarity gradient, featured art, name bar, optional price
  function tile(o, w, h, price = true) {
    const [a, b] = rar(o);
    const el = document.createElement("div");
    el.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;border-radius:${w * 0.05}px;overflow:hidden;background:radial-gradient(circle at 50% 30%,${a},${b} 80%);border:${Math.max(4, w * 0.018)}px solid ${INK};box-shadow:0 ${w * 0.03}px 0 rgba(0,0,0,.45);transform-origin:50% 60%`;
    el.innerHTML = `<div style="position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.18) 0 18%,transparent 18%)"></div>
      <img src="${IMG(o.id)}" style="position:absolute;left:${-w * 0.2}px;top:${-h * 0.02}px;width:${w * 1.4}px;height:auto">
      <div style="position:absolute;left:0;right:0;bottom:0;padding:${w * 0.05}px ${w * 0.06}px ${w * 0.045}px;background:linear-gradient(transparent,rgba(5,8,22,.92) 30%)">
        <div style="font-family:'Barlow Condensed';font-weight:900;font-size:${Math.min(w * 0.13, (w * 0.86) / (o.name.length * 0.43))}px;line-height:.95;text-transform:uppercase;color:#fff;-webkit-text-stroke:${w * 0.012}px ${INK};paint-order:stroke fill;white-space:nowrap">${o.name}</div>
        ${price && o.price ? `<div style="margin-top:${w * 0.02}px;font-family:'Barlow Condensed';font-weight:900;font-size:${w * 0.11}px;color:#fff">${vb(w * 0.11)} ${num(o.price)}</div>` : ""}
      </div>`;
    el.dataset.text = o.name.toUpperCase();
    return el;
  }
  const add = (parent, el, css) => { el.style.cssText += ";" + css; parent.appendChild(el); return el; };
  const chip = (stage, text, color = YEL) => mk(stage, `left:60px;top:250px;padding:8px 22px 4px;background:${color};border:5px solid ${INK};border-radius:10px;transform:skewX(-8deg);box-shadow:0 6px 0 ${INK}`,
    `<span style="display:inline-block;font-family:'Barlow Condensed';font-weight:900;font-size:50px;line-height:1;color:${INK};text-transform:uppercase">${text}</span>`, text.toUpperCase());

  function build(stage) {
    // background: night-blue shop wall with slow diagonal light bands
    mk(stage, `inset:0;background:linear-gradient(160deg,#1D2E8F,#14156B 45%,#2A0F5E)`);
    const bands = mk(stage, `left:-600px;top:0;width:2400px;height:1920px;background:repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 90px,transparent 90px 260px)`);

    // hook: three tiles fanned + date
    const hook = mk(stage, `inset:0`);
    const hookTiles = [D.deal.outfits[0], D.og.outfits[D.og.outfits.length - 1], D.last.outfits[0]].map((o, i) => add(hook, tile(o, 270, 390, false), `left:${68 + i * 282}px;top:${500 + (i === 1 ? -30 : 0)}px`));
    const title = S.title(stage, ["Today's Item Shop", D.dateLabel], { y: 236, size: 74 });

    // beat 1: best deal
    const g1 = mk(stage, `inset:0`);
    const c1 = chip(g1, "1 · Best deal");
    const dealTiles = D.deal.outfits.map((o, i) => add(g1, tile(o, 205, 300, false), `left:${68 + i * 215}px;top:${380 + (i % 2) * 30}px`));
    const priceNew = mk(g1, `left:70px;top:800px;font-family:'Barlow Condensed';font-weight:900;font-size:150px;line-height:1;color:${YEL};-webkit-text-stroke:12px ${INK};paint-order:stroke fill;text-shadow:0 8px 0 ${INK}`, `${vb(120)} ${num(D.deal.final)}`, num(D.deal.final));
    const priceOld = mk(g1, `left:600px;top:832px;font-family:'Barlow Condensed';font-weight:900;font-size:96px;line-height:1;color:#fff;-webkit-text-stroke:9px ${INK};paint-order:stroke fill`, num(D.deal.regular), num(D.deal.regular));
    const strike = mk(g1, `left:585px;top:872px;width:240px;height:16px;background:#FF2D2D;border:4px solid ${INK};border-radius:8px;transform:rotate(-8deg);transform-origin:0 50%`);
    const dealName = mk(g1, `left:70px;top:980px;width:830px;font:800 34px Montserrat;color:#fff;text-transform:uppercase`, `${D.deal.name} · leaves ${D.dealOutLabel}`, `${D.deal.name} · LEAVES ${D.dealOutLabel}`.toUpperCase());

    // beat 2: OG check
    const g2 = mk(stage, `inset:0`);
    const c2 = chip(g2, "2 · OG check");
    const ogTiles = D.og.outfits.map((o, i, a) => add(g2, tile(o, 380, 500), `left:${a.length === 2 ? 90 + i * 430 : 330}px;top:360px`));
    const stamp = mk(g2, `left:150px;top:900px;width:680px;text-align:center;padding:10px 0 4px;background:${YEL};border:8px solid ${INK};transform:rotate(-6deg);box-shadow:0 10px 0 ${INK}`,
      `<span style="font-family:'Barlow Condensed';font-weight:900;font-size:78px;line-height:1;color:${INK}">CHAPTER ${D.og.chapter} · SEASON ${D.og.season}</span>`, `CHAPTER ${D.og.chapter} · SEASON ${D.og.season}`);

    // beat 3: leaving tonight
    const g3 = mk(stage, `inset:0`);
    const c3 = chip(g3, "3 · Leaving tonight", "#FF5A4A");
    const lastTiles = D.last.outfits.slice(0, 6).map((o, i) => add(g3, tile(o, 260, 330), `left:${80 + (i % 3) * 280}px;top:${350 + Math.floor(i / 3) * 350}px`));
    const more = D.last.count > 6 ? mk(g3, `left:700px;top:1045px;padding:6px 20px 2px;background:#fff;border:5px solid ${INK};border-radius:30px;font-family:'Barlow Condensed';font-weight:900;font-size:54px;color:${INK}`, `+${D.last.count - 6} more`, `+${D.last.count - 6} MORE`) : null;
    const resetNote = S.scrawl(g3, `gone at ${D.resetLabel}`, 58, YEL, -5);

    const code = S.codeCard(stage, 520);
    const dim = mk(stage, `inset:0;background:rgba(5,8,25,.55)`);
    stage.appendChild(code);
    const caps = S.captions(stage, VO.words, { y: 1150 });
    S.disclosure(stage);
    const fin = S.finish(stage);

    // a whip between beats: the old group exits left with blur, the new one enters from the right
    const swap = (el, t, tIn, tOut) => {
      const pin = E.out5(k(t, tIn, tIn + 0.28)), pout = E.in(k(t, tOut - 0.22, tOut));
      const x = (1 - pin) * 1100 - pout * 1100, blur = (1 - pin) * 14 + pout * 14;
      el.style.transform = `translateX(${x}px)`;
      el.style.opacity = Math.max(0, 1 - Math.abs(x) / 60);
      el.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
      el.style.visibility = t >= tIn - 0.01 && t < tOut ? "visible" : "hidden";
    };

    return function renderAt(t) {
      bands.style.transform = `translateX(${(t * 40) % 260}px)`;
      // hook
      swap(hook, t, -1, b1);
      hookTiles.forEach((el, i) => T(el, { y: lerp(80, 0, E.out(k(t, i * 0.07, 0.3 + i * 0.07))), s: lerp(0.85, 1, E.back(k(t, i * 0.07, 0.3 + i * 0.07))), a: k(t, i * 0.07, 0.12 + i * 0.07), r: [-3, 0, 3][i] + Math.sin(t * 2 + i) * 0.6 }));
      T(title, { a: t < b1 ? 1 : 0, s: 0.94 + 0.06 * E.out(k(t, 0, 0.3)) });
      // deal
      swap(g1, t, b1, b2);
      dealTiles.forEach((el, i) => T(el, { r: (i - 1.5) * 2, y: lerp(60, 0, E.out(k(t, b1 + i * 0.07, b1 + 0.3 + i * 0.07))) }));
      const tp = P[3].t0;
      T(priceNew, { s: E.back(k(t, tp - 0.05, tp + 0.25)), a: t >= tp - 0.05 ? 1 : 0 });
      const to = VO.words.find((w) => w.p === 3 && /instead/i.test(w.w));
      const tOld = to ? to.t0 : tp + 1.2;
      T(priceOld, { a: t >= tOld ? 1 : 0, s: E.back(k(t, tOld, tOld + 0.2)) });
      strike.style.transform = `rotate(-8deg) scaleX(${E.out(k(t, tOld + 0.45, tOld + 0.7))})`;
      T(dealName, { a: k(t, tp + 0.3, tp + 0.6) });
      // OG
      swap(g2, t, b2, b3);
      ogTiles.forEach((el, i) => T(el, { r: i ? 4 : -4, s: E.back(k(t, b2 + i * 0.12, b2 + 0.35 + i * 0.12)) }));
      const ts = P[5].t0;
      T(stamp, { a: t >= ts ? 1 : 0, s: t < ts ? 0 : 1 + 0.22 * (1 - E.out(k(t, ts, ts + 0.22))), r: -6 });
      // leaving tonight
      swap(g3, t, b3, b4);
      lastTiles.forEach((el, i) => T(el, { s: E.back(k(t, b3 + i * 0.06, b3 + 0.3 + i * 0.06)) }));
      if (more) T(more, { s: E.back(k(t, b3 + 0.5, b3 + 0.75)), a: t >= b3 + 0.5 ? 1 : 0 });
      resetNote.place(90, 1062, t, b3 + 0.7, t >= b3 + 0.7 && t < b4 ? 1 : 0);
      // code
      const codeOn = win(t, b4, DUR + 1, 0.12, 0.1);
      T(dim, { a: codeOn });
      T(code, { a: codeOn, s: 0.86 + 0.14 * E.back(k(t, b4, b4 + 0.3)) });
      caps(t);
      fin(t);
    };
  }

  const cues = [[0.03, "pop"], [0.12, "flip"], [0.2, "flip"], [0.28, "flip"], [b1, "whoosh"], [P[3].t0, "pop"], [b2, "whoosh"], [P[5].t0, "locked"], [b3, "whoosh"],
    ...[0, 1, 2, 3, 4, 5].map((i) => [b3 + 0.05 + i * 0.06, "flip"]), [b4, "notify"]];
  const og = D.og.outfits.map((o) => o.name).join(" and ");
  window.SCENE = {
    duration: DUR, build, cues,
    caption: `#EpicPartner Fortnite Item Shop, ${D.dateLabel.charAt(0) + D.dateLabel.slice(1).toLowerCase()}: the ${D.deal.name} is ${num(D.deal.final)} V-Bucks instead of ${num(D.deal.regular)}, ${og} ${D.og.outfits.length > 1 ? "are" : "is"} in (Chapter ${D.og.chapter}, Season ${D.og.season}), and ${D.last.count} skins leave at ${D.resetLabel}.\nBuying today? Use code BAD in the Item Shop.\n#Fortnite #FortniteItemShop`,
    claims: [
      { text: `${D.deal.name}: ${D.deal.final} V-Bucks, regular ${D.deal.regular}`, source: "shop.json", match: [D.deal.name, `"finalPrice": ${D.deal.final}`, `"regularPrice": ${D.deal.regular}`] },
      { text: `${D.deal.name} leaves ${D.deal.out}`, source: "shop.json", match: [`"outDate": "${D.deal.out}`] },
      ...D.og.outfits.map((o) => ({ text: `${o.name} is in the shop, introduced Chapter ${D.og.chapter}, Season ${D.og.season}`, source: "history.json", match: [o.name, `Introduced in Chapter ${D.og.chapter}, Season ${D.og.season}.`] })),
      { text: `${D.last.count} outfits leave at tonight's reset`, source: "plan.json", match: [`"count": ${D.last.count}`], visual: "Counted from shop.json outDate == shop date (shop_pick.py)" },
      { text: `Reset at ${D.resetLabel}`, source: "plan.json", match: [D.resetLabel], visual: "00:00 UTC converted to America/Chicago" },
    ],
  };
})();
