/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ROUTINE_CHECKLIST } from '../constants';
import { Check, RotateCcw, Clock, ShieldCheck, Heart, Footprints } from 'lucide-react';

export const RoutineReset: React.FC = () => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({
    'morning-fluid': true,
    'unhurried-time': false,
  });

  const toggleItem = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReset = () => {
    setCompletedItems({});
  };

  const totalCount = ROUTINE_CHECKLIST.length;
  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <section id="routine-reset" className="scroll-mt-24 py-20 md:py-28 bg-[#FBF9F5] border-b border-[#E5DFD5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B85D36]">
            Everyday Rhythms
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#14382B] tracking-tight [text-wrap:balance]">
            The Routine Reset: A Realistic Daily Rhythm
          </h2>
          <p className="text-base sm:text-lg text-[#635F57] leading-relaxed">
            Your colon possesses an internal circadian rhythm that works best with predictability. Here is a realistic daily structure covering meals, fluids, movement, and honoring the natural urge.
          </p>
        </div>

        {/* Non-Rigid Editorial Guidance Box */}
        <div className="bg-[#EAF1ED] border border-[#14382B]/20 rounded-2xl p-6 sm:p-7 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#14382B] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#14382B]" />
              <span>A Note on Human Individuality</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#4A463F] leading-relaxed">
              We avoid rigid clocks, quick-fix guarantees, or miracle timetables. Digestion is deeply individual. A normal frequency can be 3 times per day or 3 times per week, so long as transit is comfortable, soft, and unforced.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#14382B] bg-white border border-[#14382B]/30 rounded-lg hover:bg-[#FBF9F5] transition-colors shrink-0 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Checklist</span>
          </button>
        </div>

        {/* Interactive Progress Bar */}
        <div className="bg-white rounded-xl border border-[#E5DFD5] p-5 mb-8 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-[#635F57] mb-2">
            <span>Daily Rhythm Exploration</span>
            <span className="text-[#14382B] font-bold">{completedCount} of {totalCount} habits practiced ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-[#F3EFE6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#14382B] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Interactive Checklist Cards */}
        <div className="space-y-4">
          {ROUTINE_CHECKLIST.map((item) => {
            const isDone = Boolean(completedItems[item.id]);

            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-4 ${
                  isDone
                    ? 'bg-white border-[#14382B]/40 shadow-sm'
                    : 'bg-white border-[#E5DFD5] hover:border-[#14382B]/30 hover:bg-[#FBF9F5]'
                }`}
              >
                {/* Custom Checkbox */}
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isDone
                      ? 'bg-[#14382B] border-[#14382B] text-white'
                      : 'border-[#8C877D] bg-transparent'
                  }`}
                  aria-checked={isDone}
                  role="checkbox"
                >
                  {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-xs font-semibold text-[#B85D36] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.timeWindow}</span>
                    </span>
                    <span aria-hidden="true" className="text-[#E5DFD5]">·</span>
                    <h4 className={`text-base font-semibold ${isDone ? 'text-[#14382B]' : 'text-[#2C2A26]'}`}>
                      {item.title}
                    </h4>
                  </div>

                  <p className="text-sm text-[#4A463F] leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-1 text-xs text-[#635F57]">
                    <strong className="text-[#14382B] font-medium">Why it supports gut transit: </strong>
                    {item.whyItHelps}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* The Posture Footnote */}
        <div className="mt-12 bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
            <Footprints className="w-4 h-4 text-[#B85D36]" />
            <span>Ergonomics Note: The Squatting Angle</span>
          </div>
          <h4 className="text-lg font-serif font-bold text-[#14382B]">
            Why Elevating Your Knees Assists Elimination
          </h4>
          <p className="text-sm text-[#4A463F] leading-relaxed">
            In standard Western seated toilets, the puborectalis muscle remains partially hooked around the lower rectum, creating a kink that acts as a natural continence valve. Placing a small footstool beneath your feet elevates your knees slightly above hip level (~35° angle). This relaxes the puborectalis sling, straightening the anorectal canal and allowing stool to pass smoothly with zero straining.
          </p>
        </div>
      </div>
    </section>
  );
};
export default RoutineReset;
