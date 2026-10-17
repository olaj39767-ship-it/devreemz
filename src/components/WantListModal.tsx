import React, { useState } from 'react';
import { StoreConfig, SourcingSubmission } from '../types';
import { buildSourcingWhatsAppUrl, formatNaira } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';
import { X, Search, Phone, CheckCircle2, Sparkles, Info } from 'lucide-react';

interface WantListModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  initialQuery?: string;
  onSubmitSuccess?: (submission: SourcingSubmission) => void;
}

export const WantListModal: React.FC<WantListModalProps> = ({
  isOpen,
  onClose,
  config,
  initialQuery = '',
  onSubmitSuccess,
}) => {
  const [model, setModel] = useState(initialQuery || '');
  const [storage, setStorage] = useState('256GB');
  const [color, setColor] = useState('Natural Titanium');
  const [budget, setBudget] = useState('1800000');
  const [contactName, setContactName] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('sourcing_sent');

    const details = {
      model,
      storage,
      color,
      budget: Number(budget) || 0,
      contactName: contactName || 'Customer',
      notes,
    };

    const url = buildSourcingWhatsAppUrl(config, details);
    window.open(url, '_blank', 'noopener,noreferrer');

    if (onSubmitSuccess) {
      onSubmitSuccess({
        id: `SRC-${Date.now().toString().slice(-6)}`,
        model,
        storage,
        color,
        budget: Number(budget) || 0,
        contactName: contactName || 'Customer',
        contactChannel: 'whatsapp',
        contactValue: config.whatsapp,
        notes,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    onClose();
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
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E6BFF] border border-[#1E6BFF]/30 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0A1628] font-display">
                Device Sourcing Request
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Can't find your dream spec in stock? We'll secure one for you.
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

        {/* Body Form */}
        <form onSubmit={handleSendWhatsApp} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#1E6BFF] shrink-0 mt-0.5" />
            <div>
              Our direct wholesale channels receive daily shipments of verified brand-new sealed and Grade A+ devices. Submit your spec and we'll reply directly on WhatsApp.
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1">
              Desired Apple Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. blood pressure monitor, smart ring, power wheelchair"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#0A1628] font-semibold focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
            />
          </div>

          {/* Storage & Color Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0A1628] mb-1">
                Storage Capacity
              </label>
              <select
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
              >
                {['128GB', '256GB', '512GB', '1TB', '2TB', 'Other'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1628] mb-1">
                Preferred Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Desert Titanium, Space Black"
                className="w-full min-h-[44px] px-3 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#0A1628] font-semibold focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
              />
            </div>
          </div>

          {/* Target Budget in Naira */}
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1">
              Target Budget in Naira (₦) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                ₦
              </span>
              <input
                type="number"
                required
                min="100000"
                step="10000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full min-h-[44px] pl-8 pr-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF] tabular-nums"
              />
            </div>
          </div>

          {/* Customer Name & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0A1628] mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Chinedu"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1628] mb-1">
                Condition Preference
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Sealed preferred, or Grade A+"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
              />
            </div>
          </div>

          {/* Privacy & No Online Checkout note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              Zero payments are taken on the site. Once our team sources the exact unit matching your budget, we send photos, video verification, and arrangement for inspection.
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[48px] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Send Sourcing Request on WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
