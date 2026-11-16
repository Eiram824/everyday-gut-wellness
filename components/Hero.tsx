import React from 'react';
import { ArrowDownRight, ArrowUpRight, BookOpen } from 'lucide-react';
import { UpdatedDate } from './PageScaffold';
import { ROUTES } from '../siteConfig';

interface HeroProps { onExplore: () => void; onJumpToReset: () => void; onOpenEBook?: () => void; }
export default function Hero({ onExplore, onOpenEBook }: HeroProps) {
  return <section id="hero" className="relative overflow-hidden border-b border-[#E5DFD5]">
    <div className="page-width py-10 sm:py-16 lg:py-20">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-10"><p className="eyebrow">An everyday field guide to comfortable regularity</p><UpdatedDate /></div>
      <div className="grid gap-10 lg:gap-16 lg:grid-cols-[1.3fr_.7fr] items-center">
        <div><h1 className="text-[2.15rem] sm:text-5xl lg:text-[3.5rem] leading-[1.12] font-serif text-[#14382B] [text-wrap:balance]">{ROUTES['/'].h1}</h1>
          <p className="mt-6 text-lg leading-relaxed text-[#635F57] max-w-2xl">Make sense of fiber, fluids, and daily rhythm. Notice what happens, choose one practical next step, and bring clearer questions to your clinician.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3"><button type="button" onClick={onExplore} className="button-primary">Take the 60-Second Habit Check<ArrowDownRight size={17} aria-hidden="true" /></button><button type="button" onClick={onOpenEBook} className="button-outline"><BookOpen size={17} aria-hidden="true" />Get Free 7-Day Reset eBook</button></div>
          <p className="mt-5 text-xs leading-relaxed text-[#635F57]">Educational tools for adults. No diagnosis, restrictive reset diet, or guaranteed outcome.</p>
          <a href="/when-to-seek-care" className="inline-flex items-center gap-1 mt-5 text-sm underline underline-offset-4 text-[#14382B]">New, persistent, or worrying symptoms? Start here<ArrowUpRight size={14} aria-hidden="true" /></a>
        </div>
        <aside className="relative rounded-t-[7rem] rounded-b-2xl border border-[#D5CFC5] bg-[#F0EDE4] px-7 py-10 sm:px-9 sm:py-12" aria-label="The Notice, Plan, Practice approach">
          <svg viewBox="0 0 240 140" className="w-full max-w-[220px] mx-auto mb-7 text-[#14382B]" aria-hidden="true" fill="none"><path d="M24 114C58 114 39 35 82 35s4 74 44 74 7-92 52-92c22 0 24 25 37 25" stroke="currentColor" strokeWidth="1.5" /><path d="M76 34c-27-7-32-26-32-26s29-3 32 26Zm96-14c-3 20 14 28 14 28s14-24-14-28Z" stroke="currentColor" strokeWidth="1.5" /><circle cx="26" cy="114" r="6" fill="#B85D36" /><circle cx="125" cy="109" r="6" fill="#B85D36" /><circle cx="215" cy="42" r="6" fill="#B85D36" /></svg>
          <p className="eyebrow text-center">Small steps. Useful observations.</p><ol className="mt-7 space-y-5">{[['01','Notice','Keep a clear note instead of guessing a cause.'],['02','Plan','Choose one change that fits your ordinary day.'],['03','Practice','Review, adjust, and ask for help when needed.']].map(([n,title,text]) => <li key={n} className="flex gap-4 border-t border-[#D5CFC5] pt-4"><span className="text-xs text-[#B85D36] pt-1">{n}</span><div><h2 className="font-serif text-2xl text-[#14382B]">{title}</h2><p className="text-sm text-[#635F57] mt-1 leading-relaxed">{text}</p></div></li>)}</ol>
        </aside>
      </div>
    </div>
  </section>;
}
