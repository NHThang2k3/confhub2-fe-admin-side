// Loading.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom' // Để sử dụng các matcher như toBeInTheDocument
import Loading from '@/src/app/[locale]/utils/Loading' // Đường dẫn đến component của bạn

describe('Loading Component', () => {
  // Test 1: Kiểm tra component có render mà không bị lỗi không
  test('renders without crashing', () => {
    render(<Loading />)
    // Kiểm tra xem phần tử chứa text "Loading ..." có tồn tại trong DOM không
    // Sử dụng regex với flag 'i' để không phân biệt hoa thường
    expect(screen.getByText(/Loading .../i)).toBeInTheDocument()
  })

  // Test 2: Kiểm tra xem text "Loading ..." có được hiển thị chính xác không
  test('displays the "Loading ..." text', () => {
    render(<Loading />)
    const loadingTextElement = screen.getByText(/Loading .../i)
    expect(loadingTextElement).toBeInTheDocument()
    // Bạn cũng có thể kiểm tra nội dung text chính xác nếu cần
    expect(loadingTextElement).toHaveTextContent('Loading ...')
  })

  // Test 3: Kiểm tra xem spinner (phần tử xoay) có được render không
  // Cách tốt nhất để chọn spinner là thêm một thuộc tính test-id
  // Hãy cập nhật component Loading của bạn một chút:
  /*
  // Trong Loading.tsx:
  <div
    data-testid="loading-spinner" // Thêm dòng này
    className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"
  ></div>
  */
  test('renders the loading spinner', () => {
    // Trước tiên, hãy cập nhật component Loading.tsx để thêm data-testid="loading-spinner"
    // vào thẻ div của spinner như comment ở trên.

    render(<Loading />)
    const spinnerElement = screen.getByTestId('loading-spinner')
    expect(spinnerElement).toBeInTheDocument()

    // Kiểm tra một số class CSS quan trọng (tùy chọn, vì đây là chi tiết triển khai)
    // expect(spinnerElement).toHaveClass('animate-spin');
    // expect(spinnerElement).toHaveClass('rounded-full');
    // expect(spinnerElement).toHaveClass('border-blue-500');
  })

  // Test 4: (Nâng cao hơn) Kiểm tra cấu trúc tổng thể hoặc các class chính (ít khuyến khích hơn)
  test('has the correct overall structure and styling classes', () => {
    const { container } = render(<Loading />)

    // Kiểm tra phần tử bao ngoài cùng có class gradient và flex không
    // Lưu ý: container.firstChild trả về phần tử gốc được render bởi component
    const outerDiv = container.firstChild
    expect(outerDiv).toHaveClass('bg-gradient-to-r')
    expect(outerDiv).toHaveClass('to-background-secondary') // Đảm bảo class này tồn tại hoặc đúng
    expect(outerDiv).toHaveClass('min-h-screen')
    expect(outerDiv).toHaveClass('flex')
    expect(outerDiv).toHaveClass('items-center')
    expect(outerDiv).toHaveClass('justify-center')

    // Kiểm tra container bên trong spinner và text
    const innerContainer = screen.getByText(/Loading .../i).parentElement // Lấy phần tử cha của text
    expect(innerContainer).toHaveClass('flex')
    expect(innerContainer).toHaveClass('flex-col')
    expect(innerContainer).toHaveClass('items-center')
    expect(innerContainer).toHaveClass('bg-white/80')
    expect(innerContainer).toHaveClass('p-6')
    expect(innerContainer).toHaveClass('rounded-lg')
  })
})

// --- Cập nhật component Loading.tsx (nếu bạn muốn dùng getByTestId) ---
/*
import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="bg-gradient-to-r to-background-secondary min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center bg-white/80 p-6 rounded-lg">
        <div
          data-testid="loading-spinner" // Thêm data-testid ở đây
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"
        ></div>
        <span className="ml-2 text-xl text-gray-800 mt-4">Loading ...</span>
      </div>
    </div>
  );
};

export default Loading;
*/
