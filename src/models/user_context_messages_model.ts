import mongoose, { Document, Schema } from 'mongoose';

// Sub-schema for UI message parts
const ui_part_schema = new Schema(
  {
    type: {
      type: String,
      enum: ['text', 'tool-invocation'],
      required: true,
    },
    text: {
      type: String,
      default: undefined,
    },
    toolCallId: {
      type: String,
      default: undefined,
    },
    toolName: {
      type: String,
      default: undefined,
    },
    state: {
      type: String,
      enum: ['call', 'result', 'partial-call'],
      default: undefined,
    },
    args: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    result: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  { _id: false }
);

// UI Message schema
const ui_message_schema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: false,  // Allow empty content for tool-only messages
      default: '',
    },
    parts: {
      type: [ui_part_schema],
      default: [],
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Main user_context_messages document
export interface user_context_messages_document extends Document {
  conversation_id: mongoose.Types.ObjectId;
  content: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    parts?: Array<{
      type: 'text' | 'tool-invocation';
      text?: string;
      toolCallId?: string;
      toolName?: string;
      state?: 'call' | 'result' | 'partial-call';
      args?: unknown;
      result?: unknown;
    }>;
    created_at: Date;
  }>;
  created_at: Date;
  updated_at: Date;
}

const user_context_messages_schema = new Schema(
  {
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: [ui_message_schema],
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export const user_context_messages_model = mongoose.model<user_context_messages_document>(
  'UserContextMessages',
  user_context_messages_schema
);
