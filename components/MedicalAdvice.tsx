/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WARNING_SIGNS } from '../constants';
import { AlertTriangle, Clock, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export const MedicalAdvice: React.FC = () => {
  const urgentSigns = WARNING_SIGNS.filter((s) => s.severity === 'urgent');
  const routineSigns = WARNING_SIGNS.filter((s) => s.severity === 'routine');

  return (
    <section id="medical-advice" className="scroll-mt-24 py-20 md:py-28 bg-[#FBF9F5] border-b border-[#E5DFD5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#B85D36]">
            Clinical Safety & Triage
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#14382B] tracking-tight [text-wrap:balance]">
            When to Seek Medical Advice
          </h2>
          <p className="text-base sm:text-lg text-[#635F57] leading-relaxed">
            Lifestyle choices, fiber variety, and proactive hydration support everyday baseline comfort. However, digestive changes can sometimes indicate underlying clinical conditions that require direct examination by a licensed physician. Persistent, recurring, or severe symptoms always warrant professional medical evaluation.
          </p>
        </div>

        {/* Two-Tier Warning Signs Grid */}
        <div className="space-y-12">
          {/* Urgent Red Flag Signs */}
          <div className="bg-white rounded-2xl border border-[#B85D36]/50 p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#B85D36] mb-3">
              <ShieldAlert className="w-5 h-5 text-[#B85D36]" />
              <span>Red Flag Warning Signs · Seek Prompt or Urgent Medical Care</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#14382B] mb-4">
              Symptoms Requiring Immediate Medical Attention
            </h3>

            <p className="text-sm text-[#4A463F] leading-relaxed mb-6">
              If you experience any of the following symptoms, do not attempt to self-manage with lifestyle adjustments, supplements, or home remedies. Seek immediate emergency medical care, call local emergency services, or visit an urgent care facility:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgentSigns.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#F8EFEA]/80 border border-[#EAD3C7] rounded-xl p-4.5 space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#B85D36] shrink-0 mt-0.5" />
                    <h4 className="text-sm font-bold text-[#9A4622] leading-snug">
                      {item.symptom}
                    </h4>
                  </div>
                  <p className="text-xs text-[#4A463F] leading-relaxed pl-6.5">
                    {item.reason}
                  </p>
                  <div className="text-[11px] font-semibold text-[#14382B] pl-6.5 pt-1">
                    Action: {item.actionRequired}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Routine Non-Urgent Signs */}
          <div className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#14382B] mb-3">
              <Clock className="w-4 h-4 text-[#14382B]" />
              <span>Persistent or Progressive Symptoms · Primary Care Consultation</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#14382B] mb-4">
              Symptoms That Warrant Scheduled Clinical Evaluation
            </h3>

            <p className="text-sm text-[#4A463F] leading-relaxed mb-6">
              Occasional mild shifts in digestion following travel, temporary stress, or dietary changes are common. However, persistent symptoms lasting more than 2 to 3 weeks deserve comprehensive evaluation by a primary care doctor or gastroenterologist:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routineSigns.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FBF9F5] border border-[#E5DFD5] rounded-xl p-4.5 space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#14382B] shrink-0 mt-0.5" />
                    <h4 className="text-sm font-bold text-[#14382B] leading-snug">
                      {item.symptom}
                    </h4>
                  </div>
                  <p className="text-xs text-[#635F57] leading-relaxed pl-6.5">
                    {item.reason}
                  </p>
                  <div className="text-[11px] font-semibold text-[#B85D36] pl-6.5 pt-1">
                    Recommendation: {item.actionRequired}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Essential Medical Disclaimer Banner */}
        <div className="mt-12 bg-[#F3EFE6] rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#635F57]">
            <FileText className="w-4 h-4 text-[#14382B]" />
            <span>Official Educational Notice</span>
          </div>
          <p className="text-xs sm:text-sm text-[#4A463F] max-w-3xl mx-auto leading-relaxed">
            The information presented on Everyday Gut Wellness is curated solely for general health literacy and educational purposes. It is not intended to be, and must never be used as, a substitute for personalized medical advice, clinical diagnosis, or specialized treatment. Always consult your primary care doctor, gastroenterologist, or registered dietitian regarding persistent digestive concerns, diagnosis, or individualized care plans.
          </p>
        </div>
      </div>
    </section>
  );
};
export default MedicalAdvice;
