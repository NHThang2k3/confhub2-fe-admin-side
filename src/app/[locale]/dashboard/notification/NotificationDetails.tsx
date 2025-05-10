// components/NotificationDetail.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { Notification } from '../../../../models/response/user.response'
import { formatDateFull } from '../timeFormat'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import Button from '../../utils/Button'

interface NotificationDetailProps {
  notification: Notification
  onBack: () => void
  onDelete: (id: string) => void
  onToggleImportant: (id: string) => void
}

const NotificationDetail: React.FC<NotificationDetailProps> = ({
  notification,
  onBack,
  onDelete,
  onToggleImportant
}) => {
  const t = useTranslations('')
  const language = t('language')
  const [isStarred, setIsStarred] = useState(false)
  const searchParams = useSearchParams()
  const notificationId = searchParams.get('id')
  // Keep seenAt as state, and initialize it with notification.seenAt.  No need for useState.
  const seenAt = notification.seenAt

  useEffect(() => {
    setIsStarred(notification.isImportant)
  }, [notification.isImportant]) // Simplified dependency array

  const toggleStar = useCallback(() => {
    setIsStarred(prevIsStarred => !prevIsStarred)
    onToggleImportant(notification.id)
  }, [notification.id, onToggleImportant])

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-4 flex items-center'>
        <button
          onClick={onBack}
          className='mr-2 text-blue-500 hover:text-blue-700 focus:outline-none'
        >
          ← {t('Back')}
        </button>
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
        <h2 className='text-lg font-semibold'>
          {notification.type.replace(/_/g, ' ')}
        </h2>
      </div>
      <div className='mb-4 border-b border-gray-300 pb-2 text-sm '>
        {formatDateFull(notification.createdAt, language)}
      </div>
      <div className='rounded-lg bg-white p-4 shadow'>
        {/* Use ReactMarkdown to render the message */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // Customize components (optional, for more control)
            p: ({ node, ...props }) => <p className='mb-2' {...props} />, // Add margin to paragraphs
            a: ({ node, ...props }) => (
              <a className='text-blue-600 hover:underline' {...props} />
            ), // Style links
            // Add more component overrides as needed (ul, ol, li, code, etc.)
            pre: ({ node, ...props }) => (
              <pre
                className='overflow-x-auto rounded-md bg-gray-100 p-2'
                {...props}
              />
            ),
            code: ({ node, ...props }) => (
              <code className='rounded bg-gray-100 px-1' {...props} />
            ),
            h1: ({ node, ...props }) => (
              <h1 className='my-4 text-2xl font-bold' {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className='my-3 text-xl font-semibold' {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className='my-2 text-lg font-medium' {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className='my-2 list-inside list-disc' {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className='my-2 list-inside list-decimal' {...props} />
            ),
            li: ({ node, ...props }) => <li className='my-1' {...props} />
          }}
        >
          {notification.message}
        </ReactMarkdown>
        <div className='text-left text-sm md:text-base'>
          <Link
            href={{
              pathname: '/conferences/detail',
              query: { id: notification.conferenceId }
            }}
          >
            <Button variant='primary' size={'small'} rounded className='m-2'>
              {t('Details_about_conference')}
            </Button>
          </Link>
        </div>
        {/* Display seenAt.  It will now ALWAYS be the initial seenAt value. */}
        {seenAt ? (
          <p className='mt-2 text-sm '>
            {t('Seen_at')}: {formatDateFull(seenAt, language)}
          </p>
        ) : (
          <p className='mt-2 text-sm '>{t('Not_yet_seen')}</p>
        )}
      </div>
      <div className='mt-4 flex items-center space-x-2'>
        <button
          onClick={e => {
            onDelete(notification.id)
            onBack()
            e.stopPropagation()
          }}
          className=' hover:text-red-500 focus:outline-none'
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
    </div>
  )
}

export default NotificationDetail
