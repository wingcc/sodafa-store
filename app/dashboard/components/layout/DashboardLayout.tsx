// SODFA MARKETPLACE - Dashboard Layout

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useStore } from '../../store/useStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        <Header />
        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
