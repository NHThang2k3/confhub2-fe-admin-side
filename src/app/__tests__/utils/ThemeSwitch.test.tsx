import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ThemeSwitch from '@/src/app/[locale]/utils/ThemeSwitch' // <-- *** QUAN TRỌNG: Đảm bảo đường dẫn này chính xác ***
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
// Không import useOnClickOutside từ usehooks-ts ở đây nữa

// --- Mocks ---

// Mock next-intl: Trả về key làm giá trị dịch để dễ kiểm tra
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key)
}))

// Mock next-themes: Cung cấp giá trị giả lập và hàm mock setTheme
const mockSetTheme = jest.fn()
// Ép kiểu để TypeScript hiểu đây là mock của useTheme
const mockUseTheme = useTheme as jest.Mock
jest.mock('next-themes', () => ({
  // Mock hàm hook useTheme
  useTheme: jest.fn(() => ({
    theme: 'light', // Giá trị mặc định ban đầu cho các test
    resolvedTheme: 'light', // Giá trị mặc định ban đầu
    themes: ['light', 'dark', 'system'], // Danh sách theme mặc định
    setTheme: mockSetTheme // Hàm mock để theo dõi việc gọi
  }))
}))

// *** KHÔNG MOCK 'usehooks-ts' NỮA ***
// Để component sử dụng hook gốc từ thư viện

// Mock capitalize utility từ thư viện utils
jest.mock('@/lib/utils', () => ({
  // Mock hàm capitalize đơn giản
  capitalize: jest.fn(
    (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
  )
}))

// --- End Mocks ---

describe('ThemeSwitch Component', () => {
  // Chạy trước mỗi test case
  beforeEach(() => {
    // Xóa lịch sử các lần gọi mock và trạng thái mock giữa các test
    jest.clearAllMocks()
    // Thiết lập lại giá trị trả về mặc định cho useTheme mock
    // Đảm bảo mỗi test bắt đầu với trạng thái theme 'light'
    mockUseTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme: mockSetTheme
    })
  })

  test('renders correctly after mounting and shows the current theme', () => {
    render(<ThemeSwitch />)

    // Tìm nút chính bằng vai trò và một phần text (insensitve case)
    const mainButton = screen.getByRole('button', { name: /Theme/i })
    // Kiểm tra nút có trong DOM
    expect(mainButton).toBeInTheDocument()
    // Kiểm tra nút được bật (không bị disabled) sau khi component đã mount
    expect(mainButton).toBeEnabled()

    // Kiểm tra dropdown (menu) không hiển thị ban đầu
    // Dùng queryByRole vì nó trả về null nếu không tìm thấy, thay vì báo lỗi
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  test('toggles dropdown on button click', () => {
    render(<ThemeSwitch />)
    const mainButton = screen.getByRole('button', { name: /Theme/i })

    // Lần click 1: Mở dropdown
    fireEvent.click(mainButton)
    // Kiểm tra dropdown xuất hiện
    expect(screen.getByRole('menu')).toBeInTheDocument()
    // Kiểm tra thuộc tính aria-expanded được cập nhật đúng
    expect(mainButton).toHaveAttribute('aria-expanded', 'true')
    // Kiểm tra một phần tử trong dropdown để chắc chắn nội dung đúng
    expect(screen.getByRole('button', { name: 'Light' })).toBeInTheDocument()

    // Lần click 2: Đóng dropdown
    fireEvent.click(mainButton)
    // Kiểm tra dropdown biến mất
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    // Kiểm tra thuộc tính aria-expanded được cập nhật đúng
    expect(mainButton).toHaveAttribute('aria-expanded', 'false')
  })

  test('displays theme options in the dropdown', () => {
    // Chuẩn bị danh sách theme tùy chỉnh cho test này
    const themes = ['light', 'dark', 'custom-theme']
    // Ghi đè giá trị mock của useTheme chỉ cho test này
    mockUseTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: themes, // Sử dụng danh sách theme tùy chỉnh
      setTheme: mockSetTheme
    })

    render(<ThemeSwitch />)
    const mainButton = screen.getByRole('button', { name: /Theme/i })
    // Mở dropdown
    fireEvent.click(mainButton)

    const dropdown = screen.getByRole('menu')
    expect(dropdown).toBeInTheDocument()

    // Lặp qua danh sách theme và kiểm tra từng lựa chọn
    themes.forEach(themeName => {
      // Tạo tên hiển thị mong đợi (viết hoa chữ cái đầu)
      const expectedText =
        themeName.charAt(0).toUpperCase() + themeName.slice(1)
      // Kiểm tra nút với tên hiển thị đó có trong dropdown không
      expect(
        screen.getByRole('button', { name: expectedText })
      ).toBeInTheDocument()
    })
  })

  test('calls setTheme and closes dropdown when a theme option is clicked', () => {
    render(<ThemeSwitch />)
    const mainButton = screen.getByRole('button', { name: /Theme/i })

    // Mở dropdown
    fireEvent.click(mainButton)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    // Tìm nút ứng với theme 'Dark'
    const darkOption = screen.getByRole('button', { name: 'Dark' })
    // Click vào nút 'Dark'
    fireEvent.click(darkOption)

    // Kiểm tra hàm setTheme (đã mock) được gọi đúng 1 lần
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
    // Kiểm tra hàm setTheme được gọi với tham số 'dark'
    expect(mockSetTheme).toHaveBeenCalledWith('dark')

    // Kiểm tra dropdown đã được đóng lại sau khi click vào lựa chọn
    // (Logic này nằm trong hàm onClick của nút theme)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  test('closes dropdown when clicking outside', async () => {
    // Đánh dấu là async vì sử dụng await waitFor
    render(<ThemeSwitch />)
    const mainButton = screen.getByRole('button', { name: /Theme/i })

    // Mở dropdown
    fireEvent.click(mainButton)
    // Lấy menu ra để đảm bảo nó đã mở trước khi click ra ngoài
    const menu = screen.getByRole('menu')
    expect(menu).toBeInTheDocument()

    // *** Hành động chính: Mô phỏng sự kiện mousedown trên document.body ***
    // Hành động này sẽ được hook useOnClickOutside (thực tế) bắt lấy
    fireEvent.mouseDown(document.body)

    // *** Chờ đợi: Đảm bảo React xử lý xong sự kiện và cập nhật DOM ***
    // Hook useOnClickOutside sẽ gọi setIsOpen(false), component re-render
    await waitFor(() => {
      // Kiểm tra menu không còn trong DOM nữa
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  test('applies correct classes to the active theme option', () => {
    // Thiết lập theme 'dark' là active cho test này
    mockUseTheme.mockReturnValue({
      theme: 'dark', // theme được chọn
      resolvedTheme: 'dark', // theme thực sự đang hiển thị
      themes: ['light', 'dark', 'system'],
      setTheme: mockSetTheme
    })

    render(<ThemeSwitch />)
    const mainButton = screen.getByRole('button', { name: /Theme/i })
    // Mở dropdown để thấy các lựa chọn
    fireEvent.click(mainButton)

    // Lấy các nút lựa chọn theme
    const lightOption = screen.getByRole('button', { name: 'Light' })
    const darkOption = screen.getByRole('button', { name: 'Dark' })
    const systemOption = screen.getByRole('button', { name: 'System' })

    // Kiểm tra theme 'dark' (active) có các class CSS đúng
    expect(darkOption).toHaveClass('bg-selected') // Class cho nền được chọn
    expect(darkOption).toHaveClass('text-primary') // Class cho text được chọn
    expect(darkOption).not.toHaveClass('text-secondary') // Không có class của text không được chọn

    // Kiểm tra các theme khác (inactive) có các class CSS đúng
    expect(lightOption).toHaveClass('text-secondary') // Class text không được chọn
    expect(lightOption).not.toHaveClass('bg-selected') // Không có class nền được chọn
    expect(lightOption).not.toHaveClass('text-primary') // Không có class text được chọn

    expect(systemOption).toHaveClass('text-secondary')
    expect(systemOption).not.toHaveClass('bg-selected')
    expect(systemOption).not.toHaveClass('text-primary')
  })

  test('uses translations for the button text', () => {
    // Tạo một mock cụ thể hơn cho useTranslations chỉ trong test này
    // Mock này trả về chuỗi có tiền tố "Translated "
    const mockT = jest.fn((key: string) => `Translated ${key}`)
    // Ghi đè mock useTranslations để sử dụng mockT ở trên
    ;(useTranslations as jest.Mock).mockReturnValue(mockT)

    render(<ThemeSwitch />)

    // Kiểm tra hàm dịch đã được gọi với key 'Theme'
    expect(mockT).toHaveBeenCalledWith('Theme')
    // Kiểm tra nút chính hiển thị text đã được dịch (theo mockT)
    expect(
      screen.getByRole('button', { name: /Translated Theme/i })
    ).toBeInTheDocument()
  })
})
