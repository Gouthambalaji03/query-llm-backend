import { user_document } from '@/models/mg_db';

// Augment Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: user_document;
    }
  }
}

export interface api_success_response<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface api_error_response {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type api_response<T = unknown> = api_success_response<T> | api_error_response;

export interface pagination_params {
  page: number;
  limit: number;
}

export interface paginated_response<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface user_data {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface create_user_input {
  name: string;
  email: string;
}

export interface update_user_input {
  name?: string;
  email?: string;
}

// Conversation types
export interface conversation_data {
  id: string;
  user_id: string;
  conversation_id: string;
  title: string;
  model: string;
  status: 'active' | 'archived';
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface create_conversation_input {
  conversation_id: string; // UUID from frontend
  title: string;
  model: string;
}

export interface update_conversation_input {
  title?: string;
  model?: string;
  status?: 'active' | 'archived';
}

// User Context Message types (for UI)
export interface ui_text_part {
  type: 'text';
  text: string;
}

export interface ui_tool_invocation_part {
  type: 'tool-invocation';
  toolCallId: string;
  toolName: string;
  state: 'call' | 'result' | 'partial-call';
  args?: unknown;
  result?: unknown;
}

export interface ui_user_message {
  id: string;
  role: 'user';
  content: string;
  created_at: Date;
}

export interface ui_assistant_message {
  id: string;
  role: 'assistant';
  content: string;
  parts?: Array<ui_text_part | ui_tool_invocation_part>;
  created_at: Date;
}

export type ui_message = ui_user_message | ui_assistant_message;

// Agent Context Message types (for AI SDK)
export interface text_part {
  type: 'text';
  text: string;
}

export interface tool_call_part {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: unknown;
}

export interface tool_result_part {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: unknown;
}

export interface image_part {
  type: 'image';
  image: string | Buffer;
  mimeType?: string;
}

export interface file_part {
  type: 'file';
  data: string | Buffer;
  mimeType: string;
}

export interface system_model_message {
  id: string;
  role: 'system';
  content: string;
  created_at: Date;
}

export interface user_model_message {
  id: string;
  role: 'user';
  content: string | Array<text_part | image_part | file_part>;
  created_at: Date;
}

export interface assistant_model_message {
  id: string;
  role: 'assistant';
  content: string | Array<text_part | tool_call_part>;
  created_at: Date;
}

export interface tool_model_message {
  id: string;
  role: 'tool';
  content: Array<tool_result_part>;
  created_at: Date;
}

export type model_message =
  | system_model_message
  | user_model_message
  | assistant_model_message
  | tool_model_message;
