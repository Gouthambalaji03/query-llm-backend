import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { async_handler } from '@/utils/async_handler';

export type get_all_conversations_query = z.infer<typeof get_all_conversations_query_schema>;

export const get_all_conversations = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = get_all_conversations_query_schema.parse(req.query);
  const user_id = req.user!._id;

  const page = parseInt(query.page);
  const limit = parseInt(query.limit);
  const skip = (page - 1) * limit;

  // Build query filter
  const filter: Record<string, unknown> = {
    user_id,
    deleted_at: null,
  };

  if (query.status !== 'all') {
    filter.status = query.status;
  }

  // Get conversations with pagination
  const [conversations, total] = await Promise.all([
    mg_db.conversation_model
      .find(filter)
      .sort({ updated_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    mg_db.conversation_model.countDocuments(filter),
  ]);

  const total_pages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      conversations,
      total,
      page,
      limit,
      total_pages,
    },
  });
});

export const get_all_conversations_query_schema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: 'Page must be a positive number',
    }),
  limit: z
    .string()
    .optional()
    .default('20')
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 100, {
      message: 'Limit must be a number between 1 and 100',
    }),
  status: z
    .enum(['active', 'archived', 'all'], {
      errorMap: () => ({ message: 'Status must be active, archived, or all' }),
    })
    .optional()
    .default('all'),
});
