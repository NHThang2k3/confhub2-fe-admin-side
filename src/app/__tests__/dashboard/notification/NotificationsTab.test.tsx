// src/app/__tests__/dashboard/notification/NotificationsTab.test.tsx

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
// Adjust the import path according to your project structure
import NotificationsTab from '@/src/app/[locale]/dashboard/notification/NotificationsTab'
// Adjust the import path according to your project structure
import useNotifications from '../../../../hooks/dashboard/notification/useNotifications'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

// --- Mocks ---

// Define a placeholder Notification type matching expected structure
// Replace with your actual type import if available:
// import { Notification } from '@/src/types/notification';
type Notification = {
  id: string
  title: string
  content: string
  createdAt: string // Should be ISO string
  seenAt: string | null // Should be ISO string or null
  isImportant: boolean
  conferenceId: string
  deletedAt: string | null // Should be ISO string or null
  message: string
  type: string
}

// Mock the custom hook useNotifications
jest.mock('../../../../hooks/dashboard/notification/useNotifications')
const mockUseNotifications = useNotifications as jest.MockedFunction<
  typeof useNotifications
>

// Mock next/navigation functions
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))
const mockUsePathname = usePathname as jest.Mock
const mockUseRouter = useRouter as jest.Mock
const mockUseSearchParams = useSearchParams as jest.Mock

// Mock next-intl for translations
jest.mock('next-intl', () => ({
  useTranslations: jest.fn()
}))
const mockUseTranslations = useTranslations as jest.Mock

// Mock NotificationDetails component (avoids needing to fully render it)
jest.mock(
  '@/src/app/[locale]/dashboard/notification/NotificationDetails',
  () => {
    // eslint-disable-next-line react/display-name
    return ({ notification, onBack, onDelete, onToggleImportant }: any) => (
      <div data-testid='notification-details'>
        <h2>Details: {notification.title}</h2>
        <button onClick={onBack}>Mock Back</button>
        <button onClick={() => onDelete(notification.id)}>
          Mock Delete Detail
        </button>
        <button onClick={() => onToggleImportant(notification.id)}>
          Mock Toggle Important Detail
        </button>
      </div>
    )
  }
)

// Mock NotificationItem component (critical for interaction testing)
// Ensure this mock's path matches your project structure
jest.mock('@/src/app/[locale]/dashboard/notification/NotificationItem', () => {
  // eslint-disable-next-line react/display-name
  return ({ notification, isChecked, onCheckboxChange, onClick }: any) => (
    <div
      data-testid={`notification-item-${notification.id}`}
      onClick={onClick} // Pass through the onClick prop from parent
      style={{ cursor: 'pointer' }} // Visual cue for clickability
    >
      <input
        type='checkbox'
        checked={isChecked} // Reflects the state passed down
        onChange={e => {
          e.stopPropagation() // Prevent row click when checkbox is clicked
          // Pass the intended *toggled* state back up
          onCheckboxChange(!isChecked)
        }}
        aria-label={`Select ${notification.title}`}
        data-testid={`checkbox-${notification.id}`} // Specific ID for checkbox selection
      />
      <span>{notification.title}</span>
      {/* Optional: Render status indicators for easier debugging/assertion */}
      <span>{notification.isImportant ? ' (Important)' : ''}</span>
      <span>{notification.seenAt ? ' (Read)' : ' (Unread)'}</span>
    </div>
  )
})

// --- Helper Functions ---
const mockSearchParamsGet = jest.fn()
const mockRouterPush = jest.fn() // Specific mock for router.push

// --- Sample Data (Corrected Date Types) ---
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Notification 1',
    content: 'Content 1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    seenAt: null,
    isImportant: false,
    conferenceId: 'conf1',
    deletedAt: null,
    message: 'Message 1',
    type: 'info'
  },
  {
    id: '2',
    title: 'Notification 2',
    content: 'Content 2',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    seenAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
    isImportant: true,
    conferenceId: 'conf2',
    deletedAt: null,
    message: 'Message 2',
    type: 'alert'
  },
  {
    id: '3',
    title: 'Notification 3 Unread Important',
    content: 'Content 3',
    createdAt: new Date(Date.now() - 0.2 * 60 * 60 * 1000).toISOString(),
    seenAt: null,
    isImportant: true,
    conferenceId: 'conf3',
    deletedAt: null,
    message: 'Message 3',
    type: 'warning'
  }
]

// Centralized mock setup function
const setupMocks = (
  // Params to control navigation state for the test
  {
    tab = 'notifications',
    id = null
  }: {
    tab?: string | null
    id?: string | null
  } = {},
  // Data to override the default return value of the useNotifications hook
  notificationHookData: Partial<
    Omit<
      ReturnType<typeof useNotifications>,
      'notifications' | 'filteredNotifications'
    > & {
      notifications?: Notification[]
      filteredNotifications?: Notification[]
    }
  > = {}
) => {
  // Define the default state returned by the useNotifications hook
  const defaultNotificationData: ReturnType<typeof useNotifications> = {
    notifications: [],
    checkedIndices: [],
    selectAllChecked: false,
    loading: false,
    loggedIn: true,
    searchTerm: '',
    filteredNotifications: [],
    handleUpdateSeenAt: jest.fn(),
    handleToggleImportant: jest.fn(),
    handleDeleteNotification: jest.fn(),
    handleMarkUnseen: jest.fn(), // Assuming this exists based on original code
    handleCheckboxChangeTab: jest.fn(),
    handleDeleteSelected: jest.fn(),
    handleSelectAllChange: jest.fn(),
    handleMarkSelectedAsRead: jest.fn(),
    handleMarkSelectedAsUnread: jest.fn(),
    allSelectedAreRead: false,
    handleMarkSelectedAsImportant: jest.fn(),
    handleMarkSelectedAsUnimportant: jest.fn(),
    allSelectedAreImportant: false,
    setSearchTerm: jest.fn(),
    fetchData: jest.fn(),
    ...notificationHookData // Apply test-specific overrides
  }
  // Configure the mock hook to return the (potentially overridden) default data
  mockUseNotifications.mockReturnValue(defaultNotificationData as any)

  // Configure navigation mocks based on the provided tab/id parameters
  mockUsePathname.mockReturnValue('/dashboard') // Example base path

  // Create search params string based on current test setup
  const currentSearchParams = new URLSearchParams()
  if (tab) currentSearchParams.set('tab', tab)
  if (id) currentSearchParams.set('id', id)
  const searchParamsString = currentSearchParams.toString()

  // Configure useSearchParams mock
  mockUseSearchParams.mockReturnValue({
    get: mockSearchParamsGet.mockImplementation((key: string) => {
      // Use URLSearchParams to correctly parse the string for 'get'
      const params = new URLSearchParams(searchParamsString)
      return params.get(key)
    }),
    // Ensure toString() returns the string reflecting the current setup
    toString: jest.fn().mockReturnValue(searchParamsString)
  })

  // Configure useRouter mock to return our specific push mock function
  mockUseRouter.mockReturnValue({
    push: mockRouterPush
  })

  // Configure useTranslations mock
  mockUseTranslations.mockImplementation(
    (namespace?: string) => (key: string) => key // Simple mock returns the translation key
  )
}

// --- Test Suites ---

describe('NotificationsTab Component', () => {
  // Reset all mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login message when not logged in', () => {
    setupMocks({}, { loggedIn: false }) // Set loggedIn to false
    render(<NotificationsTab />)
    expect(
      screen.getByText('Please_log_in_to_view_notifications')
    ).toBeInTheDocument()
    // Ensure loading/search are not present
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
    expect(
      screen.queryByPlaceholderText('Search_notifications')
    ).not.toBeInTheDocument()
  })

  it('should render null if tab is not "notifications"', () => {
    setupMocks({ tab: 'some-other-tab' }, { loggedIn: true }) // Set a different tab
    const { container } = render(<NotificationsTab />)
    // Expect the component to render nothing when the tab doesn't match
    expect(container.firstChild).toBeNull()
  })

  it('should render loading state', () => {
    setupMocks({ tab: 'notifications' }, { loggedIn: true, loading: true }) // Set loading to true
    render(<NotificationsTab />)
    // Check for the loading text provided in the component's loading state
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
    // Ensure main content (like search) isn't rendered during loading
    expect(
      screen.queryByPlaceholderText('Search_notifications')
    ).not.toBeInTheDocument()
  })

  it('should render "no notifications" message when list is empty', () => {
    setupMocks(
      { tab: 'notifications' },
      {
        loggedIn: true,
        loading: false,
        notifications: [], // Provide empty arrays
        filteredNotifications: []
      }
    )
    render(<NotificationsTab />)
    expect(
      screen.getByPlaceholderText('Search_notifications')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByText('You_have_no_notifications')).toBeInTheDocument()
  })

  it('should render list of notifications', () => {
    setupMocks(
      { tab: 'notifications' },
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications, // Use sample data
        filteredNotifications: sampleNotifications
      }
    )
    render(<NotificationsTab />)
    // Check if titles from sample data are rendered
    expect(screen.getByText('Notification 1')).toBeInTheDocument()
    expect(screen.getByText('Notification 2')).toBeInTheDocument()
    expect(
      screen.getByText('Notification 3 Unread Important')
    ).toBeInTheDocument()
    // Ensure "no notifications" message isn't shown
    expect(
      screen.queryByText('You_have_no_notifications')
    ).not.toBeInTheDocument()
    // Check for list controls
    expect(
      screen.getByLabelText('Select all notifications')
    ).toBeInTheDocument()
    // Ensure action buttons aren't visible initially
    expect(screen.queryByText('Mark_As_Read')).not.toBeInTheDocument()
    expect(screen.queryByText('Delete_Selected')).not.toBeInTheDocument()
  })

  it('should call setSearchTerm on search input change', () => {
    const setSearchTermMock = jest.fn()
    setupMocks(
      { tab: 'notifications' },
      {
        loggedIn: true,
        loading: false,
        setSearchTerm: setSearchTermMock, // Provide the mock function
        notifications: sampleNotifications, // Provide data for context
        filteredNotifications: sampleNotifications
      }
    )
    render(<NotificationsTab />)
    const searchInput = screen.getByPlaceholderText('Search_notifications')
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    // Verify the hook's setter was called with the input value
    expect(setSearchTermMock).toHaveBeenCalledWith('test search')
    expect(setSearchTermMock).toHaveBeenCalledTimes(1)
  })

  it('should filter notifications when filter buttons are clicked', () => {
    setupMocks(
      { tab: 'notifications' },
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications,
        filteredNotifications: sampleNotifications // Start with all visible
      }
    )
    render(<NotificationsTab />)

    // Initial check (all items present)
    expect(screen.getByText('Notification 1')).toBeInTheDocument()
    expect(screen.getByText('Notification 2')).toBeInTheDocument()
    expect(
      screen.getByText('Notification 3 Unread Important')
    ).toBeInTheDocument()

    // Click Unread Filter
    fireEvent.click(screen.getByRole('button', { name: 'Unread' }))
    expect(screen.getByText('Notification 1')).toBeInTheDocument() // Unread
    expect(screen.queryByText('Notification 2')).not.toBeInTheDocument() // Read
    expect(
      screen.getByText('Notification 3 Unread Important')
    ).toBeInTheDocument() // Unread

    // Click Read Filter
    fireEvent.click(screen.getByRole('button', { name: 'Read' }))
    expect(screen.queryByText('Notification 1')).not.toBeInTheDocument() // Unread
    expect(screen.getByText('Notification 2')).toBeInTheDocument() // Read
    expect(
      screen.queryByText('Notification 3 Unread Important')
    ).not.toBeInTheDocument() // Unread

    // Click Important Filter
    fireEvent.click(screen.getByRole('button', { name: 'Important' }))
    expect(screen.queryByText('Notification 1')).not.toBeInTheDocument() // Not important
    expect(screen.getByText('Notification 2')).toBeInTheDocument() // Important
    expect(
      screen.getByText('Notification 3 Unread Important')
    ).toBeInTheDocument() // Important

    // Click All Filter
    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByText('Notification 1')).toBeInTheDocument()
    expect(screen.getByText('Notification 2')).toBeInTheDocument()
    expect(
      screen.getByText('Notification 3 Unread Important')
    ).toBeInTheDocument()
  })

  it('should call handleSelectAllChange when "Select All" checkbox is clicked', () => {
    const handleSelectAllChangeMock = jest.fn()
    setupMocks(
      { tab: 'notifications' },
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications,
        filteredNotifications: sampleNotifications,
        handleSelectAllChange: handleSelectAllChangeMock // Provide mock handler
      }
    )
    render(<NotificationsTab />)
    const selectAllCheckbox = screen.getByLabelText('Select all notifications')
    fireEvent.click(selectAllCheckbox)
    // Verify the handler was called
    expect(handleSelectAllChangeMock).toHaveBeenCalledTimes(1)
    // Optionally check argument: expect(handleSelectAllChangeMock).toHaveBeenCalledWith(expect.any(Boolean));
  })

  it('should show action buttons when items are selected and call handlers on click', () => {
    const handleMarkSelectedAsReadMock = jest.fn()
    const handleMarkSelectedAsImportantMock = jest.fn()
    const handleDeleteSelectedMock = jest.fn()

    // Setup with item '1' selected (Unread, Not Important)
    setupMocks(
      { tab: 'notifications' },
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications,
        filteredNotifications: sampleNotifications,
        checkedIndices: ['1'],
        allSelectedAreRead: false, // Item 1 is unread
        allSelectedAreImportant: false, // Item 1 is not important
        handleMarkSelectedAsRead: handleMarkSelectedAsReadMock,
        handleMarkSelectedAsImportant: handleMarkSelectedAsImportantMock,
        handleDeleteSelected: handleDeleteSelectedMock
      }
    )

    render(<NotificationsTab />)

    // Find the action buttons (expecting Read/Important/Delete)
    const markReadButton = screen.getByRole('button', { name: 'Mark_As_Read' })
    const markImportantButton = screen.getByRole('button', {
      name: 'Mark_As_Important'
    })
    const deleteButton = screen.getByRole('button', { name: 'Delete_Selected' })

    // Assert visibility
    expect(markReadButton).toBeInTheDocument()
    expect(markImportantButton).toBeInTheDocument()
    expect(deleteButton).toBeInTheDocument()
    // Assert *absence* of opposite actions
    expect(
      screen.queryByRole('button', { name: 'Mark_As_Unread' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Mark_As_Unimportant' })
    ).not.toBeInTheDocument()

    // Click buttons and verify handlers
    fireEvent.click(markReadButton)
    expect(handleMarkSelectedAsReadMock).toHaveBeenCalledTimes(1)

    fireEvent.click(markImportantButton)
    expect(handleMarkSelectedAsImportantMock).toHaveBeenCalledTimes(1)

    fireEvent.click(deleteButton)
    expect(handleDeleteSelectedMock).toHaveBeenCalledTimes(1)
  })

  it('should show "Mark As Unread" and "Mark As Unimportant" if all selected are read/important', () => {
    const handleMarkSelectedAsUnreadMock = jest.fn()
    const handleMarkSelectedAsUnimportantMock = jest.fn()

    // Setup with item '2' selected (Read, Important)
    setupMocks(
      { tab: 'notifications' },
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications,
        filteredNotifications: sampleNotifications,
        checkedIndices: ['2'],
        allSelectedAreRead: true, // Item 2 is read
        allSelectedAreImportant: true, // Item 2 is important
        handleMarkSelectedAsUnread: handleMarkSelectedAsUnreadMock,
        handleMarkSelectedAsUnimportant: handleMarkSelectedAsUnimportantMock
      }
    )

    render(<NotificationsTab />)

    // Find the action buttons (expecting Unread/Unimportant/Delete)
    const markUnreadButton = screen.getByRole('button', {
      name: 'Mark_As_Unread'
    })
    const markUnimportantButton = screen.getByRole('button', {
      name: 'Mark_As_Unimportant'
    })
    const deleteButton = screen.getByRole('button', { name: 'Delete_Selected' }) // Delete is always shown if items are selected

    // Assert visibility
    expect(markUnreadButton).toBeInTheDocument()
    expect(markUnimportantButton).toBeInTheDocument()
    expect(deleteButton).toBeInTheDocument()
    // Assert *absence* of opposite actions
    expect(
      screen.queryByRole('button', { name: 'Mark_As_Read' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Mark_As_Important' })
    ).not.toBeInTheDocument()

    // Click buttons and verify handlers
    fireEvent.click(markUnreadButton)
    expect(handleMarkSelectedAsUnreadMock).toHaveBeenCalledTimes(1)

    fireEvent.click(markUnimportantButton)
    expect(handleMarkSelectedAsUnimportantMock).toHaveBeenCalledTimes(1)
  })

  // FIXED Checkbox Click Test (using rerender)
  it('should call handleCheckboxChangeTab when an item checkbox is clicked', () => {
    const handleCheckboxChangeTabMock = jest.fn()

    // --- Initial Render Setup ---
    setupMocks(
      { tab: 'notifications' },
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications,
        filteredNotifications: sampleNotifications,
        checkedIndices: [], // Start with none checked
        handleCheckboxChangeTab: handleCheckboxChangeTabMock
      }
    )
    // Initial render, capture rerender function
    const { rerender } = render(<NotificationsTab />)

    const item1Checkbox = screen.getByTestId('checkbox-1')
    expect(item1Checkbox).not.toBeChecked()

    // --- First Click ---
    fireEvent.click(item1Checkbox)
    expect(handleCheckboxChangeTabMock).toHaveBeenCalledWith('1', true)
    expect(handleCheckboxChangeTabMock).toHaveBeenCalledTimes(1) // Check count after first click

    // --- Re-render Simulation ---
    // Update the mock hook's return value to reflect the checked state
    setupMocks(
      { tab: 'notifications' },
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications,
        filteredNotifications: sampleNotifications,
        checkedIndices: ['1'], // Simulate state update: now item 1 is checked
        handleCheckboxChangeTab: handleCheckboxChangeTabMock // Pass same mock function again
      }
    )
    // Re-render the *same component instance* with updated props
    rerender(<NotificationsTab />)

    // --- Second Click ---
    // Find the checkbox again in the updated DOM
    const item1CheckboxAgain = screen.getByTestId('checkbox-1')
    // Verify the prop change reflected in the DOM (it should now be checked)
    expect(item1CheckboxAgain).toBeChecked()

    // Click the now-checked checkbox
    fireEvent.click(item1CheckboxAgain)
    // Expect the handler to be called with 'false' due to the toggled state (!isChecked)
    expect(handleCheckboxChangeTabMock).toHaveBeenCalledWith('1', false)

    // Verify total calls
    expect(handleCheckboxChangeTabMock).toHaveBeenCalledTimes(2) // Total calls after second click
  })

  // Navigation test - requires verification of the actual component code
  it('should navigate to details view when an item row is clicked', () => {
    // ********************************************************************
    // ** NOTE: This test's success depends on the `onClick` prop being **
    // ** correctly implemented and passed to `<NotificationItem>`     **
    // ** within your actual `NotificationsTab.tsx` component file.      **
    // ********************************************************************
    setupMocks(
      { tab: 'notifications' }, // Ensure 'id' is not set initially
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications,
        filteredNotifications: sampleNotifications
      }
    )
    render(<NotificationsTab />)

    // Find the clickable item row using its test ID
    const itemRow = screen.getByTestId('notification-item-1')
    // Simulate a click on the row
    fireEvent.click(itemRow)

    // Verify the router.push mock was called with the expected URL
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/dashboard?tab=notifications&id=1' // Expect 'id=1' to be added
    )
    // Ensure it was called exactly once
    expect(mockRouterPush).toHaveBeenCalledTimes(1)
  })

  // --- Details View Tests ---

  it('should render NotificationDetails when id is present in search params', () => {
    setupMocks(
      { tab: 'notifications', id: '2' }, // Set 'id' in params
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications, // Provide data for lookup
        filteredNotifications: sampleNotifications
      }
    )
    render(<NotificationsTab />)

    // Expect the mocked Details component to be rendered
    expect(screen.getByTestId('notification-details')).toBeInTheDocument()
    // Check content rendered by the mock Details component
    expect(screen.getByText('Details: Notification 2')).toBeInTheDocument()
    // Expect the list view elements to be hidden
    expect(
      screen.queryByPlaceholderText('Search_notifications')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Notification 1')).not.toBeInTheDocument()
  })

  it('should call handleUpdateSeenAt when viewing an unread notification detail', async () => {
    const handleUpdateSeenAtMock = jest.fn()
    setupMocks(
      { tab: 'notifications', id: '1' }, // View item '1' (Unread)
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications,
        handleUpdateSeenAt: handleUpdateSeenAtMock // Provide mock handler
      }
    )

    render(<NotificationsTab />)

    // Wait for the useEffect hook in the component to potentially call the handler
    await waitFor(() => {
      expect(handleUpdateSeenAtMock).toHaveBeenCalledWith('1')
    })
    // Ensure it was called exactly once
    expect(handleUpdateSeenAtMock).toHaveBeenCalledTimes(1)
  })

  it('should NOT call handleUpdateSeenAt when viewing a read notification detail', async () => {
    const handleUpdateSeenAtMock = jest.fn()
    setupMocks(
      { tab: 'notifications', id: '2' }, // View item '2' (Read)
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications,
        handleUpdateSeenAt: handleUpdateSeenAtMock
      }
    )
    render(<NotificationsTab />)

    // Give asynchronous effects a brief moment to potentially run
    await new Promise(resolve => setTimeout(resolve, 50)) // Small delay

    // Verify the handler was *not* called for an already read item
    expect(handleUpdateSeenAtMock).not.toHaveBeenCalled()
  })

  it('should render "Notification not found" for invalid id', () => {
    setupMocks(
      { tab: 'notifications', id: 'invalid-id' }, // Use an ID not in sample data
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications // Provide data for context
      }
    )
    render(<NotificationsTab />)

    // Expect the "not found" message and the back button
    expect(screen.getByText('Notification_not_found')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    // Ensure the details component itself isn't rendered
    expect(screen.queryByTestId('notification-details')).not.toBeInTheDocument()
  })

  it('should navigate back when "Back" button is clicked (from Not Found view)', () => {
    setupMocks(
      { tab: 'notifications', id: 'invalid-id' }, // Start in the "not found" state
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications
      }
    )
    render(<NotificationsTab />)

    const backButton = screen.getByRole('button', { name: 'Back' })
    fireEvent.click(backButton)

    // Expect navigation back to the list view (removing the 'id' param)
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard?tab=notifications')
    expect(mockRouterPush).toHaveBeenCalledTimes(1)
  })

  it('should navigate back when onBack is called from NotificationDetails mock', () => {
    setupMocks(
      { tab: 'notifications', id: '2' }, // Start in the details view for item '2'
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications
      }
    )
    render(<NotificationsTab />)

    // Find the back button within the *mocked* NotificationDetails component
    const mockBackButton = screen.getByText('Mock Back')
    fireEvent.click(mockBackButton)

    // Expect navigation back to the list view (removing the 'id' param)
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard?tab=notifications')
    expect(mockRouterPush).toHaveBeenCalledTimes(1)
  })

  it('should call delete/toggle handlers from NotificationDetails mock', () => {
    const handleDeleteNotificationMock = jest.fn()
    const handleToggleImportantMock = jest.fn()

    setupMocks(
      { tab: 'notifications', id: '2' }, // Start in details view for item '2'
      {
        loggedIn: true,
        loading: false,
        notifications: sampleNotifications,
        handleDeleteNotification: handleDeleteNotificationMock, // Provide mock handlers
        handleToggleImportant: handleToggleImportantMock
      }
    )
    render(<NotificationsTab />)

    // Find buttons within the *mocked* NotificationDetails component
    const mockDeleteButton = screen.getByText('Mock Delete Detail')
    const mockToggleButton = screen.getByText('Mock Toggle Important Detail')

    // Test delete action
    fireEvent.click(mockDeleteButton)
    expect(handleDeleteNotificationMock).toHaveBeenCalledWith('2')
    expect(handleDeleteNotificationMock).toHaveBeenCalledTimes(1)
    // Reset push mock if delete might navigate (handled by hook)
    mockRouterPush.mockClear()

    // Test toggle action
    fireEvent.click(mockToggleButton)
    expect(handleToggleImportantMock).toHaveBeenCalledWith('2')
    expect(handleToggleImportantMock).toHaveBeenCalledTimes(1)
    // Expect toggle *not* to cause navigation
    expect(mockRouterPush).not.toHaveBeenCalled()
  })
})
