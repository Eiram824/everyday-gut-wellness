import type { Handler } from "@netlify/functions";
import { jsonResponse, errorResponse } from "./lib/auth.js";
import { getSubscribers, saveSubscribers, SubscriberRecord } from "./lib/subscribers.js";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return errorResponse(405, "Method not allowed. Expected POST.");
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { name, email, source = "ebook_lead_magnet", marketingConsent = false } = body;

    // Input sanitization & normalization
    const trimmedEmail = (email || "").trim().toLowerCase().slice(0, 254);
    const cleanName = (name || "").replace(/<[^>]*>?/gm, "").trim().slice(0, 80) || "Reader";
    const cleanSource = String(source).replace(/<[^>]*>?/gm, "").trim().slice(0, 50);
    const hasMarketingConsent = Boolean(marketingConsent);
    const consentDate = hasMarketingConsent ? new Date().toISOString() : null;

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return errorResponse(400, "Please provide a valid email address.");
    }

    const subscribers = getSubscribers();
    const existingIndex = subscribers.findIndex((s) => s.email === trimmedEmail);

    let senderSynced = false;
    let senderMessage = "";

    // Sender.net API integration (v2) - respect marketing consent
    const senderToken = (process.env.SENDER_API_TOKEN || "").trim();
    const senderGroupId = (process.env.SENDER_GROUP_ID || "").trim();

    if (senderToken) {
      try {
        const senderPayload: any = {
          email: trimmedEmail,
          firstname: cleanName,
        };

        // Only add to promotional marketing group if user voluntarily opted in
        if (hasMarketingConsent && senderGroupId) {
          senderPayload.groups = [senderGroupId];
        }

        const senderRes = await fetch("https://api.sender.net/v2/subscribers", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${senderToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(senderPayload),
        });

        if (senderRes.ok) {
          senderSynced = true;
          senderMessage = hasMarketingConsent
            ? "Successfully synced with Sender.net marketing list."
            : "Registered with Sender.net (Transactional guide delivery only).";
        } else {
          console.warn("[Netlify Function] Sender.net non-OK response:", senderRes.status);
          senderMessage = `Sender.net status ${senderRes.status}. Saved to subscriber list.`;
        }
      } catch (senderErr: any) {
        console.error("[Netlify Function] Sender.net network error:", senderErr?.message);
        senderMessage = "Saved to subscriber list; Sender.net sync will retry.";
      }
    } else {
      senderMessage = "Saved to subscriber list (Sender.net token not configured).";
    }

    const subscriberRecord: SubscriberRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: trimmedEmail,
      date: new Date().toISOString(),
      source: cleanSource,
      marketingConsent: hasMarketingConsent,
      consentDate,
      senderSynced,
    };

    if (existingIndex >= 0) {
      subscribers[existingIndex] = {
        ...subscribers[existingIndex],
        name: cleanName,
        date: new Date().toISOString(),
        marketingConsent: hasMarketingConsent || subscribers[existingIndex].marketingConsent,
        consentDate: consentDate || subscribers[existingIndex].consentDate,
        senderSynced: senderSynced || subscribers[existingIndex].senderSynced,
      };
    } else {
      subscribers.unshift(subscriberRecord);
    }

    saveSubscribers(subscribers);

    return jsonResponse(200, {
      success: true,
      message: "Your free 7-Day Gentle Gut Reset Guide is ready for instant download.",
      subscriber: {
        name: cleanName,
        email: trimmedEmail,
        marketingConsent: hasMarketingConsent,
      },
      senderSynced,
      senderStatus: senderMessage,
    });
  } catch (error: any) {
    console.error("[Netlify Function] /api/subscribe error:", error);
    return errorResponse(500, error.message || "Failed to process subscription.");
  }
};
