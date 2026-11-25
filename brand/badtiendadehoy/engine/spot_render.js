// "Lote del día" renderer: vertical video (1080x1920, 30 fps), designed cover, or QA stills.
// usage: node spot_render.js <dir> video <silent.mp4> | cover <cover.jpg> | stills <t1,t2,...>
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), {spawn} = require('child_process');
const [dir, mode, arg] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(path.join(dir, 'spot.json'), 'utf8'));
const tlp = path.join(dir, 'timeline.json');
const tl = fs.existsSync(tlp) ? JSON.parse(fs.readFileSync(tlp, 'utf8')) : {total: 1, scenes: []};
const html = fs.readFileSync(path.join(__dirname, 'spot_template.html'), 'utf8')
  .replace('__DATA__', JSON.stringify(data)).replace('__TIMELINE__', JSON.stringify(tl)).replace('__MODE__', mode === 'cover' ? 'cover' : 'video')
  .replace(/FONTDIR/g, path.relative(dir, path.join(__dirname, '..', 'fonts')));
const page = path.join(dir, mode === 'cover' ? 'cover.html' : 'spot.html');
fs.writeFileSync(page, html);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto('file://' + path.resolve(page));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  if (mode === 'cover') { await p.screenshot({path: arg, type: 'jpeg', quality: 92}); await b.close(); console.log('cover', arg); return; }
  if (mode === 'stills') {
    fs.mkdirSync(path.join(dir, 'qa'), {recursive: true});
    for (const t of arg.split(',').map(Number)) { await p.evaluate(t => window.render(t), t); await p.screenshot({path: path.join(dir, 'qa', `still_${t.toFixed(1)}.jpg`), type: 'jpeg', quality: 85}); }
    await b.close(); return;
  }
  const fps = 30, n = Math.round(tl.total * fps);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '19', '-movflags', '+faststart', arg], {stdio: ['pipe', 'inherit', 'inherit']});
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.render(t), i / fps);
    const buf = await p.screenshot({type: 'jpeg', quality: 92});
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', arg);
})();
