import type { Handler } from "@netlify/functions";
import { errorResponse, jsonResponse } from "./lib/auth.js";
import { checkDatabaseConnection } from "./lib/db.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed. Expected GET." }),
    };
  }

  try {
    await checkDatabaseConnection();
    return jsonResponse(200, {
      status: "ok",
      runtime: "netlify-serverless",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return errorResponse(503, "Service dependencies are temporarily unavailable.");
  }
};
