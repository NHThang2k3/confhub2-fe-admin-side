// src/app/[locale]/dashboard/DashboardSidebar.tsx

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, AppPathname } from '@/src/navigation';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/src/contexts/SidebarContext'; // CHANGE: Import useSidebar

// Import React Icons (giữ nguyên)
import {
  FaDatabase,
  FaChartBar,
  FaShieldAlt,
  FaBookOpen,
  FaUser,
  FaPaperPlane
} from 'react-icons/fa';

interface MenuItem {
  label: string;
  icon: JSX.Element;
  href: AppPathname;
}

interface DashboardSidebarProps {
  // REMOVED: isSidebarOpen không còn được truyền qua props
  locale: string;
  sidebarWidth: number;
  headerHeight: number;
}

export default function DashboardSidebar({ locale, sidebarWidth, headerHeight }: DashboardSidebarProps) {
  const t = useTranslations('');
  const currentPathname = usePathname();
  const { isSidebarOpen } = useSidebar(); // CHANGE: Lấy trạng thái từ context

  const menuItems: MenuItem[] = [
    // ... (mảng menuItems giữ nguyên)
    {
      label: t('Crawl'),
      icon: <FaDatabase className="h-5 w-5" />,
      href: '/dashboard/crawl',
    },
    {
      label: t('Cron'),
      icon: <FaChartBar className="h-5 w-5" />,
      href: '/dashboard/cron',
    },
    {
      label: t('Analysis'),
      icon: <FaChartBar className="h-5 w-5" />,
      href: '/dashboard/logAnalysis',
    },
    {
      label: t('Moderation.Moderation'),
      icon: <FaShieldAlt className="h-5 w-5" />,
      href: '/dashboard/moderation',
    },
    {
      label: t('Conferences'),
      icon: <FaBookOpen className="h-5 w-5" />,
      href: '/dashboard/conferences',
    },
    {
      label: t('Submit_Paper_Admin'),
      icon: <FaPaperPlane className="h-5 w-5" />,
      href: '/dashboard/submitPapers',
    },
    {
      label: t('Accounts'),
      icon: <FaUser className="h-5 w-5" />,
      href: '/dashboard/accounts/users',
    },
  ];

  // CHANGE: Cập nhật class để khớp với client pattern
  const sidebarClasses = `
    fixed left-0
    overflow-y-auto
    transition-transform duration-300 ease-in-out
    bg-background
    shadow-md
    z-30 // CHANGE: Tăng z-index để nằm trên overlay
    w-[var(--sidebar-width)]
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  // CHANGE: Áp dụng style để sidebar nằm dưới header, giống client
  const sidebarStyles: React.CSSProperties & {
    '--sidebar-width': string;
  } = {
    '--sidebar-width': `${sidebarWidth}px`,
    top: `${headerHeight}px`,
    height: `calc(100vh - ${headerHeight}px)`,
  };
  
  // REMOVED: contentStyles không còn cần thiết

  return (
    <aside
      className={sidebarClasses}
      style={sidebarStyles} // CHANGE: Sử dụng style object
    >
      {/* REMOVED: Phần Logo và Title đã được chuyển ra Header chung */}

      {/* CHANGE: Thêm <nav> và transition opacity giống client */}
      <nav className={`h-full overflow-y-auto transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
        <ul className='w-full py-2'>
          {menuItems.map(item => {
            const fullHrefForCheck = `/${locale}${item.href}`;
            const isActive = currentPathname === fullHrefForCheck || currentPathname.startsWith(`${fullHrefForCheck}/`);

            return (
              <li className='w-full' key={item.href}>
                <Link
                  href={item.href}
                  locale={locale}
                  className={`
                    flex h-12 w-full items-center px-4
                    transition-all duration-200 ease-in-out
                    border-l-4
                    ${isActive
                      ? 'border-primary bg-accent text-accent-foreground font-bold'
                      : 'border-transparent text-foreground hover:bg-gray-100 '
                    }
                  `}
                  // REMOVED: Inline style không cần thiết nữa
                >
                  {/* CHANGE: Đơn giản hóa cấu trúc span, giống client */}
                  <span className="mr-3">
                    {React.cloneElement(item.icon, {
                      className: `${item.icon.props.className || ''} ${isActive ? 'text-primary' : 'text-gray-600 '}`
                    })}
                  </span>
                  
                  <span className="whitespace-nowrap text-sm">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}