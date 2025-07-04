// src/app/[locale]/utils/Header.tsx 

'use client';

import { FC, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation'; // ADDED: For logo link
import { useAuth } from '@/src/contexts/AuthContext';
import { useSidebar } from '@/src/contexts/SidebarContext'; // ADDED: Import the sidebar context hook
import { useClickOutside } from '../../../hooks/header/useClickOutsideHeader';
import { useMenuState } from '../../../hooks/header/useMenuState';

import NotificationDropdown from './header/NotificationDropdown';
import UserDropdown from './header/UserDropdown';
import AuthButtons from './header/AuthButtons';
import DesktopNavigation from './header/DesktopNavigation';
import LoadingIndicator from './header/LoadingIndicator';
import GlobeIcon from '@/src/app/icons/globe'; // ADDED: Import the logo icon

// Props interface is simplified
interface Props {
  locale: string;
  headerHeight: number;
  // REMOVED: toggleSidebar, isSidebarOpen, sidebarWidth are no longer needed
}

export const Header: FC<Props> = ({
  locale,
  headerHeight,
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('');

  // ADDED: Get sidebar state and toggle function from the context
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const {
    user,
    isLoggedIn,
    logout,
    isInitializing,
    isLoading: authOperationIsLoading,
  } = useAuth();

  const {
    isNotificationOpen,
    isUserDropdownOpen,
    closeAllMenus,
    openNotification,
    openUserDropdown,
  } = useMenuState();

  useClickOutside(headerRef, closeAllMenus, 'notification-dropdown');

  // --- Icons (can be moved to a separate file if preferred) ---
  const MenuIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu h-5 w-5 text-gray-700 dark:text-gray-300">
      <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );

  const CloseIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-5 w-5 text-gray-700 dark:text-gray-300">
      <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );

  // REMOVED: headerLeft and headerWidth calculations are no longer needed.

  return (
    <header
      ref={headerRef}
      // CHANGED: Simplified classes and style. Header is now always full-width.
      className="fixed top-0 left-0 z-40 flex w-full flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 text-sm shadow-md"
      style={{
        height: `${headerHeight}px`, // Height is the only remaining style prop
      }}
    >
      {/* --- Left Section: Toggle Button and Logo --- */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar} // Uses toggleSidebar from context
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
          aria-label={
            isSidebarOpen
              ? t('Header_AriaLabel_CloseSidebar')
              : t('Header_AriaLabel_OpenSidebar')
          }
        >
          {/* Uses isSidebarOpen from context */}
          {isSidebarOpen ? CloseIcon : MenuIcon}
        </button>

        {/* ADDED: Logo and Title, moved from the old sidebar */}
        <Link href='/dashboard/logAnalysis' locale={locale} className='flex items-center'>
          <div className='h-8 w-8 mr-2'>
            <GlobeIcon />
          </div>
          <strong className='text-sm font-bold whitespace-nowrap text-foreground hidden md:block'>
            {t('GlobalConferenceHub_Title')}
          </strong>
        </Link>
      </div>

      {/* --- Right Section: Navigation and User Actions (largely unchanged) --- */}
      <div className="relative flex flex-row items-center gap-2 md:gap-4 mr-2">
        <DesktopNavigation locale={locale} />

        {isInitializing ? (
          <LoadingIndicator />
        ) : (
          <AuthButtons
            isLogin={isLoggedIn}
            locale={locale}
            toggleNotification={() => openNotification()}
            toggleUserDropdown={() => openUserDropdown()}
          />
        )}

        <NotificationDropdown
          isNotificationOpen={isNotificationOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
        />
        <UserDropdown
          isUserDropdownOpen={isUserDropdownOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          logout={logout}
        />
      </div>
    </header>
  );
};

export default Header;