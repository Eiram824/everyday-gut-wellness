/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { guideDeliveryNotice, parseEmailDeliveryStatus, parseMarketingSignupUrl, type EmailDeliveryStatus } from '../lib/lead-delivery';
import {
  X,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Mail,
  User,
  ArrowRight,
  FileText,
  Loader2,
  Check,
  Download
} from 'lucide-react';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (subscriber: { name: string; email: string }) => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [guideEmailAvailable, setGuideEmailAvailable] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [marketingSignupUrl, setMarketingSignupUrl] = useState<string | null>(null);
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<EmailDeliveryStatus>('not_requested');
  const submitting = useRef(false);
  const submissionController = useRef<AbortController | null>(null);
  const requestGeneration = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    requestGeneration.current += 1;
    submissionController.current?.abort();
    submissionController.current = null;
    submitting.current = false;
    setIsLoading(false);
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      setGuideEmailAvailable(false);
      setMarketingSignupUrl(null);
      setEmailDeliveryStatus('not_requested');
      setIsConfigLoading(true);
      let active = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      fetch('/api/subscribe', { signal: controller.signal })
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          if (!active || controller.signal.aborted || !data) return;
          setGuideEmailAvailable(data.guideEmailAvailable === true);
          setMarketingSignupUrl(parseMarketingSignupUrl(data.marketingSignupUrl));
        })
        .catch(() => { /* Instant download remains available when email configuration cannot be read. */ })
        .finally(() => { clearTimeout(timeout); if (active) setIsConfigLoading(false); });
      return () => {
        active = false;
        clearTimeout(timeout);
        controller.abort();
        requestGeneration.current += 1;
        submissionController.current?.abort();
        submissionController.current = null;
        submitting.current = false;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current || isConfigLoading) return;
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    submitting.current = true;
    setIsLoading(true);
    const generation = requestGeneration.current;
    const controller = new AbortController();
    submissionController.current = controller;
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: firstName.trim() || 'Reader',
          email: trimmedEmail,
          source: 'ebook_lead_modal',
          emailGuideRequested: guideEmailAvailable,
          marketingConsent: false,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (generation !== requestGeneration.current) return;
      if (!response.ok || data.success !== true) {
        throw new Error(data.error || 'We could not save your signup. Please try again.');
      }

      try {
        localStorage.setItem('gut_reset_subscriber', JSON.stringify({
          accessGranted: true,
        }));
      } catch {}

      setEmailDeliveryStatus(parseEmailDeliveryStatus(data.emailDeliveryStatus));
      setMarketingSignupUrl(parseMarketingSignupUrl(data.marketingSignupUrl));
      setIsSuccess(true);
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', {
          event_category: 'Lead Capture',
          event_label: '7-Day Gentle Gut Reset Guide',
          currency: 'USD',
        });
      }
    } catch (err: any) {
      if (generation !== requestGeneration.current) return;
      setErrorMessage(controller.signal.aborted
        ? 'The connection timed out. Please try again; repeating a request will not restart guide-email delivery.'
        : err?.message || 'We could not save your signup. Please check your connection and try again.');
    } finally {
      clearTimeout(timeout);
      if (generation === requestGeneration.current) {
        submissionController.current = null;
        submitting.current = false;
        setIsLoading(false);
      }
    }
  };

  const handleOpenReaderFromSuccess = () => {
    setIsSuccess(false);
    onSuccess({ name: firstName.trim() || 'Reader', email: email.trim().toLowerCase() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E5DFD5] overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[#4A463F] hover:text-[#14382B] hover:bg-black/5 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success View */}
        {isSuccess ? (
          <div className="p-6 sm:p-10 md:p-12 text-center flex flex-col items-center justify-center space-y-4 sm:space-y-6 overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EAF1ED] border border-[#14382B]/20 flex items-center justify-center text-[#14382B] shadow-inner">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5 sm:space-y-2 max-w-md">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#B85D36]">
                Access Granted · PDF Ready
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#14382B]">
                {`Welcome aboard, ${firstName.trim() || 'friend'}!`}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A463F] leading-relaxed">
                {guideDeliveryNotice(emailDeliveryStatus)}
              </p>
            </div>

            {marketingSignupUrl && (
              <div className="max-w-sm space-y-2 pt-2 text-sm text-[#4A463F]">
                <a href={marketingSignupUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#14382B] underline underline-offset-4">
                  Join the optional seven-email series
                </a>
                <p className="text-xs leading-relaxed">Practical notes and routine-planning ideas over about 16 days, including occasional paid PDF offers. Separate signup and email confirmation required. Your guide is already yours.</p>
              </div>
            )}

            {/* Quick Access CTAs */}
            <div className="w-full max-w-sm space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
              <a
                href="/The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                download="The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-[#B85D36] hover:bg-[#9B4E2D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all group cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Guide (Instant .pdf)</span>
              </a>

              <button
                type="button"
                onClick={handleOpenReaderFromSuccess}
                className="w-full flex items-center justify-center gap-2.5 py-3 sm:py-3.5 px-6 bg-[#14382B] hover:bg-[#0E281E] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all group cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-300" />
                <span>Open the Full Guide</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-[#8C877D]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Guide access does not enroll you in marketing emails.</span>
            </div>
          </div>
        ) : (
          /* Form View */
          <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
            {/* Left Panel: Cover & Highlights (Desktop only: 5 cols, hidden on mobile so form appears immediately) */}
            <div className="hidden md:flex md:col-span-5 bg-[#F2EDE4] p-6 sm:p-8 flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5DFD5]">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14382B] text-white text-[10px] font-semibold tracking-wider uppercase">
                  <Sparkles className="w-3 h-3 text-[#EAD3C7]" />
                  Complimentary eBook
                </div>

                <>
                    <div className="relative rounded-lg overflow-hidden shadow-lg border border-[#DCD5C9] group">
                      <img
                        src="/assets/images/ebook_cover_guide_1793359029909.jpg"
                        alt="The 7-Day Gentle Gut Reset eBook Cover"
                        className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white">
                        <span className="text-[11px] font-serif font-medium">5 Chapters · 7-Day Reset Tracker Included</span>
                      </div>
                    </div>
                    <div className="space-y-2 pt-1 text-xs text-[#4A463F]">
                      <div className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#14382B] shrink-0 mt-0.5" /><span>The Gut-Brain connection & bowel motility biology</span></div>
                      <div className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#14382B] shrink-0 mt-0.5" /><span>Gradual food choices without blanket restrictions</span></div>
                      <div className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#14382B] shrink-0 mt-0.5" /><span>Printable 7-Day Habit Tracker & symptom diary</span></div>
                    </div>
                </>
              </div>

              <div className="pt-4 border-t border-[#DCD5C9]/80 text-[11px] text-[#7A7469] italic">
                Educational content for general information; not medical advice.
              </div>
            </div>

            {/* Right Panel: Lead Capture Form (Mobile: Full width instant form, Desktop: 7 cols) */}
            <div className="col-span-1 md:col-span-7 p-6 sm:p-7 md:p-8 flex flex-col justify-between space-y-4 sm:space-y-5">

              {/* Header - Exactly matches user's screenshot as the immediate top view */}
              <div className="space-y-2 pr-8 sm:pr-0">
                <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#B85D36] font-bold">
                  Instant Download & In-Browser Access
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#14382B] leading-tight">
                  Get The 7-Day Gentle Gut Reset eBook
                </h3>
                <p className="text-xs sm:text-sm text-[#4A463F] leading-relaxed">
                  {guideEmailAvailable
                    ? 'Request an email copy of the free guide and unlock the reader and printable tracker immediately. No purchase or marketing signup required.'
                    : 'Enter your email to unlock the reader and printable tracker immediately. Save your PDF from the download button after your request.'}
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* The Form - Immediately actionable on Mobile */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* First Name Field */}
                <div>
                  <label htmlFor="lead-name" className="block text-xs font-semibold text-[#14382B] mb-1">
                    First Name <span className="text-[#8C877D] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8C877D] absolute left-3.5 top-3" />
                    <input
                      id="lead-name"
                      type="text"
                      placeholder="e.g. Maria"
                      value={firstName}
                      disabled={isLoading}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#D5CFC5] rounded-xl text-sm text-[#14382B] placeholder-[#A49F96] focus:outline-none focus:ring-2 focus:ring-[#14382B]/20 focus:border-[#14382B]"
                    />
                  </div>
                </div>

                {/* Email Address Field */}
                <div>
                  <label htmlFor="lead-email" className="block text-xs font-semibold text-[#14382B] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C877D] absolute left-3.5 top-3" />
                    <input
                      id="lead-email"
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={email}
                      disabled={isLoading}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#D5CFC5] rounded-xl text-sm text-[#14382B] placeholder-[#A49F96] focus:outline-none focus:ring-2 focus:ring-[#14382B]/20 focus:border-[#14382B]"
                    />
                  </div>
                </div>

                <div className="text-xs text-[#4A463F] leading-relaxed bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD5]">
                  This request is for the free guide. The optional follow-up email series has a separate signup and confirmation step. <a href="/privacy.html" className="underline underline-offset-2">Privacy policy</a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isConfigLoading}
                  className="w-full py-3.5 px-6 bg-[#14382B] hover:bg-[#0E281E] disabled:bg-[#14382B]/60 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isLoading || isConfigLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isConfigLoading ? 'Preparing your guide...' : 'Saving your request...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{guideEmailAvailable ? 'Email My Guide & Unlock Download' : 'Get Instant Access & Free eBook'}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Direct Reader Bypass Option & Trust Badges */}
              <div className="space-y-2.5 pt-1.5 border-t border-[#E5DFD5]">

                <div className="flex items-center justify-center gap-2 sm:gap-3 text-[11px] text-[#8C877D]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Your email is used for this guide request
                  </span>
                  <span>·</span>
                  <span>Instant Browser Access</span>
                  <span>·</span>
                  <span>Printable Tracker</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCaptureModal;

