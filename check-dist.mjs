// Checks the built site in dist/. Run after the build:  node build.mjs && node check-dist.mjs
// Also checks that every generated page footer's "More free tools from CerberosTech" block links once to each sister site.
// Also checks dist/killed.xml, the RSS 2.0 feed for the Recently killed list.
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

// Strict XML 1.0 well-formedness parser (no dependencies). Rejects bare < and &, bad entities,
// unquoted or duplicate attributes, mismatched tags, and trailing markup. Decodes the five
// predefined entities and numeric character references.
const parseXml = src => {
  if (typeof src !== 'string' || src.includes('\0')) throw new Error('XML must be a string');
  let i = 0;
  const n = src.length;
  const err = m => { throw new Error(`${m} (at offset ${i})`); };
  const legal = cp => cp === 0x9 || cp === 0xA || cp === 0xD || (cp >= 0x20 && cp <= 0xD7FF) || (cp >= 0xE000 && cp <= 0xFFFD) || (cp >= 0x10000 && cp <= 0x10FFFF);
  if (src.charCodeAt(0) === 0xFEFF) i++;
  const skipWs = () => { while (i < n && (src[i] === ' ' || src[i] === '\t' || src[i] === '\n' || src[i] === '\r')) i++; };
  const nameRe = /[A-Za-z_:][A-Za-z0-9._:-]*/y;
  const readName = () => { nameRe.lastIndex = i; const m = nameRe.exec(src); if (!m) err('expected a name'); i = nameRe.lastIndex; return m[0]; };
  const readEntity = () => {
    if (src.startsWith('&amp;', i)) { i += 5; return '&'; }
    if (src.startsWith('&lt;', i)) { i += 4; return '<'; }
    if (src.startsWith('&gt;', i)) { i += 4; return '>'; }
    if (src.startsWith('&quot;', i)) { i += 6; return '"'; }
    if (src.startsWith('&apos;', i)) { i += 6; return "'"; }
    const hex = /^&#x([0-9A-Fa-f]+);/y, dec = /^&#([0-9]+);/y;
    hex.lastIndex = i; dec.lastIndex = i;
    const hm = hex.exec(src); let cp;
    if (hm) { cp = parseInt(hm[1], 16); i = hex.lastIndex; }
    else { const dm = dec.exec(src); if (!dm) err('invalid entity reference'); cp = parseInt(dm[1], 10); i = dec.lastIndex; }
    if (cp > 0x10FFFF || !legal(cp)) err('illegal character reference');
    return String.fromCodePoint(cp);
  };
  const readText = quote => {
    let s = '';
    while (i < n) {
      const c = src[i];
      if (c === '<') { if (quote) err('bare < in attribute value'); return s; }
      if (quote && c === quote) return s;
      if (c === '&') { s += readEntity(); continue; }
      if (!quote && src.startsWith(']]>', i)) err('illegal ]]> in text');
      const cp = src.codePointAt(i);
      if (!legal(cp)) err('illegal character');
      const ch = String.fromCodePoint(cp);
      s += ch; i += ch.length;
    }
    if (quote) err('unclosed attribute value');
    return s;
  };
  if (src.startsWith('<?xml', i)) {
    const end = src.indexOf('?>', i);
    if (end < 0) err('unclosed XML declaration');
    const decl = src.slice(i, end + 2);
    if (!/^<\?xml\s+version\s*=\s*(?:"1\.0"|'1\.0')(?:\s+encoding\s*=\s*(?:"UTF-8"|'UTF-8'))?(?:\s+standalone\s*=\s*(?:"yes"|"no"|'yes'|'no'))?\s*\?>$/.test(decl)) err('bad XML declaration');
    i = end + 2;
  }
  const parseElement = () => {
    if (src[i] !== '<') err('expected <');
    i++;
    if (src[i] === '/' || src[i] === '!' || src[i] === '?') err('expected an element name');
    const name = readName();
    const attrs = {};
    while (true) {
      skipWs();
      if (i >= n) err('unclosed start tag');
      if (src[i] === '>' || src[i] === '/') break;
      const an = readName();
      skipWs();
      if (src[i] !== '=') err('expected =');
      i++;
      skipWs();
      const q = src[i];
      if (q !== '"' && q !== "'") err('attribute value is not quoted');
      i++;
      const v = readText(q);
      if (src[i] !== q) err('unclosed attribute value');
      i++;
      if (Object.hasOwn(attrs, an)) err('duplicate attribute ' + an);
      attrs[an] = v;
    }
    const children = [];
    if (src[i] === '/') { if (src[i + 1] !== '>') err('expected />'); i += 2; return { name, attrs, children }; }
    if (src[i] !== '>') err('expected >');
    i++;
    while (i < n) {
      if (src.startsWith('</', i)) {
        i += 2;
        const endName = readName();
        skipWs();
        if (src[i] !== '>') err('expected >');
        i++;
        if (endName !== name) err(`</${endName}> does not close <${name}>`);
        return { name, attrs, children };
      }
      if (src.startsWith('<!--', i)) {
        const end = src.indexOf('-->', i + 4);
        if (end < 0) err('unclosed comment');
        const body = src.slice(i + 4, end);
        if (body.includes('--') || body.endsWith('-')) err('illegal comment');
        i = end + 3;
        continue;
      }
      if (src.startsWith('<![CDATA[', i)) {
        const end = src.indexOf(']]>', i + 9);
        if (end < 0) err('unclosed CDATA section');
        const body = src.slice(i + 9, end);
        for (let k = 0; k < body.length;) { const cp = body.codePointAt(k); if (!legal(cp)) err('illegal character in CDATA'); k += String.fromCodePoint(cp).length; }
        children.push(body);
        i = end + 3;
        continue;
      }
      if (src[i] === '<') {
        if (src[i + 1] === '?' || src[i + 1] === '!') err('unexpected markup');
        children.push(parseElement());
        continue;
      }
      const start = i;
      const t = readText(false);
      if (i === start) err('parser did not advance');
      if (t) children.push(t);
    }
    err('unclosed element <' + name + '>');
  };
  skipWs();
  if (i >= n) err('missing root element');
  const root = parseElement();
  skipWs();
  if (i !== n) err('trailing content after the root element');
  return root;
};
const xmlElems = el => (el?.children || []).filter(c => c && typeof c === 'object');
const xmlChild = (el, name) => xmlElems(el).find(c => c.name === name);
const xmlText = el => el && (el.children || []).every(c => typeof c === 'string') ? el.children.join('') : '';
const RFC822 = /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/;

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

// 6. sister-site footer: every generated page links once to each CerberosTech home, as a plain followed link
const SISTERS = [
  ['https://cerberostech.github.io/stroomprijs/en/', 'Dutch electricity price today (hourly)'],
  ['https://cerberostech.github.io/belastingcalculator/en/', 'Dutch tax calculator 2026'],
  ['https://cerberostech.github.io/isde-checker/en/', 'ISDE heat pump subsidy checker (NL)'],
  ['https://cerberostech.github.io/woningmarkt/en/', 'Dutch housing market by municipality'],
];
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let sisterPages = 0;
for (const f of html) {
  const h = read(f);
  let all = ok(h.includes('<h2 id="sister-h">More free tools from CerberosTech</h2>'), f, 'sister-sites footer heading missing');
  ok((h.match(/id="sister-h"/g) || []).length === 1, f, 'sister-sites heading id is not unique');
  for (const [href, label] of SISTERS) {
    const hits = [...h.matchAll(new RegExp(`<a href="${escRe(href)}">([^<]*)</a>`, 'g'))];
    const once = ok(hits.length === 1 && hits[0][1] === label, f, 'sister link missing, duplicated or wrong anchor', href, hits.map(m => m[1]).join(' | '));
    const plain = ok(!new RegExp(`<a\\s[^>]*href="${escRe(href)}"[^>]*\\srel=`, 'i').test(h), f, 'sister link is not a plain followed link', href);
    const n = h.split(href).length - 1;
    const onceHref = ok(n === 1, f, 'sister URL does not appear exactly once', href, n);
    all = all && once && plain && onceHref;
  }
  ok(!h.includes('https://cerberostech.github.io/belastingcalculator/"'), f, 'old belastingcalculator link (without /en/) is still present');
  if (all) sisterPages++;
}
ok(sisterPages === html.length, `sister footer on ${sisterPages} of ${html.length} generated pages`);
const htmlFiles = files.filter(f => f.endsWith('.html'));
console.log(`sister links: ${sisterPages}/${html.length} generated pages, ${htmlFiles.length} HTML files in dist/ (${htmlFiles.length - html.length} excluded: ${GOOGLE})`);

// 7. optional: compare with an older build
const base = process.argv[2];
if (base) {
  const old = walk(base).map(f => path.relative(base, f).split(path.sep).join('/')).filter(f => f.endsWith('.html')).sort();
  ok(JSON.stringify(old) === JSON.stringify(html.concat(GOOGLE).sort()), 'the list of HTML pages differs from', base);
  for (const f of ['sitemap.xml', 'robots.txt', GOOGLE]) ok(fs.readFileSync(path.join(base, f), 'utf8') === read(f), f, 'differs from', base);
}

// 8. RSS 2.0 feed for the Recently killed list (dist/killed.xml is not an HTML page and is not in the sitemap)
const RSS_DATE = RFC822;
const altLink = `<link rel="alternate" type="application/rss+xml" title="Recently killed gadgets | DeadOrSupported" href="${SITE}killed.xml">`;
for (const bad of ['<rss></rss', '<rss><a></b></rss>', '<rss>AT&T</rss>', '<rss a=b></rss>', '<rss></rss><rss></rss>', '<rss>&nope;</rss>', '<rss x="1" x="2"/>', '<rss><</rss>']) {
  let threw = false;
  try { parseXml(bad); } catch { threw = true; }
  ok(threw, 'XML parser accepted malformed input:', bad);
}
{
  const sample = parseXml('<?xml version="1.0" encoding="UTF-8"?><r version="2.0"><t>A &amp; B &lt;C&gt; &quot;q&quot; &apos;z&apos;</t></r>');
  ok(sample.attrs.version === '2.0' && xmlText(xmlChild(sample, 't')) === `A & B <C> "q" 'z'`, 'XML parser did not decode the predefined entities');
}
ok(exists('killed.xml'), 'dist/killed.xml is missing');
ok(!sm.includes('killed.xml'), 'killed.xml must not be listed in sitemap.xml');
let rss = null, rssErr = '';
if (exists('killed.xml')) {
  const raw = read('killed.xml');
  ok(raw.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'killed.xml is missing the XML declaration');
  try { rss = parseXml(raw); } catch (e) { rssErr = e.message; }
  ok(!rssErr, 'dist/killed.xml is not well-formed XML:', rssErr);
}
const killedPage = exists('killed.html') ? read('killed.html') : '';
const headEnd = killedPage.indexOf('</head>');
const killedHead = headEnd >= 0 ? killedPage.slice(0, headEnd) : '';
ok(killedHead.includes(altLink), 'killed.html <head> is missing the RSS alternate link');
ok(headEnd >= 0 && !killedPage.slice(headEnd).includes('application/rss+xml'), 'RSS alternate link appears outside killed.html <head>');
const otherRss = html.filter(f => f !== 'killed.html' && read(f).includes('application/rss+xml'));
ok(otherRss.length === 0, 'RSS alternate link is on a page other than killed.html:', otherRss.join(', '));
if (rss) {
  ok(rss.name === 'rss' && rss.attrs.version === '2.0', 'killed.xml root is not <rss version="2.0">', rss.name, rss.attrs.version);
  ok(rss.attrs['xmlns:atom'] === 'http://www.w3.org/2005/Atom', 'killed.xml is missing the atom namespace');
  const channels = xmlElems(rss).filter(e => e.name === 'channel');
  const channel = channels[0];
  ok(channels.length === 1 && xmlText(xmlChild(channel, 'title')) === 'Recently killed gadgets | DeadOrSupported', 'channel title missing or wrong');
  ok(channel && xmlText(xmlChild(channel, 'link')) === SITE + 'killed.html', 'channel link missing or wrong');
  ok(channel && xmlText(xmlChild(channel, 'description')) === 'The latest gadgets and smart-home devices to lose updates or cloud service, newest first.', 'channel description missing or wrong');
  ok(channel && xmlText(xmlChild(channel, 'language')) === 'en', 'channel language missing or wrong');
  const built = channel && xmlText(xmlChild(channel, 'lastBuildDate'));
  ok(RSS_DATE.test(built || '') && !Number.isNaN(Date.parse(built)), 'lastBuildDate is not an RFC 822 date', built);
  const self = channel ? xmlElems(channel).filter(e => e.name === 'atom:link') : [];
  ok(self.length === 1 && self[0].children.length === 0 && self[0].attrs.href === SITE + 'killed.xml' && self[0].attrs.rel === 'self' && self[0].attrs.type === 'application/rss+xml', 'atom:link self is missing or wrong');
  const items = channel ? xmlElems(channel).filter(e => e.name === 'item') : [];
  const timeline = (killedPage.match(/<ul class="feed timeline">([\s\S]*?)<\/ul>/) || [, ''])[1];
  const shown = [...timeline.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1]).filter(li => /<span class="badge st-dead">/.test(li) && /<time datetime="\d{4}-\d{2}(?:-\d{2})?"/.test(li));
  ok(shown.length > 0, 'killed.html shows no dead devices with an end-of-support date');
  ok(items.length === shown.length, `killed.xml has ${items.length} items but killed.html shows ${shown.length} dead devices with an end date`);
  shown.forEach((li, n) => {
    const it = items[n];
    const title = xmlText(xmlChild(it, 'title'));
    const link = xmlText(xmlChild(it, 'link'));
    const guidEl = xmlChild(it, 'guid');
    const pub = xmlText(xmlChild(it, 'pubDate'));
    const href = (li.match(/<a href="(device\/[^"]+\.html)">/) || [])[1];
    const eos = (li.match(/<time datetime="(\d{4}-\d{2}(?:-\d{2})?)"/) || [])[1];
    const expectPub = eos ? new Date(eos.length === 7 ? eos + '-28' : eos).toUTCString() : '';
    const pageName = unesc((li.match(/<a href="device\/[^"]+\.html">([^<]*)<\/a>/) || [])[1] || '');
    ok(!!title && title === pageName, 'item title does not match the device on killed.html', title, pageName);
    ok(!!href && link === SITE + href && link.startsWith(SITE + 'device/') && link.endsWith('.html') && exists(urlToFile(link)), 'item link is not an absolute URL of a built device page', link);
    ok(!!guidEl && guidEl.attrs.isPermaLink === 'true' && xmlText(guidEl) === link, 'guid is not a permalink equal to the item link', link);
    ok(RSS_DATE.test(pub) && pub === expectPub && !Number.isNaN(Date.parse(pub)), 'pubDate is not the RFC 822 end-of-support date', link, pub, expectPub);
    ok(!!xmlChild(it, 'description') && xmlText(xmlChild(it, 'description')) === unesc((li.match(/<p class="tl-note">([^<]*)<\/p>/) || [])[1] || ''), 'item description does not match the device note', title);
  });
}

console.log(`${html.length} pages, ${linkCount} internal links, ${withProduct} pages with the own-product box, ${checks} checks`);
console.log(fails ? `${fails} FAILED` : 'ALL CHECKS PASSED');
process.exit(fails ? 1 : 0);
