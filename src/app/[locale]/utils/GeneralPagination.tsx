// src/components/common/Pagination.tsx
import React from 'react';

interface PaginationProps {
  /** The currently active page (1-based index) */
  currentPage: number;
  /** Total number of pages available */
  totalPages: number;
  /** Callback function triggered when a page button is clicked. Receives the target page number (1-based). */
  onPageChange: (page: number) => void;
  /** Maximum number of page number buttons to display directly (excluding Previous/Next/Ellipsis). Default is 5. */
  maxPageNumbersToShow?: number;
  /** Optional additional CSS classes for the container */
  className?: string;
}

const GeneralPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPageNumbersToShow = 5, // Default to showing 5 page numbers
  className = '',
}) => {
  // Don't render pagination if there's only one page or fewer
  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page: number) => {
    // Prevent calling onPageChange if the page is out of bounds or already current
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // --- Logic to determine which page numbers to display ---
  const getPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    const halfMaxPages = Math.floor(maxPageNumbersToShow / 2);

    // Case 1: Total pages are less than or equal to the max to show
    if (totalPages <= maxPageNumbersToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    }
    // Case 2: Total pages are more than the max to show
    else {
      let startPage: number;
      let endPage: number;

      // Determine start and end pages, trying to center the current page
      if (currentPage <= halfMaxPages + 1) {
        // Near the beginning
        startPage = 1;
        endPage = maxPageNumbersToShow;
      } else if (currentPage >= totalPages - halfMaxPages) {
        // Near the end
        startPage = totalPages - maxPageNumbersToShow + 1;
        endPage = totalPages;
      } else {
        // In the middle
        startPage = currentPage - halfMaxPages;
        endPage = currentPage + halfMaxPages;
        // Adjust if maxPageNumbersToShow is even
         if (maxPageNumbersToShow % 2 === 0) {
             endPage = currentPage + halfMaxPages -1;
         }
      }

      // Always add the first page
      pageNumbers.push(1);

      // Add ellipsis if startPage is greater than 2
      if (startPage > 2) {
        pageNumbers.push('...');
      }

      // Add the calculated range of pages
      for (let i = startPage; i <= endPage; i++) {
         // Avoid adding page 1 or totalPages again if they are part of the range
         if (i > 1 && i < totalPages) {
            pageNumbers.push(i);
         }
      }

      // Add ellipsis if endPage is less than totalPages - 1
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      // Always add the last page
      pageNumbers.push(totalPages);
    }

    // Remove potential duplicate ellipsis if the range is small
    // e.g., [1, '...', 2, 3, '...', 10] -> [1, 2, 3, '...', 10] if start/end are close
    const cleanedPageNumbers: (number | string)[] = [];
    let lastItem: number | string | null = null;
    for (const item of pageNumbers) {
        if (!(item === '...' && lastItem === '...')) {
            cleanedPageNumbers.push(item);
        }
        lastItem = item;
    }

    return cleanedPageNumbers; // Use cleanedPageNumbers if implementing the cleaning logic above
     // return pageNumbers; // Use this if not implementing the duplicate ellipsis cleaning
  };

  const pageNumbersToDisplay = getPageNumbers();

  // --- Tailwind CSS Classes ---
  const baseButtonClass = "mx-1 px-3 py-1 rounded text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300";
  const inactiveButtonClass = "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300";
  const activeButtonClass = "bg-blue-500 text-white border border-blue-500 cursor-default";
  const disabledButtonClass = "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed";
  const ellipsisClass = "mx-1 px-3 py-1 text-sm text-gray-500";


  return (
    <nav aria-label="Pagination" className={`flex justify-center items-center mt-6 ${className}`}>
      <ul className="inline-flex items-center -space-x-px">
        {/* Previous Button */}
        <li>
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${baseButtonClass} ${currentPage === 1 ? disabledButtonClass : inactiveButtonClass
              }`}
            aria-label="Go to previous page"
          >
            « {/* Or use an SVG icon */}
            {/* Previous */}
          </button>
        </li>

        {/* Page Number Buttons & Ellipsis */}
        {pageNumbersToDisplay.map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className={ellipsisClass}>...</span>
            ) : (
              <button
                onClick={() => handlePageClick(page as number)}
                disabled={page === currentPage}
                className={`${baseButtonClass} ${page === currentPage ? activeButtonClass : inactiveButtonClass
                  }`}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${baseButtonClass} ${currentPage === totalPages ? disabledButtonClass : inactiveButtonClass
              }`}
            aria-label="Go to next page"
          >
             » {/* Or use an SVG icon */}
             {/* Next */}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default GeneralPagination;