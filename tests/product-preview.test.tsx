import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { ProductSection, safeBundleCheckoutUrl } from '../components/ProductSection.js';
import { ProductPreviewModal } from '../components/ProductPreviewModal.js';
import { GUT_CLARITY_PRODUCT, GUT_ROUTINE_PLANNER_PRODUCT } from '../constants.js';
import { GUMROAD_BUNDLE_URL } from '../siteConfig.js';

// Exercise the component's actual handlers without a browser or an added DOM dependency.
// Controlled hooks expose state changes; native dialog lifecycle has separate DOM-double tests.
function controlledPreview(product: 'workbook' | 'planner', onClose = () => {}) {
  const state: unknown[] = [];
  const refs: Array<{ current: unknown }> = [];
  let stateIndex = 0;
  let refIndex = 0;
  const exports: Record<string, any> = {};
  const source = ts.transpileModule(readFileSync('components/ProductPreviewModal.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(source, {
    exports,
    require(name: string) {
      if (name === 'react/jsx-runtime') return jsxRuntime;
      if (name === 'react') return {
        useId: () => 'controlled-preview',
        useRef: (initial: unknown) => refs[refIndex++] ||= { current: initial },
        useState: (initial: unknown) => {
          const index = stateIndex++;
          if (!(index in state)) state[index] = initial;
          return [state[index], (next: unknown) => { state[index] = next; }];
        },
      };
      if (name === '../constants') return { GUT_CLARITY_PRODUCT, GUT_ROUTINE_PLANNER_PRODUCT };
      if (name === '../lib/useDialog') return { useModalDialog: () => {} };
      if (name === 'lucide-react') return Object.fromEntries(['ArrowLeft', 'ArrowRight', 'BookOpen', 'Check', 'X'].map(icon => [icon, () => null]));
      throw new Error(`Unexpected preview dependency: ${name}`);
    },
  });
  return () => {
    stateIndex = 0;
    refIndex = 0;
    return exports.ProductPreviewModal({ product, onClose }) as React.ReactElement;
  };
}

function elementTree(tree: React.ReactNode): Array<React.ReactElement<Record<string, any>>> {
  if (Array.isArray(tree)) return tree.flatMap(elementTree);
  if (!React.isValidElement<Record<string, any>>(tree)) return [];
  const element = tree as React.ReactElement<Record<string, any>>;
  return [element, ...elementTree(element.props.children)];
}

describe('Product storefront and illustrative previews', () => {
  it('keeps both live Gumroad listings, accurate price and format, and safe new-tab links', () => {
    const html = renderToStaticMarkup(<ProductSection onJoinWaitlist={() => {}} />);
    for (const product of [GUT_CLARITY_PRODUCT, GUT_ROUTINE_PLANNER_PRODUCT]) {
      const link = html.match(new RegExp(`<a[^>]+href="${product.url}"[^>]*>`))?.[0];
      assert.ok(link, `Expected the original checkout for ${product.id}`);
      assert.match(link, /target="_blank"/);
      assert.match(link, /rel="noopener noreferrer"/);
      assert.ok(html.includes(`$${product.priceUSD}`));
    }
    assert.match(html, /26-page printable/);
    assert.match(html, /31-page printable/);
    assert.match(html, /US Letter PDF/);
    assert.equal((html.match(/Preview Sample Pages/g) || []).length, 2);
    assert.equal((html.match(/aria-haspopup="dialog"/g) || []).length, 3);
    assert.doesNotMatch(html, /<dialog\b/);
  });

  it('offers a launch alert instead of a checkout when the centralized bundle URL is empty', () => {
    assert.equal(GUMROAD_BUNDLE_URL, '');
    const html = renderToStaticMarkup(<ProductSection onJoinWaitlist={() => {}} variant="full" />);
    assert.match(html, /<button[^>]*>Get Bundle Launch Alert/);
    assert.match(html, /\$39/);
    assert.match(html, /save \$16/i);
    assert.match(html, /Planned price · not available yet/);
    assert.match(html, /Planned bonus/);
    assert.match(html, /1-page Quick-Start Fiber/);
    assert.match(html, /no bundle checkout or charge today/);
    assert.doesNotMatch(html, /href="(?:#|\/workbooks)"[^>]*>Get (?:the complete bundle|Bundle Launch Alert)/);
  });

  it('shows the comparison and product FAQs on the full storefront, with a short homepage link', () => {
    const featured = renderToStaticMarkup(<ProductSection onJoinWaitlist={() => {}} variant="featured" />);
    const full = renderToStaticMarkup(<ProductSection onJoinWaitlist={() => {}} variant="full" />);
    assert.doesNotMatch(featured, /id="product-faq"/);
    assert.match(featured, /href="\/workbooks"/);
    assert.match(full, /id="product-faq"/);
    assert.match(full, /Two tools, different jobs/);
    assert.match(full, /not clinician-reviewed/);
    assert.match(full, /do not diagnose/);
    assert.doesNotMatch(full, /application\/ld\+json/);
  });

  it('renders the workbook observation and appointment summaries as correctly linked tab panels', () => {
    const html = renderToStaticMarkup(<ProductPreviewModal product="workbook" onClose={() => {}} />);
    assert.match(html, /<dialog[^>]+aria-labelledby="[^"]+"[^>]+aria-describedby="[^"]+"/);
    assert.match(html, /aria-label="Close sample preview"/);
    const tabs = Array.from(html.matchAll(/<button[^>]+role="tab"[^>]+id="([^"]+)"[^>]+aria-controls="([^"]+)"[^>]+aria-selected="(true|false)"[^>]+tabindex="(-?\d+)"/g));
    assert.equal(tabs.length, 2);
    assert.deepEqual(tabs.map(tab => [tab[3], tab[4]]), [['true', '0'], ['false', '-1']]);
    for (const tab of tabs) assert.ok(html.includes(`role="tabpanel" id="${tab[2]}" aria-labelledby="${tab[1]}"`));
    assert.equal((html.match(/role="tabpanel"/g) || []).length, 2);
    assert.equal((html.match(/hidden=""/g) || []).length, 1);
    for (const label of ['Daily observation log', 'Appointment-prep summary', 'Stool &amp; bathroom notes', 'Fiber-containing foods', 'Hydration notes', 'Questions for my healthcare professional']) assert.ok(html.includes(label), label);
    assert.match(html, /not actual PDF pages/);
    assert.match(html, /Fictional example entries/);
    assert.match(html, /href="\/when-to-seek-care"/);
    assert.doesNotMatch(html, /href="[^"]+\.pdf/);
  });

  it('renders the planner weekly module and all 30 illustrative calendar days', () => {
    const html = renderToStaticMarkup(<ProductPreviewModal product="planner" onClose={() => {}} />);
    for (const label of ['Weekly Plan, Fit &amp; Practice', '30-day habit calendar', 'My one focus this week', 'My cue &amp; place', 'My smaller fallback', 'What fit? What could change?']) assert.ok(html.includes(label), label);
    assert.equal((html.match(/<li[^>]+aria-label="Day \d+: (?:practiced|not marked)"/g) || []).length, 30);
    assert.match(html, /aria-label="Day 1: practiced"/);
    assert.match(html, /aria-label="Day 30: not marked"/);
    assert.match(html, /A blank day is simply a chance to review/);
    assert.match(html, /Fictional example entries/);
    assert.doesNotMatch(html, /<input|contenteditable|href="[^"]+\.pdf/);
  });

  it('switches previews with click, arrow, Home and End handlers while keeping one active tab and panel', () => {
    for (const product of ['workbook', 'planner'] as const) {
      let closeCount = 0;
      let focusedTab = -1;
      const render = controlledPreview(product, () => { closeCount += 1; });
      let tree = elementTree(render());
      const tabs = () => tree.filter(element => element.props.role === 'tab');
      const panels = () => tree.filter(element => element.props.role === 'tabpanel');
      tabs().forEach((tab, index) => tab.props.ref({ focus: () => { focusedTab = index; } }));
      function expectPage(index: number) {
        assert.deepEqual(tabs().map(tab => tab.props['aria-selected']), [index === 0, index === 1]);
        assert.deepEqual(tabs().map(tab => tab.props.tabIndex), [index === 0 ? 0 : -1, index === 1 ? 0 : -1]);
        assert.deepEqual(panels().map(panel => panel.props.hidden), [index !== 0, index !== 1]);
      }
      function key(tab: number, value: string, expected: number) {
        let prevented = false;
        tabs()[tab].props.onKeyDown({ key: value, preventDefault: () => { prevented = true; } });
        tree = elementTree(render());
        assert.equal(prevented, true);
        assert.equal(focusedTab, expected);
        expectPage(expected);
      }
      expectPage(0);
      key(0, 'ArrowRight', 1);
      key(1, 'ArrowRight', 0);
      key(0, 'ArrowLeft', 1);
      key(1, 'Home', 0);
      key(0, 'End', 1);
      let prevented = false;
      tabs()[1].props.onKeyDown({ key: 'PageDown', preventDefault: () => { prevented = true; } });
      assert.equal(prevented, false);
      expectPage(1);
      tabs()[0].props.onClick();
      tree = elementTree(render());
      expectPage(0);
      tree.filter(element => element.type === 'button').at(-1)!.props.onClick();
      tree = elementTree(render());
      expectPage(1);
      tree.filter(element => element.type === 'button').at(-1)!.props.onClick();
      tree = elementTree(render());
      expectPage(0);
      tree.find(element => element.props['aria-label'] === 'Close sample preview')!.props.onClick();
      assert.equal(closeCount, 1);
    }
  });

  it('only enables a real HTTPS Gumroad product path for a future bundle listing', () => {
    assert.equal(safeBundleCheckoutUrl(' https://eiram32.gumroad.com/l/example '), 'https://eiram32.gumroad.com/l/example');
    assert.equal(safeBundleCheckoutUrl('https://gumroad.com/l/example'), 'https://gumroad.com/l/example');
    for (const url of ['', ' ', '#', '/workbooks', 'javascript:alert(1)', 'http://gumroad.com/l/example', 'https://gumroad.com.evil.test/l/example', 'https://evil.test/l/example', 'https://user:secret@gumroad.com/l/example', 'https://gumroad.com:3000/l/example', 'https://gumroad.com/', 'https://gumroad.com/l/']) assert.equal(safeBundleCheckoutUrl(url), null, url);
  });

  it('ships self-contained SVG concept illustrations without replacing or claiming PDF cover images', () => {
    for (const file of ['workbook-cover.svg', 'planner-cover.svg']) {
      const svg = readFileSync(`public/assets/images/${file}`, 'utf8');
      assert.match(svg, /<svg[^>]+viewBox="0 0 680 820"/);
      assert.match(svg, /CONCEPT COVER ILLUSTRATION/);
      assert.match(svg, /<title id="title">/);
      assert.match(svg, /<desc id="desc">/);
      assert.doesNotMatch(svg, /<script|<image|https?:\/\/[^w]/);
    }
  });
});
