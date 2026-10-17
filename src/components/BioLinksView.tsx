import React from 'react';
import { StoreConfig } from '../types';
import { buildGeneralInquiryUrl, getCleanWhatsAppNumber, getWhatsAppDisplay } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';
import {
  ShoppingBag,
  Phone,
  Instagram,
  ArrowRight,
  X,
  ExternalLink,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface BioLinksViewProps {
  config: StoreConfig;
  inventoryCount: number;
  onBrowseCatalog: () => void;
  onOpenTradeIn: () => void;
  onOpenGuide: () => void;
  onOpenWarrantyLookup: () => void;
  onClose: () => void;
}

export const BioLinksView: React.FC<BioLinksViewProps> = ({
  config,
  inventoryCount,
  onBrowseCatalog,
  onClose,
}) => {
  const handleChatWhatsApp = () => {
    trackEvent('whatsapp_click', { productName: 'Bio Links WhatsApp' });
    const url = buildGeneralInquiryUrl(config);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0A1628] text-white flex flex-col items-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Close button */}
      <div className="w-full max-w-md flex justify-end">
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          title="Back to store"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-md my-auto py-6 space-y-6 text-center">
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-[#1E6BFF] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#1E6BFF]/30 font-bold text-2xl font-display">
            DG
          </div>
          <h1 className="text-xl font-bold font-display tracking-tight text-white">
            {config.businessName}
          </h1>
          <p className="text-xs text-[#C0C7D2] max-w-xs mx-auto">
            Health monitors, smart wearables and mobility technology in Lagos.
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active on WhatsApp: {getWhatsAppDisplay(config)}</span>
          </div>
        </div>

        {/* Large Links Buttons - Requirement G.1 */}
        <div className="space-y-3 pt-2">
          {/* 1. Browse health technology */}
          <button
            onClick={() => {
              onClose();
              onBrowseCatalog();
            }}
            className="w-full min-h-[52px] p-4 rounded-2xl bg-white text-[#0A1628] font-bold text-sm shadow-md hover:bg-slate-100 active:scale-98 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#1E6BFF]" />
              <span>Browse Health Tech ({inventoryCount})</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* 2. Chat on WhatsApp */}
          <button
            onClick={handleChatWhatsApp}
            className="w-full min-h-[52px] p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span>Chat &amp; Order on WhatsApp</span>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-200" />
          </button>

        </div>

        {/* Location & Disclaimer */}
        <div className="pt-4 text-xs text-[#C0C7D2]/80 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#1E6BFF]" />
            <span>Pickup Hub: {config.pickupLocation}</span>
          </p>
          <p className="text-[10px] text-gray-500 pt-2">
            Health technology does not replace professional medical advice. Please consult a qualified healthcare professional about your health.
          </p>
        </div>
      </div>
    </div>
  );
};
