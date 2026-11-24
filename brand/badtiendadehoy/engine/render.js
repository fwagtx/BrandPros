// usage: node render.js <episodeDir> <out.mp4> <audio.m4a|-> [stillTimes comma list]
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), {spawn} = require('child_process');
const [epDir, out, audio, stills] = process.argv.slice(2);
const T = {bundle:4.767, segs:[4.767,11.867,16.667,21.367,26.2,31.0,35.733,40.433,45.167], outro:49.967, code:56.967, end:62.167};
const ep = JSON.parse(fs.readFileSync(path.join(epDir,'episode.json'),'utf8'));
let html = fs.readFileSync(path.join(__dirname,'template.html'),'utf8')
  .replace('__EPISODE__', JSON.stringify(ep)).replace('__TIMELINE__', JSON.stringify(T))
  .replace(/FONTDIR/g, path.relative(epDir, path.join(__dirname,'..','fonts')));
fs.writeFileSync(path.join(epDir,'video.html'), html);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1080,height:1920}});
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto('file://' + path.resolve(epDir,'video.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  if (stills) {
    for (const t of stills.split(',').map(Number)) {
      await p.evaluate(t => window.render(t), t);
      await p.screenshot({path: path.join(epDir, `still_${t}.jpg`), type:'jpeg', quality:88});
    }
    await b.close(); return;
  }
  const fps = 30, n = Math.round(T.end * fps);
  const args = ['-y','-v','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-'];
  if (audio && audio !== '-') args.push('-i', audio, '-map','0:v','-map','1:a','-c:a','aac','-b:a','192k','-shortest');
  args.push('-c:v','libx264','-pix_fmt','yuv420p','-preset','medium','-crf','18','-movflags','+faststart', out);
  const ff = spawn('ffmpeg', args, {stdio:['pipe','inherit','inherit']});
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.render(t), i / fps);
    const buf = await p.screenshot({type:'jpeg', quality:92});
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`frame ${i}/${n}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', out);
})();
