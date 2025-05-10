// src/components/ProfileTab.tsx
import React, { useState, useEffect } from 'react' // <--- useEffect already here
import Image from 'next/image'
import Button from '../../utils/Button'
import { useTranslations } from 'next-intl'
import { useUserData } from '@/src/hooks/dashboard/profile/useUserData'
import { useEditProfile } from '@/src/hooks/dashboard/profile/useEditProfile'
import { useImageSelection } from '@/src/hooks/dashboard/profile/useImageSelection'
import ChangePasswordForm from './ChangePasswordForm'

const ProfileTab: React.FC = () => {
  const t = useTranslations('')

  // Use the hook to get loading, error, and data states
  const { userData, loading, error } = useUserData()

  const { editedData, setEditedData } = useEditProfile(userData) // Pass userData to the hook

  const {
    showModal: showAvatarModal,
    setShowModal: setShowAvatarModal,
    options: avatarOptions,
    handleImageSelect: handleAvatarSelect
  } = useImageSelection('avatar', setEditedData)

  const {
    showModal: showBackgroundModal,
    setShowModal: setShowBackgroundModal,
    options: backgroundOptions,
    handleImageSelect: handleBackgroundSelect
  } = useImageSelection('background', setEditedData)

  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false)

  // --- START: Sửa lỗi Hydration cho Date of Birth (Giữ nguyên, cái này đúng) ---
  const [formattedDob, setFormattedDob] = useState<string | null>(null) // State để lưu ngày sinh đã định dạng

  useEffect(() => {
    // Chỉ chạy ở client sau khi component đã mount
    if (userData?.dob) {
      try {
        // Định dạng ngày tháng ở client
        const date = new Date(userData.dob)
        // Kiểm tra xem date có hợp lệ không trước khi định dạng
        if (!isNaN(date.getTime())) {
          // Sử dụng một định dạng chuẩn hoặc locale-aware để tránh lỗi hydration nếu có
          // Ví dụ: 'YYYY-MM-DD' hoặc toLocaleDateString()
          // toLocaleDateString() là an toàn vì nó chạy sau hydrate
          setFormattedDob(date.toLocaleDateString())
        } else {
          console.error('Invalid date format received for dob:', userData.dob)
          setFormattedDob(t('Invalid_Date')) // Hoặc hiển thị thông báo lỗi
        }
      } catch (e) {
        console.error('Error formatting date:', e)
        setFormattedDob(t('Invalid_Date')) // Xử lý lỗi nếu có
      }
    } else {
      setFormattedDob(null) // Reset nếu không có dob
    }
  }, [userData?.dob, t]) // Thêm dependency t nếu bạn dùng trong chuỗi lỗi
  // --- END: Sửa lỗi Hydration ---

  // Handle loading state from the hook
  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900'></div>
      </div>
    )
  }

  // Handle error state from the hook (This should now cover the "no token" case if the hook is implemented correctly)
  if (error) {
    // The hook should set error if no token is found or fetching fails.
    // Display the error message provided by the hook.
    return <div className='py-4 text-center text-red-500'>{error}</div>
  }

  // Handle the case where loading is false, no error, but no user data is returned (e.g., token invalid, or API issue)
  // This might be redundant if the hook always sets an error for these cases, but good as a fallback.
  if (!userData) {
    return (
      <div className='py-4 text-center'>
        {t('No_user_data_found_or_not_logged_in')}
      </div>
    )
  }

  // If we reach here, loading is false, no error, and userData exists.
  // Proceed with rendering the profile UI.

  const displayAvatarUrl =
    editedData.avatar || userData.avatar || '/avatar1.jpg'
  const displayBackgroundUrl =
    editedData.background || userData.background || '/bg-2.jpg'

  const handleChangePasswordClick = () => {
    setShowChangePasswordForm(true)
  }

  return (
    <div className='w-full overflow-hidden rounded-lg bg-background shadow-md md:px-12 md:py-8'>
      {/* Cover Photo */}
      <div className='relative h-60 overflow-hidden rounded-lg md:h-80'>
        <Image
          src={displayBackgroundUrl}
          alt='Cover Photo'
          fill
          style={{ objectFit: 'cover' }}
          sizes='100vw' // Use a more specific size if possible, but 100vw is a common fallback
          priority
        />
      </div>

      {/* Profile Info Section */}
      <div className='relative flex flex-col items-center gap-5 py-5 md:flex-row md:items-center md:px-6'>
        <div className='relative -mt-40 h-40 w-40 overflow-hidden rounded-full border-4 border-button-text bg-background'>
          <img
            src={displayAvatarUrl}
            alt={`Avatar of ${userData.firstName} ${userData.lastName}`}
            className='h-full w-full object-cover'
          />
        </div>

        {/* Name and Title */}
        <div className='flex-grow'>
          <h1 className='text-center text-xl font-bold md:text-left md:text-3xl'>
            {userData.firstName} {userData.lastName}
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
            {t('Change_Password')}
          </Button>
        </div>

        <div className='mt-4 space-y-2'>
          <p>
            <span className='font-semibold'>Email:</span>{' '}
            <a className='text-button hover:underline'>{userData.email}</a>
          </p>

          {formattedDob && (
            <p>
              <span className='font-semibold'>{t('Date_of_Birth')}:</span>{' '}
              {formattedDob}
            </p>
          )}
        </div>
      </div>

      {showChangePasswordForm && (
        <ChangePasswordForm
          userId={userData.id} // userData is guaranteed to exist here
          onClose={() => setShowChangePasswordForm(false)}
        />
      )}
    </div>
  )
}

export default ProfileTab
