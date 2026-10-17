import { StoreConfig } from '../types';
import { DEFAULT_WHATSAPP_NUMBER_RAW, DEFAULT_WHATSAPP_DISPLAY } from '../utils/whatsapp';

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  businessName: 'Devreemz Gadget',
  tagline: 'Health technology for every day. Trusted, tested, and ready to help.',
  phone: '+234 903 847 6114',
  whatsapp: DEFAULT_WHATSAPP_DISPLAY,
  whatsappRaw: DEFAULT_WHATSAPP_NUMBER_RAW,
  email: 'hello@devreemzgadget.com',
  address: 'Devreemz Gadget Hub, Victoria Island, Lagos, Nigeria',
  pickupLocation: 'Safe Exchange Hub, Adeola Odeku St, Victoria Island, Lagos',
  businessHours: 'Mon – Sat: 9:00 AM – 7:30 PM | Sun: 1:00 PM – 6:00 PM',
  usedWarrantyTerms: 'Coverage varies by product. Contact us to confirm warranty and support details before ordering.',
  newWarrantyTerms: 'Manufacturer warranty terms vary by product. Contact us to confirm the applicable coverage.',
  quoteTimeHours: 2,
  instagramUrl: 'https://instagram.com/devreemz_gadget',
  tiktokUrl: 'https://tiktok.com/@devreemzgadget',
  announcementBanner: 'Explore health technology for everyday care, wellness and mobility.',
  metaPixelId: '', // Set in Admin settings or .env
  tiktokPixelId: '', // Set in Admin settings or .env
};
