import type { ThemeColors } from './colors';

export interface DashboardSurfaces {
  bg: string;
  card: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
}

export interface DashboardPalette {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  brand: ThemeColors;
  light: DashboardSurfaces;
  dark: DashboardSurfaces;
  accent: string;
}

// Palettes — first 4 are exact SSS.html (Emerald, Rose, Amethyst, Ocean)
// + 8 additional premium palettes, all with light+dark surfaces tuned for dashboard
export const PALETTES: DashboardPalette[] = [
  // === SSS: Emerald Garden (default) ===
  {
    id: 'emerald',
    name: 'Emerald Garden',
    nameAr: 'حديقة الزمرد',
    description: 'Nature · trust · authenticity — SSS default',
    descriptionAr: 'طبيعة · ثقة · أصالة',
    accent: '#d97706',
    brand: { darkGreen: '#047857', mediumGreen: '#059669', gold: '#d97706', cream: '#fafaf7', warmCream: '#ecfdf5', white: '#ffffff' },
    light: { bg: '#fafaf7', card: '#ffffff', cardBorder: '#e2e8f0', inputBg: '#ffffff', inputBorder: '#e2e8f0' },
    dark: { bg: '#0a0f1a', card: '#131a28', cardBorder: '#1e293b', inputBg: 'rgba(255,255,255,0.06)', inputBorder: '#1e293b' },
  },
  // === SSS: Rose Bloom ===
  {
    id: 'rose',
    name: 'Rose Bloom',
    nameAr: 'تفتح الورد',
    description: 'Feminine · beauty · charm',
    descriptionAr: 'أنوثة · جمال · جاذبية',
    accent: '#d97706',
    brand: { darkGreen: '#be123c', mediumGreen: '#e11d48', gold: '#d97706', cream: '#fff5f7', warmCream: '#fff1f2', white: '#ffffff' },
    light: { bg: '#fff5f7', card: '#ffffff', cardBorder: '#fecdd3', inputBg: '#ffffff', inputBorder: '#fecdd3' },
    dark: { bg: '#1a0a12', card: '#241018', cardBorder: '#3a1a28', inputBg: 'rgba(255,255,255,0.06)', inputBorder: '#3a1a28' },
  },
  // === SSS: Royal Amethyst ===
  {
    id: 'amethyst',
    name: 'Royal Amethyst',
    nameAr: 'الجمشت الملكي',
    description: 'Luxury · distinction · creativity',
    descriptionAr: 'فخامة · تميّز · إبداع',
    accent: '#d97706',
    brand: { darkGreen: '#6d28d9', mediumGreen: '#7c3aed', gold: '#d97706', cream: '#faf8ff', warmCream: '#f5f3ff', white: '#ffffff' },
    light: { bg: '#faf8ff', card: '#ffffff', cardBorder: '#e9d5ff', inputBg: '#ffffff', inputBorder: '#e9d5ff' },
    dark: { bg: '#0f0a1a', card: '#1a1428', cardBorder: '#2a1a3a', inputBg: 'rgba(255,255,255,0.06)', inputBorder: '#2a1a3a' },
  },
  // === SSS: Ocean Sapphire ===
  {
    id: 'ocean',
    name: 'Ocean Sapphire',
    nameAr: 'ياقوت المحيط',
    description: 'Calm · depth · clarity',
    descriptionAr: 'هدوء · عمق · صفاء',
    accent: '#d97706',
    brand: { darkGreen: '#075985', mediumGreen: '#0369a1', gold: '#d97706', cream: '#f0f9ff', warmCream: '#e0f2fe', white: '#ffffff' },
    light: { bg: '#f0f9ff', card: '#ffffff', cardBorder: '#bae6fd', inputBg: '#ffffff', inputBorder: '#bae6fd' },
    dark: { bg: '#0a1520', card: '#121f2e', cardBorder: '#1a2e40', inputBg: 'rgba(255,255,255,0.06)', inputBorder: '#1a2e40' },
  },
  // === Additional: SODFA Classic (kept for compatibility) ===
  {
    id: 'sodfa',
    name: 'SODFA Classic',
    nameAr: 'سودفا الكلاسيكي',
    description: 'Heritage · deep greens & gold',
    descriptionAr: 'تراث · أخضر عميق وذهبي',
    accent: '#cda552',
    brand: { darkGreen: '#0a2c23', mediumGreen: '#0f3d31', gold: '#cda552', cream: '#f7f3ec', warmCream: '#ece3d4', white: '#ffffff' },
    light: { bg: '#f8f6f3', card: '#ffffff', cardBorder: 'rgba(16,24,16,0.06)', inputBg: '#ffffff', inputBorder: '#e7e5e4' },
    dark: { bg: '#0f1411', card: '#1a2320', cardBorder: 'rgba(255,255,255,0.07)', inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(255,255,255,0.08)' },
  },
  // === Additional palettes — beautiful premium ===
  {
    id: 'noir',
    name: 'Midnight Noir',
    nameAr: 'منتصف الليل',
    description: 'Pure noir — charcoal & champagne',
    descriptionAr: 'سواد خالص — فحمي وشمبانيا',
    accent: '#c9a86a',
    brand: { darkGreen: '#0d1210', mediumGreen: '#1a2420', gold: '#c9a86a', cream: '#f2ede6', warmCream: '#e8ddd0', white: '#ffffff' },
    light: { bg: '#f7f5f2', card: '#ffffff', cardBorder: 'rgba(20,20,20,0.06)', inputBg: '#ffffff', inputBorder: '#e7e5e4' },
    dark: { bg: '#0c0c0c', card: '#181818', cardBorder: 'rgba(255,255,255,0.07)', inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(255,255,255,0.08)' },
  },
  {
    id: 'sage',
    name: 'Sage Meadow',
    nameAr: 'مرج المريمية',
    description: 'Soft sage — eucalyptus & clay',
    descriptionAr: 'مريمية ناعمة — أوكالبتوس وطين',
    accent: '#c17a56',
    brand: { darkGreen: '#1a2a22', mediumGreen: '#2e4035', gold: '#c17a56', cream: '#f4f1e9', warmCream: '#e8e0d0', white: '#ffffff' },
    light: { bg: '#f6f3ec', card: '#ffffff', cardBorder: '#d6d3cd', inputBg: '#ffffff', inputBorder: '#d6d3cd' },
    dark: { bg: '#121814', card: '#1c2620', cardBorder: 'rgba(193,122,86,0.12)', inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(193,122,86,0.10)' },
  },
  {
    id: 'terracotta',
    name: 'Desert Terracotta',
    nameAr: 'تيراكوتا الصحراء',
    description: 'Warm desert — sand & terracotta',
    descriptionAr: 'صحراء دافئة — رمل وتيراكوتا',
    accent: '#d9764a',
    brand: { darkGreen: '#2b1d16', mediumGreen: '#4a2c1e', gold: '#d9764a', cream: '#fdf3ec', warmCream: '#fce6d2', white: '#ffffff' },
    light: { bg: '#fdf6f0', card: '#ffffff', cardBorder: '#f0d9c8', inputBg: '#ffffff', inputBorder: '#f0d9c8' },
    dark: { bg: '#1a1210', card: '#251a16', cardBorder: 'rgba(217,118,74,0.14)', inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(217,118,74,0.12)' },
  },
  {
    id: 'blush',
    name: 'Blush Rose',
    nameAr: 'وردي خجول',
    description: 'Dusty rose — mauve & cream',
    descriptionAr: 'وردي مغبر — موف وكريمي',
    accent: '#c98a95',
    brand: { darkGreen: '#2a1a1e', mediumGreen: '#4a2d35', gold: '#c98a95', cream: '#fdf2f4', warmCream: '#fce8eb', white: '#ffffff' },
    light: { bg: '#fdf5f7', card: '#ffffff', cardBorder: '#f8cbd5', inputBg: '#ffffff', inputBorder: '#f8cbd5' },
    dark: { bg: '#1a1214', card: '#251a1f', cardBorder: 'rgba(201,138,149,0.14)', inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(201,138,149,0.12)' },
  },
  {
    id: 'slate',
    name: 'Slate & Amber',
    nameAr: 'أردواز وكهرمان',
    description: 'Modern slate — charcoal & amber',
    descriptionAr: 'أردواز عصري — فحمي وكهرماني',
    accent: '#f59e0b',
    brand: { darkGreen: '#111827', mediumGreen: '#1f2937', gold: '#f59e0b', cream: '#f9fafb', warmCream: '#f3f4f6', white: '#ffffff' },
    light: { bg: '#f8fafc', card: '#ffffff', cardBorder: '#e2e8f0', inputBg: '#ffffff', inputBorder: '#e2e8f0' },
    dark: { bg: '#0b0f1a', card: '#111827', cardBorder: 'rgba(245,158,11,0.12)', inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(245,158,11,0.10)' },
  },
  {
    id: 'pine',
    name: 'Forest Pine',
    nameAr: 'صنوبر الغابة',
    description: 'Deep forest — pine & moss',
    descriptionAr: 'غابة عميقة — صنوبر وطحلب',
    accent: '#84a98c',
    brand: { darkGreen: '#0b1a12', mediumGreen: '#143322', gold: '#84a98c', cream: '#f0f4f1', warmCream: '#e0ece3', white: '#ffffff' },
    light: { bg: '#f2f7f3', card: '#ffffff', cardBorder: '#c8ddd0', inputBg: '#ffffff', inputBorder: '#c8ddd0' },
    dark: { bg: '#0a140e', card: '#132018', cardBorder: 'rgba(132,169,140,0.14)', inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(132,169,140,0.12)' },
  },
  {
    id: 'lavender',
    name: 'Lavender Mist',
    nameAr: 'ضباب الخزامى',
    description: 'Soft lavender — mist & plum',
    descriptionAr: 'خزامى ناعم — ضباب وبرقوقي',
    accent: '#a78bfa',
    brand: { darkGreen: '#1e1630', mediumGreen: '#2e2348', gold: '#a78bfa', cream: '#f5f3ff', warmCream: '#ede9fe', white: '#ffffff' },
    light: { bg: '#f8f6ff', card: '#ffffff', cardBorder: '#ddd6fe', inputBg: '#ffffff', inputBorder: '#ddd6fe' },
    dark: { bg: '#0f0a1e', card: '#1e1633', cardBorder: 'rgba(167,139,250,0.14)', inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(167,139,250,0.12)' },
  },
  {
    id: 'arctic',
    name: 'Arctic Frost',
    nameAr: 'صقيع القطب',
    description: 'Cool arctic — ice & steel',
    descriptionAr: 'قطبي بارد — جليد وفولاذ',
    accent: '#6b9fcf',
    brand: { darkGreen: '#0f1f2e', mediumGreen: '#1c344d', gold: '#6b9fcf', cream: '#f0f7ff', warmCream: '#dbeafe', white: '#ffffff' },
    light: { bg: '#f2f8fd', card: '#ffffff', cardBorder: '#bfdbfe', inputBg: '#ffffff', inputBorder: '#bfdbfe' },
    dark: { bg: '#090f1a', card: '#0f1e30', cardBorder: 'rgba(107,159,207,0.14)', inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(107,159,207,0.12)' },
  },
];

export const getPalette = (id: string): DashboardPalette => PALETTES.find(p => p.id === id) ?? PALETTES[0];
