// components/Header/components/NotificationIcon.tsx
import { FC } from 'react'
import { useLocalStorage } from 'usehooks-ts'

interface NotificationIconProps {
  notificationEffect: boolean
  unreadCount: number | string
}

let user: { avatar?: string | null } | null = null // Khởi tạo là null
try {
  const localUser = localStorage.getItem('user')
  if (localUser) {
    user = JSON.parse(localUser) // Parse dữ liệu
  }
} catch (error) {
  console.error('Error parsing user from localStorage:', error)
  // Xử lý lỗi nếu cần, ví dụ: xóa dữ liệu hỏng
  // localStorage.removeItem('user');
  user = null // Đảm bảo user là null nếu có lỗi
}

export const NotificationIcon: FC<NotificationIconProps> = ({
  notificationEffect,
  unreadCount
}) => (
  <div className='relative'>
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

// Other icon components (No changes needed)
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

export const UserIcon: FC = () => (
  <img
    // Kiểm tra xem 'user' và 'user.avatar' có tồn tại không
    src={user?.avatar ? user.avatar : `/avatar1.jpg`}
    alt='User avatar' // Nên dùng alt text mô tả rõ hơn nếu có thể
    width={32}
    height={32}
    className='h-8 w-8 rounded-full border-2 border-white'
  />
)
