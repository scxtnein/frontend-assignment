import { HTTPError } from 'ky';
import type { TFunction } from 'i18next';

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export const handleHttpError = async (
  error: unknown,
  t: TFunction,
): Promise<ApiError> => {
  // Handle Ky HTTP errors
  if (error instanceof HTTPError) {
    const statusCode = error.response.status;
    
    // Try to parse error response body
    let errorMessage: string;
    let errorCode: string | undefined;
    
    try {
      const errorBody = await error.response.json();
      errorMessage = errorBody.message || errorBody.error || '';
      errorCode = errorBody.code;
    } catch {
      errorMessage = '';
    }
    
    // Return appropriate user-friendly message based on status code
    switch (statusCode) {
      case 400:
        return {
          message: errorMessage || t('errors.http.badRequest'),
          code: errorCode,
          statusCode,
        };
      case 401:
        return {
          message: errorMessage || t('errors.http.unauthorized'),
          code: errorCode,
          statusCode,
        };
      case 403:
        return {
          message: errorMessage || t('errors.http.forbidden'),
          code: errorCode,
          statusCode,
        };
      case 404:
        return {
          message: t('errors.http.notFound'),
          code: errorCode,
          statusCode,
        };
      case 422:
        return {
          message: errorMessage || t('errors.http.validationError'),
          code: errorCode,
          statusCode,
        };
      case 429:
        return {
          message: t('errors.http.tooManyRequests'),
          code: errorCode,
          statusCode,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: t('errors.http.serverError'),
          code: errorCode,
          statusCode,
        };
      default:
        return {
          message: t('errors.http.genericError'),
          code: errorCode,
          statusCode,
        };
    }
  }
  
  // Handle regular Error instances
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  // Handle unknown errors
  return {
    message: t('errors.http.genericError'),
  };
};

// Specific error handler for authentication
export const handleAuthError = async (
  error: unknown,
  t: TFunction,
): Promise<string> => {
  const apiError = await handleHttpError(error, t);
  
  // Special handling for auth-specific errors
  if (apiError.statusCode === 404 || apiError.statusCode === 401) {
    return t('errors.auth.invalidCredentials');
  }
  
  if (apiError.statusCode === 422) {
    return t('errors.auth.invalidInput');
  }
  
  return apiError.message;
};