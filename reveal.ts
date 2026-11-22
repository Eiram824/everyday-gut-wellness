/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Subtle scroll-reveal motion for the homepage (fade + short slide-up).
 *
 * Built to protect Core Web Vitals:
 * - Only elements that start BELOW the first screen are ever hidden, so the
 *   hero, its H1 (the LCP element) and anything visible on load render instantly.
 * - Motion uses only opacity + transform, which never cause layout shift (CLS).
 * - Section elements themselves are never transformed, so the navbar's
 *   scroll-to-section offsets stay exact.
 * - Visitors with "reduce motion" turned on, old browsers, and print get the
 *   page with no motion at all.
 * - The data-reveal attribute is removed once the motion ends, so the
 *   original hover transitions of each card come back untouched.
 */

const SECTIONS = '#free-ebook, main section, #root footer';
const MAX_STAGGER = 4;

const hasClass = (el: Element, prefix: string) =>
  Array.from(el.classList).some((c) => c === prefix || c.startsWith(`${prefix}-`));

/** Picks the blocks that should animate inside one section container. */
function collectTargets(section: Element): Element[] {
  const container = section.firstElementChild;
  if (!container) return [];
  const targets: Element[] = [];
  for (const block of Array.from(container.children)) {
    const isHeader = !!block.querySelector(':scope > h2');
    const isList = hasClass(block, 'grid') || hasClass(block, 'space-y') || block.tagName === 'UL';
    if ((isHeader || isList) && block.children.length > 0) {
      targets.push(...Array.from(block.children));
    } else {
      targets.push(block);
    }
  }
  return targets;
}

export function initReveal(): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const fold = window.innerHeight;
  const hidden: HTMLElement[] = [];

  const show = (el: HTMLElement) => {
    el.setAttribute('data-reveal', 'in');
    const done = () => {
      el.removeAttribute('data-reveal');
      el.removeAttribute('data-reveal-delay');
    };
    el.addEventListener('transitionend', done, { once: true });
    window.setTimeout(done, 1400); // safety net if transitionend never fires
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        show(entry.target as HTMLElement);
      }
    },
    { threshold: 0.15 },
  );

  document.querySelectorAll(SECTIONS).forEach((section) => {
    let lastParent: Element | null = null;
    let index = 0;
    for (const el of collectTargets(section)) {
      if (!(el instanceof HTMLElement)) continue;
      // Never hide anything that is already on screen (protects LCP and CLS).
      if (el.getBoundingClientRect().top < fold) continue;
      index = el.parentElement === lastParent ? index + 1 : 0;
      lastParent = el.parentElement;
      el.setAttribute('data-reveal', '');
      if (index > 0) el.setAttribute('data-reveal-delay', String(Math.min(index, MAX_STAGGER)));
      hidden.push(el);
      io.observe(el);
    }
  });

  const revealAll = () => hidden.forEach((el) => el.removeAttribute('data-reveal'));
  window.addEventListener('beforeprint', revealAll);

  return () => {
    io.disconnect();
    window.removeEventListener('beforeprint', revealAll);
    revealAll();
  };
}
