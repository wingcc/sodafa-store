/**
 * Standardized API Response Utilities
 *
 * Provides consistent response structure across all API endpoints.
 */

import { NextResponse } from 'next/server';

/**
 * Standard success response
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Creates a standardized success response
 */
export function successResponse<T>(data: T, statusCode: number = 200) {
  return NextResponse.json({ success: true, data } as SuccessResponse<T>, { status: statusCode });
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    } as ErrorResponse,
    { status: statusCode }
  );
}

/**
 * Creates a 400 Bad Request response
 */
export function badRequest(message: string, details?: Record<string, unknown>) {
  return errorResponse('BAD_REQUEST', message, 400, details);
}

/**
 * Creates a 401 Unauthorized response
 */
export function unauthorized(message: string = 'Unauthorized') {
  return errorResponse('UNAUTHORIZED', message, 401);
}

/**
 * Creates a 403 Forbidden response
 */
export function forbidden(message: string = 'Forbidden') {
  return errorResponse('FORBIDDEN', message, 403);
}

/**
 * Creates a 404 Not Found response
 */
export function notFound(message: string = 'Resource not found') {
  return errorResponse('NOT_FOUND', message, 404);
}

/**
 * Creates a 422 Validation Error response
 */
export function validationError(message: string, details?: Record<string, unknown>) {
  return errorResponse('VALIDATION_ERROR', message, 422, details);
}

/**
 * Creates a 500 Internal Server Error response
 */
export function internalServerError(message: string = 'Internal server error') {
  return errorResponse('INTERNAL_SERVER_ERROR', message, 500);
}