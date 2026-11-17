import { beforeEach, afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { BUYER_PRODUCT_IDS, gumroadBuyerConfig, parseGumroadBuyerPage, fetchGumroadBuyerPage,
  pollGumroadBuyerSales, processGumroadBuyerQueue } from "../netlify/functions/lib/gumroad-buyers.js";
import { syncSystemeBuyerTag } from "../netlify/functions/lib/systeme-buyer.js";

const TOKEN = "test-gumroad-view-sales-token";
const KEY = "test-systeme-buyer-key";
const SELLER = "seller_123==";
const EMAIL = "reader@example.com";
const PRODUCT = BUYER_PRODUCT_IDS[0];
const JOB = "00000000-0000-4000-8000-000000000001";
const LEASE = "00000000-0000-4000-8000-000000000002";
const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
type Call = { url: string; init?: RequestInit };
let calls: Call[];
const response = (data: unknown, status = 200, headers: Record<string, string> = {}) => new Response(
  status === 204 ? null : JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...headers } });
const sale = (overrides: Record<string, unknown> = {}) => ({ id: "real_sale==", seller_id: SELLER, product_id: PRODUCT,
  purchase_email: EMAIL, email: EMAIL, price: 2500, paid: true, is_recurring_billing: false,
  created_at: "2026-11-15T00:00:00Z", ...overrides });
const contact = (overrides: Record<string, unknown> = {}) => ({ id: 42, email: EMAIL, unsubscribed: false,
  bounced: false, needsConfirmation: false, tags: [], ...overrides });
const job = (overrides: Record<string, unknown> = {}) => ({ job_id: JOB, email: EMAIL, tag_id: 456,
  lease_token: LEASE, attempts: 1, reconcile_only: false, ...overrides });
const scan = (overrides: Record<string, unknown> = {}) => ({ product_id: PRODUCT, page_key: null,
  lease_token: LEASE, attempts: 1, pages_in_cycle: 0, ...overrides });
function mock(fn: (call: Call) => Response | Promise<Response>) {
  globalThis.fetch = (async (input, init) => { const call = { url: String(input), init }; calls.push(call); return fn(call); }) as typeof fetch;
}
function body(call: Call): any { return JSON.parse(String(call.init?.body)); }

describe("Gumroad production buyer exclusion", () => {
  beforeEach(() => {
    calls = [];
    Object.assign(process.env, { CONTEXT: "production", GUMROAD_ACCESS_TOKEN: TOKEN, GUMROAD_SELLER_ID: SELLER,
      SYSTEME_IO_API_KEY: KEY, SYSTEME_IO_TAG_ID: "123", SYSTEME_IO_BUYER_TAG_ID: "456",
      GUMROAD_BUYER_SYNC_ENABLED: "true", GUMROAD_BUYER_SYNC_READY: "true",
      SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test-buyer-service-key" });
    delete process.env.NETLIFY_DEV;
    mock(() => { throw new Error("Unexpected network request"); });
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
  });

  it("defaults off and never contacts a database/provider in preview, dev, missing-key or wrong-tag configurations", async () => {
    for (const [key, value] of [["GUMROAD_BUYER_SYNC_ENABLED", ""], ["GUMROAD_BUYER_SYNC_READY", ""],
      ["GUMROAD_ACCESS_TOKEN", ""], ["SYSTEME_IO_API_KEY", ""], ["GUMROAD_SELLER_ID", "bad seller"],
      ["CONTEXT", ""], ["CONTEXT", "deploy-preview"], ["NETLIFY_DEV", "true"], ["SYSTEME_IO_BUYER_TAG_ID", "123"]]) {
      const saved = process.env[key]; process.env[key] = value;
      assert.equal(gumroadBuyerConfig().ready, false);
      await pollGumroadBuyerSales(); await processGumroadBuyerQueue();
      process.env[key] = saved;
    }
    assert.equal(calls.length, 0);
    process.env.SYSTEME_IO_ENABLED = "false";
    process.env.SYSTEME_IO_GUIDE_DELIVERY_READY = "false";
    assert.equal(gumroadBuyerConfig().ready, true, "buyer classification is independent of guide email sending");
  });

  it("accepts the real collection shape without invented test/refund flags and retains refunded/disputed buyers", () => {
    const parsed = parseGumroadBuyerPage({ success: true, sales: [sale({ refunded: true, chargedback: true })] }, PRODUCT, SELLER);
    assert.deepEqual(parsed, { sales: [{ sale_id: "real_sale==", emails: [EMAIL] }], nextCursor: null });
    assert.equal(parseGumroadBuyerPage({ success: true, sales: [] }, PRODUCT, SELLER).sales.length, 0);
    assert.throws(() => parseGumroadBuyerPage({ success: true, sale: sale() }, PRODUCT, SELLER), /invalid_page/,
      "a single-order response cannot establish production collection membership");
    assert.throws(() => parseGumroadBuyerPage({ success: true, sales: [sale({ test: true })] }, PRODUCT, SELLER), /invalid_sale/);
  });

  it("normalizes and deduplicates original, current and gift-recipient addresses without Gmail rewriting", () => {
    const parsed = parseGumroadBuyerPage({ success: true, sales: [sale({ purchase_email: " Reader@Example.com ",
      email: "reader+notes@example.com", giftee_email: "reader.name@example.com" })] }, PRODUCT, SELLER);
    assert.deepEqual(parsed.sales[0].emails, [EMAIL, "reader+notes@example.com", "reader.name@example.com"]);
    const free = parseGumroadBuyerPage({ success: true, sales: [sale({ price: 0, paid: false })] }, PRODUCT, SELLER);
    assert.deepEqual(free.sales, []);
  });

  it("rejects ambiguous/oversized pages, wrong sellers/products, recurring trials and malformed buyer identity before staging", () => {
    for (const bad of [{ success: false, sales: [] }, { success: true, sales: Array.from({ length: 11 }, () => sale()) },
      { success: true, sales: [sale(), sale()] }, ...[
        { seller_id: "someone_else" }, { product_id: BUYER_PRODUCT_IDS[1] }, { price: "2500" },
        { paid: undefined }, { is_recurring_billing: true }, { created_at: "not-a-date" },
        { purchase_email: "no address" }, { email: "a\u0000@example.com" },
      ].map(x => ({ success: true, sales: [sale(x)] }))]) {
      assert.throws(() => parseGumroadBuyerPage(bad, PRODUCT, SELLER));
    }
    for (const next of ["", 1, "same", "x\n", "x".repeat(1025)]) {
      assert.throws(() => parseGumroadBuyerPage({ success: true, sales: [sale()], next_page_key: next }, PRODUCT, SELLER, "same"));
    }
    assert.throws(() => parseGumroadBuyerPage({ success: true, sales: [], next_page_key: "more" }, PRODUCT, SELLER));
  });

  it("uses only the seller-scoped production collection and fixed host with header auth, opaque cursors and no redirects", async () => {
    mock(() => response({ success: true, sales: [sale()], next_page_key: "next_cursor", next_page_url: "https://evil.example/steal" }));
    const result = await fetchGumroadBuyerPage(PRODUCT, "https://evil.example/?secret=x");
    assert.equal(result.nextCursor, "next_cursor"); assert.equal(calls.length, 1);
    const url = new URL(calls[0].url);
    assert.equal(url.origin, "https://api.gumroad.com"); assert.equal(url.pathname, "/v2/sales");
    assert.equal(url.searchParams.get("product_id"), PRODUCT);
    assert.equal(url.searchParams.get("page_key"), "https://evil.example/?secret=x");
    assert.ok(!url.href.includes(TOKEN));
    assert.equal((calls[0].init?.headers as any).Authorization, `Bearer ${TOKEN}`);
    assert.equal(calls[0].init?.redirect, "error");
  });

  it("fails closed on HTTP-200 failure JSON, oversized/malformed response bodies and private upstream errors", async () => {
    mock(() => response({ success: false, message: `${TOKEN} ${EMAIL}` }));
    await assert.rejects(() => fetchGumroadBuyerPage(PRODUCT, null), /gumroad_invalid_page/);
    mock(() => new Response("x".repeat(1024 * 1024 + 1)));
    await assert.rejects(() => fetchGumroadBuyerPage(PRODUCT, null), /gumroad_page_too_large/);
    mock(() => new Response("invalid json"));
    await assert.rejects(() => fetchGumroadBuyerPage(PRODUCT, null), /gumroad_invalid_json/);
    mock(() => response({ private: `${KEY} ${EMAIL} stack` }, 401));
    await assert.rejects(() => fetchGumroadBuyerPage(PRODUCT, null), error => String(error) === "Error: gumroad_http_401");
  });

  it("stages at most one complete validated page with its cursor and never trusts a caller-selected product", async () => {
    mock(call => call.url.endsWith("claim_gumroad_buyer_scan") ? response([scan()]) :
      call.url.startsWith("https://api.gumroad.com/") ? response({ success: true, sales: [sale()], next_page_key: "page2" }) : response(null, 204));
    await pollGumroadBuyerSales();
    assert.equal(calls.length, 3);
    assert.equal(calls[2].url, "https://example.supabase.co/rest/v1/rpc/stage_gumroad_buyer_page");
    assert.deepEqual(body(calls[2]), { p_product_id: PRODUCT, p_lease_token: LEASE, p_seller_id: SELLER,
      p_tag_id: 456, p_next_cursor: "page2", p_sales: [{ sale_id: "real_sale==", emails: [EMAIL] }] });
    calls = [];
    mock(() => response([scan({ product_id: "unowned_product" })]));
    await assert.rejects(() => pollGumroadBuyerSales(), /Invalid buyer scan lease/);
    assert.equal(calls.length, 1);
  });

  it("keeps progress pinned on invalid pages and persists bounded quota backoff without logging provider details", async () => {
    mock(call => call.url.endsWith("claim_gumroad_buyer_scan") ? response([scan()]) :
      call.url.startsWith("https://api.gumroad.com/") ? response({ detail: `${EMAIL} ${TOKEN}` }, 429, { "Retry-After": "1800" }) : response(null, 204));
    await pollGumroadBuyerSales();
    const fail = body(calls[2]);
    assert.ok(calls[2].url.endsWith("fail_gumroad_buyer_scan"));
    assert.equal(fail.p_error_code, "gumroad_http_429"); assert.equal(fail.p_retry_seconds, 1800);
    assert.equal(fail.p_retryable, true);
    assert.ok(!JSON.stringify(fail).includes(EMAIL)); assert.ok(!JSON.stringify(fail).includes(TOKEN));
    assert.ok(!calls.some(c => c.url.endsWith("stage_gumroad_buyer_page")));
  });

  it("refreshes the newest head beside one historical page and commits at most twenty merged sales with the historical cursor", { timeout: 2000 }, async () => {
    let started = 0; let release: () => void;
    const bothStarted = new Promise<void>(resolve => { release = resolve; });
    mock(async call => {
      if (call.url.endsWith("claim_gumroad_buyer_scan")) return response([scan({ page_key: "history", pages_in_cycle: 1001 })]);
      if (!call.url.startsWith("https://api.gumroad.com/")) return response(null, 204);
      if (++started === 2) release();
      await bothStarted;
      const history = new URL(call.url).searchParams.has("page_key");
      return response({ success: true,
        sales: Array.from({ length: 10 }, (_, i) => sale({ id: `${history ? "old" : "new"}-${i}` })),
        next_page_key: history ? "history-next" : "head-next",
        next_page_url: `https://evil.example/?access_token=${TOKEN}` });
    });
    await pollGumroadBuyerSales();
    assert.equal(calls.length, 4); assert.equal(started, 2);
    const stage = body(calls[3]);
    assert.equal(stage.p_sales.length, 20);
    assert.equal(new Set(stage.p_sales.map((s: any) => s.sale_id)).size, 20);
    assert.equal(stage.p_next_cursor, "history-next");
    assert.ok(!JSON.stringify(stage).includes("access_token")); assert.ok(!JSON.stringify(stage).includes(TOKEN));
    // An overlapping order is staged once; prefer the head's current address snapshot.
    calls = [];
    mock(call => call.url.endsWith("claim_gumroad_buyer_scan") ? response([scan({ page_key: "history" })]) :
      call.url.startsWith("https://api.gumroad.com/") ? response({ success: true,
        sales: [sale({ email: new URL(call.url).searchParams.has("page_key") ? "old@example.com" : "new@example.com" })] }) : response(null, 204));
    await pollGumroadBuyerSales();
    assert.equal(body(calls[3]).p_sales.length, 1);
    assert.deepEqual(body(calls[3]).p_sales[0].emails, [EMAIL, "new@example.com"]);
  });

  it("does not advance a historical cursor or partially stage a valid head when either bounded page is invalid", async () => {
    mock(call => call.url.endsWith("claim_gumroad_buyer_scan") ? response([scan({ page_key: "history" })]) :
      call.url.startsWith("https://api.gumroad.com/") ? response(new URL(call.url).searchParams.has("page_key") ?
        { success: false, sales: [] } : { success: true, sales: [sale()] }) : response(null, 204));
    await pollGumroadBuyerSales();
    assert.equal(calls.filter(c => c.url.startsWith("https://api.gumroad.com/")).length, 2);
    assert.ok(!calls.some(c => c.url.endsWith("stage_gumroad_buyer_page")));
    assert.equal(body(calls[3]).p_error_code, "gumroad_invalid_page");
    assert.equal(body(calls[3]).p_retryable, false);
  });

  it("creates a missing buyer minimally, retaining a classification tag for later opt-ins without enrolling/sending", async () => {
    mock(call => call.url.includes("?") ? response({ items: [], hasMore: false }) :
      call.url.endsWith("/contacts") ? response(contact(), 201) : response(null, 204));
    assert.equal((await syncSystemeBuyerTag(EMAIL, 456)).status, "synced");
    assert.deepEqual(body(calls[1]), { email: EMAIL, locale: "en" });
    assert.deepEqual(body(calls[2]), { tagId: 456 });
    assert.ok(calls.every(c => !/campaign|send|unsubscribe/.test(c.url) && c.init?.method !== "PATCH" && c.init?.method !== "DELETE"));
  });

  it("preserves unsubscribe/bounce/DOI states while adding only the no-send buyer classification tag", async () => {
    for (const state of ["unsubscribed", "bounced", "needsConfirmation"]) {
      calls = [];
      mock(call => call.url.includes("?") ? response({ items: [contact({ [state]: true })], hasMore: false }) : response(null, 204));
      assert.equal((await syncSystemeBuyerTag(EMAIL, 456)).status, "synced");
      assert.equal(calls.length, 2); assert.deepEqual(body(calls[1]), { tagId: 456 });
      assert.ok(calls.every(c => c.init?.method !== "PATCH" && c.init?.method !== "DELETE"));
    }
  });

  it("does not replay an existing buyer tag and reconciles a concurrent create/tag conflict", async () => {
    mock(() => response({ items: [contact({ tags: [{ id: 456 }] })], hasMore: false }));
    assert.equal((await syncSystemeBuyerTag(EMAIL, 456)).status, "synced"); assert.equal(calls.length, 1);
    calls = []; let reads = 0;
    mock(call => call.url.includes("?") ? response({ items: reads++ ? [contact({ tags: reads > 2 ? [{ id: 456 }] : [] })] : [], hasMore: false }) : response({}, 422));
    assert.equal((await syncSystemeBuyerTag(EMAIL, 456)).status, "synced");
    assert.equal(calls.filter(c => c.url.endsWith("/tags") && c.init?.method === "POST").length, 1);
  });

  it("reconciles an uncertain tag result without blind retries, creation or removal/readdition", async () => {
    mock(call => { if (call.url.endsWith("/tags")) throw new Error(`timeout ${KEY}`); return response({ items: [contact()], hasMore: false }); });
    const first = await syncSystemeBuyerTag(EMAIL, 456);
    assert.equal(first.status, "pending"); assert.equal(first.reconcileOnly, true);
    calls = []; mock(() => response({ items: [contact()], hasMore: false }));
    assert.equal((await syncSystemeBuyerTag(EMAIL, 456, true)).status, "uncertain"); assert.equal(calls.length, 1);
    calls = []; mock(() => response({ items: [contact({ tags: [{ id: 456 }] })], hasMore: false }));
    assert.equal((await syncSystemeBuyerTag(EMAIL, 456, true)).status, "synced"); assert.equal(calls.length, 1);
    calls = []; mock(() => response({ items: [], hasMore: false }));
    assert.equal((await syncSystemeBuyerTag(EMAIL, 456, true)).status, "uncertain"); assert.equal(calls.length, 1);
  });

  it("finishes one leased buyer job, pins its configured tag, and retains reconciliation-only failures", async () => {
    mock(call => call.url.endsWith("claim_gumroad_buyer_job") ? response([job({ reconcile_only: true })]) :
      call.url.startsWith("https://api.systeme.io/") ? response({ items: [contact()], hasMore: false }) : response(null, 204));
    await processGumroadBuyerQueue();
    assert.equal(calls.length, 3); const final = body(calls[2]);
    assert.equal(final.p_status, "uncertain"); assert.equal(final.p_reconcile_only, true); assert.equal(final.p_lease_token, LEASE);
    calls = [];
    mock(call => call.url.endsWith("claim_gumroad_buyer_job") ? response([job({ tag_id: 999 })]) : response(null, 204));
    await processGumroadBuyerQueue();
    assert.equal(calls.length, 2); assert.equal(body(calls[1]).p_error_code, "buyer_tag_changed");
    assert.ok(calls.every(c => !c.url.startsWith("https://api.systeme.io/")));
  });
});
