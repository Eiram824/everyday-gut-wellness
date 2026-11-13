import type { HandlerEvent, HandlerResponse } from "@netlify/functions";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cross-Origin-Resource-Policy": "same-origin",
};

export interface AuthResult {
  authorized: boolean;
  status: number;
  error?: string;
}

export function getAdminAccessKey(): string {
  return (process.env.ADMIN_ACCESS_KEY || "").trim();
}

export function safeSecretMatch(candidate: string, expected: string): boolean {
  if (!candidate || !expected || candidate.length > 4096) return false;
  // Compare fixed-size digests so the comparison does not reveal the key length.
  return timingSafeEqual(createHash("sha256").update(candidate).digest(), createHash("sha256").update(expected).digest());
}

const SESSION_COOKIE = "__Host-egw_admin";
const SESSION_SECONDS = 1800;

function header(event: HandlerEvent, name: string): string {
  return Object.entries(event.headers || {}).find(([key]) => key.toLowerCase() === name)?.[1] || "";
}

export function isTrustedAdminRequest(event: HandlerEvent): boolean {
  if (header(event, "sec-fetch-site") === "cross-site") return false;
  const origin = header(event, "origin");
  if (!origin) return true; // Non-browser clients must still supply a valid credential.
  const origins = ["https://everyday-gut-wellness.netlify.app", process.env.DEPLOY_PRIME_URL].filter(Boolean);
  return origins.some(value => { try { return new URL(value!).origin === origin; } catch { return false; } });
}

function signSession(value: string, key: string): string {
  return createHmac("sha256", key).update(`egw-admin-session:v1:${value}`).digest("hex");
}

export function createAdminSessionCookie(key: string, now = Date.now()): string {
  const value = `${Math.floor(now / 1000) + SESSION_SECONDS}.${randomBytes(16).toString("hex")}`;
  return `${SESSION_COOKIE}=${value}.${signSession(value, key)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearAdminSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function hasValidSession(event: HandlerEvent, key: string, now = Date.now()): boolean {
  const matches = header(event, "cookie").split(";").map(part => part.trim()).filter(part => part.startsWith(`${SESSION_COOKIE}=`));
  if (matches.length !== 1) return false;
  const token = matches[0].slice(SESSION_COOKIE.length + 1);
  const match = /^(\d{10})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return false;
  const expiry = Number(match[1]);
  const seconds = Math.floor(now / 1000);
  return safeSecretMatch(match[3], signSession(`${match[1]}.${match[2]}`, key)) && expiry > seconds && expiry <= seconds + SESSION_SECONDS;
}

/**
 * Validates administrator authentication for Netlify Functions.
 * Strictly enforces header-based authentication (x-admin-key or Authorization: Bearer <key>).
 * Query parameter authentication is rejected to prevent token leakage in server logs.
 * Fails closed (status 503) if ADMIN_ACCESS_KEY is not configured on the server.
 */
export function verifyAdminAccess(event: HandlerEvent): AuthResult {
  if (!isTrustedAdminRequest(event)) return { authorized: false, status: 403, error: "Forbidden." };
  const adminAccessKey = getAdminAccessKey();

  if (!adminAccessKey) {
    return {
      authorized: false,
      status: 503,
      error: "Administrative access is currently unavailable.",
    };
  }

  // Normalize header lookup (case-insensitive in HTTP)
  const authHeader = header(event, "authorization");
  const bearerKey = /^Bearer\s+/i.test(authHeader) ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";
  const customHeaderKey = header(event, "x-admin-key").trim();

  if (safeSecretMatch(bearerKey, adminAccessKey) || safeSecretMatch(customHeaderKey, adminAccessKey) || hasValidSession(event, adminAccessKey)) {
    return { authorized: true, status: 200 };
  }

  return {
    authorized: false,
    status: 401,
    error: "Unauthorized.",
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
