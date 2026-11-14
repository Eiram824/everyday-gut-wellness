/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface TrustAndFooterProps {
  onNavigate: (sectionId: string) => void;
}

export const TrustAndFooter: React.FC<TrustAndFooterProps> = ({ onNavigate }) => {

  return (
    <footer className="bg-[#14382B] text-[#EAF1ED] pt-16 pb-12 border-t border-[#0E281E]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Footer Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-white/10 pb-12">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <span className="text-2xl font-serif font-bold text-white tracking-tight">
              Everyday Gut Wellness
            </span>
            <p className="text-xs sm:text-sm text-[#EAF1ED]/80 leading-relaxed max-w-sm">
              An independent educational project with practical guides and printable tools for reflecting on everyday digestive routines.
            </p>
            <p className="text-xs text-[#EAF1ED]/60">General education for adults. Not a healthcare service.</p>
          </div>

          {/* Quick Guide Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#EAD3C7]">
              Guide Sections
            </h4>
            <ul className="space-y-2 text-xs text-[#EAF1ED]/80">
              <li>
                <a href="#daily-check" onClick={(event) => { event.preventDefault(); onNavigate('daily-check'); }}
                  className="hover:text-white transition-colors"
                >
                  The Daily Habit Check
                </a>
              </li>
              <li>
                <a href="#fiber-lesson" onClick={(event) => { event.preventDefault(); onNavigate('fiber-lesson'); }}
                  className="hover:text-white transition-colors"
                >
                  The Fiber Lesson (Soluble & Insoluble)
                </a>
              </li>
              <li>
                <a href="#routine-reset" onClick={(event) => { event.preventDefault(); onNavigate('routine-reset'); }}
                  className="hover:text-white transition-colors"
                >
                  The Routine Reset Checklist
                </a>
              </li>
              <li>
                <a href="#myths" onClick={(event) => { event.preventDefault(); onNavigate('myths'); }}
                  className="hover:text-white transition-colors"
                >
                  Digestive Myths vs. Clinical Facts
                </a>
              </li>
              <li>
                <a href="#medical-advice" onClick={(event) => { event.preventDefault(); onNavigate('medical-advice'); }}
                  className="hover:text-white transition-colors"
                >
                  When to Seek Medical Advice
                </a>
              </li>
              <li>
                <a href="#planner-product" onClick={(event) => { event.preventDefault(); onNavigate('planner-product'); }}
                  className="hover:text-white transition-colors text-[#EAD3C7] font-medium"
                >
                  The 30-Day Wellness Planner
                </a>
              </li>
            </ul>
          </div>

          {/* Trust, Privacy & Policy Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#EAD3C7]">
              Trust & Transparency
            </h4>
            <nav aria-label="Policies and contact" className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs">
              <a className="text-[#EAF1ED]/80 underline underline-offset-2 hover:text-white" href="/editorial-standards.html">Editorial standards</a>
              <a className="text-[#EAF1ED]/80 underline underline-offset-2 hover:text-white" href="/privacy.html">Privacy policy</a>
              <a className="text-[#EAF1ED]/80 underline underline-offset-2 hover:text-white" href="/terms.html">Terms of use</a>
              <a className="text-[#EAF1ED]/80 underline underline-offset-2 hover:text-white" href="/contact.html">Contact</a>
            </nav>

            <div className="pt-2 text-xs text-[#EAF1ED]/70 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">
              <span className="font-semibold text-white block mb-0.5">Independent Educational Publishing:</span>
              We publish original guides and printable workbooks. Gumroad handles payment and digital delivery for paid products.
            </div>
          </div>
        </div>

        {/* Educational health notice */}
        <div className="bg-black/20 rounded-xl p-5 border border-white/10 text-xs text-[#EAF1ED]/70 space-y-2">
          <strong className="text-white block font-semibold uppercase tracking-wider text-[11px]">
            Educational health notice
          </strong>
          <p className="leading-relaxed">
            This website and its workbooks provide general educational information, not medical advice, diagnosis, or treatment. The materials have not been independently reviewed by a clinician and cannot identify the cause of symptoms or promise a health outcome. For personal concerns, seek advice from a qualified healthcare professional. Seek prompt medical care for severe or worsening symptoms.
          </p>
        </div>


        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#EAF1ED]/60 pt-4 gap-4">
          <p>&copy; {new Date().getFullYear()} Everyday Gut Wellness. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Designed for mindful, evidence-informed digestive self-care.
          </p>
        </div>
      </div>

    </footer>
  );
};
export default TrustAndFooter;
