// src/app/[locate]/dashboard/layout.tsx

'use client'; // Keep directive

import React, { useState, useEffect } from 'react';
import { Header } from '@/src/app/[locale]/utils/Header'; // Ensure this Header component handles its own translations
import DashboardSidebar from './DashboardSidebar'; // Ensure this Sidebar component handles its own translations

export default function DashboardLayout({
  children,
  params: { locale } // Keep locale prop
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const SIDEBAR_WIDTH_PX = 208;
  const HEADER_HEIGHT_PX = 60;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        if (window.innerWidth >= 768) {
          setIsSidebarOpen(true);
        } else {
          setIsSidebarOpen(false);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []); // Empty dependency array means this runs once on mount

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const contentLeftOffset = isSidebarOpen ? SIDEBAR_WIDTH_PX : 0;

  return (
    <div className='relative min-h-screen bg-background'>

      {/* Dashboard Sidebar - Receives locale but handles its own translations */}
      <DashboardSidebar
          isSidebarOpen={isSidebarOpen}
          locale={locale}
          sidebarWidth={SIDEBAR_WIDTH_PX}
          headerHeight={HEADER_HEIGHT_PX}
      />

      {/* Header - Receives locale but should handle its own translations */}
      <Header
          locale={locale}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          headerHeight={HEADER_HEIGHT_PX}
          sidebarWidth={SIDEBAR_WIDTH_PX}
      />

      {/* Main Content (children pages) - The children components should handle their own translations */}
      <main
        className='absolute bottom-0 right-0 overflow-y-auto p-4'
        style={{
           top: `${HEADER_HEIGHT_PX}px`,
           left: `${contentLeftOffset}px`,
           transition: 'left 300ms ease-in-out',
           zIndex: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}