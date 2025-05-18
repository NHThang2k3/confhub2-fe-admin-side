// src/app/[locale]/utils/Header.tsx 
'use client';

import { FC, useRef, useEffect } from 'react'; // Removed useState as local isLoading is removed
import { useTranslations } from 'next-intl';

// Updated AuthContext import - adjust path if necessary
import { useAuth } from '@/src/contexts/AuthContext'; // Or '../../../contexts/AuthContext' if Header is deep

import { useSocketConnection } from '../../../hooks/header/useSocketConnection';
import { useClickOutside } from '../../../hooks/header/useClickOutsideHeader';
import { useMenuState } from '../../../hooks/header/useMenuState';

import NotificationDropdown from './header/NotificationDropdown';
import UserDropdown from './header/UserDropdown';
import AuthButtons from './header/AuthButtons';
import DesktopNavigation from './header/DesktopNavigation';
import LoadingIndicator from './header/LoadingIndicator';

interface Props {
  locale: string;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  headerHeight: number;
  sidebarWidth: number;
}

export const Header: FC<Props> = ({
  locale,
  toggleSidebar,
  isSidebarOpen,
  headerHeight,
  sidebarWidth,
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations(''); // Using default namespace

  // Use AuthContext
  // isInitializing: true while AuthProvider checks initial auth state (e.g., token verification)
  // isLoading (aliased to authOperationIsLoading): true during active signIn/logout operations
  const {
    user,
    isLoggedIn,
    logout,
    isInitializing,
    isLoading: authOperationIsLoading, // Alias to avoid confusion if needed elsewhere
  } = useAuth();

  // The local isLoading state and its useEffect are no longer needed.
  // isInitializing from useAuth() will handle the initial loading display.

  const {
    notifications,
    notificationEffect,
    markAllAsRead,
    fetchNotifications,
    isLoadingNotifications,
    socketRef,
  } = useSocketConnection({ loginStatus: isLoggedIn ? 'true' : null, user });

  const {
    isNotificationOpen,
    isUserDropdownOpen,
    closeAllMenus,
    openNotification,
    openUserDropdown,
  } = useMenuState();

  useClickOutside(headerRef, closeAllMenus, 'notification-dropdown');

  const unreadCount = () => {
    const unread = notifications.filter(
      (n) => n.seenAt === null && n.deletedAt === null
    ).length;
    return unread > 20 ? '20+' : unread;
  };

  const displayedNotifications = notifications.slice(0, 20);

  const MenuIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-menu text-gray-700 dark:text-gray-300"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );

  const CloseIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-x text-gray-700 dark:text-gray-300"
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );

  const headerLeft = isSidebarOpen ? sidebarWidth : 0;
  const headerWidth = `calc(100% - ${headerLeft}px)`;

  return (
    <div
      ref={headerRef}
      className="fixed top-0 z-10 flex flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 text-sm shadow-md transition-all duration-300 ease-in-out"
      style={{
        height: `${headerHeight}px`,
        left: `${headerLeft}px`,
        width: headerWidth,
      }}
    >
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
          aria-label={
            isSidebarOpen
              ? t('Header_AriaLabel_CloseSidebar')
              : t('Header_AriaLabel_OpenSidebar')
          }
        >
          {isSidebarOpen ? CloseIcon : MenuIcon}
        </button>
      </div>

      <div className="relative flex flex-row items-center gap-2 md:gap-4 mr-2">
        <DesktopNavigation locale={locale} />

        {/* Use isInitializing to determine if auth state is ready */}
        {/* authOperationIsLoading can also be used if you want to show a loader during login/logout actions themselves,
            but for the initial display of AuthButtons, isInitializing is primary. */}
        {isInitializing ? (
          <LoadingIndicator />
        ) : (
          <AuthButtons
            isLogin={isLoggedIn} // Prop name in AuthButtons is isLogin
            locale={locale}
            toggleNotification={() => openNotification()}
            toggleUserDropdown={() => openUserDropdown()}
            notificationEffect={notificationEffect} // This was already being passed
            unreadCount={unreadCount()}
          />
        )}

        <NotificationDropdown
          notifications={displayedNotifications}
          isNotificationOpen={isNotificationOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          fetchNotifications={fetchNotifications}
          isLoadingNotifications={isLoadingNotifications}
          markAllAsRead={markAllAsRead}
        />
        <UserDropdown
          isUserDropdownOpen={isUserDropdownOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          logout={logout} // Pass the logout function from useAuth
          socketRef={socketRef}
        />
      </div>
    </div>
  );
};

export default Header;