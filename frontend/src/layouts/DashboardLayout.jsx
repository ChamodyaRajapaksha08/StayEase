import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';

export const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 1. Desktop Fixed/Sticky Sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-screen sticky top-0 z-30">
        <Sidebar />
      </div>

      {/* 2. Mobile Sidebar Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative flex flex-col w-64 max-w-xs bg-secondary shadow-2xl z-10">
            <Sidebar isMobile onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Area with Independent Scroll */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        <footer className="py-4 px-6 text-center text-[11px] text-slate-400 border-t border-slate-200/60 bg-white/50 flex-shrink-0">
          <p>© 2026 StayEase Inc. Smart Hostel & Apartment Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
