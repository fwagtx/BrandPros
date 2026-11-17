/* CÓDIGO BAD · profile picture options (1080x1080, circle-safe). window.LOGO picks the variant. */
(function () {
  "use strict";
  const { mk } = window.FX;
  const ART = (n) => `../../../code-bad-packs/art/${n}.png`;
  const LIME = "#EEFF41", INK = "#0B0B0F", YEL = "#FFD21E", GOLD = "#B06A00", CREAM = "#FFF3A6", GREEN = "#0E8A47";
  const FD = "'Barlow Condensed'", INTER = (s, w = 800) => `font-family:Inter;font-weight:${w};font-size:${s}px;line-height:1`;
  const CH = {
    peely: { bg: ["#3DA6FF", "#1A63E6", "#0E2F9E"], s: 2.25, dx: -20, dy: -40 },
    fishstick: { bg: ["#4FD6D0", "#1C7FB4", "#0B3F74"], s: 2.3, dx: -10, dy: -50 },
    raven: { bg: ["#8E5BFF", "#3E1E9A", "#140A3A"], s: 2.3, dx: 0, dy: -40 },
    drift: { bg: ["#FF6BD6", "#B0309A", "#3A0A4F"], s: 2.3, dx: 0, dy: -40 },
    midas: { bg: ["#F2C14E", "#8A5A0C", "#1A1206"], s: 2.3, dx: 0, dy: -40 },
    brite: { bg: ["#FF7AD9", "#7A3BEA", "#2A0F5E"], s: 2.3, dx: 0, dy: -40 },
  };
  function build(stage) {
    const [who, style] = (window.LOGO || "peely-sticker").split("-");
    const c = CH[who];
    mk(stage, `inset:0;background:radial-gradient(circle at 50% 38%,${c.bg[0]},${c.bg[1]} 55%,${c.bg[2]} 100%)`);
    mk(stage, `inset:0;background:linear-gradient(118deg,rgba(255,255,255,.14) 0 24%,transparent 24% 100%)`);
    // character: head in the upper middle, body running off the bottom of the circle
    const W = 1024 * c.s;
    mk(stage, `left:${540 - W / 2 + c.dx}px;top:${c.dy}px;width:${W}px;height:${W}px`, `<img src="${ART(who)}" style="width:${W}px;height:${W}px;filter:drop-shadow(0 30px 30px rgba(0,0,0,.45))">`);
    if (style === "sticker") {
      // the lime sticker from the shorts, across the chest
      mk(stage, `left:0;right:0;top:640px;display:flex;justify-content:center`,
        `<div style="position:relative;transform:rotate(-6deg);background:${LIME};border-radius:34px;padding:22px 54px 16px;box-shadow:0 16px 0 ${INK},0 30px 50px rgba(0,0,0,.45)">
           <div style="${INTER(44)};color:${INK};letter-spacing:-1px">USE O CÓDIGO:</div>
           <div style="font-family:${FD};font-weight:900;font-size:230px;line-height:.86;color:${INK};letter-spacing:2px;margin-top:4px">BAD</div>
           <div style="position:absolute;right:-30px;top:-34px;padding:10px 22px;border-radius:14px;background:${GREEN};color:#fff;font-family:${FD};font-weight:900;font-size:54px;line-height:1;border:5px solid ${INK};transform:rotate(8deg)">BR</div>
         </div>`);
    } else {
      // the family's 3D yellow lettering with the CÓDIGO tag and the BR plate
      const sh = []; for (let i = 1; i <= 16; i++) sh.push(`${(i * 0.35).toFixed(1)}px ${i}px 0 ${GOLD}`); sh.push(`8px 22px 0 ${INK}`, `10px 28px 0 rgba(0,0,0,.35)`);
      mk(stage, `left:0;right:0;top:600px;display:flex;flex-direction:column;align-items:center`,
        `<div style="transform:skewX(-7deg);background:${YEL};border:6px solid ${INK};border-radius:12px;padding:4px 26px;font-family:${FD};font-weight:900;font-size:50px;color:#0E2F9E;letter-spacing:3px;box-shadow:0 6px 0 ${INK};margin-bottom:-14px;position:relative;z-index:2">CÓDIGO</div>
         <div style="position:relative;transform:skewX(-7deg);font-family:${FD};font-weight:900;font-size:330px;line-height:.86;letter-spacing:2px">
           <span style="position:absolute;left:0;top:0;color:${INK};-webkit-text-stroke:26px ${INK};text-shadow:${sh.join(",")}">BAD</span>
           <span style="position:relative;background:linear-gradient(${CREAM} 0 46%,${YEL} 54%);-webkit-background-clip:text;background-clip:text;color:transparent">BAD</span>
         </div>
         <div style="transform:skewX(-7deg);background:${GREEN};border:6px solid ${INK};border-radius:14px;padding:8px 34px;font-family:${FD};font-weight:900;font-size:72px;color:#fff;letter-spacing:4px;box-shadow:0 8px 0 ${INK};margin-top:18px;text-shadow:0 4px 0 #064A25">BR</div>`);
    }
    return function renderAt() {};
  }
  window.SCENE = { duration: 1, build, cues: [], caption: "", claims: [] };
})();
