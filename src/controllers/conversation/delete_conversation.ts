import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

export type delete_conversation_params = z.infer<typeof delete_conversation_params_schema>;

export const delete_conversation = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = delete_conversation_params_schema.parse(req.params);
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

  // Soft delete - set deleted_at timestamp
  conversation.deleted_at = new Date();
  await conversation.save();

  res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully',
  });
});

export const delete_conversation_params_schema = z.object({
  conversation_id: z.string().min(1, 'Conversation ID is required'),
});
