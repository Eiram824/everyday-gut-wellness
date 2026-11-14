export type EmailDeliveryStatus = "not_requested" | "not_configured" | "queued" | "unavailable";

export function parseMarketingSignupUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const allowedHost = url.hostname === "everydaygutwellness.com" || url.hostname.endsWith(".systeme.io");
    return url.protocol === "https:" && allowedHost && !url.username && !url.password && !url.port ? url.href : null;
  } catch { return null; }
}

export function parseEmailDeliveryStatus(value: unknown): EmailDeliveryStatus {
  return value === "not_requested" || value === "not_configured" || value === "queued" ? value : "unavailable";
}

export function guideDeliveryNotice(status: EmailDeliveryStatus): string {
  if (status === "queued") return "Your email-copy request is saved. You can download the PDF now while email delivery is handled separately.";
  if (status === "not_configured") return "Email copies are not available yet. Your free PDF is ready to download below.";
  if (status === "unavailable") return "Your guide is ready to download. We could not queue an email copy for this request; save your PDF below.";
  return "Your free PDF is ready. Use the download button below to save a copy.";
}
