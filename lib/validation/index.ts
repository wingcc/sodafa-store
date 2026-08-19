/**
 * Validation Library Index
 *
 * Centralized exports for validation utilities.
 *
 * Zod schemas for API input validation will be added here as needed.
 */

import { z } from 'zod';

/**
 * Base validator helper
 * Provides common validation patterns
 */
export const validators = {
  /**
   * Validates a UUID string
   */
  uuid: (message = 'Invalid UUID') => z.string().uuid(message),

  /**
   * Validates an email address
   */
  email: (message = 'Invalid email address') => z.string().email(message),

  /**
   * Validates a non-empty string with optional min/max length
   */
  string: (options: { min?: number; max?: number; message?: string } = {}) => {
    const { min, max, message = 'Invalid string' } = options;
    let schema = z.string();
    if (min !== undefined) schema = schema.min(min, message);
    if (max !== undefined) schema = schema.max(max, message);
    return schema;
  },

  /**
   * Validates a positive number
   */
  positiveNumber: (message = 'Must be a positive number') => z.number().positive(message),

  /**
   * Validates a non-negative number
   */
  nonNegativeNumber: (message = 'Must be a non-negative number') =>
    z.number().nonnegative(message),

  /**
   * Validates an optional field
   */
  optional: <T>(schema: z.ZodType<T>) => schema.optional(),

  /**
   * Validates a nullable field
   */
  nullable: <T>(schema: z.ZodType<T>) => schema.nullable(),
};

export { z };