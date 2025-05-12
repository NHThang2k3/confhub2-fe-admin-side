// NotificationsTab.tsx
'use client'; // <-- Keep directive

import React, { useEffect, useCallback, useState, useMemo } from 'react';
// Assuming these components will handle their own translations internally
import NotificationItem from './NotificationItem';
import NotificationDetails from './NotificationDetails';

import useNotifications from '../../../../hooks/dashboard/notification/useNotifications'; // Ensure correct path and hook handles data fetching/state
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl'; // Keep this import

const NotificationsTab: React.FC = () => {
  // Call the useTranslations hook (already present)
  const t = useTranslations(''); // Using the default namespace

  // Use the hook to get data and handlers
  const {
    notifications, // Full list (sorted from hook)
    checkedIndices, // Selected items by ID
    selectAllChecked,
    loading,
    loggedIn, // Auth status from hook
    searchTerm, // Search term from hook
    filteredNotifications, // List filtered by search (and sorted) from hook
    handleUpdateSeenAt, // Handler from hook
    handleToggleImportant, // Handler from hook
    handleDeleteNotification, // Handler from hook
    handleMarkUnseen, // Handler from hook
    handleCheckboxChangeTab, // Handler from hook
    handleDeleteSelected, // Handler from hook
    handleSelectAllChange, // Handler from hook
    handleMarkSelectedAsRead, // Handler from hook
    handleMarkSelectedAsUnread, // Handler from hook
    allSelectedAreRead, // Derived state from hook
    handleMarkSelectedAsImportant, // Handler from hook
    handleMarkSelectedAsUnimportant, // Handler from hook
    allSelectedAreImportant, // Derived state from hook
    setSearchTerm // Setter for search term from hook
    // fetchData (not used directly here)
  } = useNotifications();

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedNotificationId = searchParams.get('id');
  const tab = searchParams.get('tab'); // Get 'tab' param

  // State for UI filters (All, Unread, Read, Important) - Component state
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'important'>(
    'all'
  );

  // Handle marking as seen when viewing details
  useEffect(() => {
    // Only update if a notification ID is selected and it's not already seen
    if (selectedNotificationId) {
      // Find in the original list (notifications) because filtered list might not contain it
      const notification = notifications.find(
        n => n.id === selectedNotificationId
      );
      if (notification && !notification.seenAt) {
        // console.log(`NotificationsTab: useEffect - Updating seenAt for id: ${selectedNotificationId}`);
        handleUpdateSeenAt(selectedNotificationId);
      }
    }
    // Dependencies: selectedNotificationId, handleUpdateSeenAt, and notifications (since we access notifications.find)
  }, [selectedNotificationId, handleUpdateSeenAt, notifications]);

  // Handle navigation back to the list view
  const handleBackToNotifications = useCallback(() => {
    // console.log('NotificationsTab: handleBackToNotifications called');
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('id'); // Remove the 'id' parameter
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }, [pathname, router, searchParams]); // Dependencies: pathname, router, searchParams

  // Memoize the checkbox change handler provided to NotificationItem
  // It simply calls the handler from the hook
  const handleCheckboxChange = useCallback(
    (notificationId: string, checked: boolean) => {
      // console.log(`NotificationsTab: handleCheckboxChange called for id: ${notificationId}, checked: ${checked}`);
      handleCheckboxChangeTab(notificationId, checked);
    },
    [handleCheckboxChangeTab] // Dependency: the hook's handler
  );

  // --- APPLY UI FILTERS ---
  // Apply additional filtering based on the component's `filter` state
  // Input is `filteredNotifications` from the hook (already filtered by searchTerm and sorted)
  const displayedNotifications = useMemo(() => {
    // console.log(`NotificationsTab: Applying UI filter: ${filter}`);
    if (filter === 'unread') {
      return filteredNotifications.filter(n => !n.seenAt);
    } else if (filter === 'read') {
      return filteredNotifications.filter(n => n.seenAt);
    } else if (filter === 'important') {
      // Ensure isImportant is a boolean or treat appropriately
      return filteredNotifications.filter(n => !!n.isImportant); // Use !! to ensure boolean check
    }
    // If filter is 'all', return the list from the hook (already filtered by search and sorted)
    return filteredNotifications;
     // --- NO NEED TO SORT AGAIN HERE ---
  }, [filteredNotifications, filter]); // Dependencies: filtered list from hook, and UI filter state

  // --- Render Logic ---

  // Check authentication status first (if useAuthApi is used directly or via hook)
  // Assuming `loggedIn` from the hook handles this.
  if (!loggedIn) {
    return (
      <div className='container mx-auto p-4'>
        {/* Translate login required message (already uses t) */}
        {t('Please_log_in_to_view_notifications')}
      </div>
    );
  }

  // Check the 'tab' search parameter to control visibility (logic unchanged)
  // This ensures the component only renders its content when the 'notifications' tab is active.
  if (tab !== 'notifications') {
    return null; // Render nothing if this isn't the active tab
  }

  // Show loading indicator if the hook indicates loading (e.g., initial fetch)
  if (loading) {
    return <div className='container mx-auto p-4'>{t('Loading')}</div>; // Translate loading message (already uses t)
  }

  // If a notification ID is selected, show the detail view
  if (selectedNotificationId) {
    // Find the notification in the *full* list (notifications) as it might be filtered out
    const notification = notifications.find(
      n => n.id === selectedNotificationId
    );
    if (notification) {
      return (
        // NotificationDetails component should handle its own translations internally
        <NotificationDetails
          notification={notification}
          onBack={handleBackToNotifications}
          onDelete={handleDeleteNotification} // Use handler from hook
          onToggleImportant={handleToggleImportant} // Use handler from hook
        />
      );
    } else {
      // Handle case where ID is in URL but notification not found (e.g., deleted)
      console.warn(
        `Notification with id ${selectedNotificationId} not found in the list.`
      );
      return (
        <div className='container mx-auto p-4'>
          {/* Translate not found message (already uses t) */}
          {t('Notification_not_found')}{' '}
          <button
            onClick={handleBackToNotifications}
            className='text-blue-600 hover:underline'
          >
            {/* Translate Back button text (already uses t) */}
            {t('Back')}
          </button>
        </div>
      );
    }
  }

  // If no notification ID is selected, show the list view
  return (
    <div className='container mx-auto p-2 md:p-6'>
      {/* Search Bar */}
      <div className='mb-4 '>
        <input
          type='text'
          // Translate placeholder - remove fallback
          placeholder={t('Search_notifications')} // <-- Use t() only
          className='w-full rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-button'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* UI Filter Buttons */}
      <div className='mb-4 flex flex-wrap gap-2'>
        <button
          onClick={() => setFilter('all')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'all' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
          {/* Translate button text (already uses t) */}
          {t('All')}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'unread' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
           {/* Translate button text (already uses t) */}
          {t('Unread')}
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'read' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
           {/* Translate button text (already uses t) */}
          {t('Read')}
        </button>
        <button
          onClick={() => setFilter('important')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'important' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
           {/* Translate button text (already uses t) */}
          {t('Important')}
        </button>
      </div>

      {/* Bulk Actions Bar */}
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='select-all'
            className='ml-4 mr-2 h-4 w-4 cursor-pointer rounded border-gray-30 text-blue-600 focus:ring-button'
            checked={selectAllChecked}
            onChange={handleSelectAllChange}
             // Translate aria-label
            aria-label={t('Select_all_notifications_aria_label')} // <-- Translate aria-label
            disabled={filteredNotifications.length === 0}
          />
          <label htmlFor='select-all' className='mr-4 cursor-pointer text-sm'>
             {/* Translate label text (already uses t) */}
            {t('Select_All')}
          </label>
        </div>
        {checkedIndices.length > 0 && (
          <>
            {/* Mark Read/Unread Button */}
            <button
              onClick={
                allSelectedAreRead
                  ? handleMarkSelectedAsUnread
                  : handleMarkSelectedAsRead
              }
              className='flex min-w-[110px] items-center justify-center rounded bg-button px-2 py-1 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 md:min-w-[140px] md:px-3 md:text-base'
               // Translate aria-label
              aria-label={
                allSelectedAreRead
                   ? t('Mark_Selected_as_Unread_aria_label') // <-- Translate aria-label
                   : t('Mark_Selected_as_Read_aria_label') // <-- Translate aria-label
              }
            >
              {allSelectedAreRead ? (
                <>
                  {/* Icon (no text) */}
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='mr-1 md:mr-2'><rect width='20' height='16' x='2' y='4' rx='2' /><path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' /></svg>
                  {/* Translate button text (already uses t) */}
                  <span className='truncate'>{t('Mark_As_Unread')}</span>
                </>
              ) : (
                <>
                   {/* Icon (no text) */}
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='mr-1 md:mr-2'><path d='M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z' /><path d='m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10' /></svg>
                  {/* Translate button text (already uses t) */}
                  <span className='truncate'>{t('Mark_As_Read')}</span>
                </>
              )}
            </button>
            {/* Mark Important/Unimportant Button */}
            <button
              onClick={
                allSelectedAreImportant
                  ? handleMarkSelectedAsUnimportant
                  : handleMarkSelectedAsImportant
              }
              className='flex min-w-[110px] items-center justify-center rounded bg-yellow-500 px-2 py-1 text-sm font-bold text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:min-w-[140px] md:px-3 md:text-base'
              aria-label={
                allSelectedAreImportant
                   ? t('Mark_Selected_as_Unimportant_aria_label') // <-- Translate aria-label
                   : t('Mark_Selected_as_Important_aria_label') // <-- Translate aria-label
              }
            >
              {allSelectedAreImportant ? (
                <>
                   {/* Icon (no text) */}
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='mr-1 md:mr-2'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' /></svg>
                  {/* Translate button text (already uses t) */}
                  <span className='truncate'>{t('Mark_As_Unimportant')}</span>
                </>
              ) : (
                <>
                  {/* Icon (no text) */}
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='currentColor' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='mr-1 md:mr-2'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' /></svg>
                  {/* Translate button text (already uses t) */}
                  <span className='truncate'>{t('Mark_As_Important')}</span>
                </>
              )}
            </button>
            {/* Delete Selected Button */}
            <button
              onClick={handleDeleteSelected}
              className='flex min-w-[110px] items-center justify-center rounded bg-red-500 px-2 py-1 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 md:min-w-[140px] md:px-3 md:text-base'
               // Translate aria-label
              aria-label={t('Delete_Selected_aria_label')} // <-- Translate aria-label
            >
               {/* Icon (no text) */}
              <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='mr-1 md:mr-2'><path d='M3 6h18' /><path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' /><path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' /><line x1='10' x2='10' y1='11' y2='17' /><line x1='14' x2='14' y1='11' y2='17' /></svg>
               {/* Translate button text (already uses t) */}
              <span className='truncate'>{t('Delete_Selected')}</span>
            </button>
          </>
        )}
      </div>

      {/* Notification List */}
      <div className='overflow-hidden rounded border bg-white-pure shadow'>
        {displayedNotifications.length === 0 ? (
          <p className='p-4 text-center '>
             {/* Translate empty state message - remove fallback */}
            {t('You_have_no_notifications_matching_criteria')} 
          </p>
        ) : (
          // Render NotificationItem for each notification in the filtered/sorted list
          displayedNotifications.map(notification => (
            // NotificationItem component should handle its own translations internally
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDelete={() => handleDeleteNotification(notification.id)} // Handler from hook
              isChecked={checkedIndices.includes(notification.id)} // State from hook
              onCheckboxChange={
                checked => handleCheckboxChange(notification.id, checked) // Memoized handler
              }
              onToggleImportant={handleToggleImportant} // Handler from hook
              onMarkUnseen={handleMarkUnseen} // Handler from hook
               // notificationId prop seems redundant if notification.id is used directly in item
               // Keeping for now, but consider removing
              notificationId={notification.id}
              locale={locate}
              // Pass t down if NotificationItem doesn't use useTranslations
              // t={t} // Not needed if NotificationItem adds useTranslations
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;