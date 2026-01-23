import { Response } from 'express';
import { api_success_response, api_error_response } from '../types';

export const send_success = <T>(
  res: Response,
  data: T,
  message?: string,
  status_code: number = 200
): Response => {
  const response: api_success_response<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return res.status(status_code).json(response);
};

export const send_error = (
  res: Response,
  code: string,
  message: string,
  status_code: number = 500,
  details?: unknown
): Response => {
  const error_obj: api_error_response['error'] = { code, message };
  if (details !== undefined) {
    error_obj.details = details;
  }
  const response: api_error_response = {
    success: false,
    error: error_obj,
  };
  return res.status(status_code).json(response);
};

export const send_created = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response => {
  return send_success(res, data, message, 201);
};

export const send_no_content = (res: Response): Response => {
  return res.status(204).send();
};
