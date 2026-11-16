import React, { useId, useRef } from 'react';
import { X } from 'lucide-react';
import { LeadCaptureForm } from './LeadCaptureForm';
import { useModalDialog } from '../lib/useDialog';
import type { GuideSubscriber, LeadIntent } from '../lib/guide-access';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (subscriber: GuideSubscriber) => void;
  intent?: LeadIntent;
}

export function LeadCaptureModal({ isOpen, onClose, onSuccess, intent = 'guide' }: LeadCaptureModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  useModalDialog(dialogRef, isOpen, onClose);
  if (!isOpen) return null;
  return <dialog ref={dialogRef} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} tabIndex={-1}
    className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] p-5 text-[#2C2A26] shadow-2xl backdrop:bg-black/65 sm:p-8">
    <button type="button" onClick={onClose} aria-label="Close signup" className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#4A463F] hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#14382B]"><X className="h-5 w-5" aria-hidden="true" /></button>
    <p className="mb-3 pr-12 text-xs font-semibold uppercase tracking-widest text-[#B85D36]">{intent === 'bundle' ? 'Planned bundle · $39' : 'Free educational guide · 8 pages'}</p>
    <h2 id={`${id}-title`} className="pr-8 font-serif text-2xl font-bold leading-tight text-[#14382B] sm:text-3xl">{intent === 'bundle' ? 'Get a bundle launch alert' : 'The 7-Day Gentle Gut Reset Guide'}</h2>
    <p id={`${id}-description`} className="mb-6 mt-3 text-sm leading-relaxed text-[#4A463F]">{intent === 'bundle' ? 'Save your interest in the planned $39 PDF bundle. There is no checkout or purchase on this form.' : 'Enter your first name and email to access the reader and printable habit tracker. A practical observation guide, not a diagnosis or a promise of symptom relief.'}</p>
    <LeadCaptureForm onSuccess={onSuccess} intent={intent} />
  </dialog>;
}

export default LeadCaptureModal;
