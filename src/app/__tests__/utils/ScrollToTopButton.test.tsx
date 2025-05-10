import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ScrollToTopButton from '@/src/app/[locale]/utils/ScrollToTopButton' // Adjust path if necessary

// --- Mocking window properties and methods ---
// Store original values
const originalScrollY = window.scrollY
const originalScrollTo = window.scrollTo
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener
// We won't directly store/restore documentElement descriptor with the spy approach

// Helper function to mock window.scrollY
const mockScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', {
    value: value,
    writable: true,
    configurable: true
  })
}

describe('ScrollToTopButton', () => {
  let scrollToMock: jest.Mock
  let addEventListenerSpy: jest.SpyInstance
  let removeEventListenerSpy: jest.SpyInstance
  let scrollHandler: ((event?: Event) => void) | undefined = undefined

  // Spies for documentElement properties
  let scrollHeightSpy: jest.SpyInstance
  let clientHeightSpy: jest.SpyInstance

  // Helper to set dimensions using spies
  const mockDimensions = (scrollHeight: number, clientHeight: number) => {
    // Check if spies exist before mocking. If not, it means beforeEach hasn't run properly.
    if (!scrollHeightSpy || !clientHeightSpy) {
      throw new Error(
        'Dimension spies have not been initialized. Check beforeEach setup.'
      )
    }
    scrollHeightSpy.mockReturnValue(scrollHeight)
    clientHeightSpy.mockReturnValue(clientHeight)
  }

  beforeEach(() => {
    scrollHandler = undefined // Reset handler capture

    // Mock window.scrollTo
    scrollToMock = jest.fn()
    Object.defineProperty(window, 'scrollTo', {
      value: scrollToMock,
      writable: true,
      configurable: true
    })

    // Mock addEventListener to capture the handler
    addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler, options) => {
        // Added options param
        if (event === 'scroll' && typeof handler === 'function') {
          scrollHandler = handler as (event?: Event) => void
        }
        // No need to call original, we trigger handler manually
      })

    // Spy on removeEventListener
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    // --- Mock documentElement properties using spies ---
    // Ensure document.documentElement exists (standard in Jest's JSDOM env)
    if (!document.documentElement) {
      // Assign a basic html element if somehow missing, though unlikely in standard jest-jsdom
      Object.defineProperty(document, 'documentElement', {
        value: document.createElement('html'),
        configurable: true
      })
    }
    // Spy on the *getters* for these properties
    scrollHeightSpy = jest.spyOn(
      document.documentElement,
      'scrollHeight',
      'get'
    )
    clientHeightSpy = jest.spyOn(
      document.documentElement,
      'clientHeight',
      'get'
    )
    // ----------------------------------------------------

    // Set initial mocks
    mockScrollY(0)
    // Set initial dimensions *after* spies are created
    mockDimensions(1000, 500)
  })

  afterEach(() => {
    // Restore window properties
    Object.defineProperty(window, 'scrollY', {
      value: originalScrollY,
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'scrollTo', {
      value: originalScrollTo,
      writable: true,
      configurable: true
    })

    // Restore all mocks created by jest.spyOn or jest.fn()
    // This includes scrollHeightSpy, clientHeightSpy, addEventListenerSpy, removeEventListenerSpy
    jest.restoreAllMocks()

    // Clear potentially captured handler (good practice)
    scrollHandler = undefined
  })

  // --- Test Cases ---

  it('should not be visible initially (when scrollY is 0)', () => {
    render(<ScrollToTopButton />)
    act(() => {
      if (scrollHandler) scrollHandler?.()
      else
        console.warn(
          "Initial handler not captured for 'should not be visible initially' test."
        )
    })
    const button = screen.getByRole('button')
    expect(button).toHaveClass('opacity-0')
    expect(button).toHaveClass('pointer-events-none')
  })

  it('should become visible when scrolled down past the threshold', async () => {
    render(<ScrollToTopButton />)
    const button = screen.getByRole('button')
    if (!scrollHandler)
      throw new Error("Handler not captured for 'should become visible' test")

    act(() => {
      scrollHandler?.()
    }) // Initial state
    expect(button).toHaveClass('opacity-0')

    mockScrollY(350)
    act(() => {
      scrollHandler?.()
    }) // Trigger update

    await waitFor(() => {
      expect(button).toHaveClass('opacity-100')
      expect(button).not.toHaveClass('opacity-0')
      expect(button).not.toHaveClass('pointer-events-none')
    })
  })

  it('should become hidden again when scrolled back up below the threshold', async () => {
    render(<ScrollToTopButton />)
    const button = screen.getByRole('button')
    if (!scrollHandler)
      throw new Error(
        "Handler not captured for 'should become hidden again' test"
      )

    mockScrollY(400)
    act(() => {
      scrollHandler?.()
    })
    await waitFor(() => expect(button).toHaveClass('opacity-100'))

    mockScrollY(200)
    act(() => {
      scrollHandler?.()
    })
    await waitFor(() => {
      expect(button).toHaveClass('opacity-0')
      expect(button).toHaveClass('pointer-events-none')
    })
  })

  it('should call window.scrollTo({ top: 0, behavior: "smooth" }) when clicked', async () => {
    render(<ScrollToTopButton />)
    const button = screen.getByRole('button')
    if (!scrollHandler)
      throw new Error("Handler not captured for 'should call scrollTo' test")

    mockScrollY(500)
    act(() => {
      scrollHandler?.()
    })
    await waitFor(() => expect(button).toHaveClass('opacity-100'))

    fireEvent.click(button)
    expect(scrollToMock).toHaveBeenCalledTimes(1)
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('should calculate scroll progress correctly and update SVG dash offset', async () => {
    render(<ScrollToTopButton />)
    const button = screen.getByRole('button')
    const progressCircle = screen.getByTestId('progress-circle') // Make sure data-testid="progress-circle" exists in your component
    if (!scrollHandler)
      throw new Error(
        "Handler not captured for 'should calculate progress' test"
      )

    const svgSize = 48,
      strokeWidth = 4,
      center = svgSize / 2
    const radius = center - strokeWidth / 2
    const circumference = 2 * Math.PI * radius

    // Case 1: 0%
    mockScrollY(0)
    mockDimensions(1000, 500)
    act(() => {
      scrollHandler?.()
    })
    await waitFor(() => {
      // Use getAttribute
      expect(
        parseFloat(progressCircle.getAttribute('stroke-dashoffset') ?? 'NaN')
      ).toBeCloseTo(circumference * 1)
      expect(button).toHaveClass('opacity-0')
    })

    // Case 2: 50%
    mockScrollY(250)
    act(() => {
      scrollHandler?.()
    })
    await waitFor(() => {
      // Use getAttribute
      expect(
        parseFloat(progressCircle.getAttribute('stroke-dashoffset') ?? 'NaN')
      ).toBeCloseTo(circumference * 0.5)
      expect(button).toHaveClass('opacity-0') // Still hidden
    })

    // Case 3: 70% (Visible)
    mockScrollY(350)
    act(() => {
      scrollHandler?.()
    })
    await waitFor(() => {
      // Use getAttribute
      expect(
        parseFloat(progressCircle.getAttribute('stroke-dashoffset') ?? 'NaN')
      ).toBeCloseTo(circumference * 0.3)
      expect(button).toHaveClass('opacity-100') // Visible
    })

    // Case 4: 100%
    mockScrollY(500)
    act(() => {
      scrollHandler?.()
    })
    await waitFor(() => {
      // Use getAttribute
      expect(
        parseFloat(progressCircle.getAttribute('stroke-dashoffset') ?? 'NaN')
      ).toBeCloseTo(circumference * 0)
      expect(button).toHaveClass('opacity-100')
    })

    // Case 5: Not scrollable
    mockScrollY(0)
    mockDimensions(500, 500)
    act(() => {
      scrollHandler?.()
    })
    await waitFor(() => {
      // Use getAttribute
      expect(
        parseFloat(progressCircle.getAttribute('stroke-dashoffset') ?? 'NaN')
      ).toBeCloseTo(circumference * 1)
      expect(button).toHaveClass('opacity-0')
    })
    mockScrollY(100) // Impossible scroll
    act(() => {
      scrollHandler?.()
    }) // Re-run handler
    await waitFor(() => {
      // Should still be 0 progress
      // Use getAttribute
      expect(
        parseFloat(progressCircle.getAttribute('stroke-dashoffset') ?? 'NaN')
      ).toBeCloseTo(circumference * 1)
      expect(button).toHaveClass('opacity-0')
    })
  }, 10000) // Increased timeout

  it('should add scroll event listener on mount', () => {
    render(<ScrollToTopButton />)
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true }
    )
    expect(scrollHandler).toBeDefined()
    expect(typeof scrollHandler).toBe('function') // Ensure it's actually a function
  })

  it('should remove scroll event listener on unmount', () => {
    const { unmount } = render(<ScrollToTopButton />)
    const capturedHandler = scrollHandler // Capture before unmount
    // Basic check to ensure the handler was actually captured during setup
    if (!capturedHandler) {
      throw new Error(
        'Scroll handler was not captured during setup for unmount test.'
      )
    }
    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1)
    // Crucially, check it was called with the *exact same function reference*
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      capturedHandler
    )
  })

  it('should handle initial call to handleScroll on mount correctly', async () => {
    // Set dimensions and scroll position *before* rendering
    mockDimensions(1200, 600)
    mockScrollY(400) // Above the 300 threshold

    render(<ScrollToTopButton />) // useEffect runs here
    const button = screen.getByRole('button')
    const progressCircle = screen.getByTestId('progress-circle') // Requires data-testid

    // Calculate expected values
    const svgSize = 48,
      strokeWidth = 4,
      center = svgSize / 2
    const radius = center - strokeWidth / 2
    const circumference = 2 * Math.PI * radius
    const expectedProgress = 400 / (1200 - 600) // = 2/3
    const expectedOffset = circumference * (1 - expectedProgress)

    // Wait for the results of the initial useEffect call
    await waitFor(() => {
      expect(button).toHaveClass('opacity-100') // Should be visible due to initial scrollY
      // Use getAttribute
      expect(
        parseFloat(progressCircle.getAttribute('stroke-dashoffset') ?? 'NaN')
      ).toBeCloseTo(expectedOffset)
    })
  }, 10000) // Increased timeout
})
