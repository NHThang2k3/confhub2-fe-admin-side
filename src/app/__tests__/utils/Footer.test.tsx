// __tests__/Footer.test.tsx (hoặc đặt trong thư mục tương ứng với cấu trúc dự án của bạn)

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom' // Đảm bảo import này ở jest.setup.ts hoặc ở đây

import Footer from '@/src/app/[locale]/utils/Footer' // Adjust the path to your Footer component

// --- Mocking Dependencies ---

// 1. Mock next-intl
// Trả về key thay vì bản dịch thực tế để test dễ dàng hơn
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key) // Mock t(key) trả về chính key đó
}))

// 2. Mock custom navigation (Link và usePathname)
// Chúng ta cần một biến để có thể thay đổi giá trị trả về của usePathname trong các test khác nhau
let mockPathname = '/' // Default to homepage for the first test scenario
jest.mock('@/src/navigation', () => ({
  // Mock Link component để render thành thẻ <a> đơn giản
  // Xử lý cả href là string và object
  Link: jest.fn(({ href, children, ...props }) => (
    <a href={typeof href === 'string' ? href : JSON.stringify(href)} {...props}>
      {children}
    </a>
  )),
  // Mock usePathname để trả về giá trị chúng ta kiểm soát
  usePathname: jest.fn(() => mockPathname)
}))

// 3. Mock next/image
// Mock component Image thành thẻ <img> đơn giản
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line jsx-a11y/alt-text -- Alt is passed via props
    return <img {...props} />
  }
}))

// --- Test Suite ---

describe('Footer Component', () => {
  // Helper function để tránh lặp lại render
  const renderFooter = () => {
    render(<Footer />)
  }

  // --- Scenario 1: Rendering on Homepage ---
  describe('when on the homepage', () => {
    beforeAll(() => {
      // Set pathname cho kịch bản homepage trước khi chạy các test trong describe này
      mockPathname = '/' // Hoặc có thể là /en, /vi tùy cấu hình locale
    })

    test('renders the full footer content', () => {
      renderFooter()

      // Kiểm tra các tiêu đề section có hiển thị không (dùng key từ useTranslations mock)
      expect(
        screen.getByRole('heading', { name: /quick_link/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /follow_us/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /popular_topics/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /popular_countries/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /company/i })
      ).toBeInTheDocument()

      // Kiểm tra một vài link cụ thể
      expect(screen.getByRole('link', { name: /support/i })).toHaveAttribute(
        'href',
        '/support'
      )
      expect(
        screen.getByRole('link', { name: /conferences/i })
      ).toHaveAttribute('href', '/conferences')
      expect(screen.getByRole('link', { name: /business/i })).toHaveAttribute(
        'href',
        JSON.stringify({
          pathname: '/conferences',
          query: { topics: 'Business' }
        })
      )
      expect(screen.getByRole('link', { name: /australia/i })).toHaveAttribute(
        'href',
        JSON.stringify({
          pathname: '/conferences',
          query: { country: 'Australia' }
        })
      )

      // Kiểm tra sự hiện diện của logo (thẻ img được mock)
      const logo = screen.getByAltText('Background image') // Sử dụng alt text bạn đã đặt
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/hcmus_logo.png')

      // Kiểm tra phần copyright
      expect(screen.getByText(/terms_of_service/i)).toBeInTheDocument()
      expect(screen.getByText(/copyrights/i)).toBeInTheDocument()

      // Kiểm tra phần copyright có border-top
      const copyrightDiv = screen.getByText(/terms_of_service/i).parentElement
      expect(copyrightDiv).toHaveClass('border-t')
    })

    test('renders the full footer content with locale path (e.g., /en)', () => {
      mockPathname = '/en' // Test trường hợp homepage với locale prefix
      renderFooter()

      // Chỉ cần kiểm tra một vài yếu tố để xác nhận logic isHomePage hoạt động đúng
      expect(
        screen.getByRole('heading', { name: /quick_link/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /support/i })).toBeInTheDocument()
      const copyrightDiv = screen.getByText(/terms_of_service/i).parentElement
      expect(copyrightDiv).toHaveClass('border-t')
    })

    test('renders the full footer content with locale path ending slash (e.g., /vi/)', () => {
      mockPathname = '/vi/' // Test trường hợp homepage với locale prefix và dấu / cuối
      renderFooter()

      expect(
        screen.getByRole('heading', { name: /quick_link/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /support/i })).toBeInTheDocument()
      const copyrightDiv = screen.getByText(/terms_of_service/i).parentElement
      expect(copyrightDiv).toHaveClass('border-t')
    })

    // Add tests for social media links if needed, e.g., checking their hrefs
    test('renders social media links', () => {
      renderFooter()
      // Example: Find link containing the Facebook SVG path data (less robust) or use aria-label if added
      const socialLinks = screen.getAllByRole('link', { name: '' }) // Get all links without explicit name
      // You might need a more specific way to target these icons, maybe adding aria-label to the Links
      // For now, check if at least 3 such links exist (Facebook, Twitter, Instagram based on your code)
      // Check hrefs of the first 3 icon links (assuming order)
      expect(socialLinks[0]).toHaveAttribute('href', '/') // Adjust href if they point elsewhere
      expect(socialLinks[1]).toHaveAttribute('href', '/')
      expect(socialLinks[2]).toHaveAttribute('href', '/')
      // A better approach would be adding aria-label="Facebook" etc. to the Link components
    })
  })

  // --- Scenario 2: Rendering on a Non-Homepage Page ---
  describe('when not on the homepage', () => {
    beforeAll(() => {
      // Set pathname cho kịch bản không phải homepage
      mockPathname = '/conferences/some-conference-detail'
    })

    test('renders only the copyright section without top border', () => {
      renderFooter()

      // Kiểm tra các tiêu đề section KHÔNG hiển thị
      expect(
        screen.queryByRole('heading', { name: /quick_link/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: /follow_us/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: /popular_topics/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: /popular_countries/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: /company/i })
      ).not.toBeInTheDocument()

      // Kiểm tra các link KHÔNG hiển thị
      expect(
        screen.queryByRole('link', { name: /support/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: /business/i })
      ).not.toBeInTheDocument()

      // Kiểm tra logo KHÔNG hiển thị
      expect(screen.queryByAltText('Background image')).not.toBeInTheDocument()

      // Kiểm tra phần copyright VẪN hiển thị
      expect(screen.getByText(/terms_of_service/i)).toBeInTheDocument()
      expect(screen.getByText(/copyrights/i)).toBeInTheDocument()

      // Kiểm tra phần copyright KHÔNG có border-top
      const copyrightDiv = screen.getByText(/terms_of_service/i).parentElement
      expect(copyrightDiv).not.toHaveClass('border-t')
    })
  })
})
