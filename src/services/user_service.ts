import { user_model, user_document } from '../models/user_model';
import { api_error } from '../utils/api_error';
import { paginated_response, create_user_input, update_user_input } from '../types';

export const create_user = async (
  firebase_uid: string,
  input: create_user_input
): Promise<user_document> => {
  const existing_user = await user_model.findOne({
    $or: [{ firebase_uid }, { email: input.email }],
  });

  if (existing_user) {
    if (existing_user.firebase_uid === firebase_uid) {
      throw api_error.conflict('User already exists with this Firebase account');
    }
    throw api_error.conflict('Email is already registered');
  }

  const user = new user_model({
    firebase_uid,
    name: input.name,
    email: input.email,
  });

  await user.save();
  return user;
};

export const get_user_by_id = async (user_id: string): Promise<user_document> => {
  const user = await user_model.findById(user_id);

  if (!user) {
    throw api_error.not_found('User not found');
  }

  return user;
};

export const get_user_by_firebase_uid = async (
  firebase_uid: string
): Promise<user_document | null> => {
  return user_model.findOne({ firebase_uid });
};

export const list_users = async (
  page: number,
  limit: number
): Promise<paginated_response<user_document>> => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    user_model.find().skip(skip).limit(limit).sort({ created_at: -1 }),
    user_model.countDocuments(),
  ]);

  return {
    items: users,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
};

export const update_user = async (
  user_id: string,
  input: update_user_input
): Promise<user_document> => {
  if (input.email) {
    const existing_user = await user_model.findOne({
      email: input.email,
      _id: { $ne: user_id },
    });

    if (existing_user) {
      throw api_error.conflict('Email is already registered');
    }
  }

  const user = await user_model.findByIdAndUpdate(
    user_id,
    { $set: input },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw api_error.not_found('User not found');
  }

  return user;
};

export const delete_user = async (user_id: string): Promise<void> => {
  const user = await user_model.findByIdAndDelete(user_id);

  if (!user) {
    throw api_error.not_found('User not found');
  }
};
