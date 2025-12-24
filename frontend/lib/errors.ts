/**
 * Centralized Error Handling System
 * Provides user-friendly error messages and logging
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  details?: any;
  timestamp: Date;
  code?: string;
}

/**
 * Parse error and return user-friendly message
 */
export function parseError(error: any): AppError {
  const timestamp = new Date();

  // Network errors
  if (error.message === 'Failed to fetch' || error.name === 'NetworkError') {
    return {
      type: ErrorType.NETWORK,
      message: error.message,
      userMessage: '🌐 Network connection issue. Please check your internet and try again.',
      timestamp,
    };
  }

  // Timeout errors
  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    return {
      type: ErrorType.TIMEOUT,
      message: error.message,
      userMessage: '⏱️ Request timed out. The server took too long to respond. Please try again.',
      timestamp,
    };
  }

  // HTTP errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return {
          type: ErrorType.VALIDATION,
          message: data?.detail || error.message,
          userMessage: `❌ Invalid request: ${data?.detail || 'Please check your input and try again.'}`,
          code: '400',
          timestamp,
        };

      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: data?.detail || error.message,
          userMessage: '🔒 Authentication required. Please log in and try again.',
          code: '401',
          timestamp,
        };

      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          message: data?.detail || error.message,
          userMessage: '⛔ Access denied. You don\'t have permission to perform this action.',
          code: '403',
          timestamp,
        };

      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: data?.detail || error.message,
          userMessage: '🔍 Resource not found. The requested item doesn\'t exist.',
          code: '404',
          timestamp,
        };

      case 429:
        return {
          type: ErrorType.SERVER,
          message: data?.detail || error.message,
          userMessage: '🚦 Too many requests. Please wait a moment and try again.',
          code: '429',
          timestamp,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER,
          message: data?.detail || error.message,
          userMessage: '🔧 Server error. Our team has been notified. Please try again later.',
          code: status.toString(),
          timestamp,
        };

      default:
        return {
          type: ErrorType.UNKNOWN,
          message: data?.detail || error.message,
          userMessage: `⚠️ Something went wrong (Error ${status}). Please try again.`,
          code: status.toString(),
          timestamp,
        };
    }
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.type === 'validation') {
    return {
      type: ErrorType.VALIDATION,
      message: error.message,
      userMessage: `❌ Validation error: ${error.message}`,
      timestamp,
    };
  }

  // Default unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'Unknown error',
    userMessage: '⚠️ An unexpected error occurred. Please try again or contact support.',
    details: error,
    timestamp,
  };
}

/**
 * Log error to console and analytics
 */
export function logError(error: AppError, context?: string) {
  console.error(`[${error.type}] ${context || 'Error'}:`, {
    message: error.message,
    userMessage: error.userMessage,
    code: error.code,
    timestamp: error.timestamp,
    details: error.details,
  });

  // TODO: Send to analytics/monitoring service
  // Example: Sentry, LogRocket, etc.
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any, fallback?: string): string {
  const appError = parseError(error);
  return appError.userMessage || fallback || 'An error occurred';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  return [
    ErrorType.NETWORK,
    ErrorType.TIMEOUT,
    ErrorType.SERVER,
  ].includes(error.type);
}

/**
 * Format validation errors from API
 */
export function formatValidationErrors(errors: any[]): string {
  if (!errors || errors.length === 0) return 'Validation failed';
  
  return errors
    .map(err => `• ${err.field || 'Field'}: ${err.message}`)
    .join('\n');
}
