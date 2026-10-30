/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, X, Heart, ExternalLink, FileSpreadsheet } from 'lucide-react';

interface TrustAndFooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenLeadAdmin?: () => void;
}

export const TrustAndFooter: React.FC<TrustAndFooterProps> = ({ onNavigate, onOpenLeadAdmin }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'contact' | 'editorial' | null>(null);

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
                Privacy Notice (Zero Health Data Tracking)
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('contact')}
                className="block text-xs text-[#EAF1ED]/80 hover:text-white transition-colors text-left"
              >
                Contact Editorial Desk
              </button>
              {onOpenLeadAdmin && (
                <button
                  type="button"
                  onClick={onOpenLeadAdmin}
                  className="inline-flex items-center gap-1.5 text-xs text-[#EAD3C7] hover:text-white transition-colors text-left font-medium pt-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Subscribers & CSV Export (Admin)</span>
                </button>
              )}
            </div>

            <div className="pt-2 text-xs text-[#EAF1ED]/70 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">
              <span className="font-semibold text-white block mb-0.5">Affiliate Notice:</span>
              This page contains educational information and may include affiliate links. If you purchase through an affiliate link, we may earn a commission at no additional cost to you.
            </div>
          </div>
        </div>

        {/* Detailed Medical Disclaimer */}
        <div className="bg-black/20 rounded-xl p-5 border border-white/10 text-xs text-[#EAF1ED]/70 space-y-2">
          <strong className="text-white block font-semibold uppercase tracking-wider text-[11px]">
            Comprehensive Clinical & Educational Disclaimer:
          </strong>
          <p className="leading-relaxed">
            The content on Everyday Gut Wellness is created strictly for informational and educational purposes. It is not intended to provide medical advice, diagnosis, or treatment, nor does it create a doctor-patient relationship. Statements on this website have not been evaluated by the Food and Drug Administration. Any dietary supplement or formulation mentioned is not intended to diagnose, treat, cure, or prevent any disease. Always seek the advice of your physician, gastroenterologist, or other qualified healthcare provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this website.
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

      {/* Modals for Privacy, Contact, Editorial */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-[#2C2A26] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
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
                  <span>Privacy Notice</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#14382B]">
                  Zero Tracking & No Health Data Collection
                </h3>
                <div className="text-xs sm:text-sm text-[#4A463F] space-y-3 leading-relaxed">
                  <p>
                    Everyday Gut Wellness values your absolute privacy. We do not collect visitor names, email addresses, phone numbers, or private medical details.
                  </p>
                  <p>
                    <strong>No Tracking Pixels:</strong> We do not deploy behavioral tracking pixels, third-party social surveillance trackers, or data-broker scripts. All interactive tools (such as the Habit Check and Routine Reset) operate strictly client-side in your local browser session and are never transmitted to a server.
                  </p>
                  <p>
                    <strong>Cookie Policy:</strong> Only basic essential session storage is used to keep the website operating securely.
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
