import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

export const delete_user = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = delete_user_params_schema.parse(req.params);

  const user = await mg_db.user_model.findOne({
    _id: params.user_id,
    deleted_at: null,
  });

  if (!user) {
    throw api_error.not_found('User not found');
  }

  user.deleted_at = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

export const delete_user_params_schema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
});
