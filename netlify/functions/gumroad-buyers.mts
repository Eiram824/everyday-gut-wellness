import type { Config } from "@netlify/functions";
import { pollGumroadBuyerSales, processGumroadBuyerQueue } from "./lib/gumroad-buyers.js";

export default async () => {
  // Independent leases; at most head + continuation and one contact per invocation. A newly
  // staged job can be picked up on the next scheduled invocation.
  const results = await Promise.allSettled([pollGumroadBuyerSales(), processGumroadBuyerQueue()]);
  if (results.some(result => result.status === "rejected")) {
    console.error("[Buyer exclusion] reconciliation requires operator attention");
  }
};
export const config: Config = { schedule: "*/5 * * * *" }; // UTC; published production only.
