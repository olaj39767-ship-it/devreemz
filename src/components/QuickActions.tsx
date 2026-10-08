import React from 'react';
import { ShoppingBag, ArrowLeftRight, Search, MessageSquareCode, ShieldCheck, Activity } from 'lucide-react';

interface QuickActionsProps {
  onBrowseCatalog: () => void;
  onOpenSellTradeIn: () => void;
  onOpenDiagnostics: () => void;
  onOpenWantList: () => void;
  onOpenHumanSupport: () => void;
  onOpenConditionGuide: () => void;
  inventoryCount: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onBrowseCatalog,
  onOpenSellTradeIn,
  onOpenDiagnostics,
  onOpenWantList,
  onOpenHumanSupport,
  onOpenConditionGuide,
  inventoryCount,
}) => {
  return (
    <div className="bg-[#0A1628] border-b border-[#C0C7D2]/15 px-3.5 sm:px-6 py-2.5 flex-shrink-0">
      <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {/* Browse Catalog */}
        <button
          onClick={onBrowseCatalog}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-[#C0C7D2]/30 transition-all active:scale-95 shadow-sm"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#1E6BFF]" />
          <span>Browse Inventory</span>
          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#1E6BFF] text-white rounded-full">
            {inventoryCount}
          </span>
        </button>

        {/* Check My Device / Run Diagnostics */}
        <button
          onClick={onOpenDiagnostics}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1E6BFF]/15 hover:bg-[#1E6BFF]/25 text-white border border-[#1E6BFF]/40 transition-all active:scale-95 shadow-xs"
        >
          <Activity className="w-3.5 h-3.5 text-[#1E6BFF]" />
          <span>Device Health Check</span>
          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#1E6BFF]/30 text-[#1E6BFF] rounded-full border border-[#1E6BFF]/40">
            Live
          </span>
        </button>

        {/* Sell / Trade-In */}
        <button
          onClick={onOpenSellTradeIn}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-white border border-[#C0C7D2]/25 transition-all active:scale-95"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#C0C7D2]" />
          <span>Sell / Trade-In</span>
          <span className="text-[10px] text-[#C0C7D2] font-normal">Instant Appraisal</span>
        </button>

        {/* Request an Item (Want List) */}
        <button
          onClick={onOpenWantList}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-[#C0C7D2] hover:text-white border border-[#C0C7D2]/20 transition-all active:scale-95"
        >
          <Search className="w-3.5 h-3.5 text-[#1E6BFF]" />
          <span>Custom Sourcing</span>
        </button>

        {/* Talk to Human */}
        <button
          onClick={onOpenHumanSupport}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-[#C0C7D2] hover:text-white border border-[#C0C7D2]/20 transition-all active:scale-95"
        >
          <MessageSquareCode className="w-3.5 h-3.5 text-[#1E6BFF]" />
          <span>WhatsApp Concierge</span>
        </button>

        {/* Condition Guide */}
        <button
          onClick={onOpenConditionGuide}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-[#C0C7D2]/80 hover:text-white border border-[#C0C7D2]/15 transition-all active:scale-95"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#C0C7D2]/60" />
          <span>Grading Scale</span>
        </button>
      </div>
    </div>
  );
};
