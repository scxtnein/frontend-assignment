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
import { useSignup } from './use-signup';
import { kyClient } from '@/shared/core/ky-client';
import { useAuthProvider } from '@/lib/auth/hooks/use-auth-provider';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorAlreadyExists } from '@/lib/auth/core/errors';

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
vi.mock('uid', () => ({
  uid: vi.fn(),
}));

const mockKyClient = kyClient as unknown as {
  get: MockedFunction<any>;
  post: MockedFunction<any>;
};

const mockUseAuthProvider = useAuthProvider as MockedFunction<any>;
const mockUseNavigate = useNavigate as MockedFunction<any>;
const mockToast = toast as unknown as {
  success: MockedFunction<any>;
  error: MockedFunction<any>;
};
const mockUseI18n = useI18n as MockedFunction<any>;

describe('useSignup', () => {
  const mockSetIsLoading = vi.fn();
  const mockSetUser = vi.fn();
  const mockNavigate = vi.fn();
  const mockT = vi.fn();

  const signupPayload = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  const expectedUser = {
    id: 'abc123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
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

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock console.log to suppress debug output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});

    mockUseAuthProvider.mockReturnValue({
      setIsLoading: mockSetIsLoading,
      setUser: mockSetUser,
    });

    mockUseNavigate.mockReturnValue(mockNavigate);

    mockUseI18n.mockReturnValue({
      t: mockT,
    });

    mockT.mockImplementation(
      (key: string, options?: { userName?: string; error?: string }) => {
        const translations: Record<string, string> = {
          'auth.toasts.signupSuccess': `Welcome ${options?.userName || 'User'}!`,
          'auth.toasts.signupError': `Signup failed: ${options?.error || 'Unknown error'}`,
        };
        return translations[key] || key;
      },
    );

    // Mock uid function
    const { uid } = await import('uid');
    vi.mocked(uid).mockReturnValue('abc123');
  });

  it('should successfully create new user account when email is not already taken', async () => {
    // Arrange: Set up successful signup scenario with available email
    const emptyUsersResponse: any[] = []; // No existing users with this email

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(emptyUsersResponse),
    });

    mockKyClient.post.mockReturnValue({
      json: vi.fn().mockResolvedValue(expectedUser),
    });

    // Act: Execute signup mutation
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(signupPayload);

    // Assert: Verify successful signup flow
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockKyClient.get).toHaveBeenCalledWith(
      'users?email=john%40example.com',
    );
    expect(mockKyClient.post).toHaveBeenCalledWith('users', {
      json: {
        id: 'abc123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      },
    });
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockSetUser).toHaveBeenCalledWith(expectedUser);
    expect(mockToast.success).toHaveBeenCalledWith('Welcome John Doe!');
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should prevent signup when email already exists in the system', async () => {
    // Arrange: Set up scenario where email already exists
    const existingUsersResponse = [
      {
        id: 'existing-id',
        email: 'john@example.com',
        name: 'Existing User',
        password: 'oldpass',
      },
    ];

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(existingUsersResponse),
    });

    // Act: Attempt signup with existing email
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(signupPayload);

    // Assert: Verify email conflict is handled appropriately
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(ErrorAlreadyExists);
    expect(mockKyClient.post).not.toHaveBeenCalled();
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalled();
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should handle server response validation errors gracefully during email check', async () => {
    // Arrange: Set up invalid server response scenario during email verification
    const invalidResponse = { invalid: 'data' }; // Response that fails schema validation

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(invalidResponse),
    });

    // Act: Attempt signup with invalid server response
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(signupPayload);

    // Assert: Verify validation error handling
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Invalid response from server');
    expect(mockToast.error).toHaveBeenCalledWith(
      'Signup failed: Invalid response from server',
    );
    expect(mockKyClient.post).not.toHaveBeenCalled();
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should handle network failures during email availability check', async () => {
    // Arrange: Set up network failure scenario during email check
    const networkError = new Error('Network request failed');

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockRejectedValue(networkError),
    });

    // Act: Attempt signup during network failure
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(signupPayload);

    // Assert: Verify network error handling
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network request failed');
    expect(mockToast.error).toHaveBeenCalledWith(
      'Signup failed: Network request failed',
    );
    expect(mockKyClient.post).not.toHaveBeenCalled();
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should handle user creation failures after successful email verification', async () => {
    // Arrange: Set up scenario where email check succeeds but user creation fails
    const emptyUsersResponse: any[] = [];
    const creationError = new Error('User creation failed');

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(emptyUsersResponse),
    });

    mockKyClient.post.mockReturnValue({
      json: vi.fn().mockRejectedValue(creationError),
    });

    // Act: Attempt signup with user creation failure
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(signupPayload);

    // Assert: Verify user creation error handling
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('User creation failed');
    expect(mockToast.error).toHaveBeenCalledWith(
      'Signup failed: User creation failed',
    );
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should properly encode email addresses with special characters in API requests', async () => {
    // Arrange: Set up signup with email containing special characters
    const specialEmailPayload = {
      ...signupPayload,
      email: 'test+user@example.com',
    };
    const emptyUsersResponse: any[] = [];
    const userWithSpecialEmail = {
      ...expectedUser,
      email: 'test+user@example.com',
    };

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(emptyUsersResponse),
    });

    mockKyClient.post.mockReturnValue({
      json: vi.fn().mockResolvedValue(userWithSpecialEmail),
    });

    // Act: Execute signup with special character email
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(specialEmailPayload);

    // Assert: Verify proper URL encoding of email parameter
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockKyClient.get).toHaveBeenCalledWith(
      'users?email=test%2Buser%40example.com',
    );
    expect(mockSetUser).toHaveBeenCalledWith(userWithSpecialEmail);
  });

  it('should generate unique user IDs for each signup attempt', async () => {
    // Arrange: Set up successful signup scenario with ID generation tracking
    const emptyUsersResponse: any[] = [];

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(emptyUsersResponse),
    });

    mockKyClient.post.mockReturnValue({
      json: vi.fn().mockResolvedValue(expectedUser),
    });

    // Act: Execute signup mutation
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(signupPayload);

    // Assert: Verify unique ID generation is called
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const { uid } = await import('uid');
    expect(vi.mocked(uid)).toHaveBeenCalledWith(6);
    expect(mockKyClient.post).toHaveBeenCalledWith('users', {
      json: expect.objectContaining({
        id: 'abc123',
      }),
    });
  });

  it('should handle invalid user creation response with schema validation error', async () => {
    // Arrange: Set up scenario where user creation returns invalid data
    const emptyUsersResponse: any[] = [];
    const invalidUserResponse = { invalid: 'user data' }; // Response that fails user schema validation

    mockKyClient.get.mockReturnValue({
      json: vi.fn().mockResolvedValue(emptyUsersResponse),
    });

    mockKyClient.post.mockReturnValue({
      json: vi.fn().mockResolvedValue(invalidUserResponse),
    });

    // Act: Attempt signup with invalid user creation response
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(signupPayload);

    // Assert: Verify user schema validation error handling
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(mockToast.error).toHaveBeenCalled();
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });
});
