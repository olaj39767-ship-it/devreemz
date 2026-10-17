export type GadgetCategory =
  | 'phones'
  | 'laptops'
  | 'tablets'
  | 'consoles'
  | 'smartwatches'
  | 'accessories'
  | 'health-monitors'
  | 'smart-rings'
  | 'mobility';

export type ConditionGrade = 'New/Sealed' | 'Like New' | 'Good' | 'Fair';

export type UnitAvailabilityStatus = 'Available' | 'Reserved' | 'Sold';

export interface VerificationCheckItem {
  category: string;
  name: string;
  passed: boolean;
  detail: string;
}

export interface UnitVerificationReport {
  inspectionDate: string;
  inspector: string;
  overallVerdict: 'Grade A+ Passed' | 'Sealed Brand New' | 'Certified Clean';
  batteryCycles?: number;
  batteryMaximumCapacity?: number;
  imeiStatus: string; // e.g. "Clean GSMA / Whitelisted"
  icloudStatus: string; // e.g. "Clean / FMI Off"
  screenOEM: boolean;
  batteryOEM: boolean;
  cameraOEM: boolean;
  housingCondition: string;
  checks: VerificationCheckItem[];
}

export interface GadgetItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  storage?: string; // e.g. '256GB'
  color?: string; // e.g. 'Natural Titanium'
  category: GadgetCategory;
  condition: ConditionGrade;
  isNew: boolean;
  status: UnitAvailabilityStatus;
  price: number;
  originalPrice?: number;
  stock: number;
  specs: Record<string, string>;
  whatsIncluded: string[];
  warranty: string;
  description: string;
  image: string;
  gallery: string[];
  batteryHealth?: string; // e.g. "100% Battery" or "91% Battery Health"
  batteryScreenshot?: string;
  maskedImei?: string; // e.g. "358941******104"
  icloudStatus?: string; // e.g. "Clean / FMI Off"
  partsReplaced?: string; // e.g. "All OEM Original, None Replaced"
  featured?: boolean;
  isDemo?: boolean;
  verificationReport?: UnitVerificationReport;
}

export type RecommendedAction =
  | 'BROWSE_CATALOG'
  | 'SELL_TRADE_IN'
  | 'REQUEST_ITEM'
  | 'CONTACT_SUPPORT'
  | 'RUN_DIAGNOSTICS'
  | 'WARRANTY_LOOKUP'
  | 'VERIFICATION_GUIDE'
  | null;

export interface DeviceDiagnosticReport {
  id: string;
  timestamp: string;
  overallStatus: 'Good' | 'Needs Attention' | 'Limited Data';
  deviceInfo: {
    model: string;
    os: string;
    browser: string;
    screen: string;
    pixelRatio: number;
    ram: string;
    cpuCores: string;
    platform: string;
  };
  battery: {
    available: boolean;
    level?: number;
    charging?: boolean;
    chargingTime?: number;
    dischargingTime?: number;
    note: string;
  };
  network: {
    available: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    online: boolean;
    note: string;
  };
  storage: {
    available: boolean;
    usageMB?: number;
    quotaMB?: number;
    percentUsed?: number;
    note: string;
  };
  sensors: {
    motionAvailable: boolean;
    motionTested: boolean;
    motionPassed?: boolean;
    lightAvailable: boolean;
    lightLevel?: number;
    note: string;
  };
  touch: {
    multiTouchPoints: number;
    touchScreenDetected: boolean;
    gridTestPassed?: boolean;
    note: string;
  };
  camera: {
    available: boolean;
    tested: boolean;
    frontPassed?: boolean;
    rearPassed?: boolean;
    note: string;
  };
  audio: {
    micAvailable: boolean;
    micTested: boolean;
    micLevel?: number;
    speakerTested: boolean;
    speakerPassed?: boolean;
    note: string;
  };
  vibration: {
    supported: boolean;
    tested: boolean;
    confirmed?: boolean;
    note: string;
  };
  performance: {
    tested: boolean;
    scoreMs?: number;
    rating?: 'Fast' | 'Normal' | 'Slow';
    webglSupported: boolean;
    renderer?: string;
    note: string;
  };
  summaryText: string;
}

export interface ConciergeAIResponse {
  reply: string;
  recommendedAction: RecommendedAction;
  actionLabel: string | null;
  actionDetail: string | null;
  suggestedPrompts: string[];
  matchedProducts?: GadgetItem[];
  source?: 'local' | 'gemini';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'concierge' | 'system';
  text: string;
  timestamp: string;
  matchedProducts?: GadgetItem[];
  recommendedAction?: RecommendedAction;
  actionLabel?: string | null;
  actionDetail?: string | null;
  suggestedPrompts?: string[];
  source?: 'local' | 'gemini';
  isTradeInCard?: boolean;
  isWantListCard?: boolean;
  isDiagnosticsCard?: boolean;
  diagnosticReport?: DeviceDiagnosticReport;
}

export interface TradeInSubmission {
  id: string;
  brand: string;
  model: string;
  storageSpecs: string;
  condition: ConditionGrade;
  batteryHealthClaim: string;
  estimatedMinValue: number;
  estimatedMaxValue: number;
  workingCondition: string;
  accessoriesIncluded: string;
  photos: string[];
  contactName: string;
  contactChannel: 'whatsapp' | 'phone';
  contactValue: string;
  submittedAt: string;
  diagnosticReport?: DeviceDiagnosticReport;
}

export interface SourcingSubmission {
  id: string;
  model: string;
  storage: string;
  color: string;
  budget: number;
  contactName: string;
  contactChannel: 'whatsapp' | 'phone';
  contactValue: string;
  notes: string;
  submittedAt: string;
}

// Backwards compatibility alias
export type WantListSubmission = SourcingSubmission;

export interface WarrantyRecord {
  id: string;
  imei: string;
  customerPhone: string;
  customerName: string;
  deviceModel: string;
  storage: string;
  purchaseDate: string;
  expiryDate: string;
  coverageType: '1-Year Official Manufacturer' | '7-Day In-House Replacement';
  status: 'Active' | 'Expired' | 'Voided';
  notes?: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  location: string;
  device: string;
  date: string;
  rating: number;
  comment: string;
  verified: boolean;
  chatScreenshot?: string;
  whatsappScreenshot?: string;
  customerPhoto?: string;
}

export interface DeliveryProof {
  id: string;
  caption: string;
  location: string;
  date: string;
  device: string;
  image: string;
}

export interface TradeInPricingMatrix {
  model: string;
  basePrice: number; // For Good condition 128GB
  storageMultipliers: { [storage: string]: number };
  conditionMultipliers: {
    'New/Sealed': number;
    'Like New': number;
    'Good': number;
    'Fair': number;
  };
}

export interface StoreConfig {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string; // International display format, e.g. "+234 903 847 6114"
  whatsappRaw: string; // Pure digits for wa.me URL, e.g. "2349038476114"
  email: string;
  address: string;
  pickupLocation: string;
  businessHours: string;
  usedWarrantyTerms: string;
  newWarrantyTerms: string;
  quoteTimeHours: number;
  instagramUrl: string;
  tiktokUrl: string;
  announcementBanner: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
}

export interface AnalyticsStats {
  productViews: Record<string, number>;
  whatsappClicks: Record<string, number>;
  tradeInsStarted: number;
  tradeInsSent: number;
  sourcingSent: number;
}
