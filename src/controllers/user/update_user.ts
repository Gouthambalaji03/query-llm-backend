import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

export type update_user_body = z.infer<typeof update_user_body_schema>;

export const update_user = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = update_user_params_schema.parse(req.params);
  const body = update_user_body_schema.parse(req.body);

  if (body.email) {
    const existing_user = await mg_db.user_model.findOne({
      email: body.email,
      _id: { $ne: params.user_id },
    });

    if (existing_user) {
      throw api_error.conflict('Email is already registered');
    }
  }

  const user = await mg_db.user_model.findByIdAndUpdate(
    params.user_id,
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw api_error.not_found('User not found');
  }

  res.json({ message: 'User updated successfully' });
});

export const update_user_params_schema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
});

export const update_user_body_schema = z
  .object({
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(100, 'Name cannot exceed 100 characters')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .trim()
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'At least one field (name or email) must be provided',
  });
