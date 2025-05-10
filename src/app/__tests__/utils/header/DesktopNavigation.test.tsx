// components/Header/components/DesktopNavigation.test.tsx

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import DesktopNavigation from '@/src/app/[locale]/utils/header/DesktopNavigation'

// --- Mocks Setup ---

// Mock next-intl
// We provide a simplified mock implementation
const mockUseTranslations = jest.fn()
jest.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations()
  // Mock other exports from next-intl if needed, e.g., AbstractIntlMessages
}))

// Mock next/navigation
const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname()
  // Mock Link component from next/navigation if it were used directly
  // Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

// Mock the custom Link component from @/src/navigation
// This mock renders a standard <a> tag and includes lang/href for verification
jest.mock('@/src/navigation', () => ({
  Link: jest.fn(({ href, lang, children, className }) => (
    <a href={href} data-lang={lang} className={className}>
      {children}
    </a>
  ))
}))

// Mock child components
jest.mock('@/src/app/[locale]/utils/ThemeSwitch', () => {
  const MockThemeSwitch = () => (
    <div data-testid='mock-theme-switch'>Mock ThemeSwitch</div>
  )
  MockThemeSwitch.displayName = 'MockThemeSwitch'
  return MockThemeSwitch
})
jest.mock('@/src/app/[locale]/utils/LangSwitcher', () => {
  const MockLangSwitcher = () => (
    <div data-testid='mock-lang-switcher'>Mock LangSwitcher</div>
  )
  MockLangSwitcher.displayName = 'MockLangSwitcher'
  return MockLangSwitcher
})

// Helper function to setup mocks for a test run
const setupMocks = (pathname: string, translations: Record<string, string>) => {
  // Reset mocks for fresh state in each test
  mockUsePathname.mockReturnValue(pathname)
  // Setup the translation function mock
  mockUseTranslations.mockImplementation((key: string) => {
    // If a key is provided to useTranslations (e.g., useTranslations('HomePage')), handle it.
    // Here, it's useTranslations(''), so the key is often ignored or used as a prefix internally.
    // We'll just return a function that looks up the translation key directly.
    return (translationKey: string) =>
      translations[translationKey] || translationKey
  })
}

// --- Test Suite ---

describe('DesktopNavigation Component', () => {
  const defaultLocale = 'en'
  const defaultTranslations = {
    Conferences: 'Conferences_en',
    Journals: 'Journals_en',
    Visualization: 'Visualization_en',
    Chatbot: 'Chatbot_en',
    Support: 'Support_en',
    Add_Conference: 'Add Conference_en'
  }

  beforeEach(() => {
    // Reset mocks before each test defined in this describe block
    jest.clearAllMocks()
    // Setup default mocks, can be overridden in specific tests
    setupMocks('/', defaultTranslations)
  })

  // Test 1: Basic Rendering
  test('renders all navigation links, theme switch, and lang switcher', () => {
    render(<DesktopNavigation locale={defaultLocale} />)

    // Check if all links are rendered with correct text
    expect(
      screen.getByRole('link', { name: 'Conferences_en' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Journals_en' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Visualization_en' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Chatbot_en' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Support_en' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Add Conference_en' })
    ).toBeInTheDocument()

    // Check if child components are rendered
    expect(screen.getByTestId('mock-theme-switch')).toBeInTheDocument()
    expect(screen.getByTestId('mock-lang-switcher')).toBeInTheDocument()
  })

  // Test 2: Links have correct href and lang attributes
  test('links have correct href attributes and lang passed', () => {
    const locale = 'fr'
    render(<DesktopNavigation locale={locale} />)

    const links = [
      { name: 'Conferences_en', href: '/conferences' }, // Using default translation keys for lookup as mock is simple
      { name: 'Journals_en', href: '/journals' },
      { name: 'Visualization_en', href: '/visualization' },
      { name: 'Chatbot_en', href: '/chatbot' },
      { name: 'Support_en', href: '/support' },
      { name: 'Add Conference_en', href: '/addconference' }
    ]

    links.forEach(({ name, href }) => {
      const linkElement = screen.getByRole('link', { name })
      expect(linkElement).toHaveAttribute('href', href)
      // Check the custom data-lang attribute added by our mock Link
      expect(linkElement).toHaveAttribute('data-lang', locale)
    })
  })

  // Test 3: Active Link Styling
  test.each([
    { path: '/conferences', activeLinkName: 'Conferences_en' },
    { path: '/journals', activeLinkName: 'Journals_en' },
    { path: '/visualization', activeLinkName: 'Visualization_en' },
    { path: '/chatbot', activeLinkName: 'Chatbot_en' },
    { path: '/support', activeLinkName: 'Support_en' },
    { path: '/addconference', activeLinkName: 'Add Conference_en' },
    { path: '/', activeLinkName: null }, // Test case where no link should be active
    { path: '/some/other/page', activeLinkName: null } // Another case for no active link
  ])(
    'highlights the active link for path "$path"',
    ({ path, activeLinkName }) => {
      setupMocks(path, defaultTranslations) // Set the specific path for this test case
      render(<DesktopNavigation locale={defaultLocale} />)

      const allLinks = screen.getAllByRole('link') // Get all rendered links

      allLinks.forEach(link => {
        // Use within to query the text content of the link
        const linkTextContent = within(link).getByText(/.+/).textContent // Get text content, e.g., "Conferences_en"

        if (linkTextContent === activeLinkName) {
          // This link should be active
          expect(link).toHaveClass('text-selected')
          // Check the underline span's state via its classes
          const underlineSpan = link.querySelector('span') // Find the span inside the link
          expect(underlineSpan).toHaveClass('scale-x-100')
          expect(underlineSpan).not.toHaveClass('scale-x-0')
        } else {
          // This link should NOT be active
          expect(link).not.toHaveClass('text-selected')
          // Check the underline span's state via its classes
          const underlineSpan = link.querySelector('span')
          expect(underlineSpan).toHaveClass('scale-x-0')
          expect(underlineSpan).not.toHaveClass('scale-x-100')
          // We don't check for group-hover:scale-x-100 as that's a style, not a static class
        }
      })
    }
  )

  // Test 4: Different Locale and Translations
  test('renders correctly with a different locale and translations', () => {
    const locale = 'de'
    const translationsDe = {
      Conferences: 'Konferenzen',
      Journals: 'Zeitschriften',
      Visualization: 'Visualisierung',
      Chatbot: 'Chatbot_de', // Keeping some the same for simplicity if needed
      Support: 'Unterstützung',
      Add_Conference: 'Konferenz hinzufügen'
    }
    setupMocks('/journals', translationsDe) // Example path and German translations

    render(<DesktopNavigation locale={locale} />)

    // Check if links render with German text
    expect(
      screen.getByRole('link', { name: 'Konferenzen' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Zeitschriften' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Visualisierung' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Chatbot_de' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Unterstützung' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Konferenz hinzufügen' })
    ).toBeInTheDocument()

    // Check if the correct link is active
    const activeLink = screen.getByRole('link', { name: 'Zeitschriften' })
    expect(activeLink).toHaveClass('text-selected')
    expect(activeLink).toHaveAttribute('data-lang', locale) // Check lang prop passed correctly

    // Check a non-active link
    const nonActiveLink = screen.getByRole('link', { name: 'Konferenzen' })
    expect(nonActiveLink).not.toHaveClass('text-selected')
    expect(nonActiveLink).toHaveAttribute('data-lang', locale)

    // Check if child components are still rendered
    expect(screen.getByTestId('mock-theme-switch')).toBeInTheDocument()
    expect(screen.getByTestId('mock-lang-switcher')).toBeInTheDocument()
  })
})
