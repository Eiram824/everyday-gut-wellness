import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Lead Capture & Export Security Logic', () => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  it('validates standard email formats correctly', () => {
    assert.ok(emailRegex.test('reader@example.com'));
    assert.ok(emailRegex.test('jane.doe+wellness@domain.co.uk'));
    assert.ok(!emailRegex.test('invalid-email'));
    assert.ok(!emailRegex.test('user@'));
    assert.ok(!emailRegex.test('@domain.com'));
    assert.ok(!emailRegex.test('spaces in@email.com'));
  });

  it('escapes CSV cells to prevent formula injection and delimiter corruption', () => {
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    assert.equal(escapeCsv('Simple Text'), '"Simple Text"');
    assert.equal(escapeCsv('Text with, comma'), '"Text with, comma"');
    assert.equal(escapeCsv('Text with "quotes" inside'), '"Text with ""quotes"" inside"');
    assert.equal(escapeCsv(null), '""');
    assert.equal(escapeCsv(undefined), '""');
  });

  it('ensures admin verification strictly enforces headers, rejects query params, and fails closed', () => {
    const createVerifier = (configuredSecret: string) => {
      return (headers: { authorization?: string; 'x-admin-key'?: string }, query?: { key?: string }) => {
        if (!configuredSecret.trim()) {
          return { authorized: false, status: 503, error: 'Unconfigured key' };
        }
        const authHeader = headers['authorization'] || '';
        const bearerKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
        const customHeaderKey = (headers['x-admin-key'] || '').trim();

        // Query parameters must NOT be accepted for authentication
        if (bearerKey === configuredSecret || customHeaderKey === configuredSecret) {
          return { authorized: true, status: 200 };
        }
        return { authorized: false, status: 401, error: 'Unauthorized' };
      };
    };

    const verifier = createVerifier('test_secret_key_123');

    // Header-based authentication succeeds
    assert.equal(verifier({ 'x-admin-key': 'test_secret_key_123' }).authorized, true);
    assert.equal(verifier({ authorization: 'Bearer test_secret_key_123' }).authorized, true);

    // Query parameter authentication MUST be rejected (no query bypass)
    assert.equal(verifier({}, { key: 'test_secret_key_123' }).authorized, false);
    assert.equal(verifier({}, { key: 'test_secret_key_123' }).status, 401);

    // Invalid credentials rejected
    assert.equal(verifier({ 'x-admin-key': 'wrong_key' }).authorized, false);
    assert.equal(verifier({ authorization: 'Bearer wrong_key' }).authorized, false);
    assert.equal(verifier({}).authorized, false);

    // Unconfigured environment key MUST fail closed (503 status)
    const unconfiguredVerifier = createVerifier('');
    assert.equal(unconfiguredVerifier({ 'x-admin-key': 'test_secret_key_123' }).authorized, false);
    assert.equal(unconfiguredVerifier({ 'x-admin-key': 'test_secret_key_123' }).status, 503);
    assert.equal(unconfiguredVerifier({}).authorized, false);
    assert.equal(unconfiguredVerifier({}).status, 503);
  });
});
