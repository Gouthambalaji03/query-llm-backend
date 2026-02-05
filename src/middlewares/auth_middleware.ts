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
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[AUTH][${requestId}] ${req.method} ${req.path} - Authenticating request...`);

  try {
    const authorization_header = req.headers.authorization;

    if (!authorization_header) {
      console.log(`[AUTH][${requestId}] FAILED - No authorization header`);
      throw api_error.unauthorized('Authorization header is missing');
    }

    const parts = authorization_header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log(`[AUTH][${requestId}] FAILED - Invalid header format`);
      throw api_error.unauthorized('Invalid authorization header format. Use: Bearer <token>');
    }

    const token = parts[1];

    const decoded_token = await firebase_auth.verifyIdToken(token);
    const email = decoded_token.email;

    if (!email) {
      console.log(`[AUTH][${requestId}] FAILED - Token missing email`);
      throw api_error.unauthorized('Token does not contain email');
    }

    const user = await mg_db.user_model.findOne({ email });

    if (!user) {
      console.log(`[AUTH][${requestId}] FAILED - User not found for email: ${email}`);
      throw api_error.unauthorized('User not found');
    }

    req.user = user;
    console.log(`[AUTH][${requestId}] SUCCESS - User: ${email} (${user._id})`);

    next();
  } catch (error) {
    if (error instanceof api_error) {
      next(error);
      return;
    }

    console.log(`[AUTH][${requestId}] FAILED - Invalid/expired token`);
    next(api_error.unauthorized('Invalid or expired token'));
  }
};

// Export alias for compatibility
export const authenticate_token = auth_middleware;
