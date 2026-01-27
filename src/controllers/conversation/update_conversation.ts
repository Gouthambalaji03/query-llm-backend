import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

export type update_conversation_body = z.infer<typeof update_conversation_body_schema>;
export type update_conversation_params = z.infer<typeof update_conversation_params_schema>;

export const update_conversation = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = update_conversation_params_schema.parse(req.params);
  const body = update_conversation_body_schema.parse(req.body);
  const user_id = req.user!._id;

  // Find conversation and verify ownership
  const conversation = await mg_db.conversation_model.findOne({
    conversation_id: params.conversation_id,
    user_id,
    deleted_at: null,
  });

  if (!conversation) {
    throw api_error.not_found('Conversation not found');
  }

  // Update conversation
  if (body.title !== undefined) {
    conversation.title = body.title;
  }
  if (body.model !== undefined) {
    conversation.ai_model = body.model;
  }
  if (body.status !== undefined) {
    conversation.status = body.status;
  }
  await conversation.save();

  res.status(200).json({
    success: true,
    data: conversation.toJSON(),
    message: 'Conversation updated successfully',
  });
});

export const update_conversation_params_schema = z.object({
  conversation_id: z.string().min(1, 'Conversation ID is required'),
});

export const update_conversation_body_schema = z
  .object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters')
      .trim()
      .optional(),
    model: z.string().min(1, 'Model cannot be empty').trim().optional(),
    status: z.enum(['active', 'archived'], {
      errorMap: () => ({ message: 'Status must be either active or archived' }),
    }).optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.model !== undefined || data.status !== undefined,
    {
      message: 'At least one field (title, model, or status) must be provided',
    }
  );
