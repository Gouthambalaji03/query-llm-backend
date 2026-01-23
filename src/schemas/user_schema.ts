import { z } from 'zod';

export const create_user_schema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(1, 'Name cannot be empty')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
  }),
});

export const update_user_schema = z.object({
  params: z.object({
    user_id: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(100, 'Name cannot exceed 100 characters')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .trim()
      .optional(),
  }).refine(
    (data) => data.name !== undefined || data.email !== undefined,
    { message: 'At least one field (name or email) must be provided' }
  ),
});

export const get_user_schema = z.object({
  params: z.object({
    user_id: z.string().min(1, 'User ID is required'),
  }),
});

export const delete_user_schema = z.object({
  params: z.object({
    user_id: z.string().min(1, 'User ID is required'),
  }),
});

export const list_users_schema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('10').transform(Number),
  }),
});

export type create_user_body = z.infer<typeof create_user_schema>['body'];
export type update_user_body = z.infer<typeof update_user_schema>['body'];
export type list_users_query = z.infer<typeof list_users_schema>['query'];
