import React from 'react';
import { StoreConfig } from '../types';
import { getCleanWhatsAppNumber, getWhatsAppDisplay } from '../utils/whatsapp';
import { X, ShieldCheck, User, Phone, FileText, CheckCircle2, MapPin } from 'lucide-react';

interface TrustPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageType: 'about' | 'warranty-returns' | 'contact' | 'terms' | 'privacy';
  config: StoreConfig;
}

export const TrustPagesModal: React.FC<TrustPagesModalProps> = ({
  isOpen,
  onClose,
  pageType,
  config,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-2xl max-h-[94dvh] sm:max-h-[88vh] bg-white text-[#0A1628] rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#0A1628] font-display">
              {pageType === 'about' && 'About Devreemz Gadget'}
              {pageType === 'warranty-returns' && 'Warranty & Returns Policy'}
              {pageType === 'contact' && 'Contact & Safe Pickup Hub'}
              {pageType === 'terms' && 'Terms of Service'}
              {pageType === 'privacy' && 'Privacy Policy'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-700 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {pageType === 'about' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  alt="Founder"
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border-2 border-[#1E6BFF]"
                />
                <div>
                  <h3 className="font-bold text-[#0A1628] text-base font-display">
                    Founded by Reemz &amp; Tech Enthusiasts in Lagos
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    "We built Devreemz Gadget because buying an iPhone in Lagos shouldn't feel like a gamble. We test every single device, confirm real battery cycles, and make sure you hold and test the phone before paying."
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#0A1628]">Our Mission</h4>
                <p>
                  Devreemz Gadget provides verified Apple hardware to developers, creative professionals, and tech lovers across Nigeria. We eliminated the gimmicks: no fake battery boosters, no locked iCloud surprises, and no high-pressure automated checkout gates.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#0A1628]">Why We Love Physical Inspection</h4>
                <p>
                  We believe in transparency. When you order through WhatsApp, we welcome you to meet at our safe exchange hub in Victoria Island or receive direct delivery where you can test True Tone, Face ID, and audio before paying.
                </p>
              </div>
            </div>
          )}

          {pageType === 'warranty-returns' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                <h4 className="font-bold text-sm">Devreemz Guarantee Overview</h4>
                <p className="text-xs">
                  Every product listed on our store comes with a written warranty slip and verified IMEI record in our database.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#0A1628]">Certified Pre-Owned Devices</h4>
                <p>
                  Covered by our <strong>7-Day In-House Replacement Warranty</strong>. If any internal hardware defect occurs within 7 days, we swap the unit immediately or provide technical resolution. Includes 30 days of free software and backup guidance.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#0A1628]">Brand-New Sealed Devices</h4>
                <p>
                  Carries official <strong>1-Year Apple Manufacturer Warranty</strong>. You can register your device serial directly with Apple Support or check your coverage at checkcoverage.apple.com.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#0A1628]">Warranty Exclusions</h4>
                <p className="text-xs text-gray-500">
                  Warranty does not cover accidental liquid damage, physical screen cracking post-delivery, or unauthorized third-party repairs.
                </p>
              </div>
            </div>
          )}

          {pageType === 'contact' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase block">Official WhatsApp Support</span>
                    <span className="font-bold text-[#0A1628] text-sm">{getWhatsAppDisplay(config)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase block">Safe Pickup Hub</span>
                    <span className="font-bold text-[#0A1628] text-sm">{config.pickupLocation}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#0A1628]">Hours of Operation</h4>
                <p className="text-xs text-gray-600">
                  {config.businessHours}
                </p>
              </div>
            </div>
          )}

          {pageType === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#0A1628]">Terms of Service</h4>
              <p>
                1. Devreemz Gadget operates as an independent verified reseller. We are not an official affiliate of Apple Inc.
              </p>
              <p>
                2. Device reservations are held for 12 hours after confirmation on WhatsApp. If inspection is not scheduled, the unit returns to public inventory.
              </p>
              <p>
                3. Trade-in quotes generated on the website are non-binding estimates and subject to physical laboratory inspection of device sensors, casing, and activation status.
              </p>
            </div>
          )}

          {pageType === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#0A1628]">Privacy Policy</h4>
              <p>
                1. We do not store or collect credit card numbers, CVVs, or bank login details on this website.
              </p>
              <p>
                2. Browser diagnostics (camera and microphone tests) run exclusively in your local browser window. Zero video, audio, or biometric data is transmitted or recorded.
              </p>
              <p>
                3. Contact information shared over WhatsApp is used strictly to coordinate device inspection and warranty registration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
