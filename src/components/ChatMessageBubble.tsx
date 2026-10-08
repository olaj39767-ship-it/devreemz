import React from 'react';
import { ChatMessage, GadgetItem, RecommendedAction, StoreConfig } from '../types';
import { ProductCard } from './ProductCard';
import { FormattedMarkdown } from '../utils/markdown';
import { buildConciergeHandoffUrl } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';
import {
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  Search,
  ShoppingBag,
  PhoneCall,
  Activity,
  Phone,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSelectProduct: (item: GadgetItem) => void;
  onTriggerAction: (action: RecommendedAction) => void;
  onSendPrompt: (prompt: string) => void;
  config: StoreConfig;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onSelectProduct,
  onTriggerAction,
  onSendPrompt,
  config,
}) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-3.5 pl-8">
        <div className="bg-[#0A1628] text-white border border-[#C0C7D2]/25 px-4 py-2.5 rounded-2xl rounded-tr-xs text-xs sm:text-sm font-medium shadow-sm max-w-[85%] sm:max-w-[75%] leading-relaxed break-words">
          {message.text}
          <div className="text-[9px] text-[#C0C7D2] text-right mt-1 font-mono">
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  }

  // Concierge bubble
  const getActionIcon = (action?: RecommendedAction) => {
    switch (action) {
      case 'BROWSE_CATALOG':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'SELL_TRADE_IN':
        return <ArrowLeftRight className="w-3.5 h-3.5" />;
      case 'REQUEST_ITEM':
        return <Search className="w-3.5 h-3.5" />;
      case 'CONTACT_SUPPORT':
        return <PhoneCall className="w-3.5 h-3.5" />;
      case 'RUN_DIAGNOSTICS':
        return <Activity className="w-3.5 h-3.5" />;
      case 'WARRANTY_LOOKUP':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'VERIFICATION_GUIDE':
        return <FileText className="w-3.5 h-3.5" />;
      default:
        return <ArrowRight className="w-3.5 h-3.5" />;
    }
  };

  // Requirement B.5: Continue on WhatsApp handoff URL
  const handleContinueOnWhatsApp = () => {
    trackEvent('whatsapp_click', { productName: 'Concierge Handoff' });
    const summary = message.text.slice(0, 180).replace(/\n/g, ' ');
    const url = buildConciergeHandoffUrl(config, summary);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-start gap-3 mb-4 pr-3 sm:pr-8 animate-in fade-in duration-200">
      {/* Concierge Avatar */}
      <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0A1628] border border-[#C0C7D2]/30 flex items-center justify-center text-[#1E6BFF] shadow-md shadow-[#0A1628]/20 mt-0.5">
        <Sparkles className="w-4 h-4 text-[#1E6BFF]" />
      </div>

      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Main Bubble */}
        <div className="bg-white text-[#0A1628] rounded-2xl rounded-tl-xs p-4 sm:p-4.5 border border-[#C0C7D2]/40 shadow-xs text-xs sm:text-sm leading-relaxed">
          {/* Header indicator */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#C0C7D2]/25 text-[10px] text-gray-400">
            <span className="font-bold text-[#0A1628] flex items-center gap-1.5">
              <span>{config.businessName}</span>
              <span className="text-[#C0C7D2] font-normal">•</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#1E6BFF]/10 text-[#1E6BFF] border border-[#1E6BFF]/20 uppercase tracking-wider">
                Tech Concierge
              </span>
            </span>
            <span className="font-mono text-[#0A1628]/50">{message.timestamp}</span>
          </div>

          {/* Requirement A.1: Formatted Markdown with zero raw asterisks */}
          <FormattedMarkdown content={message.text} />

          {/* Action Row: Embedded action + Requirement B.5 "Continue on WhatsApp" */}
          <div className="mt-3.5 pt-3 border-t border-[#C0C7D2]/20 flex flex-wrap items-center gap-2">
            {message.recommendedAction && message.actionLabel && (
              <button
                type="button"
                onClick={() => onTriggerAction(message.recommendedAction!)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-98 shadow-xs bg-[#1E6BFF] hover:bg-[#1E6BFF]/90 text-white flex items-center gap-2 cursor-pointer"
              >
                {getActionIcon(message.recommendedAction)}
                <span>{message.actionLabel}</span>
              </button>
            )}

            {/* Requirement B.5: Clear "Continue on WhatsApp" handoff button */}
            <button
              type="button"
              onClick={handleContinueOnWhatsApp}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-98 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Continue on WhatsApp</span>
            </button>
          </div>

          {message.actionDetail && (
            <p className="text-[11px] text-[#0A1628]/70 mt-1.5 font-medium">
              {message.actionDetail}
            </p>
          )}
        </div>

        {/* Inline Matched Products Cards Carousel/Grid */}
        {message.matchedProducts && message.matchedProducts.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0A1628]/60 px-1">
              Matching In-Stock Devices ({message.matchedProducts.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {message.matchedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  item={product}
                  config={config}
                  onSelect={onSelectProduct}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Suggested Quick Prompt Chips */}
        {message.suggestedPrompts && message.suggestedPrompts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendPrompt(prompt)}
                className="min-h-[36px] text-xs text-[#0A1628] hover:text-[#1E6BFF] bg-white hover:bg-slate-50 active:bg-slate-100 border border-[#C0C7D2]/45 shadow-2xs px-3.5 py-1.5 rounded-full transition-all text-left font-medium cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
