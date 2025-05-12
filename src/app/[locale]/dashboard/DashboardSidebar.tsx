'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import { usePathname } from 'next/navigation';
import GlobeIcon from '@/src/app/icons/globe';

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

  // ... menuItems remain the same
   const menuItems: MenuItem[] = [
    {
      label: t('Analysis'),
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-airplay-icon lucide-airplay'>
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      ),
      hrefSegment: 'logAnalysis'
    },
    {
      label: t('Moderation'),
      icon: (
         <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-airplay-icon lucide-airplay'>
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      ),
      hrefSegment: 'moderation'
    },
     {
      label: t('Notifications'),
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-bell-ring'>
          <path d='M10.268 21a2 2 0 0 0 3.464 0' />
          <path d='M22 8c0-2.3-.8-4.3-2-6' />
          <path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' />
          <path d='M4 2C2.8 3.7 2 5.7 2 8' />
        </svg>
      ),
      hrefSegment: 'notification'
    },
    {
      label: t('Profile'),
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-circle-user-round'>
          <path d='M18 20a6 6 0 0 0-12 0' />
          <circle cx='12' cy='10' r='4' />
          <circle cx='12' cy='12' r='10' />
        </svg>
      ),
      hrefSegment: 'profile'
    },
    {
      label: t('Request_Admin'),
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-airplay-icon lucide-airplay'>
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      ),
      hrefSegment: 'requestAdminTab'
    },
  ];

  const basePath = `/${locale}/dashboard`;

  // Use conditional classes/styles for the transition
  const sidebarClasses = `
    fixed top-0 left-0
    h-screen
    overflow-y-auto
    transition-transform duration-300 ease-in-out /* Animate transform */
    bg-background
    shadow-md
    z-20
    w-[${sidebarWidth}px] /* <-- Sidebar always has its full width */
    ${isSidebarOpen ? 'translate-x-0' : `-translate-x-full`} /* Animate translateX */
  `;

  // Styles for internal content visibility/opacity
  const contentStyles = {
    opacity: isSidebarOpen ? 1 : 0,
    pointerEvents: isSidebarOpen ? 'auto' : 'none',
    // Use visibility for smoother transitions than display: none
    visibility: isSidebarOpen ? 'visible' : 'hidden',
  };


  return (
    <aside className={sidebarClasses}>
       {/* Logo and Title area */}
       {/* Apply contentStyles and keep display flex */}
       <div
          className='flex items-center p-2 border-b border-gray-200 dark:border-gray-700  transition-opacity duration-300 ease-in-out' // Added transition for opacity
          style={{
             ...contentStyles, // Apply visibility, opacity, pointer-events
             height: `${headerHeight}px`,
             display: 'flex', // Keep display flex for layout
          } as React.CSSProperties}
       >
           <div className='flex items-center w-full'>
             <div className='h-8 w-8 mr-2'>
               <GlobeIcon />
             </div>
             <strong className='text-sm font-bold whitespace-nowrap text-foreground'>
               Global Conference Hub
             </strong>
           </div>
       </div>

      <nav className='w-full py-2'>
        <ul className='w-full'>
          {menuItems.map(item => {
            const href = `/dashboard/${item.hrefSegment}`;
            const fullHrefForCheck = `${basePath}/${item.hrefSegment}`;
            const isActive = pathname.startsWith(fullHrefForCheck);

            return (
              <li className='w-full' key={item.hrefSegment}>
                <Link
                   href={href}
                   locale={locale}
                  className={`
                    flex h-12 w-full items-center px-4
                    transition-all duration-200 ease-in-out /* Animate all relevant properties */
                    border-l-4
                    ${
                      isActive
                        ? 'border-primary bg-accent text-accent-foreground font-bold'
                        : 'border-transparent text-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  // Apply contentStyles and keep display flex
                  style={{
                     ...contentStyles, // Apply visibility, opacity, pointer-events
                     display: 'flex', // Keep display flex for layout
                  } as React.CSSProperties}
                >
                  {/* Icon span with margin transition */}
                  <span className={`${isSidebarOpen ? 'mr-2' : 'mr-0'} transition-margin duration-300 ease-in-out`}>
                    {React.cloneElement(item.icon, {
                        className: `${item.icon.props.className || ''} ${isActive ? 'text-primary dark:text-primary-foreground' : 'text-gray-600 dark:text-gray-300'}`
                    })}
                  </span>
                  {/* Text span - Still conditionally rendered based on width */}
                  {/* Could also transition opacity here if preferred */}
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