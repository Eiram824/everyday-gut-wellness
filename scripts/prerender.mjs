import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const projectRoot = process.cwd();
const outputPath = path.join(projectRoot, 'dist', 'index.html');
const template = await readFile(outputPath, 'utf8');

if (!template.includes('<div id="root"></div>')) {
  throw new Error('Expected an empty #root in dist/index.html before pre-rendering.');
}

const vite = await createServer({
  configFile: path.join(projectRoot, 'vite.config.ts'),
  mode: 'production',
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const { default: App } = await vite.ssrLoadModule('/App.tsx');
  const markup = renderToString(createElement(App));
  if (!markup.includes('Your Gut Has a Routine. Are Your Daily Habits Working With It?')) {
    throw new Error('The rendered HTML is missing the article H1.');
  }
  if (/<h1\b/gi.test(markup) && (markup.match(/<h1\b/gi) ?? []).length !== 1) {
    throw new Error('The rendered article must contain exactly one H1.');
  }
  if (markup.includes('Loading guide')) {
    throw new Error('The client-only Loading Guide shell must not appear in generated HTML.');
  }

  const html = template.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  await writeFile(outputPath, html, 'utf8');
  console.log(`Pre-rendered ${markup.length.toLocaleString()} characters into dist/index.html.`);
} finally {
  await vite.close();
}
