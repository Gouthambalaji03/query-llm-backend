import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

export type create_user_body = z.infer<typeof create_user_body_schema>;

export const create_user = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const user_id = req.user!._id;
  const body = create_user_body_schema.parse(req.body);

  const existing_user = await mg_db.user_model.findOne({
    $or: [{ _id: user_id }, { email: body.email }],
  });

  if (existing_user) {
    if (existing_user._id === user_id) {
      throw api_error.conflict('User already exists with this Firebase account');
    }
    throw api_error.conflict('Email is already registered');
  }

  const user = new mg_db.user_model({
    _id: user_id,
    name: body.name,
    email: body.email,
  });

  await user.save();
  res.status(201).json({ message: 'User created successfully' });
});

export const create_user_body_schema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
});
