/**
 * Standalone Local WhatsApp Chatbot for Devreemz Gadget
 * Official WhatsApp Contact: 09038476114 (+2349038476114)
 *
 * Requirements (for running standalone on local machine with WhatsApp Web):
 *   npm install whatsapp-web.js qrcode-terminal better-sqlite3 fuse.js dotenv
 *
 * Run:
 *   node whatsapp-bot.js
 */

require('dotenv').config();

let Client, LocalAuth, qrcode, Database, Fuse;
try {
  ({ Client, LocalAuth } = require('whatsapp-web.js'));
} catch (e) {
  console.log('[Info] whatsapp-web.js not installed in container; required for standalone WhatsApp QR scan mode.');
}
try {
  qrcode = require('qrcode-terminal');
} catch (e) {}
try {
  Database = require('better-sqlite3');
} catch (e) {}
try {
  Fuse = require('fuse.js');
} catch (e) {}

// ====================== DATABASE ======================
let db;
if (Database) {
  try {
    db = new Database('store.db');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');

    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        category TEXT NOT NULL,          -- 'iphone' | 'macbook'
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        description TEXT
      );
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE,
        customer_number TEXT,
        items TEXT,
        total REAL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.warn('SQLite init note:', err.message);
  }
}

// ---------- SEED PRODUCTS ----------
function seedDatabase() {
  if (!db) return;
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO products (name, sku, category, price, stock, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const iphones = [
    ['iPhone 18 Pro Max 256GB', 'IP18PM-256', 2850000, 6, 'Latest Pro Max • A20 Pro • 6.9"'],
    ['iPhone 18 Pro Max 512GB', 'IP18PM-512', 3150000, 4, 'Latest Pro Max • 512GB'],
    ['iPhone 18 Pro 256GB', 'IP18P-256', 2450000, 8, 'Latest Pro • A20 Pro • 6.3"'],
    ['iPhone 18 Pro 512GB', 'IP18P-512', 2750000, 5, 'Latest Pro • 512GB'],
    ['iPhone Duo 256GB', 'IPDUO-256', 3200000, 3, 'First foldable iPhone • 256GB'],
    ['iPhone Duo 512GB', 'IPDUO-512', 3550000, 2, 'Foldable • 512GB'],
    ['iPhone 17 Pro Max 256GB', 'IP17PM-256', 2150000, 7, 'A19 Pro • 6.9"'],
    ['iPhone 17 Pro 256GB', 'IP17P-256', 1850000, 9, 'A19 Pro • 6.3"'],
    ['iPhone Air 256GB', 'IPAIR-256', 1750000, 6, 'Ultra-thin • A19 Pro'],
    ['iPhone 17 256GB', 'IP17-256', 1350000, 12, 'A19 • great value'],
    ['iPhone 17e 256GB', 'IP17E-256', 980000, 15, 'Budget 2026 model'],
    ['iPhone 16 Pro Max 256GB', 'IP16PM-256', 1650000, 8, 'A18 Pro • excellent camera'],
    ['iPhone 16 Pro 128GB', 'IP16P-128', 1350000, 10, 'A18 Pro'],
    ['iPhone 16 128GB', 'IP16-128', 980000, 14, 'Solid all-rounder'],
    ['iPhone 15 Pro Max 256GB', 'IP15PM-256', 1250000, 7, 'Still highly demanded'],
    ['iPhone 15 Pro 128GB', 'IP15P-128', 980000, 9, 'Titanium • A17 Pro'],
    ['iPhone 15 128GB', 'IP15-128', 780000, 12, 'Reliable & affordable'],
    ['iPhone 14 Pro Max 256GB', 'IP14PM-256', 890000, 10, 'Great camera & battery'],
    ['iPhone 14 Pro 128GB', 'IP14P-128', 720000, 11, 'Dynamic Island'],
    ['iPhone 13 Pro Max 128GB', 'IP13PM-128', 620000, 9, 'Still a beast'],
    ['iPhone 13 128GB', 'IP13-128', 480000, 15, 'Best budget Pro feel'],
    ['iPhone 12 Pro Max 128GB', 'IP12PM-128', 420000, 8, 'Good value used/new'],
    ['iPhone 12 128GB', 'IP12-128', 350000, 12, 'Affordable entry'],
  ];

  const macbooks = [
    ['MacBook Air 13" M5 16/512', 'MBA13-M5-16-512', 1850000, 5, 'M5 • 13-inch • 16GB/512GB'],
    ['MacBook Air 15" M5 16/512', 'MBA15-M5-16-512', 2150000, 4, 'M5 • 15-inch • bigger screen'],
    ['MacBook Pro 14" M5 Pro 24/1TB', 'MBP14-M5P-24-1T', 3450000, 3, 'M5 Pro • pro power'],
    ['MacBook Pro 16" M5 Pro 24/1TB', 'MBP16-M5P-24-1T', 3950000, 2, 'M5 Pro • 16-inch'],
    ['MacBook Pro 14" M5 Max 36/1TB', 'MBP14-M5M-36-1T', 4850000, 2, 'M5 Max • max performance'],
    ['MacBook Neo 13" A18 Pro 8/256', 'MBNEO-A18-8-256', 980000, 6, 'Most affordable MacBook'],
    ['MacBook Air 13" M3 8/256', 'MBA13-M3-8-256', 1250000, 5, 'Previous gen • great price'],
    ['MacBook Air 15" M3 8/512', 'MBA15-M3-8-512', 1550000, 4, '15" M3'],
  ];

  const tx = db.transaction(() => {
    for (const [name, sku, price, stock, desc] of iphones) {
      insert.run(name, sku, 'iphone', price, stock, desc);
    }
    for (const [name, sku, price, stock, desc] of macbooks) {
      insert.run(name, sku, 'macbook', price, stock, desc);
    }
  });
  tx();
  console.log('Seeded database with initial products');
}

seedDatabase();

// ---------- HELPERS ----------
function money(n) {
  return '₦' + Number(n).toLocaleString();
}

function getProducts(category = null) {
  if (!db) return [];
  if (category) {
    return db.prepare('SELECT * FROM products WHERE category = ? AND stock > 0 ORDER BY price DESC').all(category);
  }
  return db.prepare('SELECT * FROM products WHERE stock > 0 ORDER BY category, price DESC').all();
}

function cleanProductQuery(raw) {
  return (raw || '')
    .toLowerCase()
    .replace(/\b(i want to buy|i want to purchase|i want to get|i want|want to buy|need to buy|i need|can i get|can i buy|can you sell me|do you have|do you guys have|got any|how much is|how much for|what is the price of|price of|price for|buy me|buy|purchase|order|get me|get|sell me|show me|looking for|look for|find me|check for|in stock|available|please|today|now|a|an|the)\b/gi, ' ')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findProducts(rawText) {
  const activeProducts = getProducts();
  if (!activeProducts.length) return [];

  const lowerRaw = (rawText || '').toLowerCase();
  const cleaned = cleanProductQuery(rawText);

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

  // 3. Substring direct search
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

  // 4. Fuse.js fallback
  if (Fuse) {
    const fuse = new Fuse(activeProducts, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'sku', weight: 0.2 },
        { name: 'description', weight: 0.1 }
      ],
      threshold: 0.45,
      ignoreLocation: true,
    });
    const searchStr = cleaned.length >= 2 ? cleaned : lowerRaw;
    const res = fuse.search(searchStr);
    return res.map(r => r.item);
  }

  return [];
}

function findProduct(text) {
  const list = findProducts(text);
  return list.length ? list[0] : null;
}

// ---------- STATE MACHINE ----------
const sessions = new Map();

function getSession(from) {
  if (!sessions.has(from)) sessions.set(from, { mode: 'idle' });
  return sessions.get(from);
}

function reset(from) {
  sessions.set(from, { mode: 'idle' });
}

// WhatsApp Web Client initialization if running standalone
if (Client && LocalAuth) {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    console.log('\nScan this QR code in WhatsApp to link your bot:');
    if (qrcode) qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('WhatsApp Bot is ready and running!');
  });

  client.on('message', async (msg) => {
    if (msg.fromMe) return;
    const from = msg.from;
    const raw = (msg.body || '').trim();
    const text = raw.toLowerCase();
    const session = getSession(from);

    // Cancel
    if (['cancel', 'stop', 'back'].includes(text)) {
      reset(from);
      return msg.reply('Cancelled. Type *menu* to start again.');
    }

    // Paid confirmation
    if (text.startsWith('paid')) {
      const parts = text.split(/\s+/);
      const orderId = (parts[1] || '').toUpperCase();
      if (!orderId) return msg.reply('Include your order ID → e.g. *paid ORD-12345678*');

      const order = db.prepare('SELECT * FROM orders WHERE order_id = ? AND status = "pending"').get(orderId);
      if (!order) return msg.reply('Order not found or already processed.');

      const items = JSON.parse(order.items);
      const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE name = ?');
      const tx = db.transaction(() => {
        for (const it of items) updateStock.run(it.quantity, it.name);
        db.prepare('UPDATE orders SET status = "paid" WHERE id = ?').run(order.id);
      });
      tx();
      reset(from);
      return msg.reply(`✅ Payment confirmed for *${orderId}*\nThank you! We’ll process your order shortly.`);
    }

    // Number selection
    if (/^\d+$/.test(text)) {
      const n = parseInt(text, 10);
      if (session.mode === 'quantity' && session.product) {
        const product = session.product;
        const live = db.prepare('SELECT * FROM products WHERE id = ?').get(product.id);
        if (!live || live.stock < n) {
          return msg.reply(`Only ${live ? live.stock : 0} left in stock. Reply with lower quantity or *cancel*.`);
        }
        const qty = Math.max(1, n);
        const orderId = 'ORD-' + Date.now().toString().slice(-8);
        const total = product.price * qty;
        db.prepare(`
          INSERT INTO orders (order_id, customer_number, items, total)
          VALUES (?, ?, ?, ?)
        `).run(orderId, from, JSON.stringify([{ name: live.name, quantity: qty, price: live.price }]), total);

        reset(from);
        return msg.reply(
          `✅ *Order Created*\nID: *${orderId}*\n${qty}× ${live.name}\nTotal: *${money(total)}*\n\nPay and reply:\n*paid ${orderId}*`
        );
      }

      if (session.mode === 'picking' && session.list) {
        const product = session.list[n - 1];
        if (!product) return msg.reply(`Pick between 1 and ${session.list.length}, or type *cancel*.`);
        session.mode = 'quantity';
        session.product = product;
        delete session.list;
        return msg.reply(
          `*${product.name}*\n${money(product.price)} • ${product.stock} available\n${product.description || ''}\n\nHow many do you want?\nReply with a number or type *cancel*.`
        );
      }
    }

    // Menu / Greetings
    if (['hi', 'hello', 'hey', 'start', 'menu'].includes(text)) {
      reset(from);
      return msg.reply(
        `👋 Welcome to *Devreemz Gadget*\n*Sleek • Trustworthy • Reliable*\n\nWe sell, swap & consult on every iPhone and MacBook.\n\nWhat do you need?\n• *buy* or *catalog* — see products\n• *iphones* / *macbooks* — filtered list\n• *swap* — trade-in your device\n• *consult* — free advice on which to get\n• *my orders*\n\nJust tell me.`
      );
    }

    // iPhones / MacBooks
    if (text === 'iphones' || text === 'iphone') {
      const items = getProducts('iphone');
      session.mode = 'picking';
      session.list = items;
      delete session.product;
      const listStr = items.map((p, i) => `*${i + 1}.* ${p.name} — ${money(p.price)}`).join('\n');
      return msg.reply(`📱 *iPhones*\n\n${listStr}\n\nReply with a number to pick.`);
    }

    if (text === 'macbooks' || text === 'macbook') {
      const items = getProducts('macbook');
      session.mode = 'picking';
      session.list = items;
      delete session.product;
      const listStr = items.map((p, i) => `*${i + 1}.* ${p.name} — ${money(p.price)}`).join('\n');
      return msg.reply(`💻 *MacBooks*\n\n${listStr}\n\nReply with a number to pick.`);
    }

    // Swap Flow
    if (['swap', 'trade', 'exchange'].some(t => text.includes(t)) || session.mode === 'swap') {
      if (session.mode !== 'swap') {
        session.mode = 'swap';
        session.step = 1;
        return msg.reply(`🔄 *Device Swap*\nWhat device are you trading in?\n(e.g. “iPhone 14 Pro Max 256GB” or “MacBook Air M2”)\nType *cancel* anytime.`);
      }
      if (session.step === 1) {
        session.tradeIn = raw;
        session.step = 2;
        return msg.reply(`Got it: *${raw}*\nWhat would you like to upgrade to?\n(Say a model or type *iphones* / *macbooks*)`);
      }
      if (session.step === 2) {
        const tradeIn = session.tradeIn;
        const desired = raw;
        reset(from);
        return msg.reply(`✅ Swap request received!\nFrom: ${tradeIn}\nTo: ${desired}\nA specialist will check condition & give you an exact quote within a few minutes.`);
      }
    }

    // Consult
    if (['consult', 'advice', 'recommend', 'help me choose'].some(t => text.includes(t))) {
      reset(from);
      return msg.reply(`💬 *Free Consultation*\nTell me:\n1. What’s your budget?\n2. Main use? (photos, video, work, gaming, student…)\n3. Any preference? (size, battery, camera, portability)\nI’ll recommend the best iPhone or MacBook for you.`);
    }

    // Orders
    if (text === 'my orders' || text === 'orders') {
      const orders = db.prepare('SELECT * FROM orders WHERE customer_number = ? ORDER BY id DESC LIMIT 5').all(from);
      if (!orders.length) return msg.reply('No orders found.');
      const str = orders.map(r => `• *${r.order_id}* — ${money(r.total)} (${r.status})`).join('\n');
      return msg.reply(`📦 *Your orders*\n\n${str}`);
    }

    // Product search fallback
    const match = findProduct(raw);
    if (match) {
      session.mode = 'quantity';
      session.product = match;
      delete session.list;
      return msg.reply(`*${match.name}*\n${money(match.price)} • ${match.stock} available\n${match.description || ''}\n\nHow many do you want?\nReply with a number or type *cancel*.`);
    }

    return msg.reply(`I didn’t catch that.\nQuick options:\n• *menu*\n• *iphones* / *macbooks*\n• *swap*\n• *consult*\n• *my orders*`);
  });

  client.initialize().catch((err) => {
    console.log('Client init note:', err.message);
  });
}

module.exports = {
  getProducts,
  findProduct,
  money
};
