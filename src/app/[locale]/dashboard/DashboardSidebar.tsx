'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, AppPathname } from '@/src/navigation';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/src/contexts/SidebarContext';

// Import React Icons
import {
  FaDatabase,
  FaChartBar,
  FaShieldAlt,
  FaBookOpen,
  FaUser,
  FaPaperPlane,
  FaClock,
  FaRobot // <<< THÊM MỚI: Icon cho Chatbot
} from 'react-icons/fa';

interface MenuItem {
  label: string;
  icon: JSX.Element;
  href: AppPathname;
}

interface DashboardSidebarProps {
  locale: string;
  sidebarWidth: number;
  headerHeight: number;
}

export default function DashboardSidebar({ locale, sidebarWidth, headerHeight }: DashboardSidebarProps) {
  const t = useTranslations('');
  const currentPathname = usePathname();
  const { isSidebarOpen } = useSidebar();

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
    // <<< THÊM MỚI: Mục Chatbot Analysis >>>
    {
      label: t('Chatbot_Analysis'), // Giả sử bạn sẽ thêm key này vào file translation
      icon: <FaRobot className="h-5 w-5" />,
      href: '/dashboard/chatbot',
    },
    // <<< KẾT THÚC THÊM MỚI >>>
    {
      label: t('Cron'),
      icon: <FaClock className="h-5 w-5" />,
      href: '/dashboard/cron',
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

  const sidebarClasses = `
    fixed left-0
    overflow-y-auto
    transition-transform duration-300 ease-in-out
    bg-background
    shadow-md
    z-30
    w-[var(--sidebar-width)]
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  const sidebarStyles: React.CSSProperties & {
    '--sidebar-width': string;
  } = {
    '--sidebar-width': `${sidebarWidth}px`,
    top: `${headerHeight}px`,
    height: `calc(100vh - ${headerHeight}px)`,
  };
  
  return (
    <aside
      className={sidebarClasses}
      style={sidebarStyles}
    >
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
                >
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