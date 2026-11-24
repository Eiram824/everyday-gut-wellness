/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import Hero from './components/Hero';
import EBookBanner from './components/EBookBanner';
import EBookReader from './components/EBookReader';
import LeadCaptureModal from './components/LeadCaptureModal';
import GuidesTeaser from './components/GuidesTeaser';
import ComfortTeaser from './components/ComfortTeaser';
import LeadAdminModal from './components/LeadAdminModal';
import DailyHabitCheck from './components/DailyHabitCheck';
import FiberLesson from './components/FiberLesson';
import RoutineReset from './components/RoutineReset';
import MythVsFact from './components/MythVsFact';
import MedicalAdvice from './components/MedicalAdvice';
import ProductSection from './components/ProductSection';
import TrustAndFooter from './components/TrustAndFooter';
import { initReveal } from './reveal';

export function App() {
  const [isEBookOpen, setIsEBookOpen] = useState(false);
  const [isLeadCaptureOpen, setIsLeadCaptureOpen] = useState(false);
  const [isLeadAdminOpen, setIsLeadAdminOpen] = useState(false);

  // Subtle fade/slide-up as sections scroll into view (skips anything visible on load).
  React.useEffect(() => {
    let cleanup = () => {};
    const frame = window.requestAnimationFrame(() => {
      cleanup = initReveal();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      cleanup();
    };
  }, []);

  // Discreet creator access (Ctrl+Shift+L or #admin in URL) without showing public footer button
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setIsLeadAdminOpen((prev) => !prev);
      }
    };
    const checkHash = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        setIsLeadAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', checkHash);
    checkHash();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  // Static guide pages link to /#free-guide to open the free-guide signup directly.
  React.useEffect(() => {
    if (window.location.hash === '#free-guide') {
      handleOpenEBook();
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch (err) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Checks whether the user is already subscribed before opening the lead modal
  const handleOpenEBook = (forceDirect = false) => {
    if (forceDirect) {
      setIsEBookOpen(true);
      return;
    }

    try {
      const existing = localStorage.getItem('gut_reset_subscriber');
      if (existing) {
        setIsEBookOpen(true);
        return;
      }
    } catch (err) {}

    setIsLeadCaptureOpen(true);
  };

  const scrollToSection = (targetId: string) => {
    if (targetId === 'ebook') {
      handleOpenEBook();
      return;
    }

    if (!targetId || targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        window.history.pushState(null, '', '#hero');
      } catch (err) {}
      return;
    }

    const idMap: Record<string, string> = {
      'guide': 'educational-guide',
      'educational-guide': 'educational-guide',
      'habit-check': 'daily-check',
      'daily-check': 'daily-check',
      'fiber-guide': 'fiber-lesson',
      'fiber-lesson': 'fiber-lesson',
      'routine-reset': 'routine-reset',
      'myths': 'myths',
      'myth-vs-fact': 'myths',
      'medical-advice': 'medical-advice',
      'medical-signs': 'medical-advice',
      'product-review': 'gut-clarity-workbook',
      'product': 'gut-clarity-workbook',
      'planner-product': 'gut-clarity-workbook',
      'gut-clarity-workbook': 'gut-clarity-workbook',
    };

    const resolvedId = idMap[targetId] || targetId;
    const element = document.getElementById(resolvedId);
    if (element) {
      // 80px fixed navbar height + 16px aesthetic breathing room
      const headerOffset = 96;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });

      try {
        window.history.pushState(null, '', `#${resolvedId}`);
      } catch (err) {
        // Safe ignore for sandboxed history environments
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] font-sans text-[#2C2A26] selection:bg-[#EAD3C7] selection:text-[#14382B]">
      {/* Free eBook running bar */}
      <AnnouncementBar onOpenEBook={() => handleOpenEBook()} />

      {/* Top Bar Navigation */}
      <Navbar 
        onNavigate={scrollToSection} 
        onOpenEBook={() => handleOpenEBook()} 
      />

      {/* Hero Section */}
      <Hero
        onExplore={() => scrollToSection('educational-guide')}
        onJumpToReset={() => scrollToSection('routine-reset')}
        onOpenEBook={() => handleOpenEBook()}
      />

      {/* eBook Feature Spotlight Banner */}
      <EBookBanner onOpenEBook={() => handleOpenEBook()} />

      {/* Main Educational Guide Landmark */}
      <main id="educational-guide" className="scroll-mt-24">
        {/* Section 2: The Daily Habit Check */}
        <DailyHabitCheck />

        {/* Section 3: The Fiber Lesson */}
        <FiberLesson />

        {/* Section 4: The Routine Reset */}
        <RoutineReset />

        {/* Section 5: Myth vs Fact */}
        <MythVsFact />

        {/* Section 6: When to Seek Medical Advice */}
        <MedicalAdvice />

        {/* Latest crawlable guides (static pages under /guides/) */}
        <GuidesTeaser />
        <ComfortTeaser />

        {/* Section 7: Paid digital product — checkout hosted by Gumroad. */}
        <ProductSection />
      </main>

      {/* Section 8: Trust, Transparency & Footer */}
      <TrustAndFooter 
        onNavigate={scrollToSection} 
      />

      {/* High-Converting Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadCaptureOpen}
        onClose={() => setIsLeadCaptureOpen(false)}
        onSuccess={(_subscriber) => {
          setIsLeadCaptureOpen(false);
          setIsEBookOpen(true);
        }}
      />

      {/* Fullscreen Interactive & Printable eBook Reader */}
      <EBookReader 
        isOpen={isEBookOpen} 
        onClose={() => setIsEBookOpen(false)} 
      />

      {/* Admin Lead Management & CSV Export Modal */}
      <LeadAdminModal
        isOpen={isLeadAdminOpen}
        onClose={() => setIsLeadAdminOpen(false)}
      />
    </div>
  );
}

export default App;
