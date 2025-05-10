// src/components/Feedback/FeedbackControls.tsx
import React, { useState, useRef } from 'react'
import useClickOutside from '../../../../../hooks/conferenceDetails/useClickOutside' // Adjust path as needed
import { SortOption } from '@/src/models/send/feedback.send'
import { useTranslations } from 'next-intl'

interface FeedbackControlsProps {
  filterStar: number | null
  sortOption: SortOption
  totalReviews: number
  displayedCount: number
  onFilterChange: (value: number | null) => void
  onSortChange: (value: SortOption) => void
}

const FeedbackControls: React.FC<FeedbackControlsProps> = ({
  filterStar,
  sortOption,
  totalReviews,
  displayedCount,
  onFilterChange,
  onSortChange
}) => {
  const t = useTranslations('')

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)
  const sortDropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(filterDropdownRef, () => setIsFilterOpen(false))
  useClickOutside(sortDropdownRef, () => setIsSortOpen(false))

  const handleFilterClick = (value: number | null) => {
    onFilterChange(value)
    setIsFilterOpen(false)
  }

  const handleSortClick = (value: SortOption) => {
    onSortChange(value)
    setIsSortOpen(false)
  }

  return (
    <div className='mb-6 flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0'>
      <div>
        <h2 className='text-xl font-semibold md:text-2xl'>
          {t('Conference_Feedback')}
        </h2>
        {t('showing_reviews_count', {
          displayedCount: displayedCount, // Giá trị cho {displayedCount}
          totalCount: totalReviews // Giá trị cho {totalCount} (dùng cho cả số và plural)
        })}
      </div>

      {/* Filter and Sort Dropdowns */}
      <div className='flex space-x-2'>
        {/* Filter Dropdown */}
        <div className='relative' ref={filterDropdownRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className='bg-gray-10 hover:bg-gray-20 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm '
            aria-haspopup='true'
            aria-expanded={isFilterOpen}
          >
            {filterStar === null
              ? t('All_Feedback')
              : `${filterStar} Star${filterStar > 1 ? 's' : ''}`}
            {/* SVG Arrow Icon */}
            <svg
              className='-mr-1 ml-2 h-5 w-5'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
          {isFilterOpen && (
            <div
              className='bg-white-pure absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none '
              role='menu'
              aria-orientation='vertical'
            >
              <div className='py-1'>
                <button
                  onClick={() => handleFilterClick(null)}
                  className={`${filterStar === null ? 'bg-gray-10  ' : ''} hover:bg-gray-10 block w-full px-4 py-2 text-left text-sm `}
                  role='menuitem'
                >
                  {t('All_Feedback')}
                </button>
                {[5, 4, 3, 2, 1].map(starValue => (
                  <button
                    key={starValue}
                    onClick={() => handleFilterClick(starValue)}
                    className={`${filterStar === starValue ? 'bg-gray-10  ' : ''} hover:bg-gray-10 block w-full px-4 py-2 text-left text-sm `}
                    role='menuitem'
                  >
                    {starValue} {t('Star')}
                    {starValue > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className='relative' ref={sortDropdownRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className='bg-gray-10 hover:bg-gray-20 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm '
            aria-haspopup='true'
            aria-expanded={isSortOpen}
          >
            {sortOption === 'time' ? t('Recently_Added') : t('Highest_Rated')}
            {/* SVG Arrow Icon */}
            <svg
              className='-mr-1 ml-2 h-5 w-5'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
          {isSortOpen && (
            <div
              className='bg-white-pure absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none '
              role='menu'
              aria-orientation='vertical'
            >
              <div className='py-1'>
                <button
                  onClick={() => handleSortClick('time')}
                  className={`${sortOption === 'time' ? 'bg-gray-10 ' : ''} hover:bg-gray-10 block w-full px-4 py-2 text-left text-sm `}
                  role='menuitem'
                >
                  {t('Recently_Added')}
                </button>
                <button
                  onClick={() => handleSortClick('star')}
                  className={`${sortOption === 'star' ? 'bg-gray-10 ' : ''} hover:bg-gray-10 block w-full px-4 py-2 text-left text-sm `}
                  role='menuitem'
                >
                  {t('Highest_Rated')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedbackControls
