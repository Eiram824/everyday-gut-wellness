/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Mail, X, Heart, ExternalLink } from 'lucide-react';

interface TrustAndFooterProps {
  onNavigate: (sectionId: string) => void;
}

export const TrustAndFooter: React.FC<TrustAndFooterProps> = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState<'contact' | 'editorial' | 'affiliate' | null>(null);

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
              An independent, evidence-informed educational publication dedicated to helping adults understand digestive physiology, fiber variety, proactive hydration, and daily motility habits.
            </p>
            <div className="text-xs text-[#EAF1ED]/60 space-y-1">
              <p>Independent educational resource · Not a medical provider</p>
              <p>United States Dietary Guidelines Reference Edition</p>
            </div>
          </div>

          {/* Quick Guide Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#EAD3C7]">
              Guide Sections
            </h4>
            <ul className="space-y-2 text-xs text-[#EAF1ED]/80">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('daily-check')}
                  className="hover:text-white transition-colors"
                >
                  The Daily Habit Check
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('fiber-lesson')}
                  className="hover:text-white transition-colors"
                >
                  The Fiber Lesson (Soluble & Insoluble)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('routine-reset')}
                  className="hover:text-white transition-colors"
                >
                  The Routine Reset Checklist
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('myths')}
                  className="hover:text-white transition-colors"
                >
                  Digestive Myths vs. Clinical Facts
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('medical-advice')}
                  className="hover:text-white transition-colors"
                >
                  When to Seek Medical Advice
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('gut-clarity-workbook')}
                  className="hover:text-white transition-colors text-[#EAD3C7] font-medium"
                >
                  The 14-Day Gut Clarity Workbook
                </button>
              </li>
            </ul>
          </div>

          {/* Trust, Privacy & Policy Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#EAD3C7]">
              Trust & Transparency
            </h4>
            <div className="space-y-2.5">
              <a
                href="/about.html"
                className="block text-xs text-[#EAF1ED]/80 hover:text-white transition-colors text-left"
              >
                About Everyday Gut Wellness
              </a>
              <button
                type="button"
                onClick={() => setActiveModal('editorial')}
                className="block text-xs text-[#EAF1ED]/80 hover:text-white transition-colors text-left"
              >
                Editorial Standards & Medical Review Process
              </button>
              <a
                href="/privacy.html"
                className="block text-xs text-[#EAF1ED]/80 hover:text-white transition-colors text-left"
              >
                Privacy Policy & Data Security
              </a>
              <a
                href="/terms.html"
                className="block text-xs text-[#EAF1ED]/80 hover:text-white transition-colors text-left"
              >
                Terms of Service & User Agreement
              </a>
              <button
                type="button"
                onClick={() => setActiveModal('affiliate')}
                className="block text-xs text-[#EAF1ED]/80 hover:text-white transition-colors text-left"
              >
                Affiliate & Financial Disclosure
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('contact')}
                className="block text-xs text-[#EAF1ED]/80 hover:text-white transition-colors text-left"
              >
                Contact Editorial Desk
              </button>
            </div>

            <div className="pt-2 text-xs text-[#EAF1ED]/70 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">
              <span className="font-semibold text-white block mb-0.5">Independent Educational Publishing:</span>
              Everyday Gut Wellness is an independent educational publishing project. The free guide is available now, and our printable workbooks are sold securely through Gumroad. We do not sell or promote third-party affiliate supplements.
            </div>
          </div>
        </div>

        {/* Detailed Medical Disclaimer */}
        <div className="bg-black/20 rounded-xl p-5 border border-white/10 text-xs text-[#EAF1ED]/70 space-y-2">
          <strong className="text-white block font-semibold uppercase tracking-wider text-[11px]">
            Comprehensive Clinical & Educational Disclaimer (FDA Compliance):
          </strong>
          <p className="leading-relaxed">
            The content on Everyday Gut Wellness is created strictly for informational and educational purposes. It is not intended to provide medical advice, diagnosis, or treatment, nor does it create a doctor-patient relationship. Statements on this website have not been evaluated by the Food and Drug Administration. Any dietary supplement or formulation mentioned is not intended to diagnose, treat, cure, or prevent any disease. Always seek the advice of your physician, gastroenterologist, or other qualified healthcare provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this website.
          </p>
        </div>

        {/* Advertising Network Disclaimers (Facebook / Meta & Google Ads Compliance) */}
        <div className="bg-black/15 rounded-xl p-4 border border-white/5 text-[11px] text-[#EAF1ED]/60 space-y-2 leading-relaxed">
          <p>
            <strong className="text-[#EAF1ED]/80">Meta / Facebook Disclaimer:</strong> This site is not a part of the Facebook website or Meta Platforms, Inc. Additionally, this site is NOT endorsed or affiliated with Facebook or Meta Platforms, Inc. in any way. FACEBOOK and META are registered trademarks of Meta Platforms, Inc.
          </p>
          <p>
            <strong className="text-[#EAF1ED]/80">Google Ads Disclaimer:</strong> This site is not affiliated with, sponsored by, or endorsed by Google LLC or Alphabet Inc. Google is a trademark of Google LLC.
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

      {/* Modals for Contact, Editorial, Affiliate */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-[#2C2A26] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#635F57] hover:bg-[#F3EFE6] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Contact Modal */}
            {activeModal === 'contact' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <Mail className="w-4 h-4 text-[#14382B]" />
                  <span>Editorial Desk</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#14382B]">
                  Contact & Reader Feedback
                </h3>
                <div className="text-xs sm:text-sm text-[#4A463F] space-y-3 leading-relaxed">
                  <p>
                    We welcome inquiries regarding citation verification, evidence updates, or editorial corrections.
                  </p>
                  <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5] space-y-1.5 text-xs">
                    <div><strong>Email:</strong> <a href="mailto:hello@everydaygutwellness.com" className="underline">hello@everydaygutwellness.com</a></div>
                    <div><strong>Response Window:</strong> 2–3 business days for non-clinical inquiries.</div>
                  </div>
                  <p className="text-xs text-[#635F57] italic">
                    Note: Our editorial staff cannot answer individual medical questions or provide diagnostic consultations. Please contact your physician for personalized medical care.
                  </p>
                </div>
              </div>
            )}

            {/* Affiliate Modal */}
            {activeModal === 'affiliate' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <ShieldCheck className="w-4 h-4 text-[#14382B]" />
                  <span>Affiliate Disclosure</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#14382B]">
                  Affiliate & Financial Transparency
                </h3>
                <div className="text-xs sm:text-sm text-[#4A463F] space-y-3 leading-relaxed">
                  <p>
                    Everyday Gut Wellness is an independent educational publication. We do not participate in third-party supplement affiliate programs, sponsored brand posts, or paid medical product promotions.
                  </p>
                  <p>
                    <strong>Digital Workbooks:</strong> We independently author and publish educational printables (such as the 14-Day Gut Clarity Workbook and 30-Day Gut Routine Planner). When purchased, transactions and secure digital delivery are handled directly via Gumroad. We receive no compensation other than direct support for our independent publishing work.
                  </p>
                </div>
              </div>
            )}

            {/* Editorial Modal */}
            {activeModal === 'editorial' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <ShieldCheck className="w-4 h-4 text-[#14382B]" />
                  <span>Review Standards</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#14382B]">
                  Editorial & Evidence Standards
                </h3>
                <div className="text-xs sm:text-sm text-[#4A463F] space-y-3 leading-relaxed">
                  <p>
                    Every article and checklist on Everyday Gut Wellness is constructed upon published human clinical nutrition guidelines, peer-reviewed gastroenterology literature, and the Dietary Guidelines for Americans.
                  </p>
                  <p>
                    <strong>Core Tenets:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Zero unverified claims, miracle promises, or fabricated case studies.</li>
                    <li>Clear distinction between everyday benign irregularity and red-flag clinical symptoms.</li>
                    <li>Uncompromising independence in evaluating dietary supplements against deceptive marketing practices.</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-[#14382B] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#0E281E] transition-colors"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
export default TrustAndFooter;
