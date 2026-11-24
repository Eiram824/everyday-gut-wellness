/**
 * Prerenders the homepage into dist/index.html after `vite build`.
 *
 * Without this, the homepage HTML only contains a "Loading guide..." placeholder
 * until JavaScript runs, so crawlers, link previews and AI search tools see an
 * empty page. The rendered markup replaces the placeholder between the
 * <!--prerender:start--> and <!--prerender:end--> markers, and index.tsx then
 * hydrates it. Run: tsx scripts/prerender-home.tsx (part of build:client).
 */
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../App';

const file = path.join(process.cwd(), 'dist', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const pattern = /<div id="root"><!--prerender:start-->[\s\S]*?<!--prerender:end--><\/div>/;
if (!pattern.test(html)) {
  throw new Error('dist/index.html: prerender markers not found inside #root');
}

const markup = renderToString(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
if (!markup.includes('<h1')) throw new Error('Prerendered homepage has no <h1>; refusing to write it.');

fs.writeFileSync(file, html.replace(pattern, () => `<div id="root" data-prerendered="">${markup}</div>`));
console.log(`[Prerender] Homepage prerendered into dist/index.html (${Math.round(markup.length / 1024)} KB of HTML).`);
