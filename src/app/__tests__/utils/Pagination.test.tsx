import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event' // Sử dụng user-event để click
import '@testing-library/jest-dom'

import Pagination from '@/src/app/[locale]/utils/Pagination' // Đường dẫn tới component của bạn

// --- Mock Dependencies ---
// Mock hook useTranslations từ next-intl
jest.mock('next-intl', () => ({
  // Mock hàm useTranslations trả về một function
  useTranslations: jest.fn(
    () =>
      // Function này (mock của 't') chỉ đơn giản trả về key được truyền vào
      (key: string) =>
        key
  )
}))

// --- Test Suite ---
describe('Pagination Component', () => {
  // Tạo một mock function cho prop paginate để theo dõi các lần gọi
  const mockPaginate = jest.fn()

  // Reset mock trước mỗi test để đảm bảo tính độc lập
  beforeEach(() => {
    mockPaginate.mockClear()
    // (Tùy chọn) Nếu bạn muốn reset cả mock useTranslations (thường không cần thiết vì nó stateless)
    // (useTranslations as jest.Mock).mockClear();
  })

  // Helper function để render component với các props cụ thể
  const renderPagination = (props = {}) => {
    const defaultProps = {
      eventsPerPage: 10,
      totalEvents: 50, // Mặc định 5 trang
      paginate: mockPaginate,
      currentPage: 1
    }
    return render(<Pagination {...defaultProps} {...props} />)
  }

  // --- Test Cases ---

  test('does not render if total pages is 1 or less', () => {
    const { container: container1 } = renderPagination({ totalEvents: 10 }) // 1 trang
    // Kiểm tra xem container có trống không (hoặc cách khác là query phần tử chính và mong đợi null)
    expect(container1.firstChild).toBeNull()

    const { container: container2 } = renderPagination({ totalEvents: 5 }) // 1 trang
    expect(container2.firstChild).toBeNull()
  })

  test('does not render if total events is 0', () => {
    const { container } = renderPagination({ totalEvents: 0 })
    expect(container.firstChild).toBeNull()
  })

  test('renders correctly with multiple pages (initial view on page 1)', () => {
    // Rõ ràng hơn về trạng thái đang test
    renderPagination({ totalEvents: 45, currentPage: 1 }) // 5 trang, ở trang 1

    // Kiểm tra nút Previous và Next
    expect(
      screen.getByRole('button', { name: /previous/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()

    // Kiểm tra các nút số trang được hiển thị
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()

    // Kiểm tra sự tồn tại của dấu ... thay vì nút 4
    expect(screen.getByText('...')).toBeInTheDocument() // Tìm phần tử có nội dung là '...'
    // Đảm bảo nút 4 *không* hiển thị
    expect(screen.queryByRole('button', { name: '4' })).not.toBeInTheDocument()

    // Kiểm tra nút trang cuối
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument()
  })

  test('disables Previous button on the first page', () => {
    renderPagination({ currentPage: 1, totalEvents: 30 }) // 3 trang
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  test('disables Next button on the last page', () => {
    renderPagination({ currentPage: 3, totalEvents: 30 }) // Trang 3/3
    expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  test('enables both buttons on a middle page', () => {
    renderPagination({ currentPage: 2, totalEvents: 30 }) // Trang 2/3
    expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  test('calls paginate with the correct page number when a page number button is clicked', async () => {
    const user = userEvent.setup() // Setup user-event
    renderPagination({ currentPage: 1, totalEvents: 50 }) // 5 trang

    const page3Button = screen.getByRole('button', { name: '3' })
    await user.click(page3Button)

    expect(mockPaginate).toHaveBeenCalledTimes(1)
    expect(mockPaginate).toHaveBeenCalledWith(3)
  })

  test('calls paginate with the correct page number when Previous button is clicked', async () => {
    const user = userEvent.setup()
    renderPagination({ currentPage: 3, totalEvents: 50 }) // Bắt đầu ở trang 3

    const previousButton = screen.getByRole('button', { name: /previous/i })
    await user.click(previousButton)

    expect(mockPaginate).toHaveBeenCalledTimes(1)
    expect(mockPaginate).toHaveBeenCalledWith(2) // currentPage - 1
  })

  test('calls paginate with the correct page number when Next button is clicked', async () => {
    const user = userEvent.setup()
    renderPagination({ currentPage: 3, totalEvents: 50 }) // Bắt đầu ở trang 3

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    expect(mockPaginate).toHaveBeenCalledTimes(1)
    expect(mockPaginate).toHaveBeenCalledWith(4) // currentPage + 1
  })

  test('applies active styles to the current page button', () => {
    renderPagination({ currentPage: 2, totalEvents: 50 }) // Trang 2/5

    const page2Button = screen.getByRole('button', { name: '2' })
    const page1Button = screen.getByRole('button', { name: '1' })

    // Kiểm tra class cụ thể - Lưu ý: cách này có thể dễ bị hỏng nếu class thay đổi
    expect(page2Button).toHaveClass('bg-gray-400')
    expect(page2Button).toHaveClass('font-bold')

    // Kiểm tra trang không active không có class đó
    expect(page1Button).not.toHaveClass('bg-gray-400')
    expect(page1Button).not.toHaveClass('font-bold')

    // Nếu component dùng aria-current, cách kiểm tra tốt hơn sẽ là:
    // expect(page2Button).toHaveAttribute('aria-current', 'page');
    // expect(page1Button).not.toHaveAttribute('aria-current');
  })

  test('renders ellipses correctly when there are many pages', () => {
    // 10 trang, đang ở trang 5
    renderPagination({ currentPage: 5, totalEvents: 100, eventsPerPage: 10 })

    // Trang đầu và cuối luôn hiển thị
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument()

    // Các trang gần trang hiện tại (5 +/- 2)
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument() // 5 - 2
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument() // 5 - 1
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument() // Trang hiện tại
    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument() // 5 + 1
    expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument() // 5 + 2

    // Các trang xa hơn bị ẩn
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '8' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '9' })).not.toBeInTheDocument()

    // Kiểm tra sự xuất hiện của dấu chấm lửng (...)
    // Sẽ có 2 dấu ... (một sau trang 1, một trước trang 10)
    const ellipses = screen.getAllByText('...') // Tìm tất cả các phần tử có text '...'
    expect(ellipses).toHaveLength(2) // Mong đợi tìm thấy 2 dấu ...
  })

  test('renders ellipses correctly near the beginning', () => {
    renderPagination({ currentPage: 3, totalEvents: 100, eventsPerPage: 10 }) // Trang 3/10

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument() // 3 + 1
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument() // 3 + 2

    expect(screen.queryByRole('button', { name: '6' })).not.toBeInTheDocument()

    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument()

    // Chỉ có 1 dấu ... (trước trang 10)
    const ellipses = screen.getAllByText('...')
    expect(ellipses).toHaveLength(1)
  })

  test('renders ellipses correctly near the end', () => {
    renderPagination({ currentPage: 8, totalEvents: 100, eventsPerPage: 10 }) // Trang 8/10

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument()

    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument() // 8 - 2
    expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument() // 8 - 1
    expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument()

    // Chỉ có 1 dấu ... (sau trang 1)
    const ellipses = screen.getAllByText('...')
    expect(ellipses).toHaveLength(1)
  })
})
