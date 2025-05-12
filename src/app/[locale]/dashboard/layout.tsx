'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/src/app/[locale]/utils/Header';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({
  children,
  params: { locale }
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
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Calculate the left offset for the header and main content
  // This is the space the sidebar *would* occupy
  const contentLeftOffset = isSidebarOpen ? SIDEBAR_WIDTH_PX : 0;

  return (
    <div className='relative min-h-screen bg-background'>

      {/* Dashboard Sidebar - Now animated with transform */}
      <DashboardSidebar
          isSidebarOpen={isSidebarOpen}
          locale={locale}
          sidebarWidth={SIDEBAR_WIDTH_PX}
          headerHeight={HEADER_HEIGHT_PX}
      />

      {/* Header - Remains Fixed */}
      <Header
          locale={locale}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          headerHeight={HEADER_HEIGHT_PX}
          sidebarWidth={SIDEBAR_WIDTH_PX}
      />

      {/* Main Content (children pages) - Positioned below header and right of sidebar */}
      {/* Uses absolute positioning, tracking sidebar's visual position */}
      <main
        className='absolute bottom-0 right-0 overflow-y-auto p-4'
        style={{
           top: `${HEADER_HEIGHT_PX}px`, // Start below the fixed header
           // Animate the left position to make space for the sidebar sliding in
           left: `${contentLeftOffset}px`,
           transition: 'left 300ms ease-in-out', // Animate left change
           zIndex: 0, // Below header and sidebar
        }}
      >
        {children}
      </main>
    </div>
  );
}