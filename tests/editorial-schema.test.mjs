import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readEditorialSchema, validateEditorialSchema } from '../scripts/lib/editorial-schema.mjs';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

describe('Editorial-only structured data', () => {
  it('keeps Article and FAQPage with complete author/publisher metadata and no dangling page references', () => {
    const data = readEditorialSchema(html);
    assert.deepEqual(data['@graph'].map(node => node['@type']), ['Article', 'FAQPage']);
    const article = data['@graph'][0];
    assert.equal(article.mainEntityOfPage, 'https://everyday-gut-wellness.netlify.app/');
    assert.equal(article.author.name, 'Everyday Gut Wellness');
    assert.equal(article.publisher.name, 'Everyday Gut Wellness');
    assert.doesNotMatch(JSON.stringify(data), /#website|#organization|#webpage/);
  });

  it('preserves all four visible FAQ questions and answers', () => {
    const faq = readEditorialSchema(html)['@graph'][1];
    assert.equal(faq.mainEntity.length, 4);
    for (const item of faq.mainEntity) {
      assert.equal(item['@type'], 'Question');
      assert.equal(item.acceptedAnswer['@type'], 'Answer');
      assert.ok(item.name && item.acceptedAnswer.text);
    }
  });

  it('rejects Product/Offer entities even when nested, namespaced, or typed using an array', () => {
    for (const type of ['Product', 'Offer', ['Thing', 'Product'], 'https://schema.org/Offer', 'AggregateOffer']) {
      const data = readEditorialSchema(html);
      data['@graph'][0].about = { '@type': type };
      assert.throws(() => validateEditorialSchema(data), /Commerce structured data/);
    }
  });

  it('rejects untyped offers and extra top-level schemas', () => {
    const data = readEditorialSchema(html);
    data['@graph'][0].offers = { price: '25.00' };
    assert.throws(() => validateEditorialSchema(data), /Commerce offers/);
    delete data['@graph'][0].offers;
    data['@graph'].push({ '@type': 'WebSite' });
    assert.throws(() => validateEditorialSchema(data), /top-level schemas/);
  });

  it('rejects additional JSON-LD scripts instead of silently ignoring them', () => {
    assert.throws(() => readEditorialSchema(html + '<script type="application/ld+json">{"@type":"Product"}</script>'), /exactly one/);
  });
});
