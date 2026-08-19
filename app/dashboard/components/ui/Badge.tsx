// SODFA MARKETPLACE - Badge Component

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm', dot, className }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-sky-50 text-sky-700 border-sky-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    default: 'bg-gray-50 text-gray-700 border-gray-100',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-sky-500',
    purple: 'bg-purple-500',
    default: 'bg-gray-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${variants[variant]} ${sizes[size]} ${className || ''}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export default Badge;
