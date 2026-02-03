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
  console.log(`[LOGIN] Login attempt started...`);

  const authorization_header = req.headers.authorization;

  if (!authorization_header) {
    console.log(`[LOGIN] FAILED - No authorization header`);
    throw api_error.unauthorized('Authorization header is missing');
  }

  const parts = authorization_header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log(`[LOGIN] FAILED - Invalid header format`);
    throw api_error.unauthorized('Invalid authorization header format. Use: Bearer <token>');
  }

  const token = parts[1];

  try {
    const decoded_token = await firebase_auth.verifyIdToken(token);

    const email = decoded_token.email;
    if (!email) {
      console.log(`[LOGIN] FAILED - Token missing email`);
      throw api_error.unauthorized('Token does not contain email');
    }

    console.log(`[LOGIN] Verifying user: ${email}`);

    let user = await mg_db.user_model.findOne({ email });
    let is_new_user = false;

    if (!user) {
      const body = login_body_schema.parse(req.body);

      // Use provided name or extract from email
      const name = body.name || email.split('@')[0];

      user = new mg_db.user_model({
        name,
        email,
      });

      await user.save();
      is_new_user = true;
      console.log(`[LOGIN] NEW USER CREATED - ${email} (${user._id})`);
    } else {
      console.log(`[LOGIN] EXISTING USER - ${email} (${user._id})`);
    }

    res.status(is_new_user ? 201 : 200).json({
      success: true,
      data: user.toJSON(),
      message: is_new_user ? 'User created successfully' : 'Login successful',
    });
  } catch (error) {
    if (error instanceof api_error || error instanceof z.ZodError) {
      throw error;
    }
    console.log(`[LOGIN] FAILED - Invalid/expired token`);
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
