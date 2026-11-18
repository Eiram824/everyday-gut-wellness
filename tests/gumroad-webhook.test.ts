/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { handler as webhookHandler } from "../netlify/functions/gumroad-webhook.js";

function createMockEvent(options: {
  httpMethod?: string;
  path?: string;
  headers?: Record<string, string>;
  body?: string;
}) {
  return {
    rawUrl: `http://localhost${options.path || "/api/gumroad-webhook"}`,
    rawQuery: "",
    path: options.path || "/api/gumroad-webhook",
    httpMethod: options.httpMethod || "POST",
    headers: options.headers || { "content-type": "application/json" },
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    body: options.body || null,
    isBase64Encoded: false,
  } as any;
}

describe("Gumroad Webhook & Buyer Exclusion (gumroad-webhook.ts)", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    delete process.env.GUMROAD_WEBHOOK_SECRET;
    delete process.env.SYSTEME_IO_API_KEY;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/rest/v1/subscribers")) {
        return new Response(JSON.stringify([{ id: "buyer-123", email: "buyer@example.com", is_buyer: true }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not found", { status: 404 });
    }) as typeof fetch;
  });

  it("rejects non-POST methods with 405", async () => {
    const event = createMockEvent({ httpMethod: "GET" });
    const res = await webhookHandler(event, {} as any) as any;
    assert.equal(res.statusCode, 405);
  });

  it("processes valid Gumroad purchase webhook and tags buyer", async () => {
    const event = createMockEvent({
      httpMethod: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "buyer@example.com",
        product_name: "The 14-Day Gut Clarity Workbook",
        price: 2500,
      }),
    });
    const res = await webhookHandler(event, {} as any) as any;
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.equal(data.received, true);
    assert.equal(data.email, "buyer@example.com");
    assert.equal(data.supabaseUpdated, true);
  });
});
