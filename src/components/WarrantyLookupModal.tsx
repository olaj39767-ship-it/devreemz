import React, { useState } from 'react';
import { WarrantyRecord, StoreConfig } from '../types';
import { SEED_WARRANTY_RECORDS } from '../data/seedData';
import { getCleanWhatsAppNumber } from '../utils/whatsapp';
import {
  X,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
  Calendar,
  Sparkles
} from 'lucide-react';

interface WarrantyLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  warrantyRecords: WarrantyRecord[];
}

export const WarrantyLookupModal: React.FC<WarrantyLookupModalProps> = ({
  isOpen,
  onClose,
  config,
  warrantyRecords,
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchResult, setMatchResult] = useState<WarrantyRecord | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) return;

    setSearched(true);
    const found = warrantyRecords.find((rec) => {
      const cleanImei = rec.imei.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanPhone = rec.customerPhone.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanImei.includes(clean) || cleanPhone.includes(clean);
    });

    setMatchResult(found || null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg max-h-[94dvh] sm:max-h-[85vh] bg-white text-[#0A1628] rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0A1628] font-display">
                Devreemz Warranty Lookup
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Verify active coverage using device IMEI or purchase phone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-700 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#0A1628] mb-1">
                Enter 15-Digit IMEI or Registered Phone Number
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 358941098234104 or 09038476114"
                  className="w-full min-h-[48px] pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setQuery('358941098234104');
                  setSearched(false);
                }}
                className="text-[11px] text-[#1E6BFF] hover:underline font-semibold"
              >
                Try Demo IMEI (iPhone 16 Pro Max)
              </button>

              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-97 cursor-pointer"
              >
                Verify Warranty
              </button>
            </div>
          </form>

          {/* Results Area */}
          {searched && (
            <div className="pt-2 animate-in fade-in duration-150">
              {matchResult ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">
                          Official Active Warranty
                        </span>
                        <span className="text-[10px] text-emerald-800 font-mono">
                          Record ID: {matchResult.id}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-emerald-600 text-white">
                      {matchResult.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs text-gray-800">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Device Model</span>
                      <span className="font-bold text-[#0A1628]">{matchResult.deviceModel} ({matchResult.storage})</span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Coverage Type</span>
                      <span className="font-bold text-[#0A1628]">{matchResult.coverageType}</span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Purchase Date</span>
                      <span className="font-medium text-[#0A1628]">{matchResult.purchaseDate}</span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Valid Until</span>
                      <span className="font-bold text-emerald-700">{matchResult.expiryDate}</span>
                    </div>
                  </div>

                  {matchResult.notes && (
                    <p className="text-xs text-emerald-900 bg-white/60 p-2.5 rounded-xl border border-emerald-100">
                      <strong>Coverage Notes:</strong> {matchResult.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="text-xs font-bold text-[#0A1628]">No Warranty Record Found</h4>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                    We could not find an active registered warranty for this query. If you purchased recently, contact our support team on WhatsApp to register your record.
                  </p>
                  <a
                    href={`https://wa.me/${getCleanWhatsAppNumber(config)}?text=${encodeURIComponent(`Hello Devreemz Gadget, I would like to verify warranty registration for IMEI: ${query}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Inquire with Support on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
