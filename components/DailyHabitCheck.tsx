import React, { useState } from 'react';
import { Check, ArrowRight, RotateCcw } from 'lucide-react';
import { HABIT_QUESTIONS } from '../constants';
import { habitResult, type HabitAnswers, type HabitId } from '../lib/habit-check';

export default function DailyHabitCheck() {
  const [answers, setAnswers] = useState<HabitAnswers>({});
  const result = habitResult(answers);
  const answered = Object.keys(answers).length;
  return <section id="daily-check" className="section-space scroll-mt-24 bg-[#F3EFE6] border-y border-[#E5DFD5]" aria-labelledby="habit-heading">
    <div className="page-width">
      <div className="max-w-3xl mb-8"><p className="eyebrow">60 seconds to choose a practical next step</p><h2 id="habit-heading" className="section-heading mt-3">The Daily Habit Check</h2><p className="mt-5 text-[#635F57] leading-relaxed">Reflect on three everyday habits, then choose one small step. Your answers stay in this page; they are not sent to our email system or stored in your browser.</p><p className="mt-3 text-xs text-[#635F57]">Educational self-reflection only. This is not a clinical diagnosis, symptom assessment, or medical test.</p></div>
      <div className="flex justify-between items-center gap-4 mb-5 text-xs text-[#635F57]"><span aria-live="polite">{answered} of 3 questions answered</span><button type="button" onClick={() => setAnswers({})} className="inline-flex items-center gap-1.5 underline underline-offset-4 p-2"><RotateCcw size={13} aria-hidden="true" />Reset answers</button></div>
      <div className="grid lg:grid-cols-3 gap-5">{HABIT_QUESTIONS.map((question, index) => <fieldset key={question.id} className="min-w-0 border border-[#D5CFC5] rounded-2xl bg-white p-5 sm:p-6">
        <legend className="sr-only">{question.question}</legend><p className="eyebrow">Question 0{index + 1}</p><h3 className="mt-4 text-xl leading-snug font-serif text-[#14382B]">{question.question}</h3>
        <details className="mt-3 text-xs text-[#635F57]"><summary className="cursor-pointer underline underline-offset-4">Why this matters</summary><p className="mt-3 leading-relaxed">{question.whyItMatters}</p></details>
        <div className="space-y-3 mt-5">{question.options.map((option, optionIndex) => <label key={option.label} className={'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors ' + (answers[question.id as HabitId] === optionIndex ? 'border-[#14382B] bg-[#EAF1ED]' : 'border-[#E5DFD5] hover:border-[#14382B]/50')}>
          <input type="radio" name={question.id} value={optionIndex} checked={answers[question.id as HabitId] === optionIndex} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: optionIndex }))} className="mt-1 accent-[#14382B] shrink-0" />
          <span><span className="block font-medium text-[#14382B]">{option.label}</span><span className="mt-1 block text-xs leading-relaxed text-[#635F57]">{option.description}</span></span>
        </label>)}</div>
      </fieldset>)}</div>
      <div aria-live="polite" aria-atomic="true" className="mt-6">{result ? <>
        <div className="rounded-2xl border border-[#14382B]/20 bg-white p-6 sm:p-8" data-testid="habit-result"><p className="eyebrow flex gap-2 items-center"><Check size={15} aria-hidden="true" />Your next-step summary</p><h3 className="text-2xl sm:text-3xl font-serif text-[#14382B] mt-3">{result.title}</h3><p className="text-sm text-[#4A463F] leading-relaxed mt-4 max-w-3xl">{result.guidance}</p><a href={result.guideHref} className="inline-flex gap-2 items-center mt-5 text-sm font-semibold underline underline-offset-4 text-[#14382B]">{result.guideLabel}<ArrowRight size={15} aria-hidden="true" /></a><p className="mt-4 text-xs text-[#635F57]">Based only on the habits you selected, not your symptoms. Persistent or concerning changes deserve <a href="/when-to-seek-care" className="underline">medical advice</a>.</p></div>
        <aside className="mt-4 p-6 sm:p-8 rounded-2xl bg-[#14382B] text-[#FBF9F5] grid sm:grid-cols-[1fr_auto] gap-5 items-center" data-testid="habit-workbook-callout"><div><p className="text-[11px] uppercase tracking-widest text-[#EAD3C7] font-semibold">An optional tool for this next step</p><h3 className="text-2xl font-serif mt-3">{result.productTitle} · ${result.price}</h3><p className="mt-3 text-sm leading-relaxed max-w-2xl text-[#EAF1ED]">{result.productReason}</p><p className="mt-2 text-xs text-[#EAF1ED]">Your free guidance remains available without buying. Educational planning, not treatment.</p></div><a href={result.productHref} className="button-light">Preview before deciding<ArrowRight size={16} aria-hidden="true" /></a></aside>
      </> : <p className="text-sm rounded-xl border border-dashed border-[#D5CFC5] p-5 text-[#635F57]">Answer all three questions to see your next-step summary and an optional matching workbook.</p>}</div>
    </div>
  </section>;
}
