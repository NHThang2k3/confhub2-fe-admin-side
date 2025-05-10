import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@/src/app/[locale]/utils/ThemeProvider' // Adjust path if needed
import { type ThemeProviderProps } from 'next-themes/dist/types'

// --- Mocking next-themes ---

// Mock the module directly, defining the mock component inline
jest.mock('next-themes', () => {
  // Define the mock component implementation directly here
  const MockProviderComponent = jest.fn(({ children }: ThemeProviderProps) => (
    <div data-testid='mock-next-themes-provider'>{children}</div>
  ))

  // Return the mocked module structure
  return {
    __esModule: true,
    ThemeProvider: MockProviderComponent // Export the inline mock component
  }
})

// --- End Mocking ---

// **Get a reference to the mock *after* jest.mock has run**
// We need to require the mocked module *after* jest.mock is defined.
// We also need to tell TypeScript about the mock properties.
const NextThemes = require('next-themes') // Use require for dynamic access post-mock
const MockedNextThemesProvider = NextThemes.ThemeProvider as jest.Mock // Cast to jest.Mock

describe('ThemeProvider Component', () => {
  beforeEach(() => {
    // Clear the mock using the reference obtained after mocking
    MockedNextThemesProvider.mockClear()
  })

  test('should render its children correctly', () => {
    const childText = 'Đây là nội dung con'
    render(
      <ThemeProvider>
        <div>{childText}</div>
      </ThemeProvider>
    )

    // Check if the mock provider itself was rendered (optional but good)
    expect(screen.getByTestId('mock-next-themes-provider')).toBeInTheDocument()
    // Check if children passed through the mock
    expect(screen.getByText(childText)).toBeInTheDocument()
  })

  test('should pass props down to the underlying NextThemesProvider', () => {
    const childText = 'Nội dung con khác'
    const testProps: Omit<ThemeProviderProps, 'children'> = {
      attribute: 'class',
      defaultTheme: 'dark',
      enableSystem: false,
      storageKey: 'my-app-theme'
    }

    render(
      <ThemeProvider {...testProps}>
        <span>{childText}</span>
      </ThemeProvider>
    )

    // Use the obtained mock reference for assertions
    expect(MockedNextThemesProvider).toHaveBeenCalledTimes(1)
    expect(MockedNextThemesProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: 'class',
        defaultTheme: 'dark',
        enableSystem: false,
        storageKey: 'my-app-theme'
      }),
      {} // Context argument
    )
    expect(screen.getByText(childText)).toBeInTheDocument()
  })

  test('should work without any extra props', () => {
    const childText = 'Chỉ có children'
    render(
      <ThemeProvider>
        <p>{childText}</p>
      </ThemeProvider>
    )

    expect(MockedNextThemesProvider).toHaveBeenCalledTimes(1)
    expect(MockedNextThemesProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        children: expect.any(Object) // Expect children prop
      }),
      {}
    )
    expect(screen.getByText(childText)).toBeInTheDocument()
  })
})
