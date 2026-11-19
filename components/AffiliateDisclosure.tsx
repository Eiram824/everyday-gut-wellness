/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * FTC-ready affiliate disclosure (also meets UK ASA/CAP, Canada Competition
 * Bureau and Australia ACCC expectations).
 *
 * Not used yet: the site has no affiliate links today. When an article adds
 * one, render <AffiliateDisclosure /> near the TOP of that article, before the
 * first affiliate link (not only in the footer), and mark each affiliate link
 * with rel="sponsored nofollow noopener". Also update the "Affiliate &
 * Financial Disclosure" text in TrustAndFooter.tsx, which currently says we do
 * not join affiliate programs.
 */
export const AffiliateDisclosure: React.FC<{ className?: string }> = ({ className = '' }) => (
  <aside
    role="note"
    aria-label="Affiliate disclosure"
    className={`rounded-lg border border-[#E5DFD5] bg-[#F8EFEA] px-4 py-3 text-xs sm:text-sm text-[#4A463F] leading-relaxed ${className}`}
  >
    <strong className="text-[#14382B]">Disclosure:</strong> Some links in this article are affiliate links. If you
    buy through them, we may earn a small commission at no extra cost to you. We only mention products we would
    recommend anyway, and commissions never change what we write.
  </aside>
);

export default AffiliateDisclosure;
