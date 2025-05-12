// components/NotificationDetail.tsx
'use client'; // <-- Add directive

import React, { useState, useEffect, useCallback } from 'react';
import { Notification } from '../../../../models/response/user.response'; // Import types
// Make sure formatDateFull is locale-aware
import { formatDateFull } from '../timeFormat'; // Assuming this helper needs locale
import { useSearchParams } from 'next/navigation'; // Keep import
import ReactMarkdown from 'react-markdown'; // Keep import
import remarkGfm from 'remark-gfm'; // Keep import
import rehypeRaw from 'rehype-raw'; // Keep import
import { useTranslations } from 'next-intl'; // Keep import
import { Link } from '@/src/navigation'; // Keep import
import Button from '../../utils/Button'; // Keep import

interface NotificationDetailProps {
  notification: Notification;
  onBack: () => void;
  onDelete: (id: string) => void;
  onToggleImportant: (id: string) => void;
  // If not using useTranslations here, receive t as prop:
  // t: ReturnType<typeof useTranslations>;
  locale: string; // <-- Need locale for date formatting and type translation
}

const NotificationDetail: React.FC<NotificationDetailProps> = ({
  notification,
  onBack,
  onDelete,
  onToggleImportant,
  // If receiving t as prop: t,
  locale, // Destructure locale
}) => {
  // Call the useTranslations hook (already present)
  const t = useTranslations(''); // Using the default namespace
  // The original code derived 'language' here. This is incorrect for locale.
  // We will remove this line and pass 'locale' to formatDateFull.
  // const language = t('language'); // Removed this line

  const [isStarred, setIsStarred] = useState(false);
  const searchParams = useSearchParams();
  const notificationId = searchParams.get('id');

  // `seenAt` is a property of the notification object from props.
  // It doesn't need to be state here unless you were updating it locally *within* this component.
  // The `useEffect` in NotificationsTab updates the actual notification object in the hook's state.
  const seenAt = notification.seenAt; // Use directly from props

  useEffect(() => {
    // Ensure notification.isImportant is treated as boolean
    setIsStarred(!!notification.isImportant);
  }, [notification.isImportant]); // Dependency: notification.isImportant

  const toggleStar = useCallback(() => {
    setIsStarred(prevIsStarred => !prevIsStarred);
    onToggleImportant(notification.id);
  }, [notification.id, onToggleImportant]); // Dependencies: notification.id, onToggleImportant


  // Helper to translate notification type string (copy from NotificationItem or import if shared)
  const getTranslatedNotificationType = useCallback((type: string | undefined): string => {
    if (!type) return t('NotificationType_Unknown'); // <-- Translate unknown type
    const cleanedType = type.replace(/_/g, ' ').trim();
    return t(`NotificationType_${type}`, {
      defaultMessage: cleanedType || t('NotificationType_Unknown'),
    });
  }, [t]); // Dependency: t


  return (
    <div className='container mx-auto p-4'>
      {/* Header area: Back button, Star, Type */}
      <div className='mb-4 flex items-center'>
        <button
          onClick={onBack}
          className='mr-2 text-blue-500 hover:text-blue-700 focus:outline-none'
        >
          ← {t('Back')} {/* Translate Back button text (already uses t) */}
        </button>
        {/* Star Button */}
        <button
          onClick={e => {
            toggleStar();
            e.stopPropagation(); // Prevent click from bubbling up
          }}
          className='mr-3 focus:outline-none'
          // Translate aria-label
          aria-label={t('NotificationDetail_AriaLabel_Important')} // <-- Translate
        >
          <span
            className={`${
               isStarred || !!notification.isImportant // Use !! for robustness
                ? 'text-yellow-500'
                : 'text-gray-400'
            } text-lg`}
          >
            ★
          </span>
        </button>
        <h2 className='text-lg font-semibold'>
           {/* Display translated notification type */}
          {getTranslatedNotificationType(notification.type)} {/* <-- Use translated type */}
        </h2>
      </div>

      {/* Date/Time Line */}
      <div className='mb-4 border-b border-gray-300 pb-2 text-sm '>
         {/* NOTE: Ensure the formatDateFull helper uses the provided locale for formatting. */}
         {formatDateFull(notification.createdAt, locale)} {/* <-- Pass actual locale */}
      </div>

      {/* Message Content */}
      <div className='rounded-lg bg-white p-4 shadow'>
        {/* ReactMarkdown renders message content (not translated) */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, ...props }) => <p className='mb-2' {...props} />,
            a: ({ node, ...props }) => (
              <a className='text-blue-600 hover:underline' {...props} />
            ),
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
        {/* Conference Details Button */}
        <div className='text-left text-sm md:text-base mt-4'> {/* Added mt-4 */}
          {notification.conferenceId && ( // Only show if conferenceId exists
            <></>
          )}
        </div>

        {/* Seen At timestamp */}
        {/* Translate labels (already uses t) and use formatDateFull with locale */}
        {seenAt ? (
          <p className='mt-2 text-sm '>
            {t('Seen_at')}: {formatDateFull(seenAt, locale)} 
          </p>
        ) : (
          <p className='mt-2 text-sm '>{t('Not_yet_seen')}</p> 
        )}
      </div>

      {/* Delete Button (below content block) */}
      <div className='mt-4 flex items-center space-x-2'>
        <button
          // Delete and then navigate back
          onClick={e => {
            onDelete(notification.id); // Call delete handler
            onBack(); // Navigate back
            e.stopPropagation(); // Prevent bubbling
          }}
          className='p-1 -m-1 rounded hover:text-red-500 focus:outline-none transition-colors' // Added padding/margin
          // Translate aria-label
          aria-label={t('NotificationDetail_AriaLabel_Delete')} // <-- Translate
        >
           {/* Icon (no text) */}
          <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-trash-2'><path d='M3 6h18' /><path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' /><path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' /><line x1='10' x2='10' y1='11' y2='17' /><line x1='14' x2='14' y1='11' y2='17' /></svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationDetail;