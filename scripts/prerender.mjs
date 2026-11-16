import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { readRouteSchema } from './lib/editorial-schema.mjs';

const projectRoot = process.cwd();
const dist = path.join(projectRoot, 'dist');
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('Expected an empty #root before pre-rendering.');
if (!/<!-- page-seo:start -->[\s\S]*?<!-- page-seo:end -->/.test(template)) throw new Error('Missing route SEO head boundary in the HTML template.');

const vite = await createServer({ configFile: path.join(projectRoot, 'vite.config.ts'), mode: 'production', appType: 'custom', logLevel: 'error', server: { middlewareMode: true } });
try {
  const [{ default: App }, { ROUTE_PATHS }, { headForRoute }] = await Promise.all([
    vite.ssrLoadModule('/App.tsx'), vite.ssrLoadModule('/siteConfig.ts'), vite.ssrLoadModule('/lib/page-seo.ts'),
  ]);
  for (const pathname of ROUTE_PATHS) {
    const markup = renderToString(createElement(App, { initialPath: pathname }));
    if ((markup.match(/<h1\b/gi) ?? []).length !== 1) throw new Error(`${pathname}: expected exactly one H1.`);
    if (/Loading\s+guide/i.test(markup)) throw new Error(`${pathname}: client-only loading shell in pre-rendered output.`);
    if (/\b(?:href|src|data)=["'][^"']*\.pdf(?:[?#][^"']*)?["']/i.test(markup)) throw new Error(`${pathname}: a PDF URL reached the initial unauthenticated document.`);
    for (const landmark of ['main', 'nav', 'footer']) {
      if (!new RegExp(`<${landmark}\\b`, 'i').test(markup)) throw new Error(`${pathname}: missing ${landmark} landmark.`);
    }
    let html = template.replace(/<!-- page-seo:start -->[\s\S]*?<!-- page-seo:end -->/, `<!-- page-seo:start -->\n    ${headForRoute(pathname)}\n    <!-- page-seo:end -->`);
    html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
    readRouteSchema(html, pathname);
    const directory = pathname === '/' ? dist : path.join(dist, pathname.slice(1));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'index.html'), html, 'utf8');
    console.log(`Pre-rendered ${pathname}: ${markup.length.toLocaleString()} body characters.`);
  }
} finally {
  await vite.close();
}
