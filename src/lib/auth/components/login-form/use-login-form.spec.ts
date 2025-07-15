import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoginForm } from './use-login-form';

const mockMutateAsync = vi.fn();
let mockOnSubmit: Mock;
const mockForm = {
  options: {
    defaultValues: {
      email: '',
      password: '',
    },
  },
  handleSubmit: vi.fn(),
};

vi.mock('@/lib/auth/hooks/use-login', () => ({
  useLogin: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

vi.mock('@tanstack/react-form', () => ({
  useForm: (options: any) => {
    mockOnSubmit = options.onSubmit;
    return mockForm;
  },
}));

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize form with empty email and password values', () => {
    // Arrange: Hook ready for initialization

    // Act: Render the hook
    const { result } = renderHook(() => useLoginForm());

    // Assert: Verify form is initialized with correct default values
    expect(result.current.form).toBe(mockForm);
    expect(result.current.form.options.defaultValues).toEqual({
      email: '',
      password: '',
    });
  });

  it('should call login mutation when form is submitted with valid credentials', async () => {
    // Arrange: Set up successful login scenario
    const email = 'test@example.com';
    const password = 'password123';
    mockMutateAsync.mockResolvedValue({ success: true });

    // Act: Render hook and trigger form submission
    renderHook(() => useLoginForm());

    await act(async () => {
      await mockOnSubmit({
        value: { email, password },
        formApi: {
          setErrorMap: vi.fn(),
        },
      });
    });

    // Assert: Verify login mutation was called with correct credentials
    expect(mockMutateAsync).toHaveBeenCalledWith({ email, password });
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });

  it('should set form error when login mutation fails with invalid credentials', async () => {
    // Arrange: Set up failed login scenario
    const email = 'invalid@example.com';
    const password = 'wrongpassword';
    const mockSetErrorMap = vi.fn();
    mockMutateAsync.mockRejectedValue(new Error('Invalid credentials'));

    // Act: Render hook and trigger form submission with invalid credentials
    renderHook(() => useLoginForm());

    await act(async () => {
      await mockOnSubmit({
        value: { email, password },
        formApi: {
          setErrorMap: mockSetErrorMap,
        },
      });
    });

    // Assert: Verify error is set on form when login fails
    expect(mockMutateAsync).toHaveBeenCalledWith({ email, password });
    expect(mockSetErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'Invalid email or password',
        fields: {},
      },
    });
  });

  it('should handle network errors gracefully during form submission', async () => {
    // Arrange: Set up network error scenario
    const email = 'test@example.com';
    const password = 'password123';
    const mockSetErrorMap = vi.fn();
    mockMutateAsync.mockRejectedValue(new Error('Network error'));

    // Act: Render hook and trigger form submission during network failure
    renderHook(() => useLoginForm());

    await act(async () => {
      await mockOnSubmit({
        value: { email, password },
        formApi: {
          setErrorMap: mockSetErrorMap,
        },
      });
    });

    // Assert: Verify generic error message is displayed for any failure
    expect(mockSetErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'Invalid email or password',
        fields: {},
      },
    });
  });

  it('should provide form instance from @tanstack/react-form', () => {
    // Arrange: Hook ready for form instance verification

    // Act: Render the hook
    const { result } = renderHook(() => useLoginForm());

    // Assert: Verify form instance is returned
    expect(result.current.form).toBeDefined();
    expect(result.current.form).toBe(mockForm);
  });
});
