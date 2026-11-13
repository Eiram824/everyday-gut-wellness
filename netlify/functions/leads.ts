import type { Handler } from "@netlify/functions";
import { verifyAdminAccess, jsonResponse, errorResponse } from "./lib/auth.js";
import { isDatabaseConfigured, listSubscribersFromDatabase } from "./lib/db.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") return errorResponse(405, "Method not allowed. Expected GET.");
  const auth = verifyAdminAccess(event);
  if (!auth.authorized) return errorResponse(auth.status, auth.error || "Unauthorized access.");
  if (!isDatabaseConfigured()) return errorResponse(503, "Persistent subscriber database is not configured.");

  try {
    const subscribers = await listSubscribersFromDatabase();
    return jsonResponse(200, {
      total: subscribers.length,
      senderConfigured: Boolean((process.env.SENDER_API_TOKEN || "").trim()),
      senderGroupTitle: "Gut Wellness - Lead Magnet",
      storage: "supabase",
      subscribers,
    });
  } catch {
    return errorResponse(503, "Unable to load the subscriber database. Please try again.");
  }
};
