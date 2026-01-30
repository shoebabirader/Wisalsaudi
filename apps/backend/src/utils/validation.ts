/**
 * Validation Utilities
 * Email and phone validation functions
 */

import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim();

/**
 * Phone validation schema (Saudi Arabia format)
 * Accepts formats: +966xxxxxxxxx, 05xxxxxxxx, 5xxxxxxxx
 */
export const phoneSchema = z
  .string()
  .regex(
    /^(\+966|966|05|5)\d{8}$/,
    'Invalid Saudi phone number format. Expected: +966xxxxxxxxx or 05xxxxxxxx'
  )
  .transform((val) => {
    // Normalize to +966xxxxxxxxx format
    if (val.startsWith('+966')) return val;
    if (val.startsWith('966')) return `+${val}`;
    if (val.startsWith('05')) return `+966${val.substring(1)}`;
    if (val.startsWith('5')) return `+966${val}`;
    return val;
  });

/**
 * Password validation schema
 * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * User role validation schema
 */
export const userRoleSchema = z.enum(['buyer', 'seller', 'admin'], {
  errorMap: () => ({ message: 'Role must be buyer, seller, or admin' }),
});

/**
 * Language validation schema
 */
export const languageSchema = z.enum(['en', 'ar'], {
  errorMap: () => ({ message: 'Language must be en or ar' }),
});

/**
 * Registration input validation schema
 */
export const registrationSchema = z.object({
  email: emailSchema,
  phone: phoneSchema.optional(),
  password: passwordSchema,
  role: userRoleSchema.default('buyer'),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  preferred_language: languageSchema.default('en'),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/**
 * Login input validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone format
 */
export function isValidPhone(phone: string): boolean {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}
