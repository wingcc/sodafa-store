// app/dashboard/pages/store-manager/Overview.tsx
'use client';

import { Layout, Megaphone, Star, FileText, Settings, Globe, ScrollText, LucideIcon } from "lucide-react";
import SectionCard, { Color } from "./components/SectionCard";
import { useStore } from "../../store/useStore";

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  page:
    | 'store-homepage'
    | 'store-homepage-content'
    | 'store-reviews'
    | 'store-settings'
    | 'store-seo'
    | 'store-banners'
    | 'store-content';
  color: Color;
}

const sections: Section[] = [
  {
    id: "homepage",
    label: "Home Page",
    icon: Layout,
    description: "Manage homepage sections and layout",
    page: "store-homepage",
    color: "purple",
  },
  {
    id: "contents",
    label: "Contents",
    icon: FileText,
    description: "Edit the texts displayed across your homepage",
    page: "store-homepage-content",
    color: "emerald",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    description: "Manage customer reviews shown on the homepage",
    page: "store-reviews",
    color: "amber",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "General behavior and appearance of your storefront",
    page: "store-settings",
    color: "sky",
  },
  {
    id: "seo",
    label: "SEO",
    icon: Globe,
    description: "Optimize how your store appears in search engines",
    page: "store-seo",
    color: "indigo",
  },
  {
    id: "banners",
    label: "Promotional Banners",
    icon: Megaphone,
    description: "Manage promotional banners and offers",
    page: "store-banners",
    color: "pink",
  },
  {
    id: "content",
    label: "Store Content",
    icon: ScrollText,
    description: "Manage store pages and policies",
    page: "store-content",
    color: "teal",
  },
];

export default function StoreManagerOverview() {
  const { setCurrentPage } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Store Management</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your storefront content and settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            icon={section.icon}
            label={section.label}
            description={section.description}
            href="#"
            color={section.color}
            onClick={() => setCurrentPage(section.page)}
          />
        ))}
      </div>
    </div>
  );
}