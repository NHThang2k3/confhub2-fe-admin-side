// components/conferences/EventCard.tsx
import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { ConferenceInfo } from '../../../models/response/conference.list.response'
import { ConferenceResponse } from '@/src/models/response/conference.response'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/src/navigation'
import useAuthApi from '@/src/hooks/auth/useAuthApi'

import useFollowConference from '@/src/hooks/conferenceDetails/useFollowConference'
import useAddToCalendar from '@/src/hooks/conferenceDetails/useAddToCalendar'

interface EventCardProps {
  event: ConferenceInfo
  className?: string
  style?: React.CSSProperties
  userBlacklist: string[] // Add userBlacklist prop
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  className,
  userBlacklist // Destructure the prop
}) => {
  const t = useTranslations('')
  const router = useRouter()
  const { isLoggedIn } = useAuthApi()

  // Check if the current event ID is in the blacklist
  const isBlacklisted = userBlacklist?.includes(event.id) ?? false // Safe check for userBlacklist

  // --- Prepare data for hooks ---
  // Hooks expect ConferenceResponse | null. We adapt the ConferenceInfo.
  // Casting is simpler if the structure is compatible enough (primarily needs 'id').
  // Only pass conference data to hooks if it's not blacklisted? Or let hooks handle it?
  // Let's pass it regardless, but actions will be disabled by isBlacklisted check later.
  const conferenceDataForHook = event as unknown as ConferenceResponse | null

  // --- Instantiate hooks for this card ---
  const {
    isFollowing,
    handleFollowClick: triggerFollowAction,
    loading: followLoading,
    error: followError
  } = useFollowConference(conferenceDataForHook)

  const {
    isAddToCalendar,
    handleAddToCalendar: triggerCalendarAction,
    loading: calendarLoading,
    error: calendarError
  } = useAddToCalendar(conferenceDataForHook)

  // --- Local state for UI elements (tooltips) ---
  const [showWebsiteTooltip, setShowWebsiteTooltip] = useState(false)
  const [showFavoriteTooltip, setShowFavoriteTooltip] = useState(false)
  const [showAddCalendarTooltip, setShowAddCalendarTooltip] = useState(false)

  // --- Utility Functions ---

  // Function to check login status before performing an action
  const checkLoginAndRedirect = useCallback(
    (callback: () => void) => {
      if (!isLoggedIn) {
        router.push(`/auth/login`)
      } else {
        callback()
      }
    },
    [isLoggedIn, router]
  )

  // Date formatting function
  const formatDate = useCallback((date: Date | undefined): string => {
    if (!date) return 'TBD'
    try {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (e) {
      console.error('Error formatting date:', date, e)
      return 'Invalid Date'
    }
  }, [])

  // Date range formatting function
  const formatDateRange = useCallback(
    (fromDate: string | undefined, toDate: string | undefined) => {
      if (!fromDate || !toDate) return 'TBD'
      try {
        const startDate = new Date(fromDate)
        const endDate = new Date(toDate)
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return 'Invalid Date Range'
        }
        if (startDate.toDateString() === endDate.toDateString()) {
          return formatDate(startDate)
        }
        return `${formatDate(startDate)} - ${formatDate(endDate)}`
      } catch (e) {
        console.error('Error formatting date range:', fromDate, toDate, e)
        return 'Invalid Date Range'
      }
    },
    [formatDate]
  )

  // Location string generation
  const locationString =
    [event.location?.cityStateProvince, event.location?.country]
      .filter(Boolean)
      .join(', ') || 'Location Not Available'

  // Dynamic styling for Rank badge
  const getRankColor = useCallback((rank?: string) => {
    rank = rank?.toUpperCase()
    switch (rank) {
      case 'A*':
        return 'bg-amber-100 text-amber-700 border border-amber-300'
      case 'A':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'B':
        return 'bg-sky-100 text-sky-700 border border-sky-300'
      case 'C':
        return 'bg-orange-100 text-orange-700 border border-orange-300'
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-300'
    }
  }, [])

  // Dynamic styling for Access Type badge
  const getAccessTypeColor = useCallback((accessType?: string) => {
    accessType = accessType?.toUpperCase()
    switch (accessType) {
      case 'ONLINE':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'OFFLINE':
        return 'bg-red-100 text-red-700 border border-red-300'
      case 'HYBRID':
        return 'bg-blue-100 text-blue-700 border border-blue-300'
      default:
        return 'bg-gray-10 text-gray-600 border border-gray-300'
    }
  }, [])

  // --- Event Handlers ---

  // Handles clicking the Favorite (Follow) button
  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      // Only perform action if not blacklisted
      if (!isBlacklisted) {
        checkLoginAndRedirect(triggerFollowAction)
      }
      setShowFavoriteTooltip(false)
    },
    [checkLoginAndRedirect, triggerFollowAction, isBlacklisted]
  )

  // Handles clicking the Add to Calendar button
  const handleAddCalendarClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      // Only perform action if not blacklisted
      if (!isBlacklisted) {
        checkLoginAndRedirect(triggerCalendarAction)
      }
      setShowAddCalendarTooltip(false)
    },
    [checkLoginAndRedirect, triggerCalendarAction, isBlacklisted]
  )

  // Handles clicking the Go to Website button
  const handleGoToWebsite = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
      e.preventDefault()
      e.stopPropagation()
      // Only perform action if not blacklisted
      if (!isBlacklisted && url) {
        window.open(url, '_blank', 'noopener noreferrer')
      } else if (!url) {
        console.warn('No URL provided for Go to Website')
      }
      setShowWebsiteTooltip(false)
    },
    [isBlacklisted]
  )

  // Combine loading states from both hooks
  const isLoading = followLoading || calendarLoading

  // Add styles for blacklisted state
  const blacklistedStyles = isBlacklisted
    ? 'opacity-50 grayscale pointer-events-none cursor-default' // Make it opaque, grayscale, and non-interactive
    : ''

  // --- Render ---
  return (
    // Apply blacklisted styles to the main container
    <div
      className={`flex flex-col overflow-hidden rounded-lg bg-white-pure shadow-lg transition duration-300 ease-in-out ${isBlacklisted ? '' : 'hover:shadow-xl'} ${className} ${blacklistedStyles}`}
      style={{ position: 'relative' }} // Added for absolute positioning of the badge
    >
      {/* Blacklisted Badge */}
      {isBlacklisted && (
        // Position the badge absolutely
        <div className='pointer-events-auto absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white'>
          {' '}
          {/* Use pointer-events-auto to make the badge itself potentially interactive if needed, though here it's just text */}
          {t('Blacklisted')}{' '}
          {/* Assuming you have a translation key for 'Blacklisted' */}
        </div>
      )}

      {/* Image Section with Badges */}
      {/* Note: The image itself and badges should still display */}
      <div className='relative'>
        <Image
          src={'/bg-2.jpg'}
          alt={event.title || 'Conference Image'}
          width={400}
          height={225}
          style={{ objectFit: 'cover', width: '100%', height: '180px' }}
          className={`w-full ${isBlacklisted ? '' : 'hover:opacity-90'}`} // Don't apply hover opacity if blacklisted
          priority
          onError={e => {
            e.currentTarget.src = '/bg-2.jpg'
          }}
        />
        {/* Rank Badge */}
        <div className='absolute right-2 top-0'>
          <span
            className={`font-semibold ${getRankColor(event?.rank || 'No info')} rounded px-2 py-1 text-xs`}
          >
            {event.rank ? `Rank: ${event.rank}` : 'By Users'}
          </span>
        </div>
        {/* Access Type Badge */}
        {event.accessType && (
          <div className='absolute right-2 top-9'>
            <span
              className={`rounded px-2 py-1 text-xs font-semibold ${getAccessTypeColor(event.accessType)}`}
              title={`Access Type: ${event.accessType}`}
            >
              {event.accessType}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className='flex flex-grow flex-col px-4 py-4'>
        {/* Title and Acronym */}
        <div className='mb-2'>
          {/* Conditionally render Link or just text based on blacklisted status */}
          {isBlacklisted ? (
            <h3 className='text-left text-base font-bold opacity-50'>
              {event.title} {event.acronym ? `(${event.acronym})` : ''}
            </h3>
          ) : (
            <Link
              href={{
                pathname: `/conferences/detail`,
                query: { id: event.id }
              }}
              className='group'
            >
              <h3 className='cursor-pointer text-left text-base font-bold  transition duration-300 group-hover:text-blue-600'>
                {event.title} {event.acronym ? `(${event.acronym})` : ''}
              </h3>
            </Link>
          )}
        </div>
        {/* Location */}
        <div className='mb-3 flex items-center text-xs  transition duration-300 '>
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
            className='lucide lucide-map-pin mr-1.5 flex-shrink-0 text-red-600'
          >
            <path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0' />
            <circle cx='12' cy='10' r='3' />
          </svg>
          <span className='line-clamp-1 text-left'>{locationString}</span>
        </div>
        {/* Date */}
        <div className='mb-3 flex items-center text-xs  transition duration-300 '>
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
            className='lucide lucide-calendar-days mr-1.5 flex-shrink-0 text-red-600'
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
          <span className='text-left'>
            {formatDateRange(event.dates?.fromDate, event.dates?.toDate)}
          </span>
        </div>
        {/* Topics */}
        <div className='mb-4'>
          <div className='flex flex-wrap gap-1.5'>
            {event.topics && event.topics.length > 0 ? (
              <>
                {event.topics.slice(0, 3).map(topic =>
                  // Optionally make topic links non-interactive if blacklisted
                  isBlacklisted ? (
                    <span
                      key={topic}
                      className='inline-block max-w-full cursor-default overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-gray-10 px-2.5 py-1 text-xs font-medium opacity-50' // Styled as non-interactive
                      title={topic}
                    >
                      {topic}
                    </span>
                  ) : (
                    <Link
                      key={topic}
                      href={{
                        pathname: `/conferences`,
                        query: { topics: topic }
                      }}
                    >
                      <span
                        className='inline-block max-w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-gray-10 px-2.5 py-1 text-xs font-medium transition  duration-200 hover:bg-gray-20 '
                        title={topic}
                      >
                        {topic}
                      </span>
                    </Link>
                  )
                )}
                {event.topics.length > 3 && (
                  <span
                    key='more-topics'
                    className='inline-block max-w-full cursor-default overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-gray-10 px-2.5 py-1 text-xs font-medium '
                    title={`${event.topics.length - 3} more topics`}
                  >
                    +{event.topics.length - 3} {t('more')}
                  </span>
                )}
              </>
            ) : (
              <span className='text-xs italic '>{t('No_topics_listed')}</span>
            )}
          </div>
        </div>
        {/* Action Buttons */}
        <div className='mt-auto flex items-center justify-end border-t border-gray-10 pt-2 '>
          <div className='flex space-x-2'>
            {/* Go to Website Button */}
            <div className='relative'>
              <button
                onClick={e => handleGoToWebsite(e, event.link || '')}
                onMouseEnter={() => setShowWebsiteTooltip(true)}
                onMouseLeave={() => setShowWebsiteTooltip(false)}
                // Disable button if blacklisted or no link
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-10 p-2 transition hover:bg-gray-20  hover:text-gray-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isBlacklisted || !event.link ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}`}
                disabled={isBlacklisted || !event.link}
                title={t('Go_to_Website')}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-square-arrow-out-up-right'
                >
                  <path d='M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6' />
                  <path d='m21 3-9 9' />
                  <path d='M15 3h6v6' />
                </svg>
              </button>
            </div>

            {/* Add to Calendar Button */}
            <div className='relative'>
              <button
                onClick={handleAddCalendarClick}
                onMouseEnter={() => setShowAddCalendarTooltip(true)}
                onMouseLeave={() => setShowAddCalendarTooltip(false)}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-10 p-2 transition hover:bg-gray-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isBlacklisted || isLoading ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}  ${
                  isAddToCalendar
                    ? 'text-blue-600 hover:text-blue-700'
                    : ' hover:text-gray-80'
                }`}
                style={{ minWidth: '36px', minHeight: '36px' }}
                disabled={isBlacklisted || isLoading} // Disable if blacklisted or loading
                title={
                  isAddToCalendar
                    ? t('Remove_from_Calendar')
                    : t('Add_to_Calendar')
                }
              >
                {calendarLoading ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent'></div>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.75'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-calendar-plus'
                  >
                    <path d='M8 2v4' />
                    <path d='M16 2v4' />
                    <path d='M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8' />
                    <path d='M3 10h18' />
                    <path d='M16 19h6' />
                    <path d='M19 16v6' />
                  </svg>
                )}
              </button>
            </div>

            {/* Favorite Button */}
            <div className='relative'>
              <button
                onClick={handleFavoriteClick}
                onMouseEnter={() => setShowFavoriteTooltip(true)}
                onMouseLeave={() => setShowFavoriteTooltip(false)}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-10 p-2 transition hover:bg-gray-20 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 ${isBlacklisted || isLoading ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}  ${
                  isFollowing
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : ' hover:text-gray-80'
                }`}
                style={{ minWidth: '36px', minHeight: '36px' }}
                disabled={isBlacklisted || isLoading} // Disable if blacklisted or loading
                title={
                  isFollowing
                    ? t('Remove_from_Favorites')
                    : t('Add_to_Favorites')
                }
              >
                {followLoading ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent'></div>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill={isFollowing ? 'currentColor' : 'none'}
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.122 2.122 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
