import React, { useCallback, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Check, Layers3, Sparkles } from 'lucide-react';
import { GUT_CLARITY_PRODUCT, GUT_ROUTINE_PLANNER_PRODUCT } from '../constants';
import { GUMROAD_BUNDLE_URL } from '../siteConfig';
import { ProductPreviewModal, type PreviewProduct } from './ProductPreviewModal';

const products = [
  {
    ...GUT_CLARITY_PRODUCT,
    preview: 'workbook' as const, image: '/assets/images/workbook-cover.svg',
    eyebrow: '01 / NOTICE & PREPARE', purpose: 'For the notes you want to make sense of.',
    description: 'Turn scattered daily observations into an organized one-page summary and useful questions for your next healthcare conversation.',
    features: ['14 daily observation logs', 'Midpoint and final pattern reviews', 'Appointment-prep checklist and one-page summary'],
    pages: 26, action: 'Get the workbook',
  },
  {
    ...GUT_ROUTINE_PLANNER_PRODUCT,
    preview: 'planner' as const, image: '/assets/images/planner-cover.svg',
    eyebrow: '02 / PLAN & PRACTICE', purpose: 'For one routine that fits your actual week.',
    description: 'Choose a manageable routine, find a cue in your day, and make a smaller fallback for busy, travel or low-energy days.',
    features: ['Four weekly Plan, Fit, Practice and Review modules', 'A 30-day check-off calendar and short check-ins', 'Cue cards, fallback planning and a next-month review'],
    pages: 31, action: 'Get the planner',
  },
];

export function safeBundleCheckoutUrl(value: string): string | null {
  if (!value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      (url.hostname === 'gumroad.com' || url.hostname.endsWith('.gumroad.com')) &&
      /^\/l\/[^/]+\/?$/.test(url.pathname) ? url.href : null;
  } catch { return null; }
}

function trackProductClick(product: { id: string; title: string; priceUSD: number; url: string }) {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    try {
      (window as any).gtag('event', 'outbound_product_click', {
        item_id: product.id, item_name: product.title,
        listed_price_usd: product.priceUSD, destination_url: product.url,
      });
    } catch { /* Optional measurement must not interrupt checkout navigation. */ }
  }
}

export interface ProductSectionProps { onJoinWaitlist: () => void; variant?: 'featured' | 'full'; }
const primaryButton = 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#14382B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#245340] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14382B]/25';
const previewButton = 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#14382B]/20 bg-transparent px-3 py-2.5 text-sm font-semibold text-[#14382B] transition hover:bg-[#14382B]/[0.05] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14382B]/20';

export function ProductSection({ onJoinWaitlist, variant = 'featured' }: ProductSectionProps) {
  const [preview, setPreview] = useState<PreviewProduct | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);
  const bundleUrl = safeBundleCheckoutUrl(GUMROAD_BUNDLE_URL);
  return (
    <section id="planner-product" aria-labelledby="workbooks-title" className="scroll-mt-24 border-y border-[#DDD9CB] bg-[#F3EFE6] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#9A492A]">The practical tools shelf</p>
          <h2 id="workbooks-title" className="font-serif text-3xl font-bold leading-tight text-[#14382B] [text-wrap:balance] sm:text-4xl lg:text-5xl">{variant === 'full' ? 'Choose the kind of support you need.' : 'A little structure. A useful next step.'}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#635F57]">Notice a pattern, prepare a clearer conversation, or fit one routine into real life. These printable tools give your next step a place on the page.</p>
        </div>
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {products.map(product => (
            <article id={product.id} key={product.id} aria-labelledby={`${product.id}-title`} className="flex min-w-0 scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-[#D9D6C9] bg-[#FFFEFA]">
              <div className="relative flex h-64 items-center justify-center border-b border-[#E6E2D7] bg-[#E9E5D9] px-8 pt-5">
                <span className="absolute left-4 top-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F7061]">Printable collection</span>
                <img src={product.image} alt={`Concept cover illustration for ${product.title}`} width="680" height="820" loading="lazy" className="h-52 w-auto max-w-full -rotate-3 object-contain shadow-[8px_10px_0_rgba(20,56,43,0.09)]" />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-[10px] leading-relaxed text-[#77766A]">Concept cover illustration; sample previews are mockups.</p>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9A492A]">{product.eyebrow}</p>
                <h3 id={`${product.id}-title`} className="mt-2 font-serif text-2xl font-bold leading-tight text-[#14382B]">{product.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-[#343F33]">{product.purpose}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#635F57]">{product.description}</p>
                <ul className="my-5 space-y-2.5">{product.features.map(feature => <li key={feature} className="flex items-start gap-2 text-sm leading-relaxed text-[#4A463F]"><Check aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0 text-[#667A4E]" /><span>{feature}</span></li>)}</ul>
                <div className="mt-auto border-t border-[#E6E2D7] pt-4">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <p><span className="font-serif text-4xl font-bold text-[#14382B]">${product.priceUSD}</span><span className="ml-1 text-xs text-[#635F57]">USD</span></p>
                    <p className="max-w-40 text-right text-xs leading-relaxed text-[#635F57]">{product.pages}-page printable<br />US Letter PDF</p>
                  </div>
                  <button type="button" onClick={() => setPreview(product.preview)} aria-haspopup="dialog" className={previewButton}><BookOpen aria-hidden="true" className="h-4 w-4 shrink-0" />Preview Sample Pages</button>
                  <a href={product.url} target="_blank" rel="noopener noreferrer" onClick={() => trackProductClick(product)} className={`${primaryButton} mt-2`}>{product.action}<ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" /></a>
                  <p className="mt-3 text-xs leading-relaxed text-[#6C6A60]">One-time purchase. Checkout and digital delivery through Gumroad.</p>
                </div>
              </div>
            </article>
          ))}
          <article id="complete-gut-bundle" aria-labelledby="bundle-title" className="relative flex min-w-0 scroll-mt-24 flex-col overflow-hidden rounded-2xl border-2 border-[#14382B] bg-[#14382B] text-[#F9F5EA]">
            <div className="border-b border-white/20 px-5 py-4 sm:px-6"><span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#E9C4A5]"><Sparkles aria-hidden="true" className="h-4 w-4" />{bundleUrl ? 'Best value' : 'Planned value'} · save $16</span></div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="mb-5 flex h-40 items-center justify-center gap-2" aria-hidden="true"><img src="/assets/images/workbook-cover.svg" alt="" width="680" height="820" loading="lazy" className="h-36 w-auto max-w-[45%] -rotate-6 object-contain shadow-lg" /><img src="/assets/images/planner-cover.svg" alt="" width="680" height="820" loading="lazy" className="h-36 w-auto max-w-[45%] rotate-6 object-contain shadow-lg" /></div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#E9C4A5]">03 / NOTICE, THEN PRACTICE</p>
              <h3 id="bundle-title" className="mt-2 font-serif text-2xl font-bold leading-tight">The Complete Gut Clarity &amp; 30-Day Routine Bundle</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#E2E7D9]">An observation tool and a routine-planning tool, together. Two different jobs for the days when both would help.</p>
              <ul className="my-5 space-y-2.5 text-sm leading-relaxed text-[#E2E7D9]">
                <li className="flex gap-2"><Check aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0 text-[#E9C4A5]" /><span>The 26-page Gut Clarity Workbook</span></li>
                <li className="flex gap-2"><Check aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0 text-[#E9C4A5]" /><span>The 31-page Gut Routine Planner</span></li>
                <li className="flex gap-2"><Check aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0 text-[#E9C4A5]" /><span>{bundleUrl ? 'Bonus' : 'Planned bonus'}: a 1-page Quick-Start Fiber &amp; Hydration Cheat Sheet</span></li>
              </ul>
              <div className="mt-auto border-t border-white/20 pt-4">
                <p><span className="font-serif text-4xl font-bold">$39</span><span className="ml-1 text-xs text-[#E2E7D9]">USD</span></p>
                <p className="mt-1 text-xs leading-relaxed text-[#E2E7D9]">{bundleUrl ? 'Bundle price' : 'Planned price · not available yet'}. The two PDFs separately total $55.</p>
                {bundleUrl ? <a href={bundleUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackProductClick({ id: 'complete-gut-bundle', title: 'The Complete Gut Clarity & 30-Day Routine Bundle', priceUSD: 39, url: bundleUrl })} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F9F5EA] px-4 py-3 text-sm font-semibold text-[#14382B] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">Get the complete bundle<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a> : <button type="button" onClick={onJoinWaitlist} aria-haspopup="dialog" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F9F5EA] px-4 py-3 text-sm font-semibold text-[#14382B] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">Get Bundle Launch Alert<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /></button>}
                <p className="mt-3 text-xs leading-relaxed text-[#E2E7D9]">{bundleUrl ? 'Checkout and digital delivery through Gumroad.' : 'Express interest in the planned bundle. There is no bundle checkout or charge today.'}</p>
              </div>
            </div>
          </article>
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-[#635F57]">Educational tools for adults. Not clinician-reviewed; they do not diagnose, treat or replace individualized care. Follow guidance from a qualified healthcare professional for personal concerns.</p>
        {variant === 'featured' ? <a href="/workbooks" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#14382B] underline decoration-[#B85D36]/50 underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14382B]/20">Compare the tools and read common questions<ArrowRight aria-hidden="true" className="h-4 w-4" /></a> : <ProductComparison bundleAvailable={Boolean(bundleUrl)} />}
      </div>
      {preview && <ProductPreviewModal product={preview} onClose={closePreview} />}
    </section>
  );
}

function ProductComparison({ bundleAvailable }: { bundleAvailable: boolean }) {
  const questions = [
    ['What format will I receive?', 'Each individual product is a downloadable, printable US Letter PDF: 26 pages for the workbook and 31 pages for the planner. You can view the files in a compatible PDF reader. These listings do not promise editable form fields or an app.'],
    ['Are the sample pages the actual PDF pages?', 'The interactive previews are illustrative HTML mockups with example entries. They show the kind of planning and observation the tools support; they are not screenshots, downloadable pages or a promise of identical layout.'],
    ['What happens after a purchase?', 'Gumroad handles checkout and digital delivery. Use the product link in your purchase receipt to access the PDF. If you cannot find it, check the email address used at checkout and your spam folder, then contact us through the Contact page.'],
    ['Do these tools replace medical advice?', 'No. They are educational tools for adults and are not clinician-reviewed. They do not diagnose symptoms, prescribe treatment or promise a health outcome. Use appropriate medical care for personal concerns or warning signs.'],
    ['Can I buy the complete bundle today?', bundleAvailable ? 'The complete bundle is listed through Gumroad. Review the included files and purchase details on the checkout page before buying.' : 'The $39 complete bundle and its bonus sheet are planned, not currently available. The launch-alert button records interest; it is not a payment or a purchase. The two individual Gumroad products are available separately.'],
  ];
  return <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.15fr]">
    <div className="rounded-2xl border border-[#D9D6C9] bg-[#FFFEFA] p-5 sm:p-7">
      <Layers3 aria-hidden="true" className="mb-4 h-6 w-6 text-[#9A492A]" /><h3 className="font-serif text-2xl font-bold text-[#14382B]">Two tools, different jobs.</h3>
      <dl className="mt-6 divide-y divide-[#E6E2D7] text-sm">
        <div className="py-4 first:pt-0"><dt className="font-semibold text-[#14382B]">I want to organize what I notice.</dt><dd className="mt-2 leading-relaxed text-[#635F57]">Start with the <strong>14-Day Gut Clarity Workbook</strong>. Its observation and appointment-prep pages help you make a concise record, without trying to diagnose a cause.</dd></div>
        <div className="py-4"><dt className="font-semibold text-[#14382B]">I want to put one routine into practice.</dt><dd className="mt-2 leading-relaxed text-[#635F57]">Choose the <strong>30-Day Gut Routine Planner</strong>. Use its weekly modules to find a practical cue, choose a smaller fallback and review what fit.</dd></div>
        <div className="py-4 last:pb-0"><dt className="font-semibold text-[#14382B]">I would find both useful.</dt><dd className="mt-2 leading-relaxed text-[#635F57]">The <strong>$39 bundle</strong> combines the two types of tool. {bundleAvailable ? 'Review the bundle listing to see the included PDFs and bonus sheet.' : 'The bundle and bonus sheet are planned, not available to buy yet; the individual PDFs remain available.'}</dd></div>
      </dl>
    </div>
    <div id="product-faq" aria-labelledby="product-faq-title">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#9A492A]">Before you choose</p><h3 id="product-faq-title" className="font-serif text-2xl font-bold text-[#14382B]">A few practical questions.</h3>
      <div className="mt-5 divide-y divide-[#D9D6C9] border-y border-[#D9D6C9]">{questions.map(([question, answer]) => <details key={question} className="group py-4"><summary className="min-h-11 cursor-pointer py-2 pr-4 text-sm font-semibold leading-relaxed text-[#14382B] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14382B]/20">{question}</summary><p className="pb-2 pt-2 text-sm leading-relaxed text-[#635F57]">{answer}</p></details>)}</div>
      <a href="/contact" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#14382B] underline underline-offset-4">Need help choosing? Contact us<ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
    </div>
  </div>;
}

export default ProductSection;
