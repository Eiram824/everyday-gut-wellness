import type { SubscriberRecord } from "./subscribers.js";
import type { SystemeSyncResult } from "./systeme.js";

export function isDatabaseConfigured(): boolean {
  const url = (process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return Boolean(url && key);
}

function databaseHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const url = (process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) {
    throw new Error("Persistent subscriber storage is not configured.");
  }
  return {
    // Supabase sb_secret_* keys are opaque API keys, not JWTs. Send only via apikey.
    apikey: key,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extra,
  };
}

async function databaseRequest<T>(
  tablePath: string,
  init: RequestInit = {},
): Promise<T> {
  const url = (process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const response = await fetch(`${url}/rest/v1/${tablePath}`, {
    ...init,
    headers: databaseHeaders((init.headers || {}) as Record<string, string>),
  });

  if (!response.ok) {
    // Do not log upstream response bodies; they can contain user data or schema details.
    console.error("[Database] Supabase request failed:", response.status);
    throw new Error(`Persistent storage request failed (${response.status}).`);
  }

  if (response.status === 204) return undefined as T;
  // return=minimal answers 201 with an empty body.
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function saveSubscriber(input: {
  name: string;
  email: string;
  source: string;
  marketingConsent: boolean;
}): Promise<SubscriberRecord> {
  const payload: Record<string, unknown> = {
    name: input.name,
    email: input.email,
    source: input.source,
  };

  // Never overwrite a previous affirmative consent with a later no-checkbox signup.
  if (input.marketingConsent) {
    payload.marketing_consent = true;
    payload.consent_date = new Date().toISOString();
    payload.consent_withdrawn_at = null;
  }

  const rows = await databaseRequest<any[]>("subscribers?on_conflict=email", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload),
  });

  const row = rows?.[0];
  if (!row?.id) throw new Error("Database did not confirm that the signup was saved.");

  return {
    id: String(row.id),
    name: row.name || "Reader",
    email: row.email,
    date: row.signup_date || row.created_at || new Date().toISOString(),
    source: row.source || input.source,
    marketingConsent: Boolean(row.marketing_consent),
    consentDate: row.consent_date || null,
    senderSynced: Boolean(row.sender_synced),
  };
}

// Systeme.io guide-delivery queue. The RPCs live in scripts/systeme-io-migration.sql
// and enqueue at most one job per subscriber and guide version, so a repeat
// signup never sends the guide email twice.
export async function captureSystemeGuideRequest(input: {
  name: string; email: string; source: string; marketingConsent: boolean; tagId: number;
}): Promise<string> {
  const rows = await databaseRequest<{ job_id: string }[]>("rpc/capture_systeme_guide_request", {
    method: "POST",
    body: JSON.stringify({ p_name: input.name, p_email: input.email, p_source: input.source, p_marketing_consent: input.marketingConsent, p_tag_id: input.tagId }),
  });
  if (!Array.isArray(rows) || rows.length !== 1 || typeof rows[0]?.job_id !== "string" || !/^[0-9a-f-]{36}$/i.test(rows[0].job_id)) throw new Error("Guide request persistence was not confirmed.");
  return rows[0].job_id;
}

export type SystemeJob = { job_id: string; email: string; tag_id: number; lease_token: string; attempts: number; reconcile_only: boolean };

export async function claimSystemeJobs(jobId?: string): Promise<SystemeJob[]> {
  const rows = await databaseRequest<SystemeJob[]>("rpc/claim_systeme_guide_job", {
    method: "POST", body: JSON.stringify({ p_job_id: jobId || null }),
  });
  if (!Array.isArray(rows) || rows.length > 1 || rows.some(row => typeof row.job_id !== "string" || typeof row.email !== "string" || typeof row.lease_token !== "string" || !Number.isInteger(row.attempts) || typeof row.reconcile_only !== "boolean")) throw new Error("Invalid queue claim response.");
  return rows;
}

export async function finishSystemeJob(job: SystemeJob, result: SystemeSyncResult, delaySeconds: number): Promise<void> {
  await databaseRequest("rpc/finish_systeme_guide_job", {
    method: "POST",
    body: JSON.stringify({ p_job_id: job.job_id, p_lease_token: job.lease_token, p_status: result.status, p_error_code: result.code || null, p_contact_id: result.contactId || null, p_retry_seconds: delaySeconds, p_reconcile_only: result.reconcileOnly || false }),
  });
}

export async function listSubscribersFromDatabase(): Promise<SubscriberRecord[]> {
  const rows = await databaseRequest<any[]>(
    "subscribers?select=id,name,email,signup_date,source,marketing_consent,consent_date,sender_synced&order=signup_date.desc",
  );
  return (rows || []).map((row) => ({
    id: String(row.id),
    name: row.name || "Reader",
    email: row.email || "",
    date: row.signup_date || row.created_at || "",
    source: row.source || "ebook_lead_modal",
    marketingConsent: Boolean(row.marketing_consent),
    consentDate: row.consent_date || null,
    senderSynced: Boolean(row.sender_synced),
  }));
}

export async function markSenderSync(
  id: string,
  success: boolean,
  errorMessage?: string,
): Promise<void> {
  await databaseRequest<unknown>(`subscribers?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      sender_synced: success,
      sender_synced_at: success ? new Date().toISOString() : null,
      sender_sync_error: success ? null : (errorMessage || "Sender.net sync failed").slice(0, 300),
    }),
  });
}

// Gumroad sales. Table lives in scripts/gumroad-purchases-migration.sql.
export async function recordPurchase(input: {
  saleId: string;
  email: string;
  productId: string;
  productName: string;
  priceCents: number | null;
  currency: string;
  refunded: boolean;
  purchasedAt: string;
}): Promise<void> {
  await databaseRequest<void>("purchases?on_conflict=sale_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      sale_id: input.saleId,
      email: input.email,
      product_id: input.productId || null,
      product_name: input.productName || null,
      price_cents: input.priceCents,
      currency: input.currency || null,
      refunded: input.refunded,
      purchased_at: input.purchasedAt,
      updated_at: new Date().toISOString(),
    }),
  });
}
