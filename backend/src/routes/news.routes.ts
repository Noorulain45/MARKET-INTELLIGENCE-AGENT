/**
 * @swagger
 * tags:
 *   name: News
 *   description: News articles collection and retrieval
 *
 * components:
 *   schemas:
 *     NewsArticle:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         summary:
 *           type: string
 *         url:
 *           type: string
 *         source:
 *           type: string
 *         category:
 *           type: string
 *           enum: [AI, Technology, Business, Finance, Product Launches, Startups, Funding, Acquisitions, Marketing, Cybersecurity, Other]
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         importance:
 *           type: string
 *           enum: [high, medium, low]
 *         sentiment:
 *           type: object
 *           properties:
 *             score:
 *               type: number
 *             label:
 *               type: string
 *               enum: [positive, negative, neutral]
 */

/**
 * @swagger
 * /news:
 *   get:
 *     summary: List news articles with optional filters
 *     tags: [News]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [AI, Technology, Business, Finance, Product Launches, Startups, Funding, Acquisitions, Marketing, Cybersecurity, Other]
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *       - in: query
 *         name: importance
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of news articles
 */

/**
 * @swagger
 * /news/summary:
 *   get:
 *     summary: Get AI-generated summary of recent news
 *     tags: [News]
 *     responses:
 *       200:
 *         description: News summary with key headlines
 */

/**
 * @swagger
 * /news/categories:
 *   get:
 *     summary: Get available news categories with article counts
 *     tags: [News]
 *     responses:
 *       200:
 *         description: List of categories
 */

/**
 * @swagger
 * /news/collect:
 *   post:
 *     summary: Manually trigger news collection (admin only)
 *     tags: [News]
 *     responses:
 *       200:
 *         description: Collection triggered
 *       403:
 *         description: Admin role required
 */

/**
 * @swagger
 * /news/{id}:
 *   get:
 *     summary: Get a single news article by ID
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News article details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewsArticle'
 *       404:
 *         description: Article not found
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getNews, getNewsById, getNewsSummary, triggerNewsCollection, getNewsCategories } from '../controllers/news.controller';

const router = Router();
router.use(authenticate);

router.get('/', getNews);
router.get('/summary', getNewsSummary);
router.get('/categories', getNewsCategories);
router.post('/collect', authorize('admin'), triggerNewsCollection);
router.get('/:id', getNewsById);

export default router;
