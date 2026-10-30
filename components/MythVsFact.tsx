/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MYTH_FACT_ITEMS } from '../constants';
import { XCircle, CheckCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export const MythVsFact: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('detox-myth');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="myths" className="scroll-mt-24 py-20 md:py-28 bg-[#F3EFE6] border-b border-[#E5DFD5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B85D36]">
            Digestive Misconceptions
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#14382B] tracking-tight [text-wrap:balance]">
            Myth vs. Fact: Understanding Common Digestive Claims
          </h2>
          <p className="text-base sm:text-lg text-[#635F57] leading-relaxed">
            Everyday digestive wellness is best guided by biological principles rather than commercial trends. Here is a balanced look at common misconceptions.
          </p>
        </div>

        {/* Myth vs Fact Items */}
        <div className="space-y-6">
          {MYTH_FACT_ITEMS.map((item, index) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E5DFD5] overflow-hidden shadow-sm transition-all"
              >
                {/* Clickable Header Strip */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="w-full text-left p-6 sm:p-8 flex items-start justify-between gap-4 hover:bg-[#FBF9F5] transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B85D36]">
                      <span>Misconception 0{index + 1}</span>
                      <span aria-hidden="true" className="text-[#8C877D]">·</span>
                      <span className="text-[#635F57]">Evidence Check</span>
                    </div>

                    {/* The Myth Statement */}
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-[#F8EFEA] text-[#B85D36] shrink-0 mt-0.5">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#B85D36] uppercase tracking-wide block mb-0.5">
                          Myth
                        </span>
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2C2A26] leading-snug">
                          "{item.myth}"
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F3EFE6] text-[#14382B] shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Expanded Fact and Detailed Science */}
                {isExpanded && (
                  <div className="px-6 pb-8 sm:px-8 border-t border-[#E5DFD5]/80 bg-white space-y-6 pt-6 animate-in fade-in duration-200">
                    {/* The Fact */}
                    <div className="flex items-start gap-3 bg-[#EAF1ED] p-4 sm:p-5 rounded-xl border border-[#14382B]/20">
                      <div className="p-1 rounded bg-white text-[#14382B] shrink-0 mt-0.5">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#14382B] uppercase tracking-wider block mb-1">
                          The Evidence-Informed Reality
                        </span>
                        <p className="text-sm sm:text-base font-semibold text-[#14382B] leading-snug">
                          {item.fact}
                        </p>
                      </div>
                    </div>

                    {/* Full Explanation */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#635F57]">
                        Physiological Context
                      </h4>
                      <p className="text-sm text-[#4A463F] leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>

                    {/* Educational Note */}
                    <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5] text-xs text-[#635F57] flex items-start gap-3">
                      <BookOpen className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#14382B] font-semibold">Educational Note: </strong>
                        <span>{item.scienceNote}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default MythVsFact;
