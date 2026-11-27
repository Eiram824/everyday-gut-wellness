/**
 * Generates tall Pinterest Pin images (1000x1500) from content/pins.json into
 * public/assets/pins/<slug>-<n>.jpg. The first variant is also copied to
 * public/assets/pins/<slug>.jpg, which the RSS feed (feed.xml) uses.
 *
 * Not part of the Netlify build: run it locally, then commit the JPGs.
 * Needs Playwright with a Chromium browser:  node scripts/make-pin-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'assets', 'pins');
const logo = fs.readFileSync(path.join(ROOT, 'public', 'logo.svg'), 'utf8');
const pins = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'pins.json'), 'utf8'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Brand palette (matches the website)
const C = { green: '#14382B', terra: '#A3502C', ink: '#2C2A26', cream: '#FBF9F5', sand: '#F3EFE6', mint: '#EAF1ED', blush: '#EAD3C7', muted: '#635F57' };

const THEMES = {
  A: { bg: C.cream, fg: C.green, eyebrow: C.terra, sub: C.muted, blob1: C.mint, blob2: '#F8EFEA', cta: C.green, ctaFg: C.cream },
  B: { bg: C.green, fg: C.cream, eyebrow: '#E9B89B', sub: '#CFE0D7', blob1: '#1E4A3A', blob2: '#245443', cta: C.cream, ctaFg: C.green },
  C: { bg: C.sand, fg: C.green, eyebrow: C.terra, sub: C.muted, blob1: C.mint, blob2: '#F8EFEA', cta: C.terra, ctaFg: C.cream },
  D: { bg: C.blush, fg: C.green, eyebrow: C.terra, sub: '#5A4A42', blob1: '#F3E2D9', blob2: '#E2C2B3', cta: C.green, ctaFg: C.cream },
};

function html(p) {
  const t = THEMES[p.style];
  const list = p.bullets
    ? `<ul>${p.bullets.map((b) => `<li><span class="dot"></span>${esc(b)}</li>`).join('')}</ul>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Playfair+Display:wght@700&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1000px;height:1500px;background:${t.bg};font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow:hidden}
.b1{position:absolute;right:-220px;top:-200px;width:720px;height:720px;border-radius:50%;background:${t.blob1}}
.b2{position:absolute;left:-180px;bottom:-240px;width:620px;height:620px;border-radius:50%;background:${t.blob2}}
.top{position:absolute;left:80px;right:80px;top:84px;display:flex;align-items:center;gap:16px;font-weight:800;font-size:30px;color:${t.fg}}
.top svg{width:54px;height:54px;flex:none}
.top .badge{display:flex;align-items:center;justify-content:center;width:76px;height:76px;border-radius:50%;background:${C.cream}}
.wrap{position:absolute;left:80px;right:80px;top:250px;bottom:300px;display:flex;flex-direction:column;justify-content:center}
.eyebrow{font-size:30px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${t.eyebrow}}
h1{font-family:'Playfair Display',serif;font-weight:700;color:${t.fg};font-size:104px;line-height:1.06;margin-top:28px}
.sub{font-size:40px;font-weight:600;color:${t.sub};margin-top:34px;line-height:1.3}
ul{list-style:none;margin-top:44px;display:flex;flex-direction:column;gap:22px}
li{display:flex;align-items:flex-start;gap:22px;font-size:40px;font-weight:600;color:${t.fg};line-height:1.25;background:rgba(255,255,255,.55);border-radius:22px;padding:22px 28px}
.dot{flex:none;width:20px;height:20px;border-radius:50%;background:${t.eyebrow};margin-top:14px}
.cta{position:absolute;left:80px;right:80px;bottom:110px;display:flex;align-items:center;justify-content:space-between;background:${t.cta};color:${t.ctaFg};border-radius:999px;padding:30px 44px;font-size:36px;font-weight:800}
.cta b{white-space:nowrap}
.cta span{font-weight:600;font-size:28px;opacity:.85;white-space:nowrap}
</style></head><body><div class="b1"></div><div class="b2"></div>
<div class="top"><span class="badge">${logo}</span>Everyday Gut Wellness</div>
<div class="wrap"><p class="eyebrow">${esc(p.eyebrow)}</p><h1>${esc(p.headline)}</h1>${p.sub ? `<p class="sub">${esc(p.sub)}</p>` : ''}${list}</div>
<div class="cta"><b>Read the free guide →</b><span>everydaygutwellness.com</span></div>
</body></html>`;
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
for (const p of pins) {
  await page.setContent(html(p), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Shrink the headline until the text block fits between the logo row and the button.
  await page.evaluate(() => {
    const h = document.querySelector('h1');
    const wrap = document.querySelector('.wrap');
    let size = parseFloat(getComputedStyle(h).fontSize);
    while (wrap.scrollHeight > wrap.clientHeight && size > 56) h.style.fontSize = `${(size -= 4)}px`;
  });
  const file = path.join(OUT, `${p.slug}-${p.n}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 84 });
  if (p.n === 1) fs.copyFileSync(file, path.join(OUT, `${p.slug}.jpg`));
}
await browser.close();
console.log(`[Pins] Wrote ${pins.length} Pin images to public/assets/pins/`);
