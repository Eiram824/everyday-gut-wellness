import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { handler } from "../netlify/functions/subscribe.js";

const JOB = "11111111-2222-3333-4444-555555555555";
const LEASE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function signup(email: string, marketingConsent: boolean) {
  return handler({
    httpMethod: "POST", path: "/api/subscribe", headers: {},
    body: JSON.stringify({ name: "Test", email, source: "ebook_lead_modal", marketingConsent }),
  } as any, {} as any) as Promise<any>;
}

describe("Systeme.io guide delivery on signup", () => {
  const originalFetch = globalThis.fetch;
  let calls: { url: string; method: string; body: any }[] = [];
  let tags: number[] = [];

  beforeEach(() => {
    calls = []; tags = [];
    Object.assign(process.env, {
      SUPABASE_URL: "https://db.test", SUPABASE_SERVICE_ROLE_KEY: "sb_secret_test",
      SYSTEME_IO_API_KEY: "key", SYSTEME_IO_TAG_ID: "100", SYSTEME_IO_MARKETING_TAG_ID: "200",
      SYSTEME_IO_ENABLED: "true", SYSTEME_IO_GUIDE_DELIVERY_READY: "true",
    });
    delete process.env.CONTEXT; delete process.env.SENDER_API_TOKEN;
    globalThis.fetch = (async (input: any, init: any = {}) => {
      const url = String(input); const method = init.method || "GET";
      const body = init.body ? JSON.parse(init.body) : null;
      calls.push({ url, method, body });
      const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
      if (url.includes("/rest/v1/subscribers")) return json([{ id: "sub1", email: body?.email, name: "Test", marketing_consent: body?.marketing_consent ?? false }]);
      if (url.endsWith("rpc/capture_systeme_guide_request")) return json([{ job_id: JOB }]);
      if (url.endsWith("rpc/claim_systeme_guide_job")) return json([{ job_id: JOB, email: "reader@example.com", tag_id: 100, lease_token: LEASE, attempts: 0, reconcile_only: false }]);
      if (url.endsWith("rpc/finish_systeme_guide_job")) return new Response(null, { status: 204 });
      if (url.includes("api.systeme.io/api/contacts?")) return json({ items: [{ id: 7, email: "reader@example.com", unsubscribed: false, bounced: false, needsConfirmation: false, tags: tags.map(id => ({ id })) }], hasMore: false });
      if (url.endsWith("/contacts/7/tags") && method === "POST") { tags.push(body.tagId); return new Response(null, { status: 204 }); }
      return json({ error: "unexpected" }, 500);
    }) as typeof fetch;
  });
  afterEach(() => { globalThis.fetch = originalFetch; });

  it("queues and applies only the guide tag without marketing consent", async () => {
    const res = await signup("reader@example.com", false);
    assert.equal(res.statusCode, 200);
    assert.equal(JSON.parse(res.body).emailDeliveryStatus, "queued");
    assert.deepEqual(tags, [100]);
    const finish = calls.find(c => c.url.endsWith("rpc/finish_systeme_guide_job"));
    assert.equal(finish?.body.p_status, "synced");
  });

  it("adds the nurture tag only when the reader opted in", async () => {
    await signup("reader@example.com", true);
    assert.deepEqual(tags, [100, 200]);
  });

  it("does not call Systeme.io when delivery is not marked ready", async () => {
    process.env.SYSTEME_IO_GUIDE_DELIVERY_READY = "false";
    const res = await signup("reader@example.com", true);
    assert.equal(JSON.parse(res.body).emailDeliveryStatus, "not_configured");
    assert.equal(calls.some(c => c.url.includes("systeme.io")), false);
  });
});
