// src/components/SearchSection.tsx
'use client'

import React from 'react'
import Button from '../utils/Button'
import SearchAdvanceSection from './SearchAdvanceSection'
import useSearchForm from '../../../hooks/conferences/useSearchForm' // Import the hook
import { useTranslations } from 'next-intl'

interface SearchSectionProps {
  onSearch: (searchParams: {
    keyword?: string
    fromDate?: Date | null
    toDate?: Date | null
    location?: string | null
    type?: 'Online' | 'Offline' | 'Hybrid' | null
    // submissionDate?: Date | null
    submissionStartDate?: Date | null // NEW
    submissionEndDate?: Date | null // NEW
    publisher?: string | null
    rank?: string | null
    source?: string | null
    averageScore?: string | null
    topics?: string[]
    fieldOfResearch?: string[]
  }) => void
  onClear: () => void // Add onClear prop
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, onClear }) => {
  const t = useTranslations('')

  // Destructure onClear
  const {
    confKeyword,
    selectSearchType,
    isSearchTypeDropdownOpen,
    searchTypeDropdownRef,
    selectedLocation,
    selectedType,
    fromDate,
    toDate,
    locationSearchQuery,
    typeSearchQuery,
    isLocationDropdownOpen,
    isTypeDropdownOpen,
    locationDropdownRef,
    typeDropdownRef,
    isAdvancedOptionsVisible,
    filteredLocations,
    filteredTypes,
    handleKeywordChange,
    handleSearchTypeChange,
    toggleSearchTypeDropdown,
    handleSearchClick,
    handleKeyPress,
    handleLocationClick,
    handleTypeClick,
    handleLocationSearchChange,
    handleTypeSearchChange,
    handleStartDateInputChange,
    handleEndDateInputChange,
    toggleLocationDropdown,
    toggleTypeDropdown,
    toggleAdvancedOptionsVisibility,
    // handleSubmissionDateChange,
    // submissionDate,
    handleRankChange,
    selectedRank,
    handleSourceChange,
    selectedSource,
    handleAverageScoreChange,
    selectedAverageScore,
    handleTopicsChange,
    selectedTopics,
    handleFieldsOfResearchChange,
    selectedFieldsOfResearch,
    handlePublisherChange,
    selectedPublisher,
    submissionStartDate,
    submissionEndDate,
    handleSubmissionDateRangeChange,
    handleClear // Get handleClear from the hook
  } = useSearchForm({ onSearch, onClear }) // Pass onClear to the hook

  return (
    <div className='container mx-auto px-4 text-base'>
      {/* Use flex-wrap and justify-center for responsiveness */}
      <div className='border-black-pure flex flex-wrap items-center  justify-between rounded-3xl border px-2 py-2 shadow-md'>
        <div
          className='flex w-40 flex-grow basis-full items-center  md:max-w-[500px] md:basis-auto'
          ref={searchTypeDropdownRef}
        >
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
            placeholder={t('Type_a_command_or_search')}
            className='w-full bg-transparent text-sm outline-none placeholder:text-primary'
            value={confKeyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyPress}
          />
          <div className='relative px-5'>
            <button
              className='flex items-center space-x-2 bg-transparent outline-none'
              onClick={toggleSearchTypeDropdown}
              title='Select search type'
            >
              <span className='text-sm'>
                {selectSearchType === 'keyword'
                  ? t('Keyword')
                  : selectSearchType === 'title'
                    ? t('Title')
                    : t('Acronym')}
              </span>
              {/* Hiển thị searchType hiện tại */}
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='ml-1 inline-block h-4 w-4'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M19.5 8.25l-7.5 7.5-7.5-7.5'
                />
              </svg>
            </button>
            {isSearchTypeDropdownOpen && (
              <div className='bg-white-pure absolute left-0 z-10 mt-2 w-32 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none '>
                <div
                  className='py-1'
                  role='menu'
                  aria-orientation='vertical'
                  aria-labelledby='options-menu'
                >
                  <button
                    onClick={() => handleSearchTypeChange('keyword')}
                    className="role='menuitem' hover:bg-gray-10 hover:text-gray-90 block w-full px-4 py-2  text-left text-sm"
                  >
                    {t('Keyword')}
                  </button>
                  <button
                    onClick={() => handleSearchTypeChange('title')}
                    className="role='menuitem' hover:bg-gray-10 hover:text-gray-90 block w-full px-4 py-2  text-left text-sm"
                  >
                    {t('Title')}
                  </button>
                  <button
                    onClick={() => handleSearchTypeChange('acronym')}
                    className="role='menuitem' hover:bg-gray-10 hover:text-gray-90 block w-full px-4 py-2  text-left text-sm"
                  >
                    {t('Acronym')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Use hidden and block with media queries for dividers */}
        <div className='border-gray-30 mx-2 hidden h-6 border-l md:block'></div>

        <div className='flex items-center space-x-2 px-2'>
          <label htmlFor='fromDate' className='text-sm'>
            {t('Start')}:
          </label>
          <input
            type='date'
            id='fromDate'
            className='w-26 rounded border bg-transparent py-0.5 text-sm'
            onChange={handleStartDateInputChange}
            value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
          />
        </div>

        <div className='flex items-center space-x-2 px-2'>
          <label htmlFor='toDate' className='text-sm'>
            {t('End')}:
          </label>
          <input
            type='date'
            id='toDate'
            className='w-26 rounded border bg-transparent py-0.5 text-sm'
            onChange={handleEndDateInputChange}
            value={toDate ? toDate.toISOString().split('T')[0] : ''}
          />
        </div>

        {/* Use hidden and block with media queries for dividers */}
        <div className='mx-2 hidden h-6 border-l border-gray-300 md:block'></div>

        <div className='relative' ref={locationDropdownRef}>
          <button
            className='flex items-center space-x-2 bg-transparent outline-none'
            onClick={toggleLocationDropdown}
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
              {selectedLocation ? selectedLocation : t('Location')}
            </span>
          </button>

          {isLocationDropdownOpen && (
            <div className='bg-white-pure absolute left-0 z-10 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none '>
              <div
                className='max-h-48 overflow-y-scroll py-1'
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='options-menu'
              >
                <input
                  type='text'
                  placeholder={t('Search_location')}
                  className='bg-white-pure block w-full px-4 py-2 text-sm placeholder:text-primary focus:outline-none'
                  onChange={handleLocationSearchChange}
                  onClick={e => e.stopPropagation()}
                />
                <button
                  key='all'
                  onClick={() => handleLocationClick('')}
                  className="role='menuitem' hover:bg-gray-10 hover:text-gray-90 block w-full px-4 py-2  text-left text-sm"
                >
                  {t('All_Locations')}
                </button>
                {[...new Set(filteredLocations)].map(location => (
                  <button
                    key={location}
                    onClick={() => handleLocationClick(location)}
                    className="role='menuitem' hover:bg-gray-10 hover:text-gray-90 block w-full px-4 py-2  text-left text-sm"
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Use hidden and block with media queries for dividers */}
        <div className='mx-2 hidden h-6 border-l border-gray-300 md:block'></div>

        <div className='relative' ref={typeDropdownRef}>
          <button
            className=' flex items-center space-x-2 bg-transparent  outline-none'
            onClick={toggleTypeDropdown}
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
              {selectedType ? selectedType : t('Type')}
            </span>
          </button>

          {isTypeDropdownOpen && (
            <div
              className='bg-white-pure absolute left-0 z-10 mt-2 w-28 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none '
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
                  onClick={() => handleTypeClick('')}
                  className="role='menuitem' hover:bg-gray-10 hover:text-gray-90 block w-full px-4 py-2  text-left text-sm"
                >
                  {t('All_Types')}
                </button>
                {filteredTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleTypeClick(type)}
                    className="role='menuitem' hover:bg-gray-10 hover:text-gray-90 block w-full px-4 py-2  text-left text-sm"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Use margin and padding for spacing on smaller screens */}
        <div className='mt-2 flex space-x-4 md:ml-4 md:mt-0 md:space-x-4 md:pl-4'>
          <Button
            variant='primary'
            size='small'
            rounded
            className=''
            onClick={handleSearchClick}
          >
            {t('Search')}
          </Button>
          <Button
            variant='secondary'
            size='small'
            rounded
            className=''
            onClick={handleClear}
          >
            {t('Clear')}
          </Button>
        </div>
      </div>

      <SearchAdvanceSection
        isAdvancedOptionsVisible={isAdvancedOptionsVisible}
        toggleAdvancedOptionsVisibility={toggleAdvancedOptionsVisibility}
        // onSubmissionDateChange={handleSubmissionDateChange}
        // submissionDate={submissionDate}
        onRankChange={handleRankChange}
        selectedRank={selectedRank}
        onSourceChange={handleSourceChange}
        selectedSource={selectedSource}
        onAverageScoreChange={handleAverageScoreChange}
        selectedAverageScore={selectedAverageScore}
        onTopicsChange={handleTopicsChange}
        selectedTopics={selectedTopics}
        onFieldOfResearchChange={handleFieldsOfResearchChange}
        selectedFieldsOfResearch={selectedFieldsOfResearch}
        onPublisherChange={handlePublisherChange}
        selectedPublisher={selectedPublisher}
        submissionStartDate={submissionStartDate}
        submissionEndDate={submissionEndDate}
        onSubmissionDateRangeChange={handleSubmissionDateRangeChange}
      />
    </div>
  )
}

export default SearchSection
