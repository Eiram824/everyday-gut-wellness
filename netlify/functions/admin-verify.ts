import type { Handler } from "@netlify/functions";
import { getAdminAccessKey, jsonResponse, errorResponse } from "./lib/auth.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return errorResponse(405, "Method not allowed. Expected POST.");
  }

  const configuredKey = getAdminAccessKey();
  if (!configuredKey) {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: "Server configuration error: ADMIN_ACCESS_KEY is not configured on the server. Administrative access is locked.",
      }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const key = (body?.key || "").trim();

    if (key && key === configuredKey) {
      return jsonResponse(200, {
        success: true,
        message: "Admin authenticated.",
      });
    }

    return errorResponse(401, "Invalid administrator key.");
  } catch (err: any) {
    return errorResponse(400, "Invalid JSON request payload.");
  }
};
