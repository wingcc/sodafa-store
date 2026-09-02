"use client";

import React from "react";

/**
 * Shared Page Background — extracted from ContactSection (app/sections/ContactSection/index.tsx:212)
 * Provides the distinctive SODFA contact visual language:
 *  - Base bg-[#FCFBF7]
 *  - Radial blobs (mint #EAF4EE + warm #FFF1C6)
 *  - Horizontal hairline gradient
 *  - Subtle 56px grid + noise
 * Used by Checkout, Store Details, Order Confirmation to unify visual identity.
 */
export function ContactDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-28 -right-28 h-[520px] w-[520px] rounded-full bg-[#EAF4EE] opacity-70 blur-[1px]"
        style={{ background: "radial-gradient(circle at 30% 30%, #EAF4EE 0%, #FCFBF7 70%)" }}
      />
      <div
        className="absolute -bottom-40 -left-40 h-[560px] w-[560px] rounded-full opacity-[0.55]"
        style={{ background: "radial-gradient(circle at 60% 40%, #FFF1C6 0%, transparent 65%)" }}
      />
      <div className="absolute left-1/2 top-[18%] h-[1px] w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(23,64,47,.08)] to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1E7A57 1px, transparent 1px), linear-gradient(to bottom, #1E7A57 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

interface PageShellProps {
  children: React.ReactNode;
  dir?: string;
  className?: string;
  withPadding?: boolean;
}

/**
 * Shared Page Shell — contact visual language wrapper
 * Background + decorative effects + isoled overflow
 */
export function PageShell({ children, dir, className = "", withPadding = true }: PageShellProps) {
  return (
    <div
      dir={dir as any}
      className={`relative isolate overflow-hidden bg-[#FCFBF7] ${withPadding ? "py-8 sm:py-10" : ""} ${className}`}
      style={
        {
          ["--brand" as string]: "#1E7A57",
          ["--brand-deep" as string]: "#07231A",
          ["--brand-deep2" as string]: "#11402F",
          ["--brand-tint" as string]: "#EAF4EE",
          ["--brand-soft" as string]: "#CDE8DB",
          ["--accent" as string]: "#C6A15B",
          ["--accent-soft" as string]: "#E8CE93",
          ["--ink" as string]: "#122A20",
          ["--muted" as string]: "#5A6B5F",
        } as React.CSSProperties
      }
    >
      <ContactDecor />
      {children}
    </div>
  );
}
