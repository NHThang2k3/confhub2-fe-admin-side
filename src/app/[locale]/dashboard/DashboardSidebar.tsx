// src/app/[locale]/dashboard/DashboardSidebar.tsx

'use client';

import React from 'react';
import { useTranslations } from 'next-intl'; // Keep import
import { Link } from '@/src/navigation'; // Ensure this is the next-intl Link
import { usePathname } from 'next/navigation';
import GlobeIcon from '@/src/app/icons/globe'; // Assuming this is a React component

interface MenuItem {
  label: string;
  icon: JSX.Element;
  hrefSegment: string;
}

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  locale: string; // Keep locale prop
  sidebarWidth: number;
  headerHeight: number;
}

export default function DashboardSidebar({ isSidebarOpen, locale, sidebarWidth, headerHeight }: DashboardSidebarProps) {
  // Call useTranslations hook (already present)
  const t = useTranslations(''); // Using the default namespace

  const pathname = usePathname();

  // Define menu items using the translated labels
  const menuItems: MenuItem[] = [
    {
      // Label already uses t()
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
      // Label already uses t()
      label: t('Moderation.Moderation'),
      icon: (
         <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-airplay-icon lucide-airplay'>
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      ),
      hrefSegment: 'moderation'
    },
    //  {
    //   label: t('Notifications'),
    //   icon: (
    //     <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-bell-ring'>
    //       <path d='M10.268 21a2 2 0 0 0 3.464 0' />
    //       <path d='M22 8c0-2.3-.8-4.3-2-6' />
    //       <path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' />
    //       <path d='M4 2C2.8 3.7 2 5.7 2 8' />
    //     </svg>
    //   ),
    //   hrefSegment: 'notification'
    // },
    {
      // Label already uses t()
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
      // Label already uses t()
      label: t('Conferences'),
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-airplay-icon lucide-airplay'>
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      ),
      hrefSegment: 'conferences'
    },
    {
      // Label already uses t()
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
             {/* Translate the title */}
             <strong className='text-sm font-bold whitespace-nowrap text-foreground'>
               {t('GlobalConferenceHub_Title')} {/* <-- Translated */}
             </strong>
           </div>
       </div>

      <nav className='w-full py-2'>
        <ul className='w-full'>
          {menuItems.map(item => {
            const href = `/dashboard/${item.hrefSegment}`;
            // Construct the full path including locale for accurate checking
            const fullHrefForCheck = `/${locale}${href}`; // Corrected path construction

            // Check if the current pathname starts with the item's full path (including locale)
            // and potentially handles trailing slashes if needed, although startsWith is usually sufficient
            const isActive = pathname === fullHrefForCheck || pathname.startsWith(`${fullHrefForCheck}/`);


            return (
              <li className='w-full' key={item.hrefSegment}>
                <Link
                   href={href}
                   locale={locale} // Pass locale to the Link component
                  className={`
                    flex h-12 w-full items-center px-4
                    transition-all duration-200 ease-in-out
                    border-l-4
                    ${
                      isActive
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
                        className: `${item.icon.props.className || ''} ${isActive ? 'text-primary dark:text-primary-foreground' : 'text-gray-600 dark:text-gray-300'}`
                    })}
                  </span>
                  {/* Text span */}
                  <span className={`whitespace-nowrap text-sm ${isSidebarOpen ? '' : 'hidden'}`}>
                      {item.label} {/* Label is already translated */}
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