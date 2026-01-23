import { Router } from 'express';
import * as user_controller from '../controllers/user_controller';
import { auth_middleware } from '../middlewares/auth_middleware';
import { validate } from '../middlewares/validate_middleware';
import {
  create_user_schema,
  get_user_schema,
  update_user_schema,
  delete_user_schema,
  list_users_schema,
} from '../schemas/user_schema';

const router = Router();

// All routes require authentication
router.use(auth_middleware);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the profile of the currently authenticated user based on Firebase UID
 *     tags: [Users]
 *     security:
 *       - bearer_auth: []
 *     responses:
 *       200:
 *         description: User profile found or null if not registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/user'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 */
router.get('/me', user_controller.get_current_user);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user profile linked to the authenticated Firebase account
 *     tags: [Users]
 *     security:
 *       - bearer_auth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/create_user_input'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/user'
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 *       409:
 *         description: Conflict - User already exists or email is taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 */
router.post('/', validate(create_user_schema), user_controller.create_user);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     description: Returns a paginated list of all users
 *     tags: [Users]
 *     security:
 *       - bearer_auth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/paginated_users_response'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 */
router.get('/', validate(list_users_schema), user_controller.list_users);

/**
 * @swagger
 * /api/users/{user_id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns a single user by their ID
 *     tags: [Users]
 *     security:
 *       - bearer_auth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/user'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 */
router.get('/:user_id', validate(get_user_schema), user_controller.get_user);

/**
 * @swagger
 * /api/users/{user_id}:
 *   put:
 *     summary: Update user
 *     description: Updates an existing user's information
 *     tags: [Users]
 *     security:
 *       - bearer_auth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/update_user_input'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/user'
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 *       409:
 *         description: Conflict - Email is already taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 */
router.put('/:user_id', validate(update_user_schema), user_controller.update_user);

/**
 * @swagger
 * /api/users/{user_id}:
 *   delete:
 *     summary: Delete user
 *     description: Deletes a user by their ID
 *     tags: [Users]
 *     security:
 *       - bearer_auth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/api_error_response'
 */
router.delete('/:user_id', validate(delete_user_schema), user_controller.delete_user);

export default router;
