// src/app/[locale]/utils/header/Icon.tsx
import { FC, useState, useEffect } from 'react' // Import useState, useEffect
// import { useLocalStorage } from 'usehooks-ts'; // Có thể không cần thiết nếu chỉ dùng ở đây

interface NotificationIconProps {
  notificationEffect: boolean
  unreadCount: number | string
}

export const NotificationIcon: FC<NotificationIconProps> = ({
  notificationEffect,
  unreadCount
}) => (
  // ... (giữ nguyên code NotificationIcon)
  <div className='relative'>
    {/* SVG icon */}
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
      className={`text-button ${notificationEffect ? 'animate-bounce text-yellow-500' : ''}`}
    >
      <path d='M10.268 21a2 2 0 0 0 3.464 0' />
      <path d='M22 8c0-2.3-.8-4.3-2-6' />
      <path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' />
      <path d='M4 2C2.8 3.7 2 5.7 2 8' />
    </svg>
    {/* Unread count badges */}
    {typeof unreadCount === 'number' && unreadCount > 0 && (
      <span className='absolute -right-2 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white'>
        {unreadCount}
      </span>
    )}
    {typeof unreadCount === 'string' && (
      <span className='absolute -right-3 -top-1 rounded-full bg-red-500 px-0.5 text-xs text-white'>
        {unreadCount}
      </span>
    )}
  </div>
)

// Other icon components (MenuIcon, CloseIcon - giữ nguyên)
export const MenuIcon: FC = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='lucide lucide-menu pointer-events-none'
  >
    <line x1='3' x2='21' y1='12' y2='12' />
    <line x1='3' x2='21' y1='6' y2='6' />
    <line x1='3' x2='21' y1='18' y2='18' />
  </svg>
)

export const CloseIcon: FC = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className='text-foreground pointer-events-none h-5 w-5'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M6 18L18 6M6 6l12 12'
    />
  </svg>
)

// --- Sửa component UserIcon ---
export const UserIcon: FC = () => {
  // Sử dụng state để lưu avatar URL. Khởi tạo bằng ảnh mặc định
  // để có giá trị trong quá trình SSR.
  const [avatarSrc, setAvatarSrc] = useState('/avatar1.jpg')

  useEffect(() => {
    // Code bên trong useEffect chỉ chạy trên client sau khi component mount
    if (typeof window !== 'undefined') {
      // Kiểm tra chắc chắn là môi trường trình duyệt
      try {
        const localUser = localStorage.getItem('user')
        if (localUser) {
          const user = JSON.parse(localUser)
          // Nếu có user và có avatar, cập nhật state
          if (user?.avatar) {
            setAvatarSrc(user.avatar)
          }
        }
      } catch (error) {
        console.error('Error reading or parsing user from localStorage:', error)
        // Giữ avatar mặc định nếu có lỗi
      }
    }
  }, []) // Mảng rỗng: effect chỉ chạy MỘT LẦN sau render đầu tiên trên client

  return (
    <img
      // Sử dụng giá trị từ state cho src
      src={avatarSrc}
      alt='User avatar' // Nên dùng alt text mô tả rõ hơn nếu có thể
      width={32}
      height={32}
      className='h-8 w-8 rounded-full border-2 border-white'
    />
  )
}
// --- Hết sửa component UserIcon ---
