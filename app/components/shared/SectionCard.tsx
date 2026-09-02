"use client";

import React from "react";

/**
 * Shared Section Card — contact visual language
 * Extracted from ContactSection form card (app/sections/ContactSection/index.tsx:280)
 *  - rounded-[28px] border [rgba(23,64,47,.08)] bg-white shadow-[0_20px_60px_rgba(17,64,47,.08)]
 *  - optional top accent bar gradient from #1E7A57 to #C6A15B
 *  - header with icon + Tajawal/El Messiri typography
 */
export function SectionCard({
  children,
  className = "",
  withAccent = false,
  padding = "p-5 sm:p-7 lg:p-8",
}: {
  children: React.ReactNode;
  className?: string;
  withAccent?: boolean;
  padding?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-[rgba(23,64,47,.08)] bg-white shadow-[0_20px_60px_rgba(17,64,47,.08)] ${className}`}
    >
      {withAccent && <div className="h-[4px] w-full bg-gradient-to-r from-[#1E7A57] via-[#1E7A57] to-[#C6A15B]" />}
      <div className={padding}>{children}</div>
    </div>
  );
}

export function CardHeader({
  icon,
  title,
  subtitle,
  badge,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      {icon && (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EAF4EE] text-[#1E7A57] ring-1 ring-[#1E7A57]/10">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3
          className="text-[18px] font-extrabold leading-none text-[#07231A] sm:text-[19px]"
          style={{ fontFamily: "'El Messiri', Tajawal, serif" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1.5 text-[13px] font-medium leading-5 text-[#5A6B5F]" style={{ fontFamily: "Tajawal, sans-serif" }}>
            {subtitle}
          </p>
        )}
      </div>
      {badge}
    </div>
  );
}

export function PanelCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[28px] border border-[rgba(23,64,47,.08)] bg-white shadow-[0_16px_40px_rgba(17,64,47,.06)] ${className}`}>
      {children}
    </div>
  );
}
