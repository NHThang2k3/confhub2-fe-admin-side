// ResultsJournalSection.tsx
'use client' // This is required for useTranslations in Client Components

import React from 'react'
import EventJournalCard from './EventJournalCard'
import Pagination from '../utils/Pagination' // Ensure this Pagination component is also internationalized if it contains text
import useJournalResult from '@/src/hooks/journals/useJournalResult'
import { useTranslations } from 'next-intl' // Import the hook

interface ResultsJournalSectionProps {}

const ResultsJournalSection: React.FC<ResultsJournalSectionProps> = () => {
  // Initialize the translation function with a namespace
  const t = useTranslations('JournalResults')

  const {
    journals,
    currentPage,
    journalsPerPage,
    sortBy,
    loading,
    error,
    currentJournals,
    paginate,
    handleSortByChange
  } = useJournalResult()

  if (loading) {
    // Use translation key for loading message
    return <p>{t('loading')}</p>
  }

  if (!journals || journals.length === 0) {
    // Use translation key for no results message
    return <p>{t('noResults')}</p>
  }

  return (
    <div className='w-full pl-8'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>
          {/* Use translation key with interpolation for count */}
          {t('resultsCount', { count: journals.length })}
        </h2>
        <div className='flex items-center rounded-md px-2 py-1'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='mr-1 h-5 w-5'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M3 5a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1z'
              clipRule='evenodd'
            />
          </svg>
          {/* Use translation key for sort label */}
          <span className='mr-1 text-sm'>{t('sortByLabel')}:</span>
          <select
            className='rounded border bg-transparent px-2 py-1 text-sm focus:outline-none'
            value={sortBy}
            onChange={handleSortByChange}
          >
            {/* Use translation keys for sort options */}
            <option value='title'>{t('sortByTitle')}</option>
            <option value='issn'>{t('sortByISSN')}</option>{' '}
            {/* ISSN is often not translated */}
            <option value='publisher'>{t('sortByPublisher')}</option>
            {/* Language and other metrics might not be directly filterable/sortable based on provided JournalResponse */}
            {/* <option value="language">{t('sortByLanguage')}</option> */}
            <option value='impactFactor'>{t('sortByImpactFactor')}</option>
            {/* <option value="citeScore">{t('sortByCiteScore')}</option> */}
            <option value='sjr'>{t('sortBySJR')}</option>
            {/* <option value="overallRank">{t('sortByOverallRank')}</option> */}
            <option value='hIndex'>{t('sortByHIndex')}</option>
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {/* EventJournalCard already internationalized in previous step */}
        {currentJournals?.map(journal => (
          <EventJournalCard key={journal.Title} journal={journal} />
        ))}
      </div>

      {journals.length > 0 && (
        <Pagination
          eventsPerPage={journalsPerPage}
          totalEvents={journals.length}
          paginate={paginate}
          currentPage={currentPage}
          // If Pagination component has text, you might need to pass t down or internationalize it internally
          // t={t} // Example if needed
        />
      )}
    </div>
  )
}

export default ResultsJournalSection
