/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Sparkles, Download, CheckCircle2, ArrowRight } from 'lucide-react';

interface EBookBannerProps {
  onOpenEBook: () => void;
}

export const EBookBanner: React.FC<EBookBannerProps> = ({ onOpenEBook }) => {
  return (
    <section id="free-ebook" className="relative py-12 md:py-16 bg-[#F3EFE6] border-b border-[#E5DFD5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
            {/* Visual Book Presentation */}
            <div className="lg:col-span-5 flex justify-center">
              <div 
                onClick={onOpenEBook}
                className="relative cursor-pointer group max-w-sm rounded-xl overflow-hidden shadow-xl border border-[#E5DFD5] transition-transform duration-300 hover:-translate-y-1"
              >
                <img 
                  src="/assets/images/ebook_cover_guide_1793359029909.jpg" 
                  alt="The 7-Day Gentle Gut Reset Free eBook Edition" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[11px] uppercase tracking-widest text-emerald-300 font-semibold">Free Edition</span>
                  <p className="text-sm font-serif font-bold text-white mt-0.5">The 7-Day Gentle Gut Reset</p>
                  <span className="text-xs text-white/80 mt-1 flex items-center gap-1.5 font-sans">
                    <BookOpen className="w-3.5 h-3.5" />
                    Click to Open Full eBook Reader
                  </span>
                </div>
              </div>
            </div>

            {/* Content & Value Proposition */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF1ED] text-[#14382B] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#B85D36]" />
                Exclusive Free Downloadable eBook
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#14382B] leading-tight">
                The 7-Day Gentle Gut Reset Guide
              </h2>

              <p className="text-[#4A463F] text-sm sm:text-base leading-relaxed font-light">
                A clinically grounded, step-by-step masterclass to soothe chronic bloating, stimulate natural peristalsis, and re-establish regular bowel habits without extreme cleanses or artificial stimulants.
              </p>

              {/* What's Inside Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-[#2D2A26]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                  <span><strong>Chapter 1:</strong> The Enteric Nervous System & Transit Biology</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                  <span><strong>Chapter 2:</strong> The 5 Daily Habits That Heal Digestion</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                  <span><strong>Chapter 3:</strong> Day 1 to Day 7 Actionable Reset Protocol</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                  <span><strong>Chapter 4 & 5:</strong> Bloat Swaps & Printable Daily Tracker</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenEBook}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#14382B] hover:bg-[#0E281E] text-white text-sm font-semibold tracking-wide rounded-lg shadow-sm transition-all group"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Read Free eBook Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <a
                  href="/The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                  download="The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#B85D36] hover:bg-[#9B4E2D] text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Free PDF (Instant)</span>
                </a>
              </div>

              <div className="text-[11px] text-[#8C877D] italic">
                100% Free · No credit card required · Instant access directly in your browser
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EBookBanner;
