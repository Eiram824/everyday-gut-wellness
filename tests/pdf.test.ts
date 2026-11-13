import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('PDF Lead Magnet Asset Generation', () => {
  it('verifies that the 7-Day Gentle Gut Reset Guide PDF exists and has valid PDF header', () => {
    const pdfPath = path.join(process.cwd(), 'public', 'The-7-Day-Gentle-Gut-Reset-Guide.pdf');
    assert.ok(fs.existsSync(pdfPath), `Expected ${pdfPath} to exist`);

    const stat = fs.statSync(pdfPath);
    assert.ok(stat.size > 5000, `Expected PDF file size to be > 5KB, got ${stat.size} bytes`);

    // Verify PDF Magic Bytes (%PDF-)
    const buffer = Buffer.alloc(5);
    const fd = fs.openSync(pdfPath, 'r');
    fs.readSync(fd, buffer, 0, 5, 0);
    fs.closeSync(fd);
    assert.equal(buffer.toString('utf-8'), '%PDF-');
    const lowercaseAlias = path.join(process.cwd(), 'public', 'the-7-day-gentle-gut-reset-guide.pdf');
    assert.deepEqual(fs.readFileSync(lowercaseAlias), fs.readFileSync(pdfPath), 'Both download aliases must deliver the same generated PDF.');
  });
});
