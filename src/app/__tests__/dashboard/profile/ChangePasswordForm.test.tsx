import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom' // For helpful matchers like toBeInTheDocument

import ChangePasswordForm from '@/src/app/[locale]/dashboard/profile/ChangePasswordForm'
import { useChangePassword } from '../../../../hooks/dashboard/profile/useChangePassword'
import { useTranslations } from 'next-intl'

// --- Mocks ---

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key) // Simple mock returning the key
}))

// Mock the custom hook
// We need to define the type for the mock explicitly if not inferred
type MockUseChangePassword = ReturnType<typeof useChangePassword>

const mockUseChangePassword =
  useChangePassword as jest.Mock<MockUseChangePassword>
jest.mock('../../../../hooks/dashboard/profile/useChangePassword', () => ({
  useChangePassword: jest.fn()
}))

// Mock the Button component
jest.mock('@/src/app/[locale]/utils/Button', () => ({
  __esModule: true, // Necessary for default exports
  default: jest.fn(({ children, onClick, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ))
}))

// --- Test Suite ---

describe('ChangePasswordForm', () => {
  const mockUserId = 'user-123'
  const mockOnClose = jest.fn()

  // Define mock handlers from the hook to track calls
  let mockHandleCurrentPasswordChange: jest.Mock
  let mockHandleNewPasswordChange: jest.Mock
  let mockHandleConfirmNewPasswordChange: jest.Mock
  let mockHandleConfirmCurrentPassword: jest.Mock
  let mockHandleChangePassword: jest.Mock
  // Define a variable for the default state
  let defaultMockState: MockUseChangePassword

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Reset mock handlers
    mockHandleCurrentPasswordChange = jest.fn()
    mockHandleNewPasswordChange = jest.fn()
    mockHandleConfirmNewPasswordChange = jest.fn()
    mockHandleConfirmCurrentPassword = jest.fn()
    mockHandleChangePassword = jest.fn()

    // Define the default state object here
    defaultMockState = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      error: null,
      message: null,
      isLoading: false,
      step: 'confirm', // Default to step 1
      handleCurrentPasswordChange: mockHandleCurrentPasswordChange,
      handleNewPasswordChange: mockHandleNewPasswordChange,
      handleConfirmNewPasswordChange: mockHandleConfirmNewPasswordChange,
      handleConfirmCurrentPassword: mockHandleConfirmCurrentPassword,
      handleChangePassword: mockHandleChangePassword
    }

    // Set default mock return value for the hook using the state object
    mockUseChangePassword.mockReturnValue(defaultMockState)
  })

  // Helper function to render the component
  const renderComponent = () => {
    render(<ChangePasswordForm userId={mockUserId} onClose={mockOnClose} />)
  }

  // --- Step 1: Confirm Current Password Tests ---

  it('should render Step 1 correctly initially', () => {
    renderComponent()

    // Use getByRole for the heading for consistency, though getByText might work here
    expect(
      screen.getByRole('heading', { name: 'Change_Password', level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Current_Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()

    // Ensure step 2 elements are not present
    expect(screen.queryByLabelText('New_Password')).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('Confirm_New_Password')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Change_Password' })
    ).not.toBeInTheDocument()
  })

  it('should call handleCurrentPasswordChange on current password input change', async () => {
    renderComponent()
    const input = screen.getByLabelText('Current_Password')
    await userEvent.type(input, 'oldPass')
    expect(mockHandleCurrentPasswordChange).toHaveBeenCalled()
  })

  it('should call onClose when Cancel button is clicked in Step 1', async () => {
    renderComponent()
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call handleConfirmCurrentPassword when Confirm button is clicked', async () => {
    renderComponent()
    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    await userEvent.click(confirmButton)
    expect(mockHandleConfirmCurrentPassword).toHaveBeenCalledTimes(1)
  })

  it('should disable buttons and show "Verifying" text when loading in Step 1', () => {
    // Override hook return value for this test using defaultMockState
    mockUseChangePassword.mockReturnValue({
      ...defaultMockState,
      isLoading: true,
      step: 'confirm' // Explicitly keep step as confirm if needed, though default has it
    })
    renderComponent()

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Verifying' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Confirm' })
    ).not.toBeInTheDocument()
  })

  it('should display error message in Step 1 if error exists', () => {
    const errorMessage = 'Invalid current password'
    mockUseChangePassword.mockReturnValue({
      ...defaultMockState,
      error: errorMessage,
      step: 'confirm'
    })
    renderComponent()

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  // --- Step 2: Change Password Tests ---

  it('should render Step 2 correctly when step is "change"', () => {
    // Override mock using the default state object
    mockUseChangePassword.mockReturnValue({
      ...defaultMockState,
      step: 'change' // Override only the 'step' property
    })
    renderComponent() // Render the component with the correct state

    // Use getByRole for the heading to be specific
    expect(
      screen.getByRole('heading', { name: 'Change_Password', level: 2 })
    ).toBeInTheDocument() // Check for the specific H2 title

    // Keep the checks for the inputs and buttons as they are specific enough
    expect(screen.getByLabelText('New_Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm_New_Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Change_Password' }) // This correctly targets the button
    ).toBeInTheDocument()

    // Ensure step 1 elements are not present
    expect(screen.queryByLabelText('Current_Password')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Confirm' })
    ).not.toBeInTheDocument()
  })

  it('should call appropriate handlers on input changes in Step 2', async () => {
    mockUseChangePassword.mockReturnValue({
      ...defaultMockState,
      step: 'change'
    })
    renderComponent()

    const newPasswordInput = screen.getByLabelText('New_Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm_New_Password')

    await userEvent.type(newPasswordInput, 'newPass')
    await userEvent.type(confirmPasswordInput, 'newPass')

    expect(mockHandleNewPasswordChange).toHaveBeenCalled()
    expect(mockHandleConfirmNewPasswordChange).toHaveBeenCalled()
  })

  it('should call onClose when Cancel button is clicked in Step 2', async () => {
    mockUseChangePassword.mockReturnValue({
      ...defaultMockState,
      step: 'change'
    })
    renderComponent()
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call handleChangePassword when Change Password button is clicked', async () => {
    mockUseChangePassword.mockReturnValue({
      ...defaultMockState,
      step: 'change'
    })
    renderComponent()
    const changeButton = screen.getByRole('button', { name: 'Change_Password' })
    await userEvent.click(changeButton)
    expect(mockHandleChangePassword).toHaveBeenCalledTimes(1)
  })

  it('should disable buttons and show "Changing" text when loading in Step 2', () => {
    mockUseChangePassword.mockReturnValue({
      ...defaultMockState,
      isLoading: true,
      step: 'change'
    })
    renderComponent()

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Changing' })).toBeDisabled() // Check text change and disabled state
    expect(
      screen.queryByRole('button', { name: 'Change_Password' })
    ).not.toBeInTheDocument() // Original text gone
  })

  it('should display error message in Step 2 if error exists', () => {
    const errorMessage = 'Passwords do not match'
    mockUseChangePassword.mockReturnValue({
      ...defaultMockState,
      error: errorMessage,
      step: 'change'
    })
    renderComponent()

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should display success message in Step 2 if message exists', () => {
    const successMessage = 'Password changed successfully'
    mockUseChangePassword.mockReturnValue({
      ...defaultMockState,
      message: successMessage,
      step: 'change',
      error: null // Explicitly set error to null if checking success
    })
    renderComponent()

    expect(screen.getByText(successMessage)).toBeInTheDocument()
    // Ensure error is not shown if message exists
    expect(
      screen.queryByText(/Invalid current password/i)
    ).not.toBeInTheDocument() // Example error check
    expect(
      screen.queryByText(/Passwords do not match/i)
    ).not.toBeInTheDocument() // Example error check
  })
})
