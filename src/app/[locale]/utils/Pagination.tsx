// Pagination.tsx
import React from 'react'
import { useTranslations } from 'next-intl'

interface PaginationProps {
  eventsPerPage: number
  totalEvents: number
  paginate: (pageNumber: number) => void
  currentPage: number
}

const Pagination: React.FC<PaginationProps> = ({
  eventsPerPage,
  totalEvents,
  paginate,
  currentPage
}) => {
  const t = useTranslations()

  const totalPages = Math.ceil(totalEvents / eventsPerPage)
  // Don't render pagination if there's only one page or no events.
  if (totalPages <= 1 || totalEvents === 0) {
    return null
  }

  // Generate an array of page numbers.  More efficient than a loop.
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className='mt-8 flex items-center justify-center pb-4 text-xs'>
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className='mr-2 rounded-md bg-gray-200 px-2 py-1 hover:bg-gray-300  disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-900'
      >
        {t('Previous')}
      </button>

      {/*  Show a limited range of page numbers with ellipses  */}
      {pageNumbers.map(number => {
        const isCurrent = number === currentPage
        const isNearCurrent = Math.abs(number - currentPage) <= 2 // Show 2 pages on either side
        const isFirstOrLast = number === 1 || number === totalPages

        if (isFirstOrLast || isNearCurrent) {
          return (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`mr-1 rounded-md bg-gray-200 px-2 py-1 hover:bg-gray-300  dark:bg-gray-800 dark:hover:bg-gray-900  ${isCurrent ? 'bg-gray-400 font-bold dark:bg-black' : ''}`}
            >
              {number}
            </button>
          )
        } else if (Math.abs(number - currentPage) === 3) {
          return (
            <span key={number} className='px-4 py-2'>
              ...
            </span>
          )
        } else {
          return null // Don't render anything for pages far from the current page
        }
      })}

      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='rounded-md bg-gray-200 px-2 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-900'
      >
        {t('Next')}
      </button>
    </div>
  )
}

export default Pagination
