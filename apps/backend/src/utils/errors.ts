/**
 * Custom Error Classes
 * Standardized error handling for the API
 */

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    messageAr: string;
    details?: any;
    timestamp: string;
  };
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public messageAr: string;
  public details?: any;

  constructor(
    message: string,
    messageAr: string,
    statusCode: number,
    code: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.messageAr = messageAr;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        messageAr: this.messageAr,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, messageAr: string, details?: any) {
    super(message, messageAr, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication required',
    messageAr: string = 'المصادقة مطلوبة'
  ) {
    super(message, messageAr, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Insufficient permissions',
    messageAr: string = 'صلاحيات غير كافية'
  ) {
    super(message, messageAr, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    messageAr: string = 'المورد غير موجود'
  ) {
    super(message, messageAr, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, messageAr: string, details?: any) {
    super(message, messageAr, 409, 'CONFLICT', details);
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = 'Too many requests',
    messageAr: string = 'طلبات كثيرة جداً'
  ) {
    super(message, messageAr, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class InternalServerError extends AppError {
  constructor(
    message: string = 'An unexpected error occurred',
    messageAr: string = 'حدث خطأ غير متوقع'
  ) {
    super(message, messageAr, 500, 'INTERNAL_SERVER_ERROR');
  }
}
