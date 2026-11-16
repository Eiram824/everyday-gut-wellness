import { useEffect, useRef, type RefObject } from 'react';

let bodyLocks = 0;
let originalOverflow = '';
const dialogs: HTMLDialogElement[] = [];

export function useModalDialog(ref: RefObject<HTMLDialogElement | null>, isOpen: boolean, onClose: () => void): void {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!isOpen || !ref.current) return;
    return activateModalDialog(ref.current, () => close.current());
  }, [ref, isOpen]);
}

export function activateModalDialog(dialog: HTMLDialogElement, onClose: () => void): () => void {
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  // Only lock the page after the native dialog has successfully opened.
  if (!dialog.open) dialog.showModal();
  if (bodyLocks++ === 0) originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  dialogs.push(dialog);
  const isTop = () => dialogs[dialogs.length - 1] === dialog;
  const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter(element => !element.hidden && element.getClientRects().length > 0);
  const initial = dialog.querySelector<HTMLElement>('[autofocus]') || focusable()[0] || dialog;
  initial.focus({ preventScroll: true });
  const keyboard = (event: KeyboardEvent) => {
    if (!isTop()) return;
    if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
    if (event.key !== 'Tab') return;
    const elements = focusable();
    if (!elements.length) { event.preventDefault(); dialog.focus(); return; }
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && (document.activeElement === first || !elements.includes(document.activeElement as HTMLElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !elements.includes(document.activeElement as HTMLElement))) {
      event.preventDefault(); first.focus();
    }
  };
  const cancel = (event: Event) => { event.preventDefault(); if (isTop()) onClose(); };
  dialog.addEventListener('keydown', keyboard);
  dialog.addEventListener('cancel', cancel);
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    dialog.removeEventListener('keydown', keyboard);
    dialog.removeEventListener('cancel', cancel);
    if (dialog.open) dialog.close();
    const position = dialogs.indexOf(dialog);
    if (position !== -1) dialogs.splice(position, 1);
    if (--bodyLocks === 0) document.body.style.overflow = originalOverflow;
    if (previousFocus?.isConnected && (!previousFocus.closest('dialog') || previousFocus.closest('dialog')?.open)) {
      previousFocus.focus({ preventScroll: true });
    }
  };
}
