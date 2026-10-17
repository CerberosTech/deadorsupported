import fs from 'fs';
const SITE = 'https://cerberostech.github.io/deadorsupported/';
const TODAY = new Date(new Date().toISOString().slice(0,10)); // build date = today
const data = JSON.parse(fs.readFileSync('data/devices.json','utf8'));
const esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const toDate = e => e ? new Date(e.length===7? e+'-28': e) : null;
for (const d of data){
  d.slug = slug(d.name); d.bslug = slug(d.brand);
  const t=toDate(d.eos);
  if (d.status==='auto'){ const days=(t-TODAY)/864e5; d.status = days<0?(d.dateLabel?'expired':'dead'):days<365?'ending':'supported'; }
  if (d.status==='dead'&&t&&t>TODAY) d.status='ending';
}
const LABEL={supported:'Supported',ending:'Ending soon',expired:'Guarantee expired',dead:'Dead'};
const ANSWER={supported:'Yes, it is still supported.',ending:'Yes, for now, but support ends soon.',expired:'Its guaranteed update period has ended; updates may stop at any time.',dead:'No. It no longer gets updates or service.'};
const fmt = e => !e?'Unknown':e.length===7? new Date(e+'-01').toLocaleDateString('en-GB',{month:'long',year:'numeric'}) : new Date(e).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});

// --- design: status icons (used as CSS masks, so they take the text colour) ---
const svgUri=s=>`url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const knock=(shape,glyph)=>`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><mask id='m'><rect width='24' height='24' fill='#fff'/><g fill='none' stroke='#000' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'>${glyph}</g></mask><g mask='url(#m)'>${shape}</g></svg>`;
const DISC=`<circle cx='12' cy='12' r='11'/>`;
const ICON={ // every status has its own shape, so it never relies on colour alone
 supported:knock(DISC,`<path d='M7 12.4l3.3 3.3L17 9'/>`),
 ending:knock(DISC,`<path d='M12 6.6V12l3.6 2.3'/>`),
 expired:knock(`<path d='M12 2.6 22.6 21H1.4z' stroke='#000' stroke-width='2' stroke-linejoin='round'/>`,`<path d='M12 9v4.4'/><circle cx='12' cy='17.2' r='.3'/>`),
 dead:knock(`<path d='M7.75 1.75h8.5l6 6v8.5l-6 6h-8.5l-6-6v-8.5z' stroke='#000' stroke-width='1.5' stroke-linejoin='round'/>`,`<path d='M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8'/>`),
 unknown:knock(DISC,`<path d='M9.4 9.5a2.7 2.7 0 1 1 3.8 2.5c-.8.4-1.2.9-1.2 1.7v.3'/><circle cx='12' cy='17.3' r='.3'/>`),
 ext:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#000' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M14 4h6v6M20 4l-9 9'/></svg>`,
 chev:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#000' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M5 9l7 7 7-7'/></svg>`};
const css = `:root{--bg:#f5f7fa;--surface:#fff;--ink:#142036;--muted:#4a5568;--line:#d6dce5;--edge:#7b8698;--soft:#edf1f6;--link:#1f4fd1;--focus:#1f4fd1;--live:#13804d;--flat:#c7291f;--cta:#142036;--cta-text:#c5cfdf;--tap:44px;
--ok:#0a6b3d;--ok-bg:#e1f5e9;--ok-solid:#13804d;--soon:#874400;--soon-bg:#fff0cc;--soon-solid:#f5b12e;--exp:#5a2dbf;--exp-bg:#eee8ff;--exp-solid:#6b43d6;--dead:#a8201a;--dead-bg:#fde5e2;--dead-solid:#c7291f;
--display:Bahnschrift,"DIN Alternate","DIN Next","Roboto Condensed",sans-serif-condensed,"Arial Narrow",system-ui,sans-serif;--body:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
--chev:${svgUri(ICON.chev)};color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#0c1422;--surface:#131d31;--ink:#e5eaf2;--muted:#a3aec0;--line:#29364f;--soft:#1a263d;--link:#8db1ff;--focus:#8db1ff;--live:#3fca7d;--flat:#ff6b5e;--cta:#1c2945;--ok:#7bdca2;--ok-bg:#0f2d20;--soon:#ffc35a;--soon-bg:#32240b;--exp:#c2aeff;--exp-bg:#251b46;--dead:#ff9a92;--dead-bg:#3a1618}}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;background:var(--bg);color:var(--ink);font:1rem/1.6 var(--body);overflow-wrap:break-word}
main{flex:1 0 auto}
[tabindex="-1"]:focus{outline:0}
[hidden]{display:none!important}
a{color:var(--link);text-decoration-thickness:1px;text-underline-offset:.2em}
a:hover{text-decoration-thickness:2px}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
h1,h2,h3{margin:0 0 .5em;font-family:var(--display);font-weight:700;line-height:1.15;letter-spacing:-.01em;text-wrap:balance}
h2{font-size:1.5rem}
h3{font-size:1.1875rem}
p,ul,ol{margin:0 0 1em}
.wrap{width:100%;max-width:74rem;margin-inline:auto;padding-inline:clamp(1rem,4vw,2rem)}
.sr-only{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip{position:absolute;top:-6rem;left:1rem;z-index:9;display:inline-flex;align-items:center;min-height:var(--tap);padding:0 1rem;border-radius:8px;background:var(--ink);color:var(--surface);font-weight:700;text-decoration:none}
.skip:focus{top:.75rem}
.muted{color:var(--muted)}
.more{display:inline-flex;align-items:center;min-height:var(--tap);font-weight:600}
.crumbs a,.facts dd a,.mini a,.dated a,.timeline h2 a,.checked a,.product-act p a{min-width:var(--tap)}

/* header: inline navigation on wide screens, a menu button on narrow ones (the list stays visible without JavaScript) */
.site-head{background:var(--surface);border-bottom:1px solid var(--line)}
.site-head .wrap{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0 2rem;padding-block:.375rem}
.logo{display:inline-flex;align-items:center;gap:.5rem;min-height:var(--tap);color:var(--ink);font:700 1.3125rem/1 var(--display);letter-spacing:-.015em;text-decoration:none}
.logo span span{color:var(--muted)}
.mark{flex:none;width:2.25rem;height:1.35rem}
.mark path,.pulse path{fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.mark .live,.pulse .live{stroke:var(--live)}
.mark .flat,.pulse .flat{stroke:var(--flat)}
.nav ul{display:flex;flex-wrap:wrap;align-items:center;gap:0 1.1rem;margin:0;padding:0;list-style:none}
.nav a{display:flex;align-items:center;min-height:var(--tap);color:var(--ink);font-size:.9375rem;font-weight:600;text-decoration:none}
.nav a:hover,.nav a[aria-current=page]{color:var(--link);text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.45em}
.nav .nav-cta{padding:0 1.1rem;border-radius:999px;background:var(--ink);color:var(--surface);text-decoration:none}
.nav .nav-cta:hover,.nav .nav-cta[aria-current=page]{background:var(--link);color:var(--surface);text-decoration:none}
.menu-btn{display:none}
@media (max-width:55.99rem){
.js .menu-btn{display:inline-flex;align-items:center;gap:.45rem;min-height:var(--tap);padding:0 1rem 0 .8rem;border:1px solid var(--edge);border-radius:999px;background:var(--surface);color:var(--ink);font:600 .9375rem/1 var(--body);cursor:pointer}
.menu-btn svg{width:1.2rem;height:1.2rem;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
.menu-btn[aria-expanded=true] .i-open,.menu-btn[aria-expanded=false] .i-close{display:none}
.js .nav{display:none;flex:1 0 100%}
.js .nav.open{display:block}
.js .nav ul{flex-direction:column;align-items:stretch;padding:.25rem 0 .75rem}
.js .nav li+li{border-top:1px solid var(--line)}
.js .nav a{min-height:3rem;font-size:1.0625rem}
.js .nav .nav-cta-li{margin-top:.6rem;border-top:0}
.js .nav .nav-cta{justify-content:center}
}

/* homepage hero and finder */
.hero{padding-block:clamp(2.25rem,7vw,4.5rem) clamp(1.75rem,4vw,2.5rem);background:var(--surface);border-bottom:1px solid var(--line)}
.hero h1{margin:0;font-size:clamp(2.4rem,7.4vw,4.5rem);line-height:1;letter-spacing:-.03em}
.pulse{display:block;width:min(100%,27rem);height:auto;margin:1.1rem 0 1.3rem}
.pulse path{stroke-width:3}
@media (prefers-reduced-motion:no-preference){.pulse{animation:trace 1.6s cubic-bezier(.5,0,.2,1) .15s both}}
@keyframes trace{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0)}}
.lead{max-width:38rem;margin:0 0 1.6rem;color:var(--muted);font-size:clamp(1.0625rem,1.8vw,1.25rem);line-height:1.55}
.search{display:flex;align-items:center;max-width:44rem;padding:.3rem .3rem .3rem 1rem;background:var(--surface);border:2px solid var(--ink);border-radius:12px}
.search:focus-within{outline:3px solid var(--focus);outline-offset:2px}
.search svg{flex:none;width:1.3rem;height:1.3rem;fill:none;stroke:var(--muted);stroke-width:2.2;stroke-linecap:round}
.search input{flex:1;min-width:0;min-height:var(--tap);padding:0 .6rem;border:0;background:none;color:inherit;font:inherit;font-size:1.125rem;-webkit-appearance:none;appearance:none}
.search input:focus{outline:0}
.search input::placeholder{color:var(--muted);opacity:1}
.search button{flex:none;min-height:var(--tap);padding:0 1.15rem;border:0;border-radius:8px;background:var(--ink);color:var(--surface);font:inherit;font-weight:700;cursor:pointer}
.search button:hover{background:var(--link)}
.search button:focus-visible{outline:2px solid var(--surface);outline-offset:-5px}
.filters{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem;margin-top:1rem}
.chips{flex:1 1 100%;min-width:0;min-inline-size:0;margin:0;padding:0;border:0}
.chip-row{display:flex;flex-wrap:wrap;gap:.5rem}
@media (min-width:48rem){.chips{flex:0 1 auto}}
.chip{position:relative;display:inline-flex;flex:none}
.chip input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}
.chip-face{display:inline-flex;align-items:center;gap:.4rem;min-height:var(--tap);padding:0 .85rem;border:1px solid var(--edge);border-radius:999px;background:var(--surface);font-size:.9375rem;font-weight:600;line-height:1.2;white-space:nowrap}
@media (max-width:33.99rem){.chip-row{gap:.4rem}.chip-face{gap:.3rem;padding:0 .7rem;font-size:.875rem}}
.chip-face .ic{color:var(--c)}
.chip-face .ct{color:var(--muted);font-weight:500;font-variant-numeric:tabular-nums}
.chip:hover .chip-face{border-color:var(--ink)}
.chip input:checked+.chip-face{border-color:var(--ink);background:var(--ink);color:var(--surface)}
.chip input:checked+.chip-face .ic,.chip input:checked+.chip-face .ct{color:inherit}
.chip input:focus-visible+.chip-face{outline:3px solid var(--focus);outline-offset:2px}
.select{position:relative;display:inline-flex;color:var(--ink)}
.select select{min-height:var(--tap);padding:0 2.3rem 0 .95rem;border:1px solid var(--edge);border-radius:999px;background:var(--surface);color:inherit;font:inherit;font-size:.9375rem;font-weight:600;line-height:1.2;cursor:pointer;-webkit-appearance:none;appearance:none}
.select select:hover{border-color:var(--ink)}
.select::after{content:"";position:absolute;top:50%;right:.9rem;width:.75rem;height:.75rem;margin-top:-.375rem;background:currentColor;-webkit-mask:var(--chev) center/contain no-repeat;mask:var(--chev) center/contain no-repeat;pointer-events:none}
.checked{display:flex;flex-wrap:wrap;align-items:center;gap:0 .6rem;margin:1rem 0 0;color:var(--muted);font-size:.9375rem}
.checked::before{content:"";flex:none;width:.55rem;height:.55rem;border-radius:50%;background:var(--live);box-shadow:0 0 0 3px var(--ok-bg)}
.checked a{display:inline-flex;align-items:center;min-height:var(--tap)}

/* device directory: cards in a grid, compact rows on narrow screens */
.results{padding-block:2rem 3rem}
.results-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.25rem 1rem;margin-bottom:1rem}
.results-head h2{margin:0;font-size:1.6rem}
.count{margin:0;color:var(--muted);font-variant-numeric:tabular-nums}
.empty{max-width:44rem;margin:1rem 0 0;padding:1.1rem 1.3rem;background:var(--surface);border:1px dashed var(--edge);border-radius:12px}
.show-all{display:flex;justify-content:center}
.show-all .btn{margin-top:1.25rem}
.card{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:14px}
.card:hover{border-color:var(--ink)}
.card-link{color:var(--ink);text-decoration:none}
.card-link::after{content:"";position:absolute;inset:-1px;border-radius:14px}
.card-link:focus-visible{outline:0}
.card-link:focus-visible::after{outline:3px solid var(--focus);outline-offset:2px}
.card:hover .card-link{text-decoration:underline;text-decoration-thickness:1px}
.entries{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,15.5rem),1fr));gap:.75rem;margin:0;padding:0;list-style:none}
.entry{display:flex;flex-direction:column;padding:.85rem 1rem .9rem}
.entry .badge{order:-1;align-self:flex-start;margin-bottom:.55rem}
.entry h3{margin:0 0 .75rem;font-size:1.1875rem;line-height:1.2}
.entry-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.3rem 1rem;margin-top:auto;padding-top:.6rem;border-top:1px dashed var(--line)}
@media (max-width:33.99rem){
.entries{gap:.5rem}
.entry{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:.25rem .75rem;padding:.7rem .9rem .75rem}
.entry h3{grid-column:1;grid-row:1;margin:0;font-size:1.125rem}
.entry .badge{grid-column:2;grid-row:1;margin:0}
.entry-foot{grid-column:1/-1;flex-direction:column;align-items:flex-start;gap:.1rem;margin:0;padding:0;border:0}
}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:.25rem .5rem;margin:0;color:var(--muted);font-size:.875rem}
.tag{padding:0 .4rem;border:1px solid var(--line);border-radius:5px;font-size:.8125rem;line-height:1.5}
.when{display:flex;flex-wrap:wrap;gap:0 .4rem;margin:0;color:var(--muted);font-size:.875rem}
.when b{color:var(--ink);font-variant-numeric:tabular-nums}

/* status badges: colour + icon shape + text */
.badge{display:inline-flex;align-items:center;gap:.35rem;padding:.15rem .6rem .15rem .42rem;border:1px solid transparent;border-radius:999px;background:var(--t);color:var(--c);font:700 .8125rem/1.4 var(--body);white-space:nowrap}
.ic{display:inline-block;flex:none;width:1.05em;height:1.05em;background:currentColor;-webkit-mask:var(--i) center/contain no-repeat;mask:var(--i) center/contain no-repeat}
.st-supported{--c:var(--ok);--t:var(--ok-bg);--s:var(--ok-solid);--on:#fff;--i:${svgUri(ICON.supported)}}
.st-ending{--c:var(--soon);--t:var(--soon-bg);--s:var(--soon-solid);--on:#241500;--i:${svgUri(ICON.ending)}}
.st-expired{--c:var(--exp);--t:var(--exp-bg);--s:var(--exp-solid);--on:#fff;--i:${svgUri(ICON.expired)}}
.st-dead{--c:var(--dead);--t:var(--dead-bg);--s:var(--dead-solid);--on:#fff;--i:${svgUri(ICON.dead)}}
.i-unknown{--i:${svgUri(ICON.unknown)}}
.i-ext{--i:${svgUri(ICON.ext)}}

/* homepage: highlights and method */
.highlights{display:grid;gap:1rem;padding-bottom:2.5rem}
@media (min-width:52rem){.highlights{grid-template-columns:1fr 1fr}}
.hl{padding:1.3rem 1.4rem 1.1rem;background:var(--surface);border:1px solid var(--line);border-radius:16px}
.hl h2{display:flex;align-items:center;gap:.5rem;margin-bottom:.75rem;font-size:1.4rem}
.hl h2 .ic{color:var(--c)}
.dated{margin:0 0 .5rem;padding:0;list-style:none}
.dated li{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0 1rem;padding:.15rem 0;border-top:1px solid var(--line)}
.dated a{display:inline-flex;align-items:center;min-height:var(--tap);font-weight:600}
.dated .d{color:var(--muted);font-size:.875rem;font-variant-numeric:tabular-nums;white-space:nowrap}
@media (max-width:33.99rem){.dated li{padding:.6rem 0;display:block}.dated a{position:relative;display:inline-block;min-height:0}.dated a::after{content:"";position:absolute;inset:-.65rem -.25rem}.dated .d{display:block;margin-top:.1rem}} /* narrow: date under the name; ::after keeps the tap area 44 px tall */
.product-wrap{margin-bottom:3rem}
.about{margin-bottom:3rem;padding-block:3.5rem;background:var(--surface);border-block:1px solid var(--line);scroll-margin-top:1rem}
.about-grid{display:grid;gap:2.5rem}
@media (min-width:56rem){.about-grid{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:4.5rem}}
.about h2{font-size:clamp(1.75rem,3.5vw,2.4rem)}
.about h3{margin-bottom:1rem;font-size:1.3rem}
.about-list{margin:0;padding-left:1.2rem}
.about-list li{margin-bottom:.7rem}
.about-list li::marker,.todo li::marker,.prose li::marker{color:var(--muted)}
.key{display:grid;gap:1.1rem;margin:0}
.key div{display:grid;justify-items:start;gap:.35rem}
.key dd{margin:0;color:var(--muted)}

/* device page */
.device{padding-block:clamp(1rem,3vw,1.75rem) 3rem}
.device h1{max-width:24ch;margin:.15rem 0 0;font-size:clamp(1.95rem,4.8vw,3.1rem);line-height:1.05;letter-spacing:-.02em}
.crumbs ol{display:flex;flex-wrap:wrap;align-items:center;margin:0;padding:0;list-style:none;font-size:.9375rem}
.crumbs li{display:inline-flex;align-items:center}
.crumbs li+li::before{content:"";width:.42em;height:.42em;margin:0 .6em 0 .45em;border-top:2px solid var(--edge);border-right:2px solid var(--edge);transform:rotate(45deg)}
.crumbs a{display:inline-flex;align-items:center;min-height:var(--tap);font-weight:600}
.verdict{margin-top:1.5rem;overflow:hidden;background:var(--surface);border:1px solid var(--line);border-radius:20px}
.verdict-band{display:flex;align-items:center;gap:.7rem;padding:1rem clamp(1.1rem,3vw,1.75rem);background:var(--s);color:var(--on)}
.verdict-band .ic{width:clamp(1.9rem,4.5vw,2.6rem);height:clamp(1.9rem,4.5vw,2.6rem)}
.verdict-label{margin:0;font:700 clamp(2rem,6vw,3.25rem)/1 var(--display);letter-spacing:-.02em}
.verdict-body{padding:clamp(1.1rem,3vw,1.75rem)}
.answer{max-width:36em;margin:0 0 .45rem;font-size:clamp(1.1875rem,2.5vw,1.5rem);font-weight:700;line-height:1.35}
.note{max-width:42em;margin:0 0 1.4rem;font-size:1.0625rem}
.facts{display:grid;grid-template-columns:1fr 1fr;gap:.9rem 1.25rem;margin:0;padding:1rem 1.15rem;background:var(--soft);border-radius:12px}
.facts .key-date{grid-column:1/-1}
@media (min-width:48rem){.facts{grid-template-columns:1.6fr 1fr 1fr 1fr}.facts .key-date{grid-column:auto}}
.facts dt{margin-bottom:.15rem;color:var(--muted);font-size:.8125rem;line-height:1.35}
.facts dd{margin:0;font-weight:700}
.facts .key-date dd{font:700 1.5rem/1.15 var(--display);font-variant-numeric:tabular-nums}
.facts dd a{display:inline-flex;align-items:center;min-height:var(--tap);margin-block:-.6rem}
.warn{display:flex;align-items:flex-start;gap:.55rem;margin:1rem 0 0;padding:.7rem .95rem;border-radius:10px;background:var(--soon-bg);color:var(--soon);font-size:.9375rem;font-weight:600}
.warn .ic{margin-top:.22em}
.with-aside{display:grid;gap:2.5rem;margin-top:2.75rem}
@media (min-width:60rem){.with-aside{grid-template-columns:minmax(0,1fr) 22rem;gap:3rem}}
.page .with-aside{margin-top:0}
.device-main{max-width:44rem}
.block{margin-bottom:2.5rem}
.block>p:last-child{margin-bottom:0}
.todo{margin:0;padding-left:1.25rem}
.todo li{margin-bottom:.55rem;padding-left:.15rem}
.source{display:block;padding:.95rem 1.1rem;background:var(--surface);border:1px solid var(--line);border-radius:12px;color:var(--ink);text-decoration:none}
.source:hover{border-color:var(--ink)}
.source b{display:inline-flex;align-items:center;gap:.4rem;color:var(--link);font-size:1.0625rem}
.source:hover b{text-decoration:underline}
.source .ic{width:.85em;height:.85em}
.path{display:block;margin-top:.15rem;color:var(--muted);font-size:.8125rem;overflow-wrap:anywhere}
.method-note{margin:.9rem 0 0;color:var(--muted);font-size:.9375rem}
.side{display:grid;grid-template-columns:minmax(0,1fr);gap:1.25rem;align-content:start}
.aside-block{margin-bottom:1.25rem;padding:1.15rem 1.25rem 1.1rem;background:var(--surface);border:1px solid var(--line);border-radius:16px}
.side .aside-block{margin:0}
.aside-block h2{margin-bottom:.6rem;font-size:1.25rem}
.mini{margin:0 0 .4rem;padding:0;list-style:none}
.mini li{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0 .75rem;padding:.1rem 0;border-top:1px solid var(--line)}
.mini li:first-child{border-top:0}
.mini a{display:inline-flex;align-items:center;min-height:var(--tap);font-weight:600}
.search-sm{padding-left:.75rem;border-width:1px;border-color:var(--edge)}
.search-sm input{padding:0 .5rem;font-size:1rem}
.search-sm button{padding:0 .85rem}

/* our own product: always labelled, so it is never mistaken for editorial content. The layout follows the width of the box. */
.product{container-type:inline-size}
.product-box{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"art label" "copy copy" "act act";align-items:center;gap:.7rem .75rem;padding:1.15rem 1.2rem .85rem;background:var(--surface);border:1px solid var(--line);border-radius:16px}
.product-art{grid-area:art;display:block;width:2.4rem;height:auto}
.pa-back{fill:var(--soft);stroke:var(--edge);stroke-width:2}
.pa-page{fill:var(--surface);stroke:var(--ink);stroke-width:2.5}
.pa-line{fill:none;stroke:var(--edge);stroke-width:3;stroke-linecap:round}
.pa-ok,.pa-no{fill:none;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
.pa-ok{stroke:var(--live)}
.pa-no{stroke:var(--flat)}
.product-label{grid-area:label;display:flex;align-items:center;gap:.45rem;margin:0;color:var(--muted);font:700 .875rem/1.4 var(--body);letter-spacing:0}
.product-label .mark{width:1.55rem;height:.95rem}
.product-copy{grid-area:copy;margin:0;font-size:1.0625rem;font-weight:600;line-height:1.45}
.product-act{grid-area:act;display:flex;flex-wrap:wrap;align-items:center;gap:0 1rem}
.product-act p{margin:0;color:var(--muted);font-size:.875rem}
.product-act p a{display:inline-flex;align-items:center;min-height:var(--tap)}
@container (min-width:26rem){
.product-box{grid-template-areas:"art label" "art copy" "art act";align-items:start;gap:.35rem 1.15rem;padding:1.3rem 1.4rem .9rem}
.product-art{width:3.6rem;margin-top:.2rem}
.product-act{margin-top:.6rem}
}
@container (min-width:48rem){
.product-box{grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"art label act" "art copy act";align-items:center;gap:.3rem 2.25rem;padding:1.6rem 2rem}
.product-art{width:4.5rem;margin:0}
.product-label{align-self:end}
.product-copy{align-self:start;max-width:46rem;font-size:1.1875rem}
.product-act{flex-direction:column;margin:0}
.product-act p{margin-bottom:-.6rem}
}

/* newsletter call to action */
.cta{margin-block:0 3.5rem}
.cta-box{display:grid;gap:1.4rem;align-items:center;padding:clamp(1.5rem,4.5vw,2.75rem);border-radius:22px;background:var(--cta);color:#fff}
@media (min-width:48rem){.cta-box{grid-template-columns:minmax(0,1fr) auto;gap:2.5rem}}
@media (prefers-color-scheme:dark){.cta-box{border:1px solid var(--line)}}
.cta-box h2{margin:0 0 .45rem;font-size:clamp(1.65rem,3.6vw,2.35rem);line-height:1.08}
.cta-box p{max-width:34rem;margin:0;color:var(--cta-text)}
.cta-box .btn{justify-self:start}
.cta-box :focus-visible{outline-color:#fff}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:var(--tap);padding:.7rem 1.35rem;border:0;border-radius:999px;background:var(--ink);color:var(--surface);font:700 1rem/1.2 var(--body);text-decoration:none;cursor:pointer}
.btn:hover{background:var(--link);color:var(--surface)}
.btn-line{border:1px solid var(--edge);background:var(--surface);color:var(--ink)}
.btn-line:hover{border-color:var(--ink);background:var(--surface);color:var(--ink);text-decoration:underline}
.btn-light{padding:.95rem 1.6rem;background:#fff;color:#142036;font-size:1.0625rem}
.btn-light:hover{background:#dfe7f5;color:#142036}
.btn .ic{width:.9em;height:.9em}

/* affiliate replacement on device pages: a framed box with an "Affiliate link" tag, so it is never mistaken for editorial content */
.replace{padding:1.15rem 1.25rem 1rem;background:var(--surface);border:1px solid var(--line);border-radius:16px}
.replace-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.35rem .75rem;margin-bottom:.45rem}
.replace-head h2{margin:0}
.ad-tag{display:inline-flex;align-items:center;padding:.05rem .6rem;border:1px solid var(--edge);border-radius:999px;color:var(--muted);font-size:.8125rem;font-weight:700;line-height:1.5}
.replace-intro{margin:0 0 .9rem;font-size:1.0625rem}
.replace-links{display:flex;flex-wrap:wrap;gap:.6rem;margin:0 0 .5rem;padding:0;list-style:none}
.replace-links .btn{text-align:center}
@media (max-width:29.99rem){.replace-links li{flex:1 0 100%}.replace-links .btn{width:100%}}
.replace-note{margin:0;color:var(--muted);font-size:.875rem}
.replace-note a{display:inline-flex;align-items:center;min-width:var(--tap);min-height:var(--tap)}
@media print{.replace{display:none!important}}

/* footer */
.site-foot{padding-block:2.5rem 3rem;background:var(--surface);border-top:1px solid var(--line);color:var(--muted);font-size:.9375rem}
.foot{display:grid;gap:2rem}
@media (min-width:48rem){.foot{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:3rem}}
.foot p{max-width:34rem;margin:.75rem 0 0}
.foot nav{display:grid;grid-template-columns:1fr 1fr;gap:0 1.5rem;align-content:start}
.foot ul{display:grid;margin:0;padding:0;list-style:none}
.foot nav a{display:flex;align-items:center;min-height:var(--tap);color:var(--ink);font-weight:600;text-decoration:none}
.foot nav a:hover{color:var(--link);text-decoration:underline}

/* inner pages */
.page{padding-block:clamp(1.5rem,4vw,3rem) 3rem}
.page-head{max-width:50rem;margin-bottom:2.25rem}
.page-head h1,.prose h1{margin:0 0 .6rem;font-size:clamp(2.1rem,5.6vw,3.5rem);line-height:1.04;letter-spacing:-.025em}
.page-head .lead{margin:0}
.split-bar{display:flex;gap:3px;max-width:36rem;height:.65rem;margin:1.3rem 0 .9rem;overflow:hidden;border-radius:999px}
.split-bar span{min-width:6px;background:var(--s)}
.split-key{display:flex;flex-wrap:wrap;gap:.5rem 1.1rem;margin:0;padding:0;list-style:none}
.split-key li{display:inline-flex;align-items:center;gap:.45rem;font-weight:700;font-variant-numeric:tabular-nums}
.group{margin-top:2.75rem}
.group-h{display:flex;flex-wrap:wrap;align-items:center;gap:.25rem .55rem;margin-bottom:1rem;font-size:1.6rem}
.group-h .ic{color:var(--c)}
.group-h small{color:var(--muted);font:600 1rem/1.2 var(--body)}
.brand-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr));gap:.75rem;margin:0;padding:0;list-style:none}
.brand-card{padding:1.1rem 1.25rem 1.2rem}
.brand-card h2{margin:0 0 .1rem;font-size:1.375rem}
.brand-card .split-bar{height:.5rem;margin:.8rem 0 .6rem}
.split-text{margin:0;color:var(--muted);font-size:.875rem}
.feed{margin:0;padding:0;list-style:none}
.timeline{max-width:48rem;margin-left:.35rem;padding-left:1.6rem;border-left:2px solid var(--line)}
.timeline li{position:relative;padding-bottom:2.1rem}
.timeline li:last-child{padding-bottom:.25rem}
.timeline li::before{content:"";position:absolute;top:.38rem;left:calc(-1.6rem - 7px);width:12px;height:12px;border-radius:50%;background:var(--dead-solid);box-shadow:0 0 0 4px var(--bg)}
.tl-date{display:flex;flex-wrap:wrap;align-items:center;gap:.35rem .7rem;margin:0 0 .1rem;font:700 1.0625rem/1.3 var(--display);font-variant-numeric:tabular-nums}
.timeline h2{margin:0 0 .1rem;font-size:1.3rem}
.timeline h2 a{display:inline-flex;align-items:center;min-height:var(--tap)}
.timeline .meta{margin-bottom:.45rem}
.tl-note{max-width:40rem;margin:0;color:var(--muted)}
.article-list{display:grid;gap:1rem;max-width:50rem}
.article-card{padding:1.5rem 1.6rem}
.article-card h2{margin:0 0 .5rem;font-size:clamp(1.4rem,3vw,1.8rem);line-height:1.15}
.article-card p{margin:0 0 .6rem;color:var(--muted)}
.article-card p:last-child{margin:0}
.article-card .meta{font-size:.875rem}

/* long-form text: articles and disclosure */
.prose{max-width:42rem}
.article-head{margin-bottom:2rem;padding-bottom:1.25rem;border-bottom:1px solid var(--line)}
.article-meta{margin:0;color:var(--muted)}
.prose h2{margin:2.5rem 0 .75rem;font-size:clamp(1.45rem,3vw,1.9rem);line-height:1.15}
.prose h3{margin:2rem 0 .5rem;font-size:1.3rem}
.prose p,.prose li{font-size:1.0625rem;line-height:1.7}
.prose>p:first-of-type{font-size:1.25rem;line-height:1.6}
.prose ul,.prose ol{margin:0 0 1.25rem;padding-left:1.3rem}
.prose li{margin-bottom:.45rem}
.prose a{overflow-wrap:anywhere}
.table-wrap{margin:1.5rem 0;overflow-x:auto}
.prose table{width:100%;border-collapse:collapse;font-size:.9375rem;font-variant-numeric:tabular-nums}
.prose th{padding:.55rem .9rem .55rem 0;border-bottom:2px solid var(--ink);text-align:left;vertical-align:bottom}
.prose td{padding:.6rem .9rem .6rem 0;border-bottom:1px solid var(--line);vertical-align:top}
.prose code{padding:.1em .35em;border-radius:5px;background:var(--soft);font:.9em var(--mono)}
.prose pre{overflow:auto;padding:1rem 1.1rem;border-radius:12px;background:var(--soft)}
.prose pre code{padding:0;background:none}
.callout{padding:1rem 1.25rem;background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--ink);border-radius:0 12px 12px 0}

/* tip form */
.tip-grid{display:grid;gap:2rem;align-items:start}
@media (min-width:56rem){.tip-grid{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:3.5rem}}
.tip-form{display:grid;gap:1.1rem;padding:clamp(1.25rem,3vw,1.75rem);background:var(--surface);border:1px solid var(--line);border-radius:18px}
.notice{margin:0;padding:.7rem .95rem;border-radius:10px;background:var(--soft);font-size:.9375rem}
.field{display:grid;gap:.35rem}
.field label{font-weight:700}
.opt{color:var(--muted);font-weight:400}
.field input,.field textarea{width:100%;min-height:var(--tap);padding:.6rem .85rem;border:1px solid var(--edge);border-radius:10px;background:var(--surface);color:var(--ink);font:inherit}
.field textarea{resize:vertical}
.tip-form .btn{justify-self:start}
.tip-help h2{font-size:1.35rem}
.tip-help ul{padding-left:1.2rem}
.tip-help li{margin-bottom:.5rem}

@media (forced-colors:active){.ic,.select::after{forced-color-adjust:none;background:CanvasText}.chip input:checked+.chip-face{outline:3px solid Highlight}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
@media print{.site-head nav,.menu-btn,.skip,.cta,.product,.device-aside,.side,.filters,.search{display:none!important}body{background:#fff;color:#000}}
`;
const pages=[];
const BUILT=TODAY.toISOString().slice(0,10);
const stamp=e=>e?`<time datetime="${e}">${fmt(e)}</time>`:fmt(e);
const NAV=[['index.html','Devices'],['brands.html','Brands'],['killed.html','Recently killed'],['articles/index.html','Articles'],['tip.html','Submit a tip'],['newsletter.html','Newsletter']];
const MARK='<svg class="mark" viewBox="0 0 40 24" aria-hidden="true" focusable="false"><path class="live" d="M2 12h8l3-7 4.5 14 3.5-10 2 3h4"/><path class="flat" d="M27 12h11"/></svg>';
const logo=r=>`<a class="logo" href="${r}index.html">${MARK}<span>Dead<span>Or</span>Supported</span></a>`;

// --- head: search-result titles and descriptions, social cards, icons ---
const TITLE_MAX=60,DESC_MAX=155;
const clip=(s,n)=>{s=String(s).replace(/\s+/g,' ').trim();if(s.length<=n)return s;const cut=s.slice(0,n-1),sp=cut.lastIndexOf(' ');return (sp>n*.6?cut.slice(0,sp):cut).replace(/[\s,;:.(–—-]+$/,'')+'…'};
const fit=list=>list.find(t=>t.length<=TITLE_MAX)??clip(list.at(-1),TITLE_MAX); // first candidate that fits, else a shortened last one
const OG_IMAGE=SITE+'og.png';
const OG_ALT='DeadOrSupported: is your gadget dead or supported? Status labels for supported, ending soon, guarantee expired and dead devices.';
const HEAD_JS=`<script>document.documentElement.classList.add('js');addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.menu-btn');if(!b)return;const o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',o);document.getElementById(b.getAttribute('aria-controls')).classList.toggle('open',o)});addEventListener('keydown',e=>{const b=document.querySelector('.menu-btn[aria-expanded="true"]');if(e.key==='Escape'&&b){b.click();b.focus()}})</script>`;
const MENU_BTN='<button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav"><svg class="i-open" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg class="i-close" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>Menu</button>';
const titles=new Set();
const write=(path,title,desc,body,depth=0,o={})=>{const r='../'.repeat(depth);const url=SITE+path.replace(/(^|\/)index\.html$/,'$1');fs.mkdirSync('dist/'+path.replace(/[^/]*$/,''),{recursive:true});pages.push(url);
const full=fit(o.titles||[`${title} | DeadOrSupported`,title]),d=clip(desc,DESC_MAX);
if(titles.has(full))console.warn('warning: duplicate title: '+full);titles.add(full);
const nav=NAV.map(([h,t])=>`<li${h==='newsletter.html'?' class="nav-cta-li"':''}><a href="${r}${h}"${h==='newsletter.html'?' class="nav-cta"':''}${h===path?' aria-current="page"':''}>${t}</a></li>`).join('');
fs.writeFileSync('dist/'+path,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(full)}</title><meta name="description" content="${esc(d)}"><link rel="canonical" href="${url}"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#131d31" media="(prefers-color-scheme: dark)"><meta property="og:type" content="${o.type||'website'}"><meta property="og:site_name" content="DeadOrSupported"><meta property="og:locale" content="en_GB"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(d)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${OG_IMAGE}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(OG_ALT)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(d)}"><meta name="twitter:image" content="${OG_IMAGE}"><meta name="twitter:image:alt" content="${esc(OG_ALT)}"><link rel="icon" href="${r}favicon.ico" sizes="32x32"><link rel="icon" href="${r}favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="${r}apple-touch-icon.png"><link rel="stylesheet" href="${r}style.css">${HEAD_JS}</head><body><a class="skip" href="#main">Skip to main content</a><header class="site-head"><div class="wrap">${logo(r)}${MENU_BTN}<nav class="nav" id="site-nav" aria-label="Main"><ul>${nav}</ul></nav></div></header><main id="main">${body}</main><footer class="site-foot"><div class="wrap foot"><div>${logo(r)}<p>DeadOrSupported tracks when gadgets lose software updates or cloud service. Data from manufacturer policy pages and reputable tech press. Always check the linked source.</p><p>Last updated ${stamp(BUILT)}. The site is rebuilt every day.</p></div><nav aria-label="Footer"><ul><li><a href="${r}index.html">Devices</a></li><li><a href="${r}brands.html">Brands</a></li><li><a href="${r}killed.html">Recently killed</a></li><li><a href="${r}articles/index.html">Articles</a></li></ul><ul><li><a href="${r}index.html#method">How we check</a></li><li><a href="${r}disclosure.html">Disclosure</a></li><li><a href="${r}tip.html">Submit a tip</a></li><li><a href="${r}newsletter.html">Newsletter</a></li></ul></nav></div></footer><script data-goatcounter="https://deadorsupported.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script></body></html>`)};
const ic='<span class="ic" aria-hidden="true"></span>';
const NEWTAB='<span class="sr-only"> (opens in a new tab)</span>';
const SEARCH_ICON='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>';
const badge=s=>`<span class="badge st-${s}">${ic}${LABEL[s]}</span>`;
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'');
const card=(d,r='')=>`<li class="card entry" data-status="${d.status}" data-cat="${esc(d.category)}" data-q="${esc(norm(d.name+' '+d.brand+' '+d.category))}"><h3><a class="card-link" href="${r}device/${d.slug}.html">${esc(d.name)}</a></h3>${badge(d.status)}<div class="entry-foot"><p class="meta">${esc(d.brand)} <span class="tag">${esc(d.category)}</span></p><p class="when"><span>${d.dateLabel?'Guaranteed until':'End of support'}</span> <b>${stamp(d.eos)}</b></p></div></li>`;
const SUB='https://deadorsupported.beehiiv.com/subscribe';
const newsletter=`<section class="wrap cta"><div class="cta-box"><div><h2>Get the weekly heads-up</h2><p>A short weekly email about gadgets that are losing updates or cloud service. Free, and you can unsubscribe anytime.</p></div><a class="btn btn-light" href="${SUB}" target="_blank" rel="noopener">Subscribe for free<span class="ic i-ext" aria-hidden="true"></span>${NEWTAB}</a></div></section>`;
// our own paid product: shown on the homepage, on dead and ending device pages, and on article pages
const SHOP='https://deadorsupported.gumroad.com/l/bqlcoi';
const PRODUCT_COPY="Buying a used phone? Don't get stuck with a locked, stolen or soon-unpatched one. Our 12-page Safe to Buy Used? checklist, €6.";
const PRODUCT_ART='<svg class="product-art" viewBox="0 0 64 80" aria-hidden="true" focusable="false"><rect class="pa-back" x="15" y="2" width="46" height="60" rx="5"/><rect class="pa-page" x="2" y="15" width="47" height="62" rx="5"/><path class="pa-line" d="M24 33h16M24 47h16M24 61h11"/><path class="pa-ok" d="M9.5 33.5l3 3 5.5-6.5M9.5 47.5l3 3 5.5-6.5"/><path class="pa-no" d="M10 58l6 6m0-6-6 6"/></svg>';
const product=r=>`<section class="product" aria-labelledby="product-h"><div class="product-box">${PRODUCT_ART}<h2 class="product-label" id="product-h">${MARK}Our own product</h2><p class="product-copy">${esc(PRODUCT_COPY)}</p><div class="product-act"><a class="btn" href="${SHOP}" target="_blank" rel="noopener">Get the checklist<span class="ic i-ext" aria-hidden="true"></span>${NEWTAB}</a><p>Sold on Gumroad. <a href="${r}disclosure.html">Disclosure</a></p></div></div></section>`;
// affiliate links for the "Up-to-date replacement" section of device pages. A missing or broken file means no links, never a failed build.
let AFF={};
try{AFF=JSON.parse(fs.readFileSync('data/affiliates.json','utf8'))}catch(e){if(e.code!=='ENOENT')console.warn('warning: data/affiliates.json is not valid JSON, no affiliate links: '+e.message)}
if(!AFF||typeof AFF!=='object'||Array.isArray(AFF))AFF={};
// a value is one entry or an array of entries; entries without a label or an http(s) url are skipped
const affEntries=k=>Object.hasOwn(AFF,k)?[AFF[k]].flat().filter(e=>e&&typeof e==='object'&&e.label&&/^https?:\/\//i.test(e.url||'')):[];
// the device's own entry first; the category default only for devices that no longer get (guaranteed) updates or soon will not
const affOf=d=>{const own=affEntries(d.slug);return own.length||!['dead','ending','expired'].includes(d.status)?own:affEntries('_default:'+slug(d.category))};
const AFF_INTRO={dead:'Looking for a replacement that still gets updates?',expired:'Looking for a replacement that still gets updates?',ending:'Planning ahead? A current model that still gets updates:',supported:"When it's time to upgrade:"};
const replacement=(d,r)=>{const L=affOf(d);return L.length?`<section class="block replace" aria-labelledby="replace-h"><div class="replace-head"><h2 id="replace-h">Up-to-date replacement</h2><span class="ad-tag">${L.length>1?'Affiliate links':'Affiliate link'}</span></div><p class="replace-intro">${AFF_INTRO[d.status]}</p><ul class="replace-links">${L.map(e=>`<li><a class="btn" href="${esc(e.url)}" rel="${esc(e.rel||'sponsored nofollow noopener')}" target="_blank">${esc(e.label)}<span class="ic i-ext" aria-hidden="true"></span>${NEWTAB}</a></li>`).join('')}</ul><p class="replace-note">This may contain affiliate links: if you buy through it we may earn a commission, at no extra cost to you. It never affects our status data. <a href="${r}disclosure.html">Disclosure</a></p></section>`:''};
const miniSearch=r=>`<section class="aside-block"><h2>Check another device</h2><form class="search search-sm" action="${r}index.html" role="search"><label class="sr-only" for="q">Search devices</label>${SEARCH_ICON}<input id="q" name="q" type="search" placeholder="e.g. Pixel 7, Nest Hub" autocomplete="off" spellcheck="false"><button type="submit">Search</button></form></section>`;
const ORDER=Object.keys(LABEL);
const tally=L=>ORDER.map(s=>[s,L.filter(d=>d.status===s).length]).filter(([,n])=>n);
const bar=t=>`<div class="split-bar" aria-hidden="true">${t.map(([s,n])=>`<span class="st-${s}" style="flex-grow:${n}"></span>`).join('')}</div>`;
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;
const MEANING={supported:'It still gets updates or service.',ending:'It still gets updates, but support ends soon, usually within 12 months.',expired:'Its guaranteed update period has ended. Updates may stop at any time.',dead:'It no longer gets updates or service.'};
const MEANS={
 supported:"The maker still sends updates, or still runs the online service it needs. You can keep using it as normal.",
 ending:"It still gets updates for now, but the end is close. After support ends, new security problems will not be fixed, and online features can stop working.",
 expired:"The maker no longer promises updates. It may still get some, but they can stop at any time, without notice.",
 dead:"The maker has ended support. New security problems will not be fixed, and features that depend on the maker's servers may stop working, or may already have stopped."};
const TODO={
 supported:['Turn on automatic updates, so you get fixes as soon as they are released.','Before you buy one second-hand, check how much support it has left.','Get the weekly heads-up below, so you hear when support starts to run out.'],
 ending:['Install every update it still gets.','Start planning a replacement now, before support ends.','Avoid buying one second-hand.'],
 expired:['Check for updates now, and install any that are available.','Treat it as near the end of its life, and plan a replacement.','Avoid buying one second-hand.'],
 dead:['Check the source below to see what has stopped, and what still works.','If it connects to the internet, do not use it for sensitive things such as banking, passwords or home security.','Before you sell or recycle it, sign out of your accounts and reset it to factory settings.','When you replace it, choose a model with a published end-of-support date.']};
const APPS='Keep your apps up to date. App updates often continue for a while after system updates stop.';
const TODO_FOR={ // categories where the risk, and so the advice, is different
 Router:{
  dead:['A router without security fixes puts every device on your network at risk. Replace it as soon as you can.','Check the source below for any last firmware or advice from the maker.','Before you recycle it, reset it to factory settings to remove your Wi-Fi passwords.','Choose a replacement with a published end-of-support date.'],
  expired:['A router without guaranteed security fixes puts every device on your network at risk. Plan to replace it soon.','Check for firmware updates now, and install any that are available.','Choose a replacement with a published end-of-support date.'],
  ending:['Install every firmware update it still gets.','Plan to replace it before support ends. A router without security fixes puts every device on your network at risk.','Choose a replacement with a published end-of-support date.']},
 'Smart home':{dead:["If it depends on the maker's cloud service, it may not work at all any more.",...TODO.dead]},
 Phone:{dead:[APPS,...TODO.dead],expired:[APPS,...TODO.expired]}};
const todo=d=>TODO_FOR[d.category]?.[d.status]||TODO[d.status];
const tables=h=>h.replace(/<table>/g,'<div class="table-wrap"><table>').replace(/<\/table>/g,'</table></div>');
const upd=s=>/^\d{4}-\d{2}(-\d{2})?$/.test(s)?stamp(s):esc(s);
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist/device',{recursive:true});fs.mkdirSync('dist/brand',{recursive:true});
fs.writeFileSync('dist/style.css',css);
// icons and the social card from the brand kit go to the site root (dist/brand/ holds the brand pages)
for(const f of ['favicon.ico','favicon.svg','apple-touch-icon.png','logo-512.png','og.png'])fs.existsSync('brand/'+f)?fs.copyFileSync('brand/'+f,'dist/'+f):console.warn('warning: brand/'+f+' is missing');
// files in static/ are published as they are (the deploy workflow copies them too)
const copyDir=(from,to)=>{for(const e of fs.readdirSync(from,{withFileTypes:true})){const a=from+'/'+e.name,b=to+'/'+e.name;if(e.isDirectory()){fs.mkdirSync(b,{recursive:true});copyDir(a,b)}else fs.copyFileSync(a,b)}};
if(fs.existsSync('static'))copyDir('static','dist');
const cats=[...new Set(data.map(d=>d.category))].sort();
const sorted=[...data].sort((a,b)=>a.name.localeCompare(b.name));
const brands={};for(const d of sorted)(brands[d.brand]??=[]).push(d);
const bnames=Object.keys(brands).sort();
const killed=data.filter(d=>d.status==='dead'&&d.eos).sort((a,b)=>toDate(b.eos)-toDate(a.eos));
const counts={};for(const d of data)counts[d.status]=(counts[d.status]||0)+1;
const ts=d=>d.eos?toDate(d.eos).getTime():Infinity;
const soon=data.filter(d=>d.status==='ending').sort((a,b)=>ts(a)-ts(b)||0);
const dated=L=>`<ul class="dated">${L.map(d=>`<li><a href="device/${d.slug}.html">${esc(d.name)}</a><span class="d">${stamp(d.eos)}</span></li>`).join('')}</ul>`;
const finder=`<form id="find" action="index.html" role="search"><div class="search"><label class="sr-only" for="q">Search devices</label>${SEARCH_ICON}<input id="q" name="q" type="search" placeholder="e.g. Pixel, Nest, Fitbit" autocomplete="off" spellcheck="false"><button type="submit">Search</button></div><div class="filters"><fieldset class="chips"><legend class="sr-only">Filter by status</legend><div class="chip-row"><label class="chip"><input type="radio" name="s" value="" checked><span class="chip-face">All <span class="ct">${data.length}</span></span></label>${ORDER.map(k=>`<label class="chip"><input type="radio" name="s" value="${k}"><span class="chip-face st-${k}">${ic}${LABEL[k]} <span class="ct">${counts[k]||0}</span></span></label>`).join('')}</div></fieldset><span class="select"><label class="sr-only" for="c">Filter by category</label><select id="c" name="c"><option value="">All categories</option>${cats.map(c=>`<option value="${esc(c)}">${esc(c)} (${data.filter(d=>d.category===c).length})</option>`).join('')}</select></span></div></form>`;
const method=`<section class="about" id="method"><div class="wrap about-grid"><div><h2>How we check</h2><p>DeadOrSupported tracks when gadgets lose software updates or cloud service.</p><ul class="about-list"><li>Every status comes from the manufacturer's own pages or reputable press, linked on each device page.</li><li>The site is rebuilt every day, so statuses based on an end date change on time. The "last checked" date is the date of the latest rebuild.</li><li>If we could not confirm an exact date from a primary or press source, the device page says so.</li><li>Affiliate links and sales of our own checklist never affect a device's status, dates or sources. <a href="disclosure.html">Read our disclosure</a>.</li><li>Found a mistake, or a device we are missing? <a href="tip.html">Send us a tip</a> with a source.</li></ul></div><div><h3>What the statuses mean</h3><dl class="key">${ORDER.map(s=>`<div><dt>${badge(s)}</dt><dd>${MEANING[s]}</dd></div>`).join('')}</dl></div></div></section>`;
const FIRST=24; // cards shown before "Show all" when no search or filter is active (all cards show without JavaScript)
const filterJs=`<script>(()=>{const f=document.getElementById('find'),E=f.elements,L=[...document.querySelectorAll('#results>li')],n=document.getElementById('count'),x=document.getElementById('empty'),h=document.getElementById('results-h'),b=document.getElementById('show-all'),T=L.length,u=new URLSearchParams(location.search),s=u.get('s'),c=u.get('c');let all=false;if(u.has('q'))E.q.value=u.get('q');for(const r of E.s)if(r.value===s)r.checked=true;if([...E.c.options].some(o=>o.value===c))E.c.value=c;const run=()=>{const w=E.q.value.toLowerCase().split(' ').map(t=>t.replace(/[^a-z0-9]/g,'')).filter(Boolean),v=E.s.value,k=E.c.value,cut=!all&&!w.length&&!v&&!k;let m=0;for(const e of L){const d=e.dataset,ok=w.every(t=>d.q.includes(t))&&(!v||d.status===v)&&(!k||d.cat===k);e.hidden=!ok||(cut&&m>=${FIRST});m+=ok}n.textContent=m===T?'All '+T+' devices':m+' of '+T+' devices';x.hidden=m>0;b.hidden=!cut||T<=${FIRST}};b.addEventListener('click',()=>{all=true;run();L[${FIRST}].querySelector('a').focus()});f.addEventListener('input',run);f.addEventListener('change',run);f.addEventListener('submit',e=>{e.preventDefault();run();h.focus()});addEventListener('pageshow',run);run()})()</script>`;
write('index.html','Is your gadget still supported? Update and shutdown tracker',`Check if your phone, smart-home device, router, wearable or streaming box still gets updates. ${data.length} devices tracked with sources.`,`<section class="hero"><div class="wrap"><h1>Is your gadget dead or supported?</h1><svg class="pulse" viewBox="0 0 420 40" aria-hidden="true" focusable="false"><path class="live" d="M2 20h100l8-14 12 28 10-24 7 10h50"/><path class="flat" d="M189 20h229"/></svg><p class="lead">Check whether your phone, smart-home device, router, wearable or streaming box still gets updates or cloud service. We track ${data.length} devices, and every one links to its source.</p>${finder}<p class="checked"><span>Last checked ${stamp(BUILT)}.</span> <a href="#method">How we check</a></p></div></section><section class="wrap results"><div class="results-head"><h2 id="results-h" tabindex="-1">All devices</h2><p class="count" id="count" aria-live="polite">All ${data.length} devices</p></div><ul class="entries" id="results">${sorted.map(d=>card(d)).join('')}</ul><div class="show-all"><button class="btn btn-line" id="show-all" type="button" hidden>Show all ${data.length} devices</button></div><p class="empty" id="empty" hidden>No devices match. Check the spelling, try a brand name, or clear the filters. Missing a device? <a href="tip.html">Send us a tip</a>.</p></section><div class="wrap highlights">${soon.length?`<section class="hl st-ending"><h2>${ic}Ending soon</h2>${dated(soon.slice(0,6))}<a class="more" href="index.html?s=ending#results-h">See all ${plural(soon.length,'device')} ending soon</a></section>`:''}${killed.length?`<section class="hl st-dead"><h2>${ic}Recently killed</h2>${dated(killed.slice(0,6))}<a class="more" href="killed.html">See all ${plural(killed.length,'recently killed device')}</a></section>`:''}</div><div class="wrap product-wrap">${product('')}</div>${method}${newsletter}${filterJs}`,0,{titles:['Is your gadget still supported? | DeadOrSupported']});
for(const d of data){const q=`Is the ${d.name} still supported?`;
 const src=new URL(d.source),rel=brands[d.brand].filter(x=>x!==d).sort((a,b)=>(b.category===d.category)-(a.category===d.category)).slice(0,6);
 write(`device/${d.slug}.html`,q,`${d.name}: ${LABEL[d.status]}. ${d.dateLabel||'End of support'}: ${fmt(d.eos)}. ${d.note}`,`<div class="wrap device"><nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="../index.html">All devices</a></li><li><a href="../brand/${d.bslug}.html">${esc(d.brand)}</a></li></ol></nav><h1>${esc(q)}</h1><section class="verdict st-${d.status}"><h2 class="sr-only">Status summary</h2><div class="verdict-band">${ic}<p class="verdict-label">${LABEL[d.status]}</p></div><div class="verdict-body"><p class="answer">${ANSWER[d.status]}</p><p class="note">${esc(d.note)}</p><dl class="facts"><div class="key-date"><dt>${esc(d.dateLabel||'End of support')}</dt><dd>${stamp(d.eos)}</dd></div><div><dt>Last checked</dt><dd>${stamp(BUILT)}</dd></div><div><dt>Brand</dt><dd><a href="../brand/${d.bslug}.html">${esc(d.brand)}</a></dd></div><div><dt>Category</dt><dd>${esc(d.category)}</dd></div></dl>${d.verified?'':'<p class="warn"><span class="ic i-unknown" aria-hidden="true"></span>Exact date not confirmed by a primary or press source.</p>'}</div></section><div class="with-aside"><div class="device-main"><section class="block"><h2>What it means</h2><p>${MEANS[d.status]}</p></section><section class="block"><h2>What to do</h2><ul class="todo">${todo(d).map(t=>`<li>${esc(t)}</li>`).join('')}</ul></section><section class="block"><h2>Source</h2><a class="source" href="${esc(d.source)}" rel="nofollow noopener" target="_blank"><b>${esc(src.hostname)}<span class="ic i-ext" aria-hidden="true"></span></b><span class="path" aria-hidden="true">${esc(src.pathname+src.search)}</span>${NEWTAB}</a><p class="method-note">Always check the linked source. Spot a mistake? <a href="../tip.html">Send us a tip</a>. <a href="../index.html#method">How we check</a></p></section><!-- AFFILIATE_SLOT:${d.slug} -->${replacement(d,'../')}${d.status==='dead'||d.status==='ending'?product('../'):''}</div><aside class="device-aside side" aria-label="More devices">${rel.length?`<section class="aside-block"><h2>More from ${esc(d.brand)}</h2><ul class="mini">${rel.map(x=>`<li><a href="${x.slug}.html">${esc(x.name)}</a>${badge(x.status)}</li>`).join('')}</ul><a class="more" href="../brand/${d.bslug}.html">See all ${brands[d.brand].length} ${esc(d.brand)} devices</a></section>`:''}${miniSearch('../')}</aside></div></div>${newsletter}`,1,{titles:[`${q} | DeadOrSupported`,q,`${d.name}: still supported?`,`${d.name}: status`]});}
for(const b of bnames){const L=brands[b];const dead=L.filter(d=>d.status==='dead').length;
 const t=tally(L);write(`brand/${slug(b)}.html`,`Which ${b} devices are still supported?`,`Update and end-of-support status for ${plural(L.length,b+' device')}: ${dead} dead, ${L.length-dead} still supported or under guarantee.`,`<div class="wrap page"><nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="../brands.html">All brands</a></li></ol></nav><header class="page-head"><h1>Which ${esc(b)} devices are still supported?</h1><p class="lead">${plural(L.length,'device')} tracked, ${dead} dead.</p>${bar(t)}<ul class="split-key">${t.map(([s,n])=>`<li>${badge(s)}${n}</li>`).join('')}</ul></header>${t.map(([s,n])=>`<section class="group st-${s}"><h2 class="group-h">${ic}${LABEL[s]} <small>${plural(n,'device')}</small></h2><ul class="entries">${L.filter(d=>d.status===s).map(d=>card(d,'../')).join('')}</ul></section>`).join('')}</div>${newsletter}`,1);}
write('brands.html','Device support status by brand',`Browse end-of-support and update status by brand: ${bnames.join(', ')}.`,`<div class="wrap page"><header class="page-head"><h1>Brands</h1><p class="lead">Support status for ${data.length} devices from ${bnames.length} brands. Pick a brand to see which of its devices still get updates.</p></header><ul class="brand-list">${bnames.map(b=>{const t=tally(brands[b]);return `<li class="card brand-card"><h2><a class="card-link" href="brand/${slug(b)}.html">${esc(b)}</a></h2><p class="meta">${plural(brands[b].length,'device')}</p>${bar(t)}<p class="split-text">${t.map(([s,n])=>`${n} ${LABEL[s].toLowerCase()}`).join(', ')}</p></li>`}).join('')}</ul></div>${newsletter}`);
write('killed.html','Recently killed gadgets','The latest gadgets and smart-home devices to lose updates or cloud service, newest first.',`<div class="wrap page"><header class="page-head"><h1>Recently killed</h1><p class="lead">The latest gadgets and smart-home devices to lose updates or cloud service, newest first.</p></header><ul class="feed timeline">${killed.map(d=>`<li><p class="tl-date">${stamp(d.eos)}${badge('dead')}</p><h2><a href="device/${d.slug}.html">${esc(d.name)}</a></h2><p class="meta">${esc(d.brand)} <span class="tag">${esc(d.category)}</span></p><p class="tl-note">${esc(d.note)}</p></li>`).join('')}</ul></div>${newsletter}`);
write('newsletter.html','Newsletter','Get an email when a gadget loses support.',`<div class="wrap page"><header class="page-head"><h1>Newsletter</h1><p class="lead">Get an email when a gadget loses support.</p></header></div>${newsletter}`);
// tips are sent as a pre-filled public GitHub issue on the site's repository
const TIP_URL='https://github.com/CerberosTech/deadorsupported/issues/new';
const tipJs=`<script>document.getElementById('tip').addEventListener('submit',e=>{e.preventDefault();const f=e.target,v=k=>f.elements[k].value.trim(),u=new URL(f.action);u.searchParams.set('title','Tip: '+v('title'));u.searchParams.set('body','Device: '+v('title')+'\\nSource: '+v('source')+(v('body')?'\\n\\n'+v('body'):''));location.href=u.href})</script>`;
write('tip.html','Submit a tip','Know a gadget that is losing support? Send us a tip with a source.',`<div class="wrap page"><header class="page-head"><h1>Submit a tip</h1><p class="lead">Know a gadget that's losing support? Tell us, and include a source link.</p></header><div class="tip-grid"><form class="tip-form" id="tip" action="${TIP_URL}" method="get"><div class="field"><label for="tip-device">Device name</label><input id="tip-device" name="title" required autocomplete="off"></div><div class="field"><label for="tip-source">Source link</label><input id="tip-source" name="source" type="url" required placeholder="https://"></div><div class="field"><label for="tip-details">Details <span class="opt">(optional)</span></label><textarea id="tip-details" name="body" rows="5"></textarea></div><p class="notice">The button opens a new issue on GitHub with your tip filled in. You need a free GitHub account to send it, and everyone can see the issue.</p><button class="btn" type="submit">Continue on GitHub<span class="ic i-ext" aria-hidden="true"></span></button></form><aside class="tip-help" aria-labelledby="tip-help-h"><h2 id="tip-help-h">What makes a good tip</h2><ul><li>The exact model name, as the maker writes it.</li><li>A link to the maker's announcement or support page, or to a news report.</li><li>The date that updates or service end, if you know it.</li></ul></aside></div></div>${tipJs}`);
write('disclosure.html','Disclosure','How DeadOrSupported makes money: affiliate links, at no extra cost to you, and our own paid checklist. Neither affects support status data.',`<div class="wrap page"><article class="prose"><h1>Disclosure</h1><p class="callout"><b>In short:</b> some links on this site are affiliate links. If you click one and buy something, we may earn a small commission. You pay nothing extra. We also sell one product of our own, the Safe to Buy Used? checklist.</p><h2>What this means</h2><ul><li>Affiliate links mainly appear in the "Up-to-date replacement" section of device pages and are labelled there.</li><li>We are a member of the bol.com partner programme (bol.com Affiliate). We earn a commission on qualifying purchases made through our links to bol.com.</li><li>We may join other programmes, such as Amazon Associates and Back Market's affiliate programme. These are not active yet. If we join Amazon Associates, this applies: as an Amazon Associate we earn from qualifying purchases.</li><li>We only add links to products we think are reasonable replacements. We are never paid to recommend a specific product.</li></ul><h2>Our own product</h2><p>The Safe to Buy Used? checklist is our own product, and we sell it. We make it ourselves and sell it on Gumroad for €6, so we earn money when you buy it. Links to it are not affiliate links. On this site we label it "Our own product".</p><h2>Our data is independent</h2><p>Affiliate relationships and sales of our checklist <b>never</b> affect a device's support status, dates or sources. Every status comes from the manufacturer's own pages or reputable press, linked on each device page. If we're wrong, <a href="tip.html">tell us</a>.</p><h2>Analytics</h2><p>We count visits with GoatCounter, a privacy-friendly, cookieless analytics service that doesn't track you across sites.</p><h2>Why we disclose this</h2><p>We want you to know when we might benefit from a link. This follows EU and Dutch consumer rules on recognisable advertising (ACM) and the US FTC Endorsement Guides.</p></article></div>`);

// --- articles: content/articles/*.md with front matter (title, description, slug) ---
const affHost=h=>{try{const host=new URL(h).hostname;return/(?:^|\.)(?:partner\.bol\.com|awin1\.com|prf\.hn)$/i.test(host)||/tradetracker|daisycon/i.test(host)}catch{return!1}};
const extRel=h=>affHost(h)?'sponsored nofollow noopener':'noopener';
const inl=t=>{const codes=[];t=t.replace(/`([^`]+)`/g,(m,c)=>{codes.push(c);return '\u0000'+(codes.length-1)+'\u0000'});t=esc(t).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(m,a,h)=>`<a href="${h}"${/^https?:/.test(h)?` rel="${extRel(h)}"`:''}>${a}</a>`).replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,(m,p,u)=>`${p}<a href="${u}" rel="${extRel(u)}">${u}</a>`).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*\w])\*([^*]+)\*/g,'$1<em>$2</em>').replace(/(^|\W)_([^_]+)_(?=\W|$)/g,'$1<em>$2</em>');return t.replace(/\u0000(\d+)\u0000/g,(m,i)=>`<code>${esc(codes[i])}</code>`)};
const md2html=src=>{const L=src.replace(/\r/g,'').split('\n'),o=[];let i=0;const isBlock=l=>/^(#{1,6}\s|```|\s*[-*+]\s|\s*\d+\.\s|\|)/.test(l);
 while(i<L.length){const l=L[i];
  if(!l.trim()){i++;continue}
  if(l.startsWith('```')){const b=[];i++;while(i<L.length&&!L[i].startsWith('```'))b.push(L[i++]);i++;o.push(`<pre><code>${esc(b.join('\n'))}</code></pre>`);continue}
  let m=l.match(/^(#{1,6})\s+(.*)$/);if(m){o.push(`<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`);i++;continue}
  if(/^\s*([-*+]|\d+\.)\s/.test(l)){const ol=/^\s*\d+\./.test(l),it=[];while(i<L.length&&/^\s*([-*+]|\d+\.)\s/.test(L[i]))it.push(L[i++].replace(/^\s*([-*+]|\d+\.)\s+/,''));o.push(`<${ol?'ol':'ul'}>${it.map(x=>`<li>${inl(x)}</li>`).join('')}</${ol?'ol':'ul'}>`);continue}
  if(l.startsWith('|')){const rows=[];while(i<L.length&&L[i].startsWith('|'))rows.push(L[i++]);const cells=r=>r.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());const hasHead=rows[1]&&/^\|?[\s:|-]+$/.test(rows[1]);const head=hasHead?`<thead><tr>${cells(rows[0]).map(c=>`<th>${inl(c)}</th>`).join('')}</tr></thead>`:'';o.push(`<table>${head}<tbody>${rows.slice(hasHead?2:0).map(r=>`<tr>${cells(r).map(c=>`<td>${inl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);continue}
  const p=[];while(i<L.length&&L[i].trim()&&!isBlock(L[i]))p.push(L[i++]);o.push(`<p>${inl(p.join(' '))}</p>`)}
 return o.join('\n')};
const ADIR='content/articles';const articles=[];
if(fs.existsSync(ADIR))for(const f of fs.readdirSync(ADIR).filter(f=>f.endsWith('.md')).sort()){const raw=fs.readFileSync(`${ADIR}/${f}`,'utf8');const fm={};let body=raw;const m=raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);if(m){body=raw.slice(m[0].length);for(const line of m[1].split('\n')){const k=line.match(/^([\w-]+):\s*(.*)$/);if(k)fm[k[1]]=k[2].trim().replace(/^(["'])(.*)\1$/,'$2')}}
 const a={title:fm.title||f.replace(/\.md$/,''),description:fm.description||'',slug:slug(fm.slug||f.replace(/\.md$/,'')),updated:fm.updated||''};
 body=body.replace(/^\s*#\s+.*\n/,'');// template renders the H1 from title
 write(`articles/${a.slug}/index.html`,a.title,a.description,`<div class="wrap page"><nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="../index.html">All articles</a></li></ol></nav><div class="with-aside"><article class="prose"><header class="article-head"><h1>${esc(a.title)}</h1>${a.updated?`<p class="article-meta">Updated ${upd(a.updated)}</p>`:''}</header>${tables(md2html(body))}</article><aside class="side" aria-label="Our checklist and device search">${product('../../')}${miniSearch('../../')}</aside></div></div>${newsletter}`,2,{type:'article'});articles.push(a)}
write('articles/index.html','Articles','Guides and explainers about which phones and gadgets still get updates, and what to do when support ends.',`<div class="wrap page"><header class="page-head"><h1>Articles</h1><p class="lead">Guides and explainers about which phones and gadgets still get updates, and what to do when support ends.</p></header>${articles.length?`<ul class="feed article-list">${articles.map(a=>`<li class="card article-card"><h2><a class="card-link" href="${a.slug}/index.html">${esc(a.title)}</a></h2>${a.description?`<p>${esc(a.description)}</p>`:''}${a.updated?`<p class="meta">Updated ${upd(a.updated)}</p>`:''}</li>`).join('')}</ul>`:'<p class="muted">There are no articles here.</p>'}</div>${newsletter}`,1);
const day=TODAY.toISOString().slice(0,10);
fs.writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(u=>`<url><loc>${u}</loc><lastmod>${day}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log(`built ${data.length} devices, ${bnames.length} brands, ${pages.length} pages, ${killed.length} killed`);
fs.writeFileSync('dist/google8042a96498438aa5.html','google-site-verification: google8042a96498438aa5.html');
