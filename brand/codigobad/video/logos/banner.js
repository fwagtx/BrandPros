/* CÓDIGO BAD · banners in the Fishstick sticker style. window.BANNER = "yt" (2560x1440, safe 1546x423 centred) or "fb" (1640x624, phone-safe centre 1109px). */
(function () {
  "use strict";
  const { mk } = window.FX;
  const ART = `../../../code-bad-packs/art/fishstick.png`;
  const LIME = "#EEFF41", INK = "#0B0B0F", GREEN = "#0E8A47";
  const FD = "'Barlow Condensed'", INTER = (s, w = 800) => `font-family:Inter;font-weight:${w};font-size:${s}px;line-height:1`;
  function build(stage) {
    const v = window.BANNER || "yt";
    const W = v === "yt" ? 2560 : 1640, H = v === "yt" ? 1440 : 624;
    mk(stage, `inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,#4FD6D0,#1C7FB4 55%,#0B3F74 100%)`);
    mk(stage, `inset:0;background:linear-gradient(118deg,rgba(255,255,255,.12) 0 22%,transparent 22% 100%)`);
    // the content box every platform keeps visible
    const cx = W / 2, cy = H / 2, sw = v === "yt" ? 1546 : 1109, sh = v === "yt" ? 423 : 624;
    const box = mk(stage, `left:${cx - sw / 2}px;top:${cy - sh / 2}px;width:${sw}px;height:${sh}px`);
    const u = v === "yt" ? 1 : 1.0;
    // Fishstick on the left of the box, head inside it, body running out of the bottom
    const A = (v === "yt" ? 1100 : 860) * u;
    mk(stage, `left:${cx - sw / 2 - A * 0.18}px;top:${cy - sh / 2 - A * 0.02}px;width:${A}px;height:${A}px`, `<img src="${ART}" style="width:${A}px;height:${A}px;filter:drop-shadow(0 24px 30px rgba(0,0,0,.4))">`);
    // sticker + lines, right of the character
    const left = v === "yt" ? 430 : 340, top = v === "yt" ? 60 : 130, s = v === "yt" ? 0.88 : 0.6;
    mk(box, `left:${left}px;top:${top}px;transform:scale(${s});transform-origin:0 0`,
      `<div style="display:flex;align-items:flex-end;gap:34px">
         <div style="position:relative;transform:rotate(-5deg);background:${LIME};border-radius:28px;padding:18px 44px 14px;box-shadow:0 12px 0 ${INK},0 26px 40px rgba(0,0,0,.4)">
           <div style="${INTER(36)};color:${INK};letter-spacing:-1px">USE O CÓDIGO:</div>
           <div style="font-family:${FD};font-weight:900;font-size:200px;line-height:.86;color:${INK};letter-spacing:2px;margin-top:4px">BAD</div>
           <div style="position:absolute;right:-26px;top:-28px;padding:8px 18px;border-radius:12px;background:${GREEN};color:#fff;font-family:${FD};font-weight:900;font-size:46px;line-height:1;border:4px solid ${INK};transform:rotate(8deg)">BR</div>
         </div>
         <div style="padding-bottom:14px;white-space:nowrap">
           <div style="display:inline-block;padding:14px 26px;border-radius:16px;background:#fff;color:${INK};${INTER(44)}">Loja do Fortnite, todo dia</div><br>
           <div style="display:inline-block;margin-top:14px;padding:10px 22px;border-radius:14px;background:rgba(10,10,15,.82);color:#fff;${INTER(26)}">loja de itens, mapa e novidades 🇧🇷</div><br>
           <div style="display:inline-block;margin-top:14px;${INTER(24, 400)};color:#fff;opacity:.9">#EpicPartner · canal de fã, sem vínculo com a Epic</div>
         </div>
       </div>`);
    return function renderAt() {};
  }
  window.SCENE = { duration: 1, build, cues: [], caption: "", claims: [] };
})();
