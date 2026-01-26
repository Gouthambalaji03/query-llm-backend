import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

export const get_user_by_id = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = get_user_by_id_params_schema.parse(req.params);

  const user = await mg_db.user_model.findById(params.user_id).lean();

  if (!user) {
    throw api_error.not_found('User not found');
  }

  res.json(user);
});

export const get_user_by_id_params_schema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
});
