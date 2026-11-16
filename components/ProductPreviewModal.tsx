import React, { useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, X } from 'lucide-react';
import { GUT_CLARITY_PRODUCT, GUT_ROUTINE_PLANNER_PRODUCT } from '../constants';
import { useModalDialog } from '../lib/useDialog';

export type PreviewProduct = 'workbook' | 'planner';

interface ProductPreviewModalProps {
  product: PreviewProduct;
  onClose: () => void;
}

const pages = {
  workbook: ['Daily observation log', 'Appointment-prep summary'],
  planner: ['Weekly Plan, Fit & Practice', '30-day habit calendar'],
} as const;

export function ProductPreviewModal({ product, onClose }: ProductPreviewModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const [page, setPage] = useState(0);
  const productTitle = product === 'workbook' ? GUT_CLARITY_PRODUCT.title : GUT_ROUTINE_PLANNER_PRODUCT.title;
  useModalDialog(dialogRef, true, onClose);

  function selectPage(index: number, focus = false) {
    setPage(index);
    if (focus) tabRefs.current[index]?.focus();
  }

  return <dialog ref={dialogRef} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} tabIndex={-1}
    className="fixed inset-0 m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto rounded-2xl border border-[#D9D6C9] bg-[#F3EFE6] p-0 text-[#343F33] shadow-2xl backdrop:bg-[#0C211A]/80 sm:max-h-[calc(100dvh-3rem)] sm:w-[calc(100%-3rem)]">
    <div className="border-b border-[#D9D6C9] bg-[#FFFEFA] p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A492A]"><BookOpen aria-hidden="true" className="h-4 w-4 shrink-0" />A look inside the idea</p>
          <h2 id={`${id}-title`} className="mt-2 font-serif text-xl font-bold leading-tight text-[#14382B] sm:text-2xl">{productTitle}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close sample preview" className="-mr-1 -mt-1 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-[#14382B] hover:bg-[#14382B]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14382B]/20"><X aria-hidden="true" className="h-5 w-5" /></button>
      </div>
      <p id={`${id}-description`} className="mt-3 max-w-2xl text-xs leading-relaxed text-[#635F57]">Illustrative sample layouts with fictional example entries. These interactive mockups show the type of activities supported; they are not actual PDF pages and the purchased layout may differ.</p>
      <div role="tablist" aria-label="Sample pages" className="mt-5 grid grid-cols-2 gap-2">
        {pages[product].map((label, index) => <button key={label} ref={element => { tabRefs.current[index] = element; }} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={page === index} tabIndex={page === index ? 0 : -1}
          onClick={() => selectPage(index)} onKeyDown={event => {
            let next: number | null = null;
            if (event.key === 'ArrowRight') next = (index + 1) % 2;
            if (event.key === 'ArrowLeft') next = (index + 1) % 2;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = 1;
            if (next !== null) { event.preventDefault(); selectPage(next, true); }
          }} className={`min-h-12 rounded-lg border px-2 py-2.5 text-xs font-semibold leading-relaxed transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14382B]/25 sm:text-sm ${page === index ? 'border-[#14382B] bg-[#14382B] text-[#FFFEFA]' : 'border-[#D9D6C9] bg-[#F3EFE6] text-[#14382B] hover:bg-[#E9E5D9]'}`}><span className="mr-1 opacity-70">0{index + 1}</span> {label}</button>)}
      </div>
    </div>
    <div className="p-3 sm:p-6">
      {pages[product].map((label, index) => <div key={label} role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} tabIndex={0} hidden={page !== index} className="rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14382B]/20">
        {product === 'workbook' ? index === 0 ? <ObservationSample /> : <AppointmentSample /> : index === 0 ? <WeeklySample /> : <CalendarSample />}
      </div>)}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] leading-relaxed text-[#635F57]">Sample {page + 1} of 2 · educational, non-diagnostic tools</p>
        <button type="button" onClick={() => selectPage(page === 0 ? 1 : 0)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[#14382B] hover:bg-[#14382B]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14382B]/20">{page === 0 ? <>Next sample<ArrowRight aria-hidden="true" className="h-4 w-4" /></> : <><ArrowLeft aria-hidden="true" className="h-4 w-4" />Previous sample</>}</button>
      </div>
    </div>
  </dialog>;
}

function SampleSheet({ number, title, subtitle, children }: { number: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-lg border border-[#D9D6C9] bg-[#FFFEFA] shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-[#E6E2D7] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#687356] sm:px-7"><span>Everyday Gut Wellness</span><span>Illustrative sample</span></div>
    <div className="p-4 sm:p-7">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A492A]">{number}</p>
      <h3 className="mt-2 font-serif text-2xl font-bold leading-tight text-[#14382B] sm:text-3xl">{title}</h3>
      <p className="mb-6 mt-2 max-w-xl text-xs leading-relaxed text-[#635F57]">{subtitle}</p>
      {children}
    </div>
    <p className="border-t border-[#E6E2D7] px-4 py-3 text-[9px] leading-relaxed text-[#77766A] sm:px-7">Fictional example entries · not a personal recommendation or medical assessment</p>
  </div>;
}

function SampleField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-[#E2DED2] p-3 sm:p-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#687356]">{label}</p><p className="mt-2 text-xs leading-relaxed text-[#4A463F]">{children}</p></div>;
}

function ObservationSample() {
  return <SampleSheet number="01 / Notice" title="One day, a little clearer." subtitle="A simple observation log. Record what happened in your own words, without deciding what caused it.">
    <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 border-y border-[#E2DED2] py-3 text-xs"><p><strong className="text-[#14382B]">Day:</strong> 04 / 14</p><p><strong className="text-[#14382B]">Date:</strong> Example Tuesday</p></div>
    <div className="grid gap-3 sm:grid-cols-2">
      <SampleField label="Stool & bathroom notes">8:40 am · formed stool, easy to pass. Had time after breakfast; no rushing.</SampleField>
      <SampleField label="Fiber-containing foods">Oats at breakfast; a small serving of lentils at lunch; pear with an afternoon snack.</SampleField>
      <SampleField label="Hydration notes">Water with meals. Refilled my bottle once during work.</SampleField>
      <SampleField label="Movement, comfort & context">A short walk after lunch. Busy afternoon; mild bloating later. Slept less than usual.</SampleField>
    </div>
    <div className="mt-4 border-l-2 border-[#B85D36] bg-[#F3EFE6] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9A492A]">A note to revisit</p><p className="mt-2 text-xs leading-relaxed text-[#4A463F]">Does having unhurried time after breakfast make the routine easier to keep? I will note the context over the next few days.</p></div>
  </SampleSheet>;
}

function AppointmentSample() {
  return <SampleSheet number="02 / Prepare" title="Bring a clearer conversation." subtitle="An appointment-prep one-page summary: a place for your observations, changes and questions, not a self-diagnosis.">
    <div className="space-y-3">
      <SampleField label="What I want to discuss">My bowel routine has been less predictable. I would like help understanding what to record and when to follow up.</SampleField>
      <div className="grid gap-3 sm:grid-cols-2"><SampleField label="What I noticed & when">Example: a change over the last two weeks, with some harder stools and more rushed mornings.</SampleField><SampleField label="Context to share">Changes to meals, travel, sleep, medicines or supplements. Bring names and dates where possible.</SampleField></div>
      <SampleField label="What I have already tried">Example: keeping daily notes and making space after breakfast. I have brought the log to discuss.</SampleField>
      <div className="rounded-lg border border-[#C6D0BA] bg-[#F0F3E9] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#526540]">Questions for my healthcare professional</p><ol className="mt-3 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-[#4A463F]"><li>What information would help you assess this change?</li><li>Could any of my medicines or supplements be relevant?</li><li>What symptoms should prompt urgent care or an earlier follow-up?</li></ol></div>
    </div>
    <p className="mt-4 text-[11px] leading-relaxed text-[#635F57]">Do not wait to finish a workbook before seeking care for urgent symptoms. See the <a href="/when-to-seek-care" className="font-semibold text-[#14382B] underline underline-offset-2">warning signs and care guidance</a>.</p>
  </SampleSheet>;
}

function WeeklySample() {
  return <SampleSheet number="01 / Plan · Fit · Practice" title="Make one routine fit your week." subtitle="Start with a manageable action and an everyday cue. A smaller fallback keeps the plan flexible when life changes.">
    <div className="space-y-3">
      <SampleField label="Plan / My one focus this week">Take a short movement break after lunch on workdays.</SampleField>
      <div className="grid gap-3 sm:grid-cols-2"><SampleField label="Fit / My cue & place">After I put my lunch plate away, step outside or walk indoors for a few minutes.</SampleField><SampleField label="Fit / My smaller fallback">On a busy or low-energy day, stand up and move gently for one minute if comfortable.</SampleField></div>
      <div className="rounded-lg border border-[#C6D0BA] bg-[#F0F3E9] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#526540]">Practice / This example week</p><div className="mt-3 grid grid-cols-7 gap-1 text-center">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <div key={index}><p className="text-[10px] text-[#635F57]">{day}</p><div className={`mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-full border ${index < 3 ? 'border-[#14382B] bg-[#14382B] text-white' : 'border-[#C6D0BA] text-[#687356]'}`}>{index < 3 ? <Check aria-hidden="true" className="h-3 w-3" /> : <span aria-hidden="true" className="text-xs">·</span>}<span className="sr-only">{index < 3 ? 'Practiced' : 'Not marked'}</span></div></div>)}</div></div>
      <SampleField label="Review / What fit? What could change?">The lunch cue was easy to remember. Tomorrow I will try the indoor fallback when it rains.</SampleField>
    </div>
  </SampleSheet>;
}

function CalendarSample() {
  const completedDays = new Set([1, 2, 4, 5, 6, 8, 9, 10]);
  return <SampleSheet number="02 / Keep a gentle record" title="30 days. Room for real life." subtitle="A check-off habit calendar records practice, not perfection. A blank day is simply a chance to review what would fit better.">
    <div className="mb-4 rounded-lg border border-[#E2DED2] p-3 text-xs leading-relaxed"><strong className="text-[#14382B]">My focus:</strong> A short movement break after lunch.<br /><span className="text-[#635F57]">Check = practiced my main action or smaller fallback.</span></div>
    <ol aria-label="Illustrative 30-day practice calendar" className="grid list-none grid-cols-5 gap-1.5 p-0 sm:grid-cols-6 sm:gap-2">
      {Array.from({ length: 30 }, (_, index) => index + 1).map(day => <li key={day} aria-label={`Day ${day}: ${completedDays.has(day) ? 'practiced' : 'not marked'}`} className={`flex min-h-12 flex-col items-center justify-center rounded-lg border py-2 sm:min-h-14 ${completedDays.has(day) ? 'border-[#B3C1A4] bg-[#EAF0E1]' : 'border-[#E2DED2] bg-[#FFFEFA]'}`}><span className="text-[10px] text-[#635F57]">{day.toString().padStart(2, '0')}</span>{completedDays.has(day) ? <Check aria-hidden="true" className="mt-1 h-3 w-3 text-[#14382B]" /> : <span aria-hidden="true" className="mt-1 h-3 w-3 rounded-sm border border-[#C9CEBE]" />}</li>)}
    </ol>
    <div className="mt-4 border-l-2 border-[#B85D36] bg-[#F3EFE6] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9A492A]">A small review</p><p className="mt-2 text-xs leading-relaxed text-[#4A463F]">Days 3 and 7 were travel days. Next time, pair the smaller fallback with putting my lunch container away.</p></div>
  </SampleSheet>;
}

export default ProductPreviewModal;
