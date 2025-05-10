// __tests__/LangSwitcher.test.tsx
import React from 'react'
// Import thêm fireEvent
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
// Đảm bảo đường dẫn import này đúng với vị trí file LangSwitcher.tsx của bạn
import LangSwitcher from '@/src/app/[locale]/utils/LangSwitcher'

// --- Mocks ---
const mockUsePathname = jest.fn()
const mockUseSearchParams = jest.fn()
const mockUseSelectedLayoutSegments = jest.fn().mockReturnValue([])

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
  useSelectedLayoutSegments: () => mockUseSelectedLayoutSegments()
}))

// Mock next/image (loại bỏ prop 'priority')
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { src, alt, width, height, priority, loading, ...rest } = props
    return <img src={src} alt={alt} loading={loading || undefined} {...rest} />
  }
}))

// Mock utils (Đảm bảo đường dẫn import này đúng)
jest.mock('@/lib/utils', () => ({
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
}))
// --- End Mocks ---

// Helper to create URLSearchParams mock
const createMockSearchParams = (params: Record<string, string> = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value)
  })
  const paramString = new URLSearchParams(params).toString()
  ;(searchParams as any).toString = jest.fn(() => paramString)
  searchParams.get = jest.fn((key: string) => params[key] || null) as any
  return searchParams
}

// Define options array here for use in tests
const options = [
  { country: 'English', code: 'en', flagCode: 'gb' },
  { country: 'Deutsch', code: 'de', flagCode: 'de' },
  { country: 'Français', code: 'fr', flagCode: 'fr' },
  { country: 'Tiếng Việt', code: 'vi', flagCode: 'vn' },
  { country: 'Español', code: 'es', flagCode: 'es' },
  { country: 'Русский', code: 'ru', flagCode: 'ru' },
  { country: '中文', code: 'zh', flagCode: 'cn' },
  { country: '日本語', code: 'ja', flagCode: 'jp' },
  { country: '한국어', code: 'ko', flagCode: 'kr' },
  { country: 'العربية', code: 'ar', flagCode: 'sa' },
  { country: 'فارسی', code: 'fa', flagCode: 'ir' }
]

describe('LangSwitcher Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    // Set default mocks
    mockUsePathname.mockReturnValue('/')
    mockUseSearchParams.mockReturnValue(createMockSearchParams())
  })

  it('should render with default language (English) when no locale in path', () => {
    mockUsePathname.mockReturnValue('/some/random/page')
    render(<LangSwitcher />)

    const button = screen.getByRole('button', { name: /english/i })
    expect(button).toBeInTheDocument()
    const flag = screen.getByAltText(/english flag/i)
    expect(flag).toHaveAttribute('src', '/country_flags/gb.svg')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render with the correct language based on pathname prefix', () => {
    mockUsePathname.mockReturnValue('/fr/about')
    render(<LangSwitcher />)

    const button = screen.getByRole('button', { name: /français/i })
    expect(button).toBeInTheDocument()
    const flag = screen.getByAltText(/français flag/i)
    expect(flag).toHaveAttribute('src', '/country_flags/fr.svg')
  })

  it('should render with the correct language when pathname is just the locale code', () => {
    mockUsePathname.mockReturnValue('/de')
    render(<LangSwitcher />)

    const button = screen.getByRole('button', { name: /deutsch/i })
    expect(button).toBeInTheDocument()
    const flag = screen.getByAltText(/deutsch flag/i)
    expect(flag).toHaveAttribute('src', '/country_flags/de.svg')
  })

  it('should toggle dropdown on button click', async () => {
    render(<LangSwitcher />)
    const button = screen.getByRole('button', { name: /english/i })
    const user = userEvent.setup()

    await user.click(button)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'true')

    await user.click(button)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should close dropdown when clicking outside', async () => {
    render(
      <div>
        <LangSwitcher />
        <button>Outside Button</button>
      </div>
    )
    const switcherButton = screen.getByRole('button', { name: /english/i })
    const outsideButton = screen.getByRole('button', {
      name: /outside button/i
    })
    const user = userEvent.setup()

    await user.click(switcherButton)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.click(outsideButton)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(switcherButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should display all language options in the dropdown', async () => {
    render(<LangSwitcher />)
    const button = screen.getByRole('button', { name: /english/i })
    const user = userEvent.setup()
    await user.click(button)

    const menuOptions = screen.getAllByRole('menuitem')
    expect(menuOptions).toHaveLength(options.length)

    options.forEach(option => {
      expect(
        screen.getByRole('menuitem', { name: new RegExp(option.country, 'i') })
      ).toBeInTheDocument()
    })
  })

  it('should highlight the current language in the dropdown', async () => {
    mockUsePathname.mockReturnValue('/es/contact')
    render(<LangSwitcher />)
    const button = screen.getByRole('button', { name: /español/i })
    const user = userEvent.setup()
    await user.click(button)

    const currentLangOption = screen.getByRole('menuitem', { name: /español/i })
    const otherLangOption = screen.getByRole('menuitem', { name: /english/i })

    // Điều chỉnh class names nếu cần dựa vào file CSS/Tailwind của bạn
    expect(currentLangOption).toHaveClass('bg-selected') // Ví dụ class
    expect(otherLangOption).not.toHaveClass('bg-selected')
    expect(otherLangOption).toHaveClass('text-secondary') // Ví dụ class
  })

  describe('URL Generation (getLocalizedUrl)', () => {
    const testCases = [
      { path: '/', params: {}, switchTo: 'de', expected: '/de' },
      { path: '/en', params: {}, switchTo: 'fr', expected: '/fr' },
      {
        path: '/es/products',
        params: {},
        switchTo: 'ja',
        expected: '/ja/products'
      },
      { path: '/about', params: {}, switchTo: 'vi', expected: '/vi/about' },
      {
        path: '/ko/settings',
        params: { view: 'profile' },
        switchTo: 'en',
        expected: '/en/settings?view=profile'
      },
      {
        path: '/',
        params: { q: 'test', page: '2' },
        switchTo: 'zh',
        expected: '/zh?q=test&page=2'
      },
      {
        path: '/ru/news/article-1',
        params: {},
        switchTo: 'en',
        expected: '/en/news/article-1'
      },
      {
        path: '/ar/',
        params: { sort: 'asc' },
        switchTo: 'fa',
        expected: '/fa?sort=asc'
      },
      {
        path: '/fa/search',
        params: { keyword: 'ایران' },
        switchTo: 'en',
        expected: '/en/search?keyword=%D8%A7%DB%8C%D8%B1%D8%A7%D9%86'
      }
    ]

    testCases.forEach(({ path, params, switchTo, expected }) => {
      it(`should generate correct URL ${expected} when switching to '${switchTo}' from '${path}' with params ${JSON.stringify(params)}`, async () => {
        mockUsePathname.mockReturnValue(path)
        mockUseSearchParams.mockReturnValue(
          createMockSearchParams(params as Record<string, string>)
        )

        render(<LangSwitcher />)
        // Lấy button dựa trên ngôn ngữ được render ban đầu (có thể là default hoặc từ path)
        const initialLangCode = path.split('/')[1] || options[0].code
        const initialLang =
          options.find(opt => opt.code === initialLangCode) || options[0]
        const button = screen.getByRole('button', {
          name: new RegExp(initialLang.country, 'i')
        })

        const user = userEvent.setup()
        await user.click(button) // Mở dropdown

        const targetLang = options.find(opt => opt.code === switchTo)
        expect(targetLang).toBeDefined()

        const langLink = screen.getByRole('menuitem', {
          name: new RegExp(targetLang!.country, 'i')
        })

        expect(langLink).toHaveAttribute('href', expected)
        // Không click link ở đây
      })
    })
  })

  // Sử dụng fireEvent.click cho link trong test case này
  it('should close dropdown when a language option is clicked', async () => {
    render(<LangSwitcher />)
    const button = screen.getByRole('button', { name: /english/i })
    const user = userEvent.setup() // userEvent để mở dropdown

    // Mở dropdown
    await user.click(button)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    const germanOption = screen.getByRole('menuitem', { name: /deutsch/i })

    // Sử dụng fireEvent.click thay vì userEvent.click cho link
    fireEvent.click(germanOption)

    // Dropdown nên đóng lại
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
