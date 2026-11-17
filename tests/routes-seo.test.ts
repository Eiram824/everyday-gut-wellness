import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { ROUTES, ROUTE_PATHS, SITE_ORIGIN, LAST_UPDATED, normalizePath } from '../siteConfig';
import { applyPageMetadata, headForRoute, schemaForRoute } from '../lib/page-seo';
import { FAQ_ITEMS } from '../lib/editorial-content';
import { MEAL_UPGRADE_EXAMPLES, MYTH_FACT_ITEMS, ROUTINE_CHECKLIST, WARNING_SIGNS } from '../constants';
import { writeDomainRedirects } from '../scripts/prepare-domain-redirects.mjs';

const exactTitles = {
  '/': 'Everyday Gut Wellness: Fiber & Bowel Regularity Guide',
  '/fiber-guide': 'Soluble vs. Insoluble Fiber Guide for Bowel Regularity',
  '/routine-reset': 'Daily Digestive Routine Reset & Gastrocolic Guide',
  '/myths-vs-facts': 'Digestive Health Myths vs. Facts: Detoxes & Fiber',
  '/when-to-seek-care': 'Constipation Red Flags & When to See a Doctor',
  '/workbooks': 'Printable Gut Health Workbooks & 30-Day Trackers (PDF)',
};
const unescapeHtml = (value: string) => value.replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16))).replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

describe('Published route metadata and indexing configuration', () => {
  it('uses exactly the six requested routes and titles, including titles shorter than the generic length suggestion', () => {
    assert.deepEqual(ROUTE_PATHS, Object.keys(exactTitles));
    for (const pathname of ROUTE_PATHS) {
      assert.equal(ROUTES[pathname].title, exactTitles[pathname]);
      assert.equal(normalizePath(pathname), pathname);
      assert.equal(normalizePath(`${pathname === '/' ? '' : pathname}/?source=test#section`), pathname);
    }
    for (const pathname of ['/unknown', '/fiber-guide/unknown', '/admin', '/api/health', '/fiber-guide.html']) assert.equal(normalizePath(pathname), null);
  });

  it('produces route-specific canonical, social and description tags with one escaped JSON-LD block', () => {
    for (const pathname of ROUTE_PATHS) {
      const head = headForRoute(pathname);
      const canonical = `${SITE_ORIGIN}${pathname}`;
      assert.equal(unescapeHtml(head.match(/<title>([^<]+)<\/title>/)?.[1] || ''), ROUTES[pathname].title);
      assert.equal(unescapeHtml(head.match(/name="description" content="([^"]+)"/)?.[1] || ''), ROUTES[pathname].description);
      assert.ok(head.includes(`<link rel="canonical" href="${canonical}"`));
      for (const attribute of ['property="og:url"', 'name="twitter:url"']) assert.ok(head.includes(`${attribute} content="${canonical}"`));
      assert.equal((head.match(/application\/ld\+json/g) || []).length, 1);
      assert.doesNotMatch(head, /everydaygutwellness\.org|everyday-gut-wellness\.netlify\.app/);
      const graph = schemaForRoute(pathname)['@graph'];
      for (const node of graph) if ('dateModified' in node) assert.equal(node.dateModified, LAST_UPDATED);
    }
  });

  it('keeps the four core FAQ answers synchronized with the home structured data', () => {
    const faq = schemaForRoute('/')['@graph'].find(node => node['@type'] === 'FAQPage') as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    assert.deepEqual(faq.mainEntity.map(item => ({ question: item.name, answer: item.acceptedAnswer.text })), FAQ_ITEMS);
    for (const pathname of ROUTE_PATHS.filter(path => path !== '/')) assert.ok(schemaForRoute(pathname)['@graph'].every(node => node['@type'] !== 'FAQPage'));
  });

  it('is safe to import and apply metadata while rendering without a browser DOM', () => {
    assert.equal(typeof document, 'undefined');
    for (const pathname of ROUTE_PATHS) assert.doesNotThrow(() => applyPageMetadata(pathname));
  });

  it('renders all six route bodies with one exact H1, working navigation and gated initial content', async () => {
    const vite = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true } });
    try {
      const { default: App } = await vite.ssrLoadModule('/App.tsx');
      for (const pathname of ROUTE_PATHS) {
        const markup = renderToStaticMarkup(createElement(App, { initialPath: pathname }));
        const h1s = [...markup.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
        assert.equal(h1s.length, 1, `${pathname} needs exactly one H1.`);
        assert.equal(unescapeHtml(h1s[0][1].replace(/<[^>]+>/g, '')), ROUTES[pathname].h1);
        for (const landmark of ['main', 'nav', 'footer']) assert.match(markup, new RegExp(`<${landmark}\\b`, 'i'));
        assert.match(markup, new RegExp(`<time\\b[^>]*datetime="${LAST_UPDATED}"`, 'i'));
        assert.doesNotMatch(markup, /\b(?:href|src|data)=["'][^"']*\.pdf(?:[?#][^"']*)?["']/i);
        assert.doesNotMatch(markup, /role="dialog"|Loading guide/i);
        for (const destination of ROUTE_PATHS) assert.ok(markup.includes(`href="${destination}"`), `${pathname} must link to ${destination}.`);
        if (pathname !== '/') assert.match(markup, /aria-label="Breadcrumb"/);
        const faqSection = markup.match(/<section\b(?=[^>]*\bid="faq")[^>]*>([\s\S]*?)<\/section>/i)?.[1];
        assert.equal(Boolean(faqSection), pathname === '/');
        if (faqSection) assert.equal((faqSection.match(/<details\b/g) || []).length, 4);
        assert.equal(markup.includes('id="scientific-references"'), pathname === '/when-to-seek-care');
        assert.doesNotMatch(markup, /Powered by (?:Netlify|Systeme)/i);
        const text = unescapeHtml(markup.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ');
        const contains = (value: string) => assert.ok(text.includes(value.replace(/\s+/g, ' ')), `${pathname}: missing preserved content: ${value}`);
        if (pathname === '/fiber-guide') for (const meal of MEAL_UPGRADE_EXAMPLES) { contains(meal.baseMeal); contains(meal.upgradeAddition); contains(meal.hydrationTip); }
        if (pathname === '/myths-vs-facts') for (const myth of MYTH_FACT_ITEMS) { contains(myth.fact); contains(myth.explanation); contains(myth.scienceNote); }
        if (pathname === '/routine-reset') for (const habit of ROUTINE_CHECKLIST) { contains(habit.title); contains(habit.description); contains(habit.whyItHelps); }
        if (pathname === '/when-to-seek-care') for (const warning of WARNING_SIGNS) { contains(warning.symptom); contains(warning.reason); contains(warning.actionRequired); }
      }
      const unknown = renderToStaticMarkup(createElement(App, { initialPath: '/missing-route' }));
      assert.match(unknown, /This page could not be found/);
      assert.doesNotMatch(unknown, /The Daily Habit Check/);
    } finally { await vite.close(); }
  });

  it('preserves API/admin handlers, serves each known route document and returns 404 for unknown routes', async () => {
    const rules = await readFile(new URL('../public/_redirects', import.meta.url), 'utf8');
    const parsed = rules.split(/\r?\n/).map(line => line.trim().split(/\s+/)).filter(parts => parts[0] && !parts[0].startsWith('#'));
    for (const pathname of ROUTE_PATHS) assert.ok(parsed.some(([from, to, status]) => from === pathname && to === (pathname === '/' ? '/index.html' : `${pathname}/index.html`) && status === '200'));
    for (const resource of ['/robots.txt', '/sitemap.xml']) assert.ok(parsed.some(([from, to, status]) => from === resource && to === resource && status === '200'));
    for (const [from, to] of [['/admin', 'admin'], ['/admin/*', 'admin'], ['/api/subscribe', 'subscribe'], ['/api/bundle-interest', 'bundle-interest'], ['/api/admin/verify', 'admin-verify'], ['/api/leads', 'leads'], ['/api/leads/export.csv', 'leads-export'], ['/api/health', 'health'], ['/health', 'health']]) assert.ok(parsed.some(rule => rule[0] === from && rule[1] === `/.netlify/functions/${to}` && rule[2] === '200'));
    assert.ok(parsed.findIndex(rule => rule[0] === '/api/bundle-interest') < parsed.findIndex(rule => rule[0] === '/api/*'), 'The bundle interest endpoint must resolve before the API 404 fallback.');
    assert.ok(parsed.some(([from, to, status]) => from === '/api/*' && to === '/.netlify/functions/api-not-found' && status === '404'));
    assert.deepEqual(parsed.at(-1), ['/*', '/404.html', '404']);
    const config = await readFile(new URL('../netlify.toml', import.meta.url), 'utf8');
    assert.match(config, /from\s*=\s*"\/api\/bundle-interest"\s*\n\s*to\s*=\s*"\/\.netlify\/functions\/bundle-interest"\s*\n\s*status\s*=\s*200/);
    assert.ok(config.indexOf('from = "/api/bundle-interest"') < config.indexOf('from = "/api/*"'));
    for (const value of ['X-Frame-Options = "DENY"', 'X-Content-Type-Options = "nosniff"', 'Referrer-Policy = "strict-origin-when-cross-origin"']) assert.ok(config.includes(value));
    assert.doesNotMatch(config, /from\s*=\s*"\/\*"\s*\n\s*to\s*=\s*"\/index.html"/);
  });

  it('retains static route rules through production host cutover and repeated builds', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'egw-routes-'));
    try {
      const source = await readFile(new URL('../public/_redirects', import.meta.url), 'utf8');
      await writeFile(join(directory, '_redirects'), source);
      for (const environment of [{}, { CONTEXT: 'production', CUSTOM_DOMAIN_REDIRECTS_ENABLED: 'true' }, { CONTEXT: 'production', CUSTOM_DOMAIN_REDIRECTS_ENABLED: 'true' }, { CONTEXT: 'deploy-preview' }]) {
        await writeDomainRedirects(directory, environment);
        const actual = await readFile(join(directory, '_redirects'), 'utf8');
        assert.ok(actual.endsWith(source));
        assert.equal((actual.match(/^https:\/\/everyday-gut-wellness\.netlify\.app\/\*/gm) || []).length, environment.CONTEXT === 'production' ? 1 : 0);
      }
    } finally { await rm(directory, { recursive: true, force: true }); }
  });

  it('lists six routes and all existing canonical legal/editorial pages in the sitemap', async () => {
    const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
    const actual = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
    const expected = [...ROUTE_PATHS, '/privacy', '/terms', '/contact', '/editorial-standards.html'].map(path => `${SITE_ORIGIN}${path}`);
    assert.deepEqual(actual.sort(), expected.sort());
    assert.equal(new Set(actual).size, actual.length);
    assert.ok([...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].every(match => match[1] === LAST_UPDATED));
    const robots = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8');
    assert.ok(robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`));
    for (const privatePath of ['/admin', '/api/admin/', '/api/leads', '/.netlify/functions/']) assert.ok(robots.includes(`Disallow: ${privatePath}`));
  });
});
