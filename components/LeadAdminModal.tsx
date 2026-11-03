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
  FileText
} from 'lucide-react';

interface Subscriber {
  id: string;
  name: string;
  email: string;
  date: string;
  source: string;
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

  const fetchLeads = async () => {
    setIsLoading(true);
    let apiSuccess = false;
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (data.subscribers && data.subscribers.length > 0) {
          setSubscribers(data.subscribers);
          setTotal(data.total || data.subscribers.length);
          setSenderConfigured(Boolean(data.senderConfigured));
          apiSuccess = true;
        }
      }
    } catch (err) {
      console.warn('API leads endpoint offline, using local storage fallback:', err);
    }

    if (!apiSuccess) {
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
    const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const header = ["ID", "Name", "Email", "Date Subscribed", "Source", "Sender Synced"];
    const rows = subscribers.map((sub) => [
      escapeCsv(sub.id),
      escapeCsv(sub.name),
      escapeCsv(sub.email),
      escapeCsv(sub.date),
      escapeCsv(sub.source),
      escapeCsv(sub.senderSynced ? "Yes" : "No"),
    ]);
    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gut_wellness_subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const claudeMasterPrompt = `You are a world-class Clinical Nutritionist, Functional Gastroenterology Educator, and Bestselling Digital Health Author. 

Write an authoritative, publication-quality eBook titled:
"The 30-Day Gut Motility & Metabolic Rhythm Blueprint: A Clinical Protocol for Smooth Transit, Lasting Bloat Relief, and Microbial Balance"

TARGET AUDIENCE:
Busy adults aged 28-65 experiencing recurring afternoon abdominal distension, irregular bowel transit (Bristol Stool Type 1-2 or alternating), brain fog, and fatigue. They are exhausted by extreme "detox cleanses" and want a physiology-grounded lifestyle protocol that delivers permanent regularity without harsh stimulant laxatives.

TONE & EDITORIAL STANDARDS:
- Authoritative, empathetic, clear, clinical yet accessible (like a top functional medicine practitioner speaking to an intelligent patient).
- Zero miracle cure promises, zero sensationalism. Strictly compliant with FTC and US Dietary Guidelines.
- Deep physiological explanations (Enteric Nervous System, Peristalsis, Migrating Motor Complex [MMC], Gastric Acid, Soluble Beta-Glucans, Short-Chain Fatty Acids [SCFAs]).

BOOK STRUCTURE (GENERATE FULL CHAPTERS WITH HIGH DETAIL):

1. COVER & TITLE PAGE
   - Full Subtitle, Author Bylaw (Everyday Gut Wellness Editorial Board), Edition Year, Copyright Notice, and Clinical Disclaimer.

2. FOREWORD & INTRODUCTION: The Trap of Aggressive Cleanses
   - Why colon detoxes and stimulant teas create dependency and mucosal irritation.
   - The "Housekeeper Wave": Understanding the Migrating Motor Complex (MMC).

3. CHAPTER 1: The Physiology of Digestive Motility
   - The Gut-Brain Axis & Autonomic Tone: Why sympathetic stress pauses peristalsis.
   - Normal Transit Spectrum: Demystifying the myth of mandatory daily 7:00 AM evacuation.
   - The Gastrocolic Reflex: How morning warm liquids signal colonic contractions.

4. CHAPTER 2: The 35-Gram Soluble Fiber Matrix
   - The crucial difference between rough insoluble scraping fiber and smooth gel-forming soluble fiber.
   - Exact Daily Fiber Stacking Protocol (Rolled oats, chia mucilage, pectin in stewed apples, cooked lentils).
   - Practical Table: "High Bloat Catalyst vs. Gentle Gut Swap".

5. CHAPTER 3: The 30-Day Phased Reset Protocol
   - Phase 1 (Days 1-7): Gastrocolic Awakening & Hydration Anchors.
   - Phase 2 (Days 8-21): Plant Diversity Expansion & Pelvic Floor Alignment (35° Squat Angle).
   - Phase 3 (Days 22-30): Circadian Eating Windows & Evening MMC Optimization.

6. CHAPTER 4: 14 Easy Gut-Friendly Recipes
   - Morning Elixirs, High-Soluble Breakfast Bowls, Soothing Midday Stews, and 3-Ingredient Evening Teas. Include exact ingredients, preparation time, and digestive benefits.

7. CHAPTER 5: Targeted Botanical Synergy & Evening Motility Support
   - When whole foods need gentle botanical reinforcement.
   - Objective breakdown of clinically backed botanicals: Psyllium Husk (mucilaginous bulk), Soothing Aloe Vera extract, Bentonite Clay (toxin binder), and L. Acidophilus.
   - Spotlight recommendation for BellyFlush as an optional evening botanical partner with transparent sourcing standards.

8. CHAPTER 6: Printable 30-Day Daily Tracker & Bristol Consistency Diary
   - Daily checklist: 16oz morning water, slow chewing tally, fluid counter, Bristol Stool scale tracker (Type 1-7), and bloating severity log (1-10).

9. APPENDIX: Medical Red Flags (When to Seek a Gastroenterologist)
   - Rectal bleeding, unexplained weight loss, nocturnal symptoms, sudden severe acute pain.

Provide the complete text in pristine, publication-ready Markdown format with beautiful subheadings, callout boxes, bullet points, and tables.`;

  const gumroadListingCopy = `PRODUCT TITLE:
The 30-Day Gut Motility & Metabolic Rhythm Blueprint: Masterclass Edition

PRICE:
$9.99 (Standard) or $14.99 (Deluxe with 14 Gut-Friendly Recipes & Printable Journal)

TAGLINE:
A comprehensive 4-phase clinical protocol, 14 gut-friendly recipes, and daily motility trackers to soothe chronic bloating and re-establish regular bowel habits without harsh cleanses.

PRODUCT DESCRIPTION:
Are you tired of feeling bloated by 3:00 PM, struggling with irregular transit, or relying on aggressive laxative teas that leave your stomach cramping?

Your digestive system isn't "broken"—it's simply out of sync with its natural physiological rhythm.

Inside this comprehensive 30-Day Master Blueprint, you'll discover:
✓ The Enteric Nervous System & Transit Biology: How autonomic tone and the "gut housekeeper wave" (MMC) dictate peristalsis.
✓ The 35-Gram Soluble Fiber Matrix: Gentle gel-forming fiber protocols that soothe mucosal walls without triggering fermentative gas.
✓ The 4-Phase Step-by-Step Reset: Phased protocols from gastrocolic morning awakening to circadian eating windows.
✓ 14 Easy Gut-Restoring Recipes: Delicious morning elixirs, soothing high-soluble breakfast bowls, easy stews, and bedtime herbal broths.
✓ Complete 30-Day Printable Bristol Stool & Bloating Severity Tracker: Document your motility improvements daily.
✓ Targeted Botanical Synergy: Objective analysis of psyllium husk, soothing aloe, and evening motility support.

WHAT YOU RECEIVE:
• Complete High-Resolution Masterclass Guide (PDF)
• 14 Printable Gut-Friendly Recipe Cards
• 30-Day Bristol Stool Consistency & Symptom Journal (Printable Bedside Edition)
• Clinical Dietary & Botanical Reference Guide

POST-PURCHASE THANK-YOU NOTE / AFFILIATE BRIDGE:
"Thank you for investing in your digestive health! Start Phase 1 tomorrow morning. For accelerated results alongside your whole-food routine, check out our recommended evening botanical motility supplement, BellyFlush: [YOUR CLICKBANK AFFILIATE LINK HERE]"`;

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
    if (isOpen) {
      fetchLeads();
    }
  }, [isOpen]);

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
                Creator Admin: Gumroad Suite & Leads Hub
              </h3>
              <p className="text-xs text-white/70">
                Manage your eBook digital product, export Gumroad-ready PDF, copy Claude Master Prompt, and view subscribers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
            <span>Gumroad eBook Suite & Claude Prompt</span>
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
            <span>Email Subscribers ({total})</span>
          </button>
        </div>

        {/* TAB 1: GUMROAD DIGITAL PRODUCT SUITE & CLAUDE PROMPT */}
        {activeTab === 'gumroad' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Strategy Banner: Why Gumroad Own Product + ClickBank Affiliate is the Golden Combination */}
            <div className="p-5 bg-gradient-to-r from-[#14382B] to-[#1E4D3C] text-white rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#EAD3C7]">
                <TrendingUp className="w-4 h-4" />
                The Ultimate Funnel Strategy: Own Product + Clickbank Affiliate
              </div>
              <h4 className="text-xl font-serif font-bold text-white">
                Bakit Mas Mainam ang May Sariling Digital eBook sa Gumroad?
              </h4>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                1. <strong>100% Facebook at Google Ads Approval:</strong> Mas madaling ma-approve ang Ads kung lehitimong digital product (Educational eBook Guide) ang ibinebenta kaysa direct affiliate link na madalas ma-flag.<br/>
                2. <strong>Pag-aari mo ang Customer List (100% Leads):</strong> Sa Gumroad, makukuha mo ang buong pangalan at email ng bawat bumibili. Ang buyer list ay 10x mas valuable.<br/>
                3. <strong>Self-Liquidating Ad Spend:</strong> Ang $9 - $14 na benta ng eBook ay magbabalik ng puhunan mo sa Ads ($0 Customer Acquisition Cost).<br/>
                4. <strong>Double Kita sa Backend:</strong> Sa loob ng eBook at sa Gumroad Thank-You page, i-recommend ang BellyFlush affiliate offer ($100-$150 commission) bilang "Recommended Botanical Accelerator"!
              </p>
            </div>

            {/* Funnel Clarification: Free Lead Magnet vs Paid Gumroad Product */}
            <div className="p-5 bg-white rounded-2xl border border-[#E5DFD5] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                <BookOpen className="w-4 h-4 text-[#B85D36]" />
                Malinaw na Paghihiwalay: Free Lead Magnet vs. Paid Gumroad Product
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free Lead Magnet Card */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                      Tier 1: Libre ($0)
                    </span>
                    <span className="text-[11px] text-[#635F57] font-medium">Pang-Email List</span>
                  </div>
                  <h6 className="font-serif font-bold text-sm text-[#14382B]">
                    The 7-Day Gentle Gut Reset (Starter Guide)
                  </h6>
                  <p className="text-xs text-[#635F57] leading-relaxed">
                    Mabilisang 8-pahinang Quick-Start guide. Ibinibigay nang <strong>100% LIBRE</strong> sa website kapalit ng pangalan at email address ng bisita para ma-build ang iyong email list.
                  </p>
                  <a
                    href="/The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                    download="The-7-Day-Gentle-Gut-Reset-Guide.pdf"
                    className="inline-flex items-center gap-1.5 text-xs text-[#14382B] hover:text-[#0E281E] font-medium underline underline-offset-4"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Libreng Copy (Pang-Review)</span>
                  </a>
                </div>

                {/* Paid Gumroad Product Card */}
                <div className="p-4 rounded-xl bg-[#FFF9F5] border border-[#EAD3C7] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#B85D36] text-white text-[10px] font-bold uppercase tracking-wider">
                      Tier 2: Bayad ($9.99 - $14.99)
                    </span>
                    <span className="text-[11px] text-[#B85D36] font-semibold">100% Kita Mo</span>
                  </div>
                  <h6 className="font-serif font-bold text-sm text-[#14382B]">
                    The 30-Day Gut Motility Masterclass Blueprint
                  </h6>
                  <p className="text-xs text-[#635F57] leading-relaxed">
                    Ang komprehensibong 40+ pahinang master program na may <strong>14 Gut-Healing Recipes</strong>, 4 Phased Protocols, at 30-Day Bristol Journal. Ipagagawa mo ito kay Claude gamit ang Master Prompt sa ibaba.
                  </p>
                  <div className="text-[11px] text-[#B85D36] font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Gamitin ang Claude prompt sa ibaba para gawin ito</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Claude Master Prompt Box */}
            <div className="p-5 bg-white rounded-2xl border border-[#E5DFD5] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <Sparkles className="w-4 h-4 text-[#B85D36]" />
                  Professional Master Prompt para kay Claude
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE6] hover:bg-[#E5DFD5] text-[#14382B] text-xs font-semibold transition-colors"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Claude Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#635F57]">
                Kopyahin ito at i-paste kay Claude (Sonnet o Opus). Dinisenyo ito gamit ang clinical frameworks, anti-AI cliches, step-by-step chapters, recipes, at natural affiliate bridge.
              </p>
              <pre className="p-4 bg-[#FBF9F5] border border-[#E5DFD5] rounded-xl text-[11px] font-mono text-[#333] overflow-x-auto max-h-56 leading-relaxed select-all">
                {claudeMasterPrompt}
              </pre>
            </div>

            {/* Gumroad Listing Copy & Setup Kit */}
            <div className="p-5 bg-white rounded-2xl border border-[#E5DFD5] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14382B]">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Ready-to-Use Gumroad Listing Copy (Title, Price & Description)
                </div>
                <button
                  type="button"
                  onClick={handleCopyListing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFE6] hover:bg-[#E5DFD5] text-[#14382B] text-xs font-semibold transition-colors"
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
                I-paste ito direkta sa iyong Gumroad Product Page para mabilis kang makapagsimulang magbenta.
              </p>
              <pre className="p-4 bg-[#FBF9F5] border border-[#E5DFD5] rounded-xl text-[11px] font-mono text-[#333] overflow-x-auto max-h-48 leading-relaxed select-all">
                {gumroadListingCopy}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: EMAIL SUBSCRIBERS / LEADS */}
        {activeTab === 'leads' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
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
                      <span className="text-xs font-medium text-amber-800">Local CSV Mode</span>
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
                  onClick={fetchLeads}
                  disabled={isLoading}
                  className="p-2.5 bg-white hover:bg-[#F3EFE6] border border-[#D5CFC5] rounded-xl text-[#14382B] transition-colors"
                  title="Refresh list"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Sender.net Info Box if not yet configured */}
            {!senderConfigured && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-3">
                <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-amber-950">Sender.net Automatic Sync Ready:</span>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    All subscriber leads are automatically stored safely in your website's database. Whenever you are ready to auto-send welcome emails via Sender.net, simply set your <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[10px]">SENDER_API_TOKEN</code> in your environment settings.
                  </p>
                </div>
              </div>
            )}

            {/* Subscribers Table / List */}
            {subscribers.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Mail className="w-10 h-10 text-[#C4BEB4] mx-auto" />
                <h4 className="font-serif font-bold text-base text-[#14382B]">No subscribers captured yet</h4>
                <p className="text-xs text-[#7A7469] max-w-sm mx-auto">
                  When readers request "The 7-Day Gentle Gut Reset" eBook, their details will appear here automatically and can be exported as a CSV spreadsheet.
                </p>
              </div>
            ) : (
              <div className="border border-[#E5DFD5] rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F5EE] border-b border-[#E5DFD5] text-[#4A463F] font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Date Joined</th>
                      <th className="py-2.5 px-4">Sender.net Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD5] text-[#2C2A26]">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#14382B]">{sub.name || 'Reader'}</td>
                        <td className="py-3 px-4 text-[#4A463F] font-mono text-[11px]">{sub.email}</td>
                        <td className="py-3 px-4 text-[#7A7469]">
                          {new Date(sub.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {sub.senderSynced ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle className="w-3 h-3" /> Synced
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                              Saved in CSV
                            </span>
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

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between text-xs text-[#7A7469]">
          <span>Everyday Gut Wellness · Creator Suite</span>
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

