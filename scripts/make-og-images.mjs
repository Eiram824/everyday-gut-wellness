/**
 * Generates the 1200x630 social share images (Open Graph) for every guide and
 * comfort article, plus the site default, into public/assets/og/.
 *
 * Not part of the Netlify build: run it locally after adding an article, then
 * commit the new JPGs. Needs Playwright with a Chromium browser:
 *   node scripts/make-og-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// CommonJS require so a globally installed Playwright (NODE_PATH) also works.
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'assets', 'og');
const logo = fs.readFileSync(path.join(ROOT, 'public', 'logo.svg'), 'utf8');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function readMeta(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.html'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(full, f), 'utf8').replace(/\r\n/g, '\n');
      const m = raw.match(/^<!--meta\n([\s\S]*?)\n-->\n/);
      return { slug: f.replace(/\.html$/, ''), meta: JSON.parse(m[1]) };
    })
    .filter((a) => !a.meta.draft);
}

function card({ eyebrow, title, accent }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Playfair+Display:wght@700&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#FBF9F5;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow:hidden}
.band{position:absolute;left:0;top:0;bottom:0;width:22px;background:${accent}}
.blob{position:absolute;right:-140px;top:-140px;width:520px;height:520px;border-radius:50%;background:#EAF1ED}
.blob2{position:absolute;right:120px;bottom:-200px;width:360px;height:360px;border-radius:50%;background:#F8EFEA}
.wrap{position:absolute;left:96px;right:120px;top:84px;bottom:72px;display:flex;flex-direction:column}
.eyebrow{font-size:26px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#A3502C}
h1{font-family:'Playfair Display',serif;font-weight:700;color:#14382B;font-size:68px;line-height:1.12;margin-top:22px;max-width:960px}
.foot{margin-top:auto;display:flex;align-items:center;gap:16px;font-size:28px;font-weight:700;color:#14382B}
.foot svg{width:44px;height:44px}
.foot span{font-weight:600;color:#635F57;font-size:24px;margin-left:8px}
</style></head><body><div class="band"></div><div class="blob"></div><div class="blob2"></div>
<div class="wrap"><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1>
<div class="foot">${logo}Everyday Gut Wellness<span>everydaygutwellness.com</span></div></div></body></html>`;
}

const jobs = [
  { file: 'default.jpg', eyebrow: 'Evidence-informed digestive health', title: 'Your gut has a routine. Build daily habits that work with it.', accent: '#14382B' },
  ...readMeta('content/guides').map((a) => ({ file: `${a.slug}.jpg`, eyebrow: a.meta.eyebrow || 'Guide', title: a.meta.h1, accent: '#14382B' })),
  ...readMeta('content/comfort').map((a) => ({ file: `${a.slug}.jpg`, eyebrow: a.meta.eyebrow || 'Belly comfort', title: a.meta.h1, accent: '#A3502C' })),
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const job of jobs) {
  await page.setContent(card(job), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Shrink long titles so they always fit above the footer.
  await page.evaluate(() => {
    const h = document.querySelector('h1');
    let size = 68;
    while (h.getBoundingClientRect().bottom > 470 && size > 40) h.style.fontSize = `${(size -= 4)}px`;
  });
  await page.screenshot({ path: path.join(OUT, job.file), type: 'jpeg', quality: 82 });
}
await browser.close();
console.log(`[OG] Wrote ${jobs.length} share images to public/assets/og/`);
