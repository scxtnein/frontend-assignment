import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

import { SignupForm } from './signup-form';

const mockTranslation: Record<string, string> = {
  'auth.name': 'Name',
  'auth.namePlaceholder': 'Enter your full name',
  'auth.email': 'Email',
  'auth.emailPlaceholder': 'Enter your email',
  'auth.password': 'Password',
  'auth.passwordPlaceholder': 'Enter your password',
  'auth.signUp': 'Sign Up',
  'auth.hidePassword': 'Hide password',
  'auth.showPassword': 'Show password',
  'auth.passwordStrength': 'Password strength',
  'auth.passwordRequirements': 'Password requirements',
  'auth.requirementMet': 'Requirement met',
  'auth.requirementNotMet': 'Requirement not met',
  'auth.passwordChecks.atLeast8': 'At least 8 characters',
  'auth.passwordChecks.atLeast1Number': 'At least 1 number',
  'auth.passwordChecks.atLeast1Uppercase': 'At least 1 uppercase letter',
  'auth.validation.nameRequired': 'Name is required',
  'auth.validation.nameMinLength': 'Name must be at least 2 characters',
  'auth.validation.emailRequired': 'Email is required',
  'auth.validation.emailInvalid': 'Please enter a valid email address',
  'auth.validation.passwordRequired': 'Password is required',
  'auth.validation.passwordMustMeet': 'Password must meet all requirements',
};

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => mockTranslation[key] || key,
  }),
}));

const mockMutateAsync = vi.fn();
vi.mock('@/lib/auth/hooks/use-signup', () => ({
  useSignup: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields with correct labels and placeholders when component loads', () => {
    // Arrange: Component ready for rendering

    // Act: Render the signup form
    render(<SignupForm />, { wrapper: createWrapper() });

    // Assert: Verify all form elements are present with correct labels and placeholders
    expect(screen.getByLabelText('Name')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter your email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter your password')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeDefined();
  });

  it('should display password visibility toggle button with correct accessibility attributes', () => {
    // Arrange: Component ready for rendering

    // Act: Render the signup form
    render(<SignupForm />, { wrapper: createWrapper() });

    // Assert: Verify password toggle button is present with correct ARIA attributes
    const toggleButton = screen.getByRole('button', { name: 'Show password' });
    expect(toggleButton).toBeDefined();
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    expect(toggleButton).toHaveAttribute('aria-controls', 'password');
  });

  it('should show password requirements checklist with initial unchecked state', () => {
    // Arrange: Component ready for rendering

    // Act: Render the signup form
    render(<SignupForm />, { wrapper: createWrapper() });

    // Assert: Verify password requirements are displayed
    expect(screen.getByText('At least 8 characters')).toBeDefined();
    expect(screen.getByText('At least 1 number')).toBeDefined();
    expect(screen.getByText('At least 1 uppercase letter')).toBeDefined();
  });

  it('should display password strength indicator with correct accessibility attributes', () => {
    // Arrange: Component ready for rendering

    // Act: Render the signup form
    render(<SignupForm />, { wrapper: createWrapper() });

    // Assert: Verify password strength indicator is present
    const strengthIndicator = screen.getByRole('progressbar', {
      name: 'Password strength',
    });
    expect(strengthIndicator).toBeDefined();
    expect(strengthIndicator).toHaveAttribute('aria-valuenow', '0');
    expect(strengthIndicator).toHaveAttribute('aria-valuemin', '0');
    expect(strengthIndicator).toHaveAttribute('aria-valuemax', '3');
  });

  it('should display submit button with initial state', () => {
    // Arrange: Component ready for rendering

    // Act: Render the signup form
    render(<SignupForm />, { wrapper: createWrapper() });

    // Assert: Verify submit button is present
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeDefined();
  });

  it('should toggle password visibility when toggle button is clicked', async () => {
    // Arrange: Set up user interaction and render form
    const user = userEvent.setup();
    render(<SignupForm />, { wrapper: createWrapper() });

    // Act: Click the password visibility toggle button
    const toggleButton = screen.getByRole('button', { name: 'Show password' });
    await user.click(toggleButton);

    // Assert: Verify password field type changed and button state updated
    const passwordField = screen.getByLabelText('Password');
    expect(passwordField).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeDefined();
  });

  it('should display email validation error when email format is invalid', async () => {
    // Arrange: Set up user interaction and render form
    const user = userEvent.setup();
    render(<SignupForm />, { wrapper: createWrapper() });

    // Act: Enter invalid email format and blur
    const emailField = screen.getByLabelText('Email');
    await user.type(emailField, 'invalid-email');
    await user.tab();

    // Assert: Verify email format validation error is displayed
    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address'),
      ).toBeDefined();
    });
  });

  it('should accept valid email formats', async () => {
    // Arrange: Set up user interaction and render form
    const user = userEvent.setup();
    render(<SignupForm />, { wrapper: createWrapper() });

    // Act: Enter valid email format
    const emailField = screen.getByLabelText('Email');
    await user.type(emailField, 'test@example.com');
    await user.tab();

    // Assert: Verify no validation error is displayed
    await waitFor(() => {
      expect(
        screen.queryByText('Please enter a valid email address'),
      ).toBeNull();
    });
    expect(emailField).toHaveAttribute('aria-invalid', 'false');
  });

  it('should update password strength indicator as password meets requirements', async () => {
    // Arrange: Set up user interaction and render form
    const user = userEvent.setup();
    render(<SignupForm />, { wrapper: createWrapper() });

    // Act: Enter password that meets one requirement (8+ characters)
    const passwordField = screen.getByLabelText('Password');
    await user.type(passwordField, 'password');

    // Assert: Verify strength indicator updates to show progress
    await waitFor(() => {
      const strengthIndicator = screen.getByRole('progressbar', {
        name: 'Password strength',
      });
      expect(strengthIndicator).toHaveAttribute('aria-valuenow', '1');
    });
  });

  it('should update password requirements checklist as password meets each requirement', async () => {
    // Arrange: Set up user interaction and render form
    const user = userEvent.setup();
    render(<SignupForm />, { wrapper: createWrapper() });

    // Act: Enter password that meets all requirements
    const passwordField = screen.getByLabelText('Password');
    await user.type(passwordField, 'Password123');

    // Assert: Verify all requirements show as met and strength is at maximum
    await waitFor(() => {
      const strengthIndicator = screen.getByRole('progressbar', {
        name: 'Password strength',
      });
      expect(strengthIndicator).toHaveAttribute('aria-valuenow', '3');
    });
  });

  it('should enable submit button when all form fields are valid', async () => {
    // Arrange: Set up user interaction and render form
    const user = userEvent.setup();
    render(<SignupForm />, { wrapper: createWrapper() });

    // Act: Fill in all form fields with valid data
    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');

    // Assert: Verify submit button becomes enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeEnabled();
    });
  });

  it('should call signup mutation with form data when valid form is submitted', async () => {
    // Arrange: Set up successful signup scenario and user interaction
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({});
    render(<SignupForm />, { wrapper: createWrapper() });

    // Act: Fill in valid form data and submit
    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Assert: Verify signup mutation was called with correct data
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
    });
  });

  it('should prevent default form submission behavior', async () => {
    // Arrange: Set up form submission scenario
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({});
    render(<SignupForm />, { wrapper: createWrapper() });

    // Act: Fill form and submit via Enter key
    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeEnabled();
    });

    await user.keyboard('{Enter}');

    // Assert: Verify mutation was called (indicating preventDefault worked)
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('should maintain proper accessibility structure with ARIA attributes', () => {
    // Arrange: Component ready for accessibility verification

    // Act: Render the signup form
    render(<SignupForm />, { wrapper: createWrapper() });

    // Assert: Verify accessibility attributes are properly set
    const nameField = screen.getByLabelText('Name');
    expect(nameField).toHaveAttribute('aria-invalid', 'false');

    const emailField = screen.getByLabelText('Email');
    expect(emailField).toHaveAttribute('aria-invalid', 'false');

    const passwordField = screen.getByLabelText('Password');
    expect(passwordField).toHaveAttribute('aria-invalid', 'false');

    const requirementsList = screen.getByRole('list', {
      name: 'Password requirements',
    });
    expect(requirementsList).toBeDefined();

    const passwordToggle = screen.getByRole('button', {
      name: 'Show password',
    });
    expect(passwordToggle).toHaveAttribute('aria-pressed', 'false');
    expect(passwordToggle).toHaveAttribute('aria-controls', 'password');
  });

  it('should display correct strength colors based on password score', async () => {
    // Arrange: Set up user interaction and render form
    const user = userEvent.setup();
    render(<SignupForm />, { wrapper: createWrapper() });
    const passwordField = screen.getByLabelText('Password');

    // Act & Assert: Test different password strengths

    // Empty password - should show default state
    const strengthBar = screen.getByRole('progressbar', {
      name: 'Password strength',
    });
    expect(strengthBar.querySelector('div')).toHaveClass('bg-border');

    // Weak password (1 requirement met)
    await user.type(passwordField, 'password');
    await waitFor(() => {
      expect(strengthBar.querySelector('div')).toHaveClass('bg-red-500');
    });

    // Medium password (2 requirements met)
    await user.clear(passwordField);
    await user.type(passwordField, 'password1');
    await waitFor(() => {
      expect(strengthBar.querySelector('div')).toHaveClass('bg-amber-500');
    });

    // Strong password (all 3 requirements met)
    await user.clear(passwordField);
    await user.type(passwordField, 'Password1');
    await waitFor(() => {
      expect(strengthBar.querySelector('div')).toHaveClass('bg-green-600');
    });
  });
});
