import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Download, ExternalLink, Link2, X } from 'lucide-react';

const GUIDE_PDF = '/The-7-Day-Gentle-Gut-Reset-Guide.pdf';
const SECTIONS = [
  'Cover & contents',
  'Understand your digestive routine',
  'Five habits to observe',
  'Your seven-day observation plan',
  'Food experiments without restrictions',
  'Printable habit tracker',
  'Warning signs & safety',
  'Next steps & sources',
] as const;

interface EBookReaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EBookReader: React.FC<EBookReaderProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [page, setPage] = useState(1);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'unavailable'>('idle');

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    setPage(1);
    setCopyStatus('idle');
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      const focusTarget = previousFocus?.isConnected ? previousFocus : document.querySelector<HTMLElement>('#hero button');
      focusTarget?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (copyStatus !== 'copied') return;
    const timeout = window.setTimeout(() => setCopyStatus('idle'), 2500);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  if (!isOpen) return null;

  async function copyGuideLink() {
    try {
      await navigator.clipboard.writeText('https://everydaygutwellness.com' + GUIDE_PDF);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('unavailable');
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="ebook-modal-title"
      aria-describedby="ebook-modal-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="fixed inset-0 m-auto h-[calc(100dvh-1rem)] max-h-none w-[calc(100%-1rem)] max-w-6xl overflow-hidden rounded-xl border border-[#E5DFD5] bg-[#FBF9F5] p-0 text-[#2C2A26] shadow-2xl backdrop:bg-black/70"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-[#E5DFD5] bg-white px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#B85D36]">
              <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" /> Free educational guide · 8 pages
            </p>
            <h2 id="ebook-modal-title" className="font-serif text-lg font-bold leading-tight text-[#14382B] sm:text-xl">
              The 7-Day Gentle Gut Reset Guide
            </h2>
            <p id="ebook-modal-description" className="mt-1 text-xs text-[#635F57]">
              Read the same edition you download. Sources and editorial limits are on page 8.
            </p>
          </div>
          <button type="button" onClick={onClose} autoFocus aria-label="Close eBook Reader" className="self-start rounded-lg p-2 text-[#635F57] hover:bg-[#F3EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#14382B]">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DFD5] px-4 py-2 sm:px-6">
          <a href={GUIDE_PDF} download="The-7-Day-Gentle-Gut-Reset-Guide.pdf" className="inline-flex items-center gap-2 rounded-lg bg-[#14382B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0E281E]">
            <Download className="h-4 w-4" aria-hidden="true" /> Download PDF
          </a>
          <a href={GUIDE_PDF} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#D8D2C8] bg-white px-3 py-2 text-xs font-semibold text-[#14382B]">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open PDF / print
          </a>
          <button type="button" onClick={copyGuideLink} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#14382B] hover:bg-[#EAF1ED]">
            <Link2 className="h-4 w-4" aria-hidden="true" /> Copy guide link
          </button>
          <span role="status" className="text-xs text-[#635F57]">
            {copyStatus === 'copied' ? 'Guide link copied.' : copyStatus === 'unavailable' ? 'Copy unavailable. Use Open PDF to share the address.' : ''}
          </span>
        </div>

        <div className="flex min-h-0 flex-1">
          <nav aria-label="Guide pages" className="hidden w-56 shrink-0 overflow-y-auto border-r border-[#E5DFD5] bg-[#F3EFE6] p-3 lg:block">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#635F57]">Your reading map</p>
            {SECTIONS.map((section, index) => (
              <button key={section} type="button" onClick={() => setPage(index + 1)} aria-current={page === index + 1 ? 'page' : undefined} className={'mb-1 flex w-full gap-3 rounded-lg px-3 py-3 text-left text-xs leading-relaxed ' + (page === index + 1 ? 'bg-[#14382B] text-white' : 'text-[#635F57] hover:bg-white')}>
                <span className="font-bold">{index + 1}</span><span>{section}</span>
              </button>
            ))}
          </nav>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="border-b border-[#E5DFD5] px-4 py-2 lg:hidden">
              <label htmlFor="guide-section" className="sr-only">Guide section</label>
              <select id="guide-section" value={page} onChange={(event) => setPage(Number(event.target.value))} className="w-full rounded-md border border-[#D8D2C8] bg-white px-2 py-2 text-xs text-[#14382B]">
                {SECTIONS.map((section, index) => <option key={section} value={index + 1}>{index + 1}. {section}</option>)}
              </select>
            </div>
            <p className="border-b border-[#E5DFD5] bg-[#EAF1ED] px-4 py-2 text-xs leading-relaxed text-[#14382B]">
              If the preview does not display on your device, use <a href={GUIDE_PDF} target="_blank" rel="noopener noreferrer" className="font-semibold underline">open the guide in a new tab</a> or download it. You can print from your PDF app.
            </p>
            <iframe key={page} src={GUIDE_PDF + '#page=' + page + '&view=FitH&navpanes=0'} title={'Free guide PDF — ' + SECTIONS[page - 1]} className="min-h-0 w-full flex-1 border-0 bg-[#E5DFD5]" />
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5DFD5] bg-white px-4 py-2 text-xs sm:px-6">
          <p className="text-[#635F57]">Educational use for adults. Not medical advice.</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPage(value => value - 1)} disabled={page === 1} aria-label="Previous guide page" className="rounded-md border border-[#D8D2C8] p-2 text-[#14382B] disabled:opacity-30"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
            <span aria-live="polite" className="text-[#14382B]">Page {page} of {SECTIONS.length}</span>
            <button type="button" onClick={() => setPage(value => value + 1)} disabled={page === SECTIONS.length} aria-label="Next guide page" className="rounded-md border border-[#D8D2C8] p-2 text-[#14382B] disabled:opacity-30"><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </footer>
      </div>
    </dialog>
  );
};

export default EBookReader;
