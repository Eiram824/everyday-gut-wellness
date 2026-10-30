/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDown, Clock, BookOpen, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onJumpToReset: () => void;
  onOpenEBook?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onJumpToReset, onOpenEBook }) => {
  return (
    <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#E5DFD5] overflow-hidden">
      {/* Background Subtle Wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F3EFE6]/60 via-[#FBF9F5] to-[#FBF9F5] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Editorial Kicker */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#B85D36] mb-4">
          <span>Digestive Health Guide</span>
          <span aria-hidden="true" className="text-[#8C877D]">·</span>
          <span className="text-[#635F57]">Evidence-Informed</span>
          <span aria-hidden="true" className="text-[#8C877D]">·</span>
          <span className="text-[#635F57]">US Dietary Standards</span>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Main Copy Column */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-serif font-bold text-[#14382B] leading-[1.15] tracking-tight [text-wrap:balance]">
              Your Gut Has a Routine. Are Your Daily Habits Working With It?
            </h1>

            <p className="text-lg sm:text-xl text-[#4A463F] leading-relaxed max-w-2xl font-light">
              A practical guide to fiber, fluids, movement, and the small daily choices that can influence bowel regularity.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={onOpenEBook || onExplore}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#14382B] hover:bg-[#0E281E] text-white text-sm font-semibold tracking-wide rounded shadow-sm hover:shadow transition-all group"
              >
                <BookOpen className="w-4 h-4 text-emerald-300" />
                <span>Read Free 7-Day Reset eBook</span>
              </button>

              <button
                type="button"
                onClick={onExplore}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent hover:bg-[#E5DFD5]/40 text-[#14382B] border border-[#14382B]/30 text-sm font-medium rounded transition-all"
              >
                <span>Explore the Guide</span>
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </button>
            </div>

            {/* Editorial Reassurance Markers */}
            <div className="pt-6 border-t border-[#E5DFD5]/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#635F57]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#14382B]" />
                <span>Zero miracle claims or detox promises</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#14382B]" />
                <span>Physiology-grounded lifestyle guidance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#14382B]" />
                <span>8 min practical read</span>
              </div>
            </div>
          </div>

          {/* Visual Editorial Feature Column */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-[#F3EFE6] p-6 sm:p-8 border border-[#E5DFD5] shadow-sm space-y-6">
              {/* Natural Nutrition Focus Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#14382B]">
                    Everyday Regularity Pillars
                  </span>
                  <span className="text-xs text-[#8C877D]">Gastrointestinal Rhythms</span>
                </div>

                {/* 3 Pillar Summary Box */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-lg border border-[#E5DFD5]/60">
                    <div className="w-7 h-7 rounded bg-[#EAF1ED] text-[#14382B] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#14382B]">Diverse Fiber Matrix</h4>
                      <p className="text-xs text-[#635F57] mt-0.5 leading-relaxed">
                        Soluble fibers (which can form a gel) and insoluble bulk work together to support comfortable transit.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-lg border border-[#E5DFD5]/60">
                    <div className="w-7 h-7 rounded bg-[#EAF1ED] text-[#14382B] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#14382B]">Proactive Fluid Hydration</h4>
                      <p className="text-xs text-[#635F57] mt-0.5 leading-relaxed">
                        Adequate water helps maintain stool hydration so that dietary fiber can work effectively.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-lg border border-[#E5DFD5]/60">
                    <div className="w-7 h-7 rounded bg-[#EAF1ED] text-[#14382B] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#14382B]">The Gastrocolic Window</h4>
                      <p className="text-xs text-[#635F57] mt-0.5 leading-relaxed">
                        Allowing calm time after meals supports the body's natural gastrocolic reflex without strain.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center text-xs text-[#8C877D] italic">
                  Healthy bowel frequency naturally ranges from 3 times a day to 3 times a week.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
