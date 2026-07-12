import type { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError.js';
import { env } from '../../config/env.js';

interface MongooseValidationError extends Error {
  errors: Record<string, { message: string }>;
}

interface MongooseDuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

interface ZodIssue {
  path: (string | number)[];
  message: string;
}

interface ZodErrorLike extends Error {
  issues: ZodIssue[];
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Default values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  // AppError — our own errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }
  // Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    const mongoErr = err as MongooseValidationError;
    details = Object.entries(mongoErr.errors).map(([field, e]) => ({
      path: field,
      message: e.message,
    }));
  }
  // Mongoose CastError
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'BAD_REQUEST';
    message = 'Invalid resource identifier';
  }
  // Mongoose duplicate key error
  else if ((err as MongooseDuplicateKeyError).code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    const mongoErr = err as MongooseDuplicateKeyError;
    const field = mongoErr.keyValue ? Object.keys(mongoErr.keyValue)[0] : 'field';
    message = `A record with this ${field} already exists`;
    details = { field };
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }
  // Zod errors
  else if (err.name === 'ZodError' && 'issues' in err) {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    const zodErr = err as ZodErrorLike;
    details = zodErr.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  }

  // Log in development
  if (env.NODE_ENV === 'development') {
    console.error(`[${code}] ${message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(details !== undefined && { details }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
