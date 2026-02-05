import { Request, Response } from 'express';
import { z } from 'zod';
import { mg_db } from '@/models/mg_db';
import { api_error } from '@/utils/api_error';
import { async_handler } from '@/utils/async_handler';
import { logger } from '@/utils/logger';

const date_schema = z.union([z.string(), z.date()]).optional();

const ui_text_part_schema = z.object({
  type: z.literal('text'),
  text: z.preprocess((value) => (typeof value === 'string' ? value : ''), z.string()),
});

const ui_tool_invocation_part_schema = z.object({
  type: z.literal('tool-invocation'),
  toolCallId: z.string(),
  toolName: z.string(),
  state: z.enum(['call', 'result', 'partial-call']),
  args: z.unknown().optional(),
  result: z.unknown().optional(),
});

const ui_user_message_schema = z.object({
  id: z.string().min(1),
  role: z.literal('user'),
  content: z.preprocess(
    (value) => (typeof value === 'string' ? value : ''),
    z.string()
  ),
  created_at: date_schema,
});

const ui_assistant_message_schema = z.object({
  id: z.string().min(1),
  role: z.literal('assistant'),
  content: z.preprocess(
    (value) => (typeof value === 'string' ? value : ''),
    z.string()
  ),
  parts: z.array(z.union([ui_text_part_schema, ui_tool_invocation_part_schema])).optional(),
  created_at: date_schema,
});

const ui_message_schema = z.union([ui_user_message_schema, ui_assistant_message_schema]);

export const append_user_context_body_schema = z.object({
  messages: z
    .array(
      ui_message_schema.transform((msg) => ({
        ...msg,
        content: msg.content ?? '',
        parts: msg.role === 'assistant' ? msg.parts ?? [] : undefined,
      }))
    )
    .min(1),
});

export const append_user_context_params_schema = z.object({
  conversation_id: z.string().min(1, 'Conversation ID is required'),
});

const normalize_date = (value?: string | Date): Date => {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
};

export const append_user_context_messages = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const params = append_user_context_params_schema.parse(req.params);
  const body = append_user_context_body_schema.parse(req.body);
  const user_id = req.user!._id;

  const conversation = await mg_db.conversation_model.findOne({
    conversation_id: params.conversation_id,
    user_id,
    deleted_at: null,
  });

  if (!conversation) {
    throw api_error.not_found('Conversation not found');
  }

  let user_context = await mg_db.user_context_messages_model.findOne({
    conversation_id: conversation._id,
  });

  if (!user_context) {
    user_context = new mg_db.user_context_messages_model({
      conversation_id: conversation._id,
      content: [],
    });
  }

  const existing_ids = new Set(user_context.content.map((msg) => msg.id));
  const normalized_messages = body.messages.map((msg) => ({
    ...msg,
    content: msg.content ?? '',  // Ensure content is always set
    created_at: normalize_date(msg.created_at),
  }));
  const new_messages = normalized_messages
    .filter((msg) => !existing_ids.has(msg.id))
    .map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content || '',  // Force content field to exist and be a string
      parts: msg.parts,
      created_at: msg.created_at,
    }));

  if (new_messages.length > 0) {
    // Debug: Log the messages before pushing
    logger.info(
      {
        conversation_id: params.conversation_id,
        messages: new_messages.map((m) => ({
          id: m.id,
          role: m.role,
          has_content: m.content !== undefined,
          content_type: typeof m.content,
          content_value: m.content,
        })),
      },
      'Appending messages to user context'
    );

    user_context.content.push(...(new_messages as any));
    await user_context.save();
  }

  conversation.updated_at = new Date();
  await conversation.save();

  res.status(200).json({
    success: true,
    data: {
      appended: new_messages.length,
      skipped: normalized_messages.length - new_messages.length,
      total: user_context.content.length,
    },
    message: 'User context messages appended successfully',
  });
});
