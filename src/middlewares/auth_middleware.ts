import { Request, Response, NextFunction } from 'express';
import { firebase_auth } from '@/config/firebase';
import { api_error } from '@/utils/api_error';
import { mg_db } from '@/models/mg_db';
import '@/types';

export const auth_middleware = async (
  req: Request,
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
    const email = decoded_token.email;

    if (!email) {
      throw api_error.unauthorized('Token does not contain email');
    }

    const user = await mg_db.user_model.findOne({ email });

    if (!user) {
      throw api_error.unauthorized('User not found');
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof api_error) {
      next(error);
      return;
    }

    next(api_error.unauthorized('Invalid or expired token'));
  }
};

// Export alias for compatibility
export const authenticate_token = auth_middleware;
