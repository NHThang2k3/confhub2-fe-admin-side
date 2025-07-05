// src/app/[locale]/dashboard/layout.tsx

'use client';

import React from 'react';
import { Header } from '@/src/app/[locale]/utils/Header';
import DashboardSidebar from './DashboardSidebar';
import { useSidebar } from '@/src/contexts/SidebarContext';

export default function DashboardLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale:string };
}) {
  const SIDEBAR_WIDTH_PX = 208;
  const HEADER_HEIGHT_PX = 60;

  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const layoutStyles: React.CSSProperties & {
    '--sidebar-width': string;
    '--header-height': string;
  } = {
    '--sidebar-width': `${SIDEBAR_WIDTH_PX}px`,
    '--header-height': `${HEADER_HEIGHT_PX}px`,
  };

  return (
    <div 
      className='relative flex h-screen overflow-hidden bg-gray-100' // CHANGE: h-screen và overflow-hidden để khóa scroll của cả trang
      style={layoutStyles}
    >
      {/* Lớp phủ cho màn hình nhỏ khi sidebar mở */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      <Header
          locale={locale}
          headerHeight={HEADER_HEIGHT_PX}
      />

      <DashboardSidebar
          locale={locale}
          sidebarWidth={SIDEBAR_WIDTH_PX}
          headerHeight={HEADER_HEIGHT_PX}
      />

      {/* Vùng nội dung chính */}
      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          w-full
          mt-[var(--header-height)]
          overflow-y-auto // CHANGE: Thêm overflow-y-auto để vùng này tự scroll
          ${isSidebarOpen 
            ? 'lg:pl-[var(--sidebar-width)]'
            : 'lg:pl-0'
          }
        `}
      >
        {/* Giữ lại padding bên trong vùng cuộn */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}