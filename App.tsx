import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EBookBanner from './components/EBookBanner';
import EBookReader from './components/EBookReader';
import LeadCaptureModal from './components/LeadCaptureModal';
import InlineLeadCapture from './components/InlineLeadCapture';
import DailyHabitCheck from './components/DailyHabitCheck';
import FiberLesson from './components/FiberLesson';
import RoutineReset from './components/RoutineReset';
import MythVsFact from './components/MythVsFact';
import MedicalAdvice from './components/MedicalAdvice';
import { CoreFaq, ScientificReferences } from './components/ResearchAndFaq';
import ProductSection from './components/ProductSection';
import TrustAndFooter from './components/TrustAndFooter';
import RegularityPillars from './components/RegularityPillars';
import CreatorCard from './components/CreatorCard';
import { PageIntro, RelatedGuides, InlineWorkbookCallout } from './components/PageScaffold';
import { normalizePath, type SitePath } from './siteConfig';
import { applyPageMetadata } from './lib/page-seo';
import { readGuideAccess } from './lib/guide-access';

const LEGACY_HASH_ROUTES: Record<string, string> = {
  '#fiber-lesson': '/fiber-guide#fiber-lesson', '#fiber-guide': '/fiber-guide',
  '#routine-reset': '/routine-reset', '#myths': '/myths-vs-facts',
  '#myth-vs-fact': '/myths-vs-facts', '#medical-advice': '/when-to-seek-care',
  '#medical-signs': '/when-to-seek-care', '#planner-product': '/workbooks',
  '#product-review': '/workbooks', '#habit-check': '/#daily-check',
};

function scrollToCurrentHash() {
  const hash = window.location.hash.slice(1);
  let decodedHash = hash;
  try { decodedHash = decodeURIComponent(hash); } catch { /* A malformed fragment must not interrupt navigation. */ }
  const element = hash ? document.getElementById(decodedHash) : null;
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (element) element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  else if (!hash) window.scrollTo({ top: 0, behavior: 'auto' });
}

export function App({ initialPath = '/' }: { initialPath?: string }) {
  const [currentPath, setCurrentPath] = useState<SitePath | null>(() => normalizePath(initialPath));
  const [leadIntent, setLeadIntent] = useState<'guide' | 'bundle' | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [guideAccess, setGuideAccess] = useState(false);

  function navigate(href: string, replace = false) {
    const url = new URL(href, window.location.origin);
    const path = normalizePath(url.pathname);
    if (!path) return;
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url.pathname + url.search + url.hash);
    setLeadIntent(null);
    setReaderOpen(false);
    setCurrentPath(path);
    requestAnimationFrame(() => requestAnimationFrame(scrollToCurrentHash));
  }

  useEffect(() => {
    // Remove a credential left by the retired public admin modal.
    try { sessionStorage.removeItem('gut_admin_key'); } catch {}
    const legacy = window.location.pathname === '/' && LEGACY_HASH_ROUTES[window.location.hash];
    if (legacy) navigate(legacy, true);
    const onPop = () => {
      setCurrentPath(normalizePath(window.location.pathname));
      setLeadIntent(null);
      setReaderOpen(false);
      requestAnimationFrame(() => requestAnimationFrame(scrollToCurrentHash));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (currentPath) applyPageMetadata(currentPath);
  }, [currentPath]);

  const openGuide = () => {
    const allowed = guideAccess || readGuideAccess();
    setGuideAccess(allowed);
    if (allowed) setReaderOpen(true);
    else setLeadIntent('guide');
  };
  const openUnlockedReader = () => {
    // This callback is invoked only from a verified successful guide request.
    setGuideAccess(true);
    setLeadIntent(null);
    setReaderOpen(true);
  };

  function handleInternalLink(event: React.MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (!link || link.target || link.hasAttribute('download') || !link.getAttribute('href')) return;
    const url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin || !normalizePath(url.pathname)) return;
    event.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  }

  if (!currentPath) return <div className="page-width section-space"><h1 className="section-heading">This page could not be found.</h1><a href="/" className="button-primary mt-6">Return to the guide hub</a></div>;

  return <div className="min-h-screen bg-[#FBF9F5] text-[#2C2A26] font-sans selection:bg-[#EAD3C7]" onClick={handleInternalLink}>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <Navbar currentPath={currentPath} onOpenEBook={openGuide} />
    <main id="main-content" tabIndex={-1}>
      {currentPath === '/' ? <>
        <Hero onExplore={() => navigate('/#daily-check')} onJumpToReset={() => navigate('/routine-reset')} onOpenEBook={openGuide} />
        <RegularityPillars />
        <DailyHabitCheck />
        <section id="free-guide" className="scroll-mt-24"><EBookBanner onOpenEBook={openGuide} /><div className="page-width max-w-3xl pb-16"><InlineLeadCapture onSuccess={openUnlockedReader} /></div></section>
        <ProductSection variant="featured" onJoinWaitlist={() => setLeadIntent('bundle')} />
        <CoreFaq />
        <CreatorCard />
      </> : <article key={currentPath}>
        {currentPath === '/fiber-guide' && <><PageIntro path={currentPath} summary="Understand the difference between soluble and insoluble fiber, use a gradual pace, and try a small food upgrade that fits a meal you already eat." /><FiberLesson /><InlineWorkbookCallout /><RelatedGuides paths={['/routine-reset', '/when-to-seek-care']} /></>}
        {currentPath === '/routine-reset' && <><PageIntro path={currentPath} summary="Explore six ordinary habits around fluids, meals, movement, and bathroom time. Use the checklist as a flexible planning tool, not a medical test or a fixed schedule." /><RoutineReset /><InlineWorkbookCallout planner /><RelatedGuides paths={['/myths-vs-facts', '/fiber-guide']} /></>}
        {currentPath === '/myths-vs-facts' && <><PageIntro path={currentPath} summary="Put detox promises, rapid fiber loading, and supplement shortcuts in context. Separate a practical habit from a claim that deserves a closer look." /><MythVsFact /><InlineWorkbookCallout /><RelatedGuides paths={['/fiber-guide', '/when-to-seek-care']} /></>}
        {currentPath === '/when-to-seek-care' && <><PageIntro path={currentPath} summary="Know when self-observation should give way to professional advice. These warning signs and source links support health literacy; they cannot assess your symptoms or replace care." /><MedicalAdvice /><ScientificReferences /><CreatorCard /><InlineWorkbookCallout /><RelatedGuides paths={['/workbooks', '/fiber-guide']} /></>}
        {currentPath === '/workbooks' && <><PageIntro path={currentPath} summary="Choose the tool that fits your next task: organize observations for a healthcare conversation, or plan one routine you can return to. Preview the sample layouts before deciding." /><ProductSection variant="full" onJoinWaitlist={() => setLeadIntent('bundle')} /><RelatedGuides paths={['/fiber-guide', '/routine-reset']} /></>}
      </article>}
    </main>
    <TrustAndFooter />
    <LeadCaptureModal isOpen={leadIntent !== null} intent={leadIntent || 'guide'} onClose={() => setLeadIntent(null)} onSuccess={openUnlockedReader} />
    <EBookReader isOpen={readerOpen} accessGranted={guideAccess} onClose={() => setReaderOpen(false)} />
  </div>;
}
export default App;
