import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

const date_schema = z.union([z.string(), z.date()]).optional();

const agent_message_schema = z.object({
  id: z.string().min(1),
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.unknown(),
  created_at: date_schema,
});

export const append_agent_context_body_schema = z.object({
  messages: z.array(agent_message_schema).min(1),
});

export const append_agent_context_params_schema = z.object({
  conversation_id: z.string().min(1, 'Conversation ID is required'),
});

const normalize_date = (value?: string | Date): Date => {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
};

export const append_agent_context_messages = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = append_agent_context_params_schema.parse(req.params);
  const body = append_agent_context_body_schema.parse(req.body);
  const user_id = req.user!._id;

  const conversation = await mg_db.conversation_model.findOne({
    conversation_id: params.conversation_id,
    user_id,
    deleted_at: null,
  });

  if (!conversation) {
    throw api_error.not_found('Conversation not found');
  }

  let agent_context = await mg_db.agent_context_messages_model.findOne({
    conversation_id: conversation._id,
  });

  if (!agent_context) {
    agent_context = new mg_db.agent_context_messages_model({
      conversation_id: conversation._id,
      content: [],
    });
  }

  const existing_ids = new Set(agent_context.content.map((msg) => msg.id));
  const normalized_messages = body.messages.map((msg) => ({
    ...msg,
    created_at: normalize_date(msg.created_at),
  }));
  const new_messages = normalized_messages.filter((msg) => !existing_ids.has(msg.id));

  if (new_messages.length > 0) {
    agent_context.content.push(...(new_messages as any));
    await agent_context.save();
  }

  conversation.updated_at = new Date();
  await conversation.save();

  res.status(200).json({
    success: true,
    data: {
      appended: new_messages.length,
      skipped: normalized_messages.length - new_messages.length,
      total: agent_context.content.length,
    },
    message: 'Agent context messages appended successfully',
  });
});
