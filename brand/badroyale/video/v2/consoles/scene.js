/* BAD ROYALE · "Every Override Console" (editor style, voiced).
 * Console positions: official POI data (sources/map.json), placed on the official labeled map.
 */
(function () {
  "use strict";
  const { k, E, win, mk, T } = window.FX;
  const S = window.STYLE2;
  const VO = window.VO, P = VO.phrases;
  const MAP = "../../badroyale/sources/map-labels.png";
  // clockwise from the north-west, map pixels (2048 map)
  const C = [{ x: 636, y: 693 }, { x: 1089, y: 612 }, { x: 1247, y: 888 }, { x: 1420, y: 1275 }, { x: 971, y: 1574 }, { x: 601, y: 1448 }, { x: 473, y: 1124 }];
  const OV = { x: 1010, y: 1010 };
  const N = (i) => P[2 + i];
  const end = P[P.length - 1].t1;
  const DUR = Math.round((end + 0.7) * 10) / 10;

  const kf = [[0, OV, 0.5], [P[1].t0, OV, 0.53]];
  C.forEach((c, i) => kf.push([N(i).t0 - 0.02, c, 1.55, "out5"], [N(i).t1 + 0.08, c, 1.62]));
  kf.push([P[9].t0 + 0.35, OV, 0.5, "inOut"], [DUR, OV, 0.52]);

  function build(stage) {
    mk(stage, `inset:0;background:#084687`);
    const cam = S.mapCam(stage, MAP, kf);
    const dim = mk(stage, `inset:0;background:rgba(5,10,28,.6)`);
    const marks = C.map((_, i) => S.marker(stage, 62, 62, "#FF2D2D", i * 1.7 + 0.4));
    const nums = C.map((_, i) => S.scrawl(stage, String(i + 1), 78, "#FFD21E", -8));
    const title = S.title(stage, ["Every Override Console", "on the v42.40 map"], { y: 236, size: 56 });
    const counter = mk(stage, `left:770px;top:420px;font-family:'Permanent Marker';font-size:84px;color:#fff;-webkit-text-stroke:10px #0B0D1A;paint-order:stroke fill;text-shadow:0 5px 0 rgba(0,0,0,.4);transform-origin:50% 50%`, "", "COUNTER");
    const code = S.codeCard(stage, 520);
    const caps = S.captions(stage, VO.words, { y: 1150 });
    S.disclosure(stage);
    const fin = S.finish(stage);
    const shotT = P[9].t0 + 0.55;

    return function renderAt(t) {
      const { c, toScreen } = cam.draw(t);
      const sc = Math.min(1, c.z / 1.55);
      C.forEach((pt, i) => {
        const p = toScreen(pt), t0 = N(i).t0;
        const on = t >= t0 ? 1 : 0;
        marks[i].place(p.x, p.y, t, t0, on, Math.max(0.5, sc));
        nums[i].place(p.x + 52 * Math.max(0.5, sc), p.y - 112 * Math.max(0.5, sc), t, t0 + 0.08, on);
      });
      const n = C.filter((_, i) => t >= N(i).t0).length;
      counter.textContent = n ? `${n}/7` : "";
      const lastPop = n ? N(n - 1).t0 : -9;
      T(counter, { s: 1 + 0.25 * (1 - E.out(k(t, lastPop, lastPop + 0.25))), a: n && t < P[10].t0 ? 1 : 0 });
      const codeOn = win(t, P[10].t0 - 0.05, DUR + 1, 0.12, 0.1);
      T(dim, { a: codeOn });
      T(code, { a: codeOn, s: 0.86 + 0.14 * E.back(k(t, P[10].t0 - 0.05, P[10].t0 + 0.3)) });
      T(title, { a: 1 - codeOn });
      caps(t);
      fin(t, [shotT]);
    };
  }

  const cues = [[0.05, "whoosh"], ...C.flatMap((_, i) => [[N(i).t0 - 0.22, "whoosh"], [N(i).t0 + 0.02, "marker"], [N(i).t0 + 0.08, "pop"]]),
    [P[9].t0 + 0.1, "whoosh"], [P[9].t0 + 0.55, "shutter"], [P[10].t0, "notify"]];

  window.SCENE = {
    duration: DUR, build, cues,
    caption: "#EpicPartner Every Override Console on the Fortnite map right now (v42.40). Save it for your next drop.\nPositions from the official map data. Code BAD in the Item Shop supports the channel.\n#Fortnite #FortniteOverride #FortniteMap",
    claims: [
      { text: "There are seven Override Consoles on the map", source: "sources/map.json", match: ["Override Console"], count: { "Override Console": 7 } },
      { text: "Console positions match the official POI coordinates", source: "sources/map-labels.png", visual: "All 7 plotted on the official map; each lands on a console structure" },
      { text: "Current version is v42.40", source: "sources/build.json", match: ["Release-42.40"] },
    ],
  };
})();
