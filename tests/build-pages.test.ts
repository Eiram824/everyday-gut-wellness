/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("Static pages and guides (scripts/build-pages.mjs)", () => {
  const guides = fs.readdirSync(path.join(root, "content/guides")).filter((f) => f.endsWith(".html"));

  before(() => {
    execFileSync(process.execPath, ["scripts/build-pages.mjs"], { cwd: root, stdio: "pipe" });
  });

  it("builds every guide with canonical URL, Article schema, disclaimer and consent loader", () => {
    assert.ok(guides.length >= 3);
    for (const file of guides) {
      const slug = file.replace(/\.html$/, "");
      const html = read(`public/guides/${slug}.html`);
      assert.ok(html.includes(`<link rel="canonical" href="https://everydaygutwellness.com/guides/${slug}" />`), slug);
      assert.ok(html.includes('"@type":"Article"'), slug);
      assert.ok(html.includes('"@type":"BreadcrumbList"'), slug);
      assert.ok(html.includes("not medical advice"), slug);
      assert.ok(html.includes('id="when-to-see-a-doctor"'), slug);
      assert.ok(html.includes('<script src="/consent.js"></script>'), slug);
      assert.equal((html.match(/<h1>/g) || []).length, 1, `${slug} has exactly one h1`);
    }
  });

  it("lists all guides in the sitemap and guides index, and keeps 404 out of the sitemap", () => {
    const sitemap = read("public/sitemap.xml");
    const index = read("public/guides/index.html");
    for (const file of guides) {
      const slug = file.replace(/\.html$/, "");
      assert.ok(sitemap.includes(`<loc>https://everydaygutwellness.com/guides/${slug}</loc>`), slug);
      assert.ok(index.includes(`href="/guides/${slug}"`), slug);
    }
    assert.ok(sitemap.includes("<loc>https://everydaygutwellness.com/guides/</loc>"));
    assert.ok(!sitemap.includes("404"));
    assert.ok(read("public/404.html").includes('content="noindex, follow"'));
  });

  it("has no internal links to guides that do not exist", () => {
    const slugs = new Set(guides.map((f) => f.replace(/\.html$/, "")));
    for (const file of guides) {
      for (const m of read(`content/guides/${file}`).matchAll(/href="\/guides\/([^"#/]+)"/g)) {
        assert.ok(slugs.has(m[1]), `${file} links to missing guide ${m[1]}`);
      }
    }
  });
});
