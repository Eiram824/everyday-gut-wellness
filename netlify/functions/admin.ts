import type { Config, Handler, HandlerResponse } from "@netlify/functions";
import { randomBytes } from "node:crypto";
import { JSON_HEADERS, getAdminAccessKey, safeSecretMatch, verifyAdminAccess, isTrustedAdminRequest, createAdminSessionCookie, clearAdminSessionCookie } from "./lib/auth.js";
import { listSubscribersFromDatabase } from "./lib/db.js";

export const config: Config = {
  path: ["/admin", "/admin/", "/admin/logout"],
  rateLimit: { windowSize: 60, windowLimit: 20, aggregateBy: ["ip"] },
};

const escapeHtml = (value: unknown): string => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));

function html(status: number, content: string): HandlerResponse {
  const nonce = randomBytes(16).toString("base64");
  return {
    statusCode: status,
    headers: {
      ...JSON_HEADERS, "Content-Type": "text/html; charset=utf-8", "X-Frame-Options": "DENY",
      // Preserve the Origin on same-origin form POSTs; no-referrer can make it null.
      "Referrer-Policy": "same-origin",
      "Content-Security-Policy": `default-src 'none'; style-src 'nonce-${nonce}'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`,
    },
    body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow, noarchive"><title>Private administration | Everyday Gut Wellness</title><style nonce="${nonce}">body{margin:0;background:#fbf9f5;color:#14382b;font:16px/1.6 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:40px 24px}form{margin:20px 0}label{display:block}input,button,a{font:inherit}input{display:block;padding:12px;margin:8px 0;max-width:100%;box-sizing:border-box}button{padding:12px 20px;background:#14382b;color:white;border:0;cursor:pointer}a{color:#14382b}table{width:100%;border-collapse:collapse;text-align:left}td,th{padding:12px;border-bottom:1px solid #ddd;overflow-wrap:anywhere}.records{overflow:auto}.notice{color:#9b321b}</style></head><body><main>${content}</main></body></html>`,
  };
}

function login(status = 401, message = "Sign in to manage subscriber records."): HandlerResponse {
  return html(status, `<h1>Private administration</h1><p>${escapeHtml(message)}</p><form method="post" action="/admin"><label for="key">Admin access key</label><input id="key" name="key" type="password" autocomplete="current-password" required maxlength="4096"><button type="submit">Sign in</button></form><p>Sessions expire after 30 minutes.</p><p><a href="/">Back to the website</a></p>`);
}

export const handler: Handler = async event => {
  if (!isTrustedAdminRequest(event)) return html(403, "<h1>Forbidden</h1>");
  const key = getAdminAccessKey();
  if (!key) return login(503, "Administrative access is currently unavailable.");
  const logout = /\/logout\/?$/.test(event.path);
  if (logout) {
    if (event.httpMethod !== "POST") return html(405, "<h1>Method not allowed</h1>");
    return { statusCode: 303, headers: { ...JSON_HEADERS, Location: "/admin", "Set-Cookie": clearAdminSessionCookie() }, body: "" };
  }
  if (event.httpMethod === "POST") {
    if (Buffer.byteLength(event.body || "", "utf8") > 4096) return html(413, "<h1>Request too large</h1>");
    const contentType = Object.entries(event.headers || {}).find(([name]) => name.toLowerCase() === "content-type")?.[1] || "";
    if (!contentType.startsWith("application/x-www-form-urlencoded")) return html(415, "<h1>Unsupported request</h1>");
    const body = event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : event.body || "";
    const candidate = new URLSearchParams(body).get("key")?.trim() || "";
    if (!safeSecretMatch(candidate, key)) return login(401, "Unable to sign in. Check your access key.");
    return { statusCode: 303, headers: { ...JSON_HEADERS, Location: "/admin", "Set-Cookie": createAdminSessionCookie(key) }, body: "" };
  }
  if (event.httpMethod !== "GET") return html(405, "<h1>Method not allowed</h1>");
  const auth = verifyAdminAccess(event);
  if (!auth.authorized) return login(auth.status);
  try {
    const subscribers = await listSubscribersFromDatabase();
    const rows = subscribers.map(subscriber => `<tr><td>${escapeHtml(subscriber.name)}</td><td>${escapeHtml(subscriber.email)}</td><td>${escapeHtml(subscriber.date)}</td><td>${subscriber.marketingConsent ? "Yes" : "No"}</td></tr>`).join("");
    return html(200, `<h1>Subscriber administration</h1><p>${subscribers.length} records. Handle personal information privately.</p><p><a href="/api/leads/export.csv">Download subscriber CSV</a> · <a href="/admin">Refresh</a></p><form method="post" action="/admin/logout"><button type="submit">Sign out</button></form><div class="records"><table><thead><tr><th>Name</th><th>Email</th><th>Requested</th><th>Marketing consent</th></tr></thead><tbody>${rows}</tbody></table></div>`);
  } catch {
    return html(503, "<h1>Subscriber administration</h1><p>Records are temporarily unavailable. Please try again later.</p>");
  }
};

