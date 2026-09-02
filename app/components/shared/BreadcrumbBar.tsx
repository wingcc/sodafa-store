"use client";

import React from "react";
import { StoreBreadcrumb, type BreadcrumbItem } from "../StoreBreadcrumb";

/**
 * Shared Breadcrumb Bar — contact visual language for the icon-based navigation area
 * Matches app/(store)/contact/page.tsx:26
 *  - border-b border-[rgba(23,64,47,.06)] bg-white/70 backdrop-blur-[8px]
 *  - inner max-w-7xl px-4 sm:px-6 lg:px-8 py-4
 * Reused across Contact, Checkout, Store Details, Order Confirmation
 */
export function BreadcrumbBar({
  items,
  rightSlot,
}: {
  items: BreadcrumbItem[];
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="border-b border-[rgba(23,64,47,.06)] bg-white/70 backdrop-blur-[8px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4">
        <StoreBreadcrumb items={items} />
        {rightSlot && <div className="hidden sm:inline-flex shrink-0">{rightSlot}</div>}
      </div>
    </div>
  );
}
