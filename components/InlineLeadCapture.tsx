import React from 'react';
import { LeadCaptureForm, type LeadCaptureFormProps } from './LeadCaptureForm';

export function InlineLeadCapture({ onSuccess, intent = 'guide' }: LeadCaptureFormProps) {
  return <section className="rounded-2xl border border-[#DCD5C9] bg-[#F3EFE6] p-5 sm:p-8">
    <h2 className="font-serif text-2xl font-bold text-[#14382B]">{intent === 'bundle' ? 'A planned $39 bundle. One optional launch alert.' : 'Start with the free 7-Day Gentle Gut Reset Guide'}</h2>
    <p className="mb-5 mt-3 text-sm leading-relaxed text-[#4A463F]">{intent === 'bundle' ? 'Register your interest without buying or joining the educational email series.' : 'Observe everyday habits, use the printable tracker and bring clearer notes to a healthcare conversation. Educational information, not medical advice.'}</p>
    <LeadCaptureForm onSuccess={onSuccess} intent={intent} />
  </section>;
}

export default InlineLeadCapture;
