/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Config, Handler } from "@netlify/functions";
import { jsonResponse, errorResponse, safeSecretMatch } from "./lib/auth.js";
import { isDatabaseConfigured, recordPurchase } from "./lib/db.js";

/**
 * Gumroad "Ping" receiver (Gumroad > Settings > Advanced > Ping endpoint).
 *
 * Gumroad Ping sends application/x-www-form-urlencoded data and cannot add
 * custom headers or signatures, so a request is accepted only when it proves
 * it came from our Gumroad account:
 *   - its `seller_id` equals GUMROAD_SELLER_ID, and/or
 *   - the ping URL carries ?key=<GUMROAD_WEBHOOK_SECRET>.
 * Every configured check must pass. With neither configured the endpoint
 * fails closed (503), so nobody can write fake purchases.
 *
 * Sales are stored in Supabase `purchases` (scripts/gumroad-purchases-migration.sql).
 * Buyers are NOT added to the email list: buying is not consent to marketing.
 */

export const config: Config = {
  path: "/api/gumroad-webhook",
};

function firstHeader(headers: Record<string, string | undefined>, name: string): string {
  const key = Object.keys(headers || {}).find((k) => k.toLowerCase() === name);
  return key ? String(headers[key] || "") : "";
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return errorResponse(405, "Method not allowed. Expected POST.");
  }

  const expectedSeller = (process.env.GUMROAD_SELLER_ID || "").trim();
  const expectedKey = (process.env.GUMROAD_WEBHOOK_SECRET || "").trim();
  if (!event.body) {
    return errorResponse(400, "Webhook payload is empty.");
  }

  let data: Record<string, any>;
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
    if (firstHeader(event.headers as any, "content-type").includes("application/json")) {
      data = JSON.parse(raw);
    } else {
      data = Object.fromEntries(new URLSearchParams(raw).entries());
    }
  } catch {
    return errorResponse(400, "Invalid webhook body.");
  }

  if (!expectedSeller && !expectedKey) {
    // Setup aid: seller_id is a public account id (not a secret). Logging it lets
    // the owner copy it into GUMROAD_SELLER_ID after Gumroad's first test ping.
    console.warn(`[Gumroad Ping] Rejected: verification not configured. Received seller_id=${String(data.seller_id || "").slice(0, 64)}`);
    return errorResponse(503, "Webhook is not configured.");
  }

  if (expectedKey) {
    const key = String(event.queryStringParameters?.key || "");
    if (!key || !safeSecretMatch(key, expectedKey)) {
      return errorResponse(401, "Unauthorized webhook request.");
    }
  }
  if (expectedSeller) {
    const seller = String(data.seller_id || "").trim();
    if (!seller || !safeSecretMatch(seller, expectedSeller)) {
      return errorResponse(401, "Unauthorized webhook request.");
    }
  }

  const email = String(data.email || "").trim().toLowerCase();
  const saleId = String(data.sale_id || data.order_number || "").trim();
  if (!email || !saleId) {
    return errorResponse(400, "Sale id or buyer email is missing in webhook payload.");
  }

  const isTest = String(data.test || "").toLowerCase() === "true";
  if (isTest) {
    console.info("[Gumroad Ping] Test ping received and verified.");
    return jsonResponse(200, { received: true, test: true, stored: false });
  }

  if (!isDatabaseConfigured()) {
    // 5xx makes Gumroad retry later instead of dropping the sale.
    return errorResponse(503, "Purchase storage is not configured.");
  }

  const price = Number(data.price);
  try {
    await recordPurchase({
      saleId,
      email,
      productId: String(data.product_id || data.permalink || ""),
      productName: String(data.product_name || ""),
      priceCents: Number.isFinite(price) ? Math.round(price) : null,
      currency: String(data.currency || "").toLowerCase(),
      refunded: String(data.refunded || "").toLowerCase() === "true",
      purchasedAt: data.sale_timestamp ? new Date(String(data.sale_timestamp)).toISOString() : new Date().toISOString(),
    });
  } catch {
    console.error("[Gumroad Ping] Could not store purchase; Gumroad will retry.");
    return errorResponse(500, "Could not store purchase.");
  }

  console.info(`[Gumroad Ping] Stored sale for product ${String(data.product_name || "").slice(0, 60)}.`);
  return jsonResponse(200, { received: true, stored: true });
};

export default handler;
