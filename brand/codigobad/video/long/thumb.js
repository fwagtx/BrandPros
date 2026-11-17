(function () {
  "use strict";
  const { mk } = window.FX;
  const L = window.LONG, IMG = (id) => `${L.imgBase}${id}.png`;
  const LIME = "#EEFF41", INK = "#0B0B0F";
  const INTER = (s, w = 800) => `font-family:Inter;font-weight:${w};font-size:${s}px;line-height:1.05`;
  const RAR = { uncommon: ["#7FD95A", "#1E6B16"], rare: ["#59B8FF", "#1B49B8"], epic: ["#C46DFF", "#5A1BA8"], legendary: ["#F5A742", "#9C4A0E"] };
  function build(stage) {
    mk(stage, `inset:0;background:radial-gradient(ellipse 70% 90% at 30% 50%,#7A1A24,#3A0A12 70%,#14060A 130%)`);
    mk(stage, `left:-100px;top:-200px;width:1500px;height:1100px;filter:blur(60px) brightness(.5)`, `<img src="${IMG(L.items[L.items.length - 1].id)}" style="position:absolute;left:600px;top:100px;width:700px">`);
    mk(stage, `left:50px;top:70px;display:inline-block;background:${LIME};border-radius:16px;padding:8px 20px 6px;box-shadow:0 8px 24px rgba(0,0,0,.35)`, `<div style="${INTER(22)};color:${INK}">USE O CÓDIGO:</div><div style="font-family:'Barlow Condensed';font-weight:900;font-size:76px;line-height:.9;color:${INK}">BAD</div>`);
    mk(stage, `left:50px;top:250px;display:inline-block;padding:14px 26px;border-radius:18px;background:#fff;color:${INK};${INTER(92)};box-shadow:0 8px 24px rgba(0,0,0,.35)`, "25 trajes");
    mk(stage, `left:50px;top:385px;display:inline-block;padding:14px 26px;border-radius:18px;background:#fff;color:${INK};${INTER(92)};box-shadow:0 8px 24px rgba(0,0,0,.35)`, "mais OG");
    mk(stage, `left:50px;top:520px;display:inline-block;padding:10px 20px;border-radius:14px;background:rgba(10,10,15,.88);color:#fff;${INTER(34)}`, `da loja de hoje · ${L.date} 👀`);
    [L.items.length - 1, L.items.length - 2, L.items.length - 3].forEach((j, i) => { const it = L.items[j]; const [a, b] = RAR[it.r] || RAR.epic; mk(stage, `left:${700 + i * 190}px;top:${90 + i * 30}px;width:230px;height:560px;border-radius:22px;overflow:hidden;background:radial-gradient(ellipse 80% 60% at 50% 25%,${a},${b} 85%);box-shadow:0 18px 40px rgba(0,0,0,.5);transform:rotate(${[-5, 2, 6][i]}deg)`, `<img src="${IMG(it.id)}" style="position:absolute;left:-30px;top:10px;width:290px;filter:drop-shadow(0 14px 14px rgba(0,0,0,.4))">`); });
    mk(stage, `left:700px;top:640px;display:inline-block;padding:8px 18px;border-radius:12px;background:#fff;color:${INK};${INTER(28)}`, "#1 é do Capítulo 1 ☠");
    return function () {};
  }
  window.SCENE = { duration: 1, build, cues: [], caption: "", claims: [] };
})();
