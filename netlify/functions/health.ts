import type { Handler } from "@netlify/functions";
import { jsonResponse } from "./lib/auth.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed. Expected GET." }),
    };
  }

  return jsonResponse(200, {
    status: "ok",
    runtime: "netlify-serverless",
    timestamp: new Date().toISOString(),
  });
};
