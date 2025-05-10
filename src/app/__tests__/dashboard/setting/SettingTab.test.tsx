// SettingTab.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SettingTab from '@/src/app/[locale]/dashboard/setting/SettingTab' // Điều chỉnh đường dẫn nếu cần
// SettingTab.test.tsx

import { useTranslations } from 'next-intl'
import { useLocalStorage } from 'usehooks-ts'
import { useRouter, usePathname } from 'next/navigation'
import deleteUser from '../../../../app/api/user/deleteUser' // Adjust path if needed
import { useUpdateUser } from '../../../../hooks/dashboard/setting/useUpdateSettings' // Adjust path if needed
import { useGetUser } from '../../../../hooks/dashboard/setting/useGetUser' // Adjust path if needed
import { Setting } from '@/src/models/response/user.response' // Adjust path if needed

// --- Mocking Dependencies ---

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string, values?: object) => {
    // Simple mock: return key, or key with interpolated values for basic cases
    if (values) {
      let result = key
      Object.entries(values).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v))
      })
      return result
    }
    return key
  })
}))

jest.mock('usehooks-ts', () => ({
  useLocalStorage: jest.fn()
}))

const mockRouterPush = jest.fn()
const mockDefaultPathname = '/en/dashboard/settings' // Default pathname
let currentPathname = mockDefaultPathname // Variable to hold current mock pathname

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockRouterPush
  })),
  usePathname: jest.fn(() => currentPathname) // Use the variable
}))

jest.mock('../../../../app/api/user/deleteUser', () => ({
  __esModule: true,
  default: jest.fn()
}))
const mockDeleteUser = deleteUser as jest.Mock

// --- Define precise types for mocked hook return values ---
// Adjust this User type based on your actual User model if different
type MockUser = {
  id: string
  email: string
  name: string
  setting: Setting | null // Allow setting to be null based on component logic
}

type UseGetUserReturn = {
  user: MockUser | null
  loading: boolean
  error: string | null
  refetch: jest.Mock
}

type UseUpdateUserReturn = {
  updateUserSetting: jest.Mock<any, any> // Ensure jest.Mock is properly typed
  loading: boolean
  error: string | null
}

// --- Type from Component ---
type ToggleSettingKey = keyof Pick<
  Setting,
  | 'receiveNotifications'
  | 'autoAddFollowToCalendar'
  | 'notificationWhenConferencesChanges'
  | 'upComingEvent'
  | 'notificationWhenUpdateProfile'
  | 'notificationWhenFollow'
  | 'notificationWhenAddTocalendar'
  | 'notificationWhenAddToBlacklist'
>

// Mock Custom Hooks
const mockUpdateUserSetting = jest.fn()
const mockRefetchUser = jest.fn()
const mockSetLocalUser = jest.fn() // Mock the setter from useLocalStorage

jest.mock(
  '../../../../hooks/dashboard/setting/useUpdateSettings',
  (): { useUpdateUser: () => UseUpdateUserReturn } => ({
    useUpdateUser: jest.fn(() => ({
      updateUserSetting: mockUpdateUserSetting,
      loading: false,
      error: null
    }))
  })
)
const mockUseUpdateUser = useUpdateUser as unknown as jest.Mock<
  () => UseUpdateUserReturn
>

jest.mock(
  '../../../../hooks/dashboard/setting/useGetUser',
  (): { useGetUser: () => UseGetUserReturn } => ({
    useGetUser: jest.fn(() => ({
      user: null, // Default mock state
      loading: true,
      error: null,
      refetch: mockRefetchUser
    }))
  })
)
const mockUseGetUser = useGetUser as unknown as jest.Mock<UseGetUserReturn>

// --- Mock Data ---
const mockUserId = 'user-123'
// Ensure initialSettings provides values for all required keys based on Setting type
// If Setting allows null/undefined, handle them appropriately.
const initialSettings: Setting = {
  id: 'setting-1',
  autoAddFollowToCalendar: false,
  notificationWhenConferencesChanges: true,
  upComingEvent: true,
  notificationThrough: 'System',
  receiveNotifications: true,
  notificationWhenUpdateProfile: false,
  notificationWhenFollow: true,
  notificationWhenAddTocalendar: false,
  notificationWhenAddToBlacklist: true
  // Add other required Setting fields if necessary, ensure they match the type
  // Example: someOtherField: 'value',
}

const mockUser: MockUser = {
  id: mockUserId,
  email: 'test@example.com',
  name: 'Test User',
  setting: initialSettings
}

// --- Type for setupMocks parameters ---
interface SetupMocksParams {
  localUserData?: { id: string } | null
  getUserData?: Partial<UseGetUserReturn>
  updateUserData?: Partial<UseUpdateUserReturn>
  pathname?: string // Allow overriding pathname for specific tests
}

// --- Helper Function to Setup Mocks ---
const setupMocks = ({
  localUserData = { id: mockUserId },
  getUserData = {}, // Default to empty, will merge with defaults below
  updateUserData = {}, // Default to empty
  pathname = mockDefaultPathname // Use default pathname unless overridden
}: SetupMocksParams = {}) => {
  // Mock useLocalStorage
  ;(useLocalStorage as jest.Mock).mockReturnValue([
    localUserData,
    mockSetLocalUser
  ])

  // Set the current pathname for the usePathname mock
  currentPathname = pathname

  // Define default return values for hooks
  const defaultGetUserData: UseGetUserReturn = {
    user: mockUser,
    loading: false,
    error: null,
    refetch: mockRefetchUser
  }
  const defaultUpdateUserData: UseUpdateUserReturn = {
    updateUserSetting: mockUpdateUserSetting,
    loading: false,
    error: null
  }

  // Combine defaults with overrides provided in getUserData/updateUserData
  const finalGetUserData: UseGetUserReturn = {
    ...defaultGetUserData,
    ...getUserData
  }
  const finalUpdateUserData: UseUpdateUserReturn = {
    ...defaultUpdateUserData,
    ...updateUserData
  }

  mockUseGetUser.mockReturnValue(finalGetUserData)
  mockUseUpdateUser.mockReturnValue(finalUpdateUserData)

  // Clear mocks for clean state between tests
  mockUpdateUserSetting.mockClear()
  mockRefetchUser.mockClear()
  mockRouterPush.mockClear()
  mockDeleteUser.mockClear()
  mockSetLocalUser.mockClear()

  // Reset window.confirm mock for each test needing it
  // Use jest.spyOn inside tests or beforeEach if specific behavior is needed per test
  // Ensure mockRestore is called in afterEach
}

// --- Test Suite ---
describe('SettingTab Component', () => {
  beforeEach(() => {
    setupMocks() // Setup with default mocks before each test
    // Default confirm to true, can be overridden per test
    jest.spyOn(window, 'confirm').mockImplementation(() => true)
    jest.spyOn(console, 'error').mockImplementation(() => {}) // Suppress console.error
  })

  afterEach(() => {
    jest.restoreAllMocks() // Restore all spied/mocked functions
  })

  // --- Rendering States ---
  test('renders loading state initially', () => {
    setupMocks({ getUserData: { user: null, loading: true } }) // Override specific state
    render(<SettingTab />)
    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
    expect(screen.getByText('Loading_settings')).toBeInTheDocument()
  })

  test('renders error state if fetching user fails', () => {
    const errorMessage = 'Failed to fetch'
    setupMocks({
      getUserData: { user: null, loading: false, error: errorMessage }
    })
    render(<SettingTab />)
    expect(screen.getByTestId('error-state')).toBeInTheDocument()
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
  })

  test('renders "No user data available" if user is null after loading', () => {
    setupMocks({ getUserData: { user: null, loading: false, error: null } })
    render(<SettingTab />)
    expect(screen.getByTestId('no-data-state')).toBeInTheDocument()
    expect(screen.getByText('No_user_data_available')).toBeInTheDocument()
  })

  test('renders "No user data available" if user exists but setting is null', () => {
    const userWithoutSettings: MockUser = { ...mockUser, setting: null }
    setupMocks({
      getUserData: { user: userWithoutSettings, loading: false, error: null }
    })
    render(<SettingTab />)
    expect(screen.getByTestId('no-data-state')).toBeInTheDocument()
    expect(screen.getByText('No_user_data_available')).toBeInTheDocument()
  })

  test('renders settings correctly when data is loaded', () => {
    setupMocks() // Uses default mockUser with initialSettings
    render(<SettingTab />)

    expect(screen.getByText('Setting')).toBeInTheDocument()
    // Check a few key elements are rendered using text or testids
    expect(screen.getByText('Receive_Notifications')).toBeInTheDocument()
    expect(
      screen.getByTestId('toggle-receiveNotifications')
    ).toBeInTheDocument()
    expect(screen.getByTestId('select-notificationThrough')).toHaveValue(
      'System'
    )
    expect(screen.getByTestId('delete-account-button')).toBeInTheDocument()
  })

  // --- Toggle Interactions ---
  const testToggleInteraction = async (
    settingKey: ToggleSettingKey,
    initialValue: boolean
  ) => {
    // Mock the API call to resolve successfully for toggle tests
    mockUpdateUserSetting.mockResolvedValue({})

    // Render with default settings initially provided by setupMocks in beforeEach
    render(<SettingTab />)

    const toggleButton = screen.getByTestId(`toggle-${settingKey}`)
    expect(toggleButton).toHaveAttribute('aria-pressed', String(initialValue))

    // Check initial visual state (optional, relies on CSS classes)
    const innerToggleDiv = toggleButton.firstChild as HTMLElement
    const expectedInitialClass = initialValue
      ? 'translate-x-7'
      : 'translate-x-1'
    expect(innerToggleDiv).toHaveClass(expectedInitialClass)

    // Simulate click
    fireEvent.click(toggleButton)

    // Assert optimistic UI update happened immediately (check aria-pressed)
    expect(toggleButton).toHaveAttribute('aria-pressed', String(!initialValue))
    const expectedOptimisticClass = !initialValue
      ? 'translate-x-7'
      : 'translate-x-1'
    await waitFor(() => {
      // Wait for potential re-render after state change
      const updatedInnerToggleDiv = screen.getByTestId(`toggle-${settingKey}`)
        .firstChild as HTMLElement // Re-find inner div
      expect(updatedInnerToggleDiv).toHaveClass(expectedOptimisticClass)
    })

    // Verify updateUserSetting call
    await waitFor(() => {
      expect(mockUpdateUserSetting).toHaveBeenCalledTimes(1)
      expect(mockUpdateUserSetting).toHaveBeenCalledWith(mockUserId, {
        [settingKey]: !initialValue
      })
    })

    // Verify refetch call
    expect(mockRefetchUser).toHaveBeenCalledTimes(1)
  }

  // --- Calling the Toggle Tests ---
  test('toggles "Receive Notifications"', async () => {
    await testToggleInteraction(
      'receiveNotifications',
      initialSettings.receiveNotifications ?? false // Use default from mock data
    )
  })

  test('toggles "Auto add events to schedule"', async () => {
    await testToggleInteraction(
      'autoAddFollowToCalendar',
      initialSettings.autoAddFollowToCalendar ?? false
    )
  })

  test('toggles "Change and Update"', async () => {
    await testToggleInteraction(
      'notificationWhenConferencesChanges',
      initialSettings.notificationWhenConferencesChanges ?? false
    )
  })

  test('toggles "Your upcoming event"', async () => {
    await testToggleInteraction(
      'upComingEvent',
      initialSettings.upComingEvent ?? false
    )
  })

  test('toggles "Notification when update profile"', async () => {
    await testToggleInteraction(
      'notificationWhenUpdateProfile',
      initialSettings.notificationWhenUpdateProfile ?? false
    )
  })

  test('toggles "Notification when follow"', async () => {
    await testToggleInteraction(
      'notificationWhenFollow',
      initialSettings.notificationWhenFollow ?? false
    )
  })

  test('toggles "Notification when add to calendar"', async () => {
    await testToggleInteraction(
      'notificationWhenAddTocalendar',
      initialSettings.notificationWhenAddTocalendar ?? false
    )
  })

  test('toggles "Notification when add to blacklist"', async () => {
    await testToggleInteraction(
      'notificationWhenAddToBlacklist',
      initialSettings.notificationWhenAddToBlacklist ?? false
    )
  })

  test('reverts toggle state if update fails', async () => {
    const settingKey: ToggleSettingKey = 'receiveNotifications'
    const initialValue = initialSettings.receiveNotifications ?? false
    const updateErrorMsg = 'API Error on Toggle'

    // Initial Setup (hook returns no error)
    setupMocks()
    mockUpdateUserSetting.mockRejectedValue(new Error(updateErrorMsg)) // Simulate API failure

    // Initial Render
    const { rerender } = render(<SettingTab />) // Get rerender function
    const toggleButton = screen.getByTestId(`toggle-${settingKey}`)
    expect(toggleButton).toHaveAttribute('aria-pressed', String(initialValue))

    // Action
    fireEvent.click(toggleButton)

    // Check optimistic update first
    expect(toggleButton).toHaveAttribute('aria-pressed', String(!initialValue))

    // Wait for the async mock function call
    await waitFor(() => {
      expect(mockUpdateUserSetting).toHaveBeenCalledTimes(1)
    })

    // Simulate the hook updating its state *after* the rejection
    mockUseUpdateUser.mockReturnValue({
      // Reconfigure the mock for subsequent renders
      updateUserSetting: mockUpdateUserSetting,
      loading: false,
      error: updateErrorMsg // NOW return the error
    })

    // Re-render the component with the hook now providing the error state
    rerender(<SettingTab />)

    // Assertions *after* re-render with error state
    // Re-find the button in the updated DOM
    const revertedToggleButton = screen.getByTestId(`toggle-${settingKey}`)
    expect(revertedToggleButton).toHaveAttribute(
      'aria-pressed',
      String(initialValue)
    ) // Check state reverted
    expect(screen.getByTestId('update-error')).toBeInTheDocument() // Error message should be present now
    expect(screen.getByTestId('update-error')).toHaveTextContent(updateErrorMsg)
    expect(mockRefetchUser).not.toHaveBeenCalled()
  })

  test('disables toggle buttons when update is loading', () => {
    setupMocks({
      updateUserData: { loading: true } // Set update loading to true
    })
    render(<SettingTab />)

    const toggleButtons = screen.queryAllByTestId(/toggle-/) // Find all toggles by testid pattern
    expect(toggleButtons.length).toBeGreaterThan(0) // Ensure we found some
    toggleButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
    // Also check delete button is disabled
    expect(screen.getByTestId('delete-account-button')).toBeDisabled()
  })

  // --- Select Interaction ---
  test('handles notification delivery change', async () => {
    mockUpdateUserSetting.mockResolvedValue({}) // Simulate successful update
    setupMocks()
    render(<SettingTab />)

    const selectElement = screen.getByTestId('select-notificationThrough')
    const initialSelectValue = initialSettings.notificationThrough
    const newSelectValue = 'Email'

    expect(selectElement).toHaveValue(initialSelectValue)

    fireEvent.change(selectElement, { target: { value: newSelectValue } })

    // Check optimistic update
    expect(selectElement).toHaveValue(newSelectValue)

    await waitFor(() => {
      expect(mockUpdateUserSetting).toHaveBeenCalledTimes(1)
      expect(mockUpdateUserSetting).toHaveBeenCalledWith(mockUserId, {
        notificationThrough: newSelectValue
      })
    })

    expect(mockRefetchUser).toHaveBeenCalledTimes(1)
  })

  test('reverts select state if update fails', async () => {
    const initialSelectValue = initialSettings.notificationThrough
    const newSelectValue = 'All'
    const updateErrorMsg = 'API Error on Select'

    // Initial Setup
    setupMocks()
    mockUpdateUserSetting.mockRejectedValue(new Error(updateErrorMsg))

    // Initial Render
    const { rerender } = render(<SettingTab />)
    const selectElement = screen.getByTestId('select-notificationThrough')
    expect(selectElement).toHaveValue(initialSelectValue)

    // Action
    fireEvent.change(selectElement, { target: { value: newSelectValue } })

    // Check optimistic update
    expect(selectElement).toHaveValue(newSelectValue)

    // Wait for async call
    await waitFor(() => {
      expect(mockUpdateUserSetting).toHaveBeenCalledTimes(1)
    })

    // Simulate the hook updating its state *after* the rejection
    mockUseUpdateUser.mockReturnValue({
      updateUserSetting: mockUpdateUserSetting,
      loading: false,
      error: updateErrorMsg
    })

    // Re-render with the hook providing the error state
    rerender(<SettingTab />)

    // Assertions *after* re-render with error state
    // Re-find element
    const revertedSelectElement = screen.getByTestId(
      'select-notificationThrough'
    )
    expect(revertedSelectElement).toHaveValue(initialSelectValue) // State should revert
    expect(screen.getByTestId('update-error')).toBeInTheDocument() // Error should be present
    expect(screen.getByTestId('update-error')).toHaveTextContent(updateErrorMsg)
    expect(mockRefetchUser).not.toHaveBeenCalled()
  })

  test('disables select dropdown when update is loading', () => {
    setupMocks({
      updateUserData: { loading: true } // Set update loading to true
    })
    render(<SettingTab />)
    expect(screen.getByTestId('select-notificationThrough')).toBeDisabled()
  })

  // --- Delete Account ---
  test('does not delete account if confirmation is cancelled', () => {
    jest.spyOn(window, 'confirm').mockImplementationOnce(() => false) // Override confirm for this test
    setupMocks()
    render(<SettingTab />)

    const deleteButton = screen.getByTestId('delete-account-button')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledTimes(1)
    expect(mockDeleteUser).not.toHaveBeenCalled()
    expect(mockRouterPush).not.toHaveBeenCalled()
    expect(mockSetLocalUser).not.toHaveBeenCalled()
    expect(deleteButton).not.toBeDisabled()
    expect(screen.queryByText('Deleting')).not.toBeInTheDocument() // Check for Deleting text
  })

  test('calls deleteUser, clears local storage and redirects on successful deletion', async () => {
    setupMocks() // Uses default confirm: true
    mockDeleteUser.mockResolvedValueOnce(undefined) // Simulate successful deletion
    render(<SettingTab />)

    const deleteButton = screen.getByTestId('delete-account-button')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledTimes(1)
    expect(deleteButton).toBeDisabled()
    expect(screen.getByText('Deleting')).toBeInTheDocument() // Check for Deleting text

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledTimes(1)
      expect(mockDeleteUser).toHaveBeenCalledWith(mockUserId)
    })

    // Check local storage was cleared
    expect(mockSetLocalUser).toHaveBeenCalledTimes(1)
    expect(mockSetLocalUser).toHaveBeenCalledWith(null)

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledTimes(1)
      expect(mockRouterPush).toHaveBeenCalledWith('/en/auth/login') // Based on default mockPathname
    })
  })

  test('handles different locale in pathname for redirect', async () => {
    const frenchPathname = '/fr/dashboard/settings'
    // Set mocks *specifically* for this test *before* rendering
    setupMocks({ pathname: frenchPathname }) // Pass pathname override
    mockDeleteUser.mockResolvedValueOnce(undefined)

    render(<SettingTab />)

    fireEvent.click(screen.getByTestId('delete-account-button'))

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith(mockUserId)
    })

    // Check local storage clear again for this path
    expect(mockSetLocalUser).toHaveBeenCalledWith(null)

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/fr/auth/login') // Check correct locale path
    })
  })

  test('shows error message if deletion fails', async () => {
    setupMocks()
    const deleteErrorMessage = 'API deletion failed'
    mockDeleteUser.mockRejectedValueOnce(new Error(deleteErrorMessage))
    render(<SettingTab />)

    const deleteButton = screen.getByTestId('delete-account-button')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Deleting')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledTimes(1)
    })

    // Check error message is displayed
    expect(screen.getByTestId('delete-error')).toBeInTheDocument()
    expect(screen.getByTestId('delete-error')).toHaveTextContent(
      deleteErrorMessage
    )

    // Button should be enabled again, loading text removed
    expect(deleteButton).not.toBeDisabled()
    expect(screen.queryByText('Deleting')).not.toBeInTheDocument()
    expect(mockRouterPush).not.toHaveBeenCalled() // No redirect on failure
    expect(mockSetLocalUser).not.toHaveBeenCalled() // Don't clear local storage on failure
  })

  test('shows error if trying to delete when not logged in (no localUser id)', async () => {
    setupMocks({ localUserData: null }) // Simulate no user in local storage
    render(<SettingTab />)

    const deleteButton = screen.getByTestId('delete-account-button')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledTimes(1)

    // Expect error message to be displayed directly without calling API
    await waitFor(() => {
      expect(screen.getByTestId('delete-error')).toBeInTheDocument()
      // Assuming your i18n mock returns the key
      expect(screen.getByTestId('delete-error')).toHaveTextContent(
        'Error_UserNotLoggedIn'
      )
    })

    expect(mockDeleteUser).not.toHaveBeenCalled()
    expect(screen.queryByText('Deleting')).not.toBeInTheDocument()
    expect(deleteButton).not.toBeDisabled() // Button state should reset
    expect(mockSetLocalUser).not.toHaveBeenCalled()
  })

  // --- Error Display ---
  test('displays general update error message if updating settings fails', async () => {
    const updateErrorMessage = 'Failed badly'

    // Initial Setup
    setupMocks()
    // Simulate failure during a toggle action
    mockUpdateUserSetting.mockRejectedValue(new Error(updateErrorMessage))

    // Initial Render
    const { rerender } = render(<SettingTab />)
    const toggleButton = screen.getByTestId('toggle-receiveNotifications')

    // Action
    fireEvent.click(toggleButton)

    // Wait for the async call
    await waitFor(() => {
      expect(mockUpdateUserSetting).toHaveBeenCalledTimes(1)
    })

    // Simulate the hook updating its state *after* the rejection
    mockUseUpdateUser.mockReturnValue({
      updateUserSetting: mockUpdateUserSetting,
      loading: false,
      error: updateErrorMessage
    })

    // Re-render with the hook providing the error state
    rerender(<SettingTab />)

    // Assertions *after* re-render with error state
    expect(screen.getByTestId('update-error')).toBeInTheDocument()
    expect(screen.getByTestId('update-error')).toHaveTextContent(
      updateErrorMessage
    )
  })
}) // End describe block
