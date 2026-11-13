import type { Handler } from "@netlify/functions";
import { jsonResponse, errorResponse } from "./lib/auth.js";
import { isDatabaseConfigured, saveSubscriber, markSenderSync } from "./lib/db.js";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return errorResponse(405, "Method not allowed. Expected POST.");
  if (!isDatabaseConfigured()) {
    return errorResponse(503, "Email signup is temporarily unavailable while secure storage is being configured. Please try again shortly.");
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const email = String(body.email || "").trim().toLowerCase().slice(0, 254);
    const name = String(body.name || "Reader").replace(/<[^>]*>?/gm, "").trim().slice(0, 80) || "Reader";
    const source = String(body.source || "ebook_lead_magnet").replace(/<[^>]*>?/gm, "").trim().slice(0, 60);
    const marketingConsent = body.marketingConsent === true;

    if (!EMAIL_REGEX.test(email)) return errorResponse(400, "Please provide a valid email address.");

    // Persist first. The user only receives success after Supabase confirms the record.
    const subscriber = await saveSubscriber({ name, email, source, marketingConsent });

    // Marketing sync is optional and must never block delivery of the free guide.
    let senderSynced = false;
    let senderStatus = "Saved securely. Email marketing sync is not configured.";
    const token = (process.env.SENDER_API_TOKEN || "").trim();
    const groupId = (process.env.SENDER_GROUP_ID || "").trim();

    if (marketingConsent && token) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const senderResponse = await fetch("https://api.sender.net/v2/subscribers", {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            firstname: name,
            ...(groupId ? { groups: [groupId] } : {}),
          }),
        });
        clearTimeout(timeout);
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
      message: "Your free 7-Day Gentle Gut Reset Guide is ready.",
      subscriber: { name: subscriber.name, email: subscriber.email, marketingConsent: subscriber.marketingConsent },
      senderSynced,
      senderStatus,
    });
  } catch (error: any) {
    console.error("[Netlify Function] Lead capture failed:", error?.message || "unknown_error");
    return errorResponse(503, "We couldn't securely save your signup just yet. Your email has not been added. Please try again.");
  }
};
