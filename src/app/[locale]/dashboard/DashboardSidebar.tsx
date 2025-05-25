// src/app/[locale]/dashboard/DashboardSidebar.tsx

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import { usePathname } from 'next/navigation';
import GlobeIcon from '@/src/app/icons/globe'; // Assuming this is still a custom React component for your logo

// Import React Icons
import {
  FaDatabase, // For Crawl/Analysis (something related to data/processing)
  FaChartBar, // Alternative for Analysis
  FaShieldAlt, // For Moderation
  FaBookOpen, // For Conferences (something related to documents/knowledge)
  FaKey, // For Request_Admin
} from 'react-icons/fa'; // Using Font Awesome icons from react-icons

interface MenuItem {
  label: string;
  icon: JSX.Element;
  hrefSegment: string;
}

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  locale: string;
  sidebarWidth: number;
  headerHeight: number;
}

export default function DashboardSidebar({ isSidebarOpen, locale, sidebarWidth, headerHeight }: DashboardSidebarProps) {
  const t = useTranslations('');

  const pathname = usePathname();

  // Define menu items using React Icons
  const menuItems: MenuItem[] = [
    {
      label: t('Crawl'),
      icon: <FaDatabase className="h-5 w-5" />, // Icon for Crawl (data collection)
      hrefSegment: 'crawl'
    },
    {
      label: t('Analysis'),
      icon: <FaChartBar className="h-5 w-5" />, // Icon for Analysis (charts/reports)
      hrefSegment: 'logAnalysis'
    },
    {
      label: t('Moderation.Moderation'),
      icon: <FaShieldAlt className="h-5 w-5" />, // Icon for Moderation (security/control)
      hrefSegment: 'moderation'
    },
    {
      label: t('Conferences'),
      icon: <FaBookOpen className="h-5 w-5" />, // Icon for Conferences (documents/library)
      hrefSegment: 'conferences'
    },
    // {
    //   label: t('Request_Admin'),
    //   icon: <FaKey className="h-5 w-5" />, // Icon for Request_Admin (key/access)
    //   hrefSegment: 'requestAdminTab'
    // },
  ];

  const basePath = `/${locale}/dashboard`;

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
            const href = `/dashboard/${item.hrefSegment}`;
            const fullHrefForCheck = `/${locale}${href}`;
            const isActive = pathname === fullHrefForCheck || pathname.startsWith(`${fullHrefForCheck}/`);

            return (
              <li className='w-full' key={item.hrefSegment}>
                <Link
                  href={href}
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
                  {/* Direct use of React Icon component */}
                  <span className={`${isSidebarOpen ? 'mr-2' : 'mr-0'} transition-margin duration-300 ease-in-out`}>
                    {/* React Icons automatically handle sizing and color via className */}
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