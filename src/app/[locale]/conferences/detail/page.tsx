'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react' // Import useCallback
import Button from '../../utils/Button'
import ConferenceFeedback from '../../conferences/detail/ConferenceFeedback'
import NotFoundPage from '../../utils/NotFoundPage'
import Loading from '../../utils/Loading'
import { ConferenceTabs } from '../../conferences/detail/ConferenceTabs'
import { useSearchParams } from 'next/navigation'
import { Header } from '../../utils/Header'
import Footer from '../../utils/Footer'
import { Link } from '@/src/navigation'
import { useRouter, usePathname } from 'next/navigation'
import {
  ImportantDate,
  ConferenceResponse // Import ConferenceResponse type
} from '@/src/models/response/conference.response'
import useAuthApi from '@/src/hooks/auth/useAuthApi'

// Import the custom hooks
import useSequentialConferenceData from '@/src/hooks/conferenceDetails/useSequentialConferenceData'
import useFollowConference from '../../../../hooks/conferenceDetails/useFollowConference'
import useShareConference from '../../../../hooks/conferenceDetails/useShareConference'
import useClickOutside from '../../../../hooks/conferenceDetails/useClickOutside'
import useTopicsDisplay from '../../../../hooks/conferenceDetails/useTopicsDisplay'
import useFormatConferenceDates from '../../../../hooks/conferenceDetails/useFormatConferenceDates'
import useAddToCalendar from '../../../../hooks/conferenceDetails/useAddToCalendar'
import useUpdateConference from '../../../../hooks/conferenceDetails/useUpdateConference'
import useBlacklistConference from '../../../../hooks/conferenceDetails/useBlacklistConference'

// Define the Feedback type (or import it)
export type Feedback = {
  id: string
  organizedId: string | null
  creatorId: string | null
  description: string | null
  star: number | null // Make star nullable
  createdAt: string | null
  updatedAt: string | null
}

interface EventCardProps {
  locale: string
}

const Detail: React.FC<EventCardProps> = ({ locale }: EventCardProps) => {
  const t = useTranslations('')
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const router = useRouter()
  const pathname = usePathname()

  const {
    conferenceDataFromDB,
    conferenceDataFromJSON, // Keep this if you use it elsewhere, otherwise removable
    dbError,
    jsonError, // Keep this if you use it elsewhere, otherwise removable
    loading: sequentialLoading
  } = useSequentialConferenceData(id)

  // --- Define getAccessTypeColor ---
  const getAccessTypeColor = useCallback((accessType?: string): string => {
    // const upperAccessType = accessType?.toUpperCase() ?? ''
    switch (accessType) {
      case 'Online':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'Offline':
        return 'bg-red-100 text-red-700 border border-red-300'
      case 'Hybrid':
        return 'bg-blue-100 text-blue-700 border border-blue-300'
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-300' // Added border for consistency
    }
  }, [])

  // --- Define getRankColor --- (NEW)
  const getRankColor = useCallback((rank?: string) => {
    rank = rank?.toUpperCase()
    switch (rank) {
      case 'A*':
        return 'bg-amber-100 text-amber-700 border border-amber-300' // Added border
      case 'A':
        return 'bg-green-100 text-green-700 border border-green-300' // Added border
      case 'B':
        return 'bg-sky-100 text-sky-700 border border-sky-300' // Added border
      case 'C':
        return 'bg-orange-100 text-orange-700 border border-orange-300' // Added border
      default:
        // Consider if a default rank needs a specific style or the gray one is fine
        return 'bg-gray-100 text-gray-600 border border-gray-300' // Added border
    }
  }, [])

  // --- Extract accessType from the last organization ---
  const lastOrganization =
    conferenceDataFromDB?.organizations?.[
      conferenceDataFromDB.organizations.length - 1
    ]
  const accessType = lastOrganization?.accessType
  const firstRankData = conferenceDataFromDB?.ranks?.[0] // Get first rank data

  const transformDates = (dates: ImportantDate[] | null | undefined) => {
    if (!dates) {
      return undefined // Or return an empty array: []
    }
    return dates
      .map(date => {
        if (!date) return undefined // Handle null dates within array
        return {
          type: date.type || '', // Provide default values for safety
          fromDate: date.fromDate || undefined, // Keep as undefined if null
          toDate: date.toDate || undefined // Keep as undefined if null
        }
      })
      .filter(date => date !== undefined) // Filter out any null dates
  }

  const {
    isFollowing,
    handleFollowClick,
    loading: followLoading,
    error: followError
  } = useFollowConference(conferenceDataFromDB)
  const {
    isAddToCalendar,
    handleAddToCalendar,
    loading: calendarLoading,
    error: calendarError
  } = useAddToCalendar(conferenceDataFromDB)
  const {
    isBlacklisted,
    handleBlacklistClick,
    loading: blacklistLoading,
    error: blacklistError
  } = useBlacklistConference(conferenceDataFromDB)
  const language = t('language')
  const { isUpdating, updateResult, updateConference } = useUpdateConference()
  const { handleShareClick } = useShareConference(conferenceDataFromDB)
  const { displayedTopics, hasMoreTopics, showAllTopics, setShowAllTopics } =
    useTopicsDisplay(lastOrganization?.topics || []) // Use last org's topics if that's intended

  // Use dates from the last organization if that's the correct logic
  const transformedDates = transformDates(lastOrganization?.conferenceDates)

  const { dateDisplay } = useFormatConferenceDates(transformedDates, language)
  const { isLoggedIn } = useAuthApi()

  const [openMenu, setOpenMenu] = useState<'share' | 'calendar' | null>(null)
  const menuContainerRef = useRef<HTMLDivElement>(null)

  const toggleShareMenu = () => {
    setOpenMenu(prev => (prev === 'share' ? null : 'share'))
  }

  const closeMenu = () => {
    setOpenMenu(null)
  }

  useClickOutside(menuContainerRef, closeMenu)

  const checkLoginAndRedirect = (callback: () => void) => {
    if (!isLoggedIn) {
      const localePrefix = pathname.split('/')[1]
      const pathWithLocale = `/${localePrefix}/auth/login`
      router.push(pathWithLocale)
    } else {
      callback()
    }
  }

  const renderShareMenu = () => {
    if (openMenu !== 'share') return null

    // Ensure you have the correct class for share menu items if it differs
    const menuItemClass =
      'share-menu-container block w-full px-4 py-2 text-left text-sm hover:bg-gray-100'

    return (
      <div
        className='absolute right-0 z-20 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
        style={{ top: '100%' }} // Position below the share button
      >
        <div className='py-1'>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('facebook')
                closeMenu()
              })
            }}
            className={menuItemClass}
          >
            {/* ... SVG and Text for Facebook ... */}
            <span className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                className='bi bi-facebook mr-2'
                viewBox='0 0 16 16'
              >
                <path d='M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951' />
              </svg>
              {t('Share_on_Facebook')}
            </span>
          </button>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('twitter')
                closeMenu()
              })
            }}
            className={menuItemClass}
          >
            {/* ... SVG and Text for Twitter/X ... */}
            <span className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                className='bi bi-twitter-x mr-2'
                viewBox='0 0 16 16'
              >
                <path d='M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z' />
              </svg>
              {t('Share_on_X')}
            </span>
          </button>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('reddit')
                closeMenu()
              })
            }}
            className={menuItemClass}
          >
            {/* ... SVG and Text for Reddit ... */}
            <span className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                className='bi bi-reddit mr-2'
                viewBox='0 0 16 16'
              >
                <path d='M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z' />
                <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028a.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165' />
              </svg>
              {t('Share_on_Reddit')}
            </span>
          </button>
        </div>
      </div>
    )
  }

  const calculateOverallRating = (
    feedbacks: Feedback[] | null | undefined
  ): number => {
    if (!feedbacks || feedbacks.length === 0) return 0
    const totalStars = feedbacks.reduce(
      (sum: number, feedback: Feedback) => sum + (feedback.star ?? 0),
      0
    )
    return totalStars / feedbacks.length
  }

  const renderFollowerAvatars = () => {
    // Assuming followBy comes directly from conferenceDataFromDB
    const followBy = conferenceDataFromDB?.followBy
    if (!followBy || followBy.length === 0) {
      return <p className='text-sm '>{t('No_followers_yet')}</p>
    }

    const maxVisibleFollowers = 5
    const visibleFollowers = followBy.slice(0, maxVisibleFollowers)
    const remainingFollowers = followBy.length - maxVisibleFollowers

    return (
      <div className='flex items-center -space-x-1'>
        {' '}
        {/* Added -space-x-1 for overlap */}
        {visibleFollowers.map((follower: any) => (
          // Make sure follower structure matches your data (e.g., follower.user.avatar)
          <img
            key={follower.id} // Use a stable key, like follower.id or follower.userId
            src={follower.avatar || '/avatar1.jpg'} // Adjust path as needed
            alt={`${follower.firstName || ''} ${follower.lastName || ''}`} // Handle potential missing names
            width={32}
            height={32}
            className='h-8 w-8 rounded-full border-2 border-white'
            // Removed inline style, handled by -space-x-1 on parent
          />
        ))}
        {remainingFollowers > 0 && (
          <span className='z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium dark:bg-gray-800'>
            +{remainingFollowers}
          </span>
        )}
      </div>
    )
  }

  useEffect(() => {
    if (updateResult) {
      if (updateResult.success) {
        alert(updateResult.message) // Replace with a better notification system
      } else {
        alert(`Error: ${updateResult.error}`) // Replace with a better notification system
      }
    }
  }, [updateResult, t]) // Added t to dependencies if used in alert messages

  // --- Loading & Error States ---
  const isLoading = sequentialLoading || isUpdating
  if (dbError === 'Conference not found') return <NotFoundPage />
  // Handle jsonError if needed:
  // if (jsonError === 'Conference not found' && !conferenceDataFromDB) return <NotFoundPage />;

  // Show initial loading spinner if no data is available yet
  if (sequentialLoading && !conferenceDataFromDB) return <Loading />

  // Use last organization data where relevant, fallback to first or defaults
  const displayOrganization =
    lastOrganization ?? conferenceDataFromDB?.organizations?.[0]
  const overallRating = calculateOverallRating(conferenceDataFromDB?.feedbacks)
  const totalReviews = conferenceDataFromDB?.feedbacks?.length || 0

  return (
    <div className='bg-gray-5 flex min-h-screen flex-col '>
      <Header locale={locale} />

      <div className='container mx-auto flex-grow px-0 py-8 pt-20 md:px-4'>
        {/* Action Loading Overlay */}
        {isUpdating && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <Loading />
          </div>
        )}

        {/* Render errors using a toast notification system ideally */}
        {/* Example: {followError && <Toast type="error" message={followError} />} */}

        {/* Main content wrapper */}
        <div className='bg-white-pure rounded-lg p-2 shadow-md   md:p-4'>
          <div className='flex flex-col gap-4 md:flex-row'>
            {/* Left Column */}
            <div className='md:w-4/5'>
              <div className='flex flex-col items-start md:flex-row'>
                {/* Image container */}
                <div className='mb-4 w-full md:mb-0 md:w-1/4'>
                  <Image
                    src={'/bg-2.jpg'} // Consider a dynamic or placeholder image
                    alt={
                      conferenceDataFromDB?.title
                        ? `${conferenceDataFromDB.title} Logo`
                        : 'Conference Logo'
                    }
                    width={200} // Adjust size as needed
                    height={200} // Adjust size as needed
                    className='hidden h-auto w-full rounded-lg object-contain md:block'
                  />
                </div>

                {/* Text details container */}
                <div className='w-full md:w-3/4 md:pl-6'>
                  {/* --- Warning Section (Keep logic if needed) --- */}
                  {/* ====================== WARNING SECTION ====================== */}
                  {conferenceDataFromDB?.ranks?.length === 0 && (
                    <div
                      className='mb-4 rounded-md border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700 shadow-sm'
                      role='alert'
                    >
                      <div className='flex items-center'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='mr-3 h-6 w-6 flex-shrink-0'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                          />
                        </svg>
                        <div>
                          <p className='font-bold'>
                            {t('Conference_Published_By_User')}
                          </p>
                          <p className='text-sm'>
                            {t('Conference_Published_By_User_Description')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* ============================================================ */}

                  {/* --- Date, Rank, and Access Type --- */}
                  <div className='mb-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1'>
                    {' '}
                    {/* Main container */}
                    {/* Left side: Date */}
                    <p className='text-sm font-semibold text-red-500'>
                      {dateDisplay || t('Date_TBA')}
                    </p>
                    {/* Right side: Container for Rank Badge and Access Type Badge */}
                    <div className='flex items-center gap-x-2'>
                      {' '}
                      {/* Group rank and access type */}
                      {/* --- Display Rank Badge (NEW) --- */}
                      {firstRankData?.rank && ( // Check if rank exists in the first rank object
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${getRankColor(firstRankData.rank)}`} // Apply dynamic color
                          title={`${t('Rank')}: ${firstRankData.rank}${firstRankData.source ? ` (${t('Source')}: ${firstRankData.source})` : ''}`} // Tooltip with Rank and Source (if exists)
                        >
                          {t('Rank')}: {firstRankData.rank} (
                          {firstRankData.source})
                        </span>
                      )}
                      {/* --- Access Type Badge --- */}
                      {accessType && (
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${getAccessTypeColor(accessType)}`}
                        >
                          {accessType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* --- Title --- */}
                  <h1 className='mb-1 text-xl font-bold md:text-2xl'>
                    {conferenceDataFromDB?.title || t('Conference_Details')}
                  </h1>

                  {/* --- Rating --- */}
                  <div className='mb-2 flex items-center text-sm '>
                    <div className='mr-1 text-xl text-yellow-500'>★</div>
                    <strong>
                      {overallRating.toFixed(1)}{' '}
                      <span className='ml-1 font-normal '>
                        ({totalReviews} {t('Ratings')})
                      </span>
                    </strong>
                  </div>

                  {/* --- Location and Publisher Links --- */}
                  <div className='mb-2 flex flex-wrap gap-x-4 gap-y-1'>
                    {
                      // Kiểm tra xem có location đầu tiên tồn tại không
                      displayOrganization?.locations?.[0] ? (
                        // Nếu có, hiển thị link địa chỉ
                        <a
                          href='#map' // Đảm bảo bạn có một element với id="map"
                          className='flex items-center text-sm text-blue-600 hover:underline'
                          // Thêm tooltip cho địa chỉ đầy đủ (sử dụng optional chaining để an toàn)
                          title={
                            displayOrganization.locations[0]?.address ||
                            t('View_map')
                          }
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='lucide lucide-map-pin mr-1 flex-shrink-0' // Đã điều chỉnh margin
                          >
                            <path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0' />
                            <circle cx='12' cy='10' r='3' />
                          </svg>
                          {/* Hiển thị City/Country hoặc một phiên bản ngắn hơn (sử dụng optional chaining) */}
                          {displayOrganization.locations[0]?.address ||
                            displayOrganization.locations[0]
                              ?.cityStateProvince ||
                            displayOrganization.locations[0]?.country ||
                            t('Location_Available')}
                        </a>
                      ) : (
                        // Nếu không có location đầu tiên, hiển thị "No location"
                        // Bạn có thể thêm class CSS để style cho phù hợp
                        <span className='text-sm '>
                          {t('No_location_available')}
                        </span>
                      )
                    }
                    {
                      // Kiểm tra xem displayOrganization?.publisher có giá trị truthy không
                      displayOrganization?.publisher ? (
                        // Nếu có, hiển thị Link đến publisher
                        <Link
                          className='flex items-center text-sm text-blue-600 hover:underline'
                          href={{
                            pathname: `/conferences`,
                            // Truyền publisher vào query params
                            query: { publisher: displayOrganization.publisher }
                          }}
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='lucide lucide-book-type mr-1 flex-shrink-0' // Đã điều chỉnh margin
                          >
                            <path d='M10 13h4' />
                            <path d='M12 6v7' />
                            <path d='M16 8V6H8v2' />
                            <path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20' />
                          </svg>
                          {/* Hiển thị tên publisher */}
                          {displayOrganization.publisher}
                        </Link>
                      ) : (
                        // Nếu không có publisher, hiển thị "No publisher"
                        <span className='flex items-center text-sm '>
                          {' '}
                          {/* Thêm flex items-center nếu muốn icon đi kèm */}
                          {/* Bạn có thể thêm icon ở đây nếu muốn, giống như icon publisher nhưng màu xám chẳng hạn */}
                          {/* <svg ... className='lucide lucide-book-type mr-1 flex-shrink-0 text-gray-400'>...</svg> */}
                          {t('No_publisher_available')}
                        </span>
                      )
                    }
                  </div>

                  {/* --- Followers Display --- */}
                  <div className='mt-3'>{renderFollowerAvatars()}</div>
                </div>
              </div>

              {/* --- Topics Section --- */}
              <div className='mt-4 border-t pt-4 md:mt-2 md:border-0 md:pt-0'>
                <h2 className='mb-2 text-base font-semibold md:text-lg'>
                  {t('Topics')}:
                </h2>
                <div className='flex flex-wrap gap-2'>
                  {' '}
                  {/* Use gap for spacing */}
                  {displayedTopics.length > 0 ? (
                    displayedTopics.map(topic => (
                      <Link
                        key={topic}
                        href={{
                          pathname: `/conferences`,
                          query: { topics: topic }
                        }}
                      >
                        <span className='bg-gray-20 hover:bg-gray-30 cursor-pointer rounded-full px-3 py-1 text-sm font-medium '>
                          {topic}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className='text-sm '>{t('No_topics_listed')}</p>
                  )}
                  {hasMoreTopics && (
                    <button
                      className='rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200'
                      onClick={() => setShowAllTopics(!showAllTopics)}
                    >
                      {showAllTopics ? t('View_Less') : t('View_More')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (Action Buttons) */}
            <div className='md:w-1/5'>
              <div className='sticky top-24'>
                {' '}
                {/* Adjust top value based on header height */}
                <div className='flex flex-row flex-wrap justify-center gap-2 md:flex-col md:items-stretch md:justify-start md:gap-3'>
                  {/* Calendar Button */}
                  <Button
                    onClick={() => checkLoginAndRedirect(handleAddToCalendar)}
                    variant={isAddToCalendar ? 'primary' : 'secondary'}
                    size='small'
                    className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
                    title={
                      isAddToCalendar
                        ? t(
                            'Remove_this_conference_from_your_personal_calendar'
                          )
                        : t('Add_this_conference_to_your_personal_calendar')
                    }
                    disabled={calendarLoading}
                  >
                    {/* Calendar SVG */}
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M8 2v4' />
                      <path d='M16 2v4' />
                      <rect width='18' height='18' x='3' y='4' rx='2' />
                      <path d='M3 10h18' />
                      <path d='M8 14h.01' />
                      <path d='M12 14h.01' />
                      <path d='M16 14h.01' />
                      <path d='M8 18h.01' />
                      <path d='M12 18h.01' />
                      <path d='M16 18h.01' />
                    </svg>
                    <span className='hidden sm:inline'>
                      {isAddToCalendar ? t('Added') : t('Calendar')}
                    </span>
                  </Button>

                  {/* Share Button & Menu */}
                  <div
                    className='relative flex flex-grow md:flex-grow-0'
                    ref={menuContainerRef}
                  >
                    <Button
                      onClick={() => checkLoginAndRedirect(toggleShareMenu)}
                      variant='secondary'
                      size='small'
                      className='flex w-full items-center justify-center gap-x-2 md:justify-start'
                      aria-haspopup='true'
                      aria-expanded={openMenu === 'share'}
                    >
                      {/* Share SVG */}
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z'
                        />
                      </svg>
                      <span className='hidden sm:inline'>{t('Share')}</span>
                    </Button>
                    {renderShareMenu()}
                  </div>

                  {/* Follow Button */}
                  <Button
                    onClick={() => checkLoginAndRedirect(handleFollowClick)}
                    variant={isFollowing ? 'primary' : 'secondary'}
                    size='small'
                    className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
                    title={
                      isFollowing
                        ? t(
                            'Remove_this_conference_from_your_personal_follow_list'
                          )
                        : t('Add_this_conference_to_your_personal_follow_list')
                    }
                    disabled={followLoading}
                  >
                    {/* Follow SVG */}
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.122 2.122 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1 -.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
                    </svg>
                    <span className='hidden sm:inline'>
                      {isFollowing ? t('Followed') : t('Follow')}
                    </span>
                  </Button>

                  {/* Update Button */}
                  <Button
                    variant={'secondary'}
                    size='small'
                    onClick={() =>
                      checkLoginAndRedirect(() => updateConference(id))
                    }
                    className={`flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`}
                    disabled={isUpdating || !id || !displayOrganization?.link} // Disable if no id
                    title={t('Update_this_conference')}
                  >
                    {/* Update SVG */}
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
                      <path d='M3 3v5h5' />
                      <path d='M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16' />
                      <path d='M16 16h5v5' />
                    </svg>
                    <span className='hidden sm:inline'>
                      {isUpdating ? t('Updating') : t('Update')}
                    </span>
                  </Button>

                  {/* Website Button */}
                  <Button
                    onClick={() => {
                      if (displayOrganization?.link) {
                        window.open(
                          displayOrganization.link,
                          '_blank',
                          'noopener noreferrer'
                        ) // Added rel="noopener noreferrer"
                      } else {
                        alert(t('Website_link_is_not_available')) // Use toast ideally
                      }
                    }}
                    variant={'secondary'}
                    size='small'
                    className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
                    title={t('Go_to_conference_website')}
                    disabled={!displayOrganization?.link} // Disable if no link
                  >
                    {/* Website SVG */}
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6' />
                      <path d='m21 3-9 9' />
                      <path d='M15 3h6v6' />
                    </svg>
                    <span className='hidden sm:inline'>{t('Website')}</span>
                  </Button>

                  {/* Blacklist Button */}
                  <Button
                    onClick={() => checkLoginAndRedirect(handleBlacklistClick)}
                    variant={isBlacklisted ? 'danger' : 'secondary'} // Changed to danger when active
                    size='small'
                    className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
                    disabled={blacklistLoading}
                    title={
                      isBlacklisted
                        ? t(
                            'Remove_this_conference_from_your_personal_blacklist'
                          )
                        : t('Add_this_conference_to_your_personal_blacklist')
                    }
                  >
                    {/* Blacklist SVG */}
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='m2 2 20 20' />
                      <path d='M8.35 2.69A10 10 0 0 1 21.3 15.65' />
                      <path d='M19.08 19.08A10 10 0 1 1 4.92 4.92' />
                    </svg>
                    <span className='hidden sm:inline'>
                      {isBlacklisted ? t('Blacklisted') : t('Blacklist')}
                    </span>
                  </Button>

                  {/* Display blacklist error */}
                  {/* {blacklistError && (
                    <p className='mt-1 w-full text-center text-xs text-red-500 md:text-left'>
                      {t('Error')}: {blacklistError}
                    </p>
                  )} */}
                </div>
              </div>
            </div>
          </div>

          {/* Conference Tabs */}
          <div className='mt-6 border-t pt-6 md:mt-4 md:pt-4'>
            <ConferenceTabs conference={conferenceDataFromDB} />
          </div>
        </div>

        {/* Feedback Section */}
        <div className='bg-white-pure mt-8 rounded-lg p-4 shadow-md  md:p-6'>
          <ConferenceFeedback conferenceData={conferenceDataFromDB} />
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Detail
