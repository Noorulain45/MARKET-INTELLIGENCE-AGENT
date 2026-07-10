/**
 * @swagger
 * tags:
 *   - name: Alerts
 *     description: Custom alert rules and notification management
 *
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [competitor_activity, funding, price_change, trend_spike, negative_sentiment, news, product_launch, custom]
 *         conditions:
 *           type: object
 *           properties:
 *             keywords:
 *               type: array
 *               items:
 *                 type: string
 *             sentimentThreshold:
 *               type: number
 *             trendThreshold:
 *               type: number
 *         channels:
 *           type: object
 *           properties:
 *             email:
 *               type: boolean
 *             inApp:
 *               type: boolean
 *             slack:
 *               type: boolean
 *         frequency:
 *           type: string
 *           enum: [realtime, hourly, daily, weekly]
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: List all alerts for the current user
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: List of alert rules
 *   post:
 *     summary: Create a new alert rule
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *                 example: OpenAI Funding Alert
 *               type:
 *                 type: string
 *                 enum: [competitor_activity, funding, price_change, trend_spike, negative_sentiment, news, product_launch, custom]
 *               description:
 *                 type: string
 *               conditions:
 *                 type: object
 *                 properties:
 *                   competitors:
 *                     type: array
 *                     items:
 *                       type: string
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *                   sentimentThreshold:
 *                     type: number
 *                   trendThreshold:
 *                     type: number
 *               channels:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                     default: true
 *                   inApp:
 *                     type: boolean
 *                     default: true
 *                   slack:
 *                     type: boolean
 *                     default: false
 *               frequency:
 *                 type: string
 *                 enum: [realtime, hourly, daily, weekly]
 *                 default: daily
 *     responses:
 *       201:
 *         description: Alert created
 */

/**
 * @swagger
 * /alerts/{id}:
 *   put:
 *     summary: Update an alert rule
 *     tags: [Alerts]
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
 *             $ref: '#/components/schemas/Alert'
 *     responses:
 *       200:
 *         description: Alert updated
 *   delete:
 *     summary: Delete an alert rule
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert deleted
 */

/**
 * @swagger
 * /alerts/notifications:
 *   get:
 *     summary: Get in-app notifications for the current user
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: List of notifications
 */

/**
 * @swagger
 * /alerts/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAlerts, createAlert, updateAlert, deleteAlert,
  getNotifications, markNotificationRead,
} from '../controllers/alerts.controller';

const router = Router();
router.use(authenticate);

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
