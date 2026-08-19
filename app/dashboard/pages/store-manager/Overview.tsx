// app/dashboard/pages/store-manager/Overview.tsx
'use client';

import { Layout, Megaphone, Star, FileText, LucideIcon } from "lucide-react";
import SectionCard, { Color } from "./components/SectionCard";
import { useStore } from "../../store/useStore";

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  page: 'store-homepage' | 'store-banners' |   'store-content'; // استخدم الأنواع الجديدة
  color: Color;
}

const sections: Section[] = [
  {
    id: "homepage",
    label: "Homepage",
    icon: Layout,
    description: "Manage homepage sections and layout",
    page: "store-homepage",
    color: "purple",
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
    icon: FileText,
    description: "Manage store pages and policies",
    page: "store-content",
    color: "emerald",
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
          <div
            key={section.id}
            onClick={() => setCurrentPage(section.page)}
            className="cursor-pointer"
          >
            <SectionCard
              icon={section.icon}
              label={section.label}
              description={section.description}
              href="#" // لن نستخدم الرابط، سنعتمد على onClick
              color={section.color}
            />
          </div>
        ))}
      </div>
    </div>
  );
}