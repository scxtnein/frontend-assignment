import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useLogin } from './use-login';
import { kyClient } from '@/shared/core/ky-client';
import { useAuthProvider } from '@/lib/auth/hooks/use-auth-provider';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock all dependencies
vi.mock('@/shared/core/ky-client');
vi.mock('@/lib/auth/hooks/use-auth-provider');
vi.mock('@tanstack/react-router');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('@/lib/i18n');

const mockKyClient = kyClient as unknown as {
  get: MockedFunction<any>;
};

const mockUseAuthProvider = useAuthProvider as MockedFunction<any>;
const mockUseNavigate = useNavigate as MockedFunction<any>;
const mockToast = toast as unknown as {
  success: MockedFunction<any>;
  error: MockedFunction<any>;
};
const mockUseI18n = useI18n as MockedFunction<any>;

describe('useLogin', () => {
  const mockSetIsLoading = vi.fn();
  const mockSetUser = vi.fn();
  const mockNavigate = vi.fn();
  const mockT = vi.fn();

  const validUser = {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

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

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuthProvider.mockReturnValue({
      setIsLoading: mockSetIsLoading,
      setUser: mockSetUser,
    });

    mockUseNavigate.mockReturnValue(mockNavigate);

    mockUseI18n.mockReturnValue({
      t: mockT,
    });

    mockT.mockImplementation((key: string, options?: { error?: string }) => {
      const translations: Record<string, string> = {
        'auth.toasts.loginSuccess': 'Login successful',
        'auth.toasts.loginError': `Login failed: ${options?.error || 'Unknown error'}`,
      };
      return translations[key] || key;
    });
  });

  it('should successfully authenticate user when valid credentials are provided', async () => {
    // Arrange: Set up successful authentication scenario
    const loginPayload = { email: 'test@example.com', password: 'password123' };
    const mockResponse = [validUser];

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    // Act: Execute login mutation
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(loginPayload);

    // Assert: Verify successful authentication flow
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockKyClient.get).toHaveBeenCalledWith(
      'users?email=test%40example.com',
    );
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockSetUser).toHaveBeenCalledWith(validUser);
    expect(mockToast.success).toHaveBeenCalledWith('Login successful');
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should handle authentication failure when invalid credentials are provided', async () => {
    // Arrange: Set up authentication failure scenario with wrong password
    const loginPayload = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };
    const mockResponse = [validUser]; // User exists but password won't match

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    // Act: Attempt authentication with invalid credentials
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(loginPayload);

    // Assert: Verify authentication failure handling
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Invalid email or password');
    expect(mockToast.error).toHaveBeenCalledWith(
      'Login failed: Invalid email or password',
    );
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should handle server response validation errors gracefully', async () => {
    // Arrange: Set up invalid server response scenario
    const loginPayload = { email: 'test@example.com', password: 'password123' };
    const invalidResponse = { invalid: 'data' }; // Response that fails schema validation

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(invalidResponse),
    });

    // Act: Attempt authentication with invalid server response
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(loginPayload);

    // Assert: Verify validation error handling
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Invalid response from server');
    expect(mockToast.error).toHaveBeenCalledWith(
      'Login failed: Invalid response from server',
    );
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should handle network failures during authentication request', async () => {
    // Arrange: Set up network failure scenario
    const loginPayload = { email: 'test@example.com', password: 'password123' };
    const networkError = new Error('Network request failed');

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockRejectedValue(networkError),
    });

    // Act: Attempt authentication during network failure
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(loginPayload);

    // Assert: Verify network error handling
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network request failed');
    expect(mockToast.error).toHaveBeenCalledWith(
      'Login failed: Network request failed',
    );
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should handle authentication when user email does not exist', async () => {
    // Arrange: Set up scenario where user email is not found
    const loginPayload = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };
    const mockResponse: any[] = []; // Empty array - no users found

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    // Act: Attempt authentication with non-existent email
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(loginPayload);

    // Assert: Verify handling of non-existent user
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Invalid email or password');
    expect(mockToast.error).toHaveBeenCalledWith(
      'Login failed: Invalid email or password',
    );
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should properly encode email addresses with special characters in API request', async () => {
    // Arrange: Set up authentication with email containing special characters
    const loginPayload = {
      email: 'test+user@example.com',
      password: 'password123',
    };
    const userWithSpecialEmail = {
      ...validUser,
      email: 'test+user@example.com',
    };
    const mockResponse = [userWithSpecialEmail];

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    // Act: Execute authentication with special character email
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(loginPayload);

    // Assert: Verify proper URL encoding of email parameter
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockKyClient.get).toHaveBeenCalledWith(
      'users?email=test%2Buser%40example.com',
    );
    expect(mockSetUser).toHaveBeenCalledWith(userWithSpecialEmail);
  });
});
