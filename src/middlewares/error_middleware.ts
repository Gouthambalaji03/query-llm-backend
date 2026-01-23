import { Request, Response, NextFunction } from 'express';
import { api_error } from '../utils/api_error';
import { send_error } from '../utils/api_response';
import { is_production } from '../config/env';

export const error_middleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (!is_production) {
    console.error('Error:', error);
  }

  if (error instanceof api_error) {
    return send_error(
      res,
      error.code,
      error.message,
      error.status_code,
      error.details
    );
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return send_error(res, 'VALIDATION_ERROR', error.message, 422);
  }

  // Handle Mongoose duplicate key errors
  if (error.name === 'MongoServerError' && (error as unknown as { code: number }).code === 11000) {
    return send_error(res, 'DUPLICATE_KEY', 'A record with this value already exists', 409);
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return send_error(res, 'INVALID_ID', 'Invalid ID format', 400);
  }

  // Default error response
  return send_error(
    res,
    'INTERNAL_ERROR',
    is_production ? 'Internal server error' : error.message,
    500
  );
};

export const not_found_middleware = (
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  return send_error(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
};
