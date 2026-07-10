/**
 * @swagger
 * tags:
 *   name: Sentiment
 *   description: Customer sentiment analysis from social sources
 *
 * components:
 *   schemas:
 *     Sentiment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         keyword:
 *           type: string
 *         source:
 *           type: string
 *         overallScore:
 *           type: number
 *           description: Score between -1 (negative) and 1 (positive)
 *         label:
 *           type: string
 *           enum: [positive, negative, neutral]
 *         topics:
 *           type: object
 *           properties:
 *             positive:
 *               type: array
 *               items:
 *                 type: string
 *             negative:
 *               type: array
 *               items:
 *                 type: string
 *         complaints:
 *           type: array
 *           items:
 *             type: string
 *         featureRequests:
 *           type: array
 *           items:
 *             type: string
 *         analyzedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /sentiment/analyze:
 *   post:
 *     summary: Analyze sentiment of a given text using AI
 *     tags: [Sentiment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text to analyze
 *                 example: "What is OpenAI doing this week?"
 *               keyword:
 *                 type: string
 *                 description: Optional label/keyword for this analysis
 *               source:
 *                 type: string
 *                 enum: [reddit, product_hunt, github, reviews, forums, app_store]
 *                 default: forums
 *               competitorId:
 *                 type: string
 *                 description: Optional competitor to associate this analysis with
 *     responses:
 *       201:
 *         description: Sentiment analysis result saved and returned
 *       400:
 *         description: text field is required
 */

/**
 * @swagger
 * /sentiment:
 *   get:
 *     summary: List sentiment records with optional filters
 *     tags: [Sentiment]
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
 *         name: label
 *         schema:
 *           type: string
 *           enum: [positive, negative, neutral]
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of sentiment records
 */

/**
 * @swagger
 * /sentiment/overview:
 *   get:
 *     summary: Get aggregated sentiment overview across all sources
 *     tags: [Sentiment]
 *     responses:
 *       200:
 *         description: Sentiment overview with averages and breakdown
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getSentiments, getSentimentOverview, analyzeTextSentiment } from '../controllers/sentiment.controller';

const router = Router();
router.use(authenticate);

router.post('/analyze', analyzeTextSentiment);
router.get('/', getSentiments);
router.get('/overview', getSentimentOverview);

export default router;
