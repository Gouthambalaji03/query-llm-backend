import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

export const add_message = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = add_message_params_schema.parse(req.params);
  const body = add_message_body_schema.parse(req.body);
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

  const message_id = body.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const created_at = new Date();

  // Create the message object
  const message = {
    id: message_id,
    role: body.role,
    content: body.content,
    ...(body.parts && { parts: body.parts }),
    created_at,
  };

  // Update user context messages
  await mg_db.user_context_messages_model.findOneAndUpdate(
    { conversation_id: conversation._id },
    {
      $push: { content: message },
      $set: { updated_at: new Date() }
    },
    { upsert: true }
  );

  // Also update agent context messages for AI processing
  const agent_message = {
    id: message_id,
    role: body.role,
    content: body.content,
    created_at,
  };

  await mg_db.agent_context_messages_model.findOneAndUpdate(
    { conversation_id: conversation._id },
    {
      $push: { content: agent_message },
      $set: { updated_at: new Date() }
    },
    { upsert: true }
  );

  // Update conversation's updated_at
  conversation.updated_at = new Date();
  await conversation.save();

  res.status(201).json({
    success: true,
    data: message,
    message: 'Message added successfully',
  });
});

export const add_message_params_schema = z.object({
  conversation_id: z.string().min(1, 'Conversation ID is required'),
});

export const add_message_body_schema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant'], {
    errorMap: () => ({ message: 'Role must be either user or assistant' }),
  }),
  content: z.string().min(1, 'Content cannot be empty'),
  parts: z.array(
    z.union([
      z.object({
        type: z.literal('text'),
        text: z.string(),
      }),
      z.object({
        type: z.literal('tool-invocation'),
        toolCallId: z.string(),
        toolName: z.string(),
        state: z.enum(['call', 'result', 'partial-call']),
        args: z.unknown().optional(),
        result: z.unknown().optional(),
      }),
    ])
  ).optional(),
});
