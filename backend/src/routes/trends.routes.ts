/**
 * @swagger
 * tags:
 *   name: Trends
 *   description: Market trend tracking and emerging technology signals
 *
 * components:
 *   schemas:
 *     Trend:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         keyword:
 *           type: string
 *         category:
 *           type: string
 *         source:
 *           type: string
 *         currentValue:
 *           type: number
 *         changePercent:
 *           type: number
 *         direction:
 *           type: string
 *           enum: [rising, falling, stable]
 *         isEmergingTech:
 *           type: boolean
 */

/**
 * @swagger
 * /trends:
 *   get:
 *     summary: List market trends with optional filters
 *     tags: [Trends]
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
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [rising, falling, stable]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: isEmergingTech
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Paginated list of trends
 */

/**
 * @swagger
 * /trends/summary:
 *   get:
 *     summary: Get a summary of top rising and emerging trends
 *     tags: [Trends]
 *     responses:
 *       200:
 *         description: Trends summary
 */

/**
 * @swagger
 * /trends/collect:
 *   post:
 *     summary: Manually trigger trend collection (admin only)
 *     tags: [Trends]
 *     responses:
 *       200:
 *         description: Trend collection triggered
 *       403:
 *         description: Admin role required
 */

/**
 * @swagger
 * /trends/{id}:
 *   get:
 *     summary: Get a single trend by ID
 *     tags: [Trends]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trend details with historical data points
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trend'
 *       404:
 *         description: Trend not found
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getTrends, getTrendsSummary, getTrendById, triggerTrendCollection } from '../controllers/trends.controller';

const router = Router();
router.use(authenticate);

router.get('/', getTrends);
router.get('/summary', getTrendsSummary);
router.post('/collect', authorize('admin'), triggerTrendCollection);
router.get('/:id', getTrendById);

export default router;
