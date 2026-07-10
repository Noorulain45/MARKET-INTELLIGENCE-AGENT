/**
 * @swagger
 * tags:
 *   name: Watchlists
 *   description: Named groups of competitors and keywords to monitor together
 *
 * components:
 *   schemas:
 *     Watchlist:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         competitors:
 *           type: array
 *           items:
 *             type: string
 *         keywords:
 *           type: array
 *           items:
 *             type: string
 *         industries:
 *           type: array
 *           items:
 *             type: string
 *         isShared:
 *           type: boolean
 *         alertConfig:
 *           type: object
 *           properties:
 *             enabled:
 *               type: boolean
 *             frequency:
 *               type: string
 *               enum: [realtime, daily, weekly]
 */

/**
 * @swagger
 * /watchlists:
 *   get:
 *     summary: List all watchlists for the current user
 *     tags: [Watchlists]
 *     responses:
 *       200:
 *         description: List of watchlists
 *   post:
 *     summary: Create a new watchlist
 *     tags: [Watchlists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: AI Startups
 *               description:
 *                 type: string
 *               competitors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of competitor IDs
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [generative AI, LLM, foundation models]
 *               industries:
 *                 type: array
 *                 items:
 *                   type: string
 *               isShared:
 *                 type: boolean
 *                 default: false
 *               alertConfig:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     default: true
 *                   frequency:
 *                     type: string
 *                     enum: [realtime, daily, weekly]
 *                     default: daily
 *     responses:
 *       201:
 *         description: Watchlist created
 */

/**
 * @swagger
 * /watchlists/{id}:
 *   put:
 *     summary: Update a watchlist
 *     tags: [Watchlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Watchlist'
 *     responses:
 *       200:
 *         description: Watchlist updated
 *   delete:
 *     summary: Delete a watchlist
 *     tags: [Watchlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Watchlist deleted
 */

/**
 * @swagger
 * /watchlists/{id}/competitors:
 *   post:
 *     summary: Add a competitor to a watchlist
 *     tags: [Watchlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [competitorId]
 *             properties:
 *               competitorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Competitor added to watchlist
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getWatchlists, createWatchlist, updateWatchlist,
  deleteWatchlist, addCompetitorToWatchlist,
} from '../controllers/watchlist.controller';

const router = Router();
router.use(authenticate);

router.get('/', getWatchlists);
router.post('/', createWatchlist);
router.put('/:id', updateWatchlist);
router.delete('/:id', deleteWatchlist);
router.post('/:id/competitors', addCompetitorToWatchlist);

export default router;
