// __tests__/Button.test.tsx (hoặc đặt trong thư mục src/components/__tests__/Button.test.tsx)

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom' // Đảm bảo bạn đã import cái này trong jest.setup.js hoặc ở đây

import Button from '@/src/app/[locale]/utils/Button' // Điều chỉnh đường dẫn nếu cần

describe('Button Component', () => {
  // --- Test Rendering Cơ bản ---
  test('renders button with children correctly', () => {
    render(<Button>Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /click me/i })
    expect(buttonElement).toBeInTheDocument()
  })

  // --- Test Props: variant ---
  test('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>)
    const buttonElement = screen.getByRole('button', { name: /primary/i })
    expect(buttonElement).toHaveClass('bg-button') // Class của variant primary
    expect(buttonElement).toHaveClass('text-button-text')
    expect(buttonElement).toHaveClass('ring-secondary')
  })

  test('applies secondary variant styles', () => {
    render(<Button variant='secondary'>Secondary</Button>)
    const buttonElement = screen.getByRole('button', { name: /secondary/i })
    expect(buttonElement).toHaveClass('bg-button-secondary')
    expect(buttonElement).toHaveClass('text-secondary')
    expect(buttonElement).toHaveClass('ring-secondary')
    expect(buttonElement).not.toHaveClass('bg-button') // Đảm bảo không có class primary
  })

  test('applies danger variant styles', () => {
    render(<Button variant='danger'>Danger</Button>)
    const buttonElement = screen.getByRole('button', { name: /danger/i })
    expect(buttonElement).toHaveClass('bg-danger')
    expect(buttonElement).toHaveClass('text-danger') // Giả sử text color cũng là danger
    expect(buttonElement).toHaveClass('ring-danger')
  })

  // --- Test Props: size ---
  test('applies medium size styles by default', () => {
    render(<Button>Medium</Button>)
    const buttonElement = screen.getByRole('button', { name: /medium/i })
    expect(buttonElement).toHaveClass(
      'px-4',
      'py-2',
      'text-base',
      'font-semibold'
    )
  })

  test('applies small size styles', () => {
    render(<Button size='small'>Small</Button>)
    const buttonElement = screen.getByRole('button', { name: /small/i })
    expect(buttonElement).toHaveClass('px-2', 'py-1', 'text-sm')
  })

  test('applies large size styles', () => {
    render(<Button size='large'>Large</Button>)
    const buttonElement = screen.getByRole('button', { name: /large/i })
    expect(buttonElement).toHaveClass(
      'px-6',
      'py-3',
      'text-lg',
      'font-semibold'
    )
  })

  // --- Test Props: rounded ---
  test('applies rounded-full class when rounded is true', () => {
    render(<Button rounded>Rounded</Button>)
    const buttonElement = screen.getByRole('button', { name: /rounded/i })
    expect(buttonElement).toHaveClass('rounded-full')
  })

  test('does not apply rounded-full class by default (rounded is false)', () => {
    render(<Button>Not Rounded</Button>)
    const buttonElement = screen.getByRole('button', { name: /not rounded/i })
    expect(buttonElement).not.toHaveClass('rounded-full')
    expect(buttonElement).toHaveClass('rounded') // Class cơ bản vẫn có
  })

  // --- Test Props: advanced ---
  test('renders only the button when advanced is false (default)', () => {
    const { container } = render(<Button>Simple</Button>)
    const buttonElement = screen.getByRole('button', { name: /simple/i })
    expect(buttonElement).toBeInTheDocument()
    // Kiểm tra xem button có phải là phần tử con trực tiếp của container render không (không có div bao ngoài)
    // Hoặc kiểm tra parentElement không có các class của div wrapper
    expect(buttonElement.parentElement).toBe(container)
    expect(buttonElement).not.toHaveClass('relative', 'group') // Các class chỉ thêm khi advanced=true
    // Kiểm tra không có span hiệu ứng ripple
    expect(
      screen.queryByText('', { selector: 'span.animate-pulse-ripple' })
    ).not.toBeInTheDocument()
  })

  test('wraps button in a div with ripple span when advanced is true', () => {
    const { container } = render(<Button advanced>Advanced</Button>)
    const buttonElement = screen.getByRole('button', { name: /advanced/i })
    expect(buttonElement).toBeInTheDocument()

    // Kiểm tra button có các class advanced
    expect(buttonElement).toHaveClass(
      'relative',
      'hover:shadow-lg',
      'transition-shadow',
      'duration-300',
      'group'
    )

    // Kiểm tra có div bao ngoài
    const wrapperDiv = buttonElement.parentElement
    expect(wrapperDiv).not.toBe(container) // Không còn là con trực tiếp
    expect(wrapperDiv?.tagName).toBe('DIV')
    expect(wrapperDiv).toHaveClass(
      'rounded-full',
      'relative',
      'overflow-hidden'
    ) // Class của div wrapper

    // Kiểm tra có span hiệu ứng ripple là con của div wrapper
    const rippleSpan = wrapperDiv?.querySelector('span')
    expect(rippleSpan).toBeInTheDocument()
    // Có thể kiểm tra cụ thể hơn các class của span nếu cần, ví dụ:
    expect(rippleSpan).toHaveClass(
      'absolute',
      'inset-0',
      'pointer-events-none',
      'before:animate-pulse-ripple'
    )
  })

  test('applies advancedDivColor to wrapper div when advanced is true', () => {
    render(
      <Button advanced advancedDivColor='bg-custom-red'>
        Advanced Color
      </Button>
    )
    const buttonElement = screen.getByRole('button', {
      name: /advanced color/i
    })
    const wrapperDiv = buttonElement.parentElement
    expect(wrapperDiv).toHaveClass('bg-custom-red') // Kiểm tra class màu được áp dụng
    expect(wrapperDiv).toHaveClass(
      'rounded-full',
      'relative',
      'overflow-hidden'
    ) // Vẫn có các class wrapper khác
  })

  // --- Test Props: className ---
  test('merges custom className prop', () => {
    render(<Button className='extra-class another-class'>Custom Class</Button>)
    const buttonElement = screen.getByRole('button', { name: /custom class/i })
    expect(buttonElement).toHaveClass('bg-button') // Class mặc định (primary)
    expect(buttonElement).toHaveClass('px-4', 'py-2') // Class mặc định (medium)
    expect(buttonElement).toHaveClass('extra-class') // Class tùy chỉnh
    expect(buttonElement).toHaveClass('another-class') // Class tùy chỉnh khác
  })

  // --- Test Event Handlers ---
  test('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn() // Tạo mock function
    const user = userEvent.setup() // Setup user-event
    render(<Button onClick={handleClick}>Clickable</Button>)
    const buttonElement = screen.getByRole('button', { name: /clickable/i })

    await user.click(buttonElement) // Mô phỏng click

    expect(handleClick).toHaveBeenCalledTimes(1) // Kiểm tra hàm được gọi 1 lần
  })

  // --- Test Standard HTML Attributes ---
  test('applies disabled attribute correctly', () => {
    render(<Button disabled>Disabled Btn</Button>)
    const buttonElement = screen.getByRole('button', { name: /disabled btn/i })
    expect(buttonElement).toBeDisabled()
  })

  test('does not call onClick handler when disabled and clicked', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    render(
      <Button onClick={handleClick} disabled>
        Disabled Click
      </Button>
    )
    const buttonElement = screen.getByRole('button', {
      name: /disabled click/i
    })

    // Click vào nút bị vô hiệu hóa
    // userEvent đủ thông minh để không kích hoạt event trên nút disabled
    await user.click(buttonElement)

    expect(handleClick).not.toHaveBeenCalled() // Hàm không được gọi
  })

  test('applies other standard button attributes like type', () => {
    render(<Button type='submit'>Submit</Button>)
    const buttonElement = screen.getByRole('button', { name: /submit/i })
    expect(buttonElement).toHaveAttribute('type', 'submit')
  })
})
