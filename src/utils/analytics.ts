import { AnalyticsStats } from '../types';

const STORAGE_KEY_ANALYTICS = 'devreemz_analytics_v1';

export function getStoredAnalytics(): AnalyticsStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  return {
    productViews: {},
    whatsappClicks: {},
    tradeInsStarted: 0,
    tradeInsSent: 0,
    sourcingSent: 0,
  };
}

export function saveAnalytics(stats: AnalyticsStats): void {
  try {
    localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(stats));
  } catch {}
}

export type AnalyticsEventType =
  | 'product_viewed'
  | 'whatsapp_click'
  | 'tradein_started'
  | 'tradein_sent'
  | 'sourcing_sent';

export function trackEvent(eventType: AnalyticsEventType, payload?: { productId?: string; productName?: string }): void {
  const current = getStoredAnalytics();

  switch (eventType) {
    case 'product_viewed':
      if (payload?.productId) {
        current.productViews[payload.productId] = (current.productViews[payload.productId] || 0) + 1;
      }
      break;
    case 'whatsapp_click':
      if (payload?.productId) {
        current.whatsappClicks[payload.productId] = (current.whatsappClicks[payload.productId] || 0) + 1;
      } else {
        current.whatsappClicks['general_inquiry'] = (current.whatsappClicks['general_inquiry'] || 0) + 1;
      }
      break;
    case 'tradein_started':
      current.tradeInsStarted = (current.tradeInsStarted || 0) + 1;
      break;
    case 'tradein_sent':
      current.tradeInsSent = (current.tradeInsSent || 0) + 1;
      break;
    case 'sourcing_sent':
      current.sourcingSent = (current.sourcingSent || 0) + 1;
      break;
  }

  saveAnalytics(current);

  // Dispatch Pixel stubs if loaded in window
  try {
    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('trackCustom', eventType, payload);
    }
    if (typeof (window as any).ttq?.track === 'function') {
      (window as any).ttq.track(eventType, payload);
    }
  } catch {}
}
