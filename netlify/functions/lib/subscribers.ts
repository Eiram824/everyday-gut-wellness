import fs from "fs";
import path from "path";

export interface SubscriberRecord {
  id: string;
  name: string;
  email: string;
  date: string;
  source: string;
  marketingConsent: boolean;
  consentDate: string | null;
  senderSynced: boolean;
}

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

export function getSubscribers(): SubscriberRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(SUBSCRIBERS_FILE, "utf8");
    const list = JSON.parse(data) || [];
    return list.map((item: any) => ({
      id: item.id || `sub_${Date.now()}`,
      name: item.name || "Reader",
      email: item.email || "",
      date: item.date || new Date().toISOString(),
      source: item.source || "ebook_lead_magnet",
      marketingConsent: Boolean(item.marketingConsent),
      consentDate: item.consentDate || null,
      senderSynced: Boolean(item.senderSynced),
    }));
  } catch (err) {
    console.warn("[Storage] Note on reading subscriber file:", err);
    return [];
  }
}

export function saveSubscribers(subscribers: SubscriberRecord[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${SUBSCRIBERS_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(subscribers, null, 2), "utf8");
    fs.renameSync(tempFile, SUBSCRIBERS_FILE);
    return true;
  } catch (err) {
    console.error("[Storage] Error writing subscribers:", err);
    return false;
  }
}

export function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}
