import type { Config, Handler } from '@netlify/functions';
import { errorResponse, jsonResponse } from './lib/auth.js';
import { bundleAlertsAvailable, saveBundleInterest } from './lib/bundle-interest.js';

const EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const UNAVAILABLE = 'Bundle launch alerts are not open yet. Please contact hello@everydaygutwellness.com.';
const INVALID = 'Please provide your first name, a valid email address, and permission for the bundle launch alert.';
const MAX_REQUEST_BYTES = 16_384;

export const config: Config = {
  path: '/api/bundle-interest',
  rateLimit: { windowSize: 60, windowLimit: 5, aggregateBy: ['ip'] },
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'GET') return jsonResponse(200, { available: bundleAlertsAvailable() });
  if (event.httpMethod !== 'POST') return errorResponse(405, 'Method not allowed. Expected GET or POST.');
  if (!bundleAlertsAvailable()) return errorResponse(503, UNAVAILABLE);
  if (!event.body || event.isBase64Encoded) return errorResponse(400, INVALID);
  if (Buffer.byteLength(event.body, 'utf8') > MAX_REQUEST_BYTES) return errorResponse(413, 'The request is too large.');
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(event.body);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return errorResponse(400, INVALID);
    body = parsed as Record<string, unknown>;
  } catch { return errorResponse(400, INVALID); }
  if ('website' in body && (typeof body.website !== 'string' || body.website.trim() !== '')) return errorResponse(400, INVALID);
  if (typeof body.firstName !== 'string' || typeof body.email !== 'string' || body.launchConsent !== true) return errorResponse(400, INVALID);
  const firstName = body.firstName.trim();
  const email = body.email.trim().toLowerCase();
  if (!firstName || firstName.length > 80 || /[\u0000-\u001f\u007f<>]/.test(firstName) || email.length > 254 || !EMAIL.test(email)) return errorResponse(400, INVALID);
  try {
    await saveBundleInterest(firstName, email);
    // Identical for new, duplicate and withdrawn addresses. A public retry may
    // neither enumerate a private record nor renew a withdrawn permission.
    return jsonResponse(200, { success: true });
  } catch {
    // Never expose an address, database response, credential or provider detail.
    return errorResponse(503, 'We could not save your bundle request. Please try again later or contact hello@everydaygutwellness.com.');
  }
};
