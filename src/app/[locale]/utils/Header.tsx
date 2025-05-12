'use client';

import { FC, useRef, useState, useEffect } from 'react'
import { useSocketConnection } from '../../../hooks/header/useSocketConnection'
import { useClickOutside } from '../../../hooks/header/useClickOutsideHeader'
import { useMenuState } from '../../../hooks/header/useMenuState'
import NotificationDropdown from './header/NotificationDropdown'
import UserDropdown from './header/UserDropdown'
import AuthButtons from './header/AuthButtons'
import DesktopNavigation from './header/DesktopNavigation'
import LoadingIndicator from './header/LoadingIndicator'
import useAuthApi from '../../../hooks/auth/useAuthApi'

// Define props including the new ones for sidebar toggle and width
interface Props {
  locale: string;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  headerHeight: number;
  sidebarWidth: number; // <-- Receive sidebar width
}

export const Header: FC<Props> = ({
  locale,
  toggleSidebar,
  isSidebarOpen,
  headerHeight,
  sidebarWidth // <-- Destructure sidebar width
}) => {
  const headerRef = useRef<HTMLDivElement>(null)

  const { user, isLoggedIn, logout } = useAuthApi()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const {
    notifications,
    notificationEffect,
    markAllAsRead,
    fetchNotifications,
    isLoadingNotifications,
    socketRef
  } = useSocketConnection({ loginStatus: isLoggedIn ? 'true' : null, user })

  const {
    isNotificationOpen,
    isUserDropdownOpen,
    closeAllMenus,
    openNotification,
    openUserDropdown,
  } = useMenuState()

  // Allow clicking outside the headerRef *unless* it's inside a notification dropdown element
  useClickOutside(headerRef, closeAllMenus, 'notification-dropdown')


  const unreadCount = () => {
    const unread = notifications.filter(
      n => n.seenAt === null && n.deletedAt === null
    ).length
    return unread > 20 ? '20+' : unread
  }

  const displayedNotifications = notifications.slice(0, 20)

  // --- Sidebar Toggle Icons ---
  // Keep the icons the same
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
  const headerWidth = `calc(100% - ${headerLeft}px)`; // Header width is viewport width minus sidebar width

  return (
    // Main Header div - Now Fixed with dynamic left and width
    <div
      ref={headerRef}
      className='fixed top-0 z-10 flex flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 text-sm shadow-md transition-all duration-300 ease-in-out'
      style={{
        height: `${headerHeight}px`,
        left: `${headerLeft}px`,     // Dynamic left position
        width: headerWidth,           // Dynamic width
      }}
    >
      {/* Left section: Only the Toggle Button */}
      <div className='flex items-center gap-2 ml-2'>
        <button
          onClick={toggleSidebar}
          className='p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200'
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? CloseIcon : MenuIcon}
        </button>
      </div>

      {/* Right section: Navigation, Auth/User, Notifications */}
      <div className='relative flex flex-row items-center gap-2 md:gap-4 mr-2'>
        <DesktopNavigation locale={locale} />

        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <AuthButtons
            isLogin={isLoggedIn}
            locale={locale}
            toggleNotification={() => openNotification()}
            toggleUserDropdown={() => openUserDropdown()}
            notificationEffect={notificationEffect}
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
          logout={logout}
          socketRef={socketRef}
        />
      </div>
    </div>
  )
}

export default Header