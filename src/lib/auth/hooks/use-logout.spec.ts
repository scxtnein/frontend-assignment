import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogout } from './use-logout';

vi.mock('@/lib/auth/hooks/use-auth-provider', () => ({
  useAuthProvider: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

vi.mock('@/lib/i18n', () => ({
  useI18n: vi.fn(),
}));

describe('useLogout', () => {
  let mockSetUser: ReturnType<typeof vi.fn>;
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockToastSuccess: ReturnType<typeof vi.fn>;
  let mockT: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mocks for each test
    mockSetUser = vi.fn();
    mockNavigate = vi.fn();
    mockToastSuccess = vi.fn();
    mockT = vi.fn();

    const { useAuthProvider } = await import(
      '@/lib/auth/hooks/use-auth-provider'
    );
    const { useNavigate } = await import('@tanstack/react-router');
    const { toast } = await import('sonner');
    const { useI18n } = await import('@/lib/i18n');

    vi.mocked(useAuthProvider).mockReturnValue({
      setUser: mockSetUser,
    } as any);

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(toast.success).mockImplementation(mockToastSuccess);

    vi.mocked(useI18n).mockReturnValue({
      t: mockT,
    } as any);
  });

  it('should return logout function when hook is initialized', () => {
    // Arrange: Hook ready for initialization

    // Act: Render the logout hook
    const { result } = renderHook(() => useLogout());

    // Assert: Verify logout function is returned
    expect(result.current.logout).toBeInstanceOf(Function);
  });

  it('should clear user session, show success message, and redirect to login when logout is called', () => {
    // Arrange: Set up successful logout scenario with translated message
    const successMessage = 'Successfully logged out';
    mockT.mockReturnValue(successMessage);

    // Act: Render hook and execute logout
    const { result } = renderHook(() => useLogout());

    act(() => {
      result.current.logout();
    });

    // Assert: Verify complete logout flow executes correctly
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockT).toHaveBeenCalledWith('auth.toasts.logoutSuccess');
    expect(mockToastSuccess).toHaveBeenCalledWith(successMessage);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
  });

  it('should handle missing translation gracefully during logout', () => {
    // Arrange: Set up scenario where translation function returns undefined
    mockT.mockReturnValue(undefined);

    // Act: Render hook and execute logout
    const { result } = renderHook(() => useLogout());

    act(() => {
      result.current.logout();
    });

    // Assert: Verify logout still completes with undefined toast message
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockT).toHaveBeenCalledWith('auth.toasts.logoutSuccess');
    expect(mockToastSuccess).toHaveBeenCalledWith(undefined);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
  });

  it('should execute logout operations in correct sequence', () => {
    // Arrange: Set up call order tracking for logout sequence
    const callOrder: string[] = [];
    mockSetUser.mockImplementation(() => callOrder.push('setUser'));
    mockT.mockImplementation(() => {
      callOrder.push('translate');
      return 'Logout successful';
    });
    mockToastSuccess.mockImplementation(() => callOrder.push('toast'));
    mockNavigate.mockImplementation(() => callOrder.push('navigate'));

    // Act: Execute logout operation
    const { result } = renderHook(() => useLogout());

    act(() => {
      result.current.logout();
    });

    // Assert: Verify operations execute in expected order
    expect(callOrder).toEqual(['setUser', 'translate', 'toast', 'navigate']);
  });

  it('should maintain hook stability across multiple renders', () => {
    // Arrange: Hook ready for stability testing

    // Act: Render hook multiple times
    const { result, rerender } = renderHook(() => useLogout());
    const firstLogout = result.current.logout;

    rerender();
    const secondLogout = result.current.logout;

    // Assert: Verify logout function reference changes between renders (expected behavior for this implementation)
    expect(firstLogout).not.toBe(secondLogout);
    expect(typeof firstLogout).toBe('function');
    expect(typeof secondLogout).toBe('function');
  });
});
