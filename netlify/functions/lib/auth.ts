import type { HandlerEvent, HandlerResponse } from "@netlify/functions";

export const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export interface AuthResult {
  authorized: boolean;
  status: number;
  error?: string;
}

export function getAdminAccessKey(): string {
  return (process.env.ADMIN_ACCESS_KEY || "").trim();
}

/**
 * Validates administrator authentication for Netlify Functions.
 * Strictly enforces header-based authentication (x-admin-key or Authorization: Bearer <key>).
 * Query parameter authentication is rejected to prevent token leakage in server logs.
 * Fails closed (status 503) if ADMIN_ACCESS_KEY is not configured on the server.
 */
export function verifyAdminAccess(event: HandlerEvent): AuthResult {
  const adminAccessKey = getAdminAccessKey();

  if (!adminAccessKey) {
    return {
      authorized: false,
      status: 503,
      error: "Server configuration error: ADMIN_ACCESS_KEY is not configured on the server. Administrative access is locked.",
    };
  }

  // Normalize header lookup (case-insensitive in HTTP)
  const headers = event.headers || {};
  const authHeader = headers["authorization"] || headers["Authorization"] || "";
  const bearerKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const customHeaderKey = (headers["x-admin-key"] || headers["X-Admin-Key"] || "").trim();

  if ((bearerKey && bearerKey === adminAccessKey) || (customHeaderKey && customHeaderKey === adminAccessKey)) {
    return { authorized: true, status: 200 };
  }

  return {
    authorized: false,
    status: 401,
    error: "Unauthorized access. Valid administrator key required in Authorization or X-Admin-Key header.",
  };
}

export function errorResponse(status: number, message: string): HandlerResponse {
  return {
    statusCode: status,
    headers: JSON_HEADERS,
    body: JSON.stringify({ success: false, error: message }),
  };
}

export function jsonResponse(status: number, data: any): HandlerResponse {
  return {
    statusCode: status,
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  };
}
