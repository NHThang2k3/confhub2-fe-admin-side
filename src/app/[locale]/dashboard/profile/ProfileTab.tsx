// src/components/ProfileTab.tsx
'use client' // <-- Ensure this is present if using hooks like useState, useEffect, useTranslations

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Button from '../../utils/Button' // Assuming this is your Button component
import { useTranslations } from 'next-intl' // Keep this import
import { useUserData } from '@/src/hooks/dashboard/profile/useUserData'
import { useEditProfile } from '@/src/hooks/dashboard/profile/useEditProfile'
import ChangePasswordForm from './ChangePasswordForm' // Make sure this import path is correct relative to ProfileTab.tsx

const ProfileTab: React.FC = () => {
  // Call the useTranslations hook
  const t = useTranslations('') // Using the default namespace

  // Use the hook to get loading, error, and data states
  const { userData, loading, error } = useUserData()

  // useEditProfile hook - assuming it handles its own state and doesn't need translation logic here
  const { editedData, setEditedData } = useEditProfile(userData)

  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false)

  // --- START: Sửa lỗi Hydration cho Date of Birth (Giữ nguyên, cái này đúng) ---
  const [formattedDob, setFormattedDob] = useState<string | null>(null)

  useEffect(() => {
    if (userData?.dob) {
      try {
        const date = new Date(userData.dob)
        if (!isNaN(date.getTime())) {
          setFormattedDob(date.toLocaleDateString())
        } else {
          console.error('Invalid date format received for dob:', userData.dob)
           // Use translated string for invalid date
          setFormattedDob(t('Invalid_Date')) // <-- Already uses t()
        }
      } catch (e) {
        console.error('Error formatting date:', e)
         // Use translated string for formatting error
        setFormattedDob(t('Invalid_Date')) // <-- Already uses t()
      }
    } else {
      setFormattedDob(null)
    }
  }, [userData?.dob, t]) // Dependency 't' is correctly included
  // --- END: Sửa lỗi Hydration ---

  // Handle loading state from the hook
  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        {/* Translate loading spinner text if any */}
        <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900'></div>
         {/* Optional: <p className="mt-4 text-gray-700">{t('Loading_Profile')}</p> */}
      </div>
    )
  }

  // Handle error state from the hook
  // Assuming the 'error' string from the hook is either already translated or is a technical message.
  // If it's a key that needs translation, you'd do: <p>{t(error)}</p>
  if (error) {
    return <div className='py-4 text-center text-red-500'>{error}</div>
  }

  // Handle case where loading is false, no error, but no user data (fallback)
  if (!userData) {
    return (
      <div className='py-4 text-center'>
        {/* Translate this fallback message */}
        {t('No_user_data_found_or_not_logged_in')} {/* <-- Already uses t() */}
      </div>
    )
  }

  // If userData exists, render the profile UI
  const displayAvatarUrl =
    editedData.avatar || userData.avatar || '/avatar1.jpg' // Default avatar - consider if this needs translation or is a fixed asset path
  const displayBackgroundUrl =
    editedData.background || userData.background || '/bg-2.jpg' // Default background - consider if this needs translation or is a fixed asset path

  const handleChangePasswordClick = () => {
    setShowChangePasswordForm(true)
  }

  return (
    <div className='w-full overflow-hidden rounded-lg bg-background shadow-md md:px-12 md:py-8'>
      {/* Cover Photo - alt text could be translated */}
      <div className='relative h-60 overflow-hidden rounded-lg md:h-80'>
        <Image
          src={displayBackgroundUrl}
          alt={t('Cover_Photo_Alt')} // <-- Translate alt text
          fill
          style={{ objectFit: 'cover' }}
          sizes='100vw'
          priority
        />
      </div>

      {/* Profile Info Section */}
      <div className='relative flex flex-col items-center gap-5 py-5 md:flex-row md:items-center md:px-6'>
        <div className='relative -mt-40 h-40 w-40 overflow-hidden rounded-full border-4 border-button-text bg-background'>
          <img
            src={displayAvatarUrl}
             // Translate alt text
            alt={t('Avatar_Alt', { firstName: userData.firstName, lastName: userData.lastName })} // <-- Translate alt text with interpolation
            className='h-full w-full object-cover'
          />
        </div>

        {/* Name and Title - Names typically not translated */}
        <div className='flex-grow'>
          <h1 className='text-center text-xl font-bold md:text-left md:text-3xl'>
            {userData.firstName} {userData.lastName}
            {/* Add user title here if available and needs translation */}
            {/* {userData.title && <span className="block text-sm text-gray-600">{t(`Title_${userData.title}`)}</span>} */}
          </h1>
        </div>
      </div>

      {/* Edit/Display Section */}
      <div className='border-t border-background p-6'>
        <div className='flex justify-center space-x-4 md:justify-end'>
          <Button
            variant='primary'
            onClick={handleChangePasswordClick}
            className='rounded-md px-4 py-2 focus:outline-none focus:ring-2'
          >
            {/* Translate button text */}
            {t('Change_Password_Button')} {/* <-- Use specific key for button */}
          </Button>
        </div>

        <div className='mt-4 space-y-2'>
          <p>
            {/* Translate label */}
            <span className='font-semibold'>{t('Email_Label')}:</span>{' '} {/* <-- Translate label */}
            <a className='text-button hover:underline'>{userData.email}</a> {/* Email itself not translated */}
          </p>

          {formattedDob && (
            <p>
              {/* Translate label */}
              <span className='font-semibold'>{t('Date_of_Birth_Label')}:</span>{' '} {/* <-- Use specific key for label */}
              {formattedDob} {/* Formatted date string */}
            </p>
          )}
           {/* Add other profile fields here and translate labels */}
           {/* Example: */}
           {/* <p>
                <span className='font-semibold'>{t('Location_Label')}:</span>{' '}
                {userData.location || t('Not_Provided')}
           </p> */}
        </div>
      </div>

      {showChangePasswordForm && (
        <ChangePasswordForm
          userId={userData.id}
          onClose={() => setShowChangePasswordForm(false)}
        />
      )}
    </div>
  )
}

export default ProfileTab