import React from 'react';
import { GadgetItem, StoreConfig } from '../types';
import { ConditionBadge } from './ConditionBadge';
import { buildProductOrderUrl, formatNaira } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';
import { BatteryCharging, Shield, Check, Eye, Phone, Lock, Sparkles } from 'lucide-react';

interface ProductCardProps {
  item: GadgetItem;
  onSelect: (item: GadgetItem) => void;
  config?: StoreConfig;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onSelect,
  config,
  compact = false,
}) => {
  const isAvailable = item.status === 'Available' && item.stock > 0;
  const isReserved = item.status === 'Reserved';
  const isSold = item.status === 'Sold' || item.stock === 0;

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    trackEvent('whatsapp_click', { productId: item.id, productName: item.name });
    const url = buildProductOrderUrl(config, item);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = () => {
    trackEvent('product_viewed', { productId: item.id, productName: item.name });
    onSelect(item);
  };

  // Requirement D.2: Show claims ONLY if entered for that specific unit
  const hasSpecificBattery = Boolean(item.batteryHealth && item.batteryHealth.trim());
  const isExplicitSealed = item.condition === 'New/Sealed';
  const hasSpecificWarranty = Boolean(item.warranty && item.warranty.trim());

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white border border-[#C0C7D2]/45 hover:border-[#1E6BFF] rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-lg"
    >
      {/* Top Media & Status Badges */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-300 ${
            !isAvailable ? 'grayscale-40 contrast-90' : ''
          }`}
          loading="lazy"
        />

        {/* Condition & Demo Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
          <ConditionBadge condition={item.condition} size="sm" />
          {item.isDemo && (
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white shadow-xs">
              DEMO
            </span>
          )}
        </div>

        {/* Unit Status Badge: Available vs Reserved vs Sold */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {isSold ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-gray-900/90 text-white shadow-xs backdrop-blur-xs border border-white/20">
              Sold Out
            </span>
          ) : isReserved ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-amber-600/95 text-white shadow-xs backdrop-blur-xs border border-white/20">
              Reserved
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#0A1628]/85 text-white shadow-xs backdrop-blur-xs border border-white/10">
              {item.stock > 1 ? `${item.stock} in stock` : 'Only 1 left'}
            </span>
          )}
        </div>

        {/* Requirement D.2: Battery Health pill ONLY if explicitly specified */}
        {hasSpecificBattery && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white/95 text-[#0A1628] px-2 py-0.5 rounded-md shadow-xs border border-[#C0C7D2]/60 backdrop-blur-xs">
              <BatteryCharging className="w-3 h-3 text-[#1E6BFF]" />
              {item.batteryHealth}
            </span>
          </div>
        )}
      </div>

      {/* Body Information - Requirement A.4: Model, Storage, Color, Condition, Battery, Price */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Attributes row: Storage and Color tags (Hides raw internal category/SKU) */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-1.5">
            {item.storage && (
              <span className="px-1.5 py-0.5 bg-slate-100 text-[#0A1628] rounded font-semibold text-[10px]">
                {item.storage}
              </span>
            )}
            {item.color && (
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-medium text-[10px]">
                {item.color}
              </span>
            )}
            {isExplicitSealed && (
              <span className="px-1.5 py-0.5 bg-blue-50 text-[#1E6BFF] border border-[#1E6BFF]/25 rounded font-semibold text-[10px]">
                Factory Sealed
              </span>
            )}
          </div>

          {/* Model Name */}
          <h3 className="text-sm sm:text-base font-bold text-[#0A1628] group-hover:text-[#1E6BFF] line-clamp-2 leading-snug font-display transition-colors mb-1.5">
            {item.model || item.name}
          </h3>

          {/* Warranty tag ONLY if specifically provided */}
          {hasSpecificWarranty && (
            <div className="flex items-center gap-1 text-[11px] text-[#0A1628]/70 mb-2 truncate font-medium">
              <Shield className="w-3 h-3 text-[#1E6BFF] shrink-0" />
              <span className="truncate">{item.warranty}</span>
            </div>
          )}
        </div>

        {/* Pricing and Action Buttons */}
        <div className="pt-3 border-t border-[#C0C7D2]/25 space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-[#0A1628] tracking-tight font-display tabular-nums">
                {formatNaira(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-xs text-[#0A1628]/40 line-through tabular-nums">
                  {formatNaira(item.originalPrice)}
                </span>
              )}
            </div>

            <span className="text-[10px] text-gray-500 font-medium">
              Inspect before pay
            </span>
          </div>

          {/* Requirement A.5: Replace 'Ask' button with 'Order on WhatsApp' and secondary 'View details' */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleCardClick}
              className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-semibold text-[#0A1628] bg-slate-100 hover:bg-slate-200 border border-[#C0C7D2]/40 transition-all active:scale-97 flex items-center justify-center gap-1.5"
              title="View verification report & specs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View details</span>
            </button>

            {isAvailable ? (
              <button
                type="button"
                onClick={handleOrderClick}
                className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all active:scale-97 flex items-center justify-center gap-1.5"
                title="Order on WhatsApp"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="truncate">Order on WhatsApp</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isReserved ? 'Reserved' : 'Sold'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
