import type { Config, Handler } from "@netlify/functions";
import { jsonResponse, errorResponse } from "./lib/auth.js";
import { isDatabaseConfigured, saveSubscriber, markSenderSync } from "./lib/db.js";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const MAX_REQUEST_BYTES = 16_384;
const ALLOWED_SOURCES = new Set(["ebook_lead_modal", "planner_interest_list"]);

export const config: Config = {
  path: "/api/subscribe",
  rateLimit: { windowSize: 60, windowLimit: 5, aggregateBy: ["ip"] },
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return errorResponse(405, "Method not allowed. Expected POST.");
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

  try {
    // Persist first. The user only receives success after Supabase confirms the record.
    const subscriber = await saveSubscriber({ name, email, source, marketingConsent });

    // Marketing sync is optional and must never block delivery of the free guide.
    let senderSynced = false;
    let senderStatus = "Saved securely. Email marketing sync is not configured.";
    const token = (process.env.SENDER_API_TOKEN || "").trim();
    const groupId = (process.env.SENDER_GROUP_ID || "").trim();

    if (marketingConsent && token && subscriber.created && subscriber.id) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        let senderResponse: Response;
        try {
          senderResponse = await fetch("https://api.sender.net/v2/subscribers", {
            method: "POST",
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ email, firstname: name, ...(groupId ? { groups: [groupId] } : {}) }),
          });
        } finally {
          clearTimeout(timeout);
        }
        senderSynced = senderResponse.ok;
        senderStatus = senderSynced ? "Saved and synced to the opted-in email list." : "Saved securely; email platform sync needs attention.";
        if (!senderSynced) await markSenderSync(subscriber.id, false, `Sender.net returned ${senderResponse.status}`);
        else await markSenderSync(subscriber.id, true);
      } catch (error: any) {
        senderStatus = "Saved securely; email platform sync will need a retry.";
        try { await markSenderSync(subscriber.id, false, "Sender.net request failed or timed out"); } catch {}
        console.warn("[Lead capture] Sender.net sync failed:", error?.name || "request_error");
      }
    } else if (marketingConsent && !token) {
      senderStatus = "Saved securely; email marketing is awaiting platform configuration.";
    } else {
      senderStatus = "Saved securely. Marketing emails were not requested.";
    }

    return jsonResponse(200, {
      success: true,
      message: "Your free 7-Day Gentle Gut Reset Guide signup is ready.",
      subscriber: { name, email, marketingConsent },
    });
  } catch (error: any) {
    console.error("[Netlify Function] Lead capture failed:", error?.message || "unknown_error");
    return errorResponse(503, "We couldn't securely save your signup just yet. Your email has not been added. Please try again.");
  }
};
