// 'use client'; // <-- Already present

import { FC, useRef, useState, useEffect } from 'react'
// Import useTranslations
import { useTranslations } from 'next-intl'; // <-- Added import

import { useSocketConnection } from '../../../hooks/header/useSocketConnection' // Assuming this hook handles its own logic
import { useClickOutside } from '../../../hooks/header/useClickOutsideHeader' // Assuming this hook handles its own logic
import { useMenuState } from '../../../hooks/header/useMenuState' // Assuming this hook handles its own logic

// Assuming these are components that will handle their own translations internally
import NotificationDropdown from './header/NotificationDropdown'
import UserDropdown from './header/UserDropdown'
import AuthButtons from './header/AuthButtons'
import DesktopNavigation from './header/DesktopNavigation'
import LoadingIndicator from './header/LoadingIndicator' // Assuming this component handles its own text translation

import useAuthApi from '../../../hooks/auth/useAuthApi' // Assuming this hook handles its own logic

// Define props including the new ones for sidebar toggle and width
interface Props {
  locale: string; // Keep locale prop
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  headerHeight: number;
  sidebarWidth: number;
}

export const Header: FC<Props> = ({
  locale, // Destructure locale
  toggleSidebar,
  isSidebarOpen,
  headerHeight,
  sidebarWidth
}) => {
  const headerRef = useRef<HTMLDivElement>(null);

  // Call the useTranslations hook
  const t = useTranslations(''); // <-- Added hook call (using the default namespace)

  const { user, isLoggedIn, logout } = useAuthApi();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect simply sets isLoading to false after the initial render.
    // If useAuthApi has its own loading state for the *initial* check,
    // you might want to use that instead for a more accurate loading indicator.
    // For now, keeping the original logic here.
    setIsLoading(false);
  }, []); // Empty dependency array runs once on mount

  const {
    notifications,
    notificationEffect, // Seems unused in Header's JSX directly
    markAllAsRead,
    fetchNotifications,
    isLoadingNotifications,
    socketRef
  } = useSocketConnection({ loginStatus: isLoggedIn ? 'true' : null, user });

  const {
    isNotificationOpen,
    isUserDropdownOpen,
    closeAllMenus,
    openNotification,
    openUserDropdown,
  } = useMenuState();

  // Allow clicking outside the headerRef *unless* it's inside a notification dropdown element
  // The hook useClickOutside handles its own logic and doesn't need translation here.
  useClickOutside(headerRef, closeAllMenus, 'notification-dropdown');


  const unreadCount = () => {
    const unread = notifications.filter(
      n => n.seenAt === null && n.deletedAt === null
    ).length
    return unread > 20 ? '20+' : unread
  }

  const displayedNotifications = notifications.slice(0, 20);

  // --- Sidebar Toggle Icons ---
  // Keep the icons the same, they don't contain text
   const MenuIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='lucide lucide-menu text-gray-700 dark:text-gray-300'
    >
      <line x1='4' x2='20' y1='12' y2='12' />
      <line x1='4' x2='20' y1='6' y2='6' />
      <line x1='4' x2='20' y1='18' y2='18' />
    </svg>
  );

  const CloseIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-x text-gray-700 dark:text-gray-300'>
      <line x1='18' x2='6' y1='6' y2='18' />
      <line x1='6' x2='18' y1='6' y2='18' />
    </svg>
  );
  // --- End Sidebar Toggle Icons ---

  // Calculate dynamic styles based on sidebar state
  const headerLeft = isSidebarOpen ? sidebarWidth : 0;
  const headerWidth = `calc(100% - ${headerLeft}px)`;

  return (
    // Main Header div - Fixed with dynamic left and width
    <div
      ref={headerRef}
      className='fixed top-0 z-10 flex flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 text-sm shadow-md transition-all duration-300 ease-in-out'
      style={{
        height: `${headerHeight}px`,
        left: `${headerLeft}px`,
        width: headerWidth,
      }}
    >
      {/* Left section: Toggle Button */}
      <div className='flex items-center gap-2 ml-2'>
        <button
          onClick={toggleSidebar}
          className='p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200'
          // Translate aria-label for accessibility readers
          aria-label={isSidebarOpen ? t('Header_AriaLabel_CloseSidebar') : t('Header_AriaLabel_OpenSidebar')} 
        >
          {isSidebarOpen ? CloseIcon : MenuIcon}
        </button>
      </div>

      {/* Right section: Navigation, Auth/User, Notifications */}
      <div className='relative flex flex-row items-center gap-2 md:gap-4 mr-2'>
        {/* DesktopNavigation is expected to handle its own translations */}
        <DesktopNavigation locale={locale} />

        {/* Loading state - LoadingIndicator is expected to handle its own translation */}
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          // AuthButtons is expected to handle its own translations
          <AuthButtons
            isLogin={isLoggedIn}
            locale={locale}
            toggleNotification={() => openNotification()}
            toggleUserDropdown={() => openUserDropdown()}
            notificationEffect={notificationEffect}
            unreadCount={unreadCount()}
          />
        )}

        {/* NotificationDropdown is expected to handle its own translations */}
        <NotificationDropdown
          notifications={displayedNotifications}
          isNotificationOpen={isNotificationOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          fetchNotifications={fetchNotifications}
          isLoadingNotifications={isLoadingNotifications}
          markAllAsRead={markAllAsRead}
        />
        {/* UserDropdown is expected to handle its own translations (already confirmed it does) */}
        <UserDropdown
          isUserDropdownOpen={isUserDropdownOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          logout={logout}
          socketRef={socketRef}
        />
      </div>
    </div>
  );
};

export default Header;