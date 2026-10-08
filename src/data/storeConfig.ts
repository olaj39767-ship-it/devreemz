import { StoreConfig } from '../types';
import { DEFAULT_WHATSAPP_NUMBER_RAW, DEFAULT_WHATSAPP_DISPLAY } from '../utils/whatsapp';

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  businessName: 'Devreemz Gadget',
  tagline: 'Verified iPhones & MacBooks. Inspected Before You Pay.',
  phone: '+234 903 847 6114',
  whatsapp: DEFAULT_WHATSAPP_DISPLAY,
  whatsappRaw: DEFAULT_WHATSAPP_NUMBER_RAW,
  email: 'hello@devreemzgadget.com',
  address: 'Devreemz Gadget Hub, Victoria Island, Lagos, Nigeria',
  pickupLocation: 'Safe Exchange Hub, Adeola Odeku St, Victoria Island, Lagos',
  businessHours: 'Mon – Sat: 9:00 AM – 7:30 PM | Sun: 1:00 PM – 6:00 PM',
  usedWarrantyTerms: '7-Day In-House Replacement Warranty on certified pre-owned devices + 30-Day Technical Assistance.',
  newWarrantyTerms: '1-Year Official Manufacturer Warranty with authentic sealed retail packaging.',
  quoteTimeHours: 2,
  instagramUrl: 'https://instagram.com/devreemz_gadget',
  tiktokUrl: 'https://tiktok.com/@devreemzgadget',
  announcementBanner: '⚡ Lagos Nationwide Same-Day Delivery available. Inspect & verify device physically before you pay!',
  metaPixelId: '', // Set in Admin settings or .env
  tiktokPixelId: '', // Set in Admin settings or .env
};
