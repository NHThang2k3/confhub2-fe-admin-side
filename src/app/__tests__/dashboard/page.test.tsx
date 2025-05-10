import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// --- Mocks using jest.doMock (applied BEFORE Dashboard import) ---

// Define mock functions beforehand
const mockGet = jest.fn()
const mockPush = jest.fn()
// Ensure useParams returns an object, even if empty or with default locale
const mockUseParams = jest.fn(() => ({ locale: 'en' }))
const mockUseSearchParams = jest.fn(() => ({ get: mockGet }))
const mockUsePathname = jest.fn(() => '/dashboard') // Add pathname mock

// Mock next/navigation explicitly
jest.doMock('next/navigation', () => ({
  useSearchParams: mockUseSearchParams,
  useRouter: () => ({ push: mockPush }),
  useParams: mockUseParams, // Ensure this is correctly mocked and RETURNED
  usePathname: mockUsePathname // Include pathname
}))

// Mock next-intl - Focus on providing the necessary hooks/components
jest.doMock('next-intl', () => {
  // Mock Link component directly as used by next-intl internally or exported
  const MockLink = jest.fn(({ href, children, ...props }) => {
    const hrefString =
      typeof href === 'string'
        ? href
        : `${href.pathname || ''}${href.query?.tab ? `?tab=${href.query.tab}` : ''}`
    const MockLinkComponent = (linkProps: any) => (
      <a href={hrefString} {...linkProps}>
        {children}
      </a>
    )
    MockLinkComponent.displayName = 'MockNextIntlLink'
    return <MockLinkComponent {...props} />
  })

  return {
    // Provide the core mocks needed by Dashboard and the internal Link
    useTranslations: () => (key: string) => key,
    useLocale: () => 'en', // Provide the locale expected by Link internals
    // Provide the Link component mock directly
    Link: MockLink,
    // Explicitly mock navigation hooks if next-intl wraps them
    usePathname: mockUsePathname, // Use the same mock as next/navigation's
    useRouter: () => ({ push: mockPush }) // Use the same mock
    // DO NOT spread original module here with doMock, only provide needed mocks
  }
})

// Mock react-responsive
const mockUseMediaQuery = jest.fn()
jest.doMock('react-responsive', () => ({
  useMediaQuery: (query: { maxWidth?: number; minWidth?: number }) =>
    mockUseMediaQuery(query)
}))

// --- Mock Child Components (Keep as before, ensure paths are correct) ---

// *** ADJUST Header PATH if needed ***
jest.doMock(
  '@/src/components/utils/Header',
  () => {
    const MockHeader = ({ locale }: { locale: string }) => (
      <div data-testid='mock-header'>Mock Header locale: {locale}</div>
    )
    MockHeader.displayName = 'MockHeader'
    return { Header: MockHeader }
  },
  { virtual: true }
) // Use virtual if path might be tricky or alias-related

jest.doMock(
  '@/src/app/[locale]/dashboard/setting/SettingTab',
  () => {
    const MockSettingTab = () => (
      <div data-testid='setting-tab'>Setting Tab Content</div>
    )
    MockSettingTab.displayName = 'MockSettingTab'
    return MockSettingTab // Assuming default export
  },
  { virtual: true }
)

jest.doMock(
  '@/src/app/[locale]/dashboard/notification/NotificationsTab',
  () => {
    const MockNotificationsTab = () => (
      <div data-testid='notifications-tab'>Notifications Tab Content</div>
    )
    MockNotificationsTab.displayName = 'MockNotificationsTab'
    return MockNotificationsTab
  },
  { virtual: true }
)

jest.doMock(
  '@/src/app/[locale]/dashboard/follow/FollowedTab',
  () => {
    const MockFollowedTab = () => (
      <div data-testid='followed-tab'>Followed Tab Content</div>
    )
    MockFollowedTab.displayName = 'MockFollowedTab'
    return MockFollowedTab
  },
  { virtual: true }
)

jest.doMock(
  '@/src/app/[locale]/dashboard/blacklist/BlacklistTab',
  () => {
    const MockBlacklistTab = () => (
      <div data-testid='blacklist-tab'>Blacklisted Tab Content</div>
    )
    MockBlacklistTab.displayName = 'MockBlacklistTab'
    return MockBlacklistTab
  },
  { virtual: true }
)

jest.doMock(
  '@/src/app/[locale]/dashboard/profile/ProfileTab',
  () => {
    const MockProfileTab = () => (
      <div data-testid='profile-tab'>Profile Tab Content</div>
    )
    MockProfileTab.displayName = 'MockProfileTab'
    return MockProfileTab
  },
  { virtual: true }
)

jest.doMock(
  '@/src/app/[locale]/dashboard/note/NoteTab',
  () => {
    const MockNoteTab = () => <div data-testid='note-tab'>Note Tab Content</div>
    MockNoteTab.displayName = 'MockNoteTab'
    return MockNoteTab
  },
  { virtual: true }
)

jest.doMock(
  '@/src/app/[locale]/dashboard/myConferences/MyConferencesTab',
  () => {
    const MockMyConferencesTab = () => (
      <div data-testid='myconferences-tab'>My Conferences Tab Content</div>
    )
    MockMyConferencesTab.displayName = 'MockMyConferencesTab'
    return MockMyConferencesTab
  },
  { virtual: true }
)

// Remove the mock for '@/src/navigation' if it exists, as we mock next-intl Link directly
// jest.doMock('@/src/navigation', ...);

// *** NOW Import the component AFTER mocks are defined with doMock ***
import Dashboard from '@/src/app/[locale]/dashboard/page'

// --- Test Suite ---
describe('Dashboard Component', () => {
  const locale = 'en'

  beforeEach(() => {
    // Reset mock function calls and return values
    mockGet.mockClear()
    mockPush.mockClear()
    mockUseMediaQuery.mockClear()
    mockUseParams.mockClear()
    mockUseSearchParams.mockClear()
    mockUsePathname.mockClear()

    // Reset mock return values to defaults
    mockGet.mockReturnValue(null)
    mockUseMediaQuery.mockReturnValue(false) // Desktop
    mockUseParams.mockReturnValue({ locale }) // Provide locale
    mockUseSearchParams.mockReturnValue({ get: mockGet })
    mockUsePathname.mockReturnValue('/dashboard') // Provide default pathname
  })

  // --- RENDER TESTS ---
  test('renders header and initial placeholder state before client mount', () => {
    render(<Dashboard locale={locale} />)
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-header')).toHaveTextContent(
      `Mock Header locale: ${locale}`
    )
    expect(screen.queryByTestId('profile-tab')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  test('renders default Profile tab on client mount when no tab param exists', async () => {
    render(<Dashboard locale={locale} />)
    await waitFor(() => {
      expect(screen.getByTestId('profile-tab')).toBeInTheDocument()
    })
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  // --- TAB RENDERING TESTS ---
  test.each([
    ['setting', 'setting-tab', 'Setting'],
    ['followed', 'followed-tab', 'Followed'],
    ['myconferences', 'myconferences-tab', 'My_Conferences'],
    ['note', 'note-tab', 'Note'],
    ['notifications', 'notifications-tab', 'Notifications'],
    ['blacklisted', 'blacklist-tab', 'Blacklisted'],
    ['profile', 'profile-tab', 'Profile'],
    ['invalid-tab', 'profile-tab', 'Profile'],
    [null, 'profile-tab', 'Profile']
  ])(
    'renders %s tab when tab=%s in URL',
    async (tabQuery, expectedTestId, expectedLabelKey) => {
      mockGet.mockReturnValue(tabQuery)
      mockUseSearchParams.mockReturnValue({ get: mockGet }) // Ensure hook returns updated mock

      render(<Dashboard locale={locale} />)

      await waitFor(() => {
        expect(screen.getByTestId(expectedTestId)).toBeInTheDocument()
      })

      const activeLink = screen.getByRole('link', { name: expectedLabelKey })
      expect(activeLink).toHaveClass(expect.stringContaining('bg-button'))
      if (expectedLabelKey !== 'Profile') {
        const profileLink = screen.getByRole('link', { name: 'Profile' })
        expect(profileLink).not.toHaveClass(
          expect.stringContaining('bg-button')
        )
      }
    }
  )

  // --- SIDEBAR INTERACTION TESTS (Desktop) ---
  test('sidebar toggles open and close on desktop view', async () => {
    mockUseMediaQuery.mockReturnValue(false)
    render(<Dashboard locale={locale} />)
    await waitFor(() => {
      expect(screen.getByTestId('profile-tab')).toBeInTheDocument()
    })

    const toggleButton = screen.getByRole('button', { name: /Close|Open/i })
    const mainContentWrapper = screen.getByTestId('profile-tab').parentElement!

    // Initial: Collapsed
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
    expect(mainContentWrapper.className).toContain('ml-16')
    expect(mainContentWrapper.className).not.toContain('ml-48') // Adjust if class name differs

    // Expand
    fireEvent.click(toggleButton)
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Close')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(mainContentWrapper.className).toContain('ml-48') // Adjust if class name differs
      expect(mainContentWrapper.className).not.toContain('ml-16')
    })

    // Collapse
    fireEvent.click(toggleButton)
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()
      expect(screen.queryByText('Close')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(mainContentWrapper.className).toContain('ml-16')
      expect(mainContentWrapper.className).not.toContain('ml-48') // Adjust if class name differs
    })
  })

  // --- MOBILE VIEW TEST ---
  test('sidebar does not render on mobile view', async () => {
    mockUseMediaQuery.mockReturnValue(true) // Mobile
    render(<Dashboard locale={locale} />)
    await waitFor(() => {
      expect(screen.getByTestId('profile-tab')).toBeInTheDocument()
    })
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    const mainContentWrapper = screen.getByTestId('profile-tab').parentElement!
    expect(mainContentWrapper.className).not.toContain('ml-16')
    expect(mainContentWrapper.className).not.toContain('ml-48') // Adjust if class name differs
  })

  // --- LINK CLICK SIMULATION TEST ---
  test('clicking sidebar link changes renders correct content and updates active state', async () => {
    mockUseMediaQuery.mockReturnValue(false) // Desktop
    render(<Dashboard locale={locale} />)
    await waitFor(() => {
      expect(screen.getByTestId('profile-tab')).toBeInTheDocument()
    })

    const settingLink = screen.getByRole('link', { name: 'Setting' })
    const profileLink = screen.getByRole('link', { name: 'Profile' })

    // --- Simulate URL change ---
    const href = settingLink.getAttribute('href') || ''
    mockGet.mockImplementation((key: string) => {
      if (key === 'tab') {
        const urlParams = new URLSearchParams(href.split('?')[1] || '')
        return urlParams.get('tab') // 'setting'
      }
      return null
    })
    mockUseSearchParams.mockReturnValue({ get: mockGet }) // Update hook return value

    // Re-render
    render(<Dashboard locale={locale} />)

    // --- Verify Results ---
    await waitFor(() => {
      expect(screen.getByTestId('setting-tab')).toBeInTheDocument()
      expect(screen.queryByTestId('profile-tab')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(settingLink).toHaveClass(expect.stringContaining('bg-button'))
      expect(profileLink).not.toHaveClass(expect.stringContaining('bg-button'))
    })
  })
}) // End describe
