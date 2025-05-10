// components/NotificationItem.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { Notification } from '../../../../models/response/user.response'
import { Link } from '@/src/navigation'
import { useSearchParams } from 'next/navigation'

interface NotificationItemProps {
  notification: Notification
  onDelete: () => void
  isChecked: boolean
  onCheckboxChange: (checked: boolean) => void
  onToggleImportant: (id: string) => void
  onMarkUnseen: (id: string) => void
  notificationId: string
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  isChecked,
  onCheckboxChange,
  onToggleImportant,
  onMarkUnseen,
  notificationId
}) => {
  const [isStarred, setIsStarred] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsStarred(notification.isImportant)
  }, [notification.isImportant, notification.id])

  const toggleStar = useCallback(() => {
    setIsStarred(prevIsStarred => !prevIsStarred)
    onToggleImportant(notification.id)
  }, [notification.id, onToggleImportant])

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log(
        `NotificationItem: handleCheckboxChange called.  notification.id: ${notification.id}, checked: ${event.target.checked}`
      )
      onCheckboxChange(event.target.checked)
    },
    [onCheckboxChange, notification.id]
  )

  const handleMarkUnseenCallback = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      console.log(
        `NotificationItem: handleMarkUnseenCallback called. notification.id: ${notification.id}`
      )
      onMarkUnseen(notification.id)
    },
    [notification.id, onMarkUnseen]
  )

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      console.log(
        `NotificationItem: handleDeleteClick called for id: ${notificationId}`
      )
      onDelete()
    },
    [onDelete, notificationId]
  )

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Unknown'

    const date = new Date(dateString)
    const now = new Date()
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    if (isToday) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short'
      })
    }
  }

  const isSeen = !!notification.seenAt

  return (
    <div
      className={`flex cursor-pointer items-center border border-background px-4 py-2 ${
        isStarred || notification.isImportant ? 'bg-yellow-50' : ''
      } ${isChecked ? 'bg-background-secondary' : ''} ${
        !isSeen ? 'bg-background' : ''
      } ${isHovered ? 'border-primary' : ''}`}
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
      }}
    >
      <input
        type='checkbox'
        className='mr-3 h-4 w-4 cursor-pointer rounded border-background text-button-text focus:ring-button'
        checked={isChecked}
        onChange={handleCheckboxChange}
        onClick={e => e.stopPropagation()}
        aria-label='Select notification'
      />
      <button
        onClick={e => {
          toggleStar()
          e.stopPropagation()
        }}
        className='mr-3 focus:outline-none'
        aria-label='Mark as important'
      >
        <span
          className={`${
            isStarred || notification.isImportant
              ? 'text-yellow-500'
              : 'text-gray-400'
          } text-lg`}
        >
          ★
        </span>
      </button>

      <div className='grid flex-1 grid-cols-[2fr_7fr_1fr] items-center gap-2'>
        {/* Column 1: Type (1fr) */}
        <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
          <span className={`${!isSeen ? 'font-bold' : ''}`}>
            {notification.type.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Column 2: Message (3fr) */}
        <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
          <Link
            href={{
              pathname: '/dashboard',
              query: { ...Object.fromEntries(searchParams), id: notificationId }
            }}
            className=''
          >
            <p className={`${!isSeen ? 'font-bold' : ''} text-sm`}>
              {notification.message}
            </p>
          </Link>
        </div>

        {/* Column 3: Time and Actions (1fr) */}
        <div className='text-right'>
          {!isHovered && (
            <span
              className={`${!isSeen ? 'font-bold' : ''} whitespace-nowrap text-xs`}
            >
              {formatDate(notification.createdAt)}
            </span>
          )}
          {isHovered && (
            <div className='flex items-center justify-end space-x-2'>
              <button
                onClick={handleMarkUnseenCallback}
                className='hover:text-blue-500 focus:outline-none'
                aria-label='Mark as unseen'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-eye'
                >
                  <path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0' />
                  <circle cx='12' cy='12' r='3' />
                </svg>
              </button>
              <button
                onClick={handleDeleteClick}
                className='hover:text-red-500 focus:outline-none'
                aria-label='Delete notification'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-trash-2'
                >
                  <path d='M3 6h18' />
                  <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' />
                  <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
                  <line x1='10' x2='10' y1='11' y2='17' />
                  <line x1='14' x2='14' y1='11' y2='17' />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationItem
