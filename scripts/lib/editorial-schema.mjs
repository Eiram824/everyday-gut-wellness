import assert from 'node:assert/strict';

const typesOf = node => (Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']]).filter(type => typeof type === 'string').map(type => type.split(/[\/#:]/).pop());
const expectedTypes = {
  '/': ['WebSite', 'Organization', 'MedicalWebPage', 'FAQPage'],
  '/fiber-guide': ['Article', 'BreadcrumbList'],
  '/routine-reset': ['Article', 'BreadcrumbList'],
  '/myths-vs-facts': ['Article', 'BreadcrumbList'],
  '/when-to-seek-care': ['MedicalWebPage', 'BreadcrumbList'],
  '/workbooks': ['Product', 'Product', 'BreadcrumbList'],
};
const products = [
  { name: 'The 14-Day Gut Clarity Workbook', price: 25, url: 'https://eiram32.gumroad.com/l/14-day-gut-clarity-workbook' },
  { name: 'The 30-Day Gut Routine Planner', price: 30, url: 'https://eiram32.gumroad.com/l/ynisjl' },
];
const commerce = new Set(['Product', 'ProductGroup', 'Offer', 'AggregateOffer']);

export function validateRouteSchema(data, pathname = '/') {
  assert.ok(Object.hasOwn(expectedTypes, pathname), 'Unknown structured-data route.');
  assert.equal(data?.['@context'], 'https://schema.org', 'Expected the Schema.org context.');
  assert.ok(Array.isArray(data['@graph']), 'Expected a route-specific JSON-LD graph.');
  const graph = data['@graph'];
  assert.deepEqual(graph.map(node => {
    const types = typesOf(node);
    assert.equal(types.length, 1, 'Each top-level schema must have one explicit type.');
    return types[0];
  }).sort(), [...expectedTypes[pathname]].sort(), 'Unexpected top-level schemas for this route.');
  const visit = (value, parentKey = '', productParent = false) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(item => visit(item, parentKey, productParent)); return; }
    const types = typesOf(value);
    assert.ok(!types.includes('Review') && !types.includes('AggregateRating') && !Object.hasOwn(value, 'review') && !Object.hasOwn(value, 'aggregateRating'), 'Do not invent reviews or ratings.');
    assert.ok(!Object.hasOwn(value, 'shippingDetails') && !Object.hasOwn(value, 'availability'), 'Do not invent availability or shipping metadata.');
    if (pathname !== '/workbooks') {
      assert.ok(!types.some(type => commerce.has(type)), 'Commerce structured data is restricted to /workbooks.');
      assert.ok(!Object.hasOwn(value, 'offers'), 'Commerce offers are restricted to /workbooks.');
    } else {
      assert.ok(!types.includes('ProductGroup') && !types.includes('AggregateOffer'), 'Only the two individual live products may have offers.');
      if (types.includes('Product')) assert.ok(graph.includes(value), 'Products must be the two explicit top-level product nodes.');
      if (types.includes('Offer')) assert.ok(parentKey === 'offers' && productParent, 'Offers must belong directly to a live product.');
      if (Object.hasOwn(value, 'offers')) assert.ok(types.includes('Product'), 'Untyped or non-product offers are not allowed.');
    }
    Object.entries(value).forEach(([key, item]) => visit(item, key, types.includes('Product')));
  };
  visit(data);
  const ids = graph.map(node => node['@id']);
  assert.ok(ids.every(id => typeof id === 'string' && id.startsWith('https://everydaygutwellness.com/')), 'Schema identifiers must use the canonical origin.');
  assert.equal(new Set(ids).size, ids.length, 'Top-level schema IDs must be unique.');
  const canonical = `https://everydaygutwellness.com${pathname}`;
  for (const page of graph.filter(node => typesOf(node).some(type => ['Article', 'MedicalWebPage'].includes(type)))) {
    assert.equal(page.url, canonical, 'Editorial schema URL must match this route.');
    assert.ok(page.headline && page.description && /^\d{4}-\d{2}-\d{2}$/.test(page.dateModified), 'Editorial pages need a headline, description and revision date.');
    assert.equal(page.author?.['@type'], 'Person');
    assert.equal(page.author.name, 'Mark Laurence E. Medina');
    assert.equal(page.author.jobTitle, 'Independent Health Educator and Research Curator');
    assert.equal(new URL(page.image).origin, 'https://everydaygutwellness.com');
  }
  if (pathname === '/') {
    const faq = graph.find(node => typesOf(node).includes('FAQPage'));
    assert.equal(faq.mainEntity?.length, 4, 'Expected four visible home-page FAQs.');
    faq.mainEntity.forEach(item => {
      assert.deepEqual(typesOf(item), ['Question']);
      assert.ok(typeof item.name === 'string' && item.name.length > 0);
      assert.deepEqual(typesOf(item.acceptedAnswer), ['Answer']);
      assert.ok(typeof item.acceptedAnswer.text === 'string' && item.acceptedAnswer.text.length > 0);
    });
    const knownIds = new Set(ids);
    for (const page of graph) {
      for (const key of ['publisher', 'isPartOf']) {
        if (page[key]?.['@id']) assert.ok(knownIds.has(page[key]['@id']), 'Home graph references must resolve to a defined entity.');
      }
    }
  } else {
    const breadcrumb = graph.find(node => typesOf(node).includes('BreadcrumbList'));
    assert.equal(breadcrumb.itemListElement?.length, 2, 'Expected Home and current-page breadcrumb entries.');
    assert.deepEqual(breadcrumb.itemListElement.map(item => item.position), [1, 2]);
    assert.equal(breadcrumb.itemListElement[0].item, 'https://everydaygutwellness.com/');
    assert.equal(breadcrumb.itemListElement[1].item, `https://everydaygutwellness.com${pathname}`);
  }
  if (pathname === '/workbooks') {
    for (const expected of products) {
      const product = graph.find(node => node.name === expected.name);
      assert.ok(product && typesOf(product).includes('Product'), `Missing live product: ${expected.name}`);
      assert.ok(product.description && typeof product.image === 'string' && new URL(product.image).protocol === 'https:');
      assert.deepEqual(typesOf(product.offers), ['Offer']);
      assert.equal(product.offers.priceCurrency, 'USD');
      assert.equal(Number(product.offers.price), expected.price, 'Offer price must match the visible live product.');
      assert.equal(product.offers.url, expected.url);
      assert.equal(product.url, expected.url);
    }
  }
  return data;
}

export function readRouteSchema(html, pathname = '/') {
  const blocks = [...html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.equal(blocks.length, 1, 'Expected exactly one route JSON-LD script.');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  assert.ok(head.includes(blocks[0][0]), 'Route JSON-LD must be rendered in the initial head.');
  return validateRouteSchema(JSON.parse(blocks[0][1]), pathname);
}

export const validateEditorialSchema = validateRouteSchema;
export const readEditorialSchema = readRouteSchema;
