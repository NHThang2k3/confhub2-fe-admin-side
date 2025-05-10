// components/Header/header/NotificationDropdown.tsx (NotificationDropdown Component)

import { FC, useEffect, useCallback, useMemo } from 'react' // Thêm useMemo
import { Link } from '@/src/navigation'
import { Notification } from '../../../../models/response/user.response'
import { useTranslations } from 'next-intl'
import { timeAgo } from '../../dashboard/timeFormat' // Đảm bảo import đúng
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import DOMPurify from 'dompurify'

interface Props {
  notifications: Notification[]
  isNotificationOpen: boolean
  closeAllMenus: () => void
  locale: string
  fetchNotifications: () => void
  isLoadingNotifications: boolean
  markAllAsRead: () => Promise<void>
}

const NotificationDropdown: FC<Props> = ({
  notifications, // Mảng gốc từ props
  isNotificationOpen,
  closeAllMenus,
  locale,
  fetchNotifications,
  isLoadingNotifications,
  markAllAsRead
}) => {
  const t = useTranslations('')
  const language = t('language')

  // --- BƯỚC 1: SẮP XẾP THÔNG BÁO ---
  const sortedNotifications = useMemo(() => {
    // Tạo bản sao và sắp xếp theo createdAt giảm dần (mới nhất trước)
    return [...notifications].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      const validTimeA = !isNaN(timeA) ? timeA : 0
      const validTimeB = !isNaN(timeB) ? timeB : 0
      return validTimeB - validTimeA // Mới nhất lên đầu
    })
  }, [notifications]) // Chỉ sắp xếp lại khi notifications thay đổi
  // --- KẾT THÚC SẮP XẾP ---

  const memoizedFetchNotifications = useCallback(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (isNotificationOpen) {
      memoizedFetchNotifications()
    }
  }, [isNotificationOpen, memoizedFetchNotifications])

  // Hàm groupNotifications gốc, không thay đổi
  const groupNotifications = useCallback(
    (notificationsToGroup: Notification[]) => {
      // Đổi tên param để rõ ràng
      const now = new Date()
      const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000

      // Lọc dựa trên mảng đã được sắp xếp đầu vào
      const newNotificationsGroup = notificationsToGroup.filter(
        n => new Date(n.createdAt).getTime() >= oneDayAgo
      )
      const earlierNotificationsGroup = notificationsToGroup.filter(
        n => new Date(n.createdAt).getTime() < oneDayAgo
      )
      // Thứ tự trong các group này sẽ giữ nguyên từ mảng đầu vào đã sắp xếp
      return {
        newNotifications: newNotificationsGroup,
        earlierNotifications: earlierNotificationsGroup
      }
    },
    []
  ) // Dependencies của useCallback này không thay đổi

  // --- BƯỚC 2: SỬ DỤNG DANH SÁCH ĐÃ SẮP XẾP ĐỂ NHÓM ---
  // Gọi hàm nhóm với `sortedNotifications` thay vì `notifications` gốc
  const { newNotifications, earlierNotifications } =
    groupNotifications(sortedNotifications)
  // --- KẾT THÚC SỬ DỤNG SẮP XẾP ---

  // Hàm renderNotificationItem gốc, không thay đổi logic bên trong
  const renderNotificationItem = useCallback(
    (notification: Notification) => {
      // DOMPurify chỉ chạy ở client
      const sanitizedMessage =
        typeof window !== 'undefined'
          ? DOMPurify.sanitize(notification.message)
          : notification.message

      return (
        <Link
          href={{
            pathname: `/dashboard`,
            query: { tab: 'notifications', id: notification.id }
          }}
          lang={locale}
          key={notification.id}
          // onClick={closeAllMenus}
        >
          <div
            className={`flex items-start border-b border-gray-20 p-4 hover:bg-gray-5 ${notification.seenAt ? '' : 'bg-gray-10'}`}
          >
            <div className='mr-3 flex-shrink-0'>
              <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-20'>
                <span className='font-medium '>
                  {notification.type
                    ? notification.type.charAt(0).toUpperCase()
                    : '?'}
                </span>
                {notification.seenAt === null && (
                  <span className='absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-red-500'></span>
                )}
              </div>
            </div>
            <div className='flex-grow'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => (
                    <p
                      className={`mb-0.5 text-sm ${notification.seenAt ? '' : 'font-bold'}`}
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a className='text-button hover:underline' {...props} />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre
                      className='overflow-x-auto rounded-md bg-gray-10 p-2'
                      {...props}
                    />
                  ),
                  code: ({ node, ...props }) => (
                    <code className='rounded bg-gray-10 px-1' {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className='text-base font-bold' {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className='text-sm font-semibold' {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className='text-sm font-medium' {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className='list-inside list-disc text-sm' {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className='list-inside list-decimal text-sm'
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className='text-sm' {...props} />
                  ),
                  div: ({ node, ...props }) => (
                    <div
                      className={`text-sm ${notification.seenAt ? '' : 'font-bold'}`}
                      {...props}
                    />
                  )
                }}
              >
                {sanitizedMessage}
              </ReactMarkdown>
              <span className='text-xs '>
                {timeAgo(notification.createdAt, language)}
              </span>
            </div>
          </div>
        </Link>
      )
    },
    [closeAllMenus, locale, language, timeAgo] // Dependencies không đổi so với logic gốc (nếu timeAgo và language ổn định)
  )

  // Hàm handleMarkAllAsRead gốc, không thay đổi
  const handleMarkAllAsRead = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      await markAllAsRead()
      fetchNotifications() // Giữ lại fetch nếu logic gốc yêu cầu
    },
    [markAllAsRead, fetchNotifications]
  )

  // JSX Render gốc, chỉ thay đổi việc sử dụng `sortedNotifications` để kiểm tra length
  return (
    <div
      className={`absolute right-0 z-50 mr-8 mt-10 w-80 overflow-hidden rounded-lg bg-white-pure shadow-xl transition-all duration-300 ease-in-out md:w-[400px] ${
        // Giữ nguyên style gốc
        isNotificationOpen
          ? 'visible translate-y-0 opacity-100'
          : 'invisible translate-y-1 opacity-0'
      }`}
      style={{
        inset: '0px 0px auto auto' // Giữ nguyên style gốc
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className='border-b border-gray-20 p-4'>
        <div className='flex items-center justify-between'>
          <h6 className='text-sm font-semibold md:text-lg'>
            {t('Notifications')}
          </h6>
          <button
            className=' text-sm text-button hover:text-blue-800'
            onClick={handleMarkAllAsRead}
          >
            {t('Mark All As Read')}
          </button>
        </div>
      </div>

      <div className='overflow-y-auto' style={{ maxHeight: '25rem' }}>
        {isLoadingNotifications ? (
          <div className='p-4 text-center text-gray-50'>{t('Loading')}</div>
        ) : sortedNotifications.length > 0 ? ( // --- BƯỚC 3: KIỂM TRA LENGTH CỦA MẢNG ĐÃ SẮP XẾP ---
          <>
            {newNotifications.length > 0 && (
              <>
                <div className='border-b border-gray-20 px-4 py-2 text-sm font-semibold '>
                  {t('NEW')}
                </div>
                {newNotifications.map(renderNotificationItem)}
              </>
            )}
            {earlierNotifications.length > 0 && (
              <>
                <div className='border-b border-gray-20 px-4 py-2 text-sm font-semibold '>
                  {t('EARLIER')}
                </div>
                {earlierNotifications.map(renderNotificationItem)}
              </>
            )}
          </>
        ) : (
          <div className='p-4 text-center '>{t('No_new_notifications')}</div>
        )}
      </div>

      <div className='border-t border-gray-20 p-4 text-center'>
        <Link
          href={{ pathname: `/dashboard`, query: { tab: 'notifications' } }}
          lang={locale}
          onClick={closeAllMenus}
        >
          <div className='block text-sm text-button hover:text-blue-800'>
            {' '}
            {t('View_all')}{' '}
          </div>
        </Link>
      </div>
    </div>
  )
}

export default NotificationDropdown
