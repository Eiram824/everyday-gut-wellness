/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, AlertCircle, ShieldCheck, CheckCircle2, Info } from 'lucide-react';

export const ProductSection: React.FC = () => {
  const affiliateHopLink = "https://hop.clickbank.net/?affiliate=maddog1914&vendor=bellyfh&cbpage=lander&pid=indexsalesletter&tid=maddog1914";

  return (
    <section id="product-review" className="scroll-mt-24 py-20 md:py-28 bg-[#F3EFE6] border-b border-[#E5DFD5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Educational Separation */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B85D36]">
            Optional Product Information · Commercial Disclosure
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#14382B] tracking-tight [text-wrap:balance]">
            Optional Digestive Formulations: BellyFlush
          </h2>
          <p className="text-base sm:text-lg text-[#635F57] leading-relaxed">
            The core of Everyday Gut Wellness is an independent educational guide focused on everyday fiber, hydration, and daily movement habits. For readers seeking information on commercial dietary supplements, this optional section outlines BellyFlush details provided by the vendor.
          </p>
        </div>

        {/* Independent Publication Boundary Notice */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] p-5 sm:p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded bg-[#EAF1ED] text-[#14382B] shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#14382B]">
                Independent Educational Publication Notice
              </h3>
              <p className="text-xs sm:text-sm text-[#4A463F] leading-relaxed">
                Everyday Gut Wellness is an educational resource and does not manufacture, formulate, or own BellyFlush. BellyFlush is a commercial dietary supplement offered by an independent third-party vendor via ClickBank.
              </p>
            </div>
          </div>
        </div>

        {/* Main Product Card & Review Benchmarks */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Educational Review Context */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1 border-b border-[#E5DFD5] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C877D]">
                  Product Overview
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#14382B]">
                  BellyFlush Dietary Supplement
                </h3>
              </div>

              <p className="text-sm text-[#4A463F] leading-relaxed">
                BellyFlush is an optional dietary supplement distributed through ClickBank. Complete ingredient profiles, serving guidelines, and vendor purchase terms are maintained on the vendor's official website.
              </p>

              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  Important Dietary & Health Guidelines:
                </h4>
                <ul className="text-xs sm:text-sm text-[#635F57] space-y-2.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                    <span><strong>No Disease Treatment or Cure:</strong> Dietary supplements are not intended to diagnose, treat, cure, or prevent any medical disease or chronic condition.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                    <span><strong>No Detox or Miracle Claims:</strong> BellyFlush does not detoxify the body, remove parasites or toxic intestinal waste, or guarantee specific bowel movements or weight loss.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                    <span><strong>Professional Consultation:</strong> Always speak with your doctor or healthcare provider before introducing any new supplement, particularly if you have ongoing digestive symptoms, take medications, or are pregnant or nursing.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: CTA Box with Prominent Pre-Click Affiliate Disclosure */}
            <div className="md:col-span-5 bg-[#FBF9F5] p-6 sm:p-7 rounded-xl border border-[#E5DFD5] space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EAF1ED] text-[#14382B] text-xs font-semibold rounded">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>External Vendor Link</span>
                </div>
                <h4 className="text-base font-bold text-[#14382B]">
                  Official Product Details
                </h4>
                <p className="text-xs text-[#635F57] leading-relaxed">
                  To view verified product specifications, full ingredients, pricing, and vendor terms, visit the vendor's official page:
                </p>
              </div>

              {/* Pre-Click Affiliate Disclosure: visible next to and before the CTA */}
              <div className="p-3.5 bg-white rounded-lg border border-[#E5DFD5] text-xs text-[#4A463F] space-y-1">
                <div className="flex items-center gap-1.5 text-[#B85D36] font-semibold text-[11px] uppercase tracking-wide">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Affiliate Disclosure</span>
                </div>
                <p className="leading-relaxed">
                  Affiliate disclosure: If you purchase through this link, I may earn a commission at no extra cost to you.
                </p>
              </div>

              {/* Primary HopLink CTA Button */}
              <div>
                <a
                  href={affiliateHopLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-[#14382B] hover:bg-[#0E281E] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#14382B]"
                  aria-label="View BellyFlush Product Details (opens official vendor website in a new tab)"
                >
                  <span>View BellyFlush Product Details</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>

                <span className="block text-[11px] text-[#8C877D] mt-2 text-center">
                  Opens official third-party vendor page in a new window.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
