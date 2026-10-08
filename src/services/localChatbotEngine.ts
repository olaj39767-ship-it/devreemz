import Fuse from 'fuse.js';
import { GadgetItem } from '../types';

export interface ProductRecord {
  id: number;
  name: string;
  sku: string;
  category: 'iphone' | 'macbook';
  price: number;
  stock: number;
  description: string;
  image?: string;
}

export interface OrderRecord {
  id: number;
  order_id: string;
  customer_number: string;
  items: string; // JSON string of [{ name, quantity, price }]
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
}

export interface ChatbotSession {
  mode: 'idle' | 'picking' | 'quantity' | 'swap' | 'consult';
  list?: ProductRecord[];
  product?: ProductRecord;
  step?: number;
  tradeIn?: string;
  desired?: string;
}

export interface ChatbotResponse {
  reply: string;
  suggestedPrompts: string[];
  recommendedAction?: 'BROWSE_CATALOG' | 'SELL_TRADE_IN' | 'REQUEST_ITEM' | 'CONTACT_SUPPORT' | 'RUN_DIAGNOSTICS' | null;
  actionLabel?: string | null;
  actionDetail?: string | null;
  mode: string;
  matchedProducts?: ProductRecord[];
  orderId?: string;
}

// Initial realistic 2026 catalog as specified by the user
export const INITIAL_PRODUCTS: Omit<ProductRecord, 'id'>[] = [
  // ---------- iPHONES (realistic 2026 NG prices) ----------
  { name: 'iPhone 18 Pro Max 256GB', sku: 'IP18PM-256', category: 'iphone', price: 2850000, stock: 6, description: 'Latest Pro Max • A20 Pro • 6.9"' },
  { name: 'iPhone 18 Pro Max 512GB', sku: 'IP18PM-512', category: 'iphone', price: 3150000, stock: 4, description: 'Latest Pro Max • 512GB' },
  { name: 'iPhone 18 Pro 256GB', sku: 'IP18P-256', category: 'iphone', price: 2450000, stock: 8, description: 'Latest Pro • A20 Pro • 6.3"' },
  { name: 'iPhone 18 Pro 512GB', sku: 'IP18P-512', category: 'iphone', price: 2750000, stock: 5, description: 'Latest Pro • 512GB' },
  { name: 'iPhone Duo 256GB', sku: 'IPDUO-256', category: 'iphone', price: 3200000, stock: 3, description: 'First foldable iPhone • 256GB' },
  { name: 'iPhone Duo 512GB', sku: 'IPDUO-512', category: 'iphone', price: 3550000, stock: 2, description: 'Foldable • 512GB' },
  { name: 'iPhone 17 Pro Max 256GB', sku: 'IP17PM-256', category: 'iphone', price: 2150000, stock: 7, description: 'A19 Pro • 6.9"' },
  { name: 'iPhone 17 Pro 256GB', sku: 'IP17P-256', category: 'iphone', price: 1850000, stock: 9, description: 'A19 Pro • 6.3"' },
  { name: 'iPhone Air 256GB', sku: 'IPAIR-256', category: 'iphone', price: 1750000, stock: 6, description: 'Ultra-thin • A19 Pro' },
  { name: 'iPhone 17 256GB', sku: 'IP17-256', category: 'iphone', price: 1350000, stock: 12, description: 'A19 • great value' },
  { name: 'iPhone 17e 256GB', sku: 'IP17E-256', category: 'iphone', price: 980000, stock: 15, description: 'Budget 2026 model' },
  { name: 'iPhone 16 Pro Max 256GB', sku: 'IP16PM-256', category: 'iphone', price: 1650000, stock: 8, description: 'A18 Pro • excellent camera' },
  { name: 'iPhone 16 Pro 128GB', sku: 'IP16P-128', category: 'iphone', price: 1350000, stock: 10, description: 'A18 Pro' },
  { name: 'iPhone 16 128GB', sku: 'IP16-128', category: 'iphone', price: 980000, stock: 14, description: 'Solid all-rounder' },
  { name: 'iPhone 15 Pro Max 256GB', sku: 'IP15PM-256', category: 'iphone', price: 1250000, stock: 7, description: 'Still highly demanded' },
  { name: 'iPhone 15 Pro 128GB', sku: 'IP15P-128', category: 'iphone', price: 980000, stock: 9, description: 'Titanium • A17 Pro' },
  { name: 'iPhone 15 128GB', sku: 'IP15-128', category: 'iphone', price: 780000, stock: 12, description: 'Reliable & affordable' },
  { name: 'iPhone 14 Pro Max 256GB', sku: 'IP14PM-256', category: 'iphone', price: 890000, stock: 10, description: 'Great camera & battery' },
  { name: 'iPhone 14 Pro 128GB', sku: 'IP14P-128', category: 'iphone', price: 720000, stock: 11, description: 'Dynamic Island' },
  { name: 'iPhone 13 Pro Max 128GB', sku: 'IP13PM-128', category: 'iphone', price: 620000, stock: 9, description: 'Still a beast' },
  { name: 'iPhone 13 128GB', sku: 'IP13-128', category: 'iphone', price: 480000, stock: 15, description: 'Best budget Pro feel' },
  { name: 'iPhone 12 Pro Max 128GB', sku: 'IP12PM-128', category: 'iphone', price: 420000, stock: 8, description: 'Good value used/new' },
  { name: 'iPhone 12 128GB', sku: 'IP12-128', category: 'iphone', price: 350000, stock: 12, description: 'Affordable entry' },

  // ---------- MACBOOKS ----------
  { name: 'MacBook Air 13" M5 16/512', sku: 'MBA13-M5-16-512', category: 'macbook', price: 1850000, stock: 5, description: 'M5 • 13-inch • 16GB/512GB' },
  { name: 'MacBook Air 15" M5 16/512', sku: 'MBA15-M5-16-512', category: 'macbook', price: 2150000, stock: 4, description: 'M5 • 15-inch • bigger screen' },
  { name: 'MacBook Pro 14" M5 Pro 24/1TB', sku: 'MBP14-M5P-24-1T', category: 'macbook', price: 3450000, stock: 3, description: 'M5 Pro • pro power' },
  { name: 'MacBook Pro 16" M5 Pro 24/1TB', sku: 'MBP16-M5P-24-1T', category: 'macbook', price: 3950000, stock: 2, description: 'M5 Pro • 16-inch' },
  { name: 'MacBook Pro 14" M5 Max 36/1TB', sku: 'MBP14-M5M-36-1T', category: 'macbook', price: 4850000, stock: 2, description: 'M5 Max • max performance' },
  { name: 'MacBook Neo 13" A18 Pro 8/256', sku: 'MBNEO-A18-8-256', category: 'macbook', price: 980000, stock: 6, description: 'Most affordable MacBook' },
  { name: 'MacBook Air 13" M3 8/256', sku: 'MBA13-M3-8-256', category: 'macbook', price: 1250000, stock: 5, description: 'Previous gen • great price' },
  { name: 'MacBook Air 15" M3 8/512', sku: 'MBA15-M3-8-512', category: 'macbook', price: 1550000, stock: 4, description: '15" M3' },
];

export function formatMoney(n: number): string {
  return '₦' + Number(n).toLocaleString();
}

export function productRecordToGadgetItem(p: ProductRecord): GadgetItem {
  const isIphone = p.category === 'iphone';
  const defaultImg = isIphone
    ? 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';

  return {
    id: p.sku.toLowerCase(),
    name: p.name,
    brand: 'Apple',
    model: p.name,
    category: isIphone ? 'phones' : 'laptops',
    condition: p.price > 1500000 ? 'New/Sealed' : 'Good',
    isNew: p.price > 1500000,
    price: p.price,
    stock: p.stock,
    batteryHealth: isIphone ? (p.price > 1500000 ? '100% Battery' : '88%–95% Battery') : undefined,
    specs: {
      sku: p.sku,
      category: p.category,
      note: p.description,
    },
    whatsIncluded: isIphone ? ['Original USB-C Cable', 'Warranty Card'] : ['MagSafe USB-C Power Adapter', 'Warranty Card'],
    warranty: p.price > 1500000 ? '1-Year Official Manufacturer Warranty' : '7-Day In-House Replacement Warranty',
    description: `${p.name}. ${p.description}. Certified and fully tested.`,
    image: p.image || defaultImg,
    gallery: [p.image || defaultImg],
    status: p.stock > 0 ? 'Available' : 'Sold',
  };
}

export class LocalChatbotEngine {
  private products: ProductRecord[] = [];
  private orders: OrderRecord[] = [];
  private sessions: Map<string, ChatbotSession> = new Map();
  private adminNumber: string = '';

  constructor(initialProducts = INITIAL_PRODUCTS, adminNumber = '') {
    this.adminNumber = adminNumber;
    let nextId = 1;
    this.products = initialProducts.map(p => ({
      ...p,
      id: nextId++,
    }));
  }

  public getProducts(category: 'iphone' | 'macbook' | null = null): ProductRecord[] {
    if (category) {
      return this.products
        .filter(p => p.category === category && p.stock > 0)
        .sort((a, b) => b.price - a.price);
    }
    return this.products
      .filter(p => p.stock > 0)
      .sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return b.price - a.price;
      });
  }

  public getAllProducts(): ProductRecord[] {
    return [...this.products];
  }

  public getProductById(id: number): ProductRecord | undefined {
    return this.products.find(p => p.id === id);
  }

  public getOrders(customerId?: string): OrderRecord[] {
    if (customerId) {
      return this.orders
        .filter(o => o.customer_number === customerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...this.orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getSession(customerId: string): ChatbotSession {
    if (!this.sessions.has(customerId)) {
      this.sessions.set(customerId, { mode: 'idle' });
    }
    return this.sessions.get(customerId)!;
  }

  public reset(customerId: string) {
    this.sessions.set(customerId, { mode: 'idle' });
  }

  public generateOrderId(): string {
    return 'ORD-' + Date.now().toString().slice(-8);
  }

  public createOrder(customerId: string, product: ProductRecord, qty: number): { orderId: string; total: number } {
    const orderId = this.generateOrderId();
    const total = product.price * qty;
    const order: OrderRecord = {
      id: this.orders.length + 1,
      order_id: orderId,
      customer_number: customerId,
      items: JSON.stringify([{ name: product.name, quantity: qty, price: product.price }]),
      total,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.orders.unshift(order);
    return { orderId, total };
  }

  public cleanProductQuery(raw: string): string {
    return raw
      .toLowerCase()
      .replace(/\b(i want to buy|i want to purchase|i want to get|i want|want to buy|need to buy|i need|can i get|can i buy|can you sell me|do you have|do you guys have|got any|how much is|how much for|what is the price of|price of|price for|buy me|buy|purchase|order|get me|get|sell me|show me|looking for|look for|find me|check for|in stock|available|please|today|now|a|an|the)\b/gi, ' ')
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public findProducts(rawText: string): ProductRecord[] {
    const activeProducts = this.getProducts();
    if (!activeProducts.length) return [];

    const lowerRaw = rawText.toLowerCase();
    const cleaned = this.cleanProductQuery(rawText);

    // 1. Check iPhone model and tier specifics (e.g. "iphone 12", "iphone 15", "15 pro", "12 pro max")
    const isIphoneQuery = lowerRaw.includes('iphone') || lowerRaw.includes('apple') || /\b(ip\s*\d+|1[1-8]|duo|air)\b/i.test(lowerRaw);
    if (isIphoneQuery) {
      const modelMatch = lowerRaw.match(/\b(18|17e|17|16|15|14|13|12|11|duo|air)\b/i);
      if (modelMatch) {
        const modelNum = modelMatch[1].toLowerCase();
        const wantsProMax = /\b(pro\s*max|promax|pm)\b/i.test(lowerRaw);
        const wantsPro = !wantsProMax && /\bpro\b/i.test(lowerRaw);

        const matched = activeProducts.filter(p => {
          if (p.category !== 'iphone') return false;
          const pNameLower = p.name.toLowerCase();
          
          if (modelNum === 'duo') return pNameLower.includes('duo');
          if (modelNum === 'air') return pNameLower.includes('air');
          if (modelNum === '17e') return pNameLower.includes('17e');
          
          const hasModel = new RegExp(`\\biphone\\s*${modelNum}\\b|\\b${modelNum}\\b`, 'i').test(pNameLower);
          if (!hasModel) return false;
          if (modelNum === '17' && pNameLower.includes('17e')) return false;

          return true;
        });

        if (matched.length > 0) {
          if (wantsProMax) {
            const proMax = matched.find(p => /pro\s*max/i.test(p.name));
            if (proMax) return [proMax, ...matched.filter(p => p !== proMax)];
          } else if (wantsPro) {
            const proOnly = matched.find(p => /pro\b/i.test(p.name) && !/pro\s*max/i.test(p.name));
            if (proOnly) return [proOnly, ...matched.filter(p => p !== proOnly)];
          } else {
            // User specifically asked for base model e.g. "iphone 12" or "iphone 15"
            const baseOnly = matched.find(p => !/pro/i.test(p.name));
            if (baseOnly) return [baseOnly, ...matched.filter(p => p !== baseOnly)];
          }
          return matched;
        }
      }
    }

    // 2. Check MacBook model specifics
    const isMacQuery = /\b(macbook|mac\s*book|mac|laptop|apple\s*laptop)\b/i.test(lowerRaw);
    if (isMacQuery) {
      const wantsPro = /\bpro\b/i.test(lowerRaw);
      const wantsAir = /\bair\b/i.test(lowerRaw);
      const wantsNeo = /\bneo\b/i.test(lowerRaw);
      const chipMatch = lowerRaw.match(/\b(m5\s*max|m5\s*pro|m5|m3|m2|a18)\b/i);
      const chip = chipMatch ? chipMatch[1].replace(/\s+/g, ' ').toLowerCase() : null;

      const matched = activeProducts.filter(p => {
        if (p.category !== 'macbook') return false;
        const pNameLower = p.name.toLowerCase();
        if (wantsNeo && !pNameLower.includes('neo')) return false;
        if (wantsAir && !pNameLower.includes('air')) return false;
        if (wantsPro && !pNameLower.includes('pro')) return false;
        if (chip && !pNameLower.includes(chip)) return false;
        return true;
      });

      if (matched.length > 0) return matched;
    }

    // 3. Substring direct search on cleaned and raw
    const directMatches = activeProducts.filter(p => {
      const pName = p.name.toLowerCase();
      const pSku = p.sku.toLowerCase();
      return (
        (cleaned.length >= 2 && pName.includes(cleaned)) ||
        pSku.includes(cleaned) ||
        (cleaned.length >= 2 && lowerRaw.includes(pName.replace(/^apple\s+/i, '')))
      );
    });
    if (directMatches.length > 0) return directMatches;

    // 4. Fuse.js fuzzy search
    const fuse = new Fuse(activeProducts, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'sku', weight: 0.2 },
        { name: 'description', weight: 0.1 }
      ],
      threshold: 0.45,
      ignoreLocation: true,
      includeScore: true,
    });

    const searchStr = cleaned.length >= 2 ? cleaned : lowerRaw;
    const res = fuse.search(searchStr);
    return res.map(r => r.item);
  }

  public findProduct(text: string): ProductRecord | null {
    const list = this.findProducts(text);
    return list.length ? list[0] : null;
  }

  // Process message according to the exact requested flow
  public processMessage(customerId: string, rawInput: string): ChatbotResponse {
    const raw = (rawInput || '').trim();
    const text = raw.toLowerCase();
    const session = this.getSession(customerId);
    const isAdmin = Boolean(this.adminNumber && customerId.startsWith(this.adminNumber));

    // ---------- DIAGNOSTICS CHECK (Browser capability) ----------
    const isDiag = ['diagnostic', 'diagnostics', 'check my phone', 'test my phone', 'battery health', 'check battery', 'test screen'].some(t => text.includes(t));
    if (isDiag) {
      return {
        reply: `🔧 **Device Diagnostics Tool**\n\nYou can run our automated live hardware test directly here in your browser to inspect screen touch responsiveness, battery health indicators, mic, camera, and device performance!`,
        recommendedAction: 'RUN_DIAGNOSTICS',
        actionLabel: 'Launch Device Diagnostics',
        actionDetail: 'Interactive 30s hardware check',
        suggestedPrompts: ['menu', 'iphones', 'swap', 'consult'],
        mode: session.mode,
      };
    }

    // ---------- ADMIN COMMANDS ----------
    if (isAdmin) {
      if (text.startsWith('addstock ')) {
        const parts = raw.split(/\s+/);
        const sku = parts[1];
        const qty = parseInt(parts[2], 10);
        if (!sku || isNaN(qty)) {
          return { reply: 'Usage: addstock SKU QTY', suggestedPrompts: ['products', 'lowstock'], mode: session.mode };
        }
        const product = this.products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
        if (product) {
          product.stock += qty;
          return { reply: `✅ +${qty} → ${product.sku} (Current stock: ${product.stock})`, suggestedPrompts: ['products', 'lowstock'], mode: session.mode };
        }
        return { reply: `SKU "${sku}" not found`, suggestedPrompts: ['products'], mode: session.mode };
      }

      if (text === 'lowstock') {
        const rows = this.products.filter(p => p.stock < 3);
        const reply = rows.length
          ? rows.map(r => `• ${r.name}: ${r.stock} left`).join('\n')
          : 'All stock levels healthy (> 3)';
        return { reply: `📊 **Low Stock Alert**\n\n${reply}`, suggestedPrompts: ['products', 'menu'], mode: session.mode };
      }

      if (text === 'products') {
        const list = this.products.map(r => `• ${r.name} (${r.sku}) ${formatMoney(r.price)} | Stock: ${r.stock}`).join('\n');
        return { reply: `📋 **All Products**\n\n${list || 'Empty'}`, suggestedPrompts: ['lowstock', 'menu'], mode: session.mode };
      }
    }

    // ---------- CANCEL ----------
    if (['cancel', 'stop', 'back', 'nevermind', 'restart'].includes(text)) {
      this.reset(customerId);
      return {
        reply: 'Cancelled. Type *menu* to start again.',
        suggestedPrompts: ['menu', 'iphones', 'macbooks', 'swap', 'consult', 'my orders'],
        mode: 'idle',
      };
    }

    // ---------- PAYMENT & DELIVERY FAQ (Requirement B.3) ----------
    const isPaymentOrDelivery = ['payment', 'how do i pay', 'how to pay', 'delivery', 'deliver', 'inspection', 'inspect', 'pay on delivery', 'pod', 'paid', 'account number', 'transfer'].some(k => text.includes(k));
    if (isPaymentOrDelivery) {
      return {
        reply: `Payment and delivery are arranged directly with us on WhatsApp. You can inspect the phone before paying.\n\nWe provide safe inspection on delivery across Lagos and nationwide insured shipping.`,
        recommendedAction: 'CONTACT_SUPPORT',
        actionLabel: 'Chat with Us on WhatsApp',
        actionDetail: 'Arrange inspection & payment',
        suggestedPrompts: ['iphones', 'macbooks', 'swap', 'consult', 'menu'],
        mode: 'idle',
      };
    }

    // ---------- BARE NUMBER (Picking mode from list) ----------
    if (/^\d+$/.test(text)) {
      const n = parseInt(text, 10);
      if (session.mode === 'picking' && session.list) {
        const product = session.list[n - 1];
        if (!product) {
          return {
            reply: `Pick between 1 and ${session.list.length}, or type *cancel*.`,
            suggestedPrompts: session.list.slice(0, 4).map((_, idx) => String(idx + 1)),
            mode: 'picking',
          };
        }

        this.reset(customerId);
        return {
          reply: `**${product.name}**\nPrice: **${formatMoney(product.price)}** • ${product.stock} available\n${product.description || ''}\n\n*Payment and delivery are arranged directly with us on WhatsApp. You can inspect the phone before paying.*`,
          recommendedAction: 'BROWSE_CATALOG',
          actionLabel: `View ${product.name}`,
          actionDetail: 'View full verification report & specs',
          suggestedPrompts: ['iphones', 'macbooks', 'swap', 'consult', 'menu'],
          mode: 'idle',
          matchedProducts: [product],
        };
      }

      return {
        reply: 'Type *catalog*, *iphones* or *macbooks* first to see matching devices.',
        suggestedPrompts: ['menu', 'iphones', 'macbooks', 'swap', 'consult'],
        mode: session.mode,
      };
    }

    // ---------- GREETING / MENU ----------
    const GREET = ['hi', 'hello', 'hey', 'start', 'menu'];
    if (GREET.includes(text) || text === 'menu') {
      this.reset(customerId);
      return {
        reply: `👋 Welcome to **Devreemz Gadget**\n*Sleek • Trustworthy • Reliable*\n\nWe sell, swap & consult on every verified iPhone and MacBook.\n\nWhat do you need?\n• *iphones* — view verified in-stock iPhones\n• *macbooks* — view certified MacBooks\n• *swap* — trade-in appraisal\n• *consult* — free advice on which model to choose\n• *diagnostics* — live hardware check\n\nTell me what you need, or choose an option below.`,
        suggestedPrompts: ['iphones', 'macbooks', 'swap', 'consult', 'diagnostics'],
        mode: 'idle',
      };
    }

    // ---------- CATALOG / FILTERS ----------
    if (text === 'iphones' || text === 'iphone' || text === 'phones') {
      const items = this.getProducts('iphone');
      session.mode = 'picking';
      session.list = items;
      delete session.product;

      const listStr = items.map((p, i) => `*${i + 1}.* ${p.name} — ${formatMoney(p.price)}`).join('\n');
      return {
        reply: `📱 **iPhones in Stock**\n\n${listStr}\n\nReply with a *number* (e.g. *1*) to view specs and verification.\nOr type the product name or *cancel*.`,
        suggestedPrompts: ['1', '2', '3', 'macbooks', 'swap', 'cancel'],
        mode: 'picking',
        matchedProducts: items.slice(0, 5),
      };
    }

    if (text === 'macbooks' || text === 'macbook' || text === 'laptops' || text === 'laptop') {
      const items = this.getProducts('macbook');
      session.mode = 'picking';
      session.list = items;
      delete session.product;

      const listStr = items.map((p, i) => `*${i + 1}.* ${p.name} — ${formatMoney(p.price)}`).join('\n');
      return {
        reply: `💻 **MacBooks in Stock**\n\n${listStr}\n\nReply with a *number* (e.g. *1*) to select.\nOr type the product name or *cancel*.`,
        suggestedPrompts: ['1', '2', '3', 'iphones', 'swap', 'cancel'],
        mode: 'picking',
        matchedProducts: items.slice(0, 5),
      };
    }

    const CATALOG_TRIGGERS = ['catalog', 'products', 'list', 'show products', 'what do you sell', 'what do you have', 'all products'];
    if (CATALOG_TRIGGERS.some(t => text.includes(t))) {
      const items = this.getProducts();
      session.mode = 'picking';
      session.list = items;
      delete session.product;

      const listStr = items.slice(0, 15).map((p, i) => `*${i + 1}.* ${p.name} — ${formatMoney(p.price)}`).join('\n');
      return {
        reply: `🛍️ **Devreemz Gadget Catalog**\n\n${listStr}\n\n*(Showing verified units in stock. Type iphones or macbooks for specific lists)*\n\nReply with a *number* to inspect details.`,
        suggestedPrompts: ['1', '2', 'iphones', 'macbooks', 'cancel'],
        mode: 'picking',
        matchedProducts: items.slice(0, 6),
      };
    }

    // ---------- SWAP FLOW ----------
    const SWAP_TRIGGERS = ['swap', 'trade', 'trade in', 'trade-in', 'exchange', 'upgrade'];
    if (SWAP_TRIGGERS.some(t => text.includes(t)) || session.mode === 'swap') {
      if (session.mode !== 'swap') {
        session.mode = 'swap';
        session.step = 1;
        return {
          reply: `🔄 **Trade-In / Swap**\n\nWhat device are you looking to trade in?\n(e.g. “iPhone 13 Pro 128GB” or “iPhone 14”)\n\nType *cancel* anytime.`,
          suggestedPrompts: ['iPhone 14 Pro Max', 'iPhone 13 128GB', 'iPhone 12', 'cancel'],
          mode: 'swap',
          recommendedAction: 'SELL_TRADE_IN',
          actionLabel: 'Open Trade-In Appraisal',
          actionDetail: 'Instant estimated range & WhatsApp submission',
        };
      }

      if (session.step === 1) {
        session.tradeIn = raw;
        session.step = 2;
        return {
          reply: `Got it: **${raw}**\n\nWhat unit would you like to upgrade to?\n(e.g. "iPhone 16 Pro Max", "iPhone 15 Pro", or type *iphones* to see what is in stock)`,
          suggestedPrompts: ['iPhone 16 Pro Max', 'iPhone 15 Pro', 'iphones', 'macbooks', 'cancel'],
          mode: 'swap',
        };
      }

      if (session.step === 2) {
        const tradeInDevice = session.tradeIn || 'Your device';
        const desiredDevice = raw;
        this.reset(customerId);

        return {
          reply: `✅ **Trade-in Request Prepared**\n\n• **Current Device**: ${tradeInDevice}\n• **Target Upgrade**: ${desiredDevice}\n\nTap below to send this trade-in request directly to our team on WhatsApp for an immediate valuation!`,
          recommendedAction: 'SELL_TRADE_IN',
          actionLabel: 'Send Trade-In on WhatsApp',
          actionDetail: 'Instant valuation & in-person inspection',
          suggestedPrompts: ['menu', 'iphones', 'macbooks'],
          mode: 'idle',
        };
      }
    }

    // ---------- CONSULTATION ----------
    const CONSULT_TRIGGERS = ['consult', 'consultation', 'advice', 'recommend', 'which one', 'help me choose', 'suggestion', 'difference between'];
    if (CONSULT_TRIGGERS.some(t => text.includes(t))) {
      const hasBudget = text.includes('under') || text.includes('budget') || text.includes('cheap') || /\d+k|\d+m|\d{6}/.test(text);
      const isWorkOrStudent = text.includes('student') || text.includes('work') || text.includes('coding') || text.includes('office') || text.includes('editing');

      if (hasBudget || isWorkOrStudent) {
        const recommendedMac = this.products.find(p => p.category === 'macbook' && p.stock > 0);
        const recommendedPhone = this.products.find(p => p.category === 'iphone' && p.stock > 0 && p.price < 1500000);
        return {
          reply: `💬 **Personalized Recommendation**:\n\n` +
            (recommendedPhone ? `• **Phone Choice**: **${recommendedPhone.name}** at **${formatMoney(recommendedPhone.price)}** — ${recommendedPhone.description}\n` : '') +
            (recommendedMac ? `• **MacBook Choice**: **${recommendedMac.name}** at **${formatMoney(recommendedMac.price)}** — ${recommendedMac.description}\n\n` : '') +
            `Would you like to inspect specs or connect on WhatsApp for delivery arrangements?`,
          suggestedPrompts: [recommendedPhone ? `specs for ${recommendedPhone.name}` : 'iphones', recommendedMac ? `specs for ${recommendedMac.name}` : 'macbooks', 'menu'],
          mode: 'idle',
          matchedProducts: [recommendedPhone, recommendedMac].filter(Boolean) as ProductRecord[],
        };
      }

      this.reset(customerId);
      return {
        reply: `💬 **Free Tech Consultation**\n\nTell me:\n1. What is your approximate budget in ₦?\n2. Primary usage? (content creation, camera, daily office, school, battery life)\n3. Any preferred model size?\n\nI’ll find the best match for you!`,
        suggestedPrompts: ['Best camera under ₦1.2M', 'MacBook for work & coding', 'iPhone for student under ₦600k', 'menu'],
        mode: 'idle',
      };
    }

    // ---------- HELP ----------
    const HELP_TRIGGERS = ['help', 'support', 'agent', 'human', 'complain', 'representative', 'whatsapp', 'call', 'contact'];
    if (HELP_TRIGGERS.some(t => text.includes(t))) {
      return {
        reply: `You can chat with our team on WhatsApp right now or visit our safe pickup hub in Victoria Island, Lagos!\n\nWe answer within minutes.`,
        recommendedAction: 'CONTACT_SUPPORT',
        actionLabel: 'Chat on WhatsApp',
        actionDetail: 'Direct store desk',
        suggestedPrompts: ['menu', 'iphones', 'macbooks', 'swap'],
        mode: 'idle',
      };
    }

    // ---------- THANKS ----------
    const THANKS_TRIGGERS = ['thanks', 'thank you', 'tnx', 'thx', 'appreciate'];
    if (THANKS_TRIGGERS.some(t => text.includes(t))) {
      return {
        reply: 'You’re welcome! 😊 Let me know if you want to inspect any device. Type *menu* anytime.',
        suggestedPrompts: ['iphones', 'macbooks', 'swap', 'menu'],
        mode: 'idle',
      };
    }

    // ---------- BUY / MODEL INTENT ----------
    const BUY_TRIGGERS = ['buy', 'want', 'order', 'get me', 'purchase', 'i need', 'give me', 'sell me', 'cost', 'how much', 'price'];
    const allFound = this.findProducts(raw);
    const primaryFound = allFound[0] || session.product;

    if (BUY_TRIGGERS.some(t => text.includes(t)) || primaryFound) {
      const product = primaryFound;
      if (!product) {
        return {
          reply: 'Which device are you looking for? Type *iphones*, *macbooks* or enter a specific model (e.g. *iPhone 16 Pro Max* or *MacBook Air M3*).',
          suggestedPrompts: ['iphones', 'macbooks', 'iPhone 15 Pro', 'iPhone 13', 'cancel'],
          mode: 'idle',
        };
      }

      this.reset(customerId);
      const secondary = allFound.slice(1, 3);
      let replyText = `**${product.name}**\nPrice: **${formatMoney(product.price)}** • ${product.stock} available\n${product.description || ''}\n\n*Payment and delivery are arranged directly with us on WhatsApp. You can inspect the phone before paying.*`;
      if (secondary.length > 0) {
        replyText += `\n\n*Also available: ${secondary.map(s => `${s.name} (${formatMoney(s.price)})`).join(' | ')}*`;
      }

      return {
        reply: replyText,
        recommendedAction: 'BROWSE_CATALOG',
        actionLabel: `View ${product.name} in Catalog`,
        actionDetail: 'Review verification report & order on WhatsApp',
        suggestedPrompts: ['iphones', 'macbooks', 'swap', 'consult', 'menu'],
        mode: 'idle',
        matchedProducts: allFound.slice(0, 3),
      };
    }

    // ---------- FALLBACK ----------
    return {
      reply: `I didn’t catch that.\n\nQuick options:\n• *iphones* — view in-stock iPhones\n• *macbooks* — view certified MacBooks\n• *swap* — trade-in appraisal\n• *consult* — model guidance\n• *diagnostics* — live hardware check`,
      suggestedPrompts: ['iphones', 'macbooks', 'swap', 'consult', 'menu'],
      mode: 'idle',
    };
  }
}

// Global shared singleton for stateful session tracking across requests
export const globalChatbotEngine = new LocalChatbotEngine();
