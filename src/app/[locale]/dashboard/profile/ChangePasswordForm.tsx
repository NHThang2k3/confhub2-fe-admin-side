'use client'
import React from 'react'
import Button from '../../utils/Button' // Assuming you have a Button component
import { useChangePassword } from '../../../../hooks/dashboard/profile/useChangePassword'
import { useTranslations } from 'next-intl'

interface ChangePasswordFormProps {
  userId: string
  onClose: () => void // Callback to close the form
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  userId,
  onClose
}) => {
  const t = useTranslations('')

  const {
    currentPassword,
    newPassword,
    confirmNewPassword,
    error,
    message,
    isLoading,
    step,
    handleCurrentPasswordChange,
    handleNewPasswordChange,
    handleConfirmNewPasswordChange,
    handleConfirmCurrentPassword,
    handleChangePassword
  } = useChangePassword(userId, onClose) // Pass userId and onClose

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
        <h2 className='mb-4 text-lg font-semibold'>{t('Change_Password')}</h2>

        {/* Step 1: Confirm Current Password */}
        {step === 'confirm' && (
          <>
            <label
              htmlFor='currentPassword'
              className='block text-sm font-medium'
            >
              {t('Current_Password')}
            </label>
            <input
              type='password'
              id='currentPassword'
              name='currentPassword'
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
              className='mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500'
              aria-label={t('Current_Password')} // Added aria-label for better testing if needed
            />
            {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
            <div className='mt-4 flex justify-end space-x-4'>
              <Button
                variant='secondary'
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
                onClick={onClose}
                disabled={isLoading}
              >
                {t('Cancel')}
              </Button>
              <Button
                variant='primary'
                onClick={handleConfirmCurrentPassword}
                disabled={isLoading}
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
              >
                {isLoading ? t('Verifying') : t('Confirm')}
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
                {t('New_Password')}
              </label>
              <input
                type='password'
                id='newPassword'
                name='newPassword'
                value={newPassword}
                onChange={handleNewPasswordChange}
                className='mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500'
                aria-label={t('New_Password')} // Added aria-label for better testing if needed
              />
            </div>
            <div className='mt-4'>
              <label
                htmlFor='confirmNewPassword'
                className='block text-sm font-medium'
              >
                {t('Confirm_New_Password')}
              </label>
              <input
                type='password'
                id='confirmNewPassword'
                name='confirmNewPassword'
                value={confirmNewPassword}
                onChange={handleConfirmNewPasswordChange}
                className='mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500'
                aria-label={t('Confirm_New_Password')} // Added aria-label for better testing if needed
              />
            </div>
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
                {t('Cancel')}
              </Button>
              <Button
                variant='primary'
                onClick={handleChangePassword}
                disabled={isLoading}
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
              >
                {isLoading ? t('Changing') : t('Change_Password')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChangePasswordForm
