/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HABIT_QUESTIONS } from '../constants';
import { Check, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

export const DailyHabitCheck: React.FC = () => {
  // Store selected option index for each question
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({
    'fiber-variety': 1,
    'fluid-intake': 1,
    'bathroom-routine': 0,
  });

  const handleSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  return (
    <section id="daily-check" className="scroll-mt-24 py-20 md:py-28 bg-[#FBF9F5] border-b border-[#E5DFD5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B85D36]">
            Self-Reflection & Awareness
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#14382B] tracking-tight [text-wrap:balance]">
            The Daily Habit Check
          </h2>
          <p className="text-base sm:text-lg text-[#635F57] leading-relaxed">
            Digestive rhythm isn’t a mystery; it is largely built on how your daily choices intersect with human physiology. Reflect on these three fundamental questions to see how your current environment supports your natural motility.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F3EFE6] border border-[#E5DFD5] rounded text-xs text-[#635F57]">
            <HelpCircle className="w-3.5 h-3.5 text-[#14382B]" />
            <span>Educational self-reflection only — not a clinical diagnosis or medical test.</span>
          </div>
        </div>

        {/* 3 Questions Detailed Container */}
        <div className="space-y-12">
          {HABIT_QUESTIONS.map((item, qIndex) => {
            const currentSelection = selectedAnswers[item.id] ?? 0;
            const activeOption = item.options[currentSelection];

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 md:p-10 shadow-sm transition-all"
              >
                {/* Question Header & Rationale */}
                <div className="border-b border-[#E5DFD5] pb-6 mb-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#B85D36] uppercase tracking-wider mb-2">
                    <span>Question 0{qIndex + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span>Physiological Foundation</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#14382B] mb-3">
                    {item.question}
                  </h3>
                  <div className="bg-[#F8EFEA]/60 p-4 rounded-xl border border-[#EAD3C7]/60">
                    <p className="text-sm text-[#4A463F] leading-relaxed">
                      <strong className="text-[#14382B] font-semibold">Why this matters: </strong>
                      {item.whyItMatters}
                    </p>
                  </div>
                </div>

                {/* Interactive Options */}
                <div className="space-y-3 mb-6">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#635F57] mb-2">
                    Where does your routine lean right now?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {item.options.map((opt, optIndex) => {
                      const isSelected = currentSelection === optIndex;
                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelect(item.id, optIndex)}
                          className={`text-left p-4 rounded-xl border transition-all text-sm flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#EAF1ED] border-[#14382B] text-[#14382B] shadow-sm ring-1 ring-[#14382B]'
                              : 'bg-[#FBF9F5] border-[#E5DFD5] text-[#4A463F] hover:border-[#14382B]/40 hover:bg-[#F3EFE6]'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-sm mb-1 flex items-center justify-between">
                              <span>{opt.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#14382B] shrink-0" />}
                            </div>
                            <p className="text-xs text-[#635F57] leading-normal">{opt.description}</p>
                          </div>
                          <span className="text-[11px] font-medium mt-3 text-[#14382B]/80 uppercase tracking-wide">
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tailored Educational Guidance Output */}
                <div className="bg-[#FBF9F5] rounded-xl p-5 border border-[#E5DFD5] flex items-start gap-3.5">
                  <div className="p-2 rounded bg-white border border-[#E5DFD5] text-[#14382B] shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-[#B85D36]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#14382B] mb-1">
                      Evidence-Informed Everyday Insight
                    </h4>
                    <p className="text-sm text-[#4A463F] leading-relaxed">
                      {activeOption.guidance}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default DailyHabitCheck;
