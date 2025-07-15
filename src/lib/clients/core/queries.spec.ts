import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';
import { useAddClient, useEditClient, useDeleteClient } from './queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { kyClient } from '@/shared/core/ky-client';
import { handleHttpError } from '@/shared/utils/http-error-handler';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

// Mock dependencies
vi.mock('@/shared/core/ky-client');
vi.mock('@/shared/utils/http-error-handler');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('@/lib/i18n');
vi.mock('uid/secure', () => ({
  uid: () => 'test-id',
}));

const mockKyClient = kyClient as unknown as {
  post: MockedFunction<any>;
  put: MockedFunction<any>;
  delete: MockedFunction<any>;
};

const mockHandleHttpError = handleHttpError as MockedFunction<any>;
const mockToast = toast as unknown as {
  success: MockedFunction<any>;
  error: MockedFunction<any>;
};
const mockUseI18n = useI18n as MockedFunction<any>;

describe('Client Mutations', () => {
  const mockT = vi.fn((key: string) => key);

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
    mockUseI18n.mockReturnValue({ t: mockT });
  });

  describe('useAddClient', () => {
    const validPayload = {
      name: 'Test Client',
      email: 'test@example.com',
      phone: '1234567890',
      company: 'Test Company',
      age: 30,
      gender: 'male' as const,
      subscriptionCost: 100,
      currency: 'USD',
    };

    it('should handle 400 Bad Request error', async () => {
      // Arrange
      const mockResponse = new Response(JSON.stringify({ message: 'Invalid client data' }), {
        status: 400,
        statusText: 'Bad Request',
      });
      const httpError = new HTTPError(mockResponse, {} as any, {} as any);

      mockKyClient.post.mockReturnValue({
        json: vi.fn().mockRejectedValue(httpError),
      });

      mockHandleHttpError.mockResolvedValue({
        message: 'Invalid request. Please check your input and try again.',
        statusCode: 400,
      });

      // Act
      const { result } = renderHook(() => useAddClient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(validPayload);

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockHandleHttpError).toHaveBeenCalledWith(httpError, mockT);
      expect(mockToast.error).toHaveBeenCalledWith('Invalid request. Please check your input and try again.');
    });

    it('should handle 500 Server error', async () => {
      // Arrange
      const mockResponse = new Response('{}', {
        status: 500,
        statusText: 'Internal Server Error',
      });
      const httpError = new HTTPError(mockResponse, {} as any, {} as any);

      mockKyClient.post.mockReturnValue({
        json: vi.fn().mockRejectedValue(httpError),
      });

      mockHandleHttpError.mockResolvedValue({
        message: 'Something went wrong on our end. Please try again later.',
        statusCode: 500,
      });

      // Act
      const { result } = renderHook(() => useAddClient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(validPayload);

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockHandleHttpError).toHaveBeenCalledWith(httpError, mockT);
      expect(mockToast.error).toHaveBeenCalledWith('Something went wrong on our end. Please try again later.');
    });

    it('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('Network error');

      mockKyClient.post.mockReturnValue({
        json: vi.fn().mockRejectedValue(networkError),
      });

      mockHandleHttpError.mockResolvedValue({
        message: 'An unexpected error occurred. Please try again.',
      });

      // Act
      const { result } = renderHook(() => useAddClient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(validPayload);

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockHandleHttpError).toHaveBeenCalledWith(networkError, mockT);
      expect(mockToast.error).toHaveBeenCalledWith('An unexpected error occurred. Please try again.');
    });
  });

  describe('useEditClient', () => {
    const validClient = {
      id: 'existing-id',
      name: 'Test Client',
      email: 'test@example.com',
      phone: '1234567890',
      company: 'Test Company',
      age: 30,
      gender: 'male' as const,
      subscriptionCost: 100,
      currency: 'USD',
      picture: 'https://example.com/pic.jpg',
      registered: '2024-01-01',
    };

    it('should handle 404 Not Found error', async () => {
      // Arrange
      const mockResponse = new Response('{}', {
        status: 404,
        statusText: 'Not Found',
      });
      const httpError = new HTTPError(mockResponse, {} as any, {} as any);

      mockKyClient.put.mockReturnValue({
        json: vi.fn().mockRejectedValue(httpError),
      });

      mockHandleHttpError.mockResolvedValue({
        message: 'The requested resource could not be found.',
        statusCode: 404,
      });

      // Act
      const { result } = renderHook(() => useEditClient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(validClient);

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockHandleHttpError).toHaveBeenCalledWith(httpError, mockT);
      expect(mockToast.error).toHaveBeenCalledWith('The requested resource could not be found.');
    });

    it('should handle 403 Forbidden error', async () => {
      // Arrange
      const mockResponse = new Response('{}', {
        status: 403,
        statusText: 'Forbidden',
      });
      const httpError = new HTTPError(mockResponse, {} as any, {} as any);

      mockKyClient.put.mockReturnValue({
        json: vi.fn().mockRejectedValue(httpError),
      });

      mockHandleHttpError.mockResolvedValue({
        message: 'Access denied. You don\'t have permission to access this resource.',
        statusCode: 403,
      });

      // Act
      const { result } = renderHook(() => useEditClient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(validClient);

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockHandleHttpError).toHaveBeenCalledWith(httpError, mockT);
      expect(mockToast.error).toHaveBeenCalledWith('Access denied. You don\'t have permission to access this resource.');
    });
  });

  describe('useDeleteClient', () => {
    it('should handle 404 Not Found error', async () => {
      // Arrange
      const mockResponse = new Response('{}', {
        status: 404,
        statusText: 'Not Found',
      });
      const httpError = new HTTPError(mockResponse, {} as any, {} as any);

      mockKyClient.delete.mockRejectedValue(httpError);

      mockHandleHttpError.mockResolvedValue({
        message: 'The requested resource could not be found.',
        statusCode: 404,
      });

      // Act
      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('non-existent-id');

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockHandleHttpError).toHaveBeenCalledWith(httpError, mockT);
      expect(mockToast.error).toHaveBeenCalledWith('The requested resource could not be found.');
    });

    it('should handle 429 Too Many Requests error', async () => {
      // Arrange
      const mockResponse = new Response('{}', {
        status: 429,
        statusText: 'Too Many Requests',
      });
      const httpError = new HTTPError(mockResponse, {} as any, {} as any);

      mockKyClient.delete.mockRejectedValue(httpError);

      mockHandleHttpError.mockResolvedValue({
        message: 'Too many requests. Please try again later.',
        statusCode: 429,
      });

      // Act
      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('test-id');

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockHandleHttpError).toHaveBeenCalledWith(httpError, mockT);
      expect(mockToast.error).toHaveBeenCalledWith('Too many requests. Please try again later.');
    });

    it('should handle successful deletion', async () => {
      // Arrange
      mockKyClient.delete.mockResolvedValue(undefined);

      // Act
      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('test-id');

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockHandleHttpError).not.toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('clients.toasts.deleteSuccess');
    });
  });
});