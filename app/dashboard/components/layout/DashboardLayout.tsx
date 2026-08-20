// SODFA MARKETPLACE - Dashboard Layout
// NOTE: This component is no longer used directly.
// The outer shell (Sidebar, auth, CSS) is provided by app/dashboard/layout.tsx.
// AppDashboard.tsx renders Header + content area directly.

import React from 'react';
import Header from './Header';
import { useStore } from '../../store/useStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useStore();

  return (
    <div
      className={`flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
      } min-h-screen`}
    >
      <Header />
      <main className="p-4 lg:p-6 flex-1">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;