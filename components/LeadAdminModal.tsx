/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  Mail,
  BookOpen,
  Sparkles,
  ShoppingBag,
  Lock
} from 'lucide-react';
import { GUT_CLARITY_PRODUCT } from '../constants';

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
  const [activeTab, setActiveTab] = useState<'leads' | 'gumroad'>('leads');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [senderConfigured, setSenderConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    try {
      const res = await fetch('/api/leads', { headers: { 'x-admin-key': keyToUse } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setAuthError('Session expired or invalid key. Please enter your administrator key.');
        } else {
          setAuthError(data.error || 'Unable to load live subscriber records. Check database configuration.');
        }
        setSubscribers([]);
        setTotal(0);
        return;
      }
      setSubscribers(Array.isArray(data.subscribers) ? data.subscribers : []);
      setTotal(data.total ?? data.subscribers?.length ?? 0);
      setSenderConfigured(Boolean(data.senderConfigured));
    } catch {
      setAuthError('Could not connect to the secure subscriber database. No browser-only records are shown.');
      setSubscribers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = async () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export yet.');
      return;
    }

    if (adminKey) {
      try {
        // Trigger authenticated direct download from server via headers (no query parameter)
        const response = await fetch('/api/leads/export.csv', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminKey}`,
            'X-Admin-Key': adminKey,
          },
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Server responded with ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'everyday_gut_wellness_subscribers.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      } catch (err: any) {
        console.error('CSV export failed:', err);
        alert(`Failed to export CSV: ${err.message || 'Authentication failed'}`);
        return;
      }
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
                Creator Admin: Products & Subscribers
              </h3>
              <p className="text-xs text-white/70">
                Track product readiness and manage verified subscribers
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
            <span>Product readiness</span>
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

        {/* Product readiness: keep future concepts separate from the current offer. */}
        {activeTab === 'gumroad' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            <div className="rounded-2xl bg-[#14382B] p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EAD3C7]">Current digital product</p>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-serif text-2xl font-bold">The 14-Day Gut Clarity Workbook</h4>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">${GUT_CLARITY_PRODUCT.priceUSD}</span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
                26-page printable PDF. Gumroad checkout is still in setup, so the public page is not accepting orders yet.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 text-[#EAD3C7]" />
                Checkout remains disabled until the listing and file delivery are ready.
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5DFD5] bg-white p-5">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 text-[#B85D36]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#635F57]">Future product concept</p>
                  <h5 className="mt-1 font-serif text-lg font-bold text-[#14382B]">The 30-Day Digestive Wellness Planner</h5>
                  <p className="mt-2 text-sm leading-relaxed text-[#635F57]">
                    Preserved as a future product idea. Its content, page count, price, and listing still need to be created and reviewed before it can be offered.
                  </p>
                </div>
              </div>
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
                  Access restricted to authorized administrators. Configure your secret key via <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">ADMIN_ACCESS_KEY</code> in server environment variables.
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
