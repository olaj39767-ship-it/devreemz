import Fuse from 'fuse.js';
import { GadgetItem, ConciergeAIResponse, StoreConfig } from '../types';
import { LocalChatbotEngine, productRecordToGadgetItem } from './localChatbotEngine';

// Stopwords and conversational filler tokens
const STOPWORDS = new Set([
  'do', 'u', 'you', 'got', 'any', 'have', 'is', 'are', 'the', 'a', 'an', 'in', 'stock',
  'available', 'how', 'much', 'for', 'price', 'of', 'cost', 'what', 'whats', "what's",
  'tell', 'me', 'about', 'can', 'i', 'get', 'buy', 'looking', 'need', 'want', 'please',
  'cheapest', 'best', 'used', 'new', 'cheap', 'lowest', 'highest', 'sell', 'trade', 'item',
  'there', 'does', 'someone', 'sell', 'give', 'quote', 'show', 'display', 'search', 'find'
]);

export interface LocalMatchResult {
  handled: boolean;
  response?: ConciergeAIResponse;
}

export class LocalConciergeEngine {
  private fuse: Fuse<GadgetItem>;
  private items: GadgetItem[];
  private config: StoreConfig;
  private chatbot: LocalChatbotEngine = new LocalChatbotEngine();

  constructor(items: GadgetItem[], config: StoreConfig) {
    this.items = items;
    this.config = config;

    this.fuse = new Fuse(items, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'model', weight: 0.3 },
        { name: 'brand', weight: 0.15 },
        { name: 'category', weight: 0.1 },
        { name: 'specs.chip', weight: 0.05 },
        { name: 'specs.processor', weight: 0.05 }
      ],
      threshold: 0.4, // Good fuzzy matching for typos
      ignoreLocation: true,
      includeScore: true,
    });
  }

  public getChatbot(): LocalChatbotEngine {
    return this.chatbot;
  }

  public updateConfig(config: StoreConfig) {
    this.config = config;
  }

  public updateInventory(items: GadgetItem[]) {
    this.items = items;
    this.fuse.setCollection(items);
  }

  public processMessage(rawMessage: string): LocalMatchResult {
    const text = rawMessage.trim().toLowerCase();
    if (!text) {
      return {
        handled: true,
        response: {
          reply: `👋 Welcome to **Devreemz Gadget**\n*Sleek • Trustworthy • Reliable*\n\nWe sell, swap & consult on every verified iPhone and MacBook.\n\nWhat do you need?\n• *iphones* — view verified iPhones\n• *macbooks* — view certified MacBooks\n• *swap* — trade-in appraisal\n• *consult* — free advice on which model to choose\n• *diagnostics* — live hardware check\n\nTell me what you need, or choose an option below.`,
          recommendedAction: 'BROWSE_CATALOG',
          actionLabel: 'Browse All Inventory',
          actionDetail: `${this.items.length} gadgets currently in stock`,
          suggestedPrompts: [
            'iphones',
            'macbooks',
            'swap',
            'consult',
            'diagnostics'
          ],
          source: 'local'
        }
      };
    }

    // Check Chatbot session state or explicit bot keywords
    const session = this.chatbot.getSession('web-user');
    const isStateful = session.mode !== 'idle';
    const matchedCatalogProducts = this.chatbot.findProducts(rawMessage);
    const hasProductMatch = matchedCatalogProducts.length > 0;
    const hasBuyWords = ['buy', 'want', 'order', 'purchase', 'need', 'get', 'cost', 'how much', 'price', 'sell me', 'give me'].some(w => text.includes(w));

    const isBotCommand =
      isStateful ||
      /^\d+$/.test(text) ||
      text.startsWith('paid') ||
      hasBuyWords ||
      hasProductMatch ||
      ['menu', 'start', 'hi', 'hello', 'hey', 'iphones', 'iphone', 'macbooks', 'macbook', 'laptops', 'laptop', 'catalog', 'products', 'swap', 'trade', 'exchange', 'consult', 'advice', 'recommend', 'my orders', 'orders', 'cancel', 'stop', 'back', 'reset', 'restart'].some(k => text === k || text.includes(k));

    if (isBotCommand) {
      const botRes = this.chatbot.processMessage('web-user', rawMessage);
      const matched = (botRes.matchedProducts || []).map(productRecordToGadgetItem);
      return {
        handled: true,
        response: {
          reply: botRes.reply,
          recommendedAction: botRes.recommendedAction || null,
          actionLabel: botRes.actionLabel || null,
          actionDetail: botRes.actionDetail || null,
          suggestedPrompts: botRes.suggestedPrompts,
          matchedProducts: matched.length > 0 ? matched : undefined,
          source: 'local'
        }
      };
    }

    // 1. Check for Device Diagnostics intent ("can you check my phone", "run diagnostics", "is my battery healthy", etc.)
    if (this.isDiagnosticsIntent(text)) {
      return {
        handled: true,
        response: {
          reply: `I can run our **Live Device Diagnostics** right here in your browser! \n\n` +
            `**What we can check:**\n` +
            `• **Screen & Touch:** Interactive full-screen digitizer touch-grid to spot dead zones\n` +
            `• **Battery & Power:** Live battery percentage & charging status *(via Battery Status API where supported)*\n` +
            `• **Audio, Mic & Sensors:** Microphone real-time audio visualizer, camera stream, multi-frequency speaker tone & haptic vibration\n` +
            `• **System & Performance:** Browser/OS detection, CPU concurrency, estimated RAM, storage quota, and compute benchmark\n\n` +
            `*Tip: Completing diagnostics generates a verifiable report that attaches to your Sell / Trade-in request for top-dollar turnaround!*`,
          recommendedAction: 'RUN_DIAGNOSTICS',
          actionLabel: 'Launch Device Diagnostics',
          actionDetail: 'Interactive 30–60s live check',
          suggestedPrompts: [
            'Sell or trade in this device',
            'What condition grades do you buy?',
            'Browse in-stock inventory'
          ]
        }
      };
    }

    // 2. Check for Sell / Trade-in intent
    if (this.isSellIntent(text)) {
      return {
        handled: true,
        response: {
          reply: `We'd love to buy or trade in your device! At **${this.config.businessName}**, quotes are provided after our certified technicians review photos and specs. \n\nWe provide guaranteed cash or store credit quotes within **${this.config.quoteTimeHours} hours**.`,
          recommendedAction: 'SELL_TRADE_IN',
          actionLabel: 'Open Sell / Trade-In Form',
          actionDetail: 'Upload 1–3 photos and describe condition',
          suggestedPrompts: [
            'What condition grades do you accept?',
            'How fast will I get paid?',
            'Browse catalog while I wait'
          ]
        }
      };
    }

    // 2. Check for Warranty & Return Policy intent
    if (this.isWarrantyIntent(text)) {
      return {
        handled: true,
        response: {
          reply: `### **Warranty & Protection Policy**\n\n- **Used / Certified Pre-Owned**: ${this.config.usedWarrantyTerms}\n- **Brand-New / Sealed**: ${this.config.newWarrantyTerms}\n\nEvery pre-owned unit undergoes our **32-point diagnostics test** (battery health, screen response, camera modules, ports, carrier locks, and wireless radios).`,
          recommendedAction: 'BROWSE_CATALOG',
          actionLabel: 'Browse Verified Gear',
          actionDetail: 'All units inspected & tested',
          suggestedPrompts: [
            'What are the condition grades?',
            'Do you have an iPhone in stock?',
            'Talk to a human representative'
          ]
        }
      };
    }

    // 3. Check for Condition Grading scale intent
    if (this.isConditionScaleIntent(text)) {
      return {
        handled: true,
        response: {
          reply: `### **${this.config.businessName} Condition Grading Scale**\n\n` +
            `* **New/Sealed**: Unopened factory packaging, 0 battery cycles, full manufacturer warranty.\n` +
            `* **Like New**: Used briefly, 0 visible wear, 100% original accessories included.\n` +
            `* **Good**: Light cosmetic wear, 100% fully functional, thoroughly tested.\n` +
            `* **Fair**: Visible cosmetic scratches/dents, tested 100% functional, priced for maximum savings.\n\n` +
            `*Each used listing states exactly what accessories are included (charger, box, cable) and warranty duration.*`,
          recommendedAction: 'BROWSE_CATALOG',
          actionLabel: 'View Products by Grade',
          actionDetail: 'Filter by New, Like New, Good, or Fair',
          suggestedPrompts: [
            'Show me Like New devices',
            'Cheapest laptop you have',
            'Start a trade-in'
          ]
        }
      };
    }

    // 4. Check for Human Handoff / Contact / WhatsApp intent
    if (this.isHumanContactIntent(text)) {
      return {
        handled: true,
        response: {
          reply: `You can reach a real person on our store floor anytime!\n\n` +
            `- **WhatsApp**: [${this.config.whatsapp}](https://wa.me/${this.config.whatsapp.replace(/[^0-9]/g, '')})\n` +
            `- **Phone**: ${this.config.phone}\n` +
            `- **Hours**: ${this.config.businessHours}\n` +
            `- **Location**: ${this.config.address}\n\n` +
            `Great for bulk/wholesale orders, negotiation, or special sourcing requests!`,
          recommendedAction: 'CONTACT_SUPPORT',
          actionLabel: 'Chat on WhatsApp',
          actionDetail: `Direct line to ${this.config.businessName} floor staff`,
          suggestedPrompts: [
            'Do you do wholesale discounts?',
            'What are your store hours?',
            'Browse inventory catalog'
          ]
        }
      };
    }

    // 5. Check for Request / Sourcing Intent ("can you get me", "do you source", "want list", "custom order")
    if (this.isSourcingIntent(text)) {
      return {
        handled: true,
        response: {
          reply: `Looking for something specific that's hard to find? We source gadgets on request through our trusted distributor & trade network! \n\nLog your device model, target budget, and contact info on our **Want List**, and our sourcing team will alert you the moment one passes inspection.`,
          recommendedAction: 'REQUEST_ITEM',
          actionLabel: 'Log Sourcing Request',
          actionDetail: 'Tell us device, target budget & contact info',
          suggestedPrompts: [
            'How long does sourcing take?',
            'Browse current in-stock items',
            'Talk to a human representative'
          ]
        }
      };
    }

    // 6. Check for "Cheapest / Budget / Best price" queries
    if (text.includes('cheapest') || text.includes('lowest price') || text.includes('most affordable')) {
      const categoryMatch = this.detectCategory(text);
      let pool = this.items;
      if (categoryMatch) {
        pool = pool.filter(item => item.category === categoryMatch);
      }
      if (text.includes('gaming')) {
        pool = pool.filter(item => item.name.toLowerCase().includes('gaming') || item.description.toLowerCase().includes('gaming'));
      }

      const sorted = [...pool].sort((a, b) => a.price - b.price);
      if (sorted.length > 0) {
        const topItem = sorted[0];
        const secondItem = sorted[1];
        let reply = `Our most affordable ${categoryMatch ? categoryMatch.slice(0, -1) : 'item'} right now is the **${topItem.name}** at **$${topItem.price.toLocaleString()}** (Condition: **${topItem.condition}**, Stock: **${topItem.stock}**).\n\n`;
        reply += `* **Key Highlights**: ${Object.entries(topItem.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' | ')}\n`;
        reply += `* **Warranty**: ${topItem.warranty}\n`;
        if (topItem.batteryHealth) {
          reply += `* **Battery**: ${topItem.batteryHealth}\n`;
        }

        if (secondItem) {
          reply += `\nAnother great budget option is the **${secondItem.name}** at **$${secondItem.price.toLocaleString()}** (${secondItem.condition}).`;
        }

        return {
          handled: true,
          response: {
            reply,
            recommendedAction: 'BROWSE_CATALOG',
            actionLabel: `View ${topItem.name}`,
            actionDetail: `Price: $${topItem.price} (${topItem.condition})`,
            suggestedPrompts: [
              `Tell me more about the ${topItem.model}`,
              'What else do you have under $500?',
              'Do you have any gaming laptops?'
            ],
            matchedProducts: [topItem, secondItem].filter(Boolean) as GadgetItem[],
            source: 'local'
          }
        };
      }
    }

    // 7. Multi-item queries: "iPhone 13 or Samsung S22", "MacBook and iPad"
    // Split candidate queries on ' or ', ' and ', or commas
    const candidates = this.extractMultiItemCandidates(text);
    if (candidates.length > 1) {
      const matchResults: { candidate: string; items: GadgetItem[] }[] = [];
      for (const cand of candidates) {
        const matched = this.matchCandidate(cand);
        if (matched.length > 0) {
          matchResults.push({ candidate: cand, items: matched });
        }
      }

      if (matchResults.length > 0) {
        let reply = `Here is what we found in our real-time inventory for your comparison:\n\n`;
        const allMatchedProducts: GadgetItem[] = [];

        for (const res of matchResults) {
          const item = res.items[0];
          allMatchedProducts.push(item);
          reply += `### **${item.name}**\n`;
          reply += `- **Price**: **$${item.price.toLocaleString()}** ${item.originalPrice ? `~~$${item.originalPrice}~~` : ''}\n`;
          reply += `- **Condition**: **${item.condition}** ${item.isNew ? '(Brand New)' : '(Inspected)'}\n`;
          reply += `- **Availability**: **${item.stock} in stock**\n`;
          if (item.batteryHealth) reply += `- **Battery**: ${item.batteryHealth}\n`;
          reply += `- **Warranty**: ${item.warranty}\n\n`;
        }

        const foundNames = matchResults.map(m => m.items[0].model).join(' vs ');
        return {
          handled: true,
          response: {
            reply: reply.trim(),
            recommendedAction: 'BROWSE_CATALOG',
            actionLabel: 'Compare in Catalog',
            actionDetail: `Comparing ${allMatchedProducts.length} devices`,
            suggestedPrompts: [
              `What is included with the ${allMatchedProducts[0].model}?`,
              'Is shipping or pickup available?',
              'I want to trade in my old device'
            ],
            matchedProducts: allMatchedProducts,
            source: 'local'
          }
        };
      }
    }

    // 8. Single item candidate fuzzy match
    const cleanTokens = this.cleanQueryTokens(text);
    if (cleanTokens.length > 0) {
      const matched = this.matchCandidate(cleanTokens);
      if (matched.length > 0) {
        const primary = matched[0];
        const secondary = matched.slice(1, 3);
        const fmtPrice = (val: number) => (val > 5000 ? '₦' + val.toLocaleString() : '$' + val.toLocaleString());
        let reply = `Yes! We currently have **${primary.stock} unit${primary.stock > 1 ? 's' : ''}** of the **${primary.name}** in stock.\n\n`;
        reply += `- **Price**: **${fmtPrice(primary.price)}** ${primary.originalPrice ? `*(was ${fmtPrice(primary.originalPrice)})*` : ''}\n`;
        reply += `- **Condition**: **${primary.condition}** ${primary.isNew ? '(Factory Sealed)' : '(Certified Pre-Owned)'}\n`;
        if (primary.batteryHealth) {
          reply += `- **Battery Health**: ${primary.batteryHealth}\n`;
        }
        reply += `- **Warranty**: ${primary.warranty}\n`;
        reply += `- **Included in box**: ${primary.whatsIncluded.join(', ')}\n\n`;
        reply += `*${primary.description}*`;

        if (secondary.length > 0) {
          reply += `\n\n*Related in stock: ${secondary.map(s => `**${s.name}** (${fmtPrice(s.price)})`).join(' | ')}*`;
        }

        return {
          handled: true,
          response: {
            reply,
            recommendedAction: 'BROWSE_CATALOG',
            actionLabel: `View ${primary.model} in Catalog`,
            actionDetail: `${fmtPrice(primary.price)} • ${primary.condition}`,
            suggestedPrompts: [
              `Is the ${primary.model} still under warranty?`,
              `Can I trade in for the ${primary.model}?`,
              'What payment methods do you take?'
            ],
            matchedProducts: [primary, ...secondary],
            source: 'local'
          }
        };
      }
    }

    // 9. If the message reads as a specific product search but no match was found:
    if (this.isProductSearchQuery(text)) {
      return {
        handled: true,
        response: {
          reply: `We don't currently have that exact device in stock on our floor today, but we can source it for you!\n\nWould you like to log a **Want List** request? Our sourcing agents scan our verified wholesaler and trade-in pipeline daily and will notify you as soon as a unit matching your budget is secured.`,
          recommendedAction: 'REQUEST_ITEM',
          actionLabel: 'Log Sourcing Request',
          actionDetail: 'Specify model, target budget & contact channel',
          suggestedPrompts: [
            'Browse our current in-stock catalog',
            'What phones do you have in stock?',
            'Speak with a store representative'
          ]
        }
      };
    }

    // 10. Pass to Local Chatbot Engine (state machine, fuzzy search, orders, consult, swap)
    const botRes = this.chatbot.processMessage('web-user', rawMessage);
    const matched = (botRes.matchedProducts || []).map(productRecordToGadgetItem);
    return {
      handled: true,
      response: {
        reply: botRes.reply,
        recommendedAction: botRes.recommendedAction || null,
        actionLabel: botRes.actionLabel || null,
        actionDetail: botRes.actionDetail || null,
        suggestedPrompts: botRes.suggestedPrompts,
        matchedProducts: matched.length > 0 ? matched : undefined,
        source: 'local'
      }
    };
  }

  private isDiagnosticsIntent(text: string): boolean {
    const triggers = [
      'diagnostic', 'diagnostics', 'check my phone', 'check my device', 'test my phone',
      'test my device', 'run diagnostic', 'run diagnostics', 'run test', 'battery health',
      'check battery', 'is my battery healthy', 'test screen', 'touch test', 'check screen',
      'test camera', 'test mic', 'test microphone', 'test speaker', 'hardware check',
      'hardware test', 'check hardware', 'scan my device', 'phone check', 'device check'
    ];
    return triggers.some(t => text.includes(t));
  }

  private isSellIntent(text: string): boolean {
    const triggers = [
      'sell', 'trade in', 'trade-in', 'trading in', 'trade my', 'how much for my',
      'cash for my', 'buy my', 'pawn', 'quote for my', 'sell my', 'value my'
    ];
    return triggers.some(t => text.includes(t));
  }

  private isWarrantyIntent(text: string): boolean {
    const triggers = [
      'warranty', 'guarantee', 'return policy', 'returns', 'refund',
      'how long is the warranty', 'defective', 'broken', 'repair'
    ];
    return triggers.some(t => text.includes(t));
  }

  private isConditionScaleIntent(text: string): boolean {
    const triggers = [
      'condition grade', 'condition scale', 'what does good mean', 'what does fair mean',
      'what does like new mean', 'grading system', 'grading scale', 'scratches', 'condition guide'
    ];
    return triggers.some(t => text.includes(t));
  }

  private isHumanContactIntent(text: string): boolean {
    const triggers = [
      'human', 'real person', 'talk to someone', 'speak to someone', 'whatsapp', 'phone number',
      'call you', 'store hours', 'address', 'location', 'wholesale', 'negotiate', 'manager', 'agent'
    ];
    return triggers.some(t => text.includes(t));
  }

  private isSourcingIntent(text: string): boolean {
    const triggers = [
      'can you get me', 'can you source', 'do you source', 'want list', 'order for me',
      'find me an', 'find me a', 'special order', 'procure'
    ];
    return triggers.some(t => text.includes(t));
  }

  private detectCategory(text: string): string | null {
    if (text.includes('phone') || text.includes('iphone') || text.includes('samsung') || text.includes('pixel')) return 'phones';
    if (text.includes('laptop') || text.includes('macbook') || text.includes('notebook') || text.includes('pc')) return 'laptops';
    if (text.includes('tablet') || text.includes('ipad')) return 'tablets';
    if (text.includes('console') || text.includes('ps5') || text.includes('playstation') || text.includes('switch') || text.includes('xbox')) return 'consoles';
    if (text.includes('watch') || text.includes('apple watch')) return 'smartwatches';
    if (text.includes('headphone') || text.includes('earbuds') || text.includes('airpods') || text.includes('charger') || text.includes('power bank')) return 'accessories';
    return null;
  }

  private extractMultiItemCandidates(text: string): string[] {
    // Check if user is comparing or asking for multiple items
    if (!text.includes(' or ') && !text.includes(' and ') && !text.includes(' vs ') && !text.includes(',')) {
      return [];
    }

    // Split on delimiters
    const rawParts = text.split(/\b(?:or|and|vs|,)\b/gi).map(p => p.trim());
    const validParts: string[] = [];
    for (const part of rawParts) {
      const cleaned = this.cleanQueryTokens(part);
      if (cleaned.length >= 3) {
        validParts.push(cleaned);
      }
    }
    return validParts.length > 1 ? validParts : [];
  }

  private cleanQueryTokens(text: string): string {
    // Token-level stopword removal as mandated
    const words = text
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0 && !STOPWORDS.has(w));
    return words.join(' ').trim();
  }

  private matchCandidate(query: string): GadgetItem[] {
    if (!query) return [];
    const results = this.fuse.search(query);
    // Filter for good confidence
    const goodMatches = results
      .filter(r => (r.score ?? 1) <= 0.45)
      .map(r => r.item);
    return goodMatches;
  }

  private isProductSearchQuery(text: string): boolean {
    const searchIndicators = [
      'do you have', 'got any', 'looking for', 'in stock', 'how much for', 'price of',
      'iphone', 'galaxy', 'macbook', 'ipad', 'playstation', 'ps5', 'xbox', 'dell', 'lenovo', 'asus',
      'switch', 'airpods', 'sony', 'pixel', 'laptop', 'tablet', 'phone', 'console', 'oled'
    ];
    return searchIndicators.some(ind => text.includes(ind));
  }
}
