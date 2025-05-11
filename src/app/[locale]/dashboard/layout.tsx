// src/app/[locale]/dashboard/layout.tsx
'use client'; // Needs client-side state and hooks

import React, { useState, useEffect } from 'react';
import { Header } from '@/src/app/[locale]/utils/Header'; // Assuming Header path
import DashboardSidebar from './DashboardSidebar';

// Define the props for the layout component, including children and params
export default function DashboardLayout({
  children,
  params: { locale } // Access locale from params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set initial sidebar state based on screen size after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Open sidebar by default on desktop sizes (md breakpoint, 768px)
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }

      // Optional: Add a resize listener if you want it to dynamically change
      const handleResize = () => {
          if (window.innerWidth >= 768) {
              setIsSidebarOpen(true);
          } else {
              // Decide if you want to close it on smaller screens when resizing
              // setIsSidebarOpen(false);
          }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Header height constant (adjust as needed)
  const HEADER_HEIGHT_PX = 72; // Example height, adjust based on your Header

  return (
    // Use a fragment <> or a div if you need a root element wrapper for styling
    <>
      {/* Assuming Header is part of the dashboard layout */}
      <Header locale={locale} />

      <div
        className='mx-0 flex min-h-screen px-0'
        style={{ paddingTop: `${HEADER_HEIGHT_PX}px` }} // Add padding equal to header height
      >
        {/* Pass sidebar state and toggle function to the Sidebar component */}
        <DashboardSidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            locale={locale} // Pass locale if needed inside Sidebar
        />

        {/* Main content area - scrolls independently */}
        <main
          className={`
                container flex min-h-screen flex-1 overflow-y-auto px-2 m-0 transition-all duration-300 ease-in-out
            `}
        >
          {/* This is where the content of nested page.tsx files will be rendered */}
          {children}
        </main>
      </div>
    </>
  );
}