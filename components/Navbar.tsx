/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Habit Check', id: 'daily-check' },
    { label: 'Fiber Guide', id: 'fiber-lesson' },
    { label: 'Routine Reset', id: 'routine-reset' },
    { label: 'Myth vs Fact', id: 'myths' },
    { label: 'Medical Signs', id: 'medical-advice' },
  ];

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E5DFD5] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#hero"
            onClick={(e) => handleLinkClick(e, 'hero')}
            className="text-xl sm:text-2xl font-serif font-bold text-[#14382B] tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            Everyday Gut Wellness
          </a>

          {/* Zone 2: Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#635F57]">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleLinkClick(e, link.id)}
                className="hover:text-[#14382B] transition-colors whitespace-nowrap shrink-0 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#14382B] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: START HABIT CHECK Primary Action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={(e) => handleLinkClick(e, 'daily-check')}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#14382B] rounded hover:bg-[#0E281E] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 shadow-sm"
            >
              START HABIT CHECK
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2C2A26] hover:text-[#14382B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14382B] rounded"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5DFD5] bg-[#FBF9F5] px-4 pt-2 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleLinkClick(e, link.id)}
              className="block px-3 py-2 text-base font-medium text-[#2C2A26] hover:bg-[#E5DFD5]/40 rounded transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={(e) => handleLinkClick(e, 'daily-check')}
              className="w-full text-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#14382B] rounded shadow-sm hover:bg-[#0E281E]"
            >
              START HABIT CHECK
            </button>
            <button
              type="button"
              onClick={(e) => handleLinkClick(e, 'educational-guide')}
              className="w-full text-center px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#14382B] border border-[#14382B]/30 rounded hover:bg-[#E5DFD5]/40"
            >
              Explore the Guide
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;
