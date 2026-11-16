import React from 'react';
import { FAQ_ITEMS, REFERENCES } from '../lib/editorial-content';

export function CoreFaq() {
  return <section id="faq" aria-labelledby="faq-heading" className="section-space border-y border-[#E5DFD5] bg-[#F3EFE6]">
    <div className="page-width max-w-4xl">
      <p className="eyebrow">A little clarity before your next step</p>
      <h2 id="faq-heading" className="section-heading mt-3 mb-8">Frequently Asked Questions</h2>
      <div className="space-y-3">{FAQ_ITEMS.map((item, index) => <details key={item.question} open={index === 0} className="rounded-xl border border-[#E5DFD5] bg-white p-5 sm:p-6">
        <summary className="cursor-pointer font-semibold text-[#14382B]">{item.question}</summary>
        <p className="mt-3 leading-relaxed text-sm text-[#4A463F]">{item.answer}</p>
        {index === 3 && <a href="/when-to-seek-care" className="text-sm underline text-[#14382B] mt-3 inline-block">Read the warning-sign guide</a>}
      </details>)}</div>
      <a href="/when-to-seek-care#scientific-references" className="text-sm underline mt-6 inline-block">Check the scientific references behind these answers</a>
    </div>
  </section>;
}

export function ScientificReferences() {
  return <section id="scientific-references" className="section-space bg-[#F3EFE6] border-y border-[#E5DFD5]" aria-labelledby="research-heading">
    <div className="page-width max-w-4xl space-y-8">
      <div><p className="eyebrow">Read the sources. Keep the context.</p><h2 id="research-heading" className="section-heading mt-3">Editorial &amp; Research Standards</h2>
        <p className="mt-5 text-[#635F57] leading-relaxed">This is an independent educational guide, not a clinical publication. We preserve general health information, link readers to public evidence and health guidance, and avoid treating population findings as personal diagnoses. These sources support context about fiber, fluids, and variation in bowel habits; they do not validate every recommendation or promise an outcome.</p></div>
      <div className="rounded-2xl bg-white border border-[#E5DFD5] p-6 sm:p-8"><h3 className="text-2xl font-serif text-[#14382B] mb-6">Scientific references</h3>
        <ol className="list-decimal pl-5 space-y-5 text-sm leading-relaxed">{REFERENCES.map(ref => <li key={ref.url}><a href={ref.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#14382B] underline underline-offset-2">{ref.label}</a><p className="mt-1 text-[#635F57]">{ref.note}</p></li>)}</ol>
        <p className="mt-6 text-xs text-[#635F57]">Sources are provided for reader verification. This page is not a substitute for individualized medical advice.</p>
      </div>
    </div>
  </section>;
}

export const ResearchAndFaq = () => <><ScientificReferences /><CoreFaq /></>;
export default ResearchAndFaq;
