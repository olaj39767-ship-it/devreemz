import React from 'react';
import { StoreConfig } from '../types';
import { X, Phone, MessageSquare, Clock, MapPin, Building, ShieldCheck, ExternalLink } from 'lucide-react';

interface HumanHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
}

export const HumanHandoffModal: React.FC<HumanHandoffModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  if (!isOpen) return null;

  const cleanPhone = config.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsapp = config.whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hello ${config.businessName}, I would like to speak with a store specialist regarding inventory / custom purchase.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-white text-gray-900 rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 font-display">
                Talk to a Real Person
              </h2>
              <p className="text-[11px] text-gray-500">
                Direct floor staff at {config.businessName}
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
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Need to negotiate pricing on multiple items, discuss wholesale / bulk orders, or verify cosmetic condition on a specific serial number? Reach out directly:
          </p>

          {/* Primary Action: WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Instant Response
                </div>
                <div className="text-sm font-bold text-white">
                  Chat on WhatsApp
                </div>
                <div className="text-[11px] text-emerald-100/90">
                  {config.whatsapp}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Secondary Action: Direct Phone Call */}
          <a
            href={`tel:${cleanPhone}`}
            className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 transition-all group active:scale-98 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Store Line
                </div>
                <div className="text-sm font-bold text-gray-900">
                  Call {config.phone}
                </div>
                <div className="text-[11px] text-gray-500">
                  Direct storefront desk
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors" />
          </a>

          {/* Store Hours & Location details */}
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-2.5 text-xs text-gray-700">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Store Hours</span>
                <span className="font-medium text-gray-800">{config.businessHours}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Address / Pickup</span>
                <span className="font-medium text-gray-800">{config.address}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Wholesale & Trade-In</span>
                <span className="text-gray-600">Walk-ins welcome for instantaneous in-person hardware inspections.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
