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
                Editorial & Sourcing Notes
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
                    This notice explains what information this website collects and how it is used.
                  </p>
                  <p>
                    <strong>Guide signups:</strong> If you request the free guide, the form sends the name and email address you provide to our Supabase database so we can process the request. The site does not ask you to submit health records or payment card details. Do not include symptoms or other health details in the signup form.
                  </p>
                  <p>
                    <strong>Optional email updates:</strong> The checkbox is optional and records your consent for future educational email updates. An email marketing service is not currently configured, so newsletters are not being sent from this site. If that changes, marketing emails will include an unsubscribe method.
                  </p>
                  <p>
                    <strong>Paid workbooks:</strong> Checkout and digital file delivery are handled by Gumroad under its own terms and privacy notice. Do not send payment card information to this website.
                  </p>
                  <p>
                    <strong>Analytics:</strong> Google Analytics 4 is used to understand site visits and usage. Do not enter health symptoms into this site; the site is not designed to send health details to analytics.
                  </p>
                </div>
              </div>
            )}

            {/* Terms of Service Modal */}
            {activeModal === 'terms' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <ShieldCheck className="w-4 h-4 text-[#14382B]" />
                  <span>Use & Digital Product Terms</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#14382B]">
                  Use & Digital Product Terms
                </h3>
                <div className="text-xs sm:text-sm text-[#4A463F] space-y-3 leading-relaxed">
                  <p>
                    <strong>Educational Use Only:</strong> All content, checklists, planners, and articles provided on this website are for educational and self-reflection purposes only and are not a substitute for professional medical diagnosis or treatment.
                  </p>
                  <p>
                    <strong>Digital Products:</strong> Paid workbooks are sold and delivered through Gumroad. Purchases are also subject to Gumroad's terms and privacy notice. Downloaded materials are licensed for personal, non-commercial use.
                  </p>
                  <p>
                    <strong>Intellectual Property:</strong> The articles, graphics, habit trackers, and workbook designs on Everyday Gut Wellness are original intellectual property protected by copyright. You may not republish, resell, or distribute our materials without prior written consent.
                  </p>
                  <p>
                    <strong>Order support:</strong> Use the contact link in your Gumroad receipt for payment or file-delivery questions.
                  </p>
                </div>
              </div>
            )}

            {/* Contact Modal */}
            {activeModal === 'contact' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <Mail className="w-4 h-4 text-[#14382B]" />
                  <span>Reader Support</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#14382B]">
                  Product & Reader Support
                </h3>
                <div className="text-xs sm:text-sm text-[#4A463F] space-y-3 leading-relaxed">
                  <p>
                    For payment or file-delivery questions, use the support link in the Gumroad receipt for your order. This website does not provide individual medical guidance.
                  </p>
                  <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
                    <a className="flex items-center justify-between gap-2 text-[#14382B] underline" href="https://eiram32.gumroad.com/l/14-day-gut-clarity-workbook" target="_blank" rel="noopener noreferrer">14-Day Gut Clarity Workbook <ExternalLink className="h-3.5 w-3.5" /></a>
                    <a className="flex items-center justify-between gap-2 text-[#14382B] underline" href="https://eiram32.gumroad.com/l/ynisjl" target="_blank" rel="noopener noreferrer">30-Day Gut Routine Planner <ExternalLink className="h-3.5 w-3.5" /></a>
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
                  <span>Editorial Notes</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#14382B]">
                  Editorial & Sourcing Notes
                </h3>
                <div className="text-xs sm:text-sm text-[#4A463F] space-y-3 leading-relaxed">
                  <p>
                    Everyday Gut Wellness is an independent educational project. We aim to use reputable public sources, but site copy and workbooks have not been independently reviewed by a clinician. Source links are provided in individual materials where available.
                  </p>
                  <p>
                    <strong>How to use the material:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Use these resources for education and personal organization, not self-diagnosis.</li>
                    <li>Do not delay care for persistent, severe, or worsening symptoms.</li>
                    <li>Discuss personal diet or routine changes with a qualified healthcare professional when appropriate.</li>
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
