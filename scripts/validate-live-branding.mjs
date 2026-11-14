import assert from 'node:assert/strict';

// Run after a production release. Netlify injects branding after our build.
const origin = 'https://everydaygutwellness.com';
const paths = ['/', '/privacy.html', '/terms.html', '/contact.html', '/editorial-standards.html'];
const results = [];
for (const path of paths) {
  const response = await fetch(origin + path, {
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  const html = await response.text();
  assert.equal(response.status, 200, path + ' must remain publicly available.');
  assert.match(response.headers.get('content-type') || '', /text\/html/i);
  assert.doesNotMatch(html, /\/\.netlify\/scripts\/hud\b/i, path + ' contains the platform badge loader.');
  assert.doesNotMatch(html, /\bnl-badge(?:-frame)?\b|powered\s+by\s+netlify/i, path + ' contains Netlify branding.');
  results.push({ path, status: response.status, badgeLoader: false, badgeMarkup: false });
}
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), origin, passed: true, results }, null, 2));
