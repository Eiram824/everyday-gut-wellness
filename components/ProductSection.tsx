/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, BookOpenCheck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { GUT_CLARITY_PRODUCT } from '../constants';

const workbookIncludes = [
  '14 short daily logs for symptoms, bowel patterns, meals, routines, sleep, and stress',
  'A midpoint check-in and a 14-day pattern review that avoid jumping to conclusions',
  'A one-change observation card and appointment-prep checklist',
  'A one-page summary to take to a healthcare professional',
];

export const ProductSection: React.FC = () => {
  const trackCheckout = () => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: GUT_CLARITY_PRODUCT.priceUSD,
        items: [{ item_id: GUT_CLARITY_PRODUCT.id, item_name: GUT_CLARITY_PRODUCT.title, price: GUT_CLARITY_PRODUCT.priceUSD, quantity: 1 }],
      });
    }
  };

  return (
    <section id="gut-clarity-workbook" aria-labelledby="gut-clarity-title" className="scroll-mt-24 border-b border-[#E5DFD5] bg-[#F3EFE6] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#14382B]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#14382B]">
            <BookOpenCheck aria-hidden="true" className="h-4 w-4 text-[#B85D36]" />
            The practical next step
          </span>
          <h2 id="gut-clarity-title" className="font-serif text-3xl font-bold tracking-tight text-[#14382B] [text-wrap:balance] sm:text-4xl lg:text-5xl">
            The 14-Day Gut Clarity Workbook
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#635F57] sm:text-lg">
            When symptoms are hard to explain, scattered notes and conflicting advice can make the next step feel unclear. Use one calm, structured record to prepare a more useful conversation with your clinician.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-[#14382B]/15 bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex min-h-[360px] flex-col justify-between bg-[#14382B] p-8 text-white sm:p-10">
            <div>
              <div className="mx-auto mb-7 max-w-[300px] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
                <img
                  src="/assets/images/gut-clarity-thumbnail.png"
                  alt="Cover of The 14-Day Gut Clarity Workbook"
                  width="800"
                  height="800"
                  loading="lazy"
                  className="block h-auto w-full"
                />
              </div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#EAD3C7]">A guided observation process</p>
              <h3 className="max-w-sm font-serif text-3xl font-bold leading-tight sm:text-4xl">Turn notes into a clearer record.</h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
                Notice what repeats, note what changed, and bring a concise summary to an appointment. The workbook helps organize observations; it does not diagnose their cause.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-white/85">
              <span className="rounded-full border border-white/20 px-3 py-1.5">14 days</span>
              <span className="rounded-full border border-white/20 px-3 py-1.5">26 printable pages</span>
              <span className="rounded-full border border-white/20 px-3 py-1.5">US Letter PDF</span>
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B85D36]">Inside the workbook</p>
            <ul className="mt-5 space-y-4">
              {workbookIncludes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-[#4A463F]">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#14382B]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-2xl border border-[#E5DFD5] bg-[#F8F6F0] p-4 text-xs leading-relaxed text-[#635F57]">
              <div className="flex items-start gap-2">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#14382B]" />
                <p><strong className="text-[#14382B]">Responsible by design.</strong> No restrictive diet, calorie tracking, supplement protocol, or cure claims. Includes safety guidance and public health references.</p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={GUT_CLARITY_PRODUCT.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackCheckout}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#B85D36] px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-[#A04E2B] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B85D36]/30"
              >
                Get the workbook · $25
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <span className="text-xs leading-relaxed text-[#8C877D]">Secure checkout and instant file delivery by Gumroad.</span>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-[#8C877D]">
              Educational use for adults only; not medical advice, diagnosis, or treatment. The workbook is not clinician-reviewed. For urgent, severe, or worsening symptoms, seek medical care.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
