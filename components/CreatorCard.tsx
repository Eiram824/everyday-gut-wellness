import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CREATOR } from '../siteConfig';

export default function CreatorCard() {
  const [photoFailed, setPhotoFailed] = useState(false);
  // Vite only emits the photo when the creator has actually supplied it.
  const photos = import.meta.glob('/public/creator-photo.jpg', { eager: true, query: '?url', import: 'default' });
  const hasPhoto = Object.keys(photos).length > 0;
  return <section id="creator" className="page-width section-space" aria-labelledby="creator-heading">
    <div className="grid gap-8 lg:grid-cols-[220px_1fr] border-t border-[#D5CFC5] pt-10">
      <div><div className="w-20 h-20 bg-[#EAF1ED] border border-[#D5CFC5] rounded-full grid place-items-center text-2xl font-serif text-[#14382B] overflow-hidden">
        {hasPhoto && !photoFailed ? <img src={CREATOR.photo} alt={CREATOR.name} width="80" height="80" loading="lazy" onError={() => setPhotoFailed(true)} /> : <span aria-label={CREATOR.name}>{CREATOR.monogram}</span>}
      </div><p className="mt-4 text-sm font-semibold text-[#14382B]">{CREATOR.name}</p><p className="text-xs leading-relaxed text-[#635F57] mt-1">{CREATOR.location}</p></div>
      <div><p className="eyebrow">Independent publishing. Visible standards.</p><h2 id="creator-heading" className="section-heading mt-3">About the Publisher &amp; Editorial Standards</h2>
        <p className="mt-5 leading-relaxed text-[#4A463F]">I’m Mark, an independent health educator and research curator. I organize official NIDDK guidance and peer-reviewed gastroenterology research into practical guides and everyday habit tools. I am not a clinician, and these materials have not been independently reviewed by a clinician.</p>
        <p className="mt-4 text-sm leading-relaxed text-[#635F57]">Sources are linked so you can check their context. We distinguish general guidance, practical planning examples, and personal observations. We do not diagnose, promise symptom relief, or use a workbook as a reason to delay care.</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm"><a href="/editorial-standards.html" className="inline-flex gap-1 items-center underline underline-offset-4">Read our editorial standards<ArrowUpRight size={15} aria-hidden="true" /></a><a href={'mailto:' + CREATOR.email} className="underline underline-offset-4 break-all">{CREATOR.email}</a></div>
      </div>
    </div>
  </section>;
}
