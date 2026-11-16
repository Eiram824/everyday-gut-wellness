import React from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays } from 'lucide-react';
import { LAST_UPDATED, ROUTES, type SitePath } from '../siteConfig';

export function UpdatedDate() {
  const label = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(LAST_UPDATED + 'T00:00:00Z'));
  return <span className="inline-flex items-center gap-2 text-xs text-[#635F57]"><CalendarDays size={14} aria-hidden="true" />Last updated <time dateTime={LAST_UPDATED}>{label}</time></span>;
}

export function PageIntro({ path, summary }: { path: Exclude<SitePath, '/'>; summary: string }) {
  const page = ROUTES[path];
  return <header className="page-width py-10 sm:py-16 lg:py-20">
    <nav aria-label="Breadcrumb" className="text-xs text-[#635F57] mb-9 flex flex-wrap gap-2"><a href="/" className="underline underline-offset-4">Home</a><span aria-hidden="true">/</span><span aria-current="page">{page.label}</span></nav>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><p className="eyebrow">The everyday field guide / {page.label}</p><UpdatedDate /></div>
    <h1 className="max-w-4xl text-3xl sm:text-4xl lg:text-5xl leading-[1.15] font-serif text-[#14382B] [text-wrap:balance]">{page.h1}</h1>
    <p className="mt-6 max-w-3xl text-base sm:text-lg leading-relaxed text-[#635F57]">{summary}</p>
    <p className="mt-6 text-xs text-[#635F57]">General education for adults. Not medical advice or a diagnostic tool.</p>
  </header>;
}

export function RelatedGuides({ paths }: { paths: SitePath[] }) {
  return <aside className="page-width section-space" aria-labelledby="related-heading">
    <p className="eyebrow">Keep a useful thread going</p><h2 id="related-heading" className="section-heading mt-3">Choose your next guide</h2>
    <div className="mt-7 grid gap-4 sm:grid-cols-2">{paths.map(path => <a key={path} href={path} className="flex items-center justify-between gap-5 rounded-xl border border-[#D5CFC5] bg-white p-6 hover:border-[#14382B] transition-colors"><span className="font-serif text-xl text-[#14382B]">{ROUTES[path].label}</span><ArrowRight size={20} aria-hidden="true" /></a>)}</div>
    <a href="/" className="inline-flex items-center gap-2 mt-6 text-sm underline underline-offset-4">Return to the guide hub<ArrowUpRight size={15} aria-hidden="true" /></a>
  </aside>;
}

export function InlineWorkbookCallout({ planner = false }: { planner?: boolean }) {
  return <aside className="page-width my-10">
    <div className="rounded-2xl bg-[#14382B] text-[#FBF9F5] p-6 sm:p-9 grid gap-6 md:grid-cols-[1fr_auto] items-center">
      <div><p className="text-[11px] uppercase tracking-widest text-[#EAD3C7] font-semibold">Put the guide to work</p>
        <h2 className="text-2xl sm:text-3xl font-serif mt-3">{planner ? 'Make a routine you can actually return to.' : 'Give scattered observations a useful home.'}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#EAF1ED]">{planner ? 'The 31-page, $30 planner pairs a weekly plan with a 30-day check-off calendar. Adjust one practical habit to fit your week.' : 'The 26-page, $25 workbook turns daily notes into a clear, organized one-page summary for your next doctor visit. A planning aid, not a way to diagnose symptoms.'}</p>
      </div><a href="/workbooks" className="button-light whitespace-nowrap">Compare workbooks <ArrowRight size={16} aria-hidden="true" /></a>
    </div>
  </aside>;
}
