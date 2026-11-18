/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Config, Handler } from "@netlify/functions";
import { jsonResponse, errorResponse } from "./lib/auth.js";
import { isDatabaseConfigured } from "./lib/db.js";

export const config: Config = {
  path: "/api/gumroad-webhook",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return errorResponse(405, "Method not allowed. Expected POST.");
  }

  const webhookSecret = (process.env.GUMROAD_WEBHOOK_SECRET || "").trim();
  if (webhookSecret) {
    const signature = event.headers["x-gumroad-signature"] || event.headers["x-signature"];
    if (!signature || signature !== webhookSecret) {
      return errorResponse(401, "Unauthorized webhook request.");
    }
  }

  if (!event.body) {
    return errorResponse(400, "Webhook payload is empty.");
  }

  let data: Record<string, any>;
  try {
    if (event.headers["content-type"]?.includes("application/json")) {
      data = JSON.parse(event.body);
    } else {
      const params = new URLSearchParams(event.body);
      data = Object.fromEntries(params.entries());
    }
  } catch (err) {
    return errorResponse(400, "Invalid webhook body.");
  }

  const email = (data.email || "").trim().toLowerCase();
  const productId = data.product_id || data.permalink || "";
  const productName = data.product_name || "Gut Workbook";
  const saleId = data.sale_id || data.order_number || "";
  const pricePaid = data.price ? Number(data.price) / 100 : 0;

  if (!email) {
    return errorResponse(400, "Buyer email is missing in webhook payload.");
  }

  console.info(`[Gumroad Webhook] Received sale for product: ${productName}, email: ${email.substring(0, 3)}***`);

  let supabaseUpdated = false;
  let systemeSynced = false;

  const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  // 1. Update Supabase buyer status / exclusion tag
  if (isDatabaseConfigured() && supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          is_buyer: true,
          purchased_workbook: true,
          last_purchase_product: productName,
          last_purchase_at: new Date().toISOString(),
          promo_exclusion_tag: true,
        }),
      });
      supabaseUpdated = response.ok;
      if (!response.ok) {
        const insertRes = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            email,
            name: data.full_name || data.name || "Workbook Buyer",
            source: "gumroad_purchase",
            is_buyer: true,
            purchased_workbook: true,
            promo_exclusion_tag: true,
            signup_date: new Date().toISOString(),
          }),
        });
        supabaseUpdated = insertRes.ok;
      }
    } catch (err: any) {
      console.warn("[Gumroad Webhook] Supabase buyer tag update failed:", err?.message);
    }
  }

  // 2. Sync / Tag in Systeme.io or email CRM for promo exclusion
  const systemeApiKey = (process.env.SYSTEME_IO_API_KEY || "").trim();
  const systemeTagId = (process.env.SYSTEME_IO_BUYER_TAG_ID || "").trim();
  if (systemeApiKey) {
    try {
      const sysRes = await fetch("https://api.systeme.io/api/v1/contacts", {
        method: "POST",
        headers: {
          "X-API-Key": systemeApiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          ...(systemeTagId ? { tagIds: [systemeTagId] } : {}),
          fields: [{ slug: "purchased_product", value: productName }],
        }),
      });
      systemeSynced = sysRes.ok;
    } catch (err: any) {
      console.warn("[Gumroad Webhook] Systeme.io sync failed:", err?.message);
    }
  }

  return jsonResponse(200, {
    received: true,
    email,
    productId,
    supabaseUpdated,
    systemeSynced,
    message: "Gumroad sale processed successfully. Buyer tagged for promotional exclusion.",
  });
};

export default handler;
