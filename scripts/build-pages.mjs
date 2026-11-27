/**
 * Builds the crawlable static pages from content/ into public/:
 *   content/pages/*.html   -> public/<name>.html          (about, privacy, terms, 404)
 *   content/guides/*.html  -> public/guides/<slug>.html   (served at /guides/<slug>)
 *   guides index           -> public/guides/index.html    (served at /guides/)
 *   sitemap                -> public/sitemap.xml
 *   homepage teaser data   -> content/guides-index.json   (read by components/GuidesTeaser.tsx)
 *
 * Each content file starts with a meta block:
 *   <!--meta
 *   { "title": "...", "description": "...", ... }
 *   -->
 * followed by the HTML body. Run: node scripts/build-pages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://everydaygutwellness.com';
const BRAND = 'Everyday Gut Wellness';
const EMAIL = 'hello@everydaygutwellness.com';
const OG_IMAGE = `${SITE}/assets/og/default.jpg`;
// Per-article share card (1200x630) made by scripts/make-og-images.mjs; falls back to the default card.
const ogImageFor = (slug) =>
  fs.existsSync(path.join(ROOT, 'public', 'assets', 'og', `${slug}.jpg`)) ? `${SITE}/assets/og/${slug}.jpg` : OG_IMAGE;

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function readContent(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.html'))
    .sort()
    .map((file) => {
      const raw = fs.readFileSync(path.join(full, file), 'utf8').replace(/\r\n/g, '\n');
      const m = raw.match(/^<!--meta\n([\s\S]*?)\n-->\n/);
      if (!m) throw new Error(`${dir}/${file}: missing <!--meta ... --> header`);
      let meta;
      try {
        meta = JSON.parse(m[1]);
      } catch (e) {
        throw new Error(`${dir}/${file}: invalid meta JSON (${e.message})`);
      }
      return { file, slug: file.replace(/\.html$/, ''), meta, body: raw.slice(m[0].length).trim() };
    });
}

function longDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function readingMinutes(html) {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

// Slow, gentle eBook announcement bar (CSS-only marquee; static when reduced motion is on).
const EBAR_ITEM = '<span class="ebar-item"><b>Free 7-Day Gut Reset eBook</b> &middot; Gentle daily habits, one small step at a time &middot; <u>Get it free</u></span>';
const EBAR_ITEMS = EBAR_ITEM.repeat(3);
const CSS = `
:root{--ivory:#FBF9F5;--forest:#14382B;--forest-soft:#EAF1ED;--terra:#A3502C;--terra-soft:#F8EFEA;--ink:#2C2A26;--muted:#635F57;--border:#E5DFD5}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ivory);color:var(--ink);font-family:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.7;font-size:17px}
a{color:var(--forest);text-decoration:underline;text-underline-offset:3px}a:hover{color:var(--terra)}
:focus-visible{outline:3px solid var(--terra);outline-offset:2px}
.skip{position:absolute;left:-999px}.skip:focus{left:16px;top:8px;background:#fff;padding:8px 12px;z-index:10}
header.site{background:#fff;border-bottom:1px solid var(--border)}
.ebar{display:block;height:36px;overflow:hidden;background:var(--forest);color:#F4EFE6;text-decoration:none;font-size:13px;line-height:36px;white-space:nowrap}.ebar:hover{color:#fff}
.ebar-track{display:inline-flex;will-change:transform;animation:ebar 80s linear infinite}.ebar:hover .ebar-track,.ebar:focus-visible .ebar-track{animation-play-state:paused}
.ebar-item{padding:0 28px}.ebar-item b{font-weight:700;color:#fff}.ebar-item u{text-underline-offset:3px}
@keyframes ebar{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
@media (prefers-reduced-motion:reduce){.ebar{height:auto;min-height:36px;white-space:normal;text-align:center;line-height:1.45;padding:8px 16px}.ebar-track{animation:none;display:inline}.ebar-item{padding:0}.ebar-item~.ebar-item{display:none}}
.wrap{max-width:760px;margin:0 auto;padding:0 20px}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px 16px;min-height:64px;flex-wrap:wrap;padding-top:8px;padding-bottom:8px}
.brand{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:20px;color:var(--forest);text-decoration:none;display:inline-flex;align-items:center;gap:10px}.brand img{width:28px;height:28px;flex-shrink:0}
nav.top a{font-size:14px;font-weight:600;text-decoration:none;margin-right:16px;white-space:nowrap;display:inline-block}
main{padding:40px 0 64px}
.crumbs{font-size:13px;color:var(--muted);margin:0 0 16px}.crumbs a{color:var(--muted)}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--terra);margin:0 0 8px}
h1{font-family:'Playfair Display',Georgia,serif;color:var(--forest);font-size:clamp(30px,5vw,42px);line-height:1.2;margin:0 0 12px}
h2{font-family:'Playfair Display',Georgia,serif;color:var(--forest);font-size:24px;line-height:1.3;margin:40px 0 8px}
h3{font-size:18px;color:var(--forest);margin:28px 0 4px}
.updated,.byline{color:var(--muted);font-size:14px;margin:0 0 28px}
.lede{font-size:19px}
ul,ol{padding-left:22px}li{margin:6px 0}
table{border-collapse:collapse;width:100%;font-size:15px;margin:16px 0;display:block;overflow-x:auto}
th,td{border:1px solid var(--border);padding:8px 10px;text-align:left;vertical-align:top}th{background:var(--forest-soft)}
.note{background:var(--forest-soft);border-left:4px solid var(--forest);padding:16px 20px;border-radius:6px;margin:28px 0;font-size:15px}
.warn{background:var(--terra-soft);border-left:4px solid var(--terra);padding:16px 20px;border-radius:6px;margin:28px 0;font-size:15px}
.cta{background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;margin:40px 0}
.cta h2{margin-top:0}
.product{background:var(--terra-soft);border:1px solid var(--border);border-radius:14px;padding:22px;margin:40px 0}.product h2{margin-top:0}.disclosure{font-size:13px;color:var(--muted);margin:12px 0 0}
.btn{display:inline-block;background:var(--forest);color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;margin-top:8px}
.btn:hover{background:var(--terra);color:#fff}
.sources{font-size:14px;color:var(--muted)}.sources li{margin:8px 0}
.cards{list-style:none;padding:0;display:grid;gap:16px}
.cards li{background:#fff;border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin:0}
.cards a{font-family:'Playfair Display',Georgia,serif;font-size:21px;font-weight:700;text-decoration:none}
.cards p{margin:6px 0 0;color:var(--muted);font-size:15px}
.linklike{background:none;border:0;font:inherit;color:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:0}
footer.site{background:var(--forest);color:var(--forest-soft);font-size:14px;padding:32px 0}
footer.site a,footer.site .linklike{color:#fff;margin-right:16px;display:inline-block;padding:6px 0}
footer.site p{margin:12px 0 0;opacity:.85;font-size:13px}
@media (prefers-reduced-motion:no-preference){[data-reveal]{opacity:0;transform:translate3d(0,20px,0);transition:opacity .6s ease-out,transform .6s cubic-bezier(.22,.61,.36,1)}[data-reveal=in]{opacity:1;transform:none}[data-reveal-delay='1']{transition-delay:90ms}[data-reveal-delay='2']{transition-delay:180ms}[data-reveal-delay='3']{transition-delay:270ms}[data-reveal-delay='4']{transition-delay:360ms}}
@media (prefers-reduced-motion:no-preference){.btn,.cards li{transition:transform .25s cubic-bezier(.22,.61,.36,1),box-shadow .25s ease}.btn:active{transform:scale(.97)}}
@media (hover:hover) and (prefers-reduced-motion:no-preference){.btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px -10px rgba(20,56,43,.45)}.cards li:not([data-reveal]):hover{transform:translateY(-3px);box-shadow:0 14px 30px -20px rgba(20,56,43,.35)}}
@media print{[data-reveal]{opacity:1!important;transform:none!important}}
`;

// Shop links and product cards only appear when products.json has "shopLinksLive": true.
const SHOP = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'products.json'), 'utf8'));
// The footer Shop link stays off the core /guides/ pages so the fiber and constipation guides remain purely educational.
const shopNav = (urlPath) => (SHOP.shopLinksLive && !urlPath.startsWith('/guides/') ? '<a href="https://shop.everydaygutwellness.com/?utm_source=website&amp;utm_medium=footer" rel="noopener">Shop</a>' : '');

function layout({ urlPath, title, description, index = true, ogType = 'website', jsonLd = [], inner, ogImage = OG_IMAGE }) {
  const url = `${SITE}${urlPath}`;
  const canonical = index
    ? `\n    <link rel="canonical" href="${url}" />\n    <meta property="og:url" content="${url}" />`
    : '';
  const ld = jsonLd.length
    ? `\n    <script type="application/ld+json">${JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : { '@context': 'https://schema.org', '@graph': jsonLd })}</script>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="${index ? 'index, follow, max-image-preview:large' : 'noindex, follow'}" />${canonical}
    <meta property="og:type" content="${ogType}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:site_name" content="${BRAND}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
    <script src="/consent.js"></script>
    <script src="/motion.js" defer></script>
    <script src="/guide-popup.js" defer></script>
    <style>${CSS}</style>${ld}
  </head>
  <body>
    <a class="ebar" href="/#free-guide" aria-label="Get the free 7-Day Gentle Gut Reset eBook"><span class="ebar-track" aria-hidden="true">${EBAR_ITEMS}${EBAR_ITEMS}</span></a>
    <header class="site">
      <div class="wrap">
        <a class="skip" href="#main">Skip to content</a>
        <a class="brand" href="/"><img src="/logo.svg" alt="" width="28" height="28" />${BRAND}</a>
        <nav class="top" aria-label="Main"><a href="/">Home</a><a href="/guides/">Guides</a><a href="/comfort/">Belly Comfort</a><a href="/about">About</a><a href="/#gut-clarity-workbook">Workbook</a></nav>
      </div>
    </header>
    <main id="main">
      <div class="wrap">
${inner}
      </div>
    </main>
    <footer class="site">
      <div class="wrap">
        <a href="/">Home</a><a href="/guides/">Guides</a><a href="/comfort/">Belly Comfort</a>${shopNav(urlPath)}<a href="/about">About</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a><a href="mailto:${EMAIL}">Contact</a><button type="button" class="linklike" onclick="window.egwCookieSettings&&window.egwCookieSettings()">Cookie settings</button>
        <p>${BRAND} is an independent educational publication. It does not provide medical advice, diagnosis, or treatment. Always talk with a qualified clinician about your own health.</p>
        <p>&copy; ${new Date().getUTCFullYear()} ${BRAND}. All rights reserved.</p>
      </div>
    </footer>
  </body>
</html>
`;
}

const indent = (html, n = 8) =>
  html
    .split('\n')
    .map((l) => (l ? ' '.repeat(n) + l : l))
    .join('\n');

const ORG = { '@type': 'Organization', '@id': `${SITE}/#organization`, name: BRAND, url: `${SITE}/`, logo: { '@type': 'ImageObject', url: `${SITE}/logo-512.png`, width: 512, height: 512 }, email: EMAIL };
const EDITOR_NAME = 'Mark Laurence E. Medina';
const EDITOR = { '@type': 'Person', '@id': `${SITE}/about#editor`, name: EDITOR_NAME, jobTitle: 'Founder and editor', url: `${SITE}/about#editor`, worksFor: { '@id': `${SITE}/#organization` } };

function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${p}` })),
  };
}

function writeOut(rel, html) {
  const out = path.join(ROOT, 'public', rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

// ---------- Static pages ----------
const pages = readContent('content/pages');
for (const p of pages) {
  const { meta } = p;
  const updated = meta.updated ? `\n<p class="updated">Last updated: ${longDate(meta.updated)}</p>` : '';
  const inner = indent(`<p class="eyebrow">${esc(meta.eyebrow)}</p>\n<h1>${esc(meta.h1)}</h1>${updated}\n${p.body}`);
  writeOut(meta.path.replace(/^\//, ''), layout({ urlPath: meta.path.replace(/\.html$/, ''), title: meta.title, description: meta.description, index: !meta.noindex, inner }));
}

// ---------- Article collections ----------
// Two separate sections, so the core gut-wellness guides stay focused:
//   /guides/   everyday digestive habits (fiber, fluids, routine)
//   /comfort/  belly comfort: period cramps, bloating, heat and castor oil packs
// Comfort articles may name a product (meta.product, see content/products.json).
// Product cards and shop links only appear when products.json has "shopLinksLive": true.

function loadArticles(dir, base) {
  return readContent(dir)
    .filter((g) => !g.meta.draft)
    .map((g) => {
      for (const k of ['title', 'h1', 'description', 'published', 'summary']) {
        if (!g.meta[k]) throw new Error(`${dir}/${g.file}: meta.${k} is required`);
      }
      if (!g.body.includes('id="when-to-see-a-doctor"')) {
        throw new Error(`${dir}/${g.file}: needs a section with id="when-to-see-a-doctor"`);
      }
      if (g.meta.product && !SHOP.products[g.meta.product]) {
        throw new Error(`${dir}/${g.file}: unknown meta.product "${g.meta.product}"`);
      }
      return { ...g, urlPath: `${base}${g.slug}`, updated: g.meta.updated || g.meta.published, minutes: readingMinutes(g.body) };
    })
    .sort((a, b) => {
      if (a.meta.published !== b.meta.published) return a.meta.published < b.meta.published ? 1 : -1;
      // Same day: optional meta.order puts pillar articles first.
      if (a.meta.order != null && b.meta.order != null) return a.meta.order - b.meta.order;
      return -1;
    });
}

/** Related reads: same topic first (meta.eyebrow), then the rest of the section. */
function relatedFor(g, list) {
  const others = list.filter((o) => o.slug !== g.slug);
  const same = others.filter((o) => o.meta.eyebrow === g.meta.eyebrow);
  return [...same, ...others.filter((o) => !same.includes(o))].slice(0, 3);
}

function productCard(key) {
  const p = SHOP.products[key];
  if (!SHOP.shopLinksLive || !p) return '';
  return `
<div class="product">
  <p class="eyebrow">From our shop</p>
  <h2>${esc(p.name)}</h2>
  <p>${esc(p.blurb)}</p>
  <a class="btn" href="${esc(p.url)}?utm_source=website&amp;utm_medium=article&amp;utm_campaign=${esc(key)}" rel="noopener">See the ${esc(p.short)} &middot; ${esc(p.price)}</a>
  <p class="disclosure">We sell this product in our own shop. It is a comfort tool, not a treatment. <a href="/about#funding">How we are funded</a></p>
</div>`;
}

function buildSection(cfg) {
  const { dir, base, crumb, indexTitle, indexH1, indexLede, indexDescription, emptyText } = cfg;
  const list = loadArticles(dir, base);
  for (const g of list) {
    const { meta } = g;
    const related = relatedFor(g, list);
    const relatedHtml = related.length
      ? `\n<h2>Keep reading</h2>\n<ul class="cards">\n${related
          .map((o) => `  <li><a href="${o.urlPath}">${esc(o.meta.h1)}</a><p>${esc(o.meta.summary)}</p></li>`)
          .join('\n')}\n</ul>`
      : '';
    const inner = indent(`<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="${base}">${crumb}</a> &rsaquo; <span aria-current="page">${esc(meta.h1)}</span></nav>
<p class="eyebrow">${esc(meta.eyebrow || 'Guide')}</p>
<h1>${esc(meta.h1)}</h1>
<p class="byline">By <a href="/about#editor" rel="author">${EDITOR_NAME}</a>, founder and editor &middot; Updated <time datetime="${g.updated}">${longDate(g.updated)}</time> &middot; ${g.minutes} min read</p>
<div class="note"><strong>Educational information, not medical advice.</strong> This guide is general information for healthy adults and is not reviewed for your personal situation. Talk with a clinician about symptoms that are new, severe, or persistent. <a href="#when-to-see-a-doctor">When to see a doctor</a></div>
${g.body}${meta.product ? productCard(meta.product) : ''}
<div class="cta">
  <h2>Get the free 7-Day Gentle Gut Reset Guide</h2>
  <p>A printable, one-week plan for building steady fiber, fluid, and meal-rhythm habits, one small change at a time.</p>
  <a class="btn" href="/#free-guide">Get the free guide</a>
</div>${relatedHtml}`);
    const jsonLd = [
      {
        '@type': 'Article',
        '@id': `${SITE}${g.urlPath}#article`,
        headline: meta.h1,
        description: meta.description,
        datePublished: meta.published,
        dateModified: g.updated,
        mainEntityOfPage: `${SITE}${g.urlPath}`,
        image: ogImageFor(g.slug),
        author: EDITOR,
        publisher: ORG,
        inLanguage: 'en',
      },
      breadcrumb([
        ['Home', '/'],
        [crumb, base],
        [meta.h1, g.urlPath],
      ]),
    ];
    writeOut(`${base.replace(/^\//, '')}${g.slug}.html`, layout({ urlPath: g.urlPath, title: meta.title, description: meta.description, ogType: 'article', jsonLd, inner, ogImage: ogImageFor(g.slug) }));
  }

  const indexInner = indent(`<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <span aria-current="page">${crumb}</span></nav>
<p class="eyebrow">${crumb}</p>
<h1>${esc(indexH1)}</h1>
<p class="lede">${indexLede}</p>
${
  list.length
    ? `<ul class="cards">\n${list
        .map((g) => `  <li><a href="${g.urlPath}">${esc(g.meta.h1)}</a><p>${esc(g.meta.summary)}</p></li>`)
        .join('\n')}\n</ul>`
    : `<p>${emptyText}</p>`
}`);
  writeOut(
    `${base.replace(/^\//, '')}index.html`,
    layout({
      urlPath: base,
      title: indexTitle,
      description: indexDescription,
      jsonLd: [
        {
          '@type': 'CollectionPage',
          name: indexH1,
          url: `${SITE}${base}`,
          hasPart: list.map((g) => ({ '@type': 'Article', headline: g.meta.h1, url: `${SITE}${g.urlPath}` })),
        },
        breadcrumb([
          ['Home', '/'],
          [crumb, base],
        ]),
      ],
      inner: indexInner,
    }),
  );
  return list;
}

const guides = buildSection({
  dir: 'content/guides',
  base: '/guides/',
  crumb: 'Guides',
  indexTitle: `Digestive Health Guides | ${BRAND}`,
  indexH1: 'Everyday Digestive Health Guides',
  indexLede: 'Practical, evidence-informed guides to fiber, fluids, meal rhythm, and the daily habits that support regular digestion, plus clear signs for when to see a doctor.',
  indexDescription: 'Practical, evidence-informed guides to fiber, hydration, meal rhythm, and everyday digestive habits, with clear signs for when to see a doctor.',
  emptyText: 'New guides are on the way.',
});

const comfort = buildSection({
  dir: 'content/comfort',
  base: '/comfort/',
  crumb: 'Belly Comfort',
  indexTitle: `Belly Comfort Guides: Period Cramps, Bloating and Heat | ${BRAND}`,
  indexH1: 'Belly Comfort Guides',
  indexLede: 'Calm, evidence-informed help for period cramps, bloating, and an uncomfortable belly: what actually helps at home, how to use heat safely, and when to see a doctor.',
  indexDescription: 'Evidence-informed guides to period cramps, bloating, heat therapy and castor oil packs: what helps at home, how to use heat safely, and when to see a doctor.',
  emptyText: 'New comfort guides are on the way.',
});

// ---------- Homepage teaser data ----------
fs.writeFileSync(
  path.join(ROOT, 'content', 'guides-index.json'),
  JSON.stringify(guides.map((g) => ({ href: g.urlPath, title: g.meta.h1, summary: g.meta.summary, minutes: g.minutes })), null, 2) + '\n',
);
fs.writeFileSync(
  path.join(ROOT, 'content', 'comfort-index.json'),
  JSON.stringify(comfort.map((g) => ({ href: g.urlPath, title: g.meta.h1, summary: g.meta.summary, minutes: g.minutes })), null, 2) + '\n',
);

// ---------- Sitemap ----------
const today = new Date().toISOString().slice(0, 10);
const newest = [...guides, ...comfort].reduce((acc, g) => (g.updated > acc ? g.updated : acc), '2026-11-19');
const urls = [
  { loc: '/', lastmod: newest > today ? today : newest, changefreq: 'weekly', priority: '1.0' },
  { loc: '/guides/', lastmod: newest, changefreq: 'weekly', priority: '0.8' },
  ...guides.map((g) => ({ loc: g.urlPath, lastmod: g.updated, changefreq: 'monthly', priority: '0.7' })),
  ...(comfort.length ? [{ loc: '/comfort/', lastmod: comfort.reduce((a, g) => (g.updated > a ? g.updated : a), ''), changefreq: 'weekly', priority: '0.8' }] : []),
  ...comfort.map((g) => ({ loc: g.urlPath, lastmod: g.updated, changefreq: 'monthly', priority: '0.7' })),
  ...pages
    .filter((p) => !p.meta.noindex)
    .map((p) => ({ loc: p.meta.path.replace(/\.html$/, ''), lastmod: p.meta.updated, changefreq: 'yearly', priority: p.meta.path === '/about.html' ? '0.5' : '0.3' })),
];
writeOut(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`,
);

console.log(`[Pages] Built ${pages.length} pages, ${guides.length} guides, ${comfort.length} comfort guides, section indexes, and sitemap (${urls.length} URLs).`);
