// SearchAdvanceJournalSection.tsx
'use client'

import React, { useState } from 'react'
import useSearchJournalAdvancedForm from '../../../hooks/journals/useSearchJournalAdvancedForm' // Import the hook
import { useTranslations } from 'next-intl' // Import the hook

interface SearchJournalAdvanceSectionProps {
  isAdvancedOptionsVisible: boolean
  toggleAdvancedOptionsVisibility: () => void
  onSubjectAreasChange: (subjects: string[]) => void
  selectedSubjectAreas: string[]
  onQuartileChange: (quartile: string | null) => void
  selectedQuartile: string | null
  onOpenAccessTypesChange: (oaTypes: string[]) => void
  selectedOpenAccessTypes: string[]
  onPublisherChange: (publisher: string | null) => void
  selectedPublisher: string | null
  onLanguageChange: (language: string | null) => void
  selectedLanguage: string | null
  onImpactFactorChange: (impactFactor: string | null) => void // Using string for now, can be number or range later
  selectedImpactFactor: string | null
  onHIndexChange: (hIndex: string | null) => void // Using string for now
  selectedHIndex: string | null
  onCiteScoreChange: (citeScore: string | null) => void // Using string for now
  selectedCiteScore: string | null
  onSJRChange: (sjr: string | null) => void // Using string for now
  selectedSJR: string | null
  onOverallRankChange: (overallRank: string | null) => void // Using string for now
  selectedOverallRank: string | null
  onISSNChange: (issn: string | null) => void
  selectedISSN: string | null
}

const SearchAdvanceJournalSection: React.FC<
  SearchJournalAdvanceSectionProps
> = ({
  isAdvancedOptionsVisible,
  toggleAdvancedOptionsVisibility,
  onSubjectAreasChange,
  selectedSubjectAreas,
  onQuartileChange,
  selectedQuartile,
  onOpenAccessTypesChange,
  selectedOpenAccessTypes,
  onPublisherChange,
  selectedPublisher,
  onLanguageChange,
  selectedLanguage,
  onImpactFactorChange,
  selectedImpactFactor,
  onHIndexChange,
  selectedHIndex,
  onCiteScoreChange,
  selectedCiteScore,
  onSJRChange,
  selectedSJR,
  onOverallRankChange,
  selectedOverallRank,
  onISSNChange,
  selectedISSN
}) => {
  // Initialize the translation function with a namespace
  const t = useTranslations('SearchAdvancedJournal')

  const {
    subjectAreaInput,
    subjectAreaSuggestions,
    openAccessTypeInput,
    openAccessTypeSuggestions,
    availableSubjectAreas,
    availableLanguages,
    availableOpenAccessTypes,
    availableQuartiles,
    handleCiteScoreChangeInput,
    handleHIndexChangeInput,
    handleISSNChangeInput,
    handleImpactFactorChangeInput,
    handleLanguageChangeInput,
    handleOpenAccessTypeInputChange,
    handleOpenAccessTypeInputKeyDown,
    handleOpenAccessTypeSuggestionClick,
    handleOverallRankChangeInput,
    handlePublisherChangeInput,
    handleQuartileChangeInput,
    handleRemoveOpenAccessType,
    handleRemoveSubjectArea,
    handleSJRChangeInput,
    handleSubjectAreaInputChange,
    handleSubjectAreaInputKeyDown,
    handleSubjectAreaSuggestionClick
  } = useSearchJournalAdvancedForm({
    isAdvancedOptionsVisible,
    toggleAdvancedOptionsVisibility,
    onSubjectAreasChange,
    selectedSubjectAreas,
    onQuartileChange,
    selectedQuartile,
    onOpenAccessTypesChange,
    selectedOpenAccessTypes,
    onPublisherChange,
    selectedPublisher,
    onLanguageChange,
    selectedLanguage,
    onImpactFactorChange,
    selectedImpactFactor,
    onHIndexChange,
    selectedHIndex,
    onCiteScoreChange,
    selectedCiteScore,
    onSJRChange,
    selectedSJR,
    onOverallRankChange,
    selectedOverallRank,
    onISSNChange,
    selectedISSN
  })

  return (
    <div>
      <div className='mt-2 flex justify-end'>
        <button
          onClick={toggleAdvancedOptionsVisibility}
          className='text-sm hover:text-gray-800 focus:outline-none'
        >
          {isAdvancedOptionsVisible
            ? t('hideAdvancedSearch')
            : t('showAdvancedSearch')}{' '}
          {/* Use translation keys */}
        </button>
      </div>

      {isAdvancedOptionsVisible && (
        <div className='mt-4 rounded border p-4 shadow-md'>
          <div className='mb-4 grid grid-cols-3 gap-4 md:grid-cols-4'>
            <div className='relative col-span-3 md:col-span-2'>
              <label className='mb-2 block font-bold' htmlFor='subjectAreas'>
                {t('subjectAreasLabel')}:
              </label>
              <input
                type='text'
                id='subjectAreas'
                value={subjectAreaInput}
                onChange={handleSubjectAreaInputChange}
                onKeyDown={handleSubjectAreaInputKeyDown}
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                placeholder={t('subjectAreasPlaceholder')}
              />
              {subjectAreaSuggestions.length > 0 && (
                <ul className='absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow-md'>
                  {subjectAreaSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className='cursor-pointer px-4 py-2 text-sm hover:bg-gray-100'
                      onClick={() =>
                        handleSubjectAreaSuggestionClick(suggestion)
                      }
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className='mt-2 flex flex-wrap gap-2'>
                {selectedSubjectAreas.map((subject, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm'
                  >
                    <span>{subject}</span>
                    <button
                      type='button'
                      className='hover:text-gray-700 focus:outline-none'
                      onClick={() => handleRemoveSubjectArea(subject)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
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

            <div className='sm:col-span-1'>
              <label className='mb-2 block font-bold' htmlFor='quartile'>
                {t('quartileLabel')}:
              </label>
              <select
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                id='quartile'
                value={selectedQuartile || ''}
                onChange={handleQuartileChangeInput}
              >
                <option value=''>{t('selectQuartileOption')}</option>
                {availableQuartiles.map(quartile => (
                  <option key={quartile} value={quartile}>
                    {quartile}
                  </option>
                ))}
              </select>
            </div>

            <div className='sm:col-span-1'>
              <label className='mb-2 block font-bold' htmlFor='issn'>
                {t('issnLabel')}:
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                id='issn'
                type='text'
                placeholder={t('issnPlaceholder')}
                value={selectedISSN || ''}
                onChange={handleISSNChangeInput}
              />
            </div>

            <div className='relative col-span-3 md:col-span-2'>
              <label className='mb-2 block font-bold' htmlFor='openAccessTypes'>
                {t('openAccessTypesLabel')}:
              </label>
              <input
                type='text'
                id='openAccessTypes'
                value={openAccessTypeInput}
                onChange={handleOpenAccessTypeInputChange}
                onKeyDown={handleOpenAccessTypeInputKeyDown}
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                placeholder={t('openAccessTypesPlaceholder')}
              />
              {openAccessTypeSuggestions.length > 0 && (
                <ul className='absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow-md'>
                  {openAccessTypeSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className='cursor-pointer px-4 py-2 text-sm hover:bg-gray-100'
                      onClick={() =>
                        handleOpenAccessTypeSuggestionClick(suggestion)
                      }
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className='mt-2 flex flex-wrap gap-2'>
                {selectedOpenAccessTypes.map((type, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm'
                  >
                    <span>{type}</span>
                    <button
                      type='button'
                      className='hover:text-gray-700 focus:outline-none'
                      onClick={() => handleRemoveOpenAccessType(type)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
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

            <div className='sm:col-span-1'>
              <label className='mb-2 block font-bold' htmlFor='publisher'>
                {t('publisherLabel')}:
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                id='publisher'
                type='text'
                placeholder={t('publisherPlaceholder')}
                value={selectedPublisher || ''}
                onChange={handlePublisherChangeInput}
              />
            </div>

            <div className='sm:col-span-1'>
              <label className='mb-2 block font-bold' htmlFor='language'>
                {t('languageLabel')}:
              </label>
              <select
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                id='language'
                value={selectedLanguage || ''}
                onChange={handleLanguageChangeInput}
              >
                <option value=''>{t('selectLanguageOption')}</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className='mb-2 mt-4 font-semibold'>{t('metricsSectionTitle')}</p>
          <div className='grid grid-cols-3 gap-4 md:grid-cols-5'>
            <div className='sm:col-span-1'>
              <label className='mb-2 block font-bold' htmlFor='impactFactor'>
                {t('impactFactorLabel')}:
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                id='impactFactor'
                type='text'
                placeholder={t('impactFactorPlaceholder')}
                value={selectedImpactFactor || ''}
                onChange={handleImpactFactorChangeInput}
              />
            </div>

            <div className='sm:col-span-1'>
              <label className='mb-2 block font-bold' htmlFor='hIndex'>
                {t('hIndexLabel')}:
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                id='hIndex'
                type='text'
                placeholder={t('hIndexPlaceholder')}
                value={selectedHIndex || ''}
                onChange={handleHIndexChangeInput}
              />
            </div>

            <div className='sm:col-span-1'>
              <label className='mb-2 block font-bold' htmlFor='citeScore'>
                {t('citeScoreLabel')}:
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                id='citeScore'
                type='text'
                placeholder={t('citeScorePlaceholder')}
                value={selectedCiteScore || ''}
                onChange={handleCiteScoreChangeInput}
              />
            </div>

            <div className='sm:col-span-1'>
              <label className='mb-2 block font-bold' htmlFor='sjr'>
                {t('sjrLabel')}:
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                id='sjr'
                type='text'
                placeholder={t('sjrPlaceholder')}
                value={selectedSJR || ''}
                onChange={handleSJRChangeInput}
              />
            </div>

            <div className='sm:col-span-1'>
              <label className='mb-2 block font-bold' htmlFor='overallRank'>
                {t('overallRankLabel')}:
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                id='overallRank'
                type='text'
                placeholder={t('overallRankPlaceholder')}
                value={selectedOverallRank || ''}
                onChange={handleOverallRankChangeInput}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchAdvanceJournalSection
