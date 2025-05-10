// src/components/conferences/EventTable.tsx
import React from 'react'
import { ConferenceInfo } from '../../../models/response/conference.list.response'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation' // Import Link for potential linking

interface EventTableProps {
  events: ConferenceInfo[]
  userBlacklist: string[] // Add userBlacklist prop
}

const EventTable: React.FC<EventTableProps> = ({ events, userBlacklist }) => {
  const t = useTranslations('')

  const formatDateRange = (
    fromDate: string | undefined,
    toDate: string | undefined
  ) => {
    if (!fromDate || !toDate) return 'TBD'
    try {
      const startDate = new Date(fromDate)
      const endDate = new Date(toDate)
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'Invalid Date'
      }
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short', // Use short month for brevity in table
        day: 'numeric'
      }
      if (startDate.toDateString() === endDate.toDateString()) {
        return startDate.toLocaleDateString('en-US', options)
      }
      return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`
    } catch (e) {
      console.error(
        'Error formatting date range in table:',
        fromDate,
        toDate,
        e
      )
      return 'Invalid Date Range'
    }
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-5'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Name')}
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Date')}
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Location')}
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Rank')}
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Access_Type')}
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Topics')}
            </th>
            {/* Add a header for Blacklist Status */}
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Status')} {/* Assuming a translation key for Status */}
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white-pure '>
          {events.map(event => {
            // Check if the current event ID is in the blacklist
            const isBlacklisted = userBlacklist?.includes(event.id) ?? false // Safe check

            // Define the classes for blacklisted rows
            // We'll use opacity/grayscale and pointer-events-none
            const rowClasses = isBlacklisted
              ? 'opacity-50 grayscale pointer-events-none cursor-default'
              : ''

            return (
              // Apply the row classes conditionally
              <tr key={event.id} className={rowClasses}>
                {/* Use Link for title cell if not blacklisted, otherwise plain text */}
                <td className='px-6 py-4 text-left text-sm font-medium '>
                  {isBlacklisted ? (
                    // Plain text if blacklisted
                    <span className='line-clamp-1'>
                      {event.title} {event.acronym && `(${event.acronym})`}
                    </span>
                  ) : (
                    // Link if not blacklisted
                    <Link
                      href={{
                        pathname: `/conferences/detail`,
                        query: { id: event.id }
                      }}
                      className='text-blue-600 hover:underline' // Standard link styling
                    >
                      <span className='line-clamp-1'>
                        {event.title} {event.acronym && `(${event.acronym})`}
                      </span>
                    </Link>
                  )}
                </td>
                <td className='whitespace-nowrap px-6 py-4 text-left text-sm '>
                  {formatDateRange(event.dates?.fromDate, event.dates?.toDate)}
                </td>
                <td className='whitespace-nowrap px-6 py-4 text-left text-sm '>
                  {event.location?.cityStateProvince &&
                    `${event.location.cityStateProvince}, `}
                  {event.location?.country}
                </td>
                <td className='whitespace-nowrap px-6 py-4 text-left text-sm '>
                  {event?.rank || t('Unranked')}
                </td>
                <td className='whitespace-nowrap px-6 py-4 text-left text-sm '>
                  {event.accessType}
                </td>
                <td className='px-6 py-4 text-left text-sm '>
                  {' '}
                  {/* Remove whitespace-nowrap here to allow topics to wrap if too long */}
                  {event.topics && event.topics.length > 0 ? (
                    // Optionally make topics non-interactive if blacklisted
                    isBlacklisted ? (
                      event.topics.slice(0, 3).join(', ') +
                      (event.topics.length > 3
                        ? ` +${event.topics.length - 3} ${t('more')}`
                        : '')
                    ) : (
                      // Display topics, maybe as links if you had that feature,
                      // but based on current code, just joined string is fine
                      event.topics.slice(0, 3).join(', ') +
                      (event.topics.length > 3
                        ? ` +${event.topics.length - 3} ${t('more')}`
                        : '')
                    )
                  ) : (
                    <span className='italic'>{t('No_topics_listed')}</span>
                  )}
                </td>
                {/* Add the Status cell */}
                <td className='whitespace-nowrap px-6 py-4 text-left text-sm'>
                  {isBlacklisted ? (
                    <span className='font-semibold text-red-600'>
                      {t('Blacklisted')}
                    </span> // Display 'Blacklisted' text
                  ) : (
                    '' // Empty cell if not blacklisted
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default EventTable
