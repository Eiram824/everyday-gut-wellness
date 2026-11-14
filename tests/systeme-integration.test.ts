import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { syncSystemeContact, systemeConfig, systemePublicConfig } from "../netlify/functions/lib/systeme.js";
import { handler } from "../netlify/functions/subscribe.js";
import { processSystemeQueue } from "../netlify/functions/lib/systeme-queue.js";

const KEY = "test-systeme-private-key";
const EMAIL = "reader@example.com";
const JOB = "00000000-0000-4000-8000-000000000001";
const LEASE = "00000000-0000-4000-8000-000000000002";
const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
const contact = (overrides: Record<string, unknown> = {}) => ({ id: 42, email: EMAIL, unsubscribed: false, bounced: false, needsConfirmation: false, tags: [], ...overrides });
const response = (value: unknown, status = 200, headers: Record<string,string> = {}) => new Response(status === 204 ? null : JSON.stringify(value), { status, headers: { "Content-Type": "application/json", ...headers } });
const event = (body?: Record<string,unknown>, method = "POST") => ({ httpMethod: method, headers: {}, path: "/api/subscribe", body: body ? JSON.stringify(body) : null }) as any;
type Call = { url: string; init?: RequestInit };
let calls: Call[];
function mock(fn: (call: Call) => Response | Promise<Response>) {
  globalThis.fetch = (async (input, init) => { const call={url:String(input),init}; calls.push(call); return fn(call); }) as typeof fetch;
}

describe("Systeme requested-guide integration", () => {
  beforeEach(() => {
    calls=[];
    process.env.SYSTEME_IO_API_KEY=KEY;
    process.env.SYSTEME_IO_TAG_ID="123";
    process.env.SYSTEME_IO_ENABLED="true";
    process.env.SYSTEME_IO_GUIDE_DELIVERY_READY="true";
    process.env.SUPABASE_URL="https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY="test-service-role-key";
    delete process.env.SYSTEME_IO_MARKETING_OPT_IN_URL;
    mock(() => { throw new Error("Unexpected network request"); });
  });
  afterEach(() => {
    globalThis.fetch=originalFetch;
    for(const key of Object.keys(process.env)) if(!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env,originalEnv);
  });

  it("requires all activation gates and keeps configuration GET free of secrets and database reads", async () => {
    delete process.env.SYSTEME_IO_API_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    assert.equal(systemeConfig().ready,false);
    const result=await handler(event(undefined,"GET"),{} as any) as any;
    assert.equal(result.statusCode,200);
    assert.deepEqual(JSON.parse(result.body),{guideEmailAvailable:false,marketingSignupUrl:null});
    assert.equal(calls.length,0);
    process.env.SYSTEME_IO_API_KEY=KEY;
    for(const value of ["0","-1","1.2","123abc","9007199254740992"]){process.env.SYSTEME_IO_TAG_ID=value;assert.equal(systemeConfig().ready,false);}
    assert.ok(!result.body.includes(KEY));
  });

  it("only publishes an optional validated HTTPS native opt-in URL", () => {
    for(const value of ["javascript:alert(1)","https://systeme.io.evil.example/form","https://user:secret@site.systeme.io/form","http://site.systeme.io/form","https://evil.example/form"]){process.env.SYSTEME_IO_MARKETING_OPT_IN_URL=value;assert.equal(systemePublicConfig().marketingSignupUrl,null);}
    process.env.SYSTEME_IO_MARKETING_OPT_IN_URL="https://reader.systeme.io/optional-series";
    assert.equal(systemePublicConfig().marketingSignupUrl,"https://reader.systeme.io/optional-series");
  });

  it("blocks preview and development fulfillment even with valid production credentials and flags", async () => {
    for (const context of ["deploy-preview", "branch-deploy", "preview-server", "dev", "development"]) {
      process.env.CONTEXT = context;
      assert.equal(systemeConfig().ready, false);
      assert.equal(systemePublicConfig().guideEmailAvailable, false);
      assert.equal((await syncSystemeContact(EMAIL, 123)).status, "failed");
    }
    process.env.CONTEXT = "production";
    assert.equal(systemeConfig().ready, true);
    process.env.NETLIFY_DEV = "true";
    assert.equal(systemeConfig().ready, false);
    delete process.env.NETLIFY_DEV;
    delete process.env.CONTEXT;
    assert.equal(systemeConfig().ready, true);
    assert.equal(calls.length, 0);
  });

  it("looks up exact email, creates a minimal contact, then assigns the numeric fulfillment tag", async () => {
    mock(call => call.url.includes("?") ? response({items:[],hasMore:false}) : call.url.endsWith("/contacts") ? response(contact(),201) : response(null,204));
    assert.deepEqual(await syncSystemeContact(EMAIL,123),{status:"synced",contactId:42});
    assert.equal(calls.length,3);
    assert.equal(new URL(calls[0].url).searchParams.get("email"),EMAIL);
    assert.equal(new URL(calls[0].url).searchParams.get("limit"),"10");
    assert.deepEqual(JSON.parse(String(calls[1].init?.body)),{email:EMAIL,locale:"en"});
    assert.equal(calls[2].url,"https://api.systeme.io/api/contacts/42/tags");
    assert.deepEqual(JSON.parse(String(calls[2].init?.body)),{tagId:123});
    assert.ok(calls.every(c=>(c.init?.headers as Record<string,string>)["X-API-Key"]===KEY));
    assert.ok(calls.every(c=>c.init?.redirect==="error"));
  });

  it("does not remove/re-add an existing tag or start another campaign on repeated sync", async () => {
    mock(()=>response({items:[contact({tags:[{id:123,name:"gut-reset-lead"}]})],hasMore:false}));
    await syncSystemeContact(EMAIL,123);
    await syncSystemeContact(EMAIL,123);
    assert.equal(calls.length,2);
    assert.ok(calls.every(c=>!c.init?.method));
  });

  it("preserves existing unsubscribed, bounced and pending-confirmation states", async () => {
    for(const state of ["unsubscribed","bounced","needsConfirmation"]){
      calls=[];
      mock(()=>response({items:[contact({[state]:true})],hasMore:false}));
      assert.equal((await syncSystemeContact(EMAIL,123)).status,"suppressed");
      assert.equal(calls.length,1);
    }
  });

  it("also checks suppression inherited by a newly recreated contact", async () => {
    mock(call=>call.url.includes("?")?response({items:[],hasMore:false}):response(contact({unsubscribed:true}),201));
    assert.equal((await syncSystemeContact(EMAIL,123)).status,"suppressed");
    assert.equal(calls.length,2);
  });

  it("reconciles 409/422 create races against the authoritative exact-email record", async () => {
    for(const status of [409,422]){
      calls=[];let reads=0;
      mock(call=>call.url.includes("?")?response({items:reads++?[contact()]:[],hasMore:false}):call.url.endsWith("/contacts")?response({detail:EMAIL},status):response(null,204));
      assert.equal((await syncSystemeContact(EMAIL,123)).status,"synced");
      assert.equal(calls.filter(c=>c.url.endsWith("/tags")).length,1);
    }
  });

  it("reconciles an already-assigned tag conflict without replaying the tag request", async () => {
    let reads=0;
    mock(call=>call.url.includes("?")?response({items:[contact({tags:reads++?[{id:123}]:[]})],hasMore:false}):response({detail:EMAIL},422));
    assert.equal((await syncSystemeContact(EMAIL,123)).status,"synced");
    assert.equal(calls.filter(c=>c.init?.method==="POST").length,1);
  });

  it("honors Retry-After and returns sanitized transient failure codes", async () => {
    mock(()=>response({detail:`${EMAIL} ${KEY} internal stack`},429,{"Retry-After":"900"}));
    const result=await syncSystemeContact(EMAIL,123);
    assert.equal(result.status,"pending");assert.equal(result.retryAfterSeconds,900);
    assert.ok(!JSON.stringify(result).includes(EMAIL));assert.ok(!JSON.stringify(result).includes(KEY));
    mock(()=>response({detail:KEY},503));
    assert.equal((await syncSystemeContact(EMAIL,123)).status,"pending");
  });

  it("reconciles a timed-out tag without blindly sending it again", async () => {
    mock(call=>{if(call.url.endsWith("/tags"))throw new Error(`timeout ${KEY}`);return response({items:[contact()],hasMore:false});});
    const uncertain=await syncSystemeContact(EMAIL,123);
    assert.equal(uncertain.status,"pending");assert.equal(uncertain.reconcileOnly,true);
    calls=[];mock(()=>response({items:[contact({tags:[{id:123}]})],hasMore:false}));
    assert.equal((await syncSystemeContact(EMAIL,123,true)).status,"synced");
    assert.equal(calls.length,1);
    calls=[];mock(()=>response({items:[contact()],hasMore:false}));
    assert.equal((await syncSystemeContact(EMAIL,123,true)).status,"uncertain");
    assert.equal(calls.length,1);
  });

  it("treats a 5xx tag response as uncertain and fails closed on malformed contacts", async () => {
    mock(call=>call.url.endsWith("/tags")?response({},500):response({items:[contact()],hasMore:false}));
    assert.equal((await syncSystemeContact(EMAIL,123)).reconcileOnly,true);
    for(const value of [contact({unsubscribed:undefined}),contact({email:"other@example.com"}),contact({tags:undefined})]){
      calls=[];mock(()=>response({items:[value],hasMore:false}));
      assert.equal((await syncSystemeContact(EMAIL,123)).status,"failed");assert.equal(calls.length,1);
    }
  });

  it("does not call the provider for a missing or changed tag configuration", async () => {
    assert.equal((await syncSystemeContact(EMAIL,999)).status,"failed");
    process.env.SYSTEME_IO_GUIDE_DELIVERY_READY="false";
    assert.equal((await syncSystemeContact(EMAIL,123)).status,"failed");assert.equal(calls.length,0);
  });

  it("keeps instant guide access working with the existing schema while integration is off", async () => {
    process.env.SYSTEME_IO_ENABLED="false";
    mock(call=>{assert.ok(call.url.includes("/subscribers?on_conflict=email"));return response([{id:JOB}],201);});
    const result=await handler(event({email:" READER@EXAMPLE.COM ",emailGuideRequested:true,marketingConsent:false}),{} as any) as any;
    const body=JSON.parse(result.body);
    assert.equal(result.statusCode,200);assert.equal(body.emailDeliveryStatus,"not_configured");assert.equal(body.subscriber.email,EMAIL);assert.equal(calls.length,1);
  });

  it("requires an explicit guide request even when the provider is fully ready", async () => {
    mock(()=>response([{id:JOB}],201));
    const result=await handler(event({email:EMAIL,marketingConsent:true}),{} as any) as any;
    assert.equal(JSON.parse(result.body).emailDeliveryStatus,"not_requested");
    assert.equal(calls.length,1);assert.ok(calls[0].url.includes("/subscribers?"));
  });

  it("accepts a durable request with the same public response on repeat submissions", async () => {
    let claimed=false;
    mock(call=>{
      if(call.url.endsWith("/rpc/capture_systeme_guide_request"))return response([{job_id:JOB}]);
      if(call.url.endsWith("/rpc/claim_systeme_guide_job")){if(claimed)return response([]);claimed=true;return response([{job_id:JOB,email:EMAIL,tag_id:123,lease_token:LEASE,attempts:1,reconcile_only:false}]);}
      if(call.url.endsWith("/rpc/finish_systeme_guide_job"))return response(null,204);
      if(call.url.includes("api.systeme.io")&&call.url.includes("?"))return response({items:[contact()],hasMore:false});
      if(call.url.endsWith("/tags"))return response(null,204);
      throw new Error("Unexpected request");
    });
    const request=event({email:EMAIL,emailGuideRequested:true});
    const results=await Promise.all([handler(request,{} as any),handler(request,{} as any)]) as any[];
    assert.ok(results.every(r=>r.statusCode===200&&JSON.parse(r.body).emailDeliveryStatus==="queued"));
    assert.equal(calls.filter(c=>c.url.endsWith("/tags")).length,1);
    assert.ok(results.every(r=>!r.body.includes(KEY)&&!r.body.includes(JOB)&&!r.body.includes("contactId")));
  });

  it("does not fail PDF access or leak upstream details when the queue migration is missing", async () => {
    mock(call=>call.url.endsWith("/rpc/capture_systeme_guide_request")?response({detail:`${KEY} ${EMAIL} table missing`},404):response([{id:JOB}],201));
    const result=await handler(event({email:EMAIL,emailGuideRequested:true}),{} as any) as any;
    assert.equal(result.statusCode,200);assert.equal(JSON.parse(result.body).emailDeliveryStatus,"unavailable");assert.ok(!result.body.includes(KEY));assert.equal(calls.length,2);
  });

  it("persists bounded retry instructions with the current lease rather than logging PII", async () => {
    mock(call=>{
      if(call.url.endsWith("/claim_systeme_guide_job"))return response([{job_id:JOB,email:EMAIL,tag_id:123,lease_token:LEASE,attempts:1,reconcile_only:false}]);
      if(call.url.includes("api.systeme.io"))return response({detail:KEY},429,{"Retry-After":"900"});
      if(call.url.endsWith("/finish_systeme_guide_job"))return response(null,204);
      throw new Error("Unexpected request");
    });
    await processSystemeQueue();
    const finish=JSON.parse(String(calls.at(-1)?.init?.body));
    assert.equal(finish.p_status,"pending");assert.equal(finish.p_retry_seconds,900);assert.equal(finish.p_lease_token,LEASE);assert.equal(finish.p_error_code,"provider_http_429");assert.ok(!JSON.stringify(finish).includes(EMAIL));
  });
});
