// constants/navigation.ts
export type NavItem = {
  label: {
    ar: string;
    en: string;
  };
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: { ar: "الرئيسية", en: "Home" }, href: "/" },
  { label: { ar: "منتجاتنا", en: "Products" }, href: "store" },
  { label: { ar: "كيفاش نخدمو", en: "How It Works" }, href: "/how-it-works" },
  { label: { ar: "قصتنا", en: "About Us" }, href: "/about" },
  { label: { ar: "تواصلي معنا", en: "Contact Us" }, href: "/contact" },
];