import type { Config, Handler } from "@netlify/functions";
import { getAdminAccessKey, jsonResponse, errorResponse, safeSecretMatch, isTrustedAdminRequest, createAdminSessionCookie } from "./lib/auth.js";

export const config: Config = {
  path: "/api/admin/verify",
  rateLimit: { windowSize: 60, windowLimit: 10, aggregateBy: ["ip"] },
};

export const handler: Handler = async (event) => {
  if (!isTrustedAdminRequest(event)) return errorResponse(403, "Forbidden.");
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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse(400, "Invalid JSON request payload.");
    }
    const key = typeof body.key === "string" ? body.key.trim() : "";

    if (key && safeSecretMatch(key, configuredKey)) {
      const response = jsonResponse(200, {
        success: true,
        message: "Admin authenticated.",
      });
      response.headers = { ...response.headers, "Set-Cookie": createAdminSessionCookie(configuredKey) };
      return response;
    }

    return errorResponse(401, "Invalid administrator key.");
  } catch {
    return errorResponse(400, "Invalid JSON request payload.");
  }
};
