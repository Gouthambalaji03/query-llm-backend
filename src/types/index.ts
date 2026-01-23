import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface authenticated_request extends Request {
  user?: DecodedIdToken;
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
  firebase_uid: string;
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
