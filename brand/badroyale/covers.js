/* BAD ROYALE post covers (1080x1920). One design per post, built for every short-video platform:
 * the hook, art and date sit inside the centre 3:4 area (1080x1440, y 240-1680) that TikTok and Instagram
 * show on the profile grid; the full 9:16 is what Reels, Facebook Reels and Shorts show.
 */
(function () {
  "use strict";
  const { box } = window.ASSETS.lib;
  const { C } = window.BRAND_ROYALE;
  const INK = "#0B0D1A";
  const W = 1080, H = 1920, G0 = 240, G1 = 1680;

  const big = (lines, size, colors = ["#fff", C.yellow]) => lines.map((l, i) =>
    `<div style="font-family:Montserrat;font-weight:900;font-size:${size}px;line-height:.98;letter-spacing:-2px;text-transform:uppercase;color:${colors[i % colors.length]};-webkit-text-stroke:${size * 0.15}px ${INK};paint-order:stroke fill;text-shadow:0 ${size * 0.08}px 0 rgba(0,0,0,.5)">${l}</div>`).join("");
  const mark = () => box(`left:0;right:0;top:${G0 + 30}px;display:flex;justify-content:center;gap:10px;align-items:flex-end`,
    `<div style="background:${C.yellow};border:5px solid ${INK};border-radius:8px;transform:skewX(-7deg);padding:2px 12px;font-family:'Barlow Condensed';font-weight:900;font-size:34px;color:${C.deep}">CODE</div>
     <div style="font-family:'Barlow Condensed';font-weight:900;font-size:70px;line-height:.9;color:${C.yellow};-webkit-text-stroke:7px ${INK};paint-order:stroke fill;transform:skewX(-7deg)">BAD</div>
     <div style="background:${C.deep};border:5px solid ${INK};border-radius:10px;transform:skewX(-7deg);padding:2px 12px;font-family:'Barlow Condensed';font-weight:900;font-size:40px;color:#fff">ROYALE</div>`);
  const chip = (text, top, color = C.yellow) => box(`left:0;right:0;top:${top}px;display:flex;justify-content:center`,
    `<div style="background:${color};border:6px solid ${INK};border-radius:14px;transform:skewX(-8deg) rotate(-3deg);padding:6px 26px 2px;box-shadow:0 8px 0 ${INK};font-family:'Barlow Condensed';font-weight:900;font-size:64px;color:${INK};text-transform:uppercase">${text}</div>`);
  const grain = box(`inset:0;background:radial-gradient(ellipse 85% 70% at 50% 50%,transparent 55%,rgba(0,0,0,.45))`);
  const shopBg = box(`inset:0;background:linear-gradient(160deg,#1D2E8F,#14156B 45%,#2A0F5E)`) + box(`left:-600px;top:0;width:2400px;height:1920px;background:repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 90px,transparent 90px 260px)`);
  // a crop of the official map, centred on (x, y) of the 2048 map, scaled by z
  const mapBg = (x, y, z) => box(`inset:0;background:#084687`) + box(`left:${W / 2 - x * z}px;top:${H / 2 - y * z}px;width:${2048 * z}px;height:${2048 * z}px`,
    `<img src="../../badroyale/sources/map-blank.png" style="width:100%;height:100%">`) + box(`inset:0;background:linear-gradient(rgba(5,10,28,.55),rgba(5,10,28,.1) 35%,rgba(5,10,28,.1) 65%,rgba(5,10,28,.6))`);
  const ring = (x, y, r, color = "#FF2D2D") => box(`left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px;border-radius:50%;border:14px solid ${color};box-shadow:0 0 0 6px ${INK},inset 0 0 0 6px ${INK};transform:rotate(-8deg) scaleX(1.08)`);
  const art = (src, css) => `<img src="${src}" style="position:absolute;${css}">`;

  const COVERS = {
    // daily Item Shop: price math is the hook
    "shop-2026-10-28": () => {
      const d = "../../badroyale/shop/2026-10-28/img/";
      let s = shopBg;
      s += box(`left:-40px;top:520px;width:1160px;height:900px`, art(d + "Character_GuardHence.png", "left:-120px;top:0;width:820px") + art(d + "Character_TearErrand.png", "left:430px;top:40px;width:760px"));
      s += grain + mark();
      s += box(`left:0;right:0;top:${G0 + 150}px;text-align:center`, big(["Today's shop"], 96));
      s += chip("Oct 28", G0 + 270);
      s += box(`left:0;right:0;top:1290px;text-align:center`, `<div style="display:inline-flex;align-items:center;gap:30px">
        <img src="${d}vbuck.png" style="width:120px;height:120px">
        <span style="font-family:'Barlow Condensed';font-weight:900;font-size:190px;line-height:1;color:${C.yellow};-webkit-text-stroke:15px ${INK};paint-order:stroke fill">4,500</span>
        <span style="position:relative;font-family:'Barlow Condensed';font-weight:900;font-size:110px;line-height:1;color:#fff;-webkit-text-stroke:10px ${INK};paint-order:stroke fill">11,000<span style="position:absolute;left:-10px;right:-10px;top:46%;height:18px;background:#FF2D2D;border:4px solid ${INK};border-radius:9px;transform:rotate(-8deg)"></span></span></div>`);
      s += box(`left:0;right:0;top:1500px;text-align:center`, big(["FNAF bundle"], 70, ["#fff"]));
      return s;
    },
    "consoles": () => mapBg(1000, 760, 0.6) + grain + mark() +
      [[636, 693], [1089, 612], [1247, 888], [1420, 1275], [971, 1574], [601, 1448], [473, 1124]].map(([x, y]) => ring(W / 2 + (x - 1000) * 0.6, H / 2 + (y - 760) * 0.6, 40)).join("") +
      box(`left:0;right:0;top:${G0 + 140}px;text-align:center`, big(["All 7 Override", "Consoles"], 104)),
    "pacman": () => mapBg(832, 520, 2.1) + grain + mark() + ring(W / 2, H / 2 - 28 * 2.1 + 60, 230) +
      box(`left:0;right:0;top:${G0 + 150}px;text-align:center`, big(["Hidden", "Pac-Man?"], 150)) +
      box(`left:0;right:0;top:1380px;text-align:center`, big(["2 ghosts are", "missing"], 92, [C.yellow, "#fff"])),
    "freddys": () => mapBg(929, 607, 2.0) + grain + ring(W / 2, H / 2, 150) +
      box(`left:-60px;top:820px;width:640px;height:860px`, art("../../badroyale/shop/2026-10-28/img/Character_GuardHence.png", "left:0;top:0;width:640px")) + mark() +
      box(`left:0;right:0;top:${G0 + 150}px;text-align:center`, big(["Freddy's", "boss spot"], 150)) +
      chip("Always here", 1460, "#FF5A4A"),
  };
  // any day's Item Shop, from that day's plan.js (render with: node render.mjs --pre <day>/plan.js badroyale/shop/cover)
  function shopCover(D) {
    const d = `../../badroyale/shop/${D.date}/img/`, o = D.deal.outfits;
    const day = D.dateLabel.charAt(0) + D.dateLabel.slice(1).toLowerCase();
    const off = D.deal.regular > D.deal.final;
    let s = shopBg;
    s += box(`left:-40px;top:520px;width:1160px;height:900px`, art(d + o[0].id + ".png", "left:-120px;top:0;width:820px") +
      (o.length > 1 ? art(d + o[o.length - 1].id + ".png", "left:430px;top:40px;width:760px") : ""));
    s += grain + mark();
    s += box(`left:0;right:0;top:${G0 + 150}px;text-align:center`, big(["Today's shop"], 96));
    s += chip(day, G0 + 270);
    s += box(`left:0;right:0;top:1290px;text-align:center`, `<div style="display:inline-flex;align-items:center;gap:30px">
        <img src="${d}vbuck.png" style="width:120px;height:120px">
        <span style="font-family:'Barlow Condensed';font-weight:900;font-size:190px;line-height:1;color:${C.yellow};-webkit-text-stroke:15px ${INK};paint-order:stroke fill">${D.deal.final.toLocaleString("en-US")}</span>
        ${off ? `<span style="position:relative;font-family:'Barlow Condensed';font-weight:900;font-size:110px;line-height:1;color:#fff;-webkit-text-stroke:10px ${INK};paint-order:stroke fill">${D.deal.regular.toLocaleString("en-US")}<span style="position:absolute;left:-10px;right:-10px;top:46%;height:18px;background:#FF2D2D;border:4px solid ${INK};border-radius:9px;transform:rotate(-8deg)"></span></span>` : ""}</div>`);
    const name = D.deal.name.replace(/\s+Bundle$/i, " bundle");
    s += box(`left:60px;right:60px;top:1495px;text-align:center`, big([name], Math.max(46, Math.min(70, 1500 / name.length)), ["#fff"]));
    return s;
  }
  const add = {};
  Object.entries(COVERS).forEach(([k, f]) => { add[`badroyale/posts/${k}/cover-1080x1920`] = () => [W, H, f()]; });
  add["badroyale/shop/cover"] = () => [W, H, shopCover(window.SHOP)];
  window.ASSETS.add(add);
})();
