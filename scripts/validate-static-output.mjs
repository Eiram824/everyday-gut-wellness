import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
const canonical = 'https://everyday-gut-wellness.netlify.app/';
const expectedTitle = 'Everyday Gut Wellness: Practical Microbiome Nutrition, Digestion Habits & Bloating Relief';
const expectedDescription = 'Improve daily digestion naturally with structured microbiome nutrition, gut-friendly meal habits, and evidence-informed wellness guides for bloating relief and digestive balance.';
const expectedKeywords = 'everyday gut wellness, digestive health habits, gut microbiome balance, natural bloating relief, gut-friendly foods, prebiotic fiber guide, gut-brain connection, daily digestion routine';

assert.doesNotMatch(html, /Loading guide/i, 'The client-only loading shell must be absent.');
assert.equal((html.match(/<h1\b/gi) || []).length, 1, 'The page must have exactly one H1.');
assert.ok((html.match(/<h2\b/gi) || []).length >= 7, 'The rendered article must include its H2 sections.');
assert.ok((html.match(/<h3\b/gi) || []).length >= 8, 'The rendered article must include its H3 subheadings.');
assert.match(html, /<main\b/i, 'A semantic main landmark must be present.');
assert.match(html, /<article\b/i, 'The educational article must be rendered semantically.');
assert.match(html, /<nav\b/i, 'Navigation must exist in the initial HTML.');
assert.match(html, /<footer\b/i, 'The footer must exist in the initial HTML.');
assert.match(html, /Your Gut Has a Routine\. Are Your Daily Habits Working With It\?/);
assert.match(html, /The Daily Habit Check/);
assert.match(html, /The Fiber Lesson: Soluble, Insoluble &amp; Gradual Pace/);
assert.match(html, /The Routine Reset: A Realistic Daily Rhythm/);
assert.match(html, /When to Seek Medical Advice/);
assert.match(html, /Editorial &amp; Research Standards/);
assert.match(html, /Frequently Asked Questions/);
assert.match(html, /Educational health notice/);
assert.match(html, /name="keywords"/);
assert.ok(html.includes(`<title>${expectedTitle.replace('&', '&amp;')}</title>`));
assert.ok(html.includes(`name="description" content="${expectedDescription}"`));
assert.ok(html.includes(`name="keywords" content="${expectedKeywords}"`));
assert.ok(html.includes(`property="og:title" content="${expectedTitle.replace('&', '&amp;')}"`));
assert.ok(html.includes(`property="og:description" content="${expectedDescription}"`));
assert.ok(html.includes(`name="twitter:title" content="${expectedTitle.replace('&', '&amp;')}"`));
assert.ok(html.includes(`name="twitter:description" content="${expectedDescription}"`));
assert.match(html, /media="print" onload="this\.media='all'"/);
assert.match(html, /<noscript><link[^>]+fonts\.googleapis\.com/);
assert.match(html, /rel="preconnect" href="https:\/\/fonts\.googleapis\.com"/);

for (const [label, regex] of [
  ['canonical', /<link rel="canonical" href="([^"]+)"/],
  ['Open Graph URL', /<meta property="og:url" content="([^"]+)"/],
  ['Twitter URL', /<meta name="twitter:url" content="([^"]+)"/],
]) {
  const url = html.match(regex)?.[1];
  assert.equal(url, canonical, `${label} must use the live Netlify URL.`);
}

assert.doesNotMatch(html, /everydaygutwellness\.org/i, 'No unowned-domain references may remain.');

const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
assert.equal(jsonLdBlocks.length, 1, 'Expected one parseable JSON-LD graph.');
const structuredData = JSON.parse(jsonLdBlocks[0][1]);
assert.equal(structuredData['@context'], 'https://schema.org');
const graph = structuredData['@graph'];
const types = graph.map((entry) => entry['@type']);
for (const requiredType of ['Article', 'FAQPage', 'WebSite']) assert.ok(types.includes(requiredType), `Missing ${requiredType} structured data.`);

const faq = graph.find((entry) => entry['@type'] === 'FAQPage');
assert.ok(faq.mainEntity.length >= 4, 'FAQ schema must describe visible FAQ items.');
for (const question of faq.mainEntity) {
  assert.ok(html.includes(question.name), `FAQ question is missing from visible HTML: ${question.name}`);
  assert.ok(html.includes(question.acceptedAnswer.text), `FAQ answer is missing from visible HTML: ${question.name}`);
}

const localUrls = new Set([...html.matchAll(/\b(?:href|src)="(\/[^"]+)"/g)].map((match) => match[1].split(/[?#]/)[0]));
const missingAssets = [];
for (const url of localUrls) {
  if (url === '/') continue;
  try {
    await access(path.join(dist, decodeURIComponent(url.slice(1))));
  } catch {
    missingAssets.push(url);
  }
}
assert.deepEqual(missingAssets, [], `Missing local assets or linked pages: ${missingAssets.join(', ')}`);

const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent:\s*\*/i);
assert.match(robots, /Allow:\s*\//i);
assert.ok(robots.includes(`${canonical.replace(/\/$/, '')}/sitemap.xml`));

const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
assert.match(sitemap, /<urlset\b[\s\S]*<\/urlset>/);
assert.match(sitemap, /<lastmod>2026-11-13<\/lastmod>/);
const sitemapRoutes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
assert.ok(sitemapRoutes.some((url) => url.href === canonical));
for (const url of sitemapRoutes) {
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  try {
    await access(path.join(dist, decodeURIComponent(pathname.slice(1))));
  } catch {
    assert.fail(`Sitemap URL is not present in the production output: ${url.href}`);
  }
}

console.log(`Static SEO validation passed: ${html.length.toLocaleString()} HTML characters, 1 H1, ${(html.match(/<h2\b/gi) || []).length} H2s, ${(html.match(/<h3\b/gi) || []).length} H3s, ${faq.mainEntity.length} visible FAQ entries, ${localUrls.size} local references, and ${sitemapRoutes.length} sitemap URLs.`);
