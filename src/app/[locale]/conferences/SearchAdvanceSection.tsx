// src/components/SearchAdvanceSection.tsx

'use client'

import React from 'react'
import useSearchAdvanceForm from '../../../hooks/conferences/useSearchAdvanceForm'
import { useTranslations } from 'next-intl'
import DatePicker from 'react-datepicker' // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css' // Import CSS

interface SearchAdvanceSectionProps {
  isAdvancedOptionsVisible: boolean
  toggleAdvancedOptionsVisibility: () => void
  // --- Updated Date Props ---
  onSubmissionDateRangeChange: (dates: [Date | null, Date | null]) => void
  submissionStartDate: Date | null
  submissionEndDate: Date | null
  // --- End Updated Date Props ---
  onRankChange: (rank: string | null) => void
  selectedRank: string | null
  onSourceChange: (source: string | null) => void
  selectedSource: string | null
  onAverageScoreChange: (averageScore: string | null) => void
  selectedAverageScore: string | null
  onTopicsChange: (topics: string[]) => void
  selectedTopics: string[]
  onFieldOfResearchChange: (fields: string[]) => void
  selectedFieldsOfResearch: string[]
  onPublisherChange: (publisher: string | null) => void
  selectedPublisher: string | null
}

const SearchAdvanceSection: React.FC<SearchAdvanceSectionProps> = ({
  isAdvancedOptionsVisible,
  toggleAdvancedOptionsVisibility,
  // --- Use Updated Date Props ---
  onSubmissionDateRangeChange,
  submissionStartDate,
  submissionEndDate,
  // --- End Use Updated Date Props ---
  onRankChange,
  selectedRank,
  onSourceChange,
  selectedSource,
  onAverageScoreChange,
  selectedAverageScore,
  onTopicsChange,
  selectedTopics,
  onFieldOfResearchChange,
  selectedFieldsOfResearch,
  onPublisherChange,
  selectedPublisher
}) => {
  const {
    topicsInput,
    topicSuggestions,
    fieldOfResearchInput,
    fieldOfResearchSuggestions,
    handleTopicInputChange,
    handleTopicSuggestionClick,
    handleTopicInputKeyDown,
    handleRemoveTopic,
    handleFieldOfResearchInputChange,
    handleFieldOfResearchSuggestionClick,
    handleFieldOfResearchInputKeyDown,
    handleRemoveFieldOfResearch,
    // Remove handleSubmissionDateInputChange from here if it's not used elsewhere
    handleRankChangeInput,
    handleSourceChangeInput,
    handleAverageScoreChangeInput,
    handlePublisherInputChange,
    handlePublisherEnter
  } = useSearchAdvanceForm({
    // Remove date props from the hook if they are no longer managed there
    // submissionDate: null, // Or however you structure the hook now
    // onSubmissionDateChange: () => {},
    onRankChange,
    selectedRank,
    onSourceChange,
    selectedSource,
    onAverageScoreChange,
    selectedAverageScore,
    onTopicsChange,
    selectedTopics,
    onFieldOfResearchChange,
    selectedFieldsOfResearch,
    onPublisherChange,
    selectedPublisher
  })
  const t = useTranslations('')

  return (
    <div>
      <div className='mt-2 flex justify-end'>
        <button
          onClick={toggleAdvancedOptionsVisibility}
          className='text-sm hover:text-gray-800 focus:outline-none'
        >
          {isAdvancedOptionsVisible
            ? t('Hide_advanced_search_options')
            : t('Show_more_advanced_search_options')}
        </button>
      </div>

      {isAdvancedOptionsVisible && (
        <div className='mt-2 rounded border p-4 shadow-md'>
          {/* Responsive grid layout */}
          <div className='mb-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
            {/* --- Date Picker Section --- */}
            <div className='col-span-1'>
              <label
                className='mb-1 block text-sm font-bold '
                htmlFor='submissionDateRange' // Changed ID for clarity
              >
                {t('Submission_Date')}:
              </label>
              <DatePicker
                selectsRange={true}
                startDate={submissionStartDate}
                endDate={submissionEndDate}
                onChange={onSubmissionDateRangeChange}
                isClearable={true} // Allows clearing the date range
                placeholderText={t('Select_Date_Range') ?? 'Select Date Range'} // Use translation
                dateFormat='yyyy/MM/dd' // Adjust date format as needed
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none' // Apply same styling
                wrapperClassName='w-full' // Ensure wrapper takes full width if needed
                id='submissionDateRange'
              />
            </div>
            {/* --- End Date Picker Section --- */}

            {/* Other fields remain the same */}
            <div className='col-span-1'>
              <label
                className='mb-1 block text-sm font-bold'
                htmlFor='publisher'
              >
                {t('Publisher')}:
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none'
                id='publisher'
                type='text'
                placeholder={t('Publisher')}
                value={selectedPublisher || ''}
                onChange={handlePublisherInputChange}
                onKeyDown={handlePublisherEnter}
              />
            </div>

            <div className='col-span-1'>
              <label className='mb-1 block text-sm font-bold' htmlFor='rank'>
                {t('Rank')}:
              </label>
              <select
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none'
                id='rank'
                value={selectedRank || ''}
                onChange={handleRankChangeInput}
              >
                <option value=''>{t('Rank')}</option>
                {/* ... options */}
                <option value='A*'>A*</option>
                <option value='A'>A</option>
                <option value='B'>B</option>
                <option value='AustralasianB'>Australasian B</option>
                <option value='C'>C</option>
                <option value='AustralasianC'>Australasian C</option>
                <option value='Unranked'>Unranked</option>
              </select>
            </div>

            <div className='col-span-1'>
              <label className='mb-1 block text-sm font-bold' htmlFor='source'>
                {t('Source')}:
              </label>
              <select
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none'
                id='source'
                value={selectedSource || ''}
                onChange={handleSourceChangeInput}
              >
                <option value=''>{t('Source')}</option>
                {/* ... options */}
                <option value='CORE2023'>CORE2023</option>
                <option value='CORE2021'>CORE2021</option>
                <option value='CORE2020'>CORE2020</option>
                <option value='CORE2018'>CORE2018</option>
                <option value='CORE2017'>CORE2017</option>
                <option value='CORE2014'>CORE2014</option>
                <option value='CORE2013'>CORE2013</option>
                <option value='ERA2010'>ERA2010</option>
              </select>
            </div>

            <div className='col-span-1'>
              <label
                className='mb-1 block text-sm font-bold'
                htmlFor='averageScore'
              >
                {t('Average_Score')}:
              </label>
              <select
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none'
                id='averageScore'
                value={selectedAverageScore || ''}
                onChange={handleAverageScoreChangeInput}
              >
                <option value=''>{t('Score')}</option>
                {/* ... options */}
                <option value='1'>1</option>
                <option value='2'>2</option>
                <option value='3'>3</option>
                <option value='4'>4</option>
                <option value='5'>5</option>
              </select>
            </div>
          </div>

          {/* Topics and Field of Research sections remain the same */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* ... Topics Input ... */}
            <div className='relative col-span-1'>
              <label className='mb-1 block text-sm font-bold' htmlFor='topics'>
                {' '}
                {/* Reduced mb */}
                {t('Topics')}:
              </label>
              <input
                type='text'
                id='topics'
                value={topicsInput}
                onChange={handleTopicInputChange}
                onKeyDown={handleTopicInputKeyDown}
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none' // Reduced py and px
                placeholder={t('Enter_topics')}
              />
              {topicSuggestions.length > 0 && (
                <ul className='bg-white-pure absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-300 shadow-md '>
                  {topicSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className='hover:bg-gray-10 cursor-pointer px-3 py-1 text-sm ' // Reduced py and px
                      onClick={() => handleTopicSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className='mt-2 flex flex-wrap gap-1'>
                {' '}
                {/* Reduced gap */}
                {selectedTopics.map((topic, index) => (
                  <div
                    key={index}
                    className='bg-gray-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-sm '
                  >
                    {' '}
                    {/* Reduced px and py */}
                    <span>{topic}</span>
                    <button
                      type='button'
                      className='hover:text-gray-700 focus:outline-none'
                      onClick={() => handleRemoveTopic(topic)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-3 w-3'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        {' '}
                        {/* Smaller icon */}
                        <path
                          fillRule='evenodd'
                          d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* ... Field of Research Input ... */}
            <div className='relative col-span-1'>
              <label
                className='mb-1 block text-sm font-bold'
                htmlFor='fieldOfResearch'
              >
                {' '}
                {/* Reduced mb */}
                {t('Field_of_Research')}:
              </label>
              <input
                type='text'
                id='fieldOfResearch'
                value={fieldOfResearchInput}
                onChange={handleFieldOfResearchInputChange}
                onKeyDown={handleFieldOfResearchInputKeyDown}
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none' // Reduced py and px
                placeholder={t('Enter_field_of_research')}
              />
              {fieldOfResearchSuggestions.length > 0 && (
                <ul className='bg-white-pure absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-300 shadow-md '>
                  {fieldOfResearchSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className='hover:bg-gray-10 cursor-pointer px-3 py-1 text-sm ' // Reduced py and px
                      onClick={() =>
                        handleFieldOfResearchSuggestionClick(suggestion)
                      }
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className='mt-2 flex flex-wrap gap-1'>
                {' '}
                {/* Reduced gap */}
                {selectedFieldsOfResearch.map((field, index) => (
                  <div
                    key={index}
                    className='bg-gray-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-sm '
                  >
                    {' '}
                    {/* Reduced px and py */}
                    <span>{field}</span>
                    <button
                      type='button'
                      className='hover:text-gray-700 focus:outline-none'
                      onClick={() => handleRemoveFieldOfResearch(field)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-3 w-3'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        {' '}
                        {/* Smaller icon */}
                        <path
                          fillRule='evenodd'
                          d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchAdvanceSection
