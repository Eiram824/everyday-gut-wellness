import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { tsImport } from 'tsx/esm/api';
import { readRouteSchema } from './lib/editorial-schema.mjs';

const { ROUTE_PATHS, ROUTES, SITE_ORIGIN, LAST_UPDATED } = await tsImport('../siteConfig.ts', import.meta.url);
const { FAQ_ITEMS } = await tsImport('../lib/editorial-content.ts', import.meta.url);
const dist = path.resolve('dist');
const legalFiles = { '/privacy': 'privacy.html', '/terms': 'terms.html', '/contact': 'contact.html', '/editorial-standards.html': 'editorial-standards.html' };
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|nbsp|#\d+|#x[\da-f]+);/gi, entity => {
  const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' };
  return named[entity.toLowerCase()] ?? String.fromCodePoint(entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10));
});
const text = value => decode(value.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const documents = new Map();
const meta = (html, attribute, key) => decode(html.match(new RegExp(`<meta\\b[^>]*\\b${attribute}="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*\\bcontent="([^"]*)"`, 'i'))?.[1] || '');

async function resolveLocal(pathname) {
  const normalized = decodeURIComponent(pathname).replace(/\/+$/, '') || '/';
  const relative = legalFiles[normalized] || (normalized === '/' ? 'index.html' : normalized.slice(1));
  for (const candidate of [path.join(dist, relative), path.join(dist, relative, 'index.html')]) {
    assert.ok(candidate.startsWith(dist + path.sep), 'A local URL must stay inside the production output.');
    try { if ((await stat(candidate)).isFile()) return candidate; } catch {}
  }
  throw new Error(`Missing local page or asset: ${pathname}`);
}

for (const pathname of ROUTE_PATHS) {
  const filename = await resolveLocal(pathname);
  const html = await readFile(filename, 'utf8');
  const canonical = `${SITE_ORIGIN}${pathname}`;
  const route = ROUTES[pathname];
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  documents.set(filename, html);
  assert.doesNotMatch(html, /Loading\s+guide|everydaygutwellness\.org|everyday-gut-wellness\.netlify\.app/i, `${pathname}: stale domain/loading shell.`);
  assert.equal((body.match(/<h1\b/gi) || []).length, 1, `${pathname}: exactly one H1 is required.`);
  assert.equal(text(body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ''), route.h1, `${pathname}: wrong H1.`);
  assert.ok((body.match(/<h2\b/gi) || []).length > 0, `${pathname}: content headings must be pre-rendered.`);
  for (const tag of ['main', 'nav', 'footer']) assert.match(body, new RegExp(`<${tag}\\b`, 'i'), `${pathname}: missing ${tag} landmark.`);
  assert.equal(text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ''), route.title);
  assert.equal(meta(html, 'name', 'description'), route.description);
  assert.equal(meta(html, 'property', 'og:title'), route.title);
  assert.equal(meta(html, 'property', 'og:description'), route.description);
  assert.equal(meta(html, 'name', 'twitter:title'), route.title);
  assert.equal(meta(html, 'name', 'twitter:description'), route.description);
  assert.equal(html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1], canonical);
  assert.equal(meta(html, 'property', 'og:url'), canonical);
  assert.equal(meta(html, 'name', 'twitter:url'), canonical);
  assert.equal(new URL(meta(html, 'property', 'og:image')).origin, SITE_ORIGIN);
  assert.match(html, /media="print" onload="this\.media='all'"/);
  assert.match(html, /<noscript><link[^>]+fonts\.googleapis\.com/);
  assert.match(html, /rel="preconnect" href="https:\/\/fonts\.googleapis\.com"/);
  assert.doesNotMatch(body, /\b(?:href|src|data)=["'][^"']*\.pdf(?:[?#][^"']*)?["']/i, `${pathname}: PDF URL must not appear before verified access.`);
  assert.match(body, new RegExp(`<time\\b[^>]*datetime="${LAST_UPDATED}"`, 'i'), `${pathname}: visible revision date is missing.`);
  if (pathname !== '/') assert.match(body, /<nav\b[^>]*aria-label="Breadcrumb"/i, `${pathname}: visible breadcrumb is missing.`);
  const data = readRouteSchema(html, pathname);
  for (const node of data['@graph']) {
    if (node.dateModified) assert.equal(node.dateModified, LAST_UPDATED);
    if (node['@type'] === 'Article' || node['@type'] === 'MedicalWebPage') assert.equal(node.headline, route.h1);
  }
  if (pathname === '/') {
    const faqSection = body.match(/<section\b(?=[^>]*\bid="faq")[^>]*>([\s\S]*?)<\/section>/i)?.[1] || '';
    const visibleFaqs = [...faqSection.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)].map(match => match[1]);
    assert.equal(visibleFaqs.length, 4, 'The home page must render exactly four FAQ answers.');
    for (const item of FAQ_ITEMS) assert.ok(visibleFaqs.some(faq => text(faq).includes(item.question) && text(faq).includes(item.answer)), `FAQ visible/schema mismatch: ${item.question}`);
  }
  if (pathname !== '/') assert.doesNotMatch(body, /\bid="faq"/i, `${pathname}: core FAQs belong on the home hub.`);
  assert.equal(/\bid="scientific-references"/i.test(body), pathname === '/when-to-seek-care', `${pathname}: full references belong on the clinical safety page.`);
  if (pathname === '/workbooks') {
    const cards = [...body.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)].map(match => match[1]);
    for (const product of data['@graph'].filter(node => node['@type'] === 'Product')) {
      const card = cards.find(candidate => text(candidate).includes(product.name) && candidate.includes(`href="${product.offers.url}"`));
      assert.ok(card, `Missing visible product and Gumroad link: ${product.name}`);
      assert.ok(text(card).includes(`$${Number(product.offers.price)}`), `Missing visible price: ${product.name}`);
      assert.ok(text(card).includes(product.description), `Product description differs from visible body: ${product.name}`);
    }
  }
  console.log(`Validated ${pathname}: 1 H1, ${(body.match(/<h2\b/gi) || []).length} H2s, ${(body.match(/<h3\b/gi) || []).length} H3s, ${html.length.toLocaleString()} HTML characters.`);
}

for (const pathname of Object.keys(legalFiles)) {
  const filename = await resolveLocal(pathname);
  const html = await readFile(filename, 'utf8');
  documents.set(filename, html);
  assert.ok(html.includes(`${SITE_ORIGIN}${pathname}`), `${pathname}: canonical legal URL is missing.`);
}

let localReferenceCount = 0;
for (const [filename, html] of [...documents]) {
  const pathname = [...ROUTE_PATHS].find(route => path.resolve(dist, route === '/' ? 'index.html' : route.slice(1), ...(route === '/' ? [] : ['index.html'])) === filename) || Object.keys(legalFiles).find(route => filename === path.join(dist, legalFiles[route])) || '/';
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const raw = decode(match[1]);
    if (/^(?:mailto:|tel:|data:|blob:|javascript:)/i.test(raw)) continue;
    const url = new URL(raw, `${SITE_ORIGIN}${pathname}`);
    if (url.origin !== SITE_ORIGIN) continue;
    localReferenceCount++;
    const target = await resolveLocal(url.pathname);
    if (url.hash && /\.html$/i.test(target)) {
      const targetHtml = documents.get(target) || await readFile(target, 'utf8');
      const fragment = decodeURIComponent(url.hash.slice(1));
      const ids = [...targetHtml.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)].map(item => decode(item[1]));
      assert.ok(ids.includes(fragment), `Broken fragment ${raw} linked from ${pathname}.`);
    }
  }
}

const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent:\s*\*/i);
assert.match(robots, /Allow:\s*\//i);
assert.ok(robots.includes(`${SITE_ORIGIN}/sitemap.xml`));
for (const privatePath of ['/admin', '/api/admin/', '/api/leads', '/.netlify/functions/']) assert.ok(robots.includes(`Disallow: ${privatePath}`));
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const expectedLocations = [...ROUTE_PATHS, ...Object.keys(legalFiles)].map(route => `${SITE_ORIGIN}${route}`);
assert.deepEqual([...locations].sort(), expectedLocations.sort(), 'Sitemap must list all six routes and four canonical legal/editorial pages exactly once.');
const dates = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match => match[1]);
assert.equal(dates.length, locations.length);
assert.ok(dates.every(date => date === LAST_UPDATED), 'Sitemap lastmod must match the actual revision date.');
for (const location of locations) await resolveLocal(new URL(location).pathname);
const redirects = await readFile(path.join(dist, '_redirects'), 'utf8');
assert.doesNotMatch(redirects, /^\s*\/\*\s+\/index\.html\s+200/m, 'A universal SPA 200 rewrite would create soft 404s.');
for (const resource of ['/robots.txt', '/sitemap.xml']) assert.ok(redirects.split(/\r?\n/).some(rule => {
  const [from, to, status] = rule.trim().split(/\s+/);
  return from === resource && to === resource && status === '200';
}), `${resource} must retain an explicit static 200 rule.`);
for (const pathname of ROUTE_PATHS) assert.ok(redirects.split(/\r?\n/).some(rule => {
  const [from, to, status] = rule.trim().split(/\s+/);
  return from === pathname && to === (pathname === '/' ? '/index.html' : `${pathname}/index.html`) && status === '200';
}), `${pathname} must resolve to its own pre-rendered document.`);
assert.match(redirects, /^\/\*\s+\/404\.html\s+404\s*$/m, 'Unknown paths must retain a real 404 status.');
const configuration = await readFile('netlify.toml', 'utf8');
assert.match(configuration, /X-Frame-Options\s*=\s*"DENY"/);
assert.match(configuration, /X-Content-Type-Options\s*=\s*"nosniff"/);
assert.match(configuration, /Referrer-Policy\s*=\s*"strict-origin-when-cross-origin"/);
assert.match(configuration, /from\s*=\s*"\/\*"\s*\n\s*to\s*=\s*"\/404\.html"\s*\n\s*status\s*=\s*404/);
console.log(`Static route SEO validation passed: ${ROUTE_PATHS.length} complete route pages, ${locations.length} sitemap entries, ${localReferenceCount} local links/assets checked.`);
