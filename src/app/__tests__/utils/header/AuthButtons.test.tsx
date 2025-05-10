import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthButtons from '@/src/app/[locale]/utils/header/AuthButtons'

// --- Mocking Dependencies ---

// Mock useTranslations
const mockT = jest.fn(key => key) // Trả về chính key để dễ kiểm tra
jest.mock('next-intl', () => ({
  useTranslations: () => mockT
}))

// Mock usePathname
const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname()
  // Mock luôn cả Link nếu nó cũng nằm trong 'next/navigation' hoặc mock riêng nếu nó từ '@'
}))

// Mock Link component (Giả sử nó render ra thẻ <a> để dễ kiểm tra)
jest.mock('@/src/navigation', () => ({
  Link: jest.fn(({ href, lang, className, children, ...rest }) => (
    <a href={href} data-lang={lang} className={className} {...rest}>
      {children}
    </a>
  ))
}))

// Mock Icon components
jest.mock('@/src/app/[locale]/utils/header/Icon', () => ({
  // Sử dụng data-testid để dễ dàng query trong test
  NotificationIcon: jest.fn(({ notificationEffect, unreadCount }) => (
    <div
      data-testid='notification-icon'
      data-effect={notificationEffect}
      data-unread={unreadCount}
    >
      MockNotificationIcon
    </div>
  )),
  UserIcon: jest.fn(() => <div data-testid='user-icon'>MockUserIcon</div>)
}))

// --- Test Suite ---

describe('AuthButtons Component', () => {
  // Props mặc định cho các test case
  const defaultProps = {
    locale: 'vi',
    toggleNotification: jest.fn(),
    toggleUserDropdown: jest.fn(),
    notificationEffect: false,
    unreadCount: 0
  }

  // Reset mocks trước mỗi test
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/some/path') // Path mặc định
    mockT.mockImplementation(key => key) // Reset mockT về cơ bản
  })

  // --- Trường hợp Đã Đăng Nhập (isLogin = true) ---
  describe('When user is logged in (isLogin = true)', () => {
    const loggedInProps = { ...defaultProps, isLogin: true }

    it('should render Notification and User buttons', () => {
      render(<AuthButtons {...loggedInProps} />)

      // Kiểm tra sự hiện diện của các icon thông qua data-testid đã mock
      expect(screen.getByTestId('notification-icon')).toBeInTheDocument()
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()

      // Kiểm tra các button được render (vì icon nằm trong button)
      expect(screen.getAllByRole('button')).toHaveLength(2)
    })

    it('should NOT render the Login link', () => {
      render(<AuthButtons {...loggedInProps} />)
      expect(
        screen.queryByRole('link', { name: /Login/i })
      ).not.toBeInTheDocument()
    })

    it('should call toggleNotification when notification button is clicked', () => {
      render(<AuthButtons {...loggedInProps} />)
      // Tìm button chứa notification icon
      const notificationButton = screen
        .getByTestId('notification-icon')
        .closest('button')
      expect(notificationButton).toBeInTheDocument()

      fireEvent.click(notificationButton!) // Dấu ! vì ta đã assert ở trên

      expect(loggedInProps.toggleNotification).toHaveBeenCalledTimes(1)
      expect(loggedInProps.toggleUserDropdown).not.toHaveBeenCalled()
    })

    it('should call toggleUserDropdown when user button is clicked', () => {
      render(<AuthButtons {...loggedInProps} />)
      // Tìm button chứa user icon
      const userButton = screen.getByTestId('user-icon').closest('button')
      expect(userButton).toBeInTheDocument()

      fireEvent.click(userButton!)

      expect(loggedInProps.toggleUserDropdown).toHaveBeenCalledTimes(1)
      expect(loggedInProps.toggleNotification).not.toHaveBeenCalled()
    })

    it('should pass correct props to NotificationIcon', () => {
      const propsWithEffect = {
        ...loggedInProps,
        notificationEffect: true,
        unreadCount: 5
      }
      // Lấy lại mock component để kiểm tra props được truyền vào
      const MockNotificationIcon =
        require('@/src/app/[locale]/utils/header/Icon').NotificationIcon

      render(<AuthButtons {...propsWithEffect} />)

      expect(MockNotificationIcon).toHaveBeenCalledWith(
        {
          notificationEffect: true,
          unreadCount: 5
        },
        {} // Context thứ 2 thường là {} trong React components
      )

      // Cũng có thể kiểm tra qua attributes đã đặt trong mock
      const iconElement = screen.getByTestId('notification-icon')
      expect(iconElement).toHaveAttribute('data-effect', 'true')
      expect(iconElement).toHaveAttribute('data-unread', '5')
    })

    it('should pass correct unreadCount string prop to NotificationIcon', () => {
      const propsWithUnreadString = {
        ...loggedInProps,
        notificationEffect: false,
        unreadCount: '99+'
      }
      const MockNotificationIcon =
        require('@/src/app/[locale]/utils/header/Icon').NotificationIcon

      render(<AuthButtons {...propsWithUnreadString} />)

      expect(MockNotificationIcon).toHaveBeenCalledWith(
        {
          notificationEffect: false,
          unreadCount: '99+'
        },
        {}
      )
      const iconElement = screen.getByTestId('notification-icon')
      expect(iconElement).toHaveAttribute('data-unread', '99+')
    })
  })

  // --- Trường hợp Chưa Đăng Nhập (isLogin = false) ---
  describe('When user is logged out (isLogin = false)', () => {
    const loggedOutProps = { ...defaultProps, isLogin: false }

    it('should render the Login link', () => {
      render(<AuthButtons {...loggedOutProps} />)
      const loginLink = screen.getByRole('link') // Chỉ có 1 link nên query đơn giản

      expect(loginLink).toBeInTheDocument()
      // Kiểm tra text bên trong link (dựa vào mockT)
      expect(loginLink).toHaveTextContent('Login')
      // Kiểm tra SVG icon bên trong link
      expect(loginLink.querySelector('svg.lucide-log-in')).toBeInTheDocument()
    })

    it('should NOT render Notification and User buttons', () => {
      render(<AuthButtons {...loggedOutProps} />)
      expect(screen.queryByTestId('notification-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('user-icon')).not.toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render Login link with correct href and lang', () => {
      const propsWithEnLocale = { ...loggedOutProps, locale: 'en' }
      const MockLink = require('@/src/navigation').Link // Lấy lại mock component Link

      render(<AuthButtons {...propsWithEnLocale} />)

      // Kiểm tra props được truyền vào mock Link
      expect(MockLink).toHaveBeenCalledWith(
        expect.objectContaining({
          href: '/auth/login',
          lang: 'en',
          // className có thể dài, kiểm tra một phần hoặc toàn bộ nếu cần
          className: expect.stringContaining('bg-button')
        }),
        {}
      )

      // Kiểm tra attributes trên thẻ <a> được render bởi mock
      const loginLink = screen.getByRole('link')
      expect(loginLink).toHaveAttribute('href', '/auth/login')
      expect(loginLink).toHaveAttribute('data-lang', 'en') // Dùng data-lang trong mock
    })

    it('should call useTranslations with correct namespace', () => {
      render(<AuthButtons {...loggedOutProps} />)
      // Mặc dù useTranslations('') được gọi trong component,
      // mock của chúng ta không cần namespace cụ thể, nhưng ta kiểm tra xem t('Login') có được gọi không
      expect(mockT).toHaveBeenCalledWith('Login')
    })

    it('should apply active class to Login link if pathname includes /auth/login', () => {
      mockUsePathname.mockReturnValue('/auth/login?redirect=/dashboard') // Path khớp
      render(<AuthButtons {...loggedOutProps} />)
      const loginLink = screen.getByRole('link')
      expect(loginLink).toHaveClass('bg-blue-600') // Kiểm tra class active
      expect(loginLink).toHaveClass('bg-button') // Vẫn có class gốc
    })

    it('should NOT apply active class to Login link if pathname does not include /auth/login', () => {
      mockUsePathname.mockReturnValue('/some/other/page') // Path không khớp
      render(<AuthButtons {...loggedOutProps} />)
      const loginLink = screen.getByRole('link')
      expect(loginLink).not.toHaveClass('bg-blue-600') // Không có class active
      expect(loginLink).toHaveClass('bg-button') // Vẫn có class gốc
    })
  })
})
