import { FC, useRef, useState, useEffect } from 'react'
import { Link } from '@/src/navigation'
import LogoIcon from '../../icons/logo'
import { useSocketConnection } from '../../../hooks/header/useSocketConnection'
import { useClickOutside } from '../../../hooks/header/useClickOutsideHeader'
import { useMenuState } from '../../../hooks/header/useMenuState'
import NotificationDropdown from './header/NotificationDropdown'
import UserDropdown from './header/UserDropdown'
import MobileNavigation from './header/MobileNavigation'
import AuthButtons from './header/AuthButtons'
import DesktopNavigation from './header/DesktopNavigation'
import LoadingIndicator from './header/LoadingIndicator'
import { MenuIcon, CloseIcon } from './header/Icon'
import Button from './Button'
import useAuthApi from '../../../hooks/auth/useAuthApi'
import GlobeIcon from '../../icons/globe'

interface Props {
  locale: string
}

export const Header: FC<Props> = ({ locale }) => {
  const headerRef = useRef<HTMLDivElement>(null)
  // const isMobile = useMediaQuery({ maxWidth: 768 })

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
    isMobileMenuOpen,
    isUserDropdownOpen,
    closeAllMenus,
    toggleMobileMenu,
    openNotification,
    openUserDropdown,
    openMobileMenu // Added for mobile menu
  } = useMenuState()

  useClickOutside(headerRef, closeAllMenus, 'notification-dropdown') // Changed function

  const unreadCount = () => {
    const unread = notifications.filter(
      n => n.seenAt === null && n.deletedAt === null
    ).length
    return unread > 20 ? '20+' : unread
  }

  const displayedNotifications = notifications.slice(0, 20)

  return (
    <div
      ref={headerRef}
      className={`fixed left-0 right-0 top-0 z-40 mx-auto flex h-[60px] max-w-screen-2xl flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 text-sm shadow-md transition-all duration-300 ease-in-out`}
    >
      <Link href='/' locale={locale}>
        <div className='flex flex-row items-center '>
          <div className='mb-2 h-8 w-8'>
            {/* <LogoIcon /> */}
            <GlobeIcon />
          </div>
          <strong className='mx-2 hidden select-none md:block'>
            Global Conference Hub
          </strong>
        </div>
      </Link>

      <div className='relative flex flex-row items-center gap-2 md:gap-4'>
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

        <Button
          className='block lg:hidden'
          onClick={e => {
            e.stopPropagation()
            openMobileMenu()
          }}
        >
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </Button>

        <MobileNavigation
          isMobileMenuOpen={isMobileMenuOpen}
          closeAllMenus={closeAllMenus} // Keep closing all
          locale={locale}
          isLogin={isLoggedIn}
        />
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
