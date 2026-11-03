/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, X, Heart, ExternalLink } from 'lucide-react';

interface TrustAndFooterProps {
  onNavigate: (sectionId: string) => void;
}

export const TrustAndFooter: React.FC<TrustAndFooterProps> = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | 'editorial' | null>(null);

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
              <p>Publication ISSN: Registered Educational Resource</p>
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
                  onClick={() => onNavigate('planner-product')}
                  className="hover:text-white transition-colors text-[#EAD3C7] font-medium"
                >
                  The 30-Day Wellness Planner
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
              <button
                type="button"
                onClick={() => setActiveModal('editorial')}
                className="block text-xs text-[#EAF1ED]/80 hover:text-white transition-colors text-left"
              >
                Editorial Standards & Medical Review Process
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="block text-xs text-[#EAF1ED]/80 hover:text-white transition-colors text-left"
              >
                Privacy Policy & Data Security
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="block text-xs text-[#EAF1ED]/80 hover:text-white transition-colors text-left"
              >
                Terms of Service & User Agreement
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
              Everyday Gut Wellness is an independent digital health publisher. We create original educational guides, printables, and habit workbooks. Our digital products are fulfilled securely via Gumroad. We do not sell or promote third-party affiliate supplements.
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

      {/* Modals for Privacy, Terms, Contact, Editorial */}
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

            {/* Privacy Modal */}
            {activeModal === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <Lock className="w-4 h-4 text-[#14382B]" />
                  <span>Privacy Policy</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#14382B]">
                  Privacy Policy & Data Protection
                </h3>
                <div className="text-xs sm:text-sm text-[#4A463F] space-y-3 leading-relaxed">
                  <p>
                    Everyday Gut Wellness is committed to protecting your privacy and practicing transparent data management.
                  </p>
                  <p>
                    <strong>Information We Collect:</strong> When you request our free 7-Day Gentle Gut Reset Guide, we collect your name and email address to provide immediate access. We do NOT collect credit card numbers, health records, or personal identification documents on this website.
                  </p>
                  <p>
                    <strong>Email Delivery & Marketing Consent:</strong> Requesting the free guide delivers the publication immediately. If you optionally choose to check the marketing consent box, you may receive educational articles and wellness newsletters. You may unsubscribe at any time with a single click using the link at the bottom of every email.
                  </p>
                  <p>
                    <strong>Digital Product Purchases:</strong> Purchases of our digital workbooks (such as The 30-Day Digestive Wellness Planner) are securely processed and fulfilled by Gumroad. Gumroad handles billing, tax collection, and file delivery. We never receive or store your payment card numbers.
                  </p>
                  <p>
                    <strong>Analytics:</strong> We use Google Analytics 4 (GA4) with IP anonymization to evaluate aggregate website traffic and usability. We do not pass health symptoms or personal medical data into analytics.
                  </p>
                </div>
              </div>
            )}

            {/* Terms of Service Modal */}
            {activeModal === 'terms' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <ShieldCheck className="w-4 h-4 text-[#14382B]" />
                  <span>Terms of Service</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#14382B]">
                  Terms of Service & User Agreement
                </h3>
                <div className="text-xs sm:text-sm text-[#4A463F] space-y-3 leading-relaxed">
                  <p>
                    By accessing or using Everyday Gut Wellness, you agree to comply with and be bound by these Terms of Service.
                  </p>
                  <p>
                    <strong>Educational Use Only:</strong> All content, checklists, planners, and articles provided on this website are for educational and self-reflection purposes only and are not a substitute for professional medical diagnosis or treatment.
                  </p>
                  <p>
                    <strong>Digital Products & Payments:</strong> Original digital workbooks and planners offered on this website are sold and fulfilled via Gumroad. By initiating a purchase, you agree to Gumroad's terms and privacy policies. All downloadable materials are licensed for personal, non-commercial use.
                  </p>
                  <p>
                    <strong>Intellectual Property:</strong> The articles, graphics, habit trackers, and workbook designs on Everyday Gut Wellness are original intellectual property protected by copyright. You may not republish, resell, or distribute our materials without prior written consent.
                  </p>
                  <p>
                    <strong>Limitation of Liability:</strong> Under no circumstances shall Everyday Gut Wellness or its creators be held liable for any direct or indirect damages resulting from the use or misuse of educational information or habit worksheets provided on this site.
                  </p>
                </div>
              </div>
            )}

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
                    <div><strong>Editorial Desk:</strong> editorial@everydaygutwellness.org</div>
                    <div><strong>General Inquiries:</strong> contact@everydaygutwellness.org</div>
                    <div><strong>Response Window:</strong> 2–3 business days for non-clinical inquiries.</div>
                  </div>
                  <p className="text-xs text-[#635F57] italic">
                    Note: Our editorial staff cannot answer individual medical questions or provide diagnostic consultations. Please contact your physician for personalized medical care.
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
