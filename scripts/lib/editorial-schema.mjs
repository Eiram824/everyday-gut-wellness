import assert from 'node:assert/strict';

const allowedPageTypes = new Set(['Article', 'MedicalWebPage', 'FAQPage']);
const commerceTypes = new Set(['Product', 'ProductGroup', 'Offer', 'AggregateOffer']);
const typesOf = node => (Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']])
  .filter(type => typeof type === 'string')
  .map(type => type.split(/[\/#:]/).pop());

export function validateEditorialSchema(data) {
  assert.equal(data?.['@context'], 'https://schema.org', 'Expected the Schema.org context.');
  assert.ok(Array.isArray(data['@graph']), 'Expected an editorial JSON-LD graph.');

  // Supporting author/publisher and FAQ Question/Answer metadata stays nested.
  // Commercial entities must never be introduced, including under an Article.
  const visit = value => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    assert.ok(!typesOf(value).some(type => commerceTypes.has(type)), 'Commerce structured data is not allowed on this editorial page.');
    assert.ok(!Object.hasOwn(value, 'offers'), 'Commerce offers are not allowed on this editorial page.');
    Object.values(value).forEach(visit);
  };
  visit(data);

  const graph = data['@graph'];
  assert.equal(graph.length, 2, 'Keep only the article/page and FAQPage as top-level schemas.');
  for (const node of graph) {
    const types = typesOf(node);
    assert.ok(types.length > 0 && types.every(type => allowedPageTypes.has(type)), 'Only Article/MedicalWebPage and FAQPage top-level schemas are allowed.');
  }
  assert.equal(graph.filter(node => typesOf(node).some(type => type === 'Article' || type === 'MedicalWebPage')).length, 1, 'Expected one editorial article/page schema.');
  assert.equal(graph.filter(node => typesOf(node).includes('FAQPage')).length, 1, 'Expected one FAQPage schema.');
  return data;
}

export function readEditorialSchema(html) {
  const blocks = [...html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.equal(blocks.length, 1, 'Expected exactly one editorial JSON-LD script.');
  return validateEditorialSchema(JSON.parse(blocks[0][1]));
}
