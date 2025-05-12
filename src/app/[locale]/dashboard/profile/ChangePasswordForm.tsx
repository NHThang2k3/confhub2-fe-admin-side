// src/app/[locale]/dashboard/profile/ChangePasswordForm.tsx

'use client'
import React from 'react'
import Button from '../../utils/Button' // Assuming this is your Button component (Path might need adjustment based on actual file structure)
import { useChangePassword } from '../../../../hooks/dashboard/profile/useChangePassword'
import { useTranslations } from 'next-intl' // Keep this import

interface ChangePasswordFormProps {
  userId: string
  onClose: () => void
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  userId,
  onClose
}) => {
  // Call the useTranslations hook
  const t = useTranslations('') // Using the default namespace

  const {
    currentPassword,
    newPassword,
    confirmNewPassword,
    error, // Assuming error is a string or key from the hook
    message, // Assuming message is a string or key from the hook
    isLoading,
    step,
    handleCurrentPasswordChange,
    handleNewPasswordChange,
    handleConfirmNewPasswordChange,
    handleConfirmCurrentPassword,
    handleChangePassword
  } = useChangePassword(userId, onClose) // Pass userId and onClose to the hook

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
        <h2 className='mb-4 text-lg font-semibold'>
            {/* Translate Modal Title */}
            {t('Change_Password_Title')} {/* <-- Translate Title */}
        </h2>

        {/* Step 1: Confirm Current Password */}
        {step === 'confirm' && (
          <>
            <label
              htmlFor='currentPassword'
              className='block text-sm font-medium'
            >
               {/* Translate Label */}
              {t('Current_Password_Label')} {/* <-- Translate Label */}
            </label>
            <input
              type='password'
              id='currentPassword'
              name='currentPassword'
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
              className='mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500'
               // Translate aria-label
              aria-label={t('Current_Password_Label')} 
            />
            {/* Error messages from hook - display directly or translate if they are keys */}
            {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
            <div className='mt-4 flex justify-end space-x-4'>
              <Button
                variant='secondary'
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
                onClick={onClose}
                disabled={isLoading}
              >
                 {/* Translate Cancel Button */}
                {t('Cancel_Button')} {/* <-- Translate Button */}
              </Button>
              <Button
                variant='primary'
                onClick={handleConfirmCurrentPassword}
                disabled={isLoading}
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
              >
                 {/* Translate Loading Text and Button Text */}
                {isLoading ? t('Verifying_Button') : t('Confirm_Button')} {/* <-- Translate Loading/Button Text */}
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Change Password */}
        {step === 'change' && (
          <>
            <div>
              <label
                htmlFor='newPassword'
                className='block text-sm font-medium'
              >
                 {/* Translate Label */}
                {t('New_Password_Label')} {/* <-- Translate Label */}
              </label>
              <input
                type='password'
                id='newPassword'
                name='newPassword'
                value={newPassword}
                onChange={handleNewPasswordChange}
                className='mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500'
                 // Translate aria-label
                aria-label={t('New_Password_Label')} 
              />
            </div>
            <div className='mt-4'>
              <label
                htmlFor='confirmNewPassword'
                className='block text-sm font-medium'
              >
                 {/* Translate Label */}
                {t('Confirm_New_Password_Label')} {/* <-- Translate Label */}
              </label>
              <input
                type='password'
                id='confirmNewPassword'
                name='confirmNewPassword'
                value={confirmNewPassword}
                onChange={handleConfirmNewPasswordChange}
                className='mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500'
                 // Translate aria-label
                aria-label={t('Confirm_New_Password_Label')} 
              />
            </div>
             {/* Error/Message from hook - display directly or translate if they are keys */}
            {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
            {message && (
              <p className='mt-2 text-sm text-green-500'>{message}</p>
            )}
            <div className='mt-4 flex justify-end space-x-4'>
              <Button
                variant='secondary'
                onClick={onClose}
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
                disabled={isLoading}
              >
                 {/* Translate Cancel Button */}
                {t('Cancel_Button')} {/* <-- Translate Button */}
              </Button>
              <Button
                variant='primary'
                onClick={handleChangePassword}
                disabled={isLoading}
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
              >
                 {/* Translate Loading Text and Button Text */}
                {isLoading ? t('Changing_Button') : t('Change_Password_Button')} {/* <-- Translate Loading/Button Text */}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChangePasswordForm