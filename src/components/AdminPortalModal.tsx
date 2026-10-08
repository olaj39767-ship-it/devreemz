import React, { useState } from 'react';
import {
  GadgetItem,
  StoreConfig,
  CustomerReview,
  DeliveryProof,
  WarrantyRecord,
  TradeInPricingMatrix,
  UnitAvailabilityStatus,
  ConditionGrade
} from '../types';
import { getStoredAnalytics } from '../utils/analytics';
import { formatNaira } from '../utils/whatsapp';
import {
  X,
  Lock,
  Unlock,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  AlertCircle,
  Package,
  Layers,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Phone,
  Eye,
  EyeOff,
  BatteryCharging,
  Settings,
  Star,
  FileCheck,
  Sliders,
  Sparkles,
  BarChart2
} from 'lucide-react';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: GadgetItem[];
  onUpdateInventory: (newInventory: GadgetItem[]) => void;
  onResetInventory: () => void;
  config: StoreConfig;
  onUpdateConfig: (newConfig: StoreConfig) => void;
  reviews: CustomerReview[];
  onUpdateReviews: (newReviews: CustomerReview[]) => void;
  deliveryProofs: DeliveryProof[];
  onUpdateDeliveryProofs: (newProofs: DeliveryProof[]) => void;
  warrantyRecords: WarrantyRecord[];
  onUpdateWarrantyRecords: (newRecords: WarrantyRecord[]) => void;
}

const STORAGE_KEY_ADMIN_PASS = 'devreemz_admin_passcode';
const STORAGE_KEY_ADMIN_AUTH = 'devreemz_admin_authenticated';
const DEFAULT_PASSCODE = 'admin123';

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onUpdateInventory,
  onResetInventory,
  config,
  onUpdateConfig,
  reviews,
  onUpdateReviews,
  deliveryProofs,
  onUpdateDeliveryProofs,
  warrantyRecords,
  onUpdateWarrantyRecords,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'inventory' | 'add' | 'warranties' | 'reviews' | 'store' | 'analytics' | 'security'
  >('inventory');

  // Search & Filter within Admin
  const [adminSearch, setAdminSearch] = useState('');

  // Product Form State
  const [editingItem, setEditingItem] = useState<GadgetItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formStorage, setFormStorage] = useState('256GB');
  const [formColor, setFormColor] = useState('Desert Titanium');
  const [formCondition, setFormCondition] = useState<ConditionGrade>('Like New');
  const [formStatus, setFormStatus] = useState<UnitAvailabilityStatus>('Available');
  const [formPrice, setFormPrice] = useState<number>(1850000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | undefined>(undefined);
  const [formStock, setFormStock] = useState<number>(2);
  const [formBattery, setFormBattery] = useState('100% Battery Health');
  const [formBatteryScreenshot, setFormBatteryScreenshot] = useState('');
  const [formWarranty, setFormWarranty] = useState('7-Day In-House Replacement Warranty');
  const [formMaskedImei, setFormMaskedImei] = useState('358941******104');
  const [formIcloudStatus, setFormIcloudStatus] = useState('Clean / FMI Off');
  const [formPartsReplaced, setFormPartsReplaced] = useState('All OEM Original — None Replaced');
  const [formImage, setFormImage] = useState('');
  const [formGalleryText, setFormGalleryText] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Warranty Record Form
  const [warImei, setWarImei] = useState('');
  const [warPhone, setWarPhone] = useState('');
  const [warCustomer, setWarCustomer] = useState('');
  const [warModel, setWarModel] = useState('');
  const [warExpiry, setWarExpiry] = useState('');
  const [warSuccess, setWarSuccess] = useState('');

  // Review Form
  const [revName, setRevName] = useState('');
  const [revLocation, setRevLocation] = useState('Lagos');
  const [revDevice, setRevDevice] = useState('');
  const [revComment, setRevComment] = useState('');

  // Store config editing
  const [storeForm, setStoreForm] = useState<StoreConfig>({ ...config });

  // Security
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');

  const analytics = getStoredAnalytics();

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPasscode = localStorage.getItem(STORAGE_KEY_ADMIN_PASS) || DEFAULT_PASSCODE;
    if (passwordInput.trim() === storedPasscode) {
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
    } else {
      setAuthError('Incorrect passcode. Use default "admin123" or your updated passcode.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
    setPasswordInput('');
  };

  // Open Form to Edit Product
  const startEditItem = (item: GadgetItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormModel(item.model || item.name);
    setFormStorage(item.storage || '128GB');
    setFormColor(item.color || 'Original');
    setFormCondition(item.condition);
    setFormStatus(item.status || 'Available');
    setFormPrice(item.price);
    setFormOriginalPrice(item.originalPrice);
    setFormStock(item.stock);
    setFormBattery(item.batteryHealth || '');
    setFormBatteryScreenshot(item.batteryScreenshot || '');
    setFormWarranty(item.warranty);
    setFormMaskedImei(item.maskedImei || '');
    setFormIcloudStatus(item.icloudStatus || 'Clean / FMI Off');
    setFormPartsReplaced(item.partsReplaced || 'All OEM Original');
    setFormImage(item.image);
    setFormGalleryText((item.gallery || []).join('\n'));
    setFormDescription(item.description);
    setActiveTab('add');
    setFormSuccessMessage('');
  };

  // Open Form to Add New
  const startAddNew = () => {
    setEditingItem(null);
    setFormName('');
    setFormModel('');
    setFormStorage('256GB');
    setFormColor('Natural Titanium');
    setFormCondition('Like New');
    setFormStatus('Available');
    setFormPrice(1500000);
    setFormOriginalPrice(undefined);
    setFormStock(2);
    setFormBattery('100% Battery Health');
    setFormBatteryScreenshot('');
    setFormWarranty('7-Day In-House Replacement Warranty');
    setFormMaskedImei('');
    setFormIcloudStatus('Clean / FMI Off');
    setFormPartsReplaced('All OEM Original — None Replaced');
    setFormImage('https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80');
    setFormGalleryText('');
    setFormDescription('');
    setActiveTab('add');
    setFormSuccessMessage('');
  };

  // Save Product (Add or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) {
      alert('Please enter a valid product name and price.');
      return;
    }

    const galleryUrls = formGalleryText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));

    const isNew = formCondition === 'New/Sealed';

    if (editingItem) {
      const updated = inventory.map((it) => {
        if (it.id === editingItem.id) {
          return {
            ...it,
            name: formName.trim(),
            model: formModel.trim() || formName.trim(),
            storage: formStorage.trim(),
            color: formColor.trim(),
            condition: formCondition,
            status: formStatus,
            isNew,
            price: Number(formPrice),
            originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
            stock: Number(formStock),
            batteryHealth: formBattery.trim() || undefined,
            batteryScreenshot: formBatteryScreenshot.trim() || undefined,
            warranty: formWarranty.trim(),
            maskedImei: formMaskedImei.trim() || it.maskedImei,
            icloudStatus: formIcloudStatus.trim() || it.icloudStatus,
            partsReplaced: formPartsReplaced.trim() || it.partsReplaced,
            image: formImage.trim() || it.image,
            gallery: galleryUrls.length > 0 ? galleryUrls : it.gallery,
            description: formDescription.trim() || `${formName}. Certified & tested by Devreemz Gadget.`,
          };
        }
        return it;
      });

      onUpdateInventory(updated);
      setFormSuccessMessage(`"${formName}" updated successfully!`);
    } else {
      const newItem: GadgetItem = {
        id: `DG-${Date.now().toString().slice(-6)}`,
        name: formName.trim(),
        brand: 'Apple',
        model: formModel.trim() || formName.trim(),
        storage: formStorage.trim(),
        color: formColor.trim(),
        category: 'phones',
        condition: formCondition,
        status: formStatus,
        isNew,
        price: Number(formPrice),
        originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        stock: Number(formStock),
        specs: {
          Model: formModel.trim() || formName.trim(),
          Storage: formStorage.trim(),
          Color: formColor.trim(),
          Condition: formCondition,
        },
        whatsIncluded: ['Original USB-C Cable', 'Devreemz Warranty Card'],
        warranty: formWarranty.trim(),
        description: formDescription.trim() || `${formName}. Certified by Devreemz Gadget.`,
        image: formImage.trim() || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80',
        gallery: galleryUrls.length > 0 ? galleryUrls : [formImage.trim()],
        batteryHealth: formBattery.trim() || undefined,
        batteryScreenshot: formBatteryScreenshot.trim() || undefined,
        maskedImei: formMaskedImei.trim() || undefined,
        icloudStatus: formIcloudStatus.trim() || 'Clean / FMI Off',
        partsReplaced: formPartsReplaced.trim() || 'All OEM Original',
        featured: false,
        isDemo: false,
        verificationReport: {
          inspectionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          inspector: 'Devreemz QA Specialist',
          overallVerdict: isNew ? 'Sealed Brand New' : 'Grade A+ Passed',
          imeiStatus: 'Clean GSMA / Whitelisted',
          icloudStatus: 'Clean / Unlocked',
          screenOEM: true,
          batteryOEM: true,
          cameraOEM: true,
          housingCondition: 'Certified Clean',
          checks: [
            { category: 'Display', name: 'Original OLED & Touch', passed: true, detail: 'Pass' },
            { category: 'Sensors', name: 'Face ID & Biometrics', passed: true, detail: 'Pass' },
            { category: 'Cameras', name: 'Front & Rear Optics', passed: true, detail: 'Pass' },
          ],
        },
      };

      onUpdateInventory([newItem, ...inventory]);
      setFormSuccessMessage(`"${formName}" added to live inventory!`);
    }

    setTimeout(() => {
      setActiveTab('inventory');
      setEditingItem(null);
      setFormSuccessMessage('');
    }, 1200);
  };

  // Quick Unit Status Toggle (Available -> Reserved -> Sold)
  const handleCycleStatus = (itemId: string, currentStatus: UnitAvailabilityStatus) => {
    const nextStatus: UnitAvailabilityStatus =
      currentStatus === 'Available' ? 'Reserved' : currentStatus === 'Reserved' ? 'Sold' : 'Available';

    const updated = inventory.map((it) => {
      if (it.id === itemId) {
        return { ...it, status: nextStatus };
      }
      return it;
    });
    onUpdateInventory(updated);
  };

  // Quick Stock Adjustment
  const handleStockChange = (itemId: string, delta: number) => {
    const updated = inventory.map((it) => {
      if (it.id === itemId) {
        const nextStock = Math.max(0, it.stock + delta);
        return {
          ...it,
          stock: nextStock,
          status: nextStock === 0 ? ('Sold' as UnitAvailabilityStatus) : it.status,
        };
      }
      return it;
    });
    onUpdateInventory(updated);
  };

  // Delete Unit
  const handleDeleteProduct = (itemId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      const updated = inventory.filter((it) => it.id !== itemId);
      onUpdateInventory(updated);
    }
  };

  // Requirement D.5: Clear All Demo Data
  const handleClearDemoData = () => {
    if (window.confirm('Clear all demo inventory units? This leaves only your live custom units.')) {
      const realOnly = inventory.filter((it) => !it.isDemo);
      onUpdateInventory(realOnly);
    }
  };

  // Save Warranty Record
  const handleSaveWarranty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warImei.trim() || !warPhone.trim()) return;

    const newRecord: WarrantyRecord = {
      id: `WAR-${Date.now().toString().slice(-6)}`,
      imei: warImei.trim(),
      customerPhone: warPhone.trim(),
      customerName: warCustomer.trim() || 'Valued Customer',
      deviceModel: warModel.trim() || 'iPhone',
      storage: 'Standard',
      purchaseDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiryDate: warExpiry || '1 Year Coverage',
      coverageType: '7-Day In-House Replacement',
      status: 'Active',
      notes: 'Registered by Devreemz Gadget Admin',
    };

    onUpdateWarrantyRecords([newRecord, ...warrantyRecords]);
    setWarImei('');
    setWarPhone('');
    setWarCustomer('');
    setWarModel('');
    setWarSuccess('Warranty record registered successfully!');
    setTimeout(() => setWarSuccess(''), 2500);
  };

  // Save Review
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) return;

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      name: revName.trim(),
      location: revLocation.trim(),
      device: revDevice.trim() || 'iPhone',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      rating: 5,
      comment: revComment.trim(),
      verified: true,
    };

    onUpdateReviews([newRev, ...reviews]);
    setRevName('');
    setRevComment('');
    setRevDevice('');
  };

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    if (!adminSearch.trim()) return true;
    const q = adminSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.model || '').toLowerCase().includes(q) ||
      (item.storage || '').toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl h-[95dvh] sm:h-[92vh] bg-white text-[#0A1628] rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0A1628] text-white border-b border-[#C0C7D2]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1E6BFF]/20 border border-[#1E6BFF]/40 flex items-center justify-center text-[#1E6BFF]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
                  Devreemz Gadget Control Hub
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#1E6BFF] text-white rounded">
                  Manager Portal
                </span>
              </div>
              <p className="text-[11px] text-[#C0C7D2]">
                Control stock availability, prices, verification reports, warranties, and WhatsApp orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold text-[#C0C7D2] hover:text-white bg-white/10 hover:bg-white/15 rounded-lg border border-[#C0C7D2]/25 transition-all cursor-pointer"
              >
                Log Out
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#C0C7D2] hover:text-white rounded-lg bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* LOGIN SCREEN */
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xl space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0A1628] flex items-center justify-center text-[#1E6BFF] shadow-lg shadow-[#0A1628]/20">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0A1628] font-display">
                  Admin Passcode Required
                </h3>
                <p className="text-xs text-gray-500">
                  Enter your store manager passcode to manage live stock, pricing, and warranties.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">
                    Store Passcode
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter admin passcode..."
                      autoFocus
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-sm text-[#0A1628] focus:bg-white focus:outline-none focus:border-[#1E6BFF] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {authError && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-blue-50 text-xs text-blue-950 flex items-center justify-between border border-blue-200">
                  <div>
                    <span className="font-bold">Default Passcode:</span>{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold border border-blue-300">
                      admin123
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordInput('admin123');
                      setAuthError('');
                    }}
                    className="text-xs font-bold text-[#1E6BFF] hover:underline"
                  >
                    Quick Fill
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[44px] py-3 bg-[#1E6BFF] hover:bg-[#1E6BFF]/90 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#1E6BFF]/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Admin Hub</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Navigation Tabs */}
            <div className="px-4 sm:px-6 py-2.5 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setEditingItem(null);
                  }}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'inventory'
                      ? 'bg-[#0A1628] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Inventory ({inventory.length})</span>
                </button>

                <button
                  onClick={startAddNew}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'add'
                      ? 'bg-[#1E6BFF] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingItem ? 'Edit Product' : '+ Add Unit'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('warranties')}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'warranties'
                      ? 'bg-[#0A1628] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Warranties ({warrantyRecords.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'bg-[#0A1628] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Reviews &amp; Proofs</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-[#0A1628] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Stats</span>
                </button>

                <button
                  onClick={() => setActiveTab('store')}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'store'
                      ? 'bg-[#0A1628] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Storefront Settings</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'security'
                      ? 'bg-[#0A1628] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Passcode</span>
                </button>
              </div>

              {activeTab === 'inventory' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearDemoData}
                    className="min-h-[36px] px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                    title="Remove sample DEMO units"
                  >
                    Clear Demo Data
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset catalog to the default verified inventory?')) {
                        onResetInventory();
                      }
                    }}
                    className="min-h-[36px] px-2.5 py-1 text-[11px] font-bold text-gray-500 hover:text-red-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore Factory</span>
                  </button>
                </div>
              )}
            </div>

            {/* TAB: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search Bar */}
                <div className="p-3 sm:px-6 bg-white border-b border-gray-200 flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      placeholder="Search unit name, model, storage, ID..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#0A1628]"
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Showing {filteredInventory.length} units
                  </span>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-2.5">
                  {filteredInventory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-[#1E6BFF]/50 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-gray-200 overflow-hidden shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#0A1628] truncate font-display">
                              {item.name}
                            </h4>
                            {item.isDemo && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-amber-500 text-white">
                                DEMO
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5 truncate">
                            <span className="font-semibold text-[#0A1628]">{item.storage}</span>
                            <span>•</span>
                            <span>{item.condition}</span>
                            {item.batteryHealth && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-bold">{item.batteryHealth}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status cycler, Price, Stock & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Requirement B.4: Status Toggle button (Available vs Reserved vs Sold) */}
                        <button
                          type="button"
                          onClick={() => handleCycleStatus(item.id, item.status)}
                          className={`min-h-[36px] px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            item.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : item.status === 'Reserved'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                          title="Click to toggle status: Available -> Reserved -> Sold"
                        >
                          Status: {item.status}
                        </button>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#0A1628] font-display tabular-nums">
                            {formatNaira(item.price)}
                          </div>
                        </div>

                        {/* Stock Stepper */}
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-gray-200">
                          <button
                            onClick={() => handleStockChange(item.id, -1)}
                            disabled={item.stock <= 0}
                            className="w-6 h-6 rounded-lg bg-white border border-gray-300 text-xs font-bold disabled:opacity-40"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold tabular-nums">
                            {item.stock}
                          </span>
                          <button
                            onClick={() => handleStockChange(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-gray-300 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Edit & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditItem(item)}
                            className="p-2 text-gray-500 hover:text-[#1E6BFF] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Unit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id, item.name)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ADD / EDIT PRODUCT */}
            {activeTab === 'add' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto w-full">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold font-display text-[#0A1628]">
                      {editingItem ? `Edit: ${editingItem.name}` : 'Add New Unit to Live Inventory'}
                    </h3>
                    {editingItem && (
                      <span className="text-xs font-bold text-gray-400 font-mono">
                        {editingItem.id}
                      </span>
                    )}
                  </div>

                  {formSuccessMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{formSuccessMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1628] mb-1">
                        Full Product Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. iPhone 16 Pro Max 256GB Desert Titanium"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-[#0A1628]"
                      />
                    </div>

                    {/* Model, Storage, Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Model Name
                        </label>
                        <input
                          type="text"
                          value={formModel}
                          onChange={(e) => setFormModel(e.target.value)}
                          placeholder="iPhone 16 Pro Max"
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Storage
                        </label>
                        <input
                          type="text"
                          value={formStorage}
                          onChange={(e) => setFormStorage(e.target.value)}
                          placeholder="256GB"
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          value={formColor}
                          onChange={(e) => setFormColor(e.target.value)}
                          placeholder="Desert Titanium"
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                        />
                      </div>
                    </div>

                    {/* Condition, Status & Stock */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Condition
                        </label>
                        <select
                          value={formCondition}
                          onChange={(e: any) => setFormCondition(e.target.value)}
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628] font-bold"
                        >
                          <option value="New/Sealed">Brand New (Sealed)</option>
                          <option value="Like New">Like New (Grade A+)</option>
                          <option value="Good">Good (Tested)</option>
                          <option value="Fair">Fair</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Unit Status
                        </label>
                        <select
                          value={formStatus}
                          onChange={(e: any) => setFormStatus(e.target.value)}
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628] font-bold"
                        >
                          <option value="Available">Available (Can be ordered)</option>
                          <option value="Reserved">Reserved (Order button disabled)</option>
                          <option value="Sold">Sold (Marked out of stock)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Stock Units
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formStock}
                          onChange={(e) => setFormStock(Number(e.target.value))}
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628] font-bold tabular-nums"
                        />
                      </div>
                    </div>

                    {/* Price and Original Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Price in Naira (₦) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="10000"
                          step="10000"
                          value={formPrice}
                          onChange={(e) => setFormPrice(Number(e.target.value))}
                          className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-[#0A1628] tabular-nums"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Original Price (Optional comparison)
                        </label>
                        <input
                          type="number"
                          value={formOriginalPrice || ''}
                          onChange={(e) => setFormOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Optional strikethrough price"
                          className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-[#0A1628] tabular-nums"
                        />
                      </div>
                    </div>

                    {/* Battery Health & Screenshot URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Battery Health (Leave empty if none)
                        </label>
                        <input
                          type="text"
                          value={formBattery}
                          onChange={(e) => setFormBattery(e.target.value)}
                          placeholder="e.g. 100% Battery Health"
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Battery Proof Screenshot URL
                        </label>
                        <input
                          type="url"
                          value={formBatteryScreenshot}
                          onChange={(e) => setFormBatteryScreenshot(e.target.value)}
                          placeholder="https://... screenshot"
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                        />
                      </div>
                    </div>

                    {/* Masked IMEI & iCloud Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          Masked IMEI for Security
                        </label>
                        <input
                          type="text"
                          value={formMaskedImei}
                          onChange={(e) => setFormMaskedImei(e.target.value)}
                          placeholder="358941******104"
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0A1628] mb-1">
                          iCloud / FMI Status
                        </label>
                        <input
                          type="text"
                          value={formIcloudStatus}
                          onChange={(e) => setFormIcloudStatus(e.target.value)}
                          placeholder="Clean / FMI Off"
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                        />
                      </div>
                    </div>

                    {/* Warranty Terms */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1628] mb-1">
                        Warranty Terms
                      </label>
                      <input
                        type="text"
                        value={formWarranty}
                        onChange={(e) => setFormWarranty(e.target.value)}
                        placeholder="7-Day In-House Replacement Warranty"
                        className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                      />
                    </div>

                    {/* Image URL & Multi-Image Gallery */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1628] mb-1">
                        Main Image URL
                      </label>
                      <input
                        type="url"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A1628] mb-1">
                        Multi-Image Gallery URLs (One per line)
                      </label>
                      <textarea
                        rows={2}
                        value={formGalleryText}
                        onChange={(e) => setFormGalleryText(e.target.value)}
                        placeholder="https://... angle 1&#10;https://... angle 2"
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1628] mb-1">
                        Description / Inspection Highlights
                      </label>
                      <textarea
                        rows={2}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Tested in Lagos hub, flawless Grade A+ condition..."
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-[#0A1628]"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('inventory');
                          setEditingItem(null);
                        }}
                        className="min-h-[44px] px-4 py-2 text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="min-h-[44px] px-6 py-2 bg-[#1E6BFF] hover:bg-[#1E6BFF]/90 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>{editingItem ? 'Save Updates' : 'Publish to Store'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: WARRANTIES */}
            {activeTab === 'warranties' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto w-full space-y-6">
                {/* Add new warranty */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-[#0A1628] font-display">
                    Register New Warranty Record
                  </h3>

                  {warSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300">
                      {warSuccess}
                    </div>
                  )}

                  <form onSubmit={handleSaveWarranty} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-[#0A1628] mb-1">IMEI Number (15 digits)</label>
                      <input
                        type="text"
                        required
                        value={warImei}
                        onChange={(e) => setWarImei(e.target.value)}
                        placeholder="358941098234104"
                        className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#0A1628] mb-1">Customer Phone</label>
                      <input
                        type="text"
                        required
                        value={warPhone}
                        onChange={(e) => setWarPhone(e.target.value)}
                        placeholder="09038476114"
                        className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#0A1628] mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={warCustomer}
                        onChange={(e) => setWarCustomer(e.target.value)}
                        placeholder="Customer Name"
                        className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#0A1628] mb-1">Device Model</label>
                      <input
                        type="text"
                        value={warModel}
                        onChange={(e) => setWarModel(e.target.value)}
                        placeholder="iPhone 16 Pro Max 256GB"
                        className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2 pt-2">
                      <button
                        type="submit"
                        className="min-h-[44px] px-6 py-2.5 bg-[#0A1628] text-white font-bold rounded-xl cursor-pointer"
                      >
                        Register Warranty Record
                      </button>
                    </div>
                  </form>
                </div>

                {/* List of Warranties */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-500">
                    Existing Registered Warranties ({warrantyRecords.length})
                  </h4>
                  {warrantyRecords.map((rec) => (
                    <div key={rec.id} className="p-3.5 bg-white rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#0A1628]">{rec.deviceModel} ({rec.customerName})</div>
                        <div className="text-[11px] text-gray-500 font-mono">IMEI: {rec.imei} • Phone: {rec.customerPhone}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {rec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto w-full space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-[#0A1628] font-display">
                    Add Real Customer Review
                  </h3>
                  <form onSubmit={handleSaveReview} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#0A1628] mb-1">Customer Name</label>
                        <input
                          type="text"
                          required
                          value={revName}
                          onChange={(e) => setRevName(e.target.value)}
                          placeholder="Tunde A."
                          className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#0A1628] mb-1">Device Purchased</label>
                        <input
                          type="text"
                          value={revDevice}
                          onChange={(e) => setRevDevice(e.target.value)}
                          placeholder="iPhone 16 Pro Max"
                          className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-[#0A1628] mb-1">Customer Feedback</label>
                      <textarea
                        required
                        rows={2}
                        value={revComment}
                        onChange={(e) => setRevComment(e.target.value)}
                        placeholder="Inspected the phone in Victoria Island before paying..."
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl"
                      />
                    </div>
                    <button
                      type="submit"
                      className="min-h-[44px] px-6 py-2.5 bg-[#0A1628] text-white font-bold rounded-xl cursor-pointer"
                    >
                      Publish Review
                    </button>
                  </form>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-500">
                    Active Published Reviews ({reviews.length})
                  </h4>
                  {reviews.map((r) => (
                    <div key={r.id} className="p-3.5 bg-white rounded-xl border border-gray-200 text-xs">
                      <div className="font-bold text-[#0A1628]">{r.name} ({r.device})</div>
                      <p className="text-gray-600 mt-1 italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: STATS / ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto w-full space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total Devices</span>
                    <p className="text-2xl font-bold font-display text-[#0A1628] mt-1">{inventory.length}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Trade-Ins Sent</span>
                    <p className="text-2xl font-bold font-display text-[#1E6BFF] mt-1">{analytics.tradeInsSent}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Sourcing Requests</span>
                    <p className="text-2xl font-bold font-display text-emerald-600 mt-1">{analytics.sourcingSent}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp Clicks</span>
                    <p className="text-2xl font-bold font-display text-purple-600 mt-1">
                      {Object.values(analytics.whatsappClicks).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    WhatsApp Product Order Clicks
                  </h4>
                  {Object.keys(analytics.whatsappClicks).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No clicks logged yet.</p>
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      {Object.entries(analytics.whatsappClicks).map(([k, count]) => (
                        <div key={k} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="font-semibold text-gray-800">{k}</span>
                          <span className="font-bold text-[#1E6BFF]">{count} clicks</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: STORE SETTINGS */}
            {activeTab === 'store' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold font-display text-[#0A1628]">
                    Storefront &amp; WhatsApp Configuration
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-[#0A1628] mb-1">WhatsApp Number (Digits Only for wa.me)</label>
                      <input
                        type="text"
                        value={storeForm.whatsappRaw}
                        onChange={(e) => setStoreForm({ ...storeForm, whatsappRaw: e.target.value })}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#0A1628] mb-1">WhatsApp Display Format</label>
                      <input
                        type="text"
                        value={storeForm.whatsapp}
                        onChange={(e) => setStoreForm({ ...storeForm, whatsapp: e.target.value })}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#0A1628] mb-1">Announcement Banner</label>
                      <input
                        type="text"
                        value={storeForm.announcementBanner}
                        onChange={(e) => setStoreForm({ ...storeForm, announcementBanner: e.target.value })}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#0A1628] mb-1">Pickup Hub Address</label>
                      <input
                        type="text"
                        value={storeForm.pickupLocation}
                        onChange={(e) => setStoreForm({ ...storeForm, pickupLocation: e.target.value })}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block font-bold text-[#0A1628] mb-1">Meta Pixel ID (Optional)</label>
                        <input
                          type="text"
                          value={storeForm.metaPixelId || ''}
                          onChange={(e) => setStoreForm({ ...storeForm, metaPixelId: e.target.value })}
                          placeholder="e.g. 1234567890"
                          className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#0A1628] mb-1">TikTok Pixel ID (Optional)</label>
                        <input
                          type="text"
                          value={storeForm.tiktokPixelId || ''}
                          onChange={(e) => setStoreForm({ ...storeForm, tiktokPixelId: e.target.value })}
                          placeholder="e.g. CXXXXXX"
                          className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateConfig(storeForm);
                          alert('Store settings saved successfully!');
                        }}
                        className="min-h-[44px] px-6 py-2.5 bg-[#1E6BFF] hover:bg-[#1E6BFF]/90 text-white font-bold rounded-xl cursor-pointer shadow-sm"
                      >
                        Save Store Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECURITY / PASSCODE */}
            {activeTab === 'security' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-md mx-auto w-full">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold font-display text-[#0A1628]">
                    Change Admin Passcode
                  </h3>
                  <p className="text-xs text-gray-500">
                    Update your store management passcode to protect inventory edits.
                  </p>

                  {passcodeSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300">
                      {passcodeSuccess}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1628] mb-1">
                        New Passcode (Min 4 chars)
                      </label>
                      <input
                        type="password"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        placeholder="Enter new secret passcode..."
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (newPasscode.trim().length >= 4) {
                          localStorage.setItem(STORAGE_KEY_ADMIN_PASS, newPasscode.trim());
                          setPasscodeSuccess('Passcode updated successfully!');
                          setNewPasscode('');
                          setTimeout(() => setPasscodeSuccess(''), 3000);
                        } else {
                          alert('Passcode must be at least 4 characters.');
                        }
                      }}
                      className="w-full min-h-[44px] py-2.5 bg-[#0A1628] text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Update Passcode
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
