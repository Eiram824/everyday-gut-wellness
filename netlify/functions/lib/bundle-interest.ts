import { isDatabaseConfigured } from './db.js';

const CONSENT_VERSION = 'egw-bundle-alert-v1';
const REQUEST_TIMEOUT_MS = 4500;

export function bundleAlertsAvailable(): boolean {
  const context = (process.env.CONTEXT || '').trim();
  const productionContext = (!context || context === 'production') && process.env.NETLIFY_DEV !== 'true';
  return productionContext && process.env.BUNDLE_LAUNCH_ALERTS_ENABLED === 'true' && isDatabaseConfigured();
}

export async function saveBundleInterest(firstName: string, email: string): Promise<void> {
  if (!bundleAlertsAvailable()) throw new Error('Bundle alerts unavailable');
  const databaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new Error('Bundle interest request timed out'));
    }, REQUEST_TIMEOUT_MS);
  });
  try {
    const save = (async () => {
      const response = await fetch(`${databaseUrl}/rest/v1/bundle_launch_interests?on_conflict=email`, {
        method: 'POST', signal: controller.signal, redirect: 'error',
        headers: { apikey: key, 'Content-Type': 'application/json', Accept: 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify({ name: firstName, email, consent_version: CONSENT_VERSION }),
      });
      if (!response.ok) throw new Error('Bundle interest persistence unavailable');
    })();
    await Promise.race([save, expired]);
  } finally { clearTimeout(timeout); }
}
