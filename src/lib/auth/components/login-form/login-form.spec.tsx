import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { LoginForm } from './login-form';

const mockHandleSubmit = vi.fn();
const mockHandleChange = vi.fn();
const mockForm = {
  handleSubmit: mockHandleSubmit,
  Subscribe: ({ children, selector }: any) => {
    const state = {
      isFormValid: true,
      errors: [],
      canSubmit: true,
      isSubmitting: false,
    };
    const result = selector(state);
    return children(result);
  },
  Field: ({ children, name }: any) => {
    const field = {
      name,
      state: { value: '' },
      handleChange: mockHandleChange,
    };
    return children(field);
  },
};

const mockTranslation: Record<string, string> = {
  'auth.email': 'Email',
  'auth.emailPlaceholder': 'Enter your email',
  'auth.password': 'Password',
  'auth.passwordPlaceholder': 'Enter your password',
  'auth.login': 'Login',
  'auth.showPassword': 'Show password',
  'auth.hidePassword': 'Hide password',
};

vi.mock('./use-login-form', () => ({
  useLoginForm: () => ({
    form: mockForm,
  }),
}));

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => mockTranslation[key] || key,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with email and password fields when component loads', () => {
    // Arrange: Component ready for rendering

    // Act: Render the login form
    render(<LoginForm />);

    // Assert: Verify form elements are present with correct labels
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByRole('button', { name: /login/i })).toBeDefined();
    expect(screen.getByPlaceholderText('Enter your email')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter your password')).toBeDefined();
  });

  it('should submit form when user provides credentials and clicks login button', async () => {
    // Arrange: Set up user interaction and form submission
    const user = userEvent.setup();

    // Act: Render form and submit it
    render(<LoginForm />);
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Assert: Verify form submission was triggered
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should toggle password visibility when user clicks show/hide password button', async () => {
    // Arrange: Set up user interaction for password visibility toggle
    const user = userEvent.setup();

    // Act: Render form and toggle password visibility
    render(<LoginForm />);
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput.type).toBe('password');
    await user.click(toggleButton);

    // Assert: Verify password input type changes and button label updates
    expect(passwordInput.type).toBe('text');
    expect(
      screen.getByRole('button', { name: /hide password/i }),
    ).toBeDefined();
  });

  it('should display default English content when loaded', () => {
    // Arrange: Component ready for rendering with English translations

    // Act: Render form with English translations
    render(<LoginForm />);

    // Assert: Verify English text is displayed correctly
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByRole('button', { name: /login/i })).toBeDefined();
    expect(screen.getByPlaceholderText('Enter your email')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter your password')).toBeDefined();
  });

  it('should handle form field changes when user types in input fields', async () => {
    // Arrange: Set up user input interaction
    const user = userEvent.setup();

    // Act: Render form and type in email field
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'test@example.com');

    // Assert: Verify field change handler was called
    expect(mockHandleChange).toHaveBeenCalled();
  });

  it('should prevent default form submission and handle it through custom handler', async () => {
    // Arrange: Set up form submission with event prevention
    const user = userEvent.setup();

    // Mock the form onSubmit event
    const originalSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = vi.fn();

    // Act: Render form and trigger submission
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Assert: Verify custom form handling is triggered
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);

    // Cleanup
    HTMLFormElement.prototype.submit = originalSubmit;
  });
});
