import type { Config, Handler } from "@netlify/functions";
import { verifyAdminAccess, errorResponse, JSON_HEADERS } from "./lib/auth.js";
import { isDatabaseConfigured, listSubscribersFromDatabase } from "./lib/db.js";

export const config: Config = {
  path: "/api/leads/export.csv",
  rateLimit: { windowSize: 60, windowLimit: 5, aggregateBy: ["ip"] },
};

function csvCell(value: unknown): string {
  let text = String(value ?? "");
  // Spreadsheet formula injection defense.
  if (/^\s*[=+\-@]/.test(text) || /^[\t\r]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") return errorResponse(405, "Method not allowed. Expected GET.");
  const auth = verifyAdminAccess(event);
  if (!auth.authorized) return errorResponse(auth.status, auth.error || "Unauthorized access.");
  if (!isDatabaseConfigured()) return errorResponse(503, "Persistent subscriber database is not configured.");

  try {
    const subscribers = await listSubscribersFromDatabase();
    const header = ["ID", "Name", "Email", "Date Requested", "Source", "Marketing Consent", "Consent Date", "Sender Synced"];
    const rows = subscribers.map((sub) => [
      csvCell(sub.id), csvCell(sub.name), csvCell(sub.email), csvCell(sub.date),
      csvCell(sub.source), csvCell(sub.marketingConsent ? "Yes" : "No"),
      csvCell(sub.consentDate || "N/A"), csvCell(sub.senderSynced ? "Yes" : "No"),
    ]);
    return {
      statusCode: 200,
      headers: {
        ...JSON_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="everyday_gut_wellness_subscribers.csv"',
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
      body: [header.join(","), ...rows.map((row) => row.join(","))].join("\n") + "\n",
    };
  } catch {
    return errorResponse(503, "Unable to export subscriber records. Please try again.");
  }
};
