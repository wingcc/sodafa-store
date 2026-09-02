// lib/whatsapp.ts
// Centralized WhatsApp configuration and helpers
// Single source of truth for WhatsApp number and contextual messages
// Now reads from StoreSettingsContext (database) — no hardcoded data

import { SiteConfig } from "../sections/common/types";

type Locale = "ar" | "fr" | "en";

// Contextual message templates for different scenarios
const MESSAGES: Record<Locale, {
  home: string;
  general: string;
  productInquiry: (name: string, price: string) => string;
  priceRequest: (name: string) => string;
  checkout: (items: string, total: string) => string;
  orderConfirmation: (orderNumber: string) => string;
  orderTracking: (orderNumber: string) => string;
  help: string;
}> = {
  ar: {
    home: "أريد طلب سيروم الشعر الطبيعي",
    general: "مرحباً 👋 أريد الاستفسار عن منتجاتكم، هل يمكنكم مساعدتي؟",
    productInquiry: (name, price) =>
      `مرحباً 👋 أود الاستفسار عن هذا المنتج، هل يمكنكم تزويدي بالمزيد من المعلومات؟\n\nالمنتج: *${name}*\nالسعر: ${price} د.م`,
    priceRequest: (name) =>
      `مرحباً 👋 أود معرفة سعر هذا المنتج، وشكراً لكم.\n\nالمنتج: *${name}*`,
    checkout: (items, total) =>
      `مرحباً 👋 أود تأكيد طلبي:\n${items}\n\nالمجموع: ${total} د.م`,
    orderConfirmation: (orderNumber) =>
      `مرحباً 👋 لدي استفسار بخصوص طلبي الأخير، هل يمكنكم مساعدتي?\n\nرقم الطلب: *${orderNumber}*`,
    orderTracking: (orderNumber) =>
      `مرحباً 👋 أريد تتبع طلبي ومعرفة حالته.\n\nرقم الطلب: *${orderNumber}*`,
    help: "مرحباً 👋 أحتاج إلى مساعدة بخصوص طلبي، هل يمكنكم مساعدتي؟",
  },
  fr: {
    home: "Je souhaite commander le sérum capillaire naturel",
    general: "Bonjour 👋 Je souhaite me renseigner sur vos produits, pouvez-vous m'aider?",
    productInquiry: (name, price) =>
      `Bonjour 👋 Je souhaite me renseigner sur ce produit, pouvez-vous me donner plus d'informations?\n\nProduit: *${name}*\nPrix: ${price} MAD`,
    priceRequest: (name) =>
      `Bonjour 👋 Je souhaite connaître le prix de ce produit, merci.\n\nProduit: *${name}*`,
    checkout: (items, total) =>
      `Bonjour 👋 Je souhaite confirmer ma commande:\n${items}\n\nTotal: ${total} MAD`,
    orderConfirmation: (orderNumber) =>
      `Bonjour 👋 J'ai une question concernant ma dernière commande, pouvez-vous m'aider?\n\nNuméro de commande: *${orderNumber}*`,
    orderTracking: (orderNumber) =>
      `Bonjour 👋 Je veux suivre ma commande et connaître son statut.\n\nNuméro de commande: *${orderNumber}*`,
    help: "Bonjour 👋 J'ai besoin d'aide concernant ma commande, pouvez-vous m'aider?",
  },
  en: {
    home: "I want to order the natural hair serum",
    general: "Hello 👋 I'd like to inquire about your products, can you assist me?",
    productInquiry: (name, price) =>
      `Hello 👋 I'd like to inquire about this product, can you provide more information?\n\nProduct: *${name}*\nPrice: ${price} MAD`,
    priceRequest: (name) =>
      `Hello 👋 I'd like to know the price of this product, thank you.\n\nProduct: *${name}*`,
    checkout: (items, total) =>
      `Hello 👋 I'd like to confirm my order:\n${items}\n\nTotal: ${total} MAD`,
    orderConfirmation: (orderNumber) =>
      `Hello 👋 I have a question about my recent order, can you help me?\n\nOrder number: *${orderNumber}*`,
    orderTracking: (orderNumber) =>
      `Hello 👋 I want to track my order and check its status.\n\nOrder number: *${orderNumber}*`,
    help: "Hello 👋 I need help with my order, can you assist me?",
  },
};

/**
 * Strip all non-digit characters from a phone number
 */
function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/**
 * Get the WhatsApp number from site config
 * Returns the cleaned number or empty string if not available
 */
export function getWhatsAppNumber(config?: SiteConfig | null): string {
  if (!config) return "";
  const raw = config.whatsappMain || config.whatsappStore || "";
  const cleaned = sanitizePhone(raw);
  return cleaned.length >= 10 ? cleaned : "";
}

/**
 * Build a wa.me URL with the given number and message
 * Returns null if the number is invalid
 */
export function buildWhatsAppUrl(
  number: string,
  message?: string
): string | null {
  const clean = sanitizePhone(number);
  if (clean.length < 10) return null;
  const base = `https://wa.me/${clean}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

/**
 * Get a contextual WhatsApp message based on locale and context
 */
export function getWhatsAppMessage(
  locale: Locale,
  context: "home" | "general" | "product" | "price" | "checkout" | "order" | "tracking" | "help",
  params?: {
    productName?: string;
    productPrice?: string;
    items?: string;
    total?: string;
    orderNumber?: string;
  }
): string {
  const messages = MESSAGES[locale] || MESSAGES.ar;

  switch (context) {
    case "home":
      return messages.home;
    case "general":
      return messages.general;
    case "product":
      return messages.productInquiry(
        params?.productName || "",
        params?.productPrice || "0"
      );
    case "price":
      return messages.priceRequest(params?.productName || "");
    case "checkout":
      return messages.checkout(params?.items || "", params?.total || "0");
    case "order":
      return messages.orderConfirmation(params?.orderNumber || "");
    case "tracking":
      return messages.orderTracking(params?.orderNumber || "");
    case "help":
      return messages.help;
    default:
      return messages.general;
  }
}

/**
 * Main helper: build a complete WhatsApp URL with contextual message
 * Returns null if WhatsApp number is not configured
 */
export function getWhatsAppLink(
  config: SiteConfig | null | undefined,
  locale: Locale,
  context: "home" | "general" | "product" | "price" | "checkout" | "order" | "tracking" | "help" = "general",
  params?: {
    productName?: string;
    productPrice?: string;
    items?: string;
    total?: string;
    orderNumber?: string;
  }
): string | null {
  const number = getWhatsAppNumber(config);
  if (!number) return null;
  const message = getWhatsAppMessage(locale, context, params);
  return buildWhatsAppUrl(number, message);
}

/**
 * Legacy compatibility: get a simple WhatsApp link with default message
 */
export function getSimpleWhatsAppLink(
  config: SiteConfig | null | undefined,
  message?: string
): string | null {
  const number = getWhatsAppNumber(config);
  if (!number) return null;
  return buildWhatsAppUrl(number, message || MESSAGES.ar.general);
}
