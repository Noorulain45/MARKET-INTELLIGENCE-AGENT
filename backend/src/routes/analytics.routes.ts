/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Dashboard statistics and market overview data
 */

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get dashboard statistics (news count, competitor count, trends, sentiment scores)
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalNews:
 *                   type: number
 *                 totalCompetitors:
 *                   type: number
 *                 totalTrends:
 *                   type: number
 *                 averageSentiment:
 *                   type: number
 *                 recentAlerts:
 *                   type: number
 */

/**
 * @swagger
 * /analytics/timeline:
 *   get:
 *     summary: Get activity timeline for charts
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of past days to include
 *     responses:
 *       200:
 *         description: Daily activity counts over time
 */

/**
 * @swagger
 * /analytics/market-overview:
 *   get:
 *     summary: Get high-level market overview for the intelligence summary panel
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Market overview including top trends, sentiment breakdown, and top news sources
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getDashboardStats, getActivityTimeline, getMarketOverview } from '../controllers/analytics.controller';

const router = Router();
router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/timeline', getActivityTimeline);
router.get('/market-overview', getMarketOverview);

export default router;
