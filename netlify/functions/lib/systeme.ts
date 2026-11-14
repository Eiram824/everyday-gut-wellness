// Public API contract: https://developer.systeme.io/reference/post_contact_tag-1
// The fulfillment tag must never subscribe a contact to a marketing campaign.
const API_BASE = "https://api.systeme.io/api";
const REQUEST_TIMEOUT_MS = 4000;

function env(name: string): string {
  const runtime = globalThis as typeof globalThis & { Netlify?: { env: { get(name: string): string | undefined } } };
  return (runtime.Netlify?.env.get(name) ?? process.env[name] ?? "").trim();
}

export function systemeConfig() {
  const key = env("SYSTEME_IO_API_KEY");
  const rawTag = env("SYSTEME_IO_TAG_ID");
  const tagId = /^\d+$/.test(rawTag) ? Number(rawTag) : 0;
  const configured = env("SYSTEME_IO_ENABLED") === "true" && Boolean(key) && Number.isSafeInteger(tagId) && tagId > 0;
  const context = env("CONTEXT");
  // Deploy previews/dev must not send even if an operator shares production flags.
  // An absent context supports isolated local unit mocks without claiming a deploy.
  const productionContext = (!context || context === "production") && env("NETLIFY_DEV") !== "true";
  return { key, tagId, ready: configured && productionContext && env("SYSTEME_IO_GUIDE_DELIVERY_READY") === "true" };
}

export function systemePublicConfig(): { guideEmailAvailable: boolean; marketingSignupUrl: string | null } {
  let marketingSignupUrl: string | null = null;
  try {
    const url = new URL(env("SYSTEME_IO_MARKETING_OPT_IN_URL"));
    if (url.protocol === "https:" && !url.username && !url.password && !url.port && (url.hostname.endsWith(".systeme.io") || url.hostname === "everydaygutwellness.com")) marketingSignupUrl = url.href;
  } catch { /* Optional native DOI form not configured. */ }
  return { guideEmailAvailable: systemeConfig().ready, marketingSignupUrl };
}

type Contact = { id: number; email: string; unsubscribed: boolean; bounced: boolean; needsConfirmation: boolean; tags: { id: number }[] };
export type SystemeSyncResult = {
  status: "synced" | "suppressed" | "pending" | "uncertain" | "failed";
  code?: string;
  contactId?: number;
  retryAfterSeconds?: number;
  reconcileOnly?: boolean;
};

class ProviderError extends Error {
  constructor(readonly code: string, readonly retryable: boolean, readonly uncertain: boolean, readonly retryAfterSeconds = 60, readonly status = 0) {
    super(code);
  }
}

function retryAfter(header: string | null): number {
  if (!header) return 60;
  const seconds = /^\d+$/.test(header) ? Number(header) : Math.ceil((Date.parse(header) - Date.now()) / 1000);
  return Number.isFinite(seconds) ? Math.max(60, Math.min(86400, seconds)) : 60;
}

async function request(path: string, key: string, init: RequestInit = {}): Promise<Response> {
  const tagging = init.method === "POST" && path.endsWith("/tags");
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "X-API-Key": key, Accept: "application/json", "Content-Type": "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      redirect: "error",
    });
  } catch {
    // A tag request may have been accepted before the connection failed.
    throw new ProviderError("provider_network", true, tagging);
  }
  if (!response.ok) {
    // Do not read/log upstream bodies: errors can include addresses and credentials.
    const transient = response.status === 429 || response.status >= 500;
    throw new ProviderError(`provider_http_${response.status}`, transient, tagging && response.status >= 500, retryAfter(response.headers.get("Retry-After")), response.status);
  }
  return response;
}

function contact(value: unknown, expectedEmail: string): Contact {
  const c = value as Contact;
  if (!c || !Number.isSafeInteger(c.id) || c.id <= 0 || typeof c.email !== "string" || c.email.trim().toLowerCase() !== expectedEmail ||
      typeof c.unsubscribed !== "boolean" || typeof c.bounced !== "boolean" || typeof c.needsConfirmation !== "boolean" ||
      !Array.isArray(c.tags) || c.tags.some(t => !t || !Number.isSafeInteger(t.id) || t.id <= 0)) {
    throw new ProviderError("provider_invalid_contact", false, false);
  }
  return c;
}

async function json(response: Response): Promise<unknown> {
  try { return await response.json(); } catch { throw new ProviderError("provider_invalid_json", false, false); }
}

async function findContact(email: string, key: string): Promise<Contact | null> {
  const response = await request(`/contacts?${new URLSearchParams({ email, limit: "10" })}`, key);
  const data = await json(response) as { items?: unknown[]; hasMore?: unknown };
  if (!data || !Array.isArray(data.items) || data.hasMore !== false || data.items.length > 1) {
    // The documented exact-email lookup should resolve at most one record.
    throw new ProviderError("provider_ambiguous_contact", false, false);
  }
  return data.items.length ? contact(data.items[0], email) : null;
}

export async function syncSystemeContact(email: string, tagId: number, reconcileOnly = false): Promise<SystemeSyncResult> {
  const config = systemeConfig();
  if (!config.ready || config.tagId !== tagId) return { status: "failed", code: "provider_not_ready" };
  let current: Contact | null = null;
  try {
    current = await findContact(email, config.key);
    if (!current && reconcileOnly) return { status: "uncertain", code: "tag_result_unconfirmed" };
    if (!current) {
      try {
        // No unverified field slugs or API consent flags. Creation is NOT double opt-in.
        current = contact(await json(await request("/contacts", config.key, { method: "POST", body: JSON.stringify({ email, locale: "en" }) })), email);
      } catch (error) {
        // Another concurrent request may have created the same address.
        if (error instanceof ProviderError && (error.status === 409 || error.status === 422)) {
          current = await findContact(email, config.key);
          if (!current) throw error;
        } else throw error;
      }
    }
    // Recreated contacts can inherit suppression. Never PATCH state or resubscribe.
    if (current.unsubscribed || current.bounced || current.needsConfirmation) return { status: "suppressed", code: "provider_suppressed", contactId: current.id };
    if (current.tags.some(tag => tag.id === tagId)) return { status: "synced", contactId: current.id };
    if (reconcileOnly) return { status: "uncertain", code: "tag_result_unconfirmed", contactId: current.id };
    try {
      const response = await request(`/contacts/${current.id}/tags`, config.key, { method: "POST", body: JSON.stringify({ tagId }) });
      if (response.status !== 204) throw new ProviderError("provider_unexpected_tag_response", true, true);
    } catch (error) {
      if (error instanceof ProviderError && (error.status === 409 || error.status === 422)) {
        const verified = await findContact(email, config.key);
        if (verified && !verified.unsubscribed && !verified.bounced && !verified.needsConfirmation && verified.tags.some(tag => tag.id === tagId)) return { status: "synced", contactId: verified.id };
      }
      throw error;
    }
    return { status: "synced", contactId: current.id };
  } catch (error) {
    if (error instanceof ProviderError) return {
      status: error.retryable ? "pending" : "failed", code: error.code,
      retryAfterSeconds: error.retryAfterSeconds, reconcileOnly: reconcileOnly || error.uncertain,
      ...(current ? { contactId: current.id } : {}),
    };
    return { status: "failed", code: "provider_unexpected_error" };
  }
}
