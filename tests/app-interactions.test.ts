import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import ts from 'typescript';
import * as siteConfig from '../siteConfig.js';
import * as constants from '../constants.js';
import * as habitCheck from '../lib/habit-check.js';

// Run actual component handlers with controlled hook state. This deliberately
// does not claim browser layout, native-event dispatch or React lifecycle QA.
function controlledModule(file: string, dependencies: Record<string, unknown>, globals: Record<string, unknown> = {}) {
  const state: unknown[] = [];
  const effects: Array<{ deps?: unknown[]; cleanup?: () => void }> = [];
  let stateIndex = 0, effectIndex = 0;
  let pending: Array<() => void> = [];
  const exports: Record<string, any> = {};
  const source = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(source, {
    ...globals, exports,
    require(name: string) {
      if (name === 'react/jsx-runtime') return jsxRuntime;
      if (name === 'react') return {
        useState(initial: unknown) {
          const index = stateIndex++;
          if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
          return [state[index], (next: unknown) => { state[index] = typeof next === 'function' ? next(state[index]) : next; }];
        },
        useEffect(effect: () => void | (() => void), deps?: unknown[]) {
          const index = effectIndex++;
          const previous = effects[index];
          if (!previous || !deps || deps.some((value, offset) => !Object.is(value, previous.deps?.[offset]))) {
            pending.push(() => { previous?.cleanup?.(); effects[index] = { deps, cleanup: effect() || undefined }; });
          }
        },
      };
      if (name in dependencies) return dependencies[name];
      throw new Error(`Unexpected component dependency: ${name}`);
    },
  });
  return {
    render(name = 'default', props: Record<string, unknown> = {}) {
      stateIndex = 0; effectIndex = 0; pending = [];
      const tree = exports[name](props) as React.ReactNode;
      pending.forEach(effect => effect());
      return tree;
    },
    cleanup() { effects.forEach(effect => effect.cleanup?.()); },
  };
}

function elements(tree: React.ReactNode): Array<React.ReactElement<Record<string, any>>> {
  if (Array.isArray(tree)) return tree.flatMap(elements);
  if (!React.isValidElement(tree)) return [];
  const element = tree as React.ReactElement<Record<string, any>>;
  return [element, ...elements(element.props.children)];
}

function appHarness(initialPath = '/') {
  const component = (name: string) => Object.assign(() => null, { displayName: name });
  const stubs = Object.fromEntries(['Navbar', 'Hero', 'EBookBanner', 'EBookReader', 'LeadCaptureModal', 'InlineLeadCapture', 'DailyHabitCheck', 'FiberLesson', 'RoutineReset', 'MythVsFact', 'MedicalAdvice', 'ProductSection', 'TrustAndFooter', 'RegularityPillars', 'CreatorCard'].map(name => [`./components/${name}`, { default: component(name) }]));
  stubs['./components/ResearchAndFaq'] = { CoreFaq: component('CoreFaq'), ScientificReferences: component('ScientificReferences') } as any;
  stubs['./components/PageScaffold'] = { PageIntro: component('PageIntro'), RelatedGuides: component('RelatedGuides'), InlineWorkbookCallout: component('InlineWorkbookCallout') } as any;
  let location = new URL(initialPath, siteConfig.SITE_ORIGIN);
  const history: string[] = [], scrolled: string[] = [], metadata: string[] = [], removedStorage: string[] = [];
  const listeners = new Map<string, () => void>();
  const window = {
    get location() { return location; },
    history: {
      pushState(_state: unknown, _title: string, href: string) { history.push(href); location = new URL(href, location.origin); },
      replaceState(_state: unknown, _title: string, href: string) { history.push(href); location = new URL(href, location.origin); },
    },
    addEventListener(name: string, listener: () => void) { listeners.set(name, listener); },
    removeEventListener(name: string) { listeners.delete(name); },
    matchMedia: () => ({ matches: false }), scrollTo: () => scrolled.push('top'),
  };
  class TestElement { anchor: TestLink | null = null; closest() { return this.anchor; } }
  class TestLink extends TestElement {
    href: string;
    target: string;
    constructor(readonly rawHref: string, readonly options: { target?: string; download?: boolean } = {}) {
      super(); this.anchor = this; this.href = new URL(rawHref, location).href; this.target = options.target || '';
    }
    hasAttribute(name: string) { return name === 'download' && Boolean(this.options.download); }
    getAttribute(name: string) { return name === 'href' ? this.rawHref : null; }
  }
  const loaded = controlledModule('App.tsx', {
    ...stubs, './siteConfig': siteConfig,
    './lib/page-seo': { applyPageMetadata: (path: string) => metadata.push(path) },
    // Storage unavailable: a verified current-session result must still reopen.
    './lib/guide-access': { readGuideAccess: () => false },
  }, {
    URL, Element: TestElement, window,
    document: { getElementById: (id: string) => ({ scrollIntoView: () => scrolled.push(id) }) },
    sessionStorage: { removeItem: (key: string) => removedStorage.push(key) },
    requestAnimationFrame: (callback: () => void) => callback(),
  });
  let tree: React.ReactNode;
  function render() { tree = loaded.render('App', { initialPath }); return tree; }
  function find(name: string) {
    const found = elements(tree).find(element => (element.type as { displayName?: string }).displayName === name);
    assert.ok(found, `Expected ${name} on ${location.pathname}`); return found;
  }
  function click(href: string, options: { target?: string; download?: boolean; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean; button?: number; defaultPrevented?: boolean } = {}) {
    const link = new TestLink(href, options), child = new TestElement(); child.anchor = link;
    const event = { button: 0, defaultPrevented: false, ...options, target: child, preventDefault() { this.defaultPrevented = true; } };
    (tree as React.ReactElement<Record<string, any>>).props.onClick(event);
    return event;
  }
  render();
  return { render, find, click, history, scrolled, metadata, removedStorage, listeners, window, cleanup: loaded.cleanup };
}

describe('Actual App navigation and gated-reader handlers', () => {
  it('navigates all six same-origin routes and their hashes through the real click handler', () => {
    const app = appHarness();
    try {
      assert.deepEqual(app.removedStorage, ['gut_admin_key']);
      for (const path of siteConfig.ROUTE_PATHS) {
        const href = `${path}?via=local-test#section%2Done`;
        assert.equal(app.click(href).defaultPrevented, true);
        app.render();
        assert.equal(app.find('Navbar').props.currentPath, path);
        assert.equal(app.window.location.pathname, path);
        assert.equal(app.history.at(-1), href);
        assert.equal(app.scrolled.at(-1), 'section-one');
        assert.equal(app.metadata.at(-1), path);
      }
      assert.equal(app.find('ProductSection').props.variant, 'full');
    } finally { app.cleanup(); }
  });

  it('leaves modified, legal, external, new-tab and download navigation to the browser', () => {
    const app = appHarness();
    try {
      for (const options of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { target: '_blank' }, { download: true }]) {
        assert.equal(app.click('/workbooks', options).defaultPrevented, false);
      }
      for (const href of ['/privacy', '/terms', '/contact', 'https://eiram32.gumroad.com/l/ynisjl', 'https://example.com/fiber-guide', '']) assert.equal(app.click(href).defaultPrevented, false);
      app.click('/workbooks', { defaultPrevented: true });
      assert.deepEqual(app.history, []);
      app.render(); assert.equal(app.find('Navbar').props.currentPath, '/');
    } finally { app.cleanup(); }
  });

  it('reopens current-session verified guide access when storage is blocked, keeps bundle interest separate and closes modals on navigation', () => {
    const app = appHarness();
    try {
      app.find('Navbar').props.onOpenEBook(); app.render();
      assert.equal(app.find('LeadCaptureModal').props.isOpen, true);
      assert.equal(app.find('LeadCaptureModal').props.intent, 'guide');
      assert.equal(app.find('EBookReader').props.isOpen, false);
      app.find('LeadCaptureModal').props.onSuccess({ name: 'Alex', email: 'alex@example.com' }); app.render();
      assert.equal(app.find('LeadCaptureModal').props.isOpen, false);
      assert.equal(app.find('EBookReader').props.isOpen, true);
      assert.equal(app.find('EBookReader').props.accessGranted, true);
      app.find('EBookReader').props.onClose(); app.render();
      app.find('Navbar').props.onOpenEBook(); app.render();
      assert.equal(app.find('EBookReader').props.isOpen, true);
      assert.equal(app.find('LeadCaptureModal').props.isOpen, false);
      app.click('/workbooks'); app.render();
      assert.equal(app.find('EBookReader').props.isOpen, false);
      app.find('ProductSection').props.onJoinWaitlist(); app.render();
      assert.equal(app.find('LeadCaptureModal').props.intent, 'bundle');
      assert.equal(app.find('LeadCaptureModal').props.isOpen, true);
      assert.equal(app.find('EBookReader').props.isOpen, false);
      app.click('/fiber-guide'); app.render();
      assert.equal(app.find('LeadCaptureModal').props.isOpen, false);
      assert.equal(app.find('EBookReader').props.isOpen, false);
      app.find('Navbar').props.onOpenEBook(); app.render();
      assert.equal(app.find('EBookReader').props.isOpen, true);
      app.window.history.pushState({}, '', '/routine-reset#routine-reset');
      app.listeners.get('popstate')!(); app.render();
      assert.equal(app.find('Navbar').props.currentPath, '/routine-reset');
      assert.equal(app.find('EBookReader').props.isOpen, false);
      assert.equal(app.find('LeadCaptureModal').props.isOpen, false);
    } finally { app.cleanup(); }
  });
});

const icons = Object.fromEntries(['Check', 'ArrowRight', 'RotateCcw', 'Clock', 'ShieldCheck', 'Heart', 'Footprints'].map(name => [name, () => null]));
describe('Actual habit and routine interaction handlers', () => {
  it('shows a habit result only after three answers, updates it and resets all selections', () => {
    const component = controlledModule('components/DailyHabitCheck.tsx', { '../constants': constants, '../lib/habit-check': habitCheck, 'lucide-react': icons });
    let tree = elements(component.render());
    const radios = () => tree.filter(element => element.type === 'input');
    const result = () => tree.find(element => element.props['data-testid'] === 'habit-result');
    assert.equal(radios().length, 9); assert.equal(result(), undefined);
    for (const index of [0, 3]) { radios()[index].props.onChange(); tree = elements(component.render()); assert.equal(result(), undefined); }
    radios()[6].props.onChange(); tree = elements(component.render()); assert.ok(result());
    assert.equal(radios().filter(radio => radio.props.checked).length, 3);
    radios()[2].props.onChange(); tree = elements(component.render());
    assert.equal(radios()[0].props.checked, false); assert.equal(radios()[2].props.checked, true);
    tree.find(element => element.type === 'button')!.props.onClick(); tree = elements(component.render());
    assert.equal(result(), undefined); assert.equal(radios().some(radio => radio.props.checked), false);
  });

  it('toggles routine checks with Space, Enter and click, ignores other keys and resets', () => {
    const component = controlledModule('components/RoutineReset.tsx', { '../constants': constants, 'lucide-react': icons });
    let tree = elements(component.render());
    const checks = () => tree.filter(element => element.props.role === 'checkbox');
    assert.equal(checks().length, 6); assert.equal(checks().some(check => check.props['aria-checked']), false);
    for (const [index, key] of [[0, ' '], [1, 'Enter']] as const) {
      let prevented = false;
      checks()[index].props.onKeyDown({ key, preventDefault: () => { prevented = true; } });
      tree = elements(component.render()); assert.equal(prevented, true); assert.equal(checks()[index].props['aria-checked'], true);
    }
    checks()[2].props.onClick(); tree = elements(component.render());
    assert.equal(checks().filter(check => check.props['aria-checked']).length, 3);
    let prevented = false;
    checks()[3].props.onKeyDown({ key: 'ArrowDown', preventDefault: () => { prevented = true; } });
    tree = elements(component.render()); assert.equal(prevented, false); assert.equal(checks()[3].props['aria-checked'], false);
    checks()[0].props.onClick(); tree = elements(component.render()); assert.equal(checks()[0].props['aria-checked'], false);
    tree.find(element => element.type === 'button')!.props.onClick(); tree = elements(component.render());
    assert.equal(checks().some(check => check.props['aria-checked']), false);
  });
});
