// Designed cover (thumbnail) for the daily shop short: 1080x1920 JPEG, key content inside the central 4:5 area
// (Instagram's grid crop) so it reads everywhere. Facts come from episode.json only.
// usage: node cover.js <shopDir> <cover.jpg>
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
const [dir, out] = process.argv.slice(2);
const ep = JSON.parse(fs.readFileSync(path.join(dir, 'episode.json'), 'utf8'));
const fonts = path.relative(dir, path.join(__dirname, '..', 'fonts'));
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const [d, m] = ep.date.split(' ');            // "25 nov"
const mes = MESES.find(x => x.startsWith(m)) || m;
const bundle = ep.segments.find(s => s.kind === 'bundle');
// leaving tonight = every item with the ⏰ badge (some show their chapter instead of "se va" in the caption)
const leaving = ep.segments.filter(s => s.kind === 'item' && s.badge && s.badge.emoji === '⏰').length;
const grad = c => `radial-gradient(ellipse 80% 75% at 50% 45%, ${c[0]} 0%, ${c[1]} 100%)`;
const stack = (t, size, stroke, color) => `<div style="position:relative;display:inline-block;font-weight:900;font-size:${size}px;line-height:1;letter-spacing:-3px"><span style="display:block;-webkit-text-stroke:${stroke}px #000;color:#000">${t}</span><span style="position:absolute;left:0;top:0;color:${color}">${t}</span></div>`;
const cards = ep.intro_cards.slice(0, 3).map((c, i) => `<div style="position:absolute;left:${120 + i * 290}px;top:${1080 + (i % 2) * 40}px;width:300px;height:420px;border-radius:26px;overflow:hidden;background:${grad(c.color)};border:3px solid rgba(255,255,255,.25);box-shadow:0 20px 40px rgba(0,0,0,.45);transform:rotate(${[-6, 0, 6][i]}deg)"><img src="${c.img}" style="position:absolute;bottom:0;left:50%;height:96%;transform:translateX(-50%)"></div>`).join('');
const hero = bundle ? `<div style="position:absolute;left:150px;top:820px;width:780px;height:560px;border-radius:30px;overflow:hidden;background:${grad(bundle.color)};border:3px solid rgba(255,255,255,.25);box-shadow:0 24px 50px rgba(0,0,0,.45);transform:rotate(-3deg)"><img src="${bundle.img}" style="position:absolute;left:50%;top:50%;width:92%;transform:translate(-50%,-50%)"></div>
  <div style="position:absolute;left:0;right:0;top:1420px;text-align:center"><span style="display:inline-block;background:#e6ff3a;color:#111;font-weight:900;font-size:66px;padding:12px 28px 16px;border-radius:18px;transform:rotate(-3deg);box-shadow:0 10px 0 rgba(0,0,0,.35)">AHORRA ${(bundle.regular - bundle.price).toLocaleString('en-US')} 🔥</span></div>` : cards;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Figtree;src:url(${fonts}/figtree.woff2);font-weight:300 900}
*{margin:0;padding:0;box-sizing:border-box} body{width:1080px;height:1920px;overflow:hidden;font-family:Figtree,'Noto Color Emoji',sans-serif;
background:radial-gradient(ellipse 75% 75% at 50% 45%,#7ee83a 0%,#2f9a1c 100%)}
</style></head><body>
<div style="position:absolute;inset:-40px;background:url(bg/intro.jpg) center/cover;opacity:.35"></div>
<div style="position:absolute;left:70px;top:300px;transform:rotate(-3deg);background:#e6ff3a;border-radius:20px;padding:12px 24px 4px;box-shadow:0 9px 0 rgba(0,0,0,.3)"><div style="font-weight:800;font-size:30px;color:#111">USA EL CÓDIGO:</div><div style="font-weight:900;font-size:112px;line-height:.95;color:#111">BAD</div></div>
<div style="position:absolute;left:76px;top:480px;color:#fff;font-weight:800;font-size:26px;text-shadow:0 2px 4px rgba(0,0,0,.6)">#EpicPartner</div>
<div style="position:absolute;right:70px;top:310px;text-align:right">${stack(d, 190, 30, '#fff')}<div style="margin-top:-8px">${stack(mes.toUpperCase(), 64, 14, '#e6ff3a')}</div></div>
<div style="position:absolute;left:0;right:0;top:560px;text-align:center">${stack('LA TIENDA', 150, 26, '#fff')}</div>
<div style="position:absolute;left:0;right:0;top:700px;text-align:center"><span style="display:inline-block;background:#fff;color:#111;font-weight:900;font-size:64px;padding:12px 28px 16px;border-radius:18px;transform:rotate(-2deg);box-shadow:0 8px 0 rgba(0,0,0,.3)">DE HOY 🛒</span></div>
${hero}
${leaving ? `<div style="position:absolute;left:0;right:0;top:1540px;text-align:center"><span style="display:inline-block;background:rgba(10,20,10,.82);color:#fff;font-weight:800;font-size:44px;padding:10px 24px 14px;border-radius:14px">⏰ ${leaving} se van hoy</span></div>` : ''}
</body></html>`;
const page = path.join(dir, 'cover.html');
fs.writeFileSync(page, html);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  await p.goto('file://' + path.resolve(page));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  await p.screenshot({path: out, type: 'jpeg', quality: 92});
  await b.close();
  console.log('cover', out);
})();
