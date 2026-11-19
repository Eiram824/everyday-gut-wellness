/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import guides from '../content/guides-index.json';

type GuideLink = { href: string; title: string; summary: string; minutes: number };

/**
 * Homepage links to the static guide pages built by scripts/build-pages.mjs.
 * Real <a href> links so search engines can follow them (internal linking).
 */
export const GuidesTeaser: React.FC = () => {
  const list = (guides as GuideLink[]).slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section id="guides" aria-labelledby="guides-title" className="scroll-mt-24 border-b border-[#E5DFD5] bg-[#FBF9F5] py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-wider text-[#A3502C]">Guides</p>
        <h2 id="guides-title" className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#14382B]">
          Go deeper with our everyday guides
        </h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {list.map((g) => (
            <li key={g.href} className="rounded-xl border border-[#E5DFD5] bg-white p-5 shadow-sm">
              <a href={g.href} className="font-serif text-lg font-bold text-[#14382B] hover:text-[#A3502C] underline-offset-4 hover:underline">
                {g.title}
              </a>
              <p className="mt-2 text-sm leading-relaxed text-[#635F57]">{g.summary}</p>
              <p className="mt-3 text-xs text-[#6F6A62]">{g.minutes} min read</p>
            </li>
          ))}
        </ul>
        <a href="/guides/" className="mt-8 inline-block text-sm font-semibold text-[#14382B] underline underline-offset-4 hover:text-[#A3502C]">
          See all guides
        </a>
      </div>
    </section>
  );
};

export default GuidesTeaser;
