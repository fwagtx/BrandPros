/* BAD ROYALE · "Where the Freddy's boss always is" (editor style, voiced).
 * Facts: Epic's in-game news (sources/news.json) + the POI "Freddy Fazbear's Pizzeria" (sources/map.json).
 */
(function () {
  "use strict";
  const { k, E, win, mk, T } = window.FX;
  const S = window.STYLE2;
  const VO = window.VO, P = VO.phrases;
  const MAP = "../../badroyale/sources/map-blank.png", MAP_LABELS = "../../badroyale/sources/map-labels.png";
  const FRED = { x: 929, y: 607 }, LAKE = { x: 790, y: 470 }, FIELDS = { x: 1159, y: 508 }, WIDE = { x: 950, y: 560 };
  const DUR = Math.round((P[P.length - 1].t1 + 0.7) * 10) / 10;
  const kf = [[0, FRED, 2.5], [P[1].t0, FRED, 2.65], [P[1].t0 + 0.55, WIDE, 1.15, "out5"], [P[3].t0, WIDE, 1.2], [DUR, WIDE, 1.25]];

  function build(stage) {
    mk(stage, `inset:0;background:#084687`);
    const cam = S.mapCam(stage, MAP, kf);
    const labels = cam.overlay(MAP_LABELS);
    const dim = mk(stage, `inset:0;background:rgba(5,10,28,.7)`);
    const ring = S.marker(stage, 80, 80, "#FF2D2D", 5.2);
    const lab = S.scrawl(stage, "Freddy's", 74, "#FFD21E", -7);
    // arrows are drawn in screen space once the camera has settled on the wide shot
    let arrows = null;
    const toastA = S.toast(stage, "STEP 1", "Beat a rogue robot", 560);
    const toastB = S.toast(stage, "STEP 2", "Possess the suit", 740, "#7CF29A");
    const title = S.title(stage, ["One boss is always here", "Freddy Fazbear's"], { y: 236, size: 58 });
    const code = S.codeCard(stage, 520);
    const caps = S.captions(stage, VO.words, { y: 1150 });
    S.disclosure(stage);
    const fin = S.finish(stage);
    const pulse = mk(stage, `left:0;top:0;width:200px;height:200px;border-radius:50%;border:8px solid #FFD21E`);

    return function renderAt(t) {
      const { toScreen } = cam.draw(t);
      const f = toScreen(FRED);
      labels.style.opacity = k(t, P[1].t0 + 0.35, P[1].t0 + 0.75);
      if (!arrows) {
        const c = cam.at(P[2].t0), F = { x: 540, y: 820 };
        const sp = (p) => ({ x: F.x + (p.x - c.x) * c.z, y: F.y + (p.y - c.y) * c.z });
        const a = sp(FRED), l = sp(LAKE), ff = sp(FIELDS);
        arrows = [S.arrow(stage, a.x - 40, a.y - 50, l.x + 60, l.y + 40, "#fff"), S.arrow(stage, a.x + 50, a.y - 50, ff.x - 60, ff.y + 40, "#fff")];
        arrows.forEach((ar) => ar.g = null);
      }
      const pr = ((t % 1.1) / 1.1);
      T(pulse, { x: f.x - 100, y: f.y - 100, s: 0.4 + pr * 0.9, a: t < P[1].t0 ? 1 - pr : 0 });
      ring.place(f.x, f.y, t, P[1].t0 + 0.5, t >= P[1].t0 + 0.5 ? 1 : 0, 1);
      lab.place(f.x + 40, f.y + 80, t, P[1].t0 + 0.65, t >= P[1].t0 + 0.65 ? 1 : 0);
      const arrOn = win(t, P[2].t0, P[3].t0, 0.05, 0.15);
      arrows[0].draw(t, P[2].t0 + 0.55, arrOn); arrows[1].draw(t, P[2].t0 + 1.45, arrOn);
      const steps = win(t, P[3].t0 - 0.05, P[5].t0, 0.08, 0.12), codeOn = win(t, P[5].t0 - 0.05, DUR + 1, 0.12, 0.1);
      T(dim, { a: Math.max(steps, codeOn) });
      T(toastA, { a: steps, x: (1 - E.out(k(t, P[3].t0, P[3].t0 + 0.25))) * -700 });
      T(toastB, { a: t >= P[4].t0 ? steps : 0, x: (1 - E.out(k(t, P[4].t0, P[4].t0 + 0.25))) * -700 });
      T(code, { a: codeOn, s: 0.86 + 0.14 * E.back(k(t, P[5].t0 - 0.05, P[5].t0 + 0.3)) });
      T(title, { a: 1 - Math.max(steps, codeOn) });
      caps(t);
      fin(t);
    };
  }

  window.SCENE = {
    duration: DUR, build,
    cues: [[0.05, "ping"], [P[1].t0 + 0.2, "whoosh"], [P[1].t0 + 0.5, "marker"], [P[2].t0 + 0.55, "marker"], [P[2].t0 + 1.45, "marker"], [P[3].t0, "notify"], [P[4].t0, "notify"], [P[5].t0, "pop"]],
    caption: "#EpicPartner One of the animatronic bosses is always at Freddy Fazbear's. Here's where it is on the map, and what happens when you beat a rogue robot.\nFrom Epic's in-game news and the official map. Code BAD in the Item Shop supports the channel.\n#Fortnite #FNAF #Fortnitemares",
    claims: [
      { text: "One animatronic boss is always at Freddy Fazbear's", source: "sources/news.json", match: ["animatronic bosses in Battle Royale, with one always lurking at Freddy Fazbear's Pizza Parlor"] },
      { text: "Freddy Fazbear's is a named spot on the map", source: "sources/map.json", match: ["Freddy Fazbear's Pizzeria"] },
      { text: "It sits between Pac-Man's lake and Freaky Fields", source: "sources/map-labels.png", visual: "Plotted from POI coordinates: south-east of the Pac-Man lake, south-west of the Freaky Fields label" },
      { text: "Beat a rogue robot to possess the suit", source: "sources/news.json", match: ["Defeat any rogue robot you find to possess the suit"] },
    ],
  };
})();
