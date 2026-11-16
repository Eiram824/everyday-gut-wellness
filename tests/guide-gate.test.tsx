import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import EBookReader from '../components/EBookReader.js';
import EBookBanner from '../components/EBookBanner.js';
import LeadCaptureModal from '../components/LeadCaptureModal.js';
import InlineLeadCapture from '../components/InlineLeadCapture.js';
import { GUIDE_ACCESS_KEY, GUIDE_PDF, readGuideAccess, rememberGuideAccess, saveLeadRequest, validateLeadDetails } from '../lib/guide-access.js';
import { activateModalDialog } from '../lib/useDialog.js';

const originalFetch = globalThis.fetch;
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
const originalHTMLElement = Object.getOwnPropertyDescriptor(globalThis, 'HTMLElement');
let stored: Map<string, string>;
let writes: string[];
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
const input = (overrides: Partial<Parameters<typeof saveLeadRequest>[0]> = {}) => ({ name: ' Alex ', email: ' ALEX@EXAMPLE.COM ', intent: 'guide' as const, emailGuideAvailable: true, bundleConsent: false, signal: new AbortController().signal, ...overrides });
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
function restore(name: string, descriptor: PropertyDescriptor | undefined) {
  if (descriptor) Object.defineProperty(globalThis, name, descriptor);
  else Reflect.deleteProperty(globalThis, name);
}

beforeEach(() => {
  stored = new Map(); writes = [];
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => { writes.push(value); stored.set(key, value); },
  } } });
  globalThis.fetch = (async () => { throw new Error('Unexpected request'); }) as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  restore('window', originalWindow); restore('document', originalDocument); restore('HTMLElement', originalHTMLElement);
});

describe('Verified guide access and separate bundle interest', () => {
  it('requires a literal returning access flag and discards old subscriber-only storage', () => {
    for (const value of ['true', '"true"', '"reader@example.com"', '{}', '[]', '{"accessGranted":"true"}', '{"accessGranted":1}', '{"name":"Alex","email":"alex@example.com"}', '{bad json']) {
      stored.set(GUIDE_ACCESS_KEY, value);
      assert.equal(readGuideAccess(), false, value);
    }
    rememberGuideAccess();
    assert.equal(readGuideAccess(), true);
    assert.deepEqual(JSON.parse(stored.get(GUIDE_ACCESS_KEY)!), { accessGranted: true });
    assert.doesNotMatch(writes.at(-1)!, /Alex|email|name/);
  });

  it('tolerates unavailable browser storage without losing current successful access', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { get localStorage() { throw new Error('Storage disabled'); } } });
    assert.equal(readGuideAccess(), false);
    assert.doesNotThrow(rememberGuideAccess);
    globalThis.fetch = (async () => response({ success: true })) as typeof fetch;
    assert.deepEqual((await saveLeadRequest(input())).subscriber, { name: 'Alex', email: 'alex@example.com' });
  });

  it('requires a trimmed first name and valid trimmed email before contacting the backend', async () => {
    assert.deepEqual(validateLeadDetails('  Ana Maria  ', ' ANA+GUIDE@EXAMPLE.COM '), { name: 'Ana Maria', email: 'ana+guide@example.com' });
    for (const name of ['', '    ', '<script>', 'A\u0000B', 'a'.repeat(81)]) assert.throws(() => validateLeadDetails(name, 'reader@example.com'), /first name/);
    for (const email of ['', 'invalid', 'reader@', 'reader @example.com', 'a'.repeat(255) + '@example.com']) assert.throws(() => validateLeadDetails('Alex', email), /valid email/);
    await assert.rejects(saveLeadRequest(input({ name: '  ' })), /first name/);
    assert.deepEqual(writes, []);
  });

  it('keeps access locked while pending, blocks duplicate requests, then saves only the verified flag', async () => {
    const pending = deferred<Response>();
    let calls = 0;
    globalThis.fetch = (async (url, options) => {
      calls++; assert.equal(url, '/api/subscribe'); assert.equal(options?.method, 'POST'); assert.ok(options?.signal);
      assert.deepEqual(JSON.parse(String(options?.body)), { name: 'Alex', email: 'alex@example.com', source: 'ebook_lead_modal', emailGuideRequested: true, marketingConsent: false });
      return pending.promise;
    }) as typeof fetch;
    const saving = saveLeadRequest(input());
    assert.equal(readGuideAccess(), false);
    assert.deepEqual(writes, []);
    await assert.rejects(saveLeadRequest(input()), /already being saved/);
    assert.equal(calls, 1);
    pending.resolve(response({ success: true, emailDeliveryStatus: 'queued', marketingSignupUrl: null }));
    const result = await saving;
    assert.equal(result.emailDeliveryStatus, 'queued');
    assert.equal(readGuideAccess(), true);
    assert.deepEqual(writes, ['{"accessGranted":true}']);
  });

  it('requires both an OK response and literal success:true, and keeps failures retryable', async () => {
    for (const [data, status] of [[{ success: true }, 503], [{ success: false }, 200], [{ success: 'true' }, 200], [{ success: 1 }, 200], [[], 200], [null, 200]] as const) {
      globalThis.fetch = (async () => response(data, status)) as typeof fetch;
      await assert.rejects(saveLeadRequest(input()), /could not save/);
      assert.equal(readGuideAccess(), false);
    }
    globalThis.fetch = (async () => new Response('not JSON', { status: 200 })) as typeof fetch;
    await assert.rejects(saveLeadRequest(input()), /could not save/);
    globalThis.fetch = (async () => { throw new Error('Offline'); }) as typeof fetch;
    await assert.rejects(saveLeadRequest(input()), /Offline/);
    assert.deepEqual(writes, []);
    globalThis.fetch = (async () => response({ success: true, emailDeliveryStatus: 'unexpected' })) as typeof fetch;
    assert.equal((await saveLeadRequest(input())).emailDeliveryStatus, 'unavailable');
    assert.equal(readGuideAccess(), true);
  });

  it('does not request unavailable email delivery or accept an untrusted marketing link', async () => {
    globalThis.fetch = (async (_url, options) => {
      const body = JSON.parse(String(options?.body));
      assert.equal(body.emailGuideRequested, false); assert.equal(body.marketingConsent, false);
      return response({ success: true, marketingSignupUrl: 'https://systeme.io.evil.example/form' });
    }) as typeof fetch;
    assert.equal((await saveLeadRequest(input({ emailGuideAvailable: false }))).marketingSignupUrl, null);
  });

  it('aborts before network activity and releases a pending request even when fetch ignores cancellation', async () => {
    const before = new AbortController(); before.abort();
    await assert.rejects(saveLeadRequest(input({ signal: before.signal })), { name: 'AbortError' });
    const pending = deferred<Response>();
    globalThis.fetch = (async () => pending.promise) as typeof fetch;
    const controller = new AbortController();
    const saving = saveLeadRequest(input({ signal: controller.signal }));
    const cancelled = assert.rejects(saving, { name: 'AbortError' });
    controller.abort(); await cancelled;
    assert.equal(readGuideAccess(), false);
    const retry = deferred<Response>();
    globalThis.fetch = (async () => retry.promise) as typeof fetch;
    // The same guide request can be retried immediately after a timeout or close.
    const retrying = saveLeadRequest(input());
    pending.resolve(response({ success: true }));
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(writes, []);
    retry.resolve(response({ success: true }));
    await retrying;
    assert.deepEqual(writes, ['{"accessGranted":true}']);
  });

  it('ignores an aborted response body and permits a same-email guide retry', async () => {
    const body = deferred<unknown>();
    globalThis.fetch = (async () => ({ ok: true, json: () => body.promise }) as Response) as typeof fetch;
    const controller = new AbortController();
    const saving = saveLeadRequest(input({ signal: controller.signal }));
    await Promise.resolve();
    const cancelled = assert.rejects(saving, { name: 'AbortError' });
    controller.abort(); await cancelled;
    body.resolve({ success: true });
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(writes, []);
    globalThis.fetch = (async () => response({ success: true })) as typeof fetch;
    await saveLeadRequest(input());
    assert.equal(readGuideAccess(), true);
  });

  it('requires separate bundle permission and never grants PDF access from bundle interest', async () => {
    await assert.rejects(saveLeadRequest(input({ intent: 'bundle' })), /confirm/);
    globalThis.fetch = (async (url, options) => {
      assert.equal(url, '/api/bundle-interest');
      assert.deepEqual(JSON.parse(String(options?.body)), { firstName: 'Alex', email: 'alex@example.com', launchConsent: true, website: '' });
      return response({ success: true });
    }) as typeof fetch;
    await saveLeadRequest(input({ intent: 'bundle', bundleConsent: true }));
    assert.equal(readGuideAccess(), false); assert.deepEqual(writes, []);
  });

});

describe('Initial guide DOM and privacy', () => {
  it('renders neither reader nor PDF links without both an open reader and strict verified access', () => {
    for (const props of [{ isOpen: true, accessGranted: false }, { isOpen: false, accessGranted: true }, { isOpen: true, accessGranted: 'true' as any }, { isOpen: 'true' as any, accessGranted: true }]) {
      assert.equal(renderToStaticMarkup(<EBookReader {...props} onClose={() => {}} />), '');
    }
    assert.equal(renderToStaticMarkup(<LeadCaptureModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />), '');
    const html = renderToStaticMarkup(<><EBookBanner onOpenEBook={() => {}} /><LeadCaptureModal isOpen onClose={() => {}} onSuccess={() => {}} /><InlineLeadCapture onSuccess={() => {}} /></>);
    assert.ok(!html.includes(GUIDE_PDF)); assert.doesNotMatch(html, /<iframe|download=/);
    assert.match(html, /First name/); assert.match(html, /<input(?=[^>]*name="firstName")(?=[^>]*required)[^>]*>/); assert.match(html, /<input(?=[^>]*type="email")(?=[^>]*required)[^>]*>/);
    assert.match(html, /href="\/privacy"/); assert.doesNotMatch(html, /type="checkbox"|Join the optional seven-email series/);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, 'Modal and inline form labels need unique IDs.');
  });

  it('checks bundle availability before rendering an opt-in form', () => {
    const html = renderToStaticMarkup(<InlineLeadCapture intent="bundle" onSuccess={() => {}} />);
    assert.match(html, /Checking bundle launch-alert availability/); assert.doesNotMatch(html, /<form|type="checkbox"/);
    assert.ok(!html.includes(GUIDE_PDF));
    assert.match(html, /without buying/);
  });

  it('documents the minimal device preference, separate permissions and public PDF limitation', () => {
    const policy = readFileSync('public/privacy.html', 'utf8');
    assert.match(policy, /rel="canonical" href="https:\/\/everydaygutwellness.com\/privacy"/);
    assert.match(policy, /first name and email address/); assert.match(policy, /not secure download authentication/);
    assert.match(policy, /PDF remains a public asset/); assert.match(policy, /answers are not submitted or stored/);
    assert.match(policy, /checkbox is unchecked by default/); assert.match(policy, /email-confirmation step/);
    assert.match(policy, /withdraw guide-email or bundle-alert permission/); assert.match(policy, /unsubscribe/);
  });
});

class FocusTarget {
  hidden = false;
  isConnected = true;
  parent: TestDialog | null = null;
  focus() { (globalThis.document as any).activeElement = this; }
  getClientRects() { return this.hidden ? [] : [{}]; }
  closest() { return this instanceof TestDialog ? this : this.parent; }
}
class TestDialog extends FocusTarget {
  open = false;
  children: FocusTarget[] = [];
  listeners = new Map<string, (event: any) => void>();
  showModal() { this.open = true; }
  close() { this.open = false; }
  querySelectorAll() { return this.children; }
  querySelector() { return null; }
  addEventListener(name: string, listener: (event: any) => void) { this.listeners.set(name, listener); }
  removeEventListener(name: string) { this.listeners.delete(name); }
  key(key: string, shiftKey = false) {
    const event = { key, shiftKey, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    this.listeners.get('keydown')?.(event); return event;
  }
}
function dialogEnvironment() {
  const opener = new FocusTarget();
  const document = { activeElement: opener, body: { style: { overflow: 'auto' } } };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: FocusTarget });
  return { opener, document };
}

describe('Shared dialog keyboard and focus lifecycle', () => {
  it('traps Tab in both directions, closes on Escape, restores focus and releases scroll lock', () => {
    const { document, opener } = dialogEnvironment();
    const dialog = new TestDialog();
    const first = new FocusTarget(), last = new FocusTarget(); dialog.children = [first, last];
    let closes = 0;
    const cleanup = activateModalDialog(dialog as unknown as HTMLDialogElement, () => closes++);
    try {
      assert.equal(dialog.open, true); assert.equal(document.body.style.overflow, 'hidden'); assert.equal(document.activeElement, first);
      assert.equal(dialog.key('Tab', true).defaultPrevented, true); assert.equal(document.activeElement, last);
      assert.equal(dialog.key('Tab').defaultPrevented, true); assert.equal(document.activeElement, first);
      assert.equal(dialog.key('Escape').defaultPrevented, true); assert.equal(closes, 1);
    } finally { cleanup(); }
    assert.equal(dialog.open, false); assert.equal(document.body.style.overflow, 'auto'); assert.equal(document.activeElement, opener);
    cleanup(); assert.equal(document.body.style.overflow, 'auto');
  });

  it('keeps a nested dialog in control and retains the page lock until the final dialog closes', () => {
    const { document, opener } = dialogEnvironment();
    const outer = new TestDialog(), inner = new TestDialog(), outerButton = new FocusTarget();
    outerButton.parent = outer; outer.children = [outerButton];
    let outerCloses = 0, innerCloses = 0;
    const releaseOuter = activateModalDialog(outer as unknown as HTMLDialogElement, () => outerCloses++);
    const releaseInner = activateModalDialog(inner as unknown as HTMLDialogElement, () => innerCloses++);
    try {
      outer.key('Escape'); assert.equal(outerCloses, 0);
      inner.key('Tab'); assert.equal(document.activeElement, inner);
      inner.key('Escape'); assert.equal(innerCloses, 1);
      releaseInner(); assert.equal(document.body.style.overflow, 'hidden'); assert.equal(document.activeElement, outerButton);
    } finally { releaseInner(); releaseOuter(); }
    assert.equal(document.body.style.overflow, 'auto'); assert.equal(document.activeElement, opener);
  });
});
