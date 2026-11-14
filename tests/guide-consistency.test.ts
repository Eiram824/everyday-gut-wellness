import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PDFDocument } from 'pdf-lib';
import EBookReader from '../components/EBookReader.js';
import RoutineReset from '../components/RoutineReset.js';
import { WARNING_SIGNS } from '../constants.js';

describe('Public guide consistency and safety regressions', () => {
  it('reads and downloads one actual eight-page PDF rather than a contradictory second guide', async () => {
    const html = renderToStaticMarkup(createElement(EBookReader, { isOpen: true, onClose: () => {} }));
    const pdfPath = '/The-7-Day-Gentle-Gut-Reset-Guide.pdf';
    assert.ok(html.includes('src="' + pdfPath + '#page=1'));
    assert.ok(html.includes('href="' + pdfPath + '" download='));
    assert.ok(html.includes('open the guide in a new tab'));
    assert.doesNotMatch(html, /within 15 mins|3-hour fast|iced water|cleanse your small bowel/i);
    const pdf = await PDFDocument.load(readFileSync('public' + pdfPath));
    assert.equal(pdf.getPageCount(), 8);
  });

  it('does not promise a fixed toilet angle or zero straining', () => {
    const html = renderToStaticMarkup(createElement(RoutineReset));
    assert.doesNotMatch(html, /35°|zero straining|guaranteed relief/i);
    assert.match(html, /does not guarantee relief/);
    assert.ok(html.includes('https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/treatment'));
  });

  it('keeps unintended weight loss or fever with constipation out of routine-only advice', () => {
    const warning = WARNING_SIGNS.find(item => item.id === 'unexplained-weight-loss');
    assert.equal(warning?.severity, 'urgent');
    assert.match(warning?.actionRequired || '', /promptly/);
    assert.ok(WARNING_SIGNS.some(item => item.id === 'unexplained-fatigue' && item.severity === 'routine'));
  });
});
