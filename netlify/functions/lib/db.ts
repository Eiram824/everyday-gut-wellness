import type { SubscriberRecord } from "./subscribers.js";

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
