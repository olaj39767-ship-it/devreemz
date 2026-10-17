import React, { useState, useEffect, useRef } from 'react';
import {
  GadgetItem,
  ChatMessage,
  StoreConfig,
  RecommendedAction,
  TradeInSubmission,
  SourcingSubmission,
  CustomerReview,
  DeliveryProof,
  WarrantyRecord,
  DeviceDiagnosticReport,
} from './types';
import { INVENTORY_ITEMS } from './data/inventory';
import { DEFAULT_STORE_CONFIG } from './data/storeConfig';
import {
  SEED_REVIEWS,
  SEED_DELIVERY_PROOFS,
  SEED_WARRANTY_RECORDS,
} from './data/seedData';
import { LocalConciergeEngine } from './services/localConcierge';
import { buildGeneralInquiryUrl, getCleanWhatsAppNumber } from './utils/whatsapp';
import { trackEvent } from './utils/analytics';

import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { CatalogModal } from './components/CatalogModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SellTradeInModal } from './components/SellTradeInModal';
import { WantListModal } from './components/WantListModal';
import { HumanHandoffModal } from './components/HumanHandoffModal';
import { ConditionGuideModal } from './components/ConditionGuideModal';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { DeviceDiagnosticsModal } from './components/DeviceDiagnosticsModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { BioLinksView } from './components/BioLinksView';
import { WarrantyLookupModal } from './components/WarrantyLookupModal';
import { BatteryICloudGuideModal } from './components/BatteryICloudGuideModal';
import { TrustPagesModal } from './components/TrustPagesModal';

import {
  Send,
  ArrowLeftRight,
  ShoppingBag,
  Sparkles,
  Loader2,
  Phone,
  MessageSquareCode,
  X,
  ChevronUp,
} from 'lucide-react';

const STORAGE_KEY_CONFIG = 'devreemz_store_config_v1';
const STORAGE_KEY_INVENTORY = 'devreemz_health_inventory_v1';
const STORAGE_KEY_REVIEWS = 'devreemz_reviews_v1';
const STORAGE_KEY_DELIVERY_PROOFS = 'devreemz_delivery_proofs_v1';
const STORAGE_KEY_WARRANTIES = 'devreemz_warranties_v1';

export default function App() {
  // Navigation View: 'home' | 'concierge'
  const [currentView, setCurrentView] = useState<'home' | 'concierge'>('home');
  const [isBioLinksOpen, setIsBioLinksOpen] = useState(false);

  // Store Configuration
  const [config, setConfig] = useState<StoreConfig>(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY_CONFIG) ||
        localStorage.getItem('wastech_store_config_v1') ||
        localStorage.getItem('gadgethub_store_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.businessName === 'GadgetHub' ||
          parsed.businessName === 'wastech' ||
          parsed.businessName === 'devreemz gadget' ||
          !parsed.businessName
        ) {
          parsed.businessName = 'Devreemz Gadget';
        }
        if (
          !parsed.whatsapp ||
          parsed.whatsapp.includes('555') ||
          parsed.whatsapp.includes('8003387336')
        ) {
          parsed.whatsapp = '+234 903 847 6114';
          parsed.phone = '+234 903 847 6114';
        }
        const mergedConfig = { ...DEFAULT_STORE_CONFIG, ...parsed };
        if (/\b(iPhones?|MacBooks?|Apple)\b/i.test(mergedConfig.tagline)) {
          mergedConfig.tagline = DEFAULT_STORE_CONFIG.tagline;
        }
        if (/\b(iPhones?|MacBooks?|Apple|iCloud|IMEI|battery health)\b/i.test(mergedConfig.announcementBanner)) {
          mergedConfig.announcementBanner = DEFAULT_STORE_CONFIG.announcementBanner;
        }
        return mergedConfig;
      }
    } catch {}
    return DEFAULT_STORE_CONFIG;
  });

  // Persistent Real Inventory state
  const [inventory, setInventory] = useState<GadgetItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INVENTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load saved inventory:', err);
    }
    return INVENTORY_ITEMS;
  });

  // Admin-managed Customer Reviews
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_REVIEWS;
  });

  // Admin-managed Delivery Proofs
  const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DELIVERY_PROOFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_DELIVERY_PROOFS;
  });

  // Admin-managed Warranty Records
  const [warrantyRecords, setWarrantyRecords] = useState<WarrantyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WARRANTIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_WARRANTY_RECORDS;
  });

  // Modals & Sheets State
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<{ category?: string; maxBudget?: number }>();
  const [selectedProduct, setSelectedProduct] = useState<GadgetItem | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isWantListOpen, setIsWantListOpen] = useState(false);
  const [isHumanSupportOpen, setIsHumanSupportOpen] = useState(false);
  const [isConditionGuideOpen, setIsConditionGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isWarrantyLookupOpen, setIsWarrantyLookupOpen] = useState(false);
  const [isBatteryGuideOpen, setIsBatteryGuideOpen] = useState(false);
  const [trustPageType, setTrustPageType] = useState<
    'about' | 'warranty-returns' | 'contact' | 'terms' | 'privacy' | null
  >(null);

  // Floating Concierge Drawer (when on home page)
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  const [lastDiagnosticReport, setLastDiagnosticReport] = useState<DeviceDiagnosticReport | null>(() => {
    try {
      const saved =
        localStorage.getItem('devreemz_last_diagnostic_report') ||
        localStorage.getItem('wastech_last_diagnostic_report');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [wantListInitialQuery, setWantListInitialQuery] = useState('');

  // Local Concierge Engine instance
  const localEngineRef = useRef<LocalConciergeEngine>(
    new LocalConciergeEngine(inventory, config)
  );

  const handleUpdateInventory = (newInventory: GadgetItem[]) => {
    setInventory(newInventory);
    try {
      localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(newInventory));
    } catch (err) {
      console.error('Failed to persist inventory:', err);
    }
    localEngineRef.current.updateInventory(newInventory);
  };

  const handleResetInventory = () => {
    setInventory(INVENTORY_ITEMS);
    try {
      localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(INVENTORY_ITEMS));
    } catch (err) {
      console.error('Failed to persist inventory reset:', err);
    }
    localEngineRef.current.updateInventory(INVENTORY_ITEMS);
  };

  const handleUpdateReviews = (newReviews: CustomerReview[]) => {
    setReviews(newReviews);
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(newReviews));
    } catch {}
  };

  const handleUpdateDeliveryProofs = (newProofs: DeliveryProof[]) => {
    setDeliveryProofs(newProofs);
    try {
      localStorage.setItem(STORAGE_KEY_DELIVERY_PROOFS, JSON.stringify(newProofs));
    } catch {}
  };

  const handleUpdateWarrantyRecords = (newRecords: WarrantyRecord[]) => {
    setWarrantyRecords(newRecords);
    try {
      localStorage.setItem(STORAGE_KEY_WARRANTIES, JSON.stringify(newRecords));
    } catch {}
  };

  const handleSaveConfig = (newConfig: StoreConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    } catch {}
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_STORE_CONFIG);
    try {
      localStorage.removeItem(STORAGE_KEY_CONFIG);
    } catch {}
  };

  // Check initial URL hash/path for bio-links
  useEffect(() => {
    if (
      window.location.pathname.includes('/links') ||
      window.location.hash.includes('links')
    ) {
      setIsBioLinksOpen(true);
    }
  }, []);

  useEffect(() => {
    localEngineRef.current.updateConfig(config);
  }, [config]);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'concierge',
      text: `👋 Welcome to **Devreemz Gadget**\n*Health technology for everyday life*\n\nExplore health monitors, smartwatches, smart rings and mobility devices. Browse the catalog or contact our team to ask about a product, availability and warranty details.\n\nHealth devices can help you track information, but they do not replace professional medical advice.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendedAction: 'BROWSE_CATALOG',
      actionLabel: 'Browse In-Stock Inventory',
      actionDetail: `${INVENTORY_ITEMS.length} verified devices ready for delivery`,
      suggestedPrompts: ['Blood pressure monitors', 'Smartwatches', 'Smart rings', 'Mobility devices'],
      source: 'local',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiLoading]);

  // Route recommended actions
  const handleTriggerAction = (action: RecommendedAction) => {
    switch (action) {
      case 'BROWSE_CATALOG':
        setIsCatalogOpen(true);
        break;
      case 'SELL_TRADE_IN':
        setIsSellModalOpen(true);
        break;
      case 'REQUEST_ITEM':
        setIsWantListOpen(true);
        break;
      case 'CONTACT_SUPPORT':
        setIsHumanSupportOpen(true);
        break;
      case 'RUN_DIAGNOSTICS':
        setIsDiagnosticsOpen(true);
        break;
      case 'WARRANTY_LOOKUP':
        setIsWarrantyLookupOpen(true);
        break;
      case 'VERIFICATION_GUIDE':
        setIsBatteryGuideOpen(true);
        break;
      default:
        break;
    }
  };

  // Process chat message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputVal).trim();
    if (!query || isAiLoading) return;

    // Append User Message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');

    // Local Deterministic Layer (fast, accurate, WhatsApp oriented)
    const localResult = localEngineRef.current.processMessage(query);

    if (localResult.handled && localResult.response) {
      const conciergeMessage: ChatMessage = {
        id: `concierge-${Date.now()}`,
        sender: 'concierge',
        text: localResult.response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedAction: localResult.response.recommendedAction,
        actionLabel: localResult.response.actionLabel,
        actionDetail: localResult.response.actionDetail,
        suggestedPrompts: localResult.response.suggestedPrompts,
        matchedProducts: localResult.response.matchedProducts,
        source: 'local',
      };
      setMessages((prev) => [...prev, conciergeMessage]);
      return;
    }

    // Fallback: match by catalog keywords
    setIsAiLoading(true);
    setTimeout(() => {
      const fallbackMsg: ChatMessage = {
        id: `concierge-${Date.now()}`,
        sender: 'concierge',
        text: `Here are some options that may match your search. Contact our team to confirm current availability, product details and warranty coverage.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedAction: 'BROWSE_CATALOG',
        actionLabel: 'Browse All Inventory',
        actionDetail: 'Filter by budget and specs',
        suggestedPrompts: ['Blood pressure monitors', 'Smartwatches', 'Smart rings', 'Mobility devices'],
        source: 'local',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setIsAiLoading(false);
    }, 350);
  };

  // Trade-in success notification
  const handleTradeInSuccess = (submission: TradeInSubmission) => {
    trackEvent('tradein_sent');
    const tradeInCardMessage: ChatMessage = {
      id: `trade-in-card-${Date.now()}`,
      sender: 'concierge',
      text: `🔄 **Trade-In Request (#${submission.id}) Logged**\n\n• **Model**: ${submission.model} (${submission.storageSpecs})\n• **Condition**: ${submission.condition}\n• **Estimated Valuation**: **₦${submission.estimatedMinValue.toLocaleString()} – ₦${submission.estimatedMaxValue.toLocaleString()}**\n• **Contact**: ${submission.contactName} (${submission.contactChannel})\n\nOur team has received this on WhatsApp and will verify your inspection details shortly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendedAction: 'BROWSE_CATALOG',
      actionLabel: 'Browse Replacement Devices',
      actionDetail: 'Pick your upgrade from inventory',
      suggestedPrompts: ['Blood pressure monitors', 'Smartwatches', 'Smart rings', 'Mobility devices'],
      source: 'local',
    };
    setMessages((prev) => [...prev, tradeInCardMessage]);
  };

  // Sourcing success notification
  const handleWantListSuccess = (submission: SourcingSubmission) => {
    trackEvent('sourcing_sent');
    const wantListCardMessage: ChatMessage = {
      id: `want-list-card-${Date.now()}`,
      sender: 'concierge',
      text: `🎯 **Sourcing Request Active (#${submission.id})**\n\n• **Device Requested**: ${submission.model} ${submission.storage || ''} (${submission.color || 'Any'})\n• **Target Budget**: **₦${Number(submission.budget || 0).toLocaleString()}**\n• **Alert Contact**: ${submission.contactChannel} (${submission.contactValue})\n\nWe've flagged your request in our daily direct-import pipeline. You'll be notified on WhatsApp the second a matching verified unit is secured!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendedAction: 'BROWSE_CATALOG',
      actionLabel: 'Explore In-Stock Models',
      actionDetail: 'See what we have right now',
      suggestedPrompts: ['Blood pressure monitors', 'Smartwatches', 'Smart rings', 'Mobility devices'],
      source: 'local',
    };
    setMessages((prev) => [...prev, wantListCardMessage]);
  };

  // Direct ask about a product
  const handleAskConciergeAboutProduct = (product: GadgetItem) => {
    setSelectedProduct(null);
    setCurrentView('concierge');
    handleSendMessage(
      `Tell me about the ${product.name} - what features, warranty and included accessories should I know about?`
    );
  };

  // Browse the catalog from homepage with an optional category or budget filter
  const handleOpenCatalogWithFilter = (filter?: { category?: string; maxBudget?: number }) => {
    setCatalogFilter(filter);
    setIsCatalogOpen(true);
  };

  // Floating WhatsApp click
  const handleFloatingWhatsAppClick = () => {
    trackEvent('whatsapp_click', { productName: 'Floating Button' });
    const url = buildGeneralInquiryUrl(config);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 text-gray-900 flex flex-col select-none">
      {/* 1. Header with brand wordmark and responsive navigation */}
      <Header
        config={config}
        inventoryCount={inventory.length}
        currentView={currentView}
        onGoHome={() => setCurrentView('home')}
        onGoConcierge={() => setCurrentView('concierge')}
        onBrowseCatalog={() => handleOpenCatalogWithFilter()}
        onOpenSellTradeIn={() => setIsSellModalOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenWantList={() => {
          setWantListInitialQuery('');
          setIsWantListOpen(true);
        }}
        onOpenConditionGuide={() => setIsConditionGuideOpen(true)}
        onOpenWarrantyLookup={() => setIsWarrantyLookupOpen(true)}
        onOpenGuide={() => setIsBatteryGuideOpen(true)}
        onOpenBioLinks={() => setIsBioLinksOpen(true)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />

      {/* 2. Main Viewport: Home Page vs Dedicated Concierge Page */}
      {currentView === 'home' ? (
        <HomePage
          config={config}
          inventory={inventory}
          reviews={reviews}
          deliveryProofs={deliveryProofs}
          onBrowseCatalog={handleOpenCatalogWithFilter}
          onOpenTradeIn={() => setIsSellModalOpen(true)}
          onOpenConcierge={() => setCurrentView('concierge')}
          onSelectProduct={(item) => setSelectedProduct(item)}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          onOpenWarrantyLookup={() => setIsWarrantyLookupOpen(true)}
          onOpenGuide={() => setIsBatteryGuideOpen(true)}
          onOpenAbout={() => setTrustPageType('about')}
          onOpenWarrantyPolicy={() => setTrustPageType('warranty-returns')}
        />
      ) : (
        <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-3 sm:p-4">
          {/* Concierge View Header */}
          <div className="mb-3 px-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-[#0A1628] font-display">
                Devreemz Gadget Tech Concierge
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="text-xs font-semibold text-[#1E6BFF] hover:underline"
            >
              Back to Store
            </button>
          </div>

          {/* Chat Messages */}
          <main className="flex-1 overflow-y-auto space-y-1 pr-1 pb-4">
            {messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                onSelectProduct={(item) => setSelectedProduct(item)}
                onTriggerAction={handleTriggerAction}
                onSendPrompt={(prompt) => handleSendMessage(prompt)}
                config={config}
              />
            ))}

            {isAiLoading && (
              <div className="flex items-center gap-2.5 text-xs text-gray-500 mb-4 animate-in fade-in">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white px-3.5 py-2 rounded-2xl rounded-tl-sm border border-gray-200 shadow-xs flex items-center gap-2 text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  <span>Checking specifications & verified stock...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </main>

          {/* Sticky Input Bar for Concierge Page */}
          <footer className="sticky bottom-2 z-20 bg-[#0A1628] text-white rounded-2xl border border-[#C0C7D2]/25 p-2 sm:p-2.5 shadow-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="hidden xs:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsCatalogOpen(true)}
                  className="p-2 text-[#C0C7D2] hover:text-white bg-white/10 hover:bg-white/15 rounded-xl border border-[#C0C7D2]/25 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Browse Inventory"
                >
                  <ShoppingBag className="w-4 h-4 text-[#1E6BFF]" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(true)}
                  className="p-2 text-[#C0C7D2] hover:text-white bg-white/10 hover:bg-white/15 rounded-xl border border-[#C0C7D2]/25 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Sell / Trade-In"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  enterKeyHint="send"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask about blood pressure monitors, smart rings, or mobility devices..."
                  className="w-full bg-white/10 text-white placeholder:text-[#C0C7D2]/60 text-xs sm:text-sm rounded-xl pl-4 pr-11 py-2.5 sm:py-3 border border-[#C0C7D2]/30 focus:bg-white/15 focus:outline-none focus:border-[#1E6BFF] transition-all min-h-[44px]"
                />
                {inputVal.trim() && (
                  <button
                    type="submit"
                    disabled={isAiLoading}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#1E6BFF] hover:bg-[#1E6BFF]/90 text-white rounded-lg transition-all active:scale-95 shadow-sm min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </footer>
        </div>
      )}

      {/* 3. Floating Action Buttons (WhatsApp + Quick Concierge Launcher) */}
      {/* Floating WhatsApp button on EVERY page (Requirement B.2) */}
      <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2.5">
        {/* Floating Concierge toggle button if on Home Page */}
        {currentView === 'home' && (
          <button
            onClick={() => setCurrentView('concierge')}
            className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#0A1628] text-white border border-[#C0C7D2]/40 shadow-lg shadow-[#0A1628]/25 hover:bg-[#14233c] transition-all active:scale-95 min-h-[44px] cursor-pointer"
            title="Chat with Tech Concierge"
          >
            <Sparkles className="w-4 h-4 text-[#1E6BFF]" />
            <span className="text-xs font-bold font-display">Tech Concierge</span>
          </button>
        )}

        {/* Universal Floating WhatsApp Button */}
        <button
          onClick={handleFloatingWhatsAppClick}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/35 transition-all active:scale-95 min-h-[48px] cursor-pointer"
          title="Direct WhatsApp Inquiry"
        >
          <Phone className="w-4 h-4 fill-white" />
          <span className="text-xs font-bold tracking-wide font-display">
            Chat on WhatsApp
          </span>
        </button>
      </div>

      {/* 4. Modals & Sheets */}
      {/* Product Catalog Modal */}
      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        items={inventory}
        onSelectProduct={(item) => {
          setIsCatalogOpen(false);
          setSelectedProduct(item);
        }}
        config={config}
        initialFilter={catalogFilter}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        config={config}
      />

      {/* Sell / Trade-In Structured Modal */}
      <SellTradeInModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        config={config}
        onSubmitSuccess={handleTradeInSuccess}
        diagnosticReport={lastDiagnosticReport}
        onOpenDiagnostics={() => {
          setIsSellModalOpen(false);
          setIsDiagnosticsOpen(true);
        }}
      />

      {/* Live Device Diagnostics Modal */}
      <DeviceDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        config={config}
        onOpenHumanSupport={() => setIsHumanSupportOpen(true)}
        onComplete={(report) => {
          setLastDiagnosticReport(report);
          const diagnosticNoticeMsg: ChatMessage = {
            id: `diag-report-${Date.now()}`,
            sender: 'concierge',
            text: `📊 **Device Diagnostics Complete (#${report.id})**\n\n• **Model**: ${report.deviceInfo.model} (${report.deviceInfo.os})\n• **Overall Status**: **${report.overallStatus}** (Score: ${report.summaryScore}/100)\n• **Touch Responsiveness**: ${report.touch.gridTestPassed ? '✅ Verified (Zero dead zones)' : 'Tested'}\n• **Camera & Audio**: ${report.camera.frontPassed ? '✅ Camera Functional' : 'Untested'} / ${report.audio.speakerPassed ? '✅ Audio Output Operational' : 'Tested'}\n\n*Results are ready to be sent on WhatsApp for immediate guaranteed trade-in valuation!*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            recommendedAction: 'SELL_TRADE_IN',
            actionLabel: 'Use Report for Trade-in Valuation',
            actionDetail: `Report #${report.id} attached`,
            suggestedPrompts: ['Sell or trade in this device', 'Browse in-stock upgrades'],
            source: 'local',
          };
          setMessages((prev) => [...prev, diagnosticNoticeMsg]);
        }}
        onAttachToTradeIn={(report) => {
          setLastDiagnosticReport(report);
          setIsDiagnosticsOpen(false);
          setIsSellModalOpen(true);
        }}
      />

      {/* Want List / Item Sourcing Modal */}
      <WantListModal
        isOpen={isWantListOpen}
        onClose={() => setIsWantListOpen(false)}
        config={config}
        initialQuery={wantListInitialQuery}
        onSubmitSuccess={handleWantListSuccess}
      />

      {/* Human Handoff Modal */}
      <HumanHandoffModal
        isOpen={isHumanSupportOpen}
        onClose={() => setIsHumanSupportOpen(false)}
        config={config}
      />

      {/* Condition Guide Modal */}
      <ConditionGuideModal
        isOpen={isConditionGuideOpen}
        onClose={() => setIsConditionGuideOpen(false)}
        config={config}
      />

      {/* Store Settings Modal */}
      <StoreSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetDefault={handleResetConfig}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />

      {/* Admin Control Portal Modal */}
      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        inventory={inventory}
        onUpdateInventory={handleUpdateInventory}
        onResetInventory={handleResetInventory}
        config={config}
        onUpdateConfig={handleSaveConfig}
        reviews={reviews}
        onUpdateReviews={handleUpdateReviews}
        deliveryProofs={deliveryProofs}
        onUpdateDeliveryProofs={handleUpdateDeliveryProofs}
        warrantyRecords={warrantyRecords}
        onUpdateWarrantyRecords={handleUpdateWarrantyRecords}
      />

      {/* Bio Links View for Instagram/TikTok (/links) */}
      {isBioLinksOpen && (
        <BioLinksView
          config={config}
          inventoryCount={inventory.length}
          onBrowseCatalog={() => {
            setIsBioLinksOpen(false);
            handleOpenCatalogWithFilter();
          }}
          onOpenTradeIn={() => {
            setIsBioLinksOpen(false);
            setIsSellModalOpen(true);
          }}
          onOpenGuide={() => {
            setIsBioLinksOpen(false);
            setIsBatteryGuideOpen(true);
          }}
          onOpenWarrantyLookup={() => {
            setIsBioLinksOpen(false);
            setIsWarrantyLookupOpen(true);
          }}
          onClose={() => setIsBioLinksOpen(false)}
        />
      )}

      {/* Warranty Lookup Modal */}
      <WarrantyLookupModal
        isOpen={isWarrantyLookupOpen}
        onClose={() => setIsWarrantyLookupOpen(false)}
        config={config}
        warrantyRecords={warrantyRecords}
      />

      {/* Battery & iCloud Verification Guide Modal */}
      <BatteryICloudGuideModal
        isOpen={isBatteryGuideOpen}
        onClose={() => setIsBatteryGuideOpen(false)}
      />

      {/* Trust Pages Modal (About, Warranty & Returns, Terms, Privacy, Contact) */}
      {trustPageType && (
        <TrustPagesModal
          isOpen={Boolean(trustPageType)}
          onClose={() => setTrustPageType(null)}
          pageType={trustPageType}
          config={config}
        />
      )}
    </div>
  );
}
