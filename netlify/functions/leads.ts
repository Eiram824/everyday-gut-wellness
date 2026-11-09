import type { Handler } from "@netlify/functions";
import { verifyAdminAccess, jsonResponse, errorResponse } from "./lib/auth.js";
import { getSubscribers } from "./lib/subscribers.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return errorResponse(405, "Method not allowed. Expected GET.");
  }

  const auth = verifyAdminAccess(event);
  if (!auth.authorized) {
    return errorResponse(auth.status, auth.error || "Unauthorized access.");
  }

  const subscribers = getSubscribers();
  const isSenderConfigured = Boolean((process.env.SENDER_API_TOKEN || "").trim());

  return jsonResponse(200, {
    total: subscribers.length,
    senderConfigured: isSenderConfigured,
    senderGroupTitle: "Gut Wellness - Lead Magnet",
    subscribers,
  });
};
