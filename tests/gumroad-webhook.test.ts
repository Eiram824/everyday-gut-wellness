/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { handler as webhookHandler, verifyGumroadSignature } from "../netlify/functions/gumroad-webhook.js";

const SELLER = "seller_abc123";

function form(fields: Record<string, string>): string {
  return new URLSearchParams(fields).toString();
}

function createMockEvent(options: {
  httpMethod?: string;
  headers?: Record<string, string>;
  body?: string;
  query?: Record<string, string>;
}) {
  return {
    rawUrl: "http://localhost/api/gumroad-webhook",
    rawQuery: "",
    path: "/api/gumroad-webhook",
    httpMethod: options.httpMethod || "POST",
    headers: options.headers || { "content-type": "application/x-www-form-urlencoded" },
    multiValueHeaders: {},
    queryStringParameters: options.query || null,
    multiValueQueryStringParameters: null,
    body: options.body ?? null,
    isBase64Encoded: false,
  } as any;
}

const SALE = {
  seller_id: SELLER,
  sale_id: "sale_1",
  email: "Buyer@Example.com",
  product_id: "prod_1",
  product_name: "The 14-Day Gut Clarity Workbook",
  price: "2500",
  currency: "usd",
  sale_timestamp: "2026-11-19T05:00:00Z",
};

describe("Gumroad Ping receiver (gumroad-webhook.ts)", () => {
  let calls: { url: string; body: any; method?: string }[] = [];

  beforeEach(() => {
    calls = [];
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    process.env.GUMROAD_SELLER_ID = SELLER;
    delete process.env.GUMROAD_WEBHOOK_SECRET;
    delete process.env.GUMROAD_PING_SIGNING_SECRET;
    delete process.env.SYSTEME_IO_API_KEY;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : null });
      return new Response(null, { status: 201 });
    }) as typeof fetch;
  });

  it("rejects non-POST methods with 405", async () => {
    const res = (await webhookHandler(createMockEvent({ httpMethod: "GET" }), {} as any)) as any;
    assert.equal(res.statusCode, 405);
  });

  it("fails closed when no verification is configured", async () => {
    delete process.env.GUMROAD_SELLER_ID;
    const res = (await webhookHandler(createMockEvent({ body: form(SALE) }), {} as any)) as any;
    assert.equal(res.statusCode, 503);
    assert.equal(calls.length, 0);
  });

  it("rejects a ping from another seller", async () => {
    const res = (await webhookHandler(createMockEvent({ body: form({ ...SALE, seller_id: "someone_else" }) }), {} as any)) as any;
    assert.equal(res.statusCode, 401);
    assert.equal(calls.length, 0);
  });

  it("requires the URL key when a secret is configured", async () => {
    process.env.GUMROAD_WEBHOOK_SECRET = "s3cret";
    const bad = (await webhookHandler(createMockEvent({ body: form(SALE), query: { key: "wrong" } }), {} as any)) as any;
    assert.equal(bad.statusCode, 401);
    const good = (await webhookHandler(createMockEvent({ body: form(SALE), query: { key: "s3cret" } }), {} as any)) as any;
    assert.equal(good.statusCode, 200);
  });

  it("stores a verified sale once per sale id, without touching the email list", async () => {
    const res = (await webhookHandler(createMockEvent({ body: form(SALE) }), {} as any)) as any;
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.deepEqual(data, { received: true, stored: true });
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.endsWith("/rest/v1/purchases?on_conflict=sale_id"));
    assert.equal(calls[0].body.sale_id, "sale_1");
    assert.equal(calls[0].body.email, "buyer@example.com");
    assert.equal(calls[0].body.price_cents, 2500);
    assert.equal(calls[0].body.refunded, false);
    assert.ok(!calls.some((c) => c.url.includes("systeme")));
  });

  it("acknowledges Gumroad test pings without storing them", async () => {
    const res = (await webhookHandler(createMockEvent({ body: form({ ...SALE, test: "true" }) }), {} as any)) as any;
    assert.equal(res.statusCode, 200);
    assert.equal(JSON.parse(res.body).stored, false);
    assert.equal(calls.length, 0);
  });

  it("returns 500 so Gumroad retries when storage fails", async () => {
    globalThis.fetch = (async () => new Response("err", { status: 500 })) as typeof fetch;
    const res = (await webhookHandler(createMockEvent({ body: form(SALE) }), {} as any)) as any;
    assert.equal(res.statusCode, 500);
  });
  it("checks X-Gumroad-Signature when a signing secret is configured", async () => {
    process.env.GUMROAD_PING_SIGNING_SECRET = "sign_secret";
    const body = form(SALE);
    const t = Math.floor(Date.now() / 1000);
    const sig = createHmac("sha256", "sign_secret").update(`${t}.${body}`).digest("hex");
    const headers = { "content-type": "application/x-www-form-urlencoded" };

    const missing = (await webhookHandler(createMockEvent({ body }), {} as any)) as any;
    assert.equal(missing.statusCode, 401);

    const bad = (await webhookHandler(createMockEvent({ body, headers: { ...headers, "X-Gumroad-Signature": `t=${t},v1=${"0".repeat(64)}` } }), {} as any)) as any;
    assert.equal(bad.statusCode, 401);

    const good = (await webhookHandler(createMockEvent({ body, headers: { ...headers, "X-Gumroad-Signature": `t=${t},v1=${sig}` } }), {} as any)) as any;
    assert.equal(good.statusCode, 200);
  });

  it("rejects stale or tampered signatures", () => {
    const body = "a=1";
    const t = 1_700_000_000;
    const sig = createHmac("sha256", "s").update(`${t}.${body}`).digest("hex");
    assert.equal(verifyGumroadSignature(`t=${t},v1=${sig}`, body, "s", t + 60), true);
    assert.equal(verifyGumroadSignature(`t=${t},v1=${sig}`, body, "s", t + 7200), false);
    assert.equal(verifyGumroadSignature(`t=${t},v1=${sig}`, "a=2", "s", t), false);
    assert.equal(verifyGumroadSignature("garbage", body, "s", t), false);
  });
});
