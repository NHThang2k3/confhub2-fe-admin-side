// src/components/ProfileTab.tsx
import React, { useState, useEffect } from 'react' // <--- useEffect already here
import Image from 'next/image'
import Button from '../../utils/Button'
import { useTranslations } from 'next-intl'
import { useUserData } from '@/src/hooks/dashboard/profile/useUserData'
import { useEditProfile } from '@/src/hooks/dashboard/profile/useEditProfile'
import { useImageSelection } from '@/src/hooks/dashboard/profile/useImageSelection'
import { Link } from '@/src/navigation'
import ChangePasswordForm from './ChangePasswordForm'

const ProfileTab: React.FC = () => {
  const t = useTranslations('')

  // Use the hook to get loading, error, and data states
  const { userData, loading, error } = useUserData()

  const {
    isEditing,
    editedData,
    setEditedData,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleInputChange,
    handleInterestedTopicsChange
  } = useEditProfile(userData) // Pass userData to the hook

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

  const predefinedTopics = [
    'Blockchain',
    'Chemical Biology',
    'AI',
    'Furniture',
    'Home Improvement'
  ]

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

  // --- START: REMOVE THE PROBLEMATIC LOCALSTORAGE CHECK ---
  // Remove this entire block:
  /*
  if (!localStorage.getItem('token')) {
    if (loading) {
      return <div className='container mx-auto p-4'>{t('Loading')}</div> // Show loading initially
    }
    return (
      <div className='container mx-auto p-4'>
        {t('Please_log_in_to_view_profile')}
      </div>
    )
  }
  */
  // --- END: REMOVE ---

  // --- Now, rely solely on the state from the useUserData hook ---

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
    // If the error message from the hook isn't specific enough for "not logged in",
    // you could potentially add a check here if you can determine *why* userData is null
    // (e.g., if the hook returns a specific type of error).
    // For now, assume the hook sets an appropriate error message like "Please log in"
    // if the token is missing or invalid. If not, you might need to adjust the hook
    // or add a client-side check *after* loading is false and before rendering userData.
    // However, relying *only* on the hook's states is the cleaner approach.
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
      {/* Rest of your rendering logic remains the same */}

      {/* Cover Photo */}
      <div className='relative h-60 overflow-hidden rounded-lg md:h-80'>
        {/* ... Image and Change Background Button ... */}
        <Image
          src={displayBackgroundUrl}
          alt='Cover Photo'
          fill
          style={{ objectFit: 'cover' }}
          sizes='100vw' // Use a more specific size if possible, but 100vw is a common fallback
          priority
        />
        {isEditing && (
          <button
            type='button'
            onClick={() => setShowBackgroundModal(true)}
            className='absolute bottom-2 right-2 rounded bg-background px-4 py-2 text-sm font-medium opacity-80 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
          >
            {t('Change_Background')}
          </button>
        )}
      </div>

      {/* Profile Info Section */}
      <div className='relative flex flex-col items-center gap-5 py-5 md:flex-row md:items-center md:px-6'>
        <div className='relative -mt-40 h-40 w-40 overflow-hidden rounded-full border-4 border-button-text bg-background'>
          <img
            src={displayAvatarUrl}
            alt={`Avatar of ${userData.firstName} ${userData.lastName}`}
            className='h-full w-full object-cover'
          />
          {isEditing && (
            <button
              type='button'
              onClick={() => setShowAvatarModal(true)}
              className='absolute bottom-2 left-2 rounded bg-background bg-opacity-70 px-4 py-2 text-sm font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
            >
              {t('Change_Avatar')}
            </button>
          )}
        </div>

        {/* Name and Title */}
        <div className='flex-grow'>
          <h1 className='text-center text-xl font-bold md:text-left md:text-3xl'>
            {userData.firstName} {userData.lastName}
          </h1>
          {userData.aboutme && (
            <p className='text-center text-sm md:text-left'>
              <span className='text-base font-semibold'>{t('About_me')}:</span>{' '}
              {userData.aboutme.split(' ').map((word, index) => (
                // Using index in key is okay here as the list is static
                <React.Fragment key={index}>{word} </React.Fragment>
              ))}
            </p>
          )}
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          {/* ... Modal content ... */}
          <div className='w-full max-w-md rounded-lg bg-background p-6 shadow-lg'>
            <h2 className='mb-4 text-lg font-semibold'>
              {t('Select_an_Avatar')}
            </h2>
            <div className='grid grid-cols-4 gap-4'>
              {avatarOptions.map((avatarUrl: string) => (
                <button
                  key={avatarUrl}
                  onClick={() => handleAvatarSelect(avatarUrl)}
                  className='aspect-square overflow-hidden rounded-full hover:ring-2 hover:ring-button hover:ring-offset-2'
                >
                  <Image
                    src={avatarUrl}
                    alt='Avatar Option'
                    width={100}
                    height={100}
                    className='h-full w-full object-cover'
                    // priority // Only use priority for the main LCP image if necessary
                  />
                </button>
              ))}
            </div>
            <button
              type='button'
              onClick={() => setShowAvatarModal(false)}
              className='mt-4 w-full rounded-md bg-background-secondary px-4 py-2 text-sm font-medium opacity-80 hover:bg-background-secondary hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
            >
              {t('Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Background Modal */}
      {showBackgroundModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          {/* ... Modal content ... */}
          <div className='w-full max-w-lg rounded-lg bg-background p-6 shadow-lg'>
            <h2 className='mb-4 text-lg font-semibold'>
              {t('Select_a_Background')}
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {backgroundOptions.map((backgroundUrl: string) => (
                <button
                  key={backgroundUrl}
                  onClick={() => handleBackgroundSelect(backgroundUrl)}
                  className='aspect-video overflow-hidden rounded hover:ring-2 hover:ring-button hover:ring-offset-2'
                >
                  <Image
                    src={backgroundUrl}
                    alt='Background Option'
                    width={300} // Add dimensions for better layout and performance
                    height={200} // Keep aspect ratio if possible
                    className='h-full w-full object-cover'
                    // priority // Only use priority for the main LCP image if necessary
                  />
                </button>
              ))}
            </div>
            <button
              type='button'
              onClick={() => setShowBackgroundModal(false)}
              className='mt-4 w-full rounded-md bg-background-secondary px-4 py-2 text-sm font-medium opacity-80 hover:bg-background-secondary hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
            >
              {t('Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Edit/Display Section */}
      <div className='border-t border-background p-6'>
        {isEditing ? (
          // Edit Form
          <div className='space-y-6 py-2'>
            {/* ... Edit form fields ... */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label
                  htmlFor='firstName'
                  className='block text-sm font-medium'
                >
                  {t('First_Name')}
                </label>
                <input
                  type='text'
                  id='firstName'
                  name='firstName'
                  value={editedData.firstName || ''}
                  onChange={handleInputChange}
                  className='focus:ring-none mt-1 block w-full rounded-md border-button bg-opacity-70 p-2 shadow-md focus:border-2 focus:outline-none focus:ring-button'
                />
              </div>
              <div>
                <label htmlFor='lastName' className='block text-sm font-medium'>
                  {t('Last_Name')}
                </label>
                <input
                  type='text'
                  id='lastName'
                  name='lastName'
                  value={editedData.lastName || ''}
                  onChange={handleInputChange}
                  className='focus:ring-none mt-1 block w-full rounded-md border-button bg-opacity-70 p-2 shadow-md focus:border-2 focus:outline-none focus:ring-button'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label htmlFor='dob' className='block text-sm font-medium'>
                  {t('Date_of_Birth')}
                </label>
                <input
                  type='date'
                  id='dob'
                  name='dob'
                  value={editedData.dob?.split('T')[0] || ''} // Assuming dob is an ISO string
                  onChange={handleInputChange}
                  className='focus:ring-none mt-1 block w-full rounded-md border-button bg-opacity-70 p-2 shadow-md focus:border-2 focus:outline-none focus:ring-button'
                />
              </div>
            </div>

            <div>
              <label htmlFor='about' className='block text-sm font-medium'>
                {t('About_me')}
              </label>
              <textarea
                id='about'
                name='aboutme'
                value={editedData.aboutme || ''}
                onChange={handleInputChange}
                maxLength={100}
                className='focus:ring-none mt-1 block h-32 w-full rounded-md border-button bg-opacity-70 p-2 shadow-md focus:border-2 focus:outline-none focus:ring-button'
              />
              <p className='text-sm '>
                {editedData.aboutme ? editedData.aboutme.length : 0}/100{' '}
                {t('characters')}
              </p>
            </div>

            <div className='mt-4'>
              <label className='block text-sm font-medium '>
                {t('I_am_also_interested_in_these_topics')}
              </label>
              <div className='mt-2 flex flex-wrap gap-2'>
                {predefinedTopics.map(topic => {
                  const isSelected = (
                    editedData.interestedTopics || []
                  ).includes(topic)
                  return (
                    <span
                      key={topic} // Use topic as key
                      onClick={() => handleInterestedTopicsChange(topic)}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm transition duration-200  ${
                        isSelected
                          ? 'bg-button text-button-text'
                          : 'bg-background  hover:bg-background-secondary'
                      }`}
                    >
                      {topic}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className='mt-8 flex justify-end space-x-4'>
              <button
                type='button'
                onClick={handleCancelClick}
                className='rounded-md bg-background px-6 py-2  hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-gray-400'
              >
                {t('Cancel')}
              </button>
              <button
                type='button'
                onClick={handleSaveClick}
                className='rounded-md bg-button px-6 py-2 text-button-text hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-button'
              >
                {t('Save')}
              </button>
            </div>
          </div>
        ) : (
          // Display Information
          <>
            <div className='flex justify-center space-x-4 md:justify-end'>
              <Button
                variant='primary'
                onClick={handleEditClick}
                className='rounded-md px-4 py-2 focus:outline-none focus:ring-2'
              >
                {t('Edit_Profile')}
              </Button>
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

              {/* --- Sử dụng state đã định dạng --- */}
              {formattedDob && (
                <p>
                  <span className='font-semibold'>{t('Date_of_Birth')}:</span>{' '}
                  {formattedDob}
                </p>
              )}
              {/* --- End sử dụng state đã định dạng --- */}

              {userData.interestedTopics &&
                userData.interestedTopics.length > 0 && (
                  <div className='pt-2'>
                    <span className='mb-2 block font-semibold'>
                      {t('Interested_Topics')}:
                    </span>
                    <div className='flex flex-wrap gap-2'>
                      {userData.interestedTopics.map(topic => (
                        <Link
                          key={topic} // Use topic as key
                          href={{
                            pathname: `/conferences`,
                            query: { topics: topic }
                          }}
                          className='hover:text-text-secondary'
                        >
                          <span className='rounded-full bg-button px-4 py-2 text-sm text-button-text'>
                            {topic}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </>
        )}
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
