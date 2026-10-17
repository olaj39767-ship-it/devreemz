import React, { useState } from 'react';
import { GadgetItem, StoreConfig, CustomerReview, DeliveryProof } from '../types';
import { ProductCard } from './ProductCard';
import { buildGeneralInquiryUrl, getCleanWhatsAppNumber, getWhatsAppDisplay } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Phone,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  MapPin,
  Instagram,
  Star,
  ExternalLink,
  HeartPulse,
  Watch,
  Accessibility,
  Activity,
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
  onSelectProduct,
  onOpenAbout,
  onOpenWarrantyPolicy,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleGeneralWhatsApp = () => {
    trackEvent('whatsapp_click', { productName: 'Hero Chat on WhatsApp' });
    const url = buildGeneralInquiryUrl(config);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const featuredDevices = inventory.filter((item) => item.featured || item.isNew).slice(0, 6);

  const healthCategories = [
    {
      title: 'Blood pressure monitors',
      description: 'Simple at-home readings and everyday health checks.',
      category: 'health-monitors',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85',
      alt: 'Healthcare professional helping someone with a health check',
      icon: HeartPulse,
    },
    {
      title: 'Smartwatches',
      description: 'Wearable activity, sleep and wellness tracking.',
      category: 'smartwatches',
      image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=85',
      alt: 'Smartwatch worn on a wrist',
      icon: Watch,
    },
    {
      title: 'Smart rings',
      description: 'Low-profile wellness tracking, day and night.',
      category: 'smart-rings',
      image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85',
      alt: 'Minimal wearable ring',
      icon: Activity,
    },
    {
      title: 'Mobility support',
      description: 'Thoughtful mobility devices for more independence.',
      category: 'mobility',
      alt: 'Person using a wheelchair',
      icon: Accessibility,
      image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/UNAwheel_Mini_Basic_wheelchair_power_add-on_01.jpg/960px-UNAwheel_Mini_Basic_wheelchair_power_add-on_01.jpg',
      credit: 'Photo: Nick Yudin · Wikimedia Commons · CC BY-SA 4.0',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:UNAwheel_Mini_Basic_wheelchair_power_add-on_01.jpg',
    },
  ];

  const faqItems = [
    {
      q: 'What kind of health technology can I find here?',
      a: 'We are building a considered range of blood pressure monitors, smartwatches, smart rings, mobility devices and other practical health technology. Browse current stock or message us to ask about a specific item.',
    },
    {
      q: 'Can you help me choose the right device?',
      a: 'Yes. Tell our team what you are looking for and we can help compare product features, fit and availability. For medical concerns or interpreting readings, please speak with a qualified healthcare professional.',
    },
    {
      q: 'How do payment and delivery work?',
      a: 'Message us on WhatsApp to confirm current availability, delivery options and payment details before placing an order.',
    },
    {
      q: 'Are products covered by a warranty?',
      a: 'Warranty coverage depends on the product. Ask us to confirm the applicable warranty and support details for an item before you order.',
    },
    {
      q: 'Can I use a health device instead of medical advice?',
      a: 'No. Consumer health devices can help you track information, but they do not replace diagnosis or treatment. Follow the device instructions and consult a qualified healthcare professional about your health.',
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
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-10 sm:py-16 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Practical health technology, with people-first support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-[#0A1628] leading-[1.06]">
              Health tech for{' '}
              <span className="text-emerald-700">everyday life.</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
              Explore blood pressure monitors, smartwatches, smart rings and mobility devices — thoughtfully chosen to help you monitor, move and feel more informed.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onBrowseCatalog()}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#0A1628] hover:bg-[#0A1628]/90 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0A1628]/20 transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                <span>Explore health tech</span>
              </button>

              <button
                type="button"
                onClick={handleGeneralWhatsApp}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-white hover:bg-emerald-50 text-[#0A1628] font-bold text-xs sm:text-sm border border-gray-300 shadow-xs transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer"
              >
                <HeartPulse className="w-4 h-4 text-emerald-700" />
                <span>Ask a health tech specialist</span>
              </button>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live on WhatsApp: <strong>{getWhatsAppDisplay(config)}</strong>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{config.pickupLocation}</span>
            </div>
          </div>

          <div className="relative min-h-[340px] sm:min-h-[440px]">
            <div className="absolute inset-5 sm:inset-8 rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-950/15">
              <img
                src={healthCategories[1].image}
                alt="Wearable health technology for everyday wellness"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/65 via-transparent to-transparent" />
              <div className="absolute left-5 right-5 bottom-5 text-white">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Smarter everyday care</span>
                <p className="mt-1 text-xl sm:text-2xl font-bold font-display">Technology that moves with you.</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-3">
              <img src={healthCategories[0].image} alt={healthCategories[0].alt} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 w-32 h-28 sm:w-40 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl -rotate-3">
              <img src={healthCategories[3].image} alt={healthCategories[3].alt} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-8 right-0 sm:right-2 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-3">
              <img src={healthCategories[2].image} alt={healthCategories[2].alt} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR CUSTOMER SUPPORT */}
      <section className="bg-white border-b border-gray-200 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              A more helpful way to shop
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-display text-[#0A1628]">
              Health tech, with the support to choose confidently
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              ['Clear product details', 'Straightforward specs, condition and included accessories for every listing.'],
              ['Guidance that listens', 'Get help comparing features and finding a device that suits your needs.'],
              ['Careful selection', 'Explore practical options across monitoring, wearables and mobility.'],
              ['Support after purchase', 'Our team is here to help with product and warranty questions.'],
            ].map(([title, description], index) => (
              <div key={title} className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  0{index + 1}
                </div>
                <h3 className="text-sm font-bold text-[#0A1628]">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED HEALTH TECH */}
      {featuredDevices.length > 0 && (
      <section className="py-10 sm:py-16 bg-slate-50/50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E6BFF] block mb-1">
                Thoughtfully selected
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0A1628]">
                Featured health technology
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Useful technology for home health, daily wellness and mobility.
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
            {featuredDevices.map((device) => (
              <ProductCard
              key={device.id}
              item={device}
                config={config}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 4. SHOP BY HEALTH NEED */}
      <section className="py-10 sm:py-14 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Find what fits your life
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0A1628]">
              Explore health tech
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              From a simple home check to wearable tracking and everyday mobility support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.category}
                  className="rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all"
                >
                  <button
                    type="button"
                    onClick={() => onBrowseCatalog({ category: category.category })}
                    className="group w-full text-left cursor-pointer"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={category.image}
                        alt={category.alt}
                        loading="lazy"
                        className={`w-full h-full transition-transform duration-300 ${
                          category.category === 'mobility'
                            ? 'object-contain p-2 bg-white'
                            : 'object-cover group-hover:scale-105'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/50 to-transparent" />
                      <span className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/95 text-emerald-700 flex items-center justify-center shadow">
                        <Icon className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-[#0A1628] font-display group-hover:text-emerald-700 transition-colors">
                        {category.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-600 leading-relaxed">{category.description}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        Explore category <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                  {'credit' in category && category.credit && (
                    <a
                      href={category.creditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 pb-3 text-[10px] text-gray-500 hover:text-gray-700"
                    >
                      {category.credit}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. "HOW BUYING WORKS" IN 3 STEPS */}
      <section className="py-12 sm:py-18 bg-slate-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Helpful from first question to delivery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0A1628]">
              A simple way to find your health tech
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Personal support for choosing the product that fits your everyday needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E6BFF] border border-blue-200 flex items-center justify-center font-bold text-base font-display">
                01
              </div>
              <h3 className="text-base font-bold text-[#0A1628] font-display">
                1. Find what fits
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Explore clear product details across health monitors, wearables and mobility devices.
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
                Ask our team about features, sizing, availability, warranty and delivery before you order.
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
                Confirm the details with us and choose a delivery or pickup option that works for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS & DELIVERY PROOFS (ADMIN-MANAGED) */}
      {(reviews.length > 0 || deliveryProofs.length > 0) && (
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
                Feedback from customers who shopped with our team.
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
      )}

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
                Health technology for everyday life, with helpful product guidance and support from our team.
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
                  <button onClick={() => onBrowseCatalog()} className="hover:text-white transition-colors">
                    Health Tech Catalog
                  </button>
                </li>
                <li>
                  <a href={`https://wa.me/${getCleanWhatsAppNumber(config)}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Ask a Health Tech Specialist
                  </a>
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
            <p className="font-semibold text-gray-400">
              Health technology is not a substitute for professional medical advice, diagnosis or treatment. Please consult a qualified healthcare professional about your health.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
