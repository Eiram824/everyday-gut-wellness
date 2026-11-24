/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import articles from '../content/comfort-index.json';

type ComfortLink = { href: string; title: string; summary: string; minutes: number };

/**
 * Homepage links to the Belly Comfort section (/comfort/): period cramps,
 * bloating, heat and castor oil packs. Built by scripts/build-pages.mjs.
 * Kept separate from the everyday digestive guides so the core niche stays focused.
 */
export const ComfortTeaser: React.FC = () => {
  const list = (articles as ComfortLink[]).slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section id="comfort" aria-labelledby="comfort-title" className="scroll-mt-24 border-b border-[#E5DFD5] bg-[#F8EFEA] py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-wider text-[#A3502C]">Belly Comfort</p>
        <h2 id="comfort-title" className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#14382B]">
          Cramps, bloating and an uncomfortable belly
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#4A463F]">
          Calm, evidence-informed help for the days your belly needs extra care: what actually helps at home, how to use heat safely, and when to see a doctor.
        </p>
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
        <a href="/comfort/" className="mt-8 inline-block text-sm font-semibold text-[#14382B] underline underline-offset-4 hover:text-[#A3502C]">
          See all belly comfort guides
        </a>
      </div>
    </section>
  );
};

export default ComfortTeaser;
