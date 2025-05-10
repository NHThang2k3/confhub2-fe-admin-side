// components/Header/components/UserDropdown.tsx
import { FC, useState, useEffect, useRef } from 'react'
import { Link } from '@/src/navigation' // assuming this is next-intl Link
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation' // Import useRouter

// --- Interface cho cấu trúc dữ liệu người dùng ---
interface UserData {
  id: string // Thêm một trường bắt buộc để kiểm tra tính hợp lệ cơ bản
  firstName: string
  lastName: string
  email: string
  // Thêm các thuộc tính khác nếu bạn cần truy cập chúng
}
// --- Kết thúc interface ---

interface Props {
  isUserDropdownOpen: boolean
  closeAllMenus: () => void
  locale: string
  logout: () => Promise<void>
  socketRef: React.MutableRefObject<any>
}

const UserDropdown: FC<Props> = ({
  isUserDropdownOpen,
  closeAllMenus,
  locale,
  logout,
  socketRef
}) => {
  const [isClient, setIsClient] = useState(false)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)
  const [showSessionExpiredMessage, setShowSessionExpiredMessage] =
    useState(false)

  const t = useTranslations('')
  const router = useRouter()

  const redirectTimerIdRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsClient(true)
    // --- Đọc chuỗi JSON từ localStorage khi component mount ---
    // Không cần kiểm tra và hiển thị lỗi ở đây, việc kiểm tra sẽ diễn ra khi click link
    try {
      const storedUserJSON = localStorage.getItem('user')
      if (storedUserJSON) {
        const userData: UserData = JSON.parse(storedUserJSON)
        if (userData && userData.firstName) {
          setFirstName(userData.firstName)
        }
        if (userData && userData.lastName) {
          setLastName(userData.lastName)
        }
      }
    } catch (error) {
      console.error(
        'Lỗi khi parse dữ liệu người dùng từ localStorage lúc mount:',
        error
      )
      // Không cần xóa dữ liệu lỗi ở đây vội, sẽ xóa khi click link nếu cần
    }

    // Cleanup function để clear timeout khi component unmount
    return () => {
      if (redirectTimerIdRef.current) {
        clearTimeout(redirectTimerIdRef.current)
        redirectTimerIdRef.current = null
      }
    }
  }, []) // Dependency rỗng đảm bảo chạy 1 lần sau mount ở client

  // Hàm xử lý sự kiện click cho các link
  // KHÔNG cần truyền href làm tham số nữa, Link component sẽ tự biết href của nó
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const userDataJSON = localStorage.getItem('user')
    let isValidUser = false
    let parsedUser: UserData | null = null

    if (userDataJSON) {
      try {
        parsedUser = JSON.parse(userDataJSON)
        // Kiểm tra tính hợp lệ cơ bản của dữ liệu user (ví dụ: có trường id không)
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
          isValidUser = true
        } else {
          console.warn(
            'Dữ liệu người dùng trong localStorage không hợp lệ (thiếu id hoặc định dạng sai).'
          )
          // Có thể xóa dữ liệu lỗi ngay nếu muốn, hoặc đợi đến khi chuyển hướng
          localStorage.removeItem('user')
        }
      } catch (parseError) {
        console.error(
          'Lỗi khi parse dữ liệu người dùng từ localStorage:',
          parseError
        )
        // Dữ liệu không phải JSON hợp lệ, xóa nó đi
        localStorage.removeItem('user')
      }
    } else {
      console.warn('Không tìm thấy dữ liệu người dùng trong localStorage.')
    }

    if (!isValidUser) {
      // Dữ liệu user KHÔNG tồn tại hoặc KHÔNG hợp lệ
      e.preventDefault() // *** NGĂN CHẶN Link điều hướng mặc định ***

      // Chỉ hiển thị thông báo nếu nó chưa hiển thị
      if (!showSessionExpiredMessage) {
        setShowSessionExpiredMessage(true)

        // Đặt timeout để chuyển hướng sau 3 giây
        const timerId = setTimeout(() => {
          router.push('/') // Chuyển hướng về trang chủ
          closeAllMenus() // Đóng dropdown
          setShowSessionExpiredMessage(false) // Ẩn thông báo
          redirectTimerIdRef.current = null // Reset ref
        }, 3000)
        redirectTimerIdRef.current = timerId // Lưu ID của timeout
      }

      // Đóng menu ngay lập tức vì chúng ta không điều hướng đến link đích
      closeAllMenus()
    } else {
      // Dữ liệu user TỒN TẠI và HỢP LỆ
      // *** KHÔNG gọi e.preventDefault() ***
      // *** KHÔNG gọi router.push() thủ công ***
      // Để Link component tự xử lý việc điều hướng đến href của nó.

      // Đóng menu ngay lập tức khi click để chuẩn bị cho việc chuyển trang
      closeAllMenus()
    }
  }

  return (
    <>
      {/* Thông báo hết hạn session - Sử dụng t() để dịch */}
      {/* Đặt z-index cao hơn cả dropdown (z-50) */}
      {showSessionExpiredMessage && (
        <div className='fixed left-0 top-0 z-[100] w-full bg-red-600 p-3 text-center text-white shadow-lg'>
          {t('Session_Expired_Redirect_Home')} {/* Dùng hàm t() */}
        </div>
      )}

      {isClient && (
        <div
          className={`absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800 ${
            isUserDropdownOpen ? '' : 'hidden'
          }`}
          aria-labelledby='user-menu-button'
        >
          {/* Hiển thị lời chào */}
          {(firstName || lastName) && (
            <div className='border-b border-gray-200 px-2 py-2 text-sm  '>
              {t('Hello')}{' '}
              <strong className='text-button'>
                {firstName} {lastName}
              </strong>
            </div>
          )}

          <div className='flex flex-col py-1'>
            {/* Các Link menu - Sử dụng hàm handleLinkClick */}
            {/* Chỉ cần truyền sự kiện e */}
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'analysis' } }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Chỉ truyền hàm xử lý click
            >
              {t('Analysis')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'profile' } }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Chỉ truyền hàm xử lý click
            >
              {t('Profile')}
            </Link>
            <Link
              href={{
                pathname: `/dashboard`,
                query: { tab: 'myconferences' }
              }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Chỉ truyền hàm xử lý click
            >
              {t('My_Conferences')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'followed' } }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Chỉ truyền hàm xử lý click
            >
              {t('Followed')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'note' } }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Chỉ truyền hàm xử lý click
            >
              {t('Note')}
            </Link>
            <Link
              href={{
                pathname: `/dashboard`,
                query: { tab: 'notifications' }
              }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Chỉ truyền hàm xử lý click
            >
              {t('Notifications')}
            </Link>
            <Link
              href={{
                pathname: `/dashboard`,
                query: { tab: 'blacklisted' }
              }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Chỉ truyền hàm xử lý click
            >
              {t('Blacklisted')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'setting' } }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Chỉ truyền hàm xử lý click
            >
              {t('Setting')}
            </Link>

            <hr className='my-1 border-gray-200 dark:border-gray-700' />

            {/* Logout Button - Không cần kiểm tra localStorage ở đây */}
            <button
              onClick={async () => {
                await logout()
                if (socketRef.current) {
                  socketRef.current.disconnect()
                }
                localStorage.removeItem('user') // Xóa dữ liệu user khi logout
                setFirstName(null)
                setLastName(null)
                closeAllMenus()
                router.push('/') // Chuyển hướng về trang chủ sau khi logout là hợp lý
              }}
              className='block w-full px-2 py-2 text-left text-sm text-red-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-red-500 dark:hover:bg-gray-700 dark:focus:bg-gray-700'
            >
              {t('Logout')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default UserDropdown
