import { findSystemeContact, parseSystemeContact, readSystemeJson, requestSysteme,
  SystemeProviderError, type SystemeContact, type SystemeSyncResult } from "./systeme.js";

function env(name: string): string {
  const runtime = globalThis as typeof globalThis & { Netlify?: { env: { get(name: string): string | undefined } } };
  return (runtime.Netlify?.env.get(name) ?? process.env[name] ?? "").trim();
}

export function buyerProviderConfig() {
  const key = env("SYSTEME_IO_API_KEY");
  const rawTag = env("SYSTEME_IO_BUYER_TAG_ID");
  const tagId = /^\d+$/.test(rawTag) ? Number(rawTag) : 0;
  const guideTagId = Number(env("SYSTEME_IO_TAG_ID"));
  const ready = env("CONTEXT") === "production" && env("NETLIFY_DEV") !== "true" &&
    env("GUMROAD_BUYER_SYNC_ENABLED") === "true" && env("GUMROAD_BUYER_SYNC_READY") === "true" &&
    Boolean(key) && Number.isSafeInteger(tagId) && tagId > 0 && Number.isSafeInteger(guideTagId) &&
    guideTagId > 0 && tagId !== guideTagId;
  return { key, tagId, ready };
}

// Classification ONLY: this tag's native action must only stop the nurture campaign.
// Tagging a suppressed/unconfirmed buyer does not clear suppression or grant consent.
export async function syncSystemeBuyerTag(email: string, tagId: number, reconcileOnly = false): Promise<SystemeSyncResult> {
  const config = buyerProviderConfig();
  if (!config.ready || config.tagId !== tagId) return { status: "failed", code: "buyer_provider_not_ready" };
  let current: SystemeContact | null = null;
  // Shorter per-request limit keeps the scheduled invocation below its 30s budget.
  const request = (path: string, init: RequestInit = {}) => requestSysteme(path, config.key, init, 3000);
  try {
    current = await findSystemeContact(email, config.key);
    if (!current && reconcileOnly) return { status: "uncertain", code: "buyer_tag_unconfirmed" };
    if (!current) {
      try {
        current = parseSystemeContact(await readSystemeJson(await request("/contacts", {
          method: "POST", body: JSON.stringify({ email, locale: "en" }),
        })), email);
      } catch (error) {
        if (error instanceof SystemeProviderError && (error.status === 409 || error.status === 422)) {
          current = await findSystemeContact(email, config.key);
          if (!current) throw error;
        } else throw error;
      }
    }
    if (current.tags.some(tag => tag.id === tagId)) return { status: "synced", contactId: current.id };
    if (reconcileOnly) return { status: "uncertain", code: "buyer_tag_unconfirmed", contactId: current.id };
    try {
      const response = await request(`/contacts/${current.id}/tags`, { method: "POST", body: JSON.stringify({ tagId }) });
      if (response.status !== 204) throw new SystemeProviderError("buyer_tag_response", true, true);
    } catch (error) {
      if (error instanceof SystemeProviderError && (error.status === 409 || error.status === 422)) {
        const verified = await findSystemeContact(email, config.key);
        if (verified?.tags.some(tag => tag.id === tagId)) return { status: "synced", contactId: verified.id };
      }
      throw error;
    }
    return { status: "synced", contactId: current.id };
  } catch (error) {
    if (error instanceof SystemeProviderError) return {
      status: error.retryable ? "pending" : "failed", code: error.code,
      retryAfterSeconds: error.retryAfterSeconds, reconcileOnly: reconcileOnly || error.uncertain,
      ...(current ? { contactId: current.id } : {}),
    };
    return { status: "failed", code: "buyer_provider_error" };
  }
}
