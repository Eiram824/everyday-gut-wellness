import type { Handler } from "@netlify/functions";
import { verifyAdminAccess, errorResponse } from "./lib/auth.js";
import { isDatabaseConfigured, listSubscribersFromDatabase } from "./lib/db.js";

function csvCell(value: unknown): string {
  let text = String(value ?? "");
  // Spreadsheet formula injection defense.
  if (/^[\\s]*[=+\\-@\\t\\r]/.test(text)) text = `'${text}`;
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
