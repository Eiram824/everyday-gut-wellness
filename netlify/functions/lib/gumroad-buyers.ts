import { databaseRequest, isDatabaseConfigured } from "./db.js";
import { buyerProviderConfig, syncSystemeBuyerTag } from "./systeme-buyer.js";

export const BUYER_PRODUCT_IDS = ["UGBupbL5E-xqZvSgohnMZA==", "2vnXsWgp27izpPCDeyuKfg=="] as const;
const PRODUCTS = new Set<string>(BUYER_PRODUCT_IDS);
const API_URL = "https://api.gumroad.com/v2/sales";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID = /^[A-Za-z0-9+/_=-]{1,128}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type BuyerSale = { sale_id: string; emails: string[] };
type Scan = { product_id: string; page_key: string | null; lease_token: string; attempts: number; pages_in_cycle: number };
type BuyerJob = { job_id: string; email: string; tag_id: number; lease_token: string; attempts: number; reconcile_only: boolean };

function env(name: string): string {
  const runtime = globalThis as typeof globalThis & { Netlify?: { env: { get(name: string): string | undefined } } };
  return (runtime.Netlify?.env.get(name) ?? process.env[name] ?? "").trim();
}
export function gumroadBuyerConfig() {
  const provider = buyerProviderConfig();
  const token = env("GUMROAD_ACCESS_TOKEN");
  const sellerId = env("GUMROAD_SELLER_ID");
  return { ...provider, token, sellerId, ready: provider.ready && Boolean(token) && ID.test(sellerId) };
}
class BuyerScanError extends Error {
  constructor(readonly code: string, readonly retryable = false, readonly retrySeconds = 60) { super(code); }
}
function normalizedEmail(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 254 || /[\u0000-\u001f\u007f]/.test(value)) return null;
  const result = value.trim().toLowerCase();
  return EMAIL.test(result) ? result : null;
}
function cursor(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && value.length > 0 && value.length <= 1024 && !/[\u0000-\u001f\u007f]/.test(value));
}

// Production collection, not GET /sales/:id: its successful-state scope excludes
// creator-test purchases. There is no invented test:false flag in the real contract.
// Refunds/disputes remain permanently excluded from our promotional series.
// Primary contract: antiwork/gumroad app/controllers/api/v2/sales_controller.rb
// and app/models/purchase.rb (for_sales_api_ordered_by_date / as_json).
export function parseGumroadBuyerPage(value: unknown, productId: string, sellerId: string, previousCursor: string | null = null) {
  const data = value as { success?: unknown; sales?: unknown[]; next_page_key?: unknown };
  if (!PRODUCTS.has(productId) || !ID.test(sellerId) || !data || data.success !== true || !Array.isArray(data.sales) || data.sales.length > 10) throw new BuyerScanError("gumroad_invalid_page");
  const next = data.next_page_key === undefined ? null : data.next_page_key;
  if (!cursor(next) || (next !== null && (next === previousCursor || data.sales.length === 0))) throw new BuyerScanError("gumroad_invalid_cursor");
  const seen = new Set<string>();
  const sales: BuyerSale[] = [];
  for (const value of data.sales) {
    const sale = value as Record<string, unknown>;
    if (!sale || typeof sale !== "object" || typeof sale.id !== "string" || !ID.test(sale.id) || seen.has(sale.id) ||
        sale.product_id !== productId || sale.seller_id !== sellerId || !Number.isSafeInteger(sale.price) || Number(sale.price) < 0 ||
        typeof sale.paid !== "boolean" || sale.is_recurring_billing !== false ||
        typeof sale.created_at !== "string" || !Number.isFinite(Date.parse(sale.created_at)) ||
        sale.test === true || sale.test_purchase === true || (typeof sale.purchase_state === "string" && sale.purchase_state.startsWith("test"))) throw new BuyerScanError("gumroad_invalid_sale");
    seen.add(sale.id);
    if (sale.paid !== true || Number(sale.price) === 0) continue;
    const emails = new Set<string>();
    for (const raw of [sale.purchase_email, sale.email, sale.giftee_email]) {
      if (raw === undefined || raw === null || raw === "") continue;
      const email = normalizedEmail(raw);
      if (!email) throw new BuyerScanError("gumroad_invalid_email");
      emails.add(email);
    }
    if (emails.size === 0) throw new BuyerScanError("gumroad_missing_email");
    sales.push({ sale_id: sale.id, emails: [...emails] });
  }
  return { sales, nextCursor: next };
}

function retryAfter(header: string | null): number {
  if (!header) return 60;
  const n = /^\d+$/.test(header) ? Number(header) : Math.ceil((Date.parse(header) - Date.now()) / 1000);
  return Number.isFinite(n) ? Math.max(60, Math.min(86400, n)) : 60;
}
async function boundedJson(response: Response): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new BuyerScanError("gumroad_invalid_json");
  const parts: Uint8Array[] = []; let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 1024 * 1024) { await reader.cancel(); throw new BuyerScanError("gumroad_page_too_large"); }
    parts.push(value);
  }
  try { return JSON.parse(Buffer.concat(parts).toString("utf8")); } catch { throw new BuyerScanError("gumroad_invalid_json"); }
}
export async function fetchGumroadBuyerPage(productId: string, pageKey: string | null, config = gumroadBuyerConfig()) {
  if (!config.ready || !PRODUCTS.has(productId) || !cursor(pageKey)) throw new BuyerScanError("buyer_not_ready");
  const query = new URLSearchParams({ product_id: productId });
  if (pageKey !== null) query.set("page_key", pageKey);
  // Construct only this endpoint and this query allowlist. Provider next_page_url
  // can carry arbitrary URLs/credentials and is neither followed nor persisted.
  const url = new URL(`${API_URL}?${query}`);
  if (url.origin !== "https://api.gumroad.com" || url.pathname !== "/v2/sales" || url.username || url.password ||
      [...url.searchParams.keys()].some(key => key !== "product_id" && key !== "page_key")) throw new BuyerScanError("gumroad_invalid_destination");
  let response: Response;
  try {
    response = await fetch(url.href, {
      headers: { Authorization: `Bearer ${config.token}`, Accept: "application/json" },
      redirect: "error", signal: AbortSignal.timeout(4000),
    });
  } catch { throw new BuyerScanError("gumroad_network", true); }
  if (!response.ok) throw new BuyerScanError(`gumroad_http_${response.status}`, response.status === 429 || response.status >= 500, retryAfter(response.headers.get("Retry-After")));
  try { return parseGumroadBuyerPage(await boundedJson(response), productId, config.sellerId, pageKey); }
  catch (error) { if (error instanceof BuyerScanError) throw error; throw new BuyerScanError("gumroad_body_network", true); }
}

async function rpc<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
  return databaseRequest<T>(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
}
function single<T>(value: T[]): T | null {
  if (!Array.isArray(value) || value.length > 1) throw new Error("Invalid buyer lease response");
  return value[0] || null;
}
export async function pollGumroadBuyerSales(): Promise<void> {
  const config = gumroadBuyerConfig();
  if (!config.ready || !isDatabaseConfigured()) return;
  const scan = single(await rpc<Scan[]>("claim_gumroad_buyer_scan"));
  if (!scan) return;
  if (!PRODUCTS.has(scan.product_id) || !cursor(scan.page_key) || !UUID.test(scan.lease_token) ||
      !Number.isInteger(scan.attempts) || scan.attempts < 1 || scan.attempts > 5 ||
      !Number.isSafeInteger(scan.pages_in_cycle) || scan.pages_in_cycle < 0) throw new Error("Invalid buyer scan lease");
  try {
    // Always refresh the newest head, even during a long historical walk. Both
    // requests are bounded, independent reads; lifetime sales must not hide new buyers.
    const [head, continuation] = await Promise.all([
      fetchGumroadBuyerPage(scan.product_id, null, config),
      scan.page_key === null ? Promise.resolve(null) : fetchGumroadBuyerPage(scan.product_id, scan.page_key, config),
    ]);
    const page = continuation || head;
    const merged = new Map((continuation?.sales || []).map(sale => [sale.sale_id, sale]));
    // Prefer the current head's address snapshot when the same sale spans both pages.
    for (const sale of head.sales) merged.set(sale.sale_id, sale);
    await rpc("stage_gumroad_buyer_page", { p_product_id: scan.product_id, p_lease_token: scan.lease_token,
      p_seller_id: config.sellerId, p_tag_id: config.tagId, p_next_cursor: page.nextCursor, p_sales: [...merged.values()] });
  } catch (error) {
    // A lost database response may already have committed the page; the old lease
    // cannot change a newer cursor. Never log the page, token or addresses.
    const failure = error instanceof BuyerScanError ? error : new BuyerScanError("buyer_page_storage", true);
    await rpc("fail_gumroad_buyer_scan", { p_product_id: scan.product_id, p_lease_token: scan.lease_token,
      p_error_code: failure.code, p_retry_seconds: Math.max(failure.retrySeconds, Math.min(21600, 60 * 2 ** Math.min(scan.attempts, 8))), p_retryable: failure.retryable });
  }
}

export async function processGumroadBuyerQueue(): Promise<void> {
  const config = gumroadBuyerConfig();
  if (!config.ready || !isDatabaseConfigured()) return;
  const job = single(await rpc<BuyerJob[]>("claim_gumroad_buyer_job"));
  if (!job) return;
  if (!UUID.test(job.job_id) || !UUID.test(job.lease_token) || normalizedEmail(job.email) !== job.email ||
      !Number.isSafeInteger(Number(job.tag_id)) || Number(job.tag_id) <= 0 || !Number.isInteger(job.attempts) ||
      job.attempts < 1 || job.attempts > 5 || typeof job.reconcile_only !== "boolean") throw new Error("Invalid buyer job lease");
  const result = Number(job.tag_id) === config.tagId ? await syncSystemeBuyerTag(job.email, config.tagId, job.reconcile_only) :
    { status: "failed" as const, code: "buyer_tag_changed" };
  await rpc("finish_gumroad_buyer_job", { p_job_id: job.job_id, p_lease_token: job.lease_token,
    p_status: result.status, p_error_code: result.code || null, p_contact_id: result.contactId || null,
    p_retry_seconds: Math.max(result.retryAfterSeconds || 0, Math.min(21600, 60 * 2 ** Math.min(job.attempts, 8))),
    p_reconcile_only: job.reconcile_only || result.reconcileOnly || false });
}
