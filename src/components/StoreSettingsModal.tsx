import React, { useState } from 'react';
import { StoreConfig } from '../types';
import { X, Save, RotateCcw, Building2, Phone, MessageSquare, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  onSaveConfig: (newConfig: StoreConfig) => void;
  onResetDefault: () => void;
  onOpenAdmin?: () => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDefault,
  onOpenAdmin,
}) => {
  const [formConfig, setFormConfig] = useState<StoreConfig>({ ...config });
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formConfig);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[85vh] bg-white text-gray-900 rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 font-display">
                Storefront & Business Settings
              </h2>
              <p className="text-[11px] text-gray-500">
                Customize placeholders to match your actual gadget shop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business Name & Tagline */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                value={formConfig.businessName}
                onChange={(e) => setFormConfig({ ...formConfig, businessName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={formConfig.tagline}
                onChange={(e) => setFormConfig({ ...formConfig, tagline: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Contact Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={formConfig.whatsapp}
                  onChange={(e) => setFormConfig({ ...formConfig, whatsapp: e.target.value })}
                  placeholder="+15552345678"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formConfig.phone}
                  onChange={(e) => setFormConfig({ ...formConfig, phone: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Store Address & Hours */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Store Location / Pickup Address
              </label>
              <input
                type="text"
                value={formConfig.address}
                onChange={(e) => setFormConfig({ ...formConfig, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Business Hours
              </label>
              <input
                type="text"
                value={formConfig.businessHours}
                onChange={(e) => setFormConfig({ ...formConfig, businessHours: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Trade In Turnaround Hours */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Trade-In Quote Turnaround (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={formConfig.quoteTimeHours}
                onChange={(e) => setFormConfig({ ...formConfig, quoteTimeHours: Number(e.target.value) || 2 })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Warranty Terms */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Used Gear Warranty Policy
              </label>
              <textarea
                rows={2}
                value={formConfig.usedWarrantyTerms}
                onChange={(e) => setFormConfig({ ...formConfig, usedWarrantyTerms: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Brand-New Gear Warranty Policy
              </label>
              <textarea
                rows={2}
                value={formConfig.newWarrantyTerms}
                onChange={(e) => setFormConfig({ ...formConfig, newWarrantyTerms: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            {/* Admin Portal Shortcut */}
            {onOpenAdmin && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>Admin Inventory Control</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-200 text-amber-900 rounded">
                      Manager
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Add new gadgets, edit prices, or adjust live store stock.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="px-3 py-1.5 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0"
                >
                  Manage Inventory
                </button>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onResetDefault}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-200 transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all active:scale-98"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savedToast ? 'Settings Saved!' : 'Save Business Details'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
