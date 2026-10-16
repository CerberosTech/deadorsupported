// Checks the built site in dist/. Run after the build:  node build.mjs && node check-dist.mjs
// Optional: node check-dist.mjs <baseline-dist>  also compares the page list, sitemap.xml and robots.txt with an older build.
// No dependencies. Exits with code 1 when a check fails.
import fs from 'fs';
import path from 'path';

const DIST = 'dist';
const SITE = 'https://cerberostech.github.io/deadorsupported/';
const OG = SITE + 'og.png';
const GOOGLE = 'google8042a96498438aa5.html';
const GC = '<script data-goatcounter="https://deadorsupported.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>';
const SHOP = 'https://deadorsupported.gumroad.com/l/bqlcoi';
const PRODUCT_COPY = "Buying a used phone? Don't get stuck with a locked, stolen or soon-unpatched one. Our 12-page Safe to Buy Used? checklist, €6.";
const NEWSLETTER = 'https://deadorsupported.beehiiv.com/subscribe';
const VOID = new Set(['meta', 'link', 'br', 'input', 'img', 'hr', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr', 'path', 'circle', 'rect']);
const BLOCK = /^(div|section|aside|nav|ul|ol|li|h[1-6]|p|form|header|footer|article|table|dl|fieldset)$/;
const BANNED = [/lorem/i, /ipsum/i, /\bTODO\b/, /\bTBD\b/, /coming soon/i, /placeholder/i, /\bopen(s)? soon\b/i, /\bofficial\b/i, /always up[- ]to[- ]date/i];

let fails = 0, checks = 0;
const fail = (...m) => { fails++; console.log('FAIL', ...m); };
const ok = (cond, ...m) => { checks++; if (!cond) fail(...m); return cond; };
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const rel = f => path.relative(DIST, f).split(path.sep).join('/');
const read = f => fs.readFileSync(path.join(DIST, f), 'utf8');
const unesc = s => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const text = h => unesc(h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
// all attributes of every <tag ...> whose attributes match `where`
const tags = (h, tag) => [...h.matchAll(new RegExp(`<${tag}\\s([^>]*)>`, 'g'))].map(m => Object.fromEntries([...m[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map(a => [a[1], unesc(a[2])])));
const metaOf = (h, key) => tags(h, 'meta').filter(a => a.property === key || a.name === key).map(a => a.content);
const urlToFile = u => { let p = u.slice(SITE.length).split(/[?#]/)[0]; if (p === '' || p.endsWith('/')) p += 'index.html'; return p; };

if (!fs.existsSync(DIST)) { console.log(`no ${DIST}/ folder: run node build.mjs first`); process.exit(1); }
const files = walk(DIST).map(rel).sort();
const html = files.filter(f => f.endsWith('.html') && f !== GOOGLE);
const exists = f => fs.existsSync(path.join(DIST, f));

// 1. Google verification file
ok(exists(GOOGLE) && read(GOOGLE) === `google-site-verification: ${GOOGLE}`, 'google verification file missing or changed');

// 2. head tags, GoatCounter, one h1 and unique ids on every page
const titles = new Map();
for (const f of html) {
  const h = read(f), canon = SITE + f.replace(/(^|\/)index\.html$/, '$1');
  const title = unesc((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  ok(title && title.length <= 60, f, `title missing or longer than 60 (${title.length}): ${title}`);
  titles.set(title, [...(titles.get(title) || []), f]);
  const desc = metaOf(h, 'description')[0] || '';
  ok(desc && desc.length <= 155, f, `meta description missing or longer than 155 (${desc.length})`);
  const links = tags(h, 'link');
  ok(links.some(a => a.rel === 'canonical' && a.href === canon), f, 'canonical missing or not', canon);
  ok(metaOf(h, 'theme-color').length > 0, f, 'theme-color missing');
  ok(/^(website|article)$/.test(metaOf(h, 'og:type')[0] || ''), f, 'og:type missing');
  ok(metaOf(h, 'og:title')[0], f, 'og:title missing');
  ok(metaOf(h, 'og:description')[0], f, 'og:description missing');
  ok(metaOf(h, 'og:url')[0] === canon, f, 'og:url missing or not absolute', canon);
  ok(metaOf(h, 'og:image')[0] === OG, f, 'og:image is not', OG);
  ok(metaOf(h, 'og:image:width')[0] === '1200' && metaOf(h, 'og:image:height')[0] === '630', f, 'og:image:width/height not 1200x630');
  ok(metaOf(h, 'og:image:alt')[0], f, 'og:image:alt missing');
  ok(metaOf(h, 'twitter:card')[0] === 'summary_large_image', f, 'twitter:card is not summary_large_image');
  ok(/^https:\/\//.test(metaOf(h, 'twitter:image')[0] || ''), f, 'twitter:image missing or not absolute');
  ok(links.some(a => a.rel === 'icon' && /favicon\.ico$/.test(a.href) && a.sizes === '32x32'), f, 'favicon.ico link (sizes 32x32) missing');
  ok(links.some(a => a.rel === 'icon' && /favicon\.svg$/.test(a.href) && a.type === 'image/svg+xml'), f, 'favicon.svg link missing');
  ok(links.some(a => a.rel === 'apple-touch-icon' && /apple-touch-icon\.png$/.test(a.href)), f, 'apple-touch-icon link missing');
  ok(h.includes('<html lang="en">') && h.includes('name="viewport"'), f, 'lang or viewport missing');
  ok(h.trimEnd().endsWith(GC + '</body></html>') && h.split('data-goatcounter=').length === 2, f, 'GoatCounter tag is not the last thing before </body>');
  ok(h.includes('<a class="skip" href="#main">') && h.includes('<main id="main"'), f, 'skip link or main landmark missing');
  ok((h.match(/<h1[\s>]/g) || []).length === 1, f, 'page does not have exactly one h1');
  const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  ok(ids.length === new Set(ids).size, f, 'duplicate ids', ids.filter((x, i) => ids.indexOf(x) !== i).join(','));
  // every tag is closed in the right order, and no block element sits inside a <p>
  const stack = []; let err = '';
  for (const [, close, name, self] of h.replace(/<!--[\s\S]*?-->|<script[\s\S]*?<\/script>/g, '').matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)(?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*(\/?)>/g)) {
    const t = name.toLowerCase();
    if (VOID.has(t) || self) continue;
    if (!close) { if (stack.at(-1) === 'p' && BLOCK.test(t)) { err = `<${t}> inside <p>`; break; } stack.push(t); }
    else if (stack.pop() !== t) { err = `</${t}> closes the wrong tag`; break; }
  }
  ok(!err && !stack.length, f, 'HTML structure:', err || 'unclosed ' + stack.join(','));
  // wording rules apply to our own copy, not to text that comes from data/ or content/ (device notes, article bodies)
  let own = h.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<p class="(?:tl-)?note">[\s\S]*?<\/p>|<li class="card article-card">[\s\S]*?<\/li>/g, ' ');
  if (/^articles\/.+\/index\.html$/.test(f)) own = own.replace(/<article class="prose">[\s\S]*?<\/article>/, ' ');
  for (const re of BANNED) ok(!re.test(text(own)), f, 'banned wording', re);
}
for (const [t, fs_] of titles) ok(fs_.length === 1, 'duplicate title', t, fs_.join(', '));

// 3. links: every relative href/src/action and every link to the live site resolves to a file in dist/, and #fragments exist
const idsOf = {};
for (const f of html) idsOf[f] = new Set([...read(f).matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
let linkCount = 0;
for (const f of html) {
  const h = read(f).replace(/<!--[\s\S]*?-->/g, '');
  for (const [, raw] of h.matchAll(/\s(?:href|src|action)="([^"]+)"/g)) {
    const url = unesc(raw);
    if (/^(mailto:|tel:|data:)/.test(url)) continue;
    let target, frag;
    if (url.startsWith(SITE)) { target = urlToFile(url); frag = url.split('#')[1]; }
    else if (/^(https?:)?\/\//.test(url)) continue; // other sites
    else { const [p, fr] = url.split('#'); frag = fr; target = p ? path.posix.normalize(path.posix.join(path.posix.dirname(f), p.split('?')[0])) : f; }
    linkCount++;
    if (!ok(exists(target), f, 'broken link', url)) continue;
    if (frag && target.endsWith('.html')) ok(idsOf[target]?.has(frag), f, 'missing #fragment', url);
  }
}

// 4. sitemap, robots and assets
const sm = read('sitemap.xml'), locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
ok(locs.length === html.length, `sitemap lists ${locs.length} URLs for ${html.length} pages`);
for (const u of locs) ok(u.startsWith(SITE) && exists(urlToFile(u)), 'sitemap URL without a page', u);
ok(read('robots.txt').includes(`Sitemap: ${SITE}sitemap.xml`), 'robots.txt does not point to the sitemap');
const png = f => { const b = fs.readFileSync(path.join(DIST, f)); return b.toString('ascii', 1, 4) === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };
for (const [f, w, hh] of [['og.png', 1200, 630], ['apple-touch-icon.png', 180, 180], ['logo-512.png', 512, 512]]) {
  const d = exists(f) && png(f);
  ok(d && d[0] === w && d[1] === hh, f, `is not a ${w}x${hh} PNG`, d);
}
ok(fs.statSync(path.join(DIST, 'og.png')).size < 1024 * 1024, 'og.png is 1 MB or larger');
const ico = fs.readFileSync(path.join(DIST, 'favicon.ico'));
ok(ico.readUInt16LE(0) === 0 && ico.readUInt16LE(2) === 1 && ico.readUInt16LE(4) >= 1 && ico[6] === 32 && ico[7] === 32, 'favicon.ico is not a real 32x32 ICO');
ok(/^<svg[\s>]/.test(read('favicon.svg').trim()), 'favicon.svg is not an SVG');

// 5. calls to action
const isProductPage = f => f === 'index.html' || (/^articles\/.+\/index\.html$/.test(f)) || (/^device\//.test(f) && /<section class="verdict st-(dead|ending)">/.test(read(f)));
let withProduct = 0;
for (const f of html) {
  const h = read(f), has = h.includes(SHOP);
  if (isProductPage(f)) {
    withProduct++;
    ok(has && h.includes(PRODUCT_COPY) && />Our own product<\/h2>/.test(h), f, 'own-product box missing, or its copy or label differs');
  } else ok(!has || f === 'disclosure.html', f, 'own-product box on a page that should not have it');
  ok(h.includes(NEWSLETTER) || f === 'tip.html' || f === 'disclosure.html', f, 'newsletter link missing');
}
ok(/Safe to Buy Used\? checklist is our own product, and we sell it/.test(text(read('disclosure.html'))), 'disclosure.html does not say the checklist is our own product');

// 6. optional: compare with an older build
const base = process.argv[2];
if (base) {
  const old = walk(base).map(f => path.relative(base, f).split(path.sep).join('/')).filter(f => f.endsWith('.html')).sort();
  ok(JSON.stringify(old) === JSON.stringify(html.concat(GOOGLE).sort()), 'the list of HTML pages differs from', base);
  for (const f of ['sitemap.xml', 'robots.txt', GOOGLE]) ok(fs.readFileSync(path.join(base, f), 'utf8') === read(f), f, 'differs from', base);
}

console.log(`${html.length} pages, ${linkCount} internal links, ${withProduct} pages with the own-product box, ${checks} checks`);
console.log(fails ? `${fails} FAILED` : 'ALL CHECKS PASSED');
process.exit(fails ? 1 : 0);
