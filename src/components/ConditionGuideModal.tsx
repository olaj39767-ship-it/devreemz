import React from 'react';
import { StoreConfig } from '../types';
import { ConditionBadge } from './ConditionBadge';
import { X, ShieldCheck, CheckCircle2, Box, BatteryCharging, AlertCircle } from 'lucide-react';

interface ConditionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
}

export const ConditionGuideModal: React.FC<ConditionGuideModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  if (!isOpen) return null;

  const grades = [
    {
      grade: 'New/Sealed' as const,
      summary: 'Brand new, factory sealed packaging with pull tabs intact.',
      warranty: config.newWarrantyTerms,
      battery: '100% Battery Health (0 charge cycles)',
      included: 'All factory accessories, original box, manuals & sealed cables.',
      cosmetic: 'Pristine, never touched or opened.',
    },
    {
      grade: 'Like New' as const,
      summary: 'Gently used for days/weeks. Indistinguishable from new.',
      warranty: config.usedWarrantyTerms,
      battery: '94% - 100% original capacity tested',
      included: 'Original box or certified retail packaging, original chargers & cables.',
      cosmetic: 'Zero visible scratches or signs of wear on glass or chassis.',
    },
    {
      grade: 'Good' as const,
      summary: 'The sweet spot for value. 100% fully tested and functional.',
      warranty: config.usedWarrantyTerms,
      battery: '85% - 93% verified healthy battery life',
      included: 'Fast certified charger & charging cable included.',
      cosmetic: 'Minor cosmetic hairline scratches or faint bezel scuffs from normal daily use.',
    },
    {
      grade: 'Fair' as const,
      summary: 'Maximum discount savings. Tested and confirmed 100% functional.',
      warranty: config.usedWarrantyTerms,
      battery: '80%+ health certified with all sensors active',
      included: 'Charging cable & power adapter.',
      cosmetic: 'Visible scratches or small casing dents, but screen is clean and all features operate perfectly.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-xl max-h-[92dvh] sm:max-h-[85vh] bg-white text-gray-900 rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 font-display">
                Condition Grading Scale
              </h2>
              <p className="text-[11px] text-gray-500">
                How {config.businessName} inspects, tests, and certifies hardware
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

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-gray-800 leading-relaxed flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              Every single used gadget on our floor undergoes a <strong>32-Point Hardware & Diagnostics Test</strong> before listing: screen digitizer, camera focus, biometric Face ID/Touch ID, microphone arrays, Wi-Fi/Bluetooth, and IMEI carrier verification.
            </span>
          </div>

          <div className="space-y-3">
            {grades.map((item) => (
              <div
                key={item.grade}
                className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <ConditionBadge condition={item.grade} size="md" />
                  <span className="text-[11px] text-gray-400">
                    {item.grade === 'New/Sealed' ? 'Manufacturer Sealed' : 'Certified Used'}
                  </span>
                </div>

                <p className="text-xs text-gray-900 font-medium">
                  {item.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1">
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-gray-800">Warranty:</strong> {item.warranty}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-gray-800">Battery:</strong> {item.battery}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Box className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-gray-800">Box & Accessories:</strong> {item.included}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-gray-800">Cosmetic Grade:</strong> {item.cosmetic}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50/80 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 transition-all"
          >
            Got it, take me back
          </button>
        </div>
      </div>
    </div>
  );
};
