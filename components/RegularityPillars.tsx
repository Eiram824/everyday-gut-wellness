import React from 'react';
import { Leaf, Droplets, Sunrise, ArrowUpRight } from 'lucide-react';

const pillars = [
  { title: 'Build variety, gradually.', number: '01', Icon: Leaf, text: 'Learn what different fibers do, then try one manageable whole-food addition.', href: '/fiber-guide', label: 'Explore the fiber guide' },
  { title: 'Pair fiber with fluids.', number: '02', Icon: Droplets, text: 'Use ordinary daily cues to remember fluids. Personal needs and any fluid restrictions come first.', href: '/fiber-guide#fiber-lesson', label: 'Understand the fluid pairing' },
  { title: 'Make room for your rhythm.', number: '03', Icon: Sunrise, text: 'Find a calm window after a meal, respond to the urge, and make movement fit your day.', href: '/routine-reset', label: 'Build a flexible routine' },
];

export default function RegularityPillars() {
  return <section className="page-width section-space" aria-labelledby="pillars-heading">
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"><div><p className="eyebrow">Everyday regularity pillars</p><h2 id="pillars-heading" className="section-heading mt-3">A foundation you can work with.</h2></div><a href="/when-to-seek-care" className="text-sm underline underline-offset-4 shrink-0">Check warning signs first</a></div>
    <div className="grid md:grid-cols-3 gap-5">{pillars.map(({ title, text, href, label, Icon, number }) => <article key={number} className="rounded-2xl bg-white border border-[#E5DFD5] p-6 sm:p-7">
      <div className="flex items-center justify-between text-[#14382B]"><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><span className="text-xs tracking-widest text-[#8C877D]">{number}</span></div>
      <h3 className="font-serif text-2xl text-[#14382B] mt-6">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#635F57]">{text}</p><a className="inline-flex items-center gap-2 mt-6 font-semibold text-sm text-[#14382B] underline underline-offset-4" href={href}>{label}<ArrowUpRight size={14} aria-hidden="true" /></a>
    </article>)}</div>
  </section>;
}
