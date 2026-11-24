// Long video renderer (1920x1080, 30 fps) and thumbnail (1280x720).
// usage: node long_render.js <longDir> video <silent.mp4>
//        node long_render.js <longDir> thumb <thumb.jpg>
//        node long_render.js <longDir> stills <t1,t2,...>      (writes still_<t>.jpg into longDir/qa)
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), {spawn} = require('child_process');
const [dir, mode, arg] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(path.join(dir, 'long.json'), 'utf8'));
const tl = fs.existsSync(path.join(dir, 'timeline.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'timeline.json'), 'utf8')) : {total: 1, scenes: []};
const html = fs.readFileSync(path.join(__dirname, 'long_template.html'), 'utf8')
  .replace('__DATA__', JSON.stringify(data)).replace('__TIMELINE__', JSON.stringify(tl))
  .replace('__MODE__', mode === 'thumb' ? 'thumb' : 'video')
  .replace(/FONTDIR/g, path.relative(dir, path.join(__dirname, '..', 'fonts')));
const page_path = path.join(dir, mode === 'thumb' ? 'thumb.html' : 'long.html');
fs.writeFileSync(page_path, html);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1920, height: 1080}});
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto('file://' + path.resolve(page_path));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
  if (mode === 'thumb') {
    await p.setViewportSize({width: 1920, height: 1080});
    const buf = await p.screenshot({type: 'png'});
    const tmp = path.join(dir, 'thumb_full.png'); fs.writeFileSync(tmp, buf);
    await new Promise((res, rej) => spawn('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-vf', 'scale=1280:720', '-q:v', '2', arg], {stdio: 'inherit'}).on('close', c => c ? rej(c) : res()));
    await b.close(); console.log('thumb', arg); return;
  }
  if (mode === 'stills') {
    fs.mkdirSync(path.join(dir, 'qa'), {recursive: true});
    for (const t of arg.split(',').map(Number)) {
      await p.evaluate(t => window.render(t), t);
      await p.screenshot({path: path.join(dir, 'qa', `still_${t.toFixed(1)}.jpg`), type: 'jpeg', quality: 85});
    }
    await b.close(); return;
  }
  const fps = 30, n = Math.round(tl.total * fps);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-movflags', '+faststart', arg], {stdio: ['pipe', 'inherit', 'inherit']});
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.render(t), i / fps);
    const buf = await p.screenshot({type: 'jpeg', quality: 90});
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 900 === 0) console.log(`frame ${i}/${n}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', arg);
})();
