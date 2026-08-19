/**
 * Standardized API Error Codes
 */

export enum ApiErrorCode {
  // Client errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',

  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Custom application errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, details?: Record<string, unknown>) {
    return new ApiError(ApiErrorCode.BAD_REQUEST, message, 400, details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(ApiErrorCode.UNAUTHORIZED, message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(ApiErrorCode.FORBIDDEN, message, 403);
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(ApiErrorCode.NOT_FOUND, message, 404);
  }

  static validationError(message: string, details?: Record<string, unknown>) {
    return new ApiError(ApiErrorCode.VALIDATION_ERROR, message, 422, details);
  }

  static internalError(message: string = 'Internal server error') {
    return new ApiError(ApiErrorCode.INTERNAL_SERVER_ERROR, message, 500);
  }
}

/**
 * Converts unknown errors to ApiError
 * Logs sensitive details server-side while returning safe messages to client
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // Log the actual error for debugging
    console.error('API Error:', error);

    // Return safe generic error to client
    return ApiError.internalError('An unexpected error occurred');
  }

  console.error('Unknown error:', error);
  return ApiError.internalError('An unexpected error occurred');
}