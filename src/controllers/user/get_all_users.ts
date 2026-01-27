import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { async_handler } from '@/utils/async_handler';

export type list_users_query = z.infer<typeof get_all_users_query_schema>;

export const get_all_users = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = get_all_users_query_schema.parse(req.query);

  const skip = (query.page - 1) * query.limit;

  const [users, total] = await Promise.all([
    mg_db.user_model.find().skip(skip).limit(query.limit).sort({ created_at: -1 }).lean(),
    mg_db.user_model.countDocuments(),
  ]);

  res.json({
    items: users,
    total,
    page: query.page,
    limit: query.limit,
    total_pages: Math.ceil(total / query.limit),
  });
});

export const get_all_users_query_schema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
});
