/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: AI chat sessions powered by RAG (Retrieval-Augmented Generation)
 *
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, assistant]
 *         content:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         sources:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatMessage'
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: List all chat sessions for the current user
 *     tags: [Chat]
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
 *     responses:
 *       200:
 *         description: Paginated list of chat sessions
 *   post:
 *     summary: Create a new chat session
 *     tags: [Chat]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Market analysis Q3
 *     responses:
 *       201:
 *         description: Chat session created
 */

/**
 * @swagger
 * /chat/message:
 *   post:
 *     summary: Send a message and get an AI response (RAG-powered)
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: What is OpenAI's latest product announcement?
 *               chatId:
 *                 type: string
 *                 description: Existing chat ID to continue. Omit to start a new session.
 *     responses:
 *       200:
 *         description: AI response with source citations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chatId:
 *                   type: string
 *                 message:
 *                   $ref: '#/components/schemas/ChatMessage'
 *                 sources:
 *                   type: array
 *                   items:
 *                     type: object
 */

/**
 * @swagger
 * /chat/{id}:
 *   get:
 *     summary: Get a chat session with full message history
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat session with messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Chat not found
 *   delete:
 *     summary: Delete a chat session
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat deleted
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getChats, getChatById, createChat, sendMessage, deleteChat } from '../controllers/chat.controller';

const router = Router();
router.use(authenticate);

router.get('/', getChats);
router.post('/', createChat);
router.post('/message', sendMessage);
router.get('/:id', getChatById);
router.delete('/:id', deleteChat);

export default router;
