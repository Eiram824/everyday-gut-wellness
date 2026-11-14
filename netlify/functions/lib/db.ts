import type { SubscriberRecord } from "./subscribers.js";
import type { SystemeSyncResult } from "./systeme.js";

function databaseConfig() {
  return {
    url: (process.env.SUPABASE_URL || "").trim().replace(/\/$/, ""),
    // This variable stores the Supabase server-only secret key (sb_secret_...). Keep it in Netlify Functions only.
    key: (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim(),
  };
}

export function isDatabaseConfigured(): boolean {
  const config = databaseConfig();
  return Boolean(config.url && config.key);
}

export async function checkDatabaseConnection(): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Persistent subscriber storage is not configured.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    // Probe only a non-personal identifier; never include subscriber data in health checks.
    await databaseRequest<unknown[]>("subscribers?select=id&limit=1", {
      method: "GET",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function databaseHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const config = databaseConfig();
  if (!config.url || !config.key) {
    throw new Error("Persistent subscriber storage is not configured.");
  }
  return {
    // Supabase sb_secret_* keys are opaque API keys, not JWTs. Send only via apikey.
    apikey: config.key,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extra,
  };
}

async function databaseRequest<T>(
  tablePath: string,
  init: RequestInit = {},
): Promise<T> {
  const config = databaseConfig();
  if (!config.url || !config.key) {
    throw new Error("Persistent subscriber storage is not configured.");
  }
  const response = await fetch(`${config.url}/rest/v1/${tablePath}`, {
    ...init,
    signal: init.signal || AbortSignal.timeout(4500),
    headers: databaseHeaders((init.headers || {}) as Record<string, string>),
  });

  if (!response.ok) {
    // Do not log upstream response bodies; they can contain user data or schema details.
    console.error("[Database] Supabase request failed:", response.status);
    throw new Error(`Persistent storage request failed (${response.status}).`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

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

export async function saveSubscriber(input: {
  name: string; email: string; source: string; marketingConsent: boolean;
}): Promise<{ id: string | null; created: boolean }> {
  // Public requests cannot change another subscriber's name or consent.
  // A duplicate receives the same public response without reading existing PII.
  const rows = await databaseRequest<{ id: string }[]>(
    "subscribers?on_conflict=email&select=id", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({
        name: input.name, email: input.email, source: input.source,
        marketing_consent: input.marketingConsent,
        consent_date: input.marketingConsent ? new Date().toISOString() : null,
      }),
    },
  );
  if (!Array.isArray(rows) || (rows.length > 0 && !rows[0]?.id)) {
    throw new Error("Database did not confirm the signup request.");
  }
  return { id: rows[0]?.id || null, created: rows.length > 0 };
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
