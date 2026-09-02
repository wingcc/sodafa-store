"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  href?: string;
  label: string;
  icon?: React.ElementType;
  current?: boolean;
};

interface StoreBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Shared icon-based breadcrumb — matches the exact style used in
 * CheckoutClient (app/(store)/checkout/components/CheckoutClient.tsx:462)
 * and ProductDetailClient (app/(store)/store/[id]/components/ProductDetailClient.tsx:391).
 *
 * Reused for Contact, Checkout, Product detail, Track-order to keep
 * navigation consistent across the store.
 */
export function StoreBreadcrumb({ items, className = "" }: StoreBreadcrumbProps) {
  return (
    <ol className={`flex items-center whitespace-nowrap ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const Icon = item.icon;
        const isCurrent = item.current ?? isLast;

        return (
          <li key={`${item.label}-${idx}`} className="inline-flex items-center">
            {isCurrent || !item.href ? (
              <span
                className="inline-flex items-center text-sm font-semibold text-stone-900 truncate max-w-[200px]"
                aria-current={isCurrent ? "page" : undefined}
              >
                {Icon ? <Icon className="shrink-0 me-2 w-4 h-4" /> : null}
                {item.label}
              </span>
            ) : (
              <>
                <Link
                  href={item.href}
                  className="flex items-center text-sm text-stone-500 hover:text-emerald-800 transition-colors focus:outline-none focus:text-emerald-800"
                >
                  {Icon ? <Icon className="shrink-0 me-2 w-4 h-4" /> : null}
                  {item.label}
                </Link>
                <ChevronRight className="shrink-0 mx-2 w-4 h-4 text-stone-400" />
              </>
            )}
            {/* Separator for current item is rendered by previous linked item; no trailing separator */}
          </li>
        );
      })}
    </ol>
  );
}

export default StoreBreadcrumb;
