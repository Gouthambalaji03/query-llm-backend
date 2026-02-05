import { Router } from 'express';
import { authenticate_token } from '@/middlewares/auth_middleware';
import { create_conversation } from '@/controllers/conversation/create_conversation';
import { update_conversation } from '@/controllers/conversation/update_conversation';
import { get_conversation_by_id } from '@/controllers/conversation/get_conversation_by_id';
import { get_all_conversations } from '@/controllers/conversation/get_all_conversations';
import { delete_conversation } from '@/controllers/conversation/delete_conversation';
import { append_user_context_messages } from '@/controllers/conversation/append_user_context_messages';
import { append_agent_context_messages } from '@/controllers/conversation/append_agent_context_messages';

const router = Router();

// All conversation routes require authentication
router.use(authenticate_token);

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversation_id
 *               - title
 *               - model
 *             properties:
 *               conversation_id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', create_conversation);

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Get all conversations for the authenticated user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived, all]
 *           default: all
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized
 */
router.get('/', get_all_conversations);

/**
 * @swagger
 * /api/conversations/{conversation_id}:
 *   get:
 *     summary: Get a conversation by ID
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation details with messages
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:conversation_id', get_conversation_by_id);

/**
 * @swagger
 * /api/conversations/{conversation_id}:
 *   patch:
 *     summary: Update a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               model:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, archived]
 *               message:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   role:
 *                     type: string
 *                     enum: [user, assistant]
 *                   content:
 *                     type: string
 *                   parts:
 *                     type: array
 *     responses:
 *       200:
 *         description: Conversation updated successfully
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:conversation_id', update_conversation);

/**
 * @swagger
 * /api/conversations/{conversation_id}/user-context/append:
 *   post:
 *     summary: Append user UI messages to user context
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *     responses:
 *       200:
 *         description: Messages appended successfully
 *       404:
 *         description: Conversation not found
 */
router.post('/:conversation_id/user-context/append', append_user_context_messages);

/**
 * @swagger
 * /api/conversations/{conversation_id}/agent-context/append:
 *   post:
 *     summary: Append agent model messages to agent context
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *     responses:
 *       200:
 *         description: Messages appended successfully
 *       404:
 *         description: Conversation not found
 */
router.post('/:conversation_id/agent-context/append', append_agent_context_messages);

/**
 * @swagger
 * /api/conversations/{conversation_id}:
 *   delete:
 *     summary: Delete a conversation (soft delete)
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:conversation_id', delete_conversation);

export default router;
