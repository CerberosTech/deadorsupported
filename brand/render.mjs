// Renders every PNG in brand/ from its SVG/HTML source with headless Chrome,
// builds favicon.ico with ImageMagick, and prints the real pixel size of each file.
// Run from anywhere:  node brand/render.mjs            (all files)
//                     node brand/render.mjs og.png ... (only these files)
// Needs Google Chrome and ImageMagick 7 (`magick`). The Gumroad images read the PDF page previews
// from ../_products/ (kept out of git).
import { execFileSync, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'dos-brand-'));
const src = (file, query) => 'file://' + path.join(DIR, file) + (query ? '?' + new URLSearchParams(query) : '');
const icon = (svg, size) => src('src/icon.html', { svg, size });

const NEWSLETTER = {
  kicker: 'Newsletter', title: 'Get the weekly heads-up', url: 'deadorsupported.beehiiv.com',
  sub: 'A short weekly email about gadgets that are losing updates or cloud service. Free, and you can unsubscribe anytime.',
};
// [output, width, height, source]
const JOBS = [
  ['logo-512.png', 512, 512, icon('../logo.svg', 512)],
  ['apple-touch-icon.png', 180, 180, icon('avatar.svg', 180)],
  ['x-avatar.png', 400, 400, icon('avatar.svg', 400)],
  ['beehiiv-logo.png', 512, 512, icon('avatar.svg', 512)],
  ['og.png', 1200, 630, src('og-template.html')],
  ['beehiiv-cover.png', 1200, 630, src('og-template.html', NEWSLETTER)],
  ['x-banner.png', 1500, 500, src('src/x-banner.html')],
  ['gumroad-cover.png', 1280, 720, src('src/gumroad-cover.html')],
  ['gumroad-thumb.png', 600, 600, src('src/gumroad-cover.html', { layout: 'thumb' })],
];

function shoot(file, w, h, url) {
  // Chrome sometimes exits non-zero, or hangs, during teardown after the screenshot is saved.
  // So every try gets a fresh profile and a time limit, and success means "the file exists".
  let run;
  for (let attempt = 1; attempt <= 3; attempt++) {
    fs.rmSync(file, { force: true });
    run = spawnSync(CHROME, [
      '--headless=new', `--screenshot=${file}`, `--window-size=${w},${h}`, '--hide-scrollbars',
      '--force-device-scale-factor=1', '--default-background-color=00000000', '--virtual-time-budget=3000',
      '--no-first-run', '--disable-background-networking', '--disable-component-update', '--disable-sync',
      `--user-data-dir=${fs.mkdtempSync(path.join(TMP, 'profile-'))}`, url,
    ], { encoding: 'utf8', timeout: 60000, killSignal: 'SIGKILL' });
    if (fs.existsSync(file) && fs.statSync(file).size > 0) return;
    console.warn(`retrying ${path.basename(file)}: try ${attempt} failed${run.error ? ` (${run.error.code})` : ''}`);
  }
  throw new Error(`Chrome did not write ${path.basename(file)}:\n${(run.stderr || '').split('\n').slice(-5).join('\n')}`);
}

if (!fs.existsSync(path.join(DIR, '../_products/sample-preview-1.png')))
  console.warn('warning: ../_products/sample-preview-*.png not found; the Gumroad images will have blank pages');

const only = process.argv.slice(2);
const want = f => !only.length || only.includes(f);
for (const [out, w, h, url] of JOBS) if (want(out)) { shoot(path.join(DIR, out), w, h, url); console.log('rendered', out); }
// favicon.ico: one 32x32 image, made from a 32 px render of favicon.svg
if (want('favicon.ico')) {
  const png = path.join(TMP, 'favicon-32.png');
  shoot(png, 32, 32, icon('../favicon.svg', 32));
  execFileSync('magick', [png, path.join(DIR, 'favicon.ico')]);
  console.log('rendered favicon.ico');
}
fs.rmSync(TMP, { recursive: true, force: true });
const files = [...JOBS.map(([f]) => f), 'favicon.ico'].filter(want).map(f => path.join(DIR, f));
console.log(execFileSync('magick', ['identify', '-format', '%f %wx%h %b\n', ...files]).toString().trim());
