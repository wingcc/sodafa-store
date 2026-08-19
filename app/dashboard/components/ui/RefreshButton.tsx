// SODFA MARKETPLACE - Reusable Refresh Button Component

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'gradient';
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isLoading = false,
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = async () => {
    if (isRefreshing || isLoading) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const variantClasses = {
    default: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#cda552] hover:border-[#cda552]/30 shadow-sm',
    minimal: 'bg-transparent text-gray-500 hover:text-[#cda552] hover:bg-[#cda552]/10',
    gradient: 'bg-gradient-to-r from-[#cda552] to-[#b8933e] text-white hover:shadow-lg hover:shadow-[#cda552]/25',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing || isLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-xl transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        ${className}
      `}
      title="Refresh data"
    >
      <RefreshCw
        size={iconSizes[size]}
        className={`transition-transform duration-500 ${isRefreshing || isLoading ? 'animate-spin' : ''}`}
      />
    </button>
  );
};

export default RefreshButton;