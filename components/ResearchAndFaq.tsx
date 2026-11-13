import React from 'react';

const references = [
  {
    label: 'National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK). Eating, Diet, & Nutrition for Constipation.',
    url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition',
    note: 'General information on dietary fiber, adding fiber gradually, and fluids. Individual needs vary.',
  },
  {
    label: 'Van der Schoot A, et al. The Effect of Fiber Supplementation on Chronic Constipation in Adults: An Updated Systematic Review and Meta-Analysis of Randomized Controlled Trials. American Journal of Clinical Nutrition. 2022.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35816465/',
    note: 'A review of trials that found effects differed by fiber and treatment conditions; the authors noted heterogeneity and potential side effects such as flatulence.',
  },
  {
    label: 'Mitsuhashi S, et al. Characterizing Normal Bowel Frequency and Consistency in a Representative Sample of Adults in the United States (NHANES). American Journal of Gastroenterology. 2018.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28762379/',
    note: 'A population study of self-reported bowel habits; it is context for variation, not a diagnostic rule for an individual.',
  },
];

export const ResearchAndFaq: React.FC = () => (
  <section id="research-and-faq" aria-labelledby="research-heading" className="py-20 md:py-24 bg-[#F3EFE6] border-b border-[#E5DFD5]">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#B85D36]">Editorial transparency</p>
        <h2 id="research-heading" className="text-3xl sm:text-4xl font-serif font-bold text-[#14382B] tracking-tight">Editorial &amp; Research Standards</h2>
        <p className="text-base sm:text-lg text-[#635F57] leading-relaxed">
          This is an independent educational guide, not a clinical publication. We preserve the article as general information, link readers to public evidence and health guidance, and avoid treating population findings as personal diagnoses. The listed sources support general context about fiber, fluid, and variation in bowel habits; they do not validate every recommendation or promise an outcome.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 space-y-5">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#14382B]">Scientific references</h3>
        <ol className="space-y-5 list-decimal list-inside text-sm text-[#4A463F]">
          {references.map((reference) => (
            <li key={reference.url} className="leading-relaxed">
              <a href={reference.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#14382B] underline underline-offset-2">{reference.label}</a>
              <p className="mt-1 ml-5 text-[#635F57]">{reference.note}</p>
            </li>
          ))}
        </ol>
        <p className="text-xs text-[#635F57]">Sources are provided for reader verification. This page is not a substitute for individualized medical advice.</p>
      </div>

      <div id="faq" className="space-y-6">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-serif font-bold text-[#14382B]">Frequently Asked Questions</h2>
          <p className="text-sm text-[#635F57]">General answers drawn from the guide and linked sources.</p>
        </div>
        <div className="grid gap-4">
          <details className="bg-white rounded-xl border border-[#E5DFD5] p-5" open>
            <summary className="font-semibold text-[#14382B] cursor-pointer">How much fiber do adults generally need?</summary>
            <p className="mt-3 text-sm leading-relaxed text-[#4A463F]">NIDDK gives a general range of 22 to 34 grams per day for adults, depending on age and sex. Needs differ, so use this as broad context and ask a qualified health professional for personal guidance. Increase fiber a little at a time.</p>
          </details>
          <details className="bg-white rounded-xl border border-[#E5DFD5] p-5">
            <summary className="font-semibold text-[#14382B] cursor-pointer">Does everyone need a bowel movement every day?</summary>
            <p className="mt-3 text-sm leading-relaxed text-[#4A463F]">No single daily schedule describes everyone. In one representative U.S. study, most adults who described their bowel habits as normal reported 3 to 21 bowel movements per week. That population result is not a personal diagnostic threshold; a persistent change or concerning symptoms deserves medical advice.</p>
          </details>
          <details className="bg-white rounded-xl border border-[#E5DFD5] p-5">
            <summary className="font-semibold text-[#14382B] cursor-pointer">Can increasing fiber cause gas or bloating?</summary>
            <p className="mt-3 text-sm leading-relaxed text-[#4A463F]">It can. Clinical trials and reviews report that responses and side effects vary by fiber type and person. Gradual changes may be easier to tolerate; persistent or severe symptoms should be discussed with a healthcare professional.</p>
          </details>
          <details className="bg-white rounded-xl border border-[#E5DFD5] p-5">
            <summary className="font-semibold text-[#14382B] cursor-pointer">When should I seek medical advice?</summary>
            <p className="mt-3 text-sm leading-relaxed text-[#4A463F]">Seek medical care for severe, worsening, persistent, or recurring digestive symptoms, and use the warning-sign guidance above for urgent concerns. Do not use this educational page to diagnose or treat yourself.</p>
          </details>
        </div>
      </div>
    </div>
  </section>
);

export default ResearchAndFaq;
