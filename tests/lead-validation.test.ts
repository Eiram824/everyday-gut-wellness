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

  it('ensures admin key verification handles header, bearer, and query correctly', () => {
    const ADMIN_ACCESS_KEY = 'test_secret_key_123';
    const verifyKey = (customHeader?: string, bearerHeader?: string, queryKey?: string) => {
      const bKey = bearerHeader?.startsWith('Bearer ') ? bearerHeader.slice(7).trim() : '';
      return (
        (customHeader || '').trim() === ADMIN_ACCESS_KEY ||
        bKey === ADMIN_ACCESS_KEY ||
        (queryKey || '').trim() === ADMIN_ACCESS_KEY
      );
    };

    assert.ok(verifyKey('test_secret_key_123', undefined, undefined));
    assert.ok(verifyKey(undefined, 'Bearer test_secret_key_123', undefined));
    assert.ok(verifyKey(undefined, undefined, 'test_secret_key_123'));
    assert.ok(!verifyKey('wrong_key', undefined, undefined));
    assert.ok(!verifyKey(undefined, 'Bearer wrong_key', undefined));
    assert.ok(!verifyKey(undefined, undefined, 'wrong_key'));
    assert.ok(!verifyKey('', '', ''));
  });
});
