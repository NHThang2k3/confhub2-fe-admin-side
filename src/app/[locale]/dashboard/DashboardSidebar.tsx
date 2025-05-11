// src/components/dashboard/DashboardSidebar.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation'; // Assuming this is your next-intl Link
import { usePathname } from 'next/navigation'; // Import usePathname

interface MenuItem {
  page: string; // Internal identifier (unused in the new Link approach)
  label: string; // Localized label
  icon: JSX.Element; // Icon component
  hrefSegment: string; // The path segment for this tab (e.g., 'logAnalysis')
}

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  locale: string; // Still need locale to pass to Link and for context
}

export default function DashboardSidebar({ isSidebarOpen, toggleSidebar, locale }: DashboardSidebarProps) {
  const t = useTranslations('');
  const pathname = usePathname(); // Get current pathname to determine active link

  // Define menu items with their corresponding href segments
  // NOTE: The hrefSegment should correspond to the folder name within /[locale]/dashboard/
  const menuItems: MenuItem[] = [
    {
      page: 'Analysis', // Can be removed or ignored now
      label: t('Analysis'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252' // Consider using Tailwind classes or props for color
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-airplay-icon lucide-airplay'
        >
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      ),
      hrefSegment: 'logAnalysis' // Matches folder name
    },
    {
      page: 'Moderation', // Can be removed or ignored now
      label: t('Moderation'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-airplay-icon lucide-airplay'
        >
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      ),
      hrefSegment: 'moderation'
    },
     {
      page: 'Notifications', // Can be removed or ignored now
      label: t('Notifications'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-bell-ring'
        >
          <path d='M10.268 21a2 2 0 0 0 3.464 0' />
          <path d='M22 8c0-2.3-.8-4.3-2-6' />
          <path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' />
          <path d='M4 2C2.8 3.7 2 5.7 2 8' />
        </svg>
      ),
      hrefSegment: 'notification' // Matches folder name
    },
    {
      page: 'Profile', // Can be removed or ignored now
      label: t('Profile'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-circle-user-round '
        >
          <path d='M18 20a6 6 0 0 0-12 0' />
          <circle cx='12' cy='10' r='4' />
          <circle cx='12' cy='12' r='10' />
        </svg>
      ),
      hrefSegment: 'profile'
    },
    {
      page: 'RequestAdminTab', // Can be removed or ignored now
      label: t('Request_Admin_Tab'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-airplay-icon lucide-airplay'
        >
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      ),
      hrefSegment: 'requestAdminTab' // Matches folder name
    },
  ];

  // Toggle icons (keep these)
  const openIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#525252'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='lucide lucide-align-justify'
    >
      <path d='M3 12h18' />
      <path d='M3 18h18' />
      <path d='M3 6h18' />
    </svg>
  );
  const closeIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#525252'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='lucide lucide-x'
    >
      <path d='M18 6 6 18' />
      <path d='m6 6 12 12' />
    </svg>
  );

  return (
    <aside
      className={`
        h-full flex-shrink-0 overflow-y-auto transition-all
        duration-300 ease-in-out scrollbar
        ${isSidebarOpen ? 'w-52' : 'w-0 md:w-16'}
        ${!isSidebarOpen && 'md:overflow-hidden'}
        bg-background // Added background color class
      `}
    >
      <nav className='w-full'>
        <ul className='w-full'>
          <li className='w-full'>
            <button
              onClick={toggleSidebar}
              className={`
                flex w-full items-center py-2
                transition-colors duration-500 ease-in-out
                hover:bg-button hover:opacity-60 focus:outline-none active:bg-blue-700
                ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0 md:px-4'}
              `}
            >
              <span className={isSidebarOpen ? 'mr-4' : ''}>
                {isSidebarOpen ? closeIcon : openIcon}
              </span>
              {isSidebarOpen && (
                <span className='whitespace-nowrap'>{t('Close')}</span>
              )}
            </button>
          </li>

          {/* Menu Items */}
          {menuItems.map(item => {
             // Construct the href WITHOUT the locale prefix
             // next-intl Link will add it based on the locale prop
            const href = `/dashboard/${item.hrefSegment}`;

             // Check if the current pathname starts with the item's *full* href (including locale)
             // This is for correctly highlighting the active link
            const fullHrefForCheck = `/${locale}${href}`; // e.g., /en/dashboard/logAnalysis
             // Use startsWith for potential nested routes within a tab if needed
            const isActive = pathname.startsWith(fullHrefForCheck);
            // Or for exact match: const isActive = pathname === fullHrefForCheck || pathname === `${fullHrefForCheck}/`;


            return (
              <li className='w-full' key={item.hrefSegment}> {/* Use hrefSegment as key if unique */}
                 {/* Use next-intl Link */}
                <Link
                   href={href} // Pass the href without locale prefix (e.g., /dashboard/logAnalysis)
                   locale={locale} // Explicitly pass the current locale
                  className={`
                    flex h-12 w-full items-center py-2
                    transition-colors duration-500 ease-in-out
                    hover:bg-button hover:opacity-60 focus:outline-none
                    ${
                      isActive // Use isActive check based on full path
                        ? 'bg-button text-button-text hover:bg-secondary'
                        : ''
                    }
                    ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0 md:px-4'}
                  `}
                >
                  {/* Icon and spacing */}
                  <span className={isSidebarOpen ? 'mr-4' : ''}>
                    {item.icon}
                  </span>
                  {isSidebarOpen && (
                    <span className='whitespace-nowrap'>{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}