import React, { useState, useEffect } from 'react';
import { StoreConfig, ConditionGrade, TradeInSubmission, DeviceDiagnosticReport } from '../types';
import { SEED_TRADE_IN_PRICING } from '../data/seedData';
import { buildTradeInWhatsAppUrl, formatNaira } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';
import {
  X,
  ArrowLeftRight,
  ShieldCheck,
  Phone,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface SellTradeInModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  onSubmitSuccess?: (submission: TradeInSubmission) => void;
  diagnosticReport?: DeviceDiagnosticReport | null;
  onOpenDiagnostics?: () => void;
}

export const SellTradeInModal: React.FC<SellTradeInModalProps> = ({
  isOpen,
  onClose,
  config,
  onSubmitSuccess,
  diagnosticReport,
  onOpenDiagnostics,
}) => {
  const [model, setModel] = useState('iPhone 15 Pro');
  const [storage, setStorage] = useState('128GB');
  const [condition, setCondition] = useState<ConditionGrade>('Good');
  const [batteryHealthClaim, setBatteryHealthClaim] = useState('90%–95% (Settings > Battery)');
  const [contactName, setContactName] = useState('');
  const [notes, setNotes] = useState('');
  const [attachedReport, setAttachedReport] = useState<DeviceDiagnosticReport | null>(diagnosticReport || null);

  useEffect(() => {
    if (diagnosticReport) {
      setAttachedReport(diagnosticReport);
    }
  }, [diagnosticReport]);

  if (!isOpen) return null;

  // Calculate instant estimated range based on Trade-in matrix
  const pricingRule = SEED_TRADE_IN_PRICING.find((p) => p.model === model) || SEED_TRADE_IN_PRICING[0];
  const basePrice = pricingRule.basePrice;
  const storageMult = pricingRule.storageMultipliers[storage] || 1.0;
  const condMult = pricingRule.conditionMultipliers[condition] || 1.0;

  // Battery health factor
  let batteryMult = 1.0;
  if (batteryHealthClaim.includes('100%')) batteryMult = 1.05;
  else if (batteryHealthClaim.includes('Below 80%')) batteryMult = 0.82;

  const estimatedMid = Math.round(basePrice * storageMult * condMult * batteryMult);
  const estimatedMin = Math.round(estimatedMid * 0.94);
  const estimatedMax = Math.round(estimatedMid * 1.06);

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('tradein_sent');

    const tradeInDetails = {
      model,
      storage,
      condition,
      batteryHealth: batteryHealthClaim,
      estimatedMinValue: estimatedMin,
      estimatedMaxValue: estimatedMax,
      contactName: contactName || 'Customer',
      notes,
      diagnosticId: attachedReport?.id,
    };

    const url = buildTradeInWhatsAppUrl(config, tradeInDetails);
    window.open(url, '_blank', 'noopener,noreferrer');

    if (onSubmitSuccess) {
      const submission: TradeInSubmission = {
        id: `TRADE-${Date.now().toString().slice(-6)}`,
        brand: 'Apple',
        model,
        storageSpecs: storage,
        condition,
        batteryHealthClaim,
        estimatedMinValue: estimatedMin,
        estimatedMaxValue: estimatedMax,
        workingCondition: 'Reported Functional',
        accessoriesIncluded: 'Device',
        photos: [],
        contactName: contactName || 'Customer',
        contactChannel: 'whatsapp',
        contactValue: config.whatsapp,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnosticReport: attachedReport || undefined,
      };
      onSubmitSuccess(submission);
    }

    onClose();
  };

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
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0A1628] font-display">
                Trade In Your iPhone
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Instant Lagos valuation appraisal &amp; safe in-person exchange
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
          {/* Estimated Valuation Banner */}
          <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50 border border-blue-200/80 rounded-2xl p-4 text-center space-y-1.5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
              Estimated Trade-In Valuation Range
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0A1628] font-display tabular-nums">
              {formatNaira(estimatedMin)} – {formatNaira(estimatedMax)}
            </div>
            <p className="text-xs text-gray-600 font-medium">
              💡 <strong>No Stories Guarantee:</strong> Final price depends on physical in-person inspection of display, cameras, and iCloud status.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1">
              Select Your iPhone Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
            >
              {SEED_TRADE_IN_PRICING.map((p) => (
                <option key={p.model} value={p.model}>
                  {p.model}
                </option>
              ))}
            </select>
          </div>

          {/* Storage & Condition Row */}
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
                {['64GB', '128GB', '256GB', '512GB', '1TB'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1628] mb-1">
                Physical Condition
              </label>
              <select
                value={condition}
                onChange={(e: any) => setCondition(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
              >
                <option value="New/Sealed">Brand New (Sealed)</option>
                <option value="Like New">Like New (Flawless)</option>
                <option value="Good">Good (Minor usage)</option>
                <option value="Fair">Fair (Noticeable scratches)</option>
              </select>
            </div>
          </div>

          {/* Battery Health Read from iOS Settings */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#0A1628]">
                Battery Maximum Capacity (from iOS Settings)
              </label>
              <span className="text-[10px] text-gray-500">Settings &gt; Battery</span>
            </div>
            <select
              value={batteryHealthClaim}
              onChange={(e) => setBatteryHealthClaim(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
            >
              <option value="100% Battery (Brand New)">100% Maximum Capacity (Brand New)</option>
              <option value="95%–99% Capacity">95% – 99% Maximum Capacity</option>
              <option value="90%–94% Capacity">90% – 94% Maximum Capacity</option>
              <option value="85%–89% Capacity">85% – 89% Maximum Capacity</option>
              <option value="80%–84% Capacity">80% – 84% Maximum Capacity</option>
              <option value="Below 80% (Service Recommended)">Below 80% (Service Recommended)</option>
            </select>
          </div>

          {/* Diagnostic Report integration if run */}
          {attachedReport ? (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Diagnostics Report Attached (#{attachedReport.id})</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                {attachedReport.overallStatus}
              </span>
            </div>
          ) : (
            onOpenDiagnostics && (
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#0A1628] block">Run Browser Health Check?</span>
                  <span className="text-[11px] text-gray-500">Tests touch, mic, and screen dead zones right now</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDiagnostics();
                  }}
                  className="min-h-[36px] px-3 py-1 bg-white hover:bg-slate-100 border border-gray-300 text-xs font-bold text-[#1E6BFF] rounded-lg transition-colors cursor-pointer"
                >
                  Test Device
                </button>
              </div>
            )
          )}

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
                placeholder="e.g. Tunde"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0A1628] mb-1">
                Preferred Upgrade Target
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Looking to upgrade to 16 Pro Max"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF]"
              />
            </div>
          </div>

          {/* Requirement B.8 Note: Zero payment or card details collected */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Devreemz Transparency:</strong> We never collect payment, bank cards, or sensitive data on this website. All appraisals and exchanges happen directly through WhatsApp and in-person inspection.
            </div>
          </div>

          {/* Submit on WhatsApp */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[48px] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Send Trade-In Request on WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
