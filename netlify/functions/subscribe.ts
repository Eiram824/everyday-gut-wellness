import type { Config, Handler } from "@netlify/functions";
import { jsonResponse, errorResponse } from "./lib/auth.js";
import { isDatabaseConfigured, saveSubscriber, captureSystemeGuideRequest } from "./lib/db.js";
import { systemeConfig, systemePublicConfig } from "./lib/systeme.js";
import { processSystemeQueue } from "./lib/systeme-queue.js";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const MAX_REQUEST_BYTES = 16_384;
const ALLOWED_SOURCES = new Set(["ebook_lead_modal", "planner_interest_list"]);

export const config: Config = {
  path: "/api/subscribe",
  rateLimit: { windowSize: 60, windowLimit: 5, aggregateBy: ["ip"] },
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "GET") return jsonResponse(200, systemePublicConfig());
  if (event.httpMethod !== "POST") return errorResponse(405, "Method not allowed. Expected GET or POST.");
  if (!isDatabaseConfigured()) return errorResponse(503, "Email signup is temporarily unavailable. Please try again shortly.");

  if (!event.body) return errorResponse(400, "A signup request is required.");
  if (Buffer.byteLength(event.body, "utf8") > MAX_REQUEST_BYTES) return errorResponse(413, "The signup request is too large.");

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(event.body);
    if (!body || typeof body !== "object" || Array.isArray(body)) return errorResponse(400, "Invalid JSON request payload.");
  } catch {
    return errorResponse(400, "Invalid JSON request payload.");
  }

  if (typeof body.email !== "string") return errorResponse(400, "Please provide a valid email address.");
  const email = body.email.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_REGEX.test(email)) return errorResponse(400, "Please provide a valid email address.");

  const rawName = typeof body.name === "string" ? body.name : "Reader";
  const name = rawName.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/<[^>]*>?/gm, "").trim().slice(0, 80) || "Reader";
  const requestedSource = typeof body.source === "string" ? body.source : "ebook_lead_modal";
  const source = ALLOWED_SOURCES.has(requestedSource) ? requestedSource : "ebook_lead_modal";
  const marketingConsent = body.marketingConsent === true;
  const emailGuideRequested = source === "ebook_lead_modal" && body.emailGuideRequested === true;

  try {
    const provider = systemeConfig();
    let emailDeliveryStatus = emailGuideRequested ? "not_configured" : "not_requested";
    if (emailGuideRequested && provider.ready) {
      let jobId: string | null = null;
      try {
        // Atomically preserve consent and enqueue exactly one guide-version job.
        jobId = await captureSystemeGuideRequest({ name, email, source, marketingConsent, tagId: provider.tagId });
        emailDeliveryStatus = "queued";
      } catch {
        // Missing migration/provider setup must not take away the instant PDF.
        // A timeout can be uncertain; save is duplicate-safe and never requeues.
        await saveSubscriber({ name, email, source, marketingConsent });
        emailDeliveryStatus = "unavailable";
        console.warn("[Lead capture] guide-email queue requires operator attention");
      }
      if (jobId) {
        try { await processSystemeQueue(jobId); } catch {
          // Intent remains durable. Scheduled retries reconcile uncertain results.
          console.warn("[Lead capture] guide-email sync will be reconciled");
        }
      }
    } else {
      // This path remains compatible with the existing schema while disabled.
      await saveSubscriber({ name, email, source, marketingConsent });
    }

    return jsonResponse(200, {
      success: true,
      message: "Your free 7-Day Gentle Gut Reset Guide signup is ready.",
      emailDeliveryStatus,
      marketingSignupUrl: systemePublicConfig().marketingSignupUrl,
      subscriber: { name, email, marketingConsent },
    });
  } catch {
    console.error("[Netlify Function] Lead capture persistence failed");
    return errorResponse(503, "We couldn't securely save your signup just yet. Your email has not been added. Please try again.");
  }
};
