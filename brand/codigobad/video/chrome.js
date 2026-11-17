/* CÓDIGO BAD · the game's UI chrome, shared by every short. */
(function (root) {
  "use strict";
  const { k, lerp, E, win, mk, T } = root.FX;
  const YEL = "#FFE234", INK = "#070B1C", WHITE = "#FFFFFF", GREY = "#AEB7D6", RED = "#FF4D4D", GREEN = "#2E9B5B";
  const FD = "'Barlow Condensed'";
  const RAR = { common: ["#B9BFCC", "#4E5566"], uncommon: ["#6CC24A", "#1E6B16"], rare: ["#4FB2FF", "#1B49B8"], epic: ["#C46DFF", "#5A1BA8"], legendary: ["#F5A742", "#9C4A0E"], gaminglegends: ["#7F6BFF", "#221A66"], icon: ["#5FEAF0", "#0E6A7C"] };
  const ui = (size, w = 900, color = WHITE, extra = "") => `font-family:${FD};font-weight:${w};font-size:${size}px;line-height:1;text-transform:uppercase;color:${color};text-shadow:0 2px 0 rgba(0,0,0,.35);${extra}`;
  const num = (n) => n.toLocaleString("pt-BR");
  const VB = "../../badroyale/shop/2026-10-28/img/vbuck.png";
  const vb = (s) => `<img src="${VB}" style="display:inline-block;width:${s}px;height:${s}px;vertical-align:-${s * 0.16}px;margin-right:${s * 0.12}px">`;
  function bg(stage) {
    mk(stage, `inset:0;background:linear-gradient(180deg,#0C1746 0%,#13205F 40%,#0A1140 100%)`);
    const glow = mk(stage, `left:-200px;top:-200px;width:1480px;height:1400px;background:radial-gradient(ellipse 45% 35% at 40% 30%,rgba(96,150,255,.38),transparent 70%)`);
    mk(stage, `inset:0;background:repeating-linear-gradient(118deg,rgba(255,255,255,.028) 0 2px,transparent 2px 120px)`);
    mk(stage, `left:0;right:0;bottom:0;height:700px;background:linear-gradient(transparent,rgba(4,7,24,.85))`);
    return glow;
  }
  function tabs(stage, active) {
    const names = ["Saguão", "Passe de Batalha", "Loja de Itens", "Armário"];
    if (!names.includes(active)) { names.splice(0, 1, active); names.pop(); }
    mk(stage, `left:60px;top:182px;display:flex;gap:34px;align-items:flex-end`, names.map((tb) => { const on = tb === active; return `<div style="${ui(on ? 38 : 30, 900, on ? WHITE : "rgba(255,255,255,.55)")}padding-bottom:10px;border-bottom:${on ? 6 : 0}px solid ${YEL}">${tb}</div>`; }).join(""), names.join(" ").toUpperCase());
    mk(stage, `right:52px;top:188px;padding:8px 18px;border-radius:30px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.25);font:700 22px Barlow;color:#fff;letter-spacing:.5px`, "#EpicPartner", "#EPICPARTNER");
  }
  function header(stage, title, sub, right) {
    return mk(stage, `left:60px;top:272px;right:52px;display:flex;justify-content:space-between;align-items:flex-end`,
      `<div><div style="${ui(62)}">${title}</div><div style="${ui(36, 800, YEL, "margin-top:6px;letter-spacing:1px")}">${sub}</div></div>
       <div style="text-align:right">${right || ""}</div>`, `${title} ${sub}`.toUpperCase());
  }
  const label = (parent, text, y, x = 60, size = 40, color = WHITE) => mk(parent, `left:${x}px;top:${y}px;display:flex;align-items:center;gap:14px`,
    `<div style="width:8px;height:${size * 0.9}px;background:${YEL};border-radius:3px"></div><div style="${ui(size, 900, color, "letter-spacing:1px")}">${text}</div>`, text.toUpperCase());
  function tile(parent, o, w, h, o2 = {}) {
    const { price = true, pill = null, pillColor = RED, type = "Traje", img, silhouette = false } = o2;
    const [a, b] = RAR[o.rarityKey] || RAR.epic;
    const el = mk(parent, `left:0;top:0;width:${w}px;height:${h}px;border-radius:${Math.round(w * 0.055)}px;overflow:hidden;background:linear-gradient(170deg,${a} 0%,${b} 70%,#090C22 100%);box-shadow:0 10px 24px rgba(0,0,0,.45);transform-origin:50% 55%`,
      `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 28%,rgba(255,255,255,.22),transparent 70%)"></div>
       <img class="art" src="${img}" style="position:absolute;left:${-w * 0.14}px;top:${-h * 0.01}px;width:${w * 1.28}px;height:auto;filter:${silhouette ? "brightness(0) opacity(.55)" : "drop-shadow(0 10px 10px rgba(0,0,0,.35))"}">
       <div style="position:absolute;left:0;right:0;bottom:0;height:${h * 0.34}px;background:linear-gradient(transparent,rgba(6,9,28,.94) 55%)"></div>
       <div class="nm" style="position:absolute;left:${w * 0.07}px;right:${w * 0.07}px;bottom:${price ? h * 0.055 + w * 0.12 : h * 0.06}px">
         <div style="${ui(w * 0.07, 700, GREY, "letter-spacing:1px")}">${type}</div>
         <div style="${ui(Math.min(w * 0.125, (w * 0.86) / (o.name.length * 0.47)), 900, WHITE, "margin-top:2px;white-space:nowrap")}">${o.name}</div>
       </div>
       ${price && o.price ? `<div class="pr" style="position:absolute;left:${w * 0.07}px;bottom:${h * 0.05}px;${ui(w * 0.105, 800)}">${vb(w * 0.1)}${num(o.price)}</div>` : ""}
       ${pill ? `<div style="position:absolute;left:${w * 0.06}px;top:${w * 0.06}px;padding:${w * 0.02}px ${w * 0.05}px;border-radius:${w * 0.03}px;background:${pillColor};${ui(w * 0.075, 800, pillColor === YEL ? INK : WHITE, "letter-spacing:.5px")}">${pill}</div>` : ""}`, o.name.toUpperCase());
    const sel = mk(el, `inset:0;border:7px solid ${WHITE};border-radius:${Math.round(w * 0.055)}px;box-shadow:inset 0 0 0 4px rgba(255,255,255,.35);opacity:0`);
    el.hover = (on) => { sel.style.opacity = on; };
    return el;
  }
  const at = (el, x, y) => { el.style.left = x + "px"; el.style.top = y + "px"; return el; };
  const group = (stage) => mk(stage, `inset:0`);
  const slide = (el, t, tIn, tOut) => {
    const pin = E.out(k(t, tIn, tIn + 0.24)), pout = k(t, tOut - 0.14, tOut);
    const on = t >= tIn - 0.01 && t < tOut;
    el.style.visibility = on ? "visible" : "hidden";
    el.style.opacity = on ? Math.min(pin, 1 - pout) : 0;
    el.style.transform = `translateX(${(1 - pin) * 70 - pout * 40}px)`;
  };
  function footer(stage, right) {
    const btn = (l, t) => `<div style="display:flex;align-items:center;gap:12px"><div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;font:800 24px Barlow;color:#fff">${l}</div><div style="${ui(28, 800, "rgba(255,255,255,.8)", "letter-spacing:1px")}">${t}</div></div>`;
    mk(stage, `left:60px;right:52px;top:1760px;display:flex;justify-content:space-between;align-items:center;opacity:.85`, `<div style="display:flex;gap:40px">${btn("A", "Selecionar")}${btn("B", "Voltar")}</div><div style="${ui(26, 700, GREY, "letter-spacing:1px")}">${right}</div>`, "SELECIONAR VOLTAR");
  }
  function subs(stage, VO) {
    const sub = mk(stage, `left:60px;right:60px;top:1345px;display:flex;justify-content:center`);
    const chunks = []; let cur = [];
    VO.words.forEach((w, i) => { cur.push(w); const nx = VO.words[i + 1]; if (!nx || nx.p !== w.p || /[.,?!:]$/.test(w.w) || cur.length >= 3) { chunks.push(cur); cur = []; } });
    const els = chunks.map((ch, ci) => {
      const box = mk(sub, `position:relative;padding:14px 28px 12px;border-radius:14px;background:rgba(5,9,28,.82)`, ch.map((w) => `<span style="display:inline-block;margin:0 9px;${ui(56, 800)}">${w.w}</span>`).join(""), ch.map((w) => w.w).join(" ").toUpperCase());
      const nx = chunks[ci + 1];
      return { box, ch, spans: [...box.children], t0: ch[0].t0 - 0.04, t1: Math.min(ch[ch.length - 1].t1 + 0.4, nx ? nx[0].t0 - 0.04 : 1e9) };
    });
    return (t) => { if (root.COVER) { sub.style.visibility = "hidden"; return; } els.forEach(({ box, ch, spans, t0, t1 }) => {
      const on = t >= t0 && t < t1; box.style.visibility = on ? "visible" : "hidden"; box.style.position = on ? "relative" : "absolute";
      if (on) spans.forEach((sp, i) => { const w = ch[i]; sp.style.color = t >= w.t0 - 0.03 && t < w.t1 + 0.03 ? YEL : WHITE; sp.style.opacity = t >= w.t0 - 0.05 ? 1 : 0.35; });
    }); };
  }
  // the Support-A-Creator box; returns a draw(t, tStart, tBad)
  function codeBox(stage) {
    const g = group(stage);
    mk(g, `inset:0;background:rgba(3,6,20,.72)`);
    const panel = mk(g, `left:90px;top:560px;width:900px;border-radius:26px;background:linear-gradient(180deg,#152467,#0D173F);box-shadow:0 20px 40px rgba(0,0,0,.55);padding:46px 50px 44px;border:2px solid rgba(255,255,255,.12)`,
      `<div style="${ui(30, 700, GREY, "letter-spacing:2px")}">Loja de Itens</div>
       <div style="${ui(70, 900, WHITE, "margin-top:8px")}">Apoie um Criador</div>
       <div style="font:600 30px Barlow;color:${GREY};margin-top:14px">Digite o código do criador</div>
       <div style="margin-top:28px;height:124px;border-radius:14px;background:#070B1C;border:3px solid rgba(255,255,255,.22);display:flex;align-items:center;padding:0 34px;${ui(84, 900, WHITE, "letter-spacing:8px")}"><span class="typed"></span><span class="caret" style="display:inline-block;width:6px;height:80px;background:${YEL};margin-left:6px"></span></div>
       <div class="accept" style="margin-top:28px;display:inline-block;padding:18px 54px 16px;border-radius:14px;background:${YEL};${ui(44, 900, INK)};box-shadow:0 6px 0 #B89600">Aceitar</div>
       <div style="font:600 24px Barlow;color:${GREY};margin-top:30px">#EpicPartner · Canal de fã, sem vínculo com a Epic Games</div>`, "APOIE UM CRIADOR CODIGO BAD");
    const typed = panel.querySelector(".typed"), caret = panel.querySelector(".caret"), accept = panel.querySelector(".accept");
    return (t, tStart, tBad, DUR) => {
      slide(g, t, tStart, DUR + 2);
      const n = t < tBad ? 0 : Math.min(3, 1 + Math.floor((t - tBad) / 0.16));
      typed.textContent = "BAD".slice(0, n); caret.style.opacity = Math.floor(t * 2.4) % 2 ? 0 : 1;
      const acc = t >= tBad + 0.9; accept.style.transform = acc ? "translateY(4px)" : "none"; accept.style.boxShadow = acc ? "0 2px 0 #B89600" : "0 6px 0 #B89600";
    };
  }
  const timing = () => { const VO = root.VO, P = VO.phrases; let codeI = P.length - 1; for (let i = P.length - 1; i >= 0; i--) if (/c[oó]digo[^.?!]*\bbad\b/i.test(P[i].text)) { codeI = i; break; } return { VO, P, DUR: Math.round((P[P.length - 1].t1 + 0.75) * 10) / 10, codeI, codeP: P[codeI] }; };
  const findWord = (VO, p, re) => VO.words.find((w) => w.p === p && re.test(w.w));
  root.CB = { YEL, INK, WHITE, GREY, RED, GREEN, RAR, ui, num, vb, bg, tabs, header, label, tile, at, group, slide, footer, subs, codeBox, timing, findWord };
})(window);
