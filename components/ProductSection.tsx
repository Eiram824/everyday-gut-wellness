/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, BookOpenCheck, CalendarDays, CheckCircle2, ShieldCheck } from 'lucide-react';
import { GUT_CLARITY_PRODUCT, GUT_ROUTINE_PLANNER_PRODUCT } from '../constants';

const productCards = [
  {
    ...GUT_CLARITY_PRODUCT,
    image: 'https://public-files.gumroad.com/m3o0mzdz54gzc3vt75c1suyecr7l',
    imageAlt: 'Cover of The 14-Day Gut Clarity Workbook',
    eyebrow: 'NOTICE & PREPARE',
    description: 'Capture observations and context, then turn scattered notes into a concise summary and useful questions for a healthcare conversation.',
    features: [
      '14 short daily observation logs',
      'Midpoint and final pattern reviews',
      'Appointment-prep checklist and one-page summary',
    ],
    format: '26-page printable US Letter PDF',
    action: 'Get the 14-day workbook',
    disclaimer: 'Educational use for adults. Not clinician-reviewed; it does not diagnose or treat.',
  },
  {
    ...GUT_ROUTINE_PLANNER_PRODUCT,
    image: 'https://public-files.gumroad.com/sk4wkyzpoyq5zicx3ym72y60verl',
    imageAlt: 'Cover of The 30-Day Gut Routine Planner',
    eyebrow: 'PLAN & PRACTICE',
    description: 'Choose one everyday routine, fit it to your real schedule, and make a smaller fallback for busy, travel, or low-energy days.',
    features: [
      'Four weekly Plan, Fit, Practice, and Review modules',
      'A 30-day check-off calendar with short check-ins',
      'Cue cards, fallback planning, and a next-month review',
    ],
    format: '31-page printable US Letter PDF',
    action: 'Get the 30-day planner',
    disclaimer: 'Educational routine planning for adults; not medical advice, diagnosis, or treatment.',
  },
];

const trackCheckout = (product: (typeof productCards)[number]) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: product.priceUSD,
      items: [{ item_id: product.id, item_name: product.title, price: product.priceUSD, quantity: 1 }],
    });
  }
};

interface ProductSectionProps {
  onJoinWaitlist?: () => void;
}

export const ProductSection: React.FC<ProductSectionProps> = () => (
  <section id="gut-clarity-workbook" aria-labelledby="workbooks-title" className="scroll-mt-24 border-b border-[#E5DFD5] bg-[#F3EFE6] py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#14382B]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#14382B]">
          <BookOpenCheck aria-hidden="true" className="h-4 w-4 text-[#B85D36]" />
          Practical tools, clear purpose
        </span>
        <h2 id="workbooks-title" className="font-serif text-3xl font-bold tracking-tight text-[#14382B] [text-wrap:balance] sm:text-4xl lg:text-5xl">
          Two workbooks. Two useful next steps.
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#635F57] sm:text-lg">
          Organize what you notice, or build one routine that can survive a changing week. Choose the workbook that matches what would help you today.
        </p>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        {productCards.map((product) => (
          <article key={product.id} aria-labelledby={`${product.id}-title`} className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[#14382B]/15 bg-white shadow-xl">
            <div className="overflow-hidden bg-[#14382B]">
              <img
                src={product.image}
                alt={product.imageAlt}
                width="1280"
                height="720"
                loading="lazy"
                className="block aspect-[16/9] w-full object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#B85D36]">{product.eyebrow}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14382B]/[0.07] px-3 py-1.5 text-xs font-semibold text-[#14382B]">
                  <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                  {product.format}
                </span>
              </div>

              <h3 id={`${product.id}-title`} className="mt-4 font-serif text-2xl font-bold leading-tight text-[#14382B] sm:text-3xl">
                {product.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#635F57]">{product.description}</p>

              <ul className="mt-6 space-y-3">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-[#4A463F]">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#14382B]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-start gap-2 rounded-2xl border border-[#E5DFD5] bg-[#F8F6F0] p-4 text-xs leading-relaxed text-[#635F57]">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#14382B]" />
                <p>{product.disclaimer} For personal concerns, follow guidance from a qualified healthcare professional.</p>
              </div>

              <div className="mt-auto pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {product.checkoutEnabled ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackCheckout(product)}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#B85D36] px-5 py-3 font-semibold text-white shadow-md transition-colors hover:bg-[#A04E2B] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B85D36]/30"
                    >
                      {product.action} · ${product.priceUSD}
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#14382B]/15 bg-[#F8F6F0] px-5 py-3 font-semibold text-[#14382B]" aria-live="polite">
                      Listing being prepared
                    </span>
                  )}
                  <span className="text-xs leading-relaxed text-[#8C877D]">Instant digital delivery handled by Gumroad.</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default ProductSection;

