import React, { useState, useMemo, useEffect } from 'react';
import { GadgetItem, StoreConfig } from '../types';
import { ProductCard } from './ProductCard';
import { X, Search, Filter, Sliders, Check, RotateCcw } from 'lucide-react';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GadgetItem[];
  onSelectProduct: (item: GadgetItem) => void;
  config: StoreConfig;
  initialFilter?: { category?: string; maxBudget?: number };
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectProduct,
  config,
  initialFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilter?.category || 'all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<number | undefined>(initialFilter?.maxBudget);
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCategory(initialFilter?.category || 'all');
    setMaxBudgetFilter(initialFilter?.maxBudget);
  }, [isOpen, initialFilter?.category, initialFilter?.maxBudget]);

  const categories = [
    { label: 'All Devices', value: 'all' },
    { label: 'Health Monitors', value: 'health-monitors' },
    { label: 'Smartwatches', value: 'smartwatches' },
    { label: 'Smart Rings', value: 'smart-rings' },
    { label: 'Mobility', value: 'mobility' },
    { label: 'Accessories', value: 'accessories' },
  ];

  const conditionOptions = [
    { label: 'All Conditions', value: 'all' },
    { label: 'Brand New (Sealed)', value: 'New/Sealed' },
    { label: 'Like New (Grade A+)', value: 'Like New' },
    { label: 'Good (Tested)', value: 'Good' },
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesModel = (item.model || '').toLowerCase().includes(q);
        const matchesStorage = (item.storage || '').toLowerCase().includes(q);
        const matchesColor = (item.color || '').toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesModel && !matchesStorage && !matchesColor && !matchesDesc) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        if (selCat !== itemCat) return false;
      }

      // Condition
      if (selectedCondition !== 'all') {
        if (item.condition !== selectedCondition) {
          return false;
        }
      }

      // Budget filter if specified
      if (maxBudgetFilter && maxBudgetFilter > 0) {
        if (item.price > maxBudgetFilter) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (priceSort === 'asc') return a.price - b.price;
      if (priceSort === 'desc') return b.price - a.price;
      return 0;
    });
  }, [items, searchQuery, selectedCategory, selectedCondition, maxBudgetFilter, priceSort]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-5xl h-[94dvh] sm:h-[90vh] bg-white text-[#0A1628] rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 bg-slate-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0A1628] tracking-tight font-display">
              Devreemz Gadget Inventory Catalog
            </h2>
            {/* Requirement D.4: Replace "Showing 31 of 31 verified electronics" with "Showing X of Y devices" */}
            <p className="text-xs text-gray-500 font-medium">
              Showing {filteredItems.length} of {items.length} devices
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-700 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search health monitors, wearables, mobility devices..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 text-[#0A1628] text-xs sm:text-sm rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:border-[#1E6BFF] transition-colors placeholder:text-gray-400 min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`min-h-[40px] px-3.5 py-1.5 text-xs rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-[#0A1628] text-white shadow-xs'
                    : 'bg-slate-100 text-gray-700 hover:bg-slate-200 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary Filter Row: Condition & Price Sort */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-gray-400 flex items-center gap-1 text-[11px] mr-1">
                <Filter className="w-3.5 h-3.5" />
                Condition:
              </span>
              {conditionOptions.map((cond) => (
                <button
                  key={cond.value}
                  onClick={() => setSelectedCondition(cond.value)}
                  className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedCondition === cond.value
                      ? 'bg-blue-50 text-[#1E6BFF] border border-[#1E6BFF]/40 font-bold'
                      : 'bg-slate-100 text-gray-600 hover:text-gray-900 hover:bg-slate-200 border border-gray-200'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {maxBudgetFilter && (
                <button
                  onClick={() => setMaxBudgetFilter(undefined)}
                  className="text-[11px] text-[#1E6BFF] hover:underline flex items-center gap-1 font-semibold"
                >
                  Clear Budget Filter (₦{maxBudgetFilter.toLocaleString()})
                </button>
              )}

              <span className="text-gray-400 text-[11px]">Sort:</span>
              <select
                value={priceSort}
                onChange={(e: any) => setPriceSort(e.target.value)}
                className="min-h-[36px] bg-slate-50 border border-gray-200 text-gray-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#1E6BFF] font-medium"
              >
                <option value="default">Featured</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">
          {filteredItems.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-xs">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A1628]">No devices match your filters</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  We don't currently have this exact match in stock, but our sourcing team can secure one for you on WhatsApp within 24 hours.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCondition('all');
                  setMaxBudgetFilter(undefined);
                  setSearchQuery('');
                }}
                className="min-h-[44px] px-4 py-2 text-xs text-[#1E6BFF] hover:underline font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
              {filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  config={config}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
