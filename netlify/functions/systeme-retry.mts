import type { Config } from "@netlify/functions";
import { processSystemeQueue } from "./lib/systeme-queue.js";

export default async () => {
  try {
    await processSystemeQueue();
  } catch {
    // The durable lease expires safely; never print addresses, keys or provider bodies.
    console.error("[Systeme queue] retry requires operator attention");
  }
};

export const config: Config = {
  schedule: "*/5 * * * *", // Every five minutes UTC (also every five minutes in Asia/Singapore).
};
