import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom' // Để sử dụng các matcher như toBeInTheDocument, toHaveAttribute

import NotFoundPage from '@/src/app/[locale]/utils/NotFoundPage'
import Button from '@/src/app/[locale]/utils/Button' // Import để Jest có thể tìm thấy và mock
import { Link } from '@/src/navigation' // Import để Jest có thể tìm thấy và mock

// --- Mocks ---
// Mock component Link từ thư viện navigation (điều chỉnh đường dẫn nếu cần)
// Giả lập nó thành một thẻ <a> đơn giản
jest.mock('@/src/navigation', () => ({
  // __esModule: true, // Đôi khi cần thiết tùy thuộc vào cấu hình module
  Link: jest.fn(({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ))
}))

// Mock component Button cục bộ
// Giả lập nó thành một thẻ <button> đơn giản, nhận children và các props khác
jest.mock('@/src/app/[locale]/utils/Button', () => {
  // Destructure các props mà Button thực sự nhận VÀ prop "rounded"
  // để loại bỏ "rounded" khỏi ...restProps
  return jest.fn(
    ({ children, className, variant, size, rounded, ...restProps }) => (
      // Chỉ spread các props còn lại (restProps) mà có thể là các thuộc tính HTML hợp lệ
      // hoặc các props khác mà chúng ta không quan tâm trong việc render của mock này.
      // Quan trọng là 'rounded' không còn trong restProps nữa.
      <button className={className} {...restProps}>
        {children}
      </button>
    )
  )
})

// --- Test Suite ---
describe('NotFoundPage Component', () => {
  // (Tùy chọn) Xóa các lần gọi mock trước mỗi test nếu cần
  // beforeEach(() => {
  //   (Link as jest.Mock).mockClear();
  //   (Button as jest.Mock).mockClear();
  // });

  test('renders all essential elements correctly', () => {
    render(<NotFoundPage />)

    // Kiểm tra heading 404
    expect(
      screen.getByRole('heading', { level: 1, name: /404/i }) // Sử dụng regex không phân biệt hoa thường
    ).toBeInTheDocument()

    // Kiểm tra các đoạn văn bản
    expect(screen.getByText(/Oops! Page not found./i)).toBeInTheDocument()
    expect(
      screen.getByText(
        /The page you are looking for might be temporarily unavailable or does not exist./i
      )
    ).toBeInTheDocument()

    // Kiểm tra sự tồn tại của button (thông qua mock) với đúng text
    // Lưu ý: getByRole('button') hoạt động vì mock của chúng ta render ra thẻ <button>
    expect(
      screen.getByRole('button', { name: /Go back to homepage/i })
    ).toBeInTheDocument()

    // Kiểm tra sự tồn tại của link (thông qua mock) với đúng text
    expect(
      screen.getByRole('link', { name: /Go back to homepage/i })
    ).toBeInTheDocument()
  })

  test('renders the "Go back to homepage" link pointing to the root ("/")', () => {
    render(<NotFoundPage />)

    // Tìm phần tử link (là thẻ <a> do mock tạo ra)
    const linkElement = screen.getByRole('link', {
      name: /Go back to homepage/i
    })

    // Kiểm tra xem link có tồn tại không
    expect(linkElement).toBeInTheDocument()
    // Kiểm tra thuộc tính href của link
    expect(linkElement).toHaveAttribute('href', '/')
  })

  test('passes correct props to the Button component', () => {
    render(<NotFoundPage />)

    // Lấy tham chiếu đến mock function của Button
    const MockButton = Button as jest.Mock // Ép kiểu sang jest.Mock để truy cập mock properties

    // Kiểm tra xem mock Button có được gọi ít nhất một lần không
    expect(MockButton).toHaveBeenCalled()

    // Lấy các props được truyền vào trong lần gọi *đầu tiên* (hoặc cuối cùng nếu chỉ có 1) của mock Button
    // mock.calls[0] là lần gọi đầu tiên
    // mock.calls[0][0] là đối số đầu tiên (object props) của lần gọi đầu tiên
    expect(MockButton).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'primary',
        size: 'large',
        rounded: true,
        className: 'ml-2', // Kiểm tra class cụ thể được truyền
        children: 'Go back to homepage'
      }),
      {} // Đối số thứ hai (thường là ref hoặc context, ở đây là rỗng)
    )

    // Hoặc kiểm tra từng prop riêng lẻ trên object props đã lấy ra
    // const buttonProps = MockButton.mock.calls[0][0];
    // expect(buttonProps).toHaveProperty('variant', 'primary');
    // expect(buttonProps).toHaveProperty('size', 'large');
    // expect(buttonProps).toHaveProperty('rounded', true);
    // expect(buttonProps).toHaveProperty('className', 'ml-2');
    // expect(buttonProps.children).toBe('Go back to homepage');
  })

  test('passes correct href prop to the Link component', () => {
    render(<NotFoundPage />)

    // Lấy tham chiếu đến mock function của Link
    const MockLink = Link as jest.Mock

    // Kiểm tra xem mock Link có được gọi với prop `href` đúng không
    expect(MockLink).toHaveBeenCalledWith(
      expect.objectContaining({
        href: '/'
      }),
      {} // Đối số thứ hai (context)
    )
  })
})
