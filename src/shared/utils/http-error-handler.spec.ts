import { describe, it, expect, vi } from 'vitest';
import { HTTPError } from 'ky';
import { handleHttpError, handleAuthError } from './http-error-handler';

describe('handleHttpError', () => {
  const mockT = vi.fn((key: string) => key) as any;

  it('should handle 400 Bad Request error', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'Bad request data' }), {
      status: 400,
      statusText: 'Bad Request',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'Bad request data',
      code: undefined,
      statusCode: 400,
    });
  });

  it('should use default message for 400 when no message in response', async () => {
    const mockResponse = new Response('{}', {
      status: 400,
      statusText: 'Bad Request',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'errors.http.badRequest',
      code: undefined,
      statusCode: 400,
    });
    expect(mockT).toHaveBeenCalledWith('errors.http.badRequest');
  });

  it('should handle 401 Unauthorized error', async () => {
    const mockResponse = new Response('{}', {
      status: 401,
      statusText: 'Unauthorized',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'errors.http.unauthorized',
      code: undefined,
      statusCode: 401,
    });
  });

  it('should handle 403 Forbidden error', async () => {
    const mockResponse = new Response('{}', {
      status: 403,
      statusText: 'Forbidden',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'errors.http.forbidden',
      code: undefined,
      statusCode: 403,
    });
  });

  it('should handle 404 Not Found error', async () => {
    const mockResponse = new Response('{}', {
      status: 404,
      statusText: 'Not Found',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'errors.http.notFound',
      code: undefined,
      statusCode: 404,
    });
  });

  it('should handle 422 Validation error', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'Validation failed' }), {
      status: 422,
      statusText: 'Unprocessable Entity',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'Validation failed',
      code: undefined,
      statusCode: 422,
    });
  });

  it('should handle 429 Too Many Requests error', async () => {
    const mockResponse = new Response('{}', {
      status: 429,
      statusText: 'Too Many Requests',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'errors.http.tooManyRequests',
      code: undefined,
      statusCode: 429,
    });
  });

  it('should handle 500 Server error', async () => {
    const mockResponse = new Response('{}', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'errors.http.serverError',
      code: undefined,
      statusCode: 500,
    });
  });

  it('should handle error with code in response', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'Error', code: 'ERR_001' }), {
      status: 400,
      statusText: 'Bad Request',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'Error',
      code: 'ERR_001',
      statusCode: 400,
    });
  });

  it('should handle regular Error instances', async () => {
    const error = new Error('Something went wrong');

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'Something went wrong',
    });
  });

  it('should handle unknown errors', async () => {
    const error = 'Unknown error type';

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'errors.http.genericError',
    });
  });

  it('should handle malformed JSON in error response', async () => {
    const mockResponse = new Response('Invalid JSON', {
      status: 400,
      statusText: 'Bad Request',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleHttpError(error, mockT);

    expect(result).toEqual({
      message: 'errors.http.badRequest',
      code: undefined,
      statusCode: 400,
    });
  });
});

describe('handleAuthError', () => {
  const mockT = vi.fn((key: string) => key) as any;

  it('should return invalid credentials message for 404 error', async () => {
    const mockResponse = new Response('{}', {
      status: 404,
      statusText: 'Not Found',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleAuthError(error, mockT);

    expect(result).toBe('errors.auth.invalidCredentials');
    expect(mockT).toHaveBeenCalledWith('errors.auth.invalidCredentials');
  });

  it('should return invalid credentials message for 401 error', async () => {
    const mockResponse = new Response('{}', {
      status: 401,
      statusText: 'Unauthorized',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleAuthError(error, mockT);

    expect(result).toBe('errors.auth.invalidCredentials');
  });

  it('should return invalid input message for 422 error', async () => {
    const mockResponse = new Response('{}', {
      status: 422,
      statusText: 'Unprocessable Entity',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleAuthError(error, mockT);

    expect(result).toBe('errors.auth.invalidInput');
    expect(mockT).toHaveBeenCalledWith('errors.auth.invalidInput');
  });

  it('should return general error message for other errors', async () => {
    const mockResponse = new Response('{}', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    const error = new HTTPError(mockResponse, {} as any, {} as any);

    const result = await handleAuthError(error, mockT);

    expect(result).toBe('errors.http.serverError');
  });
});