/* BAD NEWS sample: "There's a Pac-Man hidden on the map" (16.3 s, 9:16).
 * Every claim comes from Epic's official data for v42.40 (see ../sources/manifest.json and SCENE.claims).
 * Map art: official Battle Royale map image (fan content). Everything else is drawn here.
 */
(function () {
  "use strict";
  const { k, lerp, E, pop, win, mk, T, svg, fn } = window.FX;
  const C = { red: "#D7261E", navy: "#0B1530", navy2: "#14244F", white: "#F4F6FA", yellow: "#FFC400", ocean: "#084687", ink: "#070C1C" };
  const MAP = "../../badnews/sources/map-blank.png";
  // visual centers on the 2048 px official map (checked against the image and the POI data)
  const PAC = { x: 832, y: 492 }, BLINKY = { x: 553, y: 1650 }, PINKY = { x: 1262, y: 1612 }, CENTER = { x: 1024, y: 800 };
  const F = { x: 540, y: 880 }; // where the camera target sits on screen
  const DUR = 16.3;

  // camera keyframes: [time, target, zoom]
  const KF = [[0, PAC, 2.3], [2.0, PAC, 2.48], [3.3, { x: 832, y: 560 }, 1.15], [4.3, BLINKY, 1.9], [6.2, BLINKY, 2.05], [7.2, PINKY, 1.9], [8.4, PINKY, 2.0],
    [11.6, PINKY, 2.08], [12.5, CENTER, 0.4], [15.4, CENTER, 0.42], [16.3, PAC, 2.3]];
  function cam(t) {
    let i = 0; while (i < KF.length - 2 && t > KF[i + 1][0]) i++;
    const [t0, a, z0] = KF[i], [t1, b, z1] = KF[i + 1];
    const p = E.inOut(k(t, t0, t1));
    return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), z: Math.exp(lerp(Math.log(z0), Math.log(z1), p)) };
  }
  const toScreen = (pt, c) => ({ x: F.x + (pt.x - c.x) * c.z, y: F.y + (pt.y - c.y) * c.z });

  // map pin: original design (teardrop with ring), label pill above
  function pin(stage, label) {
    const g = mk(stage, `left:0;top:0;width:0;height:0`);
    const ring = mk(g, `left:-70px;top:-26px;width:140px;height:52px;border-radius:50%;border:6px solid ${C.yellow}`);
    const body = mk(g, `left:-38px;top:-104px;width:76px;height:104px;transform-origin:50% 100%`, svg(76, 104,
      `<path d="M38 100 C 30 82 6 62 6 38 A 32 32 0 0 1 70 38 C 70 62 46 82 38 100 Z" fill="${C.yellow}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
       <circle cx="38" cy="38" r="13" fill="${C.ink}"/>`));
    const tag = mk(g, `left:0;top:-178px;transform-origin:0 100%`, `<div style="transform:translateX(-50%);background:${C.navy};border:4px solid ${C.yellow};border-radius:14px;padding:6px 18px 4px">${fn(label, 40, { skew: 0, sw: 3 })}</div>`, label);
    return { g, ring, body, tag };
  }
  function placePin(p, t, pt, c, on, t0, small = false) {
    const s = toScreen(pt, c);
    const sc = small ? 0.62 : 1;
    T(p.g, { x: s.x, y: s.y, a: on });
    T(p.body, { s: pop(t, t0, 0.35) * sc, y: -6 * Math.abs(Math.sin((t - t0) * 3.2)) * (on > 0 ? 1 : 0) });
    const rp = ((t - t0) % 1.4) / 1.4;
    T(p.ring, { s: (0.4 + rp * 0.9) * sc, a: (1 - rp) * on });
    T(p.tag, { s: pop(t, t0 + 0.12, 0.3) * sc, y: small ? 40 : 0 });
  }

  // in-game style collection card for a ghost
  const GHOSTS = [["BLINKY", "#FF3B30", true], ["PINKY", "#FF8FD8", true], ["INKY", "#2EE6F0", false], ["CLYDE", "#FFA733", false]];
  const ghostSvg = (col, found) => svg(130, 140, found
    ? `<path d="M10 135 L10 65 A55 55 0 0 1 120 65 L120 135 L101 118 L83 135 L65 118 L47 135 L29 118 Z" fill="${col}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
       <ellipse cx="45" cy="66" rx="17" ry="21" fill="#fff"/><ellipse cx="88" cy="66" rx="17" ry="21" fill="#fff"/>
       <circle cx="50" cy="71" r="9" fill="#1C2A8C"/><circle cx="93" cy="71" r="9" fill="#1C2A8C"/>`
    : `<path d="M10 135 L10 65 A55 55 0 0 1 120 65 L120 135 L101 118 L83 135 L65 118 L47 135 L29 118 Z" fill="rgba(255,255,255,.06)" stroke="${col}" stroke-width="6" stroke-dasharray="14 10" stroke-linejoin="round"/>`);
  function card(stage, x, [name, col, found]) {
    const c = mk(stage, `left:${x}px;top:640px;width:200px;height:300px;border-radius:12px;overflow:hidden;transform-origin:50% 60%;
      background:${found ? `radial-gradient(circle at 50% 38%,${col},${shade(col)} 78%)` : `radial-gradient(circle at 50% 38%,#26335E,#0C1430 80%)`};
      border:5px solid ${found ? lighten(col) : "#3A4775"};box-shadow:0 8px 0 rgba(0,0,0,.35)`,
      `<div style="position:absolute;left:35px;top:44px">${ghostSvg(col, found)}</div>
       ${found ? "" : `<div style="position:absolute;left:0;right:0;top:66px;text-align:center">${fn("?", 110, { fill: col, skew: 0 })}</div>`}
       <div style="position:absolute;left:0;right:0;bottom:0;height:86px;background:linear-gradient(transparent,rgba(5,8,20,.85) 30%);text-align:center;padding-top:20px">${fn(name, 44, { skew: 0, sw: 3 })}</div>`, name);
    const badge = mk(stage, `left:${x + 140}px;top:618px;width:66px;height:66px;border-radius:50%;display:flex;align-items:center;justify-content:center;
      background:${found ? "#2BC255" : "#56607E"};border:5px solid ${C.ink}`,
      found ? svg(34, 26, `<path d="M3 13 L13 22 L31 3" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`)
        : svg(26, 32, `<rect x="2" y="13" width="22" height="17" rx="3" fill="#fff"/><path d="M7 14 V9 A6 6 0 0 1 19 9 V14" fill="none" stroke="#fff" stroke-width="4"/>`));
    const note = mk(stage, `left:${x}px;top:956px;width:200px;text-align:center`, fn(found ? "On the map" : "Not on map", 30, { fill: found ? "#7CF29A" : "#AAB3CC", sw: 3, skew: 0 }), found ? "ON THE MAP" : "NOT ON MAP");
    return { c, badge, note };
  }
  function shade(hex) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(v * 0.38); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
  function lighten(hex) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(v + (255 - v) * 0.45); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }

  function build(stage) {
    mk(stage, `inset:0;background:${C.ocean}`);
    const map = mk(stage, `left:0;top:0;width:2048px;height:2048px;transform-origin:0 0`, `<img src="${MAP}" style="width:2048px;height:2048px">`);
    const vignette = mk(stage, `inset:0;background:radial-gradient(ellipse 70% 55% at 50% 46%,transparent 55%,rgba(4,10,30,.55));pointer-events:none`);
    const topShade = mk(stage, `left:0;top:0;width:1080px;height:640px;background:linear-gradient(rgba(5,10,28,.82),rgba(5,10,28,.55) 60%,transparent)`);
    const botShade = mk(stage, `left:0;top:1180px;width:1080px;height:740px;background:linear-gradient(transparent,rgba(5,10,28,.7) 30%,rgba(5,10,28,.85))`);
    const dim = mk(stage, `inset:0;background:rgba(7,12,28,.72)`);

    const pins = { pac: pin(stage, "PAC-MAN ISLAND"), blinky: pin(stage, "BLINKY ISLAND"), pinky: pin(stage, "PINKY ISLAND") };

    // headline block
    const tag = mk(stage, `left:60px;top:262px;background:${C.red};padding:6px 20px 2px;transform:skewX(-8deg);box-shadow:0 6px 0 rgba(0,0,0,.35)`, fn("Easter egg", 44, { skew: 0, sw: 0, shadow: false, track: 2 }), "EASTER EGG");
    const HL = [
      ["There's a Pac-Man", "hidden on the map"],
      ["Two of his ghosts", "are here too"],
      ["But Inky & Clyde", "aren't on the map"],
      ["It's part of", "Fortnite: Override"],
    ].map(([a, b]) => mk(stage, `left:60px;top:338px;width:900px`,
      `<div>${fn(a, 100)}</div><div style="margin-top:6px">${fn(b, 100, { fill: C.yellow })}</div>`, `${a} / ${b}`.toUpperCase()));

    // lower third
    const lt = mk(stage, `left:40px;top:1262px;width:900px;height:104px;background:${C.navy};border-left:14px solid ${C.red};border-radius:6px 14px 14px 6px;box-shadow:0 8px 0 rgba(0,0,0,.35);overflow:hidden`);
    const LT = [
      ["Pac-Man Island", "North lake · official map, v42.40"],
      ["Blinky Island", "South-west coast · official map, v42.40"],
      ["Pinky Island", "South-east coast · official map, v42.40"],
      ["Inky & Clyde", "Not on the v42.40 map"],
      ["Fortnite: Override", "Areas inspired by Sonic, Tetris & Pac-Man"],
    ].map(([a, b]) => mk(lt, `left:28px;top:10px;width:850px`,
      `<div>${fn(a, 50, { skew: 0, sw: 3 })}</div><div style="font:700 26px Barlow;color:${C.yellow};letter-spacing:1.5px;text-transform:uppercase;margin-top:2px">${b}</div>`, `${a} / ${b}`.toUpperCase()));

    // ticker (text clipped inside the safe area)
    const tk = mk(stage, `left:40px;top:1376px;width:900px;height:58px;background:${C.ink};border-radius:8px;overflow:hidden;border:3px solid #22305C`);
    mk(tk, `left:0;top:0;bottom:0;width:150px;background:${C.yellow};display:flex;align-items:center;justify-content:center;z-index:2`, fn("BAD NEWS", 32, { skew: 0, sw: 0, shadow: false, fill: C.ink }), "BAD NEWS");
    const TICK = ["Animatronic bosses are in Battle Royale, one always at Freddy Fazbear's Pizza Parlor", "Sprites now appear in Ranked, with abilities disabled",
      "Fortnitemares Collection: team up to unlock the Safety in Numbers Quest", "This broadcast supported by code BAD · #EpicPartner"];
    const tickHTML = TICK.map((s) => `<span style="font:700 28px Barlow;color:${C.white};text-transform:uppercase;letter-spacing:1px;white-space:nowrap">${s}</span><span style="color:${C.red};font:900 30px 'Barlow Condensed';margin:0 28px">■</span>`).join("");
    const tkText = mk(tk, `left:170px;top:9px;white-space:nowrap;display:flex;align-items:center`, tickHTML + tickHTML, "TICKER");
    tkText.dataset.text = TICK.join(" | ").toUpperCase();

    // code moment panel
    const code = mk(stage, `left:70px;top:560px;width:840px;height:560px;background:${C.navy};border:6px solid ${C.yellow};border-radius:22px;box-shadow:0 14px 0 rgba(0,0,0,.4);overflow:hidden;transform-origin:50% 100%`,
      `<div style="position:absolute;left:0;right:0;top:0;height:92px;background:${C.red};display:flex;align-items:center;justify-content:center">${fn("This broadcast supported by", 50, { skew: 0, sw: 0, shadow: false, track: 1 })}</div>
       <div style="position:absolute;left:0;right:0;top:120px;text-align:center;font:700 34px Barlow;letter-spacing:6px;color:${C.yellow}">SUPPORT-A-CREATOR CODE</div>
       <div style="position:absolute;left:0;right:0;top:168px;text-align:center">${fn("BAD", 240, { skew: -4 })}</div>
       <div style="position:absolute;left:0;right:0;top:430px;text-align:center;font:700 34px Barlow;color:${C.white}">Item Shop → Support-A-Creator → BAD</div>
       <div style="position:absolute;left:0;right:0;top:482px;text-align:center;font:700 30px Barlow;letter-spacing:2px;color:${C.yellow}">#EpicPartner</div>`,
      "THIS BROADCAST SUPPORTED BY / SUPPORT-A-CREATOR CODE / BAD / ITEM SHOP → SUPPORT-A-CREATOR → BAD / #EPICPARTNER");

    const cards = GHOSTS.map((g, i) => card(stage, 50 + i * 222, g));

    // persistent brand bug + disclosure (disclosure on screen from the first frame)
    mk(stage, `left:40px;top:160px;padding:8px 20px 6px;border-radius:30px;background:${C.ink};border:3px solid ${C.white}`, `<span style="font:700 28px Barlow;color:${C.white};letter-spacing:.5px">#EpicPartner</span>`, "#EPICPARTNER");
    // brand mark: same flat slanted blocks as the logo
    const blk = (t, bg, fg, px) => `<div style="height:62px;background:${bg};transform:skewX(-10deg);display:flex;align-items:center;padding:0 ${px}px"><span style="font-family:'Barlow Condensed';font-weight:900;font-size:54px;line-height:1;color:${fg}">${t}</span></div>`;
    mk(stage, `right:46px;top:158px;display:flex;gap:5px`, blk("BAD", C.white, C.navy, 14) + blk("NEWS", C.red, C.white, 13), "BAD NEWS");

    return function renderAt(t) {
      const c = cam(t);
      map.style.transform = `translate(${F.x - c.x * c.z}px,${F.y - c.y * c.z}px) scale(${c.z})`;
      const cardsOn = win(t, 8.4, 11.65, 0.2, 0.2), codeOn = win(t, 13.6, 15.6, 0.15, 0.2);
      T(dim, { a: Math.max(cardsOn, codeOn) });

      // pins
      const ov = win(t, 12.45, 15.45, 0.2, 0.2) * (1 - codeOn);
      placePin(pins.pac, t, PAC, c, Math.max(t < 0.15 ? 0 : win(t, 0.15, 3.35, 0.05, 0.2), ov, k(t, 16.0, 16.15)), t < 12 ? 0.15 : t < 16 ? 12.55 : 16.0, ov > 0 && t < 16);
      placePin(pins.blinky, t, BLINKY, c, Math.max(win(t, 4.25, 8.4, 0.05, 0.2), ov), t < 12 ? 4.25 : 12.7, ov > 0);
      placePin(pins.pinky, t, PINKY, c, Math.max(win(t, 7.15, 8.4, 0.05, 0.2), ov), t < 12 ? 7.15 : 12.85, ov > 0);

      // headlines (A also returns at the end so the loop is seamless)
      const hw = [Math.max(t < 3.4 ? 1 : 0, k(t, 15.6, 15.9)), win(t, 3.4, 8.4, 0.18, 0.15), win(t, 8.4, 11.6, 0.18, 0.15), win(t, 11.6, 13.6, 0.18, 0.15)];
      HL.forEach((h, i) => T(h, { a: hw[i], x: lerp(-40, 0, E.out(k(hw[i], 0, 1))) * (i === 0 && t < 1 ? 0 : 1) }));
      T(tag, { a: 1 - codeOn });

      const lw = [Math.max(win(t, 0, 3.4, 0.0001, 0.15), k(t, 15.6, 15.9)), win(t, 4.25, 7.2, 0.15, 0.12), win(t, 7.2, 8.4, 0.12, 0.15), win(t, 8.5, 11.6, 0.15, 0.15), win(t, 11.7, 13.6, 0.15, 0.15)];
      LT.forEach((l, i) => T(l, { a: lw[i], y: lerp(24, 0, E.out(lw[i])) }));
      T(lt, { a: Math.max(...lw) > 0 ? Math.min(1, Math.max(...lw) * 3) : 0 });

      // ticker: scrolls, then holds on the code line during the code moment
      const W = tkText.scrollWidth / 2;
      const off = (t * 150) % W;
      tkText.style.transform = `translateX(${-off}px)`;
      T(tk, { a: 1 - codeOn });

      T(code, { s: lerp(0.86, 1, E.out5(k(t, 13.6, 13.95))), a: codeOn });

      cards.forEach((cd, i) => {
        const t0 = 8.5 + i * 0.12;
        T(cd.c, { s: pop(t, t0, 0.35), a: cardsOn, r: lerp(8, 0, E.out(k(t, t0, t0 + 0.35))) });
        T(cd.badge, { s: pop(t, 9.0 + i * 0.2, 0.3), a: cardsOn });
        T(cd.note, { a: Math.min(cardsOn, k(t, 9.1 + i * 0.2, 9.3 + i * 0.2)) });
      });
      T(topShade, { a: 1 }); T(botShade, { a: 1 }); T(vignette, { a: 1 });
    };
  }

  window.SCENE = {
    duration: DUR,
    build,
    cues: [[0.0, "sting"], [0.22, "ping"], [2.0, "whoosh"], [3.35, "whoosh"], [3.45, "tick"], [4.3, "ping"], [6.2, "whoosh"], [7.2, "ping"], [8.35, "whoosh"],
      [8.5, "flip"], [8.62, "flip"], [8.74, "flip"], [8.86, "flip"], [9.0, "tick"], [9.2, "tick"], [9.4, "locked"], [9.6, "locked"], [11.55, "whoosh"],
      [12.45, "reveal"], [12.6, "ping"], [12.75, "ping"], [12.9, "ping"], [13.6, "sting"], [13.95, "chime"], [15.45, "whoosh"]],
    caption: "#EpicPartner There's a Pac-Man hidden on the Fortnite map. Two of his ghosts are here too, but Inky and Clyde aren't.\n" +
      "Pac-Man Island, Blinky Island and Pinky Island are named locations on the official v42.40 map, part of Fortnite: Override. Spot anything else? Reply and the desk will check it.\n" +
      "Support the desk: code BAD in the Item Shop.\n#Fortnite #FortniteOverride #PacMan",
    claims: [
      { text: "Pac-Man Island is a named location on the current map", source: "sources/map.json", match: ["Pac-Man Island"] },
      { text: "Blinky Island is a named location", source: "sources/map.json", match: ["Blinky Island"] },
      { text: "Pinky Island is a named location", source: "sources/map.json", match: ["Pinky Island"] },
      { text: "No Inky or Clyde location on the map", source: "sources/map.json", absent: ["Inky", "Clyde"], visual: "Full-res map checked: no cyan or orange ghost island" },
      { text: "Pac-Man's four ghosts are Blinky, Pinky, Inky and Clyde", source: "external", note: "Pac-Man (Namco, 1980). General knowledge; not checkable from this session" },
      { text: "Override has areas inspired by Sonic, Tetris and Pac-Man", source: "sources/news.json", match: ["inspired by gaming legends like Sonic, Tetris, and Pac-Man"] },
      { text: "Current version is v42.40", source: "sources/build.json", match: ["Release-42.40"] },
      { text: "Locations: Pac-Man north lake, Blinky south-west coast, Pinky south-east coast", source: "sources/map-blank.png", visual: "Checked on the full-res map" },
      { text: "Ticker: animatronic bosses in BR, one always at Freddy Fazbear's Pizza Parlor", source: "sources/news.json", match: ["animatronic bosses in Battle Royale", "Freddy Fazbear's Pizza Parlor"] },
      { text: "Ticker: Sprites now appear in Ranked, abilities disabled", source: "sources/news.json", match: ["Sprites will now appear in Ranked too, with abilities disabled"] },
      { text: "Ticker: Fortnitemares Collection, team up to unlock the Safety in Numbers Quest", source: "sources/news.json", match: ["Collection of spine-chilling Islands", "Face the fear with friends to unlock the Safety in Numbers Quest"] },
    ],
  };
})();
