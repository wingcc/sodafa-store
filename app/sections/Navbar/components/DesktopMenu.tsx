"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../../../contexts/LanguageContext";
import { NAV_ITEMS } from "./navigation";

export const DesktopMenu = () => {
  const pathname = usePathname();
  const { locale } = useLanguage();

  return (
    <nav>
      <ul className="hidden md:flex items-center gap-x-8 text-[15px] font-medium leading-normal p-0 m-0 list-none">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                className={`relative py-1 transition-colors duration-200 ${
                  isActive ? "text-[#cda552] font-semibold" : "text-white/80 hover:text-white"
                }`}
              >
                {item.label[locale as keyof typeof item.label]}
                <span
                  className={`absolute left-0 bottom-0 h-[2px] bg-[#cda552] transition-all duration-300 rounded-full ${
                    isActive ? "w-full" : "w-0 hover:w-full"
                  }`}
                  style={{
                    boxShadow: isActive ? '0 0 8px rgba(205,165,82,0.6)' : 'none',
                  }}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};