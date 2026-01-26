import { Router } from 'express';
import { auth_middleware } from '@/middlewares/auth_middleware';
import { create_user } from '@/controllers/user/create_user';
import { get_all_users } from '@/controllers/user/get_all_users';
import { get_user_by_id } from '@/controllers/user/get_user_by_id';
import { update_user } from '@/controllers/user/update_user';
import { delete_user } from '@/controllers/user/delete_user';

const router = Router();

// All routes require authentication
router.use(auth_middleware);

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
router.post('/', create_user);

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
router.get('/', get_all_users);

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
router.get('/:user_id', get_user_by_id);

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
router.put('/:user_id', update_user);

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
router.delete('/:user_id', delete_user);

export default router;
