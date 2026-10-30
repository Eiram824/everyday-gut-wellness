/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, Star, CheckCircle2, ShieldCheck, AlertCircle, Info, Sparkles } from 'lucide-react';
import { CLICKBANK_AFFILIATE_URL } from '../constants';

export const ProductSection: React.FC = () => {
  const affiliateHoplink = CLICKBANK_AFFILIATE_URL;

  const keyIngredients = [
    {
      name: 'Psyllium Husk',
      role: 'Soluble Bulk Fiber',
      desc: 'Draws gentle hydration into stool for smoother transit without harsh cramping.',
    },
    {
      name: 'Bentonite Clay',
      role: 'Gentle Cleansing Agent',
      desc: 'Traditional mineral clay known for binding waste impurities along intestinal walls.',
    },
    {
      name: 'Black Walnut Hull',
      role: 'Botanical Balance',
      desc: 'Time-tested herbal extract that promotes a balanced gut microbiological environment.',
    },
    {
      name: 'Aloe Vera Leaf Extract',
      role: 'Mucosal Soothing',
      desc: 'Calms irritated intestinal tissue and encourages natural digestive motility.',
    },
    {
      name: 'Flaxseed Powder',
      role: 'Omega & Motility Support',
      desc: 'Nutrient-rich fiber that lubricates bowel transit and nourishes beneficial microbes.',
    },
    {
      name: 'L. Acidophilus',
      role: 'Probiotic Flora',
      desc: 'Replenishes active beneficial bacteria to support daily digestive equilibrium.',
    },
  ];

  return (
    <section id="product-review" className="scroll-mt-24 py-20 md:py-28 bg-[#F3EFE6] border-b border-[#E5DFD5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#14382B]/10 text-[#14382B] rounded text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#B85D36]" />
            <span>Independent Educational Review</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#14382B] tracking-tight [text-wrap:balance]">
            Formulation Spotlight: BellyFlush
          </h2>
          <p className="text-base sm:text-lg text-[#635F57] leading-relaxed">
            An objective look at BellyFlush—its natural botanical ingredients, how it works in the digestive tract, and clinical considerations before you buy.
          </p>
        </div>

        {/* Featured Product Review Card */}
        <div className="bg-white rounded-2xl border-2 border-[#14382B]/15 shadow-xl overflow-hidden max-w-4xl mx-auto">
          {/* Card Top Banner */}
          <div className="bg-[#14382B] text-white px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#EAD3C7]" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">
                Natural Digestive & Colon Cleansing Formulation
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#EAD3C7] font-medium">
              <div className="flex text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-white font-bold ml-1">4.8 / 5</span>
              <span className="text-white/70">(Customer Feedback)</span>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Main Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B85D36]">
                  Clinical Breakdown
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#14382B]">
                  What Is BellyFlush?
                </h3>
                <p className="text-sm sm:text-base text-[#4A463F] leading-relaxed">
                  BellyFlush is a daily dietary supplement designed to support natural colon cleansing, eliminate accumulated intestinal waste, and relieve stubborn feeling of sluggishness. Unlike aggressive chemical laxatives, it pairs gentle soluble fibers with soothing botanical extracts to stimulate motility smoothly.
                </p>
              </div>

              {/* Quick Specs Box */}
              <div className="bg-[#F8F6F0] rounded-xl p-5 border border-[#E5DFD5] space-y-3">
                <h4 className="text-xs font-bold text-[#14382B] uppercase tracking-wider">
                  Quick Details
                </h4>
                <div className="space-y-2 text-xs text-[#635F57]">
                  <div className="flex justify-between pb-1.5 border-b border-[#E5DFD5]">
                    <span>Form:</span>
                    <strong className="text-[#14382B]">Easy-to-swallow Capsules</strong>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-[#E5DFD5]">
                    <span>Key Focus:</span>
                    <strong className="text-[#14382B]">Waste Flush & Bloat Relief</strong>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-[#E5DFD5]">
                    <span>Stimulants:</span>
                    <strong className="text-[#14382B]">Non-GMO, No Harsh Drugs</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Guarantee:</span>
                    <strong className="text-[#14382B]">Manufacturer Backed</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Ingredients Grid */}
            <div className="space-y-4 pt-4 border-t border-[#E5DFD5]">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-serif font-bold text-[#14382B]">
                  Key Active Ingredients Explained
                </h4>
                <span className="text-xs text-[#8C877D]">Evidence-informed botanicals</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {keyIngredients.map((item, idx) => (
                  <div key={idx} className="bg-[#FBF9F5] p-4 rounded-xl border border-[#E5DFD5] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#14382B]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#14382B] shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#B85D36] uppercase tracking-wider">
                      {item.role}
                    </div>
                    <p className="text-xs text-[#635F57] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pros and Considerations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E5DFD5]">
              <div className="bg-[#14382B]/5 rounded-xl p-5 border border-[#14382B]/15 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#14382B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#14382B]" />
                  Who May Benefit Most
                </h5>
                <ul className="text-xs text-[#4A463F] space-y-2 list-disc list-inside leading-relaxed">
                  <li>Individuals experiencing sluggish bowel frequency and bloating.</li>
                  <li>Those wanting gentle morning regularity without unpredictable urgency.</li>
                  <li>People transitioning to higher whole-food fiber diets needing gut reset support.</li>
                </ul>
              </div>

              <div className="bg-[#B85D36]/5 rounded-xl p-5 border border-[#B85D36]/20 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#B85D36] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#B85D36]" />
                  Important Considerations
                </h5>
                <ul className="text-xs text-[#4A463F] space-y-2 list-disc list-inside leading-relaxed">
                  <li>Drink abundant water (at least 8–10 glasses daily) when consuming fiber formulas.</li>
                  <li>Consult your healthcare provider if pregnant, nursing, or on prescription meds.</li>
                  <li>Not a replacement for healthy balanced meals and daily hydration habits.</li>
                </ul>
              </div>
            </div>

            {/* Direct CTA Button to ClickBank */}
            <div className="pt-6 border-t border-[#E5DFD5] space-y-4">
              <div className="text-center space-y-2">
                <a
                  href={affiliateHoplink}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#B85D36] hover:bg-[#A04E2B] active:scale-[0.99] text-white font-serif font-bold text-base sm:text-lg rounded-xl shadow-lg transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B85D36]/30 group"
                >
                  <span>Check BellyFlush Availability & Pricing</span>
                  <ExternalLink className="w-5 h-5 text-white/90 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <p className="text-xs text-[#8C877D]">
                  Directly opens the verified official manufacturer presentation in a secure window.
                </p>
              </div>

              {/* Compliance & Affiliate Notice */}
              <div className="bg-[#F8F6F0] rounded-xl p-4 border border-[#E5DFD5] flex items-start gap-3 text-xs text-[#635F57] leading-relaxed">
                <Info className="w-4 h-4 text-[#B85D36] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#14382B]">Affiliate Disclosure:</strong> When you purchase through links on this page, we may earn an affiliate commission at zero additional cost to you. We only review products with transparent ingredient profiles and verified manufacturing standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
