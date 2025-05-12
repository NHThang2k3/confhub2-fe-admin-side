// components/NotificationItem.tsx
'use client'; // <-- Add directive

import React, { useState, useEffect, useCallback } from 'react';
import { Notification } from '../../../../models/response/user.response'; // Import types
import { Link } from '@/src/navigation'; // Ensure this is next-intl Link
import { useSearchParams } from 'next/navigation'; // Keep import
import { useTranslations } from 'next-intl'; // <-- Add import

interface NotificationItemProps {
  notification: Notification;
  onDelete: () => void;
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
  onToggleImportant: (id: string) => void;
  onMarkUnseen: (id: string) => void;
  notificationId: string; // Keep this prop for now, as per original code
  // If not using useTranslations here, receive t as prop:
  // t: ReturnType<typeof useTranslations>;
  locale: string; // <-- Need locale for date formatting and type translation
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  isChecked,
  onCheckboxChange,
  onToggleImportant,
  onMarkUnseen,
  notificationId, // Keep for now
  // If receiving t as prop: t,
  locale, // Destructure locale
}) => {
  // Call the useTranslations hook here
  const t = useTranslations(''); // <-- Add hook call (using the default namespace)
  // Alternatively, if passing t from parent: const { t } = props;

  const [isStarred, setIsStarred] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ensure notification.isImportant is treated as a boolean
    setIsStarred(!!notification.isImportant);
  }, [notification.isImportant]); // Dependency: notification.isImportant

  const toggleStar = useCallback(() => {
    setIsStarred(prevIsStarred => !prevIsStarred);
    onToggleImportant(notification.id);
  }, [notification.id, onToggleImportant]); // Dependencies: notification.id, onToggleImportant

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // console.log(`NotificationItem: handleCheckboxChange called. notification.id: ${notification.id}, checked: ${event.target.checked}`);
      onCheckboxChange(event.target.checked);
    },
    [onCheckboxChange, notification.id] // Dependencies: onCheckboxChange, notification.id
  );

  const handleMarkUnseenCallback = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // console.log(`NotificationItem: handleMarkUnseenCallback called. notification.id: ${notification.id}`);
      onMarkUnseen(notification.id);
    },
    [notification.id, onMarkUnseen] // Dependencies: notification.id, onMarkUnseen
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // console.log(`NotificationItem: handleDeleteClick called for id: ${notificationId}`);
      onDelete(); // Call the parent delete handler
    },
    [onDelete, notificationId] // Dependencies: onDelete, notificationId
  );

   // Helper to translate notification type string (e.g., "user_report" -> "User Report")
  const getTranslatedNotificationType = useCallback((type: string | undefined): string => {
    if (!type) return t('NotificationType_Unknown'); // <-- Translate unknown type
    // Clean up the underscores
    const cleanedType = type.replace(/_/g, ' ').trim();
    // Use a translation key based on the original type string
    // E.g., t('NotificationType_user_report')
    // Provide a fallback using the cleaned string if the specific type key isn't found
    return t(`NotificationType_${type}`, {
      // Default to the cleaned type string if translation key is missing
      defaultMessage: cleanedType || t('NotificationType_Unknown'), // Fallback to Unknown if cleaned is also empty
    });
  }, [t]); // Dependency: t

  // Helper to format Date (specific for item list display)
  const formatDate = useCallback((dateString: string | undefined): string => {
    // Translate unknown date string
    if (!dateString) return t('Date_Unknown'); // <-- Translate

    const date = new Date(dateString);
     // Check for invalid date
     if (isNaN(date.getTime())) return t('Date_Unknown'); // <-- Translate

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      // Use locale for time formatting
      return date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        // hour12: false // Use locale defaults or specify if needed
      });
    } else {
       // Use locale for date formatting
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short'
      });
    }
  }, [locale, t]); // Dependencies: locale, t


  const isSeen = !!notification.seenAt; // Ensure boolean


  return (
    <div
      className={`flex cursor-pointer items-center border-b border-background px-4 py-2 last:border-b-0 ${ // Use border-b and last:border-b-0 instead of border everywhere
        isStarred || !!notification.isImportant ? 'bg-yellow-50' : ''
      } ${isChecked ? 'bg-background-secondary' : ''} ${
        !isSeen ? 'bg-background' : ''
      } ${isHovered ? 'border-primary' : ''}`}
       // Border color logic seems tied to hovered state only in classname, adjust if needed
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* Checkbox */}
      <input
        type='checkbox'
        className='mr-3 h-4 w-4 cursor-pointer rounded border-background text-button-text focus:ring-button'
        checked={isChecked}
        onChange={handleCheckboxChange}
        onClick={e => e.stopPropagation()} // Prevent click from opening detail view
         // Translate aria-label
        aria-label={t('NotificationItem_AriaLabel_Select')} // <-- Translate
      />
      {/* Star Button */}
      <button
        onClick={e => {
          toggleStar();
          e.stopPropagation(); // Prevent click from opening detail view
        }}
        className='mr-3 focus:outline-none'
         // Translate aria-label
        aria-label={t('NotificationItem_AriaLabel_Important')} // <-- Translate
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

      {/* Content Area */}
      {/* Use flex layout for columns instead of grid if not strictly necessary grid behavior */}
      {/* Keeping grid based on original */}
      <div className='grid flex-1 grid-cols-[minmax(0,1.5fr)_minmax(0,4fr)_minmax(0,1.5fr)] items-center gap-2'> {/* Adjusted column widths slightly for better text flow */}

        {/* Column 1: Type */}
        <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
          <span className={`${!isSeen ? 'font-bold' : ''}`}>
             {/* Display translated notification type */}
            {getTranslatedNotificationType(notification.type)} {/* <-- Use translated type */}
          </span>
        </div>

        {/* Column 2: Message Link */}
        <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
          <Link
            href={{
              pathname: '/dashboard',
              query: { ...Object.fromEntries(searchParams), id: notificationId }
            }}
            // locale={locale} // Link with object href handles locale automatically
            className=''
            // No onClick here, let the Link handle navigation on click
          >
            <p className={`${!isSeen ? 'font-bold' : ''} text-sm`}>
              {notification.message} {/* Message content is not translated */}
            </p>
          </Link>
        </div>

        {/* Column 3: Time and Actions */}
        <div className='text-right flex items-center justify-end gap-2'> {/* Use flex to align time/icons */}
          {/* Display time or actions based on hover state */}
          {!isHovered ? (
            <span
              className={`${!isSeen ? 'font-bold' : ''} whitespace-nowrap text-xs`}
            >
              {formatDate(notification.createdAt)} {/* Use updated formatDate helper */}
            </span>
          ) : (
            <div className='flex items-center justify-end space-x-2'>
              {/* Mark Unseen Button */}
              {/* Only show if already seen */}
              {isSeen && (
                  <button
                      onClick={handleMarkUnseenCallback}
                      className='p-1 -m-1 rounded hover:text-blue-500 focus:outline-none transition-colors' // Added padding/margin for click area
                      aria-label={t('NotificationItem_AriaLabel_Unseen')} // <-- Translate
                  >
                      {/* Icon (no text) */}
                      <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-eye'><path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0' /><circle cx='12' cy='12' r='3' /></svg>
                  </button>
              )}
              {/* Delete Button */}
              <button
                onClick={handleDeleteClick}
                 className='p-1 -m-1 rounded hover:text-red-500 focus:outline-none transition-colors' // Added padding/margin for click area
                 aria-label={t('NotificationItem_AriaLabel_Delete')} // <-- Translate
              >
                 {/* Icon (no text) */}
                <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-trash-2'><path d='M3 6h18' /><path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' /><path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' /><line x1='10' x2='10' y1='11' y2='17' /><line x1='14' x2='14' y1='11' y2='17' /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;