/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Users, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  Mail,
  KeyRound,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  DollarSign,
  TrendingUp,
  FileText,
  Lock,
  Unlock
} from 'lucide-react';
import { PLANNER_PRODUCT_INFO } from '../constants';

interface Subscriber {
  id: string;
  name: string;
  email: string;
  date: string;
  source: string;
  marketingConsent?: boolean;
  consentDate?: string | null;
  senderSynced: boolean;
}

interface LeadAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadAdminModal: React.FC<LeadAdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'gumroad'>('gumroad');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [senderConfigured, setSenderConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedListing, setCopiedListing] = useState(false);

  // Admin authentication state
  const [adminKey, setAdminKey] = useState<string>(() => {
    try {
      return sessionStorage.getItem('gut_admin_key') || '';
    } catch {
      return '';
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem('gut_admin_key'));
    } catch {
      return false;
    }
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const verifyAndSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: adminKey.trim() }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem('gut_admin_key', adminKey.trim());
        } catch {}
        fetchLeads(adminKey.trim());
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || 'Invalid administrator key. Please check your credentials.');
      }
    } catch (err: any) {
      setAuthError('Connection error while verifying administrator key.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('gut_admin_key');
    } catch {}
    setIsAuthenticated(false);
    setAdminKey('');
  };

  const fetchLeads = async (customKey?: string) => {
    const keyToUse = customKey ?? adminKey;
    setIsLoading(true);
    let apiSuccess = false;

    try {
      const res = await fetch('/api/leads', {
        headers: {
          'x-admin-key': keyToUse,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.subscribers) {
          setSubscribers(data.subscribers);
          setTotal(data.total ?? data.subscribers.length);
          setSenderConfigured(Boolean(data.senderConfigured));
          apiSuccess = true;
        }
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Session expired or invalid key. Please enter your administrator key.');
      }
    } catch (err) {
      console.warn('Backend leads API unavailable, attempting local storage fallback:', err);
    }

    if (!apiSuccess && isAuthenticated) {
      try {
        const localListRaw = localStorage.getItem('all_gut_subscribers');
        const singleSubRaw = localStorage.getItem('gut_reset_subscriber');
        let localSubs: Subscriber[] = [];

        if (localListRaw) {
          const parsed = JSON.parse(localListRaw);
          localSubs = parsed.map((item: any, i: number) => ({
            id: item.id || `loc_${i + 1}`,
            name: item.name || 'Reader',
            email: item.email,
            date: item.date || new Date().toISOString(),
            source: item.source || 'ebook_lead_modal',
            marketingConsent: Boolean(item.marketingConsent),
            consentDate: item.consentDate || null,
            senderSynced: false,
          }));
        } else if (singleSubRaw) {
          const parsed = JSON.parse(singleSubRaw);
          localSubs = [{
            id: 'loc_1',
            name: parsed.name || 'Reader',
            email: parsed.email,
            date: parsed.date || new Date().toISOString(),
            source: 'ebook_lead_modal',
            marketingConsent: Boolean(parsed.marketingConsent),
            consentDate: parsed.consentDate || null,
            senderSynced: false,
          }];
        }

        setSubscribers(localSubs);
        setTotal(localSubs.length);
      } catch (e) {
        console.error('Local fallback read error:', e);
      }
    }
    setIsLoading(false);
  };

  const handleExportCsv = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export yet.');
      return;
    }

    if (adminKey) {
      // Trigger authenticated direct download from server
      const downloadUrl = `/api/leads/export.csv?key=${encodeURIComponent(adminKey)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'everyday_gut_wellness_subscribers.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Client-side fallback if in offline mode
    const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const header = ["ID", "Name", "Email", "Date Requested", "Source", "Marketing Consent", "Consent Date", "Sender Synced"];
    const rows = subscribers.map((sub) => [
      escapeCsv(sub.id),
      escapeCsv(sub.name),
      escapeCsv(sub.email),
      escapeCsv(sub.date),
      escapeCsv(sub.source),
      escapeCsv(sub.marketingConsent ? "Yes" : "No"),
      escapeCsv(sub.consentDate || "N/A"),
      escapeCsv(sub.senderSynced ? "Yes" : "No"),
    ]);
    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'everyday_gut_wellness_subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Author Master Prompt for The 30-Day Digestive Wellness Planner
  const claudeMasterPrompt = `You are a world-class Clinical Nutritionist, Functional Health Educator, and Professional Digital Health Workbook Designer.

Write the complete editorial manuscript and worksheets for an original 68-page digital wellness product titled:
"The 30-Day Digestive Wellness Planner: A Practical Habit-Tracking Workbook for Everyday Digestive Rhythm"

BRAND: Everyday Gut Wellness (US Edition)
PRODUCT TYPE: Educational workbook & daily habit tracker (NOT a medical treatment program or detox protocol).
PRICE: $14.99 on Gumroad.

TARGET AUDIENCE:
English-speaking adults (primarily US) seeking a structured, compassionate, and evidence-informed habit system to observe daily food variety, hydration timing, gentle movement, and unhurried bathroom routines. They want to avoid extreme cleanses, unverified detox teas, and rigid diet plans.

SCIENTIFIC & HEALTH COMPLIANCE REQUIREMENTS (STRICT):
1. Do NOT claim that this planner cures, treats, reverses, or prevents any disease or medical condition.
2. Do NOT promise that customers will eliminate constipation, bloating, or other symptoms.
3. Do NOT claim that the planner stimulates intestinal movement or produces guaranteed metabolic results.
4. Do NOT prescribe supplements, medications, or treatment protocols.
5. Do NOT impose a universal fiber target; explain clearly that individual fiber tolerance varies and that fiber should be increased gradually.
6. Avoid unsupported claims and fabricated scientific references. Use responsible, evidence-informed educational language.
7. Always advise customers to consult a qualified healthcare professional for persistent, severe, or concerning digestive symptoms.
8. Include an appropriate medical and FDA disclaimer.

WORKBOOK STRUCTURE (PROVIDE FULL TEXT AND WORKSHEET TEMPLATES FOR ALL 11 MODULES):

Module 01: Introduction & Workbook Instructions
- How to pace yourself over 30 days without habit fatigue.
- How to establish a personal baseline without judgment.

Module 02: 30-Day Wellness Habit Tracker Grid
- Clear 30-day checkbox matrix for baseline hydration, fiber anchors, and movement.

Module 03: Daily Food & Hydration Journal
- Spread templates for tracking meal composition, fluid timing, and mindful chewing awareness.

Module 04: Fiber & Nutrition Awareness Worksheets
- Detailed breakdown of gentle soluble fibers (oats, cooked legumes, chia, peeled carrots) vs. insoluble roughage.
- The "Gradual Fiber Addition Protocol" (adding 3-5g per week alongside adequate water).

Module 05: Meal Planning Worksheets
- Weekly templates to plan diverse plant foods across breakfasts, lunches, and dinners.

Module 06: Gentle Movement & Daily Routine Tracker
- Tracking 10-15 minute post-meal walks, desk mobility breaks, and pelvic floor toilet ergonomics (35° footstool position).

Module 07: Sleep & Lifestyle Habit Tracker
- Evening wind-downs, 3-hour pre-bed dinner cutoffs, and stress-reduction logs.

Module 08: Digestive Symptom Observation Journal
- Objective 1-10 daily comfort ratings to observe personal food tolerances.

Module 09: Bristol Stool Chart Clinical Reference
- Educational spectrum (Types 1-7) explained objectively with dietary context.

Module 10: Weekly Reflection & Adjustment Pages
- Weeks 1, 2, 3, and 4 reflection prompts to adjust water and fiber pacing.

Module 11: Final 30-Day Progress Review
- Comprehensive synthesis of month-long self-care habits and long-term maintenance recommendations.

Output the entire manuscript in clean, formatted Markdown with tables, printable worksheet layouts, and callout boxes.`;

  // First-Party Gumroad Product Listing Copy
  const gumroadListingCopy = `PRODUCT TITLE:
The 30-Day Digestive Wellness Planner: Digital Workbook Edition

PRICE:
$14.99 (Instant Digital Download)

SUBTITLE / TAGLINE:
A practical 68-page habit-tracking workbook to organize your daily hydration, diverse plant fiber, gentle movement, and unhurried digestive routines.

PRODUCT DESCRIPTION:
Take the overwhelm out of everyday gut wellness.

Healthy digestive rhythm isn't built on extreme detox teas, restrictive crash diets, or aggressive cleanses. It is built on steady, daily habits: drinking enough fluids, eating a diverse variety of plant fibers, allowing unhurried time after meals, and staying gently active.

The 30-Day Digestive Wellness Planner provides structured, non-judgmental worksheets to help you observe what works best for your unique body.

WHAT IS INCLUDED:
✓ 68-Page High-Resolution US Letter (8.5" x 11") Printable PDF
✓ A4 Print-Ready PDF Edition
✓ Interactive Fillable Digital PDF (compatible with iPad GoodNotes, Notability, and PDF readers)
✓ 11 Complete Habit & Reflection Modules
✓ Daily Food, Fluid, and Mindful Chewing Journals
✓ Gentle Soluble Fiber & Nutrition Worksheets
✓ Bristol Stool Form Clinical Educational Reference
✓ Weekly Progress Reflections and 30-Day Review Summary

IMPORTANT HEALTH NOTICE:
This planner is strictly an educational workbook and personal habit tracker. It does not provide medical advice, diagnosis, or treatment, and does not claim to cure, prevent, or treat any medical condition. Always consult your healthcare provider regarding persistent digestive concerns.

DELIVERY:
Instant digital download immediately following checkout. Accessible on desktop, tablet, and smartphone.`;

  const handleCopyPrompt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(claudeMasterPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  const handleCopyListing = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(gumroadListingCopy);
      setCopiedListing(true);
      setTimeout(() => setCopiedListing(false), 2500);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchLeads();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E5DFD5] overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#14382B] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-[#EAD3C7]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                Creator Admin: Digital Products & Subscriber Hub
              </h3>
              <p className="text-xs text-white/70">
                Manage your original Gumroad digital products, copy author prompts, and view verified subscribers
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-white/70 hover:text-white underline underline-offset-2 flex items-center gap-1"
                title="Lock session"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#E5DFD5] bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab('gumroad')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'gumroad'
                ? 'border-[#B85D36] text-[#B85D36]'
                : 'border-transparent text-[#635F57] hover:text-[#14382B]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Digital Product Suite (Planner & Prompts)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'leads'
                ? 'border-[#14382B] text-[#14382B]'
                : 'border-transparent text-[#635F57] hover:text-[#14382B]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Subscriber Database ({total})</span>
          </button>
        </div>

        {/* TAB 1: GUMROAD DIGITAL PRODUCT SUITE & AUTHOR PROMPT */}
        {activeTab === 'gumroad' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Strategy Banner: Original Digital Publishing Model */}
            <div className="p-5 bg-gradient-to-r from-[#14382B] to-[#1E4D3C] text-white rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#EAD3C7]">
                <TrendingUp className="w-4 h-4" />
                Independent Digital Publishing & Direct Ownership
              </div>
              <h4 className="text-xl font-serif font-bold text-white">
                Bakit Mas Profitable at Secure ang Sariling Digital Products?
              </h4>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                1. <strong>100% Ad Network Compliance (Meta & Google Ads):</strong> Walang ban o flag dahil lehitimong editorial educational workbook ang iyong produkto.<br/>
                2. <strong>100% Customer List Ownership:</strong> Bawat bumibili sa Gumroad ay iyong verified buyer lead para sa mga susunod na edisyon.<br/>
                3. <strong>Zero Affiliate Risk:</strong> Walang dependency sa third-party affiliate vendors, deceptions, o biglaang vendor cancellations.<br/>
                4. <strong>High Margin & Clean Brand:</strong> Ang $14.99 ay 100% direct revenue minus standard minimal payment processing fees.
              </p>
            </div>

            {/* Clear Funnel Architecture */}
            <div className="p-5 bg-white rounded-2xl border border-[#E5DFD5] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                <BookOpen className="w-4 h-4 text-[#B85D36]" />
                Malinaw na Funnel Architecture (Tier 1 vs. Tier 2)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Free Lead Magnet */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                      Tier 1: Libreng Guide ($0)
                    </span>
                    <span className="text-[11px] text-[#635F57] font-medium">Lead Magnet</span>
                  </div>
                  <h6 className="font-serif font-bold text-sm text-[#14382B]">
                    The 7-Day Gentle Gut Reset Guide
                  </h6>
                  <p className="text-xs text-[#635F57] leading-relaxed">
                    Mabilisang starter guide na ibinibigay sa website kapalit ng email address para ma-build ang iyong audience. May hiwalay na optional consent checkbox para sa legal compliance.
                  </p>
                  <a
                    href="/The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                    download="The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                    className="inline-flex items-center gap-1.5 text-xs text-[#14382B] hover:text-[#0E281E] font-medium underline underline-offset-4"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Libreng PDF (Review Copy)</span>
                  </a>
                </div>

                {/* Paid Original Digital Product */}
                <div className="p-4 rounded-xl bg-[#FFF9F5] border border-[#EAD3C7] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#B85D36] text-white text-[10px] font-bold uppercase tracking-wider">
                      Tier 2: Bayad na Produkto ($14.99)
                    </span>
                    <span className="text-[11px] text-[#B85D36] font-semibold">100% Sariling Kita</span>
                  </div>
                  <h6 className="font-serif font-bold text-sm text-[#14382B]">
                    {PLANNER_PRODUCT_INFO.title}
                  </h6>
                  <p className="text-xs text-[#635F57] leading-relaxed">
                    Ang kumpletong 68-pahinang workbook na may 11 modules, food journals, fiber awareness worksheets, at weekly progress reviews. Ibinebenta sa Gumroad gamit ang ready-to-copy listing sa ibaba.
                  </p>
                  <div className="text-[11px] text-[#B85D36] font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Walang affiliate links — 100% authentic digital workbook</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Master Prompt for Complete Manuscript */}
            <div className="p-5 bg-white rounded-2xl border border-[#E5DFD5] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <Sparkles className="w-4 h-4 text-[#B85D36]" />
                  Claude / Author Master Prompt (68-Page Planner)
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE6] hover:bg-[#E5DFD5] text-[#14382B] text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Author Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#635F57]">
                Kopyahin ito at i-paste kay Claude para buuin ang kumpletong printable manuskrito. Nakadisenyo ito gamit ang responsableng clinical language na walang sensationalized claims.
              </p>
              <pre className="p-4 bg-[#FBF9F5] border border-[#E5DFD5] rounded-xl text-[11px] font-mono text-[#333] overflow-x-auto max-h-56 leading-relaxed select-all">
                {claudeMasterPrompt}
              </pre>
            </div>

            {/* Gumroad Listing Copy */}
            <div className="p-5 bg-white rounded-2xl border border-[#E5DFD5] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Gumroad Product Listing Copy (Title, Price & Description)
                </div>
                <button
                  type="button"
                  onClick={handleCopyListing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE6] hover:bg-[#E5DFD5] text-[#14382B] text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedListing ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Gumroad Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#635F57]">
                Direktang i-paste sa iyong Gumroad Product creation page pagkatapos i-upload ang PDF file.
              </p>
              <pre className="p-4 bg-[#FBF9F5] border border-[#E5DFD5] rounded-xl text-[11px] font-mono text-[#333] overflow-x-auto max-h-48 leading-relaxed select-all">
                {gumroadListingCopy}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: SUBSCRIBER DATABASE & ADMIN AUTHENTICATION */}
        {activeTab === 'leads' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {!isAuthenticated ? (
              /* Security Gate: Password Required */
              <div className="max-w-md mx-auto py-10 space-y-5 text-center">
                <div className="w-14 h-14 rounded-full bg-[#14382B]/10 text-[#14382B] flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-xl text-[#14382B]">
                    Administrator Access Protected
                  </h4>
                  <p className="text-xs text-[#635F57]">
                    Please enter the administrator key to decrypt and manage subscriber data.
                  </p>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl text-left flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={verifyAndSaveKey} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Enter Admin Access Key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-[#D5CFC5] rounded-xl text-sm text-[#14382B] focus:outline-none focus:ring-2 focus:ring-[#14382B]/20"
                  />
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-2.5 bg-[#14382B] hover:bg-[#0E281E] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    {isVerifying ? 'Verifying Credentials...' : 'Unlock Subscriber List'}
                  </button>
                </form>

                <p className="text-[11px] text-[#8C877D]">
                  Default key: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">gutwellness_admin_2026</code> (configurable via <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">ADMIN_ACCESS_KEY</code> in environment settings).
                </p>
              </div>
            ) : (
              /* Authenticated View */
              <div className="space-y-6">
                {/* Status Bar */}
                <div className="p-5 border border-[#E5DFD5] bg-white rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5]">
                    <span className="text-[11px] text-[#7A7469] font-medium uppercase tracking-wider block">
                      Total Subscribers
                    </span>
                    <div className="text-2xl font-bold font-serif text-[#14382B] mt-0.5">
                      {total}
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5]">
                    <span className="text-[11px] text-[#7A7469] font-medium uppercase tracking-wider block">
                      Sender.net Auto-Sync
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {senderConfigured ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-800">Connected & Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-800">Secure Database Mode</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#14382B] hover:bg-[#0E281E] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors text-center cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Download CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchLeads()}
                      disabled={isLoading}
                      className="p-2.5 bg-white hover:bg-[#F3EFE6] border border-[#D5CFC5] rounded-xl text-[#14382B] transition-colors"
                      title="Refresh list"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Subscribers Table with Consent Status */}
                {subscribers.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Mail className="w-10 h-10 text-[#C4BEB4] mx-auto" />
                    <h4 className="font-serif font-bold text-base text-[#14382B]">No subscribers captured yet</h4>
                    <p className="text-xs text-[#7A7469] max-w-sm mx-auto">
                      When readers request "The 7-Day Gentle Gut Reset" guide, their details and marketing consent choices will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="border border-[#E5DFD5] rounded-xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F5EE] border-b border-[#E5DFD5] text-[#4A463F] font-semibold">
                        <tr>
                          <th className="py-2.5 px-4">Name</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4">Marketing Consent</th>
                          <th className="py-2.5 px-4">Date Joined</th>
                          <th className="py-2.5 px-4">Sync Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DFD5] text-[#2C2A26]">
                        {subscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="py-3 px-4 font-medium text-[#14382B]">{sub.name || 'Reader'}</td>
                            <td className="py-3 px-4 text-[#4A463F] font-mono text-[11px]">{sub.email}</td>
                            <td className="py-3 px-4">
                              {sub.marketingConsent ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle className="w-3 h-3" /> Opted In
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                                  Free Guide Only
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[#7A7469]">
                              {new Date(sub.date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3 px-4">
                              {sub.senderSynced ? (
                                <span className="text-[11px] font-medium text-emerald-700">Sender.net Synced</span>
                              ) : (
                                <span className="text-[11px] font-medium text-stone-500">Stored Locally</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between text-xs text-[#7A7469]">
          <span>Everyday Gut Wellness · Editorial Administration</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#D5CFC5] hover:bg-[#F3EFE6] text-[#14382B] font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadAdminModal;
