// components/Header/header/NotificationDropdown.tsx (NotificationDropdown Component)
'use client'; // <-- Keep directive

import { FC, useEffect, useCallback, useMemo } from 'react';
import { Link } from '@/src/navigation'; // Ensure this is next-intl Link
import { Notification } from '../../../../models/response/user.response'; // Import types
import { useTranslations } from 'next-intl'; // Keep this import
import { timeAgo } from '../../dashboard/timeFormat'; // Ensure correct import path for the helper
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Needed for Markdown features
import rehypeRaw from 'rehype-raw'; // Needed for raw HTML
import DOMPurify from 'dompurify'; // Needed for sanitization (client-side only)

interface Props {
  notifications: Notification[];
  isNotificationOpen: boolean;
  closeAllMenus: () => void;
  locale: string; // Keep locale prop
  fetchNotifications: () => void;
  isLoadingNotifications: boolean;
  markAllAsRead: () => Promise<void>;
}

const NotificationDropdown: FC<Props> = ({
  notifications,
  isNotificationOpen,
  closeAllMenus,
  locale, // Destructure locale
  fetchNotifications,
  isLoadingNotifications,
  markAllAsRead
}) => {
  // Call the useTranslations hook (already present)
  const t = useTranslations(''); // Using the default namespace

  // NOTE: The original code derived 'language' from t('language').
  // This is likely incorrect. The timeAgo helper should receive the actual locale code ('en', 'vi').
  // We will remove the language variable and pass 'locale' directly to timeAgo.
  // const language = t('language'); // Removed this line

  // --- STEP 1: SORT NOTIFICATIONS ---
  const sortedNotifications = useMemo(() => {
    // Create a copy and sort by createdAt descending (newest first)
    return [...notifications].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const validTimeA = !isNaN(timeA) ? timeA : 0;
      const validTimeB = !isNaN(timeB) ? timeB : 0;
      return validTimeB - validTimeA; // Newest first
    });
  }, [notifications]); // Only resort when notifications array changes

  const memoizedFetchNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]); // Dependencies: fetchNotifications

  useEffect(() => {
    if (isNotificationOpen) {
      memoizedFetchNotifications();
    }
  }, [isNotificationOpen, memoizedFetchNotifications]); // Dependencies: isNotificationOpen, memoizedFetchNotifications

  // Function to group notifications (unchanged logic)
  const groupNotifications = useCallback(
    (notificationsToGroup: Notification[]) => {
      const now = new Date();
      const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000;

      // Filter based on the input sorted array
      const newNotificationsGroup = notificationsToGroup.filter(
        n => n.createdAt && !isNaN(new Date(n.createdAt).getTime()) && new Date(n.createdAt).getTime() >= oneDayAgo
      );
      const earlierNotificationsGroup = notificationsToGroup.filter(
        n => n.createdAt && !isNaN(new Date(n.createdAt).getTime()) && new Date(n.createdAt).getTime() < oneDayAgo
      );
      // Order within these groups will be preserved from the input sorted array
      return {
        newNotifications: newNotificationsGroup,
        earlierNotifications: earlierNotificationsGroup
      };
    },
    [] // Dependencies: Empty - logic depends only on built-in Date and numbers
  );

  // --- STEP 2: USE THE SORTED LIST FOR GROUPING ---
  // Call the grouping function with `sortedNotifications`
  const { newNotifications, earlierNotifications } =
    groupNotifications(sortedNotifications);
  // --- END OF USING SORTED ---

  // Function to render a single notification item (unchanged core logic)
  const renderNotificationItem = useCallback(
    (notification: Notification) => {
      // DOMPurify only runs on the client
      const sanitizedMessage =
        typeof window !== 'undefined'
          ? DOMPurify.sanitize(notification.message)
          : notification.message; // Fallback for SSR (though this component is client-only)

      return (
        // Link component handles locale internally when href object is used
        <Link
          href={{
            pathname: `/dashboard`,
            query: { tab: 'notifications', id: notification.id }
          }}
          // locale={locale} // locale prop is automatically handled by next-intl Link when used with an object href
          key={notification.id}
          // onClick={closeAllMenus} // Click handler might interfere with default Link navigation
        >
          <div
            className={`flex items-start border-b border-gray-20 p-4 hover:bg-gray-5 ${notification.seenAt ? '' : 'bg-gray-10'}`}
          >
            <div className='mr-3 flex-shrink-0'>
              <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-20'>
                <span className='font-medium '>
                   {/* Display first letter of type - type itself is not translated here */}
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
              {/* ReactMarkdown renders user-provided message, not translatable UI text */}
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
                   // Assuming div might be used for text wrapping within message
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
              {/* Display time ago - Pass the actual locale */}
              <span className='text-xs '>
                {/* NOTE: Ensure the timeAgo helper itself translates strings like "just now", "X minutes ago", "Invalid Date" using the provided locale. */}
                {timeAgo(notification.createdAt, locale)} {/* <-- Pass actual locale */}
              </span>
            </div>
          </div>
        </Link>
      );
    },
    [/* closeAllMenus, */ locale] // Dependencies: closeAllMenus (if used), locale
  );

  // handleMarkAllAsRead function (unchanged logic)
  const handleMarkAllAsRead = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent click from bubbling up to close dropdown
      await markAllAsRead();
      fetchNotifications(); // Keep fetch if needed after marking
    },
    [markAllAsRead, fetchNotifications] // Dependencies: markAllAsRead, fetchNotifications
  );


  // JSX Render (unchanged structure)
  return (
    <div
      className={`absolute right-0 z-50 mr-8 mt-10 w-80 overflow-hidden rounded-lg bg-white-pure shadow-xl transition-all duration-300 ease-in-out md:w-[400px] ${
        isNotificationOpen
          ? 'visible translate-y-0 opacity-100'
          : 'invisible translate-y-1 opacity-0'
      }`}
      style={{
        inset: '0px 0px auto auto'
      }}
      // Stop propagation so clicks inside the dropdown don't close the parent header menu
      onClick={e => e.stopPropagation()}
    >
      <div className='border-b border-gray-20 p-4'>
        <div className='flex items-center justify-between'>
          <h6 className='text-sm font-semibold md:text-lg'>
             {/* Translate title */}
            {t('Notifications')} {/* <-- Already uses t() */}
          </h6>
          <button
            className=' text-sm text-button hover:text-blue-800'
            onClick={handleMarkAllAsRead}
          >
            {/* Translate button text */}
            {t('Mark All As Read')} {/* <-- Already uses t() */}
          </button>
        </div>
      </div>

      <div className='overflow-y-auto' style={{ maxHeight: '25rem' }}>
        {isLoadingNotifications ? (
          <div className='p-4 text-center text-gray-50'>
             {/* Translate loading message */}
            {t('Loading')} {/* <-- Already uses t() */}
          </div>
        ) : sortedNotifications.length > 0 ? (
          <>
            {newNotifications.length > 0 && (
              <>
                <div className='border-b border-gray-20 px-4 py-2 text-sm font-semibold '>
                   {/* Translate group header */}
                  {t('NEW')} {/* <-- Already uses t() */}
                </div>
                {newNotifications.map(renderNotificationItem)}
              </>
            )}
            {earlierNotifications.length > 0 && (
              <>
                <div className='border-b border-gray-20 px-4 py-2 text-sm font-semibold '>
                   {/* Translate group header */}
                  {t('EARLIER')} {/* <-- Already uses t() */}
                </div>
                {earlierNotifications.map(renderNotificationItem)}
              </>
            )}
          </>
        ) : (
           /* Translate empty state message */
          <div className='p-4 text-center '>{t('No_new_notifications')}</div> /* <-- Already uses t() */
        )}
      </div>

      <div className='border-t border-gray-20 p-4 text-center'>
        <Link
          href={{ pathname: `/dashboard`, query: { tab: 'notifications' } }}
          locale={locale} // Pass locale to Link component
          onClick={closeAllMenus}
        >
          <div className='block text-sm text-button hover:text-blue-800'>
             {/* Translate button text */}
            {t('View_all')} {/* <-- Already uses t() */}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;