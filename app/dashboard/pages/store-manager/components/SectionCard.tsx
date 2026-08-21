"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Color = "purple" | "pink" | "amber" | "emerald" | "sky" | "indigo" | "teal";

interface SectionCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
  color: Color;
}

const colorMap: Record<Color, string> = {
  purple: "bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400 hover:shadow-purple-100/50",
  pink: "bg-pink-50 text-pink-600 border-pink-200 hover:border-pink-400 hover:shadow-pink-100/50",
  amber: "bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400 hover:shadow-amber-100/50",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100/50",
  sky: "bg-sky-50 text-sky-600 border-sky-200 hover:border-sky-400 hover:shadow-sky-100/50",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-400 hover:shadow-indigo-100/50",
  teal: "bg-teal-50 text-teal-600 border-teal-200 hover:border-teal-400 hover:shadow-teal-100/50",
};

export default function SectionCard({
  icon: Icon,
  label,
  description,
  href,
  color,
}: SectionCardProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${colorMap[color]}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-white shadow-sm group-hover:shadow transition-all">
          <Icon size={24} strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{label}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{description}</p>
        </div>
      </div>
      <ChevronRight
        size={20}
        className="text-gray-400 group-hover:text-gray-600 transition-colors"
      />
    </Link>
  );
}