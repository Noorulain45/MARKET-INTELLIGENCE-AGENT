/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Generate and manage market intelligence reports
 *
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         type:
 *           type: string
 *         content:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, generating, completed, failed]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: List all reports for the current user
 *     tags: [Reports]
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
 *     responses:
 *       200:
 *         description: Paginated list of reports
 */

/**
 * @swagger
 * /reports/generate:
 *   post:
 *     summary: Generate a new market intelligence report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [competitor, market, sentiment, trends, full]
 *                 example: full
 *               title:
 *                 type: string
 *                 example: Weekly Market Intelligence Report
 *               competitors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Competitor IDs to include
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     format: date
 *                   to:
 *                     type: string
 *                     format: date
 *     responses:
 *       201:
 *         description: Report generation started
 */

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get a report by ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Report not found
 *   delete:
 *     summary: Delete a report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getReports, getReportById, generateReport, deleteReport } from '../controllers/reports.controller';

const router = Router();
router.use(authenticate);

router.get('/', getReports);
router.post('/generate', generateReport);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

export default router;
