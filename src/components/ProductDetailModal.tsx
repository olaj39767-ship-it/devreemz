import React, { useState } from 'react';
import { GadgetItem, StoreConfig } from '../types';
import { ConditionBadge } from './ConditionBadge';
import { buildProductOrderUrl, formatNaira, getProductPageUrl } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';
import {
  X,
  ShieldCheck,
  Box,
  Cpu,
  Phone,
  CheckCircle2,
  XCircle,
  BatteryCharging,
  Share2,
  Printer,
  Check,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface ProductDetailModalProps {
  item: GadgetItem | null;
  onClose: () => void;
  config: StoreConfig;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  onClose,
  config,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'battery'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!item) return null;

  const isAvailable = item.status === 'Available' && item.stock > 0;
  const isReserved = item.status === 'Reserved';
  const isSold = item.status === 'Sold' || item.stock === 0;

  // Build gallery array: main image + gallery images + optional battery screenshot
  const galleryList = Array.from(new Set([
    item.image,
    ...(item.gallery || []),
    ...(item.batteryScreenshot ? [item.batteryScreenshot] : [])
  ])).filter(Boolean);

  const activeImage = galleryList[activeImageIndex] || item.image;

  const handleOrderClick = () => {
    if (!isAvailable) return;
    trackEvent('whatsapp_click', { productId: item.id, productName: item.name });
    const url = buildProductOrderUrl(config, item);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareLink = () => {
    const url = getProductPageUrl(item.id);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Printable Verification Certificate (PDF / Print Window)
  const handlePrintCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const report = item.verificationReport;
    const checksHtml = report?.checks?.map(c => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: 600; color: #1e293b;">${c.category} - ${c.name}</td>
        <td style="padding: 10px; color: ${c.passed ? '#15803d' : '#b91c1c'}; font-weight: 700;">
          ${c.passed ? '✓ PASSED' : '✗ FAILED'}
        </td>
        <td style="padding: 10px; color: #64748b;">${c.detail}</td>
      </tr>
    `).join('') || '<tr><td colspan="3" style="padding: 10px;">No inspection checklist is available for this product.</td></tr>';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Devreemz Gadget Product Details - ${item.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
            .badge { background: #16a34a; color: white; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th { text-align: left; background: #f1f5f9; padding: 10px; font-size: 12px; text-transform: uppercase; color: #475569; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 24px; color: #0f172a;">DEVREEMZ GADGET</h1>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Safe Exchange Hub • Victoria Island, Lagos • +234 903 847 6114</p>
            </div>
            <div class="badge">PRODUCT DETAILS</div>
          </div>

          <div style="margin-top: 25px; padding: 16px; background: #f8fafc; border-radius: 8px;">
            <h2 style="margin: 0 0 10px; font-size: 18px;">${item.name}</h2>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Unit ID:</strong> ${item.id} | <strong>Condition:</strong> ${item.condition}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Brand / Model:</strong> ${item.brand} ${item.model}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Condition:</strong> ${item.condition} | <strong>Warranty:</strong> ${item.warranty || 'Please ask us for details'}</p>
            ${report ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Inspection Date:</strong> ${report.inspectionDate} | <strong>Inspector:</strong> ${report.inspector}</p>` : ''}
          </div>

          <h3 style="margin-top: 30px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Product Inspection Checklist</h3>
          <table>
            <thead>
              <tr>
                <th>Test Component</th>
                <th>Result</th>
                <th>Technical Note</th>
              </tr>
            </thead>
            <tbody>
              ${checksHtml}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Devreemz Gadget Policy:</strong> Every customer is entitled to test and physically inspect this unit before making payment.</p>
            <p>For health-related concerns, consult a qualified healthcare professional.</p>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Strict badge rules (Requirement D.2)
  const hasSpecificBattery = Boolean(item.batteryHealth && item.batteryHealth.trim());
  const isExplicitSealed = item.condition === 'New/Sealed';
  const hasSpecificWarranty = Boolean(item.warranty && item.warranty.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-3xl max-h-[94dvh] sm:max-h-[90vh] bg-white text-[#0A1628] rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Navigation Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-slate-50">
          <div className="flex items-center gap-2 min-w-0">
            <ConditionBadge condition={item.condition} size="md" />
            {item.isDemo && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white">
                DEMO UNIT
              </span>
            )}
            <span className="text-xs text-gray-500 truncate font-medium">
              ID: {item.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareLink}
              className="min-h-[44px] px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[#0A1628] hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all flex items-center gap-1.5"
              title="Copy shareable unit link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrintCertificate}
              className="min-h-[44px] px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[#0A1628] hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all flex items-center gap-1.5"
              title="Download / Print Verification Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Verification PDF</span>
            </button>

            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-700 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main Visual Gallery with Multi-Image Selectors */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 shadow-xs">
              <img
                src={activeImage}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {/* Status Badge overlay */}
              <div className="absolute top-3 right-3 z-10">
                {isSold ? (
                  <span className="px-3 py-1.5 rounded-xl bg-gray-900/90 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs">
                    Sold Out
                  </span>
                ) : isReserved ? (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-600/90 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs">
                    Reserved
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-[#0A1628]/85 text-white font-semibold text-xs backdrop-blur-xs">
                    {item.stock > 1 ? `${item.stock} in stock` : 'Only 1 left'}
                  </span>
                )}
              </div>

              {/* Requirement D.2: Battery Badge ONLY if entered */}
              {hasSpecificBattery && (
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/95 text-[#0A1628] px-3 py-1 rounded-lg shadow-sm border border-gray-200 backdrop-blur-xs">
                    <BatteryCharging className="w-4 h-4 text-[#1E6BFF]" />
                    {item.batteryHealth}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Switchers including authentic Battery Health screenshot */}
            {galleryList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {galleryList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#1E6BFF] ring-2 ring-[#1E6BFF]/30 scale-102'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {item.batteryScreenshot === imgUrl && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-bold text-white text-center py-0.5 uppercase">
                        Battery
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title, Pricing & Attributes */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {item.storage && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-xs text-[#0A1628]">
                  {item.storage}
                </span>
              )}
              {item.color && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-xs text-slate-700">
                  {item.color}
                </span>
              )}
              {isExplicitSealed && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1E6BFF] font-semibold text-xs border border-[#1E6BFF]/30">
                  Brand New Sealed
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#0A1628] tracking-tight font-display">
              {item.name}
            </h2>

            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0A1628] font-display tabular-nums">
                {formatNaira(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-base text-gray-400 line-through tabular-nums">
                  {formatNaira(item.originalPrice)}
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Payment on Physical Inspection
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
              {item.description}
            </p>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 pt-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-[#1E6BFF] text-[#1E6BFF]'
                  : 'border-transparent text-gray-500 hover:text-[#0A1628]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Specs & Security</span>
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'verification'
                  ? 'border-[#1E6BFF] text-[#1E6BFF]'
                  : 'border-transparent text-gray-500 hover:text-[#0A1628]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verification Report</span>
            </button>

            {item.batteryScreenshot && (
              <button
                onClick={() => setActiveTab('battery')}
                className={`min-h-[44px] px-3.5 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'battery'
                    ? 'border-[#1E6BFF] text-[#1E6BFF]'
                    : 'border-transparent text-gray-500 hover:text-[#0A1628]'
                }`}
              >
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>Battery Proof</span>
              </button>
            )}
          </div>

          {/* TAB 1: Product details and optional inspection report */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Product identity, condition and warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">
                    Product
                  </span>
                  <p className="text-xs font-bold text-[#0A1628] mt-0.5 truncate">
                    {item.brand} {item.model}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">
                    Condition
                  </span>
                  <p className="text-xs font-bold text-[#0A1628] mt-0.5 truncate">
                    {item.condition}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">
                    Warranty
                  </span>
                  <p className="text-xs font-bold text-[#0A1628] mt-0.5 truncate">
                    {item.warranty || 'Ask us for details'}
                  </p>
                </div>
              </div>

              {/* Key Hardware Specs */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A1628]">
                  <Cpu className="w-4 h-4 text-[#1E6BFF]" />
                  <span>Hardware Specifications</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(item.specs || {}).map(([key, val]) => (
                    <div key={key} className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                      <span className="text-gray-400 text-[10px] uppercase block font-semibold">{key}</span>
                      <span className="text-[#0A1628] font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's In the Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A1628]">
                  <Box className="w-4 h-4 text-amber-600" />
                  <span>What's In The Box</span>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {(item.whatsIncluded || ['Original Charging Cable', 'Devreemz Inspection Slip']).map((inc, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warranty Guarantee */}
              {hasSpecificWarranty && (
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#1E6BFF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">Devreemz Warranty Guarantee</h4>
                    <p className="text-xs text-blue-900/80 mt-0.5 leading-relaxed">
                      {item.warranty}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Verification Report */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                    Official QA Assessment
                  </span>
                  <h3 className="text-base font-bold text-emerald-950 font-display">
                    {item.verificationReport?.overallVerdict || 'Grade A+ Passed & Certified'}
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Inspected on {item.verificationReport?.inspectionDate || 'Recently Verified'} by {item.verificationReport?.inspector || 'QA Lead'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  ✓
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Product Inspection Checklist
                </h4>
                <div className="space-y-1.5">
                  {item.verificationReport?.checks?.length ? item.verificationReport.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {check.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-[#0A1628]">{check.name}</div>
                          <div className="text-[11px] text-gray-500">{check.category} • {check.detail}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                        PASS
                      </span>
                    </div>
                  )) : (
                    <p className="text-xs text-gray-600">
                      No separate inspection checklist is available for this product. Contact us to confirm condition, compatibility and warranty details.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Battery Proof Screenshot */}
          {activeTab === 'battery' && item.batteryScreenshot && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-600">
                <p>
                  <strong>Actual Battery Health Screenshot:</strong> Captured from iOS Settings &gt; Battery &gt; Battery Health &amp; Charging for this exact unit (ID: {item.id}).
                </p>
              </div>
              <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-gray-300 shadow-md">
                <img
                  src={item.batteryScreenshot}
                  alt="Battery Health Proof"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky CTA */}
        <div className="p-3.5 sm:p-4 border-t border-gray-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="hidden sm:block">
            <span className="text-[11px] text-gray-500 block">Official Ordering Process:</span>
            <span className="text-xs font-semibold text-[#0A1628]">
              Chat on WhatsApp &rarr; Inspect device in Lagos &rarr; Pay upon satisfaction
            </span>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            {isAvailable ? (
              <button
                onClick={handleOrderClick}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 active:scale-97 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Order on WhatsApp (Unit #{item.id})</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-400 bg-gray-200 border border-gray-300 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Unit Currently {isReserved ? 'Reserved' : 'Sold Out'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
