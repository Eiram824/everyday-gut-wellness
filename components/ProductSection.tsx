/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Smartphone,
  Printer
} from 'lucide-react';
import { PLANNER_PRODUCT_INFO } from '../constants';

interface ProductSectionProps {
  onJoinWaitlist?: () => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({ onJoinWaitlist }) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'daily' | 'fiber' | 'bristol' | 'weekly'>('daily');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleInterestClick = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'planner_interest_click');
    }
    onJoinWaitlist?.();
  };

  const plannerModules = [
    { number: '01', title: 'Introduction & Daily Instructions', desc: 'How to pace yourself, establish baseline awareness, and avoid habit overload.' },
    { number: '02', title: '30-Day Habit Tracker Grid', desc: 'High-level monthly milestone tracker for hydration, walking pauses, and bedtime routines.' },
    { number: '03', title: 'Daily Food & Hydration Journal', desc: 'Structured logs for meal composition, fluid timing, and mindful chewing awareness.' },
    { number: '04', title: 'Fiber & Nutrition Awareness Worksheets', desc: 'Evidence-informed guide to gentle soluble fibers, plant diversity, and gradual tolerance.' },
    { number: '05', title: 'Weekly Meal Planning Worksheets', desc: 'Stress-free templates to plan balanced, whole-food grocery staples with ease.' },
    { number: '06', title: 'Gentle Movement & Routine Tracker', desc: 'Post-meal walking logs, desk posture reminders, and pelvic floor ergonomics.' },
    { number: '07', title: 'Sleep & Lifestyle Habit Tracker', desc: 'Evening wind-down logs to support healthy autonomic nervous system balance.' },
    { number: '08', title: 'Digestive Symptom Observation Diary', desc: 'Objective scale to log occasional bloating and comfort patterns without anxiety.' },
    { number: '09', title: 'Bristol Stool Chart Clinical Reference', desc: 'Educational medical reference to understand stool transit times and consistency.' },
    { number: '10', title: 'Weekly Reflection & Adjustment Pages', desc: 'End-of-week reviews to celebrate habit consistency and refine your routine.' },
    { number: '11', title: 'Final 30-Day Progress Review', desc: 'A holistic synthesis of your digestive self-care journey and future maintenance plan.' },
  ];

  const faqs = [
    {
      q: 'Is this planner a medical treatment, detox cleanse, or diet plan?',
      a: 'No. The 30-Day Digestive Wellness Planner is strictly an educational workbook and personal habit-tracking tool. It does not treat, cure, or diagnose any medical condition, nor does it prescribe restrictive diets, laxatives, or supplements. It is designed to help you organize daily hydration, fiber intake, and gentle lifestyle habits.',
    },
    {
      q: 'Can I buy or download the planner now?',
      a: 'Not yet. The planner is still being prepared, and there is no checkout or download available. You can register interest here; doing so does not place an order or charge you.',
    },
    {
      q: 'Can I print it or use it on my tablet / iPad?',
      a: 'Those formats are being considered, but the final planner and its file formats are not ready yet. We will publish the confirmed contents before any product becomes available.',
    },
    {
      q: 'Does this product recommend specific supplements or laxatives?',
      a: 'No. Everyday Gut Wellness focuses on sustainable whole-food nutrition, consistent hydration, and lifestyle ergonomics. We do not prescribe dietary supplements, medications, or aggressive flushes. If you are considering any supplement, we encourage you to consult your physician or registered dietitian.',
    },
    {
      q: 'What if I have chronic constipation, severe pain, or concerning symptoms?',
      a: 'Persistent abdominal pain, bleeding, unexplained weight loss, or severe bowel changes are red-flag symptoms that require immediate clinical evaluation by a licensed physician or gastroenterologist. A habit journal should never delay or replace professional medical care.',
    },
  ];

  return (
    <section id="planner-product" className="scroll-mt-24 py-20 md:py-28 bg-[#F3EFE6] border-b border-[#E5DFD5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#14382B]/10 text-[#14382B] rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#B85D36]" />
            <span>Original Educational Publication</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#14382B] tracking-tight [text-wrap:balance]">
            {PLANNER_PRODUCT_INFO.title}
          </h2>
          <p className="text-base sm:text-lg text-[#635F57] leading-relaxed max-w-2xl mx-auto">
            A practical workbook concept for organizing daily hydration, varied plant foods, gentle movement, and unhurried routines. Join the interest list while we prepare the finished edition.
          </p>
        </div>

        {/* Product Showcase Card */}
        <div className="bg-white rounded-3xl border-2 border-[#14382B]/15 shadow-xl overflow-hidden max-w-5xl mx-auto mb-16">
          {/* Card Top Banner */}
          <div className="bg-[#14382B] text-white px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#EAD3C7]" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">
                In Development · Join the Interest List
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#EAD3C7]">
              <span className="bg-white/10 px-2.5 py-0.5 rounded font-mono font-semibold text-white">In Development</span>
              <span>·</span>
              <span>Planned print & tablet formats</span>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 space-y-12">
            
            {/* Main Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Product Visual Mockup */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative rounded-2xl bg-[#F8F6F0] p-6 border border-[#E5DFD5] shadow-inner text-center">
                  <div className="inline-block px-3 py-1 rounded bg-[#B85D36] text-white text-[11px] font-bold uppercase tracking-wider mb-4">
                    Planner Concept Preview
                  </div>
                  
                  {/* Book Mockup Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg border border-[#E5DFD5] p-5 text-left space-y-3 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-2 text-[11px] text-[#8C877D]">
                      <span>Everyday Gut Wellness</span>
                      <span>Edition 2026</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#B85D36]">30-Day System</span>
                      <h4 className="text-lg font-serif font-bold text-[#14382B] leading-snug">
                        The 30-Day Digestive Wellness Planner
                      </h4>
                      <p className="text-xs text-[#635F57] leading-relaxed">
                        Daily journals, food & fluid logs, fiber checklists, and weekly reflections.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between text-xs text-[#14382B]">
                      <span className="font-semibold">Preview concept</span>
                      <span className="text-[11px] text-[#8C877D]">Not for sale yet</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#635F57]">
                    <span className="flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5 text-[#14382B]" />
                      Planned print format
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-[#14382B]" />
                      Planned tablet format
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Description & Pitch */}
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B85D36]">
                    Designed for Everyday Consistency
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#14382B] leading-tight">
                    Take the Guesswork Out of Your Digestive Self-Care
                  </h3>
                  <p className="text-sm sm:text-base text-[#4A463F] leading-relaxed">
                    Most people know that fiber, fluids, and movement matter—but tracking them consistently without overwhelm is the real hurdle. This practical planner gives you structured, non-judgmental worksheets to observe what works for your unique physiology over 30 days.
                  </p>
                </div>

                {/* Who It Is For */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#14382B]">
                    Who This Planner Is Being Designed For:
                  </h4>
                  <ul className="text-xs sm:text-sm text-[#4A463F] space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                      <span>Adults seeking a calm, daily routine to log meal patterns, hydration, and movement without extreme diets.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                      <span>People looking to gradually increase dietary fiber variety while avoiding sudden gas or bloating discomfort.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                      <span>Anyone who wants an organized, clear symptom log to share with their primary doctor or gastroenterologist.</span>
                    </li>
                  </ul>
                </div>

                {/* What Customers Will Receive */}
                <div className="p-4 bg-[#F8F6F0] rounded-xl border border-[#E5DFD5] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#14382B]">
                    Planned Workbook Sections:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#635F57]">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#B85D36] shrink-0" />
                      <span>Daily habit and routine logs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#B85D36] shrink-0" />
                      <span>Food and hydration journal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#B85D36] shrink-0" />
                      <span>Fiber and movement awareness worksheets</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#B85D36] shrink-0" />
                      <span>Weekly reflection pages</span>
                    </div>
                  </div>
                </div>

                {/* Interest-list CTA */}
                <div className="pt-3 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <button
                      type="button"
                      onClick={handleInterestClick}
                      className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#B85D36] hover:bg-[#A04E2B] active:scale-[0.99] text-white font-serif font-bold text-base rounded-xl shadow-lg transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B85D36]/30 group cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#EAD3C7]" />
                      <span>Register Planner Interest</span>
                    </button>
                    
                    <span className="text-xs text-[#8C877D] text-center sm:text-left">
                      No purchase or payment. We will share updates only if you opt in.
                    </span>
                  </div>

                  <div className="text-[11px] text-[#8C877D] flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Registering interest does not place an order or subscribe you to marketing.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 11 Core Workbook Modules */}
            <div className="pt-8 border-t border-[#E5DFD5] space-y-6">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B85D36]">Inside the Workbook</span>
                <h4 className="text-2xl font-serif font-bold text-[#14382B]">
                  Proposed 11-Section Planner Outline
                </h4>
                <p className="text-xs sm:text-sm text-[#635F57] max-w-xl mx-auto">
                  Every section is carefully organized for daily clarity, evidence-informed guidance, and sustainable habit formation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plannerModules.map((mod, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5] space-y-1.5 hover:border-[#14382B]/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-[#14382B] text-white flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                        {mod.number}
                      </span>
                      <h5 className="font-serif font-bold text-sm text-[#14382B]">
                        {mod.title}
                      </h5>
                    </div>
                    <p className="text-xs text-[#635F57] leading-relaxed pl-8">
                      {mod.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Pages Preview Section */}
            <div className="pt-8 border-t border-[#E5DFD5] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B85D36]">Workbook Preview</span>
                  <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#14382B]">
                    Sample Page Layouts
                  </h4>
                </div>
                
                <div className="flex items-center gap-1.5 bg-[#F8F6F0] p-1 rounded-xl border border-[#E5DFD5] text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('daily')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activePreviewTab === 'daily'
                        ? 'bg-[#14382B] text-white'
                        : 'text-[#635F57] hover:text-[#14382B]'
                    }`}
                  >
                    Daily Journal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('fiber')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activePreviewTab === 'fiber'
                        ? 'bg-[#14382B] text-white'
                        : 'text-[#635F57] hover:text-[#14382B]'
                    }`}
                  >
                    Fiber Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('bristol')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activePreviewTab === 'bristol'
                        ? 'bg-[#14382B] text-white'
                        : 'text-[#635F57] hover:text-[#14382B]'
                    }`}
                  >
                    Bristol Reference
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('weekly')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activePreviewTab === 'weekly'
                        ? 'bg-[#14382B] text-white'
                        : 'text-[#635F57] hover:text-[#14382B]'
                    }`}
                  >
                    Weekly Reflection
                  </button>
                </div>
              </div>

              {/* Interactive Preview Canvas */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 min-h-[220px]">
                {activePreviewTab === 'daily' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-[#E5DFD5] pb-2 text-xs text-[#8C877D]">
                      <span>Module 03 Preview · Daily Food & Hydration Spread</span>
                      <span>8.5" x 11" Layout</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-[#E5DFD5] space-y-1">
                        <span className="font-bold text-[#14382B] block">Morning Hydration</span>
                        <div className="h-2 w-3/4 bg-[#EAF1ED] rounded" />
                        <span className="text-[11px] text-[#635F57]">Time: 7:15 AM · 16 oz warm water</span>
                        <div className="text-[11px] text-emerald-800">✓ Gastrocolic reflex noted</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#E5DFD5] space-y-1">
                        <span className="font-bold text-[#14382B] block">Midday Meal Log</span>
                        <div className="h-2 w-2/3 bg-[#F8EFEA] rounded" />
                        <span className="text-[11px] text-[#635F57]">Oatmeal + Chia Seeds (Soluble)</span>
                        <div className="text-[11px] text-[#635F57]">Chewed thoroughly: 18 chews/bite</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#E5DFD5] space-y-1">
                        <span className="font-bold text-[#14382B] block">Evening Wind-Down</span>
                        <div className="h-2 w-1/2 bg-[#EAF1ED] rounded" />
                        <span className="text-[11px] text-[#635F57]">Dinner completed 3h before bed</span>
                        <div className="text-[11px] text-emerald-800">✓ 15-min post-meal stroll</div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'fiber' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-[#E5DFD5] pb-2 text-xs text-[#8C877D]">
                      <span>Module 04 Preview · Fiber & Nutrition Awareness Worksheet</span>
                      <span>Gradual Addition Framework</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E5DFD5] space-y-2 text-xs text-[#4A463F]">
                      <p><strong>Guidance Rule:</strong> Add fiber gradually over 1–2 weeks and ensure hydration rises in tandem to prevent temporary gas.</p>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E5DFD5]">
                          <strong className="text-[#14382B] block mb-1">Soluble Gel Matrix (Gentle)</strong>
                          <span className="text-[11px] text-[#635F57]">Rolled oats, peeled apples, lentils, chia seeds, cooked carrots.</span>
                        </div>
                        <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E5DFD5]">
                          <strong className="text-[#14382B] block mb-1">Insoluble Bulk Matrix (Paced)</strong>
                          <span className="text-[11px] text-[#635F57]">Wheat bran, raw broccoli florets, fruit skins, leafy greens.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'bristol' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-[#E5DFD5] pb-2 text-xs text-[#8C877D]">
                      <span>Module 09 Preview · Bristol Stool Form Clinical Scale Reference</span>
                      <span>Non-Diagnostic Educational Scale</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-[#E5DFD5] space-y-1">
                        <span className="font-bold text-[#B85D36]">Types 1–2: Hard / Lumpy</span>
                        <span className="text-[11px] text-[#635F57] block">Indicates slower colonic transit. Focus on fluid hydration and soluble gel fibers.</span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-emerald-300 bg-emerald-50/40 space-y-1">
                        <span className="font-bold text-emerald-800">Types 3–4: Smooth / Soft</span>
                        <span className="text-[11px] text-emerald-900 block">Normal physiological transit. Easy to pass without straining or urgency.</span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#E5DFD5] space-y-1">
                        <span className="font-bold text-[#B85D36]">Types 5–7: Loose / Liquid</span>
                        <span className="text-[11px] text-[#635F57] block">Rapid transit or irritation. If persistent for weeks, consult a physician.</span>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'weekly' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-[#E5DFD5] pb-2 text-xs text-[#8C877D]">
                      <span>Module 10 Preview · Weekly Reflection & Habit Tuning</span>
                      <span>End-of-Week Check-In</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E5DFD5] space-y-2 text-xs text-[#4A463F]">
                      <div className="flex items-center gap-2 font-semibold text-[#14382B]">
                        <Calendar className="w-3.5 h-3.5 text-[#B85D36]" />
                        <span>Weekly Assessment Questions:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-[#635F57] text-xs">
                        <li>Which meals felt easiest to digest and left you feeling light and energized?</li>
                        <li>Did you observe any recurring patterns between rushed mornings and bowel delays?</li>
                        <li>How did 10-minute post-meal walks affect afternoon abdominal comfort?</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="pt-8 border-t border-[#E5DFD5] space-y-4">
              <div className="text-center space-y-1 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B85D36]">Transparency</span>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#14382B]">
                  Frequently Asked Questions
                </h4>
              </div>

              <div className="space-y-3 max-w-3xl mx-auto">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="border border-[#E5DFD5] rounded-xl overflow-hidden bg-[#FAF8F5]">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-[#14382B] hover:bg-[#F3EFE6] transition-colors"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-[#8C877D]" /> : <ChevronDown className="w-4 h-4 text-[#8C877D]" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-[#4A463F] leading-relaxed border-t border-[#E5DFD5]/60 bg-white">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scientific & Clinical Educational Disclaimer */}
            <div className="pt-8 border-t border-[#E5DFD5]">
              <div className="bg-[#F8F6F0] rounded-2xl p-5 sm:p-6 border border-[#E5DFD5] flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-[#B85D36] shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-xs text-[#635F57] leading-relaxed">
                  <strong className="text-[#14382B] block text-xs font-semibold uppercase tracking-wider">
                    Important Health & Educational Notice:
                  </strong>
                  <p>
                    <strong>The 30-Day Digestive Wellness Planner</strong> is published strictly for educational and personal organization purposes. It does not diagnose, treat, cure, or prevent any illness, disease, or digestive disorder. It does not promise guaranteed metabolic changes, weight loss, or the total elimination of bloating or constipation.
                  </p>
                  <p>
                    Fiber tolerance is individual: we always advise introducing high-fiber foods gradually alongside adequate fluids. Do not begin extreme dietary changes without consulting a qualified physician or registered dietitian, particularly if you have an inflammatory bowel disease, diabetes, or renal restrictions. If you experience persistent abdominal pain, rectal bleeding, or sudden changes in bowel habits, seek immediate medical attention from a qualified medical provider.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductSection;
