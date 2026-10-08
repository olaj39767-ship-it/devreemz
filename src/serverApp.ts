import express from 'express';
import dotenv from 'dotenv';
import { INVENTORY_ITEMS } from './data/inventory';
import { DEFAULT_STORE_CONFIG } from './data/storeConfig';
import { globalChatbotEngine, formatMoney } from './services/localChatbotEngine';

dotenv.config();

const app = express();

// Enable CORS for cross-origin preview environments & Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));

// Request logging middleware for local & cloud debugging
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  }
  next();
});

// In-memory submissions for Trade-ins & Sourcing Requests
const tradeInSubmissions: any[] = [];
const sourcingRequests: any[] = [];

// API Router
const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
  res.json({
    name: 'Devreemz Gadget API',
    status: 'ok',
    time: new Date().toISOString()
  });
});

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

apiRouter.get('/inventory', (req, res) => {
  res.json({ items: INVENTORY_ITEMS });
});

apiRouter.get('/config', (req, res) => {
  res.json({ config: DEFAULT_STORE_CONFIG });
});

// Sourcing request submission
apiRouter.post('/sourcing-request', (req, res) => {
  const { device, category, maxBudget, preferredCondition, contactName, contactChannel, contactValue, notes } = req.body;
  if (!device || !contactValue) {
    return res.status(400).json({ error: 'Device and contact info are required' });
  }

  const newRequest = {
    id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    device,
    category: category || 'phones',
    maxBudget: Number(maxBudget) || 0,
    preferredCondition: preferredCondition || 'Any',
    contactName: contactName || 'Customer',
    contactChannel: contactChannel || 'whatsapp',
    contactValue,
    notes: notes || '',
    submittedAt: new Date().toISOString(),
    status: 'SEARCHING',
  };

  sourcingRequests.unshift(newRequest);
  res.json({ success: true, request: newRequest });
});

// Trade-in quote submission
apiRouter.post('/trade-in-quote', (req, res) => {
  const { brand, model, condition, storageSpecs, workingCondition, accessoriesIncluded, photos, contactName, contactChannel, contactValue, diagnosticReport } = req.body;
  if (!brand || !model || !contactValue) {
    return res.status(400).json({ error: 'Brand, model, and contact info are required' });
  }

  const newTradeIn = {
    id: `QUOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    brand,
    model,
    condition: condition || 'Good',
    storageSpecs: storageSpecs || 'Standard',
    workingCondition: workingCondition || 'Fully Functional',
    accessoriesIncluded: accessoriesIncluded || 'None',
    photosCount: Array.isArray(photos) ? photos.length : 0,
    contactName: contactName || 'Customer',
    contactChannel: contactChannel || 'whatsapp',
    contactValue,
    diagnosticReport: diagnosticReport || null,
    submittedAt: new Date().toISOString(),
    status: 'PENDING_REVIEW',
  };

  tradeInSubmissions.unshift(newTradeIn);
  res.json({
    success: true,
    quote: newTradeIn,
    estimatedReviewTimeHours: DEFAULT_STORE_CONFIG.quoteTimeHours,
  });
});

// Deterministic Local Chatbot Layer (100% reliable, zero external rate limits)
apiRouter.get('/products', (req, res) => {
  const category = req.query.category as 'iphone' | 'macbook' | undefined;
  res.json({ products: globalChatbotEngine.getProducts(category || null) });
});

apiRouter.get('/orders', (req, res) => {
  res.json({ message: 'Devreemz Gadget does not use online checkouts. All orders are processed via WhatsApp with in-person inspection.' });
});

apiRouter.post('/chat', async (req, res) => {
  try {
    const { message, customerId = 'web-client-user' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[Local Chatbot] Customer "${customerId}": "${message.slice(0, 80)}"`);
    const result = globalChatbotEngine.processMessage(customerId, message);

    return res.json({
      reply: result.reply,
      recommendedAction: result.recommendedAction || null,
      actionLabel: result.actionLabel || null,
      actionDetail: result.actionDetail || null,
      suggestedPrompts: result.suggestedPrompts,
      matchedProducts: result.matchedProducts || null,
      orderId: result.orderId || null,
      mode: result.mode,
      source: 'local'
    });
  } catch (error: any) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      reply: "Something went wrong processing your request. Type *menu* to restart.",
      recommendedAction: null,
      actionLabel: null,
      actionDetail: null,
      suggestedPrompts: ['menu', 'iphones', 'macbooks', 'swap', 'consult', 'my orders'],
      source: 'local'
    });
  }
});

// Mount API router exclusively on /api so root route "/" is served by the frontend (Vite/SPA)
app.use('/api', apiRouter);

export default app;
