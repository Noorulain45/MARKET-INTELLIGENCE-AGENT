/**
 * @swagger
 * tags:
 *   name: Competitors
 *   description: Competitor tracking and analysis
 *
 * components:
 *   schemas:
 *     Competitor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         website:
 *           type: string
 *         industry:
 *           type: string
 *         description:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         metrics:
 *           type: object
 *           properties:
 *             employees:
 *               type: number
 *             funding:
 *               type: number
 *             founded:
 *               type: number
 *             headquarters:
 *               type: string
 *             techStack:
 *               type: array
 *               items:
 *                 type: string
 *             socialMedia:
 *               type: object
 *               properties:
 *                 twitter:
 *                   type: string
 *                 linkedin:
 *                   type: string
 *                 github:
 *                   type: string
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /competitors:
 *   get:
 *     summary: List all tracked competitors
 *     tags: [Competitors]
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
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of competitors
 *   post:
 *     summary: Add a new competitor to track
 *     tags: [Competitors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, website, industry]
 *             properties:
 *               name:
 *                 type: string
 *                 example: OpenAI
 *               website:
 *                 type: string
 *                 example: https://openai.com
 *               industry:
 *                 type: string
 *                 example: Artificial Intelligence
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               metrics:
 *                 type: object
 *                 properties:
 *                   employees:
 *                     type: number
 *                   funding:
 *                     type: number
 *                   founded:
 *                     type: number
 *                   headquarters:
 *                     type: string
 *                   techStack:
 *                     type: array
 *                     items:
 *                       type: string
 *                   socialMedia:
 *                     type: object
 *                     properties:
 *                       twitter:
 *                         type: string
 *                       linkedin:
 *                         type: string
 *                       github:
 *                         type: string
 *     responses:
 *       201:
 *         description: Competitor added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Competitor'
 */

/**
 * @swagger
 * /competitors/compare:
 *   get:
 *     summary: Compare multiple competitors side by side
 *     tags: [Competitors]
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated competitor IDs (min 2)
 *         example: id1,id2,id3
 *     responses:
 *       200:
 *         description: Comparison data for each competitor
 *       400:
 *         description: At least 2 IDs required
 */

/**
 * @swagger
 * /competitors/{id}:
 *   get:
 *     summary: Get a competitor by ID
 *     tags: [Competitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Competitor details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Competitor'
 *       404:
 *         description: Competitor not found
 *   put:
 *     summary: Update a competitor
 *     tags: [Competitors]
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
 *             $ref: '#/components/schemas/Competitor'
 *     responses:
 *       200:
 *         description: Competitor updated
 *       404:
 *         description: Competitor not found
 *   delete:
 *     summary: Remove a competitor (admin/analyst only)
 *     tags: [Competitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Competitor removed
 *       404:
 *         description: Competitor not found
 */

/**
 * @swagger
 * /competitors/{id}/activity:
 *   get:
 *     summary: Get recent market events for a competitor
 *     tags: [Competitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of market events
 */

/**
 * @swagger
 * /competitors/{id}/swot:
 *   get:
 *     summary: Generate AI-powered SWOT analysis for a competitor
 *     tags: [Competitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SWOT analysis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 strengths:
 *                   type: array
 *                   items:
 *                     type: string
 *                 weaknesses:
 *                   type: array
 *                   items:
 *                     type: string
 *                 opportunities:
 *                   type: array
 *                   items:
 *                     type: string
 *                 threats:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Competitor not found
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getCompetitors, getCompetitorById, createCompetitor, updateCompetitor,
  deleteCompetitor, getCompetitorActivity, getSWOTAnalysis, compareCompetitors,
} from '../controllers/competitor.controller';

const router = Router();
router.use(authenticate);

router.get('/', getCompetitors);
router.get('/compare', compareCompetitors);
router.post('/', createCompetitor);
router.get('/:id', getCompetitorById);
router.put('/:id', updateCompetitor);
router.delete('/:id', authorize('admin', 'analyst'), deleteCompetitor);
router.get('/:id/activity', getCompetitorActivity);
router.get('/:id/swot', getSWOTAnalysis);

export default router;
