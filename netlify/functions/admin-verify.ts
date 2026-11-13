import type { Config, Handler } from "@netlify/functions";
import { getAdminAccessKey, jsonResponse, errorResponse, safeSecretMatch } from "./lib/auth.js";

export const config: Config = {
  path: "/api/admin/verify",
  rateLimit: { windowSize: 60, windowLimit: 10, aggregateBy: ["ip"] },
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return errorResponse(405, "Method not allowed. Expected POST.");
  }

  const configuredKey = getAdminAccessKey();
  if (!configuredKey) {
    return errorResponse(503, "Administrative access is currently unavailable.");
  }

  if (Buffer.byteLength(event.body || "", "utf8") > 4096) return errorResponse(413, "The request is too large.");

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof body.key !== "string") {
      return errorResponse(400, "Invalid JSON request payload.");
    }
    const key = body.key.trim();

    if (key && safeSecretMatch(key, configuredKey)) {
      return jsonResponse(200, {
        success: true,
        message: "Admin authenticated.",
      });
    }

    return errorResponse(401, "Invalid administrator key.");
  } catch {
    return errorResponse(400, "Invalid JSON request payload.");
  }
};
