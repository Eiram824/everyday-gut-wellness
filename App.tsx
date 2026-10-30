/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DailyHabitCheck from './components/DailyHabitCheck';
import FiberLesson from './components/FiberLesson';
import RoutineReset from './components/RoutineReset';
import MythVsFact from './components/MythVsFact';
import MedicalAdvice from './components/MedicalAdvice';
import ProductSection from './components/ProductSection';
import TrustAndFooter from './components/TrustAndFooter';

export function App() {
  const scrollToSection = (targetId: string) => {
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
      'product-review': 'product-review',
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
      {/* Top Bar Navigation */}
      <Navbar onNavigate={scrollToSection} />

      {/* Hero Section */}
      <Hero
        onExplore={() => scrollToSection('educational-guide')}
        onJumpToReset={() => scrollToSection('routine-reset')}
      />

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

        {/* Section 7: Optional Product Information */}
        <ProductSection />
      </main>

      {/* Section 8: Trust, Transparency & Footer */}
      <TrustAndFooter onNavigate={scrollToSection} />
    </div>
  );
}

export default App;
