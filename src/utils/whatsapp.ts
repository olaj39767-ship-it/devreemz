import { GadgetItem, StoreConfig, DeviceDiagnosticReport } from '../types';

/**
 * Universal WhatsApp Helper for Devreemz Gadget
 * Keeps the official business number in one single source of truth.
 */
export const DEFAULT_WHATSAPP_NUMBER_RAW = '2349038476114';
export const DEFAULT_WHATSAPP_DISPLAY = '+234 903 847 6114';

export function getCleanWhatsAppNumber(config?: StoreConfig): string {
  if (config?.whatsappRaw) {
    return config.whatsappRaw.replace(/[^0-9]/g, '');
  }
  if (config?.whatsapp) {
    return config.whatsapp.replace(/[^0-9]/g, '');
  }
  return DEFAULT_WHATSAPP_NUMBER_RAW;
}

export function getWhatsAppDisplay(config?: StoreConfig): string {
  return config?.whatsapp || DEFAULT_WHATSAPP_DISPLAY;
}

/**
 * Format currency in Nigerian Naira
 */
export function formatNaira(amount: number): string {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

/**
 * Format Product Page URL for sharing in WhatsApp
 */
export function getProductPageUrl(productId: string): string {
  try {
    const origin = window.location.origin;
    return `${origin}/?unit=${encodeURIComponent(productId)}`;
  } catch {
    return `https://devreemzgadget.com/?unit=${encodeURIComponent(productId)}`;
  }
}

/**
 * Requirement B.1: Exact Order on WhatsApp prefilled message
 */
export function buildProductOrderUrl(config: StoreConfig | undefined, item: GadgetItem): string {
  const number = getCleanWhatsAppNumber(config);
  const batteryLine = item.batteryHealth ? `Battery: ${item.batteryHealth}\n` : '';
  const productUrl = getProductPageUrl(item.id);

  const messageText = 
`Hello Devreemz Gadget, I'm interested in this phone:
Model: ${item.model || item.name}
Storage: ${item.storage || item.specs?.storage || 'Standard'}
Color: ${item.color || item.specs?.color || 'Original'}
Condition: ${item.condition}
${batteryLine}Price: ${formatNaira(item.price)}
Unit ID: ${item.id}
Link: ${productUrl}
Is it still available?`;

  return `https://wa.me/${number}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Requirement B.2: General inquiry greeting
 */
export function buildGeneralInquiryUrl(config?: StoreConfig, customNote?: string): string {
  const number = getCleanWhatsAppNumber(config);
  const baseMessage = customNote
    ? `Hello Devreemz Gadget, ${customNote}`
    : `Hello Devreemz Gadget, I would like to inquire about your verified Apple devices and stock availability.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(baseMessage)}`;
}

/**
 * Requirement B.5: Concierge handoff with conversation summary
 */
export function buildConciergeHandoffUrl(config: StoreConfig | undefined, conversationSummary: string): string {
  const number = getCleanWhatsAppNumber(config);
  const messageText =
`Hello Devreemz Gadget! I was chatting with your AI Concierge on the website regarding:
"${conversationSummary}"

I'm ready to continue this inquiry with a store human specialist to confirm availability and schedule my inspection.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Requirement B.6: Trade-in WhatsApp prefilled message
 */
export interface TradeInDetails {
  model: string;
  storage: string;
  condition: string;
  batteryHealth: string;
  estimatedMinValue: number;
  estimatedMaxValue: number;
  contactName: string;
  notes?: string;
  diagnosticId?: string;
}

export function buildTradeInWhatsAppUrl(config: StoreConfig | undefined, details: TradeInDetails): string {
  const number = getCleanWhatsAppNumber(config);
  const diagLine = details.diagnosticId ? `Diagnostic Test Attached: #${details.diagnosticId}\n` : '';

  const messageText =
`Hello Devreemz Gadget, I would like to trade in my iPhone:
Model: ${details.model}
Storage: ${details.storage}
Condition: ${details.condition}
Battery Health (from Settings): ${details.batteryHealth}
Website Valuation Estimate: ${formatNaira(details.estimatedMinValue)} – ${formatNaira(details.estimatedMaxValue)}
${diagLine}Name: ${details.contactName || 'Customer'}
Notes: ${details.notes || 'Ready for in-person inspection in Lagos'}

I understand the final trade-in price depends on your physical, in-person inspection. How do we proceed?`;

  return `https://wa.me/${number}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Requirement B.7: Sourcing request WhatsApp prefilled message
 */
export interface SourcingDetails {
  model: string;
  storage: string;
  color: string;
  budget: number;
  contactName: string;
  notes?: string;
}

export function buildSourcingWhatsAppUrl(config: StoreConfig | undefined, details: SourcingDetails): string {
  const number = getCleanWhatsAppNumber(config);

  const messageText =
`Hello Devreemz Gadget, I would like you to source a specific device for me:
Model: ${details.model}
Storage: ${details.storage}
Color: ${details.color}
Target Budget: ${formatNaira(details.budget)}
Name: ${details.contactName || 'Customer'}
Notes: ${details.notes || 'Looking for clean, verified condition'}

Please let me know once you locate a verified unit meeting these specs!`;

  return `https://wa.me/${number}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Requirement F: Diagnostic Report WhatsApp prefilled message
 */
export function buildDiagnosticsWhatsAppUrl(config: StoreConfig | undefined, report: DeviceDiagnosticReport): string {
  const number = getCleanWhatsAppNumber(config);

  const messageText =
`Hello Devreemz Gadget! I just completed the browser hardware diagnostics for my device on your website:
- Report ID: #${report.id}
- Detected Model: ${report.deviceInfo.model} (${report.deviceInfo.os})
- Screen & Touch: ${report.touch.gridTestPassed ? 'Zero Dead Zones (Passed)' : 'Tested'}
- Audio / Speaker: ${report.audio.speakerPassed ? 'Operational' : 'Checked'}
- Camera Sensors: ${report.camera.frontPassed ? 'Operational' : 'Checked'}
- Overall Rating: ${report.overallStatus}

I'd like to use this hardware evaluation for an instant trade-in quote.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(messageText)}`;
}
