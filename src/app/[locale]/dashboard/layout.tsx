// src/app/[locale]/dashboard/layout.tsx

'use client';

import React from 'react';
import { Header } from '@/src/app/[locale]/utils/Header'; // Giả định Header đã được cập nhật để dùng useSidebar
import DashboardSidebar from './DashboardSidebar';
import { useSidebar } from '@/src/contexts/SidebarContext'; // CHANGE: Import useSidebar

export default function DashboardLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const SIDEBAR_WIDTH_PX = 208;
  const HEADER_HEIGHT_PX = 60;

  // CHANGE: Lấy trạng thái và hàm toggle từ context, không dùng useState cục bộ nữa
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  // CHANGE: Sử dụng CSS variables, giống hệt pattern của client
  const layoutStyles: React.CSSProperties & {
    '--sidebar-width': string;
    '--header-height': string;
  } = {
    '--sidebar-width': `${SIDEBAR_WIDTH_PX}px`,
    '--header-height': `${HEADER_HEIGHT_PX}px`,
  };

  return (
    // CHANGE: Cấu trúc layout flex, giống client
    <div 
      className='relative flex min-h-screen bg-muted/40'
      style={layoutStyles}
    >
      {/* CHANGE: Thêm lớp phủ (overlay) cho màn hình mobile, giống client */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Header sẽ nằm trên cùng và chiếm toàn bộ chiều rộng */}
      <Header
          locale={locale}
          // REMOVED: Không cần truyền isSidebarOpen và toggleSidebar nữa
          // Header sẽ tự lấy chúng từ useSidebar()
          headerHeight={HEADER_HEIGHT_PX}
      />

      {/* Sidebar sẽ nhận các props cần thiết */}
      <DashboardSidebar
          locale={locale}
          sidebarWidth={SIDEBAR_WIDTH_PX}
          headerHeight={HEADER_HEIGHT_PX}
          // REMOVED: Không cần truyền isSidebarOpen nữa
      />

      {/* Main Content (children pages) */}
      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          w-full
          mt-[var(--header-height)] // CHANGE: Đẩy content xuống dưới Header
          ${isSidebarOpen 
            ? 'lg:pl-[var(--sidebar-width)]' // CHANGE: Chỉ đẩy content trên màn hình lớn
            : 'lg:pl-0'
          }
        `}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}