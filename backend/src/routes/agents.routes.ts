/**
 * @swagger
 * tags:
 *   name: Agents
 *   description: AI agent orchestration for market intelligence
 */

/**
 * @swagger
 * /agents/run:
 *   post:
 *     summary: Run the manager agent (orchestrates all specialist agents)
 *     tags: [Agents]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [full, news, competitor, trend, sentiment, recommendation]
 *                 default: full
 *                 description: "full runs all agents in parallel and produces an executive briefing"
 *               query:
 *                 type: string
 *                 example: What are the biggest AI trends this week?
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Agent results with insights from each specialist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 news:
 *                   type: string
 *                 competitor:
 *                   type: string
 *                 trend:
 *                   type: string
 *                 sentiment:
 *                   type: string
 *                 recommendation:
 *                   type: string
 *                 finalInsight:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

/**
 * @swagger
 * /agents/daily-summary:
 *   get:
 *     summary: Get daily market intelligence briefing (cached for 1 hour)
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: Daily executive briefing from all agents
 */

/**
 * @swagger
 * /agents/{agentType}/run:
 *   post:
 *     summary: Run a single specialist agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: agentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [news, competitor, trend, sentiment, recommendation]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: Analyze current AI funding landscape
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Agent analysis result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                 agentType:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Unknown agent type
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { runManagerAgent, getDailySummary, runSpecificAgent } from '../controllers/agents.controller';

const router = Router();
router.use(authenticate);

router.post('/run', runManagerAgent);
router.get('/daily-summary', getDailySummary);
router.post('/:agentType/run', runSpecificAgent);

export default router;
