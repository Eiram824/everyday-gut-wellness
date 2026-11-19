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
const OG_IMAGE = `${SITE}/assets/images/ebook_cover_guide_1793359029909.jpg`;

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

const CSS = `
:root{--ivory:#FBF9F5;--forest:#14382B;--forest-soft:#EAF1ED;--terra:#B85D36;--terra-soft:#F8EFEA;--ink:#2C2A26;--muted:#635F57;--border:#E5DFD5}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ivory);color:var(--ink);font-family:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.7;font-size:17px}
a{color:var(--forest);text-decoration:underline;text-underline-offset:3px}a:hover{color:var(--terra)}
:focus-visible{outline:3px solid var(--terra);outline-offset:2px}
.skip{position:absolute;left:-999px}.skip:focus{left:16px;top:8px;background:#fff;padding:8px 12px;z-index:10}
header.site{background:#fff;border-bottom:1px solid var(--border)}
.wrap{max-width:760px;margin:0 auto;padding:0 20px}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px 16px;min-height:64px;flex-wrap:wrap;padding-top:8px;padding-bottom:8px}
.brand{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:20px;color:var(--forest);text-decoration:none}
nav.top a{font-size:14px;font-weight:600;text-decoration:none;margin-right:16px}
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
`;

function layout({ urlPath, title, description, index = true, ogType = 'website', jsonLd = [], inner }) {
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="${index ? 'index, follow, max-image-preview:large' : 'noindex, follow'}" />${canonical}
    <meta property="og:type" content="${ogType}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:site_name" content="${BRAND}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="data:," />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
    <script src="/consent.js"></script>
    <style>${CSS}</style>${ld}
  </head>
  <body>
    <header class="site">
      <div class="wrap">
        <a class="skip" href="#main">Skip to content</a>
        <a class="brand" href="/">${BRAND}</a>
        <nav class="top" aria-label="Main"><a href="/">Home</a><a href="/guides/">Guides</a><a href="/about.html">About</a><a href="/#gut-clarity-workbook">Workbook</a></nav>
      </div>
    </header>
    <main id="main">
      <div class="wrap">
${inner}
      </div>
    </main>
    <footer class="site">
      <div class="wrap">
        <a href="/">Home</a><a href="/guides/">Guides</a><a href="/about.html">About</a><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms of Service</a><a href="mailto:${EMAIL}">Contact</a><button type="button" class="linklike" onclick="window.egwCookieSettings&&window.egwCookieSettings()">Cookie settings</button>
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

const ORG = { '@type': 'Organization', '@id': `${SITE}/#organization`, name: BRAND, url: `${SITE}/`, email: EMAIL };

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
  writeOut(meta.path.replace(/^\//, ''), layout({ urlPath: meta.path, title: meta.title, description: meta.description, index: !meta.noindex, inner }));
}

// ---------- Guides ----------
const guides = readContent('content/guides')
  .filter((g) => !g.meta.draft)
  .map((g) => {
    for (const k of ['title', 'h1', 'description', 'published', 'summary']) {
      if (!g.meta[k]) throw new Error(`content/guides/${g.file}: meta.${k} is required`);
    }
    if (!g.body.includes('id="when-to-see-a-doctor"')) {
      throw new Error(`content/guides/${g.file}: needs a section with id="when-to-see-a-doctor"`);
    }
    return { ...g, urlPath: `/guides/${g.slug}`, updated: g.meta.updated || g.meta.published, minutes: readingMinutes(g.body) };
  })
  .sort((a, b) => (a.meta.published < b.meta.published ? 1 : -1));

for (const g of guides) {
  const { meta } = g;
  const related = guides.filter((o) => o.slug !== g.slug).slice(0, 3);
  const relatedHtml = related.length
    ? `\n<h2>Keep reading</h2>\n<ul class="cards">\n${related
        .map((o) => `  <li><a href="${o.urlPath}">${esc(o.meta.h1)}</a><p>${esc(o.meta.summary)}</p></li>`)
        .join('\n')}\n</ul>`
    : '';
  const inner = indent(`<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/guides/">Guides</a> &rsaquo; <span aria-current="page">${esc(meta.h1)}</span></nav>
<p class="eyebrow">${esc(meta.eyebrow || 'Guide')}</p>
<h1>${esc(meta.h1)}</h1>
<p class="byline">By the ${BRAND} editorial team &middot; Updated <time datetime="${g.updated}">${longDate(g.updated)}</time> &middot; ${g.minutes} min read</p>
<div class="note"><strong>Educational information, not medical advice.</strong> This guide is general information for healthy adults and is not reviewed for your personal situation. Talk with a clinician about symptoms that are new, severe, or persistent. <a href="#when-to-see-a-doctor">When to see a doctor</a></div>
${g.body}
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
      image: OG_IMAGE,
      author: ORG,
      publisher: ORG,
      inLanguage: 'en',
    },
    breadcrumb([
      ['Home', '/'],
      ['Guides', '/guides/'],
      [meta.h1, g.urlPath],
    ]),
  ];
  writeOut(`guides/${g.slug}.html`, layout({ urlPath: g.urlPath, title: meta.title, description: meta.description, ogType: 'article', jsonLd, inner }));
}

const indexInner = indent(`<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <span aria-current="page">Guides</span></nav>
<p class="eyebrow">Guides</p>
<h1>Everyday Digestive Health Guides</h1>
<p class="lede">Practical, evidence-informed guides to fiber, fluids, meal rhythm, and the daily habits that support regular digestion, plus clear signs for when to see a doctor.</p>
${
  guides.length
    ? `<ul class="cards">\n${guides
        .map((g) => `  <li><a href="${g.urlPath}">${esc(g.meta.h1)}</a><p>${esc(g.meta.summary)}</p></li>`)
        .join('\n')}\n</ul>`
    : '<p>New guides are on the way.</p>'
}`);
writeOut(
  'guides/index.html',
  layout({
    urlPath: '/guides/',
    title: `Digestive Health Guides | ${BRAND}`,
    description: 'Practical, evidence-informed guides to fiber, hydration, meal rhythm, and everyday digestive habits, with clear signs for when to see a doctor.',
    jsonLd: [
      {
        '@type': 'CollectionPage',
        name: 'Everyday Digestive Health Guides',
        url: `${SITE}/guides/`,
        hasPart: guides.map((g) => ({ '@type': 'Article', headline: g.meta.h1, url: `${SITE}${g.urlPath}` })),
      },
      breadcrumb([
        ['Home', '/'],
        ['Guides', '/guides/'],
      ]),
    ],
    inner: indexInner,
  }),
);

// ---------- Homepage teaser data ----------
fs.writeFileSync(
  path.join(ROOT, 'content', 'guides-index.json'),
  JSON.stringify(guides.map((g) => ({ href: g.urlPath, title: g.meta.h1, summary: g.meta.summary, minutes: g.minutes })), null, 2) + '\n',
);

// ---------- Sitemap ----------
const today = new Date().toISOString().slice(0, 10);
const newest = guides.reduce((acc, g) => (g.updated > acc ? g.updated : acc), '2026-11-19');
const urls = [
  { loc: '/', lastmod: newest > today ? today : newest, changefreq: 'weekly', priority: '1.0' },
  { loc: '/guides/', lastmod: newest, changefreq: 'weekly', priority: '0.8' },
  ...guides.map((g) => ({ loc: g.urlPath, lastmod: g.updated, changefreq: 'monthly', priority: '0.7' })),
  ...pages
    .filter((p) => !p.meta.noindex)
    .map((p) => ({ loc: p.meta.path, lastmod: p.meta.updated, changefreq: 'yearly', priority: p.meta.path === '/about.html' ? '0.5' : '0.3' })),
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

console.log(`[Pages] Built ${pages.length} pages, ${guides.length} guides, guides index, and sitemap (${urls.length} URLs).`);
