// NotificationsTab.tsx
import React, { useEffect, useCallback, useState, useMemo } from 'react' // Thêm useMemo nếu chưa có
import NotificationItem from './NotificationItem'
import NotificationDetails from './NotificationDetails'
import useNotifications from '../../../../hooks/dashboard/notification/useNotifications' // Đảm bảo đúng đường dẫn
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

const NotificationsTab: React.FC = () => {
  const t = useTranslations('')

  // console.log('NotificationsTab: Rendering');
  const {
    notifications, // Giờ đây đã được sắp xếp từ hook
    checkedIndices,
    selectAllChecked,
    loading,
    loggedIn,
    searchTerm,
    filteredNotifications, // Đã được lọc (và giữ nguyên thứ tự sắp xếp) từ hook
    handleUpdateSeenAt,
    handleToggleImportant,
    handleDeleteNotification,
    handleMarkUnseen,
    handleCheckboxChangeTab,
    handleDeleteSelected,
    handleSelectAllChange,
    handleMarkSelectedAsRead,
    handleMarkSelectedAsUnread,
    allSelectedAreRead,
    handleMarkSelectedAsImportant,
    handleMarkSelectedAsUnimportant,
    allSelectedAreImportant,
    setSearchTerm
    // fetchData không cần dùng trực tiếp ở đây trừ khi có nút refresh
  } = useNotifications()

  // console.log('NotificationsTab: Received props from hook:', { notificationsCount: notifications.length, filteredCount: filteredNotifications.length });

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedNotificationId = searchParams.get('id')
  const tab = searchParams.get('tab')

  // State cho bộ lọc UI (All, Unread, Read, Important)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'important'>(
    'all'
  )

  // Xử lý đánh dấu đã xem khi xem chi tiết
  useEffect(() => {
    if (selectedNotificationId) {
      // Tìm trong danh sách gốc (notifications) vì filteredNotifications có thể không chứa nó
      const notification = notifications.find(
        n => n.id === selectedNotificationId
      )
      if (notification && !notification.seenAt) {
        // console.log(`NotificationsTab: useEffect - Updating seenAt for id: ${selectedNotificationId}`);
        handleUpdateSeenAt(selectedNotificationId)
      }
    }
    // Không cần phụ thuộc vào filteredNotifications ở đây
  }, [selectedNotificationId, handleUpdateSeenAt, notifications]) // Phụ thuộc vào notifications gốc

  const handleBackToNotifications = () => {
    // console.log('NotificationsTab: handleBackToNotifications called');
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.delete('id')
    router.push(`${pathname}?${newSearchParams.toString()}`)
  }

  // Sử dụng lại hàm từ hook
  const handleCheckboxChange = useCallback(
    (notificationId: string, checked: boolean) => {
      // console.log(`NotificationsTab: handleCheckboxChange called for id: ${notificationId}, checked: ${checked}`);
      handleCheckboxChangeTab(notificationId, checked)
    },
    [handleCheckboxChangeTab]
  )

  // --- ÁP DỤNG BỘ LỌC GIAO DIỆN ---
  // Lọc bổ sung dựa trên state `filter` của component này
  // Đầu vào là `filteredNotifications` từ hook (đã được lọc bởi searchTerm và đã sắp xếp)
  const displayedNotifications = useMemo(() => {
    // console.log(`NotificationsTab: Applying UI filter: ${filter}`);
    if (filter === 'unread') {
      return filteredNotifications.filter(n => !n.seenAt)
    } else if (filter === 'read') {
      return filteredNotifications.filter(n => n.seenAt)
    } else if (filter === 'important') {
      return filteredNotifications.filter(n => n.isImportant)
    }
    // Nếu filter là 'all', trả về trực tiếp filteredNotifications (đã được lọc bởi search và sắp xếp)
    return filteredNotifications
    // --- KHÔNG CẦN SẮP XẾP LẠI Ở ĐÂY ---
  }, [filteredNotifications, filter]) // Phụ thuộc vào danh sách đã lọc/sắp xếp từ hook và bộ lọc UI
  // --- KẾT THÚC LỌC GIAO DIỆN ---

  // --- Các phần còn lại của Component giữ nguyên ---

  if (!loggedIn) {
    return (
      <div className='container mx-auto p-4'>
        {t('Please_log_in_to_view_notifications')}
      </div>
    )
  }

  // Kiểm tra tab để ẩn/hiện component (logic này giữ nguyên)
  if (tab !== 'notifications') {
    return null
  }

  if (loading) {
    return <div className='container mx-auto p-4'>{t('Loading')}</div>
  }

  // Hiển thị chi tiết thông báo (logic này giữ nguyên)
  if (selectedNotificationId) {
    // Tìm trong danh sách gốc (notifications) đã sắp xếp
    const notification = notifications.find(
      n => n.id === selectedNotificationId
    )
    if (notification) {
      return (
        <NotificationDetails
          notification={notification}
          onBack={handleBackToNotifications}
          onDelete={handleDeleteNotification} // Sử dụng hàm từ hook
          onToggleImportant={handleToggleImportant} // Sử dụng hàm từ hook
        />
      )
    } else {
      // Xử lý trường hợp không tìm thấy ID (có thể đã bị xóa hoặc lỗi)
      console.warn(
        `Notification with id ${selectedNotificationId} not found in the list.`
      )
      return (
        <div className='container mx-auto p-4'>
          {t('Notification_not_found')}{' '}
          <button
            onClick={handleBackToNotifications}
            className='text-blue-600 hover:underline'
          >
            {t('Back')}
          </button>
        </div>
      )
    }
  }

  // Hiển thị danh sách thông báo
  return (
    <div className='container mx-auto p-2 md:p-6'>
      {/* Thanh tìm kiếm */}
      <div className='mb-4 '>
        <input
          type='text'
          placeholder={t('Search_notifications') || 'Search notifications...'} // Cung cấp fallback
          className='w-full rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-button'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Các nút lọc UI */}
      <div className='mb-4 flex flex-wrap gap-2'>
        {' '}
        {/* Sử dụng flex-wrap và gap cho responsive */}
        <button
          onClick={() => setFilter('all')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'all' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
          {t('All')}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'unread' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
          {t('Unread')}
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'read' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
          {t('Read')}
        </button>
        <button
          onClick={() => setFilter('important')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'important' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
          {t('Important')}
        </button>
      </div>

      {/* Thanh hành động hàng loạt */}
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        {' '}
        {/* Sử dụng flex-wrap và gap */}
        <div className='flex items-center'>
          {' '}
          {/* Nhóm checkbox và label */}
          <input
            type='checkbox'
            id='select-all'
            className='ml-4 mr-2 h-4 w-4 cursor-pointer rounded border-gray-30 text-blue-600 focus:ring-button'
            checked={selectAllChecked}
            onChange={handleSelectAllChange}
            aria-label='Select all notifications'
            disabled={filteredNotifications.length === 0} // Vô hiệu hóa nếu không có gì để chọn
          />
          <label htmlFor='select-all' className='mr-4 cursor-pointer text-sm'>
            {t('Select_All')}
          </label>
        </div>
        {checkedIndices.length > 0 && (
          <>
            {/* Nút Mark Read/Unread */}
            <button
              onClick={
                allSelectedAreRead
                  ? handleMarkSelectedAsUnread
                  : handleMarkSelectedAsRead
              }
              className='flex min-w-[110px] items-center justify-center rounded bg-button px-2 py-1 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 md:min-w-[140px] md:px-3 md:text-base'
              aria-label={
                allSelectedAreRead
                  ? t('Mark_Selected_as_Unread')
                  : t('Mark_Selected_as_Read')
              }
            >
              {/* Icons and Text */}
              {allSelectedAreRead ? (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='mr-1 md:mr-2'
                  >
                    <rect width='20' height='16' x='2' y='4' rx='2' />
                    <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
                  </svg>
                  <span className='truncate'>{t('Mark_As_Unread')}</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='mr-1 md:mr-2'
                  >
                    <path d='M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z' />
                    <path d='m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10' />
                  </svg>
                  <span className='truncate'>{t('Mark_As_Read')}</span>
                </>
              )}
            </button>
            {/* Nút Mark Important/Unimportant */}
            <button
              onClick={
                allSelectedAreImportant
                  ? handleMarkSelectedAsUnimportant
                  : handleMarkSelectedAsImportant
              }
              className='flex min-w-[110px] items-center justify-center rounded bg-yellow-500 px-2 py-1 text-sm font-bold text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:min-w-[140px] md:px-3 md:text-base'
              aria-label={
                allSelectedAreImportant
                  ? t('Mark_Selected_as_Unimportant')
                  : t('Mark_Selected_as_Important')
              }
            >
              {/* Icons and Text */}
              {allSelectedAreImportant ? (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='mr-1 md:mr-2'
                  >
                    <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                  </svg>
                  <span className='truncate'>{t('Mark_As_Unimportant')}</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='mr-1 md:mr-2'
                  >
                    <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                  </svg>
                  <span className='truncate'>{t('Mark_As_Important')}</span>
                </>
              )}
            </button>
            {/* Nút Delete Selected */}
            <button
              onClick={handleDeleteSelected}
              className='flex min-w-[110px] items-center justify-center rounded bg-red-500 px-2 py-1 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 md:min-w-[140px] md:px-3 md:text-base'
              aria-label={t('Delete_Selected')}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='mr-1 md:mr-2'
              >
                <path d='M3 6h18' />
                <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' />
                <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
                <line x1='10' x2='10' y1='11' y2='17' />
                <line x1='14' x2='14' y1='11' y2='17' />
              </svg>
              <span className='truncate'>{t('Delete_Selected')}</span>
            </button>
          </>
        )}
      </div>

      {/* Danh sách thông báo */}
      <div className='overflow-hidden rounded border bg-white-pure shadow'>
        {' '}
        {/* Thêm border và rounded */}
        {displayedNotifications.length === 0 ? (
          <p className='p-4 text-center '>
            {t('You_have_no_notifications_matching_criteria') ||
              'No notifications match your current filters.'}
          </p>
        ) : (
          // --- Sử dụng `displayedNotifications` đã được lọc và SẮP XẾP TỪ HOOK ---
          displayedNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification} // notification này đã đúng thứ tự
              onDelete={() => handleDeleteNotification(notification.id)} // Hàm từ hook
              isChecked={checkedIndices.includes(notification.id)} // State từ hook
              onCheckboxChange={
                checked => handleCheckboxChange(notification.id, checked) // Hàm đã được useCallback
              }
              onToggleImportant={handleToggleImportant} // Hàm từ hook
              onMarkUnseen={handleMarkUnseen} // Hàm từ hook
              notificationId={notification.id} // Prop này có vẻ dư thừa nếu đã có notification.id
            />
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationsTab
