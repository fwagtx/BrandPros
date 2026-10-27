/* BAD ROYALE · "Fortnite's hidden Pac-Man" (editor style, voiced). Redo of the first sample.
 * Locations: official POI data + official map image (sources/). Ghost outlines drawn here.
 */
(function () {
  "use strict";
  const { k, E, win, mk, T, svg } = window.FX;
  const S = window.STYLE2;
  const VO = window.VO, P = VO.phrases;
  const MAP = "../../badroyale/sources/map-blank.png";
  const PAC = { x: 832, y: 492 }, BLINKY = { x: 553, y: 1650 }, PINKY = { x: 1262, y: 1612 }, OV = { x: 1010, y: 1010 };
  const DUR = Math.round((P[P.length - 1].t1 + 0.7) * 10) / 10;
  const kf = [[0, PAC, 2.2], [P[1].t0, PAC, 2.35], [P[2].t0 + 0.1, PAC, 2.35], [P[2].t1, { x: 960, y: 1300 }, 0.62],
    [P[3].t0 + 0.05, BLINKY, 2.0, "out5"], [P[4].t0 - 0.05, BLINKY, 2.1], [P[4].t0 + 0.25, PINKY, 2.0, "out5"], [P[5].t0, PINKY, 2.1],
    [P[6].t0 + 0.2, OV, 0.5], [DUR, OV, 0.52]];
  const ghost = (col) => svg(170, 180, `<path d="M14 172 L14 84 A71 71 0 0 1 156 84 L156 172 L132 150 L108 172 L85 150 L62 172 L38 150 Z" fill="rgba(255,255,255,.08)" stroke="${col}" stroke-width="9" stroke-dasharray="20 14" stroke-linejoin="round"/>
    <text x="85" y="128" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="86" fill="${col}" stroke="#0B0D1A" stroke-width="10" paint-order="stroke">?</text>`);

  function build(stage) {
    mk(stage, `inset:0;background:#084687`);
    const cam = S.mapCam(stage, MAP, kf);
    const dim = mk(stage, `inset:0;background:rgba(5,10,28,.72)`);
    const mPac = S.marker(stage, 105, 90, "#FF2D2D", 1.1), mB = S.marker(stage, 95, 95, "#FF2D2D", 2.3), mP = S.marker(stage, 95, 95, "#FF2D2D", 3.7);
    const lPac = S.scrawl(stage, "Pac-Man Island", 62, "#FFD21E", -7), lB = S.scrawl(stage, "Blinky", 70, "#FF6B6B", -6), lP = S.scrawl(stage, "Pinky", 70, "#FF9BE0", -6);
    const missing = mk(stage, `left:140px;top:600px;width:800px;display:flex;justify-content:space-around`,
      `<div style="text-align:center">${ghost("#2EE6F0")}<div style="font-family:'Permanent Marker';font-size:58px;color:#2EE6F0;-webkit-text-stroke:8px #0B0D1A;paint-order:stroke fill">INKY</div></div>
       <div style="text-align:center">${ghost("#FFA733")}<div style="font-family:'Permanent Marker';font-size:58px;color:#FFA733;-webkit-text-stroke:8px #0B0D1A;paint-order:stroke fill">CLYDE</div></div>`, "INKY / CLYDE");
    const stamp = mk(stage, `left:240px;top:640px;width:600px;text-align:center;font-family:'Permanent Marker';font-size:80px;line-height:1;color:#FF2D2D;-webkit-text-stroke:10px #0B0D1A;paint-order:stroke fill;transform-origin:50% 50%`, "Not on the map", "NOT ON THE MAP");
    const title = S.title(stage, ["The hidden Pac-Man", "on the v42.40 map"], { y: 236, size: 60 });
    const code = S.codeCard(stage, 520);
    const caps = S.captions(stage, VO.words, { y: 1150 });
    S.disclosure(stage);
    const fin = S.finish(stage);

    return function renderAt(t) {
      const { toScreen } = cam.draw(t);
      const ov = t >= P[6].t0 + 0.2 ? 0.55 : 1;
      const pp = toScreen(PAC), bp = toScreen(BLINKY), qp = toScreen(PINKY);
      mPac.place(pp.x, pp.y, t, P[1].t0, t >= P[1].t0 ? 1 : 0, ov); lPac.place(pp.x - 220, pp.y - 190 * ov, t, P[1].t0 + 0.2, t >= P[1].t0 && t < P[2].t1 ? 1 : 0);
      mB.place(bp.x, bp.y, t, P[3].t0 + 0.05, t >= P[3].t0 ? 1 : 0, ov); lB.place(bp.x - 80, bp.y - 200 * ov, t, P[3].t0 + 0.1, t >= P[3].t0 && t < P[5].t0 ? 1 : 0);
      mP.place(qp.x, qp.y, t, P[4].t0 + 0.25, t >= P[4].t0 + 0.2 ? 1 : 0, ov); lP.place(qp.x - 80, qp.y - 200 * ov, t, P[4].t0 + 0.3, t >= P[4].t0 + 0.2 && t < P[5].t0 ? 1 : 0);
      const miss = win(t, P[5].t0 - 0.02, P[6].t0 + 0.15, 0.08, 0.15), codeOn = win(t, P[7].t0 - 0.05, DUR + 1, 0.12, 0.1);
      T(dim, { a: Math.max(miss, codeOn) });
      T(missing, { a: miss, s: 0.9 + 0.1 * E.back(k(t, P[5].t0, P[5].t0 + 0.3)) });
      const st = win(t, P[6].t0 + 0.25, P[7].t0, 0.05, 0.12);
      T(stamp, { a: st, r: -9, s: t < P[6].t0 + 0.25 ? 0 : 1 + 0.15 * (1 - E.out(k(t, P[6].t0 + 0.25, P[6].t0 + 0.45))) });
      T(code, { a: codeOn, s: 0.86 + 0.14 * E.back(k(t, P[7].t0 - 0.05, P[7].t0 + 0.3)) });
      T(title, { a: 1 - Math.max(miss, codeOn) });
      caps(t);
      fin(t);
    };
  }

  window.SCENE = {
    duration: DUR, build,
    cues: [[0.05, "pop"], [P[1].t0, "marker"], [P[2].t0 + 0.2, "whoosh"], [P[3].t0, "whoosh"], [P[3].t0 + 0.08, "marker"], [P[4].t0, "whoosh"], [P[4].t0 + 0.3, "marker"],
      [P[5].t0, "scratch"], [P[6].t0 + 0.25, "locked"], [P[7].t0, "notify"]],
    caption: "#EpicPartner There's a Pac-Man hidden on the Fortnite map, and two of his ghosts are here too. Inky and Clyde aren't on the v42.40 map.\nFrom the official map data. Code BAD in the Item Shop supports the channel.\n#Fortnite #FortniteOverride #PacMan",
    claims: [
      { text: "Pac-Man Island is a named location on the current map", source: "sources/map.json", match: ["Pac-Man Island"] },
      { text: "Blinky Island and Pinky Island are named locations", source: "sources/map.json", match: ["Blinky Island", "Pinky Island"] },
      { text: "No Inky or Clyde location on the map", source: "sources/map.json", absent: ["Inky", "Clyde"], visual: "Full-res map checked: no cyan or orange ghost island" },
      { text: "Pac-Man's four ghosts are Blinky, Pinky, Inky and Clyde", source: "external", note: "Pac-Man (Namco, 1980). General knowledge; not checkable from this session" },
      { text: "Pac-Man Island sits in a lake", source: "sources/map-blank.png", visual: "Checked on the full-res map (north lake)" },
      { text: "Current version is v42.40", source: "sources/build.json", match: ["Release-42.40"] },
    ],
  };
})();
