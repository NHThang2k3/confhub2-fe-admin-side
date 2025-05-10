// src/components/conferences/ResultsSection.tsx
import React, { useState } from 'react'
import EventCard from './EventCard'
import EventTable from './EventTable'
import useConferenceResults from '@/src/hooks/conferences/useConferenceResults'
import { useTranslations } from 'next-intl'

import Pagination from '../utils/Pagination'

// Thêm prop userBlacklist
interface ResultsSectionProps {
  userBlacklist: string[] // Assume this prop is passed from a parent component
}

// Nhận userBlacklist từ props
const ResultsSection: React.FC<ResultsSectionProps> = ({ userBlacklist }) => {
  const t = useTranslations('')

  const {
    sortedEvents,
    totalItems,
    eventsPerPage,
    currentPage,
    sortBy,
    sortOrder,
    paginate,
    handleSortByChange,
    handleSortOrderChange,
    handleEventPerPageChange,
    loading,
    error
  } = useConferenceResults()

  const [viewType, setViewType] = useState<'card' | 'table'>('card')

  if (loading) {
    return <div>{t('Loading_conferences')}</div>
  }

  if (error) {
    return (
      <div className='text-red-500'>
        {t('Error')}: {error}
      </div>
    )
  }

  return (
    <div className='w-full rounded-lg bg-white-pure p-4 shadow '>
      <div className='mb-4 flex flex-col items-center justify-between sm:flex-row'>
        <h2 className='mb-2 text-xl font-semibold sm:mb-0'>
          {t('Conference_Results')} ({totalItems})
        </h2>

        <div className='flex items-center space-x-2'>
          {/* Sort Controls */}
          <div className='flex items-center space-x-2'>
            <label htmlFor='sort-by' className=' text-sm'>
              {t('Sort_by')}:
            </label>
            <select
              id='sort-by'
              className='rounded border bg-gray-5 px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 '
              value={sortBy}
              onChange={handleSortByChange}
              title='Select field to sort by'
            >
              <option value='date'>{t('Date')}</option>
              <option value='rank'>{t('Rank')}</option>
              <option value='name'>{t('Name')}</option>
              <option value='fromDate'>{t('Start_Date')}</option>
              <option value='toDate'>{t('End_Date')}</option>
            </select>

            <label htmlFor='event-per-page' className=' text-sm'>
              {t('Events_per_page')}:
            </label>
            <select
              id='event-per-page'
              className='rounded border bg-gray-5 px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 '
              value={eventsPerPage}
              onChange={handleEventPerPageChange}
              title='Select number of event per page'
            >
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='20'>20</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
            </select>

            <button
              onClick={handleSortOrderChange}
              className='rounded bg-gray-20 px-1 py-1 text-sm hover:bg-gray-30 focus:outline-none focus:ring-2 focus:ring-blue-500  '
              title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
            >
              {sortOrder === 'asc' ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='var(--primary)'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-arrow-up-narrow-wide'
                >
                  <path d='m3 8 4-4 4 4' />
                  <path d='M7 4v16' />
                  <path d='M11 12h4' />
                  <path d='M11 16h7' />
                  <path d='M11 20h10' />
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='var(--primary)'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-arrow-down-wide-narrow'
                >
                  <path d='m3 16 4 4 4-4' />
                  <path d='M7 20V4' />
                  <path d='M11 4h10' />
                  <path d='M11 8h7' />
                  <path d='M11 12h4' />
                </svg>
              )}
            </button>
          </div>

          {/* View Type Toggle */}
          <button
            onClick={() =>
              setViewType(prev => (prev === 'card' ? 'table' : 'card'))
            }
            className='rounded bg-gray-20 px-1 py-1 text-sm hover:bg-gray-30 focus:outline-none focus:ring-2 focus:ring-blue-500 '
            title={
              viewType === 'card'
                ? 'Switch to Table View'
                : 'Switch to Card View'
            }
          >
            {viewType === 'card' ? (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='var(--primary)'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='lucide lucide-sheet'
              >
                <rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
                <line x1='3' x2='21' y1='9' y2='9' />
                <line x1='3' x2='21' y1='15' y2='15' />
                <line x1='9' x2='9' y1='9' y2='21' />
                <line x1='15' x2='15' y1='9' y2='21' />
              </svg>
            ) : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='var(--primary)'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='lucide lucide-layout-grid'
              >
                <rect width='7' height='7' x='3' y='3' rx='1' />
                <rect width='7' height='7' x='14' y='3' rx='1' />
                <rect width='7' height='7' x='14' y='14' rx='1' />
                <rect width='7' height='7' x='3' y='14' rx='1' />
              </svg>
            )}
          </button>

          {/* --- ADDED: Download CSV Button --- */}
          <button
            // onClick={handleDownloadCSV}
            className='rounded bg-gray-20 px-1 py-1 text-sm  hover:bg-gray-30 focus:outline-none focus:ring-2 focus:ring-blue-500 '
            title='Download CSV'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='var(--primary)'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-file-down '
            >
              <path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' />
              <path d='M14 2v4a2 2 0 0 0 2 2h4' />
              <path d='M12 18v-6' />
              <path d='m9 15 3 3 3-3' />
            </svg>
          </button>
        </div>
      </div>

      {sortedEvents && sortedEvents?.payload?.length > 0 ? (
        <>
          {viewType === 'card' ? (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {sortedEvents.payload.map(event => (
                // Truyền danh sách blacklist xuống EventCard
                <EventCard
                  key={event.id}
                  event={event}
                  userBlacklist={userBlacklist}
                />
              ))}
            </div>
          ) : (
            // Assuming EventTable also needs the blacklist info to style rows
            // You would need to modify EventTable.tsx similarly
            <EventTable
              events={sortedEvents.payload}
              userBlacklist={userBlacklist}
            />
          )}
          <div className='mt-4'>
            <Pagination
              eventsPerPage={Number(eventsPerPage)}
              totalEvents={totalItems}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        </>
      ) : (
        <p>{t('No_conferences_found_matching_your_criteria')}</p>
      )}
    </div>
  )
}

export default ResultsSection
