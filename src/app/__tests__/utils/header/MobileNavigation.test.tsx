// import React from 'react'
// import { screen, waitFor, render as rtlRender } from '@testing-library/react'
// import { describe, it, expect, jest, beforeEach } from '@jest/globals'
// import { NextIntlClientProvider } from 'next-intl'
// import MobileNavigation, {
//   Props
// } from '@/src/app/[locale]/utils/header/MobileNavigation' // Import Props type

// // --- Mock Hooks needed by Child Components ---
// // Mock the module LangSwitcher uses to get pathname. Adjust path if needed.
// jest.mock('@/src/navigation', () => {
//   // Keep original exports like Link if they exist and are needed unmodified
//   const originalModule = jest.requireActual('@/src/navigation')
//   return {
//     __esModule: true,
//     ...originalModule, // Spread original exports
//     // Mock usePathname specifically
//     usePathname: jest.fn(() => '/en/some-mock-path'), // Provide a realistic mock path
//     // Mock useRouter if LangSwitcher or ThemeSwitch uses it (e.g., for router.push)
//     useRouter: jest.fn(() => ({
//       push: jest.fn(),
//       replace: jest.fn(),
//       back: jest.fn(),
//       forward: jest.fn(),
//       prefetch: jest.fn(),
//       refresh: jest.fn() // Add other methods if used
//     }))
//   }
// })

// // Mock next-themes if ThemeSwitch uses it
// jest.mock('next-themes', () => ({
//   useTheme: jest.fn(() => ({
//     theme: 'light', // Default mock theme
//     setTheme: jest.fn(),
//     resolvedTheme: 'light',
//     themes: ['light', 'dark', 'system']
//   }))
// }))

// // --- Mock Messages (INCLUDE KEYS FROM CHILDREN) ---
// const mockMessages = {
//   // Keys for MobileNavigation
//   Conferences: 'Mock Conferences Text',
//   Journals: 'Mock Journals Text',
//   Chatbot: 'Mock Chatbot Text',
//   Support: 'Mock Support Text',
//   Add_Conference: 'Mock Add Conference Text',
//   Login: 'Mock Login Text',
//   Register: 'Mock Register Text',

//   // Keys potentially used by ThemeSwitch
//   Theme: 'Mock Theme Text',
//   Light: 'Mock Light', // Add based on actual usage in ThemeSwitch
//   Dark: 'Mock Dark', // Add based on actual usage in ThemeSwitch
//   System: 'Mock System', // Add based on actual usage in ThemeSwitch

//   // Keys potentially used by LangSwitcher
//   Language: 'Mock Language', // Add based on actual usage in LangSwitcher
//   // Add specific language names if LangSwitcher displays them via t()
//   en: 'English',
//   vi: 'Vietnamese'
// }

// // --- Hàm Render Tùy Chỉnh với Intl Provider ---
// // (Keep renderWithIntl function as it was)
// interface RenderWithIntlOptions {
//   locale?: string
//   messages?: any
//   timeZone?: string
//   now?: Date
//   [key: string]: any
// }

// const renderWithIntl = (
//   ui: React.ReactElement,
//   {
//     locale = 'en',
//     messages = mockMessages, // Use updated messages
//     timeZone = 'Etc/UTC',
//     now = new Date(2024, 0, 1),
//     ...renderOptions
//   }: RenderWithIntlOptions = {}
// ) => {
//   // Wrap with mocked context providers if ThemeSwitch/LangSwitcher need them
//   // For example, if ThemeSwitch needs ThemeProvider from next-themes
//   // You might need to mock that Provider or wrap here.
//   // Let's assume for now next-themes `useTheme` mock is sufficient.
//   return rtlRender(
//     <NextIntlClientProvider
//       locale={locale}
//       messages={messages} // Pass updated messages
//       timeZone={timeZone}
//       now={now}
//     >
//       {ui}
//     </NextIntlClientProvider>,
//     renderOptions
//   )
// }

// // --- Props mặc định ---
// const getDefaultProps = (): Props => ({
//   // Use imported Props type
//   isMobileMenuOpen: true,
//   closeAllMenus: jest.fn(),
//   locale: 'en',
//   isLogin: false
// })

// // --- Test Suite ---
// describe('MobileNavigation Component', () => {
//   let defaultProps: Props // Use Props type

//   beforeEach(() => {
//     defaultProps = getDefaultProps()
//     // Clear mocks that we control (hooks mocked in *this* file)
//     // Need to cast to jest.Mock to access mock functions
//     const navigationMock = jest.requireMock('@/src/navigation')
//     ;(navigationMock.usePathname as jest.Mock).mockClear()
//     ;(navigationMock.useRouter as jest.Mock)().push.mockClear() // Clear methods on the returned object

//     const nextThemesMock = jest.requireMock('next-themes')
//     ;(nextThemesMock.useTheme as jest.Mock)().setTheme.mockClear()

//     // No need to clear closeAllMenus if it's recreated each time
//   })

//   const testId = 'mobile-navigation-container' // Define testId here

//   it('should be hidden when isMobileMenuOpen is false', () => {
//     renderWithIntl(
//       <MobileNavigation
//         {...defaultProps}
//         isMobileMenuOpen={false}
//         data-testid={testId}
//       />
//     )
//     const navContainer = screen.getByTestId(testId)
//     expect(navContainer).toHaveClass('hidden')
//     expect(
//       screen.queryByRole('link', { name: mockMessages.Conferences })
//     ).not.toBeInTheDocument()
//   })

//   it('should be visible and render base links when isMobileMenuOpen is true', () => {
//     renderWithIntl(
//       <MobileNavigation
//         {...defaultProps}
//         isMobileMenuOpen={true}
//         data-testid={testId}
//       />
//     )
//     const navContainer = screen.getByTestId(testId)
//     expect(navContainer).not.toHaveClass('hidden')

//     // Base links render immediately
//     expect(
//       screen.getByRole('link', { name: mockMessages.Conferences })
//     ).toBeInTheDocument()
//     expect(
//       screen.getByRole('link', { name: mockMessages.Journals })
//     ).toBeInTheDocument()
//     expect(
//       screen.getByRole('link', { name: mockMessages.Chatbot })
//     ).toBeInTheDocument()
//     expect(
//       screen.getByRole('link', { name: mockMessages.Support })
//     ).toBeInTheDocument()
//     expect(
//       screen.getByRole('link', { name: mockMessages.Add_Conference })
//     ).toBeInTheDocument()
//   })

//   it('should render ThemeSwitch and LangSwitcher content only after client mount', async () => {
//     renderWithIntl(
//       <MobileNavigation
//         {...defaultProps}
//         isMobileMenuOpen={true}
//         data-testid={testId}
//       />
//     )

//     // Initially, client-only content shouldn't be there.
//     // Query based on text content derived from *mocked* translations.
//     expect(screen.queryByText(mockMessages.Theme)).not.toBeInTheDocument() // Text from ThemeSwitch
//     // Add a query for LangSwitcher content if applicable, e.g., button text
//     // expect(screen.queryByRole('button', { name: /language/i })).not.toBeInTheDocument();

//     // Wait for useEffect to set isClient=true
//     await waitFor(() => {
//       // Check for content rendered by ThemeSwitch/LangSwitcher using mocked translations/hooks
//       expect(screen.getByText(mockMessages.Theme)).toBeInTheDocument()
//       // Add checks for LangSwitcher content, e.g., based on mocked pathname/locale
//       // Example: Check if the button/display shows the current mock language ('en')
//       // expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument(); // Assuming it shows 'English' for 'en'
//     })
//   })

//   it('should render Login and Register links when NOT logged in and client mounted', async () => {
//     renderWithIntl(
//       <MobileNavigation
//         {...defaultProps}
//         isLogin={false}
//         isMobileMenuOpen={true}
//         data-testid={testId}
//       />
//     )
//     // Initially not present
//     expect(
//       screen.queryByRole('link', { name: mockMessages.Login })
//     ).not.toBeInTheDocument()
//     expect(
//       screen.queryByRole('link', { name: mockMessages.Register })
//     ).not.toBeInTheDocument()

//     // Wait for client mount
//     await waitFor(() => {
//       expect(
//         screen.getByRole('link', { name: mockMessages.Login })
//       ).toBeInTheDocument()
//       expect(
//         screen.getByRole('link', { name: mockMessages.Register })
//       ).toBeInTheDocument()
//     })
//   })

//   it('should NOT render Login and Register links when logged in, even after client mount', async () => {
//     renderWithIntl(
//       <MobileNavigation
//         {...defaultProps}
//         isLogin={true} // Logged in
//         isMobileMenuOpen={true}
//         data-testid={testId}
//       />
//     )

//     // Wait for client mount (wait for ThemeSwitch content)
//     await waitFor(() => {
//       expect(screen.getByText(mockMessages.Theme)).toBeInTheDocument()
//     })

//     // Still should not be present after mount
//     expect(
//       screen.queryByRole('link', { name: mockMessages.Login })
//     ).not.toBeInTheDocument()
//     expect(
//       screen.queryByRole('link', { name: mockMessages.Register })
//     ).not.toBeInTheDocument()
//   })

//   it('should render links with correct href attributes', async () => {
//     const testLocale = 'vi'
//     // Update the pathname mock for this specific test if href depends on it dynamically
//     const navigationMock = jest.requireMock('@/src/navigation')
//     ;(navigationMock.usePathname as jest.Mock).mockReturnValue(
//       `/${testLocale}/other-page`
//     )

//     renderWithIntl(
//       <MobileNavigation
//         {...defaultProps}
//         locale={testLocale}
//         isLogin={false}
//         isMobileMenuOpen={true}
//         data-testid={testId}
//       />,
//       { locale: testLocale } // Provider locale
//     )

//     // Wait for client-side links
//     await waitFor(() => {
//       expect(
//         screen.getByRole('link', { name: mockMessages.Login })
//       ).toBeInTheDocument()
//     })

//     // Check hrefs
//     expect(
//       screen.getByRole('link', { name: mockMessages.Conferences })
//     ).toHaveAttribute('href', '/conferences')
//     expect(
//       screen.getByRole('link', { name: mockMessages.Journals })
//     ).toHaveAttribute('href', '/journals')
//     // ... other base links ...
//     expect(
//       screen.getByRole('link', { name: mockMessages.Login })
//     ).toHaveAttribute('href', '/auth/login')
//     expect(
//       screen.getByRole('link', { name: mockMessages.Register })
//     ).toHaveAttribute('href', '/auth/register')
//     // Cannot easily test the 'locale' prop passed to Link without a proper Link mock
//   })

//   it('should not call closeAllMenus prop on initial render', () => {
//     renderWithIntl(
//       <MobileNavigation
//         {...defaultProps}
//         isMobileMenuOpen={true}
//         data-testid={testId}
//       />
//     )
//     expect(defaultProps.closeAllMenus).not.toHaveBeenCalled()
//   })

// })
