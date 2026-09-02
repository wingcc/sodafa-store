// constants/index.ts
// NOTE: WhatsApp number is now centralized in app/lib/whatsapp.ts
// and read from Store Settings (homepage_content → site_info → whatsappMain).
// The old hardcoded WHATSAPP_NUMBER, WHATSAPP_MESSAGE, and WHATSAPP_LINK
// are deprecated. Use the helpers from app/lib/whatsapp instead.

export { getWhatsAppLink, getWhatsAppNumber, getWhatsAppMessage, buildWhatsAppUrl, getSimpleWhatsAppLink } from "../lib/whatsapp";