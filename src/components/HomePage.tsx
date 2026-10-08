import React, { useState } from 'react';
import { GadgetItem, StoreConfig, CustomerReview, DeliveryProof } from '../types';
import { ProductCard } from './ProductCard';
import { buildGeneralInquiryUrl, formatNaira, getCleanWhatsAppNumber, getWhatsAppDisplay } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Phone,
  ArrowLeftRight,
  ShoppingBag,
  Cpu,
  BatteryCharging,
  Lock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Instagram,
  Star,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Activity,
  FileText,
  Search
} from 'lucide-react';

interface HomePageProps {
  config: StoreConfig;
  inventory: GadgetItem[];
  reviews: CustomerReview[];
  deliveryProofs: DeliveryProof[];
  onBrowseCatalog: (filter?: { category?: string; maxBudget?: number }) => void;
  onOpenTradeIn: () => void;
  onOpenConcierge: () => void;
  onSelectProduct: (item: GadgetItem) => void;
  onOpenDiagnostics: () => void;
  onOpenWarrantyLookup: () => void;
  onOpenGuide: () => void;
  onOpenAbout: () => void;
  onOpenWarrantyPolicy: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  config,
  inventory,
  reviews,
  deliveryProofs,
  onBrowseCatalog,
  onOpenTradeIn,
  onOpenConcierge,
  onSelectProduct,
  onOpenDiagnostics,
  onOpenWarrantyLookup,
  onOpenGuide,
  onOpenAbout,
  onOpenWarrantyPolicy,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleGeneralWhatsApp = () => {
    trackEvent('whatsapp_click', { productName: 'Hero Chat on WhatsApp' });
    const url = buildGeneralInquiryUrl(config);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Filter featured devices
  const featuredPhones = inventory.filter((item) => item.featured || item.isNew).slice(0, 6);
  const newlyArrived = inventory.slice(0, 4);

  // Budget card presets
  const budgetTiers = [
    {
      title: 'Under ₦600k',
      subtitle: 'iPhone 12 & iPhone 13',
      range: '₦350,000 – ₦590,000',
      maxBudget: 600000,
      badge: 'Best Value',
    },
    {
      title: '₦600k – ₦1.0M',
      subtitle: 'iPhone 13 Pro & iPhone 14/15',
      range: '₦600,000 – ₦1,000,000',
      maxBudget: 1000000,
      badge: 'Most Popular',
    },
    {
      title: '₦1.0M – ₦1.6M',
      subtitle: 'iPhone 15 Pro & iPhone 16',
      range: '₦1,000,000 – ₦1,600,000',
      maxBudget: 1600000,
      badge: 'Pro Tier',
    },
    {
      title: '₦1.6M+ Flagship',
      subtitle: 'iPhone 16 Pro Max & M3 MacBooks',
      range: '₦1,600,000 – ₦3,500,000',
      maxBudget: 4000000,
      badge: 'Ultimate Power',
    },
  ];

  // FAQ Items (Honest, zero online payment)
  const faqItems = [
    {
      q: 'How do payment and delivery work? Can I inspect first?',
      a: 'Payment and delivery are arranged directly with us on WhatsApp. You can inspect the phone before paying! We offer same-day direct dispatch in Lagos or safe in-person pickup at our Victoria Island exchange hub. You test True Tone, Face ID, camera, and battery health before you pay a single kobo.',
    },
    {
      q: 'Why do you not have an online shopping cart or card checkout?',
      a: 'At Devreemz Gadget, we believe buying high-value Apple electronics in Lagos requires real trust and personal touch. Automated carts cannot answer condition questions or let you inspect devices. Every order is handled directly by a human on WhatsApp who sends live videos, IMEI proofs, and schedules your inspection.',
    },
    {
      q: 'What is your warranty policy on pre-owned and new iPhones?',
      a: 'Certified pre-owned phones carry our 7-day in-house instant replacement warranty plus 30 days of technical support. Brand-new sealed iPhones carry full 1-year official manufacturer warranty. You can also look up any active warranty status on our website anytime using your IMEI.',
    },
    {
      q: 'How do you verify battery health and iCloud activation lock?',
      a: 'Every single phone passes a multi-point hardware diagnostic before listing. We verify that iCloud / Find My iPhone is 100% clean and turned off, that the display and camera are OEM Apple parts without warnings, and we upload actual battery health screenshots to every product page.',
    },
    {
      q: 'Can I swap or trade in my current device?',
      a: 'Yes! Use our Trade-In calculator to pick your current model, storage, and battery health for an instant estimate. Send the request to our WhatsApp, bring your device for physical inspection in Victoria Island, and pay only the difference.',
    },
  ];

  return (
    <div className="w-full bg-white text-[#0A1628] selection:bg-blue-100 selection:text-blue-900">
      {/* Announcement Strip */}
      {config.announcementBanner && (
        <div className="bg-[#0A1628] text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium border-b border-[#C0C7D2]/20">
          <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>{config.announcementBanner}</span>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-[#1E6BFF]/30 text-xs font-bold text-[#1E6BFF] shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#1E6BFF]" />
              <span>Certified Lagos Apple Specialist • Inspected Before You Pay</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-[#0A1628] leading-[1.1]">
              Verified iPhones.{' '}
              <span className="text-[#1E6BFF] underline decoration-blue-200 decoration-wavy underline-offset-8">
                No stories.
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Every unit tested for genuine parts, true battery health, and clean iCloud. 
              No shady online checkout — arrange inspection and pay directly on WhatsApp.
            </p>

            {/* 3 Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onBrowseCatalog()}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#0A1628] hover:bg-[#0A1628]/90 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0A1628]/20 transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#1E6BFF]" />
                <span>Browse iPhones ({inventory.length})</span>
              </button>

              <button
                type="button"
                onClick={onOpenTradeIn}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#0A1628] font-bold text-xs sm:text-sm border border-gray-300 shadow-xs transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4 text-amber-600" />
                <span>Trade in your iPhone</span>
              </button>

              <button
                type="button"
                onClick={handleGeneralWhatsApp}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>

            {/* Live WhatsApp number indicator */}
            <div className="pt-2 flex items-center justify-center gap-4 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live on WhatsApp: <strong>{getWhatsAppDisplay(config)}</strong>
              </span>
              <span>•</span>
              <span>Pickup Hub: Victoria Island, Lagos</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "HOW WE VERIFY EVERY PHONE" STRIP */}
      <section className="bg-white border-b border-gray-200 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Devreemz Quality Standard
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-display text-[#0A1628]">
              How We Verify Every Single Phone
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-[#1E6BFF] flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0A1628]">IMEI Checked</h3>
              <p className="text-[11px] text-gray-500 leading-normal">
                Global blacklist &amp; carrier financing checked. 100% clean status.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0A1628]">Battery Tested</h3>
              <p className="text-[11px] text-gray-500 leading-normal">
                True cycles &amp; maximum capacity verified with actual screenshot.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100/70 text-purple-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0A1628]">iCloud Confirmed</h3>
              <p className="text-[11px] text-gray-500 leading-normal">
                Find My iPhone off. Ready for instant new Apple ID setup on the spot.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0A1628]">Parts Inspected</h3>
              <p className="text-[11px] text-gray-500 leading-normal">
                Authentic screen &amp; cameras. Zero replacement warning messages.
              </p>
            </div>

            <div className="col-span-2 md:col-span-1 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                5
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950">Tested Before Pay</h3>
              <p className="text-[11px] text-emerald-800 leading-normal">
                Hold, inspect, test Face ID and cameras personally before paying.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED IN-STOCK PHONES */}
      <section className="py-10 sm:py-16 bg-slate-50/50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E6BFF] block mb-1">
                Verified In-Stock Units
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0A1628]">
                Featured iPhones &amp; MacBooks
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Real photos, tested hardware, and guaranteed warranties.
              </p>
            </div>

            <button
              onClick={() => onBrowseCatalog()}
              className="min-h-[44px] px-4 py-2 bg-white hover:bg-slate-100 border border-gray-300 text-xs font-bold text-[#0A1628] rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>View All Devices ({inventory.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredPhones.map((phone) => (
              <ProductCard
                key={phone.id}
                item={phone}
                config={config}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. SHOP BY BUDGET CARDS */}
      <section className="py-10 sm:py-14 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E6BFF] block mb-1">
              Curated Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0A1628]">
              Shop By Budget
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Click any tier to open the catalog pre-filtered for your target price.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {budgetTiers.map((tier, idx) => (
              <div
                key={idx}
                onClick={() => onBrowseCatalog({ maxBudget: tier.maxBudget })}
                className="group p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-gray-200 hover:border-[#1E6BFF] transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md active:scale-98"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-[#1E6BFF] inline-block mb-3">
                    {tier.badge}
                  </span>
                  <h3 className="text-lg font-bold text-[#0A1628] font-display group-hover:text-[#1E6BFF] transition-colors">
                    {tier.title}
                  </h3>
                  <p className="text-xs font-medium text-gray-600 mt-1">
                    {tier.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0A1628] tabular-nums">
                    {tier.range}
                  </span>
                  <span className="p-1.5 rounded-lg bg-white group-hover:bg-[#1E6BFF] text-gray-400 group-hover:text-white transition-all shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. "HOW BUYING WORKS" IN 3 STEPS */}
      <section className="py-12 sm:py-18 bg-slate-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Zero Stress • Complete Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0A1628]">
              How Buying Works at Devreemz Gadget
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              3 straightforward steps without payment gateways or hidden surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E6BFF] border border-blue-200 flex items-center justify-center font-bold text-base font-display">
                01
              </div>
              <h3 className="text-base font-bold text-[#0A1628] font-display">
                1. Pick a Phone
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Browse our verified catalog with real photos, battery health screenshots, specs, and verification reports.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-base font-display">
                02
              </div>
              <h3 className="text-base font-bold text-[#0A1628] font-display">
                2. Chat with Us on WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Tap "Order on WhatsApp" to connect with a specialist. We confirm current stock, share video previews, and discuss trade-ins.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A1628] text-white flex items-center justify-center font-bold text-base font-display">
                03
              </div>
              <h3 className="text-base font-bold text-[#0A1628] font-display">
                3. Inspect, Pay &amp; Collect
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Inspect the device physically, run any diagnostic you want, confirm battery and iCloud. Pay directly only once you are 100% satisfied.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS & DELIVERY PROOFS (ADMIN-MANAGED) */}
      <section className="py-12 sm:py-18 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E6BFF] block mb-1">
                Real Customer Experiences
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0A1628]">
                Reviews &amp; Delivery Proof
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Verified Lagos buyers who inspected their phones before paying.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Real Feedback</span>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-slate-50 border border-gray-200 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-2">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200 text-xs">
                  <div className="font-bold text-[#0A1628] flex items-center justify-between">
                    <span>{rev.name}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{rev.date}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {rev.device} • {rev.location}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Proof Gallery */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#0A1628] uppercase tracking-wider">
              Recent Handover &amp; Safe Hub Pickups
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {deliveryProofs.map((dp) => (
                <div key={dp.id} className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-100 aspect-[16/10]">
                  <img
                    src={dp.image}
                    alt={dp.caption}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3.5 flex flex-col justify-end text-white">
                    <span className="text-xs font-bold">{dp.caption}</span>
                    <span className="text-[10px] text-gray-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#1E6BFF]" />
                      <span>{dp.location} • {dp.date}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E6BFF] block mb-1">
              Clear &amp; Honest Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0A1628]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Everything you need to know about testing, payment, and warranties.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full min-h-[48px] p-4 sm:p-4.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#0A1628]">
                      {faq.q}
                    </span>
                    <span className="p-1 rounded-lg bg-slate-100 text-gray-500 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-4.5 pb-4 pt-1 text-xs sm:text-sm text-gray-600 border-t border-gray-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FOOTER WITH REQUIRED APPLE DISCLAIMER & TRUST LINKS */}
      <footer className="bg-[#0A1628] text-white pt-12 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E6BFF] shadow-[0_0_8px_#1E6BFF]" />
                <span className="font-display font-extrabold text-lg tracking-tight">
                  {config.businessName}
                </span>
              </div>
              <p className="text-xs text-[#C0C7D2] leading-relaxed">
                Lagos' certified Apple device destination. Tested IMEI, honest battery health, and payment on inspection.
              </p>
              <div className="text-xs text-white font-semibold">
                WhatsApp: {getWhatsAppDisplay(config)}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C0C7D2]">
                Explore
              </h4>
              <ul className="space-y-2 text-xs text-[#C0C7D2]">
                <li>
                  <button onClick={() => onBrowseCatalog()} className="hover:text-white transition-colors">
                    Inventory Catalog
                  </button>
                </li>
                <li>
                  <button onClick={onOpenTradeIn} className="hover:text-white transition-colors">
                    Trade-In Valuation
                  </button>
                </li>
                <li>
                  <button onClick={onOpenDiagnostics} className="hover:text-white transition-colors">
                    Hardware Diagnostics
                  </button>
                </li>
                <li>
                  <button onClick={onOpenWarrantyLookup} className="hover:text-white transition-colors">
                    Warranty Status Lookup
                  </button>
                </li>
                <li>
                  <button onClick={onOpenGuide} className="hover:text-white transition-colors">
                    Battery &amp; iCloud Guide
                  </button>
                </li>
              </ul>
            </div>

            {/* Trust & Policies */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C0C7D2]">
                Trust &amp; Legal
              </h4>
              <ul className="space-y-2 text-xs text-[#C0C7D2]">
                <li>
                  <button onClick={onOpenWarrantyPolicy} className="hover:text-white transition-colors">
                    Warranty &amp; Returns Policy
                  </button>
                </li>
                <li>
                  <button onClick={onOpenAbout} className="hover:text-white transition-colors">
                    About Devreemz Gadget
                  </button>
                </li>
                <li>
                  <a href={`https://wa.me/${getCleanWhatsAppNumber(config)}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                    <span>Direct WhatsApp Support</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Social & Location */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C0C7D2]">
                Connect &amp; Pickup
              </h4>
              <div className="text-xs text-[#C0C7D2] space-y-1.5 leading-relaxed">
                <p><strong>Hub:</strong> {config.pickupLocation}</p>
                <p><strong>Hours:</strong> {config.businessHours}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {config.instagramUrl && (
                  <a
                    href={config.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {config.tiktokUrl && (
                  <a
                    href={config.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                    title="TikTok"
                  >
                    TikTok
                  </a>
                )}
                <a
                  href={`https://wa.me/${getCleanWhatsAppNumber(config)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  title="WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Required Legal Disclaimer */}
          <div className="pt-8 border-t border-[#C0C7D2]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-[#C0C7D2]/80">
            <p>
              &copy; {new Date().getFullYear()} {config.businessName}. All rights reserved.
            </p>
            {/* Requirement C footer note: "Devreemz Gadget is not affiliated with Apple Inc." */}
            <p className="font-semibold text-gray-400">
              Devreemz Gadget is an independent electronics retailer and is not affiliated with Apple Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
