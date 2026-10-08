import React from 'react';
import { X, BatteryCharging, Lock, ShieldCheck, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

interface BatteryICloudGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatteryICloudGuideModal: React.FC<BatteryICloudGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-xl max-h-[94dvh] sm:max-h-[88vh] bg-white text-[#0A1628] rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E6BFF] border border-[#1E6BFF]/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0A1628] font-display">
                iPhone Verification Guide
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">
                How to verify true Battery Health, iCloud status &amp; authentic parts
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Guide Section 1: Battery Health */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0A1628]">
                How to Check Battery Health &amp; Maximum Capacity
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 text-xs text-gray-700 space-y-2.5 leading-relaxed">
              <p>
                <strong>Step 1:</strong> Open the <strong>Settings</strong> app on your iPhone.
              </p>
              <p>
                <strong>Step 2:</strong> Scroll down and tap on <strong>Battery</strong>.
              </p>
              <p>
                <strong>Step 3:</strong> Tap on <strong>Battery Health &amp; Charging</strong>.
              </p>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-900 block">What to look for:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-600">
                  <li><strong>Maximum Capacity:</strong> 85% to 100% indicates healthy endurance.</li>
                  <li><strong>Peak Performance Capability:</strong> Should read "Your battery is currently supporting normal peak performance."</li>
                  <li><strong>Important Notice:</strong> If it says "Unknown Part", the battery was replaced with a non-OEM part. Devreemz Gadget only sells devices with genuine parts.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Guide Section 2: iCloud & Activation Lock */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0A1628]">
                How to Check iCloud &amp; Activation Lock
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 text-xs text-gray-700 space-y-2.5 leading-relaxed">
              <p>
                <strong>Step 1:</strong> Open <strong>Settings</strong> and look at the very top profile banner.
              </p>
              <p>
                <strong>Step 2:</strong> If someone's name appears, tap it &gt; <strong>Find My</strong> &gt; verify <strong>Find My iPhone</strong> is OFF before leaving.
              </p>
              <p>
                <strong>Step 3 (Best Practice):</strong> Do a full factory reset in front of the vendor: <em>Settings &gt; General &gt; Transfer or Reset iPhone &gt; Erase All Content and Settings</em>.
              </p>
              <div className="p-3 bg-white rounded-xl border border-purple-200 text-[11px] text-purple-950 font-medium">
                ✓ At Devreemz Gadget, every device is completely erased and factory unlocked so you can log into your own Apple ID right at our exchange hub before paying.
              </div>
            </div>
          </div>

          {/* Guide Section 3: Parts & Service History */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#1E6BFF] flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0A1628]">
                How to Check Parts &amp; Service History
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 text-xs text-gray-700 space-y-2.5 leading-relaxed">
              <p>
                <strong>iOS 15.2 and later:</strong> Go to <em>Settings &gt; General &gt; About</em>.
              </p>
              <p>
                Under the serial number, look for the <strong>Parts and Service History</strong> section:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-600">
                <li>If the section does NOT appear, all components are 100% factory original.</li>
                <li>If it lists <strong>"Genuine Apple Part"</strong>, a component was serviced by Apple authorized technicians.</li>
                <li>If it lists <strong>"Unknown Part"</strong>, an aftermarket non-OEM component was installed.</li>
              </ul>
            </div>
          </div>

          {/* Devreemz Promise */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 text-xs text-[#0A1628] space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-blue-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>The Devreemz Gadget Promise</span>
            </h4>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              We encourage every customer to run these exact 3 checks during their inspection in Lagos. We do not rush you, and you pay only after you are 100% satisfied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
