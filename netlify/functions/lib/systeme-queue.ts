import { claimSystemeJobs, finishSystemeJob, isDatabaseConfigured } from "./db.js";
import { syncSystemeContact, systemeConfig } from "./systeme.js";

// One job per invocation keeps the documented scheduled-function 30s budget.
export async function processSystemeQueue(jobId?: string): Promise<void> {
  if (!systemeConfig().ready || !isDatabaseConfigured()) return;
  const jobs = await claimSystemeJobs(jobId);
  for (const job of jobs) {
    const result = await syncSystemeContact(job.email, Number(job.tag_id), job.reconcile_only);
    const backoff = Math.min(21600, 60 * 2 ** Math.min(job.attempts, 8));
    await finishSystemeJob(job, result, Math.max(backoff, result.retryAfterSeconds || 0));
  }
}
