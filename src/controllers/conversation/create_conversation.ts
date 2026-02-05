import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';

export type create_conversation_body = z.infer<typeof create_conversation_body_schema>;

export const create_conversation = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = create_conversation_body_schema.parse(req.body);
  const user_id = req.user!._id;

  // Check if conversation_id already exists
  const existing_conversation = await mg_db.conversation_model.findOne({
    conversation_id: body.conversation_id,
  });

  if (existing_conversation) {
    throw api_error.conflict('Conversation ID already exists');
  }

  // Create conversation
  const conversation = await mg_db.conversation_model.create({
    user_id,
    conversation_id: body.conversation_id,
    title: body.title,
    ai_model: body.model,
    status: 'active',
  });

  // Prepare initial messages if provided
  const message_id = `msg_${Date.now()}`;
  const created_at = new Date();

  const initial_user_messages = body.initial_message
    ? [
        {
          id: message_id,
          role: 'user',
          content: body.initial_message,
          created_at,
        },
      ]
    : [];

  const initial_agent_messages = body.initial_message
    ? [
        {
          id: message_id,
          role: 'user',
          content: body.initial_message,
          created_at,
        },
      ]
    : [];

  // Create user context messages document
  const user_context = new mg_db.user_context_messages_model({
    conversation_id: conversation._id,
    content: [],
  });
  if (initial_user_messages.length > 0) {
    user_context.content.push(initial_user_messages[0] as any);
  }
  await user_context.save();

  // Create agent context messages document
  const agent_context = new mg_db.agent_context_messages_model({
    conversation_id: conversation._id,
    content: [],
  });
  if (initial_agent_messages.length > 0) {
    agent_context.content.push(initial_agent_messages[0] as any);
  }
  await agent_context.save();

  res.status(201).json({
    success: true,
    message: 'Conversation created successfully',
  });
});

export const create_conversation_body_schema = z.object({
  conversation_id: z
    .string({
      required_error: 'Conversation ID is required',
      invalid_type_error: 'Conversation ID must be a string',
    })
    .uuid('Conversation ID must be a valid UUID'),
  title: z
    .string({
      required_error: 'Title is required',
      invalid_type_error: 'Title must be a string',
    })
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  model: z
    .string({
      required_error: 'Model is required',
      invalid_type_error: 'Model must be a string',
    })
    .min(1, 'Model cannot be empty')
    .trim(),
  initial_message: z
    .string()
    .min(1, 'Initial message cannot be empty')
    .optional(),
});
