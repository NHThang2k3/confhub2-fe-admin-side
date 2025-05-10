// SearchJournalSection.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import Button from '../utils/Button'
import SearchAdvanceJournalSection from './SearchAdvanceJournalSection'
import useSearchJournalForm from '../../../hooks/journals/useSearchJounalForm' // Import the hook
import { useTranslations } from 'next-intl' // Import the hook

interface SearchJournalSectionProps {
  onSearch: (searchParams: {
    keyword?: string
    country?: string | null
    publicationType?: string | null
    subjectAreas?: string[]
    quartile?: string | null
    openAccessTypes?: string[]
    publisher?: string | null
    language?: string | null
    impactFactor?: string | null
    hIndex?: string | null
    citeScore?: string | null
    sjr?: string | null
    overallRank?: string | null
    issn?: string | null
  }) => void
  onClear: () => void
}

const SearchJournalSection: React.FC<SearchJournalSectionProps> = ({
  onSearch,
  onClear
}) => {
  // Initialize the translation function with a namespace (optional but recommended)
  const t = useTranslations('SearchJournal')

  const {
    journalKeyword,
    selectedCountry,
    countryDropdownRef,
    isCountryDropdownOpen,
    filteredCountries,
    selectedPublicationType,
    publicationTypeDropdownRef,
    isPublicationTypeDropdownOpen,
    availablePublicationTypes,
    isAdvancedOptionsVisible,
    selectedSubjectAreas,
    selectedQuartile,
    selectedISSN,
    selectedOpenAccessTypes,
    selectedPublisher,
    selectedLanguage,
    selectedImpactFactor,
    selectedHIndex,
    selectedCiteScore,
    selectedSJR,
    selectedOverallRank,
    handleKeywordChange,
    handleCountryClick,
    handleCountrySearchChange,
    toggleCountryDropdown,
    handlePublicationTypeClick,
    togglePublicationTypeDropdown,
    handleSubjectAreasChange,
    handleQuartileChange,
    handleISSNChange,
    handleOpenAccessTypesChange,
    handlePublisherChange,
    handleLanguageChange,
    handleImpactFactorChange,
    handleHIndexChange,
    handleCiteScoreChange,
    handleSJRChange,
    handleOverallRankChange,
    handleSearchClick,
    handleKeyPress,
    toggleAdvancedOptionsVisibility,
    handleClear: handleClearForm // Rename to avoid conflict with prop
  } = useSearchJournalForm({ onSearch, onClear })

  // Use the handleClearForm from the hook
  const handleClearClick = () => {
    handleClearForm() // Call the clear logic from the hook
    onClear() // Call the onClear prop as well if needed by the parent component
  }

  return (
    <div className='container mx-auto px-4 text-base'>
      <div className='flex flex-wrap items-center justify-center space-x-4 rounded-full border border-black px-3 py-2 shadow-md'>
        <div className='flex flex-grow basis-full items-center md:basis-auto'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='mr-1 h-5 w-5'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
              clipRule='evenodd'
            />
          </svg>
          <input
            type='text'
            placeholder={t('keywordPlaceholder')} // Use translation key
            className='w-full bg-transparent text-sm outline-none'
            value={journalKeyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyPress}
          />
        </div>

        <div className='mx-2 hidden h-6 border-l border-gray-300 md:block'></div>

        <div className='relative' ref={countryDropdownRef}>
          <button
            className=' flex items-center space-x-2 bg-transparent  outline-none'
            onClick={toggleCountryDropdown}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-4 w-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'
              />
            </svg>
            <span className='text-sm'>
              {selectedCountry ? selectedCountry : t('countryLabel')}
            </span>{' '}
            {/* Use translation key */}
          </button>

          {isCountryDropdownOpen && (
            <div
              className='absolute left-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
              tabIndex={0}
            >
              <div
                className='max-h-48 overflow-y-scroll py-1'
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='options-menu'
              >
                <input
                  type='text'
                  placeholder={t('searchCountryPlaceholder')} // Use translation key
                  className='block w-full px-4 py-2 text-sm text-gray-700 focus:outline-none'
                  onChange={handleCountrySearchChange}
                  onClick={e => e.stopPropagation()}
                />
                <button
                  key='all'
                  onClick={() => handleCountryClick('')}
                  className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {t('allCountriesOption')} {/* Use translation key */}
                </button>
                {[...new Set(filteredCountries)].map(location => (
                  <button
                    key={location}
                    onClick={() => handleCountryClick(location)}
                    className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='mx-2 hidden h-6 border-l border-gray-300 md:block'></div>

        <div className='relative' ref={publicationTypeDropdownRef}>
          <button
            className=' flex items-center space-x-2 bg-transparent  outline-none'
            onClick={togglePublicationTypeDropdown}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-4 w-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
              />
            </svg>
            <span className='text-sm'>
              {selectedPublicationType
                ? selectedPublicationType
                : t('publicationTypeLabel')}
            </span>{' '}
            {/* Use translation key */}
          </button>

          {isPublicationTypeDropdownOpen && (
            <div
              className='absolute left-0 z-10 mt-2 w-28 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
              tabIndex={0}
            >
              <div
                className='py-1'
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='options-menu'
              >
                <button
                  key='all'
                  onClick={() => handlePublicationTypeClick('')}
                  className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {t('allTypesOption')} {/* Use translation key */}
                </button>
                {availablePublicationTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handlePublicationTypeClick(type)}
                    className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='mt-2 flex space-x-4 md:ml-4 md:mt-0 md:space-x-4 md:pl-4'>
          <Button
            variant='primary'
            size='small'
            rounded
            className=''
            onClick={handleSearchClick}
          >
            {t('searchButton')} {/* Use translation key */}
          </Button>
          <Button
            variant='secondary'
            size='small'
            rounded
            className=''
            onClick={handleClearClick}
          >
            {' '}
            {/* Use handleClearClick */}
            {t('clearButton')} {/* Use translation key */}
          </Button>
        </div>
      </div>

      {/* Thêm SearchAdvanceJournalSection ở đây */}
      {/* Assuming SearchAdvanceJournalSection also uses useTranslations internally or receives t as a prop */}
      {/* If it doesn't, you might need to pass `t` down or internationalize it separately */}
      <SearchAdvanceJournalSection
        isAdvancedOptionsVisible={isAdvancedOptionsVisible}
        toggleAdvancedOptionsVisibility={toggleAdvancedOptionsVisibility}
        onSubjectAreasChange={handleSubjectAreasChange}
        selectedSubjectAreas={selectedSubjectAreas}
        onQuartileChange={handleQuartileChange}
        selectedQuartile={selectedQuartile}
        onOpenAccessTypesChange={handleOpenAccessTypesChange}
        selectedOpenAccessTypes={selectedOpenAccessTypes}
        onPublisherChange={handlePublisherChange}
        selectedPublisher={selectedPublisher}
        onLanguageChange={handleLanguageChange}
        selectedLanguage={selectedLanguage}
        onImpactFactorChange={handleImpactFactorChange}
        selectedImpactFactor={selectedImpactFactor}
        onHIndexChange={handleHIndexChange}
        selectedHIndex={selectedHIndex}
        onCiteScoreChange={handleCiteScoreChange}
        selectedCiteScore={selectedCiteScore}
        onSJRChange={handleSJRChange}
        selectedSJR={selectedSJR}
        onOverallRankChange={handleOverallRankChange}
        selectedOverallRank={selectedOverallRank}
        onISSNChange={handleISSNChange}
        selectedISSN={selectedISSN}
        // Pass t to SearchAdvanceJournalSection if it needs to use translations
        // t={t} // Example if needed
      />
    </div>
  )
}

export default SearchJournalSection
