import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeDomainRedirects } from '../scripts/prepare-domain-redirects.mjs';

test('withholds host redirects until DNS cutover and never redirects deploy previews', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'egw-domain-'));
  try {
    for (const environment of [{}, {CONTEXT:'production'}, {CONTEXT:'production',CUSTOM_DOMAIN_REDIRECTS_ENABLED:'false'}, {CONTEXT:'deploy-preview',CUSTOM_DOMAIN_REDIRECTS_ENABLED:'true'}]) {
      await writeDomainRedirects(directory, environment);
      assert.equal(await readFile(join(directory,'_redirects'),'utf8'),'');
    }
  } finally { await rm(directory, {recursive:true,force:true}); }
});

test('a production cutover preserves the old URL path without a custom-domain loop', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'egw-domain-'));
  try {
    await writeDomainRedirects(directory, {CONTEXT:'production',CUSTOM_DOMAIN_REDIRECTS_ENABLED:'true'});
    const rules = (await readFile(join(directory,'_redirects'),'utf8')).trim().split('\n');
    assert.equal(rules.length,1);
    const [from,to,status] = rules[0].split(/\s+/);
    assert.equal(new URL(from).hostname,'everyday-gut-wellness.netlify.app');
    assert.equal(new URL(to).hostname,'everydaygutwellness.com');
    assert.ok(from.endsWith('/*') && to.endsWith('/:splat'));
    assert.equal(status,'301!');
    assert.notEqual(new URL(from).hostname,new URL(to).hostname);
  } finally { await rm(directory, {recursive:true,force:true}); }
});
