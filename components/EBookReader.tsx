/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Download, 
  Share2, 
  Droplet, 
  Sparkles, 
  Utensils, 
  Activity, 
  HeartPulse, 
  ArrowLeft,
  Calendar,
  FileText
} from 'lucide-react';

interface EBookReaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EBookReader: React.FC<EBookReaderProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'tracker'>('cover');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      <div 
        className="relative w-full max-w-4xl bg-[#FBF9F5] text-[#2D2A26] rounded-2xl shadow-2xl border border-[#E5DFD5] flex flex-col my-auto max-h-[92vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ebook-modal-title"
      >
        {/* Top Header Bar (Hidden in Print) */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-[#E5DFD5] shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EAF1ED] text-[#14382B] flex items-center justify-center font-serif font-bold text-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#B85D36]">Official Wellness Publication</span>
              <h2 id="ebook-modal-title" className="text-sm sm:text-base font-serif font-bold text-[#14382B] truncate max-w-xs sm:max-w-md">
                The 7-Day Gentle Gut Reset Guide
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/The-7-Day-Gentle-Gut-Reset-Guide.pdf"
              download="The-7-Day-Gentle-Gut-Reset-Guide.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14382B] hover:bg-[#0E281E] text-white text-xs font-semibold shadow-sm transition-all"
              title="Download PDF File Directly"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
              <span>Download PDF</span>
            </a>

            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE6] hover:bg-[#E5DFD5] text-[#14382B] text-xs font-medium transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleShare}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE6] hover:bg-[#E5DFD5] text-[#14382B] text-xs font-medium transition-colors"
              title="Copy Guide Link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-[#635F57] hover:text-[#14382B] hover:bg-[#F3EFE6] transition-colors ml-1"
              aria-label="Close eBook Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Navigation Tabs (Hidden in Print) */}
        <nav className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-[#F3EFE6]/80 border-b border-[#E5DFD5] overflow-x-auto text-xs font-medium shrink-0 no-scrollbar print:hidden">
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'cover' ? 'bg-[#14382B] text-white shadow-sm' : 'text-[#635F57] hover:text-[#14382B] hover:bg-white/60'
            }`}
          >
            Overview & Cover
          </button>
          <button
            onClick={() => setActiveTab('ch1')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'ch1' ? 'bg-[#14382B] text-white shadow-sm' : 'text-[#635F57] hover:text-[#14382B] hover:bg-white/60'
            }`}
          >
            Ch. 1: Physiology of Transit
          </button>
          <button
            onClick={() => setActiveTab('ch2')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'ch2' ? 'bg-[#14382B] text-white shadow-sm' : 'text-[#635F57] hover:text-[#14382B] hover:bg-white/60'
            }`}
          >
            Ch. 2: The 5 Pillars
          </button>
          <button
            onClick={() => setActiveTab('ch3')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'ch3' ? 'bg-[#14382B] text-white shadow-sm' : 'text-[#635F57] hover:text-[#14382B] hover:bg-white/60'
            }`}
          >
            Ch. 3: 7-Day Action Plan
          </button>
          <button
            onClick={() => setActiveTab('ch4')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'ch4' ? 'bg-[#14382B] text-white shadow-sm' : 'text-[#635F57] hover:text-[#14382B] hover:bg-white/60'
            }`}
          >
            Ch. 4: Food Swaps
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'tracker' ? 'bg-[#B85D36] text-white shadow-sm' : 'text-[#635F57] hover:text-[#B85D36] hover:bg-white/60'
            }`}
          >
            Ch. 5: Daily Tracker (Printable)
          </button>
        </nav>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 space-y-10 print:overflow-visible print:p-0 print:space-y-8">

          {/* OVERVIEW / COVER */}
          {(activeTab === 'cover' || window.matchMedia?.('print')?.matches) && (
            <section className="space-y-8 animate-fadeIn">
              {/* Editorial Cover Banner */}
              <div className="relative rounded-2xl overflow-hidden bg-[#14382B] text-white p-6 sm:p-10 shadow-lg border border-[#0E281E]">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs tracking-wider uppercase font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      Free Comprehensive Edition · 2026
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#FBF9F5] leading-tight">
                      The 7-Day Gentle Gut Reset
                    </h1>
                    <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed font-light">
                      A practical, physiology-backed guide to easing bloating, supporting bowel regularity, and building sustainable digestive rhythm without harsh detoxes or laxatives.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
                      <span>✓ Evidence-Based Guidelines</span>
                      <span>•</span>
                      <span>✓ 10-Minute Daily Practices</span>
                      <span>•</span>
                      <span>✓ Printable Symptom Log</span>
                    </div>

                    <div className="pt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab('ch1')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B85D36] hover:bg-[#9B4E2D] text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
                      >
                        <span>Start Reading Chapter 1</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <a
                        href="/The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                        download="The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#14382B] hover:bg-emerald-50 rounded-lg text-sm font-bold transition-all shadow-md"
                      >
                        <Download className="w-4 h-4 text-[#B85D36]" />
                        <span>Download Free PDF Guide</span>
                      </a>
                      <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                        title="Print or Save via Browser"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Print</span>
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex justify-center">
                    <div className="relative group max-w-xs rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                      <img 
                        src="/assets/images/ebook_cover_guide_1793359029909.jpg" 
                        alt="The 7-Day Gentle Gut Reset eBook Cover" 
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                        <span className="text-xs text-white/90 font-medium tracking-wide">
                          Everyday Gut Wellness Editorial Series
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Author Note & Medical Framing */}
              <div className="bg-white p-6 rounded-xl border border-[#E5DFD5] shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B85D36]">
                  <CheckCircle2 className="w-4 h-4" />
                  Editorial Core Philosophy
                </div>
                <h3 className="text-xl font-serif font-bold text-[#14382B]">
                  Why Gentle Rhythm Beats Radical Cleanses Every Time
                </h3>
                <p className="text-sm text-[#4A463F] leading-relaxed">
                  The internet is saturated with overnight detoxes, colon cleanses, and aggressive laxative teas. 
                  However, human gastrointestinal physiology does not require "flushing." Your gut is an intelligent, self-regulating organ system containing trillions of microorganisms, complex neuromuscular networks, and a dedicated internal rhythm.
                </p>
                <p className="text-sm text-[#4A463F] leading-relaxed">
                  This 7-day protocol is designed not to shock your body, but to <strong>remove the physiological roadblocks</strong>—such as dehydration, rushed chewing, inconsistent meal timing, and lack of gentle movement—that prevent your digestive system from performing its natural job.
                </p>
              </div>

              {/* Table of Contents Box */}
              <div className="bg-[#F3EFE6] p-6 rounded-xl border border-[#E5DFD5] space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#14382B]">
                  Table of Contents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <button 
                    onClick={() => setActiveTab('ch1')}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/80 hover:bg-white text-left transition-colors border border-[#E5DFD5]/60 group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#B85D36] block">Chapter 1</span>
                      <span className="font-medium text-[#14382B] group-hover:underline">The Physiology of Digestion</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C877D] group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={() => setActiveTab('ch2')}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/80 hover:bg-white text-left transition-colors border border-[#E5DFD5]/60 group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#B85D36] block">Chapter 2</span>
                      <span className="font-medium text-[#14382B] group-hover:underline">The 5 Non-Negotiable Daily Habits</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C877D] group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={() => setActiveTab('ch3')}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/80 hover:bg-white text-left transition-colors border border-[#E5DFD5]/60 group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#B85D36] block">Chapter 3</span>
                      <span className="font-medium text-[#14382B] group-hover:underline">The 7-Day Day-by-Day Protocol</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C877D] group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={() => setActiveTab('ch4')}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/80 hover:bg-white text-left transition-colors border border-[#E5DFD5]/60 group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#B85D36] block">Chapter 4</span>
                      <span className="font-medium text-[#14382B] group-hover:underline">Smart Swaps for Bloating</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C877D] group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={() => setActiveTab('tracker')}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/80 hover:bg-white text-left transition-colors border border-[#E5DFD5]/60 group sm:col-span-2"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#B85D36] block">Chapter 5</span>
                      <span className="font-medium text-[#14382B] group-hover:underline">Printable Daily Habit & Symptom Log</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C877D] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* CHAPTER 1 */}
          {(activeTab === 'ch1' || window.matchMedia?.('print')?.matches) && (
            <article className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#E5DFD5] shadow-sm">
              <div className="border-b border-[#E5DFD5] pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B85D36]">Chapter 1</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#14382B] mt-1">
                  How Your Digestive Engine Actually Works
                </h3>
                <p className="text-xs text-[#8C877D] mt-1">Understanding Transit Time, Gut-Brain Wiring, and Peristalsis</p>
              </div>

              <div className="prose text-sm text-[#4A463F] space-y-4 leading-relaxed">
                <p>
                  To fix irregularity and chronic afternoon bloating, you first need to understand the physical roadmap food takes through your body. Digestion is an intricate 24 to 72-hour journey requiring coordinated muscular contractions (called <em>peristalsis</em>) and chemical breakdown.
                </p>

                <h4 className="text-base font-serif font-bold text-[#14382B] pt-2">
                  1. The Gut-Brain Axis and Stress Signals
                </h4>
                <p>
                  Your gut contains over 500 million neurons—often referred to as the <strong>Enteric Nervous System (ENS)</strong>. When you are rushing in the morning, stressed by work emails, or eating in a hurry, your body remains in <em>Sympathetic Mode</em> (fight-or-flight).
                </p>
                <div className="bg-[#EAF1ED] p-4 rounded-xl border border-[#D5E3DB] text-xs text-[#14382B]">
                  <strong>Key Takeaway:</strong> Blood flow is redirected away from the stomach and intestines during high stress. Digestion requires the <em>Parasympathetic state</em> ("Rest and Digest"). Taking just three slow, deep diaphragmatic breaths before lifting your fork immediately activates gastric acid secretion and motility.
                </div>

                <h4 className="text-base font-serif font-bold text-[#14382B] pt-2">
                  2. Realistic Transit Times: Why Daily Is Not Always Mandatory
                </h4>
                <p>
                  A common anxiety is assuming you must have a bowel movement every single morning at 7:00 AM. In clinical gastroenterology, the normal spectrum ranges from <strong>three times per day to three times per week</strong>, provided stool consistency is comfortable (Type 3 or Type 4 on the Bristol Stool Chart) without severe straining or feeling incomplete.
                </p>

                <h4 className="text-base font-serif font-bold text-[#14382B] pt-2">
                  3. The Gastrocolic Reflex: Your Natural Morning Catalyst
                </h4>
                <p>
                  When food or warm liquid enters an empty stomach, nerve signals trigger mass contractions in the colon. This natural response is strongest after waking up and following breakfast. Resisting this urge due to a rushed commute teaches the bowel over time to ignore its natural evacuation reflex.
                </p>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-[#E5DFD5]">
                <button
                  onClick={() => setActiveTab('cover')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#635F57] hover:text-[#14382B]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab('ch2')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14382B] text-white rounded-lg text-xs font-semibold hover:bg-[#0E281E]"
                >
                  <span>Chapter 2: The 5 Daily Habits</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          )}

          {/* CHAPTER 2 */}
          {(activeTab === 'ch2' || window.matchMedia?.('print')?.matches) && (
            <article className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#E5DFD5] shadow-sm">
              <div className="border-b border-[#E5DFD5] pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B85D36]">Chapter 2</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#14382B] mt-1">
                  The 5 Non-Negotiable Daily Habits
                </h3>
                <p className="text-xs text-[#8C877D] mt-1">The foundational lifestyle anchors that restore gut ease</p>
              </div>

              {/* Graphic Feature */}
              <div className="rounded-xl overflow-hidden border border-[#E5DFD5] bg-[#F3EFE6]">
                <img 
                  src="/assets/images/gut_healthy_bowl_1793359029827.jpg" 
                  alt="Nutrient-dense gut wellness bowl with sweet potatoes, greens, quinoa and healthy fats"
                  className="w-full h-48 sm:h-64 object-cover"
                  loading="lazy"
                />
                <div className="p-3 text-center text-xs text-[#635F57]">
                  Plate diversity: Balancing soluble gel-forming fibers with complex whole foods supports beneficial microbiome diversity.
                </div>
              </div>

              <div className="space-y-6 text-sm text-[#4A463F] leading-relaxed">
                {/* Habit 1 */}
                <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5]/80 space-y-2">
                  <div className="flex items-center gap-2 text-[#14382B] font-serif font-bold text-base">
                    <Droplet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Habit 1: Hydration Timing Over Hydration Gulping</span>
                  </div>
                  <p>
                    Drinking two glasses of room-temperature or warm water immediately upon waking stimulates the gastrocolic reflex. During meals, sip small amounts rather than gulping giant iced glasses, which can dilute digestive enzymes and cause you to swallow excess air.
                  </p>
                </div>

                {/* Habit 2 */}
                <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5]/80 space-y-2">
                  <div className="flex items-center gap-2 text-[#14382B] font-serif font-bold text-base">
                    <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Habit 2: The 20-Chew Mindfulness Practice</span>
                  </div>
                  <p>
                    Your stomach does not have teeth. When large, un-chewed chunks of complex carbohydrates reach the intestines, gut bacteria ferment them prematurely, producing excess hydrogen and methane gas. Chewing each mouthful until it becomes nearly liquid reduces digestive workload by 50%.
                  </p>
                </div>

                {/* Habit 3 */}
                <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5]/80 space-y-2">
                  <div className="flex items-center gap-2 text-[#14382B] font-serif font-bold text-base">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Habit 3: Soluble Fiber Prioritization</span>
                  </div>
                  <p>
                    People struggling with bloating often make the mistake of overloading on raw kale, bran, or raw broccoli (insoluble fiber). Instead, emphasize <strong>soluble, gel-forming fiber</strong> like rolled oats, chia seeds, peeled carrots, cooked sweet potatoes, and oranges. Soluble fiber absorbs water and forms a smooth gel, allowing effortless transit.
                  </p>
                </div>

                {/* Habit 4 */}
                <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5]/80 space-y-2">
                  <div className="flex items-center gap-2 text-[#14382B] font-serif font-bold text-base">
                    <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Habit 4: The 10-Minute Post-Meal Stroll</span>
                  </div>
                  <p>
                    Clinical studies consistently demonstrate that gentle post-meal walking stimulates muscular gastric emptying and helps transport trapped intestinal gas pockets smoothly along the GI tract, preventing distension.
                  </p>
                </div>

                {/* Habit 5 */}
                <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5]/80 space-y-2">
                  <div className="flex items-center gap-2 text-[#14382B] font-serif font-bold text-base">
                    <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Habit 5: The 3-Hour Dinner Cutoff</span>
                  </div>
                  <p>
                    Between meals and during nighttime fasting, the stomach and small intestine initiate the <strong>Migrating Motor Complex (MMC)</strong>—a physiological "street sweeper" wave that clears residual debris and bacteria into the colon. Eating right before bedtime shuts down the MMC, leading to morning sluggishness and nausea.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-[#E5DFD5]">
                <button
                  onClick={() => setActiveTab('ch1')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#635F57] hover:text-[#14382B]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Chapter 1</span>
                </button>
                <button
                  onClick={() => setActiveTab('ch3')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14382B] text-white rounded-lg text-xs font-semibold hover:bg-[#0E281E]"
                >
                  <span>Chapter 3: 7-Day Plan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          )}

          {/* CHAPTER 3 */}
          {(activeTab === 'ch3' || window.matchMedia?.('print')?.matches) && (
            <article className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#E5DFD5] shadow-sm">
              <div className="border-b border-[#E5DFD5] pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B85D36]">Chapter 3</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#14382B] mt-1">
                  The 7-Day Day-by-Day Reset Protocol
                </h3>
                <p className="text-xs text-[#8C877D] mt-1">Implement one simple, high-impact habit per day to build permanent rhythm</p>
              </div>

              <div className="space-y-4 text-sm text-[#4A463F]">
                {/* Day 1 */}
                <div className="border border-[#E5DFD5] rounded-xl p-4 bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#14382B] text-white text-xs font-bold font-serif">Day 1</span>
                    <span className="text-xs font-medium text-[#B85D36]">Foundation</span>
                  </div>
                  <h4 className="font-serif font-bold text-[#14382B] text-base">The Morning Hydration Anchor</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    <strong>Action:</strong> Place a 16-oz glass of water beside your bed. Drink it within 15 minutes of waking up, before having coffee or tea. Keep an 8-oz glass of water at your desk for mid-morning and mid-afternoon sips.
                  </p>
                </div>

                {/* Day 2 */}
                <div className="border border-[#E5DFD5] rounded-xl p-4 bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#14382B] text-white text-xs font-bold font-serif">Day 2</span>
                    <span className="text-xs font-medium text-[#B85D36]">Mechanical Ease</span>
                  </div>
                  <h4 className="font-serif font-bold text-[#14382B] text-base">The Screen-Free Chewing Routine</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    <strong>Action:</strong> Set down your phone and laptop during lunch. Count 15 to 20 chews per bite. Notice how much lighter your stomach feels in the mid-afternoon when you aren't swallowing air from rushed swallowing.
                  </p>
                </div>

                {/* Day 3 */}
                <div className="border border-[#E5DFD5] rounded-xl p-4 bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#14382B] text-white text-xs font-bold font-serif">Day 3</span>
                    <span className="text-xs font-medium text-[#B85D36]">Nourishment</span>
                  </div>
                  <h4 className="font-serif font-bold text-[#14382B] text-base">Add One Soluble Gel Booster</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    <strong>Action:</strong> Add 1 tablespoon of chia seeds soaked in water or a small bowl of warm rolled oats to your breakfast. Observe how the gentle soluble mucilage helps soften stool consistency naturally over the next 24 hours.
                  </p>
                </div>

                {/* Day 4 */}
                <div className="border border-[#E5DFD5] rounded-xl p-4 bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#14382B] text-white text-xs font-bold font-serif">Day 4</span>
                    <span className="text-xs font-medium text-[#B85D36]">Audit</span>
                  </div>
                  <h4 className="font-serif font-bold text-[#14382B] text-base">The Gas & Bloat Trigger Pause</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    <strong>Action:</strong> For today, eliminate artificial sweeteners (sucralose, aspartame, sorbitol in gums), carbonated sodas, and seltzers. Replace them with warm peppermint tea or ginger infusion.
                  </p>
                </div>

                {/* Day 5 */}
                <div className="border border-[#E5DFD5] rounded-xl p-4 bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#14382B] text-white text-xs font-bold font-serif">Day 5</span>
                    <span className="text-xs font-medium text-[#B85D36]">Motility</span>
                  </div>
                  <h4 className="font-serif font-bold text-[#14382B] text-base">The 10-Minute Post-Dinner Stroll</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    <strong>Action:</strong> Right after your evening meal, put on walking shoes and complete an easy 10-minute stroll around your neighborhood or living space. Notice how this prevents the heavy, sluggish sensation before bed.
                  </p>
                </div>

                {/* Day 6 */}
                <div className="border border-[#E5DFD5] rounded-xl p-4 bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#14382B] text-white text-xs font-bold font-serif">Day 6</span>
                    <span className="text-xs font-medium text-[#B85D36]">Circadian Rhythm</span>
                  </div>
                  <h4 className="font-serif font-bold text-[#14382B] text-base">The 3-Hour Digestive Night Fast</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    <strong>Action:</strong> Conclude all calorie consumption at least 3 hours prior to sleep. Allow herbal teas or water only. This lets your Migrating Motor Complex cleanse your small bowel uninterrupted while you rest.
                  </p>
                </div>

                {/* Day 7 */}
                <div className="border border-[#E5DFD5] rounded-xl p-4 bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#14382B] text-white text-xs font-bold font-serif">Day 7</span>
                    <span className="text-xs font-medium text-[#B85D36]">Mastery</span>
                  </div>
                  <h4 className="font-serif font-bold text-[#14382B] text-base">The 30-Day Blueprint Synthesis</h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    <strong>Action:</strong> Review your week using the Chapter 5 printable tracker. Celebrate the small improvements: less tension, smoother transit, and lighter morning awakenings.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-[#E5DFD5]">
                <button
                  onClick={() => setActiveTab('ch2')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#635F57] hover:text-[#14382B]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Chapter 2</span>
                </button>
                <button
                  onClick={() => setActiveTab('ch4')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14382B] text-white rounded-lg text-xs font-semibold hover:bg-[#0E281E]"
                >
                  <span>Chapter 4: Food Swaps</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          )}

          {/* CHAPTER 4 */}
          {(activeTab === 'ch4' || window.matchMedia?.('print')?.matches) && (
            <article className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#E5DFD5] shadow-sm">
              <div className="border-b border-[#E5DFD5] pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B85D36]">Chapter 4</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#14382B] mt-1">
                  Smart Food Swaps for Bloat Relief
                </h3>
                <p className="text-xs text-[#8C877D] mt-1">Practical adjustments that decrease fermentation gas while nourishing gut flora</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#14382B] text-white font-serif">
                      <th className="p-3 rounded-tl-lg font-semibold">Common Bloat Catalyst</th>
                      <th className="p-3 font-semibold">Why It Distends</th>
                      <th className="p-3 rounded-tr-lg font-semibold">Gentle Gut Swap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD5] text-[#4A463F]">
                    <tr className="hover:bg-[#F3EFE6]/50 transition-colors">
                      <td className="p-3 font-semibold text-[#B85D36]">Raw cruciferous vegetables (Raw broccoli, raw kale)</td>
                      <td className="p-3">High in raffinose and tough insoluble cellulose that requires vigorous microbial fermentation.</td>
                      <td className="p-3 font-medium text-[#14382B]">Lightly steamed zucchini, roasted carrots, or tender spinach.</td>
                    </tr>
                    <tr className="hover:bg-[#F3EFE6]/50 transition-colors">
                      <td className="p-3 font-semibold text-[#B85D36]">Carbonated water & diet sodas</td>
                      <td className="p-3">Introduces direct carbonic gas into the stomach alongside fermentable artificial polyols (sorbitol, mannitol).</td>
                      <td className="p-3 font-medium text-[#14382B]">Warm ginger tea with fresh lemon or filtered room-temperature water.</td>
                    </tr>
                    <tr className="hover:bg-[#F3EFE6]/50 transition-colors">
                      <td className="p-3 font-semibold text-[#B85D36]">Refined white flour pastries & breads</td>
                      <td className="p-3">Low in water-retaining moisture; forms dense boluses that slow down colonic transit.</td>
                      <td className="p-3 font-medium text-[#14382B]">Slow-fermented genuine sourdough bread or steel-cut oatmeal.</td>
                    </tr>
                    <tr className="hover:bg-[#F3EFE6]/50 transition-colors">
                      <td className="p-3 font-semibold text-[#B85D36]">Large unrinsed canned beans</td>
                      <td className="p-3">Complex oligosaccharides in the canning liquid induce rapid fermentation in the distal colon.</td>
                      <td className="p-3 font-medium text-[#14382B]">Rinsed red lentils cooked with cumin or small peeled edamame.</td>
                    </tr>
                    <tr className="hover:bg-[#F3EFE6]/50 transition-colors">
                      <td className="p-3 font-semibold text-[#B85D36]">Drinking 3 large glasses during lunch</td>
                      <td className="p-3">Dilutes gastric pepsin and expands stomach volume excessively during food intake.</td>
                      <td className="p-3 font-medium text-[#14382B]">Sip 4–6 oz warm herbal tea slowly; drink larger volumes 45 mins after meals.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-[#E5DFD5]">
                <button
                  onClick={() => setActiveTab('ch3')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#635F57] hover:text-[#14382B]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Chapter 3</span>
                </button>
                <button
                  onClick={() => setActiveTab('tracker')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B85D36] text-white rounded-lg text-xs font-semibold hover:bg-[#9B4E2D]"
                >
                  <span>Chapter 5: Printable Daily Tracker</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          )}

          {/* CHAPTER 5: TRACKER */}
          {(activeTab === 'tracker' || window.matchMedia?.('print')?.matches) && (
            <article className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#14382B]/20 shadow-sm print:border-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD5] pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#B85D36]">Chapter 5 · Ready to Print</span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#14382B] mt-1">
                    Daily Gut Wellness & Regularity Tracker
                  </h3>
                  <p className="text-xs text-[#8C877D] mt-1">A simple daily reflection sheet to identify your body's unique rhythms</p>
                </div>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14382B] text-white rounded-lg text-xs font-semibold hover:bg-[#0E281E] shadow-sm shrink-0 print:hidden"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print This Tracker Sheet</span>
                </button>
              </div>

              {/* Printable Template Sheet */}
              <div className="border border-[#14382B]/30 rounded-xl p-5 sm:p-6 bg-[#FBF9F5] space-y-6">
                <div className="flex justify-between items-center text-xs text-[#635F57] border-b border-[#E5DFD5] pb-3">
                  <span><strong>Date:</strong> ___________________</span>
                  <span><strong>Day of Week:</strong> M T W Th F Sa Su</span>
                  <span><strong>Wake-Up Time:</strong> _________ AM</span>
                </div>

                {/* Section A: Hydration & Morning Ritual */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#14382B] flex items-center gap-2">
                    <Droplet className="w-3.5 h-3.5 text-emerald-600" />
                    1. Morning Hydration & Evacuation Reflex
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#4A463F]">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-[#14382B]" />
                      <span>Drank 16 oz warm water within 15 mins of waking</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-[#14382B]" />
                      <span>Dedicated 10 unhurried minutes in the bathroom</span>
                    </label>
                  </div>
                </div>

                {/* Section B: Daily Water Glasses Checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#14382B]">
                    2. Fluid Intake Tally (Target: 8 Glasses / 2 Liters)
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <div key={num} className="flex items-center gap-1.5 text-xs text-[#4A463F]">
                        <input type="checkbox" className="w-4 h-4 rounded text-[#14382B]" />
                        <span>Glass {num}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Soluble Fiber & Meals */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#14382B] flex items-center gap-2">
                    <Utensils className="w-3.5 h-3.5 text-amber-600" />
                    3. Meal Quality & Mindful Chewing
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#4A463F]">
                    <div className="p-2.5 rounded bg-white border border-[#E5DFD5]">
                      <span className="font-semibold block text-[#14382B] mb-1">Breakfast</span>
                      <span>Fiber Source: ______________</span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <input type="checkbox" className="rounded" />
                        <span>Chewed slowly</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-white border border-[#E5DFD5]">
                      <span className="font-semibold block text-[#14382B] mb-1">Lunch</span>
                      <span>Fiber Source: ______________</span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <input type="checkbox" className="rounded" />
                        <span>Chewed slowly</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-white border border-[#E5DFD5]">
                      <span className="font-semibold block text-[#14382B] mb-1">Dinner (Pre-7pm)</span>
                      <span>Fiber Source: ______________</span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <input type="checkbox" className="rounded" />
                        <span>Chewed slowly</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section D: Movement & Bloat Level */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#14382B] flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    4. Evening Reflection & Motility
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#4A463F]">
                    <div className="p-3 bg-white rounded border border-[#E5DFD5]">
                      <span className="font-semibold block text-[#14382B] mb-2">Bloating Level Today:</span>
                      <div className="flex justify-between items-center text-[11px] text-[#635F57]">
                        <span>1 (Flat & Comfortable)</span>
                        <span>5 (Mild Gas)</span>
                        <span>10 (Severe Distension)</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                          <span key={val} className="w-5 h-5 rounded-full border border-[#8C877D] flex items-center justify-center text-[10px] cursor-pointer hover:bg-[#14382B] hover:text-white">
                            {val}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded border border-[#E5DFD5] space-y-2">
                      <span className="font-semibold block text-[#14382B]">Night Protocol Checklist:</span>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Walked 10 mins post-dinner</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>3-hour fast before sleep honored</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notes Line */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-[#14382B] block mb-1">Personal Notes / Trigger Observations:</span>
                  <div className="h-12 border-b border-dashed border-[#8C877D] w-full" />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-[#E5DFD5] print:hidden">
                <button
                  onClick={() => setActiveTab('ch4')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#635F57] hover:text-[#14382B]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Chapter 4</span>
                </button>
                <div className="flex items-center gap-2">
                  <a
                    href="/The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                    download="The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B85D36] hover:bg-[#9B4E2D] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF File (Instant)</span>
                  </a>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14382B] text-white rounded-lg text-xs font-semibold hover:bg-[#0E281E]"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print via Browser</span>
                  </button>
                </div>
              </div>
            </article>
          )}

        </div>

        {/* Footer info (Print hidden) */}
        <footer className="px-6 py-3 bg-white border-t border-[#E5DFD5] flex items-center justify-between text-xs text-[#8C877D] shrink-0 print:hidden">
          <span>© 2026 Everyday Gut Wellness. For educational purposes only.</span>
          <div className="flex items-center gap-3">
            <span className="text-[#14382B] font-semibold">Everyday Gut Wellness Publication</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EBookReader;
