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
  KeyRound
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
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [senderConfigured, setSenderConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E5DFD5] overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#14382B] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Users className="w-5 h-5 text-[#EAD3C7]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                Email Subscribers & Lead Manager
              </h3>
              <p className="text-xs text-white/70">
                Manage your eBook downloaders, export CSV, and check Sender.net status
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

        {/* Status Bar */}
        <div className="p-5 border-b border-[#E5DFD5] bg-white grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div className="mx-6 mt-4 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-3">
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
        <div className="p-6 overflow-y-auto flex-1">
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

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between text-xs text-[#7A7469]">
          <span>Direct spreadsheet download available anytime</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#D5CFC5] hover:bg-[#F3EFE6] text-[#14382B] font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadAdminModal;
