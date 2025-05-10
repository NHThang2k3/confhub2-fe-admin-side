// SettingTab.tsx
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLocalStorage } from 'usehooks-ts'
import { useRouter, usePathname } from 'next/navigation'
import deleteUser from '../../../../app/api/user/deleteUser' // Adjust path if needed
import {
  getUserSettings,
  useUpdateUser
} from '../../../../hooks/dashboard/setting/useUpdateSettings' // Adjust path if needed
import { useGetUser } from '../../../../hooks/dashboard/setting/useGetUser' // Adjust path if needed
import { Setting } from '@/src/models/response/user.response' // Adjust path if needed
import { get } from 'lodash'
import { updateNotifications } from '@/src/app/api/user/updateNotifications'

// Helper type for setting keys used in toggles
type ToggleSettingKey = keyof Pick<
  Setting,
  | 'receiveNotifications'
  | 'autoAddFollowToCalendar'
  | 'notificationWhenConferencesChanges'
  | 'upComingEvent'
  | 'notificationWhenUpdateProfile'
  | 'notificationWhenFollow'
  | 'notificationWhenAddTocalendar'
  | 'notificationWhenAddToBlacklist'
  | 'notificationThroughEmail'
>

const SettingTab: React.FC = () => {
  const t = useTranslations('')
  const [localUser, setLocalUser] = useLocalStorage<{ id: string } | null>(
    'user',
    null
  )

  const [setting, setSetting] = useState<Setting | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()
  const {
    updateUserSetting,
    loading: updateLoading,
    error: updateError
  } = useUpdateUser()
  async function fetchUserSettings() {
    setLoading(true)
    const userSetting = await getUserSettings()
    if (userSetting) {
      setSetting(userSetting)
    }
    setLoading(false)
  }
  useEffect(() => {
    fetchUserSettings()
  }, [])

  // Centralized toggle handler
  const handleToggle = async (settingKey: ToggleSettingKey) => {
    if (setting) {
      const currentValue = setting[settingKey]

      const newSetting = {
        ...setting,
        [settingKey]: !currentValue
      }
      // Optimistic update locally first
      setSetting(prev =>
        prev ? { ...prev, [settingKey]: !currentValue } : null
      )
      try {
        await updateUserSetting(newSetting)
        await fetchUserSettings() // Refetch settings after update
      } catch (error) {
        // Revert optimistic update on error
        setSetting(prev =>
          prev ? { ...prev, [settingKey]: currentValue } : null
        )
        // Optional: Show error to user based on updateError from the hook
        console.error(`Failed to update setting ${settingKey}:`, error)
      }
    }
  }

  const handleDeleteAccount = async () => {
    // Use window.confirm for simple confirmation
    if (
      window.confirm(
        t('Delete_Account_Confirmation') || // Use translation key
          'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      setIsDeleting(true)
      setDeleteError(null)

      try {
        if (!localUser?.id) {
          // Check for id specifically
          setDeleteError(t('Error_UserNotLoggedIn') || 'User not logged in.')
          setIsDeleting(false) // Reset deleting state
          return
        }
        await deleteUser(localUser.id)
        setLocalUser(null) // Clear user from local storage

        // Redirect logic (as before)
        let pathWithLocale = '/auth/login'
        if (pathname) {
          const pathParts = pathname.split('/')
          if (pathParts.length > 1 && pathParts[1].length === 2) {
            // Basic locale check
            const localePrefix = pathParts[1]
            pathWithLocale = `/${localePrefix}/auth/login`
          }
        }
        router.push(pathWithLocale)
      } catch (error: any) {
        const errorMessage =
          error.message ||
          t('Error_DeleteAccountFailed') ||
          'Failed to delete account.'
        setDeleteError(errorMessage)
        console.error('Failed to delete account:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // --- Render Logic ---
  if (loading) {
    return <div data-testid='loading-state'>{t('Loading_settings')}</div>
  }

  // if (userError) {
  //   return (
  //     <div data-testid='error-state'>
  //       {t('Error')}: {userError}
  //     </div>
  //   )
  // }

  if (!setting) {
    return <div data-testid='no-data-state'>{t('No_user_data_available')}</div>
  }

  // --- Main Component Render ---
  return (
    <div className='flex w-full'>
      <main className='flex-1 p-8'>
        <header className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold md:text-2xl'>{t('Setting')}</h2>
        </header>

        <section className='mb-8'>
          {/* Option 1: Receive Notifications */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{t('Receive_Notifications')}</h4>
              <p className=' text-sm'>
                {t('Receive_Notifications_Description')}.
              </p>
            </div>
            <button
              data-testid='toggle-receiveNotifications'
              className={`h-6 w-12 min-w-[3rem] rounded-full transition-colors duration-200 focus:outline-none ${
                // Fixed width
                setting.receiveNotifications
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={() => handleToggle('receiveNotifications')}
              disabled={updateLoading}
              aria-pressed={setting.receiveNotifications} // Accessibility
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.receiveNotifications
                    ? 'translate-x-7' // Adjusted for fixed width
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 2: Auto add events to schedule */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>
                {t('Auto_add_events_to_schedule')}
              </h4>
              <p className=' text-sm'>
                {t('Auto_add_events_to_schedule_describe')}.
              </p>
            </div>
            <button
              data-testid='toggle-autoAddFollowToCalendar'
              className={`h-6 w-12 min-w-[3rem] rounded-full transition-colors duration-200 focus:outline-none ${
                setting.autoAddFollowToCalendar
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={() => handleToggle('autoAddFollowToCalendar')}
              disabled={updateLoading}
              aria-pressed={setting.autoAddFollowToCalendar}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.autoAddFollowToCalendar
                    ? 'translate-x-7'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 3: Change and Update */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{t('Change_and_Update')}</h4>
              <p className=' text-sm'>{t('Change_and_Update_describe')}</p>
            </div>
            <button
              data-testid='toggle-notificationWhenConferencesChanges'
              className={`h-6 w-12 min-w-[3rem] rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationWhenConferencesChanges
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={() => handleToggle('notificationWhenConferencesChanges')}
              disabled={updateLoading}
              aria-pressed={setting.notificationWhenConferencesChanges}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenConferencesChanges
                    ? 'translate-x-7'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 4: Your upcoming event */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{t('Your_upcoming_event')}</h4>
              <p className=' text-sm'>{t('Your_upcoming_event_describe')}</p>
            </div>
            <button
              data-testid='toggle-upComingEvent'
              className={`h-6 w-12 min-w-[3rem] rounded-full transition-colors duration-200 focus:outline-none ${
                setting.upComingEvent ? 'bg-button' : 'bg-background-secondary'
              }`}
              onClick={() => handleToggle('upComingEvent')}
              disabled={updateLoading}
              aria-pressed={setting.upComingEvent}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.upComingEvent ? 'translate-x-7' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 5: Customize notification delivery (Combobox) */}
          <div className='mb-4 items-center justify-between md:flex'>
            <div>
              <h4 className='font-semibold'>
                {t('Customize_notification_delivery')}
              </h4>
              <p className=' text-sm'>
                {t('Customize_notification_delivery_describe')}
              </p>
            </div>
            <button
              data-testid='toggle-notificationWhenUpdateProfile'
              className={`h-6 w-12 min-w-[3rem] rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationThroughEmail
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={() => handleToggle('notificationThroughEmail')}
              disabled={updateLoading}
              aria-pressed={setting.notificationThroughEmail}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenUpdateProfile
                    ? 'translate-x-7'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 6: Notification when update profile */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>
                {t('Notification_when_update_profile')}
              </h4>
              <p className=' text-sm'>
                {t('Notification_when_update_profile_description')}
              </p>
            </div>
            <button
              data-testid='toggle-notificationWhenUpdateProfile'
              className={`h-6 w-12 min-w-[3rem] rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationWhenUpdateProfile
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={() => handleToggle('notificationWhenUpdateProfile')}
              disabled={updateLoading}
              aria-pressed={setting.notificationWhenUpdateProfile}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenUpdateProfile
                    ? 'translate-x-7'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 7: Notification when follow */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{t('Notification_when_follow')}</h4>
              <p className=' text-sm'>
                {t('Notification_when_follow_description')}
              </p>
            </div>
            <button
              data-testid='toggle-notificationWhenFollow'
              className={`h-6 w-12 min-w-[3rem] rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationWhenFollow
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={() => handleToggle('notificationWhenFollow')}
              disabled={updateLoading}
              aria-pressed={setting.notificationWhenFollow}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenFollow
                    ? 'translate-x-7'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 8: Notification when add to calendar */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>
                {t('Notification_when_add_to_calendar')}
              </h4>
              <p className=' text-sm'>
                {t('Notification_when_add_to_calendar_description')}
              </p>
            </div>
            <button
              data-testid='toggle-notificationWhenAddTocalendar'
              className={`h-6 w-12 min-w-[3rem] rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationWhenAddTocalendar
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={() => handleToggle('notificationWhenAddTocalendar')}
              disabled={updateLoading}
              aria-pressed={setting.notificationWhenAddTocalendar}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenAddTocalendar
                    ? 'translate-x-7'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 9: Notification when add to blacklist */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>
                {t('Notification_when_add_to_blacklist')}
              </h4>
              <p className=' text-sm'>
                {t('Notification_when_add_to_blacklist_description')}
              </p>
            </div>
            <button
              data-testid='toggle-notificationWhenAddToBlacklist'
              className={`h-6 w-12 min-w-[3rem] rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationWhenAddToBlacklist
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={() => handleToggle('notificationWhenAddToBlacklist')}
              disabled={updateLoading}
              aria-pressed={setting.notificationWhenAddToBlacklist}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenAddToBlacklist
                    ? 'translate-x-7'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>
        </section>

        {/* Delete Account */}
        <section>
          <button
            data-testid='delete-account-button'
            onClick={handleDeleteAccount}
            disabled={isDeleting || updateLoading} // Also disable if settings are updating
            className={`focus:shadow-outline rounded px-4 py-2 font-semibold text-white transition-colors duration-200 ${
              isDeleting || updateLoading
                ? 'cursor-not-allowed bg-red-400'
                : 'bg-red-500 hover:bg-red-600'
            } focus:outline-none`}
          >
            {isDeleting ? t('Deleting') : t('Delete_Account')}
          </button>
          {deleteError && (
            <p data-testid='delete-error' className='mt-2 text-sm text-red-500'>
              {deleteError}
            </p>
          )}
          <p className='mt-2 text-sm text-red-600'>
            {t('Delete_Account_describe')}
          </p>
        </section>
        {updateError && (
          <p data-testid='update-error' className='mt-4 text-red-500'>
            {t('Error_UpdateFailed')}: {updateError}
          </p>
        )}
      </main>
    </div>
  )
}

export default SettingTab
