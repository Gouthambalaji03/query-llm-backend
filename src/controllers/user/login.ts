import { Request, Response } from 'express';
import { z } from 'zod';
import { firebase_auth } from '@/config/firebase';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

export type login_body = z.infer<typeof login_body_schema>;

export const login = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const authorization_header = req.headers.authorization;

  if (!authorization_header) {
    throw api_error.unauthorized('Authorization header is missing');
  }

  const parts = authorization_header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw api_error.unauthorized('Invalid authorization header format. Use: Bearer <token>');
  }

  const token = parts[1];
  
  try {
    const decoded_token = await firebase_auth.verifyIdToken(token);

    const email = decoded_token.email;
    if (!email) {
      throw api_error.unauthorized('Token does not contain email');
    }

    let user = await mg_db.user_model.findOne({ email });

    if (!user) {
      const body = login_body_schema.parse(req.body);

      user = new mg_db.user_model({
        firebase_uid: decoded_token.uid,
        name: body.name,
        email,
      });

      await user.save();
    }

    res.json({ user });
  } catch (error) {
    if (error instanceof api_error || error instanceof z.ZodError) {
      throw error;
    }
    throw api_error.unauthorized('Invalid or expired token');
  }
});

export const login_body_schema = z.object({
  name: z
    .string({
      required_error: 'Name is required for new users',
      invalid_type_error: 'Name must be a string',
    })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .trim()
    .optional(),
});
