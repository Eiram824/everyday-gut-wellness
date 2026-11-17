import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import ts from 'typescript';
import { config, handler } from '../netlify/functions/bundle-interest.js';
import * as guideAccess from '../lib/guide-access.js';
import * as leadDelivery from '../lib/lead-delivery.js';

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const REQUEST = { firstName: ' Alex ', email: ' ALEX@EXAMPLE.COM ', launchConsent: true, website: '' };
type Call = { url: string; init?: RequestInit };
let calls: Call[];
const event = (body: unknown = REQUEST, httpMethod = 'POST') => ({ httpMethod, path: '/api/bundle-interest', headers: {}, body: typeof body === 'string' ? body : JSON.stringify(body), isBase64Encoded: false }) as any;
const invoke = (body: unknown = REQUEST, method = 'POST') => handler(event(body, method), {} as any) as Promise<any>;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const settle = () => new Promise<void>(done => setImmediate(done));
function deferred<T>() { let done!: (value: T) => void; const promise = new Promise<T>(resolve => { done = resolve; }); return { promise, resolve: done }; }
function network(fn: (call: Call) => Response | Promise<Response>) {
  globalThis.fetch = (async (url, init) => { const call = { url: String(url), init }; calls.push(call); return fn(call); }) as typeof fetch;
}
beforeEach(() => {
  calls = [];
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-private-key';
  delete process.env.BUNDLE_LAUNCH_ALERTS_ENABLED;
  delete process.env.CONTEXT; delete process.env.NETLIFY_DEV;
  network(() => { throw new Error('Unexpected request'); });
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
  Object.assign(process.env, originalEnv);
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
  else Reflect.deleteProperty(globalThis, 'window');
});

describe('Isolated bundle launch-interest endpoint', () => {
  it('defaults closed, requires the exact activation flag and database configuration, and publishes no secrets', async () => {
    for (const value of [undefined, 'false', '1', 'TRUE', ' true ']) {
      if (value === undefined) delete process.env.BUNDLE_LAUNCH_ALERTS_ENABLED;
      else process.env.BUNDLE_LAUNCH_ALERTS_ENABLED = value;
      const get = await invoke(undefined, 'GET');
      assert.deepEqual(JSON.parse(get.body), { available: false });
      assert.equal((await invoke()).statusCode, 503);
      assert.ok(!get.body.includes('test-private-key'));
    }
    process.env.BUNDLE_LAUNCH_ALERTS_ENABLED = 'true';
    assert.deepEqual(JSON.parse((await invoke(undefined, 'GET')).body), { available: true });
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    assert.deepEqual(JSON.parse((await invoke(undefined, 'GET')).body), { available: false });
    assert.equal((await invoke()).statusCode, 503);
    assert.equal(calls.length, 0);
  });

  it('protects the endpoint with IP rate limits, method checks, bounded bodies and private cache headers', async () => {
    assert.deepEqual(config.rateLimit, { windowSize: 60, windowLimit: 5, aggregateBy: ['ip'] });
    assert.equal(config.path, '/api/bundle-interest');
    assert.equal((await invoke(REQUEST, 'DELETE')).statusCode, 405);
    process.env.BUNDLE_LAUNCH_ALERTS_ENABLED = 'true';
    assert.equal((await invoke('a'.repeat(16_385))).statusCode, 413);
    assert.equal((await invoke(JSON.stringify({ ...REQUEST, firstName: 'é'.repeat(8200) }))).statusCode, 413);
    const get = await invoke(undefined, 'GET');
    assert.match(get.headers['Cache-Control'], /no-store/);
    assert.match(get.headers['X-Robots-Tag'], /noindex/);
    assert.equal(calls.length, 0);
  });

  it('blocks preview and development writes despite inherited database settings and an enabled flag', async () => {
    process.env.BUNDLE_LAUNCH_ALERTS_ENABLED = 'true';
    for (const context of ['deploy-preview', 'branch-deploy', 'preview-server', 'dev', 'development']) {
      process.env.CONTEXT = context;
      assert.deepEqual(JSON.parse((await invoke(undefined, 'GET')).body), { available: false });
      assert.equal((await invoke()).statusCode, 503);
    }
    process.env.CONTEXT = 'production';
    assert.deepEqual(JSON.parse((await invoke(undefined, 'GET')).body), { available: true });
    process.env.NETLIFY_DEV = 'true';
    assert.equal((await invoke()).statusCode, 503); assert.equal(calls.length, 0);
  });

  it('requires a valid trimmed name, normalized email and literal launch permission, and rejects honeypots', async () => {
    process.env.BUNDLE_LAUNCH_ALERTS_ENABLED = 'true';
    const bad = [null, [], '{invalid', '', {}, { ...REQUEST, firstName: '  ' }, { ...REQUEST, firstName: 'a'.repeat(81) }, { ...REQUEST, firstName: '<script>' }, { ...REQUEST, firstName: 'a\u0000b' }, { ...REQUEST, email: 'a@' }, { ...REQUEST, email: 'a'.repeat(255) + '@example.com' }, { ...REQUEST, launchConsent: false }, { ...REQUEST, launchConsent: 'true' }, { ...REQUEST, launchConsent: 1 }, { firstName: 'Alex', email: 'alex@example.com' }, { ...REQUEST, website: 'https://bot.example' }, { ...REQUEST, website: true }];
    for (const body of bad) assert.equal((await invoke(body)).statusCode, 400, JSON.stringify(body));
    const encoded = event(); encoded.isBase64Encoded = true;
    assert.equal((await handler(encoded, {} as any) as any).statusCode, 400);
    assert.equal(calls.length, 0);
  });

  it('records a new or existing guide address in its own table with idempotent private inserts and no email-provider call', async () => {
    process.env.BUNDLE_LAUNCH_ALERTS_ENABLED = 'true';
    const records = new Map<string, unknown>();
    const guideSubscribers = new Set(['alex@example.com']);
    network(call => {
      assert.equal(call.url, 'https://example.supabase.co/rest/v1/bundle_launch_interests?on_conflict=email');
      assert.equal(call.init?.method, 'POST'); assert.equal(call.init?.redirect, 'error'); assert.ok(call.init?.signal);
      const headers = call.init?.headers as Record<string, string>;
      assert.equal(headers.apikey, 'test-private-key'); assert.equal(headers.Authorization, undefined);
      assert.equal(headers.Prefer, 'resolution=ignore-duplicates,return=minimal');
      const body = JSON.parse(String(call.init?.body));
      assert.deepEqual(body, { name: 'Alex', email: 'alex@example.com', consent_version: 'egw-bundle-alert-v1' });
      if (!records.has(body.email)) records.set(body.email, body);
      return new Response(null, { status: 201 });
    });
    const first = await invoke(), repeat = await invoke({ ...REQUEST, firstName: ' Alex ' });
    assert.equal(first.statusCode, 200); assert.equal(first.body, repeat.body); assert.deepEqual(JSON.parse(first.body), { success: true });
    assert.equal(records.size, 1); assert.equal(guideSubscribers.size, 1); assert.equal(calls.length, 2);
    assert.doesNotMatch(first.body, /alex|email|name|id|consent|withdraw/i);
  });

  it('returns identical success without overwriting or renewing a withdrawn permission', async () => {
    process.env.BUNDLE_LAUNCH_ALERTS_ENABLED = 'true';
    const record = { name: 'Original', email: 'alex@example.com', consent_version: 'egw-bundle-alert-v1', requested_at: '2026-01-01', withdrawn_at: '2026-02-01' };
    const before = { ...record };
    network(call => { assert.equal((call.init?.headers as any).Prefer, 'resolution=ignore-duplicates,return=minimal'); return new Response(null, { status: 204 }); });
    const result = await invoke({ ...REQUEST, firstName: 'Changed' });
    assert.deepEqual(JSON.parse(result.body), { success: true }); assert.deepEqual(record, before);
    assert.doesNotMatch(result.body, /withdrawn|Original|Changed|alex/);
  });

  it('fails closed without exposing PII or upstream details when the table, grant or network is unavailable', async () => {
    process.env.BUNDLE_LAUNCH_ALERTS_ENABLED = 'true';
    for (const status of [401, 403, 404, 500]) {
      network(() => json({ message: 'alex@example.com test-private-key internal table detail' }, status));
      const result = await invoke();
      assert.equal(result.statusCode, 503); assert.doesNotMatch(result.body, /alex@example|test-private-key|internal table/);
    }
    network(() => { throw new Error('alex@example.com test-private-key'); });
    assert.equal((await invoke()).statusCode, 503);
  });

  it('times out promptly even if a transport ignores abort, with no extra read or provider request', async t => {
    process.env.BUNDLE_LAUNCH_ALERTS_ENABLED = 'true';
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const late = deferred<Response>(); network(() => late.promise);
    const saving = invoke();
    assert.equal(calls.length, 1); t.mock.timers.tick(4500);
    const result = await saving;
    assert.equal(result.statusCode, 503); assert.equal(calls[0].init?.signal?.aborted, true);
    late.resolve(new Response(null, { status: 201 }));
    assert.equal(calls.length, 1); assert.doesNotMatch(result.body, /alex@example|test-private-key/);
  });
});

// Real component callbacks and effects, with controlled hooks and timers. This
// needs no browser, network access, added dependency or production environment.
function controlledForm(intent: 'guide' | 'bundle', onSuccess = (_subscriber: unknown) => {}) {
  const states: any[] = [], refs: any[] = [], effects: { deps: any[]; cleanup?: () => void }[] = [];
  const pendingEffects: (() => void)[] = [];
  const timers = new Map<number, { callback: () => void; delay: number }>();
  let stateIndex = 0, refIndex = 0, effectIndex = 0, timerId = 0;
  const exports: Record<string, any> = {};
  const source = ts.transpileModule(readFileSync('components/LeadCaptureForm.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(source, { exports, AbortController, Error, fetch: (...args: Parameters<typeof fetch>) => globalThis.fetch(...args),
    setTimeout: (callback: () => void, delay: number) => { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout: (id: number) => timers.delete(id),
    require(name: string) {
      if (name === 'react/jsx-runtime') return jsxRuntime;
      if (name === 'react') return {
        useId: () => 'controlled-form', useRef: (initial: unknown) => refs[refIndex++] ||= { current: initial },
        useState: (initial: unknown) => { const index = stateIndex++; if (!(index in states)) states[index] = initial; return [states[index], (next: unknown) => { states[index] = typeof next === 'function' ? next(states[index]) : next; }]; },
        useEffect: (effect: () => (() => void) | void, deps: unknown[]) => { const index = effectIndex++; const old = effects[index]; if (old && deps.every((dep, i) => Object.is(dep, old.deps[i]))) return; pendingEffects.push(() => { old?.cleanup?.(); effects[index] = { deps, cleanup: effect() || undefined }; }); },
      };
      if (name === '../lib/guide-access') return guideAccess;
      if (name === '../lib/lead-delivery') return leadDelivery;
      if (name === 'lucide-react') return Object.fromEntries(['ArrowRight', 'BookOpen', 'Download', 'Loader2', 'ShieldCheck'].map(icon => [icon, () => null]));
      throw new Error(`Unexpected form dependency: ${name}`);
    },
  });
  return {
    render() { stateIndex = refIndex = effectIndex = 0; const tree = exports.LeadCaptureForm({ intent, onSuccess }); while (pendingEffects.length) pendingEffects.shift()!(); return elements(tree); },
    unmount() { effects.forEach(effect => effect.cleanup?.()); },
    expire(delay: number) { for (const [id, timer] of timers) if (timer.delay === delay) { timers.delete(id); timer.callback(); } },
  };
}
function elements(tree: React.ReactNode): React.ReactElement<any>[] {
  if (Array.isArray(tree)) return tree.flatMap(elements);
  if (!React.isValidElement<any>(tree)) return [];
  const element = tree as React.ReactElement<any>;
  return [element, ...elements(element.props.children)];
}
const text = (tree: React.ReactElement<any>[]) => tree.flatMap(element => React.Children.toArray(element.props.children).filter(child => typeof child === 'string')).join(' ');
function fill(tree: React.ReactElement<any>[], consent = true) {
  tree.find(node => node.type === 'input' && node.props.name === 'firstName')!.props.onChange({ target: { value: ' Alex ' } });
  tree.find(node => node.type === 'input' && node.props.name === 'email')!.props.onChange({ target: { value: ' ALEX@EXAMPLE.COM ' } });
  tree.find(node => node.props.name === 'launchConsent')?.props.onChange({ target: { checked: consent } });
}

describe('Bundle availability and real form callbacks', () => {
  it('shows a contact-only unavailable state and never submits when disabled or configuration fails', async () => {
    for (const result of [json({ available: false }), json({ available: 'true' }), json({}, 503)]) {
      network(() => result);
      const form = controlledForm('bundle'); form.render(); await settle();
      const tree = form.render();
      assert.match(text(tree), /Bundle launch alerts are not open yet/); assert.ok(!tree.some(node => node.type === 'form'));
      assert.ok(tree.some(node => node.props.href === 'mailto:hello@everydaygutwellness.com'));
      form.unmount();
    }
    assert.ok(calls.every(call => call.url === '/api/bundle-interest' && !call.init?.method));
  });

  it('requires unchecked bundle consent, posts separately, blocks double submits and confirms without opening a reader', async () => {
    const pending = deferred<Response>(); let opens = 0; const saved: string[] = [];
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { setItem: (_key: string, value: string) => saved.push(value) } } });
    network(call => call.init?.method === 'POST' ? pending.promise : json({ available: true }));
    const form = controlledForm('bundle', () => opens++); form.render(); await settle();
    let tree = form.render();
    const checkbox = tree.find(node => node.props.name === 'launchConsent')!;
    assert.equal(checkbox.props.required, true); assert.equal(checkbox.props.checked, false);
    fill(tree, false); tree = form.render(); await tree.find(node => node.type === 'form')!.props.onSubmit({ preventDefault() {} });
    assert.equal(calls.filter(call => call.init?.method === 'POST').length, 0);
    tree = form.render(); assert.match(text(tree), /Please confirm/);
    fill(tree); tree = form.render();
    const submitting = tree.find(node => node.type === 'form')!.props.onSubmit({ preventDefault() {} });
    await tree.find(node => node.type === 'form')!.props.onSubmit({ preventDefault() {} });
    tree = form.render(); assert.equal(tree.find(node => node.type === 'button' && node.props.type === 'submit')!.props.disabled, true);
    assert.equal(calls.filter(call => call.init?.method === 'POST').length, 1);
    const post = calls.find(call => call.init?.method === 'POST')!;
    assert.equal(post.url, '/api/bundle-interest'); assert.deepEqual(JSON.parse(String(post.init?.body)), { firstName: 'Alex', email: 'alex@example.com', launchConsent: true, website: '' });
    pending.resolve(json({ success: true })); await submitting;
    tree = form.render(); assert.match(text(tree), /Your bundle request was received/); assert.match(text(tree), /does not renew a permission/);
    assert.ok(!tree.some(node => node.props.href === guideAccess.GUIDE_PDF)); assert.equal(opens, 0); assert.deepEqual(saved, []);
    form.unmount();
  });

  it('handles configuration timeouts, request failures and late aborted responses without success or a PDF unlock', async () => {
    const configPending = deferred<Response>(); network(() => configPending.promise);
    const unavailable = controlledForm('bundle'); unavailable.render(); unavailable.expire(5000);
    assert.match(text(unavailable.render()), /not open yet/); configPending.resolve(json({ available: true })); await settle();
    assert.match(text(unavailable.render()), /not open yet/); unavailable.unmount();
    const pending = deferred<Response>(); network(call => call.init?.method === 'POST' ? pending.promise : json({ available: true }));
    const form = controlledForm('bundle'); form.render(); await settle(); let tree = form.render(); fill(tree); tree = form.render();
    const saving = tree.find(node => node.type === 'form')!.props.onSubmit({ preventDefault() {} });
    form.expire(25000); await saving; tree = form.render(); assert.match(text(tree), /connection timed out/);
    pending.resolve(json({ success: true })); await settle(); assert.doesNotMatch(text(form.render()), /request was received/); form.unmount();
  });

  it('keeps the guide DOM gated until verified save, then opens the reader only through its explicit button', async () => {
    const pending = deferred<Response>(); const opens: unknown[] = []; const saved: string[] = [];
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { setItem: (_key: string, value: string) => saved.push(value) } } });
    network(call => call.init?.method === 'POST' ? pending.promise : json({ guideEmailAvailable: true, marketingSignupUrl: null }));
    const form = controlledForm('guide', subscriber => opens.push(subscriber)); form.render(); await settle();
    let tree = form.render(); fill(tree); tree = form.render();
    const saving = tree.find(node => node.type === 'form')!.props.onSubmit({ preventDefault() {} });
    tree = form.render(); assert.ok(!tree.some(node => node.props.href === guideAccess.GUIDE_PDF)); assert.deepEqual(saved, []);
    pending.resolve(json({ success: true, emailDeliveryStatus: 'queued', marketingSignupUrl: 'https://reader.systeme.io/post-only-link' })); await saving;
    tree = form.render(); assert.ok(tree.some(node => node.props.href === guideAccess.GUIDE_PDF));
    assert.match(text(tree), /email-copy request is saved/); assert.doesNotMatch(text(tree), /email (?:was |has been )?sent/i);
    assert.ok(!tree.some(node => node.props.href === 'https://reader.systeme.io/post-only-link'));
    assert.deepEqual(saved, ['{"accessGranted":true}']); assert.deepEqual(opens, []);
    const readerButton = tree.find(node => node.type === 'button' && elements(node).some(child => React.Children.toArray(child.props.children).includes('Open guide reader')))!;
    assert.ok(readerButton); readerButton.props.onClick();
    assert.deepEqual(opens, [{ name: 'Alex', email: 'alex@example.com' }]); form.unmount();
  });

  it('renders a separate confirmed marketing signup only for a valid non-null GET configuration', async () => {
    network(call => call.init?.method === 'POST' ? json({ success: true }) : json({ guideEmailAvailable: false, marketingSignupUrl: 'https://reader.systeme.io/confirmed-series' }));
    const form = controlledForm('guide'); form.render(); await settle(); let tree = form.render(); fill(tree); tree = form.render();
    await tree.find(node => node.type === 'form')!.props.onSubmit({ preventDefault() {} }); tree = form.render();
    const link = tree.find(node => node.props.href === 'https://reader.systeme.io/confirmed-series')!;
    assert.equal(link.props.target, '_blank'); assert.equal(link.props.rel, 'noopener noreferrer');
    assert.match(text(tree), /Separate signup and email confirmation required/); form.unmount();
  });

  it('keeps a failed guide request locked and ignores a late response after the form closes', async () => {
    const saved: string[] = []; Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { setItem: (_key: string, value: string) => saved.push(value) } } });
    const pending = deferred<Response>(); let posts = 0;
    network(call => !call.init?.method ? json({ guideEmailAvailable: false }) : ++posts === 1 ? json({ success: false }) : pending.promise);
    const form = controlledForm('guide'); form.render(); await settle(); let tree = form.render(); fill(tree); tree = form.render();
    await tree.find(node => node.type === 'form')!.props.onSubmit({ preventDefault() {} }); tree = form.render();
    assert.match(text(tree), /could not save/); assert.ok(!tree.some(node => node.props.href === guideAccess.GUIDE_PDF));
    const saving = tree.find(node => node.type === 'form')!.props.onSubmit({ preventDefault() {} });
    form.unmount(); pending.resolve(json({ success: true })); await saving; await settle();
    assert.deepEqual(saved, []);
  });
});

describe('Private bundle-interest migration', () => {
  const sql = readFileSync('scripts/bundle-interest-migration.sql', 'utf8');
  it('defines a separate normalized unique table with fixed permission version and least privileges', () => {
    assert.match(sql, /email varchar\(254\) NOT NULL UNIQUE/); assert.match(sql, /email = lower\(btrim\(email\)\)/);
    assert.match(sql, /consent_version = 'egw-bundle-alert-v1'/); assert.match(sql, /withdrawn_at timestamptz/);
    assert.match(sql, /ENABLE ROW LEVEL SECURITY/); assert.match(sql, /FORCE ROW LEVEL SECURITY/);
    assert.match(sql, /REVOKE ALL PRIVILEGES[^;]+FROM PUBLIC, anon, authenticated, service_role/);
    assert.match(sql, /GRANT SELECT, INSERT[^;]+TO service_role/);
    assert.doesNotMatch(sql, /(?:ALTER|INSERT INTO|UPDATE|DELETE FROM) public\.(?:subscribers|systeme_guide_jobs)/i);
  });

  it('verifies actual PostgreSQL RLS, duplicate suppression and withdrawal retention in memory', async () => {
    const { PGlite } = await import('@electric-sql/pglite');
    const db = new PGlite();
    try {
      await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
      await db.exec('CREATE TABLE subscribers (email text); INSERT INTO subscribers VALUES (\'alex@example.com\');');
      await db.exec(sql); await db.exec(sql);
      const insert = (name: string, email: string) => db.query('INSERT INTO bundle_launch_interests(name,email) VALUES ($1,$2) ON CONFLICT(email) DO NOTHING', [name, email]);
      await db.exec('SET ROLE service_role'); await insert('Original', 'alex@example.com'); await insert('Changed', 'alex@example.com');
      assert.equal((await db.query<{ name: string }>('SELECT name FROM bundle_launch_interests')).rows[0].name, 'Original');
      for (const command of ['UPDATE bundle_launch_interests SET name=\'Changed\'', 'DELETE FROM bundle_launch_interests', 'TRUNCATE bundle_launch_interests']) await assert.rejects(() => db.exec(command));
      await db.exec('RESET ROLE; UPDATE bundle_launch_interests SET withdrawn_at=now(); SET ROLE service_role;');
      const before = (await db.query('SELECT * FROM bundle_launch_interests')).rows;
      await insert('Public retry', 'alex@example.com');
      assert.deepEqual((await db.query('SELECT * FROM bundle_launch_interests')).rows, before);
      await assert.rejects(() => insert('Uppercase', 'UPPER@EXAMPLE.COM'));
      await assert.rejects(() => insert('', 'invalid-name@example.com'));
      await assert.rejects(() => db.exec("INSERT INTO bundle_launch_interests(name,email,consent_version) VALUES ('Bad','bad@example.com','other')"));
      await db.exec('RESET ROLE');
      for (const role of ['anon', 'authenticated']) {
        await db.exec(`SET ROLE ${role}`);
        for (const command of ['SELECT * FROM bundle_launch_interests', "INSERT INTO bundle_launch_interests(name,email) VALUES ('No','no@example.com')", "UPDATE bundle_launch_interests SET name='No'", 'DELETE FROM bundle_launch_interests']) await assert.rejects(() => db.exec(command));
        await db.exec('RESET ROLE');
      }
      assert.equal((await db.query<{ n: number }>('SELECT count(*)::int AS n FROM subscribers')).rows[0].n, 1);
      const flags = (await db.query<{ relrowsecurity: boolean; relforcerowsecurity: boolean }>("SELECT relrowsecurity,relforcerowsecurity FROM pg_class WHERE oid='bundle_launch_interests'::regclass")).rows[0];
      assert.equal(flags.relrowsecurity, true); assert.equal(flags.relforcerowsecurity, true);
    } finally { await db.close(); }
  });
});
