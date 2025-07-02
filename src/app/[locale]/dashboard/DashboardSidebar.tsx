// src/app/[locale]/dashboard/DashboardSidebar.tsx

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, AppPathname } from '@/src/navigation';
import { usePathname } from 'next/navigation';
import GlobeIcon from '@/src/app/icons/globe';

// Import React Icons
import {
  FaDatabase,
  FaChartBar,
  FaShieldAlt,
  FaBookOpen,
  FaKey,
  FaUser,
  FaPaperPlane // Import icon cho Submit Paper
} from 'react-icons/fa'; // Hoặc dùng Send từ lucide-react nếu bạn muốn nhất quán

interface MenuItem {
  label: string;
  icon: JSX.Element;
  href: AppPathname;
}

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  locale: string;
  sidebarWidth: number;
  headerHeight: number;
}

export default function DashboardSidebar({ isSidebarOpen, locale, sidebarWidth, headerHeight }: DashboardSidebarProps) {
  const t = useTranslations('');
  const currentPathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      label: t('Crawl'),
      icon: <FaDatabase className="h-5 w-5" />,
      href: '/dashboard/crawl',
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
      label: t('Submit_Paper_Admin'), // Key mới cho sidebar
      icon: <FaPaperPlane className="h-5 w-5" />, // Icon mới
      href: '/dashboard/submitPapers', // Đường dẫn mới
    },
    {
      label: t('Accounts'),
      icon: <FaUser className="h-5 w-5" />,
      href: '/dashboard/accounts/users',
    },
  ];

  const sidebarClasses = `
    fixed top-0 left-0
    h-screen
    overflow-y-auto
    transition-transform duration-300 ease-in-out
    bg-background
    shadow-md
    z-20
    w-[${sidebarWidth}px]
    ${isSidebarOpen ? 'translate-x-0' : `-translate-x-full`}
  `;

  const contentStyles = {
    opacity: isSidebarOpen ? 1 : 0,
    pointerEvents: isSidebarOpen ? 'auto' : 'none',
    visibility: isSidebarOpen ? 'visible' : 'hidden',
  };

  return (
    <aside className={sidebarClasses}>
      {/* Logo and Title area */}
      <div
        className='flex items-center p-2 border-b border-gray-200 dark:border-gray-700 transition-opacity duration-300 ease-in-out'
        style={{
          ...contentStyles,
          height: `${headerHeight}px`,
          display: 'flex',
        } as React.CSSProperties}
      >
        <div className='flex items-center w-full'>
          <div className='h-8 w-8 mr-2'>
            <GlobeIcon />
          </div>
          <strong className='text-sm font-bold whitespace-nowrap text-foreground'>
            {t('GlobalConferenceHub_Title')}
          </strong>
        </div>
      </div>

      <nav className='w-full py-2'>
        <ul className='w-full'>
          {menuItems.map(item => {
            const fullHrefForCheck = `/${locale}${item.href}`;
            // Kiểm tra nếu đường dẫn hiện tại bắt đầu bằng fullHrefForCheck
            // Điều này giúp xử lý các đường dẫn con (ví dụ: /dashboard/accounts/users khi item.href là /dashboard/accounts)
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
                      : 'border-transparent text-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  style={{
                    ...contentStyles,
                    display: 'flex',
                  } as React.CSSProperties}
                >
                  <span className={`${isSidebarOpen ? 'mr-2' : 'mr-0'} transition-margin duration-300 ease-in-out`}>
                    {React.cloneElement(item.icon, {
                      className: `${item.icon.props.className || ''} ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`
                    })}
                  </span>
                  
                  <span className={`whitespace-nowrap text-sm ${isSidebarOpen ? '' : 'hidden'}`}>
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