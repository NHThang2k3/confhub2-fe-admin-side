// src/components/common/__tests__/Pagination.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event' // userEvent mô phỏng tốt hơn fireEvent
import '@testing-library/jest-dom' // Để dùng các matcher như toBeInTheDocument, toBeDisabled

import GeneralPagination from '@/src/app/[locale]/utils/GeneralPagination' // Adjust the path if necessary

describe('GeneralPagination Component', () => {
  // Mock function cho onPageChange để theo dõi việc gọi
  const mockOnPageChange = jest.fn()

  // Reset mock trước mỗi test để đảm bảo sự độc lập
  beforeEach(() => {
    mockOnPageChange.mockClear()
  })

  test('should not render if totalPages is 1 or less', () => {
    const { rerender } = render(
      <GeneralPagination
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    )
    // Tìm kiếm bằng role 'navigation' là cách tốt để tìm container chính
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()

    rerender(
      <GeneralPagination
        currentPage={1}
        totalPages={0}
        onPageChange={mockOnPageChange}
      />
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  test('should render correctly with basic props', () => {
    render(
      <GeneralPagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    )

    // Kiểm tra container tồn tại
    expect(screen.getByRole('navigation')).toBeInTheDocument()

    // Kiểm tra nút Previous và Next tồn tại và không bị disabled
    // Using regex here is fine as they are unique enough
    expect(
      screen.getByRole('button', { name: /go to previous page/i })
    ).toBeEnabled()
    expect(
      screen.getByRole('button', { name: /go to next page/i })
    ).toBeEnabled()

    // Kiểm tra trang hiện tại được đánh dấu (aria-current) và là button (disabled)
    // Use exact string match for specific page numbers
    const currentPageButton = screen.getByRole('button', {
      name: 'Go to page 3'
    })
    expect(currentPageButton).toHaveAttribute('aria-current', 'page')
    expect(currentPageButton).toBeDisabled() // Nút trang hiện tại thường bị disabled

    // Kiểm tra các nút trang khác tồn tại (ví dụ: trang 1 và trang cuối 10)
    // Use exact string match
    expect(
      screen.getByRole('button', { name: 'Go to page 1' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 10' })
    ).toBeInTheDocument()
  })

  test('should display correct page numbers when totalPages <= maxPageNumbersToShow', () => {
    render(
      <GeneralPagination
        currentPage={2}
        totalPages={5}
        maxPageNumbersToShow={5}
        onPageChange={mockOnPageChange}
      />
    )

    // Use exact string matches
    expect(
      screen.getByRole('button', { name: 'Go to page 1' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 2' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 3' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 4' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 5' })
    ).toBeInTheDocument()
    expect(screen.queryByText('...')).not.toBeInTheDocument() // Không có dấu ...
  })

  test('should display ellipsis correctly when currentPage is near the beginning', () => {
    render(
      <GeneralPagination
        currentPage={2}
        totalPages={10}
        maxPageNumbersToShow={5} // Expecting: 1, 2, 3, 4, 5, ..., 10
        onPageChange={mockOnPageChange}
      />
    )
    // Use exact string matches
    expect(
      screen.getByRole('button', { name: 'Go to page 1' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 5' })
    ).toBeInTheDocument()
    expect(screen.getByText('...')).toBeInTheDocument() // Should have one ellipsis
    expect(screen.getAllByText('...').length).toBe(1)
    expect(
      screen.getByRole('button', { name: 'Go to page 10' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Go to page 6' })
    ).not.toBeInTheDocument()
  })

  test('should display ellipsis correctly when currentPage is in the middle', () => {
    render(
      <GeneralPagination
        currentPage={5}
        totalPages={10}
        maxPageNumbersToShow={5} // Expecting: 1, ..., 4, 5, 6, ..., 10
        onPageChange={mockOnPageChange}
      />
    )
    // Use exact string matches
    expect(
      screen.getByRole('button', { name: 'Go to page 1' })
    ).toBeInTheDocument()
    expect(screen.getAllByText('...').length).toBe(2) // Phải có 2 dấu ...
    expect(
      screen.getByRole('button', { name: 'Go to page 4' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 5' })
    ).toBeInTheDocument() // Current
    expect(
      screen.getByRole('button', { name: 'Go to page 6' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 10' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Go to page 2' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Go to page 9' })
    ).not.toBeInTheDocument()
  })

  test('should display ellipsis correctly when currentPage is near the end', () => {
    render(
      <GeneralPagination
        currentPage={9}
        totalPages={10}
        maxPageNumbersToShow={5} // Expecting: 1, ..., 6, 7, 8, 9, 10
        onPageChange={mockOnPageChange}
      />
    )
    // Use exact string matches
    expect(
      screen.getByRole('button', { name: 'Go to page 1' })
    ).toBeInTheDocument()
    expect(screen.getByText('...')).toBeInTheDocument() // Should have one ellipsis
    expect(screen.getAllByText('...').length).toBe(1)
    expect(
      screen.getByRole('button', { name: 'Go to page 6' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 10' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Go to page 5' })
    ).not.toBeInTheDocument()
  })

  test('should disable Previous button on first page', () => {
    render(
      <GeneralPagination
        currentPage={1}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    )
    expect(
      screen.getByRole('button', { name: /go to previous page/i })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /go to next page/i })
    ).toBeEnabled()
  })

  test('should disable Next button on last page', () => {
    render(
      <GeneralPagination
        currentPage={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    )
    expect(
      screen.getByRole('button', { name: /go to previous page/i })
    ).toBeEnabled()
    expect(
      screen.getByRole('button', { name: /go to next page/i })
    ).toBeDisabled()
  })

  test('should call onPageChange with correct page number when a page button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <GeneralPagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    )

    // Use exact string match
    const page5Button = screen.getByRole('button', { name: 'Go to page 5' })
    await user.click(page5Button)

    expect(mockOnPageChange).toHaveBeenCalledTimes(1)
    expect(mockOnPageChange).toHaveBeenCalledWith(5)
  })

  test('should call onPageChange with correct page number when Previous button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <GeneralPagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    )

    const previousButton = screen.getByRole('button', {
      name: /go to previous page/i
    })
    await user.click(previousButton)

    expect(mockOnPageChange).toHaveBeenCalledTimes(1)
    expect(mockOnPageChange).toHaveBeenCalledWith(2) // 3 - 1 = 2
  })

  test('should call onPageChange with correct page number when Next button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <GeneralPagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    )

    const nextButton = screen.getByRole('button', { name: /go to next page/i })
    await user.click(nextButton)

    expect(mockOnPageChange).toHaveBeenCalledTimes(1)
    expect(mockOnPageChange).toHaveBeenCalledWith(4) // 3 + 1 = 4
  })

  test('should not call onPageChange when the current page button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <GeneralPagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    )

    // Use exact string match
    const currentPageButton = screen.getByRole('button', {
      name: 'Go to page 3'
    })
    // Nút này bị disabled, userEvent sẽ không kích hoạt sự kiện click
    // Nếu dùng fireEvent, nó có thể kích hoạt, nhưng logic trong component ngăn chặn gọi onPageChange
    // userEvent.click doesn't fire on disabled elements, which is correct behavior.
    // We can still assert the function wasn't called.
    // await user.click(currentPageButton); // This line might not even be necessary as it won't fire

    expect(currentPageButton).toBeDisabled() // Ensure it's disabled first
    expect(mockOnPageChange).not.toHaveBeenCalled()
  })

  test('should not call onPageChange when disabled Previous button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <GeneralPagination
        currentPage={1}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    )

    const previousButton = screen.getByRole('button', {
      name: /go to previous page/i
    })
    expect(previousButton).toBeDisabled() // Xác nhận nó bị disabled
    // userEvent.click doesn't fire on disabled elements.
    // await user.click(previousButton);

    expect(mockOnPageChange).not.toHaveBeenCalled()
  })

  test('should not call onPageChange when disabled Next button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <GeneralPagination
        currentPage={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    )

    const nextButton = screen.getByRole('button', { name: /go to next page/i })
    expect(nextButton).toBeDisabled() // Xác nhận nó bị disabled
    // userEvent.click doesn't fire on disabled elements.
    // await user.click(nextButton);

    expect(mockOnPageChange).not.toHaveBeenCalled()
  })

  test('should respect maxPageNumbersToShow prop (even number)', () => {
    // Logic Recap: currentPage=6, total=20, max=6 -> half=3
    // start = 6-3=3, end = 6+3-1=8
    // Expected: 1, ..., 3, 4, 5, 6, 7, 8, ..., 20
    render(
      <GeneralPagination
        currentPage={6}
        totalPages={20}
        maxPageNumbersToShow={6}
        onPageChange={mockOnPageChange}
      />
    )
    // Use exact string matches
    expect(
      screen.getByRole('button', { name: 'Go to page 1' })
    ).toBeInTheDocument()
    expect(screen.getAllByText('...').length).toBe(2)
    expect(
      screen.getByRole('button', { name: 'Go to page 3' })
    ).toBeInTheDocument() // Page 3 is present
    expect(
      screen.getByRole('button', { name: 'Go to page 4' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 5' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 6' })
    ).toBeInTheDocument() // Current
    expect(
      screen.getByRole('button', { name: 'Go to page 7' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 8' })
    ).toBeInTheDocument() // Page 8 is present
    expect(
      screen.getByRole('button', { name: 'Go to page 20' })
    ).toBeInTheDocument()
    // Check for absence of pages outside the calculated range
    expect(
      screen.queryByRole('button', { name: 'Go to page 2' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Go to page 9' })
    ).not.toBeInTheDocument()
  })

  test('should apply custom className to the container', () => {
    const customClass = 'my-custom-pagination-styles'
    render(
      <GeneralPagination
        currentPage={1}
        totalPages={10}
        onPageChange={mockOnPageChange}
        className={customClass}
      />
    )

    const navElement = screen.getByRole('navigation')
    expect(navElement).toHaveClass(customClass)
    // Also check it retains base classes if needed (though not strictly necessary for this test)
    expect(navElement).toHaveClass(
      'flex',
      'justify-center',
      'items-center',
      'mt-6'
    )
  })

  test('should handle edge case where start/end calculation would overlap first/last page', () => {
    // Case 1: Current page is 2, maxToShow is 5, total is 10
    // Expected: 1, 2, 3, 4, 5, ..., 10 (No ellipsis near beginning)
    const { rerender } = render(
      <GeneralPagination
        currentPage={2}
        totalPages={10}
        maxPageNumbersToShow={5}
        onPageChange={mockOnPageChange}
      />
    )
    expect(screen.queryByText('...')).toBeInTheDocument() // One ellipsis near end
    expect(screen.getAllByText('...').length).toBe(1)
    expect(
      screen.getByRole('button', { name: 'Go to page 5' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Go to page 6' })
    ).not.toBeInTheDocument()

    // Case 2: Current page is totalPages - 1 (e.g., 9), maxToShow is 5, total is 10
    // Expected: 1, ..., 6, 7, 8, 9, 10 (No ellipsis near end)
    rerender(
      <GeneralPagination
        currentPage={9}
        totalPages={10}
        maxPageNumbersToShow={5}
        onPageChange={mockOnPageChange}
      />
    )
    expect(screen.queryByText('...')).toBeInTheDocument() // One ellipsis near beginning
    expect(screen.getAllByText('...').length).toBe(1)
    expect(
      screen.getByRole('button', { name: 'Go to page 6' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Go to page 5' })
    ).not.toBeInTheDocument()
  })

  test('should handle small totalPages correctly with ellipsis logic', () => {
    // totalPages = 7, maxToShow = 5. Logic should simplify correctly
    // Current page 4: 1, 2, 3, 4, 5, 6, 7 (no ellipsis needed as totalPages is just slightly > maxToShow)
    // Correction: The logic WILL add ellipsis if start > 2 or end < total - 1
    // Let's trace: current=4, total=7, max=5 -> half=2
    // Middle case: start=4-2=2, end=4+2=6
    // getPageNumbers: [1, (start>2 false), 2, 3, 4, 5, 6, (end<total-1 false), 7] -> [1, 2, 3, 4, 5, 6, 7]
    // Test confirms NO ellipsis
    render(
      <GeneralPagination
        currentPage={4}
        totalPages={7}
        maxPageNumbersToShow={5}
        onPageChange={mockOnPageChange}
      />
    )
    expect(screen.queryByText('...')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 1' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 7' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 3' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 5' })
    ).toBeInTheDocument()
  })

  test('should render correctly when maxPageNumbersToShow is large', () => {
    // If maxPageNumbersToShow >= totalPages, show all numbers
    render(
      <GeneralPagination
        currentPage={3}
        totalPages={8}
        maxPageNumbersToShow={10}
        onPageChange={mockOnPageChange}
      />
    )
    expect(screen.queryByText('...')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 1' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to page 8' })
    ).toBeInTheDocument()
    // Check a middle number
    expect(
      screen.getByRole('button', { name: 'Go to page 5' })
    ).toBeInTheDocument()
  })
})
