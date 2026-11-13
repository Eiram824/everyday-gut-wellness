import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { handler as admin } from '../netlify/functions/admin.js';
import { handler as login } from '../netlify/functions/admin-verify.js';
import { handler as leads } from '../netlify/functions/leads.js';
import { handler as exportCsv } from '../netlify/functions/leads-export.js';
import { handler as subscribe } from '../netlify/functions/subscribe.js';
import { safeSecretMatch, createAdminSessionCookie, verifyAdminAccess } from '../netlify/functions/lib/auth.js';

const KEY = 'test-only-admin-key-with-enough-entropy';
const ORIGIN = 'https://everyday-gut-wellness.netlify.app';
const event = (method = 'GET', path = '/api/leads', headers: Record<string,string> = {}, body: string | null = null): any => ({ httpMethod: method, path, headers, body, isBase64Encoded: false, queryStringParameters: null });
const invoke = async (handler: any, request: any): Promise<any> => handler(request, {});

describe('Admin session and subscriber privacy boundaries', () => {
  beforeEach(() => {
    process.env.ADMIN_ACCESS_KEY = KEY;
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-only-test-key';
    delete process.env.SENDER_API_TOKEN;
    globalThis.fetch = (async () => new Response('[]', {status:200})) as typeof fetch;
  });

  it('compares fixed-size digests and handles unequal UTF-8 lengths safely', () => {
    assert.equal(safeSecretMatch(KEY, KEY), true);
    for (const value of ['', 'x', 'é'.repeat(30), KEY + 'x']) assert.equal(safeSecretMatch(value, KEY), false);
    assert.equal(safeSecretMatch('', ''), false);
  });

  it('rejects missing, query-only, forged, tampered, and expired credentials', async () => {
    const cookie = createAdminSessionCookie(KEY).split(';')[0];
    const expired = createAdminSessionCookie(KEY, Date.now() - 3600000).split(';')[0];
    const tests = [event(), {...event(), queryStringParameters:{key:KEY}}, event('GET','/api/leads',{cookie:'__Host-egw_admin=forged'}), event('GET','/api/leads',{cookie:cookie.slice(0,-1)+'z'}), event('GET','/api/leads',{cookie:expired})];
    for (const request of tests) {
      for (const handler of [leads, exportCsv]) {
        const result = await invoke(handler, request);
        assert.equal(result.statusCode,401);
        assert.equal(JSON.parse(result.body).subscribers, undefined);
        assert.equal(result.headers['X-Robots-Tag'],'noindex, nofollow, noarchive');
        assert.match(result.headers['Cache-Control'],/no-store/);
      }
    }
  });

  it('issues a secure HttpOnly session and accepts it without exposing the key', async () => {
    const result = await invoke(login,event('POST','/api/admin/verify',{'content-type':'application/json',origin:ORIGIN},JSON.stringify({key:KEY})));
    assert.equal(result.statusCode,200);
    const cookie = result.headers['Set-Cookie'];
    for(const flag of ['HttpOnly','Secure','SameSite=Strict','Path=/','Max-Age=1800']) assert.ok(cookie.includes(flag));
    assert.ok(!cookie.includes(KEY)); assert.ok(!result.body.includes(KEY));
    assert.equal((await invoke(leads,event('GET','/api/leads',{cookie:cookie.split(';')[0]}))).statusCode,200);
    assert.equal(verifyAdminAccess(event('GET','/api/leads',{'aUtHoRiZaTiOn':'bearer '+KEY})).authorized,true);
    delete process.env.ADMIN_ACCESS_KEY;
    assert.equal((await invoke(leads,event())).statusCode,503);
  });

  it('rejects cross-site login and authenticated data requests', async () => {
    const headers = {origin:'https://attacker.example','x-admin-key':KEY,cookie:createAdminSessionCookie(KEY).split(';')[0]};
    assert.equal((await invoke(login,event('POST','/api/admin/verify',headers,JSON.stringify({key:KEY})))).statusCode,403);
    assert.equal((await invoke(leads,event('GET','/api/leads',headers))).statusCode,403);
    assert.equal((await invoke(admin,event('POST','/admin/logout',headers))).statusCode,403);
  });

  it('permits only same-host previews owned by this project', () => {
    const host='deploy-preview-4--everyday-gut-wellness.netlify.app';
    assert.equal(verifyAdminAccess(event('GET','/api/leads',{'x-admin-key':KEY,host,origin:'https://'+host})).authorized,true);
    assert.equal(verifyAdminAccess(event('GET','/api/leads',{'x-admin-key':KEY,host:'attacker.example',origin:'https://attacker.example'})).authorized,false);
    assert.equal(verifyAdminAccess(event('GET','/api/leads',{'x-admin-key':KEY,host:'everyday-gut-wellness.netlify.app',origin:'https://'+host})).authorized,false);
  });

  it('does not fetch subscriber data before the server authenticates the admin page', async () => {
    let reads=0;
    globalThis.fetch=(async()=>{reads++;return new Response('[]')}) as typeof fetch;
    const result = await invoke(admin,event('GET','/admin'));
    assert.equal(result.statusCode,401); assert.equal(reads,0);
    assert.match(result.body, /name="robots" content="noindex, nofollow, noarchive"/);
    assert.match(result.headers['Content-Security-Policy'], /frame-ancestors 'none'/);
    assert.ok(!result.body.includes('<script'));
  });

  it('escapes stored HTML in the authorized portal and prevents CSV formula execution', async () => {
    globalThis.fetch=(async()=>new Response(JSON.stringify([{id:'test',name:'<script>alert(1)</script>',email:'=HYPERLINK("x")',signup_date:'2026-11-14'}]))) as typeof fetch;
    const headers = {'x-admin-key':KEY};
    const portal=await invoke(admin,event('GET','/admin',headers));
    assert.equal(portal.statusCode,200); assert.ok(portal.body.includes('&lt;script&gt;')); assert.ok(!portal.body.includes('<script>'));
    const csv=await invoke(exportCsv,event('GET','/api/leads/export.csv',headers));
    assert.ok(csv.body.includes("'=HYPERLINK"));
  });

  it('allows logout only as POST and expires the cookie', async () => {
    assert.equal((await invoke(admin,event('GET','/admin/logout'))).statusCode,405);
    const result=await invoke(admin,event('POST','/admin/logout',{origin:ORIGIN}));
    assert.equal(result.statusCode,303);assert.match(result.headers['Set-Cookie'],/Max-Age=0/);
  });

  it('keeps duplicate signup responses identical without reading or updating existing records', async () => {
    const requests: any[]=[];
    let duplicate=false;
    globalThis.fetch=(async(url,init)=>{requests.push({url,init});return new Response(JSON.stringify(duplicate?[]:[{id:'new-id'}]),{status:201});}) as typeof fetch;
    const request=event('POST','/api/subscribe',{},JSON.stringify({name:'Reader',email:'reader@example.com',marketingConsent:false}));
    const first=await invoke(subscribe,request);duplicate=true;
    const second=await invoke(subscribe,request);
    assert.equal(first.statusCode,200);assert.deepEqual(JSON.parse(first.body),JSON.parse(second.body));
    assert.ok(requests.every(r=>r.init.method==='POST'&&r.init.headers.Prefer.includes('ignore-duplicates')));
    assert.ok(requests.every(r=>r.url.includes('select=id')));
    assert.equal(JSON.parse(first.body).senderStatus,undefined);
  });

  it('does not expose upstream secrets, emails or stack traces in database errors', async () => {
    globalThis.fetch=(async()=>new Response('secret-token someone@example.com internal SQL stack',{status:500})) as typeof fetch;
    for(const handler of [leads,exportCsv]) {
      const result=await invoke(handler,event('GET','/api/leads',{'x-admin-key':KEY}));
      assert.equal(result.statusCode,503);assert.doesNotMatch(result.body,/secret-token|someone@|stack|SELECT|ADMIN_ACCESS_KEY/);
    }
  });
});

