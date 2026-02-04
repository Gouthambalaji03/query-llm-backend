import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

export type get_conversation_params = z.infer<typeof get_conversation_params_schema>;

export const get_conversation_by_id = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = get_conversation_params_schema.parse(req.params);
  const user_id = req.user!._id;
  const user_email = req.user!.email;

  console.log(`[GET_CONVERSATION] User: ${user_email} requesting conversation: ${params.conversation_id}`);

  // Find conversation and verify ownership
  const conversation = await mg_db.conversation_model.findOne({
    conversation_id: params.conversation_id,
    user_id,
    deleted_at: null,
  });

  if (!conversation) {
    console.log(`[GET_CONVERSATION] NOT FOUND - Conversation: ${params.conversation_id} for user: ${user_email} (${user_id})`);
    throw api_error.not_found('Conversation not found');
  }

  console.log(`[GET_CONVERSATION] FOUND - Conversation: ${params.conversation_id}, Title: "${conversation.title}"`);

  // Get user context messages
  const user_context = await mg_db.user_context_messages_model.findOne({
    conversation_id: conversation._id,
  });

  // Get agent context messages
  const agent_context = await mg_db.agent_context_messages_model.findOne({
    conversation_id: conversation._id,
  });

  const messageCount = user_context?.content?.length || 0;
  console.log(`[GET_CONVERSATION] SUCCESS - Returning ${messageCount} messages`);

  res.status(200).json({
    success: true,
    data: {
      conversation: conversation.toJSON(),
      user_context_messages: user_context?.content || [],
      agent_context_messages: agent_context?.content || [],
    },
  });
});

export const get_conversation_params_schema = z.object({
  conversation_id: z.string().min(1, 'Conversation ID is required'),
});
