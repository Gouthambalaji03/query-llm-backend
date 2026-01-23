import { Response, NextFunction } from 'express';
import { firebase_auth } from '../config/firebase';
import { authenticated_request } from '../types';
import { api_error } from '../utils/api_error';

export const auth_middleware = async (
  req: authenticated_request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorization_header = req.headers.authorization;

    if (!authorization_header) {
      throw api_error.unauthorized('Authorization header is missing');
    }

    const parts = authorization_header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw api_error.unauthorized('Invalid authorization header format. Use: Bearer <token>');
    }

    const token = parts[1];

    const decoded_token = await firebase_auth.verifyIdToken(token);
    req.user = decoded_token;

    next();
  } catch (error) {
    if (error instanceof api_error) {
      next(error);
      return;
    }

    next(api_error.unauthorized('Invalid or expired token'));
  }
};
