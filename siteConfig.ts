export const SITE_ORIGIN = 'https://everydaygutwellness.com';
export const LAST_UPDATED = '2026-11-17';
export const GUMROAD_BUNDLE_URL = '';
export const CREATOR = {
  name: 'Mark Laurence E. Medina',
  role: 'Independent Health Educator and Research Curator',
  location: 'Taguig City, Metro Manila, Philippines',
  email: 'hello@everydaygutwellness.com',
  photo: '/creator-photo.jpg',
  monogram: 'MM',
} as const;

export const ROUTES = {
  '/': {
    label: 'Home',
    title: 'Everyday Gut Wellness: Fiber & Bowel Regularity Guide',
    description: 'Improve daily bowel regularity and digestive comfort with evidence-based soluble fiber guides, hydration habits, gastrocolic routines, and printable trackers.',
    h1: 'Your Gut Has a Routine. Are Your Daily Habits Working With It?',
  },
  '/fiber-guide': {
    label: 'Fiber Guide',
    title: 'Soluble vs. Insoluble Fiber Guide for Bowel Regularity',
    description: 'Learn how soluble and insoluble fiber support comfortable stool consistency, how to increase daily fiber gradually without gas, and easy whole-food upgrades.',
    h1: 'Soluble vs. Insoluble Fiber: How Different Plant Fibers Support Comfortable Regularity',
  },
  '/routine-reset': {
    label: 'Routine Reset',
    title: 'Daily Digestive Routine Reset & Gastrocolic Guide',
    description: 'Build a realistic daily digestive schedule using morning hydration, the natural gastrocolic reflex window, afternoon movement, and healthy bathroom posture.',
    h1: "The Daily Digestive Routine Reset: Working With Your Body's Natural Rhythm",
  },
  '/myths-vs-facts': {
    label: 'Myths vs. Facts',
    title: 'Digestive Health Myths vs. Facts: Detoxes & Fiber',
    description: 'Separate digestive physiology from commercial hype. Evidence-informed facts on colon detox cleanses, rapid fiber loading, and whole foods vs. supplements.',
    h1: 'Digestive Myths vs. Evidence-Informed Facts: What Actually Supports Regularity',
  },
  '/when-to-seek-care': {
    label: 'When to Seek Care',
    title: 'Constipation Red Flags & When to See a Doctor',
    description: 'Know which digestive symptoms warrant prompt medical evaluation, when to schedule a doctor visit, and how to prepare clear symptom notes for your appointment.',
    h1: 'When to Seek Medical Advice: Digestive Warning Signs & Clinical Triage',
  },
  '/workbooks': {
    label: 'Workbooks',
    title: 'Printable Gut Health Workbooks & 30-Day Trackers (PDF)',
    description: 'Track daily digestive patterns, fiber intake, and bowel habits with printable US Letter PDF workbooks designed to organize your notes for doctor visits.',
    h1: 'Practical Printable Gut Health Workbooks & 30-Day Routine Trackers',
  },
} as const;

export type SitePath = keyof typeof ROUTES;
export const ROUTE_PATHS = Object.keys(ROUTES) as SitePath[];
export function normalizePath(pathname: string): SitePath | null {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return Object.hasOwn(ROUTES, path) ? path as SitePath : null;
}
export const siteConfig = {
  origin: SITE_ORIGIN, lastUpdated: LAST_UPDATED, creator: CREATOR,
  GUMROAD_BUNDLE_URL,
} as const;
