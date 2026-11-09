import type { Handler } from "@netlify/functions";
import { verifyAdminAccess } from "./lib/auth.js";
import { getSubscribers, escapeCsv } from "./lib/subscribers.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "Method not allowed. Expected GET.",
    };
  }

  const auth = verifyAdminAccess(event);
  if (!auth.authorized) {
    return {
      statusCode: auth.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: auth.error || "Unauthorized. Administrator authentication required.",
    };
  }

  const subscribers = getSubscribers();
  const header = [
    "ID",
    "Name",
    "Email",
    "Date Requested",
    "Source",
    "Marketing Consent",
    "Consent Date",
    "Sender Synced",
  ];

  const rows = subscribers.map((sub) => [
    escapeCsv(sub.id),
    escapeCsv(sub.name),
    escapeCsv(sub.email),
    escapeCsv(sub.date),
    escapeCsv(sub.source),
    escapeCsv(sub.marketingConsent ? "Yes" : "No"),
    escapeCsv(sub.consentDate || "N/A"),
    escapeCsv(sub.senderSynced ? "Yes" : "No"),
  ]);

  const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n") + "\n";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="everyday_gut_wellness_subscribers.csv"',
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
    body: csvContent,
  };
};
