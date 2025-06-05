// src/app/[locate]/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react'; // useEffect có thể không cần thiết nữa nếu không dùng resize listener
import { Header } from '@/src/app/[locale]/utils/Header';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({
  children,
  params: { locale } // Keep locale prop
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Trạng thái sidebar chỉ được điều khiển bởi người dùng.
  // Khởi tạo là true nếu muốn sidebar mặc định mở khi tải trang.
  // Khởi tạo là false nếu muốn sidebar mặc định đóng khi tải trang.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // <--- Đặt giá trị mặc định mong muốn ở đây

  const SIDEBAR_WIDTH_PX = 208;
  const HEADER_HEIGHT_PX = 60;

  // Loại bỏ hoàn toàn useEffect lắng nghe sự kiện resize.
  // Điều này đảm bảo trạng thái isSidebarOpen không bị thay đổi tự động
  // khi kích thước màn hình thay đổi.
  // Bạn có thể giữ lại useEffect nếu bạn muốn xử lý các logic khác liên quan đến window
  // nhưng không ảnh hưởng đến isSidebarOpen.

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const contentLeftOffset = isSidebarOpen ? SIDEBAR_WIDTH_PX : 0;

  // LƯU Ý QUAN TRỌNG:
  // Với cách tiếp cận này, sidebar sẽ MẶC ĐỊNH LÀ MỞ (nếu useState(true))
  // ngay cả trên thiết bị di động. Bạn sẽ cần đảm bảo UI của bạn xử lý tốt điều này,
  // hoặc điều chỉnh thiết kế để ẩn/hiện sidebar trên mobile một cách hợp lý
  // mà không phụ thuộc vào kích thước màn hình trong logic JS.
  // Ví dụ: trên mobile, bạn có thể muốn Sidebar luôn ở dạng overlay và Header có nút hamburger.

  return (
    <div className='relative min-h-screen bg-background'>

      {/* Dashboard Sidebar - Receives locale but handles its own translations */}
      <DashboardSidebar
          isSidebarOpen={isSidebarOpen} // isSidebarOpen giờ chỉ thay đổi khi người dùng toggle
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