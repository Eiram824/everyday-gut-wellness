import { parseEmailDeliveryStatus, parseMarketingSignupUrl, type EmailDeliveryStatus } from './lead-delivery';

export type LeadIntent = 'guide' | 'bundle';
export type GuideSubscriber = { name: string; email: string };
export const GUIDE_ACCESS_KEY = 'gut_reset_subscriber';
export const GUIDE_PDF = '/The-7-Day-Gentle-Gut-Reset-Guide.pdf';
const EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// A convenience preference on this device, not server-side download authentication.
export function readGuideAccess(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const saved: unknown = JSON.parse(window.localStorage.getItem(GUIDE_ACCESS_KEY) || 'null');
    return saved !== null && typeof saved === 'object' && !Array.isArray(saved)
      && (saved as Record<string, unknown>).accessGranted === true;
  } catch { return false; }
}

export function rememberGuideAccess(): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(GUIDE_ACCESS_KEY, JSON.stringify({ accessGranted: true }));
  } catch { /* Current-session access still works if browser storage is disabled. */ }
}

export function validateLeadDetails(name: string, email: string): GuideSubscriber {
  const firstName = name.trim();
  if (!firstName || firstName.length > 80 || /[\u0000-\u001f\u007f<>]/.test(firstName)) {
    throw new Error('Please enter your first name, using up to 80 characters.');
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 254 || !EMAIL.test(normalizedEmail)) throw new Error('Please enter a valid email address.');
  return { name: firstName, email: normalizedEmail };
}

export type LeadSaveResult = {
  subscriber: GuideSubscriber;
  emailDeliveryStatus: EmailDeliveryStatus;
  marketingSignupUrl: string | null;
};
const activeRequests = new Set<string>();

// Aborting must settle our UI even when a transport ignores its AbortSignal or
// stalls while reading the response body. Late results never grant access.
function abortable<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Request cancelled', 'AbortError'));
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    operation.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

export async function saveLeadRequest(input: {
  name: string; email: string; intent: LeadIntent; emailGuideAvailable: boolean;
  bundleConsent: boolean; website?: string; signal: AbortSignal;
}): Promise<LeadSaveResult> {
  const subscriber = validateLeadDetails(input.name, input.email);
  if (input.intent === 'bundle' && !input.bundleConsent) throw new Error('Please confirm that you would like the bundle launch alert.');
  const requestKey = input.intent + ':' + subscriber.email;
  if (activeRequests.has(requestKey)) throw new Error('This request is already being saved. Please wait for its confirmation.');
  if (input.signal.aborted) throw new DOMException('Request cancelled', 'AbortError');
  activeRequests.add(requestKey);
  try {
    const isBundle = input.intent === 'bundle';
    const response = await abortable(fetch(isBundle ? '/api/bundle-interest' : '/api/subscribe', {
      method: 'POST', signal: input.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isBundle ? {
        firstName: subscriber.name, email: subscriber.email,
        launchConsent: true, website: input.website || '',
      } : {
        ...subscriber,
        source: 'ebook_lead_modal',
        emailGuideRequested: input.emailGuideAvailable,
        marketingConsent: false,
      }),
    }), input.signal);
    const data: unknown = await abortable(response.json().catch(() => null), input.signal);
    // Ignore late responses even if a browser/test transport did not reject on abort.
    if (input.signal.aborted) throw new DOMException('Request cancelled', 'AbortError');
    if (!response.ok || !data || typeof data !== 'object' || (data as Record<string, unknown>).success !== true) {
      throw new Error('We could not save your request. Please try again.');
    }
    const saved = data as Record<string, unknown>;
    if (input.intent === 'guide') rememberGuideAccess();
    return {
      subscriber,
      emailDeliveryStatus: parseEmailDeliveryStatus(saved.emailDeliveryStatus),
      marketingSignupUrl: parseMarketingSignupUrl(saved.marketingSignupUrl),
    };
  } finally { activeRequests.delete(requestKey); }
}
