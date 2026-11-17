import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tsImport } from 'tsx/esm/api';
import { readRouteSchema, validateRouteSchema } from '../scripts/lib/editorial-schema.mjs';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const { schemaForRoute, headForRoute } = await tsImport('../lib/page-seo.ts', import.meta.url);

describe('Route-specific editorial and live-product structured data', () => {
  it('defines the home publisher, website and medical page with truthful creator metadata and resolvable references', () => {
    const data = readRouteSchema(html);
    assert.deepEqual(data['@graph'].map(node => node['@type']), ['WebSite', 'Organization', 'MedicalWebPage', 'FAQPage']);
    const page = data['@graph'].find(node => node['@type'] === 'MedicalWebPage');
    const ids = data['@graph'].map(node => node['@id']);
    assert.equal(page.url, 'https://everydaygutwellness.com/');
    assert.equal(page.author.name, 'Mark Laurence E. Medina');
    assert.equal(page.author.jobTitle, 'Independent Health Educator and Research Curator');
    assert.equal(page.author.url, 'https://everydaygutwellness.com/#creator');
    assert.ok(ids.includes(page.publisher['@id']));
    assert.ok(ids.includes(page.isPartOf['@id']));
    assert.equal(new URL(page.image).origin, 'https://everydaygutwellness.com');
  });

  it('preserves all four visible FAQ questions and answers', () => {
    const faq = readRouteSchema(html)['@graph'].find(node => node['@type'] === 'FAQPage');
    assert.equal(faq.mainEntity.length, 4);
    for (const item of faq.mainEntity) {
      assert.equal(item['@type'], 'Question');
      assert.equal(item.acceptedAnswer['@type'], 'Answer');
      assert.ok(item.name && item.acceptedAnswer.text);
    }
  });

  it('rejects commerce on editorial routes even when nested, namespaced, or typed using an array', () => {
    for (const pathname of ['/', '/fiber-guide', '/routine-reset', '/myths-vs-facts', '/when-to-seek-care']) {
      for (const type of ['Product', 'Offer', ['Thing', 'Product'], 'https://schema.org/Offer', 'AggregateOffer']) {
        const data = schemaForRoute(pathname);
        data['@graph'][0].about = { '@type': type };
        assert.throws(() => validateRouteSchema(data, pathname), /Commerce structured data/);
      }
    }
  });

  it('rejects untyped offers and extra top-level schemas', () => {
    const data = readRouteSchema(html);
    data['@graph'][0].offers = { price: '25.00' };
    assert.throws(() => validateRouteSchema(data), /Commerce offers/);
    delete data['@graph'][0].offers;
    data['@graph'].push({ '@type': 'WebSite' });
    assert.throws(() => validateRouteSchema(data), /top-level schemas/);
  });

  it('allows only the two real $25 and $30 USD offers on the workbook route', () => {
    const data = validateRouteSchema(schemaForRoute('/workbooks'), '/workbooks');
    const products = data['@graph'].filter(node => node['@type'] === 'Product');
    assert.deepEqual(products.map(product => Number(product.offers.price)), [25, 30]);
    assert.ok(products.every(product => product.offers.priceCurrency === 'USD'));
    assert.doesNotMatch(JSON.stringify(data), /complete-gut-bundle|"price":"?39|Review|AggregateRating|shippingDetails/);
    for (const product of products) {
      const changed = structuredClone(data);
      changed['@graph'].find(node => node['@id'] === product['@id']).offers.price = '39.00';
      assert.throws(() => validateRouteSchema(changed, '/workbooks'), /Offer price/);
    }
  });

  it('rejects fake review, rating, availability and shipping assertions', () => {
    for (const [key, value] of [['review', { '@type': 'Review' }], ['aggregateRating', { '@type': 'AggregateRating' }], ['shippingDetails', {}], ['availability', 'https://schema.org/InStock']]) {
      const data = schemaForRoute('/workbooks');
      data['@graph'][0].offers[key] = value;
      assert.throws(() => validateRouteSchema(data, '/workbooks'), /Do not invent/);
    }
  });

  it('renders exactly the requested schema types in the initial head of each route', () => {
    const expected = {
      '/': ['WebSite', 'Organization', 'MedicalWebPage', 'FAQPage'],
      '/fiber-guide': ['Article', 'BreadcrumbList'],
      '/routine-reset': ['Article', 'BreadcrumbList'],
      '/myths-vs-facts': ['Article', 'BreadcrumbList'],
      '/when-to-seek-care': ['MedicalWebPage', 'BreadcrumbList'],
      '/workbooks': ['Product', 'Product', 'BreadcrumbList'],
    };
    for (const [pathname, types] of Object.entries(expected)) {
      const data = readRouteSchema(`<head>${headForRoute(pathname)}</head>`, pathname);
      assert.deepEqual(data['@graph'].map(node => node['@type']), types);
    }
  });

  it('rejects additional JSON-LD scripts instead of silently ignoring them', () => {
    assert.throws(() => readRouteSchema(html + '<script type="application/ld+json">{"@type":"Product"}</script>'), /exactly one/);
    assert.throws(() => readRouteSchema(`<body>${headForRoute('/')}</body>`), /initial head/);
  });
});
