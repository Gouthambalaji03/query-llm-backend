import { Response, NextFunction } from 'express';
import { authenticated_request } from '../types';
import * as user_service from '../services/user_service';
import { send_success, send_created, send_no_content } from '../utils/api_response';
import { create_user_body, update_user_body, list_users_query } from '../schemas/user_schema';

export const create_user = async (
  req: authenticated_request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const firebase_uid = req.user!.uid;
    const body = req.body as create_user_body;

    const user = await user_service.create_user(firebase_uid, body);
    send_created(res, user.toJSON(), 'User created successfully');
  } catch (error) {
    next(error);
  }
};

export const get_user = async (
  req: authenticated_request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = req.params.user_id as string;
    const user = await user_service.get_user_by_id(user_id);
    send_success(res, user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const list_users = async (
  req: authenticated_request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit } = req.query as unknown as list_users_query;
    const result = await user_service.list_users(page, limit);

    send_success(res, {
      ...result,
      items: result.items.map((user) => user.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

export const update_user = async (
  req: authenticated_request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = req.params.user_id as string;
    const body = req.body as update_user_body;

    const user = await user_service.update_user(user_id, body);
    send_success(res, user.toJSON(), 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const delete_user = async (
  req: authenticated_request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = req.params.user_id as string;
    await user_service.delete_user(user_id);
    send_no_content(res);
  } catch (error) {
    next(error);
  }
};

export const get_current_user = async (
  req: authenticated_request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const firebase_uid = req.user!.uid;
    const user = await user_service.get_user_by_firebase_uid(firebase_uid);

    if (!user) {
      send_success(res, null, 'User profile not found');
      return;
    }

    send_success(res, user.toJSON());
  } catch (error) {
    next(error);
  }
};
