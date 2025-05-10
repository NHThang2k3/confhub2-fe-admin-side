// BlacklistTab.tsx
import React, { useState, useEffect, useCallback } from 'react'
import ConferenceItem from '../../conferences/ConferenceItem'
import { getListConferenceFromJSON } from '../../../../app/api/conference/getListConferences'
import { ConferenceInfo } from '../../../../models/response/conference.list.response'
import {
  UserResponse,
  Blacklist
} from '../../../../models/response/user.response'
import { timeAgo, formatDateFull } from '../timeFormat'
import Tooltip from '../../utils/Tooltip'
import { useTranslations } from 'next-intl'
import { appConfig } from '@/src/middleware'

interface BlacklistTabProps {}

const API_GET_BLACKLIST_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/blacklist-conference`

const BlacklistTab: React.FC<BlacklistTabProps> = () => {
  const t = useTranslations('')
  const language = t('language')

  // State for blacklisted conferences
  const [blacklistedConferences, setBlacklistedConferences] = useState<
    (ConferenceInfo & { created_at?: string; conferenceId: string })[] // Assuming API returns created_at, adjusted type hint
  >([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const userData = localStorage.getItem('user')

      if (!userData) {
        setLoggedIn(false)
        if (initialLoad) {
          setLoading(false)
          setInitialLoad(false)
        }
        return
      }

      setLoggedIn(true)

      const userBlacklist = await fetch(`${API_GET_BLACKLIST_ENDPOINT}`, {
        // Use conferenceId in URL
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` // Add userId to the headers
        }
      })

      if (!userBlacklist.ok) {
        throw new Error(`HTTP error! status: ${userBlacklist.status}`)
      }

      const followed: any[] = await userBlacklist.json()
      // Assuming the API response structure for a blacklisted item looks something like:
      // { conferenceId: '...', title: '...', ..., createdAt: 'ISO_DATE_STRING' }
      // We need to ensure the received data has a 'createdAt' or similar timestamp.
      // Let's assume it's 'createdAt' as used later in the map.
      setBlacklistedConferences(followed)
    } catch (error) {
      console.error('Failed to fetch blacklist data:', error) // Updated error message
    } finally {
      if (initialLoad) {
        setLoading(false)
        setInitialLoad(false)
      }
    }
  }, [initialLoad])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Update loading state based on blacklistedConferences after initial load
  useEffect(() => {
    if (!initialLoad) {
      setLoading(false)
    }
  }, [blacklistedConferences, initialLoad])

  if (!loggedIn) {
    if (loading) {
      return <div className='container mx-auto p-4'>{t('Loading')}</div>
    }
    return (
      <div className='container mx-auto p-4'>
        {t('Please_log_in_to_view_blacklisted_conferences')}{' '}
        {/* Updated message */}
      </div>
    )
  }

  if (loading) {
    return <div className='container mx-auto p-4'>{t('Loading')}</div>
  }

  // Transform blacklisted conferences data for rendering
  const transformedConferences = blacklistedConferences.map(conf => {
    const conferenceDates = conf.dates
    return {
      id: conf.conferenceId!,
      title: conf.title,
      acronym: conf.acronym,
      location: conf.location
        ? `${conf.location.cityStateProvince || ''}, ${conf.location.country || ''}`
        : '',
      fromDate: conferenceDates?.fromDate || undefined,
      toDate: conferenceDates?.toDate || undefined,
      // Use conf.createdAt directly if available, otherwise use conf.created_at
      // Ensure your API response structure matches this assumption
      createdAt: conf.createdAt || (conf as any).created_at, // Use the correct timestamp field from API
      status: conf.status // Keep status if needed
    }
  })

  // --- ADD SORTING HERE ---
  // Sort by createdAt timestamp, earliest first
  transformedConferences.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0 // Treat missing date as epoch or handle appropriately
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0 // Treat missing date as epoch or handle appropriately

    // Sort ascending (earliest first)
    return dateB - dateA
  })
  // --- END SORTING ---

  // console.log('transformed Blacklisted Conferences:', transformedConferences); // Optional logging

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-2 flex items-center justify-between'>
        {/* Updated Title */}
        <h1 className='text-2xl font-semibold'>
          {t('Blacklisted_Conferences')}
        </h1>
        <button
          onClick={() => {
            console.log('Refresh button clicked for Blacklist') // Updated log
            setLoading(true) // Optionally show loading spinner on refresh
            fetchData()
          }}
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
          aria-label='Refresh Blacklist' // Updated aria-label
        >
          {/* Refresh Icon */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='lucide lucide-refresh-cw'
          >
            <path d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.67 2.62' />
            <path d='M22 4v4h-4' />
          </svg>
        </button>
      </div>

      {/* Check blacklistedConferences length */}
      {blacklistedConferences.length === 0 ? (
        // Updated empty state message
        <p>{t('You_have_not_blacklisted_any_conferences_yet')}</p>
      ) : (
        // Map over the SORTED transformedConferences
        transformedConferences.map(conference => {
          // console.log('Rendering Blacklisted ConferenceItem:', conference); // Optional logging
          return (
            <div
              className='mb-4 rounded-xl border-2 px-4 py-2 shadow-xl'
              key={conference.id}
            >
              <div className='flex'>
                {/* Updated Label */}
                <span className='mr-1'>{t('Blacklisted_Time')}: </span>
                {/* Use createdAt timestamp */}
                <Tooltip text={formatDateFull(conference.createdAt, language)}>
                  <span>{timeAgo(conference.createdAt, language)}</span>
                </Tooltip>
              </div>
              <ConferenceItem
                key={conference.id} // Key moved to wrapper div is better practice, but keeping consistent with original
                conference={{
                  id: conference.id,
                  title: conference.title,
                  acronym: conference.acronym,
                  location: conference.location,
                  fromDate: conference.fromDate,
                  toDate: conference.toDate
                  // No need to pass createdAt to ConferenceItem unless it uses it
                }}
              />
            </div>
          )
        })
      )}
    </div>
  )
}

export default BlacklistTab
