import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { handler as healthHandler } from "../netlify/functions/health.js";
import { handler as adminVerifyHandler } from "../netlify/functions/admin-verify.js";
import { handler as subscribeHandler } from "../netlify/functions/subscribe.js";
import { handler as leadsHandler } from "../netlify/functions/leads.js";
import { handler as leadsExportHandler } from "../netlify/functions/leads-export.js";
import { handler as notFoundHandler } from "../netlify/functions/api-not-found.js";
import { handler as geminiHandler } from "../netlify/functions/gemini.js";

// Helper to construct mock HandlerEvent
function createMockEvent(options: {
  httpMethod?: string;
  path?: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  body?: string;
}) {
  return {
    rawUrl: `http://localhost${options.path || "/"}`,
    rawQuery: "",
    path: options.path || "/",
    httpMethod: options.httpMethod || "GET",
    headers: options.headers || {},
    multiValueHeaders: {},
    queryStringParameters: options.queryStringParameters || null,
    multiValueQueryStringParameters: null,
    body: options.body || null,
    isBase64Encoded: false,
  } as any;
}

describe("Netlify Serverless Functions Integration Suite", () => {
  const TEST_ADMIN_KEY = "test_super_secure_key_2026";

  beforeEach(() => {
    process.env.ADMIN_ACCESS_KEY = TEST_ADMIN_KEY;
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    delete process.env.SENDER_API_TOKEN;
    delete process.env.GEMINI_API_KEY;

    // Deterministic Supabase REST stub for isolated serverless function tests.
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/rest/v1/subscribers") && init?.method === "POST") {
        const body = JSON.parse(String(init.body || "{}"));
        return new Response(JSON.stringify([{
          id: "00000000-0000-4000-8000-000000000001",
          name: body.name || "Reader",
          email: body.email,
          signup_date: new Date().toISOString(),
          source: body.source || "test_suite",
          marketing_consent: Boolean(body.marketing_consent),
          consent_date: body.consent_date || null,
          sender_synced: false,
        }]), { status: 201, headers: { "Content-Type": "application/json" } });
      }
      if (url.includes("/rest/v1/subscribers") && init?.method === "PATCH") {
        return new Response(null, { status: 204 });
      }
      if (url.includes("/rest/v1/subscribers")) {
        return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response("Not found", { status: 404 });
    }) as typeof fetch;
  });

  // 1. Health Function
  describe("Health Function (health.ts)", () => {
    it("returns 200 OK with runtime status on GET", async () => {
      const event = createMockEvent({ httpMethod: "GET", path: "/api/health" });
      const res = await healthHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.equal(data.status, "ok");
      assert.equal(data.runtime, "netlify-serverless");
    });

    it("rejects non-GET methods with 405 Method Not Allowed", async () => {
      const event = createMockEvent({ httpMethod: "POST", path: "/api/health" });
      const res = await healthHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 405);
    });
  });

  // 2. Admin Verify Function
  describe("Admin Verify Function (admin-verify.ts)", () => {
    it("authenticates when valid key is provided in body", async () => {
      const event = createMockEvent({
        httpMethod: "POST",
        path: "/api/admin/verify",
        body: JSON.stringify({ key: TEST_ADMIN_KEY }),
      });
      const res = await adminVerifyHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.equal(data.success, true);
    });

    it("rejects invalid key with 401 Unauthorized", async () => {
      const event = createMockEvent({
        httpMethod: "POST",
        path: "/api/admin/verify",
        body: JSON.stringify({ key: "wrong_key" }),
      });
      const res = await adminVerifyHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 401);
    });

    it("fails closed with 503 if ADMIN_ACCESS_KEY is unconfigured", async () => {
      delete process.env.ADMIN_ACCESS_KEY;
      const event = createMockEvent({
        httpMethod: "POST",
        path: "/api/admin/verify",
        body: JSON.stringify({ key: TEST_ADMIN_KEY }),
      });
      const res = await adminVerifyHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 503);
    });
  });

  // 3. Subscribe Function
  describe("Subscribe Function (subscribe.ts)", () => {
    it("validates and records a new subscriber with consent", async () => {
      const event = createMockEvent({
        httpMethod: "POST",
        path: "/api/subscribe",
        body: JSON.stringify({
          name: "Test User",
          email: "wellness.tester@example.com",
          source: "test_suite",
          marketingConsent: true,
        }),
      });
      const res = await subscribeHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.equal(data.success, true);
      assert.equal(data.subscriber.email, "wellness.tester@example.com");
      assert.equal(data.subscriber.marketingConsent, true);
    });

    it("rejects malformed email addresses with 400 Bad Request", async () => {
      const event = createMockEvent({
        httpMethod: "POST",
        path: "/api/subscribe",
        body: JSON.stringify({
          name: "Invalid User",
          email: "not-an-email",
        }),
      });
      const res = await subscribeHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 400);
      const data = JSON.parse(res.body);
      assert.ok(data.error.includes("valid email"));
    });

    it("handles duplicates idempotently without error", async () => {
      const event = createMockEvent({
        httpMethod: "POST",
        path: "/api/subscribe",
        body: JSON.stringify({
          name: "Duplicate User",
          email: "duplicate@example.com",
          marketingConsent: false,
        }),
      });
      const res1 = await subscribeHandler(event, {} as any) as any;
      assert.equal(res1.statusCode, 200);

      const res2 = await subscribeHandler(event, {} as any) as any;
      assert.equal(res2.statusCode, 200);
    });
  });

  // 4. Leads & Leads Export Functions
  describe("Leads & CSV Export Functions (leads.ts & leads-export.ts)", () => {
    it("authorizes leads access via x-admin-key header", async () => {
      const event = createMockEvent({
        httpMethod: "GET",
        path: "/api/leads",
        headers: { "x-admin-key": TEST_ADMIN_KEY },
      });
      const res = await leadsHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.ok(typeof data.total === "number");
      assert.ok(Array.isArray(data.subscribers));
    });

    it("authorizes leads access via Authorization: Bearer header", async () => {
      const event = createMockEvent({
        httpMethod: "GET",
        path: "/api/leads",
        headers: { authorization: `Bearer ${TEST_ADMIN_KEY}` },
      });
      const res = await leadsHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 200);
    });

    it("rejects unauthorized leads access with 401", async () => {
      const event = createMockEvent({
        httpMethod: "GET",
        path: "/api/leads",
        headers: { "x-admin-key": "invalid_key" },
      });
      const res = await leadsHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 401);
    });

    it("exports CSV with valid headers and RFC content when authenticated", async () => {
      const event = createMockEvent({
        httpMethod: "GET",
        path: "/api/leads/export.csv",
        headers: { "x-admin-key": TEST_ADMIN_KEY },
      });
      const res = await leadsExportHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers["Content-Type"], "text/csv; charset=utf-8");
      assert.ok(res.body.includes("ID,Name,Email,Date Requested"));
    });

    it("rejects CSV export without headers with 401", async () => {
      const event = createMockEvent({
        httpMethod: "GET",
        path: "/api/leads/export.csv",
      });
      const res = await leadsExportHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 401);
    });
  });

  // 5. 404 API Not Found Function
  describe("API Fallback Function (api-not-found.ts)", () => {
    it("returns JSON 404 for unrecognized routes", async () => {
      const event = createMockEvent({
        httpMethod: "GET",
        path: "/api/unsupported-endpoint",
      });
      const res = await notFoundHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 404);
      assert.equal(res.headers["Content-Type"], "application/json");
      const data = JSON.parse(res.body);
      assert.equal(data.status, 404);
    });
  });

  // 6. Gemini Function Security & SSRF Protection
  describe("Gemini Serverless Function (gemini.ts)", () => {
    it("fails closed with 503 if GEMINI_API_KEY is not configured", async () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.API_KEY;
      const event = createMockEvent({
        httpMethod: "POST",
        path: "/api/generate-content",
        body: JSON.stringify({ contents: "test" }),
      });
      const res = await geminiHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 503);
    });

    it("blocks untrusted destination URLs with 403 on video download (SSRF prevention)", async () => {
      process.env.GEMINI_API_KEY = "dummy_key";
      const event = createMockEvent({
        httpMethod: "GET",
        path: "/api/video-download",
        queryStringParameters: { uri: "https://evil-attacker-site.com/video.mp4" },
      });
      const res = await geminiHandler(event, {} as any) as any;
      assert.equal(res.statusCode, 403);
      const data = JSON.parse(res.body);
      assert.ok(data.error.includes("Untrusted destination"));
    });
  });
});
