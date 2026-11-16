import React from 'react';
import { CREATOR, ROUTES } from '../siteConfig';

export default function TrustAndFooter() {
  return <footer className="bg-[#14382B] text-[#EAF1ED] pt-12 pb-8">
    <div className="page-width space-y-9">
      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div><a href="/" className="font-serif text-2xl text-white">Everyday Gut Wellness</a><p className="mt-4 max-w-sm text-sm text-[#EAF1ED]/85 leading-relaxed">Independent educational publishing. Practical guides and printable tools for reflecting on everyday digestive routines.</p><p className="text-xs mt-3 text-[#EAF1ED]/75">Gumroad handles payment and digital delivery for paid products.</p></div>
        <nav aria-label="Guide navigation"><h2 className="text-xs font-semibold uppercase tracking-widest text-[#EAD3C7] mb-4">Explore the guides</h2><ul className="space-y-2 text-sm">{Object.entries(ROUTES).map(([path, page]) => <li key={path}><a href={path} className="hover:underline underline-offset-4">{page.label}</a></li>)}<li><a href="/#daily-check" className="hover:underline underline-offset-4">Daily Habit Check</a></li></ul></nav>
        <div><h2 className="text-xs font-semibold uppercase tracking-widest text-[#EAD3C7] mb-4">Trust &amp; transparency</h2><nav aria-label="Policies and contact" className="flex flex-col gap-2 text-sm"><a href="/editorial-standards.html">Editorial standards</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms of use</a><a href="/contact">Contact</a></nav><a href={'mailto:' + CREATOR.email} className="inline-block mt-5 text-sm break-all underline underline-offset-4">{CREATOR.email}</a></div>
      </div>
      <div className="p-5 sm:p-6 rounded-xl bg-black/15 border border-white/10 text-xs text-[#EAF1ED]/85 leading-relaxed"><h2 className="font-semibold text-white uppercase tracking-wider mb-2">Educational health notice</h2><p>This website and its workbooks provide general educational information, not medical advice, diagnosis, or treatment. The materials have not been independently reviewed by a clinician and cannot identify the cause of symptoms or promise a health outcome. For personal concerns, seek advice from a qualified healthcare professional. Seek prompt medical care for severe or worsening symptoms.</p><a href="/when-to-seek-care" className="inline-block underline underline-offset-4 mt-3">Warning signs and when to seek care</a></div>
      <div className="border-t border-white/15 pt-6 flex flex-col gap-3 sm:flex-row sm:justify-between text-xs text-[#EAF1ED]/75"><p>© 2026 Everyday Gut Wellness. All rights reserved.</p><p>Published by {CREATOR.name} · Taguig City, Philippines</p></div>
    </div>
  </footer>;
}
