import React, { useEffect, useState } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';
import { ROUTES, type SitePath } from '../siteConfig';

export default function Navbar({ currentPath, onOpenEBook }: { currentPath: SitePath; onOpenEBook: () => void }) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setExpanded(false); }, [currentPath]);
  useEffect(() => { const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpanded(false); }; document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape); }, []);
  const links = Object.entries(ROUTES).filter(([path]) => path !== '/');
  return <header className="sticky top-0 z-40 border-b border-[#E5DFD5] bg-[#FBF9F5]/95 backdrop-blur-md">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex min-h-20 items-center justify-between gap-4">
      <a href="/" className="font-serif text-lg sm:text-2xl font-bold leading-tight text-[#14382B] max-w-[200px] sm:max-w-none">Everyday Gut Wellness<span className="block text-[9px] sm:text-[10px] font-sans font-medium tracking-[.18em] uppercase text-[#635F57] mt-1">Learn · Notice · Practice</span></a>
      <nav aria-label="Main navigation" className="hidden xl:flex gap-5 items-center text-xs font-medium">{links.map(([path, page]) => <a key={path} href={path} aria-current={path === currentPath ? 'page' : undefined} className="py-3 text-[#635F57] hover:text-[#14382B]">{page.label}</a>)}</nav>
      <div className="hidden xl:flex gap-3 items-center"><button type="button" onClick={onOpenEBook} className="button-outline !text-xs"><BookOpen size={14} aria-hidden="true" />Free eBook</button><a href="/#daily-check" className="button-primary !text-xs">Habit Check</a></div>
      <button type="button" aria-label="Toggle navigation menu" aria-expanded={expanded} aria-controls="site-mobile-nav" onClick={() => setExpanded(value => !value)} className="xl:hidden p-3 rounded-lg border border-[#D5CFC5] text-[#14382B] shrink-0">{expanded ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
    {expanded && <nav id="site-mobile-nav" aria-label="Mobile navigation" className="xl:hidden max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-[#E5DFD5] bg-[#FBF9F5] px-4 py-4 space-y-1" onClick={() => setExpanded(false)}>
      <a href="/" className="mobile-nav-link">Home</a>{links.map(([path, page]) => <a key={path} href={path} className="mobile-nav-link" aria-current={path === currentPath ? 'page' : undefined}>{page.label}</a>)}
      <a href="/#daily-check" className="mobile-nav-link">Take the Habit Check</a><button type="button" onClick={onOpenEBook} className="button-primary w-full mt-3">Get Free 7-Day Reset eBook</button>
    </nav>}
  </header>;
}
